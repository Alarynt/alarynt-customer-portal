# Alarynt MongoDB Schemas

This repository contains comprehensive MongoDB schemas for the Alarynt Rule Engine system, designed to support the `alarynt-customer-portal` frontend application.

## Overview

The schemas are organized into three main categories:

### 🏗️ Core Application Schemas
- **User** - Authentication and user management
- **Rule** - Business rules with DSL (Domain Specific Language)
- **Action** - Actions that can be executed by rules
- **Activity** - System activity logs and audit trail
- **PerformanceData** - System performance metrics over time
- **RulePerformance** - Individual rule performance tracking
- **ActionPerformance** - Individual action performance tracking
- **ErrorAnalysis** - Error tracking and categorization

### 🏢 Business Domain Schemas
- **Customer** - Customer data referenced in business rules
- **Order** - Order data referenced in business rules
- **Product** - Product/inventory data referenced in business rules

### 📊 Rule Execution Schemas
- **RuleExecution** - Track individual rule executions for auditing and debugging

## Features

- **Full TypeScript Support** - All schemas are designed with type safety in mind
- **Comprehensive Indexing** - Optimized database indexes for performance
- **Validation Rules** - Built-in data validation using Mongoose validators
- **Relationship Mapping** - Proper references between related entities
- **Audit Trail Support** - Timestamps and user tracking for all operations

## Installation

```bash
npm install
```

## Usage

### Basic Setup

```javascript
const mongoose = require('mongoose');
const schemas = require('./schemas');

// Connect to MongoDB
await mongoose.connect('mongodb://localhost:27017/alarynt-rules');

// Use the schemas
const { User, Rule, Action, Customer, Order, Product } = schemas;
```

### Creating a User

```javascript
const newUser = new User({
  id: 'user_123',
  email: 'user@company.com',
  name: 'John Doe',
  company: 'Acme Corp',
  role: 'Admin',
  password: 'hashedPassword'
});

await newUser.save();
```

### Creating a Business Rule

```javascript
const businessRule = new Rule({
  id: 'rule_456',
  name: 'High Value Customer Alert',
  description: 'Send notification when customer order exceeds threshold',
  dsl: `WHEN order.total > 1000
AND customer.tier == "premium"
THEN send_email(to: "sales@company.com", subject: "High Value Order")`,
  status: 'active',
  priority: 1,
  createdBy: user._id
});

await businessRule.save();
```

### Creating an Action

```javascript
const emailAction = new Action({
  id: 'action_789',
  name: 'Sales Team Email',
  description: 'Send email notifications to sales team',
  type: 'email',
  config: {
    to: 'sales@company.com',
    subject: 'High Value Order Alert',
    template: 'high-value-order'
  },
  status: 'active',
  createdBy: user._id
});

await emailAction.save();
```

### Recording Activity

```javascript
const activity = new Activity({
  id: 'activity_101',
  type: 'rule_created',
  message: 'New rule "High Value Customer Alert" created',
  status: 'success',
  userId: user._id,
  ruleId: rule._id
});

await activity.save();
```

## Schema Details

### Core Entities

#### User Schema
- Handles authentication and user management
- Supports role-based access control
- Tracks login history and user activity

#### Rule Schema
- Stores business rules with DSL syntax
- Supports priority-based execution
- Tracks execution statistics and success rates
- Maintains audit trail with creator and modification history

#### Action Schema
- Flexible configuration storage for different action types
- Supports email, SMS, webhook, database, and notification actions
- Performance tracking and error handling

#### Activity Schema
- Comprehensive audit trail for all system events
- Filterable by type, status, user, and time range
- Supports detailed error tracking and debugging

### Business Domain Entities

#### Customer Schema
- Customer tier management (basic, premium, enterprise, vip)
- Order history and spending analytics
- Address and contact information management

#### Order Schema
- Complete order lifecycle tracking
- Item-level details with product references
- Payment and shipping status management
- Financial calculations (subtotal, tax, shipping)

#### Product Schema
- Inventory management with threshold alerts
- Supplier relationship tracking
- Category-based organization
- Full-text search capabilities

### Performance and Monitoring

#### PerformanceData Schema
- Time-series data for system metrics
- Execution counts and response times
- Success/failure tracking over time

#### RulePerformance & ActionPerformance
- Individual entity performance tracking
- Average response times and success rates
- Historical trend analysis

#### ErrorAnalysis Schema
- Error categorization and impact assessment
- Resolution tracking and status management
- Statistical analysis for system improvements

## Database Indexes

The schemas include optimized indexes for:

- **Performance**: Frequently queried fields like status, dates, and execution counts
- **Search**: Full-text search on names and descriptions
- **Relationships**: Foreign key references for efficient joins
- **Analytics**: Time-based queries for reporting and monitoring

## DSL (Domain Specific Language) Support

The system supports a powerful DSL for defining business rules:

```dsl
WHEN order.total > 1000
AND customer.tier == "premium"  
THEN send_email(to: "sales@company.com", subject: "High Value Order")
AND update_database(table: "alerts", data: {type: "high_value", customer_id: customer.id})
```

### DSL Features
- Conditional logic with WHEN, AND, OR statements
- Action execution with THEN clauses
- Variable interpolation with {variable} syntax
- Multiple action chaining

## Data Relationships

```
User (1) -> (N) Rules
User (1) -> (N) Actions
User (1) -> (N) Activities

Rule (1) -> (N) RuleExecutions
Action (1) -> (N) ActionPerformance

Customer (1) -> (N) Orders
Order (N) -> (N) Products (via items array)

RuleExecution (N) -> (1) Rule
RuleExecution (N) -> (N) Actions (via actionsExecuted array)
```

## Best Practices

### 1. Always use transactions for related operations
```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  await rule.save({ session });
  await activity.save({ session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### 2. Use proper indexing for queries
```javascript
// Good - uses indexed field
const activeRules = await Rule.find({ status: 'active' });

// Good - uses compound index
const userActivities = await Activity
  .find({ userId: user._id })
  .sort({ timestamp: -1 });
```

### 3. Validate data before saving
```javascript
const rule = new Rule(ruleData);
const validationError = rule.validateSync();
if (validationError) {
  throw new Error(`Validation failed: ${validationError.message}`);
}
await rule.save();
```

### 4. Use aggregation for analytics
```javascript
const ruleStats = await Rule.aggregate([
  { $match: { status: 'active' } },
  { $group: {
    _id: null,
    totalRules: { $sum: 1 },
    avgSuccessRate: { $avg: '$successRate' },
    totalExecutions: { $sum: '$executionCount' }
  }}
]);
```

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/alarynt-rules
MONGODB_OPTIONS=retryWrites=true&w=majority
```

## Testing

```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run linting and formatting
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

**Built with ❤️ by the Alarynt Team**
