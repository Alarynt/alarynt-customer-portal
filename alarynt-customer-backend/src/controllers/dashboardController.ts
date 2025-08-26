import { Request, Response } from 'express';
import { schemas } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest, ApiResponse, DashboardStats } from '../types';

/**
 * Get dashboard statistics
 * GET /api/v1/dashboard/stats
 */
export const getDashboardStats = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  // Get basic counts
  const [
    totalRules,
    activeRules,
    totalActions,
    recentActivity
  ] = await Promise.all([
    schemas.Rule.countDocuments(),
    schemas.Rule.countDocuments({ status: 'active' }),
    schemas.Action.countDocuments(),
    schemas.Activity.find().sort({ timestamp: -1 }).limit(100).lean()
  ]);

  // Calculate success rate from recent executions
  const recentExecutions = await schemas.RuleExecution
    .find({
      startTime: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    })
    .lean();

  const successfulExecutions = recentExecutions.filter(exec => exec.status === 'success').length;
  const successRate = recentExecutions.length > 0 ? (successfulExecutions / recentExecutions.length) * 100 : 0;

  const stats: DashboardStats = {
    totalRules,
    activeRules,
    totalActions,
    successRate: Math.round(successRate * 100) / 100
  };

  const response: ApiResponse<DashboardStats> = {
    success: true,
    data: stats
  };

  res.status(200).json(response);
});

/**
 * Get recent activity
 * GET /api/v1/dashboard/activity
 */
export const getRecentActivity = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { limit = 10 } = req.query;

  const activities = await schemas.Activity
    .find()
    .sort({ timestamp: -1 })
    .limit(Number(limit))
    .populate('userId', 'name email')
    .lean();

  const formattedActivities = activities.map(activity => ({
    id: activity.id,
    type: activity.type,
    message: activity.message,
    timestamp: activity.timestamp,
    status: activity.status,
    user: activity.user,
    ruleName: activity.ruleName,
    actionName: activity.actionName,
    details: activity.details
  }));

  const response: ApiResponse<any[]> = {
    success: true,
    data: formattedActivities
  };

  res.status(200).json(response);
});

/**
 * Get rule execution data for charts
 * GET /api/v1/dashboard/rule-executions
 */
export const getRuleExecutionData = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { days = 7 } = req.query;
  const daysNumber = Number(days);

  // Generate data for the last N days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysNumber);

  // Get execution data grouped by day
  const executionData = await schemas.RuleExecution.aggregate([
    {
      $match: {
        startTime: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$startTime' },
          month: { $month: '$startTime' },
          day: { $dayOfMonth: '$startTime' }
        },
        executions: { $sum: 1 },
        success: {
          $sum: {
            $cond: [{ $eq: ['$status', 'success'] }, 1, 0]
          }
        },
        failed: {
          $sum: {
            $cond: [{ $ne: ['$status', 'success'] }, 1, 0]
          }
        }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);

  // Fill in missing days with zero values
  const chartData = [];
  for (let i = daysNumber - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const existingData = executionData.find(data => 
      data._id.year === date.getFullYear() &&
      data._id.month === date.getMonth() + 1 &&
      data._id.day === date.getDate()
    );

    chartData.push({
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.toISOString().split('T')[0],
      executions: existingData?.executions || 0,
      success: existingData?.success || 0,
      failed: existingData?.failed || 0
    });
  }

  const response: ApiResponse<any[]> = {
    success: true,
    data: chartData
  };

  res.status(200).json(response);
});

/**
 * Get action distribution data for pie chart
 * GET /api/v1/dashboard/action-distribution
 */
export const getActionDistribution = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const distribution = await schemas.Action.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  const chartData = distribution.map((item, index) => ({
    name: formatActionType(item._id),
    value: item.count,
    color: colors[index % colors.length]
  }));

  const response: ApiResponse<any[]> = {
    success: true,
    data: chartData
  };

  res.status(200).json(response);
});

/**
 * Get top performing rules
 * GET /api/v1/dashboard/top-rules
 */
export const getTopPerformingRules = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { limit = 5 } = req.query;

  const topRules = await schemas.Rule
    .find({ status: 'active' })
    .sort({ executionCount: -1, successRate: -1 })
    .limit(Number(limit))
    .select('id name executionCount successRate lastExecuted')
    .lean();

  const response: ApiResponse<any[]> = {
    success: true,
    data: topRules
  };

  res.status(200).json(response);
});

/**
 * Get system health metrics
 * GET /api/v1/dashboard/health
 */
export const getSystemHealth = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const [
    totalRules,
    activeRules,
    inactiveRules,
    totalActions,
    activeActions,
    recentErrors
  ] = await Promise.all([
    schemas.Rule.countDocuments(),
    schemas.Rule.countDocuments({ status: 'active' }),
    schemas.Rule.countDocuments({ status: 'inactive' }),
    schemas.Action.countDocuments(),
    schemas.Action.countDocuments({ status: 'active' }),
    schemas.Activity.countDocuments({
      status: 'error',
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    })
  ]);

  const health = {
    rules: {
      total: totalRules,
      active: activeRules,
      inactive: inactiveRules,
      activePercentage: totalRules > 0 ? Math.round((activeRules / totalRules) * 100) : 0
    },
    actions: {
      total: totalActions,
      active: activeActions,
      activePercentage: totalActions > 0 ? Math.round((activeActions / totalActions) * 100) : 0
    },
    system: {
      recentErrors: recentErrors,
      status: recentErrors < 5 ? 'healthy' : recentErrors < 10 ? 'warning' : 'critical'
    }
  };

  const response: ApiResponse<any> = {
    success: true,
    data: health
  };

  res.status(200).json(response);
});

/**
 * Format action type for display
 */
function formatActionType(type: string): string {
  const typeMap: { [key: string]: string } = {
    'email': 'Email Notifications',
    'sms': 'SMS Alerts',
    'webhook': 'Webhook Calls',
    'database': 'Database Updates',
    'notification': 'Push Notifications'
  };

  return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
}