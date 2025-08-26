/**
 * Logger utility for Alarynt Lambda
 * 
 * Provides structured logging optimized for AWS Lambda environment
 * with CloudWatch integration.
 */

const winston = require('winston');

class Logger {
  constructor(options = {}) {
    const {
      level = process.env.LOG_LEVEL || 'info',
      service = 'alarynt-lambda',
      version = process.env.LAMBDA_VERSION || '1.0.0'
    } = options;

    // Create Winston logger instance
    this.logger = winston.createLogger({
      level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return JSON.stringify({
            timestamp,
            level: level.toUpperCase(),
            service,
            version,
            message,
            ...meta
          });
        })
      ),
      transports: [
        new winston.transports.Console({
          handleExceptions: true,
          handleRejections: true
        })
      ],
      exitOnError: false
    });

    // Add Lambda-specific metadata
    this.defaultMeta = {
      awsRegion: process.env.AWS_REGION,
      functionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
      functionVersion: process.env.AWS_LAMBDA_FUNCTION_VERSION,
      memorySize: process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE,
      logGroup: process.env.AWS_LAMBDA_LOG_GROUP_NAME,
      logStream: process.env.AWS_LAMBDA_LOG_STREAM_NAME
    };
  }

  /**
   * Log info level message
   * @param {string} message - Log message
   * @param {object} meta - Additional metadata
   */
  info(message, meta = {}) {
    this.logger.info(message, { ...this.defaultMeta, ...meta });
  }

  /**
   * Log warning level message
   * @param {string} message - Log message
   * @param {object} meta - Additional metadata
   */
  warn(message, meta = {}) {
    this.logger.warn(message, { ...this.defaultMeta, ...meta });
  }

  /**
   * Log error level message
   * @param {string} message - Log message
   * @param {object} meta - Additional metadata (including error objects)
   */
  error(message, meta = {}) {
    this.logger.error(message, { ...this.defaultMeta, ...meta });
  }

  /**
   * Log debug level message
   * @param {string} message - Log message
   * @param {object} meta - Additional metadata
   */
  debug(message, meta = {}) {
    this.logger.debug(message, { ...this.defaultMeta, ...meta });
  }

  /**
   * Log rule execution start
   * @param {string} ruleId - Rule identifier
   * @param {object} context - Execution context
   */
  logRuleExecutionStart(ruleId, context = {}) {
    this.info('Rule execution started', {
      eventType: 'rule_execution_start',
      ruleId,
      triggerType: context.triggerType,
      executionId: context.executionId
    });
  }

  /**
   * Log rule execution completion
   * @param {string} ruleId - Rule identifier
   * @param {object} result - Execution result
   * @param {number} executionTime - Execution time in milliseconds
   */
  logRuleExecutionEnd(ruleId, result, executionTime) {
    const level = result.success ? 'info' : 'error';
    this.logger.log(level, 'Rule execution completed', {
      ...this.defaultMeta,
      eventType: 'rule_execution_end',
      ruleId,
      success: result.success,
      executionTime,
      actionsExecuted: result.actionsExecuted || 0,
      error: result.error || null
    });
  }

  /**
   * Log action execution
   * @param {string} actionId - Action identifier
   * @param {string} actionType - Type of action
   * @param {object} result - Execution result
   * @param {number} executionTime - Execution time in milliseconds
   */
  logActionExecution(actionId, actionType, result, executionTime) {
    const level = result.success ? 'info' : 'error';
    this.logger.log(level, 'Action executed', {
      ...this.defaultMeta,
      eventType: 'action_execution',
      actionId,
      actionType,
      success: result.success,
      executionTime,
      error: result.error || null,
      responseData: result.data || null
    });
  }

  /**
   * Log performance metrics
   * @param {object} metrics - Performance metrics
   */
  logPerformanceMetrics(metrics) {
    this.info('Performance metrics', {
      eventType: 'performance_metrics',
      ...metrics
    });
  }

  /**
   * Log database operation
   * @param {string} operation - Database operation type
   * @param {object} meta - Operation metadata
   */
  logDatabaseOperation(operation, meta = {}) {
    this.debug('Database operation', {
      eventType: 'database_operation',
      operation,
      ...meta
    });
  }

  /**
   * Log security event
   * @param {string} eventType - Security event type
   * @param {object} details - Event details
   */
  logSecurityEvent(eventType, details = {}) {
    this.warn('Security event', {
      eventType: 'security_event',
      securityEventType: eventType,
      ...details
    });
  }

  /**
   * Log integration call (external API, etc.)
   * @param {string} integration - Integration name
   * @param {string} endpoint - Endpoint called
   * @param {object} result - Call result
   * @param {number} responseTime - Response time in milliseconds
   */
  logIntegrationCall(integration, endpoint, result, responseTime) {
    const level = result.success ? 'info' : 'error';
    this.logger.log(level, 'Integration call', {
      ...this.defaultMeta,
      eventType: 'integration_call',
      integration,
      endpoint,
      success: result.success,
      responseTime,
      statusCode: result.statusCode,
      error: result.error || null
    });
  }

  /**
   * Create child logger with additional context
   * @param {object} childMeta - Additional metadata for child logger
   * @returns {Logger} Child logger instance
   */
  child(childMeta = {}) {
    const childLogger = new Logger();
    childLogger.defaultMeta = { ...this.defaultMeta, ...childMeta };
    childLogger.logger = this.logger;
    return childLogger;
  }

  /**
   * Measure execution time of a function
   * @param {Function} fn - Function to measure
   * @param {string} operationName - Name of the operation for logging
   * @returns {Promise} Function result with timing
   */
  async measureTime(fn, operationName) {
    const startTime = Date.now();
    
    try {
      const result = await fn();
      const executionTime = Date.now() - startTime;
      
      this.debug(`${operationName} completed`, {
        eventType: 'operation_timing',
        operationName,
        executionTime,
        success: true
      });
      
      return { result, executionTime, success: true };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      this.error(`${operationName} failed`, {
        eventType: 'operation_timing',
        operationName,
        executionTime,
        success: false,
        error: error.message,
        stack: error.stack
      });
      
      return { error, executionTime, success: false };
    }
  }

  /**
   * Log Lambda cold start
   */
  logColdStart() {
    this.info('Lambda cold start detected', {
      eventType: 'cold_start',
      initTime: Date.now()
    });
  }

  /**
   * Log Lambda warm start
   */
  logWarmStart() {
    this.debug('Lambda warm start', {
      eventType: 'warm_start'
    });
  }
}

module.exports = Logger;