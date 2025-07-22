# Bird.com Integration Guide

## Overview

This comprehensive guide provides step-by-step instructions for integrating Bird.com API into the DRAD medical practice management system. Follow these instructions to establish a complete omnichannel messaging solution for patient communications.

## Prerequisites

### System Requirements

- Node.js 18+ or Python 3.8+
- TypeScript 5.0+ (for Node.js projects)
- PostgreSQL 12+ or MongoDB 4.4+
- Redis 6.0+ (for caching and queues)
- SSL certificate for webhook endpoints

### Account Setup

1. **Bird.com Account**
   - Sign up at [bird.com](https://bird.com)
   - Complete business verification
   - Set up billing information

2. **API Access**
   - Generate API access keys
   - Configure webhook endpoints
   - Set up channel integrations

## Step 1: Environment Setup

### 1.1 Install Dependencies

```bash
# Node.js/TypeScript setup
npm install axios express bull ioredis dotenv helmet cors
npm install --save-dev @types/node @types/express typescript ts-node

# Python setup (alternative)
pip install requests flask celery redis python-dotenv
```

### 1.2 Environment Configuration

Create `.env` file:

```env
# Bird.com API Configuration
BIRD_API_KEY=your_bird_api_key_here
BIRD_BASE_URL=https://api.bird.com
BIRD_WEBHOOK_SECRET=your_webhook_secret_here

# WhatsApp Configuration
WHATSAPP_CHANNEL_ID=your_whatsapp_channel_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_whatsapp_business_account_id
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id

# SMS Configuration
SMS_CHANNEL_ID=your_sms_channel_id
SMS_SENDER_ID=your_sms_sender_id

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/drad
REDIS_URL=redis://localhost:6379

# Application Configuration
PORT=3000
NODE_ENV=development
```

### 1.3 Project Structure

```
src/
├── config/
│   ├── bird.ts
│   ├── database.ts
│   └── redis.ts
├── services/
│   ├── bird-api.ts
│   ├── message-queue.ts
│   ├── webhook-handler.ts
│   └── patient-service.ts
├── models/
│   ├── patient.ts
│   ├── conversation.ts
│   └── message.ts
├── controllers/
│   ├── webhook-controller.ts
│   └── messaging-controller.ts
├── middleware/
│   ├── auth.ts
│   └── validation.ts
├── routes/
│   ├── webhooks.ts
│   └── api.ts
├── utils/
│   ├── encryption.ts
│   └── logger.ts
└── app.ts
```

## Step 2: Core Configuration

### 2.1 Bird.com API Configuration

```typescript
// src/config/bird.ts
import axios, { AxiosInstance } from 'axios';
import { RateLimitAwareClient } from '../services/rate-limit-client';

export class BirdConfig {
  private static instance: BirdConfig;
  private apiClient: AxiosInstance;
  private rateLimitClient: RateLimitAwareClient;

  private constructor() {
    this.apiClient = axios.create({
      baseURL: process.env.BIRD_BASE_URL,
      timeout: 30000,
      headers: {
        'Authorization': `AccessKey ${process.env.BIRD_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    this.rateLimitClient = new RateLimitAwareClient(this.apiClient);
    this.setupInterceptors();
  }

  public static getInstance(): BirdConfig {
    if (!BirdConfig.instance) {
      BirdConfig.instance = new BirdConfig();
    }
    return BirdConfig.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor for logging
    this.apiClient.interceptors.request.use(
      (config) => {
        console.log(`Bird API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Bird API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  public getApiClient(): AxiosInstance {
    return this.apiClient;
  }

  public getRateLimitClient(): RateLimitAwareClient {
    return this.rateLimitClient;
  }
}
```

### 2.2 Database Configuration

```typescript
// src/config/database.ts
import { Pool } from 'pg';

export class DatabaseConfig {
  private static instance: DatabaseConfig;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  public static getInstance(): DatabaseConfig {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = new DatabaseConfig();
    }
    return DatabaseConfig.instance;
  }

  public getPool(): Pool {
    return this.pool;
  }

  public async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    const result = await this.pool.query(text, params);
    const duration = Date.now() - start;
    
    console.log('Database query executed:', { text, duration, rows: result.rowCount });
    return result;
  }
}
```

## Step 3: Database Schema

### 3.1 Create Database Tables

```sql
-- Create patients table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bird_contact_id VARCHAR(255) UNIQUE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(10),
    medical_record_number VARCHAR(50),
    preferred_channel VARCHAR(20) DEFAULT 'whatsapp',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bird_conversation_id VARCHAR(255) UNIQUE,
    patient_id UUID REFERENCES patients(id),
    status VARCHAR(20) DEFAULT 'active',
    conversation_type VARCHAR(50),
    priority VARCHAR(20) DEFAULT 'medium',
    assigned_agent_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE
);

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bird_message_id VARCHAR(255) UNIQUE,
    conversation_id UUID REFERENCES conversations(id),
    patient_id UUID REFERENCES patients(id),
    direction VARCHAR(10) NOT NULL, -- 'inbound' or 'outbound'
    channel_type VARCHAR(20) NOT NULL,
    content TEXT,
    message_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'sent',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE
);

-- Create appointments table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id),
    conversation_id UUID REFERENCES conversations(id),
    agenda_pro_id VARCHAR(255),
    appointment_date TIMESTAMP WITH TIME ZONE,
    appointment_type VARCHAR(100),
    status VARCHAR(20) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webhook_events table for audit trail
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processing_status VARCHAR(20) DEFAULT 'success',
    error_message TEXT
);

-- Create indexes for performance
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_bird_contact_id ON patients(bird_contact_id);
CREATE INDEX idx_conversations_patient_id ON conversations(patient_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_patient_id ON messages(patient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
```

## Step 4: Core Services Implementation

### 4.1 Bird API Service

```typescript
// src/services/bird-api.ts
import { BirdConfig } from '../config/bird';
import { Patient } from '../models/patient';
import { Message } from '../models/message';

export class BirdApiService {
  private birdConfig: BirdConfig;

  constructor() {
    this.birdConfig = BirdConfig.getInstance();
  }

  // Contact Management
  async createContact(patient: Patient): Promise<string> {
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
        medicalRecordNumber: patient.medicalRecordNumber
      }
    };

    const response = await this.birdConfig.getApiClient().post('/contacts', contactData);
    return response.data.id;
  }

  async updateContact(birdContactId: string, updates: Partial<Patient>): Promise<void> {
    const updateData = {
      attributes: {
        firstName: updates.firstName,
        lastName: updates.lastName,
        email: updates.email,
        dateOfBirth: updates.dateOfBirth
      }
    };

    await this.birdConfig.getApiClient().put(`/contacts/${birdContactId}`, updateData);
  }

  async findContactByPhone(phone: string): Promise<any> {
    try {
      const response = await this.birdConfig.getApiClient().get('/contacts', {
        params: { identifier: phone }
      });
      return response.data.results.length > 0 ? response.data.results[0] : null;
    } catch (error) {
      console.error('Error finding contact by phone:', error);
      return null;
    }
  }

  // Messaging
  async sendMessage(
    channelId: string,
    recipient: string,
    message: any,
    conversationId?: string
  ): Promise<string> {
    const messageData = {
      channelId,
      to: recipient,
      body: message,
      ...(conversationId && { conversationId })
    };

    const response = await this.birdConfig.getApiClient().post('/channels/messages', messageData);
    return response.data.id;
  }

  async sendTemplateMessage(
    channelId: string,
    recipient: string,
    templateName: string,
    parameters: any[]
  ): Promise<string> {
    const messageData = {
      channelId,
      to: recipient,
      body: {
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'es' },
          components: [
            {
              type: 'body',
              parameters
            }
          ]
        }
      }
    };

    const response = await this.birdConfig.getApiClient().post('/channels/messages', messageData);
    return response.data.id;
  }

  // Conversations
  async createConversation(
    patientContactId: string,
    channelId: string,
    metadata?: any
  ): Promise<string> {
    const conversationData = {
      participants: [
        {
          id: patientContactId,
          type: 'contact',
          contactId: patientContactId
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
      metadata: metadata || {}
    };

    const response = await this.birdConfig.getApiClient().post('/conversations', conversationData);
    return response.data.id;
  }

  async updateConversation(conversationId: string, updates: any): Promise<void> {
    await this.birdConfig.getApiClient().put(`/conversations/${conversationId}`, updates);
  }

  // Webhooks
  async createWebhookSubscription(url: string, events: string[]): Promise<string> {
    const subscriptionData = {
      name: 'DRAD Medical Practice Webhook',
      url,
      events: events.map(event => ({
        service: event.split('.')[0],
        type: event
      })),
      retryPolicy: {
        maxAttempts: 5,
        backoffType: 'exponential',
        initialDelay: 1000,
        maxDelay: 30000
      }
    };

    const response = await this.birdConfig.getApiClient().post('/webhooks/subscriptions', subscriptionData);
    return response.data.id;
  }
}
```

### 4.2 Patient Service

```typescript
// src/services/patient-service.ts
import { DatabaseConfig } from '../config/database';
import { BirdApiService } from './bird-api';
import { Patient } from '../models/patient';

export class PatientService {
  private db: DatabaseConfig;
  private birdService: BirdApiService;

  constructor() {
    this.db = DatabaseConfig.getInstance();
    this.birdService = new BirdApiService();
  }

  async createPatient(patientData: Partial<Patient>): Promise<Patient> {
    // Create contact in Bird.com first
    const birdContactId = await this.birdService.createContact(patientData as Patient);

    // Create patient in database
    const query = `
      INSERT INTO patients (
        bird_contact_id, first_name, last_name, phone, email, 
        date_of_birth, gender, medical_record_number, preferred_channel
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      birdContactId,
      patientData.firstName,
      patientData.lastName,
      patientData.phone,
      patientData.email,
      patientData.dateOfBirth,
      patientData.gender,
      patientData.medicalRecordNumber,
      patientData.preferredChannel || 'whatsapp'
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async findPatientByPhone(phone: string): Promise<Patient | null> {
    const query = 'SELECT * FROM patients WHERE phone = $1';
    const result = await this.db.query(query, [phone]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async updatePatient(patientId: string, updates: Partial<Patient>): Promise<Patient> {
    const patient = await this.findPatientById(patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    // Update in Bird.com
    await this.birdService.updateContact(patient.birdContactId, updates);

    // Update in database
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const query = `
      UPDATE patients 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const values = [patientId, ...Object.values(updates)];
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async findPatientById(patientId: string): Promise<Patient | null> {
    const query = 'SELECT * FROM patients WHERE id = $1';
    const result = await this.db.query(query, [patientId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findOrCreatePatientByPhone(phone: string, additionalData?: Partial<Patient>): Promise<Patient> {
    let patient = await this.findPatientByPhone(phone);
    
    if (!patient) {
      // Try to find existing contact in Bird.com
      const birdContact = await this.birdService.findContactByPhone(phone);
      
      if (birdContact) {
        // Create patient record from Bird.com contact
        patient = await this.createPatientFromBirdContact(birdContact, additionalData);
      } else {
        // Create new patient
        const newPatientData = {
          phone,
          firstName: additionalData?.firstName || 'Paciente',
          lastName: additionalData?.lastName || 'Nuevo',
          ...additionalData
        };
        patient = await this.createPatient(newPatientData);
      }
    }
    
    return patient;
  }

  private async createPatientFromBirdContact(birdContact: any, additionalData?: Partial<Patient>): Promise<Patient> {
    const patientData = {
      firstName: birdContact.attributes.firstName || 'Paciente',
      lastName: birdContact.attributes.lastName || 'Nuevo',
      phone: birdContact.identifiers.find((id: any) => id.type === 'phone')?.value,
      email: birdContact.attributes.email,
      dateOfBirth: birdContact.attributes.dateOfBirth,
      medicalRecordNumber: birdContact.attributes.medicalRecordNumber,
      ...additionalData
    };

    const query = `
      INSERT INTO patients (
        bird_contact_id, first_name, last_name, phone, email, 
        date_of_birth, gender, medical_record_number, preferred_channel
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      birdContact.id,
      patientData.firstName,
      patientData.lastName,
      patientData.phone,
      patientData.email,
      patientData.dateOfBirth,
      patientData.gender,
      patientData.medicalRecordNumber,
      patientData.preferredChannel || 'whatsapp'
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }
}
```

## Step 5: Webhook Implementation

### 5.1 Webhook Handler

```typescript
// src/services/webhook-handler.ts
import { PatientService } from './patient-service';
import { ConversationService } from './conversation-service';
import { MessageService } from './message-service';
import { DatabaseConfig } from '../config/database';

export class WebhookHandler {
  private patientService: PatientService;
  private conversationService: ConversationService;
  private messageService: MessageService;
  private db: DatabaseConfig;

  constructor() {
    this.patientService = new PatientService();
    this.conversationService = new ConversationService();
    this.messageService = new MessageService();
    this.db = DatabaseConfig.getInstance();
  }

  async handleWebhookEvent(event: string, data: any): Promise<void> {
    // Log webhook event
    await this.logWebhookEvent(event, data);

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
        console.warn(`Unhandled webhook event: ${event}`);
    }
  }

  private async handleIncomingMessage(data: any): Promise<void> {
    const { from, body, channelId, conversationId } = data;

    // Find or create patient
    const patient = await this.patientService.findOrCreatePatientByPhone(from);

    // Create or update conversation
    let conversation;
    if (conversationId) {
      conversation = await this.conversationService.findByBirdId(conversationId);
    }

    if (!conversation) {
      conversation = await this.conversationService.createConversation(
        patient.id,
        channelId,
        'general'
      );
    }

    // Save message
    await this.messageService.createMessage({
      birdMessageId: data.id,
      conversationId: conversation.id,
      patientId: patient.id,
      direction: 'inbound',
      channelType: this.getChannelType(channelId),
      content: body.text?.text || JSON.stringify(body),
      messageType: body.type,
      status: 'received'
    });

    // Process message for medical urgency
    await this.processMessageForUrgency(conversation, body);

    // Check for appointment keywords
    await this.checkAppointmentKeywords(conversation, body);
  }

  private async processMessageForUrgency(conversation: any, body: any): Promise<void> {
    const messageText = body.text?.text?.toLowerCase() || '';
    
    const urgentKeywords = [
      'emergencia', 'urgente', 'dolor severo', 'sangrado abundante'
    ];

    if (urgentKeywords.some(keyword => messageText.includes(keyword))) {
      await this.conversationService.updateConversation(conversation.id, {
        priority: 'urgent',
        requiresImmediateAttention: true
      });

      // Send immediate acknowledgment
      await this.messageService.sendMessage(
        conversation.channelId,
        conversation.patientPhone,
        {
          type: 'text',
          text: {
            text: '🚨 Hemos recibido tu mensaje urgente. Un profesional médico te contactará inmediatamente.'
          }
        },
        conversation.birdConversationId
      );

      // Notify medical staff
      await this.notifyMedicalStaff(conversation);
    }
  }

  private async logWebhookEvent(event: string, data: any): Promise<void> {
    const query = `
      INSERT INTO webhook_events (event_type, event_data, processing_status)
      VALUES ($1, $2, $3)
    `;

    await this.db.query(query, [event, JSON.stringify(data), 'processing']);
  }
}
```

### 5.2 Webhook Controller

```typescript
// src/controllers/webhook-controller.ts
import { Request, Response } from 'express';
import { WebhookHandler } from '../services/webhook-handler';
import { WebhookSecurityManager } from '../utils/webhook-security';

export class WebhookController {
  private webhookHandler: WebhookHandler;
  private securityManager: WebhookSecurityManager;

  constructor() {
    this.webhookHandler = new WebhookHandler();
    this.securityManager = new WebhookSecurityManager(process.env.BIRD_WEBHOOK_SECRET!);
  }

  async handleBirdWebhook(req: Request, res: Response): Promise<void> {
    try {
      // Verify webhook signature
      if (!this.securityManager.validateRequest(req)) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Process webhook event
      const { event, data } = req.body;
      await this.webhookHandler.handleWebhookEvent(event, data);

      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
```

## Step 6: Message Templates

### 6.1 WhatsApp Template Setup

Create message templates in Bird.com dashboard:

```json
{
  "templates": [
    {
      "name": "appointment_reminder",
      "language": "es",
      "category": "UTILITY",
      "components": [
        {
          "type": "HEADER",
          "format": "TEXT",
          "text": "Recordatorio de Cita"
        },
        {
          "type": "BODY",
          "text": "Hola {{1}},\n\nTe recordamos tu cita con el Dr. Andrés Durán:\n📅 Fecha: {{2}}\n🕐 Hora: {{3}}\n📍 Dirección: Consultorio Médico\n\nPor favor confirma tu asistencia."
        },
        {
          "type": "FOOTER",
          "text": "Dr. Andrés Durán - Cirugía Plástica"
        }
      ]
    },
    {
      "name": "appointment_confirmation",
      "language": "es",
      "category": "UTILITY",
      "components": [
        {
          "type": "HEADER",
          "format": "TEXT",
          "text": "Confirmación de Cita"
        },
        {
          "type": "BODY",
          "text": "Hola {{1}},\n\n✅ Tu cita ha sido confirmada:\n📅 {{2}}\n🕐 {{3}}\n\nNos vemos pronto!"
        },
        {
          "type": "FOOTER",
          "text": "Dr. Andrés Durán - Cirugía Plástica"
        }
      ]
    },
    {
      "name": "post_op_followup",
      "language": "es",
      "category": "UTILITY",
      "components": [
        {
          "type": "HEADER",
          "format": "TEXT",
          "text": "Seguimiento Post-Operatorio"
        },
        {
          "type": "BODY",
          "text": "Hola {{1}},\n\nEsperamos que te encuentres bien después de tu cirugía (Día {{2}}).\n\n¿Cómo te sientes hoy? Por favor compártenos cualquier síntoma o pregunta que tengas."
        },
        {
          "type": "FOOTER",
          "text": "Dr. Andrés Durán - Cirugía Plástica"
        }
      ]
    }
  ]
}
```

### 6.2 Template Service

```typescript
// src/services/template-service.ts
import { BirdApiService } from './bird-api';

export class TemplateService {
  private birdService: BirdApiService;

  constructor() {
    this.birdService = new BirdApiService();
  }

  async sendAppointmentReminder(
    patientPhone: string,
    patientName: string,
    appointmentDate: string,
    appointmentTime: string
  ): Promise<void> {
    const channelId = process.env.WHATSAPP_CHANNEL_ID!;
    
    await this.birdService.sendTemplateMessage(
      channelId,
      patientPhone,
      'appointment_reminder',
      [
        { type: 'text', text: patientName },
        { type: 'text', text: appointmentDate },
        { type: 'text', text: appointmentTime }
      ]
    );
  }

  async sendAppointmentConfirmation(
    patientPhone: string,
    patientName: string,
    appointmentDate: string,
    appointmentTime: string
  ): Promise<void> {
    const channelId = process.env.WHATSAPP_CHANNEL_ID!;
    
    await this.birdService.sendTemplateMessage(
      channelId,
      patientPhone,
      'appointment_confirmation',
      [
        { type: 'text', text: patientName },
        { type: 'text', text: appointmentDate },
        { type: 'text', text: appointmentTime }
      ]
    );
  }

  async sendPostOpFollowUp(
    patientPhone: string,
    patientName: string,
    postOpDay: number
  ): Promise<void> {
    const channelId = process.env.WHATSAPP_CHANNEL_ID!;
    
    await this.birdService.sendTemplateMessage(
      channelId,
      patientPhone,
      'post_op_followup',
      [
        { type: 'text', text: patientName },
        { type: 'text', text: postOpDay.toString() }
      ]
    );
  }
}
```

## Step 7: Express Application Setup

### 7.1 Main Application

```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { webhookRoutes } from './routes/webhooks';
import { apiRoutes } from './routes/api';
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Request logging
app.use(requestLogger);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Routes
app.use('/webhooks', webhookRoutes);
app.use('/api', apiRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`DRAD Server running on port ${PORT}`);
});

export { app };
```

### 7.2 Webhook Routes

```typescript
// src/routes/webhooks.ts
import { Router } from 'express';
import { WebhookController } from '../controllers/webhook-controller';

const router = Router();
const webhookController = new WebhookController();

// Bird.com webhook endpoint
router.post('/bird', webhookController.handleBirdWebhook.bind(webhookController));

export { router as webhookRoutes };
```

## Step 8: Testing the Integration

### 8.1 Test Script

```typescript
// scripts/test-integration.ts
import { BirdApiService } from '../src/services/bird-api';
import { PatientService } from '../src/services/patient-service';
import { TemplateService } from '../src/services/template-service';

async function testIntegration() {
  console.log('Testing Bird.com integration...');

  const birdService = new BirdApiService();
  const patientService = new PatientService();
  const templateService = new TemplateService();

  try {
    // Test 1: Create test patient
    console.log('1. Creating test patient...');
    const testPatient = await patientService.createPatient({
      firstName: 'Juan',
      lastName: 'Pérez',
      phone: '+573001234567',
      email: 'juan.perez@email.com'
    });
    console.log('✅ Test patient created:', testPatient.id);

    // Test 2: Send test message
    console.log('2. Sending test message...');
    await templateService.sendAppointmentReminder(
      testPatient.phone,
      `${testPatient.firstName} ${testPatient.lastName}`,
      '2024-02-15',
      '10:00 AM'
    );
    console.log('✅ Test message sent');

    // Test 3: Test webhook endpoint
    console.log('3. Testing webhook endpoint...');
    const webhookTest = await fetch('http://localhost:3000/webhooks/bird', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Bird-Signature': 'test-signature'
      },
      body: JSON.stringify({
        event: 'message.received',
        data: {
          id: 'test-message-id',
          from: testPatient.phone,
          body: {
            type: 'text',
            text: { text: 'Hola, necesito ayuda' }
          },
          channelId: process.env.WHATSAPP_CHANNEL_ID
        }
      })
    });
    
    if (webhookTest.ok) {
      console.log('✅ Webhook endpoint working');
    } else {
      console.log('❌ Webhook endpoint failed');
    }

    console.log('\n🎉 Integration test completed successfully!');
  } catch (error) {
    console.error('❌ Integration test failed:', error);
  }
}

testIntegration();
```

## Step 9: Production Deployment

### 9.1 Environment Variables

```bash
# Production environment variables
export BIRD_API_KEY="your_production_api_key"
export BIRD_WEBHOOK_SECRET="your_production_webhook_secret"
export DATABASE_URL="your_production_database_url"
export REDIS_URL="your_production_redis_url"
export NODE_ENV="production"
```

### 9.2 Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/drad
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    
  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=drad
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## Step 10: Monitoring and Maintenance

### 10.1 Health Checks

```typescript
// src/services/health-check.ts
export class HealthCheckService {
  async checkBirdApiHealth(): Promise<boolean> {
    try {
      const response = await fetch('https://api.bird.com/health');
      return response.ok;
    } catch {
      return false;
    }
  }

  async checkDatabaseHealth(): Promise<boolean> {
    try {
      const db = DatabaseConfig.getInstance();
      await db.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  async checkRedisHealth(): Promise<boolean> {
    try {
      const redis = new Redis(process.env.REDIS_URL);
      await redis.ping();
      return true;
    } catch {
      return false;
    }
  }
}
```

### 10.2 Monitoring Dashboard

```typescript
// src/routes/admin.ts
import { Router } from 'express';
import { HealthCheckService } from '../services/health-check';

const router = Router();
const healthCheck = new HealthCheckService();

router.get('/health', async (req, res) => {
  const checks = {
    bird: await healthCheck.checkBirdApiHealth(),
    database: await healthCheck.checkDatabaseHealth(),
    redis: await healthCheck.checkRedisHealth()
  };

  const allHealthy = Object.values(checks).every(Boolean);
  
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString()
  });
});

export { router as adminRoutes };
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify API key is correct
   - Check environment variables
   - Ensure proper header format

2. **Webhook Not Receiving Events**
   - Verify webhook URL is accessible
   - Check webhook signature validation
   - Confirm event subscriptions

3. **Rate Limit Exceeded**
   - Implement proper rate limiting
   - Use message queues
   - Monitor usage patterns

4. **Database Connection Issues**
   - Check database credentials
   - Verify network connectivity
   - Review connection pool settings

## Next Steps

1. **Configure WhatsApp Business**: Set up WhatsApp Business API
2. **Create Message Templates**: Design and approve message templates
3. **Set up Agenda Pro Integration**: Connect with appointment system
4. **Configure Monitoring**: Set up logging and alerting
5. **Train Staff**: Provide training on the new system

## References

- [Bird.com API Documentation](https://docs.bird.com/api)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/docs/)