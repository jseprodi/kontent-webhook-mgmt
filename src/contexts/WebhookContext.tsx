import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { Webhook, WebhookFormData, WebhookTestResult, WebhookStats } from '../types/webhook'
import { useKontent } from './KontentContext'

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
  webhooks: [],
  selectedWebhook: null,
  isLoading: false,
  error: null,
  stats: {
    total: 0,
    active: 0,
    inactive: 0,
    totalDeliveries: 0,
    successRate: 0,
    averageResponseTime: 0,
  },
  testResults: [],
}

function webhookReducer(state: WebhookState, action: WebhookAction): WebhookState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_WEBHOOKS':
      return { ...state, webhooks: action.payload }
    case 'ADD_WEBHOOK':
      return { ...state, webhooks: [...state.webhooks, action.payload] }
    case 'UPDATE_WEBHOOK':
      return {
        ...state,
        webhooks: state.webhooks.map(w => w.id === action.payload.id ? action.payload : w),
        selectedWebhook: state.selectedWebhook?.id === action.payload.id ? action.payload : state.selectedWebhook,
      }
    case 'DELETE_WEBHOOK':
      return {
        ...state,
        webhooks: state.webhooks.filter(w => w.id !== action.payload),
        selectedWebhook: state.selectedWebhook?.id === action.payload ? null : state.selectedWebhook,
      }
    case 'SET_SELECTED_WEBHOOK':
      return { ...state, selectedWebhook: action.payload }
    case 'SET_STATS':
      return { ...state, stats: action.payload }
    case 'ADD_TEST_RESULT':
      return { ...state, testResults: [action.payload, ...state.testResults] }
    default:
      return state
  }
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
  const { environmentId } = useKontent()

  const createWebhook = async (data: WebhookFormData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      
                // TODO: Implement actual API call to Kontent.ai
          const newWebhook: Webhook = {
            id: Date.now().toString(),
            ...data,
            triggers: [],
            environmentId: environmentId || 'default',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deliveryAttempts: 0,
            successfulDeliveries: 0,
            failedDeliveries: 0,
          }
      
      dispatch({ type: 'ADD_WEBHOOK', payload: newWebhook })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create webhook' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const updateWebhook = async (id: string, data: WebhookFormData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      
      // TODO: Implement actual API call to Kontent.ai
      const updatedWebhook: Webhook = {
        ...state.webhooks.find(w => w.id === id)!,
        ...data,
        updatedAt: new Date().toISOString(),
      }
      
      dispatch({ type: 'UPDATE_WEBHOOK', payload: updatedWebhook })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update webhook' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const deleteWebhook = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      
      // TODO: Implement actual API call to Kontent.ai
      dispatch({ type: 'DELETE_WEBHOOK', payload: id })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete webhook' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const testWebhook = async (id: string): Promise<WebhookTestResult> => {
    try {
      const webhook = state.webhooks.find(w => w.id === id)
      if (!webhook) {
        throw new Error('Webhook not found')
      }

      // TODO: Implement actual webhook testing
      // For now, return a placeholder result
      const testResult: WebhookTestResult = {
        success: false,
        statusCode: 0,
        responseTime: 0,
        response: 'Webhook testing not yet implemented',
        timestamp: new Date().toISOString(),
      }

      dispatch({ type: 'ADD_TEST_RESULT', payload: testResult })
      return testResult
    } catch (error) {
      throw error
    }
  }

  const fetchWebhooks = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      
      if (!environmentId) {
        dispatch({ type: 'SET_WEBHOOKS', payload: [] })
        return
      }

      // TODO: Implement actual API call to Kontent.ai using kontentService
      // For now, return empty array - will be populated when API is implemented
      dispatch({ type: 'SET_WEBHOOKS', payload: [] })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch webhooks' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const fetchStats = async () => {
    try {
      // TODO: Implement actual stats calculation
      const stats: WebhookStats = {
        total: state.webhooks.length,
        active: state.webhooks.filter(w => w.isActive).length,
        inactive: state.webhooks.filter(w => !w.isActive).length,
        totalDeliveries: state.webhooks.reduce((sum, w) => sum + w.deliveryAttempts, 0),
        successRate: state.webhooks.length > 0 
          ? state.webhooks.reduce((sum, w) => sum + (w.successfulDeliveries / w.deliveryAttempts), 0) / state.webhooks.length * 100
          : 0,
        averageResponseTime: 250, // Mock value
      }
      
      dispatch({ type: 'SET_STATS', payload: stats })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch stats' })
    }
  }

  const value: WebhookContextType = {
    state,
    dispatch,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
    fetchWebhooks,
    fetchStats,
  }

  return (
    <WebhookContext.Provider value={value}>
      {children}
    </WebhookContext.Provider>
  )
}
