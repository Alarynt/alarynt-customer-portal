import AWS from 'aws-sdk';
import { createLogger } from '../utils/logger';
import { LambdaExecutionResult, Rule } from '../types';
import { createApiError } from '../middleware/errorHandler';

const logger = createLogger('LambdaService');

export class LambdaService {
  private lambda: AWS.Lambda;
  private lambdaFunctionName: string;

  constructor() {
    // Initialize AWS Lambda client
    this.lambda = new AWS.Lambda({
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    
    this.lambdaFunctionName = process.env.ALARYNT_LAMBDA_FUNCTION_NAME || 'alarynt-rule-engine';
  }

  /**
   * Invokes the alarynt-lambda function with the prepared payload
   */
  async invokeLambda(payload: any): Promise<LambdaExecutionResult> {
    const startTime = Date.now();
    
    logger.info('Invoking alarynt-lambda', {
      functionName: this.lambdaFunctionName,
      payload: {
        source: payload.source,
        ruleId: payload.detail?.ruleId,
        customerId: payload.detail?.customerId,
      }
    });

    try {
      const params: AWS.Lambda.InvocationRequest = {
        FunctionName: this.lambdaFunctionName,
        InvocationType: 'RequestResponse', // Synchronous invocation
        Payload: JSON.stringify(payload),
      };

      const result = await this.lambda.invoke(params).promise();
      
      if (result.FunctionError) {
        throw createApiError(
          `Lambda execution failed: ${result.FunctionError}`,
          500
        );
      }

      let lambdaResponse;
      if (result.Payload) {
        try {
          lambdaResponse = JSON.parse(result.Payload.toString());
        } catch (parseError) {
          throw createApiError(
            'Failed to parse Lambda response',
            500
          );
        }
      }

      const executionTime = Date.now() - startTime;

      // Parse Lambda response
      const executionResult: LambdaExecutionResult = {
        success: lambdaResponse?.body ? JSON.parse(lambdaResponse.body).success : false,
        executionId: lambdaResponse?.body ? JSON.parse(lambdaResponse.body).executionId : 'unknown',
        executionTime,
        rulesExecuted: lambdaResponse?.body ? JSON.parse(lambdaResponse.body).result?.rulesExecuted || 1 : 1,
        actionsExecuted: lambdaResponse?.body ? JSON.parse(lambdaResponse.body).result?.actionsExecuted || 0 : 0,
        successRate: lambdaResponse?.body ? JSON.parse(lambdaResponse.body).result?.successRate || 100 : 100,
      };

      if (lambdaResponse?.statusCode !== 200) {
        executionResult.success = false;
        executionResult.error = lambdaResponse?.body ? 
          JSON.parse(lambdaResponse.body).error?.message : 
          'Lambda execution failed';
      }

      logger.info('Lambda invocation completed', {
        functionName: this.lambdaFunctionName,
        success: executionResult.success,
        executionTime,
        executionId: executionResult.executionId,
        rulesExecuted: executionResult.rulesExecuted,
        actionsExecuted: executionResult.actionsExecuted,
      });

      return executionResult;

    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      logger.error('Lambda invocation failed', {
        functionName: this.lambdaFunctionName,
        error: error.message,
        executionTime,
      });

      if (error.statusCode) {
        throw error;
      }

      throw createApiError(
        `Failed to invoke Lambda function: ${error.message}`,
        500
      );
    }
  }

  /**
   * Invokes Lambda asynchronously (fire-and-forget)
   */
  async invokeLambdaAsync(payload: any): Promise<{ success: boolean; invocationId: string }> {
    logger.info('Invoking alarynt-lambda asynchronously', {
      functionName: this.lambdaFunctionName,
      payload: {
        source: payload.source,
        ruleId: payload.detail?.ruleId,
        customerId: payload.detail?.customerId,
      }
    });

    try {
      const params: AWS.Lambda.InvocationRequest = {
        FunctionName: this.lambdaFunctionName,
        InvocationType: 'Event', // Asynchronous invocation
        Payload: JSON.stringify(payload),
      };

      const result = await this.lambda.invoke(params).promise();
      
      logger.info('Async Lambda invocation initiated', {
        functionName: this.lambdaFunctionName,
        statusCode: result.StatusCode,
      });

      return {
        success: result.StatusCode === 202,
        invocationId: result.Payload?.toString() || 'async'
      };

    } catch (error: any) {
      logger.error('Async Lambda invocation failed', {
        functionName: this.lambdaFunctionName,
        error: error.message,
      });

      throw createApiError(
        `Failed to invoke Lambda function asynchronously: ${error.message}`,
        500
      );
    }
  }

  /**
   * Health check for Lambda function
   */
  async checkLambdaHealth(): Promise<boolean> {
    try {
      const params: AWS.Lambda.GetFunctionRequest = {
        FunctionName: this.lambdaFunctionName,
      };

      const result = await this.lambda.getFunction(params).promise();
      
      const isHealthy = result.Configuration?.State === 'Active' &&
                       result.Configuration?.LastUpdateStatus === 'Successful';

      logger.info('Lambda health check', {
        functionName: this.lambdaFunctionName,
        state: result.Configuration?.State,
        lastUpdateStatus: result.Configuration?.LastUpdateStatus,
        isHealthy,
      });

      return isHealthy;
    } catch (error: any) {
      logger.error('Lambda health check failed', {
        functionName: this.lambdaFunctionName,
        error: error.message,
      });
      
      return false;
    }
  }

  /**
   * Test Lambda connectivity (for debugging)
   */
  async testLambdaConnection(): Promise<any> {
    const testPayload = {
      source: 'custom',
      'detail-type': 'Connection Test',
      detail: {
        test: true,
        timestamp: new Date().toISOString(),
      }
    };

    try {
      const result = await this.invokeLambda(testPayload);
      return {
        success: true,
        result,
        message: 'Lambda connection test successful'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Lambda connection test failed'
      };
    }
  }
}

export const lambdaService = new LambdaService();