import mongoose from 'mongoose';

// User Schema
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

// Activity Schema
const activitySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['rule_created', 'rule_updated', 'rule_deleted', 'action_executed', 'action_failed', 'rule_triggered', 'user_login', 'user_logout', 'system_error', 'system_maintenance']
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
    enum: ['success', 'warning', 'error', 'info']
  },
  user: String,
  userId: String,
  ruleName: String,
  ruleId: String,
  actionName: String,
  actionId: String,
  details: String,
  metadata: mongoose.Schema.Types.Mixed
});

// Rule Schema
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
    default: Date.now
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
    default: 0
  },
  createdBy: {
    type: String,
    required: true
  },
  tags: [String]
});

// Action Schema
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
    default: Date.now
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
    default: 0
  },
  createdBy: {
    type: String,
    required: true
  }
});

// Customer Schema
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
  tier: {
    type: String,
    required: true,
    enum: ['basic', 'premium', 'enterprise', 'vip']
  },
  company: String,
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

// Rule Execution Schema
const ruleExecutionSchema = new mongoose.Schema({
  ruleId: {
    type: String,
    required: true
  },
  executionId: {
    type: String,
    required: true,
    unique: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: ['success', 'failed', 'running', 'cancelled']
  },
  totalResponseTime: {
    type: Number
  },
  triggeredBy: {
    eventType: String,
    eventData: mongoose.Schema.Types.Mixed
  },
  conditions: [{
    condition: String,
    result: Boolean,
    evaluatedAt: Date
  }],
  actions: [{
    actionId: String,
    actionType: String,
    status: String,
    executedAt: Date,
    responseTime: Number,
    result: mongoose.Schema.Types.Mixed
  }],
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export models
export const User = mongoose.model('User', userSchema);
export const Activity = mongoose.model('Activity', activitySchema);
export const Rule = mongoose.model('Rule', ruleSchema);
export const Action = mongoose.model('Action', actionSchema);
export const Customer = mongoose.model('Customer', customerSchema);
export const RuleExecution = mongoose.model('RuleExecution', ruleExecutionSchema);

// Export schemas object for backward compatibility
export const schemas = {
  User,
  Activity,
  Rule,
  Action,
  Customer,
  RuleExecution
}; 