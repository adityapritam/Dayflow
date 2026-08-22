import prisma from '../config/db.js';

// Get my payroll (Employee view)
export const getMyPayroll = async (req, res) => {
  try {
    const employeeId = req.user.profile?.id;
    if (!employeeId) {
      return res.status(400).json({ error: 'No employee profile associated with user account.' });
    }

    const profile = req.user.profile;
    const payrolls = await prisma.payrollRecord.findMany({
      where: { employeeId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    const salaryStructure = {
      baseSalary: profile.baseSalary,
      allowances: profile.allowances,
      deductions: profile.deductions,
      netSalary: profile.netSalary,
      monthlyBase: profile.baseSalary / 12,
      monthlyAllowances: profile.allowances / 12,
      monthlyDeductions: profile.deductions / 12,
      monthlyNet: profile.netSalary / 12,
    };

    res.status(200).json({
      salaryStructure,
      payrolls,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payroll information.' });
  }
};

// Get all payroll records (Admin view)
export const getAllPayrolls = async (req, res) => {
  try {
    const { month, year, status } = req.query;

    let whereClause = {};
    if (month) whereClause.month = parseInt(month);
    if (year) whereClause.year = parseInt(year);
    if (status && status !== 'ALL') whereClause.status = status;

    const payrolls = await prisma.payrollRecord.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            jobTitle: true,
            department: true,
            avatarUrl: true,
            baseSalary: true,
            allowances: true,
            deductions: true,
            netSalary: true,
            user: { select: { employeeId: true } },
          },
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    // Summary calculation
    const totalPayrollBudget = payrolls.reduce((sum, p) => sum + p.netSalary, 0);

    res.status(200).json({
      payrolls,
      totalPayrollBudget,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payroll overview.' });
  }
};

// Admin: Update Employee Salary Structure
export const updateSalaryStructure = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { baseSalary, allowances, deductions } = req.body;

    const bs = parseFloat(baseSalary);
    const al = parseFloat(allowances || 0);
    const de = parseFloat(deductions || 0);

    if (isNaN(bs)) {
      return res.status(400).json({ error: 'Valid base salary is required.' });
    }

    const netSalary = bs + al - de;

    const updatedProfile = await prisma.employeeProfile.update({
      where: { id: employeeId },
      data: {
        baseSalary: bs,
        allowances: al,
        deductions: de,
        netSalary,
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'SALARY_UPDATED',
        details: `Updated salary structure for ${updatedProfile.firstName} ${updatedProfile.lastName}. New net salary: $${netSalary}`,
      },
    });

    res.status(200).json({
      message: 'Salary structure successfully updated.',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Update salary error:', error);
    res.status(500).json({ error: 'Failed to update salary structure.' });
  }
};

// Admin: Update Payroll Record Status (PAID / PENDING)
export const updatePayrollStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentDate } = req.body;

    const record = await prisma.payrollRecord.update({
      where: { id },
      data: {
        status,
        paymentDate: paymentDate || new Date().toISOString().split('T')[0],
      },
    });

    res.status(200).json({ message: 'Payroll record status updated.', record });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update payroll record.' });
  }
};
