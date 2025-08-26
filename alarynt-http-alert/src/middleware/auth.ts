import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { createApiError, asyncHandler } from './errorHandler';
import { AuthenticatedRequest } from '../types';
import { createLogger } from '../utils/logger';

const logger = createLogger('AuthMiddleware');

/**
 * Authentication middleware that validates API tokens
 */
export const authenticate = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    throw createApiError('Authorization header is required', 401);
  }

  const token = authHeader.replace(/^Bearer\s+/, '');
  
  if (!token) {
    throw createApiError('API token is required', 401);
  }

  try {
    const { customer, apiToken } = await authService.validateApiToken(token);
    
    // Check rate limits
    const withinLimits = await authService.checkRateLimit(customer, apiToken);
    if (!withinLimits) {
      throw createApiError('Rate limit exceeded', 429);
    }

    // Attach customer and token info to request
    req.customer = customer;
    req.apiToken = apiToken;

    logger.info('Authentication successful', {
      customerId: customer.id,
      customerName: customer.name,
      tokenId: apiToken.id,
      requestPath: req.path,
      requestMethod: req.method,
    });

    next();
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    
    throw createApiError('Authentication failed', 401);
  }
});

/**
 * Middleware to check if customer has permission to access a specific rule
 */
export const authorizeRule = (getRuleId: (req: Request) => string) => {
  return asyncHandler(async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const ruleId = getRuleId(req);
    const customer = req.customer;

    if (!customer) {
      throw createApiError('Authentication required', 401);
    }

    const hasPermission = await authService.hasRulePermission(customer, ruleId);
    
    if (!hasPermission) {
      logger.warn('Rule access denied', {
        customerId: customer.id,
        ruleId,
        requestPath: req.path,
      });
      
      throw createApiError(`Access denied to rule: ${ruleId}`, 403);
    }

    logger.info('Rule authorization successful', {
      customerId: customer.id,
      ruleId,
      requestPath: req.path,
    });

    next();
  });
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return next();
  }

  const token = authHeader.replace(/^Bearer\s+/, '');
  
  if (!token) {
    return next();
  }

  try {
    const { customer, apiToken } = await authService.validateApiToken(token);
    req.customer = customer;
    req.apiToken = apiToken;
    
    logger.info('Optional authentication successful', {
      customerId: customer.id,
      tokenId: apiToken.id,
    });
  } catch (error: any) {
    logger.warn('Optional authentication failed', {
      error: error.message,
      tokenPrefix: token.substring(0, 8) + '...',
    });
  }

  next();
});