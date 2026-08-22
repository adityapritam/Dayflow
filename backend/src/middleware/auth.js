import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { admin, useFirebase } from '../config/firebase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dayflow_super_secret_jwt_key_2026';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No authorization token provided.' });
    }

    const token = authHeader.split(' ')[1];
    let user = null;

    // Check if Firebase is active and try verifying ID Token
    if (useFirebase) {
      try {
        const decodedFirebase = await admin.auth().verifyIdToken(token);
        user = await prisma.user.findUnique({
          where: { email: decodedFirebase.email },
          include: { profile: true },
        });
      } catch (fbError) {
        // If Firebase token fails (expired or invalid), fallback to local JWT check
      }
    }

    // Fallback/Standard JWT validation if user is not resolved yet
    if (!user) {
      const decoded = jwt.verify(token, JWT_SECRET);
      user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { profile: true },
      });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token. User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed. Invalid or expired token.' });
  }
};

export const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden. Action requires role: ${roles.join(' or ')}.` });
    }

    next();
  };
};
