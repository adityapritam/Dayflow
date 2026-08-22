import express from 'express';
import { getAllEmployees, getEmployeeById, updateEmployee } from '../controllers/employeeController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', requireRole(['ADMIN']), getAllEmployees);
router.get('/:id', getEmployeeById);
router.put('/:id', updateEmployee);

export default router;
