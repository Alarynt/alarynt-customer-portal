import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft,
  Building,
  User,
  Mail,
  Calendar,
  TrendingUp,
  Target,
  Zap,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  Download
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import adminApiService, { CustomerMetrics } from '../services/api'

const CustomerDetail = () => {
  const { customerId } = useParams()
  const navigate = useNavigate()
  const [customerData, setCustomerData] = useState<CustomerMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadCustomerData = async () => {
      if (!customerId) return

      try {
        setLoading(true)
        setError('')

        // Mock data until backend is implemented
        // TODO: Replace with adminApiService.getCustomerMetrics(customerId)
        const mockCustomerData: CustomerMetrics = {
          customer: {
            id: customerId,
            email: 'admin@acme-corp.com',
            name: 'John Smith',
            company: 'Acme Corp',
            totalRules: 45,
            activeRules: 42,
            totalActions: 22,
            totalActivities: 2847,
            successRate: 96.5,
            lastActivity: new Date('2024-01-26T14:30:00'),
            createdAt: new Date('2023-06-15T10:00:00')
          },
          ruleExecutions: [
            { date: 'Jan 20', executions: 156, success: 152, failed: 4 },
            { date: 'Jan 21', executions: 189, success: 182, failed: 7 },
            { date: 'Jan 22', executions: 134, success: 128, failed: 6 },
            { date: 'Jan 23', executions: 167, success: 161, failed: 6 },
            { date: 'Jan 24', executions: 198, success: 190, failed: 8 },
            { date: 'Jan 25', executions: 145, success: 140, failed: 5 },
            { date: 'Jan 26', executions: 223, success: 218, failed: 5 }
          ],
          actionDistribution: [
            { name: 'Email Alerts', value: 45, color: '#3B82F6' },
            { name: 'Webhooks', value: 30, color: '#10B981' },
            { name: 'Database Updates', value: 15, color: '#F59E0B' },
            { name: 'SMS Notifications', value: 10, color: '#EF4444' }
          ],
          recentActivity: [
            { id: '1', type: 'rule_executed', message: 'High Value Customer Alert triggered', time: '2 minutes ago', status: 'success' },
            { id: '2', type: 'action_completed', message: 'Email notification sent successfully', time: '5 minutes ago', status: 'success' },
            { id: '3', type: 'rule_executed', message: 'Inventory check rule processed', time: '12 minutes ago', status: 'success' },
            { id: '4', type: 'action_failed', message: 'Webhook delivery failed - retrying', time: '18 minutes ago', status: 'warning' },
            { id: '5', type: 'rule_executed', message: 'Payment processing rule completed', time: '25 minutes ago', status: 'success' }
          ],
          performanceStats: {
            avgResponseTime: 145,
            totalExecutions: 1212,
            totalSuccess: 1167,
            totalFailures: 45,
            uptime: 99.2
          }
        }

        setCustomerData(mockCustomerData)
      } catch (err: any) {
        console.error('Failed to load customer data:', err)
        setError('Failed to load customer data. Please try refreshing the page.')
      } finally {
        setLoading(false)
      }
    }

    loadCustomerData()
  }, [customerId])

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

  if (error || !customerData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error || 'Customer not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/customers')}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{customerData.customer.company}</h1>
              <p className="mt-1 text-gray-600">Customer Performance & Analytics</p>
            </div>
          </div>
          <button className="btn-primary">
            <Download className="h-4 w-4 mr-2" />
            Export Customer Data
          </button>
        </div>
      </div>

      {/* Customer info card */}
      <div className="card mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="h-16 w-16 bg-primary-100 rounded-lg flex items-center justify-center">
              <Building className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">{customerData.customer.company}</h2>
              <div className="mt-1 space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  {customerData.customer.name}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {customerData.customer.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Customer since {customerData.customer.createdAt.toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Total Rules</p>
              <p className="text-xl font-bold text-gray-900">{customerData.customer.totalRules}</p>
              <p className="text-xs text-green-600">{customerData.customer.activeRules} active</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Total Actions</p>
              <p className="text-xl font-bold text-gray-900">{customerData.customer.totalActions}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="h-5 w-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Activities</p>
              <p className="text-xl font-bold text-gray-900">{customerData.customer.totalActivities.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Success Rate</p>
              <p className="text-xl font-bold text-gray-900">{customerData.customer.successRate}%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Avg Response</p>
              <p className="text-xl font-bold text-gray-900">{customerData.performanceStats.avgResponseTime}ms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Rule Executions Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Rule Executions (Last 7 Days)</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={customerData.ruleExecutions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="executions" stroke="#3B82F6" strokeWidth={2} name="Total Executions" />
              <Line type="monotone" dataKey="success" stroke="#10B981" strokeWidth={2} name="Success" />
              <Line type="monotone" dataKey="failed" stroke="#EF4444" strokeWidth={2} name="Failed" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Action Distribution Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Action Type Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={customerData.actionDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {customerData.actionDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Summary and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Summary */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Total Executions</span>
              <span className="text-sm font-bold text-gray-900">{customerData.performanceStats.totalExecutions.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Successful</span>
              <span className="text-sm font-bold text-green-600">{customerData.performanceStats.totalSuccess.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Failures</span>
              <span className="text-sm font-bold text-red-600">{customerData.performanceStats.totalFailures}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Avg Response Time</span>
              <span className="text-sm font-bold text-gray-900">{customerData.performanceStats.avgResponseTime}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Uptime</span>
              <span className="text-sm font-bold text-green-600">{customerData.performanceStats.uptime}%</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="space-y-4">
            {customerData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(activity.status)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerDetail