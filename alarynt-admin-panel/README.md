# Alarynt Admin Panel

Administrative dashboard for monitoring and managing all customer accounts in the Alarynt Rule Engine system.

## Features

- **Admin Authentication**: Secure admin login using the same authentication flow as the customer portal
- **Customer Overview**: View all customers with performance metrics at a glance
- **Detailed Customer View**: Deep dive into individual customer usage, rules, actions, and activities
- **System Metrics**: Monitor system health, performance, and overall statistics
- **Data Export**: Export customer data for analysis and reporting

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- The `alarynt-customer-backend` must be running on port 3001

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The admin panel will be available at http://localhost:3002

### Admin Access

Only users with 'Admin' or 'Manager' roles can access the admin portal. Regular users will be denied access.

## Project Structure

```
src/
├── components/          # React components
│   ├── AdminLogin.tsx      # Admin login screen
│   ├── AdminHeader.tsx     # Navigation header
│   ├── AdminDashboard.tsx  # System overview
│   ├── CustomerOverview.tsx # All customers view
│   ├── CustomerDetail.tsx   # Individual customer metrics
│   └── SystemMetrics.tsx    # System health monitoring
├── services/
│   └── api.ts           # API service for admin endpoints
├── App.tsx              # Main application component
└── main.tsx            # Application entry point
```

## API Endpoints

The admin panel connects to these backend endpoints:

### Authentication
- `POST /api/v1/admin/auth/login` - Admin login
- `POST /api/v1/admin/auth/logout` - Admin logout  
- `GET /api/v1/admin/auth/me` - Get current admin
- `GET /api/v1/admin/auth/validate` - Validate admin token

### Customer Management
- `GET /api/v1/admin/customers` - Get all customers with overview
- `GET /api/v1/admin/customers/:id/metrics` - Get detailed customer metrics

### System Administration
- `GET /api/v1/admin/system/stats` - Get system-wide statistics
- `GET /api/v1/admin/system/activity` - Get recent system activity

### Data Export
- `GET /api/v1/admin/export/customer/:id` - Export specific customer data
- `GET /api/v1/admin/export/all` - Export all customer data

## Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Security

- Admin access is restricted to users with Admin/Manager roles
- Uses the same JWT authentication as the customer portal
- All admin actions are logged in the activity system
- Rate limiting applied to all endpoints

## Styling

The admin panel uses the same visual design system as the customer portal:
- Tailwind CSS for styling
- Custom color scheme (primary blue, secondary gray)
- Consistent component design patterns
- Responsive layout for all screen sizes