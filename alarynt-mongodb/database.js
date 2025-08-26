/**
 * Database Connection and Initialization Script
 * 
 * This module handles MongoDB connection, initialization, and provides
 * utility functions for database operations.
 */

const mongoose = require('mongoose');
const schemas = require('./schemas');

/**
 * Database Configuration
 */
const config = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/alarynt-rules',
  options: {
    retryWrites: true,
    w: 'majority',
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferMaxEntries: 0,
    bufferCommands: false,
  }
};

/**
 * Connect to MongoDB
 * @param {string} uri - MongoDB connection string
 * @param {object} options - Connection options
 * @returns {Promise<mongoose.Connection>} - MongoDB connection
 */
async function connect(uri = config.uri, options = config.options) {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, options);
    console.log('✅ MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 * @returns {Promise<void>}
 */
async function disconnect() {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected successfully');
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error.message);
    throw error;
  }
}

/**
 * Initialize database with sample data
 * @returns {Promise<void>}
 */
async function initializeDatabase() {
  console.log('Initializing database with sample data...');
  
  try {
    // Create sample admin user
    const adminUser = new schemas.User({
      id: 'admin_001',
      email: 'admin@alarynt.com',
      name: 'System Administrator',
      company: 'Alarynt',
      role: 'Admin',
      password: 'hashed_password_here' // In production, use proper password hashing
    });
    await adminUser.save();
    console.log('✅ Admin user created');

    // Create sample customer
    const sampleCustomer = new schemas.Customer({
      id: 'cust_001',
      name: 'John Doe',
      email: 'john.doe@example.com',
      tier: 'premium',
      company: 'Acme Corp',
      totalOrders: 5,
      totalSpent: 15000
    });
    await sampleCustomer.save();
    console.log('✅ Sample customer created');

    // Create sample product
    const sampleProduct = new schemas.Product({
      id: 'prod_001',
      name: 'Premium Widget',
      sku: 'WIDGET-001',
      category: 'Widgets',
      price: 99.99,
      inventory: 50,
      minThreshold: 10,
      supplier: {
        name: 'Widget Supplies Inc',
        email: 'orders@widgetsupplies.com'
      }
    });
    await sampleProduct.save();
    console.log('✅ Sample product created');

    // Create sample business rule
    const sampleRule = new schemas.Rule({
      id: 'rule_001',
      name: 'High Value Customer Alert',
      description: 'Notify sales team when premium customer places large order',
      dsl: `WHEN order.total > 1000
AND customer.tier == "premium"
THEN send_email(to: "sales@alarynt.com", subject: "High Value Order Alert")`,
      status: 'active',
      priority: 1,
      createdBy: adminUser._id
    });
    await sampleRule.save();
    console.log('✅ Sample rule created');

    // Create sample action
    const sampleAction = new schemas.Action({
      id: 'action_001',
      name: 'Sales Team Email',
      description: 'Send email notification to sales team',
      type: 'email',
      config: {
        to: 'sales@alarynt.com',
        subject: 'High Value Order Alert',
        template: 'high-value-order',
        cc: ['manager@alarynt.com']
      },
      status: 'active',
      createdBy: adminUser._id
    });
    await sampleAction.save();
    console.log('✅ Sample action created');

    // Create sample activity
    const sampleActivity = new schemas.Activity({
      id: 'activity_001',
      type: 'system_maintenance',
      message: 'Database initialized with sample data',
      status: 'success',
      userId: adminUser._id
    });
    await sampleActivity.save();
    console.log('✅ Sample activity recorded');

    console.log('🎉 Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
}

/**
 * Clear all collections (USE WITH CAUTION!)
 * @returns {Promise<void>}
 */
async function clearDatabase() {
  console.log('⚠️  Clearing all database collections...');
  
  const collections = Object.values(schemas);
  
  for (const Model of collections) {
    try {
      await Model.deleteMany({});
      console.log(`✅ Cleared ${Model.modelName} collection`);
    } catch (error) {
      console.error(`❌ Failed to clear ${Model.modelName}:`, error.message);
    }
  }
  
  console.log('🧹 Database cleared successfully');
}

/**
 * Get database statistics
 * @returns {Promise<object>} - Database statistics
 */
async function getDatabaseStats() {
  const stats = {};
  const collections = Object.values(schemas);
  
  for (const Model of collections) {
    try {
      const count = await Model.countDocuments();
      stats[Model.modelName] = count;
    } catch (error) {
      console.error(`Failed to get stats for ${Model.modelName}:`, error.message);
      stats[Model.modelName] = 'Error';
    }
  }
  
  return stats;
}

/**
 * Health check for database connection
 * @returns {Promise<object>} - Health status
 */
async function healthCheck() {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    if (state === 1) {
      // Test database operation
      await schemas.User.findOne({}).limit(1);
      
      return {
        status: 'healthy',
        state: states[state],
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        status: 'unhealthy',
        state: states[state],
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Create database indexes for optimal performance
 * @returns {Promise<void>}
 */
async function createIndexes() {
  console.log('Creating database indexes...');
  
  const collections = Object.values(schemas);
  
  for (const Model of collections) {
    try {
      await Model.createIndexes();
      console.log(`✅ Indexes created for ${Model.modelName}`);
    } catch (error) {
      console.error(`❌ Failed to create indexes for ${Model.modelName}:`, error.message);
    }
  }
  
  console.log('📊 Database indexes created successfully');
}

/**
 * Backup database to JSON files
 * @param {string} backupDir - Directory to save backup files
 * @returns {Promise<void>}
 */
async function backupDatabase(backupDir = './backup') {
  const fs = require('fs').promises;
  const path = require('path');
  
  console.log(`Creating database backup in ${backupDir}...`);
  
  try {
    // Create backup directory if it doesn't exist
    await fs.mkdir(backupDir, { recursive: true });
    
    const collections = Object.values(schemas);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    for (const Model of collections) {
      try {
        const data = await Model.find({}).lean();
        const filename = `${Model.modelName.toLowerCase()}_${timestamp}.json`;
        const filepath = path.join(backupDir, filename);
        
        await fs.writeFile(filepath, JSON.stringify(data, null, 2));
        console.log(`✅ Backed up ${Model.modelName} (${data.length} documents)`);
      } catch (error) {
        console.error(`❌ Failed to backup ${Model.modelName}:`, error.message);
      }
    }
    
    // Create metadata file
    const metadata = {
      timestamp: new Date().toISOString(),
      collections: collections.map(Model => Model.modelName),
      version: '1.0.0'
    };
    
    await fs.writeFile(
      path.join(backupDir, `metadata_${timestamp}.json`),
      JSON.stringify(metadata, null, 2)
    );
    
    console.log('💾 Database backup completed successfully');
  } catch (error) {
    console.error('❌ Database backup failed:', error.message);
    throw error;
  }
}

// Connection event handlers
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ Mongoose connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('📡 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  await disconnect();
  process.exit(0);
});

module.exports = {
  connect,
  disconnect,
  initializeDatabase,
  clearDatabase,
  getDatabaseStats,
  healthCheck,
  createIndexes,
  backupDatabase,
  schemas,
  config
};

// If run directly, connect to database and initialize
if (require.main === module) {
  (async () => {
    try {
      await connect();
      await createIndexes();
      
      // Check if database is empty, if so initialize with sample data
      const stats = await getDatabaseStats();
      const totalDocuments = Object.values(stats).reduce((sum, count) => sum + (typeof count === 'number' ? count : 0), 0);
      
      if (totalDocuments === 0) {
        console.log('Empty database detected, initializing with sample data...');
        await initializeDatabase();
      }
      
      console.log('📊 Current database statistics:', stats);
      console.log('🚀 Database ready for use!');
    } catch (error) {
      console.error('❌ Failed to initialize database:', error.message);
      process.exit(1);
    }
  })();
}