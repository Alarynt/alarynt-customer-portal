import { Router } from 'express';
import { 
  register, 
  login, 
  logout, 
  getCurrentUser, 
  validateToken 
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { 
  validateUserRegistration, 
  validateLogin 
} from '../middleware/validation';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateUserRegistration, register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateLogin, login);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticateToken, logout);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticateToken, getCurrentUser);

/**
 * @route   GET /api/v1/auth/validate
 * @desc    Validate token
 * @access  Private
 */
router.get('/validate', authenticateToken, validateToken);

export default router;