import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import crypto from 'crypto';

export interface BirdConfig {
  apiKey: string;
  workspaceId: string;
  baseUrl: string;
  webhookSecret: string;
  whatsappChannelId: string;
}

export interface BirdContact {
  id?: string;
  identifiers: Array<{
    key: string;
    value: string;
    type: 'phone' | 'email';
  }>;
  attributes: {
    firstName?: string;
    lastName?: string;
    email?: string;
    propertyInterest?: string;
    budget?: string;
    timeline?: string;
    leadScore?: number;
    leadStatus?: string;
    [key: string]: any;
  };
}

export interface BirdMessage {
  id?: string;
  channelId: string;
  to: string;
  body: {
    type: 'text' | 'template' | 'interactive';
    text?: {
      text: string;
    };
    template?: {
      name: string;
      language: {
        code: string;
      };
      components: Array<{
        type: string;
        parameters?: Array<{
          type: string;
          text: string;
        }>;
      }>;
    };
    interactive?: {
      type: 'button' | 'list';
      header?: {
        type: 'text';
        text: string;
      };
      body: {
        text: string;
      };
      footer?: {
        text: string;
      };
      action: {
        buttons?: Array<{
          type: 'reply';
          reply: {
            id: string;
            title: string;
          };
        }>;
      };
    };
  };
  conversationId?: string;
}

export class BirdApiService {
  private client: AxiosInstance;
  private config: BirdConfig;

  constructor(config: BirdConfig) {
    this.config = config;
    this.client = this.createClient();
  }

  private createClient(): AxiosInstance {
    const client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 30000,
      headers: {
        'Authorization': `AccessKey ${this.config.apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor for logging
    client.interceptors.request.use(
      (config) => {
        console.log(`🔄 Bird API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    client.interceptors.response.use(
      (response) => {
        console.log(`✅ Bird API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ Bird API Error:', error.response?.data || error.message);
        
        // Handle rate limiting
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          console.log(`🔄 Rate limited. Retry after: ${retryAfter}s`);
        }
        
        return Promise.reject(error);
      }
    );

    return client;
  }

  /**
   * Contact Management
   */
  async createContact(contact: BirdContact): Promise<string> {
    try {
      const response = await this.client.post('/contacts', contact);
      console.log(`✅ Contact created: ${response.data.id}`);
      return response.data.id;
    } catch (error) {
      console.error('❌ Failed to create contact:', error);
      throw error;
    }
  }

  async updateContact(contactId: string, updates: Partial<BirdContact>): Promise<void> {
    try {
      await this.client.put(`/contacts/${contactId}`, updates);
      console.log(`✅ Contact updated: ${contactId}`);
    } catch (error) {
      console.error(`❌ Failed to update contact ${contactId}:`, error);
      throw error;
    }
  }

  async findContactByPhone(phone: string): Promise<BirdContact | null> {
    try {
      const response = await this.client.get('/contacts', {
        params: { 
          identifier: phone,
          identifierType: 'phone'
        }
      });

      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0];
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to find contact by phone:', error);
      return null;
    }
  }

  /**
   * Messaging
   */
  async sendMessage(message: BirdMessage): Promise<string> {
    try {
      const response = await this.client.post('/channels/messages', message);
      console.log(`✅ Message sent: ${response.data.id} to ${message.to}`);
      return response.data.id;
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      throw error;
    }
  }

  async sendTextMessage(to: string, text: string, conversationId?: string): Promise<string> {
    const message: BirdMessage = {
      channelId: this.config.whatsappChannelId,
      to,
      body: {
        type: 'text',
        text: { text }
      },
      conversationId
    };

    return this.sendMessage(message);
  }

  async sendTemplateMessage(
    to: string, 
    templateName: string, 
    parameters: Array<{ type: string; text: string }>,
    conversationId?: string
  ): Promise<string> {
    const message: BirdMessage = {
      channelId: this.config.whatsappChannelId,
      to,
      body: {
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'es_MX' },
          components: [
            {
              type: 'body',
              parameters
            }
          ]
        }
      },
      conversationId
    };

    return this.sendMessage(message);
  }

  async sendInteractiveMessage(
    to: string,
    headerText: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>,
    conversationId?: string
  ): Promise<string> {
    const message: BirdMessage = {
      channelId: this.config.whatsappChannelId,
      to,
      body: {
        type: 'interactive',
        interactive: {
          type: 'button',
          header: {
            type: 'text',
            text: headerText
          },
          body: {
            text: bodyText
          },
          footer: {
            text: 'UrbanHub - Vivir mejor es posible'
          },
          action: {
            buttons: buttons.map(button => ({
              type: 'reply',
              reply: {
                id: button.id,
                title: button.title
              }
            }))
          }
        }
      },
      conversationId
    };

    return this.sendMessage(message);
  }

  /**
   * UrbanHub Specific Templates
   */
  async sendWelcomeMessage(
    to: string, 
    customerName: string, 
    propertyName: string,
    conversationId?: string
  ): Promise<string> {
    return this.sendTemplateMessage(
      to,
      'urbanhub_welcome',
      [
        { type: 'text', text: customerName },
        { type: 'text', text: propertyName }
      ],
      conversationId
    );
  }

  async sendTourConfirmation(
    to: string,
    customerName: string,
    date: string,
    time: string,
    propertyName: string,
    address: string,
    conversationId?: string
  ): Promise<string> {
    return this.sendTemplateMessage(
      to,
      'urbanhub_tour_confirmation',
      [
        { type: 'text', text: customerName },
        { type: 'text', text: date },
        { type: 'text', text: time },
        { type: 'text', text: propertyName },
        { type: 'text', text: address }
      ],
      conversationId
    );
  }

  async sendFollowUpMessage(
    to: string,
    customerName: string,
    propertyName: string,
    feature1: string,
    feature2: string,
    feature3: string,
    conversationId?: string
  ): Promise<string> {
    return this.sendTemplateMessage(
      to,
      'urbanhub_followup_warm',
      [
        { type: 'text', text: customerName },
        { type: 'text', text: propertyName },
        { type: 'text', text: feature1 },
        { type: 'text', text: feature2 },
        { type: 'text', text: feature3 }
      ],
      conversationId
    );
  }

  async sendHandoffMessage(
    to: string,
    customerName: string,
    specialistName: string,
    specialistRole: string,
    conversationId?: string
  ): Promise<string> {
    return this.sendTemplateMessage(
      to,
      'urbanhub_handoff',
      [
        { type: 'text', text: customerName },
        { type: 'text', text: specialistName },
        { type: 'text', text: specialistRole }
      ],
      conversationId
    );
  }

  /**
   * Conversation Management
   */
  async createConversation(
    contactId: string,
    channelId: string,
    metadata?: any
  ): Promise<string> {
    try {
      const conversationData = {
        participants: [
          {
            id: contactId,
            type: 'contact',
            contactId
          }
        ],
        channels: [
          {
            channelId,
            channelType: 'whatsapp',
            isActive: true,
            lastActivityAt: new Date().toISOString()
          }
        ],
        status: 'active',
        metadata: {
          ...metadata,
          createdBy: 'maya-agent',
          propertyInterest: metadata?.propertyInterest || 'unknown'
        }
      };

      const response = await this.client.post('/conversations', conversationData);
      console.log(`✅ Conversation created: ${response.data.id}`);
      return response.data.id;
    } catch (error) {
      console.error('❌ Failed to create conversation:', error);
      throw error;
    }
  }

  async updateConversation(conversationId: string, updates: any): Promise<void> {
    try {
      await this.client.put(`/conversations/${conversationId}`, updates);
      console.log(`✅ Conversation updated: ${conversationId}`);
    } catch (error) {
      console.error(`❌ Failed to update conversation ${conversationId}:`, error);
      throw error;
    }
  }

  /**
   * Webhook Management
   */
  async createWebhookSubscription(
    url: string, 
    events: string[]
  ): Promise<string> {
    try {
      const subscriptionData = {
        name: 'UrbanHub Maya Agent Webhook',
        url,
        events: events.map(event => ({
          service: event.split('.')[0],
          type: event
        })),
        retryPolicy: {
          maxAttempts: 3,
          backoffType: 'exponential',
          initialDelay: 1000,
          maxDelay: 10000
        }
      };

      const response = await this.client.post('/webhooks/subscriptions', subscriptionData);
      console.log(`✅ Webhook subscription created: ${response.data.id}`);
      return response.data.id;
    } catch (error) {
      console.error('❌ Failed to create webhook subscription:', error);
      throw error;
    }
  }

  /**
   * Webhook Signature Validation
   */
  validateWebhookSignature(payload: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.config.webhookSecret)
        .update(payload)
        .digest('hex');

      const expectedSig = `sha256=${expectedSignature}`;
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSig)
      );
    } catch (error) {
      console.error('❌ Webhook signature validation error:', error);
      return false;
    }
  }

  /**
   * Rate Limiting Helper
   */
  async withRateLimit<T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        return await operation();
      } catch (error: any) {
        if (error.response?.status === 429 && retries < maxRetries - 1) {
          const retryAfter = parseInt(error.response.headers['retry-after']) || 1;
          console.log(`🔄 Rate limited. Waiting ${retryAfter}s before retry ${retries + 1}/${maxRetries}`);
          
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          retries++;
        } else {
          throw error;
        }
      }
    }
    
    throw new Error(`Max retries (${maxRetries}) exceeded`);
  }

  /**
   * Health Check
   */
  async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    try {
      // Test API connectivity
      const response = await this.client.get('/workspaces/current');
      
      return {
        healthy: true,
        details: {
          workspace: response.data.name,
          apiConnectivity: true,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        healthy: false,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          apiConnectivity: false,
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}