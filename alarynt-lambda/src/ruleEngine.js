/**
 * Rule Engine for Alarynt Lambda
 * 
 * This module handles rule evaluation, DSL parsing, and action execution
 * coordination for the Alarynt rule engine system.
 */

const { v4: uuidv4 } = require('uuid');
const DatabaseManager = require('./database');
const ActionExecutor = require('./actionExecutor');

class RuleEngine {
  constructor(options = {}) {
    this.executionId = options.executionId || uuidv4();
    this.logger = options.logger;
    this.dbConnection = options.dbConnection;
    this.actionExecutor = new ActionExecutor({ 
      logger: this.logger,
      executionId: this.executionId 
    });
  }

  /**
   * Get active rules based on filters
   * @param {object} filters - MongoDB query filters
   * @param {number} limit - Maximum number of rules to return
   * @returns {Promise<Array>} - Array of active rules
   */
  async getActiveRules(filters = {}, limit = 100) {
    try {
      this.logger?.debug('Fetching active rules', { filters, limit });
      return await DatabaseManager.queryHelpers.getActiveRules(filters, limit);
    } catch (error) {
      this.logger?.error('Failed to get active rules', { error: error.message });
      throw error;
    }
  }

  /**
   * Get rule by ID
   * @param {string} ruleId - Rule identifier
   * @returns {Promise<object>} - Rule object
   */
  async getRuleById(ruleId) {
    try {
      return await DatabaseManager.queryHelpers.getRuleById(ruleId);
    } catch (error) {
      this.logger?.error('Failed to get rule by ID', { ruleId, error: error.message });
      throw error;
    }
  }

  /**
   * Get rules by event type (using tags)
   * @param {string} eventType - Event type to filter by
   * @returns {Promise<Array>} - Array of matching rules
   */
  async getRulesByEventType(eventType) {
    try {
      return await DatabaseManager.queryHelpers.getRulesByTags([eventType, `event:${eventType}`]);
    } catch (error) {
      this.logger?.error('Failed to get rules by event type', { eventType, error: error.message });
      throw error;
    }
  }

  /**
   * Get customer data
   * @param {string} customerId - Customer identifier
   * @returns {Promise<object>} - Customer object
   */
  async getCustomer(customerId) {
    try {
      return await DatabaseManager.queryHelpers.getCustomer(customerId);
    } catch (error) {
      this.logger?.error('Failed to get customer', { customerId, error: error.message });
      throw error;
    }
  }

  /**
   * Get order data
   * @param {string} orderId - Order identifier
   * @returns {Promise<object>} - Order object
   */
  async getOrder(orderId) {
    try {
      return await DatabaseManager.queryHelpers.getOrder(orderId);
    } catch (error) {
      this.logger?.error('Failed to get order', { orderId, error: error.message });
      throw error;
    }
  }

  /**
   * Get product data
   * @param {string} productId - Product identifier
   * @returns {Promise<object>} - Product object
   */
  async getProduct(productId) {
    try {
      return await DatabaseManager.queryHelpers.getProduct(productId);
    } catch (error) {
      this.logger?.error('Failed to get product', { productId, error: error.message });
      throw error;
    }
  }

  /**
   * Execute multiple rules with given context
   * @param {Array} rules - Array of rule objects
   * @param {object} context - Execution context
   * @returns {Promise<Array>} - Array of execution results
   */
  async executeRules(rules, context = {}) {
    if (!Array.isArray(rules) || rules.length === 0) {
      this.logger?.info('No rules to execute');
      return [];
    }

    this.logger?.info('Starting rule execution batch', { 
      ruleCount: rules.length,
      executionId: this.executionId,
      triggerType: context.triggerType 
    });

    const results = [];
    
    for (const rule of rules) {
      try {
        const result = await this.executeRule(rule, context);
        results.push(result);
      } catch (error) {
        this.logger?.error('Rule execution failed', { 
          ruleId: rule.id || rule._id,
          error: error.message 
        });
        
        results.push({
          ruleId: rule.id || rule._id,
          status: 'failed',
          error: error.message,
          actionsExecuted: 0
        });
      }
    }

    this.logger?.info('Rule execution batch completed', { 
      totalRules: rules.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length
    });

    return results;
  }

  /**
   * Execute a single rule
   * @param {object} rule - Rule object
   * @param {object} context - Execution context
   * @returns {Promise<object>} - Execution result
   */
  async executeRule(rule, context = {}) {
    const startTime = Date.now();
    const ruleId = rule.id || rule._id;
    
    this.logger?.logRuleExecutionStart(ruleId, {
      ...context,
      executionId: this.executionId
    });

    try {
      // Create execution record
      const executionData = {
        ruleId: rule._id || rule.id,
        executionId: `${this.executionId}_${ruleId}`,
        triggeredBy: {
          eventType: context.triggerType || 'manual',
          eventData: context.eventData || {}
        },
        startTime: new Date(),
        status: 'running'
      };

      // Evaluate rule conditions
      const conditionResult = await this.evaluateRuleConditions(rule, context);
      executionData.conditions = conditionResult.conditions;

      let actionsExecuted = 0;
      let actionResults = [];

      if (conditionResult.passed) {
        this.logger?.info('Rule conditions passed, executing actions', { ruleId });
        
        // Extract actions from DSL or rule configuration
        const actions = await this.extractActionsFromRule(rule, context);
        
        // Execute actions
        for (const actionConfig of actions) {
          try {
            const actionResult = await this.actionExecutor.executeAction(actionConfig, context);
            actionResults.push(actionResult);
            if (actionResult.success) {
              actionsExecuted++;
            }
          } catch (error) {
            this.logger?.error('Action execution failed', { 
              ruleId, 
              actionId: actionConfig.id,
              error: error.message 
            });
            
            actionResults.push({
              actionId: actionConfig.id,
              success: false,
              error: error.message
            });
          }
        }
      } else {
        this.logger?.info('Rule conditions not met, skipping actions', { ruleId });
      }

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Update execution record
      executionData.endTime = new Date();
      executionData.totalResponseTime = executionTime;
      executionData.status = conditionResult.passed ? (actionsExecuted > 0 ? 'success' : 'partial_success') : 'skipped';
      executionData.actionsExecuted = actionResults;

      // Save execution record
      await DatabaseManager.queryHelpers.createRuleExecution(executionData);

      // Update rule performance metrics
      await DatabaseManager.queryHelpers.updateRulePerformance(
        ruleId,
        executionTime,
        executionData.status === 'success'
      );

      // Log activity
      await DatabaseManager.queryHelpers.logActivity({
        type: conditionResult.passed ? 'rule_triggered' : 'rule_evaluated',
        message: `Rule "${rule.name}" ${conditionResult.passed ? 'triggered and executed' : 'evaluated but conditions not met'}`,
        status: 'success',
        ruleName: rule.name,
        ruleId: rule._id || rule.id,
        details: `Execution time: ${executionTime}ms, Actions executed: ${actionsExecuted}`
      });

      const result = {
        ruleId,
        status: executionData.status,
        conditionsPassed: conditionResult.passed,
        actionsExecuted,
        executionTime,
        actionResults
      };

      this.logger?.logRuleExecutionEnd(ruleId, { success: true, ...result }, executionTime);
      
      return result;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      this.logger?.logRuleExecutionEnd(ruleId, { success: false, error: error.message }, executionTime);
      
      // Log failed activity
      await DatabaseManager.queryHelpers.logActivity({
        type: 'rule_execution_failed',
        message: `Rule "${rule.name}" execution failed: ${error.message}`,
        status: 'error',
        ruleName: rule.name,
        ruleId: rule._id || rule.id,
        details: error.stack
      });

      throw error;
    }
  }

  /**
   * Evaluate rule conditions using DSL
   * @param {object} rule - Rule object
   * @param {object} context - Execution context
   * @returns {Promise<object>} - Evaluation result
   */
  async evaluateRuleConditions(rule, context) {
    try {
      const dsl = rule.dsl;
      const conditions = [];
      let passed = true;

      if (!dsl) {
        this.logger?.warn('Rule has no DSL defined', { ruleId: rule.id || rule._id });
        return { passed: true, conditions: [] };
      }

      // Parse DSL and evaluate conditions
      const parsedDSL = this.parseDSL(dsl);
      
      for (const condition of parsedDSL.conditions) {
        const evaluationResult = await this.evaluateCondition(condition, context);
        conditions.push({
          condition: condition.expression,
          result: evaluationResult.result,
          evaluatedAt: new Date(),
          value: evaluationResult.value
        });

        if (!evaluationResult.result) {
          passed = false;
        }
      }

      return { passed, conditions };

    } catch (error) {
      this.logger?.error('Failed to evaluate rule conditions', { 
        ruleId: rule.id || rule._id,
        error: error.message 
      });
      
      return { 
        passed: false, 
        conditions: [{ 
          condition: 'evaluation_error',
          result: false,
          evaluatedAt: new Date(),
          error: error.message
        }]
      };
    }
  }

  /**
   * Parse DSL string into structured format
   * @param {string} dsl - DSL string
   * @returns {object} - Parsed DSL structure
   */
  parseDSL(dsl) {
    try {
      const lines = dsl.split('\n').map(line => line.trim()).filter(line => line);
      const conditions = [];
      const actions = [];

      let parsingConditions = true;

      for (const line of lines) {
        if (line.startsWith('WHEN ') && parsingConditions) {
          conditions.push({
            type: 'WHEN',
            expression: line.substring(5).trim(),
            operator: 'initial'
          });
        } else if (line.startsWith('AND ') && parsingConditions) {
          conditions.push({
            type: 'AND',
            expression: line.substring(4).trim(),
            operator: 'and'
          });
        } else if (line.startsWith('OR ') && parsingConditions) {
          conditions.push({
            type: 'OR',
            expression: line.substring(3).trim(),
            operator: 'or'
          });
        } else if (line.startsWith('THEN ')) {
          parsingConditions = false;
          actions.push({
            type: 'THEN',
            expression: line.substring(5).trim()
          });
        } else if (line.startsWith('AND ') && !parsingConditions) {
          actions.push({
            type: 'AND',
            expression: line.substring(4).trim()
          });
        }
      }

      return { conditions, actions };
    } catch (error) {
      this.logger?.error('Failed to parse DSL', { dsl, error: error.message });
      throw new Error(`DSL parsing failed: ${error.message}`);
    }
  }

  /**
   * Evaluate a single condition
   * @param {object} condition - Condition object
   * @param {object} context - Execution context
   * @returns {Promise<object>} - Evaluation result
   */
  async evaluateCondition(condition, context) {
    try {
      const expression = condition.expression;
      
      // Replace variables in expression with actual values
      const evaluatedExpression = await this.interpolateVariables(expression, context);
      
      // Simple expression evaluation
      const result = this.evaluateExpression(evaluatedExpression);

      return {
        result: Boolean(result),
        value: result,
        originalExpression: expression,
        evaluatedExpression
      };

    } catch (error) {
      this.logger?.error('Failed to evaluate condition', { 
        condition: condition.expression,
        error: error.message 
      });
      
      return {
        result: false,
        error: error.message,
        originalExpression: condition.expression
      };
    }
  }

  /**
   * Interpolate variables in expression with context values
   * @param {string} expression - Expression with variables
   * @param {object} context - Execution context
   * @returns {Promise<string>} - Expression with interpolated values
   */
  async interpolateVariables(expression, context) {
    let interpolated = expression;

    // Replace context variables
    const variableRegex = /(\w+)\.(\w+)/g;
    let match;

    while ((match = variableRegex.exec(expression)) !== null) {
      const [fullMatch, objectName, propertyName] = match;
      let value = null;

      // Get value from context or database
      switch (objectName) {
        case 'customer':
          if (context.customer) {
            value = this.getNestedProperty(context.customer, propertyName);
          }
          break;
        case 'order':
          if (context.order) {
            value = this.getNestedProperty(context.order, propertyName);
          }
          break;
        case 'product':
          if (context.product) {
            value = this.getNestedProperty(context.product, propertyName);
          }
          break;
        case 'event':
          if (context.eventData) {
            value = this.getNestedProperty(context.eventData, propertyName);
          }
          break;
        default:
          // Try to get from context directly
          if (context[objectName]) {
            value = this.getNestedProperty(context[objectName], propertyName);
          }
      }

      if (value !== null && value !== undefined) {
        // Handle string values in expressions
        const replacement = typeof value === 'string' ? `"${value}"` : value;
        interpolated = interpolated.replace(fullMatch, replacement);
      }
    }

    return interpolated;
  }

  /**
   * Get nested property from object
   * @param {object} obj - Object to get property from
   * @param {string} path - Property path (supports dot notation)
   * @returns {any} - Property value
   */
  getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  /**
   * Evaluate simple expressions (basic arithmetic and comparisons)
   * @param {string} expression - Expression to evaluate
   * @returns {any} - Evaluation result
   */
  evaluateExpression(expression) {
    try {
      // Security: Only allow safe expressions
      const safeExpression = expression.replace(/[^0-9a-zA-Z\s+\-*/%()>=<!="'.]/g, '');
      
      // Use Function constructor for safe evaluation
      return Function(`"use strict"; return (${safeExpression})`)();
    } catch (error) {
      this.logger?.warn('Expression evaluation failed', { expression, error: error.message });
      return false;
    }
  }

  /**
   * Extract actions from rule DSL
   * @param {object} rule - Rule object
   * @param {object} context - Execution context
   * @returns {Promise<Array>} - Array of action configurations
   */
  async extractActionsFromRule(rule, context) {
    try {
      const parsedDSL = this.parseDSL(rule.dsl);
      const actionConfigs = [];

      for (const action of parsedDSL.actions) {
        const actionConfig = await this.parseActionExpression(action.expression, context);
        if (actionConfig) {
          actionConfigs.push(actionConfig);
        }
      }

      return actionConfigs;
    } catch (error) {
      this.logger?.error('Failed to extract actions from rule', { 
        ruleId: rule.id || rule._id,
        error: error.message 
      });
      return [];
    }
  }

  /**
   * Parse action expression into action configuration
   * @param {string} expression - Action expression
   * @param {object} context - Execution context
   * @returns {Promise<object>} - Action configuration
   */
  async parseActionExpression(expression, context) {
    try {
      // Parse function-like syntax: function_name(param1: "value1", param2: "value2")
      const functionMatch = expression.match(/(\w+)\s*\((.*)\)/);
      
      if (!functionMatch) {
        this.logger?.warn('Unable to parse action expression', { expression });
        return null;
      }

      const [, functionName, paramsString] = functionMatch;
      const params = this.parseParameters(paramsString);

      // Interpolate variables in parameters
      for (const key in params) {
        if (typeof params[key] === 'string') {
          params[key] = await this.interpolateVariables(params[key], context);
          // Remove quotes from string values
          params[key] = params[key].replace(/^"(.*)"$/, '$1');
        }
      }

      // Map function names to action types
      const actionTypeMap = {
        'send_email': 'email',
        'send_sms': 'sms',
        'call_webhook': 'webhook',
        'update_database': 'database',
        'send_notification': 'notification'
      };

      const actionType = actionTypeMap[functionName] || functionName;

      return {
        id: `${functionName}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        type: actionType,
        config: params,
        source: 'dsl'
      };

    } catch (error) {
      this.logger?.error('Failed to parse action expression', { expression, error: error.message });
      return null;
    }
  }

  /**
   * Parse parameter string into object
   * @param {string} paramsString - Parameter string
   * @returns {object} - Parsed parameters
   */
  parseParameters(paramsString) {
    const params = {};
    
    if (!paramsString.trim()) {
      return params;
    }

    // Simple parameter parsing (supports key: "value" format)
    const paramRegex = /(\w+):\s*"([^"]*)"/g;
    let match;

    while ((match = paramRegex.exec(paramsString)) !== null) {
      const [, key, value] = match;
      params[key] = value;
    }

    return params;
  }
}

module.exports = RuleEngine;