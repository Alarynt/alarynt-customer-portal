import swaggerJSDoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Alarynt HTTP Alert API',
    version: '1.0.0',
    description: 'HTTP API for triggering Alarynt rules via customer API tokens. This API allows authenticated customers to execute rules, retrieve rule information, and monitor system health.',
    contact: {
      name: 'Alarynt Team',
      email: 'support@alarynt.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: process.env.API_BASE_URL || 'http://localhost:3000',
      description: 'Development server'
    },
    {
      url: 'https://api.alarynt.com',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your API token'
      }
    },
    schemas: {
      AlertRequest: {
        type: 'object',
        required: ['payload'],
        properties: {
          payload: {
            type: 'object',
            description: 'The data payload to be processed by the rule',
            example: {
              userId: '12345',
              event: 'user_login',
              timestamp: '2024-01-15T10:30:00Z',
              metadata: {
                userAgent: 'Mozilla/5.0...',
                ipAddress: '192.168.1.1'
              }
            }
          },
          metadata: {
            type: 'object',
            properties: {
              source: {
                type: 'string',
                description: 'Source system or application',
                example: 'web-app'
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
                description: 'ISO 8601 timestamp',
                example: '2024-01-15T10:30:00Z'
              },
              correlationId: {
                type: 'string',
                description: 'Unique identifier for tracking related events',
                example: 'corr-12345-abcde'
              }
            }
          }
        }
      },
      AlertResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the rule execution was successful'
          },
          executionId: {
            type: 'string',
            description: 'Unique identifier for this execution',
            example: '550e8400-e29b-41d4-a716-446655440000'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'ISO 8601 timestamp of the response'
          },
          result: {
            type: 'object',
            properties: {
              ruleExecuted: {
                type: 'boolean',
                description: 'Whether the rule was executed'
              },
              actionsExecuted: {
                type: 'integer',
                description: 'Number of actions that were executed'
              },
              executionTime: {
                type: 'number',
                description: 'Execution time in milliseconds'
              }
            }
          },
          error: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'Error message'
              },
              code: {
                type: 'string',
                description: 'Error code'
              }
            }
          }
        },
        example: {
          success: true,
          executionId: '550e8400-e29b-41d4-a716-446655440000',
          timestamp: '2024-01-15T10:30:00Z',
          result: {
            ruleExecuted: true,
            actionsExecuted: 2,
            executionTime: 150
          }
        }
      },
      AsyncAlertResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the async execution was initiated successfully'
          },
          executionId: {
            type: 'string',
            description: 'Unique identifier for this execution',
            example: '550e8400-e29b-41d4-a716-446655440000'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'ISO 8601 timestamp of the response'
          },
          message: {
            type: 'string',
            description: 'Status message'
          },
          invocationId: {
            type: 'string',
            description: 'AWS Lambda invocation ID'
          }
        },
        example: {
          success: true,
          executionId: '550e8400-e29b-41d4-a716-446655440000',
          timestamp: '2024-01-15T10:30:00Z',
          message: 'Rule execution initiated asynchronously',
          invocationId: 'lambda-invocation-123'
        }
      },
      Rule: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Unique rule identifier'
          },
          name: {
            type: 'string',
            description: 'Human-readable rule name'
          },
          description: {
            type: 'string',
            description: 'Rule description'
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Rule tags for categorization'
          },
          version: {
            type: 'string',
            description: 'Rule version'
          },
          conditions: {
            type: 'object',
            description: 'Rule conditions configuration'
          },
          actions: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Action'
            },
            description: 'Actions to execute when rule conditions are met'
          },
          actionsCount: {
            type: 'integer',
            description: 'Number of active actions'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the rule is active'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Rule creation timestamp'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Rule last update timestamp'
          }
        },
        example: {
          id: 'rule-12345',
          name: 'User Login Alert',
          description: 'Triggers when suspicious login activity is detected',
          tags: ['security', 'authentication'],
          isActive: true,
          actionsCount: 2
        }
      },
      RulesListResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          data: {
            type: 'object',
            properties: {
              rules: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Rule'
                }
              },
              count: {
                type: 'integer',
                description: 'Total number of rules'
              }
            }
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      RuleDetailsResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          data: {
            type: 'object',
            properties: {
              rule: {
                $ref: '#/components/schemas/Rule'
              }
            }
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Action: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Unique action identifier'
          },
          type: {
            type: 'string',
            enum: ['email', 'sms', 'webhook', 'database', 'notification'],
            description: 'Type of action to execute'
          },
          config: {
            type: 'object',
            description: 'Action-specific configuration'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the action is active'
          }
        }
      },
      HealthResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Overall health status'
          },
          data: {
            type: 'object',
            properties: {
              api: {
                type: 'string',
                enum: ['healthy', 'unhealthy'],
                description: 'API service status'
              },
              lambda: {
                type: 'string',
                enum: ['healthy', 'unhealthy'],
                description: 'Lambda connectivity status'
              },
              timestamp: {
                type: 'string',
                format: 'date-time'
              }
            }
          }
        },
        example: {
          success: true,
          data: {
            api: 'healthy',
            lambda: 'healthy',
            timestamp: '2024-01-15T10:30:00Z'
          }
        }
      },
      BasicHealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'healthy'
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          },
          version: {
            type: 'string',
            example: '1.0.0'
          }
        }
      },
      TestResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Test result'
          },
          data: {
            type: 'object',
            description: 'Test details and metrics'
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Error message'
          },
          statusCode: {
            type: 'integer',
            description: 'HTTP status code'
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          },
          path: {
            type: 'string',
            description: 'Request path that caused the error'
          }
        },
        example: {
          message: 'Authentication required',
          statusCode: 401,
          timestamp: '2024-01-15T10:30:00Z',
          path: '/api/v1/alert/rule/12345'
        }
      }
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication information is missing or invalid',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              message: 'Authentication required',
              statusCode: 401,
              timestamp: '2024-01-15T10:30:00Z',
              path: '/api/v1/alert/rule/12345'
            }
          }
        }
      },
      ForbiddenError: {
        description: 'Access denied to the requested resource',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              message: 'Access denied to rule: rule-12345',
              statusCode: 403,
              timestamp: '2024-01-15T10:30:00Z'
            }
          }
        }
      },
      NotFoundError: {
        description: 'The requested resource was not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              message: 'Rule not found',
              statusCode: 404,
              timestamp: '2024-01-15T10:30:00Z'
            }
          }
        }
      },
      ValidationError: {
        description: 'Request validation failed',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              message: 'Invalid request: payload is required',
              statusCode: 400,
              timestamp: '2024-01-15T10:30:00Z'
            }
          }
        }
      },
      RateLimitError: {
        description: 'Rate limit exceeded',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              message: 'Rate limit exceeded',
              statusCode: 429,
              timestamp: '2024-01-15T10:30:00Z'
            }
          }
        }
      },
      InternalServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              message: 'Internal server error',
              statusCode: 500,
              timestamp: '2024-01-15T10:30:00Z'
            }
          }
        }
      }
    }
  },
  security: [
    {
      BearerAuth: []
    }
  ]
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/index.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJSDoc(options);