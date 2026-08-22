import express from 'express';
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
} from '../controllers/leaveController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/apply', applyLeave);
router.get('/my', getMyLeaves);
router.get('/all', requireRole(['ADMIN']), getAllLeaves);
router.put('/:id/status', requireRole(['ADMIN']), updateLeaveStatus);

export default router;
