import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Alarynt Customer Backend API',
      version: '1.0.0',
      description: 'A comprehensive Node.js TypeScript backend API for the Alarynt Rule Engine Customer Portal. This API supports authentication, rules management, actions management, dashboard analytics, and activity logging.',
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
        url: `http://localhost:${config.port}`,
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
          description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique user identifier'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            company: {
              type: 'string',
              description: 'User company name'
            },
            role: {
              type: 'string',
              enum: ['Admin', 'Manager', 'User', 'Viewer'],
              description: 'User role for access control'
            },
            isActive: {
              type: 'boolean',
              description: 'Whether the user account is active'
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              description: 'Last login timestamp'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
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
              description: 'Rule name'
            },
            description: {
              type: 'string',
              description: 'Rule description'
            },
            dsl: {
              type: 'string',
              description: 'Domain Specific Language code for the rule'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'draft'],
              description: 'Rule status'
            },
            priority: {
              type: 'number',
              description: 'Rule execution priority (higher number = higher priority)'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Tags for categorizing rules'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            },
            lastExecuted: {
              type: 'string',
              format: 'date-time'
            },
            executionCount: {
              type: 'number',
              description: 'Number of times the rule has been executed'
            },
            successRate: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Success rate percentage'
            },
            createdBy: {
              type: 'string',
              description: 'ID of the user who created the rule'
            }
          },
          required: ['name', 'description', 'dsl', 'status', 'priority']
        },
        Action: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique action identifier'
            },
            name: {
              type: 'string',
              description: 'Action name'
            },
            description: {
              type: 'string',
              description: 'Action description'
            },
            type: {
              type: 'string',
              enum: ['email', 'sms', 'webhook', 'database', 'notification'],
              description: 'Action type'
            },
            config: {
              type: 'object',
              description: 'Configuration specific to action type'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'draft'],
              description: 'Action status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            },
            lastExecuted: {
              type: 'string',
              format: 'date-time'
            },
            executionCount: {
              type: 'number',
              description: 'Number of times the action has been executed'
            },
            successRate: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Success rate percentage'
            },
            createdBy: {
              type: 'string',
              description: 'ID of the user who created the action'
            }
          },
          required: ['name', 'description', 'type', 'config', 'status']
        },
        Activity: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique activity identifier'
            },
            type: {
              type: 'string',
              description: 'Activity type'
            },
            description: {
              type: 'string',
              description: 'Activity description'
            },
            userId: {
              type: 'string',
              description: 'ID of the user who performed the activity'
            },
            metadata: {
              type: 'object',
              description: 'Additional activity metadata'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Activity timestamp'
            }
          }
        },
        DashboardStats: {
          type: 'object',
          properties: {
            totalRules: {
              type: 'number',
              description: 'Total number of rules'
            },
            activeRules: {
              type: 'number',
              description: 'Number of active rules'
            },
            totalActions: {
              type: 'number',
              description: 'Total number of actions'
            },
            todayExecutions: {
              type: 'number',
              description: 'Rule executions today'
            },
            successRate: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Overall success rate percentage'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Error message'
            },
            details: {
              type: 'string',
              description: 'Additional error details (development only)'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'User password'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'name', 'company'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'User password'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            company: {
              type: 'string',
              description: 'User company name'
            },
            role: {
              type: 'string',
              enum: ['Manager', 'User', 'Viewer'],
              default: 'User',
              description: 'User role (Admin can only be set by existing Admin)'
            }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'array',
              items: {
                type: 'object'
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'number',
                  description: 'Current page number'
                },
                limit: {
                  type: 'number',
                  description: 'Items per page'
                },
                totalPages: {
                  type: 'number',
                  description: 'Total number of pages'
                },
                totalItems: {
                  type: 'number',
                  description: 'Total number of items'
                },
                hasNext: {
                  type: 'boolean',
                  description: 'Whether there is a next page'
                },
                hasPrev: {
                  type: 'boolean',
                  description: 'Whether there is a previous page'
                }
              }
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication token is required or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: 'Authentication token is required'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Access denied - insufficient permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: 'Access denied. Manager or Admin role required.'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: 'Resource not found'
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
                success: false,
                error: 'Validation failed',
                details: 'Email is required'
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
                success: false,
                error: 'Too many requests from this IP, please try again later.'
              }
            }
          }
        }
      },
      parameters: {
        IdParam: {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Resource ID',
          schema: {
            type: 'string'
          }
        },
        PageParam: {
          name: 'page',
          in: 'query',
          description: 'Page number (1-based)',
          schema: {
            type: 'number',
            minimum: 1,
            default: 1
          }
        },
        LimitParam: {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          schema: {
            type: 'number',
            minimum: 1,
            maximum: 100,
            default: 10
          }
        },
        SearchParam: {
          name: 'search',
          in: 'query',
          description: 'Search term',
          schema: {
            type: 'string'
          }
        },
        StatusParam: {
          name: 'status',
          in: 'query',
          description: 'Filter by status',
          schema: {
            type: 'string',
            enum: ['active', 'inactive', 'draft']
          }
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Rules',
        description: 'Business rules management endpoints'
      },
      {
        name: 'Actions',
        description: 'Actions management endpoints'
      },
      {
        name: 'Activities',
        description: 'Activity logs and audit trail endpoints'
      },
      {
        name: 'Dashboard',
        description: 'Dashboard statistics and metrics endpoints'
      },
      {
        name: 'Analytics',
        description: 'Analytics and reporting endpoints'
      },
      {
        name: 'System',
        description: 'System health and monitoring endpoints'
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/app.ts'
  ],
};

export const swaggerSpec = swaggerJsdoc(options);