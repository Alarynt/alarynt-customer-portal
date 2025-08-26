import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Save,
  ArrowLeft,
  Code,
  AlertCircle,
  CheckCircle,
  Play
} from 'lucide-react'

interface Rule {
  id: string
  name: string
  description: string
  dsl: string
  status: 'active' | 'inactive' | 'draft'
  priority: number
  createdAt: string
  lastExecuted?: string
  executionCount: number
  successRate: number
}

const CreateRule = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dsl: '',
    priority: 1,
    status: 'draft' as const
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isPreview, setIsPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Rule name is required'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Rule description is required'
    }
    
    if (!formData.dsl.trim()) {
      newErrors.dsl = 'DSL code is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (saveAndActivate = false) => {
    if (!validateForm()) return
    
    setIsSaving(true)
    
    try {
      const ruleData = {
        name: formData.name,
        description: formData.description,
        dsl: formData.dsl,
        status: saveAndActivate ? 'active' : formData.status,
        priority: formData.priority
      }
      
      const response = await apiService.createRule(ruleData)
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create rule')
      }
      
      // Navigate back to rules management
      navigate('/rules', { 
        state: { 
          message: `Rule "${formData.name}" ${saveAndActivate ? 'created and activated' : 'created'} successfully!`,
          type: 'success'
        }
      })
    } catch (error: any) {
      console.error('Error saving rule:', error)
      setErrors({ submit: error.message || 'Failed to save rule. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const dslExamples = [
    {
      title: 'Email Notification',
      code: `WHEN order.total > 1000
AND customer.tier == "premium"
THEN send_email(
  to: "sales@company.com",
  subject: "High Value Order",
  body: "Order {order.id} from {customer.name}"
)`
    },
    {
      title: 'Inventory Alert',
      code: `WHEN product.inventory < product.min_threshold
THEN send_sms(
  to: "warehouse@company.com",
  message: "Low inventory for {product.name}"
)
AND update_database(
  table: "alerts",
  data: {type: "inventory", product_id: product.id}
)`
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => navigate('/rules')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Rule</h1>
            <p className="mt-2 text-gray-600">Define your business rule using our Domain Specific Language</p>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Code className="h-4 w-4 mr-1" />
            DSL Editor
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Rule Configuration</h3>
            
            <div className="space-y-6">
              {/* Rule Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Rule Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`input-field ${errors.name ? 'border-red-300' : ''}`}
                  placeholder="Enter a descriptive name for your rule"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Rule Description */}
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
                  placeholder="Explain what this rule does and when it should trigger"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Rule Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="input-field"
                  >
                    <option value={1}>High (1)</option>
                    <option value={2}>Medium (2)</option>
                    <option value={3}>Low (3)</option>
                  </select>
                </div>

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
              </div>

              {/* DSL Code */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="dsl" className="block text-sm font-medium text-gray-700">
                    DSL Code *
                  </label>
                  <button
                    onClick={() => setIsPreview(!isPreview)}
                    className="btn-secondary text-sm"
                  >
                    {isPreview ? 'Edit' : 'Preview'}
                  </button>
                </div>
                
                {isPreview ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                      {formData.dsl || 'No DSL code entered yet...'}
                    </pre>
                  </div>
                ) : (
                  <textarea
                    id="dsl"
                    value={formData.dsl}
                    onChange={(e) => handleInputChange('dsl', e.target.value)}
                    className={`input-field font-mono text-sm ${errors.dsl ? 'border-red-300' : ''}`}
                    rows={12}
                    placeholder={`WHEN condition
AND another_condition
THEN action
ELSE other_action

Example:
WHEN order.total > 1000
AND customer.tier == "premium"
THEN send_email(to: "sales@company.com", subject: "High Value Order")`}
                  />
                )}
                {errors.dsl && (
                  <p className="mt-1 text-sm text-red-600">{errors.dsl}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
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

        {/* Examples Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">DSL Examples</h3>
            <div className="space-y-6">
              {dslExamples.map((example, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{example.title}</h4>
                  <pre className="text-xs text-gray-600 bg-gray-50 rounded p-2 overflow-x-auto font-mono whitespace-pre-wrap">
                    {example.code}
                  </pre>
                  <button
                    onClick={() => handleInputChange('dsl', example.code)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Use this example
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">DSL Syntax Help</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><code className="bg-blue-100 px-1 rounded">WHEN</code> - Start a condition</p>
                <p><code className="bg-blue-100 px-1 rounded">AND/OR</code> - Combine conditions</p>
                <p><code className="bg-blue-100 px-1 rounded">THEN</code> - Define action</p>
                <p><code className="bg-blue-100 px-1 rounded">ELSE</code> - Alternative action</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateRule