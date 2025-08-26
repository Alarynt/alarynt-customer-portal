import { Router } from 'express';
import {
  getDashboardStats,
  getRecentActivity,
  getRuleExecutionData,
  getActionDistribution,
  getTopPerformingRules,
  getSystemHealth
} from '../controllers/dashboardController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/v1/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               data:
 *                 stats:
 *                   totalRules: 125
 *                   activeRules: 98
 *                   inactiveRules: 27
 *                   totalActions: 67
 *                   activeActions: 52
 *                   todayExecutions: 1247
 *                   successfulExecutions: 1189
 *                   failedExecutions: 58
 *                   successRate: 95.35
 *                   averageExecutionTime: 234
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/stats', authenticateToken, getDashboardStats);

/**
 * @swagger
 * /api/v1/dashboard/activity:
 *   get:
 *     summary: Get recent activity
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Number of recent activities to return
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       200:
 *         description: Recent activity retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               data:
 *                 activities:
 *                   - id: "activity_001"
 *                     type: "rule_execution"
 *                     description: "Rule 'High Value Order Alert' executed successfully"
 *                     userId: "507f1f77bcf86cd799439012"
 *                     timestamp: "2024-01-26T10:30:00.000Z"
 *                     metadata:
 *                       ruleId: "rule_123"
 *                       status: "success"
 *                   - id: "activity_002"
 *                     type: "rule_created"
 *                     description: "New rule 'Premium Customer Alert' created"
 *                     userId: "507f1f77bcf86cd799439013"
 *                     timestamp: "2024-01-26T10:15:00.000Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/activity', authenticateToken, getRecentActivity);

/**
 * @swagger
 * /api/v1/dashboard/rule-executions:
 *   get:
 *     summary: Get rule execution data for charts
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: period
 *         in: query
 *         description: Time period for execution data
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: week
 *       - name: groupBy
 *         in: query
 *         description: Group executions by time interval
 *         schema:
 *           type: string
 *           enum: [hour, day, week, month]
 *           default: day
 *     responses:
 *       200:
 *         description: Rule execution data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               data:
 *                 executions:
 *                   - date: "2024-01-26"
 *                     successful: 245
 *                     failed: 12
 *                     total: 257
 *                   - date: "2024-01-25"
 *                     successful: 289
 *                     failed: 8
 *                     total: 297
 *                   - date: "2024-01-24"
 *                     successful: 223
 *                     failed: 15
 *                     total: 238
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/rule-executions', authenticateToken, getRuleExecutionData);

/**
 * @swagger
 * /api/v1/dashboard/action-distribution:
 *   get:
 *     summary: Get action distribution data
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Action distribution data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               data:
 *                 distribution:
 *                   - type: "email"
 *                     count: 28
 *                     percentage: 41.8
 *                   - type: "webhook"
 *                     count: 19
 *                     percentage: 28.4
 *                   - type: "notification"
 *                     count: 12
 *                     percentage: 17.9
 *                   - type: "sms"
 *                     count: 5
 *                     percentage: 7.5
 *                   - type: "database"
 *                     count: 3
 *                     percentage: 4.5
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/action-distribution', authenticateToken, getActionDistribution);

/**
 * @swagger
 * /api/v1/dashboard/top-rules:
 *   get:
 *     summary: Get top performing rules
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Number of top rules to return
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *       - name: sortBy
 *         in: query
 *         description: Sort criteria for top rules
 *         schema:
 *           type: string
 *           enum: [executions, successRate, performance]
 *           default: executions
 *     responses:
 *       200:
 *         description: Top performing rules retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               data:
 *                 topRules:
 *                   - id: "rule_001"
 *                     name: "High Value Order Alert"
 *                     executionCount: 1247
 *                     successRate: 98.5
 *                     averageExecutionTime: 187
 *                   - id: "rule_002"
 *                     name: "Premium Customer Welcome"
 *                     executionCount: 896
 *                     successRate: 99.2
 *                     averageExecutionTime: 156
 *                   - id: "rule_003"
 *                     name: "Inventory Low Stock Alert"
 *                     executionCount: 723
 *                     successRate: 97.8
 *                     averageExecutionTime: 203
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/top-rules', authenticateToken, getTopPerformingRules);

/**
 * @swagger
 * /api/v1/dashboard/health:
 *   get:
 *     summary: Get system health metrics
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: System health metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               data:
 *                 health:
 *                   status: "healthy"
 *                   uptime: 86400
 *                   memory:
 *                     used: "145.2 MB"
 *                     total: "512 MB"
 *                     percentage: 28.4
 *                   cpu:
 *                     usage: 12.5
 *                   database:
 *                     status: "connected"
 *                     responseTime: 45
 *                   api:
 *                     requestsPerMinute: 127
 *                     averageResponseTime: 234
 *                     errorRate: 0.8
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/health', authenticateToken, getSystemHealth);

export default router;