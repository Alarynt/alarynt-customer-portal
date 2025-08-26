import { Router } from 'express';
import {
  getRules,
  getRuleById,
  createRule,
  updateRule,
  deleteRule,
  toggleRuleStatus,
  getRuleStats
} from '../controllers/rulesController';
import { authenticateToken, requireManagerOrAdmin } from '../middleware/auth';
import {
  validateCreateRule,
  validateUpdateRule,
  validateId,
  validatePagination
} from '../middleware/validation';

const router = Router();

/**
 * @route   GET /api/v1/rules
 * @desc    Get all rules with pagination and filtering
 * @access  Private
 */
router.get('/', authenticateToken, validatePagination, getRules);

/**
 * @route   GET /api/v1/rules/:id
 * @desc    Get a single rule by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, validateId, getRuleById);

/**
 * @route   POST /api/v1/rules
 * @desc    Create a new rule
 * @access  Private (Manager/Admin only)
 */
router.post('/', authenticateToken, requireManagerOrAdmin, validateCreateRule, createRule);

/**
 * @route   PUT /api/v1/rules/:id
 * @desc    Update a rule
 * @access  Private (Manager/Admin only)
 */
router.put('/:id', authenticateToken, requireManagerOrAdmin, validateUpdateRule, updateRule);

/**
 * @route   DELETE /api/v1/rules/:id
 * @desc    Delete a rule
 * @access  Private (Manager/Admin only)
 */
router.delete('/:id', authenticateToken, requireManagerOrAdmin, validateId, deleteRule);

/**
 * @route   PATCH /api/v1/rules/:id/toggle
 * @desc    Toggle rule status (activate/deactivate)
 * @access  Private (Manager/Admin only)
 */
router.patch('/:id/toggle', authenticateToken, requireManagerOrAdmin, validateId, toggleRuleStatus);

/**
 * @route   GET /api/v1/rules/:id/stats
 * @desc    Get rule execution statistics
 * @access  Private
 */
router.get('/:id/stats', authenticateToken, validateId, getRuleStats);

export default router;