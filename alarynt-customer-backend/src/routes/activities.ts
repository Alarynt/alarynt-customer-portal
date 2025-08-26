import { Router } from 'express';
import {
  getActivities,
  getActivitiesByType,
  getActivitiesByUser,
  getActivityStats,
  getActivityTypes,
  cleanupOldActivities
} from '../controllers/activitiesController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validatePagination, validateDateRange } from '../middleware/validation';

const router = Router();

/**
 * @route   GET /api/v1/activities
 * @desc    Get all activities with pagination and filtering
 * @access  Private
 */
router.get('/', authenticateToken, validatePagination, validateDateRange, getActivities);

/**
 * @route   GET /api/v1/activities/by-type/:type
 * @desc    Get activities by type
 * @access  Private
 */
router.get('/by-type/:type', authenticateToken, validatePagination, getActivitiesByType);

/**
 * @route   GET /api/v1/activities/by-user/:userId
 * @desc    Get activities by user
 * @access  Private
 */
router.get('/by-user/:userId', authenticateToken, validatePagination, getActivitiesByUser);

/**
 * @route   GET /api/v1/activities/stats
 * @desc    Get activity statistics
 * @access  Private
 */
router.get('/stats', authenticateToken, getActivityStats);

/**
 * @route   GET /api/v1/activities/types
 * @desc    Get available activity types
 * @access  Private
 */
router.get('/types', authenticateToken, getActivityTypes);

/**
 * @route   DELETE /api/v1/activities/cleanup
 * @desc    Delete old activities (Admin only)
 * @access  Private (Admin only)
 */
router.delete('/cleanup', authenticateToken, requireAdmin, cleanupOldActivities);

export default router;