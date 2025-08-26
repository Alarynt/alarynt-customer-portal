import { 
  HelpCircle, 
  Code, 
  Settings, 
  BarChart3,
  Zap,
  ChevronRight
} from 'lucide-react'

const Help = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <HelpCircle className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Help & Documentation</h1>
        </div>
        <p className="text-lg text-gray-600">
          Find answers to frequently asked questions and learn about the Alarynt Rule Engine DSL.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* FAQ Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card">
            <div className="flex items-center space-x-2 mb-6">
              <HelpCircle className="h-6 w-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-6">
              {/* Dashboard FAQ */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Dashboard</h3>
                </div>
                
                <div className="pl-7 space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">What do the dashboard metrics represent?</h4>
                    <p className="text-gray-600">The dashboard shows key performance indicators including total rules, active rules, executed actions, and overall success rate. These metrics are updated in real-time as rules are executed.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">How often are the charts updated?</h4>
                    <p className="text-gray-600">Charts and metrics are refreshed automatically every 30 seconds, or you can manually refresh the page to see the latest data immediately.</p>
                  </div>
                </div>
              </div>

              {/* Rules FAQ */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Code className="h-5 w-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Rules Management</h3>
                </div>
                
                <div className="pl-7 space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">How do I create a new rule?</h4>
                    <p className="text-gray-600">Click the "New Rule" button, provide a name and description, then write your rule logic using our DSL syntax in the editor. You can test the rule before activating it.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">What's the difference between active, inactive, and draft rules?</h4>
                    <ul className="text-gray-600 list-disc list-inside space-y-1">
                      <li><strong>Active:</strong> Rules are running and will trigger actions when conditions are met</li>
                      <li><strong>Inactive:</strong> Rules are paused and won't execute, but are saved</li>
                      <li><strong>Draft:</strong> Rules are being created or edited and haven't been activated yet</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">How does rule priority work?</h4>
                    <p className="text-gray-600">Rules with lower priority numbers (1, 2, 3...) execute first. This is important when multiple rules could trigger for the same event.</p>
                  </div>
                </div>
              </div>

              {/* Actions FAQ */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Actions Management</h3>
                </div>
                
                <div className="pl-7 space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">What types of actions can I configure?</h4>
                    <p className="text-gray-600">You can configure email notifications, SMS alerts, webhook calls, and database updates. Each action type has its own configuration requirements.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">How do I test an action before using it in a rule?</h4>
                    <p className="text-gray-600">Use the "Test Action" button in the Actions tab. This will simulate the action execution without affecting real systems or sending actual notifications.</p>
                  </div>
                </div>
              </div>

              {/* General FAQ */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900">General</h3>
                </div>
                
                <div className="pl-7 space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">How do I change my user settings?</h4>
                    <p className="text-gray-600">Click on your profile picture in the top right corner and select "Settings" to update your profile information and preferences.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Is there a limit to how many rules I can create?</h4>
                    <p className="text-gray-600">The number of rules depends on your subscription plan. Contact your administrator for specific limits and upgrade options.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DSL Documentation Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <div className="flex items-center space-x-2 mb-6">
              <Code className="h-6 w-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">DSL Reference</h2>
            </div>

            <div className="space-y-6">
              {/* Basic Syntax */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Basic Syntax</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono">
                  <div className="text-blue-300">WHEN</div>
                  <div className="ml-2">condition</div>
                  <div className="text-blue-300">AND</div>
                  <div className="ml-2">another_condition</div>
                  <div className="text-green-300">THEN</div>
                  <div className="ml-2">action</div>
                </div>
              </div>

              {/* Conditions */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Conditions</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <ChevronRight className="h-3 w-3 text-gray-400" />
                    <code className="text-purple-600">order.total {'>'} 1000</code>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ChevronRight className="h-3 w-3 text-gray-400" />
                    <code className="text-purple-600">customer.tier == "premium"</code>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ChevronRight className="h-3 w-3 text-gray-400" />
                    <code className="text-purple-600">product.inventory {'<'} 10</code>
                  </div>
                </div>
              </div>

              {/* Operators */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Logical Operators</h3>
                <div className="space-y-1 text-sm">
                  <div><code className="bg-gray-100 px-2 py-1 rounded">AND</code> - Both conditions must be true</div>
                  <div><code className="bg-gray-100 px-2 py-1 rounded">OR</code> - Either condition must be true</div>
                  <div><code className="bg-gray-100 px-2 py-1 rounded">NOT</code> - Negates a condition</div>
                </div>
              </div>

              {/* Comparison Operators */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Comparison</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><code className="bg-gray-100 px-2 py-1 rounded">==</code> Equal</div>
                  <div><code className="bg-gray-100 px-2 py-1 rounded">!=</code> Not equal</div>
                  <div><code className="bg-gray-100 px-2 py-1 rounded">{'>'}</code> Greater than</div>
                  <div><code className="bg-gray-100 px-2 py-1 rounded">{'<'}</code> Less than</div>
                  <div><code className="bg-gray-100 px-2 py-1 rounded">{'>='}</code> Greater/equal</div>
                  <div><code className="bg-gray-100 px-2 py-1 rounded">{'<='}</code> Less/equal</div>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Available Actions</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="font-medium text-gray-700">send_email</div>
                    <code className="text-xs text-gray-600 block mt-1">to, subject, body</code>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">send_sms</div>
                    <code className="text-xs text-gray-600 block mt-1">to, message</code>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">webhook</div>
                    <code className="text-xs text-gray-600 block mt-1">url, method, data</code>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">update_database</div>
                    <code className="text-xs text-gray-600 block mt-1">table, data</code>
                  </div>
                </div>
              </div>

              {/* Variables */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Variable Interpolation</h3>
                <p className="text-sm text-gray-600 mb-2">Use curly braces to insert dynamic values:</p>
                <div className="bg-gray-100 p-2 rounded text-xs font-mono">
                  <div>"Order {'{order.id}'} from {'{customer.name}'}"</div>
                </div>
              </div>

              {/* Example */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Complete Example</h3>
                <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs font-mono">
                  <div><span className="text-blue-300">WHEN</span> order.total {'>'} 1000</div>
                  <div><span className="text-blue-300">AND</span> customer.tier == "premium"</div>
                  <div><span className="text-green-300">THEN</span> send_email(</div>
                  <div className="ml-4">to: "sales@company.com",</div>
                  <div className="ml-4">subject: "High Value Order",</div>
                  <div className="ml-4">body: "Order {'{order.id}'}"</div>
                  <div>)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Help