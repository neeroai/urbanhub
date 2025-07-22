import { Request, Response } from 'express';
import { BirdApiService, BirdContact } from '../services/bird-api-service';
import { UrbanHubKnowledgeService } from '../services/knowledge-service';
import { MayaAgentService } from '../services/maya-agent-service';

export interface WebhookEvent {
  event: string;
  timestamp: string;
  data: {
    id: string;
    from?: string;
    to?: string;
    body?: {
      type: string;
      text?: {
        text: string;
      };
      interactive?: {
        button_reply?: {
          id: string;
          title: string;
        };
      };
    };
    channelId?: string;
    conversationId?: string;
    contactId?: string;
    status?: string;
    direction?: 'inbound' | 'outbound';
  };
}

export class UrbanHubWebhookHandler {
  private birdService: BirdApiService;
  private knowledgeService: UrbanHubKnowledgeService;
  private mayaAgent: MayaAgentService;

  constructor(
    birdService: BirdApiService,
    knowledgeService: UrbanHubKnowledgeService,
    mayaAgent: MayaAgentService
  ) {
    this.birdService = birdService;
    this.knowledgeService = knowledgeService;
    this.mayaAgent = mayaAgent;
  }

  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      // Validate webhook signature
      const signature = req.headers['x-bird-signature'] as string;
      const payload = JSON.stringify(req.body);

      if (!this.birdService.validateWebhookSignature(payload, signature)) {
        console.error('❌ Invalid webhook signature');
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const webhookEvent: WebhookEvent = req.body;
      console.log(`📥 Webhook received: ${webhookEvent.event} at ${webhookEvent.timestamp}`);

      // Process the webhook event
      await this.processWebhookEvent(webhookEvent);

      res.status(200).json({ 
        received: true, 
        timestamp: new Date().toISOString(),
        event: webhookEvent.event 
      });

    } catch (error) {
      console.error('❌ Webhook processing error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  private async processWebhookEvent(event: WebhookEvent): Promise<void> {
    const { event: eventType, data } = event;

    switch (eventType) {
      case 'message.received':
        await this.handleIncomingMessage(data);
        break;
      case 'message.delivered':
        await this.handleMessageDelivered(data);
        break;
      case 'message.read':
        await this.handleMessageRead(data);
        break;
      case 'message.failed':
        await this.handleMessageFailed(data);
        break;
      case 'conversation.created':
        await this.handleConversationCreated(data);
        break;
      case 'conversation.updated':
        await this.handleConversationUpdated(data);
        break;
      default:
        console.warn(`⚠️ Unhandled webhook event: ${eventType}`);
    }
  }

  private async handleIncomingMessage(data: any): Promise<void> {
    const { id, from, body, channelId, conversationId } = data;
    
    if (!from || !body) {
      console.warn('⚠️ Invalid message data received');
      return;
    }

    console.log(`📨 Incoming message from ${from}: ${body.text?.text || body.type}`);

    try {
      // Find or create contact
      let contact = await this.birdService.findContactByPhone(from);
      
      if (!contact) {
        console.log(`👤 Creating new contact for ${from}`);
        contact = await this.createNewContact(from);
      }

      // Process message with Maya agent
      const messageText = this.extractMessageText(body);
      const messageContext = {
        messageId: id,
        contactId: contact.id!,
        phone: from,
        text: messageText,
        messageType: body.type,
        conversationId,
        channelId,
        isButtonReply: !!body.interactive?.button_reply
      };

      // Let Maya handle the conversation
      await this.mayaAgent.processIncomingMessage(messageContext);

    } catch (error) {
      console.error('❌ Error processing incoming message:', error);
      
      // Send error acknowledgment to user
      try {
        await this.birdService.sendTextMessage(
          from,
          'Disculpa, tuve un problema técnico. Un momento por favor mientras me reconecto... 🔄',
          conversationId
        );
      } catch (sendError) {
        console.error('❌ Failed to send error acknowledgment:', sendError);
      }
    }
  }

  private async createNewContact(phone: string): Promise<BirdContact> {
    const newContact: BirdContact = {
      identifiers: [
        {
          key: 'phone',
          value: phone,
          type: 'phone'
        }
      ],
      attributes: {
        firstName: 'Prospecto',
        lastName: 'Nuevo',
        leadStatus: 'new',
        leadScore: 0,
        createdBy: 'maya-webhook',
        firstContactDate: new Date().toISOString(),
        propertyInterest: 'unknown',
        timeline: 'unknown',
        budget: 'unknown'
      }
    };

    const contactId = await this.birdService.createContact(newContact);
    return { ...newContact, id: contactId };
  }

  private extractMessageText(body: any): string {
    if (body.text?.text) {
      return body.text.text;
    }
    
    if (body.interactive?.button_reply) {
      return body.interactive.button_reply.title;
    }
    
    if (body.type === 'location') {
      return '[Ubicación compartida]';
    }
    
    if (body.type === 'image') {
      return '[Imagen compartida]';
    }
    
    if (body.type === 'document') {
      return '[Documento compartido]';
    }
    
    return `[${body.type}]`;
  }

  private async handleMessageDelivered(data: any): Promise<void> {
    const { id, to } = data;
    console.log(`✅ Message delivered: ${id} to ${to}`);
    
    // Update message status in database if needed
    // This could trigger follow-up actions based on delivery
  }

  private async handleMessageRead(data: any): Promise<void> {
    const { id, to } = data;
    console.log(`👁️ Message read: ${id} by ${to}`);
    
    // Update message status and potentially trigger follow-up actions
    // Could be used for engagement tracking
  }

  private async handleMessageFailed(data: any): Promise<void> {
    const { id, to, error } = data;
    console.error(`❌ Message failed: ${id} to ${to} - ${error?.message}`);
    
    // Attempt alternative delivery or escalate to human agent
    try {
      await this.attemptMessageRecovery(id, to, error);
    } catch (recoveryError) {
      console.error('❌ Message recovery also failed:', recoveryError);
      // Could trigger human agent notification here
    }
  }

  private async attemptMessageRecovery(messageId: string, to: string, error: any): Promise<void> {
    // Simple recovery strategy: try sending a basic text message
    console.log(`🔄 Attempting message recovery for ${messageId}`);
    
    await this.birdService.sendTextMessage(
      to,
      'Hola, soy Maya de UrbanHub. Tuve un pequeño problema técnico, pero ya estoy aquí para ayudarte. ¿En qué te puedo asistir? 😊'
    );
  }

  private async handleConversationCreated(data: any): Promise<void> {
    const { id, participantIds } = data;
    console.log(`💬 New conversation created: ${id}`);
    
    // Initialize conversation context
    // Could set up initial conversation state or trigger welcome sequence
  }

  private async handleConversationUpdated(data: any): Promise<void> {
    const { id, status, updates } = data;
    console.log(`💬 Conversation updated: ${id} - Status: ${status}`);
    
    // Handle conversation status changes
    // Could trigger different workflows based on status changes
  }

  /**
   * Webhook verification endpoint (for Bird.com setup)
   */
  async verifyWebhook(req: Request, res: Response): Promise<void> {
    const challenge = req.query.challenge as string;
    
    if (challenge) {
      console.log(`✅ Webhook verification successful`);
      res.status(200).send(challenge);
    } else {
      console.error('❌ No challenge parameter provided');
      res.status(400).json({ error: 'No challenge parameter' });
    }
  }

  /**
   * Health check for webhook endpoint
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const birdHealth = await this.birdService.healthCheck();
      const knowledgeHealth = this.knowledgeService.healthCheck();
      
      const overall = birdHealth.healthy && knowledgeHealth.healthy;
      
      res.status(overall ? 200 : 503).json({
        healthy: overall,
        timestamp: new Date().toISOString(),
        services: {
          birdApi: birdHealth,
          knowledgeBase: knowledgeHealth,
          mayaAgent: {
            healthy: true,
            initialized: this.mayaAgent.isInitialized()
          }
        }
      });
    } catch (error) {
      res.status(503).json({
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
}

/**
 * Express middleware for webhook signature validation
 */
export function createWebhookMiddleware(webhookSecret: string) {
  return (req: Request, res: Response, next: Function) => {
    // Store raw body for signature verification
    let rawBody = '';
    req.on('data', (chunk) => {
      rawBody += chunk;
    });
    
    req.on('end', () => {
      (req as any).rawBody = rawBody;
      next();
    });
  };
}

/**
 * Webhook event types that Maya should handle
 */
export const MAYA_WEBHOOK_EVENTS = [
  'message.received',
  'message.delivered', 
  'message.read',
  'message.failed',
  'conversation.created',
  'conversation.updated'
];