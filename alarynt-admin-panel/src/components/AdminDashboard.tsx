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
    successRate: number
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

        // For now, using mock data until backend endpoints are implemented
        // TODO: Replace with actual API calls to adminApiService.getSystemStats(), etc.
        
        // Mock system stats
        setSystemStats({
          totalCustomers: 47,
          activeCustomers: 42,
          totalRules: 324,
          totalActions: 156,
          totalActivities: 12847,
          systemSuccessRate: 94.2
        })

        // Mock system activity
        setSystemActivity([
          { id: '1', type: 'rule_executed', customer: 'Acme Corp', message: 'High Value Customer Alert triggered', time: '2 minutes ago', status: 'success' },
          { id: '2', type: 'action_failed', customer: 'TechStart Inc', message: 'Email notification failed to send', time: '5 minutes ago', status: 'error' },
          { id: '3', type: 'rule_created', customer: 'Global Solutions', message: 'New inventory rule created', time: '10 minutes ago', status: 'info' },
          { id: '4', type: 'user_login', customer: 'Innovate LLC', message: 'User logged in successfully', time: '15 minutes ago', status: 'success' },
          { id: '5', type: 'rule_executed', customer: 'DataFlow Corp', message: 'Fraud detection rule triggered warning', time: '18 minutes ago', status: 'warning' }
        ])

        // Mock customer usage data
        setCustomerUsage([
          { company: 'Acme Corp', totalRules: 45, totalActions: 22, activities: 2847, successRate: 96.5 },
          { company: 'TechStart Inc', totalRules: 38, totalActions: 18, activities: 1924, successRate: 92.1 },
          { company: 'Global Solutions', totalRules: 52, totalActions: 31, activities: 3456, successRate: 95.8 },
          { company: 'Innovate LLC', totalRules: 29, totalActions: 15, activities: 1567, successRate: 88.9 },
          { company: 'DataFlow Corp', totalRules: 41, totalActions: 19, activities: 2234, successRate: 94.2 }
        ])

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

        {/* Customer Usage Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Customer Usage Overview</h3>
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
              <Bar dataKey="activities" fill="#3B82F6" name="Activities" />
            </BarChart>
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