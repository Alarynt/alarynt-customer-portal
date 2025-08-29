import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Activity,
  Zap,
  Target,
  Building,
  Database
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import adminApiService from '../services/api'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [systemStats, setSystemStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalRules: 0,
    totalActions: 0,
    totalActivities: 0,
    systemSuccessRate: 0
  })

  interface SystemActivity {
    id: string
    type: string
    customer: string
    message: string
    time: string
    status: 'success' | 'warning' | 'error' | 'info'
  }

  interface CustomerUsage {
    company: string
    totalRules: number
    totalActions: number
    activities: number
    totalRuleExecutions: number
    totalActionExecutions: number
    successRate: number
    lastLogin?: Date
  }

  interface SystemPerformance {
    date: string
    totalExecutions: number
    totalSuccess: number
    totalFailures: number
    avgResponseTime: number
  }

  const [systemActivity, setSystemActivity] = useState<SystemActivity[]>([])
  const [customerUsage, setCustomerUsage] = useState<CustomerUsage[]>([])
  const [systemPerformance, setSystemPerformance] = useState<SystemPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        setError('')

        // Load real system stats from backend
        const systemStatsResponse = await adminApiService.getSystemStats()
        if (systemStatsResponse.success && systemStatsResponse.data) {
          setSystemStats({
            totalCustomers: systemStatsResponse.data.totalCustomers,
            activeCustomers: systemStatsResponse.data.activeCustomers,
            totalRules: systemStatsResponse.data.totalRules,
            totalActions: systemStatsResponse.data.totalActions,
            totalActivities: systemStatsResponse.data.totalActivities,
            systemSuccessRate: systemStatsResponse.data.systemSuccessRate
          })
        }

        // Load real system activity data
        const systemActivityResponse = await adminApiService.getSystemActivity()
        if (systemActivityResponse.success && systemActivityResponse.data) {
          const formattedActivity = systemActivityResponse.data.map(activity => ({
            id: activity.id,
            type: activity.type,
            customer: activity.user || 'System',
            message: activity.message,
            time: getTimeAgo(new Date(activity.timestamp)),
            status: activity.status
          }))
          setSystemActivity(formattedActivity)
        }

        // Load real customer usage data
        const customersResponse = await adminApiService.getAllCustomers()
        if (customersResponse.success && customersResponse.data) {
          const customerUsageData = customersResponse.data.map(customer => ({
            company: customer.company,
            totalRules: customer.totalRules,
            totalActions: customer.totalActions,
            activities: customer.totalActivities,
            totalRuleExecutions: customer.totalRuleExecutions || 0,
            totalActionExecutions: customer.totalActionExecutions || 0,
            successRate: customer.successRate,
            lastLogin: customer.lastLogin
          }))
          setCustomerUsage(customerUsageData)
        }

        // Mock system performance data
        const performanceData = []
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          performanceData.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            totalExecutions: Math.floor(Math.random() * 500) + 200,
            totalSuccess: Math.floor(Math.random() * 450) + 180,
            totalFailures: Math.floor(Math.random() * 50) + 10,
            avgResponseTime: Math.floor(Math.random() * 200) + 100
          })
        }
        setSystemPerformance(performanceData)

      } catch (err: any) {
        console.error('Failed to load admin dashboard data:', err)
        setError('Failed to load dashboard data. Please try refreshing the page.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50'
      case 'error':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-blue-600 bg-blue-50'
    }
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days} day${days === 1 ? '' : 's'} ago`
    } else if (hours > 0) {
      return `${hours} hour${hours === 1 ? '' : 's'} ago`
    } else {
      return 'Just now'
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">System-wide overview and customer management</p>
      </div>

      {/* System stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{systemStats.totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900">{systemStats.activeCustomers}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Rules</p>
              <p className="text-2xl font-bold text-gray-900">{systemStats.totalRules}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Zap className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Actions</p>
              <p className="text-2xl font-bold text-gray-900">{systemStats.totalActions}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Database className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900">{systemStats.totalActivities.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">System Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{systemStats.systemSuccessRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* System Performance Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">System Performance (Last 7 Days)</h3>
            <Link to="/system" className="btn-secondary text-sm">
              View Details
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={systemPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="totalExecutions" stroke="#3B82F6" strokeWidth={2} name="Total Executions" />
              <Line type="monotone" dataKey="totalSuccess" stroke="#10B981" strokeWidth={2} name="Successful" />
              <Line type="monotone" dataKey="totalFailures" stroke="#EF4444" strokeWidth={2} name="Failed" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Customer Rule Executions Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Customer Rule Executions</h3>
            <Link to="/customers" className="btn-secondary text-sm">
              <Users className="h-4 w-4 mr-2" />
              View All
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={customerUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="company" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalRuleExecutions" fill="#6366F1" name="Rule Executions" />
              <Bar dataKey="totalActionExecutions" fill="#10B981" name="Action Executions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Customer Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Customers by Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Customers by Activity</h3>
            <Link to="/customers" className="btn-secondary text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {customerUsage
              .sort((a, b) => b.activities - a.activities)
              .slice(0, 5)
              .map((customer, index) => (
                <div key={customer.company} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{customer.company}</p>
                      <p className="text-xs text-gray-500">{customer.activities.toLocaleString()} activities</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{customer.successRate}%</p>
                    <p className="text-xs text-gray-500">success rate</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Customer Execution Metrics */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Customer Execution Metrics</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={customerUsage.map(customer => ({
                  name: customer.company,
                  value: (customer.totalRuleExecutions || 0) + (customer.totalActionExecutions || 0),
                  executions: customer.totalRuleExecutions || 0,
                  actions: customer.totalActionExecutions || 0
                }))}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {customerUsage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'][index % 6]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [
                `${value} total executions`,
                `${props.payload.name}`
              ]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent System Activity */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent System Activity</h3>
            <Link to="/system" className="btn-secondary text-sm">
              <Activity className="h-4 w-4 mr-2" />
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {systemActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(activity.status)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">{activity.customer}</span> • {activity.time}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/customers')}
              className="w-full flex items-center justify-between p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors duration-200"
            >
              <div className="flex items-center">
                <Users className="h-5 w-5 text-primary-600" />
                <span className="ml-3 text-sm font-medium text-primary-900">View All Customers</span>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/system')}
              className="w-full flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
            >
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="ml-3 text-sm font-medium text-green-900">System Health</span>
              </div>
            </button>
            
            <button
              className="w-full flex items-center justify-between p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200"
            >
              <div className="flex items-center">
                <Database className="h-5 w-5 text-purple-600" />
                <span className="ml-3 text-sm font-medium text-purple-900">Export Data</span>
              </div>
            </button>
            
            <button
              className="w-full flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors duration-200"
            >
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span className="ml-3 text-sm font-medium text-orange-900">System Alerts</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard