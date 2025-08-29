/**
 * MongoDB Seed Script for Alarynt Rule Engine
 * 
 * This script generates comprehensive fake data for development and testing.
 * It creates realistic data that maintains proper relationships between entities.
 */

const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
const schemas = require('./schemas');

/**
 * Seed Configuration
 */
const SEED_CONFIG = {
  users: 25,
  customers: 100,
  products: 75,
  orders: 200,
  rules: 30,
  actions: 40,
  activities: 150,
  performanceData: 90,
  ruleExecutions: 300,
  errorAnalyses: 25
};

/**
 * Database connection configuration
 */
const config = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/alarynt-rules',
  options: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }
};

/**
 * Arrays to store created entities for referencing
 */
let createdUsers = [];
let createdCustomers = [];
let createdProducts = [];
let createdOrders = [];
let createdRules = [];
let createdActions = [];

/**
 * Helper function to generate realistic DSL for rules
 */
function generateRuleDSL() {
  const conditions = [
    'order.total > 1000',
    'customer.tier == "premium"',
    'customer.tier == "vip"',
    'product.inventory < product.minThreshold',
    'order.items.length > 5',
    'customer.totalSpent > 50000',
    'order.shippingAddress.country != "US"',
    'customer.isActive == true',
    'product.category == "Electronics"',
    'order.paymentMethod == "credit_card"'
  ];
  
  const actions = [
    'send_email(to: "sales@alarynt.com", subject: "High Value Order Alert")',
    'send_sms(to: customer.phone, message: "Thank you for your order!")',
    'create_discount(percentage: 10, validFor: "30 days")',
    'escalate_to_manager(urgency: "high")',
    'send_inventory_alert(to: "inventory@alarynt.com")',
    'apply_loyalty_points(points: 100)',
    'schedule_follow_up(days: 7)',
    'update_customer_tier(tier: "premium")'
  ];

  const numConditions = faker.number.int({ min: 1, max: 3 });
  const selectedConditions = faker.helpers.arrayElements(conditions, numConditions);
  const selectedAction = faker.helpers.arrayElement(actions);
  
  const conditionStr = selectedConditions.join('\nAND ');
  return `WHEN ${conditionStr}\nTHEN ${selectedAction}`;
}

/**
 * Generate realistic action configurations
 */
function generateActionConfig(type) {
  const configs = {
    email: {
      to: faker.internet.email(),
      subject: faker.lorem.sentence(),
      template: faker.helpers.arrayElement(['welcome', 'order-confirmation', 'high-value-order', 'inventory-alert']),
      cc: [faker.internet.email(), faker.internet.email()]
    },
    sms: {
      to: faker.phone.number(),
      message: faker.lorem.sentence({ min: 5, max: 15 })
    },
    webhook: {
      url: faker.internet.url(),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${faker.string.alphanumeric(32)}`
      },
      retries: faker.number.int({ min: 1, max: 5 })
    },
    database: {
      collection: faker.helpers.arrayElement(['customers', 'orders', 'products']),
      operation: faker.helpers.arrayElement(['update', 'insert', 'delete']),
      query: { id: faker.string.uuid() }
    }
  };
  
  return configs[type] || {};
}

/**
 * Clear existing data from all collections
 */
async function clearDatabase() {
  console.log('🧹 Clearing existing data...');
  
  const collections = Object.values(schemas);
  for (const Model of collections) {
    await Model.deleteMany({});
  }
  
  console.log('✅ Database cleared');
}

/**
 * Generate Users
 */
async function seedUsers() {
  console.log(`👥 Creating ${SEED_CONFIG.users} users...`);
  
  const users = [];
  const roles = ['Admin', 'Manager', 'User', 'Viewer'];
  const companies = [
    'Alarynt Inc', 'TechCorp Solutions', 'Global Dynamics', 'Innovate Systems',
    'Digital Ventures', 'Cloud Nine Technologies', 'NextGen Analytics', 'Future Labs'
  ];

  for (let i = 0; i < SEED_CONFIG.users; i++) {
    const user = new schemas.User({
      id: `user_${faker.string.alphanumeric(8)}`,
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      company: faker.helpers.arrayElement(companies),
      role: faker.helpers.arrayElement(roles),
      password: faker.internet.password({ length: 12 }),
      isActive: faker.datatype.boolean(0.9),
      lastLogin: faker.date.recent({ days: 30 }),
      createdAt: faker.date.past({ years: 2 })
    });
    
    users.push(user);
  }
  
  createdUsers = await schemas.User.insertMany(users);
  console.log(`✅ ${createdUsers.length} users created`);
}

/**
 * Generate Customers
 */
async function seedCustomers() {
  console.log(`🏢 Creating ${SEED_CONFIG.customers} customers...`);
  
  const customers = [];
  const tiers = ['basic', 'premium', 'enterprise', 'vip'];
  const countries = ['US', 'CA', 'UK', 'DE', 'FR', 'AU', 'JP', 'BR'];

  for (let i = 0; i < SEED_CONFIG.customers; i++) {
    const totalOrders = faker.number.int({ min: 0, max: 50 });
    const totalSpent = totalOrders * faker.number.float({ min: 50, max: 2000, multipleOf: 0.01 });
    
    const customer = new schemas.Customer({
      id: `cust_${faker.string.alphanumeric(8)}`,
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      phone: faker.phone.number(),
      tier: faker.helpers.arrayElement(tiers),
      company: faker.company.name(),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.helpers.arrayElement(countries)
      },
      totalOrders,
      totalSpent,
      isActive: faker.datatype.boolean(0.85),
      createdAt: faker.date.past({ years: 3 })
    });
    
    customers.push(customer);
  }
  
  createdCustomers = await schemas.Customer.insertMany(customers);
  console.log(`✅ ${createdCustomers.length} customers created`);
}

/**
 * Generate Products
 */
async function seedProducts() {
  console.log(`📦 Creating ${SEED_CONFIG.products} products...`);
  
  const products = [];
  const categories = [
    'Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports & Outdoors',
    'Health & Beauty', 'Automotive', 'Tools & Hardware', 'Food & Beverage'
  ];

  for (let i = 0; i < SEED_CONFIG.products; i++) {
    const price = faker.number.float({ min: 10, max: 2000, multipleOf: 0.01 });
    const cost = price * faker.number.float({ min: 0.3, max: 0.8, multipleOf: 0.01 });
    const inventory = faker.number.int({ min: 0, max: 500 });
    const minThreshold = faker.number.int({ min: 5, max: 50 });
    
    const product = new schemas.Product({
      id: `prod_${faker.string.alphanumeric(8)}`,
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
      category: faker.helpers.arrayElement(categories),
      price,
      cost,
      inventory,
      minThreshold,
      maxThreshold: minThreshold * faker.number.int({ min: 5, max: 20 }),
      supplier: {
        name: faker.company.name(),
        contact: faker.person.fullName(),
        email: faker.internet.email()
      },
      isActive: faker.datatype.boolean(0.9),
      createdAt: faker.date.past({ years: 2 })
    });
    
    products.push(product);
  }
  
  createdProducts = await schemas.Product.insertMany(products);
  console.log(`✅ ${createdProducts.length} products created`);
}

/**
 * Generate Orders
 */
async function seedOrders() {
  console.log(`🛒 Creating ${SEED_CONFIG.orders} orders...`);
  
  const orders = [];
  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
  const paymentMethods = ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'crypto'];

  for (let i = 0; i < SEED_CONFIG.orders; i++) {
    const numItems = faker.number.int({ min: 1, max: 8 });
    const items = [];
    let subtotal = 0;
    
    // Generate order items
    for (let j = 0; j < numItems; j++) {
      const product = faker.helpers.arrayElement(createdProducts);
      const quantity = faker.number.int({ min: 1, max: 5 });
             const price = product.price * faker.number.float({ min: 0.8, max: 1.2, multipleOf: 0.01 });
      
      items.push({
        productId: product._id,
        productName: product.name,
        quantity,
        price,
        total: quantity * price
      });
      
      subtotal += quantity * price;
    }
    
    const tax = subtotal * 0.08;
    const shipping = faker.number.float({ min: 5, max: 25, multipleOf: 0.01 });
    const total = subtotal + tax + shipping;
    
    const customer = faker.helpers.arrayElement(createdCustomers);
    
    const order = new schemas.Order({
      id: `ord_${faker.string.alphanumeric(8)}`,
      customerId: customer._id,
      customerName: customer.name,
      customerEmail: customer.email,
      items,
      subtotal,
      tax,
      shipping,
      total,
      status: faker.helpers.arrayElement(statuses),
      paymentStatus: faker.helpers.arrayElement(['pending', 'paid', 'failed', 'refunded']),
      paymentMethod: faker.helpers.arrayElement(paymentMethods),
      shippingAddress: customer.address,
      billingAddress: faker.datatype.boolean(0.7) ? customer.address : {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: customer.address.country
      },
      notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : '',
      createdAt: faker.date.past({ years: 1 })
    });
    
    orders.push(order);
  }
  
  createdOrders = await schemas.Order.insertMany(orders);
  console.log(`✅ ${createdOrders.length} orders created`);
}

/**
 * Generate Rules
 */
async function seedRules() {
  console.log(`📋 Creating ${SEED_CONFIG.rules} rules...`);
  
  const rules = [];
  const statuses = ['active', 'inactive', 'draft'];
  const ruleNames = [
    'High Value Customer Alert', 'Low Inventory Warning', 'VIP Customer Priority',
    'Bulk Order Discount', 'International Shipping Alert', 'Payment Failed Recovery',
    'Customer Retention Campaign', 'Seasonal Promotion Trigger', 'Loyalty Points Award',
    'Abandoned Cart Recovery', 'Product Recommendation Engine', 'Fraud Detection Alert'
  ];

  for (let i = 0; i < SEED_CONFIG.rules; i++) {
    const createdAt = faker.date.past({ years: 1 });
    const lastExecuted = faker.datatype.boolean(0.8) ? faker.date.between({ from: createdAt, to: new Date() }) : null;
    const executionCount = lastExecuted ? faker.number.int({ min: 1, max: 1000 }) : 0;
    
    const rule = new schemas.Rule({
      id: `rule_${faker.string.alphanumeric(8)}`,
      name: faker.helpers.arrayElement(ruleNames) + ` ${i + 1}`,
      description: faker.lorem.sentence({ min: 8, max: 20 }),
      dsl: generateRuleDSL(),
      status: faker.helpers.arrayElement(statuses),
      priority: faker.number.int({ min: 1, max: 10 }),
      createdAt,
      lastExecuted,
      executionCount,
      successRate: faker.number.float({ min: 75, max: 99.9, multipleOf: 0.1 }),
      createdBy: faker.helpers.arrayElement(createdUsers)._id,
      tags: faker.helpers.arrayElements(['automation', 'alerts', 'customer-service', 'sales', 'inventory', 'marketing'], { min: 1, max: 4 })
    });
    
    rules.push(rule);
  }
  
  createdRules = await schemas.Rule.insertMany(rules);
  console.log(`✅ ${createdRules.length} rules created`);
}

/**
 * Generate Actions
 */
async function seedActions() {
  console.log(`⚡ Creating ${SEED_CONFIG.actions} actions...`);
  
  const actions = [];
  const types = ['email', 'sms', 'webhook', 'database'];
  const statuses = ['active', 'inactive', 'draft'];
  const actionNames = [
    'Sales Team Email', 'Customer SMS Notification', 'Inventory Webhook',
    'Database Update', 'Manager Alert', 'Customer Welcome Email',
    'Order Confirmation SMS', 'Payment Webhook', 'Loyalty Points Update'
  ];

  for (let i = 0; i < SEED_CONFIG.actions; i++) {
    const type = faker.helpers.arrayElement(types);
    const lastExecuted = faker.datatype.boolean(0.7) ? faker.date.recent({ days: 30 }) : null;
    
    const action = new schemas.Action({
      id: `action_${faker.string.alphanumeric(8)}`,
      name: faker.helpers.arrayElement(actionNames) + ` ${i + 1}`,
      description: faker.lorem.sentence({ min: 6, max: 15 }),
      type,
      config: generateActionConfig(type),
      status: faker.helpers.arrayElement(statuses),
      lastExecuted,
      executionCount: lastExecuted ? faker.number.int({ min: 1, max: 500 }) : 0,
      successRate: faker.number.float({ min: 80, max: 99.5, multipleOf: 0.1 }),
      avgExecutionTime: faker.number.float({ min: 50, max: 2000, multipleOf: 1 }),
      createdBy: faker.helpers.arrayElement(createdUsers)._id,
      createdAt: faker.date.past({ years: 1 })
    });
    
    actions.push(action);
  }
  
  createdActions = await schemas.Action.insertMany(actions);
  console.log(`✅ ${createdActions.length} actions created`);
}

/**
 * Generate Activities
 */
async function seedActivities() {
  console.log(`📊 Creating ${SEED_CONFIG.activities} activities...`);
  
  const activities = [];
  const types = [
    'user_login', 'rule_created', 'rule_triggered', 'action_executed',
    'system_maintenance', 'system_error', 'user_logout'
  ];
  const statuses = ['success', 'warning', 'error', 'info'];

  for (let i = 0; i < SEED_CONFIG.activities; i++) {
    const type = faker.helpers.arrayElement(types);
    const status = faker.helpers.arrayElement(statuses);
    
    const activity = new schemas.Activity({
      id: `activity_${faker.string.alphanumeric(8)}`,
      type,
      message: generateActivityMessage(type, status),
      status,
      userId: faker.helpers.arrayElement(createdUsers)._id,
      metadata: {
        ip: faker.internet.ip(),
        userAgent: faker.internet.userAgent(),
        duration: faker.number.int({ min: 10, max: 5000 })
      },
      createdAt: faker.date.recent({ days: 90 })
    });
    
    activities.push(activity);
  }
  
  await schemas.Activity.insertMany(activities);
  console.log(`✅ ${activities.length} activities created`);
}

/**
 * Generate activity messages based on type and status
 */
function generateActivityMessage(type, status) {
  const messages = {
    user_login: {
      success: 'User logged in successfully',
      warning: 'User login from unusual location',
      error: 'Failed login attempt',
      info: 'User session started'
    },
    rule_executed: {
      success: 'Rule executed successfully',
      warning: 'Rule execution took longer than expected',
      error: 'Rule execution failed',
      info: 'Rule execution initiated'
    },
    system_maintenance: {
      success: 'System maintenance completed',
      warning: 'Maintenance window extended',
      error: 'Maintenance task failed',
      info: 'Scheduled maintenance started'
    }
  };
  
  return messages[type]?.[status] || `${type.replace('_', ' ')} - ${status}`;
}

/**
 * Generate Performance Data
 */
async function seedPerformanceData() {
  console.log(`📈 Creating ${SEED_CONFIG.performanceData} performance data entries...`);
  
  const performanceData = [];
  const metrics = ['response_time', 'throughput', 'error_rate', 'cpu_usage', 'memory_usage'];

  for (let i = 0; i < SEED_CONFIG.performanceData; i++) {
    const executions = faker.number.int({ min: 10, max: 1000 });
    const success = faker.number.int({ min: executions * 0.8, max: executions });
    const failed = executions - success;
    
    const data = new schemas.PerformanceData({
      date: faker.date.recent({ days: 30 }),
      executions,
      success,
      failed,
      responseTime: faker.number.float({ min: 10, max: 2000, multipleOf: 1 })
    });
    
    performanceData.push(data);
  }
  
  await schemas.PerformanceData.insertMany(performanceData);
  console.log(`✅ ${performanceData.length} performance data entries created`);
}

/**
 * Generate Rule Executions
 */
async function seedRuleExecutions() {
  console.log(`🔄 Creating ${SEED_CONFIG.ruleExecutions} rule executions...`);
  
  const executions = [];
  const statuses = ['success', 'failed', 'skipped', 'timeout'];

  for (let i = 0; i < SEED_CONFIG.ruleExecutions; i++) {
    const rule = faker.helpers.arrayElement(createdRules);
    const status = faker.helpers.arrayElement(statuses);
    const executionTime = faker.number.int({ min: 10, max: 5000 });
    
    const startTime = faker.date.recent({ days: 60 });
    const endTime = faker.date.between({ from: startTime, to: new Date() });
    const totalResponseTime = endTime.getTime() - startTime.getTime();
    
    const execution = new schemas.RuleExecution({
      ruleId: rule._id,
      executionId: `exec_${faker.string.alphanumeric(8)}`,
      triggeredBy: {
        eventType: faker.helpers.arrayElement(['order_created', 'customer_updated', 'product_low_stock', 'scheduled_task']),
        eventData: {
          customerId: faker.helpers.arrayElement(createdCustomers)._id,
          orderId: faker.datatype.boolean(0.7) ? faker.helpers.arrayElement(createdOrders)._id : null,
          productId: faker.datatype.boolean(0.5) ? faker.helpers.arrayElement(createdProducts)._id : null
        }
      },
      conditions: [
        {
          condition: 'order.total > 1000',
          result: faker.datatype.boolean(),
          evaluatedAt: startTime
        }
      ],
      actionsExecuted: [
        {
          actionId: faker.helpers.arrayElement(createdActions)._id,
          status: faker.helpers.arrayElement(['success', 'failed', 'skipped']),
          executedAt: endTime,
          responseTime: totalResponseTime,
          result: { message: 'Action executed successfully' }
        }
      ],
      startTime,
      endTime,
      totalResponseTime,
      status: faker.helpers.arrayElement(['success', 'partial_success', 'failed']),
      errorMessage: status === 'failed' ? 'Email service temporarily unavailable' : null
    });
    
    executions.push(execution);
  }
  
  await schemas.RuleExecution.insertMany(executions);
  console.log(`✅ ${executions.length} rule executions created`);
}

/**
 * Generate Error Analyses
 */
async function seedErrorAnalyses() {
  console.log(`🚨 Creating ${SEED_CONFIG.errorAnalyses} error analyses...`);
  
  const errorAnalyses = [];
  const errorTypes = ['ValidationError', 'NetworkError', 'TimeoutError', 'AuthenticationError', 'DatabaseError'];
  const severities = ['low', 'medium', 'high', 'critical'];

  for (let i = 0; i < SEED_CONFIG.errorAnalyses; i++) {
    const errorType = faker.helpers.arrayElement(errorTypes);
    
    const errorAnalysis = new schemas.ErrorAnalysis({
      type: errorType,
      count: faker.number.int({ min: 1, max: 50 }),
      percentage: faker.number.float({ min: 0.1, max: 15, multipleOf: 0.1 }),
      impact: faker.helpers.arrayElement(['Low', 'Medium', 'High', 'Critical']),
      firstOccurrence: faker.date.past({ months: 3 }),
      lastOccurrence: faker.date.recent({ days: 7 }),
      description: generateErrorMessage(errorType),
      resolution: faker.datatype.boolean(0.6) ? faker.lorem.sentence() : null,
      isResolved: faker.datatype.boolean(0.6)
    });
    
    errorAnalyses.push(errorAnalysis);
  }
  
  await schemas.ErrorAnalysis.insertMany(errorAnalyses);
  console.log(`✅ ${errorAnalyses.length} error analyses created`);
}

/**
 * Generate realistic error messages
 */
function generateErrorMessage(type) {
  const messages = {
    ValidationError: 'Invalid input data: missing required field',
    NetworkError: 'Failed to connect to external service',
    TimeoutError: 'Request timed out after 30 seconds',
    AuthenticationError: 'Invalid authentication credentials',
    DatabaseError: 'Connection to database lost'
  };
  
  return messages[type] || 'Unknown error occurred';
}

/**
 * Main seeding function
 */
async function seedDatabase() {
  console.log('🌱 Starting database seeding process...\n');
  
  try {
    // Connect to database
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(config.uri, config.options);
    console.log('✅ MongoDB connected successfully\n');
    
    // Clear existing data
    await clearDatabase();
    console.log('');
    
    // Seed data in order (maintaining relationships)
    await seedUsers();
    await seedCustomers();
    await seedProducts();
    await seedOrders();
    await seedRules();
    await seedActions();
    await seedActivities();
    await seedPerformanceData();
    await seedRuleExecutions();
    await seedErrorAnalyses();
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Customers: ${createdCustomers.length}`);
    console.log(`   Products: ${createdProducts.length}`);
    console.log(`   Orders: ${createdOrders.length}`);
    console.log(`   Rules: ${createdRules.length}`);
    console.log(`   Actions: ${createdActions.length}`);
    console.log(`   Activities: ${SEED_CONFIG.activities}`);
    console.log(`   Performance Data: ${SEED_CONFIG.performanceData}`);
    console.log(`   Rule Executions: ${SEED_CONFIG.ruleExecutions}`);
    console.log(`   Error Analyses: ${SEED_CONFIG.errorAnalyses}`);
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB disconnected');
  }
}

/**
 * Command line argument handling
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  
  // Handle --help flag
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Alarynt MongoDB Seed Script

Usage: node seed.js [options]

Options:
  --help, -h     Show this help message
  --clear-only   Only clear the database, don't seed
  --users N      Number of users to create (default: ${SEED_CONFIG.users})
  --customers N  Number of customers to create (default: ${SEED_CONFIG.customers})
  --products N   Number of products to create (default: ${SEED_CONFIG.products})
  --orders N     Number of orders to create (default: ${SEED_CONFIG.orders})
  --rules N      Number of rules to create (default: ${SEED_CONFIG.rules})

Environment Variables:
  MONGODB_URI    MongoDB connection string (default: mongodb://localhost:27017/alarynt-rules)

Examples:
  node seed.js                    # Seed with default amounts
  node seed.js --users 50         # Seed with 50 users
  node seed.js --clear-only       # Just clear the database
    `);
    process.exit(0);
  }
  
  // Handle --clear-only flag
  if (args.includes('--clear-only')) {
    (async () => {
      try {
        await mongoose.connect(config.uri, config.options);
        await clearDatabase();
        await mongoose.disconnect();
        console.log('✅ Database cleared successfully');
      } catch (error) {
        console.error('❌ Failed to clear database:', error.message);
        process.exit(1);
      }
    })();
    return;
  }
  
  // Parse numeric arguments
  args.forEach((arg, index) => {
    if (arg.startsWith('--') && args[index + 1] && !isNaN(args[index + 1])) {
      const key = arg.substring(2);
      const value = parseInt(args[index + 1]);
      if (SEED_CONFIG[key] !== undefined) {
        SEED_CONFIG[key] = value;
      }
    }
  });
  
  // Run the seeding
  seedDatabase();
}

module.exports = {
  seedDatabase,
  clearDatabase,
  SEED_CONFIG
};