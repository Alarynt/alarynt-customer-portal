import { Router } from 'express';
import {
  getPerformanceData,
  getRulePerformance,
  getActionPerformance,
  getErrorAnalysis,
  getTrendAnalysis,
  getUsageStatistics
} from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/v1/analytics/performance
 * @desc    Get performance data over time
 * @access  Private
 */
router.get('/performance', authenticateToken, getPerformanceData);

/**
 * @route   GET /api/v1/analytics/rules/performance
 * @desc    Get rule performance rankings
 * @access  Private
 */
router.get('/rules/performance', authenticateToken, getRulePerformance);

/**
 * @route   GET /api/v1/analytics/actions/performance
 * @desc    Get action performance rankings
 * @access  Private
 */
router.get('/actions/performance', authenticateToken, getActionPerformance);

/**
 * @route   GET /api/v1/analytics/errors
 * @desc    Get error analysis
 * @access  Private
 */
router.get('/errors', authenticateToken, getErrorAnalysis);

/**
 * @route   GET /api/v1/analytics/trends
 * @desc    Get trend analysis
 * @access  Private
 */
router.get('/trends', authenticateToken, getTrendAnalysis);

/**
 * @route   GET /api/v1/analytics/usage
 * @desc    Get usage statistics
 * @access  Private
 */
router.get('/usage', authenticateToken, getUsageStatistics);

export default router;