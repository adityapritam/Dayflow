import prisma from '../config/db.js';

// Get all employees (Admin view)
export const getAllEmployees = async (req, res) => {
  try {
    const { search, department, status } = req.query;

    let whereClause = {};

    if (search) {
      whereClause.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { department: { contains: search } },
        { jobTitle: { contains: search } },
        { user: { email: { contains: search } } },
        { user: { employeeId: { contains: search } } },
      ];
    }

    if (department && department !== 'ALL') {
      whereClause.department = department;
    }

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const employees = await prisma.employeeProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            employeeId: true,
            email: true,
            role: true,
            emailVerified: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            attendances: true,
            leaveRequests: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ employees });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employee list.' });
  }
};

// Get single employee by ID
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employeeProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            employeeId: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        documents: true,
        payrolls: { orderBy: { year: 'desc' }, take: 12 },
        leaveRequests: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    // Permission check: regular employee can only view their own profile, unless Admin
    if (req.user.role !== 'ADMIN' && req.user.profile?.id !== id) {
      return res.status(403).json({ error: 'Access denied. You can only view your own profile.' });
    }

    res.status(200).json({ employee });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve employee profile.' });
  }
};

// Update profile (Employee restricted / Admin unrestricted)
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const isSelf = req.user.profile?.id === id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ error: 'Access denied. You can only update your own profile.' });
    }

    const existingProfile = await prisma.employeeProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingProfile) {
      return res.status(404).json({ error: 'Employee profile not found.' });
    }

    let updateData = {};

    if (isAdmin) {
      // Admin can update ALL fields
      const {
        firstName,
        lastName,
        phone,
        address,
        jobTitle,
        department,
        status,
        baseSalary,
        allowances,
        deductions,
        avatarUrl,
        role,
      } = req.body;

      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;
      if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
      if (department !== undefined) updateData.department = department;
      if (status !== undefined) updateData.status = status;
      if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

      if (baseSalary !== undefined || allowances !== undefined || deductions !== undefined) {
        const bs = parseFloat(baseSalary ?? existingProfile.baseSalary);
        const al = parseFloat(allowances ?? existingProfile.allowances);
        const de = parseFloat(deductions ?? existingProfile.deductions);
        updateData.baseSalary = bs;
        updateData.allowances = al;
        updateData.deductions = de;
        updateData.netSalary = bs + al - de;
      }

      // Update user role if specified
      if (role && (role === 'ADMIN' || role === 'EMPLOYEE')) {
        await prisma.user.update({
          where: { id: existingProfile.userId },
          data: { role },
        });
      }
    } else {
      // Regular employee can ONLY update address, phone, avatarUrl
      const { phone, address, avatarUrl } = req.body;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;
      if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    }

    const updatedProfile = await prisma.employeeProfile.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            employeeId: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Log action
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'PROFILE_UPDATED',
        details: `Updated employee profile for ${updatedProfile.firstName} ${updatedProfile.lastName}`,
      },
    });

    res.status(200).json({
      message: 'Employee profile updated successfully.',
      employee: updatedProfile,
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Failed to update employee profile.' });
  }
};
