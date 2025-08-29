import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { schemas } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { 
  CreateActionRequest, 
  UpdateActionRequest, 
  AuthenticatedRequest, 
  ApiResponse, 
  PaginatedResponse,
  Action,
  ActionQuery 
} from '../types';

/**
 * Get all actions with pagination and filtering
 * GET /api/v1/actions
 */
export const getActions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { page = 1, limit = 10, type, status, search }: ActionQuery = req.query;

  // Build query filters
  const filters: any = {};
  if (type) {
    filters.type = type;
  }
  if (status) {
    filters.status = status;
  }
  if (search) {
    filters.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get actions with pagination
  const [actions, total] = await Promise.all([
    schemas.Action
      .find(filters)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    schemas.Action.countDocuments(filters)
  ]);

  const response: PaginatedResponse<Action> = {
    success: true,
    data: actions.map((action: any) => ({
      id: action.id,
      name: action.name,
      description: action.description,
      type: action.type,
      config: action.config,
      status: action.status,
      createdAt: action.createdAt,
      updatedAt: action.updatedAt,
      lastExecuted: action.lastExecuted,
      executionCount: action.executionCount,
      successRate: action.successRate,
      createdBy: action.createdBy
    })),
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
 * Get a single action by ID
 * GET /api/v1/actions/:id
 */
export const getActionById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const action = await schemas.Action
    .findOne({ id })
    .populate('createdBy', 'name email')
    .lean();

  if (!action) {
    throw createError('Action not found', 404);
  }

  const actionData: Action = {
    id: action.id,
    name: action.name,
    description: action.description,
    type: action.type,
    config: action.config,
    status: action.status,
    createdAt: action.createdAt,
    updatedAt: action.updatedAt,
    lastExecuted: action.lastExecuted,
    executionCount: action.executionCount,
    successRate: action.successRate,
    createdBy: action.createdBy
  };

  const response: ApiResponse<Action> = {
    success: true,
    data: actionData
  };

  res.status(200).json(response);
});

/**
 * Create a new action
 * POST /api/v1/actions
 */
export const createAction = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, description, type, config, status }: CreateActionRequest = req.body;

  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  // Validate config based on action type
  if (!validateActionConfig(type, config)) {
    throw createError('Invalid configuration for action type', 400);
  }

  // Create new action
  const newAction = new schemas.Action({
    id: uuidv4(),
    name,
    description,
    type,
    config,
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
    executionCount: 0,
    successRate: 0,
    createdBy: req.user.id
  });

  await newAction.save();

  // Create activity log
  const activity = new schemas.Activity({
    id: uuidv4(),
    type: 'action_created',
    message: `Action created: ${name} (${type})`,
    timestamp: new Date(),
    status: 'success',
    user: req.user.name,
    userId: req.user.id,
    actionName: name,
    actionId: newAction._id
  });
  await activity.save();

  const actionData: Action = {
    id: newAction.id,
    name: newAction.name,
    description: newAction.description,
    type: newAction.type,
    config: newAction.config,
    status: newAction.status,
    createdAt: newAction.createdAt,
    updatedAt: newAction.updatedAt,
    lastExecuted: newAction.lastExecuted,
    executionCount: newAction.executionCount,
    successRate: newAction.successRate,
    createdBy: req.user.id
  };

  const response: ApiResponse<Action> = {
    success: true,
    message: 'Action created successfully',
    data: actionData
  };

  res.status(201).json(response);
});

/**
 * Update an action
 * PUT /api/v1/actions/:id
 */
export const updateAction = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updateData: Partial<CreateActionRequest> = req.body;

  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  // Find and update action
  const action = await schemas.Action.findOne({ id });
  if (!action) {
    throw createError('Action not found', 404);
  }

  // Validate config if it's being updated
  if (updateData.config && updateData.type) {
    if (!validateActionConfig(updateData.type, updateData.config)) {
      throw createError('Invalid configuration for action type', 400);
    }
  } else if (updateData.config) {
    if (!validateActionConfig(action.type, updateData.config)) {
      throw createError('Invalid configuration for action type', 400);
    }
  }

  // Update fields
  if (updateData.name) action.name = updateData.name;
  if (updateData.description) action.description = updateData.description;
  if (updateData.type) action.type = updateData.type;
  if (updateData.config) action.config = updateData.config;
  if (updateData.status) action.status = updateData.status;
  action.updatedAt = new Date();

  await action.save();

  // Create activity log
  const activity = new schemas.Activity({
    id: uuidv4(),
    type: 'action_updated',
    message: `Action updated: ${action.name}`,
    timestamp: new Date(),
    status: 'success',
    user: req.user.name,
    userId: req.user.id,
    actionName: action.name,
    actionId: action._id
  });
  await activity.save();

  const actionData: Action = {
    id: action.id,
    name: action.name,
    description: action.description,
    type: action.type,
    config: action.config,
    status: action.status,
    createdAt: action.createdAt,
    updatedAt: action.updatedAt,
    lastExecuted: action.lastExecuted,
    executionCount: action.executionCount,
    successRate: action.successRate,
    createdBy: action.createdBy
  };

  const response: ApiResponse<Action> = {
    success: true,
    message: 'Action updated successfully',
    data: actionData
  };

  res.status(200).json(response);
});

/**
 * Delete an action
 * DELETE /api/v1/actions/:id
 */
export const deleteAction = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  // Find and delete action
  const action = await schemas.Action.findOne({ id });
  if (!action) {
    throw createError('Action not found', 404);
  }

  const actionName = action.name;
  await schemas.Action.deleteOne({ id });

  // Create activity log
  const activity = new schemas.Activity({
    id: uuidv4(),
    type: 'action_deleted',
    message: `Action deleted: ${actionName}`,
    timestamp: new Date(),
    status: 'success',
    user: req.user.name,
    userId: req.user.id,
    actionName: actionName,
    details: `Action with ID ${id} was permanently deleted`
  });
  await activity.save();

  const response: ApiResponse = {
    success: true,
    message: 'Action deleted successfully'
  };

  res.status(200).json(response);
});

/**
 * Toggle action status (activate/deactivate)
 * PATCH /api/v1/actions/:id/toggle
 */
export const toggleActionStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  // Find action
  const action = await schemas.Action.findOne({ id });
  if (!action) {
    throw createError('Action not found', 404);
  }

  // Toggle status
  const newStatus = action.status === 'active' ? 'inactive' : 'active';
  action.status = newStatus;
  action.updatedAt = new Date();

  await action.save();

  // Create activity log
  const activity = new schemas.Activity({
    id: uuidv4(),
    type: 'action_updated',
    message: `Action ${newStatus === 'active' ? 'activated' : 'deactivated'}: ${action.name}`,
    timestamp: new Date(),
    status: 'success',
    user: req.user.name,
    userId: req.user.id,
    actionName: action.name,
    actionId: action._id
  });
  await activity.save();

  const response: ApiResponse<{ status: string }> = {
    success: true,
    message: `Action ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
    data: { status: newStatus }
  };

  res.status(200).json(response);
});

/**
 * Test an action
 * POST /api/v1/actions/:id/test
 */
export const testAction = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { testData = {} } = req.body;

  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  // Find action
  const action = await schemas.Action.findOne({ id });
  if (!action) {
    throw createError('Action not found', 404);
  }

  // Mock test execution
  const testResult = {
    success: true,
    message: 'Action test completed successfully',
    executionTime: Math.round(Math.random() * 1000) + 100, // Mock execution time
    result: {
      actionType: action.type,
      config: action.config,
      testData,
      timestamp: new Date().toISOString()
    }
  };

  // Create activity log
  const activity = new schemas.Activity({
    id: uuidv4(),
    type: 'action_executed',
    message: `Action tested: ${action.name}`,
    timestamp: new Date(),
    status: 'success',
    user: req.user.name,
    userId: req.user.id,
    actionName: action.name,
    actionId: action._id,
    details: 'Test execution'
  });
  await activity.save();

  const response: ApiResponse<any> = {
    success: true,
    message: 'Action test completed',
    data: testResult
  };

  res.status(200).json(response);
});

/**
 * Validate action configuration based on type
 */
function validateActionConfig(type: string, config: any): boolean {
  switch (type) {
    case 'email':
      return config.to && config.subject;
    case 'sms':
      return config.to && config.message;
    case 'webhook':
      return config.url && config.method;
    case 'database':
      return config.table;
    case 'notification':
      return config.message;
    default:
      return false;
  }
}