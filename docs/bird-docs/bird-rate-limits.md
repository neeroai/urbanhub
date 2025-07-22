# Bird.com Rate Limits and Performance

## Overview

Understanding and managing rate limits is crucial for maintaining reliable communication with patients in the DRAD medical practice management system. This document provides comprehensive guidance on Bird.com API rate limits, quotas, and performance optimization strategies.

## Rate Limiting Fundamentals

### How Rate Limits Work

Bird.com implements rate limiting to ensure fair usage and system stability. Rate limits are applied per API key and vary by service and endpoint.

### Rate Limit Response

When you exceed rate limits, Bird.com returns an HTTP 429 status code:

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 60

{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Please retry after 60 seconds."
  }
}
```

### Rate Limit Headers

Bird.com includes rate limit information in response headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 23
X-RateLimit-Reset: 1643723400
```

## Service-Specific Rate Limits

### Channels API Rate Limits

```typescript
// Channel-specific rate limits
const CHANNEL_RATE_LIMITS = {
  whatsapp: {
    messagesPerSecond: 250,
    messagesPerMinute: 1000,
    messagesPerHour: 4000,
    messagesPerDay: 100000
  },
  sms: {
    messagesPerSecond: 100,
    messagesPerMinute: 1000,
    messagesPerHour: 10000,
    messagesPerDay: 100000
  },
  email: {
    messagesPerSecond: 10,
    messagesPerMinute: 100,
    messagesPerHour: 1000,
    messagesPerDay: 10000
  },
  voice: {
    callsPerSecond: 5,
    callsPerMinute: 30,
    callsPerHour: 200,
    callsPerDay: 1000
  }
};

// Medical practice messaging patterns
const MEDICAL_MESSAGING_PATTERNS = {
  appointmentReminders: {
    typicalVolume: 50, // messages per day
    peakVolume: 200, // messages per day during busy periods
    preferredChannel: 'whatsapp'
  },
  postOpFollowUp: {
    typicalVolume: 20,
    peakVolume: 50,
    preferredChannel: 'whatsapp'
  },
  emergencyMessages: {
    typicalVolume: 5,
    peakVolume: 20,
    preferredChannel: 'sms' // More reliable for urgent messages
  }
};
```

### Contacts API Rate Limits

```typescript
// Contacts API rate limits
const CONTACTS_RATE_LIMITS = {
  create: {
    requestsPerSecond: 10,
    requestsPerMinute: 100,
    requestsPerHour: 1000
  },
  update: {
    requestsPerSecond: 20,
    requestsPerMinute: 200,
    requestsPerHour: 2000
  },
  search: {
    requestsPerSecond: 50,
    requestsPerMinute: 500,
    requestsPerHour: 5000
  },
  batch: {
    contactsPerBatch: 100,
    batchesPerHour: 50
  }
};
```

### Conversations API Rate Limits

```typescript
// Conversations API rate limits
const CONVERSATIONS_RATE_LIMITS = {
  create: {
    requestsPerSecond: 20,
    requestsPerMinute: 200,
    requestsPerHour: 2000
  },
  update: {
    requestsPerSecond: 50,
    requestsPerMinute: 500,
    requestsPerHour: 5000
  },
  messages: {
    requestsPerSecond: 100,
    requestsPerMinute: 1000,
    requestsPerHour: 10000
  }
};
```

## Rate Limit Management

### Rate Limit Monitoring

```typescript
// Rate limit monitoring class
class RateLimitMonitor {
  private limits: Map<string, RateLimitInfo> = new Map();
  
  // Track rate limit from response headers
  trackRateLimit(endpoint: string, headers: any): void {
    const rateLimitInfo: RateLimitInfo = {
      limit: parseInt(headers['x-ratelimit-limit'] || '0'),
      remaining: parseInt(headers['x-ratelimit-remaining'] || '0'),
      reset: parseInt(headers['x-ratelimit-reset'] || '0'),
      lastUpdated: Date.now()
    };
    
    this.limits.set(endpoint, rateLimitInfo);
  }
  
  // Check if we're approaching rate limit
  isApproachingLimit(endpoint: string, threshold: number = 0.8): boolean {
    const info = this.limits.get(endpoint);
    if (!info) return false;
    
    const usageRatio = (info.limit - info.remaining) / info.limit;
    return usageRatio >= threshold;
  }
  
  // Get time until rate limit reset
  getTimeUntilReset(endpoint: string): number {
    const info = this.limits.get(endpoint);
    if (!info) return 0;
    
    return Math.max(0, info.reset * 1000 - Date.now());
  }
  
  // Get current rate limit status
  getRateLimitStatus(endpoint: string): RateLimitStatus {
    const info = this.limits.get(endpoint);
    if (!info) {
      return { status: 'unknown', remaining: 0, resetTime: 0 };
    }
    
    const now = Date.now();
    const resetTime = info.reset * 1000;
    
    if (now >= resetTime) {
      return { status: 'reset', remaining: info.limit, resetTime };
    }
    
    if (info.remaining === 0) {
      return { status: 'exceeded', remaining: 0, resetTime };
    }
    
    if (info.remaining < info.limit * 0.2) {
      return { status: 'warning', remaining: info.remaining, resetTime };
    }
    
    return { status: 'ok', remaining: info.remaining, resetTime };
  }
}

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  lastUpdated: number;
}

interface RateLimitStatus {
  status: 'ok' | 'warning' | 'exceeded' | 'reset' | 'unknown';
  remaining: number;
  resetTime: number;
}
```

### Rate Limit Handling

```typescript
// Rate limit aware HTTP client
class RateLimitAwareClient {
  private monitor: RateLimitMonitor;
  private queue: RequestQueue;
  
  constructor() {
    this.monitor = new RateLimitMonitor();
    this.queue = new RequestQueue();
  }
  
  async makeRequest(endpoint: string, options: RequestOptions): Promise<any> {
    // Check rate limit status
    const status = this.monitor.getRateLimitStatus(endpoint);
    
    if (status.status === 'exceeded') {
      // Wait until reset
      const waitTime = this.monitor.getTimeUntilReset(endpoint);
      await this.delay(waitTime);
    } else if (status.status === 'warning') {
      // Slow down requests
      await this.delay(1000);
    }
    
    try {
      const response = await this.executeRequest(endpoint, options);
      
      // Track rate limit info
      this.monitor.trackRateLimit(endpoint, response.headers);
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        // Handle rate limit exceeded
        await this.handleRateLimitExceeded(endpoint, error);
        
        // Retry request
        return this.makeRequest(endpoint, options);
      }
      throw error;
    }
  }
  
  private async handleRateLimitExceeded(endpoint: string, error: any): Promise<void> {
    const retryAfter = error.response?.headers['retry-after'];
    const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
    
    console.log(`Rate limit exceeded for ${endpoint}. Waiting ${waitTime}ms`);
    await this.delay(waitTime);
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Request Queuing and Throttling

### Message Queue Implementation

```typescript
// Message queue for rate limit management
class MessageQueue {
  private queue: QueuedMessage[] = [];
  private processing: boolean = false;
  private channelLimits: Map<string, ChannelRateLimit> = new Map();
  
  constructor() {
    this.initializeChannelLimits();
  }
  
  private initializeChannelLimits(): void {
    // Initialize rate limits for each channel
    this.channelLimits.set('whatsapp', {
      messagesPerSecond: 250,
      messagesPerMinute: 1000,
      currentSecond: 0,
      currentMinute: 0,
      lastReset: Date.now()
    });
    
    this.channelLimits.set('sms', {
      messagesPerSecond: 100,
      messagesPerMinute: 1000,
      currentSecond: 0,
      currentMinute: 0,
      lastReset: Date.now()
    });
  }
  
  // Add message to queue
  async queueMessage(message: QueuedMessage): Promise<void> {
    // Priority queue - emergency messages first
    if (message.priority === 'urgent') {
      this.queue.unshift(message);
    } else {
      this.queue.push(message);
    }
    
    // Start processing if not already running
    if (!this.processing) {
      this.processQueue();
    }
  }
  
  // Process message queue
  private async processQueue(): Promise<void> {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const message = this.queue.shift()!;
      
      // Check if we can send this message
      if (await this.canSendMessage(message)) {
        try {
          await this.sendMessage(message);
          await this.updateRateLimit(message.channelId);
        } catch (error) {
          console.error('Failed to send message:', error);
          
          // Requeue message if not urgent
          if (message.priority !== 'urgent') {
            this.queue.unshift(message);
          }
        }
      } else {
        // Put message back in queue
        this.queue.unshift(message);
        
        // Wait before trying again
        await this.delay(1000);
      }
    }
    
    this.processing = false;
  }
  
  // Check if we can send message without exceeding rate limits
  private async canSendMessage(message: QueuedMessage): Promise<boolean> {
    const channelLimit = this.channelLimits.get(message.channelType);
    if (!channelLimit) return true;
    
    const now = Date.now();
    const timeSinceReset = now - channelLimit.lastReset;
    
    // Reset counters if needed
    if (timeSinceReset >= 60000) {
      channelLimit.currentMinute = 0;
      channelLimit.currentSecond = 0;
      channelLimit.lastReset = now;
    } else if (timeSinceReset >= 1000) {
      channelLimit.currentSecond = 0;
    }
    
    // Check limits
    return channelLimit.currentSecond < channelLimit.messagesPerSecond &&
           channelLimit.currentMinute < channelLimit.messagesPerMinute;
  }
  
  // Update rate limit counters
  private async updateRateLimit(channelType: string): Promise<void> {
    const channelLimit = this.channelLimits.get(channelType);
    if (channelLimit) {
      channelLimit.currentSecond++;
      channelLimit.currentMinute++;
    }
  }
  
  // Send message
  private async sendMessage(message: QueuedMessage): Promise<void> {
    const response = await birdApiClient.post('/channels/messages', {
      channelId: message.channelId,
      to: message.to,
      body: message.body
    });
    
    console.log(`Message sent: ${message.id}`);
  }
}

interface QueuedMessage {
  id: string;
  channelId: string;
  channelType: string;
  to: string;
  body: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  queuedAt: number;
  attempts: number;
}

interface ChannelRateLimit {
  messagesPerSecond: number;
  messagesPerMinute: number;
  currentSecond: number;
  currentMinute: number;
  lastReset: number;
}
```

### Batch Processing

```typescript
// Batch processing for efficient API usage
class BatchProcessor {
  private batchSize: number = 100;
  private batchTimeout: number = 5000; // 5 seconds
  private batches: Map<string, BatchOperation[]> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  
  // Add operation to batch
  addToBatch(operation: BatchOperation): void {
    const batchKey = this.getBatchKey(operation);
    
    if (!this.batches.has(batchKey)) {
      this.batches.set(batchKey, []);
    }
    
    const batch = this.batches.get(batchKey)!;
    batch.push(operation);
    
    // Process batch if full
    if (batch.length >= this.batchSize) {
      this.processBatch(batchKey);
    } else {
      // Set timer to process batch
      this.setBatchTimer(batchKey);
    }
  }
  
  // Process batch operations
  private async processBatch(batchKey: string): Promise<void> {
    const batch = this.batches.get(batchKey);
    if (!batch || batch.length === 0) return;
    
    // Clear timer
    const timer = this.timers.get(batchKey);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(batchKey);
    }
    
    // Clear batch
    this.batches.delete(batchKey);
    
    try {
      await this.executeBatch(batch);
    } catch (error) {
      console.error('Batch processing failed:', error);
      
      // Retry individual operations
      for (const operation of batch) {
        await this.retryOperation(operation);
      }
    }
  }
  
  // Execute batch operations
  private async executeBatch(batch: BatchOperation[]): Promise<void> {
    const operationType = batch[0].type;
    
    switch (operationType) {
      case 'create_contact':
        await this.batchCreateContacts(batch);
        break;
      case 'update_contact':
        await this.batchUpdateContacts(batch);
        break;
      case 'send_message':
        await this.batchSendMessages(batch);
        break;
      default:
        // Process individually
        await Promise.all(batch.map(op => this.executeOperation(op)));
    }
  }
  
  // Batch create contacts
  private async batchCreateContacts(batch: BatchOperation[]): Promise<void> {
    const contacts = batch.map(op => op.data);
    
    // Bird.com doesn't have native batch contact creation
    // Process in smaller chunks to respect rate limits
    const chunkSize = 10;
    for (let i = 0; i < contacts.length; i += chunkSize) {
      const chunk = contacts.slice(i, i + chunkSize);
      await Promise.all(chunk.map(contact => 
        birdApiClient.post('/contacts', contact)
      ));
      
      // Small delay between chunks
      await this.delay(100);
    }
  }
  
  // Batch send messages
  private async batchSendMessages(batch: BatchOperation[]): Promise<void> {
    const messages = batch.map(op => op.data);
    
    // Group by channel for optimal sending
    const messagesByChannel = new Map<string, any[]>();
    
    for (const message of messages) {
      const channelId = message.channelId;
      if (!messagesByChannel.has(channelId)) {
        messagesByChannel.set(channelId, []);
      }
      messagesByChannel.get(channelId)!.push(message);
    }
    
    // Send messages by channel
    for (const [channelId, channelMessages] of messagesByChannel) {
      await this.sendMessagesForChannel(channelId, channelMessages);
    }
  }
  
  private async sendMessagesForChannel(channelId: string, messages: any[]): Promise<void> {
    // Respect channel-specific rate limits
    const channelType = await this.getChannelType(channelId);
    const rateLimit = CHANNEL_RATE_LIMITS[channelType];
    
    if (rateLimit) {
      const delayBetweenMessages = 1000 / rateLimit.messagesPerSecond;
      
      for (const message of messages) {
        await birdApiClient.post('/channels/messages', message);
        await this.delay(delayBetweenMessages);
      }
    }
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

interface BatchOperation {
  id: string;
  type: 'create_contact' | 'update_contact' | 'send_message';
  data: any;
  timestamp: number;
}
```

## Medical Practice Rate Limit Strategies

### Appointment Reminder Strategy

```typescript
// Optimized appointment reminder sending
class AppointmentReminderScheduler {
  private messageQueue: MessageQueue;
  private batchProcessor: BatchProcessor;
  
  constructor() {
    this.messageQueue = new MessageQueue();
    this.batchProcessor = new BatchProcessor();
  }
  
  // Schedule appointment reminders
  async scheduleAppointmentReminders(
    appointments: Appointment[],
    reminderTime: string // e.g., '24h', '2h', '30m'
  ): Promise<void> {
    const reminderMessages = appointments.map(appointment => ({
      id: `reminder_${appointment.id}`,
      channelId: 'whatsapp',
      channelType: 'whatsapp',
      to: appointment.patientPhone,
      body: {
        type: 'template',
        template: {
          name: 'appointment_reminder',
          language: { code: 'es' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: appointment.patientName },
                { type: 'text', text: appointment.date },
                { type: 'text', text: appointment.time }
              ]
            }
          ]
        }
      },
      priority: 'medium' as const,
      queuedAt: Date.now(),
      attempts: 0
    }));
    
    // Calculate send time
    const sendTime = this.calculateSendTime(reminderTime);
    
    // Schedule messages
    for (const message of reminderMessages) {
      await this.scheduleMessage(message, sendTime);
    }
  }
  
  // Schedule message for future delivery
  private async scheduleMessage(message: QueuedMessage, sendTime: number): Promise<void> {
    const delay = sendTime - Date.now();
    
    if (delay > 0) {
      setTimeout(() => {
        this.messageQueue.queueMessage(message);
      }, delay);
    } else {
      // Send immediately
      await this.messageQueue.queueMessage(message);
    }
  }
}
```

### Emergency Message Handling

```typescript
// Emergency message prioritization
class EmergencyMessageHandler {
  private messageQueue: MessageQueue;
  
  constructor(messageQueue: MessageQueue) {
    this.messageQueue = messageQueue;
  }
  
  // Send emergency message with highest priority
  async sendEmergencyMessage(
    patientPhone: string,
    message: string,
    channelType: string = 'sms'
  ): Promise<void> {
    const emergencyMessage: QueuedMessage = {
      id: `emergency_${Date.now()}`,
      channelId: channelType,
      channelType,
      to: patientPhone,
      body: {
        type: 'text',
        text: { text: message }
      },
      priority: 'urgent',
      queuedAt: Date.now(),
      attempts: 0
    };
    
    // Skip queue for emergency messages
    await this.sendImmediately(emergencyMessage);
  }
  
  // Send message immediately, bypassing queue
  private async sendImmediately(message: QueuedMessage): Promise<void> {
    try {
      await birdApiClient.post('/channels/messages', {
        channelId: message.channelId,
        to: message.to,
        body: message.body
      });
      
      console.log(`Emergency message sent: ${message.id}`);
    } catch (error) {
      console.error('Failed to send emergency message:', error);
      
      // Fallback to alternative channel
      await this.sendViaAlternativeChannel(message);
    }
  }
  
  // Send via alternative channel if primary fails
  private async sendViaAlternativeChannel(message: QueuedMessage): Promise<void> {
    const alternativeChannel = message.channelType === 'whatsapp' ? 'sms' : 'whatsapp';
    
    try {
      await birdApiClient.post('/channels/messages', {
        channelId: alternativeChannel,
        to: message.to,
        body: message.body
      });
      
      console.log(`Emergency message sent via ${alternativeChannel}: ${message.id}`);
    } catch (error) {
      console.error('Failed to send emergency message via alternative channel:', error);
    }
  }
}
```

## Performance Optimization

### Caching Strategy

```typescript
// API response caching
class ApiResponseCache {
  private cache: Map<string, CachedResponse> = new Map();
  private defaultTTL: number = 300000; // 5 minutes
  
  // Get cached response
  get(key: string): any | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  // Set cached response
  set(key: string, data: any, ttl: number = this.defaultTTL): void {
    const cached: CachedResponse = {
      data,
      expiresAt: Date.now() + ttl
    };
    
    this.cache.set(key, cached);
  }
  
  // Clear expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache) {
      if (now > cached.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

interface CachedResponse {
  data: any;
  expiresAt: number;
}

// Cached API client
class CachedApiClient {
  private cache: ApiResponseCache;
  private rateLimitClient: RateLimitAwareClient;
  
  constructor() {
    this.cache = new ApiResponseCache();
    this.rateLimitClient = new RateLimitAwareClient();
  }
  
  // Get contact with caching
  async getContact(contactId: string): Promise<any> {
    const cacheKey = `contact_${contactId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const contact = await this.rateLimitClient.makeRequest(
      `/contacts/${contactId}`,
      { method: 'GET' }
    );
    
    // Cache for 5 minutes
    this.cache.set(cacheKey, contact, 300000);
    
    return contact;
  }
}
```

### Connection Pooling

```typescript
// HTTP connection pooling for better performance
import { Agent } from 'https';

class OptimizedHttpClient {
  private agent: Agent;
  
  constructor() {
    this.agent = new Agent({
      keepAlive: true,
      keepAliveMsecs: 30000,
      maxSockets: 50,
      maxFreeSockets: 10,
      timeout: 60000
    });
  }
  
  // Create optimized axios instance
  createClient(): any {
    return axios.create({
      baseURL: 'https://api.bird.com',
      timeout: 30000,
      httpsAgent: this.agent,
      headers: {
        'Authorization': `AccessKey ${process.env.BIRD_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }
}
```

## Monitoring and Alerting

### Rate Limit Monitoring

```typescript
// Rate limit monitoring and alerting
class RateLimitMonitoring {
  private thresholds = {
    warning: 0.8,  // 80% of limit
    critical: 0.95 // 95% of limit
  };
  
  // Monitor rate limit usage
  async monitorRateLimit(endpoint: string, usage: number, limit: number): Promise<void> {
    const usageRatio = usage / limit;
    
    if (usageRatio >= this.thresholds.critical) {
      await this.sendCriticalAlert(endpoint, usageRatio);
    } else if (usageRatio >= this.thresholds.warning) {
      await this.sendWarningAlert(endpoint, usageRatio);
    }
  }
  
  // Send critical alert
  private async sendCriticalAlert(endpoint: string, usageRatio: number): Promise<void> {
    const message = `CRITICAL: Rate limit at ${Math.round(usageRatio * 100)}% for ${endpoint}`;
    
    // Send to monitoring system
    await this.sendToMonitoringSystem('critical', message);
    
    // Notify administrators
    await this.notifyAdministrators(message);
  }
  
  // Send warning alert
  private async sendWarningAlert(endpoint: string, usageRatio: number): Promise<void> {
    const message = `WARNING: Rate limit at ${Math.round(usageRatio * 100)}% for ${endpoint}`;
    
    await this.sendToMonitoringSystem('warning', message);
  }
}
```

## Next Steps

1. **Implement rate limit monitoring**: Set up comprehensive rate limit tracking
2. **Configure message queuing**: Build robust message queue system
3. **Set up batch processing**: Optimize API usage with batch operations
4. **Monitor performance**: Track API performance and optimize bottlenecks
5. **Test under load**: Verify system behavior under high message volumes

## References

- [Bird.com Rate Limits Documentation](https://docs.bird.com/api/channels-api/rate-limit)
- [API Performance Best Practices](https://docs.bird.com/api/api-access/common-api-usage)
- [Channels API Reference](./bird-channels-api.md)
- [Webhooks Integration](./bird-webhooks.md)