/**
 * Validation utilities for Alarynt Lambda
 * 
 * This module provides validation functions for Lambda events,
 * rule configurations, and action parameters.
 */

const Joi = require('joi');

// Event validation schemas
const eventSchemas = {
  // EventBridge scheduled event
  scheduled: Joi.object({
    source: Joi.string().required().valid('aws.events'),
    'detail-type': Joi.string().optional(),
    detail: Joi.object().optional(),
    time: Joi.string().isoDate().optional(),
    region: Joi.string().optional(),
    resources: Joi.array().optional()
  }).unknown(true),

  // API Gateway event
  api: Joi.object({
    source: Joi.string().required().valid('aws.apigateway'),
    httpMethod: Joi.string().optional(),
    path: Joi.string().optional(),
    body: Joi.string().optional(),
    headers: Joi.object().optional(),
    queryStringParameters: Joi.object().optional(),
    pathParameters: Joi.object().optional()
  }).unknown(true),

  // S3 event
  s3: Joi.object({
    source: Joi.string().required().valid('aws.s3'),
    Records: Joi.array().items(
      Joi.object({
        eventName: Joi.string().required(),
        eventSource: Joi.string().required(),
        s3: Joi.object({
          bucket: Joi.object({
            name: Joi.string().required()
          }),
          object: Joi.object({
            key: Joi.string().required(),
            size: Joi.number().optional()
          })
        })
      })
    ).min(1).required()
  }),

  // Custom application event
  custom: Joi.object({
    source: Joi.string().required().valid('custom'),
    eventType: Joi.string().required(),
    data: Joi.object().optional(),
    ruleFilters: Joi.object().optional(),
    context: Joi.object().optional()
  })
};

// Rule validation schema
const ruleSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  dsl: Joi.string().required(),
  status: Joi.string().required().valid('active', 'inactive', 'draft'),
  priority: Joi.number().min(1).required(),
  tags: Joi.array().items(Joi.string()).optional(),
  createdBy: Joi.alternatives([Joi.string(), Joi.object()]).required()
});

// Action configuration schemas
const actionConfigSchemas = {
  email: Joi.object({
    to: Joi.alternatives([Joi.string().email(), Joi.array().items(Joi.string().email())]).required(),
    cc: Joi.alternatives([Joi.string().email(), Joi.array().items(Joi.string().email())]).optional(),
    bcc: Joi.alternatives([Joi.string().email(), Joi.array().items(Joi.string().email())]).optional(),
    subject: Joi.string().required(),
    body: Joi.string().optional(),
    html: Joi.string().optional(),
    template: Joi.string().optional()
  }),

  sms: Joi.object({
    to: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(), // E.164 format
    message: Joi.string().max(1600).required()
  }),

  webhook: Joi.object({
    url: Joi.string().uri().required(),
    method: Joi.string().valid('GET', 'POST', 'PUT', 'PATCH', 'DELETE').default('POST'),
    headers: Joi.object().optional(),
    body: Joi.alternatives([Joi.string(), Joi.object()]).optional(),
    timeout: Joi.number().min(1000).max(300000).default(30000)
  }),

  database: Joi.object({
    operation: Joi.string().required().valid('create', 'insert', 'update', 'delete', 'find', 'query'),
    collection: Joi.string().required(),
    filter: Joi.object().optional(),
    update: Joi.object().optional(),
    data: Joi.object().optional()
  }),

  notification: Joi.object({
    topic: Joi.string().optional(),
    subject: Joi.string().required(),
    message: Joi.string().required(),
    target: Joi.string().valid('sns', 'database').default('sns')
  })
};

/**
 * Validate incoming Lambda event
 * @param {object} event - Lambda event object
 * @returns {object} - Validation result
 */
function validateEvent(event) {
  try {
    // Determine event type from source
    const source = event.source;
    let schema;

    switch (source) {
      case 'aws.events':
        schema = eventSchemas.scheduled;
        break;
      case 'aws.apigateway':
        schema = eventSchemas.api;
        break;
      case 'aws.s3':
        schema = eventSchemas.s3;
        break;
      case 'custom':
        schema = eventSchemas.custom;
        break;
      default:
        return {
          isValid: false,
          error: `Unsupported event source: ${source}`
        };
    }

    const { error, value } = schema.validate(event);
    
    if (error) {
      return {
        isValid: false,
        error: error.details[0].message,
        details: error.details
      };
    }

    // Additional validation for API Gateway events
    if (source === 'aws.apigateway' && event.body) {
      const bodyValidation = validateApiRequestBody(event.body);
      if (!bodyValidation.isValid) {
        return bodyValidation;
      }
    }

    return {
      isValid: true,
      value
    };

  } catch (error) {
    return {
      isValid: false,
      error: `Validation error: ${error.message}`
    };
  }
}

/**
 * Validate API Gateway request body
 * @param {string} bodyString - JSON string body
 * @returns {object} - Validation result
 */
function validateApiRequestBody(bodyString) {
  try {
    const body = JSON.parse(bodyString);
    
    const apiBodySchema = Joi.object({
      ruleId: Joi.string().optional(),
      customerId: Joi.string().optional(),
      orderId: Joi.string().optional(),
      productId: Joi.string().optional(),
      eventType: Joi.string().optional(),
      data: Joi.object().optional(),
      filters: Joi.object().optional()
    });

    const { error, value } = apiBodySchema.validate(body);
    
    if (error) {
      return {
        isValid: false,
        error: `Request body validation failed: ${error.details[0].message}`
      };
    }

    return {
      isValid: true,
      value
    };

  } catch (parseError) {
    return {
      isValid: false,
      error: `Invalid JSON in request body: ${parseError.message}`
    };
  }
}

/**
 * Validate rule object
 * @param {object} rule - Rule object to validate
 * @returns {object} - Validation result
 */
function validateRule(rule) {
  try {
    const { error, value } = ruleSchema.validate(rule);
    
    if (error) {
      return {
        isValid: false,
        error: error.details[0].message,
        details: error.details
      };
    }

    // Additional DSL validation
    const dslValidation = validateDSL(rule.dsl);
    if (!dslValidation.isValid) {
      return {
        isValid: false,
        error: `DSL validation failed: ${dslValidation.error}`
      };
    }

    return {
      isValid: true,
      value
    };

  } catch (error) {
    return {
      isValid: false,
      error: `Rule validation error: ${error.message}`
    };
  }
}

/**
 * Validate DSL syntax
 * @param {string} dsl - DSL string
 * @returns {object} - Validation result
 */
function validateDSL(dsl) {
  try {
    if (!dsl || typeof dsl !== 'string') {
      return {
        isValid: false,
        error: 'DSL must be a non-empty string'
      };
    }

    const lines = dsl.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length === 0) {
      return {
        isValid: false,
        error: 'DSL cannot be empty'
      };
    }

    let hasWhen = false;
    let hasThen = false;
    let inConditions = true;

    for (const line of lines) {
      if (line.startsWith('WHEN ')) {
        if (!inConditions || hasWhen) {
          return {
            isValid: false,
            error: 'DSL can only have one WHEN clause at the beginning'
          };
        }
        hasWhen = true;
      } else if (line.startsWith('AND ')) {
        // AND can be in conditions or actions
        continue;
      } else if (line.startsWith('OR ')) {
        if (!inConditions) {
          return {
            isValid: false,
            error: 'OR clauses can only be used in conditions'
          };
        }
      } else if (line.startsWith('THEN ')) {
        if (!hasWhen) {
          return {
            isValid: false,
            error: 'THEN clause must come after WHEN clause'
          };
        }
        inConditions = false;
        hasThen = true;
      } else {
        return {
          isValid: false,
          error: `Invalid DSL line: ${line}`
        };
      }
    }

    if (!hasWhen || !hasThen) {
      return {
        isValid: false,
        error: 'DSL must have both WHEN and THEN clauses'
      };
    }

    return { isValid: true };

  } catch (error) {
    return {
      isValid: false,
      error: `DSL parsing error: ${error.message}`
    };
  }
}

/**
 * Validate action configuration
 * @param {object} actionConfig - Action configuration object
 * @returns {object} - Validation result
 */
function validateActionConfig(actionConfig) {
  try {
    if (!actionConfig || typeof actionConfig !== 'object') {
      return {
        isValid: false,
        error: 'Action configuration must be an object'
      };
    }

    const { type, config } = actionConfig;
    
    if (!type) {
      return {
        isValid: false,
        error: 'Action type is required'
      };
    }

    if (!config || typeof config !== 'object') {
      return {
        isValid: false,
        error: 'Action config is required and must be an object'
      };
    }

    const schema = actionConfigSchemas[type];
    if (!schema) {
      return {
        isValid: false,
        error: `Unsupported action type: ${type}`
      };
    }

    const { error, value } = schema.validate(config);
    
    if (error) {
      return {
        isValid: false,
        error: `Action config validation failed: ${error.details[0].message}`,
        details: error.details
      };
    }

    return {
      isValid: true,
      value: { ...actionConfig, config: value }
    };

  } catch (error) {
    return {
      isValid: false,
      error: `Action validation error: ${error.message}`
    };
  }
}

/**
 * Validate execution context
 * @param {object} context - Execution context
 * @returns {object} - Validation result
 */
function validateExecutionContext(context) {
  try {
    const contextSchema = Joi.object({
      triggerType: Joi.string().valid('scheduled', 'api', 's3', 'custom').required(),
      eventData: Joi.object().optional(),
      customer: Joi.object().optional(),
      order: Joi.object().optional(),
      product: Joi.object().optional(),
      executionId: Joi.string().optional()
    }).unknown(true);

    const { error, value } = contextSchema.validate(context);
    
    if (error) {
      return {
        isValid: false,
        error: error.details[0].message
      };
    }

    return {
      isValid: true,
      value
    };

  } catch (error) {
    return {
      isValid: false,
      error: `Context validation error: ${error.message}`
    };
  }
}

/**
 * Sanitize input to prevent injection attacks
 * @param {string} input - Input string to sanitize
 * @returns {string} - Sanitized string
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }

  // Remove potentially dangerous characters and patterns
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/['"]/g, '') // Remove quotes to prevent injection
    .trim();
}

/**
 * Validate environment configuration
 * @returns {object} - Validation result
 */
function validateEnvironment() {
  const errors = [];
  const warnings = [];

  // Check required environment variables
  const requiredEnvVars = ['MONGODB_URI'];
  const optionalEnvVars = [
    'AWS_REGION',
    'LOG_LEVEL',
    'EMAIL_PROVIDER',
    'FROM_EMAIL',
    'SMTP_HOST'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`);
    }
  }

  // Check MongoDB URI format
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.startsWith('mongodb://') && !process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
    errors.push('MONGODB_URI must be a valid MongoDB connection string');
  }

  // Check email configuration
  if (process.env.EMAIL_PROVIDER === 'smtp') {
    if (!process.env.SMTP_HOST) {
      errors.push('SMTP_HOST is required when EMAIL_PROVIDER is set to "smtp"');
    }
  }

  // Warnings for missing optional variables
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      warnings.push(`Optional environment variable not set: ${envVar}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

module.exports = {
  validateEvent,
  validateApiRequestBody,
  validateRule,
  validateDSL,
  validateActionConfig,
  validateExecutionContext,
  sanitizeInput,
  validateEnvironment
};