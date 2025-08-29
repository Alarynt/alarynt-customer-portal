// API service for admin panel communicating with alarynt-customer-backend
const API_BASE_URL = 'http://localhost:3001/api/v1'

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface AdminUser {
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
  user: AdminUser
}

export interface CustomerOverview {
  id: string
  email: string
  name: string
  company: string
  totalRules: number
  activeRules: number
  totalActions: number
  totalActivities: number
  successRate: number
  lastActivity: Date
  createdAt: Date
}

export interface CustomerMetrics {
  customer: CustomerOverview
  ruleExecutions: Array<{
    date: string
    executions: number
    success: number
    failed: number
  }>
  actionDistribution: Array<{
    name: string
    value: number
    color: string
  }>
  recentActivity: Array<{
    id: string
    type: string
    message: string
    time: string
    status: 'success' | 'warning' | 'error' | 'info'
  }>
  performanceStats: {
    avgResponseTime: number
    totalExecutions: number
    totalSuccess: number
    totalFailures: number
    uptime: number
  }
}

class AdminApiService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('adminAuthToken')
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

  // Authentication endpoints (admin-specific)
  async adminLogin(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/admin/auth/logout', { method: 'POST' })
  }

  async getCurrentAdmin(): Promise<ApiResponse<AdminUser>> {
    return this.request<AdminUser>('/admin/auth/me')
  }

  async validateToken(): Promise<ApiResponse> {
    return this.request('/admin/auth/validate')
  }

  // Admin dashboard endpoints
  async getAllCustomers(): Promise<ApiResponse<CustomerOverview[]>> {
    return this.request<CustomerOverview[]>('/admin/customers')
  }

  async getCustomerMetrics(customerId: string): Promise<ApiResponse<CustomerMetrics>> {
    return this.request<CustomerMetrics>(`/admin/customers/${customerId}/metrics`)
  }

  async getSystemStats(): Promise<ApiResponse<any>> {
    return this.request('/admin/system/stats')
  }

  async getSystemActivity(): Promise<ApiResponse<any[]>> {
    return this.request('/admin/system/activity')
  }

  // Export data for admin
  async exportCustomerData(customerId?: string): Promise<ApiResponse<any>> {
    const endpoint = customerId ? `/admin/export/customer/${customerId}` : '/admin/export/all'
    return this.request(endpoint)
  }
}

export const adminApiService = new AdminApiService()
export default adminApiService