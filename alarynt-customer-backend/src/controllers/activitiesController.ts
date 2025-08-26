import { Request, Response } from 'express';
import { schemas } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest, ApiResponse, PaginatedResponse, Activity, ActivityQuery } from '../types';

/**
 * Get all activities with pagination and filtering
 * GET /api/v1/activities
 */
export const getActivities = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { 
    page = 1, 
    limit = 20, 
    type, 
    status, 
    startDate, 
    endDate 
  }: ActivityQuery = req.query;

  // Build query filters
  const filters: any = {};
  
  if (type) {
    filters.type = type;
  }
  
  if (status) {
    filters.status = status;
  }
  
  if (startDate || endDate) {
    filters.timestamp = {};
    if (startDate) {
      filters.timestamp.$gte = new Date(startDate);
    }
    if (endDate) {
      filters.timestamp.$lte = new Date(endDate);
    }
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get activities with pagination
  const [activities, total] = await Promise.all([
    schemas.Activity
      .find(filters)
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    schemas.Activity.countDocuments(filters)
  ]);

  const formattedActivities = activities.map(activity => ({
    id: activity.id,
    type: activity.type,
    message: activity.message,
    timestamp: activity.timestamp,
    status: activity.status,
    user: activity.user,
    userId: activity.userId,
    ruleName: activity.ruleName,
    ruleId: activity.ruleId,
    actionName: activity.actionName,
    actionId: activity.actionId,
    details: activity.details,
    metadata: activity.metadata
  }));

  const response: PaginatedResponse<Activity> = {
    success: true,
    data: formattedActivities,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };

  res.status(200).json(response);
});

/**
 * Get activities by type
 * GET /api/v1/activities/by-type/:type
 */
export const getActivitiesByType = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { type } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const skip = (page - 1) * Number(limit);

  const [activities, total] = await Promise.all([
    schemas.Activity
      .find({ type })
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    schemas.Activity.countDocuments({ type })
  ]);

  const formattedActivities = activities.map(activity => ({
    id: activity.id,
    type: activity.type,
    message: activity.message,
    timestamp: activity.timestamp,
    status: activity.status,
    user: activity.user,
    userId: activity.userId,
    ruleName: activity.ruleName,
    ruleId: activity.ruleId,
    actionName: activity.actionName,
    actionId: activity.actionId,
    details: activity.details,
    metadata: activity.metadata
  }));

  const response: PaginatedResponse<Activity> = {
    success: true,
    data: formattedActivities,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  };

  res.status(200).json(response);
});

/**
 * Get activities by user
 * GET /api/v1/activities/by-user/:userId
 */
export const getActivitiesByUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const skip = (page - 1) * Number(limit);

  const [activities, total] = await Promise.all([
    schemas.Activity
      .find({ userId })
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    schemas.Activity.countDocuments({ userId })
  ]);

  const formattedActivities = activities.map(activity => ({
    id: activity.id,
    type: activity.type,
    message: activity.message,
    timestamp: activity.timestamp,
    status: activity.status,
    user: activity.user,
    userId: activity.userId,
    ruleName: activity.ruleName,
    ruleId: activity.ruleId,
    actionName: activity.actionName,
    actionId: activity.actionId,
    details: activity.details,
    metadata: activity.metadata
  }));

  const response: PaginatedResponse<Activity> = {
    success: true,
    data: formattedActivities,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  };

  res.status(200).json(response);
});

/**
 * Get activity statistics
 * GET /api/v1/activities/stats
 */
export const getActivityStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { days = 30 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(days));

  const [
    totalActivities,
    recentActivities,
    typeDistribution,
    statusDistribution
  ] = await Promise.all([
    schemas.Activity.countDocuments(),
    schemas.Activity.countDocuments({ timestamp: { $gte: startDate } }),
    schemas.Activity.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    schemas.Activity.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
  ]);

  const stats = {
    totalActivities,
    recentActivities,
    timeframe: `Last ${days} days`,
    typeDistribution: typeDistribution.map(item => ({
      type: item._id,
      count: item.count,
      percentage: Math.round((item.count / recentActivities) * 100)
    })),
    statusDistribution: statusDistribution.map(item => ({
      status: item._id,
      count: item.count,
      percentage: Math.round((item.count / recentActivities) * 100)
    }))
  };

  const response: ApiResponse<any> = {
    success: true,
    data: stats
  };

  res.status(200).json(response);
});

/**
 * Get activity types
 * GET /api/v1/activities/types
 */
export const getActivityTypes = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const types = await schemas.Activity.distinct('type');
  
  const response: ApiResponse<string[]> = {
    success: true,
    data: types.sort()
  };

  res.status(200).json(response);
});

/**
 * Delete old activities (cleanup)
 * DELETE /api/v1/activities/cleanup
 */
export const cleanupOldActivities = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { days = 90 } = req.body;
  
  if (!req.user) {
    throw new Error('Authentication required');
  }

  // Only allow admins to perform cleanup
  if (req.user.role !== 'Admin') {
    throw new Error('Admin access required');
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - Number(days));

  const result = await schemas.Activity.deleteMany({
    timestamp: { $lt: cutoffDate }
  });

  // Log the cleanup activity
  const cleanupActivity = new schemas.Activity({
    id: require('uuid').v4(),
    type: 'system_maintenance',
    message: `Activity cleanup performed: ${result.deletedCount} activities deleted (older than ${days} days)`,
    timestamp: new Date(),
    status: 'success',
    user: req.user.name,
    userId: req.user.id
  });
  await cleanupActivity.save();

  const response: ApiResponse<{ deletedCount: number }> = {
    success: true,
    message: `Successfully deleted ${result.deletedCount} old activities`,
    data: { deletedCount: result.deletedCount }
  };

  res.status(200).json(response);
});