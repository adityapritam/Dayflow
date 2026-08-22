import express from 'express';
import { getDashboardStats } from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

router.get('/stats', getDashboardStats);

export default router;
