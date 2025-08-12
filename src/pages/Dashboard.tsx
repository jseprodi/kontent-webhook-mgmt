import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWebhook } from '../contexts/WebhookContext'
import { 
  Webhook, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  AlertTriangle,
  Plus,
  Settings,
  BarChart3
} from 'lucide-react'

export default function Dashboard() {
  const { state, fetchWebhooks, fetchStats } = useWebhook()

  useEffect(() => {
    fetchWebhooks()
    fetchStats()
  }, [fetchWebhooks, fetchStats])

  const stats = [
    {
      name: 'Total Webhooks',
      value: state.stats.total,
      icon: Webhook,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      name: 'Active Webhooks',
      value: state.stats.active,
      icon: CheckCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
    {
      name: 'Success Rate',
      value: `${state.stats.successRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
    },
    {
      name: 'Avg Response Time',
      value: `${state.stats.averageResponseTime}ms`,
      icon: Clock,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
  ]

  const recentWebhooks = state.webhooks.slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of your webhook performance and recent activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Webhooks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Webhooks</h2>
            <Link
              to="/webhooks"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentWebhooks.length > 0 ? (
              recentWebhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      webhook.isActive ? 'bg-success-500' : 'bg-gray-400'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{webhook.name}</p>
                      <p className="text-xs text-gray-500">{webhook.url}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">
                      {webhook.successfulDeliveries}/{webhook.deliveryAttempts}
                    </p>
                    <p className="text-xs text-gray-500">deliveries</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Webhook className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">No webhooks yet</p>
                <Link
                  to="/webhooks/new"
                  className="mt-2 inline-block text-primary-600 hover:text-primary-700"
                >
                  Create your first webhook
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/webhooks/new"
              className="flex items-center p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors duration-200"
            >
              <Plus className="h-5 w-5 text-primary-600 mr-3" />
              <span className="text-primary-700 font-medium">Create New Webhook</span>
            </Link>
            <Link
              to="/webhooks"
              className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <Activity className="h-5 w-5 text-gray-600 mr-3" />
              <span className="text-gray-700 font-medium">View All Webhooks</span>
            </Link>
            <Link
              to="/settings"
              className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <Settings className="h-5 w-5 text-gray-600 mr-3" />
              <span className="text-gray-700 font-medium">Configure Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h2>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p>Performance charts coming soon</p>
            <p className="text-sm">Track webhook delivery success rates over time</p>
          </div>
        </div>
      </div>
    </div>
  )
}
