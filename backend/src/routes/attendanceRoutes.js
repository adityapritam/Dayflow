import express from 'express';
import {
  getTodayAttendance,
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  updateAttendanceStatus,
} from '../controllers/attendanceController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/today', getTodayAttendance);
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/my', getMyAttendance);
router.get('/all', requireRole(['ADMIN']), getAllAttendance);
router.put('/:id', requireRole(['ADMIN']), updateAttendanceStatus);

export default router;
