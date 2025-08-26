import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown,
  Clock,
  Target,
  BarChart3,
  Calendar,
  Download,
  Filter
} from 'lucide-react'
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts'

interface PerformanceData {
  date: string
  executions: number
  success: number
  failed: number
  responseTime: number
}

interface RulePerformance {
  name: string
  executions: number
  success: number
  failed: number
  avgResponse: number
}

interface ActionPerformance {
  name: string
  executions: number
  success: number
  failed: number
  avgResponse: number
}

interface ErrorAnalysis {
  type: string
  count: number
  percentage: number
  impact: string
}

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedMetric, setSelectedMetric] = useState('executions')
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [rulePerformance, setRulePerformance] = useState<RulePerformance[]>([])
  const [actionPerformance, setActionPerformance] = useState<ActionPerformance[]>([])
  const [errorAnalysis, setErrorAnalysis] = useState<ErrorAnalysis[]>([])

  useEffect(() => {
    // Mock data based on time range
    const generateMockData = (range: string) => {
      const data = []
      const now = new Date()
      let days = 7
      
      if (range === '30d') days = 30
      else if (range === '90d') days = 90
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          executions: Math.floor(Math.random() * 100) + 50,
          success: Math.floor(Math.random() * 90) + 40,
          failed: Math.floor(Math.random() * 20) + 5,
          responseTime: Math.floor(Math.random() * 500) + 100
        })
      }
      return data
    }

    const mockRulePerformance = [
      { name: 'High Value Customer Alert', executions: 156, success: 152, failed: 4, avgResponse: 120 },
      { name: 'Inventory Low Alert', executions: 89, success: 85, failed: 4, avgResponse: 95 },
      { name: 'Payment Processing Rule', executions: 234, success: 228, failed: 6, avgResponse: 180 },
      { name: 'Customer Support Escalation', executions: 67, success: 65, failed: 2, avgResponse: 150 },
      { name: 'Fraud Detection', executions: 445, success: 438, failed: 7, avgResponse: 220 }
    ]

    const mockActionPerformance = [
      { name: 'Email Notifications', executions: 234, success: 230, failed: 4, avgResponse: 85 },
      { name: 'SMS Alerts', executions: 156, success: 152, failed: 4, avgResponse: 120 },
      { name: 'Webhook Calls', executions: 189, success: 182, failed: 7, avgResponse: 95 },
      { name: 'Database Updates', executions: 445, success: 438, failed: 7, avgResponse: 45 }
    ]

    const mockErrorAnalysis = [
      { type: 'Network Timeout', count: 23, percentage: 45.1, impact: 'Medium' },
      { type: 'Invalid Data Format', count: 18, percentage: 35.3, impact: 'Low' },
      { type: 'Authentication Failed', count: 7, percentage: 13.7, impact: 'High' },
      { type: 'Rate Limit Exceeded', count: 3, percentage: 5.9, impact: 'Medium' }
    ]

    setPerformanceData(generateMockData(timeRange))
    setRulePerformance(mockRulePerformance)
    setActionPerformance(mockActionPerformance)
    setErrorAnalysis(mockErrorAnalysis)
  }, [timeRange])

  const getMetricData = () => {
    if (selectedMetric === 'executions') return performanceData.map(d => ({ date: d.date, value: d.executions }))
    if (selectedMetric === 'success') return performanceData.map(d => ({ date: d.date, value: d.success }))
    if (selectedMetric === 'failed') return performanceData.map(d => ({ date: d.date, value: d.failed }))
    if (selectedMetric === 'responseTime') return performanceData.map(d => ({ date: d.date, value: d.responseTime }))
    return performanceData.map(d => ({ date: d.date, value: d.executions }))
  }

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'executions': return 'Total Executions'
      case 'success': return 'Successful Executions'
      case 'failed': return 'Failed Executions'
      case 'responseTime': return 'Response Time (ms)'
      default: return 'Total Executions'
    }
  }

  const getMetricColor = () => {
    switch (selectedMetric) {
      case 'executions': return '#3B82F6'
      case 'success': return '#10B981'
      case 'failed': return '#EF4444'
      case 'responseTime': return '#F59E0B'
      default: return '#3B82F6'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'text-red-600 bg-red-50'
      case 'Medium': return 'text-yellow-600 bg-yellow-50'
      case 'Low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-2 text-gray-600">Monitor rule engine performance and insights</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field w-auto"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-gray-400" />
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="input-field w-auto"
          >
            <option value="executions">Total Executions</option>
            <option value="success">Successful Executions</option>
            <option value="failed">Failed Executions</option>
            <option value="responseTime">Response Time</option>
          </select>
        </div>
        
        <button className="btn-secondary ml-auto flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Executions</p>
              <p className="text-2xl font-bold text-gray-900">
                {performanceData.reduce((sum, d) => sum + d.executions, 0).toLocaleString()}
              </p>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12.5%
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {((performanceData.reduce((sum, d) => sum + d.success, 0) / 
                   performanceData.reduce((sum, d) => sum + d.executions, 0)) * 100).toFixed(1)}%
              </p>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                +2.1%
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed Executions</p>
              <p className="text-2xl font-bold text-gray-900">
                {performanceData.reduce((sum, d) => sum + d.failed, 0)}
              </p>
              <div className="flex items-center text-sm text-red-600">
                <TrendingDown className="h-4 w-4 mr-1" />
                -8.3%
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(performanceData.reduce((sum, d) => sum + d.responseTime, 0) / performanceData.length)}ms
              </p>
              <div className="flex items-center text-sm text-green-600">
                <TrendingDown className="h-4 w-4 mr-1" />
                -15.2%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Performance Chart */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{getMetricLabel()} Over Time</h3>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">Filtered by {timeRange}</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={getMetricData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={getMetricColor()} 
              fill={getMetricColor() + '20'} 
              strokeWidth={2} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Rule Performance */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Rules</h3>
          <div className="space-y-3">
            {rulePerformance.map((rule, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{rule.name}</p>
                    <p className="text-xs text-gray-500">{rule.executions} executions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{rule.success}/{rule.executions}</p>
                  <p className="text-xs text-gray-500">{rule.avgResponse}ms avg</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Performance */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Action Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={actionPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="success" fill="#10B981" />
              <Bar dataKey="failed" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Error Analysis */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">Error Types</h4>
            <div className="space-y-3">
              {errorAnalysis.map((error, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{error.type}</p>
                    <p className="text-xs text-gray-500">{error.count} occurrences</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{error.percentage}%</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(error.impact)}`}>
                      {error.impact}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">Error Distribution</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={errorAnalysis}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percentage }) => `${type} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {errorAnalysis.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#EF4444', '#F59E0B', '#10B981', '#3B82F6'][index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
