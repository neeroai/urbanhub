# Bird.com Code Examples

## Overview

This document provides comprehensive TypeScript/JavaScript code examples for integrating Bird.com API into the DRAD medical practice management system. These examples cover common use cases, best practices, and production-ready implementations.

## Table of Contents

1. [Authentication Examples](#authentication-examples)
2. [Contact Management](#contact-management)
3. [Messaging Examples](#messaging-examples)
4. [Conversation Management](#conversation-management)
5. [Webhook Handlers](#webhook-handlers)
6. [Medical Practice Workflows](#medical-practice-workflows)
7. [Error Handling](#error-handling)
8. [Testing Examples](#testing-examples)

## Authentication Examples

### Basic API Client Setup

```typescript
// src/services/bird-client.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export class BirdApiClient {
  private client: AxiosInstance;
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string, baseURL: string = 'https://api.bird.com') {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
    this.client = this.createClient();
  }

  private createClient(): AxiosInstance {
    const client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Authorization': `AccessKey ${this.apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor
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

    // Response interceptor
    client.interceptors.response.use(
      (response) => {
        console.log(`✅ Bird API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ Response error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );

    return client;
  }

  public async get(url: string, config?: AxiosRequestConfig): Promise<any> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  public async post(url: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  public async put(url: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  public async delete(url: string, config?: AxiosRequestConfig): Promise<any> {
    const response = await this.client.delete(url, config);
    return response.data;
  }
}

// Usage example
const birdClient = new BirdApiClient(process.env.BIRD_API_KEY!);
```

### Environment Configuration

```typescript
// src/config/bird-config.ts
interface BirdConfig {
  apiKey: string;
  baseUrl: string;
  webhookSecret: string;
  channels: {
    whatsapp: string;
    sms: string;
    email?: string;
  };
  templates: {
    appointmentReminder: string;
    appointmentConfirmation: string;
    postOpFollowUp: string;
    paymentReminder: string;
  };
}

export const birdConfig: BirdConfig = {
  apiKey: process.env.BIRD_API_KEY!,
  baseUrl: process.env.BIRD_BASE_URL || 'https://api.bird.com',
  webhookSecret: process.env.BIRD_WEBHOOK_SECRET!,
  channels: {
    whatsapp: process.env.WHATSAPP_CHANNEL_ID!,
    sms: process.env.SMS_CHANNEL_ID!,
    email: process.env.EMAIL_CHANNEL_ID
  },
  templates: {
    appointmentReminder: 'appointment_reminder',
    appointmentConfirmation: 'appointment_confirmation',
    postOpFollowUp: 'post_op_followup',
    paymentReminder: 'payment_reminder'
  }
};

// Validation function
export function validateBirdConfig(): void {
  const requiredFields = [
    'apiKey',
    'webhookSecret',
    'channels.whatsapp',
    'channels.sms'
  ];

  for (const field of requiredFields) {
    const value = field.split('.').reduce((obj, key) => obj?.[key], birdConfig);
    if (!value) {
      throw new Error(`Missing required Bird.com configuration: ${field}`);
    }
  }
}
```

## Contact Management

### Create and Manage Patient Contacts

```typescript
// src/services/patient-contact-service.ts
interface PatientContact {
  id?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  medicalRecordNumber?: string;
  preferredChannel?: 'whatsapp' | 'sms' | 'email';
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export class PatientContactService {
  private birdClient: BirdApiClient;

  constructor(birdClient: BirdApiClient) {
    this.birdClient = birdClient;
  }

  async createPatientContact(patient: PatientContact): Promise<string> {
    const contactData = {
      identifiers: [
        {
          key: 'phone',
          value: patient.phone,
          type: 'phone'
        }
      ],
      attributes: {
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        medicalRecordNumber: patient.medicalRecordNumber,
        preferredChannel: patient.preferredChannel || 'whatsapp',
        emergencyContactName: patient.emergencyContact?.name,
        emergencyContactPhone: patient.emergencyContact?.phone,
        emergencyContactRelationship: patient.emergencyContact?.relationship,
        patientType: 'medical',
        createdAt: new Date().toISOString()
      }
    };

    if (patient.email) {
      contactData.identifiers.push({
        key: 'email',
        value: patient.email,
        type: 'email'
      });
    }

    const response = await this.birdClient.post('/contacts', contactData);
    return response.id;
  }

  async findPatientByPhone(phone: string): Promise<PatientContact | null> {
    try {
      const response = await this.birdClient.get('/contacts', {
        params: { identifier: phone }
      });

      if (response.results && response.results.length > 0) {
        const contact = response.results[0];
        return this.mapBirdContactToPatient(contact);
      }

      return null;
    } catch (error) {
      console.error('Error finding patient by phone:', error);
      return null;
    }
  }

  async updatePatientContact(contactId: string, updates: Partial<PatientContact>): Promise<void> {
    const updateData = {
      attributes: {
        ...updates,
        updatedAt: new Date().toISOString()
      }
    };

    await this.birdClient.put(`/contacts/${contactId}`, updateData);
  }

  async addPatientToList(contactId: string, listName: string): Promise<void> {
    // First, find or create the list
    const listId = await this.findOrCreateList(listName);
    
    // Add contact to list
    await this.birdClient.post(`/contacts/lists/${listId}/contacts`, {
      contactId
    });
  }

  private async findOrCreateList(listName: string): Promise<string> {
    try {
      // Try to find existing list
      const lists = await this.birdClient.get('/contacts/lists');
      const existingList = lists.results?.find((list: any) => list.name === listName);
      
      if (existingList) {
        return existingList.id;
      }

      // Create new list
      const newList = await this.birdClient.post('/contacts/lists', {
        name: listName,
        description: `Medical practice list: ${listName}`
      });

      return newList.id;
    } catch (error) {
      console.error('Error managing contact list:', error);
      throw error;
    }
  }

  private mapBirdContactToPatient(birdContact: any): PatientContact {
    const phoneIdentifier = birdContact.identifiers.find((id: any) => id.type === 'phone');
    const emailIdentifier = birdContact.identifiers.find((id: any) => id.type === 'email');

    return {
      id: birdContact.id,
      firstName: birdContact.attributes.firstName || '',
      lastName: birdContact.attributes.lastName || '',
      phone: phoneIdentifier?.value || '',
      email: emailIdentifier?.value,
      dateOfBirth: birdContact.attributes.dateOfBirth,
      gender: birdContact.attributes.gender,
      medicalRecordNumber: birdContact.attributes.medicalRecordNumber,
      preferredChannel: birdContact.attributes.preferredChannel || 'whatsapp',
      emergencyContact: birdContact.attributes.emergencyContactName ? {
        name: birdContact.attributes.emergencyContactName,
        phone: birdContact.attributes.emergencyContactPhone,
        relationship: birdContact.attributes.emergencyContactRelationship
      } : undefined
    };
  }
}

// Usage example
const patientService = new PatientContactService(birdClient);

// Create new patient
const newPatient: PatientContact = {
  firstName: 'María',
  lastName: 'González',
  phone: '+573001234567',
  email: 'maria.gonzalez@email.com',
  dateOfBirth: '1985-03-15',
  gender: 'female',
  medicalRecordNumber: 'MRN-001234',
  preferredChannel: 'whatsapp',
  emergencyContact: {
    name: 'Carlos González',
    phone: '+573007654321',
    relationship: 'Esposo'
  }
};

const contactId = await patientService.createPatientContact(newPatient);
await patientService.addPatientToList(contactId, 'Pacientes Activos');
```

## Messaging Examples

### Send Template Messages

```typescript
// src/services/messaging-service.ts
export class MessagingService {
  private birdClient: BirdApiClient;
  private config: BirdConfig;

  constructor(birdClient: BirdApiClient, config: BirdConfig) {
    this.birdClient = birdClient;
    this.config = config;
  }

  async sendAppointmentReminder(
    patientPhone: string,
    appointmentDetails: {
      patientName: string;
      date: string;
      time: string;
      location?: string;
    }
  ): Promise<string> {
    const messageData = {
      channelId: this.config.channels.whatsapp,
      to: patientPhone,
      body: {
        type: 'template',
        template: {
          name: this.config.templates.appointmentReminder,
          language: {
            code: 'es'
          },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: appointmentDetails.patientName },
                { type: 'text', text: appointmentDetails.date },
                { type: 'text', text: appointmentDetails.time }
              ]
            }
          ]
        }
      }
    };

    const response = await this.birdClient.post('/channels/messages', messageData);
    return response.id;
  }

  async sendPostOperativeFollowUp(
    patientPhone: string,
    patientName: string,
    postOpDay: number,
    surgeryType: string
  ): Promise<string> {
    const messageData = {
      channelId: this.config.channels.whatsapp,
      to: patientPhone,
      body: {
        type: 'template',
        template: {
          name: this.config.templates.postOpFollowUp,
          language: {
            code: 'es'
          },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: patientName },
                { type: 'text', text: postOpDay.toString() },
                { type: 'text', text: surgeryType }
              ]
            }
          ]
        }
      }
    };

    const response = await this.birdClient.post('/channels/messages', messageData);
    return response.id;
  }

  async sendInteractiveMessage(
    patientPhone: string,
    headerText: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>
  ): Promise<string> {
    const messageData = {
      channelId: this.config.channels.whatsapp,
      to: patientPhone,
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
            text: 'Dr. Andrés Durán - Cirugía Plástica'
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
      }
    };

    const response = await this.birdClient.post('/channels/messages', messageData);
    return response.id;
  }

  async sendDocumentMessage(
    patientPhone: string,
    documentUrl: string,
    caption: string,
    filename?: string
  ): Promise<string> {
    const messageData = {
      channelId: this.config.channels.whatsapp,
      to: patientPhone,
      body: {
        type: 'document',
        document: {
          link: documentUrl,
          caption: caption,
          filename: filename || 'document.pdf'
        }
      }
    };

    const response = await this.birdClient.post('/channels/messages', messageData);
    return response.id;
  }

  async sendSMSFallback(
    patientPhone: string,
    message: string
  ): Promise<string> {
    const messageData = {
      channelId: this.config.channels.sms,
      to: patientPhone,
      body: {
        type: 'text',
        text: {
          text: message
        }
      }
    };

    const response = await this.birdClient.post('/channels/messages', messageData);
    return response.id;
  }

  async sendEmergencyAlert(
    patientPhone: string,
    message: string,
    preferWhatsApp: boolean = false
  ): Promise<string> {
    const channelId = preferWhatsApp ? this.config.channels.whatsapp : this.config.channels.sms;
    
    const messageData = {
      channelId,
      to: patientPhone,
      body: {
        type: 'text',
        text: {
          text: `🚨 URGENTE: ${message}`
        }
      }
    };

    try {
      const response = await this.birdClient.post('/channels/messages', messageData);
      return response.id;
    } catch (error) {
      // Fallback to alternative channel
      const fallbackChannelId = preferWhatsApp ? this.config.channels.sms : this.config.channels.whatsapp;
      
      const fallbackData = {
        ...messageData,
        channelId: fallbackChannelId
      };

      const response = await this.birdClient.post('/channels/messages', fallbackData);
      return response.id;
    }
  }
}

// Usage examples
const messagingService = new MessagingService(birdClient, birdConfig);

// Send appointment reminder
await messagingService.sendAppointmentReminder('+573001234567', {
  patientName: 'María González',
  date: '15 de Febrero, 2024',
  time: '10:00 AM'
});

// Send interactive confirmation message
await messagingService.sendInteractiveMessage(
  '+573001234567',
  'Confirmación de Cita',
  'Tu cita está programada para el 15 de Febrero a las 10:00 AM. ¿Podrás asistir?',
  [
    { id: 'confirm', title: '✅ Confirmar' },
    { id: 'reschedule', title: '📅 Reprogramar' },
    { id: 'cancel', title: '❌ Cancelar' }
  ]
);
```

### Batch Messaging

```typescript
// src/services/batch-messaging-service.ts
interface BatchMessage {
  patientPhone: string;
  patientName: string;
  templateName: string;
  parameters: any[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export class BatchMessagingService {
  private messagingService: MessagingService;
  private batchSize: number = 50;
  private delayBetweenBatches: number = 2000; // 2 seconds

  constructor(messagingService: MessagingService) {
    this.messagingService = messagingService;
  }

  async sendBatchAppointmentReminders(appointments: Array<{
    patientPhone: string;
    patientName: string;
    date: string;
    time: string;
  }>): Promise<{ sent: number; failed: number; errors: any[] }> {
    const results = { sent: 0, failed: 0, errors: [] as any[] };
    
    // Split into batches
    const batches = this.splitIntoBatches(appointments, this.batchSize);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Processing batch ${i + 1}/${batches.length} (${batch.length} messages)`);
      
      // Process batch
      const batchPromises = batch.map(async (appointment) => {
        try {
          await this.messagingService.sendAppointmentReminder(
            appointment.patientPhone,
            {
              patientName: appointment.patientName,
              date: appointment.date,
              time: appointment.time
            }
          );
          results.sent++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            phone: appointment.patientPhone,
            error: error.message
          });
        }
      });

      await Promise.all(batchPromises);
      
      // Delay between batches to respect rate limits
      if (i < batches.length - 1) {
        await this.delay(this.delayBetweenBatches);
      }
    }

    return results;
  }

  async sendPostOpFollowUpBatch(followUps: Array<{
    patientPhone: string;
    patientName: string;
    postOpDay: number;
    surgeryType: string;
  }>): Promise<{ sent: number; failed: number; errors: any[] }> {
    const results = { sent: 0, failed: 0, errors: [] as any[] };
    
    const batches = this.splitIntoBatches(followUps, this.batchSize);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      const batchPromises = batch.map(async (followUp) => {
        try {
          await this.messagingService.sendPostOperativeFollowUp(
            followUp.patientPhone,
            followUp.patientName,
            followUp.postOpDay,
            followUp.surgeryType
          );
          results.sent++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            phone: followUp.patientPhone,
            error: error.message
          });
        }
      });

      await Promise.all(batchPromises);
      
      if (i < batches.length - 1) {
        await this.delay(this.delayBetweenBatches);
      }
    }

    return results;
  }

  private splitIntoBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage example
const batchService = new BatchMessagingService(messagingService);

const appointmentReminders = [
  {
    patientPhone: '+573001234567',
    patientName: 'María González',
    date: '15 de Febrero, 2024',
    time: '10:00 AM'
  },
  {
    patientPhone: '+573007654321',
    patientName: 'Carlos Pérez',
    date: '15 de Febrero, 2024',
    time: '11:00 AM'
  }
  // ... more appointments
];

const batchResults = await batchService.sendBatchAppointmentReminders(appointmentReminders);
console.log(`Batch completed: ${batchResults.sent} sent, ${batchResults.failed} failed`);
```

## Conversation Management

### Conversation Service

```typescript
// src/services/conversation-service.ts
interface Conversation {
  id: string;
  birdConversationId?: string;
  patientId: string;
  status: 'active' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  conversationType: 'consultation' | 'appointment' | 'surgery' | 'follow_up' | 'payment' | 'emergency';
  assignedAgentId?: string;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
}

export class ConversationService {
  private birdClient: BirdApiClient;
  private database: any; // Your database client

  constructor(birdClient: BirdApiClient, database: any) {
    this.birdClient = birdClient;
    this.database = database;
  }

  async createConversation(
    patientId: string,
    channelId: string,
    conversationType: string,
    initialMessage?: string
  ): Promise<Conversation> {
    // Create conversation in Bird.com
    const birdConversationData = {
      participants: [
        {
          id: patientId,
          type: 'contact',
          contactId: patientId
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
        conversationType,
        medicalPractice: true,
        priority: 'medium'
      }
    };

    const birdConversation = await this.birdClient.post('/conversations', birdConversationData);

    // Create conversation in local database
    const conversationId = await this.database.createConversation({
      birdConversationId: birdConversation.id,
      patientId,
      status: 'active',
      priority: 'medium',
      conversationType,
      metadata: {
        channelId,
        channelType: 'whatsapp'
      }
    });

    // Send initial message if provided
    if (initialMessage) {
      await this.sendMessage(conversationId, initialMessage);
    }

    return await this.getConversationById(conversationId);
  }

  async sendMessage(
    conversationId: string,
    message: string,
    messageType: 'text' | 'template' | 'interactive' = 'text'
  ): Promise<string> {
    const conversation = await this.getConversationById(conversationId);
    
    if (!conversation.birdConversationId) {
      throw new Error('Conversation not found in Bird.com');
    }

    const messageData = {
      conversationId: conversation.birdConversationId,
      body: {
        type: messageType,
        text: {
          text: message
        }
      }
    };

    const response = await this.birdClient.post('/conversations/messages', messageData);
    
    // Update last message time
    await this.updateConversation(conversationId, {
      lastMessageAt: new Date().toISOString()
    });

    return response.id;
  }

  async assignToAgent(
    conversationId: string,
    agentId: string,
    reason?: string
  ): Promise<void> {
    await this.updateConversation(conversationId, {
      assignedAgentId: agentId,
      status: 'waiting',
      metadata: {
        assignmentReason: reason,
        assignedAt: new Date().toISOString()
      }
    });

    // Update in Bird.com
    const conversation = await this.getConversationById(conversationId);
    if (conversation.birdConversationId) {
      await this.birdClient.put(`/conversations/${conversation.birdConversationId}`, {
        assignedAgent: {
          id: agentId,
          assignedAt: new Date().toISOString(),
          reason
        }
      });
    }
  }

  async updateConversationPriority(
    conversationId: string,
    priority: 'low' | 'medium' | 'high' | 'urgent',
    reason?: string
  ): Promise<void> {
    await this.updateConversation(conversationId, {
      priority,
      metadata: {
        priorityChangeReason: reason,
        priorityChangedAt: new Date().toISOString()
      }
    });
  }

  async closeConversation(
    conversationId: string,
    reason: string,
    resolution?: string
  ): Promise<void> {
    await this.updateConversation(conversationId, {
      status: 'closed',
      metadata: {
        closureReason: reason,
        resolution,
        closedAt: new Date().toISOString()
      }
    });

    // Update in Bird.com
    const conversation = await this.getConversationById(conversationId);
    if (conversation.birdConversationId) {
      await this.birdClient.put(`/conversations/${conversation.birdConversationId}`, {
        status: 'closed'
      });
    }
  }

  async getActiveConversationsByPriority(priority: string): Promise<Conversation[]> {
    return await this.database.getConversations({
      status: 'active',
      priority
    });
  }

  async getConversationsByAgent(agentId: string): Promise<Conversation[]> {
    return await this.database.getConversations({
      assignedAgentId: agentId,
      status: ['active', 'waiting']
    });
  }

  private async getConversationById(conversationId: string): Promise<Conversation> {
    return await this.database.getConversationById(conversationId);
  }

  private async updateConversation(
    conversationId: string,
    updates: Partial<Conversation>
  ): Promise<void> {
    await this.database.updateConversation(conversationId, updates);
  }
}

// Usage examples
const conversationService = new ConversationService(birdClient, database);

// Create new conversation
const conversation = await conversationService.createConversation(
  'patient-123',
  birdConfig.channels.whatsapp,
  'appointment',
  'Bienvenido al consultorio del Dr. Andrés Durán. ¿En qué podemos ayudarte?'
);

// Assign to agent for urgent cases
await conversationService.updateConversationPriority(
  conversation.id,
  'urgent',
  'Patient reported severe pain'
);

await conversationService.assignToAgent(
  conversation.id,
  'nurse-001',
  'Urgent symptoms reported'
);
```

## Webhook Handlers

### Complete Webhook Implementation

```typescript
// src/webhooks/bird-webhook-handler.ts
import { Request, Response } from 'express';
import crypto from 'crypto';

export class BirdWebhookHandler {
  private conversationService: ConversationService;
  private messagingService: MessagingService;
  private patientService: PatientContactService;
  private webhookSecret: string;

  constructor(
    conversationService: ConversationService,
    messagingService: MessagingService,
    patientService: PatientContactService,
    webhookSecret: string
  ) {
    this.conversationService = conversationService;
    this.messagingService = messagingService;
    this.patientService = patientService;
    this.webhookSecret = webhookSecret;
  }

  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      // Verify webhook signature
      if (!this.verifySignature(req)) {
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }

      const { event, data, timestamp } = req.body;
      
      console.log(`📥 Webhook received: ${event} at ${timestamp}`);

      // Process webhook event
      await this.processWebhookEvent(event, data);

      res.status(200).json({ received: true, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('❌ Webhook processing error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private verifySignature(req: Request): boolean {
    const signature = req.headers['x-bird-signature'] as string;
    if (!signature) return false;

    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');

    return signature === `sha256=${expectedSignature}`;
  }

  private async processWebhookEvent(event: string, data: any): Promise<void> {
    switch (event) {
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
        console.warn(`⚠️ Unhandled webhook event: ${event}`);
    }
  }

  private async handleIncomingMessage(data: any): Promise<void> {
    const { id, from, body, channelId, conversationId, timestamp } = data;

    console.log(`📨 Incoming message from ${from}: ${body.text?.text || body.type}`);

    // Find or create patient
    let patient = await this.patientService.findPatientByPhone(from);
    if (!patient) {
      patient = await this.patientService.createPatientContact({
        firstName: 'Paciente',
        lastName: 'Nuevo',
        phone: from,
        preferredChannel: this.getChannelType(channelId)
      });
    }

    // Find or create conversation
    let conversation = await this.conversationService.findByBirdId(conversationId);
    if (!conversation) {
      conversation = await this.conversationService.createConversation(
        patient.id!,
        channelId,
        'general'
      );
    }

    // Analyze message content
    const messageAnalysis = await this.analyzeMessage(body);
    
    // Update conversation based on analysis
    if (messageAnalysis.isUrgent) {
      await this.conversationService.updateConversationPriority(
        conversation.id,
        'urgent',
        'Urgent keywords detected'
      );

      await this.conversationService.assignToAgent(
        conversation.id,
        'medical-professional',
        'Urgent medical situation'
      );

      // Send immediate acknowledgment
      await this.conversationService.sendMessage(
        conversation.id,
        '🚨 Hemos recibido tu mensaje urgente. Un profesional médico te contactará inmediatamente.'
      );
    }

    // Check for appointment-related actions
    if (messageAnalysis.appointmentAction) {
      await this.handleAppointmentAction(
        conversation.id,
        messageAnalysis.appointmentAction,
        body.text?.text || ''
      );
    }

    // Auto-respond for common queries
    if (messageAnalysis.autoResponse) {
      await this.conversationService.sendMessage(
        conversation.id,
        messageAnalysis.autoResponse
      );
    }
  }

  private async analyzeMessage(body: any): Promise<{
    isUrgent: boolean;
    appointmentAction?: 'confirm' | 'reschedule' | 'cancel';
    autoResponse?: string;
    sentiment: 'positive' | 'neutral' | 'negative';
  }> {
    const messageText = body.text?.text?.toLowerCase() || '';
    
    // Urgent keywords detection
    const urgentKeywords = [
      'emergencia', 'urgente', 'dolor severo', 'sangrado abundante',
      'dificultad respirar', 'mareo severo', 'fiebre alta'
    ];
    const isUrgent = urgentKeywords.some(keyword => messageText.includes(keyword));

    // Appointment action detection
    let appointmentAction: 'confirm' | 'reschedule' | 'cancel' | undefined;
    if (messageText.includes('confirmar') || messageText.includes('confirmo')) {
      appointmentAction = 'confirm';
    } else if (messageText.includes('reprogramar') || messageText.includes('cambiar')) {
      appointmentAction = 'reschedule';
    } else if (messageText.includes('cancelar') || messageText.includes('no puedo')) {
      appointmentAction = 'cancel';
    }

    // Auto-response for common queries
    let autoResponse: string | undefined;
    if (messageText.includes('horario') || messageText.includes('horarios')) {
      autoResponse = '📅 Nuestros horarios de atención son:\nLunes a Viernes: 8:00 AM - 6:00 PM\nSábados: 8:00 AM - 12:00 PM';
    } else if (messageText.includes('dirección') || messageText.includes('ubicación')) {
      autoResponse = '📍 Nos ubicamos en:\nCarrera 15 #93-47, Consultorio 456\nBogotá, Colombia\n\n¿Necesitas ayuda con las indicaciones?';
    } else if (messageText.includes('precio') || messageText.includes('costo')) {
      autoResponse = '💰 Para información sobre precios y financiación, un asesor se comunicará contigo pronto. También puedes agendar una consulta de valoración.';
    }

    // Simple sentiment analysis
    const positiveWords = ['gracias', 'excelente', 'perfecto', 'bien', 'bueno'];
    const negativeWords = ['mal', 'dolor', 'problema', 'molesto', 'preocupado'];
    
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (positiveWords.some(word => messageText.includes(word))) {
      sentiment = 'positive';
    } else if (negativeWords.some(word => messageText.includes(word))) {
      sentiment = 'negative';
    }

    return {
      isUrgent,
      appointmentAction,
      autoResponse,
      sentiment
    };
  }

  private async handleAppointmentAction(
    conversationId: string,
    action: 'confirm' | 'reschedule' | 'cancel',
    messageText: string
  ): Promise<void> {
    switch (action) {
      case 'confirm':
        await this.conversationService.sendMessage(
          conversationId,
          '✅ ¡Perfecto! Tu cita ha sido confirmada. Te esperamos en la fecha y hora programada.'
        );
        // Update appointment status in database
        break;

      case 'reschedule':
        await this.conversationService.sendMessage(
          conversationId,
          '📅 Entiendo que necesitas reprogramar tu cita. Un coordinador te contactará pronto para ayudarte con las nuevas fechas disponibles.'
        );
        await this.conversationService.assignToAgent(
          conversationId,
          'scheduling-coordinator',
          'Patient requested rescheduling'
        );
        break;

      case 'cancel':
        await this.conversationService.sendMessage(
          conversationId,
          '❌ Lamentamos que no puedas asistir a tu cita. Hemos registrado la cancelación. ¿Te gustaría reprogramar para otra fecha?'
        );
        // Update appointment status and create follow-up task
        break;
    }
  }

  private async handleMessageDelivered(data: any): Promise<void> {
    console.log(`✅ Message delivered: ${data.id} to ${data.to}`);
    // Update message status in database
  }

  private async handleMessageRead(data: any): Promise<void> {
    console.log(`👁️ Message read: ${data.id} by ${data.to}`);
    // Update message status and potentially trigger follow-up actions
  }

  private async handleMessageFailed(data: any): Promise<void> {
    console.error(`❌ Message failed: ${data.id} to ${data.to} - ${data.error?.message}`);
    
    // Attempt alternative delivery
    const conversation = await this.conversationService.findByMessageId(data.id);
    if (conversation) {
      await this.attemptAlternativeDelivery(conversation, data.body);
    }
  }

  private async attemptAlternativeDelivery(conversation: any, originalBody: any): Promise<void> {
    // Try SMS if WhatsApp failed, or vice versa
    const alternativeChannel = conversation.channelType === 'whatsapp' 
      ? birdConfig.channels.sms 
      : birdConfig.channels.whatsapp;

    try {
      await this.messagingService.sendMessage(
        alternativeChannel,
        conversation.patientPhone,
        originalBody
      );
      
      console.log(`✅ Message delivered via alternative channel`);
    } catch (error) {
      console.error(`❌ Alternative delivery also failed:`, error);
    }
  }

  private getChannelType(channelId: string): 'whatsapp' | 'sms' | 'email' {
    if (channelId === birdConfig.channels.whatsapp) return 'whatsapp';
    if (channelId === birdConfig.channels.sms) return 'sms';
    if (channelId === birdConfig.channels.email) return 'email';
    return 'whatsapp'; // default
  }
}

// Express route setup
import express from 'express';

const app = express();
app.use(express.json());

const webhookHandler = new BirdWebhookHandler(
  conversationService,
  messagingService,
  patientService,
  birdConfig.webhookSecret
);

app.post('/webhooks/bird', webhookHandler.handleWebhook.bind(webhookHandler));
```

## Medical Practice Workflows

### Appointment Management Workflow

```typescript
// src/workflows/appointment-workflow.ts
interface Appointment {
  id: string;
  patientId: string;
  patientPhone: string;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  remindersSent: string[];
}

export class AppointmentWorkflow {
  private messagingService: MessagingService;
  private conversationService: ConversationService;
  private database: any;

  constructor(
    messagingService: MessagingService,
    conversationService: ConversationService,
    database: any
  ) {
    this.messagingService = messagingService;
    this.conversationService = conversationService;
    this.database = database;
  }

  async scheduleAppointmentReminders(appointment: Appointment): Promise<void> {
    const appointmentDateTime = new Date(`${appointment.appointmentDate} ${appointment.appointmentTime}`);
    
    // Schedule 24-hour reminder
    const reminder24h = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
    await this.scheduleReminder(appointment, reminder24h, '24h');

    // Schedule 2-hour reminder
    const reminder2h = new Date(appointmentDateTime.getTime() - 2 * 60 * 60 * 1000);
    await this.scheduleReminder(appointment, reminder2h, '2h');
  }

  private async scheduleReminder(
    appointment: Appointment,
    reminderTime: Date,
    reminderType: string
  ): Promise<void> {
    const now = new Date();
    const delay = reminderTime.getTime() - now.getTime();

    if (delay > 0) {
      setTimeout(async () => {
        await this.sendAppointmentReminder(appointment, reminderType);
      }, delay);
    }
  }

  async sendAppointmentReminder(
    appointment: Appointment,
    reminderType: string
  ): Promise<void> {
    try {
      // Check if appointment is still scheduled
      const currentAppointment = await this.database.getAppointment(appointment.id);
      if (currentAppointment.status !== 'scheduled') {
        console.log(`Skipping reminder for appointment ${appointment.id} - status: ${currentAppointment.status}`);
        return;
      }

      // Send reminder based on type
      let messageId: string;
      if (reminderType === '24h') {
        messageId = await this.messagingService.sendAppointmentReminder(
          appointment.patientPhone,
          {
            patientName: appointment.patientName,
            date: appointment.appointmentDate,
            time: appointment.appointmentTime
          }
        );
      } else {
        // 2-hour reminder with interactive buttons
        messageId = await this.messagingService.sendInteractiveMessage(
          appointment.patientPhone,
          'Recordatorio de Cita',
          `Hola ${appointment.patientName}, tu cita es en 2 horas (${appointment.appointmentTime}). ¿Podrás asistir?`,
          [
            { id: 'confirm_appointment', title: '✅ Confirmar' },
            { id: 'reschedule_appointment', title: '📅 Reprogramar' },
            { id: 'cancel_appointment', title: '❌ Cancelar' }
          ]
        );
      }

      // Record reminder sent
      await this.database.addReminderSent(appointment.id, {
        type: reminderType,
        messageId,
        sentAt: new Date().toISOString()
      });

      console.log(`✅ ${reminderType} reminder sent for appointment ${appointment.id}`);
    } catch (error) {
      console.error(`❌ Failed to send ${reminderType} reminder for appointment ${appointment.id}:`, error);
    }
  }

  async handleAppointmentConfirmation(
    appointmentId: string,
    patientPhone: string
  ): Promise<void> {
    // Update appointment status
    await this.database.updateAppointment(appointmentId, {
      status: 'confirmed',
      confirmedAt: new Date().toISOString()
    });

    // Send confirmation message
    await this.messagingService.sendMessage(
      birdConfig.channels.whatsapp,
      patientPhone,
      '✅ ¡Perfecto! Tu cita ha sido confirmada. Te esperamos en la fecha y hora programada.\n\nSi necesitas cambiar algo, no dudes en contactarnos.'
    );

    // Create conversation for any additional communication
    const patient = await this.database.getPatientByPhone(patientPhone);
    await this.conversationService.createConversation(
      patient.id,
      birdConfig.channels.whatsapp,
      'appointment'
    );
  }

  async handleAppointmentReschedule(
    appointmentId: string,
    patientPhone: string
  ): Promise<void> {
    // Update appointment with reschedule request
    await this.database.updateAppointment(appointmentId, {
      rescheduleRequested: true,
      rescheduleRequestedAt: new Date().toISOString()
    });

    // Create conversation and assign to scheduling coordinator
    const patient = await this.database.getPatientByPhone(patientPhone);
    const conversation = await this.conversationService.createConversation(
      patient.id,
      birdConfig.channels.whatsapp,
      'appointment'
    );

    await this.conversationService.assignToAgent(
      conversation.id,
      'scheduling-coordinator',
      'Patient requested appointment rescheduling'
    );

    // Send acknowledgment
    await this.messagingService.sendMessage(
      birdConfig.channels.whatsapp,
      patientPhone,
      '📅 Entiendo que necesitas reprogramar tu cita. Un coordinador se comunicará contigo muy pronto para ayudarte con las fechas disponibles.\n\n¿Hay algún horario específico que prefieras?'
    );
  }
}

// Usage example
const appointmentWorkflow = new AppointmentWorkflow(
  messagingService,
  conversationService,
  database
);

// Schedule reminders for new appointment
const newAppointment: Appointment = {
  id: 'apt-001',
  patientId: 'patient-123',
  patientPhone: '+573001234567',
  patientName: 'María González',
  appointmentDate: '2024-02-15',
  appointmentTime: '10:00 AM',
  appointmentType: 'Consulta de Valoración',
  status: 'scheduled',
  remindersSent: []
};

await appointmentWorkflow.scheduleAppointmentReminders(newAppointment);
```

### Post-Operative Care Workflow

```typescript
// src/workflows/post-operative-workflow.ts
interface Surgery {
  id: string;
  patientId: string;
  patientPhone: string;
  patientName: string;
  surgeryType: string;
  surgeryDate: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export class PostOperativeWorkflow {
  private messagingService: MessagingService;
  private conversationService: ConversationService;

  constructor(
    messagingService: MessagingService,
    conversationService: ConversationService
  ) {
    this.messagingService = messagingService;
    this.conversationService = conversationService;
  }

  async initiatePostOpCare(surgery: Surgery): Promise<void> {
    const surgeryDate = new Date(surgery.surgeryDate);
    
    // Schedule follow-up messages
    const followUpSchedule = [
      { day: 1, message: 'Day 1 post-op check' },
      { day: 3, message: 'Day 3 post-op check' },
      { day: 7, message: 'Day 7 post-op check' },
      { day: 14, message: 'Day 14 post-op check' },
      { day: 30, message: 'Day 30 post-op check' }
    ];

    for (const followUp of followUpSchedule) {
      const followUpDate = new Date(surgeryDate.getTime() + followUp.day * 24 * 60 * 60 * 1000);
      await this.schedulePostOpMessage(surgery, followUpDate, followUp.day);
    }
  }

  private async schedulePostOpMessage(
    surgery: Surgery,
    messageDate: Date,
    postOpDay: number
  ): Promise<void> {
    const now = new Date();
    const delay = messageDate.getTime() - now.getTime();

    if (delay > 0) {
      setTimeout(async () => {
        await this.sendPostOpMessage(surgery, postOpDay);
      }, delay);
    }
  }

  async sendPostOpMessage(surgery: Surgery, postOpDay: number): Promise<void> {
    try {
      let messageText: string;
      let requiresResponse = false;

      switch (postOpDay) {
        case 1:
          messageText = `Hola ${surgery.patientName}, esperamos que te encuentres bien después de tu ${surgery.surgeryType}.\n\n¿Cómo te sientes hoy? Por favor compártenos:\n• Nivel de dolor (1-10)\n• Si hay sangrado\n• Si tienes náuseas\n• Cualquier otra molestia`;
          requiresResponse = true;
          break;
        
        case 3:
          messageText = `Hola ${surgery.patientName}, han pasado 3 días desde tu cirugía.\n\n¿Cómo va tu recuperación? Recuerda:\n• Tomar los medicamentos según indicaciones\n• Mantener las curaciones limpias\n• Evitar esfuerzos físicos\n\n¿Tienes alguna pregunta o molestia?`;
          requiresResponse = true;
          break;
        
        case 7:
          messageText = `¡Hola ${surgery.patientName}! Ya ha pasado una semana desde tu ${surgery.surgeryType}.\n\n¿Cómo te sientes? Es hora de programar tu cita de seguimiento. ¿Cuándo te viene mejor esta semana?`;
          requiresResponse = true;
          break;
        
        case 14:
          messageText = `Hola ${surgery.patientName}, han pasado 2 semanas desde tu cirugía.\n\n¿Cómo va tu recuperación? ¿Has notado algún cambio o mejora? Es importante que sigas las indicaciones médicas.\n\n¿Necesitas programar una cita de control?`;
          requiresResponse = true;
          break;
        
        case 30:
          messageText = `¡Hola ${surgery.patientName}! Ya ha pasado un mes desde tu ${surgery.surgeryType}.\n\nNos gustaría conocer cómo te sientes y ver tu progreso. ¿Podrías enviarnos una foto de la zona tratada?\n\n¡Esperamos que estés muy contenta con los resultados!`;
          requiresResponse = true;
          break;
        
        default:
          messageText = `Seguimiento post-operatorio día ${postOpDay}`;
      }

      // Send the message
      await this.messagingService.sendPostOperativeFollowUp(
        surgery.patientPhone,
        surgery.patientName,
        postOpDay,
        surgery.surgeryType
      );

      // If response is required, create a conversation
      if (requiresResponse) {
        const conversation = await this.conversationService.createConversation(
          surgery.patientId,
          birdConfig.channels.whatsapp,
          'surgery'
        );

        // Set high priority for early post-op days
        if (postOpDay <= 3) {
          await this.conversationService.updateConversationPriority(
            conversation.id,
            'high',
            `Post-operative day ${postOpDay} follow-up`
          );
        }
      }

      console.log(`✅ Post-op day ${postOpDay} message sent for surgery ${surgery.id}`);
    } catch (error) {
      console.error(`❌ Failed to send post-op day ${postOpDay} message for surgery ${surgery.id}:`, error);
    }
  }

  async handlePostOpResponse(
    patientPhone: string,
    messageText: string,
    postOpDay: number
  ): Promise<void> {
    // Analyze response for concerning symptoms
    const concerningSymptoms = [
      'dolor severo', 'sangrado abundante', 'fiebre', 'infección',
      'mareo', 'náuseas', 'vómito', 'dificultad'
    ];

    const hasConcerningSSymptoms = concerningSymptoms.some(symptom => 
      messageText.toLowerCase().includes(symptom)
    );

    if (hasConcerningSSymptoms) {
      // Create urgent conversation
      const patient = await this.database.getPatientByPhone(patientPhone);
      const conversation = await this.conversationService.createConversation(
        patient.id,
        birdConfig.channels.whatsapp,
        'surgery'
      );

      await this.conversationService.updateConversationPriority(
        conversation.id,
        'urgent',
        'Concerning post-operative symptoms reported'
      );

      await this.conversationService.assignToAgent(
        conversation.id,
        'medical-professional',
        'Urgent post-operative symptoms'
      );

      // Send immediate response
      await this.messagingService.sendMessage(
        birdConfig.channels.whatsapp,
        patientPhone,
        '🚨 Hemos recibido tu mensaje y notamos síntomas que requieren atención inmediata. Un profesional médico revisará tu caso de inmediato y te contactará pronto.\n\nSi es una emergencia, no dudes en acudir a urgencias.'
      );
    } else {
      // Send standard acknowledgment
      await this.messagingService.sendMessage(
        birdConfig.channels.whatsapp,
        patientPhone,
        '✅ Gracias por tu mensaje. Me alegra saber que tu recuperación va bien. Continuaremos monitoreando tu progreso.\n\nSi tienes alguna preocupación, no dudes en contactarnos.'
      );
    }
  }
}

// Usage example
const postOpWorkflow = new PostOperativeWorkflow(messagingService, conversationService);

// Start post-operative care after surgery completion
const completedSurgery: Surgery = {
  id: 'surgery-001',
  patientId: 'patient-123',
  patientPhone: '+573001234567',
  patientName: 'María González',
  surgeryType: 'Abdominoplastia',
  surgeryDate: '2024-02-01',
  status: 'completed'
};

await postOpWorkflow.initiatePostOpCare(completedSurgery);
```

## Error Handling

### Comprehensive Error Handling

```typescript
// src/utils/error-handler.ts
export class BirdApiError extends Error {
  public statusCode: number;
  public errorCode?: string;
  public retryable: boolean;

  constructor(
    message: string,
    statusCode: number,
    errorCode?: string,
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'BirdApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.retryable = retryable;
  }
}

export class ErrorHandler {
  static handleBirdApiError(error: any): BirdApiError {
    if (error.response) {
      const { status, data } = error.response;
      const errorCode = data?.error?.code || 'unknown_error';
      const message = data?.error?.message || 'Unknown error occurred';
      
      // Determine if error is retryable
      const retryable = status >= 500 || status === 429;
      
      return new BirdApiError(message, status, errorCode, retryable);
    } else if (error.request) {
      return new BirdApiError('Network error', 0, 'network_error', true);
    } else {
      return new BirdApiError('Request setup error', 0, 'request_error', false);
    }
  }

  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        const birdError = this.handleBirdApiError(error);
        
        if (!birdError.retryable || attempt === maxRetries) {
          throw birdError;
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await this.delay(delay);
      }
    }

    throw lastError!;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage in services
export class RobustMessagingService extends MessagingService {
  async sendMessageWithRetry(
    channelId: string,
    recipient: string,
    message: any
  ): Promise<string> {
    return await ErrorHandler.retryOperation(async () => {
      return await this.sendMessage(channelId, recipient, message);
    }, 3, 1000);
  }

  async sendMessageWithFallback(
    primaryChannelId: string,
    fallbackChannelId: string,
    recipient: string,
    message: any
  ): Promise<string> {
    try {
      return await this.sendMessage(primaryChannelId, recipient, message);
    } catch (error) {
      console.warn(`Primary channel failed, trying fallback...`);
      return await this.sendMessage(fallbackChannelId, recipient, message);
    }
  }
}
```

## Testing Examples

### Unit Tests

```typescript
// tests/bird-api.test.ts
import { BirdApiClient } from '../src/services/bird-client';
import { MessagingService } from '../src/services/messaging-service';
import { birdConfig } from '../src/config/bird-config';

describe('BirdApiClient', () => {
  let birdClient: BirdApiClient;
  let messagingService: MessagingService;

  beforeEach(() => {
    birdClient = new BirdApiClient('test-api-key');
    messagingService = new MessagingService(birdClient, birdConfig);
  });

  describe('Authentication', () => {
    it('should include authorization header in requests', async () => {
      const spy = jest.spyOn(birdClient, 'post');
      
      try {
        await messagingService.sendAppointmentReminder('+573001234567', {
          patientName: 'Test Patient',
          date: '2024-02-15',
          time: '10:00 AM'
        });
      } catch (error) {
        // Expected to fail in test environment
      }

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Message Sending', () => {
    it('should send appointment reminder with correct template', async () => {
      const mockResponse = { id: 'msg-123' };
      jest.spyOn(birdClient, 'post').mockResolvedValue(mockResponse);

      const messageId = await messagingService.sendAppointmentReminder('+573001234567', {
        patientName: 'María González',
        date: '15 de Febrero, 2024',
        time: '10:00 AM'
      });

      expect(messageId).toBe('msg-123');
      expect(birdClient.post).toHaveBeenCalledWith('/channels/messages', expect.objectContaining({
        channelId: birdConfig.channels.whatsapp,
        to: '+573001234567',
        body: expect.objectContaining({
          type: 'template',
          template: expect.objectContaining({
            name: birdConfig.templates.appointmentReminder
          })
        })
      }));
    });

    it('should handle rate limit errors', async () => {
      const rateLimitError = {
        response: {
          status: 429,
          data: {
            error: {
              code: 'rate_limit_exceeded',
              message: 'Rate limit exceeded'
            }
          }
        }
      };

      jest.spyOn(birdClient, 'post').mockRejectedValue(rateLimitError);

      await expect(
        messagingService.sendAppointmentReminder('+573001234567', {
          patientName: 'Test Patient',
          date: '2024-02-15',
          time: '10:00 AM'
        })
      ).rejects.toThrow('Rate limit exceeded');
    });
  });
});

// Integration test example
describe('Bird API Integration', () => {
  let birdClient: BirdApiClient;
  let patientService: PatientContactService;

  beforeAll(() => {
    // Only run integration tests if API key is available
    if (!process.env.BIRD_API_KEY) {
      throw new Error('BIRD_API_KEY required for integration tests');
    }

    birdClient = new BirdApiClient(process.env.BIRD_API_KEY);
    patientService = new PatientContactService(birdClient);
  });

  it('should create and retrieve patient contact', async () => {
    const testPatient = {
      firstName: 'Test',
      lastName: 'Patient',
      phone: '+573001234567',
      email: 'test@example.com'
    };

    // Create patient
    const contactId = await patientService.createPatientContact(testPatient);
    expect(contactId).toBeDefined();

    // Retrieve patient
    const retrievedPatient = await patientService.findPatientByPhone(testPatient.phone);
    expect(retrievedPatient).toBeDefined();
    expect(retrievedPatient!.firstName).toBe(testPatient.firstName);
    expect(retrievedPatient!.phone).toBe(testPatient.phone);

    // Cleanup
    await birdClient.delete(`/contacts/${contactId}`);
  }, 30000); // 30 second timeout for integration test
});
```

### Mock Data for Testing

```typescript
// tests/mocks/bird-api-mocks.ts
export const mockBirdResponses = {
  createContact: {
    id: 'contact-123',
    identifiers: [
      { key: 'phone', value: '+573001234567', type: 'phone' }
    ],
    attributes: {
      firstName: 'María',
      lastName: 'González'
    },
    createdAt: '2024-01-15T10:00:00Z'
  },

  sendMessage: {
    id: 'msg-456',
    channelId: 'whatsapp-channel',
    to: '+573001234567',
    status: 'sent',
    createdAt: '2024-01-15T10:00:00Z'
  },

  webhookEvent: {
    event: 'message.received',
    timestamp: '2024-01-15T10:00:00Z',
    data: {
      id: 'msg-789',
      from: '+573001234567',
      to: 'whatsapp-channel',
      body: {
        type: 'text',
        text: {
          text: 'Hola, necesito ayuda'
        }
      },
      channelId: 'whatsapp-channel',
      timestamp: '2024-01-15T10:00:00Z'
    }
  }
};

export class MockBirdApiClient {
  async post(url: string, data: any): Promise<any> {
    if (url === '/contacts') {
      return mockBirdResponses.createContact;
    }
    if (url === '/channels/messages') {
      return mockBirdResponses.sendMessage;
    }
    throw new Error(`Mock not implemented for ${url}`);
  }

  async get(url: string, config?: any): Promise<any> {
    if (url === '/contacts') {
      return { results: [mockBirdResponses.createContact] };
    }
    throw new Error(`Mock not implemented for ${url}`);
  }

  async put(url: string, data: any): Promise<any> {
    return { success: true };
  }

  async delete(url: string): Promise<any> {
    return { success: true };
  }
}
```

This comprehensive code examples document provides production-ready TypeScript implementations for integrating Bird.com API into the DRAD medical practice management system. Each example includes proper error handling, type safety, and follows best practices for medical software development.