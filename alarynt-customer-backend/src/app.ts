import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { config } from './config';
import { swaggerSpec } from './config/swagger';
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

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: Server is running and healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Server is running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-26T10:30:00.000Z"
 *                 uptime:
 *                   type: number
 *                   example: 86400.123
 *                 environment:
 *                   type: string
 *                   example: "development"
 */
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

// Swagger UI configuration options
const swaggerOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Alarynt Customer Backend API Documentation',
  customfavIcon: '/api/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
    tryItOutEnabled: true
  }
};

// Swagger API documentation
app.use(`${apiPrefix}/docs`, swaggerUi.serve);
app.get(`${apiPrefix}/docs`, swaggerUi.setup(swaggerSpec, swaggerOptions));

// API documentation JSON endpoint
app.get(`${apiPrefix}/docs.json`, (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Legacy API documentation endpoint (for backward compatibility)
app.get(`${apiPrefix}/info`, (req, res) => {
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
    documentation: `Visit ${req.protocol}://${req.get('host')}${apiPrefix}/docs for interactive API documentation`
  });
});

// Handle 404 for unknown routes
app.use(notFound);

// Global error handler (must be last)
app.use(globalErrorHandler);

export default app;