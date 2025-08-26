# Alarynt HTTP Alert API

HTTP API for triggering Alarynt rules via customer API tokens. This service acts as a bridge between customer systems and the `alarynt-lambda` rule engine, providing a secure and scalable way to execute business rules through HTTP requests.

## Overview

The Alarynt HTTP Alert API enables customers to:

- Trigger specific business rules using HTTP requests
- Authenticate using secure API tokens
- Execute rules synchronously or asynchronously
- Monitor rule execution results
- Access rule metadata and documentation

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Customer      │────│ HTTP Alert API   │────│ Alarynt Lambda  │
│   Application   │    │ (This Service)   │    │ (Rule Engine)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                        ┌───────────────┐                │
                        │  Auth Service │                │
                        │  (Token Mgmt) │                │
                        └───────────────┘                │
                                │                        │
                        ┌───────────────┐      ┌─────────────────┐
                        │   Rule Store  │      │   Action        │
                        │  (MongoDB)    │      │   Executors     │
                        └───────────────┘      └─────────────────┘
```

## Features

### 🔐 Authentication & Security
- **API Token Based**: Secure customer API tokens with scoped permissions
- **Rate Limiting**: Configurable per-customer rate limits
- **CORS Protection**: Configurable allowed origins
- **Request Validation**: Comprehensive input validation using Joi
- **Security Headers**: Helmet.js for security headers

### 🚀 Rule Execution
- **Synchronous Execution**: Real-time rule execution with immediate results
- **Asynchronous Execution**: Fire-and-forget rule execution for performance
- **Rule Validation**: Pre-execution validation of rules and payloads
- **Lambda Integration**: Direct integration with alarynt-lambda function

### 📊 Monitoring & Logging
- **Structured Logging**: Winston-based logging with multiple transports
- **Execution Tracking**: Complete audit trail of rule executions
- **Health Checks**: API and Lambda connectivity monitoring
- **Performance Metrics**: Execution time and success rate tracking

### 🛡️ Error Handling
- **Comprehensive Error Handling**: Detailed error responses with proper status codes
- **Validation Errors**: Clear validation error messages
- **Lambda Error Propagation**: Proper handling of Lambda execution errors
- **Request Correlation**: Unique execution IDs for request tracing

## API Endpoints

### Authentication
All endpoints (except health checks) require authentication via API token in the Authorization header:
```
Authorization: Bearer alr_your_api_token_here
```

### Core Endpoints

#### Execute Rule (Synchronous)
```http
POST /api/v1/alert/rule/{ruleId}
Authorization: Bearer {apiToken}
Content-Type: application/json

{
  "payload": {
    "type": "order",
    "orderId": "12345",
    "amount": 1500,
    "currency": "USD",
    "customerId": "cust_67890"
  },
  "metadata": {
    "source": "e-commerce-platform",
    "correlationId": "req_abc123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "executionId": "exec_uuid_here",
  "timestamp": "2024-12-08T12:00:00.000Z",
  "result": {
    "ruleExecuted": true,
    "actionsExecuted": 2,
    "executionTime": 1250
  }
}
```

#### Execute Rule (Asynchronous)
```http
POST /api/v1/alert/rule/{ruleId}/async
```
Returns immediately with `202 Accepted` status.

#### List Customer Rules
```http
GET /api/v1/alert/rules
Authorization: Bearer {apiToken}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rules": [
      {
        "id": "rule-1",
        "name": "Order Alert Rule",
        "description": "Sends email alerts for high-value orders",
        "tags": ["order", "alert", "email"],
        "actionsCount": 1,
        "isActive": true,
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "count": 1
  },
  "timestamp": "2024-12-08T12:00:00.000Z"
}
```

#### Get Rule Details
```http
GET /api/v1/alert/rule/{ruleId}
Authorization: Bearer {apiToken}
```

#### Health Check
```http
GET /api/v1/alert/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "api": "healthy",
    "lambda": "healthy",
    "timestamp": "2024-12-08T12:00:00.000Z"
  }
}
```

#### Test Lambda Connection
```http
POST /api/v1/alert/test
Authorization: Bearer {apiToken}
```

## Installation & Setup

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn
- AWS credentials configured
- Access to alarynt-lambda function

### Installation

1. **Clone the repository and navigate to the API directory:**
```bash
cd alarynt-http-alert
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Build the project:**
```bash
npm run build
```

### Development

Start the development server with hot reloading:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Production

Build and start the production server:
```bash
npm run build
npm start
```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `3000` | No |
| `NODE_ENV` | Environment | `development` | No |
| `AWS_REGION` | AWS region | `us-east-1` | No |
| `AWS_ACCESS_KEY_ID` | AWS access key | - | Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | - | Yes |
| `ALARYNT_LAMBDA_FUNCTION_NAME` | Lambda function name | `alarynt-rule-engine` | No |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000` | No |
| `LOG_LEVEL` | Logging level | `info` | No |

### API Tokens

Currently using mock data for development. In production, API tokens should be:
- Stored securely in the database
- Generated with sufficient entropy
- Associated with customer permissions
- Support expiration dates
- Include usage tracking

**Example API Token:** `alr_test_123456789abcdef`

### Rate Limiting

Default rate limits:
- **Per IP:** 100 requests per 15 minutes
- **Per Customer:** Configurable in customer settings

## Error Handling

### HTTP Status Codes

| Status | Meaning | Description |
|--------|---------|-------------|
| `200` | Success | Rule executed successfully |
| `202` | Accepted | Async rule execution initiated |
| `400` | Bad Request | Invalid request payload or parameters |
| `401` | Unauthorized | Invalid or missing API token |
| `403` | Forbidden | Access denied to rule |
| `404` | Not Found | Rule not found |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Error | Server or Lambda execution error |
| `503` | Service Unavailable | Lambda function unavailable |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Rule not found: rule-999",
    "statusCode": 404,
    "timestamp": "2024-12-08T12:00:00.000Z"
  }
}
```

## Rule Integration

### Rule Structure

Rules in the system have the following structure:

```typescript
interface Rule {
  id: string;
  name: string;
  customerId: string;
  isActive: boolean;
  conditions: Record<string, any>;
  actions: Action[];
  metadata?: {
    description?: string;
    tags?: string[];
    version?: string;
  };
}
```

### Payload Requirements

Rule execution payloads should match the rule's expected conditions:

```json
{
  "payload": {
    "type": "order",           // Must match rule.conditions.type
    "orderId": "12345",        // Business data
    "amount": 1500,
    "currency": "USD",
    "customer": {
      "id": "cust_67890",
      "email": "customer@example.com"
    }
  },
  "metadata": {
    "source": "api",           // Optional metadata
    "correlationId": "req_123",
    "timestamp": "2024-12-08T12:00:00.000Z"
  }
}
```

## Lambda Integration

### Payload Format

The API transforms requests into Lambda-compatible payloads:

```json
{
  "source": "custom",
  "detail-type": "HTTP Alert Trigger",
  "detail": {
    "ruleId": "rule-1",
    "ruleName": "Order Alert Rule",
    "customerId": "customer-1",
    "payload": { /* original payload */ },
    "metadata": {
      "timestamp": "2024-12-08T12:00:00.000Z",
      "source": "alarynt-http-alert",
      "executionId": "exec_uuid",
      "httpAlertSource": true
    },
    "rule": {
      "conditions": { /* rule conditions */ },
      "actions": [ /* active actions */ ]
    }
  }
}
```

### Response Handling

Lambda responses are parsed and transformed into API responses:

```typescript
interface LambdaExecutionResult {
  success: boolean;
  executionId: string;
  executionTime: number;
  rulesExecuted: number;
  actionsExecuted: number;
  successRate: number;
  error?: string;
}
```

## Monitoring

### Logging

Structured logging with Winston includes:
- Request/response logging
- Authentication events
- Rule execution tracking
- Error logging with stack traces
- Performance metrics

### Log Files
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only

### Health Monitoring

Monitor these endpoints:
- `GET /health` - API and Lambda health
- `GET /api/v1/alert/health` - Authenticated health check
- `POST /api/v1/alert/test` - Lambda connectivity test

## Development

### Testing

```bash
# Run tests (when available)
npm test

# Run tests with coverage
npm run test:coverage
```

### Linting

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Development Scripts

```bash
# Start development server
npm run dev

# Build project
npm run build

# Clean build directory
npm run clean

# Start production server
npm start
```

## Deployment

### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY logs ./logs

EXPOSE 3000

CMD ["npm", "start"]
```

### AWS ECS/Fargate

The API can be deployed on AWS ECS with:
- Application Load Balancer
- Auto Scaling Group
- CloudWatch logging
- IAM roles for Lambda access

### Environment Considerations

**Development:**
- Mock data for customers and rules
- Console logging
- Detailed error messages

**Production:**
- MongoDB integration
- File and CloudWatch logging
- Secure error messages
- Performance monitoring

## Security

### Best Practices

1. **API Tokens:**
   - Use cryptographically secure random generation
   - Implement token rotation
   - Store tokens hashed in database
   - Support token expiration

2. **Network Security:**
   - Use HTTPS in production
   - Configure proper CORS policies
   - Implement IP whitelisting if needed
   - Use AWS VPC for Lambda access

3. **Input Validation:**
   - Validate all input parameters
   - Sanitize payload data
   - Limit request sizes
   - Implement rate limiting

4. **Error Handling:**
   - Don't expose internal system details
   - Log security events
   - Implement proper error responses
   - Monitor for abuse patterns

## Troubleshooting

### Common Issues

**Authentication Errors:**
- Verify API token format (`alr_` prefix)
- Check token expiration
- Confirm customer is active
- Validate token permissions

**Rule Execution Errors:**
- Verify rule exists and is active
- Check rule permissions for customer
- Validate payload format
- Confirm Lambda function is accessible

**Lambda Integration Issues:**
- Check AWS credentials
- Verify Lambda function name
- Test Lambda function independently
- Review CloudWatch logs

**Performance Issues:**
- Monitor request/response times
- Check Lambda cold starts
- Review database queries
- Analyze rate limiting

### Debug Mode

Enable debug logging:
```bash
LOG_LEVEL=debug npm run dev
```

### Health Checks

Regular health check endpoints:
- API: `GET /health`
- Authenticated: `GET /api/v1/alert/health`
- Lambda Test: `POST /api/v1/alert/test`

## API Reference

Complete API documentation is available at `/docs` when running in development mode (if Swagger/OpenAPI is configured).

For detailed schema definitions, see the TypeScript interfaces in `src/types/index.ts`.

## Contributing

1. Follow TypeScript best practices
2. Add comprehensive logging
3. Include error handling
4. Write tests for new features
5. Update documentation

## License

MIT License - see the main repository for details.