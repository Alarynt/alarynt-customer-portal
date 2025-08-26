import { Router } from 'express';
import {
  getActions,
  getActionById,
  createAction,
  updateAction,
  deleteAction,
  toggleActionStatus,
  testAction
} from '../controllers/actionsController';
import { authenticateToken, requireManagerOrAdmin } from '../middleware/auth';
import {
  validateCreateAction,
  validateUpdateAction,
  validateId,
  validatePagination
} from '../middleware/validation';

const router = Router();

/**
 * @route   GET /api/v1/actions
 * @desc    Get all actions with pagination and filtering
 * @access  Private
 */
router.get('/', authenticateToken, validatePagination, getActions);

/**
 * @route   GET /api/v1/actions/:id
 * @desc    Get a single action by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, validateId, getActionById);

/**
 * @route   POST /api/v1/actions
 * @desc    Create a new action
 * @access  Private (Manager/Admin only)
 */
router.post('/', authenticateToken, requireManagerOrAdmin, validateCreateAction, createAction);

/**
 * @route   PUT /api/v1/actions/:id
 * @desc    Update an action
 * @access  Private (Manager/Admin only)
 */
router.put('/:id', authenticateToken, requireManagerOrAdmin, validateUpdateAction, updateAction);

/**
 * @route   DELETE /api/v1/actions/:id
 * @desc    Delete an action
 * @access  Private (Manager/Admin only)
 */
router.delete('/:id', authenticateToken, requireManagerOrAdmin, validateId, deleteAction);

/**
 * @route   PATCH /api/v1/actions/:id/toggle
 * @desc    Toggle action status (activate/deactivate)
 * @access  Private (Manager/Admin only)
 */
router.patch('/:id/toggle', authenticateToken, requireManagerOrAdmin, validateId, toggleActionStatus);

/**
 * @route   POST /api/v1/actions/:id/test
 * @desc    Test an action
 * @access  Private (Manager/Admin only)
 */
router.post('/:id/test', authenticateToken, requireManagerOrAdmin, validateId, testAction);

export default router;