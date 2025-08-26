/**
 * Database Manager for Alarynt Lambda
 * 
 * This module handles MongoDB connection and provides access to schemas
 * from the alarynt-mongodb module.
 */

const mongoose = require('mongoose');
const path = require('path');

// Import schemas from alarynt-mongodb
const mongodbPath = path.join(__dirname, '../../alarynt-mongodb');
const schemas = require(path.join(mongodbPath, 'schemas'));

/**
 * Database configuration
 */
const config = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/alarynt-rules',
  options: {
    retryWrites: true,
    w: 'majority',
    maxPoolSize: 5, // Reduced for Lambda
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 30000, // Reduced for Lambda timeout
    bufferMaxEntries: 0,
    bufferCommands: false,
    // Lambda-specific optimizations
    maxIdleTimeMS: 30000,
    minPoolSize: 0
  }
};

/**
 * Connection state management
 */
let isConnected = false;

/**
 * Connect to MongoDB with Lambda optimizations
 * @param {string} uri - MongoDB connection string
 * @param {object} options - Connection options
 * @returns {Promise<mongoose.Connection>} - MongoDB connection
 */
async function connect(uri = config.uri, options = config.options) {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('🔄 Reusing existing MongoDB connection');
    return mongoose.connection;
  }

  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(uri, options);
    
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
    
    // Set up connection event handlers
    setupConnectionHandlers();
    
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    isConnected = false;
    throw error;
  }
}

/**
 * Setup connection event handlers for monitoring
 */
function setupConnectionHandlers() {
  mongoose.connection.on('connected', () => {
    console.log('📡 Mongoose connected to MongoDB');
    isConnected = true;
  });

  mongoose.connection.on('error', (error) => {
    console.error('❌ Mongoose connection error:', error);
    isConnected = false;
  });

  mongoose.connection.on('disconnected', () => {
    console.log('📡 Mongoose disconnected from MongoDB');
    isConnected = false;
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 Mongoose reconnected to MongoDB');
    isConnected = true;
  });
}

/**
 * Health check for database connection
 * @returns {Promise<boolean>} - Connection status
 */
async function isHealthy() {
  try {
    if (!isConnected || mongoose.connection.readyState !== 1) {
      return false;
    }
    
    // Test with a simple query
    await schemas.User.findOne({}).limit(1).maxTimeMS(5000);
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error.message);
    return false;
  }
}

/**
 * Get database statistics quickly
 * @returns {Promise<object>} - Quick database stats
 */
async function getQuickStats() {
  try {
    const stats = {
      isConnected,
      readyState: mongoose.connection.readyState,
      connectionName: mongoose.connection.name
    };
    
    if (isConnected) {
      // Only count a few collections to avoid timeout
      stats.users = await schemas.User.estimatedDocumentCount();
      stats.rules = await schemas.Rule.estimatedDocumentCount();
      stats.actions = await schemas.Action.estimatedDocumentCount();
    }
    
    return stats;
  } catch (error) {
    return {
      isConnected: false,
      error: error.message
    };
  }
}

/**
 * Query helper functions optimized for Lambda
 */
const queryHelpers = {
  /**
   * Get active rules with pagination
   */
  async getActiveRules(filters = {}, limit = 100) {
    return await schemas.Rule
      .find({ status: 'active', ...filters })
      .sort({ priority: 1, createdAt: -1 })
      .limit(limit)
      .lean()
      .maxTimeMS(10000);
  },

  /**
   * Get rule by ID
   */
  async getRuleById(ruleId) {
    return await schemas.Rule
      .findOne({ $or: [{ id: ruleId }, { _id: ruleId }] })
      .lean()
      .maxTimeMS(5000);
  },

  /**
   * Get rules by tags or event types
   */
  async getRulesByTags(tags) {
    return await schemas.Rule
      .find({ 
        status: 'active',
        tags: { $in: Array.isArray(tags) ? tags : [tags] }
      })
      .sort({ priority: 1 })
      .lean()
      .maxTimeMS(10000);
  },

  /**
   * Get action by ID
   */
  async getActionById(actionId) {
    return await schemas.Action
      .findOne({ $or: [{ id: actionId }, { _id: actionId }] })
      .lean()
      .maxTimeMS(5000);
  },

  /**
   * Get customer data
   */
  async getCustomer(customerId) {
    return await schemas.Customer
      .findOne({ $or: [{ id: customerId }, { _id: customerId }] })
      .lean()
      .maxTimeMS(5000);
  },

  /**
   * Get order data with customer population
   */
  async getOrder(orderId) {
    return await schemas.Order
      .findOne({ $or: [{ id: orderId }, { _id: orderId }] })
      .populate('customerId')
      .lean()
      .maxTimeMS(5000);
  },

  /**
   * Get product data
   */
  async getProduct(productId) {
    return await schemas.Product
      .findOne({ $or: [{ id: productId }, { _id: productId }] })
      .lean()
      .maxTimeMS(5000);
  },

  /**
   * Create rule execution record
   */
  async createRuleExecution(executionData) {
    const ruleExecution = new schemas.RuleExecution(executionData);
    return await ruleExecution.save();
  },

  /**
   * Update rule performance metrics
   */
  async updateRulePerformance(ruleId, executionTime, success) {
    await schemas.Rule.findOneAndUpdate(
      { $or: [{ id: ruleId }, { _id: ruleId }] },
      {
        $inc: {
          executionCount: 1,
          ...(success ? {} : { failureCount: 1 })
        },
        $set: {
          lastExecuted: new Date(),
          ...(success ? { lastSuccessfulExecution: new Date() } : {})
        }
      }
    );
  },

  /**
   * Update action performance metrics
   */
  async updateActionPerformance(actionId, executionTime, success) {
    await schemas.Action.findOneAndUpdate(
      { $or: [{ id: actionId }, { _id: actionId }] },
      {
        $inc: {
          executionCount: 1,
          ...(success ? {} : { failureCount: 1 })
        },
        $set: {
          lastExecuted: new Date()
        }
      }
    );
  },

  /**
   * Log activity
   */
  async logActivity(activityData) {
    const activity = new schemas.Activity({
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...activityData,
      timestamp: new Date()
    });
    return await activity.save();
  }
};

module.exports = {
  connect,
  isHealthy,
  getQuickStats,
  schemas,
  config,
  queryHelpers,
  isConnected: () => isConnected
};