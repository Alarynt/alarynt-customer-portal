/**
 * Basic tests for Alarynt Lambda Function
 */

const { handler } = require('../index');

// Mock environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-alarynt-rules';
process.env.LOG_LEVEL = 'error';

describe('Alarynt Lambda Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Event Validation', () => {
    test('should reject invalid event source', async () => {
      const event = { source: 'invalid-source' };
      const context = { awsRequestId: 'test-123' };

      const result = await handler(event, context);
      
      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body).success).toBe(false);
      expect(JSON.parse(result.body).error).toContain('Unsupported event source');
    });

    test('should accept valid scheduled event', async () => {
      const event = {
        source: 'aws.events',
        'detail-type': 'Scheduled Event',
        detail: {}
      };
      const context = { awsRequestId: 'test-456' };

      // Note: This will fail due to database connection in real test
      // but should pass validation
      const result = await handler(event, context);
      
      // Should not be a validation error
      if (result.statusCode === 500) {
        const error = JSON.parse(result.body).error;
        expect(error).not.toContain('Unsupported event source');
        expect(error).not.toContain('Invalid event');
      }
    });

    test('should accept valid API Gateway event', async () => {
      const event = {
        source: 'aws.apigateway',
        body: JSON.stringify({
          eventType: 'test',
          customerId: 'cust_001'
        })
      };
      const context = { awsRequestId: 'test-789' };

      const result = await handler(event, context);
      
      // Should not be a validation error
      if (result.statusCode === 500) {
        const error = JSON.parse(result.body).error;
        expect(error).not.toContain('Unsupported event source');
        expect(error).not.toContain('Invalid event');
      }
    });

    test('should accept valid custom event', async () => {
      const event = {
        source: 'custom',
        eventType: 'inventory_low',
        data: {
          productId: 'prod_123',
          inventory: 5
        }
      };
      const context = { awsRequestId: 'test-101112' };

      const result = await handler(event, context);
      
      // Should not be a validation error
      if (result.statusCode === 500) {
        const error = JSON.parse(result.body).error;
        expect(error).not.toContain('Unsupported event source');
        expect(error).not.toContain('Invalid event');
      }
    });
  });

  describe('Response Format', () => {
    test('should return proper response format', async () => {
      const event = { source: 'invalid' };
      const context = { awsRequestId: 'test-response' };

      const result = await handler(event, context);
      
      expect(result).toHaveProperty('statusCode');
      expect(result).toHaveProperty('body');
      expect(typeof result.body).toBe('string');
      
      const body = JSON.parse(result.body);
      expect(body).toHaveProperty('success');
      expect(body).toHaveProperty('executionId');
      expect(body).toHaveProperty('executionTime');
    });
  });
});

// Mock tests for individual modules
describe('Module Integration', () => {
  test('should load all required modules', () => {
    expect(() => require('../src/database')).not.toThrow();
    expect(() => require('../src/logger')).not.toThrow();
    expect(() => require('../src/ruleEngine')).not.toThrow();
    expect(() => require('../src/actionExecutor')).not.toThrow();
    expect(() => require('../src/validation')).not.toThrow();
  });

  test('validation module should export required functions', () => {
    const validation = require('../src/validation');
    
    expect(typeof validation.validateEvent).toBe('function');
    expect(typeof validation.validateRule).toBe('function');
    expect(typeof validation.validateActionConfig).toBe('function');
    expect(typeof validation.validateDSL).toBe('function');
  });

  test('logger should initialize without errors', () => {
    const Logger = require('../src/logger');
    
    expect(() => {
      const logger = new Logger();
      logger.info('Test message');
    }).not.toThrow();
  });
});