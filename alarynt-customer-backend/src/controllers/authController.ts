import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { config } from '../config';
import { schemas } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { 
  LoginRequest, 
  CreateUserRequest, 
  LoginResponse, 
  ApiResponse, 
  User,
  AuthenticatedRequest 
} from '../types';

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password, name, company, role }: CreateUserRequest = req.body;

  // Check if user already exists
  const existingUser = await schemas.User.findOne({ email });
  if (existingUser) {
    throw createError('User already exists with this email', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, config.bcryptSaltRounds);

  // Create new user
  const newUser = new schemas.User({
    id: uuidv4(),
    email,
    password: hashedPassword,
    name,
    company,
    role,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  await newUser.save();

  // Create activity log
  const activity = new schemas.Activity({
    id: uuidv4(),
    type: 'user_login',
    message: `New user registered: ${name}`,
    timestamp: new Date(),
    status: 'success',
    user: name,
    userId: newUser._id
  });
  await activity.save();

  // Generate JWT token
  const token = jwt.sign(
    { userId: newUser._id },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  // Return user data without password
  const userData: User = {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    company: newUser.company,
    role: newUser.role,
    isActive: newUser.isActive,
    lastLogin: newUser.lastLogin,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt
  };

  const response: ApiResponse<LoginResponse> = {
    success: true,
    message: 'User registered successfully',
    data: {
      token,
      user: userData
    }
  };

  res.status(201).json(response);
});

/**
 * Login user
 * POST /api/v1/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password }: LoginRequest = req.body;

  // Find user by email
  const user = await schemas.User.findOne({ email }).select('+password');
  if (!user) {
    throw createError('Invalid email or password', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw createError('User account is inactive', 401);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createError('Invalid email or password', 401);
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Create activity log
  const activity = new schemas.Activity({
    id: uuidv4(),
    type: 'user_login',
    message: `User logged in: ${user.name}`,
    timestamp: new Date(),
    status: 'success',
    user: user.name,
    userId: user._id
  });
  await activity.save();

  // Generate JWT token
  const token = jwt.sign(
    { userId: user._id },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  // Return user data without password
  const userData: User = {
    id: user.id,
    email: user.email,
    name: user.name,
    company: user.company,
    role: user.role,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  const response: ApiResponse<LoginResponse> = {
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: userData
    }
  };

  res.status(200).json(response);
});

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
export const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (req.user) {
    // Create activity log
    const activity = new schemas.Activity({
      id: uuidv4(),
      type: 'user_logout',
      message: `User logged out: ${req.user.name}`,
      timestamp: new Date(),
      status: 'success',
      user: req.user.name,
      userId: req.user.id
    });
    await activity.save();
  }

  const response: ApiResponse = {
    success: true,
    message: 'Logout successful'
  };

  res.status(200).json(response);
});

/**
 * Get current user profile
 * GET /api/v1/auth/me
 */
export const getCurrentUser = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not found', 404);
  }

  const response: ApiResponse<User> = {
    success: true,
    data: req.user
  };

  res.status(200).json(response);
});

/**
 * Validate token
 * GET /api/v1/auth/validate
 */
export const validateToken = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const response: ApiResponse<{ valid: boolean; user?: User }> = {
    success: true,
    message: 'Token is valid',
    data: {
      valid: true,
      user: req.user
    }
  };

  res.status(200).json(response);
});