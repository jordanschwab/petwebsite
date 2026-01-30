import express from 'express';
import { googleLogin, logout, getCurrentUser, refreshToken } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Frontend sends ID token to this endpoint
router.post('/google', googleLogin);

// Logout (clears refresh token cookie)
router.post('/logout', logout);

// Get current authenticated user
router.get('/me', requireAuth, getCurrentUser);

// Refresh access token using refresh token cookie or body
router.post('/refresh', refreshToken);

export default router;
