import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useWebhook } from '../contexts/WebhookContext'
import { 
  Home, 
  Webhook, 
  Settings, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { getCurrentMode } = useWebhook()
  const currentMode = getCurrentMode()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mode Banner */}
      {currentMode.mode === 'fallback' && (
        <div className="bg-warning-50 border-b border-warning-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-warning-600" />
              <div>
                <p className="text-sm font-medium text-warning-800">
                  Development Mode: Local Simulation Active
                </p>
                <p className="text-xs text-warning-700">
                  {currentMode.description}. Set an API key in Settings to use real Kontent.ai API.
                </p>
              </div>
            </div>
            <Link
              to="/settings"
              className="inline-flex items-center px-3 py-1.5 border border-warning-300 text-xs font-medium rounded-md text-warning-700 bg-warning-100 hover:bg-warning-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-warning-500"
            >
              Configure API
            </Link>
          </div>
        </div>
      )}

      {currentMode.mode === 'api' && (
        <div className="bg-success-50 border-b border-success-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-success-600" />
            <div>
              <p className="text-sm font-medium text-success-800">
                Production Mode: Kontent.ai API Active
              </p>
              <p className="text-xs text-success-700">
                {currentMode.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Webhook Manager</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/') 
                      ? 'border-primary-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                <Link
                  to="/webhooks"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/webhooks') 
                      ? 'border-primary-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Webhook className="h-4 w-4 mr-2" />
                  Webhooks
                </Link>
                <Link
                  to="/settings"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/settings') 
                      ? 'border-primary-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
