import { Router } from 'express';
import { login, refresh, me, logout, createUser } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes with rate limiting
router.post('/login', authLimiter, login);
router.post('/refresh', authLimiter, refresh);
router.post('/register', authLimiter, createUser);

// Protected routes
router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);

export default router;

