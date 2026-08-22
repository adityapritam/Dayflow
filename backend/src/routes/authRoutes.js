import express from 'express';
import { register, login, verifyEmail, resendCode, getMe } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-code', resendCode);
router.get('/me', authenticateToken, getMe);

export default router;
