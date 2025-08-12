import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useWebhook } from '../contexts/WebhookContext'
import { WebhookFormData } from '../types/webhook'
import { 
  Save, 
  X, 
  Plus, 
  Trash2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

export default function WebhookForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { state, createWebhook, updateWebhook } = useWebhook()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const [formData, setFormData] = useState<WebhookFormData>({
    name: '',
    url: '',
    triggers: [],
    headers: {},
    isActive: true,
  })

  const [newHeaderKey, setNewHeaderKey] = useState('')
  const [newHeaderValue, setNewHeaderValue] = useState('')

  useEffect(() => {
    if (id && id !== 'new') {
      const webhook = state.webhooks.find(w => w.id === id)
      if (webhook) {
        setFormData({
          name: webhook.name,
          url: webhook.url,
          triggers: webhook.triggers.map(t => t.codename),
          headers: webhook.headers,
          isActive: webhook.isActive,
        })
      }
    }
  }, [id, state.webhooks])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (id && id !== 'new') {
        await updateWebhook(id, formData)
      } else {
        await createWebhook(formData)
      }
      
      setShowSuccess(true)
      setTimeout(() => {
        navigate('/webhooks')
      }, 1500)
    } catch (error) {
      console.error('Failed to save webhook:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addHeader = () => {
    if (newHeaderKey.trim() && newHeaderValue.trim()) {
      setFormData(prev => ({
        ...prev,
        headers: {
          ...prev.headers,
          [newHeaderKey.trim()]: newHeaderValue.trim()
        }
      }))
      setNewHeaderKey('')
      setNewHeaderValue('')
    }
  }

  const removeHeader = (key: string) => {
    setFormData(prev => {
      const newHeaders = { ...prev.headers }
      delete newHeaders[key]
      return { ...prev, headers: newHeaders }
    })
  }

  const availableTriggers = [
    { codename: 'content_item_variant_changed', name: 'Content Item Variant Changed', description: 'Triggered when a content item variant is modified' },
    { codename: 'content_item_variant_deleted', name: 'Content Item Variant Deleted', description: 'Triggered when a content item variant is removed' },
    { codename: 'content_item_variant_created', name: 'Content Item Variant Created', description: 'Triggered when a new content item variant is created' },
    { codename: 'content_item_variant_workflow_step_changed', name: 'Workflow Step Changed', description: 'Triggered when a content item moves between workflow steps' },
    { codename: 'content_item_variant_published', name: 'Content Published', description: 'Triggered when content is published' },
    { codename: 'content_item_variant_unpublished', name: 'Content Unpublished', description: 'Triggered when content is unpublished' },
    { codename: 'asset_created', name: 'Asset Created', description: 'Triggered when a new asset is uploaded' },
    { codename: 'asset_updated', name: 'Asset Updated', description: 'Triggered when an asset is modified' },
    { codename: 'asset_deleted', name: 'Asset Deleted', description: 'Triggered when an asset is removed' },
  ]

  const toggleTrigger = (triggerCodename: string) => {
    setFormData(prev => ({
      ...prev,
      triggers: prev.triggers.includes(triggerCodename)
        ? prev.triggers.filter(t => t !== triggerCodename)
        : [...prev.triggers, triggerCodename]
    }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {id && id !== 'new' ? 'Edit Webhook' : 'Create New Webhook'}
          </h1>
          <p className="mt-2 text-gray-600">
            Configure your webhook settings and triggers
          </p>
        </div>
        <button
          onClick={() => navigate('/webhooks')}
          className="btn-secondary"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </button>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-success-50 border border-success-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-success-600 mr-2" />
            <span className="text-success-800 font-medium">
              Webhook {id && id !== 'new' ? 'updated' : 'created'} successfully!
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Webhook Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input-field"
                placeholder="e.g., Content Update Webhook"
              />
            </div>
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL *
              </label>
              <input
                type="url"
                id="url"
                required
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="input-field"
                placeholder="https://api.example.com/webhooks/content"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>
          </div>
        </div>

        {/* Triggers */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Triggers</h2>
          <p className="text-sm text-gray-600 mb-4">
            Select the events that should trigger this webhook
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableTriggers.map((trigger) => (
              <div
                key={trigger.codename}
                className={`p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                  formData.triggers.includes(trigger.codename)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleTrigger(trigger.codename)}
              >
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.triggers.includes(trigger.codename)}
                    onChange={() => toggleTrigger(trigger.codename)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                  />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">{trigger.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{trigger.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Headers */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Custom Headers</h2>
          <p className="text-sm text-gray-600 mb-4">
            Add custom headers to be sent with each webhook request
          </p>
          
          {/* Existing Headers */}
          {Object.keys(formData.headers).length > 0 && (
            <div className="mb-4 space-y-2">
              {Object.entries(formData.headers).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 min-w-0 flex-1">{key}</span>
                  <span className="text-sm text-gray-600 min-w-0 flex-1">{value}</span>
                  <button
                    type="button"
                    onClick={() => removeHeader(key)}
                    className="text-danger-600 hover:text-danger-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Header */}
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Header name"
              value={newHeaderKey}
              onChange={(e) => setNewHeaderKey(e.target.value)}
              className="input-field flex-1"
            />
            <input
              type="text"
              placeholder="Header value"
              value={newHeaderValue}
              onChange={(e) => setNewHeaderValue(e.target.value)}
              className="input-field flex-1"
            />
            <button
              type="button"
              onClick={addHeader}
              className="btn-secondary"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/webhooks')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {id && id !== 'new' ? 'Update' : 'Create'} Webhook
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
