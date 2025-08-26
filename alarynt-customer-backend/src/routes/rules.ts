import { Router } from 'express';
import {
  getRules,
  getRuleById,
  createRule,
  updateRule,
  deleteRule,
  toggleRuleStatus,
  getRuleStats
} from '../controllers/rulesController';
import { authenticateToken, requireManagerOrAdmin } from '../middleware/auth';
import {
  validateCreateRule,
  validateUpdateRule,
  validateId,
  validatePagination
} from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /api/v1/rules:
 *   get:
 *     summary: Get all rules with pagination and filtering
 *     tags: [Rules]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - $ref: '#/components/parameters/StatusParam'
 *       - name: priority
 *         in: query
 *         description: Filter by priority
 *         schema:
 *           type: number
 *       - name: tags
 *         in: query
 *         description: Filter by tags (comma-separated)
 *         schema:
 *           type: string
 *       - name: sortBy
 *         in: query
 *         description: Sort field
 *         schema:
 *           type: string
 *           enum: [name, createdAt, updatedAt, priority, executionCount]
 *       - name: sortOrder
 *         in: query
 *         description: Sort order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Rules retrieved successfully
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
 *                         $ref: '#/components/schemas/Rule'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.get('/', authenticateToken, validatePagination, getRules);

/**
 * @swagger
 * /api/v1/rules/{id}:
 *   get:
 *     summary: Get a single rule by ID
 *     tags: [Rules]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Rule retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               data:
 *                 rule:
 *                   id: "507f1f77bcf86cd799439011"
 *                   name: "High Value Order Alert"
 *                   description: "Send alert for orders over $1000"
 *                   dsl: "WHEN order.total > 1000 THEN send_email(to: 'sales@company.com')"
 *                   status: "active"
 *                   priority: 10
 *                   tags: ["sales", "alerts"]
 *                   createdAt: "2024-01-20T10:00:00.000Z"
 *                   updatedAt: "2024-01-25T14:30:00.000Z"
 *                   executionCount: 150
 *                   successRate: 95.5
 *                   createdBy: "507f1f77bcf86cd799439012"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', authenticateToken, validateId, getRuleById);

/**
 * @swagger
 * /api/v1/rules:
 *   post:
 *     summary: Create a new rule
 *     tags: [Rules]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, dsl, status, priority]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *               dsl:
 *                 type: string
 *                 description: Domain Specific Language code
 *               status:
 *                 type: string
 *                 enum: [active, inactive, draft]
 *               priority:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 100
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *           example:
 *             name: "Premium Customer Alert"
 *             description: "Alert for premium customer orders"
 *             dsl: "WHEN customer.tier == 'premium' AND order.total > 500 THEN send_notification()"
 *             status: "active"
 *             priority: 15
 *             tags: ["premium", "notifications"]
 *     responses:
 *       201:
 *         description: Rule created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: "Rule created successfully"
 *               data:
 *                 rule:
 *                   id: "507f1f77bcf86cd799439013"
 *                   name: "Premium Customer Alert"
 *                   description: "Alert for premium customer orders"
 *                   dsl: "WHEN customer.tier == 'premium' AND order.total > 500 THEN send_notification()"
 *                   status: "active"
 *                   priority: 15
 *                   tags: ["premium", "notifications"]
 *                   createdAt: "2024-01-26T10:30:00.000Z"
 *                   updatedAt: "2024-01-26T10:30:00.000Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/', authenticateToken, requireManagerOrAdmin, validateCreateRule, createRule);

/**
 * @swagger
 * /api/v1/rules/{id}:
 *   put:
 *     summary: Update a rule
 *     tags: [Rules]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *               dsl:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, draft]
 *               priority:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 100
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *           example:
 *             name: "Updated Premium Customer Alert"
 *             description: "Updated alert for premium customer orders"
 *             priority: 20
 *     responses:
 *       200:
 *         description: Rule updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id', authenticateToken, requireManagerOrAdmin, validateUpdateRule, updateRule);

/**
 * @swagger
 * /api/v1/rules/{id}:
 *   delete:
 *     summary: Delete a rule
 *     tags: [Rules]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Rule deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: "Rule deleted successfully"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id', authenticateToken, requireManagerOrAdmin, validateId, deleteRule);

/**
 * @swagger
 * /api/v1/rules/{id}/toggle:
 *   patch:
 *     summary: Toggle rule status (activate/deactivate)
 *     tags: [Rules]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Rule status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: "Rule status updated to inactive"
 *               data:
 *                 rule:
 *                   id: "507f1f77bcf86cd799439011"
 *                   status: "inactive"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch('/:id/toggle', authenticateToken, requireManagerOrAdmin, validateId, toggleRuleStatus);

/**
 * @swagger
 * /api/v1/rules/{id}/stats:
 *   get:
 *     summary: Get rule execution statistics
 *     tags: [Rules]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *       - name: period
 *         in: query
 *         description: Statistics period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *     responses:
 *       200:
 *         description: Rule statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               data:
 *                 stats:
 *                   executionCount: 150
 *                   successCount: 143
 *                   failureCount: 7
 *                   successRate: 95.33
 *                   averageExecutionTime: 245
 *                   lastExecuted: "2024-01-26T09:15:00.000Z"
 *                   executionHistory:
 *                     - date: "2024-01-26"
 *                       count: 25
 *                       success: 24
 *                     - date: "2024-01-25"
 *                       count: 30
 *                       success: 29
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id/stats', authenticateToken, validateId, getRuleStats);

export default router;