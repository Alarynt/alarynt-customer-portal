import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Connect to MongoDB
await mongoose.connect('mongodb://localhost:27017/alarynt-rules', {
  retryWrites: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
});

// Import schemas
import { schemas } from '../src/schemas/index.ts';

async function addSampleData() {
  try {
    console.log('Adding sample data...');

    // Add sample rules
    const sampleRules = [
      {
        id: uuidv4(),
        name: 'High Value Customer Alert',
        description: 'Notify sales team when premium customer places large order',
        dsl: 'WHEN order.total > 1000 AND customer.tier == "premium" THEN send_email(to: "sales@alarynt.com")',
        status: 'active',
        priority: 1,
        createdBy: 'admin_001',
        executionCount: 45,
        successRate: 95.5,
        tags: ['sales', 'premium']
      },
      {
        id: uuidv4(),
        name: 'Inventory Low Stock Alert',
        description: 'Alert when product inventory falls below threshold',
        dsl: 'WHEN product.inventory < product.minThreshold THEN send_email(to: "inventory@alarynt.com")',
        status: 'active',
        priority: 2,
        createdBy: 'admin_001',
        executionCount: 32,
        successRate: 98.2,
        tags: ['inventory', 'stock']
      }
    ];

    for (const ruleData of sampleRules) {
      const existingRule = await schemas.Rule.findOne({ name: ruleData.name });
      if (!existingRule) {
        const rule = new schemas.Rule(ruleData);
        await rule.save();
        console.log(`✅ Added rule: ${ruleData.name}`);
      }
    }

    // Add sample actions
    const sampleActions = [
      {
        id: uuidv4(),
        name: 'Sales Team Email',
        description: 'Send email notification to sales team',
        type: 'email',
        config: { to: 'sales@alarynt.com', subject: 'High Value Order Alert' },
        status: 'active',
        createdBy: 'admin_001',
        executionCount: 45,
        successRate: 95.5
      },
      {
        id: uuidv4(),
        name: 'Inventory Webhook',
        description: 'Call inventory system webhook',
        type: 'webhook',
        config: { url: 'https://api.inventory.com/alert', method: 'POST' },
        status: 'active',
        createdBy: 'admin_001',
        executionCount: 32,
        successRate: 98.2
      }
    ];

    for (const actionData of sampleActions) {
      const existingAction = await schemas.Action.findOne({ name: actionData.name });
      if (!existingAction) {
        const action = new schemas.Action(actionData);
        await action.save();
        console.log(`✅ Added action: ${actionData.name}`);
      }
    }

    // Add sample customers
    const sampleCustomers = [
      {
        id: uuidv4(),
        name: 'John Doe',
        email: 'john.doe@example.com',
        tier: 'premium',
        company: 'Acme Corp',
        totalOrders: 15,
        totalSpent: 25000
      },
      {
        id: uuidv4(),
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        tier: 'enterprise',
        company: 'Tech Solutions Inc',
        totalOrders: 28,
        totalSpent: 75000
      }
    ];

    for (const customerData of sampleCustomers) {
      const existingCustomer = await schemas.Customer.findOne({ email: customerData.email });
      if (!existingCustomer) {
        const customer = new schemas.Customer(customerData);
        await customer.save();
        console.log(`✅ Added customer: ${customerData.name}`);
      }
    }

    // Add sample activities
const sampleActivities = [
  {
    id: uuidv4(),
    type: 'rule_created',
    message: 'Rule "High Value Customer Alert" created successfully',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'success',
    user: 'System Administrator',
    userId: 'admin_001',
    ruleName: 'High Value Customer Alert',
    ruleId: 'sample-rule-1'
  },
  {
    id: uuidv4(),
    type: 'action_executed',
    message: 'Sales Team Email action executed successfully',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    status: 'success',
    user: 'System Administrator',
    userId: 'admin_001',
    actionName: 'Sales Team Email',
    actionId: 'action-1'
  }
];

// Add sample rule executions
const sampleExecutions = [
  {
    ruleId: 'sample-rule-1',
    executionId: uuidv4(),
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 150), // 150ms later
    status: 'success',
    totalResponseTime: 150,
    triggeredBy: { eventType: 'order_created' },
    conditions: [{ condition: 'order.total > 1000', result: true }],
    actions: [{ actionId: 'action-1', actionType: 'email', status: 'success', executedAt: new Date() }]
  },
  {
    ruleId: 'sample-rule-2',
    executionId: uuidv4(),
    startTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    endTime: new Date(Date.now() - 1 * 60 * 60 * 1000 + 200), // 200ms later
    status: 'success',
    totalResponseTime: 200,
    triggeredBy: { eventType: 'inventory_update' },
    conditions: [{ condition: 'product.inventory < 10', result: true }],
    actions: [{ actionId: 'action-2', actionType: 'webhook', status: 'success', executedAt: new Date() }]
  }
];

    for (const executionData of sampleExecutions) {
      const execution = new schemas.RuleExecution(executionData);
      await execution.save();
          console.log(`✅ Added execution: ${executionData.executionId}`);
  }

  // Add sample activities
  for (const activityData of sampleActivities) {
    const existingActivity = await schemas.Activity.findOne({ id: activityData.id });
    if (!existingActivity) {
      const activity = new schemas.Activity(activityData);
      await activity.save();
      console.log(`✅ Added activity: ${activityData.type}`);
    }
  }

  console.log('🎉 Sample data added successfully!');

  } catch (error) {
    console.error('❌ Error adding sample data:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addSampleData(); 