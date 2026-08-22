import express from 'express';
import {
  getMyPayroll,
  getAllPayrolls,
  updateSalaryStructure,
  updatePayrollStatus,
} from '../controllers/payrollController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/my', getMyPayroll);
router.get('/all', requireRole(['ADMIN']), getAllPayrolls);
router.put('/salary/:employeeId', requireRole(['ADMIN']), updateSalaryStructure);
router.put('/:id/status', requireRole(['ADMIN']), updatePayrollStatus);

export default router;
