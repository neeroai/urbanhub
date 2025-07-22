import express from 'express';
import { logger } from '../utils/logger';
import { BirdService } from '../services/bird';
import { hubspotService } from '../services/hubspot';
import { calendarService } from '../services/calendar';
import { queueService } from '../services/queue';

const router = express.Router();
const birdService = new BirdService();

/**
 * Bird.com webhook endpoint
 * Receives real-time events from Bird.com platform
 */
router.post('/bird', async (req, res) => {
  try {
    const signature = req.headers['x-bird-signature'] as string;
    const payload = JSON.stringify(req.body);

    // Validate webhook signature
    if (!BirdService.validateWebhookSignature(
      payload,
      signature,
      process.env.BIRD_WEBHOOK_SECRET!
    )) {
      logger.warn('Invalid Bird webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    logger.info('Received Bird webhook event', {
      type: event.type,
      conversationId: event.conversation?.id,
      contactId: event.contact?.id
    });

    // Process webhook event asynchronously
    await queueService.addWebhookProcessingJob('bird', event);

    res.status(200).json({ status: 'received' });
  } catch (error) {
    logger.error('Error processing Bird webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * HubSpot webhook endpoint
 * Receives real-time events from HubSpot CRM
 */
router.post('/hubspot', async (req, res) => {
  try {
    const event = req.body;
    logger.info('Received HubSpot webhook event', {
      subscriptionType: event.subscriptionType,
      objectId: event.objectId,
      changeSource: event.changeSource
    });

    // Process HubSpot webhook event
    await queueService.addWebhookProcessingJob('hubspot', event);

    res.status(200).json({ status: 'received' });
  } catch (error) {
    logger.error('Error processing HubSpot webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Calendar webhook endpoint
 * Receives events from calendar systems (Calendly, Google, Outlook)
 */
router.post('/calendar', async (req, res) => {
  try {
    const event = req.body;
    const source = req.headers['x-calendar-source'] as string;
    
    logger.info('Received calendar webhook event', {
      source,
      eventType: event.event_type || event.type,
      eventId: event.id || event.event?.id
    });

    // Process calendar webhook event
    await queueService.addWebhookProcessingJob('calendar', {
      source,
      ...event
    });

    res.status(200).json({ status: 'received' });
  } catch (error) {
    logger.error('Error processing calendar webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * WhatsApp webhook verification endpoint
 * Required for WhatsApp Business API setup
 */
router.get('/whatsapp/verify', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    logger.info('WhatsApp webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    logger.warn('WhatsApp webhook verification failed');
    res.status(403).json({ error: 'Verification failed' });
  }
});

/**
 * Generic webhook test endpoint
 * Used for testing webhook connectivity and payload inspection
 */
router.post('/test', (req, res) => {
  logger.info('Test webhook received:', {
    headers: req.headers,
    body: req.body,
    query: req.query
  });

  res.status(200).json({
    message: 'Test webhook received successfully',
    timestamp: new Date().toISOString(),
    headers: req.headers,
    body: req.body
  });
});

/**
 * Webhook processing status endpoint
 * Check the status of webhook processing jobs
 */
router.get('/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const status = await queueService.getJobStatus(jobId);
    
    res.json({
      jobId,
      status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting webhook job status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Manual webhook event processing
 * For testing and debugging webhook events
 */
router.post('/process', async (req, res) => {
  try {
    const { source, event } = req.body;
    
    if (!source || !event) {
      return res.status(400).json({
        error: 'Missing required fields: source, event'
      });
    }

    logger.info('Manually processing webhook event', { source, eventType: event.type });
    
    const job = await queueService.addWebhookProcessingJob(source, event);
    
    res.json({
      message: 'Event queued for processing',
      jobId: job.id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error manually processing webhook event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;