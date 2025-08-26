import { Request, Response } from 'express';
import { schemas } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse, PerformanceData, RulePerformance, ActionPerformance, ErrorAnalysis } from '../types';

/**
 * Get performance data over time
 * GET /api/v1/analytics/performance
 */
export const getPerformanceData = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { days = 30, granularity = 'day' } = req.query;
  const daysNumber = Number(days);

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysNumber);

  let dateFormat: any;
  switch (granularity) {
    case 'hour':
      dateFormat = {
        year: { $year: '$startTime' },
        month: { $month: '$startTime' },
        day: { $dayOfMonth: '$startTime' },
        hour: { $hour: '$startTime' }
      };
      break;
    case 'week':
      dateFormat = {
        year: { $year: '$startTime' },
        week: { $week: '$startTime' }
      };
      break;
    case 'month':
      dateFormat = {
        year: { $year: '$startTime' },
        month: { $month: '$startTime' }
      };
      break;
    default: // day
      dateFormat = {
        year: { $year: '$startTime' },
        month: { $month: '$startTime' },
        day: { $dayOfMonth: '$startTime' }
      };
  }

  const performanceData = await schemas.RuleExecution.aggregate([
    {
      $match: {
        startTime: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: dateFormat,
        executions: { $sum: 1 },
        success: {
          $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
        },
        failed: {
          $sum: { $cond: [{ $ne: ['$status', 'success'] }, 1, 0] }
        },
        totalResponseTime: {
          $sum: { $ifNull: ['$totalResponseTime', 0] }
        }
      }
    },
    {
      $project: {
        _id: 1,
        executions: 1,
        success: 1,
        failed: 1,
        responseTime: {
          $cond: [
            { $gt: ['$executions', 0] },
            { $divide: ['$totalResponseTime', '$executions'] },
            0
          ]
        }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);

  const response: ApiResponse<any[]> = {
    success: true,
    data: performanceData
  };

  res.status(200).json(response);
});

/**
 * Get rule performance rankings
 * GET /api/v1/analytics/rules/performance
 */
export const getRulePerformance = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { limit = 10, sortBy = 'executions' } = req.query;

  let sortCriteria: any = {};
  switch (sortBy) {
    case 'successRate':
      sortCriteria = { successRate: -1 };
      break;
    case 'avgResponse':
      sortCriteria = { avgResponse: 1 };
      break;
    default:
      sortCriteria = { executionCount: -1 };
  }

  const rules = await schemas.Rule
    .find({ status: 'active' })
    .sort(sortCriteria)
    .limit(Number(limit))
    .lean();

  const performance: RulePerformance[] = rules.map(rule => ({
    ruleId: rule.id,
    name: rule.name,
    executions: rule.executionCount || 0,
    success: Math.round((rule.executionCount || 0) * (rule.successRate || 0) / 100),
    failed: Math.round((rule.executionCount || 0) * (100 - (rule.successRate || 0)) / 100),
    avgResponse: 0, // Would be calculated from actual execution data
    lastUpdated: rule.updatedAt
  }));

  const response: ApiResponse<RulePerformance[]> = {
    success: true,
    data: performance
  };

  res.status(200).json(response);
});

/**
 * Get action performance rankings
 * GET /api/v1/analytics/actions/performance
 */
export const getActionPerformance = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { limit = 10, sortBy = 'executions' } = req.query;

  let sortCriteria: any = {};
  switch (sortBy) {
    case 'successRate':
      sortCriteria = { successRate: -1 };
      break;
    case 'avgResponse':
      sortCriteria = { avgResponse: 1 };
      break;
    default:
      sortCriteria = { executionCount: -1 };
  }

  const actions = await schemas.Action
    .find({ status: 'active' })
    .sort(sortCriteria)
    .limit(Number(limit))
    .lean();

  const performance: ActionPerformance[] = actions.map(action => ({
    actionId: action.id,
    name: action.name,
    executions: action.executionCount || 0,
    success: Math.round((action.executionCount || 0) * (action.successRate || 0) / 100),
    failed: Math.round((action.executionCount || 0) * (100 - (action.successRate || 0)) / 100),
    avgResponse: 0, // Would be calculated from actual execution data
    lastUpdated: action.updatedAt
  }));

  const response: ApiResponse<ActionPerformance[]> = {
    success: true,
    data: performance
  };

  res.status(200).json(response);
});

/**
 * Get error analysis
 * GET /api/v1/analytics/errors
 */
export const getErrorAnalysis = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { days = 30 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(days));

  // Get error activities
  const errorActivities = await schemas.Activity.find({
    status: 'error',
    timestamp: { $gte: startDate }
  }).lean();

  // Group errors by type
  const errorGroups: { [key: string]: any[] } = {};
  errorActivities.forEach(activity => {
    const errorType = activity.type || 'unknown';
    if (!errorGroups[errorType]) {
      errorGroups[errorType] = [];
    }
    errorGroups[errorType].push(activity);
  });

  // Calculate error analysis
  const totalErrors = errorActivities.length;
  const errorAnalysis: ErrorAnalysis[] = Object.entries(errorGroups).map(([type, errors]) => {
    const count = errors.length;
    const percentage = totalErrors > 0 ? (count / totalErrors) * 100 : 0;
    
    // Determine impact based on count and percentage
    let impact: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
    if (percentage > 50) impact = 'Critical';
    else if (percentage > 20) impact = 'High';
    else if (percentage > 10) impact = 'Medium';

    const timestamps = errors.map(e => e.timestamp);
    
    return {
      type,
      count,
      percentage: Math.round(percentage * 100) / 100,
      impact,
      firstOccurrence: new Date(Math.min(...timestamps.map(t => t.getTime()))),
      lastOccurrence: new Date(Math.max(...timestamps.map(t => t.getTime()))),
      description: `${count} occurrences of ${type} errors`,
      isResolved: false
    };
  }).sort((a, b) => b.count - a.count);

  const response: ApiResponse<ErrorAnalysis[]> = {
    success: true,
    data: errorAnalysis
  };

  res.status(200).json(response);
});

/**
 * Get trend analysis
 * GET /api/v1/analytics/trends
 */
export const getTrendAnalysis = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { metric = 'executions', period = 'week' } = req.query;

  const now = new Date();
  let currentPeriodStart: Date;
  let previousPeriodStart: Date;

  switch (period) {
    case 'day':
      currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      previousPeriodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      break;
    case 'month':
      currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      break;
    default: // week
      const dayOfWeek = now.getDay();
      currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
      previousPeriodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek - 7);
  }

  const [currentPeriodData, previousPeriodData] = await Promise.all([
    getMetricData(metric as string, currentPeriodStart, now),
    getMetricData(metric as string, previousPeriodStart, currentPeriodStart)
  ]);

  const change = previousPeriodData > 0 
    ? ((currentPeriodData - previousPeriodData) / previousPeriodData) * 100 
    : currentPeriodData > 0 ? 100 : 0;

  const trend = {
    metric,
    period,
    current: currentPeriodData,
    previous: previousPeriodData,
    change: Math.round(change * 100) / 100,
    trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
  };

  const response: ApiResponse<any> = {
    success: true,
    data: trend
  };

  res.status(200).json(response);
});

/**
 * Get usage statistics
 * GET /api/v1/analytics/usage
 */
export const getUsageStatistics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { days = 30 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(days));

  const [
    totalRules,
    activeRules,
    totalActions,
    activeActions,
    totalExecutions,
    uniqueUsers,
    avgDailyExecutions
  ] = await Promise.all([
    schemas.Rule.countDocuments(),
    schemas.Rule.countDocuments({ status: 'active' }),
    schemas.Action.countDocuments(),
    schemas.Action.countDocuments({ status: 'active' }),
    schemas.RuleExecution.countDocuments({ startTime: { $gte: startDate } }),
    schemas.Activity.distinct('userId', { timestamp: { $gte: startDate } }),
    schemas.RuleExecution.aggregate([
      { $match: { startTime: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$startTime' },
            month: { $month: '$startTime' },
            day: { $dayOfMonth: '$startTime' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          avgDaily: { $avg: '$count' }
        }
      }
    ])
  ]);

  const usage = {
    timeframe: `Last ${days} days`,
    rules: {
      total: totalRules,
      active: activeRules,
      utilizationRate: totalRules > 0 ? Math.round((activeRules / totalRules) * 100) : 0
    },
    actions: {
      total: totalActions,
      active: activeActions,
      utilizationRate: totalActions > 0 ? Math.round((activeActions / totalActions) * 100) : 0
    },
    executions: {
      total: totalExecutions,
      avgDaily: avgDailyExecutions.length > 0 ? Math.round(avgDailyExecutions[0].avgDaily) : 0
    },
    users: {
      active: uniqueUsers.length
    }
  };

  const response: ApiResponse<any> = {
    success: true,
    data: usage
  };

  res.status(200).json(response);
});

/**
 * Helper function to get metric data for trend analysis
 */
async function getMetricData(metric: string, startDate: Date, endDate: Date): Promise<number> {
  switch (metric) {
    case 'executions':
      return schemas.RuleExecution.countDocuments({
        startTime: { $gte: startDate, $lt: endDate }
      });
    case 'rules':
      return schemas.Rule.countDocuments({
        createdAt: { $gte: startDate, $lt: endDate }
      });
    case 'actions':
      return schemas.Action.countDocuments({
        createdAt: { $gte: startDate, $lt: endDate }
      });
    case 'errors':
      return schemas.Activity.countDocuments({
        status: 'error',
        timestamp: { $gte: startDate, $lt: endDate }
      });
    default:
      return 0;
  }
}