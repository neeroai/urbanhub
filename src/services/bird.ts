import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { logger } from '../utils/logger';
import { ConversationEvent, AgentConfig, MessagePayload } from '../types/bird';

export class BirdService {
  private client: AxiosInstance;
  private workspaceId: string;
  private apiKey: string;

  constructor() {
    this.workspaceId = process.env.BIRD_WORKSPACE_ID!;
    this.apiKey = process.env.BIRD_API_KEY!;

    this.client = axios.create({
      baseURL: `https://api.bird.com/workspaces/${this.workspaceId}`,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`Bird API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('Bird API Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`Bird API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error('Bird API Response Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Send a message through Bird.com platform
   */
  async sendMessage(payload: MessagePayload): Promise<any> {
    try {
      const response = await this.client.post('/messages', payload);
      logger.info(`Message sent successfully to ${payload.to}`, {
        messageId: response.data.id,
        channel: payload.channel
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to send message:', error);
      throw new Error(`Failed to send message: ${error}`);
    }
  }

  /**
   * Send WhatsApp message using template
   */
  async sendWhatsAppTemplate(
    to: string,
    templateName: string,
    parameters: string[] = [],
    language: string = 'es_MX'
  ): Promise<any> {
    const payload: MessagePayload = {
      to,
      channel: 'whatsapp',
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: language
        },
        components: [
          {
            type: 'body',
            parameters: parameters.map(param => ({ type: 'text', text: param }))
          }
        ]
      }
    };

    return this.sendMessage(payload);
  }

  /**
   * Send simple WhatsApp text message
   */
  async sendWhatsAppText(to: string, text: string): Promise<any> {
    const payload: MessagePayload = {
      to,
      channel: 'whatsapp',
      type: 'text',
      text: {
        body: text
      }
    };

    return this.sendMessage(payload);
  }

  /**
   * Send SMS message
   */
  async sendSMS(to: string, text: string): Promise<any> {
    const payload: MessagePayload = {
      to,
      channel: 'sms',
      type: 'text',
      text: {
        body: text
      }
    };

    return this.sendMessage(payload);
  }

  /**
   * Get conversation details
   */
  async getConversation(conversationId: string): Promise<any> {
    try {
      const response = await this.client.get(`/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get conversation:', error);
      throw new Error(`Failed to get conversation: ${error}`);
    }
  }

  /**
   * Get contact details
   */
  async getContact(contactId: string): Promise<any> {
    try {
      const response = await this.client.get(`/contacts/${contactId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get contact:', error);
      throw new Error(`Failed to get contact: ${error}`);
    }
  }

  /**
   * Create or update contact
   */
  async upsertContact(contactData: any): Promise<any> {
    try {
      const response = await this.client.post('/contacts', contactData);
      logger.info('Contact upserted successfully', { contactId: response.data.id });
      return response.data;
    } catch (error) {
      logger.error('Failed to upsert contact:', error);
      throw new Error(`Failed to upsert contact: ${error}`);
    }
  }

  /**
   * Deploy AI agent configuration
   */
  async deployAgent(agentConfig: AgentConfig): Promise<any> {
    try {
      const response = await this.client.post('/agents', agentConfig);
      logger.info(`Agent deployed successfully: ${agentConfig.name}`, {
        agentId: response.data.id
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to deploy agent:', error);
      throw new Error(`Failed to deploy agent: ${error}`);
    }
  }

  /**
   * Update AI agent configuration
   */
  async updateAgent(agentId: string, agentConfig: Partial<AgentConfig>): Promise<any> {
    try {
      const response = await this.client.patch(`/agents/${agentId}`, agentConfig);
      logger.info(`Agent updated successfully: ${agentId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to update agent:', error);
      throw new Error(`Failed to update agent: ${error}`);
    }
  }

  /**
   * Get agent performance metrics
   */
  async getAgentMetrics(agentId: string, timeframe: string = '24h'): Promise<any> {
    try {
      const response = await this.client.get(`/agents/${agentId}/metrics`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to get agent metrics:', error);
      throw new Error(`Failed to get agent metrics: ${error}`);
    }
  }

  /**
   * Escalate conversation to human agent
   */
  async escalateConversation(
    conversationId: string,
    reason: string,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<any> {
    try {
      const response = await this.client.post(`/conversations/${conversationId}/escalate`, {
        reason,
        priority,
        timestamp: new Date().toISOString()
      });
      logger.info(`Conversation escalated: ${conversationId}`, { reason, priority });
      return response.data;
    } catch (error) {
      logger.error('Failed to escalate conversation:', error);
      throw new Error(`Failed to escalate conversation: ${error}`);
    }
  }

  /**
   * Validate webhook signature
   */
  static validateWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Process incoming webhook event
   */
  async processWebhookEvent(event: ConversationEvent): Promise<void> {
    try {
      logger.info('Processing Bird webhook event', {
        eventType: event.type,
        conversationId: event.conversation?.id,
        contactId: event.contact?.id
      });

      switch (event.type) {
        case 'conversation.started':
          await this.handleConversationStarted(event);
          break;
        case 'message.received':
          await this.handleMessageReceived(event);
          break;
        case 'conversation.ended':
          await this.handleConversationEnded(event);
          break;
        case 'agent.escalation_triggered':
          await this.handleEscalationTriggered(event);
          break;
        default:
          logger.warn('Unknown webhook event type:', event.type);
      }
    } catch (error) {
      logger.error('Failed to process webhook event:', error);
      throw error;
    }
  }

  private async handleConversationStarted(event: ConversationEvent): Promise<void> {
    // Implementation for conversation started event
    logger.info('Handling conversation started event');
    // Add custom logic here
  }

  private async handleMessageReceived(event: ConversationEvent): Promise<void> {
    // Implementation for message received event
    logger.info('Handling message received event');
    // Add custom logic here
  }

  private async handleConversationEnded(event: ConversationEvent): Promise<void> {
    // Implementation for conversation ended event
    logger.info('Handling conversation ended event');
    // Add custom logic here
  }

  private async handleEscalationTriggered(event: ConversationEvent): Promise<void> {
    // Implementation for escalation triggered event
    logger.info('Handling escalation triggered event');
    // Add custom logic here
  }
}

export const birdService = new BirdService();