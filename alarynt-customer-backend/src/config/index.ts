import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  // Server configuration
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database configuration
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/alarynt-rules',

  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173' || 'http://localhost:3000' || 'http://localhost:3001',

  // Rate limiting configuration
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // Limit each IP to 100 requests per windowMs

  // Security settings
  bcryptSaltRounds: 12,

  // API configuration
  apiPrefix: '/api',
  apiVersion: 'v1'
};

// Validate required environment variables in production
if (config.nodeEnv === 'production') {
  const requiredEnvVars = [
    'JWT_SECRET',
    'MONGODB_URI'
  ];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
    process.exit(1);
  }
}

export default config;