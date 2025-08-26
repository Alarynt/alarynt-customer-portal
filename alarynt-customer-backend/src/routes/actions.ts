import { Router } from 'express';
import {
  getActions,
  getActionById,
  createAction,
  updateAction,
  deleteAction,
  toggleActionStatus,
  testAction
} from '../controllers/actionsController';
import { authenticateToken, requireManagerOrAdmin } from '../middleware/auth';
import {
  validateCreateAction,
  validateUpdateAction,
  validateId,
  validatePagination
} from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /api/v1/actions:
 *   get:
 *     summary: Get all actions with pagination and filtering
 *     tags: [Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - $ref: '#/components/parameters/StatusParam'
 *       - name: type
 *         in: query
 *         description: Filter by action type
 *         schema:
 *           type: string
 *           enum: [email, sms, webhook, database, notification]
 *       - name: sortBy
 *         in: query
 *         description: Sort field
 *         schema:
 *           type: string
 *           enum: [name, createdAt, updatedAt, type, executionCount]
 *       - name: sortOrder
 *         in: query
 *         description: Sort order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Actions retrieved successfully
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
 *                         $ref: '#/components/schemas/Action'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', authenticateToken, validatePagination, getActions);

/**
 * @swagger
 * /api/v1/actions/{id}:
 *   get:
 *     summary: Get a single action by ID
 *     tags: [Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Action retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               data:
 *                 action:
 *                   id: "507f1f77bcf86cd799439014"
 *                   name: "Send Welcome Email"
 *                   description: "Send welcome email to new customers"
 *                   type: "email"
 *                   config:
 *                     to: "{{customer.email}}"
 *                     subject: "Welcome to our platform!"
 *                     template: "welcome_template"
 *                   status: "active"
 *                   createdAt: "2024-01-20T10:00:00.000Z"
 *                   updatedAt: "2024-01-25T14:30:00.000Z"
 *                   executionCount: 89
 *                   successRate: 98.9
 *                   createdBy: "507f1f77bcf86cd799439012"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', authenticateToken, validateId, getActionById);

/**
 * @swagger
 * /api/v1/actions:
 *   post:
 *     summary: Create a new action
 *     tags: [Actions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, type, config, status]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *               type:
 *                 type: string
 *                 enum: [email, sms, webhook, database, notification]
 *               config:
 *                 type: object
 *                 description: Configuration specific to action type
 *               status:
 *                 type: string
 *                 enum: [active, inactive, draft]
 *           example:
 *             name: "Slack Notification"
 *             description: "Send notification to Slack channel"
 *             type: "webhook"
 *             config:
 *               url: "https://hooks.slack.com/services/..."
 *               method: "POST"
 *               headers:
 *                 "Content-Type": "application/json"
 *               body:
 *                 text: "New rule execution: {{rule.name}}"
 *             status: "active"
 *     responses:
 *       201:
 *         description: Action created successfully
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
 */
router.post('/', authenticateToken, requireManagerOrAdmin, validateCreateAction, createAction);

/**
 * @swagger
 * /api/v1/actions/{id}:
 *   put:
 *     summary: Update an action
 *     tags: [Actions]
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
 *               config:
 *                 type: object
 *               status:
 *                 type: string
 *                 enum: [active, inactive, draft]
 *           example:
 *             name: "Updated Slack Notification"
 *             description: "Updated notification to Slack channel with more details"
 *             config:
 *               url: "https://hooks.slack.com/services/..."
 *               method: "POST"
 *               body:
 *                 text: "Rule {{rule.name}} executed with status: {{execution.status}}"
 *     responses:
 *       200:
 *         description: Action updated successfully
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
router.put('/:id', authenticateToken, requireManagerOrAdmin, validateUpdateAction, updateAction);

/**
 * @swagger
 * /api/v1/actions/{id}:
 *   delete:
 *     summary: Delete an action
 *     tags: [Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Action deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: "Action deleted successfully"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id', authenticateToken, requireManagerOrAdmin, validateId, deleteAction);

/**
 * @swagger
 * /api/v1/actions/{id}/toggle:
 *   patch:
 *     summary: Toggle action status (activate/deactivate)
 *     tags: [Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Action status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: "Action status updated to inactive"
 *               data:
 *                 action:
 *                   id: "507f1f77bcf86cd799439014"
 *                   status: "inactive"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch('/:id/toggle', authenticateToken, requireManagerOrAdmin, validateId, toggleActionStatus);

/**
 * @swagger
 * /api/v1/actions/{id}/test:
 *   post:
 *     summary: Test an action
 *     tags: [Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               testData:
 *                 type: object
 *                 description: Optional test data to use for action execution
 *           example:
 *             testData:
 *               customer:
 *                 email: "test@example.com"
 *                 name: "Test Customer"
 *               order:
 *                 id: "test-order-123"
 *                 total: 1500
 *     responses:
 *       200:
 *         description: Action test completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: "Action test completed successfully"
 *               data:
 *                 testResult:
 *                   success: true
 *                   executionTime: 245
 *                   response: "Email sent successfully to test@example.com"
 *       400:
 *         description: Action test failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Action test failed"
 *               details: "Invalid email configuration"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/:id/test', authenticateToken, requireManagerOrAdmin, validateId, testAction);

export default router;