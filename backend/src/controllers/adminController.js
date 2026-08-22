import prisma from '../config/db.js';

export const getDashboardStats = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const totalEmployees = await prisma.employeeProfile.count({
      where: { status: 'ACTIVE' },
    });

    const todayAttendances = await prisma.attendance.findMany({
      where: { date: todayStr },
    });

    const presentCount = todayAttendances.filter(a => a.status === 'PRESENT' || a.status === 'HALF_DAY').length;
    const leaveCount = todayAttendances.filter(a => a.status === 'LEAVE').length;
    const absentCount = Math.max(0, totalEmployees - presentCount - leaveCount);

    const pendingLeavesCount = await prisma.leaveRequest.count({
      where: { status: 'PENDING' },
    });

    // Total monthly payroll estimate
    const profiles = await prisma.employeeProfile.findMany({
      where: { status: 'ACTIVE' },
    });
    const monthlyPayrollTotal = profiles.reduce((sum, p) => sum + (p.netSalary / 12), 0);

    // Recent activity log
    const recentActivity = await prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            employeeId: true,
            role: true,
            profile: { select: { firstName: true, lastName: true, avatarUrl: true } },
          },
        },
      },
    });

    res.status(200).json({
      stats: {
        totalEmployees,
        todayAttendance: {
          present: presentCount,
          absent: absentCount,
          onLeave: leaveCount,
          attendanceRate: totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 100,
        },
        pendingLeavesCount,
        monthlyPayrollTotal: Math.round(monthlyPayrollTotal),
      },
      recentActivity,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to compute admin dashboard statistics.' });
  }
};
