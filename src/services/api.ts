// API service for communicating with alarynt-customer-backend
const API_BASE_URL = 'http://localhost:3001/api/v1'

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface User {
  id: string
  email: string
  name: string
  company: string
  role: 'Admin' | 'Manager' | 'User' | 'Viewer'
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface Rule {
  id: string
  name: string
  description: string
  dsl: string
  status: 'active' | 'inactive' | 'draft'
  priority: number
  createdAt: Date
  updatedAt: Date
  lastExecuted?: Date
  executionCount: number
  successRate: number
  createdBy: string
  tags?: string[]
}

export interface Action {
  id: string
  name: string
  description: string
  type: 'email' | 'sms' | 'webhook' | 'database' | 'notification'
  config: object
  status: 'active' | 'inactive' | 'draft'
  createdAt: Date
  updatedAt: Date
  lastExecuted?: Date
  executionCount: number
  successRate: number
  createdBy: string
}

class ApiService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken')
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        ...options,
      })

      const data: ApiResponse<T> = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/auth/logout', { method: 'POST' })
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/me')
  }

  async validateToken(): Promise<ApiResponse> {
    return this.request('/auth/validate')
  }

  // Rules endpoints
  async getRules(page = 1, limit = 10): Promise<ApiResponse<{ rules: Rule[], total: number }>> {
    return this.request(`/rules?page=${page}&limit=${limit}`)
  }

  async getRule(id: string): Promise<ApiResponse<Rule>> {
    return this.request(`/rules/${id}`)
  }

  async createRule(rule: Partial<Rule>): Promise<ApiResponse<Rule>> {
    return this.request('/rules', {
      method: 'POST',
      body: JSON.stringify(rule),
    })
  }

  async updateRule(id: string, rule: Partial<Rule>): Promise<ApiResponse<Rule>> {
    return this.request(`/rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(rule),
    })
  }

  async deleteRule(id: string): Promise<ApiResponse> {
    return this.request(`/rules/${id}`, { method: 'DELETE' })
  }

  async toggleRuleStatus(id: string): Promise<ApiResponse<Rule>> {
    return this.request(`/rules/${id}/toggle`, { method: 'PATCH' })
  }

  // Actions endpoints
  async getActions(page = 1, limit = 10): Promise<ApiResponse<{ actions: Action[], total: number }>> {
    return this.request(`/actions?page=${page}&limit=${limit}`)
  }

  async getAction(id: string): Promise<ApiResponse<Action>> {
    return this.request(`/actions/${id}`)
  }

  async createAction(action: Partial<Action>): Promise<ApiResponse<Action>> {
    return this.request('/actions', {
      method: 'POST',
      body: JSON.stringify(action),
    })
  }

  async updateAction(id: string, action: Partial<Action>): Promise<ApiResponse<Action>> {
    return this.request(`/actions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(action),
    })
  }

  async deleteAction(id: string): Promise<ApiResponse> {
    return this.request(`/actions/${id}`, { method: 'DELETE' })
  }

  async toggleActionStatus(id: string): Promise<ApiResponse<Action>> {
    return this.request(`/actions/${id}/toggle`, { method: 'PATCH' })
  }

  async testAction(id: string): Promise<ApiResponse> {
    return this.request(`/actions/${id}/test`, { method: 'POST' })
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<ApiResponse<any>> {
    return this.request('/dashboard/stats')
  }

  async getDashboardActivity(): Promise<ApiResponse<any[]>> {
    return this.request('/dashboard/activity')
  }

  async getRuleExecutions(): Promise<ApiResponse<any[]>> {
    return this.request('/dashboard/rule-executions')
  }

  async getActionDistribution(): Promise<ApiResponse<any[]>> {
    return this.request('/dashboard/action-distribution')
  }

  async getTopRules(): Promise<ApiResponse<any[]>> {
    return this.request('/dashboard/top-rules')
  }

  async getHealthMetrics(): Promise<ApiResponse<any>> {
    return this.request('/dashboard/health')
  }

  // Activities endpoints
  async getActivities(page = 1, limit = 50): Promise<ApiResponse<{ activities: any[], total: number }>> {
    return this.request(`/activities?page=${page}&limit=${limit}`)
  }

  async getActivitiesByType(type: string): Promise<ApiResponse<any[]>> {
    return this.request(`/activities/by-type/${type}`)
  }

  async getActivitiesByUser(userId: string): Promise<ApiResponse<any[]>> {
    return this.request(`/activities/by-user/${userId}`)
  }

  async getActivityStats(): Promise<ApiResponse<any>> {
    return this.request('/activities/stats')
  }

  async getActivityTypes(): Promise<ApiResponse<string[]>> {
    return this.request('/activities/types')
  }

  // Analytics endpoints
  async getPerformanceData(): Promise<ApiResponse<any>> {
    return this.request('/analytics/performance')
  }

  async getRulesPerformance(): Promise<ApiResponse<any[]>> {
    return this.request('/analytics/rules/performance')
  }

  async getActionsPerformance(): Promise<ApiResponse<any[]>> {
    return this.request('/analytics/actions/performance')
  }

  async getErrorAnalysis(): Promise<ApiResponse<any[]>> {
    return this.request('/analytics/errors')
  }

  async getTrendAnalysis(): Promise<ApiResponse<any[]>> {
    return this.request('/analytics/trends')
  }

  async getUsageStatistics(): Promise<ApiResponse<any>> {
    return this.request('/analytics/usage')
  }
}

export const apiService = new ApiService()
export default apiService