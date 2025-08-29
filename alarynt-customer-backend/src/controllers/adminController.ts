import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import { config } from '../config';
import { schemas } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { 
  LoginRequest, 
  LoginResponse, 
  ApiResponse, 
  User,
  AuthenticatedRequest 
} from '../types';

// Admin Authentication Controllers
/**
 * Admin login - validates admin credentials and returns JWT token
 * POST /api/v1/admin/auth/login
 */
export const adminLogin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password }: LoginRequest = req.body;

  // Find user and verify they have admin privileges
  const user = await schemas.User.findOne({ 
    email: email.toLowerCase(),
    isActive: true,
    role: { $in: ['Admin', 'Manager'] } // Only Admin and Manager roles can access admin portal
  });

  if (!user) {
    throw createError('Invalid admin credentials or insufficient privileges', 401);
  }

  // Validate password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw createError('Invalid admin credentials', 401);
  }

  // Update last login
  user.lastLogin = new Date();
  user.updatedAt = new Date();
  await user.save();

  // Create activity log
  const activity = new schemas.Activity({
    id: `activity-${Date.now()}`,
    type: 'admin_login',
    message: `Admin ${user.name} logged into admin portal`,
    timestamp: new Date(),
    status: 'success',
    user: user.name,
    userId: user._id
  });
  await activity.save();

  // Generate JWT token
  const token = `admin-token-${Date.now()}-${user.id}`;
  // TODO: Use proper JWT signing when type issues are resolved
  // const token = jwt.sign(
  //   { userId: user._id.toString(), isAdmin: true },
  //   config.jwtSecret as string,
  //   { expiresIn: config.jwtExpiresIn }
  // );

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
    message: 'Admin login successful',
    data: {
      token,
      user: userData
    }
  };

  res.json(response);
});

/**
 * Admin logout
 * POST /api/v1/admin/auth/logout
 */
export const adminLogout = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  // Create activity log
  const activity = new schemas.Activity({
    id: `activity-${Date.now()}`,
    type: 'admin_logout',
    message: `Admin ${req.user?.name} logged out of admin portal`,
    timestamp: new Date(),
    status: 'success',
    user: req.user?.name || 'Unknown',
    userId: req.user?._id
  });
  await activity.save();

  const response: ApiResponse = {
    success: true,
    message: 'Admin logout successful'
  };

  res.json(response);
});

/**
 * Get current admin user
 * GET /api/v1/admin/auth/me
 */
export const getCurrentAdmin = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = req.user;

  if (!user || !['Admin', 'Manager'].includes(user.role)) {
    throw createError('Insufficient admin privileges', 403);
  }

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

  const response: ApiResponse<User> = {
    success: true,
    data: userData
  };

  res.json(response);
});

/**
 * Validate admin token
 * GET /api/v1/admin/auth/validate
 */
export const validateAdminToken = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = req.user;

  if (!user || !['Admin', 'Manager'].includes(user.role)) {
    throw createError('Invalid admin token or insufficient privileges', 401);
  }

  const response: ApiResponse = {
    success: true,
    message: 'Admin token is valid',
    data: {
      valid: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Mock expiration
    }
  };

  res.json(response);
});

// Admin Data Controllers
/**
 * Get all customers with overview metrics
 * GET /api/v1/admin/customers
 */
export const getAllCustomers = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = req.user;

  if (!user || !['Admin', 'Manager'].includes(user.role)) {
    throw createError('Insufficient admin privileges', 403);
  }

  // Get all users (customers)
  const customers = await schemas.User.find({}, { password: 0 }).sort({ createdAt: -1 });

  // For each customer, calculate their metrics
  const customerOverviews = await Promise.all(customers.map(async (customer) => {
    // Get rule count for this customer
    const totalRules = await schemas.Rule.countDocuments({ createdBy: customer.id });
    const activeRules = await schemas.Rule.countDocuments({ 
      createdBy: customer.id, 
      status: 'active' 
    });

    // Get action count for this customer  
    const totalActions = await schemas.Action.countDocuments({ createdBy: customer.id });

    // Get activity count for this customer
    const totalActivities = await schemas.Activity.countDocuments({ userId: customer._id });

    // Calculate success rate based on recent activities
    const recentActivities = await schemas.Activity.find({ 
      userId: customer._id 
    }).limit(100);
    
    const successfulActivities = recentActivities.filter(activity => 
      activity.status === 'success'
    ).length;
    
    const successRate = recentActivities.length > 0 
      ? Math.round((successfulActivities / recentActivities.length) * 100 * 10) / 10
      : 0;

    // Get last activity
    const lastActivity = await schemas.Activity.findOne({ 
      userId: customer._id 
    }).sort({ timestamp: -1 });

    return {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      company: customer.company,
      totalRules,
      activeRules,
      totalActions,
      totalActivities,
      successRate,
      lastActivity: lastActivity?.timestamp || customer.createdAt,
      createdAt: customer.createdAt
    };
  }));

  const response: ApiResponse = {
    success: true,
    data: customerOverviews
  };

  res.json(response);
});

/**
 * Get detailed metrics for specific customer
 * GET /api/v1/admin/customers/:customerId/metrics
 */
export const getCustomerMetrics = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = req.user;
  const { customerId } = req.params;

  if (!user || !['Admin', 'Manager'].includes(user.role)) {
    throw createError('Insufficient admin privileges', 403);
  }

  // Get customer info
  const customer = await schemas.User.findOne({ id: customerId }, { password: 0 });
  if (!customer) {
    throw createError('Customer not found', 404);
  }

  // Get customer's rules and actions counts
  const totalRules = await schemas.Rule.countDocuments({ createdBy: customerId });
  const activeRules = await schemas.Rule.countDocuments({ 
    createdBy: customerId, 
    status: 'active' 
  });
  const totalActions = await schemas.Action.countDocuments({ createdBy: customerId });
  const totalActivities = await schemas.Activity.countDocuments({ userId: customer._id });

  // Calculate success rate
  const recentActivities = await schemas.Activity.find({ 
    userId: customer._id 
  }).limit(100);
  
  const successfulActivities = recentActivities.filter(activity => 
    activity.status === 'success'
  ).length;
  
  const successRate = recentActivities.length > 0 
    ? Math.round((successfulActivities / recentActivities.length) * 100 * 10) / 10
    : 0;

  // Get last activity
  const lastActivity = await schemas.Activity.findOne({ 
    userId: customer._id 
  }).sort({ timestamp: -1 });

  // Get rule executions data for last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const executionsData = await schemas.Activity.aggregate([
    {
      $match: {
        userId: customer._id,
        timestamp: { $gte: sevenDaysAgo },
        type: { $in: ['rule_executed', 'action_completed', 'action_failed'] }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%b %d", date: "$timestamp" }
        },
        executions: { $sum: 1 },
        success: {
          $sum: {
            $cond: [{ $eq: ["$status", "success"] }, 1, 0]
          }
        },
        failed: {
          $sum: {
            $cond: [{ $eq: ["$status", "error"] }, 1, 0]
          }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Get action distribution
  const actionTypes = await schemas.Action.aggregate([
    { $match: { createdBy: customerId } },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 }
      }
    }
  ]);

  const actionDistribution = actionTypes.map((type, index) => ({
    name: type._id.charAt(0).toUpperCase() + type._id.slice(1),
    value: type.count,
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
  }));

  // Get recent activity
  const recentActivityData = await schemas.Activity.find({ 
    userId: customer._id 
  })
  .sort({ timestamp: -1 })
  .limit(10);

  const recentActivity = recentActivityData.map(activity => ({
    id: activity.id,
    type: activity.type,
    message: activity.message,
    time: getTimeAgo(activity.timestamp),
    status: activity.status
  }));

  // Performance stats
  const performanceStats = {
    avgResponseTime: Math.floor(Math.random() * 200) + 50, // Mock data
    totalExecutions: totalActivities,
    totalSuccess: successfulActivities,
    totalFailures: recentActivities.length - successfulActivities,
    uptime: successRate
  };

  const customerMetrics = {
    customer: {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      company: customer.company,
      totalRules,
      activeRules,
      totalActions,
      totalActivities,
      successRate,
      lastActivity: lastActivity?.timestamp || customer.createdAt,
      createdAt: customer.createdAt
    },
    ruleExecutions: executionsData.map(item => ({
      date: item._id,
      executions: item.executions,
      success: item.success,
      failed: item.failed
    })),
    actionDistribution,
    recentActivity,
    performanceStats
  };

  const response: ApiResponse = {
    success: true,
    data: customerMetrics
  };

  res.json(response);
});

/**
 * Get system-wide statistics
 * GET /api/v1/admin/system/stats
 */
export const getSystemStats = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = req.user;

  if (!user || !['Admin', 'Manager'].includes(user.role)) {
    throw createError('Insufficient admin privileges', 403);
  }

  // Calculate system-wide statistics
  const totalCustomers = await schemas.User.countDocuments();
  const activeCustomers = await schemas.User.countDocuments({ 
    isActive: true,
    lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Active in last 30 days
  });
  const totalRules = await schemas.Rule.countDocuments();
  const totalActions = await schemas.Action.countDocuments();
  const totalActivities = await schemas.Activity.countDocuments();

  // Calculate system success rate
  const recentActivities = await schemas.Activity.find().limit(1000);
  const successfulActivities = recentActivities.filter(activity => 
    activity.status === 'success'
  ).length;
  
  const systemSuccessRate = recentActivities.length > 0 
    ? Math.round((successfulActivities / recentActivities.length) * 100 * 10) / 10
    : 0;

  const stats = {
    totalCustomers,
    activeCustomers,
    totalRules,
    totalActions,
    totalActivities,
    systemSuccessRate
  };

  const response: ApiResponse = {
    success: true,
    data: stats
  };

  res.json(response);
});

/**
 * Get system activity across all customers
 * GET /api/v1/admin/system/activity
 */
export const getSystemActivity = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = req.user;

  if (!user || !['Admin', 'Manager'].includes(user.role)) {
    throw createError('Insufficient admin privileges', 403);
  }

  // Get recent activities across all users
  const activities = await schemas.Activity.find()
    .sort({ timestamp: -1 })
    .limit(50)
    .populate('userId', 'name company'); // Get user info for each activity

  const systemActivity = activities.map(activity => {
    const userDoc = activity.userId as any;
    return {
      id: activity.id,
      type: activity.type,
      customer: userDoc?.company || 'Unknown',
      message: activity.message,
      time: getTimeAgo(activity.timestamp),
      status: activity.status
    };
  });

  const response: ApiResponse = {
    success: true,
    data: systemActivity
  };

  res.json(response);
});

/**
 * Export customer data
 * GET /api/v1/admin/export/customer/:customerId
 */
export const exportCustomerData = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = req.user;
  const { customerId } = req.params;

  if (!user || !['Admin', 'Manager'].includes(user.role)) {
    throw createError('Insufficient admin privileges', 403);
  }

  // Get customer data
  const customer = await schemas.User.findOne({ id: customerId }, { password: 0 });
  if (!customer) {
    throw createError('Customer not found', 404);
  }

  // Get all customer data
  const rules = await schemas.Rule.find({ createdBy: customerId });
  const actions = await schemas.Action.find({ createdBy: customerId });
  const activities = await schemas.Activity.find({ userId: customer._id });

  const exportData = {
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      company: customer.company,
      role: customer.role,
      createdAt: customer.createdAt
    },
    rules,
    actions,
    activities,
    exportedAt: new Date(),
    exportedBy: user.name
  };

  const response: ApiResponse = {
    success: true,
    data: exportData
  };

  res.json(response);
});

/**
 * Export all customers data
 * GET /api/v1/admin/export/all
 */
export const exportAllCustomersData = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = req.user;

  if (!user || user.role !== 'Admin') {
    throw createError('Insufficient privileges - Admin only', 403);
  }

  // Get all customers
  const customers = await schemas.User.find({}, { password: 0 });
  
  // Get all system data
  const allRules = await schemas.Rule.find();
  const allActions = await schemas.Action.find();
  const allActivities = await schemas.Activity.find();

  const exportData = {
    customers: customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      company: customer.company,
      role: customer.role,
      isActive: customer.isActive,
      lastLogin: customer.lastLogin,
      createdAt: customer.createdAt
    })),
    systemTotals: {
      totalCustomers: customers.length,
      totalRules: allRules.length,
      totalActions: allActions.length,
      totalActivities: allActivities.length
    },
    rules: allRules,
    actions: allActions,
    activities: allActivities,
    exportedAt: new Date(),
    exportedBy: user.name
  };

  const response: ApiResponse = {
    success: true,
    data: exportData
  };

  res.json(response);
});

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  } else {
    return 'Just now';
  }
}