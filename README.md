# Alarynt Rule Engine System

A comprehensive business rules management platform with a modern web interface, serverless execution engine, and MongoDB backend. This system enables organizations to create, manage, and execute complex business rules using a Domain Specific Language (DSL).

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Alarynt Rule Engine                         │
├─────────────────────────────────────────────────────────────────────┤
│  Frontend (React)     │  Backend API        │  Lambda Functions     │
│  ├─ Customer Portal   │  ├─ REST API        │  ├─ Rule Execution    │
│  ├─ Dashboard         │  ├─ Authentication  │  ├─ Action Processing │
│  ├─ Rules Management  │  ├─ CRUD Operations │  └─ Performance Log   │
│  └─ Analytics         │  └─ Real-time Data  │                       │
└─────────────────────────────────────────────────────────────────────┘
                               │
                    ┌──────────────────────┐
                    │     MongoDB Atlas    │
                    │   or Local MongoDB   │
                    │  ├─ User Data       │
                    │  ├─ Rules & Actions  │
                    │  ├─ Performance      │
                    │  └─ Audit Logs      │
                    └──────────────────────┘
```

## 📋 Components Overview

| Component | Description | Technology Stack |
|-----------|-------------|------------------|
| **Frontend Portal** | Customer-facing web application | React 19 + TypeScript + Tailwind CSS |
| **Backend API** | RESTful API server | Node.js + Express + TypeScript |
| **MongoDB Database** | Data storage and schemas | MongoDB + Mongoose ODM |
| **Lambda Functions** | Serverless rule execution | Node.js + AWS Lambda |
| **HTTP Alert Service** | Alert and notification system | Node.js + HTTP APIs |

## 🚀 Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **MongoDB**: 4.4+ (local) or MongoDB Atlas account
- **AWS Account**: For Lambda deployment (optional)
- **Git**: For version control

### Development Tools
- **npm** or **yarn** - Package manager
- **AWS CLI** - For Lambda deployment
- **MongoDB Compass** - Database GUI (optional)
- **Postman** - API testing (optional)

## 📊 MongoDB Setup, Seeding, and Configuration

### 1. MongoDB Installation Options

#### Option A: Local MongoDB Installation

**macOS (using Homebrew):**
```bash
# Install MongoDB Community Edition
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB service
brew services start mongodb-community@7.0
```

**Ubuntu/Debian:**
```bash
# Import MongoDB GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Docker (Quick Setup):**
```bash
# Run MongoDB in Docker container
docker run -d \
  --name alarynt-mongodb \
  -p 27017:27017 \
  -v alarynt-mongo-data:/data/db \
  mongo:7.0
```

#### Option B: MongoDB Atlas (Cloud)

1. **Create Atlas Account**: Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Create Cluster**: Choose free tier or paid cluster
3. **Configure Network Access**: Add your IP address to whitelist
4. **Create Database User**: Add username/password for application
5. **Get Connection String**: Copy the connection URI

### 2. Database Schema Setup

#### Initialize MongoDB Schemas
```bash
# Navigate to MongoDB directory
cd alarynt-mongodb

# Install dependencies
npm install

# Set environment variable (if using local MongoDB)
export MONGODB_URI="mongodb://localhost:27017/alarynt-rules"

# Or for MongoDB Atlas:
export MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/alarynt-rules"

# Initialize database connection and create indexes
node database.js
```

#### Expected Output:
```
Connecting to MongoDB...
✅ MongoDB connected successfully
Creating database indexes...
✅ Indexes created successfully
✅ Database initialization complete
```

### 3. Database Seeding with Sample Data

#### Generate Development Data
```bash
# Still in alarynt-mongodb directory
# Seed database with comprehensive fake data
node seed.js
```

#### Seeding Process:
The seed script creates:
- **25 Users** (different roles: Admin, Manager, User, Viewer)
- **100 Customers** (various tiers: basic, premium, enterprise, VIP)
- **75 Products** (with inventory and supplier data)
- **200 Orders** (with realistic order patterns)
- **30 Business Rules** (with DSL syntax examples)
- **40 Actions** (email, SMS, webhook, database operations)
- **150+ Activity Logs** (audit trail entries)
- **Performance Data** (90 days of historical metrics)

#### Sample DSL Rules Created:
```dsl
# High-Value Customer Alert
WHEN order.total > 1000
AND customer.tier == "premium"
THEN send_email(to: "sales@company.com", subject: "High Value Order Alert")

# Inventory Management
WHEN product.inventory < product.minThreshold
THEN send_email(to: "inventory@company.com", subject: "Low Inventory Alert")
AND call_webhook(url: "https://api.supplier.com/reorder", method: "POST")

# Customer Tier Upgrade
WHEN customer.totalSpent > 10000
AND customer.totalOrders > 50
THEN update_database(collection: "Customer", update: {"tier": "vip"})
```

### 4. Database Connection Configuration

#### Environment Variables Setup
Create `.env` files in each component:

**For Backend API (`alarynt-customer-backend/.env`):**
```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/alarynt-rules

# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/alarynt-rules

# Connection Options
MONGODB_OPTIONS=retryWrites=true&w=majority
```

**For Lambda Functions (`alarynt-lambda/.env`):**
```bash
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/alarynt-rules

# Or use AWS Systems Manager Parameter Store:
# MONGODB_URI_SSM_PARAMETER=/alarynt/mongodb/uri
```

### 5. Verify Database Setup

#### Check Database Contents
```bash
# Connect to MongoDB shell
mongosh "mongodb://localhost:27017/alarynt-rules"

# Or for Atlas:
# mongosh "mongodb+srv://username:password@cluster.mongodb.net/alarynt-rules"

# List collections
show collections

# Check users count
db.users.countDocuments()

# Check sample rule
db.rules.findOne()

# Check sample customer
db.customers.findOne()

# Exit shell
exit
```

#### Using MongoDB Compass (GUI)
1. **Install MongoDB Compass**: Download from MongoDB website
2. **Connect**: Use your MongoDB URI
3. **Browse**: Explore `alarynt-rules` database
4. **Verify**: Check all collections have data

## ⚡ Lambda Creation and Deployment

### 1. Lambda Function Overview

The Lambda function serves as the serverless execution engine for business rules. It:
- Processes rule execution requests
- Evaluates DSL conditions against data
- Executes actions (email, SMS, webhooks)
- Logs performance metrics
- Handles error scenarios

### 2. Pre-deployment Setup

#### Install AWS CLI
```bash
# macOS
brew install awscli

# Ubuntu/Linux
sudo apt-get install awscli

# Configure AWS credentials
aws configure
```

#### Set Required Environment Variables
```bash
# In alarynt-lambda directory
cd alarynt-lambda

# Copy environment template
cp .env.example .env

# Edit .env file with your settings
MONGODB_URI=your-mongodb-connection-string
AWS_REGION=us-east-1
LOG_LEVEL=info
FROM_EMAIL=noreply@yourdomain.com
```

### 3. Lambda Deployment Options

#### Option A: AWS SAM Deployment (Recommended)

```bash
# Install AWS SAM CLI
# macOS:
brew install aws/tap/aws-sam-cli

# Ubuntu:
wget https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-linux-x86_64.zip
unzip aws-sam-cli-linux-x86_64.zip -d sam-installation
sudo ./sam-installation/install

# Build the Lambda function
sam build

# Deploy for first time (guided setup)
sam deploy --guided

# Follow prompts:
# Stack Name: alarynt-rule-engine
# AWS Region: us-east-1
# Parameter MongoDbUri: [your-mongodb-uri]
# Parameter FromEmail: noreply@yourdomain.com
# Confirm changes: Y
# Save parameters: Y
```

#### Option B: AWS CLI Deployment

```bash
# Package the function
npm install --production
zip -r function.zip . -x "*.git*" "node_modules/aws-sdk/*"

# Create Lambda function
aws lambda create-function \
  --function-name alarynt-rule-engine \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR-ACCOUNT-ID:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 300 \
  --memory-size 512 \
  --environment Variables='{
    "MONGODB_URI":"your-mongodb-uri",
    "LOG_LEVEL":"info",
    "FROM_EMAIL":"noreply@yourdomain.com"
  }'
```

#### Option C: Terraform Deployment

```bash
# Navigate to terraform directory (if exists)
cd terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -var="mongodb_uri=your-mongodb-uri"

# Apply configuration
terraform apply
```

### 4. Required IAM Permissions

Create an IAM role with the following policy:

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
        "ses:SendRawEmail",
        "ses:VerifyEmailIdentity"
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

### 5. Configure Event Sources

#### EventBridge (Scheduled Rules)
```bash
# Create rule for periodic execution
aws events put-rule \
  --name alarynt-scheduled-execution \
  --schedule-expression "rate(5 minutes)" \
  --description "Execute Alarynt rules every 5 minutes"

# Add Lambda as target
aws events put-targets \
  --rule alarynt-scheduled-execution \
  --targets "Id"="1","Arn"="arn:aws:lambda:us-east-1:ACCOUNT:function:alarynt-rule-engine"
```

#### API Gateway Integration
```bash
# Create API Gateway (via AWS Console or CLI)
# Configure POST /execute endpoint
# Set integration to Lambda function
# Deploy to stage (e.g., 'prod')
```

### 6. Test Lambda Deployment

#### Local Testing
```bash
# In alarynt-lambda directory
npm test

# Test with sample event
node -e "
const handler = require('./index').handler;
const event = { 
  source: 'test', 
  eventType: 'rule_execution_test' 
};
const context = { awsRequestId: 'test-123' };
handler(event, context).then(console.log);
"
```

#### AWS Console Testing
1. Go to AWS Lambda Console
2. Find your `alarynt-rule-engine` function
3. Create test event:
```json
{
  "source": "test",
  "eventType": "manual_test",
  "data": {
    "customerId": "test-customer",
    "orderId": "test-order"
  }
}
```
4. Click "Test" and verify execution

### 7. Monitor Lambda Function

#### CloudWatch Logs
```bash
# View logs
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/alarynt-rule-engine"

# Tail logs in real-time
sam logs -n AlaryrtRuleEngineFunction --tail
```

#### CloudWatch Metrics
- **Invocations**: Number of executions
- **Duration**: Execution time
- **Errors**: Failed executions
- **Throttles**: Rate limiting events

## 👤 Adding New Users

### 1. User Management Overview

The system supports role-based access control with four user roles:
- **Admin**: Full system access, can manage all users and settings
- **Manager**: Can create/edit rules and actions, manage team members
- **User**: Can view and execute rules, limited editing permissions  
- **Viewer**: Read-only access to dashboards and reports

### 2. Adding Users via API (Recommended)

#### Using the Backend API

**Step 1: Start the Backend API**
```bash
# Navigate to backend directory
cd alarynt-customer-backend

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your MongoDB URI

# Start the API server
npm run dev
# Server runs on http://localhost:3001
```

**Step 2: Register New User via API**
```bash
# Register new user endpoint
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@company.com",
    "password": "SecurePassword123!",
    "name": "John Doe",
    "company": "Acme Corporation",
    "role": "User"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "user_64f7a1b2c3d4e5f6789abcde",
    "email": "newuser@company.com",
    "name": "John Doe",
    "company": "Acme Corporation",
    "role": "User",
    "isActive": true,
    "createdAt": "2024-01-26T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Adding Users via Database (Direct)

#### Using MongoDB Shell
```bash
# Connect to MongoDB
mongosh "mongodb://localhost:27017/alarynt-rules"

# Create new user document
db.users.insertOne({
  "id": "user_" + new ObjectId().toString(),
  "email": "manager@company.com",
  "name": "Jane Smith",
  "company": "Acme Corporation", 
  "role": "Manager",
  "password": "$2b$12$LQv3c1yqBwEHxv97G8r8R.4kUQ.HTgB1p9CNgOKz7C7BU3TVDeF9u", // "password123"
  "isActive": true,
  "lastLogin": null,
  "createdAt": new Date(),
  "updatedAt": new Date()
})

# Verify user was created
db.users.findOne({"email": "manager@company.com"})
```

#### Using Node.js Script
```javascript
// scripts/add-user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('../alarynt-mongodb/schemas');

async function addUser(userData) {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alarynt-rules');
    
    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Create user
    const user = new User({
      id: `user_${new mongoose.Types.ObjectId()}`,
      email: userData.email,
      name: userData.name,
      company: userData.company || 'Default Company',
      role: userData.role || 'User',
      password: hashedPassword,
      isActive: true
    });
    
    await user.save();
    console.log('✅ User created successfully:', user.email);
    
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

// Usage
addUser({
  email: 'admin@company.com',
  password: 'AdminPassword123!',
  name: 'System Administrator',
  company: 'Alarynt Inc',
  role: 'Admin'
});
```

Run the script:
```bash
node scripts/add-user.js
```

### 4. User Management via Frontend

#### Admin Portal Access
1. **Login as Admin**: Use existing admin credentials
2. **Navigate to Users**: Go to User Management section
3. **Add New User**: Click "Add User" button
4. **Fill Form**: Enter user details and assign role
5. **Send Invite**: System sends email invitation (if configured)

#### Bulk User Import
```bash
# Create CSV file with user data
# users.csv:
email,name,company,role
user1@company.com,John Doe,Acme Corp,User
user2@company.com,Jane Smith,Acme Corp,Manager
admin@company.com,Super Admin,Acme Corp,Admin

# Use bulk import script
node scripts/bulk-import-users.js users.csv
```

### 5. User Role Permissions

#### Role-Based Access Matrix

| Feature | Viewer | User | Manager | Admin |
|---------|--------|------|---------|-------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| View Rules | ✅ | ✅ | ✅ | ✅ |
| Create Rules | ❌ | ❌ | ✅ | ✅ |
| Edit Rules | ❌ | Limited | ✅ | ✅ |
| Delete Rules | ❌ | ❌ | ✅ | ✅ |
| Manage Actions | ❌ | ❌ | ✅ | ✅ |
| View Analytics | ✅ | ✅ | ✅ | ✅ |
| User Management | ❌ | ❌ | Limited | ✅ |
| System Settings | ❌ | ❌ | ❌ | ✅ |

### 6. User Activation and Deactivation

#### Deactivate User
```bash
# Via API
curl -X PATCH http://localhost:3001/api/v1/users/USER_ID/deactivate \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Via MongoDB
db.users.updateOne(
  {"email": "user@company.com"}, 
  {"$set": {"isActive": false, "updatedAt": new Date()}}
)
```

#### Reactivate User
```bash
# Via API
curl -X PATCH http://localhost:3001/api/v1/users/USER_ID/activate \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Via MongoDB  
db.users.updateOne(
  {"email": "user@company.com"}, 
  {"$set": {"isActive": true, "updatedAt": new Date()}}
)
```

## 🛠️ Complete System Setup

### 1. Frontend Portal Setup

```bash
# Navigate to root directory (frontend)
cd /path/to/alarynt-customer-portal

# Install dependencies
npm install

# Configure environment (if needed)
# Create .env.local for custom configuration
echo "VITE_API_BASE_URL=http://localhost:3001/api/v1" > .env.local

# Start development server
npm run dev

# Access portal at: http://localhost:5173
```

### 2. Backend API Setup

```bash
# Navigate to backend directory
cd alarynt-customer-backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings:
# PORT=3001
# MONGODB_URI=your-mongodb-connection-string
# JWT_SECRET=your-secure-jwt-secret

# Start development server
npm run dev

# API available at: http://localhost:3001
```

### 3. Complete Integration Test

```bash
# 1. Verify MongoDB is running and seeded
mongosh --eval "db.adminCommand('ping')" "mongodb://localhost:27017/alarynt-rules"

# 2. Test Backend API
curl http://localhost:3001/health

# 3. Test Lambda function (if deployed)
aws lambda invoke --function-name alarynt-rule-engine response.json
cat response.json

# 4. Test Frontend-Backend integration
# Open http://localhost:5173 in browser
# Login with seeded user credentials
# Verify dashboard loads with data
```

## 🚀 Development Workflow

### 1. Daily Development Setup

```bash
# Start all services
# Terminal 1: MongoDB (if local)
mongod --dbpath /usr/local/var/mongodb

# Terminal 2: Backend API
cd alarynt-customer-backend && npm run dev

# Terminal 3: Frontend
cd alarynt-customer-portal && npm run dev

# Terminal 4: Available for testing/debugging
```

### 2. Making Changes

#### Frontend Changes
- Edit React components in `src/components/`
- Styles are in `src/index.css` (Tailwind CSS)
- Hot reload automatically updates browser

#### Backend Changes  
- Edit controllers in `alarynt-customer-backend/src/controllers/`
- API routes in `alarynt-customer-backend/src/routes/`
- Server automatically restarts with nodemon

#### Database Schema Changes
- Modify schemas in `alarynt-mongodb/schemas.js`
- Re-run seeding: `cd alarynt-mongodb && node seed.js`
- Update API controllers as needed

#### Lambda Changes
- Edit `alarynt-lambda/index.js`
- Test locally: `npm test`
- Redeploy: `sam build && sam deploy`

### 3. Testing

```bash
# Frontend testing
cd alarynt-customer-portal
npm test

# Backend testing  
cd alarynt-customer-backend
npm test

# Lambda testing
cd alarynt-lambda
npm test

# Integration testing
npm run test:integration
```

## 📦 Production Deployment

### 1. Environment Preparation

#### Production Environment Variables
```bash
# Backend (.env.production)
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://prod-user:password@cluster.mongodb.net/alarynt-rules-prod
JWT_SECRET=super-secure-production-jwt-secret-256-bit
CORS_ORIGIN=https://yourdomain.com

# Lambda (via AWS Parameter Store)
/alarynt/prod/mongodb-uri
/alarynt/prod/from-email  
/alarynt/prod/jwt-secret
```

### 2. Build and Deploy

#### Frontend Deployment
```bash
# Build for production
cd alarynt-customer-portal
npm run build

# Deploy to your hosting service
# Examples:
# Netlify: drag dist/ folder to netlify.com
# Vercel: vercel --prod
# AWS S3: aws s3 sync dist/ s3://your-bucket
```

#### Backend Deployment
```bash
# Build production version
cd alarynt-customer-backend  
npm run build

# Deploy options:
# AWS EC2/ECS/App Runner
# Google Cloud Run
# Heroku: git push heroku main
# Docker: docker build -t alarynt-api .
```

#### Lambda Deployment
```bash
cd alarynt-lambda
sam build --use-container
sam deploy --config-env production
```

### 3. Production Database Setup

#### MongoDB Atlas Production Cluster
1. **Create Production Cluster**: Dedicated cluster with backups
2. **Configure Network Security**: IP whitelist, VPC peering
3. **Set Up Monitoring**: Alerts for performance/errors
4. **Enable Backups**: Automated daily backups
5. **Create Production Data**: Run production seeding if needed

## 🔧 Troubleshooting

### Common Issues and Solutions

#### MongoDB Connection Issues
```bash
# Check MongoDB status
systemctl status mongod

# Check connection
mongosh --eval "db.adminCommand('ping')"

# Fix common connection string issues
# Wrong: mongodb://localhost/alarynt-rules
# Right: mongodb://localhost:27017/alarynt-rules
```

#### Frontend Build Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf dist .vite
npm run build
```

#### Lambda Deployment Issues  
```bash
# Check IAM permissions
aws sts get-caller-identity

# Validate SAM template
sam validate

# Check function logs
sam logs -n AlaryrtRuleEngineFunction --tail
```

#### Backend API Issues
```bash
# Check environment variables
echo $MONGODB_URI

# Verify JWT secret is set
echo $JWT_SECRET

# Check API health
curl http://localhost:3001/health
```

### Error Code Reference

| Error Code | Description | Solution |
|------------|-------------|----------|
| `MONGO_CONNECTION_ERROR` | Cannot connect to MongoDB | Check URI and network |
| `JWT_INVALID_TOKEN` | Authentication token expired | Login again |
| `LAMBDA_TIMEOUT` | Function execution timeout | Increase timeout in template.yaml |
| `VALIDATION_ERROR` | Invalid request data | Check API documentation |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions | Check user role |

## 📚 Additional Resources

### API Documentation
- **Backend API**: http://localhost:3001/api/v1/docs
- **OpenAPI Spec**: Available at `/docs/openapi.json`

### Database Documentation
- **Schema Reference**: `/alarynt-mongodb/README.md`
- **Seed Data**: `/alarynt-mongodb/SEED_README.md`

### Lambda Documentation  
- **Function Reference**: `/alarynt-lambda/README.md`
- **DSL Syntax Guide**: `/docs/dsl-reference.md`

### Support Channels
- **GitHub Issues**: For bug reports and feature requests
- **Email**: support@alarynt.com
- **Documentation**: https://docs.alarynt.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**🎯 Quick Start Checklist:**

- [ ] Install Node.js 18+ and MongoDB
- [ ] Clone repository and install dependencies
- [ ] Set up MongoDB and run seed script  
- [ ] Configure environment variables
- [ ] Start backend API and frontend
- [ ] Deploy Lambda function (optional)
- [ ] Add your first user via API
- [ ] Login and explore the dashboard

**Built with ❤️ by the Alarynt Team**
