# Alarynt Rule Engine Monorepo

This monorepo contains both the **customer portal frontend** and the **MongoDB schemas** for the Alarynt Rule Engine system.

## 📁 Repository Structure

```
alarynt-customer-portal/
├── src/                    # React frontend application
├── public/                 # Static assets
├── index.html             # Main HTML template
├── package.json           # Frontend dependencies
├── tailwind.config.js     # Tailwind CSS configuration
├── vite.config.ts         # Vite build configuration
└── alarynt-mongodb/       # MongoDB schemas package
    ├── schemas.js         # MongoDB schemas with Mongoose models
    ├── database.js        # Connection utilities and initialization
    ├── package.json       # MongoDB package dependencies
    └── README.md          # MongoDB documentation
```

## 🚀 Quick Start

### Frontend Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### MongoDB Setup
```bash
# Navigate to MongoDB package
cd alarynt-mongodb

# Install MongoDB dependencies
npm install

# Start database initialization
npm start
```

---

# Frontend: Alarynt Rule Engine Customer Portal

A modern, responsive web application for managing business rules and actions using a Domain Specific Language (DSL). Built with React, TypeScript, and Tailwind CSS.

## Features

### 🔐 Authentication & User Management
- **Login System**: Secure authentication with demo credentials
- **User Dashboard**: Personalized view with user information
- **Session Management**: Persistent login state with localStorage

### 📊 Dashboard
- **Overview Cards**: Key metrics including total rules, active rules, actions, and success rate
- **Performance Charts**: Visual representation of rule executions and action distribution
- **Recent Activity**: Real-time feed of system events and rule triggers
- **Interactive Metrics**: Hover effects and detailed tooltips

### 🎯 Rules Management
- **DSL Editor**: Intuitive interface for writing business rules
- **Rule Builder**: Visual rule creation with syntax highlighting
- **Rule Library**: Comprehensive list of all business rules
- **Status Management**: Activate, deactivate, and manage rule states
- **Search & Filter**: Find rules by name, description, or status

### ⚡ Actions Management
- **Action Types**: Support for email, SMS, webhook, and database actions
- **Configuration Panel**: Easy setup for different action types
- **Testing Interface**: Validate actions before deployment
- **Performance Tracking**: Monitor execution success rates

### 📈 Analytics & Monitoring
- **Performance Metrics**: Track rule execution performance over time
- **Error Analysis**: Identify and categorize system issues
- **Trend Analysis**: Historical data visualization with customizable time ranges
- **Export Capabilities**: Download reports and analytics data

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Theme**: Clean, professional interface
- **Interactive Elements**: Hover effects, transitions, and animations
- **Accessibility**: WCAG compliant design patterns

## Technology Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS with custom components
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React for consistent iconography
- **Routing**: React Router for navigation
- **Build Tool**: Vite for fast development and building

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd alarynt-customer-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Demo Credentials
For demonstration purposes, you can use any email/password combination to log in.

## Project Structure

```
src/
├── components/          # React components
│   ├── Login.tsx       # Authentication component
│   ├── Header.tsx      # Navigation header
│   ├── Dashboard.tsx   # Main dashboard
│   ├── RulesManagement.tsx  # Rules management interface
│   ├── ActionsManagement.tsx # Actions configuration
│   └── Analytics.tsx   # Performance analytics
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles and Tailwind imports
```

## DSL (Domain Specific Language)

The portal includes a powerful DSL for defining business rules:

```dsl
WHEN order.total > 1000
AND customer.tier == "premium"
THEN send_email(to: "sales@company.com", 
                subject: "High Value Order", 
                body: "Order {order.id} from {customer.name}")
```

### DSL Features
- **Conditional Logic**: WHEN, AND, OR statements
- **Action Execution**: THEN clauses for business actions
- **Variable Interpolation**: Dynamic data insertion with {variable} syntax
- **Multiple Actions**: Chain actions with AND operators

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Customization

### Styling
The application uses Tailwind CSS with custom component classes. Modify `src/index.css` to add new utility classes or override existing styles.

### Components
All components are built with TypeScript interfaces for type safety. Extend the existing interfaces to add new features.

### Data Sources
Currently uses mock data. Replace the mock data functions in each component with actual API calls when connecting to a backend.

---

# Backend: MongoDB Schemas

The `alarynt-mongodb/` directory contains comprehensive MongoDB schemas for persistent data storage. See [`alarynt-mongodb/README.md`](./alarynt-mongodb/README.md) for detailed documentation.

## MongoDB Quick Start

```bash
# Navigate to MongoDB package
cd alarynt-mongodb

# Install dependencies
npm install

# Initialize database with sample data
npm start
```

### Key Schemas
- **User** - Authentication and user management
- **Rule** - Business rules with DSL support
- **Action** - Executable actions (email, SMS, webhook, database, notification)
- **Activity** - System audit trail and activity logging
- **Customer** - Customer data with tier management
- **Order** - Complete order lifecycle tracking
- **Product** - Inventory management with threshold alerts

---

## Future Enhancements

- **Backend Integration**: Connect frontend to MongoDB for persistent data storage
- **Real-time Updates**: WebSocket integration for live rule execution updates
- **Advanced DSL**: Enhanced syntax with loops, functions, and complex conditions
- **Rule Testing**: Built-in testing framework for rule validation
- **API Documentation**: Swagger/OpenAPI integration
- **Multi-tenancy**: Support for multiple organizations
- **Audit Logging**: Comprehensive audit trail for compliance

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ by the Alarynt Team**
