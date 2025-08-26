import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Code, 
  Save,
  Eye
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

const RulesManagement = () => {
  const [rules, setRules] = useState<Rule[]>([])
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showDSLEditor, setShowDSLEditor] = useState(false)
  const [dslCode, setDslCode] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    // Mock data
    const mockRules: Rule[] = [
      {
        id: '1',
        name: 'High Value Customer Alert',
        description: 'Send notification when customer order value exceeds threshold',
        dsl: `WHEN order.total > 1000
AND customer.tier == "premium"
THEN send_email(to: "sales@company.com", subject: "High Value Order", body: "Order {order.id} from {customer.name}")`,
        status: 'active',
        priority: 1,
        createdAt: '2024-01-15',
        lastExecuted: '2024-01-26T10:30:00Z',
        executionCount: 45,
        successRate: 98.2
      },
      {
        id: '2',
        name: 'Inventory Low Alert',
        description: 'Alert when product inventory falls below minimum threshold',
        dsl: `WHEN product.inventory < product.min_threshold
THEN send_sms(to: "warehouse@company.com", message: "Low inventory for {product.name}")
AND update_database(table: "alerts", data: {type: "inventory", product_id: product.id})`,
        status: 'active',
        priority: 2,
        createdAt: '2024-01-10',
        lastExecuted: '2024-01-26T09:15:00Z',
        executionCount: 23,
        successRate: 95.7
      },
      {
        id: '3',
        name: 'Payment Processing Rule',
        description: 'Handle payment processing based on customer risk score',
        dsl: `WHEN payment.amount > 5000
AND customer.risk_score > 0.7
THEN require_approval(approver: "manager")
ELSE process_payment(payment_id: payment.id)`,
        status: 'draft',
        priority: 3,
        createdAt: '2024-01-20',
        executionCount: 0,
        successRate: 0
      }
    ]
    setRules(mockRules)
  }, [])

  const handleCreateRule = () => {
    setIsCreating(true)
    setSelectedRule(null)
    setDslCode('')
  }

  const handleEditRule = (rule: Rule) => {
    setSelectedRule(rule)
    setIsEditing(true)
    setDslCode(rule.dsl)
  }

  const handleSaveRule = () => {
    if (isCreating) {
      const newRule: Rule = {
        id: Date.now().toString(),
        name: 'New Rule',
        description: 'Rule description',
        dsl: dslCode,
        status: 'draft',
        priority: rules.length + 1,
        createdAt: new Date().toISOString().split('T')[0],
        executionCount: 0,
        successRate: 0
      }
      setRules([...rules, newRule])
      setIsCreating(false)
    } else if (isEditing && selectedRule) {
      const updatedRules = rules.map(rule => 
        rule.id === selectedRule.id 
          ? { ...rule, dsl: dslCode }
          : rule
      )
      setRules(updatedRules)
      setIsEditing(false)
      setSelectedRule(null)
    }
    setDslCode('')
  }

  const handleDeleteRule = (ruleId: string) => {
    setRules(rules.filter(rule => rule.id !== ruleId))
  }

  const toggleRuleStatus = (ruleId: string) => {
    setRules(rules.map(rule => 
      rule.id === ruleId 
        ? { ...rule, status: rule.status === 'active' ? 'inactive' : 'active' }
        : rule
    ))
  }

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || rule.status === statusFilter
    return matchesSearch && matchesStatus
  })

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Rules Management</h1>
        <p className="mt-2 text-gray-600">Create and manage your business rules using our DSL</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <button
          onClick={handleCreateRule}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Rule
        </button>
        
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search rules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
        </div>
        
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
        {/* Rules List */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rules</h3>
            <div className="space-y-4">
              {filteredRules.map((rule) => (
                <div key={rule.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900">{rule.name}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(rule.status)}`}>
                          {rule.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Priority: {rule.priority}</span>
                        <span>Executions: {rule.executionCount}</span>
                        <span>Success: {rule.successRate}%</span>
                        {rule.lastExecuted && (
                          <span>Last: {new Date(rule.lastExecuted).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleRuleStatus(rule.id)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title={rule.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {rule.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleEditRule(rule)}
                        className="p-2 text-gray-400 hover:text-blue-600"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowDSLEditor(true)}
                        className="p-2 text-gray-400 hover:text-purple-600"
                        title="View DSL"
                      >
                        <Code className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
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

        {/* DSL Editor Panel */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">DSL Editor</h3>
              <button
                onClick={() => setShowDSLEditor(!showDSLEditor)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                {showDSLEditor ? <Eye className="h-4 w-4" /> : <Code className="h-4 w-4" />}
              </button>
            </div>
            
            {showDSLEditor && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rule Name
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter rule name"
                    defaultValue={selectedRule?.name || ''}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="input-field"
                    rows={3}
                    placeholder="Enter rule description"
                    defaultValue={selectedRule?.description || ''}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DSL Code
                  </label>
                  <textarea
                    value={dslCode}
                    onChange={(e) => setDslCode(e.target.value)}
                    className="input-field font-mono text-sm"
                    rows={12}
                    placeholder={`WHEN condition
AND another_condition
THEN action
ELSE other_action`}
                  />
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveRule}
                    className="btn-primary flex-1 flex items-center justify-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isCreating ? 'Create Rule' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false)
                      setIsEditing(false)
                      setSelectedRule(null)
                      setDslCode('')
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {!showDSLEditor && (
              <div className="text-center py-8 text-gray-500">
                <Code className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Click the code icon to open the DSL editor</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RulesManagement
