import prisma from '../config/db.js';

// Apply for leave (Employee)
export const applyLeave = async (req, res) => {
  try {
    const employeeId = req.user.profile?.id;
    if (!employeeId) {
      return res.status(400).json({ error: 'No employee profile associated with user account.' });
    }

    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ error: 'Please provide leave type, start date, end date, and reason.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({ error: 'End date cannot be prior to start date.' });
    }

    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveType: leaveType.toUpperCase(),
        startDate,
        endDate,
        totalDays,
        reason,
        status: 'PENDING',
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'LEAVE_SUBMITTED',
        details: `Applied for ${totalDays} day(s) ${leaveType} leave from ${startDate} to ${endDate}`,
      },
    });

    res.status(201).json({
      message: 'Leave application submitted successfully! Pending HR review.',
      leaveRequest,
    });
  } catch (error) {
    console.error('Leave apply error:', error);
    res.status(500).json({ error: 'Failed to submit leave request.' });
  }
};

// Get my leave requests (Employee)
export const getMyLeaves = async (req, res) => {
  try {
    const employeeId = req.user.profile?.id;
    if (!employeeId) {
      return res.status(400).json({ error: 'No employee profile associated with user account.' });
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });

    // Compute balance stats
    const approvedPaidDays = leaveRequests
      .filter(l => l.status === 'APPROVED' && l.leaveType === 'PAID')
      .reduce((acc, l) => acc + l.totalDays, 0);

    const approvedSickDays = leaveRequests
      .filter(l => l.status === 'APPROVED' && l.leaveType === 'SICK')
      .reduce((acc, l) => acc + l.totalDays, 0);

    const stats = {
      paidLeaveRemaining: Math.max(0, 15 - approvedPaidDays),
      sickLeaveRemaining: Math.max(0, 10 - approvedSickDays),
      totalPending: leaveRequests.filter(l => l.status === 'PENDING').length,
    };

    res.status(200).json({ leaveRequests, stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leave history.' });
  }
};

// Get all leave requests (Admin view)
export const getAllLeaves = async (req, res) => {
  try {
    const { status, leaveType } = req.query;

    let whereClause = {};
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }
    if (leaveType && leaveType !== 'ALL') {
      whereClause.leaveType = leaveType;
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
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
            user: { select: { employeeId: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ leaveRequests });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leave requests.' });
  }
};

// Admin: Update leave status (Approve / Reject) with comment
export const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({ error: 'Invalid leave status.' });
    }

    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found.' });
    }

    // Prevent self-approval/rejection
    if (leave.employee.userId === req.user.id) {
      return res.status(403).json({ error: 'You cannot approve or reject your own leave requests. This action must be performed by another administrator.' });
    }

    const reviewerName = `${req.user.profile?.firstName || 'HR'} ${req.user.profile?.lastName || 'Admin'}`;

    const updatedLeave = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        adminComment: adminComment || null,
        reviewedBy: reviewerName,
      },
    });

    // If approved, update attendance status for date range
    if (status === 'APPROVED') {
      // Seed attendance entries as LEAVE for the date range
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const existingAtt = await prisma.attendance.findFirst({
          where: { employeeId: leave.employeeId, date: dateStr },
        });

        if (existingAtt) {
          await prisma.attendance.update({
            where: { id: existingAtt.id },
            data: { status: 'LEAVE', notes: `Approved ${leave.leaveType} leave` },
          });
        } else {
          await prisma.attendance.create({
            data: {
              employeeId: leave.employeeId,
              date: dateStr,
              status: 'LEAVE',
              notes: `Approved ${leave.leaveType} leave`,
            },
          });
        }
      }
    }

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: `LEAVE_${status}`,
        details: `${status} leave request for ${leave.employee.firstName} ${leave.employee.lastName}`,
      },
    });

    res.status(200).json({
      message: `Leave request has been ${status.toLowerCase()}.`,
      leaveRequest: updatedLeave,
    });
  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(500).json({ error: 'Failed to update leave status.' });
  }
};
