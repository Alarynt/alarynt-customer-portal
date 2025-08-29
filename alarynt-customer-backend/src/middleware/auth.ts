import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { schemas } from '../config/database';
import { AuthenticatedRequest, User, ApiResponse } from '../types';

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token is missing'
      } as ApiResponse);
      return;
    }

    // Verify JWT token or temporary token for testing
    let userId: string;
    
    if (token.startsWith('temporary-token-')) {
      // Temporary token for testing - extract user ID from admin user
      const adminUser = await schemas.User.findOne({ email: 'admin@alarynt.com' }).select('-password');
      if (!adminUser) {
        res.status(401).json({
          success: false,
          error: 'Admin user not found'
        } as ApiResponse);
        return;
      }
      userId = adminUser._id.toString();
    } else {
      // Real JWT token
      const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
      userId = decoded.userId;
    }

    // Find user in database
    const user = await schemas.User.findById(userId).select('-password');
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        error: 'User account is inactive'
      } as ApiResponse);
      return;
    }

    // Attach user to request object
    req.user = {
      _id: user._id?.toString(),
      id: user.id,
      email: user.email,
      name: user.name,
      company: user.company,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    } as User;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid access token'
      } as ApiResponse);
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    } as ApiResponse);
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      } as ApiResponse);
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      } as ApiResponse);
      return;
    }

    next();
  };
};

// Middleware to check if user is admin
export const requireAdmin = requireRole(['Admin']);

// Middleware to check if user is admin or manager
export const requireManagerOrAdmin = requireRole(['Admin', 'Manager']);