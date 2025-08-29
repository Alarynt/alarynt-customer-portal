import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Save,
  ArrowLeft,
  Mail,
  MessageSquare,
  Webhook,
  Database,
  Bell,
  AlertCircle,
  CheckCircle,
  Play,
  TestTube
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

const CreateAction = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'email' as 'email' | 'sms' | 'webhook' | 'database' | 'notification',
    status: 'draft' as const,
    config: {}
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isSaving, setIsSaving] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const actionTypes = [
    { value: 'email', label: 'Email', icon: Mail, description: 'Send email notifications' },
    { value: 'sms', label: 'SMS', icon: MessageSquare, description: 'Send SMS messages' },
    { value: 'webhook', label: 'Webhook', icon: Webhook, description: 'Make HTTP requests to external services' },
    { value: 'database', label: 'Database', icon: Database, description: 'Update database records' },
    { value: 'notification', label: 'Notification', icon: Bell, description: 'Send in-app notifications' }
  ]

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Action name is required'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Action description is required'
    }

    // Type-specific validation
    if (formData.type === 'email') {
      if (!formData.config.to) newErrors.emailTo = 'Email recipient is required'
      if (!formData.config.subject) newErrors.emailSubject = 'Email subject is required'
    } else if (formData.type === 'sms') {
      if (!formData.config.to) newErrors.smsTo = 'Phone number is required'
      if (!formData.config.message) newErrors.smsMessage = 'SMS message is required'
    } else if (formData.type === 'webhook') {
      if (!formData.config.url) newErrors.webhookUrl = 'Webhook URL is required'
      if (!formData.config.method) newErrors.webhookMethod = 'HTTP method is required'
    } else if (formData.type === 'database') {
      if (!formData.config.table) newErrors.dbTable = 'Table name is required'
      if (!formData.config.operation) newErrors.dbOperation = 'Database operation is required'
    } else if (formData.type === 'notification') {
      if (!formData.config.title) newErrors.notificationTitle = 'Notification title is required'
      if (!formData.config.message) newErrors.notificationMessage = 'Notification message is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (saveAndActivate = false) => {
    if (!validateForm()) return
    
    setIsSaving(true)
    
    try {
      const actionData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        config: formData.config,
        status: saveAndActivate ? 'active' : formData.status
      }
      
      const response = await apiService.createAction(actionData)
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create action')
      }
      console.log('Saving action:', newAction)
      
      // Navigate back to actions management
      navigate('/actions', { 
        state: { 
          message: `Action "${formData.name}" ${saveAndActivate ? 'created and activated' : 'created'} successfully!`,
          type: 'success'
        }
      })
    } catch (error) {
      console.error('Error saving action:', error)
      setErrors({ submit: 'Failed to save action. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTest = async () => {
    if (!validateForm()) return

    try {
      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 500))
      setTestResult({ 
        success: true, 
        message: `${formData.type.toUpperCase()} action test completed successfully!` 
      })
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: 'Test failed. Please check your configuration.' 
      })
    }
  }

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const renderConfigForm = () => {
    const { type, config } = formData

    switch (type) {
      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Email *
              </label>
              <input
                type="email"
                value={config.to || ''}
                onChange={(e) => handleInputChange('config.to', e.target.value)}
                className={`input-field ${errors.emailTo ? 'border-red-300' : ''}`}
                placeholder="recipient@example.com"
              />
              {errors.emailTo && <p className="mt-1 text-sm text-red-600">{errors.emailTo}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={config.subject || ''}
                onChange={(e) => handleInputChange('config.subject', e.target.value)}
                className={`input-field ${errors.emailSubject ? 'border-red-300' : ''}`}
                placeholder="Email subject"
              />
              {errors.emailSubject && <p className="mt-1 text-sm text-red-600">{errors.emailSubject}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CC (optional)
              </label>
              <input
                type="text"
                value={config.cc || ''}
                onChange={(e) => handleInputChange('config.cc', e.target.value)}
                className="input-field"
                placeholder="cc@example.com (comma-separated for multiple)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Template
              </label>
              <select
                value={config.template || ''}
                onChange={(e) => handleInputChange('config.template', e.target.value)}
                className="input-field"
              >
                <option value="">Select template</option>
                <option value="default">Default Template</option>
                <option value="alert">Alert Template</option>
                <option value="notification">Notification Template</option>
              </select>
            </div>
          </div>
        )

      case 'sms':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={config.to || ''}
                onChange={(e) => handleInputChange('config.to', e.target.value)}
                className={`input-field ${errors.smsTo ? 'border-red-300' : ''}`}
                placeholder="+1234567890"
              />
              {errors.smsTo && <p className="mt-1 text-sm text-red-600">{errors.smsTo}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                value={config.message || ''}
                onChange={(e) => handleInputChange('config.message', e.target.value)}
                className={`input-field ${errors.smsMessage ? 'border-red-300' : ''}`}
                rows={4}
                placeholder="SMS message content. Use {variable} for dynamic content."
              />
              {errors.smsMessage && <p className="mt-1 text-sm text-red-600">{errors.smsMessage}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMS Provider
              </label>
              <select
                value={config.provider || 'twilio'}
                onChange={(e) => handleInputChange('config.provider', e.target.value)}
                className="input-field"
              >
                <option value="twilio">Twilio</option>
                <option value="aws-sns">AWS SNS</option>
                <option value="vonage">Vonage</option>
              </select>
            </div>
          </div>
        )

      case 'webhook':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL *
              </label>
              <input
                type="url"
                value={config.url || ''}
                onChange={(e) => handleInputChange('config.url', e.target.value)}
                className={`input-field ${errors.webhookUrl ? 'border-red-300' : ''}`}
                placeholder="https://api.example.com/webhook"
              />
              {errors.webhookUrl && <p className="mt-1 text-sm text-red-600">{errors.webhookUrl}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HTTP Method *
              </label>
              <select
                value={config.method || 'POST'}
                onChange={(e) => handleInputChange('config.method', e.target.value)}
                className={`input-field ${errors.webhookMethod ? 'border-red-300' : ''}`}
              >
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="GET">GET</option>
              </select>
              {errors.webhookMethod && <p className="mt-1 text-sm text-red-600">{errors.webhookMethod}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Headers (JSON format)
              </label>
              <textarea
                value={config.headers || ''}
                onChange={(e) => handleInputChange('config.headers', e.target.value)}
                className="input-field font-mono text-sm"
                rows={4}
                placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Body Template (JSON)
              </label>
              <textarea
                value={config.body || ''}
                onChange={(e) => handleInputChange('config.body', e.target.value)}
                className="input-field font-mono text-sm"
                rows={6}
                placeholder='{"event": "{event_type}", "data": {variable}}'
              />
            </div>
          </div>
        )

      case 'database':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Table Name *
              </label>
              <input
                type="text"
                value={config.table || ''}
                onChange={(e) => handleInputChange('config.table', e.target.value)}
                className={`input-field ${errors.dbTable ? 'border-red-300' : ''}`}
                placeholder="users"
              />
              {errors.dbTable && <p className="mt-1 text-sm text-red-600">{errors.dbTable}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operation *
              </label>
              <select
                value={config.operation || ''}
                onChange={(e) => handleInputChange('config.operation', e.target.value)}
                className={`input-field ${errors.dbOperation ? 'border-red-300' : ''}`}
              >
                <option value="">Select operation</option>
                <option value="insert">Insert</option>
                <option value="update">Update</option>
                <option value="upsert">Upsert</option>
              </select>
              {errors.dbOperation && <p className="mt-1 text-sm text-red-600">{errors.dbOperation}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data (JSON format)
              </label>
              <textarea
                value={config.data || ''}
                onChange={(e) => handleInputChange('config.data', e.target.value)}
                className="input-field font-mono text-sm"
                rows={6}
                placeholder='{"column1": "value1", "column2": {variable}}'
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Where Condition (for updates)
              </label>
              <input
                type="text"
                value={config.where || ''}
                onChange={(e) => handleInputChange('config.where', e.target.value)}
                className="input-field"
                placeholder="id = {user_id}"
              />
            </div>
          </div>
        )

      case 'notification':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={config.title || ''}
                onChange={(e) => handleInputChange('config.title', e.target.value)}
                className={`input-field ${errors.notificationTitle ? 'border-red-300' : ''}`}
                placeholder="Notification title"
              />
              {errors.notificationTitle && <p className="mt-1 text-sm text-red-600">{errors.notificationTitle}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                value={config.message || ''}
                onChange={(e) => handleInputChange('config.message', e.target.value)}
                className={`input-field ${errors.notificationMessage ? 'border-red-300' : ''}`}
                rows={4}
                placeholder="Notification message content"
              />
              {errors.notificationMessage && <p className="mt-1 text-sm text-red-600">{errors.notificationMessage}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={config.priority || 'medium'}
                onChange={(e) => handleInputChange('config.priority', e.target.value)}
                className="input-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Users
              </label>
              <input
                type="text"
                value={config.users || ''}
                onChange={(e) => handleInputChange('config.users', e.target.value)}
                className="input-field"
                placeholder="user1,user2 or all"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => navigate('/actions')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Action</h1>
            <p className="mt-2 text-gray-600">Configure an automated action to be executed by your rules</p>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            {actionTypes.find(t => t.value === formData.type)?.icon && (
              <>
                {(() => {
                  const Icon = actionTypes.find(t => t.value === formData.type)?.icon!
                  return <Icon className="h-4 w-4 mr-1" />
                })()}
              </>
            )}
            {actionTypes.find(t => t.value === formData.type)?.label} Action
          </div>
          <div className="flex items-center">
            {errors.submit ? (
              <AlertCircle className="h-4 w-4 mr-1 text-red-500" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
            )}
            {errors.submit ? 'Error' : 'Ready'}
          </div>
        </div>
      </div>

      {errors.submit && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{errors.submit}</span>
          </div>
        </div>
      )}

      {testResult && (
        <div className={`mb-6 p-4 rounded-lg border ${testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center">
            {testResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            )}
            <span className={testResult.success ? 'text-green-700' : 'text-red-700'}>
              {testResult.message}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Action Configuration</h3>
            
            <div className="space-y-6">
              {/* Action Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Action Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`input-field ${errors.name ? 'border-red-300' : ''}`}
                  placeholder="Enter a descriptive name for your action"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Action Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`input-field ${errors.description ? 'border-red-300' : ''}`}
                  rows={3}
                  placeholder="Explain what this action does and when it should execute"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Action Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Action Type *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {actionTypes.map((actionType) => {
                    const Icon = actionType.icon
                    return (
                      <button
                        key={actionType.value}
                        type="button"
                        onClick={() => {
                          handleInputChange('type', actionType.value)
                          handleInputChange('config', {})
                        }}
                        className={`p-4 border rounded-lg text-left hover:border-primary-300 transition-colors ${
                          formData.type === actionType.value 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <Icon className="h-6 w-6 mb-2 text-primary-600" />
                        <div className="font-medium text-gray-900">{actionType.label}</div>
                        <div className="text-sm text-gray-500">{actionType.description}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Initial Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive' | 'draft')}
                  className="input-field"
                >
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                  <option value="active">Active</option>
                </select>
              </div>

              {/* Configuration */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  {actionTypes.find(t => t.value === formData.type)?.label} Configuration
                </h4>
                {renderConfigForm()}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              onClick={handleTest}
              className="btn-secondary flex-1 flex items-center justify-center"
            >
              <TestTube className="h-4 w-4 mr-2" />
              Test Action
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="btn-secondary flex-1 flex items-center justify-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="btn-primary flex-1 flex items-center justify-center"
            >
              <Play className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save & Activate'}
            </button>
          </div>
        </div>

        {/* Configuration Guide Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration Guide</h3>
            <div className="space-y-4">
              {formData.type === 'email' && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Email Action Tips</h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>• Use variables like <code className="bg-gray-100 px-1 rounded">{'{user.name}'}</code> for dynamic content</p>
                    <p>• Separate multiple CC recipients with commas</p>
                    <p>• Templates provide pre-formatted styling</p>
                  </div>
                </div>
              )}
              {formData.type === 'sms' && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">SMS Action Tips</h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>• Keep messages under 160 characters</p>
                    <p>• Include country code in phone numbers</p>
                    <p>• Test with your SMS provider first</p>
                  </div>
                </div>
              )}
              {formData.type === 'webhook' && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Webhook Action Tips</h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>• Ensure the endpoint accepts the HTTP method</p>
                    <p>• Include authentication in headers</p>
                    <p>• Use JSON format for structured data</p>
                  </div>
                </div>
              )}
              {formData.type === 'database' && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Database Action Tips</h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>• Use JSON format for data objects</p>
                    <p>• WHERE conditions needed for updates</p>
                    <p>• Test queries in development first</p>
                  </div>
                </div>
              )}
              {formData.type === 'notification' && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Notification Action Tips</h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>• Keep titles concise and clear</p>
                    <p>• Use "all" to target all users</p>
                    <p>• Higher priority notifications appear first</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Variable Syntax</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><code className="bg-blue-100 px-1 rounded">{'{variable}'}</code> - Simple variable</p>
                <p><code className="bg-blue-100 px-1 rounded">{'{object.property}'}</code> - Object property</p>
                <p><code className="bg-blue-100 px-1 rounded">{'{user.email}'}</code> - User email</p>
                <p><code className="bg-blue-100 px-1 rounded">{'{order.total}'}</code> - Order total</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateAction