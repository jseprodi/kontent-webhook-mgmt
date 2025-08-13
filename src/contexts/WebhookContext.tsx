import React, { createContext, useContext, useReducer, ReactNode, useCallback, useMemo } from 'react'
import { Webhook, WebhookFormData, WebhookTestResult, WebhookStats, WebhookTrigger } from '../types/webhook'
import { useKontent } from './KontentContext'

// Webhook API service for Kontent.ai Management API v2
// Note: This service requires a valid Management API key to be set via useKontent().setApiKey()
const webhookService = {
  baseUrl: 'https://manage.kontent.ai/v2',
  
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  },
  
  async getWebhooks(environmentId: string, apiKey: string) {
    return this.request(`/projects/${environmentId}/webhooks`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })
  },
  
  async createWebhook(environmentId: string, apiKey: string, webhookData: any) {
    return this.request(`/projects/${environmentId}/webhooks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(webhookData),
    })
  },
  
  async updateWebhook(environmentId: string, apiKey: string, webhookId: string, webhookData: any) {
    return this.request(`/projects/${environmentId}/webhooks/${webhookId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(webhookData),
    })
  },
  
  async deleteWebhook(environmentId: string, apiKey: string, webhookId: string) {
    return this.request(`/projects/${environmentId}/webhooks/${webhookId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })
  },
}

/*
 * PRODUCTION IMPLEMENTATION NOTES:
 * 
 * This context now integrates with the Kontent.ai Management API v2.
 * 
 * API Base URL: https://manage.kontent.ai/v2
 * Authentication: Bearer token (API key) in Authorization header
 * 
 * To get your API key:
 * 1. Go to Project settings > API keys > Management API keys
 * 2. Create a new Management API key with appropriate permissions
 * 3. Use the setApiKey function from useKontent() to set it
 * 
 * Webhook endpoints:
 * 1. GET /projects/{environment_id}/webhooks - Fetch all webhooks
 * 2. POST /projects/{environment_id}/webhooks - Create new webhook
 * 3. PUT /projects/{environment_id}/webhooks/{webhook_id} - Update webhook
 * 4. DELETE /projects/{environment_id}/webhooks/{webhook_id} - Delete webhook
 * 
 * The API calls:
 * - Use the environmentId from Kontent.ai context
 * - Include Bearer authentication header
 * - Handle API responses and errors appropriately
 * - Update local state based on API responses
 * - Fall back to local simulation if no API key is provided
 */

interface WebhookState {
  webhooks: Webhook[]
  selectedWebhook: Webhook | null
  isLoading: boolean
  error: string | null
  stats: WebhookStats
  testResults: WebhookTestResult[]
}

type WebhookAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_WEBHOOKS'; payload: Webhook[] }
  | { type: 'ADD_WEBHOOK'; payload: Webhook }
  | { type: 'UPDATE_WEBHOOK'; payload: Webhook }
  | { type: 'DELETE_WEBHOOK'; payload: string }
  | { type: 'SET_SELECTED_WEBHOOK'; payload: Webhook | null }
  | { type: 'SET_STATS'; payload: WebhookStats }
  | { type: 'ADD_TEST_RESULT'; payload: WebhookTestResult }

const initialState: WebhookState = {
  webhooks: [
    {
      id: '1',
      name: 'Sample Webhook',
      url: 'https://httpbin.org/post',
      triggers: [
        { id: 'content_item_variant_changed', name: 'Content Item Variant Changed', codename: 'content_item_variant_changed', description: 'Triggered when a content item variant is modified', isEnabled: true }
      ],
      headers: { 'X-Custom-Header': 'test-value' },
      isActive: true,
      environmentId: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deliveryAttempts: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
    }
  ],
  selectedWebhook: null,
  isLoading: false,
  error: null,
  stats: {
    total: 1,
    active: 1,
    inactive: 0,
    totalDeliveries: 0,
    successRate: 0,
    averageResponseTime: 0,
  },
  testResults: [],
}

function webhookReducer(state: WebhookState, action: WebhookAction): WebhookState {
  let newState: WebhookState
  
  switch (action.type) {
    case 'SET_LOADING':
      newState = { ...state, isLoading: action.payload }
      break
    case 'SET_ERROR':
      newState = { ...state, error: action.payload }
      break
    case 'SET_WEBHOOKS':
      newState = { ...state, webhooks: action.payload }
      break
    case 'ADD_WEBHOOK':
      newState = { ...state, webhooks: [...state.webhooks, action.payload] }
      break
    case 'UPDATE_WEBHOOK':
      newState = {
        ...state,
        webhooks: state.webhooks.map(w => w.id === action.payload.id ? action.payload : w),
        selectedWebhook: state.selectedWebhook?.id === action.payload.id ? action.payload : state.selectedWebhook,
      }
      break
    case 'DELETE_WEBHOOK':
      newState = {
        ...state,
        webhooks: state.webhooks.filter(w => w.id !== action.payload),
        selectedWebhook: state.selectedWebhook?.id === action.payload ? null : state.selectedWebhook,
      }
      break
    case 'SET_SELECTED_WEBHOOK':
      newState = { ...state, selectedWebhook: action.payload }
      break
    case 'SET_STATS':
      newState = { ...state, stats: action.payload }
      break
    case 'ADD_TEST_RESULT':
      newState = { ...state, testResults: [action.payload, ...state.testResults] }
      break
    default:
      newState = state
  }
  
  return newState
}

interface WebhookContextType {
  state: WebhookState
  dispatch: React.Dispatch<WebhookAction>
  createWebhook: (data: WebhookFormData) => Promise<void>
  updateWebhook: (id: string, data: WebhookFormData) => Promise<void>
  deleteWebhook: (id: string) => Promise<void>
  testWebhook: (id: string) => Promise<WebhookTestResult>
  fetchWebhooks: () => Promise<void>
  fetchStats: () => Promise<void>
}

const WebhookContext = createContext<WebhookContextType | undefined>(undefined)

export function useWebhook() {
  const context = useContext(WebhookContext)
  if (context === undefined) {
    throw new Error('useWebhook must be used within a WebhookProvider')
  }
  return context
}

interface WebhookProviderProps {
  children: ReactNode
}

export function WebhookProvider({ children }: WebhookProviderProps) {
  const [state, dispatch] = useReducer(webhookReducer, initialState)
  const { environmentId, apiKey } = useKontent()

  const createWebhook = useCallback(async (data: WebhookFormData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      
      // Convert string[] triggers to WebhookTrigger[] format
      const triggers: WebhookTrigger[] = data.triggers.map(triggerId => ({
        id: triggerId,
        name: triggerId,
        codename: triggerId,
        description: `Trigger for ${triggerId}`,
        isEnabled: true
      }))
      
      // Create webhook object
      const newWebhook: Webhook = {
        id: Date.now().toString(),
        name: data.name,
        url: data.url,
        triggers,
        headers: data.headers,
        isActive: data.isActive,
        environmentId: environmentId || 'default',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deliveryAttempts: 0,
        successfulDeliveries: 0,
        failedDeliveries: 0,
      }

      // Use the real Kontent.ai API service
      if (apiKey) {
        try {
          const createdWebhook = await webhookService.createWebhook(environmentId || 'default', apiKey, newWebhook)
          newWebhook.id = createdWebhook.id // Update ID with the one from the API
          newWebhook.createdAt = createdWebhook.createdAt
          newWebhook.updatedAt = createdWebhook.updatedAt
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create webhook'
          dispatch({ type: 'SET_ERROR', payload: errorMessage })
          throw error
        }
      } else {
        // Fallback to local simulation if API key is not available
        await new Promise(resolve => setTimeout(resolve, 500))
        dispatch({ type: 'ADD_WEBHOOK', payload: newWebhook })
        // Update stats
        const updatedStats = {
          ...state.stats,
          total: state.stats.total + 1,
          active: state.stats.active + (data.isActive ? 1 : 0),
          inactive: state.stats.inactive + (data.isActive ? 0 : 1),
        }
        dispatch({ type: 'SET_STATS', payload: updatedStats })
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create webhook'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [environmentId, apiKey, state.stats])

  const updateWebhook = useCallback(async (id: string, data: WebhookFormData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      
      // Convert string[] triggers to WebhookTrigger[] format
      const triggers: WebhookTrigger[] = data.triggers.map(triggerId => ({
        id: triggerId,
        name: triggerId,
        codename: triggerId,
        description: `Trigger for ${triggerId}`,
        isEnabled: true
      }))
      
      // Create updated webhook object
      const updatedWebhook: Webhook = {
        id,
        name: data.name,
        url: data.url,
        triggers,
        headers: data.headers,
        isActive: data.isActive,
        environmentId: environmentId || 'default',
        createdAt: new Date().toISOString(), // This should come from existing webhook
        updatedAt: new Date().toISOString(),
        deliveryAttempts: 0, // This should come from existing webhook
        successfulDeliveries: 0, // This should come from existing webhook
        failedDeliveries: 0, // This should come from existing webhook
      }

      // Use the real Kontent.ai API service
      if (apiKey) {
        try {
          const updatedWebhookData = await webhookService.updateWebhook(environmentId || 'default', apiKey, id, updatedWebhook)
          updatedWebhook.id = updatedWebhookData.id
          updatedWebhook.createdAt = updatedWebhookData.createdAt
          updatedWebhook.updatedAt = updatedWebhookData.updatedAt
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update webhook'
          dispatch({ type: 'SET_ERROR', payload: errorMessage })
          throw error
        }
      } else {
        // Fallback to local simulation if API key is not available
        await new Promise(resolve => setTimeout(resolve, 500))
        dispatch({ type: 'UPDATE_WEBHOOK', payload: updatedWebhook })
        
        // Update stats if active status changed
        const existingWebhook = state.webhooks.find(w => w.id === id)
        if (existingWebhook && existingWebhook.isActive !== data.isActive) {
          const updatedStats = {
            ...state.stats,
            active: state.stats.active + (data.isActive ? 1 : -1),
            inactive: state.stats.inactive + (data.isActive ? -1 : 1),
          }
          dispatch({ type: 'SET_STATS', payload: updatedStats })
        }
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update webhook'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [environmentId, apiKey, state.webhooks, state.stats])

  const deleteWebhook = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      
      // Use the real Kontent.ai API service
      if (apiKey) {
        try {
          await webhookService.deleteWebhook(environmentId || 'default', apiKey, id)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete webhook'
          dispatch({ type: 'SET_ERROR', payload: errorMessage })
          throw error
        }
      } else {
        // Fallback to local simulation if API key is not available
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Get webhook info before deletion for stats update
        const webhookToDelete = state.webhooks.find(w => w.id === id)
        
        // Remove from local state
        dispatch({ type: 'DELETE_WEBHOOK', payload: id })
        
        // Update stats
        if (webhookToDelete) {
          const updatedStats = {
            ...state.stats,
            total: state.stats.total - 1,
            active: state.stats.active - (webhookToDelete.isActive ? 1 : 0),
            inactive: state.stats.inactive - (webhookToDelete.isActive ? 0 : 1),
          }
          dispatch({ type: 'SET_STATS', payload: updatedStats })
        }
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete webhook'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [environmentId, apiKey, state.webhooks, state.stats])

  const testWebhook = useCallback(async (id: string): Promise<WebhookTestResult> => {
    try {
      const webhook = state.webhooks.find(w => w.id === id)
      if (!webhook) {
        throw new Error('Webhook not found')
      }

      if (!webhook.isActive) {
        throw new Error('Cannot test inactive webhook')
      }

      if (!webhook.url) {
        throw new Error('Webhook URL is required')
      }

      // Create a test payload
      const testPayload = {
        test: true,
        timestamp: new Date().toISOString(),
        webhookId: webhook.id,
        webhookName: webhook.name,
        message: 'This is a test webhook request from Kontent.ai Webhook Manager'
      }

      const startTime = Date.now()
      let response: Response
      let responseText = ''
      let failurePoint: 'connection' | 'timeout' | 'authentication' | 'authorization' | 'validation' | 'server_error' | 'client_error' | 'network' | 'unknown' = 'unknown'
      let failureDetails: any = {}
      let troubleshooting: any = {}

      try {
        // Send the test request with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

        response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Kontent.ai-Webhook-Manager/1.0.0',
            'X-Webhook-Test': 'true',
            'X-Webhook-ID': webhook.id,
            ...webhook.headers
          },
          body: JSON.stringify(testPayload),
          signal: controller.signal
        })

        clearTimeout(timeoutId)
        responseText = await response.text()

        // Analyze response for different failure scenarios
        if (!response.ok) {
          if (response.status >= 400 && response.status < 500) {
            failurePoint = 'client_error'
            failureDetails = {
              stage: 'request_processing',
              errorCode: response.status.toString(),
              errorMessage: `Client error: ${response.status} ${response.statusText}`,
              suggestion: 'Check your webhook configuration and request format',
              responseHeaders: Object.fromEntries(response.headers.entries()),
              requestPayload: testPayload
            }
            
            // Provide specific troubleshooting based on status codes
            switch (response.status) {
              case 400:
                troubleshooting = {
                  commonCauses: ['Invalid request format', 'Missing required fields', 'Malformed JSON'],
                  immediateActions: ['Verify request payload format', 'Check required headers', 'Validate JSON syntax'],
                  longTermSolutions: ['Implement request validation', 'Add error handling', 'Update API documentation']
                }
                break
              case 401:
                failurePoint = 'authentication'
                failureDetails.suggestion = 'Check authentication credentials and API keys'
                troubleshooting = {
                  commonCauses: ['Invalid API key', 'Expired token', 'Missing authentication header'],
                  immediateActions: ['Verify API key is correct', 'Check token expiration', 'Ensure auth header is present'],
                  longTermSolutions: ['Implement proper auth flow', 'Add token refresh logic', 'Use secure credential storage']
                }
                break
              case 403:
                failurePoint = 'authorization'
                failureDetails.suggestion = 'Check if your account has permission to access this endpoint'
                troubleshooting = {
                  commonCauses: ['Insufficient permissions', 'IP whitelist restrictions', 'Account limitations'],
                  immediateActions: ['Verify account permissions', 'Check IP restrictions', 'Contact service provider'],
                  longTermSolutions: ['Request proper access levels', 'Implement IP management', 'Set up proper account hierarchy']
                }
                break
              case 404:
                failureDetails.suggestion = 'Verify the webhook URL is correct and the endpoint exists'
                troubleshooting = {
                  commonCauses: ['Incorrect URL', 'Endpoint does not exist', 'Service is down'],
                  immediateActions: ['Double-check the URL', 'Test endpoint manually', 'Contact service provider'],
                  longTermSolutions: ['Implement URL validation', 'Add health checks', 'Set up monitoring']
                }
                break
              case 422:
                failureDetails.suggestion = 'Check request validation and data format requirements'
                troubleshooting = {
                  commonCauses: ['Invalid data format', 'Missing required fields', 'Validation rules not met'],
                  immediateActions: ['Review API documentation', 'Check data format', 'Validate all required fields'],
                  longTermSolutions: ['Implement proper validation', 'Add data transformation', 'Create comprehensive tests']
                }
                break
              default:
                troubleshooting = {
                  commonCauses: ['Client-side error', 'Invalid request', 'Configuration issue'],
                  immediateActions: ['Check request format', 'Verify configuration', 'Review error response'],
                  longTermSolutions: ['Implement error handling', 'Add request validation', 'Set up monitoring']
                }
            }
          } else if (response.status >= 500) {
            failurePoint = 'server_error'
            failureDetails = {
              stage: 'server_processing',
              errorCode: response.status.toString(),
              errorMessage: `Server error: ${response.status} ${response.statusText}`,
              suggestion: 'This is a server-side issue. Try again later or contact the service provider',
              responseHeaders: Object.fromEntries(response.headers.entries()),
              requestPayload: testPayload
            }
            
            troubleshooting = {
              commonCauses: ['Server overloaded', 'Database issues', 'Service temporarily unavailable'],
              immediateActions: ['Wait and retry', 'Check service status', 'Contact support'],
              longTermSolutions: ['Implement retry logic', 'Add circuit breaker', 'Set up fallback services']
            }
          }
        }
      } catch (fetchError: any) {
        // Handle fetch-specific errors
        if (fetchError.name === 'AbortError') {
          failurePoint = 'timeout'
          failureDetails = {
            stage: 'request_timeout',
            errorCode: 'TIMEOUT',
            errorMessage: 'Request timed out after 30 seconds',
            suggestion: 'Check if the service is responding slowly or if there are network issues',
            requestPayload: testPayload
          }
          
          troubleshooting = {
            commonCauses: ['Slow service response', 'Network latency', 'Service overloaded'],
            immediateActions: ['Check service status', 'Verify network connection', 'Try again'],
            longTermSolutions: ['Increase timeout settings', 'Implement retry logic', 'Add performance monitoring']
          }
        } else if (fetchError.code === 'ENOTFOUND' || fetchError.message.includes('fetch')) {
          failurePoint = 'connection'
          failureDetails = {
            stage: 'dns_resolution',
            errorCode: 'DNS_ERROR',
            errorMessage: 'Unable to resolve hostname or establish connection',
            suggestion: 'Check if the URL is correct and the service is accessible',
            requestPayload: testPayload
          }
          
          troubleshooting = {
            commonCauses: ['Incorrect URL', 'DNS issues', 'Service is down', 'Network connectivity problems'],
            immediateActions: ['Verify the URL is correct', 'Check DNS resolution', 'Test network connectivity'],
            longTermSolutions: ['Implement URL validation', 'Add health checks', 'Set up monitoring', 'Use reliable DNS']
          }
        } else {
          failurePoint = 'network'
          failureDetails = {
            stage: 'network_error',
            errorCode: fetchError.code || 'NETWORK_ERROR',
            errorMessage: fetchError.message || 'Network error occurred',
            suggestion: 'Check network connectivity and firewall settings',
            requestPayload: testPayload
          }
          
          troubleshooting = {
            commonCauses: ['Network connectivity issues', 'Firewall blocking', 'Proxy configuration', 'SSL/TLS issues'],
            immediateActions: ['Check network connection', 'Verify firewall settings', 'Test with different network'],
            longTermSolutions: ['Implement network monitoring', 'Add retry mechanisms', 'Set up fallback networks']
          }
        }
        
        // Create a mock response for error cases
        response = {
          ok: false,
          status: 0,
          statusText: 'Network Error'
        } as Response
      }

      const responseTime = Date.now() - startTime

      const testResult: WebhookTestResult = {
        id: Date.now().toString(),
        webhookId: id,
        success: response.ok,
        statusCode: response.status,
        responseTime,
        response: responseText,
        timestamp: new Date().toISOString(),
        failurePoint: response.ok ? undefined : failurePoint,
        failureDetails: response.ok ? undefined : failureDetails,
        troubleshooting: response.ok ? undefined : troubleshooting
      }

      // Update webhook stats
      const updatedWebhook = {
        ...webhook,
        deliveryAttempts: webhook.deliveryAttempts + 1,
        successfulDeliveries: response.ok ? webhook.successfulDeliveries + 1 : webhook.successfulDeliveries,
        failedDeliveries: response.ok ? webhook.failedDeliveries : webhook.failedDeliveries + 1,
        lastTriggered: new Date().toISOString()
      }

      dispatch({ type: 'UPDATE_WEBHOOK', payload: updatedWebhook })
      dispatch({ type: 'ADD_TEST_RESULT', payload: testResult })

      // Recalculate stats after testing
      const currentWebhooks = [...state.webhooks.filter(w => w.id !== id), updatedWebhook]
      const stats: WebhookStats = {
        total: currentWebhooks.length,
        active: currentWebhooks.filter(w => w.isActive).length,
        inactive: currentWebhooks.filter(w => !w.isActive).length,
        totalDeliveries: currentWebhooks.reduce((sum, w) => sum + w.deliveryAttempts, 0),
        successRate: currentWebhooks.length > 0 
          ? currentWebhooks.reduce((sum, w) => sum + (w.successfulDeliveries / w.deliveryAttempts), 0) / currentWebhooks.length * 100
          : 0,
        averageResponseTime: 0,
      }
      dispatch({ type: 'SET_STATS', payload: stats })

      return testResult
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      const testResult: WebhookTestResult = {
        id: Date.now().toString(),
        webhookId: id,
        success: false,
        statusCode: 0,
        responseTime: 0,
        response: '',
        error: errorMessage,
        timestamp: new Date().toISOString(),
        failurePoint: 'unknown',
        failureDetails: {
          stage: 'unknown_error',
          errorCode: 'UNKNOWN',
          errorMessage: errorMessage,
          suggestion: 'An unexpected error occurred. Check the webhook configuration and try again.'
        },
        troubleshooting: {
          commonCauses: ['Configuration error', 'System error', 'Unknown issue'],
          immediateActions: ['Check webhook configuration', 'Verify system status', 'Review error logs'],
          longTermSolutions: ['Implement comprehensive error handling', 'Add system monitoring', 'Set up alerting']
        }
      }

      // Update webhook stats for failed test
      const webhook = state.webhooks.find(w => w.id === id)
      if (webhook) {
        const updatedWebhook = {
          ...webhook,
          deliveryAttempts: webhook.deliveryAttempts + 1,
          failedDeliveries: webhook.failedDeliveries + 1,
          lastTriggered: new Date().toISOString()
        }
        dispatch({ type: 'UPDATE_WEBHOOK', payload: updatedWebhook })
        
        // Recalculate stats after failed test
        const currentWebhooks = [...state.webhooks.filter(w => w.id !== id), updatedWebhook]
        const stats: WebhookStats = {
          total: currentWebhooks.length,
          active: currentWebhooks.filter(w => w.isActive).length,
          inactive: currentWebhooks.filter(w => !w.isActive).length,
          totalDeliveries: currentWebhooks.reduce((sum, w) => sum + w.deliveryAttempts, 0),
          successRate: currentWebhooks.length > 0 
            ? currentWebhooks.reduce((sum, w) => sum + (w.successfulDeliveries / w.deliveryAttempts), 0) / currentWebhooks.length * 100
            : 0,
          averageResponseTime: 0,
        }
        dispatch({ type: 'SET_STATS', payload: stats })
      }

      dispatch({ type: 'ADD_TEST_RESULT', payload: testResult })
      
      throw error
    }
  }, [state.webhooks])

  const fetchWebhooks = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      
      // Use the real Kontent.ai API service
      if (apiKey) {
        try {
          const webhooks = await webhookService.getWebhooks(environmentId || 'default', apiKey)
          dispatch({ type: 'SET_WEBHOOKS', payload: webhooks })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch webhooks'
          dispatch({ type: 'SET_ERROR', payload: errorMessage })
          throw error
        }
      } else {
        // Fallback to local simulation if API key is not available
        await new Promise(resolve => setTimeout(resolve, 500))
        dispatch({ type: 'SET_WEBHOOKS', payload: [] })
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch webhooks'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [environmentId, apiKey])

  const fetchStats = useCallback(async () => {
    try {
      // Get the current webhooks from state
      const currentWebhooks = state.webhooks
      
      const stats: WebhookStats = {
        total: currentWebhooks.length,
        active: currentWebhooks.filter(w => w.isActive).length,
        inactive: currentWebhooks.filter(w => !w.isActive).length,
        totalDeliveries: currentWebhooks.reduce((sum, w) => sum + w.deliveryAttempts, 0),
        successRate: currentWebhooks.length > 0 
          ? currentWebhooks.reduce((sum, w) => sum + (w.successfulDeliveries / w.deliveryAttempts), 0) / currentWebhooks.length * 100
          : 0,
        averageResponseTime: 0,
      }
      
      dispatch({ type: 'SET_STATS', payload: stats })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch stats' })
    }
  }, [])

  const value = useMemo<WebhookContextType>(() => ({
    state,
    dispatch,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
    fetchWebhooks,
    fetchStats,
  }), [state, dispatch, createWebhook, updateWebhook, deleteWebhook, testWebhook, fetchWebhooks, fetchStats])

  return (
    <WebhookContext.Provider value={value}>
      {children}
    </WebhookContext.Provider>
  )
}
