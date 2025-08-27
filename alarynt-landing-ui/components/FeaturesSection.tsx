import React from 'react';
import { 
  Code, 
  GitBranch, 
  BarChart3, 
  Shield, 
  Zap, 
  Users, 
  Clock, 
  Database, 
  Settings,
  CheckCircle
} from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Code,
      title: 'Visual Rule Builder',
      description: 'Create complex business rules with our intuitive drag-and-drop interface. No coding required.',
      color: 'bg-blue-500'
    },
    {
      icon: GitBranch,
      title: 'Version Control',
      description: 'Track changes, roll back deployments, and manage rule versions with enterprise-grade versioning.',
      color: 'bg-green-500'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Monitor rule performance, execution metrics, and business impact with comprehensive dashboards.',
      color: 'bg-purple-500'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'SOC 2 compliant with end-to-end encryption, role-based access control, and audit trails.',
      color: 'bg-red-500'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Sub-millisecond rule execution with global edge deployment and intelligent caching.',
      color: 'bg-yellow-500'
    },
    {
      icon: Database,
      title: 'Data Integration',
      description: 'Connect to any data source with 200+ pre-built connectors and real-time sync.',
      color: 'bg-indigo-500'
    }
  ];

  const benefits = [
    'Reduce development time by 80%',
    'Deploy rules in minutes, not weeks',
    'Scale to millions of decisions per second',
    'Maintain compliance automatically',
    'Collaborate across teams seamlessly'
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Settings className="w-4 h-4" />
            <span>Platform Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything you need to build
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> intelligent rules</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools you need to create, manage, and scale business rules across your organization.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 ${feature.color} text-white rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-900">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Why teams choose Alarynt
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of developers and business analysts who trust Alarynt to power their decision-making systems.
            </p>
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Stats/Metrics */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-xl mx-auto mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-blue-900 mb-2">99.9%</div>
              <div className="text-blue-700 font-medium">Uptime SLA</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-xl mx-auto mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-green-900 mb-2">&lt;1ms</div>
              <div className="text-green-700 font-medium">Response Time</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-500 text-white rounded-xl mx-auto mb-4">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-purple-900 mb-2">10K+</div>
              <div className="text-purple-700 font-medium">Active Users</div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-500 text-white rounded-xl mx-auto mb-4">
                <Database className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-orange-900 mb-2">1B+</div>
              <div className="text-orange-700 font-medium">Rules Executed</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};