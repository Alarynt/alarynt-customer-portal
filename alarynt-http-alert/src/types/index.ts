import { Request } from 'express';

export interface AlertRequest {
  ruleId: string;
  payload: Record<string, any>;
  metadata?: {
    source?: string;
    timestamp?: string;
    correlationId?: string;
  };
}

export interface AlertResponse {
  success: boolean;
  executionId: string;
  timestamp: string;
  result?: {
    ruleExecuted: boolean;
    actionsExecuted: number;
    executionTime: number;
  };
  error?: {
    message: string;
    code: string;
  };
}

export interface Customer {
  id: string;
  name: string;
  apiTokens: ApiToken[];
  allowedRules: string[];
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiToken {
  id: string;
  token: string;
  name: string;
  permissions: string[];
  expiresAt?: Date;
  lastUsedAt?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface Rule {
  id: string;
  name: string;
  customerId: string;
  isActive: boolean;
  conditions: Record<string, any>;
  actions: Action[];
  metadata?: {
    description?: string;
    tags?: string[];
    version?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Action {
  id: string;
  type: 'email' | 'sms' | 'webhook' | 'database' | 'notification';
  config: Record<string, any>;
  isActive: boolean;
}

export interface LambdaExecutionResult {
  success: boolean;
  executionId: string;
  executionTime: number;
  rulesExecuted: number;
  actionsExecuted: number;
  successRate: number;
  error?: string;
}

export interface AuthenticatedRequest extends Request {
  customer?: Customer;
  apiToken?: ApiToken;
}