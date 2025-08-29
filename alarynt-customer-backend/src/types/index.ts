import { Request } from 'express';

// User types
export interface User {
  _id?: string; // MongoDB ObjectId
  id: string;
  email: string;
  name: string;
  company: string;
  role: 'Admin' | 'Manager' | 'User' | 'Viewer';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  company: string;
  role: 'Admin' | 'Manager' | 'User' | 'Viewer';
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Omit<User, 'password'>;
}

// Rule types
export interface Rule {
  id: string;
  name: string;
  description: string;
  dsl: string;
  status: 'active' | 'inactive' | 'draft';
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  lastExecuted?: Date;
  executionCount: number;
  successRate: number;
  createdBy: string;
  tags?: string[];
}

export interface CreateRuleRequest {
  name: string;
  description: string;
  dsl: string;
  status: 'active' | 'inactive' | 'draft';
  priority: number;
  tags?: string[];
}

export interface UpdateRuleRequest extends Partial<CreateRuleRequest> {
  id: string;
}

// Action types
export interface Action {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'sms' | 'webhook' | 'database' | 'notification';
  config: any;
  status: 'active' | 'inactive' | 'draft';
  createdAt: Date;
  updatedAt: Date;
  lastExecuted?: Date;
  executionCount: number;
  successRate: number;
  createdBy: string;
}

export interface CreateActionRequest {
  name: string;
  description: string;
  type: 'email' | 'sms' | 'webhook' | 'database' | 'notification';
  config: any;
  status: 'active' | 'inactive' | 'draft';
}

export interface UpdateActionRequest extends Partial<CreateActionRequest> {
  id: string;
}

// Activity types
export interface Activity {
  id: string;
  type: 'rule_created' | 'rule_updated' | 'rule_deleted' | 'rule_executed' | 'action_created' | 'action_updated' | 'action_deleted' | 'action_executed' | 'action_completed' | 'action_failed' | 'rule_triggered' | 'user_login' | 'user_logout' | 'admin_login' | 'admin_logout' | 'system_error' | 'system_maintenance';
  message: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error' | 'info';
  user?: string;
  userId?: string;
  ruleName?: string;
  ruleId?: string;
  actionName?: string;
  actionId?: string;
  details?: string;
  metadata?: any;
}

// Dashboard types
export interface DashboardStats {
  totalRules: number;
  activeRules: number;
  totalActions: number;
  successRate: number;
}

export interface PerformanceData {
  date: Date;
  executions: number;
  success: number;
  failed: number;
  responseTime: number;
}

export interface RulePerformance {
  ruleId: string;
  name: string;
  executions: number;
  success: number;
  failed: number;
  avgResponse: number;
  lastUpdated: Date;
}

export interface ActionPerformance {
  actionId: string;
  name: string;
  executions: number;
  success: number;
  failed: number;
  avgResponse: number;
  lastUpdated: Date;
}

export interface ErrorAnalysis {
  type: string;
  count: number;
  percentage: number;
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  firstOccurrence: Date;
  lastOccurrence: Date;
  description?: string;
  resolution?: string;
  isResolved: boolean;
}

// Express request extensions
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Query types
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface RuleQuery extends PaginationQuery {
  status?: 'active' | 'inactive' | 'draft';
  search?: string;
}

export interface ActionQuery extends PaginationQuery {
  type?: 'email' | 'sms' | 'webhook' | 'database' | 'notification';
  status?: 'active' | 'inactive' | 'draft';
  search?: string;
}

export interface ActivityQuery extends PaginationQuery {
  type?: string;
  status?: 'success' | 'warning' | 'error' | 'info';
  startDate?: Date;
  endDate?: Date;
}