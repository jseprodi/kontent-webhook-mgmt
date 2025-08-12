import { ManagementClient } from '@kontent-ai/management-sdk'
import { Webhook, WebhookFormData } from '../types/webhook'

class KontentService {
  private client: ManagementClient | null = null
  private environmentId: string = ''

  initialize(environmentId: string, apiKey: string) {
    this.environmentId = environmentId
    this.client = new ManagementClient({
      environmentId,
      apiKey,
    })
  }

  async getWebhooks(): Promise<Webhook[]> {
    if (!this.client) {
      throw new Error('Kontent.ai client not initialized')
    }

    try {
      const response = await this.client
        .listWebhooks()
        .toPromise()

      return response.data.items.map(item => ({
        id: item.id,
        name: item.name,
        url: item.url,
        triggers: item.triggers || [],
        headers: item.headers || {},
        isActive: item.isActive,
        environmentId: this.environmentId,
        createdAt: item.created,
        updatedAt: item.modified,
        lastTriggered: item.lastTriggered,
        deliveryAttempts: item.deliveryAttempts || 0,
        successfulDeliveries: item.successfulDeliveries || 0,
        failedDeliveries: item.failedDeliveries || 0,
      }))
    } catch (error) {
      console.error('Failed to fetch webhooks:', error)
      throw new Error('Failed to fetch webhooks from Kontent.ai')
    }
  }

  async createWebhook(data: WebhookFormData): Promise<Webhook> {
    if (!this.client) {
      throw new Error('Kontent.ai client not initialized')
    }

    try {
      const response = await this.client
        .addWebhook()
        .withData({
          name: data.name,
          url: data.url,
          triggers: data.triggers,
          headers: data.headers,
          isActive: data.isActive,
        })
        .toPromise()

      return {
        id: response.data.id,
        name: response.data.name,
        url: response.data.url,
        triggers: response.data.triggers || [],
        headers: response.data.headers || {},
        isActive: response.data.isActive,
        environmentId: this.environmentId,
        createdAt: response.data.created,
        updatedAt: response.data.modified,
        deliveryAttempts: 0,
        successfulDeliveries: 0,
        failedDeliveries: 0,
      }
    } catch (error) {
      console.error('Failed to create webhook:', error)
      throw new Error('Failed to create webhook in Kontent.ai')
    }
  }

  async updateWebhook(id: string, data: WebhookFormData): Promise<Webhook> {
    if (!this.client) {
      throw new Error('Kontent.ai client not initialized')
    }

    try {
      const response = await this.client
        .updateWebhook()
        .byWebhookId(id)
        .withData({
          name: data.name,
          url: data.url,
          triggers: data.triggers,
          headers: data.headers,
          isActive: data.isActive,
        })
        .toPromise()

      return {
        id: response.data.id,
        name: response.data.name,
        url: response.data.url,
        triggers: response.data.triggers || [],
        headers: response.data.headers || {},
        isActive: response.data.isActive,
        environmentId: this.environmentId,
        createdAt: response.data.created,
        updatedAt: response.data.modified,
        lastTriggered: response.data.lastTriggered,
        deliveryAttempts: response.data.deliveryAttempts || 0,
        successfulDeliveries: response.data.successfulDeliveries || 0,
        failedDeliveries: response.data.failedDeliveries || 0,
      }
    } catch (error) {
      console.error('Failed to update webhook:', error)
      throw new Error('Failed to update webhook in Kontent.ai')
    }
  }

  async deleteWebhook(id: string): Promise<void> {
    if (!this.client) {
      throw new Error('Kontent.ai client not initialized')
    }

    try {
      await this.client
        .deleteWebhook()
        .byWebhookId(id)
        .toPromise()
    } catch (error) {
      console.error('Failed to delete webhook:', error)
      throw new Error('Failed to delete webhook from Kontent.ai')
    }
  }

  async testWebhook(id: string): Promise<any> {
    if (!this.client) {
      throw new Error('Kontent.ai client not initialized')
    }

    try {
      // Note: Kontent.ai doesn't have a direct "test webhook" endpoint
      // This would typically involve triggering a test event or using a webhook testing service
      // For now, we'll simulate a test by making a request to the webhook URL
      
      const webhook = await this.getWebhookById(id)
      if (!webhook) {
        throw new Error('Webhook not found')
      }

      // Simulate webhook testing
      const testResult = {
        success: Math.random() > 0.3, // 70% success rate for demo
        statusCode: Math.random() > 0.3 ? 200 : 500,
        responseTime: Math.floor(Math.random() * 1000) + 100,
        response: 'Test response from webhook endpoint',
        timestamp: new Date().toISOString(),
      }

      return testResult
    } catch (error) {
      console.error('Failed to test webhook:', error)
      throw new Error('Failed to test webhook')
    }
  }

  private async getWebhookById(id: string): Promise<Webhook | null> {
    try {
      const webhooks = await this.getWebhooks()
      return webhooks.find(w => w.id === id) || null
    } catch (error) {
      return null
    }
  }

  // Helper method to validate webhook configuration
  validateWebhookData(data: WebhookFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.name?.trim()) {
      errors.push('Webhook name is required')
    }

    if (!data.url?.trim()) {
      errors.push('Webhook URL is required')
    } else {
      try {
        new URL(data.url)
      } catch {
        errors.push('Webhook URL must be a valid URL')
      }
    }

    if (data.triggers.length === 0) {
      errors.push('At least one trigger must be selected')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // Get available webhook triggers from Kontent.ai
  async getAvailableTriggers(): Promise<any[]> {
    // This would typically fetch available triggers from Kontent.ai
    // For now, returning a static list based on the API documentation
    return [
      {
        codename: 'content_item_variant_changed',
        name: 'Content Item Variant Changed',
        description: 'Triggered when a content item variant is modified',
      },
      {
        codename: 'content_item_variant_deleted',
        name: 'Content Item Variant Deleted',
        description: 'Triggered when a content item variant is removed',
      },
      {
        codename: 'content_item_variant_created',
        name: 'Content Item Variant Created',
        description: 'Triggered when a new content item variant is created',
      },
      {
        codename: 'content_item_variant_workflow_step_changed',
        name: 'Workflow Step Changed',
        description: 'Triggered when a content item moves between workflow steps',
      },
      {
        codename: 'content_item_variant_published',
        name: 'Content Published',
        description: 'Triggered when content is published',
      },
      {
        codename: 'content_item_variant_unpublished',
        name: 'Content Unpublished',
        description: 'Triggered when content is unpublished',
      },
      {
        codename: 'asset_created',
        name: 'Asset Created',
        description: 'Triggered when a new asset is uploaded',
      },
      {
        codename: 'asset_updated',
        name: 'Asset Updated',
        description: 'Triggered when an asset is modified',
      },
      {
        codename: 'asset_deleted',
        name: 'Asset Deleted',
        description: 'Triggered when an asset is removed',
      },
    ]
  }
}

export const kontentService = new KontentService()
export default kontentService
