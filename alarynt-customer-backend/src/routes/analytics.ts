import { Router } from 'express';
import {
  getPerformanceData,
  getRulePerformance,
  getActionPerformance,
  getErrorAnalysis,
  getTrendAnalysis,
  getUsageStatistics
} from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/v1/analytics/performance:
 *   get:
 *     summary: Get performance data over time
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: period
 *         in: query
 *         description: Time period for performance data
 *         schema:
 *           type: string
 *           enum: [day, week, month, quarter, year]
 *           default: month
 *       - name: metric
 *         in: query
 *         description: Specific performance metric to retrieve
 *         schema:
 *           type: string
 *           enum: [execution_time, success_rate, throughput, error_rate]
 *     responses:
 *       200:
 *         description: Performance data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               data:
 *                 performance:
 *                   - period: "2024-01-26"
 *                     averageExecutionTime: 245
 *                     successRate: 95.2
 *                     throughput: 1247
 *                     errorRate: 4.8
 *                   - period: "2024-01-25"
 *                     averageExecutionTime: 234
 *                     successRate: 96.8
 *                     throughput: 1189
 *                     errorRate: 3.2
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/performance', authenticateToken, getPerformanceData);

/**
 * @swagger
 * /api/v1/analytics/rules/performance:
 *   get:
 *     summary: Get rule performance rankings
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: sortBy
 *         in: query
 *         description: Sort criteria for rule performance
 *         schema:
 *           type: string
 *           enum: [execution_time, success_rate, execution_count, error_rate]
 *           default: execution_count
 *       - name: order
 *         in: query
 *         description: Sort order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - name: limit
 *         in: query
 *         description: Number of rules to return
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - name: period
 *         in: query
 *         description: Time period for performance analysis
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *     responses:
 *       200:
 *         description: Rule performance rankings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               data:
 *                 rules:
 *                   - id: "rule_001"
 *                     name: "High Value Order Alert"
 *                     executionCount: 1247
 *                     successRate: 98.5
 *                     averageExecutionTime: 187
 *                     errorRate: 1.5
 *                     rank: 1
 *                   - id: "rule_002"
 *                     name: "Premium Customer Welcome"
 *                     executionCount: 896
 *                     successRate: 99.2
 *                     averageExecutionTime: 156
 *                     errorRate: 0.8
 *                     rank: 2
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/rules/performance', authenticateToken, getRulePerformance);

/**
 * @swagger
 * /api/v1/analytics/actions/performance:
 *   get:
 *     summary: Get action performance rankings
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: sortBy
 *         in: query
 *         description: Sort criteria for action performance
 *         schema:
 *           type: string
 *           enum: [execution_time, success_rate, execution_count, error_rate]
 *           default: execution_count
 *       - name: order
 *         in: query
 *         description: Sort order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - name: limit
 *         in: query
 *         description: Number of actions to return
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - name: type
 *         in: query
 *         description: Filter by action type
 *         schema:
 *           type: string
 *           enum: [email, sms, webhook, database, notification]
 *     responses:
 *       200:
 *         description: Action performance rankings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               data:
 *                 actions:
 *                   - id: "action_001"
 *                     name: "Send Welcome Email"
 *                     type: "email"
 *                     executionCount: 789
 *                     successRate: 98.9
 *                     averageExecutionTime: 345
 *                     errorRate: 1.1
 *                     rank: 1
 *                   - id: "action_002"
 *                     name: "Slack Notification"
 *                     type: "webhook"
 *                     executionCount: 567
 *                     successRate: 97.3
 *                     averageExecutionTime: 123
 *                     errorRate: 2.7
 *                     rank: 2
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/actions/performance', authenticateToken, getActionPerformance);

/**
 * @swagger
 * /api/v1/analytics/errors:
 *   get:
 *     summary: Get error analysis
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: period
 *         in: query
 *         description: Time period for error analysis
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: week
 *       - name: groupBy
 *         in: query
 *         description: Group errors by category
 *         schema:
 *           type: string
 *           enum: [type, severity, component, rule, action]
 *           default: type
 *     responses:
 *       200:
 *         description: Error analysis retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               data:
 *                 errorAnalysis:
 *                   totalErrors: 127
 *                   errorsByType:
 *                     validation_error: 45
 *                     network_error: 32
 *                     timeout_error: 28
 *                     configuration_error: 22
 *                   errorsByDay:
 *                     - date: "2024-01-26"
 *                       count: 18
 *                       severity: "medium"
 *                     - date: "2024-01-25"
 *                       count: 23
 *                       severity: "low"
 *                   topErrorRules:
 *                     - ruleId: "rule_005"
 *                       ruleName: "Complex Validation Rule"
 *                       errorCount: 15
 *                   topErrorActions:
 *                     - actionId: "action_007"
 *                       actionName: "External API Call"
 *                       errorCount: 12
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/errors', authenticateToken, getErrorAnalysis);

/**
 * @swagger
 * /api/v1/analytics/trends:
 *   get:
 *     summary: Get trend analysis
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: metric
 *         in: query
 *         description: Metric for trend analysis
 *         schema:
 *           type: string
 *           enum: [executions, performance, errors, users, rules, actions]
 *           default: executions
 *       - name: period
 *         in: query
 *         description: Time period for trend analysis
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *           default: month
 *       - name: interval
 *         in: query
 *         description: Data point interval
 *         schema:
 *           type: string
 *           enum: [hour, day, week, month]
 *           default: day
 *     responses:
 *       200:
 *         description: Trend analysis retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               data:
 *                 trends:
 *                   metric: "executions"
 *                   period: "month"
 *                   growth: 15.2
 *                   dataPoints:
 *                     - date: "2024-01-26"
 *                       value: 1247
 *                       change: 5.2
 *                     - date: "2024-01-25"
 *                       value: 1189
 *                       change: -2.1
 *                     - date: "2024-01-24"
 *                       value: 1215
 *                       change: 8.7
 *                   summary:
 *                     average: 1150
 *                     peak: 1349
 *                     peakDate: "2024-01-20"
 *                     trend: "increasing"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/trends', authenticateToken, getTrendAnalysis);

/**
 * @swagger
 * /api/v1/analytics/usage:
 *   get:
 *     summary: Get usage statistics
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: period
 *         in: query
 *         description: Time period for usage statistics
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *       - name: breakdown
 *         in: query
 *         description: Breakdown category for usage stats
 *         schema:
 *           type: string
 *           enum: [users, rules, actions, time, resources]
 *           default: users
 *     responses:
 *       200:
 *         description: Usage statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               data:
 *                 usage:
 *                   totalUsers: 45
 *                   activeUsers: 32
 *                   totalRules: 125
 *                   totalActions: 67
 *                   totalExecutions: 15247
 *                   resourceUsage:
 *                     cpu: 23.5
 *                     memory: 156.2
 *                     storage: 2.4
 *                   userActivity:
 *                     - userId: "507f1f77bcf86cd799439012"
 *                       userName: "John Doe"
 *                       sessions: 28
 *                       rulesCreated: 12
 *                       actionsExecuted: 345
 *                   peakUsageTimes:
 *                     - hour: 9
 *                       usage: 89
 *                     - hour: 14
 *                       usage: 76
 *                     - hour: 16
 *                       usage: 82
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/usage', authenticateToken, getUsageStatistics);

export default router;