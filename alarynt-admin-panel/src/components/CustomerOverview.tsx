import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  Search,
  Filter,
  Download,
  Eye,
  MoreHorizontal,
  Building,
  Activity,
  Target,
  Zap,
  CheckCircle,
  XCircle
} from 'lucide-react'
import adminApiService, { CustomerOverview as CustomerOverviewType } from '../services/api'

const CustomerOverview = () => {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<CustomerOverviewType[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerOverviewType[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true)
        setError('')

        // Mock data until backend is implemented
        // TODO: Replace with adminApiService.getAllCustomers()
        const mockCustomers: CustomerOverviewType[] = [
          {
            id: '1',
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
          {
            id: '2',
            email: 'manager@techstart.com',
            name: 'Sarah Johnson',
            company: 'TechStart Inc',
            totalRules: 38,
            activeRules: 35,
            totalActions: 18,
            totalActivities: 1924,
            successRate: 92.1,
            lastActivity: new Date('2024-01-26T12:15:00'),
            createdAt: new Date('2023-08-22T09:30:00')
          },
          {
            id: '3',
            email: 'ops@globalsolutions.net',
            name: 'Michael Chen',
            company: 'Global Solutions',
            totalRules: 52,
            activeRules: 48,
            totalActions: 31,
            totalActivities: 3456,
            successRate: 95.8,
            lastActivity: new Date('2024-01-26T16:45:00'),
            createdAt: new Date('2023-04-10T11:20:00')
          },
          {
            id: '4',
            email: 'tech@innovate-llc.com',
            name: 'Emma Davis',
            company: 'Innovate LLC',
            totalRules: 29,
            activeRules: 26,
            totalActions: 15,
            totalActivities: 1567,
            successRate: 88.9,
            lastActivity: new Date('2024-01-25T18:20:00'),
            createdAt: new Date('2023-09-05T14:45:00')
          },
          {
            id: '5',
            email: 'admin@dataflow.io',
            name: 'Robert Wilson',
            company: 'DataFlow Corp',
            totalRules: 41,
            activeRules: 38,
            totalActions: 19,
            totalActivities: 2234,
            successRate: 94.2,
            lastActivity: new Date('2024-01-26T13:10:00'),
            createdAt: new Date('2023-07-12T16:30:00')
          }
        ]

        setCustomers(mockCustomers)
        setFilteredCustomers(mockCustomers)
      } catch (err: any) {
        console.error('Failed to load customers:', err)
        setError('Failed to load customer data. Please try refreshing the page.')
      } finally {
        setLoading(false)
      }
    }

    loadCustomers()
  }, [])

  useEffect(() => {
    // Filter customers based on search term
    const filtered = customers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Sort customers
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortBy as keyof CustomerOverviewType]
      const bValue = b[sortBy as keyof CustomerOverviewType]
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      return 0
    })

    setFilteredCustomers(sorted)
  }, [customers, searchTerm, sortBy, sortOrder])

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const formatLastActivity = (date: Date) => {
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Overview</h1>
            <p className="mt-2 text-gray-600">Manage and monitor all customer accounts</p>
          </div>
          <button className="btn-primary">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="name">Sort by Name</option>
              <option value="company">Sort by Company</option>
              <option value="totalActivities">Sort by Activities</option>
              <option value="successRate">Sort by Success Rate</option>
              <option value="lastActivity">Sort by Last Activity</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="btn-secondary"
            >
              <Filter className="h-4 w-4" />
              {sortOrder === 'asc' ? 'ASC' : 'DESC'}
            </button>
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="card hover:shadow-md transition-shadow duration-200 cursor-pointer"
               onClick={() => navigate(`/customers/${customer.id}`)}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">{customer.company}</h3>
                  <p className="text-sm text-gray-500">{customer.name}</p>
                </div>
              </div>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            {/* Customer metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Target className="h-4 w-4 text-blue-500 mr-1" />
                  <p className="text-xs font-medium text-gray-600">Rules</p>
                </div>
                <p className="text-lg font-bold text-gray-900">{customer.totalRules}</p>
                <p className="text-xs text-green-600">{customer.activeRules} active</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Zap className="h-4 w-4 text-purple-500 mr-1" />
                  <p className="text-xs font-medium text-gray-600">Actions</p>
                </div>
                <p className="text-lg font-bold text-gray-900">{customer.totalActions}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Activity className="h-4 w-4 text-orange-500 mr-1" />
                  <p className="text-xs font-medium text-gray-600">Activities</p>
                </div>
                <p className="text-lg font-bold text-gray-900">{customer.totalActivities.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  {customer.successRate >= 95 ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  ) : customer.successRate >= 90 ? (
                    <TrendingUp className="h-4 w-4 text-yellow-500 mr-1" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <p className="text-xs font-medium text-gray-600">Success Rate</p>
                </div>
                <p className="text-lg font-bold text-gray-900">{customer.successRate}%</p>
              </div>
            </div>

            {/* Last activity */}
            <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
              <span>Last activity: {formatLastActivity(customer.lastActivity)}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/customers/${customer.id}`)
                }}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No results */}
      {filteredCustomers.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'No customers available to display'}
          </p>
        </div>
      )}

      {/* Summary footer */}
      {filteredCustomers.length > 0 && (
        <div className="mt-8 card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Showing {filteredCustomers.length} of {customers.length} customers
              </p>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Target className="h-4 w-4 text-blue-500 mr-1" />
                <span>Total Rules: {filteredCustomers.reduce((sum, c) => sum + c.totalRules, 0)}</span>
              </div>
              <div className="flex items-center">
                <Zap className="h-4 w-4 text-purple-500 mr-1" />
                <span>Total Actions: {filteredCustomers.reduce((sum, c) => sum + c.totalActions, 0)}</span>
              </div>
              <div className="flex items-center">
                <Activity className="h-4 w-4 text-orange-500 mr-1" />
                <span>Total Activities: {filteredCustomers.reduce((sum, c) => sum + c.totalActivities, 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerOverview