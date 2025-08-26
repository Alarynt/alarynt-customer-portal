import express, { Request, Response } from 'express';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, authorizeRule, optionalAuth } from '../middleware/auth';
import { asyncHandler, createApiError } from '../middleware/errorHandler';
import { AuthenticatedRequest, AlertRequest, AlertResponse } from '../types';
import { ruleService } from '../services/ruleService';
import { lambdaService } from '../services/lambdaService';
import { createLogger } from '../utils/logger';

const router = express.Router();
const logger = createLogger('AlertRoutes');

// Validation schemas
const alertRequestSchema = Joi.object({
  payload: Joi.object().required(),
  metadata: Joi.object({
    source: Joi.string().optional(),
    timestamp: Joi.string().isoDate().optional(),
    correlationId: Joi.string().optional(),
  }).optional(),
});

/**
 * @swagger
 * /api/v1/alert/rule/{ruleId}:
 *   post:
 *     summary: Execute a rule synchronously
 *     description: |
 *       Triggers the execution of a specific rule with the provided payload and waits for the result.
 *       This endpoint will block until the rule execution completes and return the detailed results.
 *     tags: [Rules]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ruleId
 *         required: true
 *         description: Unique identifier of the rule to execute
 *         schema:
 *           type: string
 *           example: "rule-12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AlertRequest'
 *           examples:
 *             userLogin:
 *               summary: User login event
 *               value:
 *                 payload:
 *                   userId: "12345"
 *                   event: "user_login"
 *                   timestamp: "2024-01-15T10:30:00Z"
 *                   ipAddress: "192.168.1.1"
 *                   userAgent: "Mozilla/5.0..."
 *                 metadata:
 *                   source: "web-app"
 *                   correlationId: "corr-login-12345"
 *             transactionAlert:
 *               summary: High-value transaction
 *               value:
 *                 payload:
 *                   transactionId: "tx-98765"
 *                   amount: 10000
 *                   currency: "USD"
 *                   userId: "user-456"
 *                   merchantId: "merchant-789"
 *                 metadata:
 *                   source: "payment-system"
 *                   timestamp: "2024-01-15T10:30:00Z"
 *     responses:
 *       200:
 *         description: Rule executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AlertResponse'
 *             example:
 *               success: true
 *               executionId: "550e8400-e29b-41d4-a716-446655440000"
 *               timestamp: "2024-01-15T10:30:00Z"
 *               result:
 *                 ruleExecuted: true
 *                 actionsExecuted: 2
 *                 executionTime: 150
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 *       500:
 *         description: Rule execution failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AlertResponse'
 *             example:
 *               success: false
 *               executionId: "550e8400-e29b-41d4-a716-446655440000"
 *               timestamp: "2024-01-15T10:30:00Z"
 *               error:
 *                 message: "Lambda execution failed"
 *                 code: "LAMBDA_EXECUTION_FAILED"
 */
router.post('/rule/:ruleId', 
  authenticate,
  authorizeRule((req: Request) => req.params.ruleId),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { ruleId } = req.params;
    const { customer } = req;
    
    if (!customer) {
      throw createApiError('Authentication required', 401);
    }

    // Validate request body
    const { error, value } = alertRequestSchema.validate(req.body);
    if (error) {
      throw createApiError(`Invalid request: ${error.details[0].message}`, 400);
    }

    const { payload, metadata } = value;
    const executionId = uuidv4();

    logger.info('Processing alert request', {
      executionId,
      ruleId,
      customerId: customer.id,
      payloadKeys: Object.keys(payload),
      metadata,
    });

    // Find and validate rule
    const rule = await ruleService.findRuleById(ruleId, customer);
    
    // Validate rule execution
    await ruleService.validateRuleExecution(rule, payload);

    // Prepare Lambda payload
    const lambdaPayload = ruleService.prepareLambdaPayload(rule, payload, {
      ...metadata,
      executionId,
      httpAlertSource: true,
    });

    // Invoke Lambda
    const lambdaResult = await lambdaService.invokeLambda(lambdaPayload);

    // Prepare response
    const response: AlertResponse = {
      success: lambdaResult.success,
      executionId,
      timestamp: new Date().toISOString(),
      result: {
        ruleExecuted: true,
        actionsExecuted: lambdaResult.actionsExecuted,
        executionTime: lambdaResult.executionTime,
      },
    };

    if (!lambdaResult.success && lambdaResult.error) {
      response.error = {
        message: lambdaResult.error,
        code: 'LAMBDA_EXECUTION_FAILED',
      };
    }

    logger.info('Alert request completed', {
      executionId,
      ruleId,
      customerId: customer.id,
      success: response.success,
      executionTime: lambdaResult.executionTime,
      actionsExecuted: lambdaResult.actionsExecuted,
    });

    res.status(response.success ? 200 : 500).json(response);
  })
);

/**
 * @swagger
 * /api/v1/alert/rule/{ruleId}/async:
 *   post:
 *     summary: Execute a rule asynchronously
 *     description: |
 *       Initiates the execution of a specific rule asynchronously and returns immediately.
 *       This is a fire-and-forget operation that doesn't wait for the execution to complete.
 *       Use this for non-critical rules or when you don't need immediate results.
 *     tags: [Rules]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ruleId
 *         required: true
 *         description: Unique identifier of the rule to execute
 *         schema:
 *           type: string
 *           example: "rule-12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AlertRequest'
 *           examples:
 *             backgroundProcessing:
 *               summary: Background data processing
 *               value:
 *                 payload:
 *                   datasetId: "dataset-789"
 *                   recordCount: 1000
 *                   processType: "batch_analysis"
 *                 metadata:
 *                   source: "data-pipeline"
 *                   priority: "low"
 *             notificationRule:
 *               summary: User notification trigger
 *               value:
 *                 payload:
 *                   userId: "user-123"
 *                   notificationType: "welcome_email"
 *                   templateId: "welcome-v2"
 *                 metadata:
 *                   source: "user-service"
 *                   correlationId: "welcome-123"
 *     responses:
 *       202:
 *         description: Rule execution initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AsyncAlertResponse'
 *             example:
 *               success: true
 *               executionId: "550e8400-e29b-41d4-a716-446655440000"
 *               timestamp: "2024-01-15T10:30:00Z"
 *               message: "Rule execution initiated asynchronously"
 *               invocationId: "lambda-invocation-123"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 *       500:
 *         description: Failed to initiate rule execution
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AsyncAlertResponse'
 *             example:
 *               success: false
 *               executionId: "550e8400-e29b-41d4-a716-446655440000"
 *               timestamp: "2024-01-15T10:30:00Z"
 *               message: "Failed to initiate rule execution"
 */
router.post('/rule/:ruleId/async',
  authenticate,
  authorizeRule((req: Request) => req.params.ruleId),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { ruleId } = req.params;
    const { customer } = req;

    if (!customer) {
      throw createApiError('Authentication required', 401);
    }

    // Validate request body
    const { error, value } = alertRequestSchema.validate(req.body);
    if (error) {
      throw createApiError(`Invalid request: ${error.details[0].message}`, 400);
    }

    const { payload, metadata } = value;
    const executionId = uuidv4();

    logger.info('Processing async alert request', {
      executionId,
      ruleId,
      customerId: customer.id,
      payloadKeys: Object.keys(payload),
    });

    // Find and validate rule
    const rule = await ruleService.findRuleById(ruleId, customer);
    
    // Validate rule execution
    await ruleService.validateRuleExecution(rule, payload);

    // Prepare Lambda payload
    const lambdaPayload = ruleService.prepareLambdaPayload(rule, payload, {
      ...metadata,
      executionId,
      httpAlertSource: true,
      async: true,
    });

    // Invoke Lambda asynchronously
    const invocationResult = await lambdaService.invokeLambdaAsync(lambdaPayload);

    const response = {
      success: invocationResult.success,
      executionId,
      timestamp: new Date().toISOString(),
      message: invocationResult.success 
        ? 'Rule execution initiated asynchronously' 
        : 'Failed to initiate rule execution',
      invocationId: invocationResult.invocationId,
    };

    logger.info('Async alert request completed', {
      executionId,
      ruleId,
      customerId: customer.id,
      success: response.success,
    });

    res.status(response.success ? 202 : 500).json(response);
  })
);

/**
 * @swagger
 * /api/v1/alert/rules:
 *   get:
 *     summary: List customer rules
 *     description: |
 *       Retrieves a list of all rules available to the authenticated customer.
 *       Returns basic rule information including name, description, status, and action count.
 *     tags: [Rules]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of customer rules retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RulesListResponse'
 *             example:
 *               success: true
 *               data:
 *                 rules:
 *                   - id: "rule-12345"
 *                     name: "User Login Alert"
 *                     description: "Triggers when suspicious login activity is detected"
 *                     tags: ["security", "authentication"]
 *                     actionsCount: 2
 *                     isActive: true
 *                     updatedAt: "2024-01-15T10:30:00Z"
 *                   - id: "rule-67890"
 *                     name: "High Value Transaction"
 *                     description: "Alerts on transactions above threshold"
 *                     tags: ["financial", "fraud-detection"]
 *                     actionsCount: 3
 *                     isActive: true
 *                     updatedAt: "2024-01-14T15:20:00Z"
 *                 count: 2
 *               timestamp: "2024-01-15T10:30:00Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/rules',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { customer } = req;

    if (!customer) {
      throw createApiError('Authentication required', 401);
    }

    const rules = await ruleService.getCustomerRules(customer);

    res.json({
      success: true,
      data: {
        rules: rules.map(rule => ({
          id: rule.id,
          name: rule.name,
          description: rule.metadata?.description,
          tags: rule.metadata?.tags,
          actionsCount: rule.actions.filter(a => a.isActive).length,
          isActive: rule.isActive,
          updatedAt: rule.updatedAt,
        })),
        count: rules.length,
      },
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @swagger
 * /api/v1/alert/rule/{ruleId}:
 *   get:
 *     summary: Get rule details
 *     description: |
 *       Retrieves detailed information about a specific rule including its conditions,
 *       actions, metadata, and configuration. The customer must have access to this rule.
 *     tags: [Rules]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ruleId
 *         required: true
 *         description: Unique identifier of the rule
 *         schema:
 *           type: string
 *           example: "rule-12345"
 *     responses:
 *       200:
 *         description: Rule details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RuleDetailsResponse'
 *             example:
 *               success: true
 *               data:
 *                 rule:
 *                   id: "rule-12345"
 *                   name: "User Login Alert"
 *                   description: "Triggers when suspicious login activity is detected"
 *                   tags: ["security", "authentication"]
 *                   version: "1.2.0"
 *                   conditions:
 *                     loginAttempts: "> 3"
 *                     timeWindow: "5m"
 *                   actions:
 *                     - id: "action-1"
 *                       type: "email"
 *                       isActive: true
 *                       config:
 *                         recipients: ["security@company.com"]
 *                     - id: "action-2"
 *                       type: "webhook"
 *                       isActive: true
 *                       config:
 *                         url: "https://api.company.com/webhooks/security"
 *                   isActive: true
 *                   createdAt: "2024-01-01T10:00:00Z"
 *                   updatedAt: "2024-01-15T10:30:00Z"
 *               timestamp: "2024-01-15T10:30:00Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/rule/:ruleId',
  authenticate,
  authorizeRule((req: Request) => req.params.ruleId),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { ruleId } = req.params;
    const { customer } = req;

    if (!customer) {
      throw createApiError('Authentication required', 401);
    }

    const rule = await ruleService.findRuleById(ruleId, customer);

    res.json({
      success: true,
      data: {
        rule: {
          id: rule.id,
          name: rule.name,
          description: rule.metadata?.description,
          tags: rule.metadata?.tags,
          version: rule.metadata?.version,
          conditions: rule.conditions,
          actions: rule.actions.filter(a => a.isActive),
          isActive: rule.isActive,
          createdAt: rule.createdAt,
          updatedAt: rule.updatedAt,
        },
      },
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @swagger
 * /api/v1/alert/health:
 *   get:
 *     summary: Comprehensive health check
 *     description: |
 *       Performs a comprehensive health check including API status and Lambda connectivity.
 *       This endpoint is more detailed than the basic `/health` endpoint and verifies
 *       that the system can execute rules properly.
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             example:
 *               success: true
 *               data:
 *                 api: "healthy"
 *                 lambda: "healthy"
 *                 timestamp: "2024-01-15T10:30:00Z"
 *       503:
 *         description: System is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             example:
 *               success: false
 *               data:
 *                 api: "healthy"
 *                 lambda: "unhealthy"
 *                 timestamp: "2024-01-15T10:30:00Z"
 */
router.get('/health',
  optionalAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const lambdaHealthy = await lambdaService.checkLambdaHealth();
    
    const health = {
      api: 'healthy',
      lambda: lambdaHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
    };

    logger.info('Health check performed', {
      apiHealth: health.api,
      lambdaHealth: health.lambda,
      authenticated: !!req.customer,
    });

    res.status(lambdaHealthy ? 200 : 503).json({
      success: lambdaHealthy,
      data: health,
    });
  })
);

/**
 * @swagger
 * /api/v1/alert/test:
 *   post:
 *     summary: Test Lambda connectivity
 *     description: |
 *       Tests the connection to AWS Lambda and verifies that rule execution infrastructure
 *       is working correctly. This is an authenticated endpoint that performs actual
 *       connectivity tests and returns detailed diagnostics.
 *     tags: [System]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lambda connectivity test completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestResponse'
 *             examples:
 *               success:
 *                 summary: Successful test
 *                 value:
 *                   success: true
 *                   data:
 *                     lambdaHealth: "healthy"
 *                     responseTime: 120
 *                     region: "us-east-1"
 *                     version: "1.0.0"
 *                   timestamp: "2024-01-15T10:30:00Z"
 *               failure:
 *                 summary: Failed test
 *                 value:
 *                   success: false
 *                   data:
 *                     lambdaHealth: "unhealthy"
 *                     error: "Connection timeout"
 *                     lastSuccessfulTest: "2024-01-15T09:00:00Z"
 *                   timestamp: "2024-01-15T10:30:00Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/test',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { customer } = req;

    if (!customer) {
      throw createApiError('Authentication required', 401);
    }

    logger.info('Testing Lambda connection', {
      customerId: customer.id,
    });

    const testResult = await lambdaService.testLambdaConnection();

    res.json({
      success: testResult.success,
      data: testResult,
      timestamp: new Date().toISOString(),
    });
  })
);

export default router;