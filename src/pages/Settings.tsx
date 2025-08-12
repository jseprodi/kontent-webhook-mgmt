import React, { useState, useEffect } from 'react'
import { useKontent } from '../contexts/KontentContext'
import { 
  Settings as SettingsIcon, 
  Key, 
  Globe, 
  Database,
  Save,
  TestTube,
  AlertCircle,
  CheckCircle,
  Copy,
  Download,
  Info
} from 'lucide-react'

export default function Settings() {
  const { context, environmentId, userId, userEmail, userRoles, appConfig } = useKontent()
  const [kontentConfig, setKontentConfig] = useState({
    environmentId: '',
    apiKey: '',
    projectId: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  useEffect(() => {
    if (environmentId) {
      setKontentConfig(prev => ({ ...prev, environmentId }))
    }
  }, [environmentId])

  const handleSave = async () => {
    setIsSaving(true)
    // TODO: Implement actual save functionality
    setTimeout(() => {
      setIsSaving(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }, 1000)
  }

  const handleTestConnection = async () => {
    setTestResult(null)
    // TODO: Implement actual connection test
    setTimeout(() => {
      setTestResult({
        success: Math.random() > 0.3,
        message: Math.random() > 0.3 
          ? 'Connection successful! API key is valid.'
          : 'Connection failed. Please check your API key and environment ID.'
      })
    }, 1500)
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

  const exportConfig = () => {
    const config = {
      kontent: kontentConfig,
      timestamp: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'webhook-manager-config.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Configure your Kontent.ai connection and application preferences
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-success-50 border border-success-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-success-600 mr-2" />
            <span className="text-success-800 font-medium">
              Settings saved successfully!
            </span>
          </div>
        </div>
      )}

                {/* Kontent.ai Context Information */}
          <div className="card">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-lg bg-info-50">
                <Info className="h-6 w-6 text-info-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">Kontent.ai Context</h2>
                <p className="text-sm text-gray-600">
                  Information from the Custom App SDK
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Environment ID</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={environmentId || 'Loading...'}
                    readOnly
                    className="input-field bg-gray-50"
                  />
                  <button
                    onClick={() => copyToClipboard(environmentId || '', 'envId')}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Copy Environment ID"
                  >
                    {copiedField === 'envId' ? <CheckCircle className="h-4 w-4 text-success-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User Email</label>
                <input
                  type="text"
                  value={userEmail || 'Loading...'}
                  readOnly
                  className="input-field bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                <input
                  type="text"
                  value={userId || 'Loading...'}
                  readOnly
                  className="input-field bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User Roles</label>
                <div className="space-y-2">
                  {userRoles ? (
                    userRoles.map((role, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">{role.codename || role.id}</span>
                        {role.codename && (
                          <span className="text-xs text-gray-500">({role.id})</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">Loading...</span>
                  )}
                </div>
              </div>
            </div>

            {appConfig && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">App Configuration</label>
                <pre className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 overflow-x-auto">
                  {JSON.stringify(appConfig, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Kontent.ai Configuration */}
          <div className="card">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-lg bg-primary-50">
                <Database className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">Kontent.ai Configuration</h2>
                <p className="text-sm text-gray-600">
                  Configure your Kontent.ai project connection
                </p>
              </div>
            </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="environmentId" className="block text-sm font-medium text-gray-700 mb-2">
              Environment ID *
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                id="environmentId"
                required
                value={kontentConfig.environmentId}
                onChange={(e) => setKontentConfig(prev => ({ ...prev, environmentId: e.target.value }))}
                className="input-field flex-1"
                placeholder="e.g., 975bf280-fd91-488c-994c-2f04416e5ee3"
              />
              <button
                onClick={() => copyToClipboard(kontentConfig.environmentId, 'envId')}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Copy Environment ID"
              >
                {copiedField === 'envId' ? <CheckCircle className="h-4 w-4 text-success-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Find this in your Kontent.ai project settings
            </p>
          </div>

          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
              Management API Key *
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="password"
                id="apiKey"
                required
                value={kontentConfig.apiKey}
                onChange={(e) => setKontentConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                className="input-field flex-1"
                placeholder="Enter your Management API key"
              />
              <button
                onClick={() => copyToClipboard(kontentConfig.apiKey, 'apiKey')}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Copy API Key"
              >
                {copiedField === 'apiKey' ? <CheckCircle className="h-4 w-4 text-success-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Create this in Project Settings → API Keys → Management API keys
            </p>
          </div>

          <div>
            <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-2">
              Project ID
            </label>
            <input
              type="text"
              id="projectId"
              value={kontentConfig.projectId}
              onChange={(e) => setKontentConfig(prev => ({ ...prev, projectId: e.target.value }))}
              className="input-field"
              placeholder="Optional: Your project identifier"
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional: Used for project-specific features
            </p>
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              onClick={handleTestConnection}
              className="btn-secondary inline-flex items-center"
            >
              <TestTube className="h-4 w-4 mr-2" />
              Test Connection
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary inline-flex items-center"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </>
              )}
            </button>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`p-4 rounded-lg ${
              testResult.success 
                ? 'bg-success-50 border border-success-200' 
                : 'bg-danger-50 border border-danger-200'
            }`}>
              <div className="flex items-center">
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-success-600 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-danger-600 mr-2" />
                )}
                <span className={`font-medium ${
                  testResult.success ? 'text-success-800' : 'text-danger-800'
                }`}>
                  {testResult.message}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Application Preferences */}
      <div className="card">
        <div className="flex items-center mb-6">
          <div className="p-3 rounded-lg bg-gray-50">
            <SettingsIcon className="h-6 w-6 text-gray-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-semibold text-gray-900">Application Preferences</h2>
            <p className="text-sm text-gray-600">
              Customize your webhook manager experience
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Environment
            </label>
            <select className="input-field">
              <option value="">Select default environment</option>
              <option value="dev">Development</option>
              <option value="staging">Staging</option>
              <option value="prod">Production</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Choose which environment to use by default when creating webhooks
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook Testing
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoTest"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="autoTest" className="ml-2 block text-sm text-gray-900">
                  Automatically test webhooks after creation
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="retryFailed"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="retryFailed" className="ml-2 block text-sm text-gray-900">
                  Retry failed webhook deliveries
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notifications
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
                  Email notifications for webhook failures
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="browserNotifications"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="browserNotifications" className="ml-2 block text-sm text-gray-900">
                  Browser notifications for webhook activity
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Import/Export */}
      <div className="card">
        <div className="flex items-center mb-6">
          <div className="p-3 rounded-lg bg-warning-50">
            <Download className="h-6 w-6 text-warning-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-semibold text-gray-900">Import & Export</h2>
            <p className="text-sm text-gray-600">
              Backup and restore your configuration
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportConfig}
            className="btn-secondary inline-flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Configuration
          </button>
          <button className="btn-secondary inline-flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Import Configuration
          </button>
        </div>
      </div>

      {/* Help & Documentation */}
      <div className="card">
        <div className="flex items-center mb-6">
          <div className="p-3 rounded-lg bg-info-50">
            <Globe className="h-6 w-6 text-info-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-semibold text-gray-900">Help & Documentation</h2>
            <p className="text-sm text-gray-600">
              Get help and learn more about webhook management
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="https://kontent.ai/learn/docs/apis/openapi/management-api-v2/#tag/Webhooks"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
          >
            <h3 className="font-medium text-gray-900">Kontent.ai Webhook API</h3>
            <p className="text-sm text-gray-600 mt-1">
              Official documentation for webhook management
            </p>
          </a>
          <a
            href="#"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
          >
            <h3 className="font-medium text-gray-900">Webhook Manager Guide</h3>
            <p className="text-sm text-gray-600 mt-1">
              Learn how to use this application effectively
            </p>
          </a>
        </div>
      </div>
    </div>
  )
}
