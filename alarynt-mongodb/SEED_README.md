# MongoDB Seed Script for Alarynt Rule Engine

This document describes how to use the comprehensive MongoDB seed script to populate your database with realistic fake data for development and testing purposes.

## 🌱 Overview

The seed script (`seed.js`) generates realistic fake data for all MongoDB schemas in the Alarynt Rule Engine system. It creates data that maintains proper relationships between entities and includes:

- **Users** - System administrators, managers, and regular users
- **Customers** - Business customers with various tiers and order history
- **Products** - Inventory items with realistic pricing and stock levels
- **Orders** - Purchase transactions linking customers and products
- **Rules** - Business rules with realistic DSL (Domain Specific Language)
- **Actions** - Automated actions triggered by rules
- **Activities** - System activity logs and audit trails
- **Performance Data** - System metrics and monitoring data
- **Rule Executions** - Historical rule execution records
- **Error Analyses** - Error tracking and categorization data

## 🚀 Quick Start

### Prerequisites

1. **Node.js 18+** - Required for running the script
2. **MongoDB** - Either local or remote MongoDB instance
3. **Dependencies** - Install with `npm install`

### Basic Usage

```bash
# Install dependencies
npm install

# Seed database with default amounts
npm run seed

# Or run directly
node seed.js
```

## 📊 Configuration

### Default Data Amounts

The script creates the following amounts of data by default:

- **25** Users
- **100** Customers  
- **75** Products
- **200** Orders
- **30** Rules
- **40** Actions
- **150** Activities
- **90** Performance Data entries
- **300** Rule Executions
- **25** Error Analyses

### Custom Amounts

You can customize the amount of data generated:

```bash
# Create specific amounts
node seed.js --users 50 --customers 200 --products 100 --orders 300 --rules 40

# Create a minimal dataset
node seed.js --users 5 --customers 10 --products 8 --orders 15 --rules 5

# Create a large dataset
node seed.js --users 100 --customers 500 --products 200 --orders 1000
```

## 🔧 Advanced Usage

### Environment Configuration

Set the MongoDB connection string via environment variable:

```bash
export MONGODB_URI="mongodb://localhost:27017/your-database-name"
node seed.js
```

Or for a single run:
```bash
MONGODB_URI="mongodb://your-host:27017/your-db" node seed.js
```

### Command Line Options

```bash
# Show help
node seed.js --help

# Clear database only (no seeding)
node seed.js --clear-only

# Custom configuration with help
node seed.js --users 25 --customers 50 --products 30
```

### Available Options

| Option | Description | Default |
|--------|-------------|---------|
| `--help, -h` | Show help message | - |
| `--clear-only` | Only clear database, don't seed | - |
| `--users N` | Number of users to create | 25 |
| `--customers N` | Number of customers to create | 100 |
| `--products N` | Number of products to create | 75 |
| `--orders N` | Number of orders to create | 200 |
| `--rules N` | Number of rules to create | 30 |

## 🏗️ Data Structure

### User Data
- Various roles (Admin, Manager, User, Viewer)
- Realistic names and email addresses
- Multiple company associations
- Login timestamps and activity status

### Customer Data
- Customer tiers (basic, premium, enterprise, vip)
- Complete address information
- Order history and spending totals
- International customers from multiple countries

### Product Data
- Diverse product categories
- Realistic pricing with cost margins
- Inventory levels and thresholds
- Supplier information

### Order Data
- Multi-item orders with calculations
- Various payment methods
- Shipping and billing addresses
- Order statuses and timestamps

### Rule Data
- Business logic in DSL format
- Complex conditional statements
- Multiple trigger conditions
- Performance metrics and execution history

## 🔄 Integration

### Use in Development

```bash
# Reset and seed development database
node seed.js --clear-only
node seed.js --users 10 --customers 25 --products 20 --orders 50
```

### Use in Testing

```javascript
// test-setup.js
const { seedDatabase, clearDatabase } = require('./alarynt-mongodb/seed');

beforeEach(async () => {
  await clearDatabase();
  await seedDatabase();
});
```

### Use with Different Environments

```bash
# Development
MONGODB_URI="mongodb://localhost:27017/alarynt-dev" node seed.js

# Testing  
MONGODB_URI="mongodb://localhost:27017/alarynt-test" node seed.js --users 5

# Staging
MONGODB_URI="mongodb://staging-host:27017/alarynt-staging" node seed.js
```

## 🛡️ Safety Features

### Database Clearing
The script automatically clears existing data before seeding to prevent duplicates and ensure a clean state.

### Error Handling
- Graceful handling of connection errors
- Detailed error messages with stack traces
- Automatic cleanup on failure

### Relationship Integrity
- Users are created first to provide references for other entities
- Orders reference existing customers and products
- Rules reference valid user creators
- Performance data maintains realistic correlations

## 🎯 Data Quality

### Realistic Data
- Uses faker.js for generating realistic names, addresses, emails
- Maintains logical relationships between entities
- Includes varied data distributions (not just random)

### Business Logic
- Customer tiers affect order patterns
- Product inventory affects availability
- Rule execution history correlates with success rates
- Error patterns follow realistic distributions

### Performance Optimized
- Batch inserts for better performance
- Configurable amounts to match system capabilities
- Memory efficient data generation

## 📋 Examples

### Small Development Dataset
```bash
node seed.js --users 3 --customers 10 --products 8 --orders 15 --rules 5
```

### Medium Testing Dataset
```bash
node seed.js --users 10 --customers 50 --products 30 --orders 75 --rules 15
```

### Large Demo Dataset  
```bash
node seed.js --users 50 --customers 250 --products 150 --orders 500 --rules 75
```

### Clear and Reset
```bash
node seed.js --clear-only
node seed.js
```

## 🐛 Troubleshooting

### Connection Issues
```
❌ Seeding failed: connect ECONNREFUSED
```
- Ensure MongoDB is running
- Check connection string format
- Verify network connectivity

### Permission Issues
```
❌ Seeding failed: not authorized
```
- Check database user permissions
- Verify authentication credentials
- Ensure write access to target database

### Memory Issues
```
❌ JavaScript heap out of memory
```
- Reduce data amounts using command line options
- Run with `--max-old-space-size=4096` node flag
- Seed in smaller batches

## 🔍 Validation

The seed script includes built-in validation:

- ✅ Schema compliance checking
- ✅ Relationship integrity validation  
- ✅ Data type verification
- ✅ Required field population
- ✅ Realistic data ranges

## 📈 Performance

Typical seeding performance (on modern hardware):

| Records | Time | Rate |
|---------|------|------|
| 100 total | ~2 seconds | 50 records/sec |
| 1,000 total | ~15 seconds | 67 records/sec |
| 10,000 total | ~2 minutes | 83 records/sec |

Performance depends on:
- MongoDB connection speed
- System hardware capabilities  
- Network latency
- Database index configuration

## 🤝 Contributing

To extend the seed script:

1. Add new data generation functions following existing patterns
2. Update `SEED_CONFIG` with new entity counts
3. Maintain relationship integrity between entities
4. Include realistic data distributions
5. Add command line options for new entities
6. Update this documentation

---

*The seed script is designed to provide comprehensive, realistic data for development and testing of the Alarynt Rule Engine system.*