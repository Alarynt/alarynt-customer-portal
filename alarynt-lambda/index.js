/**
 * Alarynt Lambda Function - Rule Engine
 * 
 * This AWS Lambda function executes business rules and their associated actions
 * based on triggered events or scheduled execution.
 */

const mongoose = require('mongoose');
const RuleEngine = require('./src/ruleEngine');
const DatabaseManager = require('./src/database');
const Logger = require('./src/logger');
const { validateEvent } = require('./src/validation');

// Initialize logger
const logger = new Logger();

// Global database connection
let dbConnection = null;

/**
 * Main Lambda handler
 * @param {Object} event - Lambda event object
 * @param {Object} context - Lambda context object
 * @returns {Object} Lambda response
 */
exports.handler = async (event, context) => {
  // Set Lambda context timeout buffer
  context.callbackWaitsForEmptyEventLoop = false;
  
  const startTime = Date.now();
  const executionId = context.awsRequestId;
  
  logger.info('Lambda execution started', {
    executionId,
    event: event.source || 'unknown',
    timestamp: new Date().toISOString()
  });

  try {
    // Validate incoming event
    const validationResult = validateEvent(event);
    if (!validationResult.isValid) {
      throw new Error(`Invalid event: ${validationResult.error}`);
    }

    // Initialize database connection if not already connected
    if (!dbConnection || mongoose.connection.readyState !== 1) {
      dbConnection = await DatabaseManager.connect();
      logger.info('Database connection established', { executionId });
    }

    // Initialize Rule Engine
    const ruleEngine = new RuleEngine({
      executionId,
      logger,
      dbConnection
    });

    let result;
    
    // Handle different event types
    switch (event.source) {
      case 'aws.events': // EventBridge scheduled execution
        result = await handleScheduledExecution(ruleEngine, event, executionId);
        break;
      
      case 'aws.apigateway': // API Gateway triggered execution
        result = await handleAPIExecution(ruleEngine, event, executionId);
        break;
      
      case 'aws.s3': // S3 triggered execution
        result = await handleS3Execution(ruleEngine, event, executionId);
        break;
      
      case 'custom': // Custom application triggered execution
        result = await handleCustomExecution(ruleEngine, event, executionId);
        break;
      
      default:
        throw new Error(`Unsupported event source: ${event.source}`);
    }

    const executionTime = Date.now() - startTime;
    
    logger.info('Lambda execution completed successfully', {
      executionId,
      executionTime,
      rulesExecuted: result.rulesExecuted || 0,
      actionsExecuted: result.actionsExecuted || 0,
      successRate: result.successRate || 100
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        executionId,
        executionTime,
        result
      })
    };

  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    logger.error('Lambda execution failed', {
      executionId,
      error: error.message,
      stack: error.stack,
      executionTime
    });

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        executionId,
        error: error.message,
        executionTime
      })
    };
  }
};

/**
 * Handle scheduled rule execution (EventBridge)
 */
async function handleScheduledExecution(ruleEngine, event, executionId) {
  logger.info('Handling scheduled execution', { executionId });
  
  const rules = await ruleEngine.getActiveRules({
    priority: { $gte: 1 },
    status: 'active'
  });

  const results = await ruleEngine.executeRules(rules, {
    triggerType: 'scheduled',
    eventData: event.detail || {}
  });

  return {
    type: 'scheduled',
    rulesExecuted: results.length,
    actionsExecuted: results.reduce((sum, r) => sum + (r.actionsExecuted || 0), 0),
    successRate: calculateSuccessRate(results),
    results
  };
}

/**
 * Handle API Gateway triggered execution
 */
async function handleAPIExecution(ruleEngine, event, executionId) {
  logger.info('Handling API execution', { executionId });
  
  const requestBody = JSON.parse(event.body || '{}');
  const { ruleId, customerId, orderId, productId, eventType } = requestBody;

  let context = {
    triggerType: 'api',
    eventData: requestBody
  };

  // Build execution context based on provided IDs
  if (customerId) {
    context.customer = await ruleEngine.getCustomer(customerId);
  }
  if (orderId) {
    context.order = await ruleEngine.getOrder(orderId);
  }
  if (productId) {
    context.product = await ruleEngine.getProduct(productId);
  }

  let rules;
  if (ruleId) {
    // Execute specific rule
    rules = await ruleEngine.getRuleById(ruleId);
    rules = rules ? [rules] : [];
  } else {
    // Execute rules based on event type
    rules = await ruleEngine.getRulesByEventType(eventType);
  }

  const results = await ruleEngine.executeRules(rules, context);

  return {
    type: 'api',
    rulesExecuted: results.length,
    actionsExecuted: results.reduce((sum, r) => sum + (r.actionsExecuted || 0), 0),
    successRate: calculateSuccessRate(results),
    results
  };
}

/**
 * Handle S3 triggered execution
 */
async function handleS3Execution(ruleEngine, event, executionId) {
  logger.info('Handling S3 execution', { executionId });
  
  const s3Record = event.Records[0].s3;
  const bucket = s3Record.bucket.name;
  const key = s3Record.object.key;
  const eventName = event.Records[0].eventName;

  const context = {
    triggerType: 's3',
    eventData: {
      bucket,
      key,
      eventName,
      size: s3Record.object.size
    }
  };

  // Get rules that respond to S3 events
  const rules = await ruleEngine.getRulesByEventType('s3_event');

  const results = await ruleEngine.executeRules(rules, context);

  return {
    type: 's3',
    bucket,
    key,
    rulesExecuted: results.length,
    actionsExecuted: results.reduce((sum, r) => sum + (r.actionsExecuted || 0), 0),
    successRate: calculateSuccessRate(results),
    results
  };
}

/**
 * Handle custom application triggered execution
 */
async function handleCustomExecution(ruleEngine, event, executionId) {
  logger.info('Handling custom execution', { executionId });
  
  const { eventType, data, ruleFilters } = event;

  const context = {
    triggerType: 'custom',
    eventData: data || {}
  };

  let rules;
  if (ruleFilters) {
    rules = await ruleEngine.getActiveRules(ruleFilters);
  } else {
    rules = await ruleEngine.getRulesByEventType(eventType);
  }

  const results = await ruleEngine.executeRules(rules, context);

  return {
    type: 'custom',
    eventType,
    rulesExecuted: results.length,
    actionsExecuted: results.reduce((sum, r) => sum + (r.actionsExecuted || 0), 0),
    successRate: calculateSuccessRate(results),
    results
  };
}

/**
 * Calculate success rate from execution results
 */
function calculateSuccessRate(results) {
  if (!results.length) return 100;
  
  const successful = results.filter(r => r.status === 'success').length;
  return Math.round((successful / results.length) * 100);
}

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  logger.info('Lambda function received SIGTERM, closing database connection');
  if (dbConnection) {
    await mongoose.connection.close();
  }
});