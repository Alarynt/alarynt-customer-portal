import { useState, useEffect } from 'react'
import { 
  Search, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Activity,
  Tag,
  User,
  FileText
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'rule_created' | 'rule_updated' | 'rule_deleted' | 'action_executed' | 'action_failed' | 'rule_triggered' | 'user_login' | 'user_logout' | 'system_error' | 'system_maintenance'
  message: string
  timestamp: string
  status: 'success' | 'warning' | 'error' | 'info'
  user?: string
  ruleName?: string
  actionName?: string
  details?: string
}

type SortField = keyof ActivityItem
type SortDirection = 'asc' | 'desc'

const Activities = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [sortField, setSortField] = useState<SortField>('timestamp')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  useEffect(() => {
    // Generate comprehensive mock data
    const mockActivities: ActivityItem[] = [
      { id: '1', type: 'rule_created', message: 'New rule "High Value Customer Alert" created', timestamp: '2024-01-26T10:30:00Z', status: 'success', user: 'John Smith', ruleName: 'High Value Customer Alert' },
      { id: '2', type: 'action_executed', message: 'Email notification sent to sales team', timestamp: '2024-01-26T10:25:00Z', status: 'success', user: 'System', actionName: 'Sales Team Email' },
      { id: '3', type: 'rule_triggered', message: 'Rule "Inventory Low Alert" triggered', timestamp: '2024-01-26T10:20:00Z', status: 'warning', ruleName: 'Inventory Low Alert' },
      { id: '4', type: 'action_failed', message: 'SMS notification failed to send', timestamp: '2024-01-26T10:15:00Z', status: 'error', actionName: 'Warehouse SMS Alert', details: 'Connection timeout' },
      { id: '5', type: 'rule_updated', message: 'Rule "Payment Processing" updated', timestamp: '2024-01-26T10:10:00Z', status: 'info', user: 'Sarah Johnson', ruleName: 'Payment Processing' },
      { id: '6', type: 'user_login', message: 'User logged into the system', timestamp: '2024-01-26T09:30:00Z', status: 'info', user: 'Mike Davis' },
      { id: '7', type: 'rule_created', message: 'New rule "Fraud Detection Enhanced" created', timestamp: '2024-01-26T09:15:00Z', status: 'success', user: 'Sarah Johnson', ruleName: 'Fraud Detection Enhanced' },
      { id: '8', type: 'system_error', message: 'Database connection temporarily lost', timestamp: '2024-01-26T08:45:00Z', status: 'error', details: 'Reconnected after 30 seconds' },
      { id: '9', type: 'action_executed', message: 'Webhook sent to CRM system', timestamp: '2024-01-26T08:30:00Z', status: 'success', actionName: 'CRM Webhook' },
      { id: '10', type: 'rule_deleted', message: 'Rule "Old Customer Alert" deleted', timestamp: '2024-01-26T08:00:00Z', status: 'info', user: 'Admin', ruleName: 'Old Customer Alert' }
    ]

    // Generate more mock data for pagination testing
    const expandedMockData: ActivityItem[] = []
    for (let i = 0; i < 5; i++) {
      mockActivities.forEach((activity, index) => {
        const date = new Date('2024-01-26T10:30:00Z')
        date.setHours(date.getHours() - (i * 24) - index)
        expandedMockData.push({
          ...activity,
          id: `${activity.id}_${i}_${index}`,
          timestamp: date.toISOString(),
          message: `${activity.message} [Day ${i + 1}]`
        })
      })
    }

    setActivities(expandedMockData)
  }, [])

  useEffect(() => {
    let filtered = activities.filter(activity => {
      const matchesSearch = activity.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           activity.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           activity.ruleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           activity.actionName?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = typeFilter === 'all' || activity.type === typeFilter
      const matchesStatus = statusFilter === 'all' || activity.status === statusFilter
      
      let matchesDate = true
      if (dateRange !== 'all') {
        const activityDate = new Date(activity.timestamp)
        const now = new Date()
        switch (dateRange) {
          case '1h':
            matchesDate = now.getTime() - activityDate.getTime() < 60 * 60 * 1000
            break
          case '24h':
            matchesDate = now.getTime() - activityDate.getTime() < 24 * 60 * 60 * 1000
            break
          case '7d':
            matchesDate = now.getTime() - activityDate.getTime() < 7 * 24 * 60 * 60 * 1000
            break
          case '30d':
            matchesDate = now.getTime() - activityDate.getTime() < 30 * 24 * 60 * 60 * 1000
            break
        }
      }
      
      return matchesSearch && matchesType && matchesStatus && matchesDate
    })

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]
      
      // Handle undefined values
      if (aValue === undefined) aValue = ''
      if (bValue === undefined) bValue = ''
      
      // Convert to string for comparison if needed
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    setFilteredActivities(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [activities, searchTerm, typeFilter, statusFilter, dateRange, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-blue-600" />
      : <ArrowDown className="h-4 w-4 text-blue-600" />
  }

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'rule_created':
      case 'rule_updated':
      case 'rule_deleted':
        return <Activity className="h-4 w-4 text-blue-500" />
      case 'action_executed':
      case 'action_failed':
        return <FileText className="h-4 w-4 text-green-500" />
      case 'user_login':
      case 'user_logout':
        return <User className="h-4 w-4 text-purple-500" />
      default:
        return <Tag className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} minutes ago`
    if (hours < 24) return `${hours} hours ago`
    return `${days} days ago`
  }

  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedActivities = filteredActivities.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">All Activities</h1>
        <p className="text-gray-600 mt-1">Complete history of system activities, rules, and actions</p>
      </div>

      {/* Filters and Search */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities, users, rules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="rule_created">Rule Created</option>
              <option value="rule_updated">Rule Updated</option>
              <option value="rule_deleted">Rule Deleted</option>
              <option value="rule_triggered">Rule Triggered</option>
              <option value="action_executed">Action Executed</option>
              <option value="action_failed">Action Failed</option>
              <option value="user_login">User Login</option>
              <option value="user_logout">User Logout</option>
              <option value="system_error">System Error</option>
              <option value="system_maintenance">Maintenance</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="info">Info</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredActivities.length)} of {filteredActivities.length} activities
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Activities Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Type</span>
                    {getSortIcon('type')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('message')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Activity</span>
                    {getSortIcon('message')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('user')}
                >
                  <div className="flex items-center space-x-1">
                    <span>User</span>
                    {getSortIcon('user')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    {getSortIcon('status')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('timestamp')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Time</span>
                    {getSortIcon('timestamp')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedActivities.map((activity) => {
                const { date, time } = formatTimestamp(activity.timestamp)
                return (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTypeIcon(activity.type)}
                        <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                          {activity.type.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{activity.message}</div>
                      {activity.details && (
                        <div className="text-xs text-gray-500 mt-1">{activity.details}</div>
                      )}
                      {activity.ruleName && (
                        <div className="text-xs text-blue-600 mt-1">Rule: {activity.ruleName}</div>
                      )}
                      {activity.actionName && (
                        <div className="text-xs text-green-600 mt-1">Action: {activity.actionName}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{activity.user || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(activity.status)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{date}</div>
                      <div className="text-xs text-gray-500">{time}</div>
                      <div className="text-xs text-gray-400">{formatRelativeTime(activity.timestamp)}</div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                  if (pageNumber <= totalPages) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`relative inline-flex items-center px-3 py-2 rounded-md border text-sm font-medium ${
                          currentPage === pageNumber
                            ? 'z-10 bg-blue-600 border-blue-600 text-white'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  }
                  return null
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Activities