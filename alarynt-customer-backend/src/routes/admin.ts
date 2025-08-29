import { Router } from 'express';
import { 
  adminLogin, 
  adminLogout, 
  getCurrentAdmin, 
  validateAdminToken,
  getAllCustomers,
  getCustomerMetrics,
  getSystemStats,
  getSystemActivity,
  exportCustomerData,
  exportAllCustomersData
} from '../controllers/adminController';
import { authenticateToken } from '../middleware/auth';
import { validateLogin } from '../middleware/validation';

const router = Router();

// Admin Authentication Routes
/**
 * @swagger
 * /api/v1/admin/auth/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "admin@alarynt.com"
 *             password: "admin123"
 *     responses:
 *       200:
 *         description: Admin login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Invalid admin credentials
 */
router.post('/auth/login', validateLogin, adminLogin);

/**
 * @swagger
 * /api/v1/admin/auth/logout:
 *   post:
 *     summary: Admin logout
 *     tags: [Admin Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Admin logout successful
 */
router.post('/auth/logout', authenticateToken, adminLogout);

/**
 * @swagger
 * /api/v1/admin/auth/me:
 *   get:
 *     summary: Get current admin profile
 *     tags: [Admin Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current admin profile retrieved successfully
 */
router.get('/auth/me', authenticateToken, getCurrentAdmin);

/**
 * @swagger
 * /api/v1/admin/auth/validate:
 *   get:
 *     summary: Validate admin authentication token
 *     tags: [Admin Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Admin token is valid
 */
router.get('/auth/validate', authenticateToken, validateAdminToken);

// Admin Data Routes
/**
 * @swagger
 * /api/v1/admin/customers:
 *   get:
 *     summary: Get all customers overview
 *     tags: [Admin Data]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all customers with overview metrics
 */
router.get('/customers', authenticateToken, getAllCustomers);

/**
 * @swagger
 * /api/v1/admin/customers/{customerId}/metrics:
 *   get:
 *     summary: Get detailed metrics for specific customer
 *     tags: [Admin Data]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Detailed customer metrics
 */
router.get('/customers/:customerId/metrics', authenticateToken, getCustomerMetrics);

/**
 * @swagger
 * /api/v1/admin/system/stats:
 *   get:
 *     summary: Get system-wide statistics
 *     tags: [Admin System]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: System-wide statistics
 */
router.get('/system/stats', authenticateToken, getSystemStats);

/**
 * @swagger
 * /api/v1/admin/system/activity:
 *   get:
 *     summary: Get recent system activity across all customers
 *     tags: [Admin System]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Recent system activity
 */
router.get('/system/activity', authenticateToken, getSystemActivity);

/**
 * @swagger
 * /api/v1/admin/export/customer/{customerId}:
 *   get:
 *     summary: Export data for specific customer
 *     tags: [Admin Export]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer data export
 */
router.get('/export/customer/:customerId', authenticateToken, exportCustomerData);

/**
 * @swagger
 * /api/v1/admin/export/all:
 *   get:
 *     summary: Export data for all customers
 *     tags: [Admin Export]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All customers data export
 */
router.get('/export/all', authenticateToken, exportAllCustomersData);

export default router;