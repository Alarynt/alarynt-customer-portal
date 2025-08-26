import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Plus,
  Activity,
  Zap,
  Target
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRules: 0,
    activeRules: 0,
    totalActions: 0,
    successRate: 0
  })

  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [ruleExecutions, setRuleExecutions] = useState<any[]>([])
  const [actionDistribution, setActionDistribution] = useState<any[]>([])

  useEffect(() => {
    // Simulate loading data
    const mockStats = {
      totalRules: 24,
      activeRules: 18,
      totalActions: 12,
      successRate: 94.2
    }

    const mockRecentActivity = [
      { id: 1, type: 'rule_created', message: 'New rule "High Value Customer Alert" created', time: '2 minutes ago', status: 'success' },
      { id: 2, type: 'action_executed', message: 'Email notification sent to sales team', time: '5 minutes ago', status: 'success' },
      { id: 3, type: 'rule_triggered', message: 'Rule "Inventory Low Alert" triggered', time: '12 minutes ago', status: 'warning' },
      { id: 4, type: 'action_failed', message: 'SMS notification failed to send', time: '1 hour ago', status: 'error' },
      { id: 5, type: 'rule_updated', message: 'Rule "Payment Processing" updated', time: '2 hours ago', status: 'info' }
    ]

    const mockRuleExecutions = [
      { name: 'Mon', executions: 45, success: 42, failed: 3 },
      { name: 'Tue', executions: 52, success: 49, failed: 3 },
      { name: 'Wed', executions: 38, success: 36, failed: 2 },
      { name: 'Thu', executions: 61, success: 58, failed: 3 },
      { name: 'Fri', executions: 48, success: 45, failed: 3 },
      { name: 'Sat', executions: 23, success: 22, failed: 1 },
      { name: 'Sun', executions: 19, success: 18, failed: 1 }
    ]

    const mockActionDistribution = [
      { name: 'Email Notifications', value: 45, color: '#3B82F6' },
      { name: 'SMS Alerts', value: 25, color: '#10B981' },
      { name: 'Webhook Calls', value: 20, color: '#F59E0B' },
      { name: 'Database Updates', value: 10, color: '#EF4444' }
    ]

    setStats(mockStats)
    setRecentActivity(mockRecentActivity)
    setRuleExecutions(mockRuleExecutions)
    setActionDistribution(mockActionDistribution)
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Monitor your rule engine performance and activity</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Rules</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRules}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Rules</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeRules}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Actions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalActions}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
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
            <button className="btn-secondary text-sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ruleExecutions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="executions" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="success" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Action Distribution Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Action Distribution</h3>
            <button className="btn-secondary text-sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Action
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={actionDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {actionDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={(entry as any).color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <button className="btn-secondary text-sm">
            <Activity className="h-4 w-4 mr-2" />
            View All
          </button>
        </div>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
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
  )
}

export default Dashboard
