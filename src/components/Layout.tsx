import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useKontent } from '../contexts/KontentContext'
import { 
  Home, 
  Webhook, 
  Settings, 
  Plus,
  Activity,
  BarChart3,
  Zap,
  User,
  Globe
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Webhooks', href: '/webhooks', icon: Webhook },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { environmentId, userEmail, userRoles, isLoading, error } = useKontent()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Zap className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Webhook Manager
                </span>
              </div>
            </div>
                            <div className="flex items-center space-x-4">
                  {/* Kontent.ai Context Info */}
                  {!isLoading && !error && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Globe className="h-4 w-4" />
                      <span className="hidden sm:inline">Env: {environmentId?.slice(0, 8)}...</span>
                      {userEmail && (
                        <>
                          <User className="h-4 w-4" />
                          <span className="hidden sm:inline">{userEmail}</span>
                        </>
                      )}
                    </div>
                  )}
                  
                  <Link
                    to="/webhooks/new"
                    className="btn-primary inline-flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Webhook
                  </Link>
                </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <nav className="mt-8 px-4">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </div>

            {/* Quick Stats */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Quick Stats
              </h3>
              <div className="mt-3 space-y-2">
                <div className="px-3 py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="font-medium text-gray-900">12</span>
                  </div>
                </div>
                <div className="px-3 py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Active</span>
                    <span className="font-medium text-success-600">8</span>
                  </div>
                </div>
                <div className="px-3 py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-medium text-primary-600">94%</span>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
