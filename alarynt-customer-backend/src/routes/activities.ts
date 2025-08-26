import { Router } from 'express';
import {
  getActivities,
  getActivitiesByType,
  getActivitiesByUser,
  getActivityStats,
  getActivityTypes,
  cleanupOldActivities
} from '../controllers/activitiesController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validatePagination, validateDateRange } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /api/v1/activities:
 *   get:
 *     summary: Get all activities with pagination and filtering
 *     tags: [Activities]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - name: type
 *         in: query
 *         description: Filter by activity type
 *         schema:
 *           type: string
 *       - name: userId
 *         in: query
 *         description: Filter by user ID
 *         schema:
 *           type: string
 *       - name: startDate
 *         in: query
 *         description: Start date for filtering (ISO string)
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: endDate
 *         in: query
 *         description: End date for filtering (ISO string)
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Activities retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Activity'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', authenticateToken, validatePagination, validateDateRange, getActivities);

/**
 * @swagger
 * /api/v1/activities/by-type/{type}:
 *   get:
 *     summary: Get activities by type
 *     tags: [Activities]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: type
 *         in: path
 *         required: true
 *         description: Activity type
 *         schema:
 *           type: string
 *         example: rule_execution
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Activities by type retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Activity'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/by-type/:type', authenticateToken, validatePagination, getActivitiesByType);

/**
 * @swagger
 * /api/v1/activities/by-user/{userId}:
 *   get:
 *     summary: Get activities by user
 *     tags: [Activities]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *         example: "507f1f77bcf86cd799439012"
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Activities by user retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Activity'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/by-user/:userId', authenticateToken, validatePagination, getActivitiesByUser);

/**
 * @swagger
 * /api/v1/activities/stats:
 *   get:
 *     summary: Get activity statistics
 *     tags: [Activities]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: period
 *         in: query
 *         description: Statistics period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *     responses:
 *       200:
 *         description: Activity statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               data:
 *                 stats:
 *                   totalActivities: 15247
 *                   activitiesByType:
 *                     rule_execution: 8934
 *                     rule_created: 234
 *                     rule_updated: 512
 *                     action_executed: 4892
 *                     user_login: 675
 *                   activitiesByDay:
 *                     - date: "2024-01-26"
 *                       count: 456
 *                     - date: "2024-01-25"
 *                       count: 523
 *                     - date: "2024-01-24"
 *                       count: 401
 *                   topUsers:
 *                     - userId: "507f1f77bcf86cd799439012"
 *                       userName: "John Doe"
 *                       activityCount: 1247
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/stats', authenticateToken, getActivityStats);

/**
 * @swagger
 * /api/v1/activities/types:
 *   get:
 *     summary: Get available activity types
 *     tags: [Activities]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Activity types retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               data:
 *                 types:
 *                   - type: "rule_execution"
 *                     description: "Rule execution activity"
 *                     count: 8934
 *                   - type: "rule_created"
 *                     description: "Rule creation activity"
 *                     count: 234
 *                   - type: "rule_updated"
 *                     description: "Rule update activity"
 *                     count: 512
 *                   - type: "action_executed"
 *                     description: "Action execution activity"
 *                     count: 4892
 *                   - type: "user_login"
 *                     description: "User login activity"
 *                     count: 675
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/types', authenticateToken, getActivityTypes);

/**
 * @swagger
 * /api/v1/activities/cleanup:
 *   delete:
 *     summary: Delete old activities (Admin only)
 *     tags: [Activities]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: olderThan
 *         in: query
 *         description: Delete activities older than this many days
 *         schema:
 *           type: number
 *           minimum: 1
 *           default: 90
 *       - name: keepCount
 *         in: query
 *         description: Minimum number of recent activities to keep
 *         schema:
 *           type: number
 *           minimum: 100
 *           default: 1000
 *     responses:
 *       200:
 *         description: Old activities cleaned up successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: "Old activities cleaned up successfully"
 *               data:
 *                 deletedCount: 2847
 *                 oldestKeptDate: "2023-11-26T10:30:00.000Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Access denied - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Access denied. Admin role required."
 */
router.delete('/cleanup', authenticateToken, requireAdmin, cleanupOldActivities);

export default router;