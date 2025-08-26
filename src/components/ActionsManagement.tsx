import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Mail, 
  MessageSquare,
  Webhook,
  Database,
  Save,
  TestTube,
  Settings
} from 'lucide-react'

interface Action {
  id: string
  name: string
  description: string
  type: 'email' | 'sms' | 'webhook' | 'database' | 'notification'
  config: any
  status: 'active' | 'inactive' | 'draft'
  createdAt: string
  lastExecuted?: string
  executionCount: number
  successRate: number
}

const ActionsManagement = () => {
  const [actions, setActions] = useState<Action[]>([])
  const [selectedAction, setSelectedAction] = useState<Action | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedActionType, setSelectedActionType] = useState<string>('email')

  useEffect(() => {
    // Mock data
    const mockActions: Action[] = [
      {
        id: '1',
        name: 'Sales Team Email',
        description: 'Send email notifications to sales team',
        type: 'email',
        config: {
          to: 'sales@company.com',
          subject: 'High Value Order Alert',
          template: 'high-value-order',
          cc: ['manager@company.com']
        },
        status: 'active',
        createdAt: '2024-01-15',
        lastExecuted: '2024-01-26T10:30:00Z',
        executionCount: 45,
        successRate: 98.2
      },
      {
        id: '2',
        name: 'Warehouse SMS Alert',
        description: 'Send SMS alerts to warehouse staff',
        type: 'sms',
        config: {
          to: '+1234567890',
          message: 'Low inventory alert for {product_name}',
          provider: 'twilio'
        },
        status: 'active',
        createdAt: '2024-01-10',
        lastExecuted: '2024-01-26T09:15:00Z',
        executionCount: 23,
        successRate: 95.7
      },
      {
        id: '3',
        name: 'CRM Webhook',
        description: 'Update CRM system via webhook',
        type: 'webhook',
        config: {
          url: 'https://crm.company.com/api/leads',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer {api_token}',
            'Content-Type': 'application/json'
          },
          body: {
            lead_id: '{lead_id}',
            status: 'qualified'
          }
        },
        status: 'active',
        createdAt: '2024-01-20',
        lastExecuted: '2024-01-26T08:45:00Z',
        executionCount: 67,
        successRate: 92.1
      },
      {
        id: '4',
        name: 'Database Update',
        description: 'Update database records',
        type: 'database',
        config: {
          table: 'alerts',
          operation: 'INSERT',
          data: {
            type: '{alert_type}',
            message: '{alert_message}',
            timestamp: '{current_timestamp}'
          }
        },
        status: 'draft',
        createdAt: '2024-01-25',
        executionCount: 0,
        successRate: 0
      }
    ]
    setActions(mockActions)
  }, [])

  const handleCreateAction = () => {
    setIsCreating(true)
    setSelectedAction(null)
    setSelectedActionType('email')
    setShowConfig(true)
  }

  const handleEditAction = (action: Action) => {
    setSelectedAction(action)
    setSelectedActionType(action.type)
    setIsEditing(true)
    setShowConfig(true)
  }

  const handleSaveAction = () => {
    // Implementation for saving action
    setIsCreating(false)
    setIsEditing(false)
    setSelectedAction(null)
    setShowConfig(false)
  }

  const handleDeleteAction = (actionId: string) => {
    setActions(actions.filter(action => action.id !== actionId))
  }

  const toggleActionStatus = (actionId: string) => {
    setActions(actions.map(action => 
      action.id === actionId 
        ? { ...action, status: action.status === 'active' ? 'inactive' : 'active' }
        : action
    ))
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-5 w-5 text-blue-500" />
      case 'sms':
        return <MessageSquare className="h-5 w-5 text-green-500" />
      case 'webhook':
        return <Webhook className="h-5 w-5 text-purple-500" />
      case 'database':
        return <Database className="h-5 w-5 text-orange-500" />
      case 'notification':
        return <Settings className="h-5 w-5 text-indigo-500" />
      default:
        return <Settings className="h-5 w-5 text-gray-500" />
    }
  }

  const getActionTypeColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'text-blue-600 bg-blue-50'
      case 'sms':
        return 'text-green-600 bg-green-50'
      case 'webhook':
        return 'text-purple-600 bg-purple-50'
      case 'database':
        return 'text-orange-600 bg-orange-50'
      case 'notification':
        return 'text-indigo-600 bg-indigo-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50'
      case 'inactive':
        return 'text-gray-600 bg-gray-50'
      case 'draft':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const filteredActions = actions.filter(action => {
    const matchesSearch = action.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         action.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || action.type === typeFilter
    const matchesStatus = statusFilter === 'all' || action.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const renderConfigEditor = (action: Action | null) => {
    if (!action && !isCreating) return null

    const config = action?.config || {}
    const type = selectedActionType

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Action Name
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="Enter action name"
            defaultValue={action?.name || ''}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            className="input-field"
            rows={3}
            placeholder="Enter action description"
            defaultValue={action?.description || ''}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Action Type
          </label>
          <select 
            className="input-field" 
            value={selectedActionType}
            onChange={(e) => setSelectedActionType(e.target.value)}
          >
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="webhook">Webhook</option>
            <option value="database">Database</option>
            <option value="notification">Notification</option>
          </select>
        </div>

        {type === 'email' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input
                type="email"
                className="input-field"
                placeholder="recipient@example.com"
                defaultValue={config.to || ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                className="input-field"
                placeholder="Email subject"
                defaultValue={config.subject || ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
              <input
                type="text"
                className="input-field"
                placeholder="Template name"
                defaultValue={config.template || ''}
              />
            </div>
          </div>
        )}

        {type === 'sms' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                className="input-field"
                placeholder="+1234567890"
                defaultValue={config.to || ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="SMS message template"
                defaultValue={config.message || ''}
              />
            </div>
          </div>
        )}

        {type === 'webhook' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input
                type="url"
                className="input-field"
                placeholder="https://api.example.com/webhook"
                defaultValue={config.url || ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
              <select className="input-field" defaultValue={config.method || 'POST'}>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>
          </div>
        )}

        {type === 'database' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Table</label>
              <input
                type="text"
                className="input-field"
                placeholder="table_name"
                defaultValue={config.table || ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operation</label>
              <select className="input-field" defaultValue={config.operation || 'INSERT'}>
                <option value="INSERT">INSERT</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="SELECT">SELECT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data (JSON)</label>
              <textarea
                className="input-field"
                rows={4}
                placeholder='{"field": "value", "timestamp": "{current_timestamp}"}'
                defaultValue={config.data ? JSON.stringify(config.data, null, 2) : ''}
              />
            </div>
          </div>
        )}

        {type === 'notification' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                className="input-field"
                placeholder="Notification title"
                defaultValue={config.title || ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Notification message"
                defaultValue={config.message || ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select className="input-field" defaultValue={config.priority || 'normal'}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex space-x-2 pt-4">
          <button
            onClick={handleSaveAction}
            className="btn-primary flex-1 flex items-center justify-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {isCreating ? 'Create Action' : 'Save Changes'}
          </button>
          <button
            onClick={() => {
              setIsCreating(false)
              setIsEditing(false)
              setSelectedAction(null)
              setSelectedActionType('email')
              setShowConfig(false)
            }}
            className="btn-secondary"
          >
            Cancel
          </button>
          {action && (
            <button className="btn-secondary flex items-center">
              <TestTube className="h-4 w-4 mr-2" />
              Test
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Actions Management</h1>
        <p className="mt-2 text-gray-600">Create and manage actions that your rules can trigger</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <button
          onClick={handleCreateAction}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Action
        </button>
        
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search actions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
        </div>
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">All Types</option>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="webhook">Webhook</option>
          <option value="database">Database</option>
          <option value="notification">Notification</option>
        </select>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Actions List */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-4">
              {filteredActions.map((action) => (
                <div key={action.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getActionIcon(action.type)}
                        <h4 className="font-medium text-gray-900">{action.name}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionTypeColor(action.type)}`}>
                          {action.type}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(action.status)}`}>
                          {action.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Executions: {action.executionCount}</span>
                        <span>Success: {action.successRate}%</span>
                        {action.lastExecuted && (
                          <span>Last: {new Date(action.lastExecuted).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleActionStatus(action.id)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title={action.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {action.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleEditAction(action)}
                        className="p-2 text-gray-400 hover:text-blue-600"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowConfig(true)}
                        className="p-2 text-gray-400 hover:text-purple-600"
                        title="View Config"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAction(action.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {isCreating ? 'Create Action' : isEditing ? 'Edit Action' : 'Configuration'}
              </h3>
              <button
                onClick={() => setShowConfig(!showConfig)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
            
            {showConfig ? (
              renderConfigEditor(selectedAction)
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Settings className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Click the settings icon to configure actions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActionsManagement
