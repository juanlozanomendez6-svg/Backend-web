import express from 'express';
import AuthController from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected routes
router.get('/profile', authenticateToken, AuthController.getProfile);
router.get('/verify', authenticateToken, AuthController.verifyToken);

export default router;