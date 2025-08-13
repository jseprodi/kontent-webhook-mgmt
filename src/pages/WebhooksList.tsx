import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useWebhook } from '../contexts/WebhookContext'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Play,
  Pause,
  Edit,
  Trash2,
  ExternalLink,
  Activity,
  Webhook,
  X,
  AlertTriangle
} from 'lucide-react'

export default function WebhooksList() {
  const navigate = useNavigate()
  const { state, deleteWebhook, testWebhook, fetchWebhooks } = useWebhook()
  const { getCurrentMode } = useWebhook()
  const currentMode = getCurrentMode()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  const [testingWebhooks, setTestingWebhooks] = useState<Set<string>>(new Set())
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    fetchWebhooks()
  }, [fetchWebhooks])

  const filteredWebhooks = state.webhooks.filter(webhook => {
    const matchesSearch = webhook.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         webhook.url.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && webhook.isActive) ||
                         (statusFilter === 'inactive' && !webhook.isActive)
    return matchesSearch && matchesStatus
  })

  const handleDelete = async (id: string) => {
    try {
      await deleteWebhook(id)
      setShowDeleteModal(null)
    } catch (error) {
      console.error('Failed to delete webhook:', error)
    }
  }

  const handleTest = async (id: string) => {
    try {
      setTestingWebhooks(prev => new Set(prev).add(id))
      const result = await testWebhook(id)
      
      if (result.success) {
        setNotification({ 
          type: 'success', 
          message: `Webhook test successful! Status: ${result.statusCode}, Response time: ${result.responseTime}ms` 
        })
      } else {
        // Enhanced failure notification with troubleshooting info
        let failureMessage = `Webhook test failed! Status: ${result.statusCode}`
        
        if (result.failurePoint) {
          failureMessage += ` | Failure Point: ${result.failurePoint.replace('_', ' ').toUpperCase()}`
        }
        
        if (result.failureDetails?.suggestion) {
          failureMessage += ` | Suggestion: ${result.failureDetails.suggestion}`
        }
        
        setNotification({ 
          type: 'error', 
          message: failureMessage 
        })
      }
      
      // Clear notification after 5 seconds
      setTimeout(() => setNotification(null), 5000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setNotification({ 
        type: 'error', 
        message: `Webhook test error: ${errorMessage}` 
      })
      setTimeout(() => setNotification(null), 5000)
      console.error('Failed to test webhook:', error)
    } finally {
      setTestingWebhooks(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const getStatusColor = (webhook: any) => {
    if (!webhook.isActive) return 'text-gray-500 bg-gray-100'
    if (webhook.deliveryAttempts === 0) return 'text-blue-600 bg-blue-100'
    const successRate = webhook.successfulDeliveries / webhook.deliveryAttempts
    if (successRate >= 0.9) return 'text-success-600 bg-success-100'
    if (successRate >= 0.7) return 'text-warning-600 bg-warning-100'
    return 'text-danger-600 bg-danger-100'
  }

  const getStatusText = (webhook: any) => {
    if (!webhook.isActive) return 'Inactive'
    if (webhook.deliveryAttempts === 0) return 'No deliveries'
    const successRate = webhook.successfulDeliveries / webhook.deliveryAttempts
    if (successRate >= 0.9) return 'Healthy'
    if (successRate >= 0.7) return 'Warning'
    return 'Critical'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Webhooks</h1>
          <p className="mt-2 text-gray-600">
            Manage your webhook configurations and monitor their performance
          </p>
        </div>
        <Link
          to="/webhooks/new"
          className="btn-primary inline-flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Webhook
        </Link>
      </div>

      {/* Mode Indicator */}
      {currentMode.mode === 'fallback' && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-warning-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-warning-800">
                Development Mode Active
              </p>
              <p className="text-xs text-warning-700 mt-1">
                Webhooks are being created and managed locally. They will not be sent to Kontent.ai until you configure an API key.
              </p>
            </div>
            <Link
              to="/settings"
              className="text-xs text-warning-700 hover:text-warning-800 underline"
            >
              Configure API
            </Link>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search webhooks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Webhooks Table */}
      <div className="card">
        {/* Notification */}
        {notification && (
          <div className={`mb-4 p-4 rounded-lg border ${
            notification.type === 'success' 
              ? 'bg-success-50 border-success-200 text-success-800' 
              : 'bg-danger-50 border-danger-200 text-danger-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-medium">{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Webhook
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deliveries
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Triggered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWebhooks.length > 0 ? (
                filteredWebhooks.map((webhook) => (
                  <tr key={webhook.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {webhook.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {webhook.url}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(webhook)}`}>
                        {getStatusText(webhook)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span>{webhook.successfulDeliveries}/{webhook.deliveryAttempts}</span>
                        {webhook.deliveryAttempts > 0 && (
                          <span className="text-xs text-gray-500">
                            ({((webhook.successfulDeliveries / webhook.deliveryAttempts) * 100).toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {webhook.lastTriggered 
                        ? new Date(webhook.lastTriggered).toLocaleDateString()
                        : 'Never'
                      }
                      {webhook.deliveryAttempts > 0 && (
                        <div className="text-xs text-gray-400 mt-1">
                          Last test: {webhook.successfulDeliveries > 0 ? '✅' : '❌'} 
                          ({webhook.successfulDeliveries}/{webhook.deliveryAttempts})
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleTest(webhook.id)}
                          disabled={testingWebhooks.has(webhook.id) || !webhook.isActive}
                          className={`${
                            testingWebhooks.has(webhook.id)
                              ? 'text-gray-400 cursor-not-allowed'
                              : webhook.isActive
                                ? 'text-primary-600 hover:text-primary-900'
                                : 'text-gray-400 cursor-not-allowed'
                          }`}
                          title={webhook.isActive ? 'Test webhook' : 'Cannot test inactive webhook'}
                        >
                          {testingWebhooks.has(webhook.id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </button>
                        <Link
                          to={`/webhooks/${webhook.id}`}
                          className="text-gray-600 hover:text-gray-900"
                          title="View details"
                        >
                          <Activity className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/webhooks/${webhook.id}/edit`}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit webhook"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setShowDeleteModal(webhook.id)}
                          className="text-danger-600 hover:text-danger-900"
                          title="Delete webhook"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Webhook className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium">No webhooks found</p>
                      <p className="text-sm">Get started by creating your first webhook</p>
                      <Link
                        to="/webhooks/new"
                        className="mt-4 btn-primary"
                      >
                        Create Webhook
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-danger-100">
                <Trash2 className="h-6 w-6 text-danger-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Webhook</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete this webhook? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3 mt-6">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal)}
                  className="btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
