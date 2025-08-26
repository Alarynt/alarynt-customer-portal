# Alarynt HTTP Alert API - Swagger Documentation

This document describes the comprehensive Swagger/OpenAPI documentation that has been implemented for the Alarynt HTTP Alert API.

## Overview

The API now includes complete OpenAPI 3.0 specification with interactive Swagger UI documentation. The documentation provides detailed information about all endpoints, request/response schemas, authentication, and includes practical examples for testing.

## Accessing the Documentation

### Swagger UI (Interactive Documentation)
```
http://localhost:3000/api-docs
```

### OpenAPI JSON Specification
```
http://localhost:3000/api-docs.json
```

## Features

### 🔐 Authentication Documentation
- Complete Bearer token authentication setup
- Clear instructions on how to authenticate
- Persistent authorization in Swagger UI

### 📋 Comprehensive Schemas
- **AlertRequest**: Request payload structure for rule execution
- **AlertResponse**: Synchronous execution response format
- **AsyncAlertResponse**: Asynchronous execution response format
- **Rule**: Rule entity with full metadata
- **Action**: Action configuration schemas
- **Error**: Standardized error response format

### 🎯 Endpoint Documentation

#### Rule Execution
- `POST /api/v1/alert/rule/{ruleId}` - Execute rule synchronously
- `POST /api/v1/alert/rule/{ruleId}/async` - Execute rule asynchronously

#### Rule Management  
- `GET /api/v1/alert/rules` - List customer rules
- `GET /api/v1/alert/rule/{ruleId}` - Get rule details

#### System Health
- `GET /health` - Basic health check
- `GET /api/v1/alert/health` - Comprehensive health check
- `POST /api/v1/alert/test` - Test Lambda connectivity

### 📝 Rich Examples

Each endpoint includes multiple practical examples:
- **User Login Events**: Authentication monitoring scenarios
- **Transaction Alerts**: Financial fraud detection examples
- **Background Processing**: Asynchronous rule execution samples
- **System Monitoring**: Health check and diagnostic examples

### 🚦 Response Codes

Complete documentation of all possible HTTP response codes:
- `200` - Success responses
- `202` - Accepted (async operations)
- `400` - Validation errors
- `401` - Authentication required
- `403` - Access denied
- `404` - Resource not found
- `429` - Rate limit exceeded
- `500` - Server errors
- `503` - Service unavailable

## Usage Examples

### Authentication
```bash
# Get your API token from the Alarynt dashboard
# Use it in the Authorization header
curl -H "Authorization: Bearer your-api-token-here" \
     http://localhost:3000/api/v1/alert/rules
```

### Execute a Rule
```bash
curl -X POST \
  -H "Authorization: Bearer your-api-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "userId": "12345",
      "event": "user_login",
      "timestamp": "2024-01-15T10:30:00Z",
      "ipAddress": "192.168.1.1"
    },
    "metadata": {
      "source": "web-app",
      "correlationId": "login-12345"
    }
  }' \
  http://localhost:3000/api/v1/alert/rule/rule-12345
```

## Development

### Testing the Documentation

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open Swagger UI:
   ```
   http://localhost:3000/api-docs
   ```

3. Click "Authorize" and enter your API token

4. Test endpoints directly from the documentation

### Updating Documentation

The Swagger documentation is automatically generated from:
- **Configuration**: `src/config/swagger.ts`
- **Route Comments**: JSDoc comments in route files
- **Type Definitions**: TypeScript interfaces in `src/types/`

To add new endpoints:

1. Add JSDoc comments with `@swagger` annotations to your route handlers
2. Define new schemas in `src/config/swagger.ts` if needed
3. The documentation will automatically update

## Schema Reference

### AlertRequest Schema
```json
{
  "payload": {
    "type": "object",
    "description": "Data to be processed by the rule",
    "required": true
  },
  "metadata": {
    "type": "object",
    "properties": {
      "source": "string",
      "timestamp": "string (ISO 8601)",
      "correlationId": "string"
    }
  }
}
```

### AlertResponse Schema
```json
{
  "success": "boolean",
  "executionId": "string (UUID)",
  "timestamp": "string (ISO 8601)",
  "result": {
    "ruleExecuted": "boolean",
    "actionsExecuted": "integer",
    "executionTime": "number (milliseconds)"
  },
  "error": {
    "message": "string",
    "code": "string"
  }
}
```

## Configuration

### Environment Variables
- `API_BASE_URL`: Base URL for the API (used in server definitions)
- `PORT`: Server port (defaults to 3000)

### Swagger UI Customization

The Swagger UI is customized with:
- Hidden top bar for cleaner interface
- Custom site title: "Alarynt HTTP Alert API"
- Persistent authorization (remembers tokens across page reloads)

## Security Notes

- All endpoints (except health checks) require Bearer token authentication
- Rate limiting is enforced (100 requests per 15 minutes per IP)
- Request size limits: 10MB for JSON payloads
- CORS is configured for allowed origins

## Support

For questions about the API documentation:
- Review the interactive Swagger UI at `/api-docs`
- Check the OpenAPI specification at `/api-docs.json`
- Refer to the main API documentation in the project README

---

*This documentation is automatically maintained and reflects the current API implementation.*