import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useWebhook } from '../contexts/WebhookContext'
import { WebhookTestResult } from '../types/webhook'
import { 
  Edit, 
  Trash2, 
  Play, 
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  Settings,
  Copy,
  Download
} from 'lucide-react'

export default function WebhookDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, fetchWebhooks, deleteWebhook, testWebhook } = useWebhook()
  const [isTesting, setIsTesting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchWebhooks()
    }
  }, [id, fetchWebhooks])

  const webhook = state.webhooks.find(w => w.id === id)

  if (!webhook) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          <Activity className="mx-auto h-12 w-12 mb-4" />
          <p className="text-lg font-medium">Webhook not found</p>
          <Link to="/webhooks" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
            Back to webhooks
          </Link>
        </div>
      </div>
    )
  }

  const handleTest = async () => {
    if (!id) return
    
    setIsTesting(true)
    try {
      await testWebhook(id)
    } catch (error) {
      console.error('Failed to test webhook:', error)
    } finally {
      setIsTesting(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    
    try {
      await deleteWebhook(id)
      navigate('/webhooks')
    } catch (error) {
      console.error('Failed to delete webhook:', error)
    }
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const getStatusColor = () => {
    if (!webhook.isActive) return 'text-gray-500 bg-gray-100'
    if (webhook.deliveryAttempts === 0) return 'text-blue-600 bg-blue-100'
    const successRate = webhook.successfulDeliveries / webhook.deliveryAttempts
    if (successRate >= 0.9) return 'text-success-600 bg-success-100'
    if (successRate >= 0.7) return 'text-warning-600 bg-warning-100'
    return 'text-danger-600 bg-danger-100'
  }

  const getStatusText = () => {
    if (!webhook.isActive) return 'Inactive'
    if (webhook.deliveryAttempts === 0) return 'No deliveries'
    const successRate = webhook.successfulDeliveries / webhook.deliveryAttempts
    if (successRate >= 0.9) return 'Healthy'
    if (successRate >= 0.7) return 'Warning'
    return 'Critical'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const recentTestResults = state.testResults
    .filter(result => result.webhookId === id)
    .slice(0, 5)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{webhook.name}</h1>
          <p className="mt-2 text-gray-600">{webhook.url}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleTest}
            disabled={isTesting}
            className="btn-primary inline-flex items-center"
          >
            {isTesting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Testing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Test Webhook
              </>
            )}
          </button>
          <Link
            to={`/webhooks/${id}/edit`}
            className="btn-secondary inline-flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn-danger inline-flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Status and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-primary-50">
              <Activity className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Status</p>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-success-50">
              <CheckCircle className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {webhook.deliveryAttempts > 0 
                  ? `${((webhook.successfulDeliveries / webhook.deliveryAttempts) * 100).toFixed(1)}%`
                  : '0%'
                }
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-warning-50">
              <Clock className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
              <p className="text-2xl font-bold text-gray-900">{webhook.deliveryAttempts}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gray-50">
              <Settings className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Triggers</p>
              <p className="text-2xl font-bold text-gray-900">{webhook.triggers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Webhook Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Configuration */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={webhook.url}
                    readOnly
                    className="input-field flex-1"
                  />
                  <button
                    onClick={() => copyToClipboard(webhook.url, 'url')}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Copy URL"
                  >
                    {copiedField === 'url' ? <CheckCircle className="h-4 w-4 text-success-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <a
                    href={webhook.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Open URL"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Triggers</label>
                <div className="space-y-2">
                  {webhook.triggers.length > 0 ? (
                    webhook.triggers.map((trigger) => (
                      <div key={trigger.codename} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-success-600" />
                        <span className="text-sm text-gray-900">{trigger.codename}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No triggers configured</p>
                  )}
                </div>
              </div>

              {Object.keys(webhook.headers).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custom Headers</label>
                  <div className="space-y-2">
                    {Object.entries(webhook.headers).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-700">{key}</span>
                        <span className="text-sm text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Test Results */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Test Results</h2>
            
            {recentTestResults.length > 0 ? (
              <div className="space-y-4">
                {recentTestResults.map((result, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    result.success 
                      ? 'bg-success-50 border-success-200' 
                      : 'bg-danger-50 border-danger-200'
                  }`}>
                    {/* Basic Result Info */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {result.success ? (
                          <CheckCircle className="h-5 w-5 text-success-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-danger-600" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {result.success ? 'Success' : 'Failed'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(result.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {result.statusCode > 0 ? result.statusCode : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">{result.responseTime}ms</p>
                      </div>
                    </div>

                    {/* Failure Analysis (only show for failed tests) */}
                    {!result.success && result.failureDetails && (
                      <div className="mt-4 space-y-4">
                        {/* Failure Point Badge */}
                        {result.failurePoint && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-gray-700">Failure Point:</span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              result.failurePoint === 'connection' ? 'bg-blue-100 text-blue-800' :
                              result.failurePoint === 'timeout' ? 'bg-yellow-100 text-yellow-800' :
                              result.failurePoint === 'authentication' ? 'bg-red-100 text-red-800' :
                              result.failurePoint === 'authorization' ? 'bg-purple-100 text-purple-800' :
                              result.failurePoint === 'validation' ? 'bg-orange-100 text-orange-800' :
                              result.failurePoint === 'server_error' ? 'bg-red-100 text-red-800' :
                              result.failurePoint === 'client_error' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {result.failurePoint.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        )}

                        {/* Error Details */}
                        <div className="bg-white rounded-lg p-3 border">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Error Details</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Stage:</span>
                              <span className="ml-2 text-gray-900">{result.failureDetails.stage}</span>
                            </div>
                            {result.failureDetails.errorCode && (
                              <div>
                                <span className="font-medium text-gray-700">Error Code:</span>
                                <span className="ml-2 text-gray-900">{result.failureDetails.errorCode}</span>
                              </div>
                            )}
                            <div>
                              <span className="font-medium text-gray-700">Message:</span>
                              <span className="ml-2 text-gray-900">{result.failureDetails.errorMessage}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Suggestion:</span>
                              <span className="ml-2 text-gray-900">{result.failureDetails.suggestion}</span>
                            </div>
                          </div>
                        </div>

                        {/* Troubleshooting Guide */}
                        {result.troubleshooting && (
                          <div className="bg-white rounded-lg p-3 border">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Troubleshooting Guide</h4>
                            
                            {/* Common Causes */}
                            <div className="mb-3">
                              <h5 className="text-xs font-medium text-gray-700 mb-2">Common Causes:</h5>
                              <ul className="text-xs text-gray-600 space-y-1">
                                {result.troubleshooting.commonCauses.map((cause, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="text-danger-500 mr-2">•</span>
                                    {cause}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Immediate Actions */}
                            <div className="mb-3">
                              <h5 className="text-xs font-medium text-gray-700 mb-2">Immediate Actions:</h5>
                              <ul className="text-xs text-gray-600 space-y-1">
                                {result.troubleshooting.immediateActions.map((action, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="text-warning-500 mr-2">→</span>
                                    {action}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Long-term Solutions */}
                            <div>
                              <h5 className="text-xs font-medium text-gray-700 mb-2">Long-term Solutions:</h5>
                              <ul className="text-xs text-gray-600 space-y-1">
                                {result.troubleshooting.longTermSolutions.map((solution, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="text-success-500 mr-2">✓</span>
                                    {solution}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* Request/Response Details (expandable) */}
                        <div className="bg-white rounded-lg p-3 border">
                          <details className="group">
                            <summary className="cursor-pointer text-sm font-medium text-gray-900 hover:text-gray-700">
                              Technical Details
                              <span className="ml-2 text-gray-500 group-open:rotate-180 transition-transform">
                                ▼
                              </span>
                            </summary>
                            <div className="mt-3 space-y-3 text-xs">
                              {/* Request Payload */}
                              {result.failureDetails?.requestPayload && (
                                <div>
                                  <h6 className="font-medium text-gray-700 mb-1">Request Payload:</h6>
                                  <pre className="bg-gray-50 p-2 rounded text-gray-600 overflow-x-auto">
                                    {JSON.stringify(result.failureDetails.requestPayload, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {/* Response Headers */}
                              {result.failureDetails?.responseHeaders && (
                                <div>
                                  <h6 className="font-medium text-gray-700 mb-1">Response Headers:</h6>
                                  <pre className="bg-gray-50 p-2 rounded text-gray-600 overflow-x-auto">
                                    {JSON.stringify(result.failureDetails.responseHeaders, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {/* Full Response */}
                              {result.response && (
                                <div>
                                  <h6 className="font-medium text-gray-700 mb-1">Full Response:</h6>
                                  <pre className="bg-gray-50 p-2 rounded text-gray-600 overflow-x-auto max-h-32">
                                    {result.response}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </details>
                        </div>
                      </div>
                    )}

                    {/* Success Response (only show for successful tests) */}
                    {result.success && result.response && (
                      <div className="mt-3 bg-white rounded-lg p-3 border">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Response</h4>
                        <details className="group">
                          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                            View Response Details
                            <span className="ml-2 text-gray-500 group-open:rotate-180 transition-transform">
                              ▼
                            </span>
                          </summary>
                          <pre className="mt-2 bg-gray-50 p-2 rounded text-gray-600 overflow-x-auto max-h-32">
                            {result.response}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Play className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p>No test results yet</p>
                <p className="text-sm">Test your webhook to see results here</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleTest}
                disabled={isTesting}
                className="w-full btn-primary"
              >
                {isTesting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Test Now
                  </>
                )}
              </button>
              <Link
                to={`/webhooks/${id}/edit`}
                className="w-full btn-secondary inline-flex items-center justify-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Webhook
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full btn-danger"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Webhook
              </button>
            </div>
          </div>

          {/* Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Created</p>
                <p className="text-sm text-gray-900">{formatDate(webhook.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Last Updated</p>
                <p className="text-sm text-gray-900">{formatDate(webhook.updatedAt)}</p>
              </div>
              {webhook.lastTriggered && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Last Triggered</p>
                  <p className="text-sm text-gray-900">{formatDate(webhook.lastTriggered)}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-700">Environment</p>
                <p className="text-sm text-gray-900">{webhook.environmentId}</p>
              </div>
            </div>
          </div>
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
                Are you sure you want to delete "{webhook.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3 mt-6">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
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
