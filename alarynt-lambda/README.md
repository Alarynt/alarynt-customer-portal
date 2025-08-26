# Alarynt Lambda Function

AWS Lambda function for executing Alarynt business rules and their associated actions. This serverless function integrates with the MongoDB schemas defined in `alarynt-mongodb` to provide scalable rule execution capabilities.

## Overview

The Alarynt Lambda function is designed to:

- Execute business rules based on various triggers (scheduled, API, S3 events, custom)
- Evaluate Domain Specific Language (DSL) conditions
- Execute actions (email, SMS, webhooks, database operations, notifications)
- Track performance metrics and execution logs
- Provide comprehensive error handling and monitoring

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Event Sources │────│  Lambda Handler  │────│   Rule Engine   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                        ┌───────────────┐                │
                        │  Database     │                │
                        │  Manager      │                │
                        └───────────────┘                │
                                │                        │
                        ┌───────────────┐      ┌─────────────────┐
                        │   MongoDB     │      │ Action Executor │
                        │  (alarynt-    │      └─────────────────┘
                        │   schemas)    │                │
                        └───────────────┘      ┌─────────────────┐
                                              │  AWS Services   │
                                              │  (SES, SNS)     │
                                              └─────────────────┘
```

## Features

### 🚀 Rule Execution
- **DSL Support**: Custom Domain Specific Language for business rules
- **Multiple Triggers**: EventBridge, API Gateway, S3, Custom events
- **Context Awareness**: Access to customer, order, product data
- **Performance Tracking**: Execution metrics and success rates

### 📬 Action Types
- **Email**: Send emails via SES or SMTP with templating
- **SMS**: Send SMS messages via SNS
- **Webhooks**: HTTP requests to external APIs
- **Database**: Create, update, delete, query operations
- **Notifications**: SNS topics or database logging

### 📊 Monitoring & Logging
- **Structured Logging**: Winston-based logging with CloudWatch integration
- **Performance Metrics**: Execution time and success rate tracking
- **Error Analysis**: Comprehensive error categorization
- **Audit Trail**: Complete activity logging

### 🔐 Security & Validation
- **Input Validation**: Joi-based validation for all inputs
- **Sanitization**: XSS and injection protection
- **Environment Checks**: Configuration validation
- **Safe Expression Evaluation**: Secure DSL execution

## Installation

1. **Clone and navigate to the directory:**
   ```bash
   cd alarynt-lambda
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

## Configuration

### Environment Variables

#### Required
```bash
MONGODB_URI=mongodb://localhost:27017/alarynt-rules
```

#### Optional
```bash
# AWS Configuration
AWS_REGION=us-east-1

# Logging
LOG_LEVEL=info

# Email Configuration
EMAIL_PROVIDER=ses  # or 'smtp'
FROM_EMAIL=noreply@alarynt.com

# SMTP Configuration (if using SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-password
```

### AWS IAM Permissions

The Lambda function requires the following IAM permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "sns:Publish"
      ],
      "Resource": "*"
    }
  ]
}
```

## Usage

### Event Sources

#### 1. EventBridge (Scheduled Execution)
```json
{
  "source": "aws.events",
  "detail-type": "Scheduled Event",
  "detail": {
    "schedule": "rate(5 minutes)"
  }
}
```

#### 2. API Gateway
```json
{
  "source": "aws.apigateway",
  "body": "{\"eventType\":\"order_created\",\"customerId\":\"cust_123\",\"orderId\":\"order_456\"}"
}
```

#### 3. S3 Events
```json
{
  "source": "aws.s3",
  "Records": [{
    "eventName": "ObjectCreated:Put",
    "s3": {
      "bucket": {"name": "my-bucket"},
      "object": {"key": "data/orders.csv"}
    }
  }]
}
```

#### 4. Custom Events
```json
{
  "source": "custom",
  "eventType": "inventory_low",
  "data": {
    "productId": "prod_123",
    "inventory": 5,
    "threshold": 10
  }
}
```

### DSL Examples

#### High-Value Customer Alert
```dsl
WHEN order.total > 1000
AND customer.tier == "premium"
THEN send_email(to: "sales@company.com", subject: "High Value Order Alert")
```

#### Inventory Management
```dsl
WHEN product.inventory < product.minThreshold
THEN send_email(to: "inventory@company.com", subject: "Low Inventory Alert")
AND call_webhook(url: "https://api.supplier.com/reorder", method: "POST")
```

#### Customer Segmentation
```dsl
WHEN customer.totalSpent > 10000
AND customer.totalOrders > 50
THEN update_database(collection: "Customer", filter: {"id": "{{customer.id}}"}, update: {"tier": "vip"})
```

## API Reference

### Lambda Handler Response

```typescript
interface LambdaResponse {
  statusCode: number;
  body: string; // JSON stringified
}

interface ResponseBody {
  success: boolean;
  executionId: string;
  executionTime: number;
  result?: {
    type: string;
    rulesExecuted: number;
    actionsExecuted: number;
    successRate: number;
    results: RuleExecutionResult[];
  };
  error?: string;
}
```

### Rule Execution Result

```typescript
interface RuleExecutionResult {
  ruleId: string;
  status: 'success' | 'failed' | 'skipped';
  conditionsPassed: boolean;
  actionsExecuted: number;
  executionTime: number;
  actionResults: ActionResult[];
}

interface ActionResult {
  actionId: string;
  actionType: string;
  success: boolean;
  executionTime: number;
  data?: any;
  error?: string;
}
```

## Development

### Local Testing

1. **Set up local MongoDB:**
   ```bash
   # Start MongoDB locally or use MongoDB Atlas
   mongod --dbpath /path/to/db
   ```

2. **Install dependencies in alarynt-mongodb:**
   ```bash
   cd ../alarynt-mongodb
   npm install
   node database.js  # Initialize with sample data
   ```

3. **Test locally:**
   ```bash
   cd ../alarynt-lambda
   npm test
   ```

### Testing with Sample Events

```bash
# Test with scheduled event
node -e "
const handler = require('./index').handler;
const event = { source: 'aws.events', detail: {} };
const context = { awsRequestId: 'test-123' };
handler(event, context).then(console.log);
"

# Test with API event
node -e "
const handler = require('./index').handler;
const event = { 
  source: 'aws.apigateway', 
  body: JSON.stringify({ eventType: 'test', customerId: 'cust_001' })
};
const context = { awsRequestId: 'test-456' };
handler(event, context).then(console.log);
"
```

## Deployment

### Package for Deployment

```bash
npm run package
```

This creates a `function.zip` file ready for AWS Lambda deployment.

### Deploy via AWS CLI

```bash
# Create function (first time)
aws lambda create-function \
  --function-name alarynt-rule-engine \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR-ACCOUNT:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 300 \
  --memory-size 512

# Update function code
npm run deploy
```

### Deploy via Terraform

See `terraform/` directory for Infrastructure as Code deployment.

### Deploy via SAM

See `template.yaml` for AWS SAM deployment.

## Monitoring

### CloudWatch Metrics

The function automatically creates custom metrics:
- `RulesExecuted`
- `ActionsExecuted`
- `ExecutionErrors`
- `AverageExecutionTime`

### CloudWatch Logs

Structured logs include:
- Execution tracking
- Performance metrics
- Error details
- Security events

### Alarms

Recommended CloudWatch alarms:
- High error rate (> 5%)
- Long execution time (> 30s)
- Memory usage (> 80%)
- Cold start frequency

## Performance Optimization

### Database Connection
- Connection reuse across warm starts
- Optimized connection pooling for Lambda
- Query timeout management

### Memory Management
- Efficient object handling
- Minimal memory footprint
- Garbage collection optimization

### Cold Start Mitigation
- Provisioned concurrency for critical workloads
- Lightweight initialization
- Connection pre-warming

## Troubleshooting

### Common Issues

1. **MongoDB Connection Timeout**
   ```bash
   # Check VPC configuration and security groups
   # Verify MongoDB URI format
   # Check Lambda timeout settings
   ```

2. **Memory Limit Exceeded**
   ```bash
   # Increase Lambda memory allocation
   # Optimize rule and action processing
   # Review batch sizes
   ```

3. **Cold Start Performance**
   ```bash
   # Enable provisioned concurrency
   # Optimize initialization code
   # Use connection pooling
   ```

### Debug Mode

Set `LOG_LEVEL=debug` for detailed logging:

```bash
LOG_LEVEL=debug npm run local
```

### Error Codes

- `VALIDATION_ERROR`: Invalid input parameters
- `DATABASE_ERROR`: MongoDB connection/query issues
- `ACTION_EXECUTION_ERROR`: Action execution failures
- `DSL_PARSE_ERROR`: Rule DSL parsing issues
- `TIMEOUT_ERROR`: Function timeout exceeded

## Security

### Data Protection
- Input sanitization and validation
- Secure expression evaluation
- No sensitive data in logs

### Access Control
- IAM role-based permissions
- Resource-based policies
- VPC endpoint usage

### Compliance
- GDPR data handling
- SOC 2 compliance ready
- Audit trail maintenance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run linting and tests
6. Submit a pull request

### Code Standards
- ESLint configuration
- Jest for testing
- JSDoc documentation
- Semantic versioning

## License

MIT License - see LICENSE file for details.

## Support

- **Documentation**: See `/docs` directory
- **Issues**: GitHub Issues
- **Contact**: support@alarynt.com

---

**Built with ❤️ by the Alarynt Team**