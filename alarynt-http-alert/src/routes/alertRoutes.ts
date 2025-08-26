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
 * POST /api/v1/alert/rule/:ruleId
 * Trigger a specific rule with the provided payload
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
 * POST /api/v1/alert/rule/:ruleId/async
 * Trigger a specific rule asynchronously (fire-and-forget)
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
 * GET /api/v1/alert/rules
 * List all rules available to the customer
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
 * GET /api/v1/alert/rule/:ruleId
 * Get details of a specific rule
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
 * GET /api/v1/alert/health
 * Health check endpoint that also checks Lambda connectivity
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
 * POST /api/v1/alert/test
 * Test Lambda connectivity (authenticated endpoint)
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