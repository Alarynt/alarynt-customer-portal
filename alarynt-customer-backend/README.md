# Alarynt Customer Backend API

A comprehensive Node.js TypeScript backend API for the Alarynt Rule Engine Customer Portal. This API supports all the functionality required by the customer portal frontend, including authentication, rules management, actions management, dashboard analytics, and activity logging.

## 🚀 Features

### Core Functionality
- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Rules Management**: Complete CRUD operations for business rules with DSL support
- **Actions Management**: Manage executable actions (email, SMS, webhooks, database operations)
- **Dashboard Analytics**: Real-time statistics and performance metrics
- **Activity Logging**: Comprehensive audit trail and system activity tracking
- **Analytics & Reporting**: Performance analysis, error tracking, and trend analysis

### Technical Features
- **TypeScript**: Full type safety and IntelliSense support
- **MongoDB Integration**: Using existing schemas from the `alarynt-mongodb` folder
- **Express.js**: Robust REST API with middleware support
- **Security**: Helmet, CORS, rate limiting, input validation
- **Error Handling**: Comprehensive error handling with detailed logging
- **Validation**: Request validation using express-validator
- **Monitoring**: Health checks and performance monitoring

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB 4.4+
- npm or yarn

### Setup

1. **Clone and install dependencies**
   ```bash
   cd alarynt-customer-backend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3001
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/alarynt-rules
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=24h
   CORS_ORIGIN=http://localhost:5173
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX=100
   ```

3. **Database Setup**
   ```bash
   # Initialize MongoDB with sample data (optional)
   cd ../alarynt-mongodb
   node database.js
   ```

4. **Development**
   ```bash
   npm run dev
   ```

5. **Production Build**
   ```bash
   npm run build
   npm start
   ```

## 🛠️ API Endpoints

### Base URL
```
http://localhost:3001/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | User login | Public |
| POST | `/auth/logout` | User logout | Private |
| GET | `/auth/me` | Get current user | Private |
| GET | `/auth/validate` | Validate token | Private |

### Rules Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/rules` | Get all rules (paginated) | Private |
| GET | `/rules/:id` | Get single rule | Private |
| POST | `/rules` | Create new rule | Manager/Admin |
| PUT | `/rules/:id` | Update rule | Manager/Admin |
| DELETE | `/rules/:id` | Delete rule | Manager/Admin |
| PATCH | `/rules/:id/toggle` | Toggle rule status | Manager/Admin |
| GET | `/rules/:id/stats` | Get rule statistics | Private |

### Actions Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/actions` | Get all actions (paginated) | Private |
| GET | `/actions/:id` | Get single action | Private |
| POST | `/actions` | Create new action | Manager/Admin |
| PUT | `/actions/:id` | Update action | Manager/Admin |
| DELETE | `/actions/:id` | Delete action | Manager/Admin |
| PATCH | `/actions/:id/toggle` | Toggle action status | Manager/Admin |
| POST | `/actions/:id/test` | Test action | Manager/Admin |

### Dashboard Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/dashboard/stats` | Get dashboard statistics | Private |
| GET | `/dashboard/activity` | Get recent activity | Private |
| GET | `/dashboard/rule-executions` | Get execution data | Private |
| GET | `/dashboard/action-distribution` | Get action distribution | Private |
| GET | `/dashboard/top-rules` | Get top performing rules | Private |
| GET | `/dashboard/health` | Get system health metrics | Private |

### Activities (Audit Logs)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/activities` | Get all activities (paginated) | Private |
| GET | `/activities/by-type/:type` | Get activities by type | Private |
| GET | `/activities/by-user/:userId` | Get activities by user | Private |
| GET | `/activities/stats` | Get activity statistics | Private |
| GET | `/activities/types` | Get activity types | Private |
| DELETE | `/activities/cleanup` | Cleanup old activities | Admin |

### Analytics & Reporting

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/analytics/performance` | Get performance data | Private |
| GET | `/analytics/rules/performance` | Get rule performance | Private |
| GET | `/analytics/actions/performance` | Get action performance | Private |
| GET | `/analytics/errors` | Get error analysis | Private |
| GET | `/analytics/trends` | Get trend analysis | Private |
| GET | `/analytics/usage` | Get usage statistics | Private |

## 🔒 Authentication & Authorization

### JWT Authentication
- All protected routes require a valid JWT token
- Include token in Authorization header: `Bearer <token>`
- Tokens expire based on `JWT_EXPIRES_IN` configuration

### Role-Based Access Control
- **Admin**: Full access to all endpoints
- **Manager**: Can manage rules and actions
- **User**: Read access to most endpoints
- **Viewer**: Limited read-only access

### Example Login Request
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password"
  }'
```

### Example Authenticated Request
```bash
curl -X GET http://localhost:3001/api/v1/rules \
  -H "Authorization: Bearer <your-jwt-token>"
```

## 📊 Data Models

### User
```typescript
{
  id: string;
  email: string;
  name: string;
  company: string;
  role: 'Admin' | 'Manager' | 'User' | 'Viewer';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Rule
```typescript
{
  id: string;
  name: string;
  description: string;
  dsl: string;  // Domain Specific Language code
  status: 'active' | 'inactive' | 'draft';
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  lastExecuted?: Date;
  executionCount: number;
  successRate: number;
  createdBy: string;
  tags?: string[];
}
```

### Action
```typescript
{
  id: string;
  name: string;
  description: string;
  type: 'email' | 'sms' | 'webhook' | 'database' | 'notification';
  config: object;  // Configuration specific to action type
  status: 'active' | 'inactive' | 'draft';
  createdAt: Date;
  updatedAt: Date;
  lastExecuted?: Date;
  executionCount: number;
  successRate: number;
  createdBy: string;
}
```

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive request validation
- **Password Hashing**: bcrypt for secure password storage
- **JWT**: Secure token-based authentication
- **Error Handling**: Sanitized error responses

## 📈 Monitoring & Health Checks

### Health Check Endpoint
```bash
GET /health
```

Response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-26T10:30:00.000Z",
  "uptime": 3600.123,
  "environment": "development"
}
```

### API Documentation Endpoint
```bash
GET /api/v1/docs
```

## 🚧 Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (development only)"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint
```

## 📁 Project Structure

```
src/
├── config/          # Configuration files
│   ├── database.ts  # Database connection
│   └── index.ts     # App configuration
├── controllers/     # Request handlers
│   ├── authController.ts
│   ├── rulesController.ts
│   ├── actionsController.ts
│   ├── dashboardController.ts
│   ├── activitiesController.ts
│   └── analyticsController.ts
├── middleware/      # Express middleware
│   ├── auth.ts      # Authentication
│   ├── errorHandler.ts
│   └── validation.ts
├── routes/          # API routes
│   ├── auth.ts
│   ├── rules.ts
│   ├── actions.ts
│   ├── dashboard.ts
│   ├── activities.ts
│   └── analytics.ts
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── app.ts           # Express app configuration
└── index.ts         # Server entry point
```

## 🤝 Integration with Frontend

This backend API is designed to work seamlessly with the `alarynt-customer-portal` frontend. Key integration points:

- **Authentication**: JWT tokens for session management
- **Real-time Data**: REST APIs for dashboard updates
- **Form Validation**: Consistent validation between frontend and backend
- **Error Handling**: Standardized error responses
- **CORS Configuration**: Proper cross-origin setup

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run clean` - Clean build artifacts

### Environment Variables
See `.env.example` for all available configuration options.

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ by the Alarynt Team**