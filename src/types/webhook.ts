export interface Webhook {
  id: string
  name: string
  url: string
  triggers: WebhookTrigger[]
  headers: Record<string, string>
  isActive: boolean
  environmentId: string
  createdAt: string
  updatedAt: string
  lastTriggered?: string
  deliveryAttempts: number
  successfulDeliveries: number
  failedDeliveries: number
}

export interface WebhookTrigger {
  id: string
  name: string
  codename: string
  description: string
  isEnabled: boolean
}

export interface WebhookDeliveryLog {
  id: string
  webhookId: string
  timestamp: string
  status: 'success' | 'failed' | 'pending'
  statusCode?: number
  responseTime?: number
  payload: any
  response?: string
  error?: string
}

export interface WebhookTestResult {
  success: boolean
  statusCode: number
  responseTime: number
  response: string
  error?: string
  timestamp: string
}

export interface KontentConfig {
  environmentId: string
  apiKey: string
  projectId: string
}

export interface WebhookFormData {
  name: string
  url: string
  triggers: string[]
  headers: Record<string, string>
  isActive: boolean
}

export interface WebhookStats {
  total: number
  active: number
  inactive: number
  totalDeliveries: number
  successRate: number
  averageResponseTime: number
}
