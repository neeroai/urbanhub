/**
 * Webhook Handler Template for UrbanHub AI Agents
 * Template for processing real-time events from Bird.com, HubSpot, and Calendar systems
 */

const crypto = require('crypto');
const { logger } = require('../utils/logger');
const { hubspotService } = require('../services/hubspot');
const { birdService } = require('../services/bird');
const { calendarService } = require('../services/calendar');
const { queueService } = require('../services/queue');

/**
 * Generic Webhook Handler Class Template
 * Customize for specific webhook sources (Bird, HubSpot, Calendar)
 */
class WebhookHandlerTemplate {
  constructor(options = {}) {
    this.serviceName = options.serviceName || 'generic';
    this.secretKey = options.secretKey || process.env.WEBHOOK_SECRET;
    this.timeout = options.timeout || 30000; // 30 seconds
    this.retryAttempts = options.retryAttempts || 3;
    this.enableQueue = options.enableQueue !== false; // default true
  }

  /**
   * Main webhook processing entry point
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async processWebhook(req, res) {
    const startTime = Date.now();
    const webhookId = this.generateWebhookId();
    
    try {
      // Step 1: Validate webhook signature
      if (!this.validateSignature(req)) {
        logger.warn('Invalid webhook signature', {
          service: this.serviceName,
          webhookId,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
        return res.status(401).json({ error: 'Invalid signature' });
      }

      // Step 2: Extract and validate event data
      const eventData = this.extractEventData(req);
      if (!this.validateEventData(eventData)) {
        logger.warn('Invalid event data', {
          service: this.serviceName,
          webhookId,
          eventType: eventData.type
        });
        return res.status(400).json({ error: 'Invalid event data' });
      }

      // Step 3: Log webhook receipt
      logger.info('Webhook received', {
        service: this.serviceName,
        webhookId,
        eventType: eventData.type,
        eventId: eventData.id,
        timestamp: eventData.timestamp
      });

      // Step 4: Process event (async if queue enabled)
      if (this.enableQueue) {
        await this.queueEventProcessing(eventData, webhookId);
        res.status(202).json({ 
          status: 'accepted',
          webhookId,
          message: 'Event queued for processing'
        });
      } else {
        await this.processEventSync(eventData, webhookId);
        res.status(200).json({ 
          status: 'processed',
          webhookId,
          processingTime: Date.now() - startTime
        });
      }

    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error('Webhook processing error', {
        service: this.serviceName,
        webhookId,
        error: error.message,
        stack: error.stack,
        processingTime
      });
      
      res.status(500).json({ 
        error: 'Internal server error',
        webhookId,
        processingTime
      });
    }
  }

  /**
   * Validate webhook signature
   * Override this method for service-specific signature validation
   * @param {Object} req - Express request object
   * @returns {boolean} - Signature validity
   */
  validateSignature(req) {
    const signature = req.headers['x-webhook-signature'] || req.headers['x-signature'];
    const payload = JSON.stringify(req.body);
    
    if (!signature || !this.secretKey) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Extract event data from request
   * Override for service-specific data extraction
   * @param {Object} req - Express request object
   * @returns {Object} - Extracted event data
   */
  extractEventData(req) {
    return {
      id: req.body.id || this.generateWebhookId(),
      type: req.body.type || req.body.eventType,
      timestamp: req.body.timestamp || new Date().toISOString(),
      data: req.body.data || req.body,
      source: this.serviceName,
      rawPayload: req.body
    };
  }

  /**
   * Validate event data structure
   * Override for service-specific validation rules
   * @param {Object} eventData - Extracted event data
   * @returns {boolean} - Data validity
   */
  validateEventData(eventData) {
    return eventData && 
           eventData.type && 
           eventData.timestamp && 
           eventData.data;
  }

  /**
   * Queue event for asynchronous processing
   * @param {Object} eventData - Event data to process
   * @param {string} webhookId - Unique webhook identifier
   */
  async queueEventProcessing(eventData, webhookId) {
    const job = await queueService.addWebhookProcessingJob(
      this.serviceName,
      eventData,
      {
        webhookId,
        priority: this.getEventPriority(eventData),
        attempts: this.retryAttempts,
        backoff: { type: 'exponential', delay: 2000 }
      }
    );
    
    logger.info('Event queued for processing', {
      service: this.serviceName,
      webhookId,
      jobId: job.id,
      eventType: eventData.type
    });
  }

  /**
   * Process event synchronously
   * @param {Object} eventData - Event data to process
   * @param {string} webhookId - Unique webhook identifier
   */
  async processEventSync(eventData, webhookId) {
    const processor = this.getEventProcessor(eventData.type);
    if (!processor) {
      throw new Error(`No processor found for event type: ${eventData.type}`);
    }

    await processor(eventData, webhookId);
  }

  /**
   * Get event processor function based on event type
   * Override this method for service-specific event routing
   * @param {string} eventType - Type of event to process
   * @returns {Function} - Event processor function
   */
  getEventProcessor(eventType) {
    const processors = {
      // Generic event processors - override in subclasses
      'default': this.processDefaultEvent.bind(this),
      'error': this.processErrorEvent.bind(this),
      'test': this.processTestEvent.bind(this)
    };

    return processors[eventType] || processors['default'];
  }

  /**
   * Get event processing priority
   * Override for service-specific priority rules
   * @param {Object} eventData - Event data
   * @returns {string} - Priority level (low, normal, high, critical)
   */
  getEventPriority(eventData) {
    const highPriorityEvents = ['conversation.started', 'booking.created', 'deal.closed'];
    const criticalEvents = ['system.error', 'integration.failure'];
    
    if (criticalEvents.includes(eventData.type)) {
      return 'critical';
    }
    
    if (highPriorityEvents.includes(eventData.type)) {
      return 'high';
    }
    
    return 'normal';
  }

  /**
   * Generate unique webhook identifier
   * @returns {string} - Unique identifier
   */
  generateWebhookId() {
    return `${this.serviceName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Default event processor
   * @param {Object} eventData - Event data
   * @param {string} webhookId - Webhook identifier
   */
  async processDefaultEvent(eventData, webhookId) {
    logger.info('Processing default event', {
      service: this.serviceName,
      webhookId,
      eventType: eventData.type
    });
    
    // Override this method for specific event processing logic
  }

  /**
   * Error event processor
   * @param {Object} eventData - Event data
   * @param {string} webhookId - Webhook identifier
   */
  async processErrorEvent(eventData, webhookId) {
    logger.error('Processing error event', {
      service: this.serviceName,
      webhookId,
      eventType: eventData.type,
      errorData: eventData.data
    });
    
    // Implement error handling logic
    // Send alerts, create tickets, etc.
  }

  /**
   * Test event processor
   * @param {Object} eventData - Event data
   * @param {string} webhookId - Webhook identifier
   */
  async processTestEvent(eventData, webhookId) {
    logger.info('Processing test event', {
      service: this.serviceName,
      webhookId,
      eventType: eventData.type,
      testData: eventData.data
    });
    
    return { status: 'test_processed', webhookId };
  }
}

/**
 * Bird.com Webhook Handler
 * Specific implementation for Bird.com webhook events
 */
class BirdWebhookHandler extends WebhookHandlerTemplate {
  constructor() {
    super({
      serviceName: 'bird',
      secretKey: process.env.BIRD_WEBHOOK_SECRET,
      enableQueue: true
    });
  }

  validateSignature(req) {
    const signature = req.headers['x-bird-signature'];
    const payload = JSON.stringify(req.body);
    
    if (!signature || !this.secretKey) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  extractEventData(req) {
    const body = req.body;
    return {
      id: body.id,
      type: body.type,
      timestamp: body.timestamp,
      conversation: body.conversation,
      contact: body.contact,
      message: body.message,
      agent: body.agent,
      source: 'bird',
      rawPayload: body
    };
  }

  getEventProcessor(eventType) {
    const processors = {
      'conversation.started': this.processConversationStarted.bind(this),
      'message.received': this.processMessageReceived.bind(this),
      'conversation.ended': this.processConversationEnded.bind(this),
      'agent.escalation_triggered': this.processEscalationTriggered.bind(this)
    };

    return processors[eventType] || super.getEventProcessor(eventType);
  }

  async processConversationStarted(eventData, webhookId) {
    logger.info('Processing conversation started', {
      webhookId,
      conversationId: eventData.conversation?.id,
      contactId: eventData.contact?.id
    });

    // Sync contact to HubSpot
    if (eventData.contact) {
      await hubspotService.syncContactFromBird(eventData.contact);
    }
  }

  async processMessageReceived(eventData, webhookId) {
    logger.info('Processing message received', {
      webhookId,
      conversationId: eventData.conversation?.id,
      messageDirection: eventData.message?.direction
    });

    // Log activity in HubSpot
    if (eventData.contact && eventData.message) {
      await hubspotService.logActivity({
        contactId: eventData.contact.hubspot_id,
        activityType: 'ai_conversation',
        content: eventData.message.content?.text || 'Message received',
        timestamp: eventData.timestamp,
        conversationId: eventData.conversation?.id,
        aiAgent: eventData.agent?.name
      });
    }
  }

  async processConversationEnded(eventData, webhookId) {
    logger.info('Processing conversation ended', {
      webhookId,
      conversationId: eventData.conversation?.id,
      outcome: eventData.conversation?.outcome
    });

    // Update deal stage based on conversation outcome
    // Implementation depends on business logic
  }

  async processEscalationTriggered(eventData, webhookId) {
    logger.info('Processing escalation triggered', {
      webhookId,
      conversationId: eventData.conversation?.id,
      escalationReason: eventData.escalation?.reason
    });

    // Notify human agents
    // Create urgency flags in HubSpot
    // Send alerts to operations team
  }
}

/**
 * HubSpot Webhook Handler
 * Specific implementation for HubSpot CRM webhook events
 */
class HubSpotWebhookHandler extends WebhookHandlerTemplate {
  constructor() {
    super({
      serviceName: 'hubspot',
      secretKey: process.env.HUBSPOT_WEBHOOK_SECRET,
      enableQueue: true
    });
  }

  validateSignature(req) {
    const signature = req.headers['x-hubspot-signature'];
    const payload = req.body;
    
    // HubSpot signature validation logic
    // Implementation depends on HubSpot's specific requirements
    return true; // Simplified for template
  }

  getEventProcessor(eventType) {
    const processors = {
      'contact.propertyChange': this.processContactPropertyChange.bind(this),
      'deal.propertyChange': this.processDealPropertyChange.bind(this),
      'contact.creation': this.processContactCreation.bind(this)
    };

    return processors[eventType] || super.getEventProcessor(eventType);
  }

  async processContactPropertyChange(eventData, webhookId) {
    logger.info('Processing contact property change', {
      webhookId,
      objectId: eventData.objectId,
      propertyName: eventData.propertyName
    });

    // Sync changes back to Bird.com if needed
    // Update AI agent context with new information
  }

  async processDealPropertyChange(eventData, webhookId) {
    logger.info('Processing deal property change', {
      webhookId,
      objectId: eventData.objectId,
      propertyName: eventData.propertyName
    });

    // Trigger appropriate AI agent actions based on deal changes
  }

  async processContactCreation(eventData, webhookId) {
    logger.info('Processing contact creation', {
      webhookId,
      objectId: eventData.objectId
    });

    // Initialize AI agent engagement for new contacts
  }
}

/**
 * Calendar Webhook Handler
 * Handles events from Calendly, Google Calendar, and Outlook
 */
class CalendarWebhookHandler extends WebhookHandlerTemplate {
  constructor() {
    super({
      serviceName: 'calendar',
      secretKey: process.env.CALENDAR_WEBHOOK_SECRET,
      enableQueue: true
    });
  }

  extractEventData(req) {
    const source = req.headers['x-calendar-source'] || 'unknown';
    const body = req.body;
    
    return {
      id: body.id || body.event?.id,
      type: body.event_type || body.type,
      timestamp: body.timestamp || body.created_at,
      source: source,
      eventData: body.event || body.data,
      rawPayload: body
    };
  }

  getEventProcessor(eventType) {
    const processors = {
      'booking.created': this.processBookingCreated.bind(this),
      'booking.cancelled': this.processBookingCancelled.bind(this),
      'booking.rescheduled': this.processBookingRescheduled.bind(this),
      'booking.completed': this.processBookingCompleted.bind(this)
    };

    return processors[eventType] || super.getEventProcessor(eventType);
  }

  async processBookingCreated(eventData, webhookId) {
    logger.info('Processing booking created', {
      webhookId,
      bookingId: eventData.eventData?.id,
      contactEmail: eventData.eventData?.invitee?.email
    });

    // Update HubSpot with tour scheduled
    // Notify AI agents about successful booking
    // Send confirmation messages via Bird.com
  }

  async processBookingCancelled(eventData, webhookId) {
    logger.info('Processing booking cancelled', {
      webhookId,
      bookingId: eventData.eventData?.id
    });

    // Update deal stage in HubSpot
    // Trigger follow-up AI agent sequence
  }

  async processBookingCompleted(eventData, webhookId) {
    logger.info('Processing booking completed', {
      webhookId,
      bookingId: eventData.eventData?.id
    });

    // Trigger post-tour AI agent follow-up
    // Update deal stage to 'tour completed'
    // Start conversion optimization sequence
  }
}

// Export handlers
module.exports = {
  WebhookHandlerTemplate,
  BirdWebhookHandler,
  HubSpotWebhookHandler,
  CalendarWebhookHandler
};

/**
 * Usage Example:
 * 
 * const { BirdWebhookHandler } = require('./webhook-handler-tmpl');
 * const birdHandler = new BirdWebhookHandler();
 * 
 * app.post('/webhooks/bird', (req, res) => {
 *   birdHandler.processWebhook(req, res);
 * });
 */