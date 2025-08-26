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
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             email: "john.doe@example.com"
 *             password: "securepassword123"
 *             name: "John Doe"
 *             company: "Acme Corp"
 *             role: "User"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: "User registered successfully"
 *               data:
 *                 user:
 *                   id: "507f1f77bcf86cd799439011"
 *                   email: "john.doe@example.com"
 *                   name: "John Doe"
 *                   company: "Acme Corp"
 *                   role: "User"
 *                   isActive: true
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "User already exists with this email"
 */
router.post('/register', validateUserRegistration, register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "john.doe@example.com"
 *             password: "securepassword123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: "Login successful"
 *               data:
 *                 user:
 *                   id: "507f1f77bcf86cd799439011"
 *                   email: "john.doe@example.com"
 *                   name: "John Doe"
 *                   company: "Acme Corp"
 *                   role: "User"
 *                   lastLogin: "2024-01-26T10:30:00.000Z"
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Invalid email or password"
 */
router.post('/login', validateLogin, login);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: User logout
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: "Logout successful"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/logout', authenticateToken, logout);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               data:
 *                 user:
 *                   id: "507f1f77bcf86cd799439011"
 *                   email: "john.doe@example.com"
 *                   name: "John Doe"
 *                   company: "Acme Corp"
 *                   role: "User"
 *                   isActive: true
 *                   lastLogin: "2024-01-26T10:30:00.000Z"
 *                   createdAt: "2024-01-20T10:00:00.000Z"
 *                   updatedAt: "2024-01-26T10:30:00.000Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me', authenticateToken, getCurrentUser);

/**
 * @swagger
 * /api/v1/auth/validate:
 *   get:
 *     summary: Validate authentication token
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: "Token is valid"
 *               data:
 *                 valid: true
 *                 expiresAt: "2024-01-27T10:30:00.000Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/validate', authenticateToken, validateToken);

export default router;