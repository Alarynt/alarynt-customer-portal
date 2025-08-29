import { useState, useEffect } from 'react'
import { 
  Server,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import adminApiService from '../services/api'

const SystemMetrics = () => {
  const [systemHealth, setSystemHealth] = useState({
    serverStatus: 'healthy',
    dbConnectionPool: 95,
    cpuUsage: 32,
    memoryUsage: 68,
    diskUsage: 45,
    networkLatency: 12,
    uptime: 99.8
  })

  interface SystemPerformance {
    time: string
    cpuUsage: number
    memoryUsage: number
    activeConnections: number
    responseTime: number
    throughput: number
  }

  const [performanceData, setPerformanceData] = useState<SystemPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadSystemMetrics = async () => {
      try {
        setLoading(true)
        setError('')

        // Mock data until backend is implemented
        // TODO: Replace with actual API calls
        
        // Generate mock performance data for last 24 hours
        const mockPerformanceData = []
        for (let i = 23; i >= 0; i--) {
          const time = new Date()
          time.setHours(time.getHours() - i)
          
          mockPerformanceData.push({
            time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            cpuUsage: Math.floor(Math.random() * 40) + 20,
            memoryUsage: Math.floor(Math.random() * 30) + 50,
            activeConnections: Math.floor(Math.random() * 50) + 20,
            responseTime: Math.floor(Math.random() * 100) + 50,
            throughput: Math.floor(Math.random() * 200) + 100
          })
        }
        
        setPerformanceData(mockPerformanceData)
      } catch (err: any) {
        console.error('Failed to load system metrics:', err)
        setError('Failed to load system metrics. Please try refreshing the page.')
      } finally {
        setLoading(false)
      }
    }

    loadSystemMetrics()
  }, [])

  const getHealthColor = (value: number, type: 'usage' | 'performance') => {
    if (type === 'usage') {
      if (value >= 90) return 'text-red-600'
      if (value >= 75) return 'text-yellow-600'
      return 'text-green-600'
    } else {
      if (value >= 95) return 'text-green-600'
      if (value >= 85) return 'text-yellow-600'
      return 'text-red-600'
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
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
        <h1 className="text-3xl font-bold text-gray-900">System Metrics</h1>
        <p className="mt-2 text-gray-600">Monitor system health and performance</p>
      </div>

      {/* System Status Overview */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
          <div className="flex items-center">
            {getHealthIcon(systemHealth.serverStatus)}
            <span className="ml-2 text-sm font-medium text-green-600">All Systems Operational</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Database className="h-5 w-5 text-blue-500 mr-2" />
              <p className="text-sm font-medium text-gray-600">DB Pool</p>
            </div>
            <p className={`text-2xl font-bold ${getHealthColor(systemHealth.dbConnectionPool, 'performance')}`}>
              {systemHealth.dbConnectionPool}%
            </p>
            <p className="text-xs text-gray-500">Available</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Cpu className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-sm font-medium text-gray-600">CPU Usage</p>
            </div>
            <p className={`text-2xl font-bold ${getHealthColor(systemHealth.cpuUsage, 'usage')}`}>
              {systemHealth.cpuUsage}%
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Server className="h-5 w-5 text-purple-500 mr-2" />
              <p className="text-sm font-medium text-gray-600">Memory</p>
            </div>
            <p className={`text-2xl font-bold ${getHealthColor(systemHealth.memoryUsage, 'usage')}`}>
              {systemHealth.memoryUsage}%
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-orange-500 mr-2" />
              <p className="text-sm font-medium text-gray-600">Uptime</p>
            </div>
            <p className={`text-2xl font-bold ${getHealthColor(systemHealth.uptime, 'performance')}`}>
              {systemHealth.uptime}%
            </p>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CPU & Memory Usage */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">CPU & Memory Usage (Last 24 Hours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="cpuUsage" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="CPU Usage %" />
              <Area type="monotone" dataKey="memoryUsage" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="Memory Usage %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Response Time & Throughput */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Response Time & Throughput</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="responseTime" 
                stroke="#F59E0B" 
                strokeWidth={2} 
                name="Response Time (ms)" 
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="throughput" 
                stroke="#8B5CF6" 
                strokeWidth={2} 
                name="Throughput (req/min)" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System Alerts */}
      <div className="mt-8 card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">System Alerts</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="ml-3 text-sm font-medium text-yellow-800">
                Database connection pool at 95% capacity
              </span>
            </div>
            <span className="text-xs text-yellow-600">Active</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="ml-3 text-sm font-medium text-green-800">
                All backup systems operational
              </span>
            </div>
            <span className="text-xs text-green-600">Resolved</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemMetrics