/**
 * MongoDB Schemas for Alarynt Rule Engine
 * 
 * These schemas are based on the data structures used in the 
 * alarynt-customer-portal frontend application.
 */

const mongoose = require('mongoose');

// ===============================
// CORE APPLICATION SCHEMAS
// ===============================

/**
 * User Schema
 * Handles authentication and user management
 */
const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['Admin', 'Manager', 'User', 'Viewer']
  },
  password: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Rule Schema
 * Business rules with DSL (Domain Specific Language)
 */
const ruleSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  dsl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'draft']
  },
  priority: {
    type: Number,
    required: true,
    min: 1
  },
  createdAt: {
    type: Date,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastExecuted: {
    type: Date
  },
  executionCount: {
    type: Number,
    default: 0
  },
  successRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }]
});

/**
 * Action Schema
 * Actions that can be executed by rules
 */
const actionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['email', 'sms', 'webhook', 'database', 'notification']
  },
  config: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'draft']
  },
  createdAt: {
    type: Date,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastExecuted: {
    type: Date
  },
  executionCount: {
    type: Number,
    default: 0
  },
  successRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

/**
 * Activity Schema
 * System activity logs and audit trail
 */
const activitySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'rule_created', 'rule_updated', 'rule_deleted', 
      'action_executed', 'action_failed', 'rule_triggered', 
      'user_login', 'user_logout', 'system_error', 'system_maintenance'
    ]
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
    enum: ['success', 'warning', 'error', 'info']
  },
  user: {
    type: String,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ruleName: {
    type: String,
    trim: true
  },
  ruleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rule'
  },
  actionName: {
    type: String,
    trim: true
  },
  actionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Action'
  },
  details: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
});

/**
 * Performance Data Schema
 * System performance metrics over time
 */
const performanceDataSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  executions: {
    type: Number,
    required: true,
    default: 0
  },
  success: {
    type: Number,
    required: true,
    default: 0
  },
  failed: {
    type: Number,
    required: true,
    default: 0
  },
  responseTime: {
    type: Number,
    required: true,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Rule Performance Schema
 * Individual rule performance tracking
 */
const rulePerformanceSchema = new mongoose.Schema({
  ruleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rule',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  executions: {
    type: Number,
    required: true,
    default: 0
  },
  success: {
    type: Number,
    required: true,
    default: 0
  },
  failed: {
    type: Number,
    required: true,
    default: 0
  },
  avgResponse: {
    type: Number,
    required: true,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

/**
 * Action Performance Schema
 * Individual action performance tracking
 */
const actionPerformanceSchema = new mongoose.Schema({
  actionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Action',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  executions: {
    type: Number,
    required: true,
    default: 0
  },
  success: {
    type: Number,
    required: true,
    default: 0
  },
  failed: {
    type: Number,
    required: true,
    default: 0
  },
  avgResponse: {
    type: Number,
    required: true,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

/**
 * Error Analysis Schema
 * Error tracking and categorization
 */
const errorAnalysisSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    trim: true
  },
  count: {
    type: Number,
    required: true,
    default: 0
  },
  percentage: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 100
  },
  impact: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Critical']
  },
  firstOccurrence: {
    type: Date,
    default: Date.now
  },
  lastOccurrence: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String
  },
  resolution: {
    type: String
  },
  isResolved: {
    type: Boolean,
    default: false
  }
});

// ===============================
// BUSINESS DOMAIN SCHEMAS
// ===============================

/**
 * Customer Schema
 * Customer data referenced in business rules
 */
const customerSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  tier: {
    type: String,
    required: true,
    enum: ['basic', 'premium', 'enterprise', 'vip']
  },
  company: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Order Schema
 * Order data referenced in business rules
 */
const orderSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  total: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  shipping: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'failed', 'refunded']
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Product Schema
 * Product/inventory data referenced in business rules
 */
const productSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  cost: {
    type: Number,
    min: 0
  },
  inventory: {
    type: Number,
    required: true,
    min: 0
  },
  minThreshold: {
    type: Number,
    required: true,
    min: 0
  },
  maxThreshold: {
    type: Number,
    min: 0
  },
  supplier: {
    name: String,
    contact: String,
    email: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// ===============================
// RULE EXECUTION SCHEMAS
// ===============================

/**
 * Rule Execution Schema
 * Track individual rule executions for auditing and debugging
 */
const ruleExecutionSchema = new mongoose.Schema({
  ruleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rule',
    required: true
  },
  executionId: {
    type: String,
    required: true,
    unique: true
  },
  triggeredBy: {
    eventType: {
      type: String,
      required: true
    },
    eventData: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  conditions: [{
    condition: String,
    result: Boolean,
    evaluatedAt: Date
  }],
  actionsExecuted: [{
    actionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Action'
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'skipped']
    },
    executedAt: Date,
    responseTime: Number,
    error: String,
    result: mongoose.Schema.Types.Mixed
  }],
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  totalResponseTime: {
    type: Number
  },
  status: {
    type: String,
    required: true,
    enum: ['success', 'partial_success', 'failed']
  },
  errorMessage: {
    type: String
  }
});

// ===============================
// INDEXES FOR PERFORMANCE
// ===============================

// User indexes
userSchema.index({ email: 1 });
userSchema.index({ company: 1 });
userSchema.index({ createdAt: -1 });

// Rule indexes
ruleSchema.index({ status: 1 });
ruleSchema.index({ priority: 1 });
ruleSchema.index({ createdAt: -1 });
ruleSchema.index({ executionCount: -1 });
ruleSchema.index({ successRate: -1 });

// Action indexes
actionSchema.index({ type: 1 });
actionSchema.index({ status: 1 });
actionSchema.index({ createdAt: -1 });
actionSchema.index({ executionCount: -1 });

// Activity indexes
activitySchema.index({ type: 1 });
activitySchema.index({ status: 1 });
activitySchema.index({ timestamp: -1 });
activitySchema.index({ userId: 1, timestamp: -1 });

// Performance indexes
performanceDataSchema.index({ date: -1 });
rulePerformanceSchema.index({ ruleId: 1 });
actionPerformanceSchema.index({ actionId: 1 });

// Customer indexes
customerSchema.index({ email: 1 });
customerSchema.index({ tier: 1 });
customerSchema.index({ totalSpent: -1 });
customerSchema.index({ createdAt: -1 });

// Order indexes
orderSchema.index({ customerId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ total: -1 });
orderSchema.index({ createdAt: -1 });

// Product indexes
productSchema.index({ sku: 1 });
productSchema.index({ category: 1 });
productSchema.index({ inventory: 1 });
productSchema.index({ name: 'text', description: 'text' });

// Rule Execution indexes
ruleExecutionSchema.index({ ruleId: 1, startTime: -1 });
ruleExecutionSchema.index({ executionId: 1 });
ruleExecutionSchema.index({ startTime: -1 });
ruleExecutionSchema.index({ status: 1 });

// ===============================
// MODEL EXPORTS
// ===============================

module.exports = {
  User: mongoose.model('User', userSchema),
  Rule: mongoose.model('Rule', ruleSchema),
  Action: mongoose.model('Action', actionSchema),
  Activity: mongoose.model('Activity', activitySchema),
  PerformanceData: mongoose.model('PerformanceData', performanceDataSchema),
  RulePerformance: mongoose.model('RulePerformance', rulePerformanceSchema),
  ActionPerformance: mongoose.model('ActionPerformance', actionPerformanceSchema),
  ErrorAnalysis: mongoose.model('ErrorAnalysis', errorAnalysisSchema),
  Customer: mongoose.model('Customer', customerSchema),
  Order: mongoose.model('Order', orderSchema),
  Product: mongoose.model('Product', productSchema),
  RuleExecution: mongoose.model('RuleExecution', ruleExecutionSchema)
};