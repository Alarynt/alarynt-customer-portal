import jwt from 'jsonwebtoken';
import { createLogger } from '../utils/logger';
import { Customer, ApiToken } from '../types';
import { createApiError } from '../middleware/errorHandler';
import mongoose from 'mongoose';

const logger = createLogger('AuthService');

// Mock database for customers and API tokens
// In production, this would connect to the same MongoDB instance as alarynt-lambda
const mockCustomers: Customer[] = [
  {
    id: 'customer-1',
    name: 'Acme Corp',
    apiTokens: [
      {
        id: 'token-1',
        token: 'alr_test_123456789abcdef',
        name: 'Production API',
        permissions: ['rule:execute', 'rule:read'],
        isActive: true,
        createdAt: new Date('2024-01-01'),
      }
    ],
    allowedRules: ['rule-1', 'rule-2', 'rule-3'],
    rateLimit: {
      requestsPerMinute: 60,
      requestsPerHour: 1000,
    },
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }
];

export class AuthService {
  private customers: Customer[] = mockCustomers;

  /**
   * Validates an API token and returns the associated customer
   */
  async validateApiToken(token: string): Promise<{ customer: Customer; apiToken: ApiToken }> {
    if (!token) {
      throw createApiError('API token is required', 401);
    }

    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace(/^Bearer\s+/, '');

    logger.info('Validating API token', { 
      tokenPrefix: cleanToken.substring(0, 8) + '...' 
    });

    // Find customer with this token
    for (const customer of this.customers) {
      const apiToken = customer.apiTokens.find(t => 
        t.token === cleanToken && t.isActive
      );

      if (apiToken) {
        // Check if token is expired
        if (apiToken.expiresAt && apiToken.expiresAt < new Date()) {
          throw createApiError('API token has expired', 401);
        }

        // Check if customer is active
        if (!customer.isActive) {
          throw createApiError('Customer account is inactive', 403);
        }

        // Update last used timestamp
        apiToken.lastUsedAt = new Date();

        logger.info('API token validated successfully', {
          customerId: customer.id,
          customerName: customer.name,
          tokenId: apiToken.id,
        });

        return { customer, apiToken };
      }
    }

    throw createApiError('Invalid API token', 401);
  }

  /**
   * Checks if a customer has permission to execute a specific rule
   */
  async hasRulePermission(customer: Customer, ruleId: string): Promise<boolean> {
    if (!customer.allowedRules.includes(ruleId)) {
      logger.warn('Rule access denied', {
        customerId: customer.id,
        ruleId,
        allowedRules: customer.allowedRules,
      });
      return false;
    }

    return true;
  }

  /**
   * Checks rate limits for a customer
   */
  async checkRateLimit(customer: Customer, apiToken: ApiToken): Promise<boolean> {
    // This is a simplified implementation
    // In production, you would use Redis or another store to track usage
    if (!customer.rateLimit) {
      return true;
    }

    logger.info('Rate limit check passed', {
      customerId: customer.id,
      limits: customer.rateLimit,
    });

    return true;
  }

  /**
   * Generates a new API token for a customer (admin function)
   */
  async generateApiToken(customerId: string, tokenName: string): Promise<string> {
    // Generate a secure random token
    const prefix = 'alr_';
    const randomBytes = require('crypto').randomBytes(16).toString('hex');
    const token = `${prefix}${randomBytes}`;

    // In production, save to database
    logger.info('Generated new API token', {
      customerId,
      tokenName,
      tokenPrefix: token.substring(0, 8) + '...',
    });

    return token;
  }
}

export const authService = new AuthService();