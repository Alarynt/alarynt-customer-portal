import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { schemas } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { 
  CreateRuleRequest, 
  UpdateRuleRequest, 
  AuthenticatedRequest, 
  ApiResponse, 
  PaginatedResponse,
  Rule,
  RuleQuery 
} from '../types';

/**
 * Get all rules with pagination and filtering
 * GET /api/v1/rules
 */
export const getRules = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { page = 1, limit = 10, status, search }: RuleQuery = req.query;

  // Build query filters
  const filters: any = {};
  if (status) {
    filters.status = status;
  }
  if (search) {
    filters.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $elemMatch: { $regex: search, $options: 'i' } } }
    ];
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get rules with pagination
  const [rules, total] = await Promise.all([
    schemas.Rule
      .find(filters)
      .populate('createdBy', 'name email')
      .sort({ priority: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    schemas.Rule.countDocuments(filters)
  ]);

  const response: PaginatedResponse<Rule> = {
    success: true,
    data: rules.map(rule => ({
      id: rule.id,
      name: rule.name,
      description: rule.description,
      dsl: rule.dsl,
      status: rule.status,
      priority: rule.priority,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
      lastExecuted: rule.lastExecuted,
      executionCount: rule.executionCount,
      successRate: rule.successRate,
      createdBy: rule.createdBy,
      tags: rule.tags
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
 * Get a single rule by ID
 * GET /api/v1/rules/:id
 */
export const getRuleById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const rule = await schemas.Rule
    .findOne({ id })
    .populate('createdBy', 'name email')
    .lean();

  if (!rule) {
    throw createError('Rule not found', 404);
  }

  const ruleData: Rule = {
    id: rule.id,
    name: rule.name,
    description: rule.description,
    dsl: rule.dsl,
    status: rule.status,
    priority: rule.priority,
    createdAt: rule.createdAt,
    updatedAt: rule.updatedAt,
    lastExecuted: rule.lastExecuted,
    executionCount: rule.executionCount,
    successRate: rule.successRate,
    createdBy: rule.createdBy,
    tags: rule.tags
  };

  const response: ApiResponse<Rule> = {
    success: true,
    data: ruleData
  };

  res.status(200).json(response);
});

/**
 * Create a new rule
 * POST /api/v1/rules
 */
export const createRule = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, description, dsl, status, priority, tags }: CreateRuleRequest = req.body;

  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  // Create new rule
  const newRule = new schemas.Rule({
    id: uuidv4(),
    name,
    description,
    dsl,
    status,
    priority,
    tags,
    createdAt: new Date(),
    updatedAt: new Date(),
    executionCount: 0,
    successRate: 0,
    createdBy: req.user.id
  });

  await newRule.save();

  // Create activity log
  const activity = new schemas.Activity({
    id: uuidv4(),
    type: 'rule_created',
    message: `Rule created: ${name}`,
    timestamp: new Date(),
    status: 'success',
    user: req.user.name,
    userId: req.user.id,
    ruleName: name,
    ruleId: newRule._id
  });
  await activity.save();

  const ruleData: Rule = {
    id: newRule.id,
    name: newRule.name,
    description: newRule.description,
    dsl: newRule.dsl,
    status: newRule.status,
    priority: newRule.priority,
    createdAt: newRule.createdAt,
    updatedAt: newRule.updatedAt,
    lastExecuted: newRule.lastExecuted,
    executionCount: newRule.executionCount,
    successRate: newRule.successRate,
    createdBy: req.user.id,
    tags: newRule.tags
  };

  const response: ApiResponse<Rule> = {
    success: true,
    message: 'Rule created successfully',
    data: ruleData
  };

  res.status(201).json(response);
});

/**
 * Update a rule
 * PUT /api/v1/rules/:id
 */
export const updateRule = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updateData: Partial<CreateRuleRequest> = req.body;

  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  // Find and update rule
  const rule = await schemas.Rule.findOne({ id });
  if (!rule) {
    throw createError('Rule not found', 404);
  }

  // Update fields
  if (updateData.name) rule.name = updateData.name;
  if (updateData.description) rule.description = updateData.description;
  if (updateData.dsl) rule.dsl = updateData.dsl;
  if (updateData.status) rule.status = updateData.status;
  if (updateData.priority !== undefined) rule.priority = updateData.priority;
  if (updateData.tags) rule.tags = updateData.tags;
  rule.updatedAt = new Date();

  await rule.save();

  // Create activity log
  const activity = new schemas.Activity({
    id: uuidv4(),
    type: 'rule_updated',
    message: `Rule updated: ${rule.name}`,
    timestamp: new Date(),
    status: 'success',
    user: req.user.name,
    userId: req.user.id,
    ruleName: rule.name,
    ruleId: rule._id
  });
  await activity.save();

  const ruleData: Rule = {
    id: rule.id,
    name: rule.name,
    description: rule.description,
    dsl: rule.dsl,
    status: rule.status,
    priority: rule.priority,
    createdAt: rule.createdAt,
    updatedAt: rule.updatedAt,
    lastExecuted: rule.lastExecuted,
    executionCount: rule.executionCount,
    successRate: rule.successRate,
    createdBy: rule.createdBy,
    tags: rule.tags
  };

  const response: ApiResponse<Rule> = {
    success: true,
    message: 'Rule updated successfully',
    data: ruleData
  };

  res.status(200).json(response);
});

/**
 * Delete a rule
 * DELETE /api/v1/rules/:id
 */
export const deleteRule = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  // Find and delete rule
  const rule = await schemas.Rule.findOne({ id });
  if (!rule) {
    throw createError('Rule not found', 404);
  }

  const ruleName = rule.name;
  await schemas.Rule.deleteOne({ id });

  // Create activity log
  const activity = new schemas.Activity({
    id: uuidv4(),
    type: 'rule_deleted',
    message: `Rule deleted: ${ruleName}`,
    timestamp: new Date(),
    status: 'success',
    user: req.user.name,
    userId: req.user.id,
    ruleName: ruleName,
    details: `Rule with ID ${id} was permanently deleted`
  });
  await activity.save();

  const response: ApiResponse = {
    success: true,
    message: 'Rule deleted successfully'
  };

  res.status(200).json(response);
});

/**
 * Toggle rule status (activate/deactivate)
 * PATCH /api/v1/rules/:id/toggle
 */
export const toggleRuleStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  // Find rule
  const rule = await schemas.Rule.findOne({ id });
  if (!rule) {
    throw createError('Rule not found', 404);
  }

  // Toggle status
  const newStatus = rule.status === 'active' ? 'inactive' : 'active';
  rule.status = newStatus;
  rule.updatedAt = new Date();

  await rule.save();

  // Create activity log
  const activity = new schemas.Activity({
    id: uuidv4(),
    type: 'rule_updated',
    message: `Rule ${newStatus === 'active' ? 'activated' : 'deactivated'}: ${rule.name}`,
    timestamp: new Date(),
    status: 'success',
    user: req.user.name,
    userId: req.user.id,
    ruleName: rule.name,
    ruleId: rule._id
  });
  await activity.save();

  const response: ApiResponse<{ status: string }> = {
    success: true,
    message: `Rule ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
    data: { status: newStatus }
  };

  res.status(200).json(response);
});

/**
 * Get rule execution statistics
 * GET /api/v1/rules/:id/stats
 */
export const getRuleStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Get rule
  const rule = await schemas.Rule.findOne({ id });
  if (!rule) {
    throw createError('Rule not found', 404);
  }

  // Get execution history from the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const executions = await schemas.RuleExecution
    .find({
      ruleId: rule._id,
      startTime: { $gte: thirtyDaysAgo }
    })
    .sort({ startTime: -1 })
    .limit(100)
    .lean();

  const stats = {
    totalExecutions: rule.executionCount,
    successRate: rule.successRate,
    lastExecuted: rule.lastExecuted,
    recentExecutions: executions.length,
    avgResponseTime: executions.length > 0
      ? executions.reduce((acc, exec) => acc + (exec.totalResponseTime || 0), 0) / executions.length
      : 0,
    executionHistory: executions.map(exec => ({
      executionId: exec.executionId,
      startTime: exec.startTime,
      endTime: exec.endTime,
      status: exec.status,
      responseTime: exec.totalResponseTime
    }))
  };

  const response: ApiResponse<any> = {
    success: true,
    data: stats
  };

  res.status(200).json(response);
});