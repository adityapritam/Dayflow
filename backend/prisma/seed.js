import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Dayflow HRMS Database...');

  // Clean existing tables
  await prisma.activityLog.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.payrollRecord.deleteMany({});
  await prisma.leaveRequest.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.employeeProfile.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 1. HR Admin Account
  const adminUser = await prisma.user.create({
    data: {
      employeeId: 'EMP-001',
      email: 'admin@dayflow.com',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: true,
      profile: {
        create: {
          firstName: 'Sarah',
          lastName: 'Jenkins',
          phone: '+1 (555) 234-5678',
          address: '742 Evergreen Terrace, San Francisco, CA 94107',
          jobTitle: 'HR Director',
          department: 'Human Resources',
          joinDate: '2022-01-15',
          avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
          baseSalary: 120000,
          allowances: 8000,
          deductions: 6000,
          netSalary: 122000,
          status: 'ACTIVE',
        },
      },
    },
    include: { profile: true },
  });

  // 2. Employee Accounts
  const employeesData = [
    {
      employeeId: 'EMP-002',
      email: 'alex@dayflow.com',
      firstName: 'Alex',
      lastName: 'Rivera',
      phone: '+1 (555) 345-6789',
      address: '128 Market St, Apt 4B, San Francisco, CA',
      jobTitle: 'Senior Frontend Engineer',
      department: 'Engineering',
      joinDate: '2023-03-01',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      baseSalary: 95000,
      allowances: 5000,
      deductions: 4000,
      netSalary: 96000,
    },
    {
      employeeId: 'EMP-003',
      email: 'maria@dayflow.com',
      firstName: 'Maria',
      lastName: 'Santos',
      phone: '+1 (555) 456-7890',
      address: '450 Mission St, San Francisco, CA',
      jobTitle: 'Lead Product Designer',
      department: 'Design',
      joinDate: '2023-06-15',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
      baseSalary: 88000,
      allowances: 4000,
      deductions: 3500,
      netSalary: 88500,
      status: 'INACTIVE',
    },
    {
      employeeId: 'EMP-004',
      email: 'david@dayflow.com',
      firstName: 'David',
      lastName: 'Kim',
      phone: '+1 (555) 567-8901',
      address: '890 Howard St, San Francisco, CA',
      jobTitle: 'Backend Tech Lead',
      department: 'Engineering',
      joinDate: '2022-09-10',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      baseSalary: 105000,
      allowances: 6000,
      deductions: 5000,
      netSalary: 106000,
    },
    {
      employeeId: 'EMP-005',
      email: 'priya@dayflow.com',
      firstName: 'Priya',
      lastName: 'Sharma',
      phone: '+1 (555) 678-9012',
      address: '320 Pine St, San Francisco, CA',
      jobTitle: 'Talent Acquisition Manager',
      department: 'Human Resources',
      joinDate: '2024-01-08',
      avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&auto=format&fit=crop&q=80',
      baseSalary: 75000,
      allowances: 3000,
      deductions: 3000,
      netSalary: 75000,
      status: 'INACTIVE',
    },
  ];

  const createdEmployees = [];
  for (const emp of employeesData) {
    const user = await prisma.user.create({
      data: {
        employeeId: emp.employeeId,
        email: emp.email,
        password: hashedPassword,
        role: 'EMPLOYEE',
        emailVerified: true,
        profile: {
          create: {
            firstName: emp.firstName,
            lastName: emp.lastName,
            phone: emp.phone,
            address: emp.address,
            jobTitle: emp.jobTitle,
            department: emp.department,
            joinDate: emp.joinDate,
            avatarUrl: emp.avatarUrl,
            baseSalary: emp.baseSalary,
            allowances: emp.allowances,
            deductions: emp.deductions,
            netSalary: emp.netSalary,
            status: emp.status || 'ACTIVE',
          },
        },
      },
      include: { profile: true },
    });
    createdEmployees.push(user);
  }

  const allProfiles = [adminUser.profile, ...createdEmployees.map(e => e.profile)];

  // 3. Seed Attendance Records for past 7 days
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const dateObj = new Date(today);
    dateObj.setDate(today.getDate() - i);
    const dateStr = dateObj.toISOString().split('T')[0];

    for (const profile of allProfiles) {
      // Weekend check
      const dayOfWeek = dateObj.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      let status = 'PRESENT';
      let checkIn = '09:00:00';
      let checkOut = '17:30:00';
      let totalHours = 8.5;

      if (i === 2 && profile.firstName === 'Maria') {
        status = 'HALF_DAY';
        checkOut = '13:00:00';
        totalHours = 4.0;
      } else if (i === 4 && profile.firstName === 'David') {
        status = 'LEAVE';
        checkIn = null;
        checkOut = null;
        totalHours = 0;
      }

      await prisma.attendance.create({
        data: {
          employeeId: profile.id,
          date: dateStr,
          checkIn,
          checkOut,
          totalHours,
          status,
          notes: status === 'PRESENT' ? 'Normal workday' : status === 'HALF_DAY' ? 'Doctor appointment afternoon' : 'Approved sick leave',
        },
      });
    }
  }

  // 4. Seed Leave Requests
  await prisma.leaveRequest.create({
    data: {
      employeeId: createdEmployees[0].profile.id, // Alex Rivera
      leaveType: 'PAID',
      startDate: '2026-09-01',
      endDate: '2026-09-05',
      totalDays: 5,
      reason: 'Annual family vacation to Maui.',
      status: 'PENDING',
    },
  });

  await prisma.leaveRequest.create({
    data: {
      employeeId: createdEmployees[1].profile.id, // Maria Santos
      leaveType: 'SICK',
      startDate: '2026-08-10',
      endDate: '2026-08-11',
      totalDays: 2,
      reason: 'Flu symptoms and medical rest.',
      status: 'APPROVED',
      adminComment: 'Rest well! Approved by HR.',
      reviewedBy: adminUser.profile.firstName + ' ' + adminUser.profile.lastName,
    },
  });

  await prisma.leaveRequest.create({
    data: {
      employeeId: createdEmployees[2].profile.id, // David Kim
      leaveType: 'UNPAID',
      startDate: '2026-07-15',
      endDate: '2026-07-16',
      totalDays: 2,
      reason: 'Personal home renovation emergency.',
      status: 'REJECTED',
      adminComment: 'High team deadline during these dates. Please reschedule.',
      reviewedBy: adminUser.profile.firstName + ' ' + adminUser.profile.lastName,
    },
  });

  // 5. Seed Payroll History
  for (const profile of allProfiles) {
    await prisma.payrollRecord.create({
      data: {
        employeeId: profile.id,
        month: 7,
        year: 2026,
        baseSalary: profile.baseSalary / 12,
        allowances: profile.allowances / 12,
        deductions: profile.deductions / 12,
        netSalary: profile.netSalary / 12,
        paymentDate: '2026-07-31',
        status: 'PAID',
        paystubUrl: '/uploads/paystubs/sample_paystub.pdf',
      },
    });

    await prisma.payrollRecord.create({
      data: {
        employeeId: profile.id,
        month: 8,
        year: 2026,
        baseSalary: profile.baseSalary / 12,
        allowances: profile.allowances / 12,
        deductions: profile.deductions / 12,
        netSalary: profile.netSalary / 12,
        paymentDate: '2026-08-31',
        status: 'PENDING',
        paystubUrl: '/uploads/paystubs/sample_paystub.pdf',
      },
    });
  }

  // 6. Seed Documents
  for (const profile of allProfiles) {
    await prisma.document.createMany({
      data: [
        {
          employeeId: profile.id,
          title: 'Employment Agreement Contract.pdf',
          category: 'CONTRACT',
          fileUrl: '/uploads/docs/employment_contract.pdf',
        },
        {
          employeeId: profile.id,
          title: 'W-4 Tax Exemption Form.pdf',
          category: 'TAX',
          fileUrl: '/uploads/docs/w4_form.pdf',
        },
      ],
    });
  }

  // 7. Activity Logs
  await prisma.activityLog.create({
    data: {
      userId: adminUser.id,
      action: 'SYSTEM_SEED',
      details: 'Populated initial organization demo data',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch(e => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
