import prisma from '../config/db.js';

// Get today's attendance for logged in user
export const getTodayAttendance = async (req, res) => {
  try {
    const employeeId = req.user.profile?.id;
    if (!employeeId) {
      return res.status(400).json({ error: 'No employee profile associated with account.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const record = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: todayStr,
      },
    });

    res.status(200).json({ attendance: record || null, date: todayStr });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch today attendance.' });
  }
};

// Check-in action
export const checkIn = async (req, res) => {
  try {
    const employeeId = req.user.profile?.id;
    if (!employeeId) {
      return res.status(400).json({ error: 'No employee profile associated with user account.' });
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0]; // HH:mm:ss

    // Check if already checked in today
    let record = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: todayStr,
      },
    });

    const checkInHour = now.getHours();
    const checkInMinute = now.getMinutes();
    const isLate = checkInHour > 9 || (checkInHour === 9 && checkInMinute > 30);
    const checkInNotes = isLate ? 'Late check-in via dashboard (Late after 09:30 AM)' : 'Standard check-in via dashboard';

    if (record) {
      if (record.checkIn) {
        return res.status(400).json({ error: 'You have already checked in for today.', attendance: record });
      }

      record = await prisma.attendance.update({
        where: { id: record.id },
        data: {
          checkIn: timeStr,
          status: 'PRESENT',
          notes: checkInNotes,
        },
      });
    } else {
      record = await prisma.attendance.create({
        data: {
          employeeId,
          date: todayStr,
          checkIn: timeStr,
          status: 'PRESENT',
          notes: checkInNotes,
        },
      });
    }

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'ATTENDANCE_CHECKIN',
        details: `Checked in at ${timeStr} on ${todayStr}`,
      },
    });

    res.status(200).json({
      message: 'Check-in successful! Have a productive day.',
      attendance: record,
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Failed to perform check-in.' });
  }
};

// Check-out action
export const checkOut = async (req, res) => {
  try {
    const employeeId = req.user.profile?.id;
    if (!employeeId) {
      return res.status(400).json({ error: 'No employee profile associated with user account.' });
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0]; // HH:mm:ss

    const record = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: todayStr,
      },
    });

    if (!record || !record.checkIn) {
      return res.status(400).json({ error: 'You cannot check out before checking in first.' });
    }

    if (record.checkOut) {
      return res.status(400).json({ error: 'You have already checked out for today.', attendance: record });
    }

    // Calculate total hours
    const [inH, inM] = record.checkIn.split(':').map(Number);
    const [outH, outM] = timeStr.split(':').map(Number);
    let hours = (outH + outM / 60) - (inH + inM / 60);
    if (hours < 0) hours = 8; // fallback
    hours = Math.round(hours * 10) / 10;

    let status = record.status;
    if (hours < 5 && status !== 'LEAVE') {
      status = 'HALF_DAY';
    }

    const updatedRecord = await prisma.attendance.update({
      where: { id: record.id },
      data: {
        checkOut: timeStr,
        totalHours: hours,
        status,
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'ATTENDANCE_CHECKOUT',
        details: `Checked out at ${timeStr}. Total hours: ${hours}h`,
      },
    });

    res.status(200).json({
      message: 'Check-out successful! Workday session completed.',
      attendance: updatedRecord,
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ error: 'Failed to perform check-out.' });
  }
};

// Get my attendance history
export const getMyAttendance = async (req, res) => {
  try {
    const employeeId = req.user.profile?.id;
    if (!employeeId) {
      return res.status(400).json({ error: 'No employee profile associated with user account.' });
    }

    const attendances = await prisma.attendance.findMany({
      where: { employeeId },
      orderBy: { date: 'desc' },
      take: 60,
    });

    res.status(200).json({ attendances });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance history.' });
  }
};

// Admin: Get all attendance records across all employees
export const getAllAttendance = async (req, res) => {
  try {
    const { date, employeeId, status } = req.query;

    let whereClause = {};

    if (date) {
      whereClause.date = date;
    }
    if (employeeId) {
      whereClause.employeeId = employeeId;
    }
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const attendances = await prisma.attendance.findMany({
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
            user: { select: { employeeId: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
      take: 100,
    });

    res.status(200).json({ attendances });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance records.' });
  }
};

// Admin: Manual attendance status override or entry
export const updateAttendanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, checkIn, checkOut, notes } = req.body;

    const existing = await prisma.attendance.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Attendance record not found.' });
    }

    const updated = await prisma.attendance.update({
      where: { id },
      data: {
        status: status || existing.status,
        checkIn: checkIn !== undefined ? checkIn : existing.checkIn,
        checkOut: checkOut !== undefined ? checkOut : existing.checkOut,
        notes: notes !== undefined ? notes : existing.notes,
      },
    });

    res.status(200).json({ message: 'Attendance status updated by Admin.', attendance: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update attendance status.' });
  }
};
