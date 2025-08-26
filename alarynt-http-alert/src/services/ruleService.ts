import { createLogger } from '../utils/logger';
import { Rule, Customer } from '../types';
import { createApiError } from '../middleware/errorHandler';

const logger = createLogger('RuleService');

// Mock rules database
// In production, this would connect to the same MongoDB instance as alarynt-lambda
const mockRules: Rule[] = [
  {
    id: 'rule-1',
    name: 'Order Alert Rule',
    customerId: 'customer-1',
    isActive: true,
    conditions: {
      type: 'order',
      threshold: 1000,
      currency: 'USD'
    },
    actions: [
      {
        id: 'action-1',
        type: 'email',
        config: {
          to: 'alerts@acme.com',
          subject: 'High Value Order Alert',
          template: 'order-alert'
        },
        isActive: true
      }
    ],
    metadata: {
      description: 'Sends email alerts for high-value orders',
      tags: ['order', 'alert', 'email'],
      version: '1.0.0'
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'rule-2',
    name: 'Customer Signup Rule',
    customerId: 'customer-1',
    isActive: true,
    conditions: {
      type: 'customer',
      event: 'signup',
      source: 'web'
    },
    actions: [
      {
        id: 'action-2',
        type: 'email',
        config: {
          to: '{{customer.email}}',
          subject: 'Welcome to Acme!',
          template: 'welcome'
        },
        isActive: true
      },
      {
        id: 'action-3',
        type: 'webhook',
        config: {
          url: 'https://api.acme.com/webhooks/customer-signup',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer xyz123'
          }
        },
        isActive: true
      }
    ],
    metadata: {
      description: 'Handles new customer signup workflow',
      tags: ['customer', 'signup', 'email', 'webhook'],
      version: '1.1.0'
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: 'rule-3',
    name: 'Payment Failed Rule',
    customerId: 'customer-1',
    isActive: true,
    conditions: {
      type: 'payment',
      status: 'failed',
      retryCount: { $gt: 2 }
    },
    actions: [
      {
        id: 'action-4',
        type: 'sms',
        config: {
          to: '{{customer.phone}}',
          message: 'Your payment failed. Please update your payment method.'
        },
        isActive: true
      },
      {
        id: 'action-5',
        type: 'database',
        config: {
          collection: 'failed_payments',
          operation: 'insert',
          data: {
            customerId: '{{customer.id}}',
            amount: '{{payment.amount}}',
            reason: '{{payment.failureReason}}',
            timestamp: '{{timestamp}}'
          }
        },
        isActive: true
      }
    ],
    metadata: {
      description: 'Handles failed payment notifications and logging',
      tags: ['payment', 'failure', 'sms', 'database'],
      version: '1.0.0'
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export class RuleService {
  private rules: Rule[] = mockRules;

  /**
   * Finds a rule by ID and validates customer access
   */
  async findRuleById(ruleId: string, customer: Customer): Promise<Rule> {
    logger.info('Looking up rule', { 
      ruleId, 
      customerId: customer.id 
    });

    const rule = this.rules.find(r => r.id === ruleId);
    
    if (!rule) {
      throw createApiError(`Rule not found: ${ruleId}`, 404);
    }

    if (rule.customerId !== customer.id) {
      throw createApiError(`Access denied to rule: ${ruleId}`, 403);
    }

    if (!rule.isActive) {
      throw createApiError(`Rule is inactive: ${ruleId}`, 400);
    }

    logger.info('Rule found and validated', {
      ruleId: rule.id,
      ruleName: rule.name,
      customerId: customer.id,
      actionsCount: rule.actions.length
    });

    return rule;
  }

  /**
   * Validates that a rule can be executed with the given payload
   */
  async validateRuleExecution(rule: Rule, payload: Record<string, any>): Promise<boolean> {
    logger.info('Validating rule execution', {
      ruleId: rule.id,
      payloadKeys: Object.keys(payload)
    });

    // Basic validation - in production you might have more complex validation logic
    if (!payload || typeof payload !== 'object') {
      throw createApiError('Invalid payload: must be a valid JSON object', 400);
    }

    // Check if rule has active actions
    const activeActions = rule.actions.filter(action => action.isActive);
    if (activeActions.length === 0) {
      throw createApiError(`Rule has no active actions: ${rule.id}`, 400);
    }

    // Validate payload against rule conditions (simplified)
    if (rule.conditions && rule.conditions.type) {
      const requiredType = rule.conditions.type;
      if (!payload.type || payload.type !== requiredType) {
        logger.warn('Payload type mismatch', {
          ruleId: rule.id,
          expected: requiredType,
          received: payload.type
        });
      }
    }

    logger.info('Rule execution validation passed', {
      ruleId: rule.id,
      activeActions: activeActions.length
    });

    return true;
  }

  /**
   * Gets all rules for a customer (for admin/debugging purposes)
   */
  async getCustomerRules(customer: Customer): Promise<Rule[]> {
    const customerRules = this.rules.filter(rule => 
      rule.customerId === customer.id && rule.isActive
    );

    logger.info('Retrieved customer rules', {
      customerId: customer.id,
      rulesCount: customerRules.length
    });

    return customerRules;
  }

  /**
   * Transforms rule data for Lambda execution
   */
  prepareLambdaPayload(rule: Rule, payload: Record<string, any>, metadata?: any) {
    return {
      source: 'custom',
      'detail-type': 'HTTP Alert Trigger',
      detail: {
        ruleId: rule.id,
        ruleName: rule.name,
        customerId: rule.customerId,
        payload,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'alarynt-http-alert',
          ...metadata
        },
        rule: {
          conditions: rule.conditions,
          actions: rule.actions.filter(action => action.isActive)
        }
      }
    };
  }
}

export const ruleService = new RuleService();