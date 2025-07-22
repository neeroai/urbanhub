# Bird.com Webhooks API

## Overview

The Bird.com Webhooks API enables real-time event notifications for the DRAD medical practice management system. Webhooks provide instant updates on message delivery, patient interactions, and system events, allowing for immediate response to critical medical situations and automated workflow triggers.

## Webhook Fundamentals

### What Are Webhooks?

Webhooks are HTTP callbacks that Bird.com sends to your application when specific events occur. Instead of polling the API for changes, your application receives immediate notifications when events happen.

### Key Benefits for Medical Practice

- **Real-time Response**: Immediate notification of patient messages
- **Automation**: Trigger workflows based on message events
- **Compliance**: Audit trail for all patient communications
- **Emergency Handling**: Instant alerts for urgent messages
- **Status Tracking**: Real-time message delivery confirmation

## Webhook Configuration

### Creating Webhook Subscriptions

```typescript
// Webhook subscription configuration
interface WebhookSubscription {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  filters: WebhookFilter[];
  status: 'active' | 'inactive';
  retryPolicy: RetryPolicy;
  signatureSecret: string;
  createdAt: string;
  updatedAt: string;
}

interface WebhookEvent {
  service: 'channels' | 'contacts' | 'conversations';
  type: string;
}

interface WebhookFilter {
  attribute: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with';
  value: string;
}

interface RetryPolicy {
  maxAttempts: number;
  backoffType: 'exponential' | 'linear';
  initialDelay: number;
  maxDelay: number;
}

// Create webhook subscription for medical events
async function createMedicalWebhookSubscription(): Promise<WebhookSubscription> {
  const subscription = {
    name: 'DRAD Medical Practice Webhook',
    url: 'https://drad-api.com/webhooks/bird',
    events: [
      // Message events
      { service: 'channels', type: 'message.sent' },
      { service: 'channels', type: 'message.delivered' },
      { service: 'channels', type: 'message.read' },
      { service: 'channels', type: 'message.failed' },
      { service: 'channels', type: 'message.received' },
      
      // Contact events
      { service: 'contacts', type: 'contact.created' },
      { service: 'contacts', type: 'contact.updated' },
      
      // Conversation events
      { service: 'conversations', type: 'conversation.created' },
      { service: 'conversations', type: 'conversation.updated' },
      { service: 'conversations', type: 'conversation.resolved' }
    ],
    filters: [
      {
        attribute: 'channel_type',
        operator: 'equals',
        value: 'whatsapp'
      }
    ],
    retryPolicy: {
      maxAttempts: 5,
      backoffType: 'exponential',
      initialDelay: 1000,
      maxDelay: 30000
    }
  };

  const response = await birdApiClient.post('/webhooks/subscriptions', subscription);
  return response.data;
}
```

### Webhook Security

```typescript
// Webhook signature verification
import crypto from 'crypto';

class WebhookSecurityManager {
  private readonly secret: string;
  
  constructor(secret: string) {
    this.secret = secret;
  }

  // Verify webhook signature
  verifySignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.secret)
      .update(payload)
      .digest('hex');
    
    return signature === `sha256=${expectedSignature}`;
  }

  // Validate webhook request
  validateRequest(req: any): boolean {
    const signature = req.headers['x-bird-signature'];
    const payload = JSON.stringify(req.body);
    
    if (!signature) {
      console.error('Missing webhook signature');
      return false;
    }
    
    if (!this.verifySignature(payload, signature)) {
      console.error('Invalid webhook signature');
      return false;
    }
    
    return true;
  }
}
```

## Webhook Event Types

### Message Events

```typescript
// Message event types
enum MessageEventType {
  MESSAGE_SENT = 'message.sent',
  MESSAGE_DELIVERED = 'message.delivered',
  MESSAGE_READ = 'message.read',
  MESSAGE_FAILED = 'message.failed',
  MESSAGE_RECEIVED = 'message.received'
}

// Message event payload
interface MessageWebhookPayload {
  event: MessageEventType;
  timestamp: string;
  data: {
    id: string;
    channelId: string;
    conversationId?: string;
    from: string;
    to: string;
    body: MessageBody;
    status: MessageStatus;
    timestamp: string;
    metadata?: Record<string, any>;
  };
}

// Handle message events
async function handleMessageEvent(payload: MessageWebhookPayload): Promise<void> {
  const { event, data } = payload;
  
  switch (event) {
    case MessageEventType.MESSAGE_RECEIVED:
      await handleIncomingMessage(data);
      break;
    case MessageEventType.MESSAGE_DELIVERED:
      await handleMessageDelivered(data);
      break;
    case MessageEventType.MESSAGE_FAILED:
      await handleMessageFailed(data);
      break;
    case MessageEventType.MESSAGE_READ:
      await handleMessageRead(data);
      break;
  }
}
```

### Contact Events

```typescript
// Contact event types
enum ContactEventType {
  CONTACT_CREATED = 'contact.created',
  CONTACT_UPDATED = 'contact.updated',
  CONTACT_DELETED = 'contact.deleted'
}

// Contact event payload
interface ContactWebhookPayload {
  event: ContactEventType;
  timestamp: string;
  data: {
    id: string;
    identifiers: ContactIdentifier[];
    attributes: Record<string, any>;
    lists: string[];
    createdAt: string;
    updatedAt: string;
  };
}

// Handle contact events
async function handleContactEvent(payload: ContactWebhookPayload): Promise<void> {
  const { event, data } = payload;
  
  switch (event) {
    case ContactEventType.CONTACT_CREATED:
      await handleNewPatientContact(data);
      break;
    case ContactEventType.CONTACT_UPDATED:
      await handlePatientContactUpdate(data);
      break;
    case ContactEventType.CONTACT_DELETED:
      await handlePatientContactDeletion(data);
      break;
  }
}
```

### Conversation Events

```typescript
// Conversation event types
enum ConversationEventType {
  CONVERSATION_CREATED = 'conversation.created',
  CONVERSATION_UPDATED = 'conversation.updated',
  CONVERSATION_RESOLVED = 'conversation.resolved',
  CONVERSATION_CLOSED = 'conversation.closed'
}

// Conversation event payload
interface ConversationWebhookPayload {
  event: ConversationEventType;
  timestamp: string;
  data: {
    id: string;
    participants: Participant[];
    status: ConversationStatus;
    assignedAgent?: Agent;
    metadata: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    lastMessageAt: string;
  };
}

// Handle conversation events
async function handleConversationEvent(payload: ConversationWebhookPayload): Promise<void> {
  const { event, data } = payload;
  
  switch (event) {
    case ConversationEventType.CONVERSATION_CREATED:
      await handleNewConversation(data);
      break;
    case ConversationEventType.CONVERSATION_UPDATED:
      await handleConversationUpdate(data);
      break;
    case ConversationEventType.CONVERSATION_RESOLVED:
      await handleConversationResolved(data);
      break;
  }
}
```

## Medical Practice Event Handlers

### Incoming Message Handler

```typescript
// Handle incoming patient messages
async function handleIncomingMessage(messageData: any): Promise<void> {
  const { from, body, conversationId, channelId } = messageData;
  
  // Get or create patient contact
  const patientContact = await findContactByPhone(from) || 
                        await createPatientContactFromMessage(from, body);
  
  // Analyze message for medical urgency
  const urgencyLevel = await analyzeMessageUrgency(body);
  
  // Create or update conversation
  let conversation = conversationId 
    ? await getConversation(conversationId)
    : await createMedicalConversation(patientContact.id, channelId, 'general');
  
  // Update conversation based on message content
  if (urgencyLevel === 'high' || urgencyLevel === 'urgent') {
    await updateConversation(conversation.id, {
      metadata: {
        ...conversation.metadata,
        priority: urgencyLevel,
        requiresImmediateAttention: true
      }
    });
    
    // Immediately assign to medical professional
    await assignToMedicalProfessional(conversation.id, urgencyLevel);
    
    // Send immediate acknowledgment
    await sendConversationMessage(
      conversation.id,
      '🚨 Hemos recibido tu mensaje urgente. Un profesional médico te contactará inmediatamente.'
    );
  }
  
  // Check for appointment-related keywords
  await checkForAppointmentKeywords(conversation.id, body);
  
  // Track message for compliance
  await trackMessageForCompliance(patientContact.id, messageData);
}

// Analyze message urgency using AI
async function analyzeMessageUrgency(messageBody: any): Promise<'low' | 'medium' | 'high' | 'urgent'> {
  const messageText = messageBody.text?.text?.toLowerCase() || '';
  
  // Urgent keywords
  const urgentKeywords = [
    'emergencia', 'urgente', 'dolor severo', 'sangrado abundante',
    'dificultad respirar', 'mareo severo', 'fiebre alta', 'vómito sangre'
  ];
  
  // High priority keywords
  const highPriorityKeywords = [
    'dolor', 'sangrado', 'hinchazón', 'infección', 'fiebre',
    'náuseas', 'vómito', 'mareo', 'preocupación'
  ];
  
  // Medium priority keywords
  const mediumPriorityKeywords = [
    'cita', 'reprogramar', 'cancelar', 'cambiar', 'consulta',
    'pago', 'factura', 'resultado', 'duda'
  ];
  
  if (urgentKeywords.some(keyword => messageText.includes(keyword))) {
    return 'urgent';
  }
  
  if (highPriorityKeywords.some(keyword => messageText.includes(keyword))) {
    return 'high';
  }
  
  if (mediumPriorityKeywords.some(keyword => messageText.includes(keyword))) {
    return 'medium';
  }
  
  return 'low';
}
```

### Message Delivery Tracking

```typescript
// Handle message delivery confirmation
async function handleMessageDelivered(messageData: any): Promise<void> {
  const { id, to, timestamp } = messageData;
  
  // Update message status in database
  await updateMessageStatus(id, 'delivered', timestamp);
  
  // Find related appointment or conversation
  const conversation = await findConversationByRecipient(to);
  if (conversation) {
    await updateConversation(conversation.id, {
      metadata: {
        ...conversation.metadata,
        lastMessageDelivered: timestamp
      }
    });
  }
  
  // Track delivery for compliance
  await trackMessageDelivery(id, to, timestamp);
}

// Handle message read confirmation
async function handleMessageRead(messageData: any): Promise<void> {
  const { id, to, timestamp } = messageData;
  
  // Update message status
  await updateMessageStatus(id, 'read', timestamp);
  
  // Trigger follow-up actions if needed
  await triggerReadReceiptActions(id, to);
}

// Handle message delivery failure
async function handleMessageFailed(messageData: any): Promise<void> {
  const { id, to, error, timestamp } = messageData;
  
  // Update message status
  await updateMessageStatus(id, 'failed', timestamp);
  
  // Log failure for investigation
  await logMessageFailure(id, to, error);
  
  // Attempt alternative delivery channel
  await attemptAlternativeDelivery(id, to, error);
}

// Attempt message delivery via alternative channel
async function attemptAlternativeDelivery(
  messageId: string,
  recipient: string,
  error: any
): Promise<void> {
  const originalMessage = await getMessageById(messageId);
  const patientContact = await findContactByPhone(recipient);
  
  if (!patientContact) return;
  
  // Determine alternative channel
  let alternativeChannel = 'sms'; // Default fallback
  
  if (originalMessage.channelType === 'whatsapp') {
    alternativeChannel = 'sms';
  } else if (originalMessage.channelType === 'sms') {
    alternativeChannel = 'email';
  }
  
  // Check if patient has alternative channel
  const hasAlternativeChannel = await checkPatientChannel(patientContact.id, alternativeChannel);
  
  if (hasAlternativeChannel) {
    await sendMessageViaAlternativeChannel(
      patientContact.id,
      originalMessage.content,
      alternativeChannel
    );
    
    // Log channel switch
    await logChannelSwitch(messageId, originalMessage.channelType, alternativeChannel);
  }
}
```

### Appointment Integration

```typescript
// Handle appointment-related messages
async function checkForAppointmentKeywords(
  conversationId: string,
  messageBody: any
): Promise<void> {
  const messageText = messageBody.text?.text?.toLowerCase() || '';
  
  // Appointment confirmation keywords
  const confirmationKeywords = ['confirmar', 'confirmo', 'si', 'ok', 'vale'];
  
  // Rescheduling keywords
  const rescheduleKeywords = ['reprogramar', 'cambiar', 'reagendar', 'mover'];
  
  // Cancellation keywords
  const cancellationKeywords = ['cancelar', 'anular', 'no puedo', 'no podré'];
  
  if (confirmationKeywords.some(keyword => messageText.includes(keyword))) {
    await handleAppointmentConfirmation(conversationId);
  } else if (rescheduleKeywords.some(keyword => messageText.includes(keyword))) {
    await handleAppointmentReschedule(conversationId);
  } else if (cancellationKeywords.some(keyword => messageText.includes(keyword))) {
    await handleAppointmentCancellation(conversationId);
  }
}

// Handle appointment confirmation
async function handleAppointmentConfirmation(conversationId: string): Promise<void> {
  const conversation = await getConversation(conversationId);
  const appointmentId = conversation.metadata.appointmentId;
  
  if (appointmentId) {
    // Update appointment status in Agenda Pro
    await updateAgendaProAppointment(appointmentId, { status: 'confirmed' });
    
    // Update conversation
    await updateConversation(conversationId, {
      metadata: {
        ...conversation.metadata,
        appointmentConfirmed: true,
        confirmationDate: new Date().toISOString()
      }
    });
    
    // Send confirmation message
    await sendConversationMessage(
      conversationId,
      '✅ ¡Perfecto! Tu cita ha sido confirmada. Te esperamos en la fecha y hora programada.'
    );
  }
}

// Handle appointment rescheduling request
async function handleAppointmentReschedule(conversationId: string): Promise<void> {
  const conversation = await getConversation(conversationId);
  
  await updateConversation(conversationId, {
    metadata: {
      ...conversation.metadata,
      rescheduleRequested: true,
      rescheduleRequestDate: new Date().toISOString()
    }
  });
  
  // Assign to scheduling coordinator
  await assignToAgent(conversationId, 'scheduling-coordinator');
  
  // Send acknowledgment
  await sendConversationMessage(
    conversationId,
    '📅 Entiendo que necesitas reprogramar tu cita. Un coordinador te contactará pronto para ayudarte con las nuevas fechas disponibles.'
  );
}
```

## Webhook Server Implementation

### Express.js Webhook Server

```typescript
import express from 'express';
import { WebhookSecurityManager } from './WebhookSecurityManager';

const app = express();
const webhookSecurity = new WebhookSecurityManager(process.env.BIRD_WEBHOOK_SECRET!);

// Middleware to parse JSON with raw body
app.use('/webhooks/bird', express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

// Bird webhook endpoint
app.post('/webhooks/bird', async (req, res) => {
  try {
    // Verify webhook signature
    if (!webhookSecurity.validateRequest(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Process webhook event
    await processBirdWebhook(req.body);
    
    // Respond with success
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Main webhook processor
async function processBirdWebhook(payload: any): Promise<void> {
  const { event, data } = payload;
  
  try {
    switch (event) {
      // Message events
      case 'message.received':
        await handleIncomingMessage(data);
        break;
      case 'message.delivered':
        await handleMessageDelivered(data);
        break;
      case 'message.failed':
        await handleMessageFailed(data);
        break;
      case 'message.read':
        await handleMessageRead(data);
        break;
      
      // Contact events
      case 'contact.created':
        await handleNewPatientContact(data);
        break;
      case 'contact.updated':
        await handlePatientContactUpdate(data);
        break;
      
      // Conversation events
      case 'conversation.created':
        await handleNewConversation(data);
        break;
      case 'conversation.updated':
        await handleConversationUpdate(data);
        break;
      case 'conversation.resolved':
        await handleConversationResolved(data);
        break;
      
      default:
        console.warn(`Unhandled webhook event: ${event}`);
    }
  } catch (error) {
    console.error(`Error processing webhook event ${event}:`, error);
    throw error;
  }
}

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

### Webhook Queue Processing

```typescript
// Queue-based webhook processing for high volume
import Bull from 'bull';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);
const webhookQueue = new Bull('webhook processing', {
  redis: {
    port: parseInt(process.env.REDIS_PORT || '6379'),
    host: process.env.REDIS_HOST || 'localhost'
  }
});

// Add webhook event to queue
async function queueWebhookEvent(event: string, data: any): Promise<void> {
  await webhookQueue.add('process-webhook', {
    event,
    data,
    timestamp: new Date().toISOString()
  }, {
    attempts: 3,
    backoff: 'exponential',
    delay: 1000
  });
}

// Process webhook events from queue
webhookQueue.process('process-webhook', async (job) => {
  const { event, data } = job.data;
  
  try {
    await processBirdWebhook({ event, data });
    console.log(`Processed webhook event: ${event}`);
  } catch (error) {
    console.error(`Failed to process webhook event ${event}:`, error);
    throw error;
  }
});

// Error handling
webhookQueue.on('failed', (job, err) => {
  console.error(`Webhook job ${job.id} failed:`, err);
});

webhookQueue.on('completed', (job) => {
  console.log(`Webhook job ${job.id} completed successfully`);
});
```

## Error Handling and Retry Logic

### Webhook Error Handling

```typescript
class WebhookErrorHandler {
  private readonly maxRetries: number = 5;
  private readonly retryDelays: number[] = [1000, 2000, 5000, 10000, 30000];
  
  async handleWebhookError(
    event: string,
    data: any,
    error: Error,
    attempt: number = 1
  ): Promise<void> {
    console.error(`Webhook error for event ${event} (attempt ${attempt}):`, error);
    
    // Log error for investigation
    await this.logWebhookError(event, data, error, attempt);
    
    // Check if we should retry
    if (attempt <= this.maxRetries) {
      const delay = this.retryDelays[attempt - 1];
      console.log(`Retrying webhook event ${event} in ${delay}ms`);
      
      setTimeout(async () => {
        try {
          await processBirdWebhook({ event, data });
        } catch (retryError) {
          await this.handleWebhookError(event, data, retryError, attempt + 1);
        }
      }, delay);
    } else {
      // Max retries exceeded
      await this.handleMaxRetriesExceeded(event, data, error);
    }
  }
  
  private async logWebhookError(
    event: string,
    data: any,
    error: Error,
    attempt: number
  ): Promise<void> {
    const errorLog = {
      event,
      data: this.sanitizeData(data),
      error: error.message,
      stack: error.stack,
      attempt,
      timestamp: new Date().toISOString()
    };
    
    // Store in error log database
    await this.storeErrorLog(errorLog);
  }
  
  private async handleMaxRetriesExceeded(
    event: string,
    data: any,
    error: Error
  ): Promise<void> {
    console.error(`Max retries exceeded for webhook event ${event}`);
    
    // Notify administrators
    await this.notifyAdministrators(event, data, error);
    
    // Store in dead letter queue for manual processing
    await this.moveToDeadLetterQueue(event, data, error);
  }
  
  private sanitizeData(data: any): any {
    // Remove sensitive information from logs
    const sanitized = { ...data };
    
    if (sanitized.body?.text?.text) {
      sanitized.body.text.text = '***SANITIZED***';
    }
    
    return sanitized;
  }
}
```

## Monitoring and Analytics

### Webhook Monitoring

```typescript
// Webhook monitoring and analytics
class WebhookMonitor {
  private metrics: Map<string, number> = new Map();
  
  // Track webhook event
  trackWebhookEvent(event: string, status: 'success' | 'error'): void {
    const key = `${event}_${status}`;
    const count = this.metrics.get(key) || 0;
    this.metrics.set(key, count + 1);
  }
  
  // Get webhook statistics
  getWebhookStats(): WebhookStats {
    const stats: WebhookStats = {
      totalEvents: 0,
      successfulEvents: 0,
      failedEvents: 0,
      eventsByType: {},
      errorsByType: {}
    };
    
    for (const [key, count] of this.metrics) {
      const [event, status] = key.split('_');
      
      stats.totalEvents += count;
      
      if (status === 'success') {
        stats.successfulEvents += count;
      } else {
        stats.failedEvents += count;
      }
      
      if (!stats.eventsByType[event]) {
        stats.eventsByType[event] = 0;
      }
      stats.eventsByType[event] += count;
    }
    
    return stats;
  }
  
  // Generate webhook health report
  async generateHealthReport(): Promise<WebhookHealthReport> {
    const stats = this.getWebhookStats();
    const successRate = stats.totalEvents > 0 
      ? (stats.successfulEvents / stats.totalEvents) * 100 
      : 0;
    
    return {
      successRate,
      totalEvents: stats.totalEvents,
      recentErrors: await this.getRecentErrors(),
      averageProcessingTime: await this.getAverageProcessingTime(),
      status: successRate >= 95 ? 'healthy' : successRate >= 80 ? 'warning' : 'critical'
    };
  }
}

interface WebhookStats {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  eventsByType: Record<string, number>;
  errorsByType: Record<string, number>;
}

interface WebhookHealthReport {
  successRate: number;
  totalEvents: number;
  recentErrors: any[];
  averageProcessingTime: number;
  status: 'healthy' | 'warning' | 'critical';
}
```

## Testing Webhooks

### Webhook Testing Framework

```typescript
// Test webhook endpoints
class WebhookTester {
  private testServer: any;
  
  async setupTestServer(): Promise<void> {
    const app = express();
    app.use(express.json());
    
    app.post('/test-webhook', (req, res) => {
      console.log('Test webhook received:', req.body);
      res.status(200).json({ received: true });
    });
    
    this.testServer = app.listen(3001);
  }
  
  async testWebhookDelivery(): Promise<void> {
    // Create test subscription
    const testSubscription = await this.createTestSubscription();
    
    // Trigger test event
    await this.triggerTestEvent();
    
    // Verify webhook delivery
    await this.verifyWebhookDelivery(testSubscription.id);
  }
  
  private async createTestSubscription(): Promise<any> {
    return await birdApiClient.post('/webhooks/subscriptions', {
      name: 'Test Subscription',
      url: 'http://localhost:3001/test-webhook',
      events: [
        { service: 'channels', type: 'message.sent' }
      ]
    });
  }
  
  async cleanup(): Promise<void> {
    if (this.testServer) {
      this.testServer.close();
    }
  }
}
```

## Next Steps

1. **Set up webhook endpoints**: Configure secure webhook receivers
2. **Implement event handlers**: Build medical-specific event processing
3. **Configure monitoring**: Set up webhook health monitoring
4. **Test webhook delivery**: Verify webhook functionality
5. **Set up error handling**: Implement robust error recovery

## References

- [Bird.com Webhooks Documentation](https://docs.bird.com/api/notifications-api)
- [Webhook Security Best Practices](https://docs.bird.com/api/notifications-api/webhook-security)
- [Channels API Events](./bird-channels-api.md)
- [Conversations API Events](./bird-conversations-api.md)