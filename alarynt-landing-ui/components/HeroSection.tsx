import React from 'react';
import { ArrowRight, Play, Shield, Zap, Users } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>Introducing Alarynt Rules Platform</span>
            </div>
            
            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Intelligent Rules Engine for
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Modern Applications</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Transform your business logic with our powerful, scalable rules platform. 
              Create, manage, and deploy complex decision trees without writing code.
            </p>
            
            {/* Key Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center space-x-3 bg-white rounded-lg p-4 shadow-sm">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Enterprise Security</span>
              </div>
              <div className="flex items-center space-x-3 bg-white rounded-lg p-4 shadow-sm">
                <Zap className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Lightning Fast</span>
              </div>
              <div className="flex items-center space-x-3 bg-white rounded-lg p-4 shadow-sm">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Team Collaboration</span>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center lg:items-start">
              <button className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 font-semibold text-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 group">
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button className="w-full sm:w-auto border border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-50 font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 group">
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">Trusted by companies worldwide</p>
              <div className="flex items-center justify-center lg:justify-start space-x-8 opacity-60">
                <div className="text-2xl font-bold text-gray-400">TechCorp</div>
                <div className="text-2xl font-bold text-gray-400">DataFlow</div>
                <div className="text-2xl font-bold text-gray-400">CloudScale</div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Visual */}
          <div className="relative">
            {/* Main Dashboard Mockup */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-64 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <Zap className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Rules Dashboard</h3>
                  <p className="text-blue-100">Visual rule builder and analytics</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -left-4 bg-green-500 text-white p-3 rounded-full shadow-lg animate-bounce">
              <Shield className="w-6 h-6" />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-purple-500 text-white p-3 rounded-full shadow-lg animate-pulse">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
    </section>
  );
};