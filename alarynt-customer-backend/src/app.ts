import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config } from './config';
import { globalErrorHandler, notFound } from './middleware/errorHandler';

// Import routes (will create these next)
import authRoutes from './routes/auth';
import rulesRoutes from './routes/rules';
import actionsRoutes from './routes/actions';
import activitiesRoutes from './routes/activities';
import dashboardRoutes from './routes/dashboard';
import analyticsRoutes from './routes/analytics';

const app = express();

// Trust proxy if behind reverse proxy (for rate limiting)
if (config.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv
  });
});

// API routes
const apiPrefix = `${config.apiPrefix}/${config.apiVersion}`;

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/rules`, rulesRoutes);
app.use(`${apiPrefix}/actions`, actionsRoutes);
app.use(`${apiPrefix}/activities`, activitiesRoutes);
app.use(`${apiPrefix}/dashboard`, dashboardRoutes);
app.use(`${apiPrefix}/analytics`, analyticsRoutes);

// API documentation endpoint
app.get(`${apiPrefix}/docs`, (req, res) => {
  res.json({
    success: true,
    message: 'Alarynt Customer Backend API',
    version: '1.0.0',
    endpoints: {
      auth: `${apiPrefix}/auth`,
      rules: `${apiPrefix}/rules`,
      actions: `${apiPrefix}/actions`,
      activities: `${apiPrefix}/activities`,
      dashboard: `${apiPrefix}/dashboard`,
      analytics: `${apiPrefix}/analytics`
    },
    documentation: 'See README.md for detailed API documentation'
  });
});

// Handle 404 for unknown routes
app.use(notFound);

// Global error handler (must be last)
app.use(globalErrorHandler);

export default app;