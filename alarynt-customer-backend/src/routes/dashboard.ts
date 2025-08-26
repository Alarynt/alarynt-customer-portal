import { Router } from 'express';
import {
  getDashboardStats,
  getRecentActivity,
  getRuleExecutionData,
  getActionDistribution,
  getTopPerformingRules,
  getSystemHealth
} from '../controllers/dashboardController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/v1/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private
 */
router.get('/stats', authenticateToken, getDashboardStats);

/**
 * @route   GET /api/v1/dashboard/activity
 * @desc    Get recent activity
 * @access  Private
 */
router.get('/activity', authenticateToken, getRecentActivity);

/**
 * @route   GET /api/v1/dashboard/rule-executions
 * @desc    Get rule execution data for charts
 * @access  Private
 */
router.get('/rule-executions', authenticateToken, getRuleExecutionData);

/**
 * @route   GET /api/v1/dashboard/action-distribution
 * @desc    Get action distribution data
 * @access  Private
 */
router.get('/action-distribution', authenticateToken, getActionDistribution);

/**
 * @route   GET /api/v1/dashboard/top-rules
 * @desc    Get top performing rules
 * @access  Private
 */
router.get('/top-rules', authenticateToken, getTopPerformingRules);

/**
 * @route   GET /api/v1/dashboard/health
 * @desc    Get system health metrics
 * @access  Private
 */
router.get('/health', authenticateToken, getSystemHealth);

export default router;