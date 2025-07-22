# Bird.com Channels API

## Overview

The Bird.com Channels API provides omnichannel messaging capabilities, allowing you to send and receive messages across multiple communication platforms from a single API. This document covers the technical implementation details for integrating channels into the DRAD medical practice management system.

## Supported Channels

### Primary Channels for Medical Practice

1. **WhatsApp Business**
   - Rich media messaging
   - Business messaging policies compliance
   - Template messages for notifications
   - Interactive messages (buttons, lists)

2. **SMS**
   - Global coverage
   - Reliable delivery
   - Cost-effective for notifications
   - Fallback option for WhatsApp

3. **Email**
   - Transactional emails
   - Rich HTML formatting
   - Attachment support
   - Marketing campaigns

4. **Voice**
   - Automated voice calls
   - Text-to-speech conversion
   - Call recording capabilities
   - Interactive voice response (IVR)

### Additional Channels

- **RCS (Rich Communication Services)**
- **Line**
- **Telegram**

## Channel Configuration

### WhatsApp Business Setup

```typescript
// WhatsApp channel configuration
interface WhatsAppConfig {
  channelId: string;
  businessAccountId: string;
  phoneNumberId: string;
  accessToken: string;
  webhookVerifyToken: string;
}

const whatsappConfig: WhatsAppConfig = {
  channelId: process.env.WHATSAPP_CHANNEL_ID!,
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID!,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
  webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN!
};
```

### SMS Channel Setup

```typescript
// SMS channel configuration
interface SMSConfig {
  channelId: string;
  senderId: string;
  countryCode: string;
  messagingProfile: string;
}

const smsConfig: SMSConfig = {
  channelId: process.env.SMS_CHANNEL_ID!,
  senderId: process.env.SMS_SENDER_ID!,
  countryCode: 'CO', // Colombia
  messagingProfile: 'medical-practice'
};
```

## Message Types

### Text Messages

```typescript
// Send text message
interface TextMessage {
  channelId: string;
  to: string;
  body: {
    type: 'text';
    text: {
      text: string;
    };
  };
}

async function sendTextMessage(
  channelId: string,
  recipient: string,
  message: string
): Promise<MessageResponse> {
  const payload: TextMessage = {
    channelId,
    to: recipient,
    body: {
      type: 'text',
      text: {
        text: message
      }
    }
  };

  const response = await birdApiClient.post('/channels/messages', payload);
  return response.data;
}
```

### Template Messages

```typescript
// WhatsApp template message for appointment reminders
interface TemplateMessage {
  channelId: string;
  to: string;
  body: {
    type: 'template';
    template: {
      name: string;
      language: {
        code: string;
      };
      components: TemplateComponent[];
    };
  };
}

interface TemplateComponent {
  type: 'header' | 'body' | 'footer' | 'button';
  parameters: TemplateParameter[];
}

interface TemplateParameter {
  type: 'text' | 'image' | 'document';
  text?: string;
  image?: MediaObject;
  document?: MediaObject;
}

// Send appointment reminder template
async function sendAppointmentReminder(
  recipient: string,
  patientName: string,
  appointmentDate: string,
  appointmentTime: string
): Promise<MessageResponse> {
  const templateMessage: TemplateMessage = {
    channelId: whatsappConfig.channelId,
    to: recipient,
    body: {
      type: 'template',
      template: {
        name: 'appointment_reminder',
        language: {
          code: 'es' // Spanish
        },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: patientName },
              { type: 'text', text: appointmentDate },
              { type: 'text', text: appointmentTime }
            ]
          }
        ]
      }
    }
  };

  const response = await birdApiClient.post('/channels/messages', templateMessage);
  return response.data;
}
```

### Interactive Messages

```typescript
// Interactive button message
interface InteractiveMessage {
  channelId: string;
  to: string;
  body: {
    type: 'interactive';
    interactive: {
      type: 'button';
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
        buttons: InteractiveButton[];
      };
    };
  };
}

interface InteractiveButton {
  type: 'reply';
  reply: {
    id: string;
    title: string;
  };
}

// Send appointment confirmation request
async function sendAppointmentConfirmation(
  recipient: string,
  appointmentDetails: string
): Promise<MessageResponse> {
  const interactiveMessage: InteractiveMessage = {
    channelId: whatsappConfig.channelId,
    to: recipient,
    body: {
      type: 'interactive',
      interactive: {
        type: 'button',
        header: {
          type: 'text',
          text: 'Confirmación de Cita'
        },
        body: {
          text: appointmentDetails
        },
        footer: {
          text: 'Dr. Andrés Durán - Cirugía Plástica'
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: 'confirm_appointment',
                title: 'Confirmar Cita'
              }
            },
            {
              type: 'reply',
              reply: {
                id: 'reschedule_appointment',
                title: 'Reprogramar'
              }
            }
          ]
        }
      }
    }
  };

  const response = await birdApiClient.post('/channels/messages', interactiveMessage);
  return response.data;
}
```

### Media Messages

```typescript
// Media message types
interface MediaMessage {
  channelId: string;
  to: string;
  body: {
    type: 'image' | 'document' | 'video' | 'audio';
    [key: string]: any;
  };
}

// Send document (e.g., pre-operative instructions)
async function sendDocument(
  recipient: string,
  documentUrl: string,
  caption?: string
): Promise<MessageResponse> {
  const mediaMessage: MediaMessage = {
    channelId: whatsappConfig.channelId,
    to: recipient,
    body: {
      type: 'document',
      document: {
        link: documentUrl,
        caption: caption || 'Documento adjunto'
      }
    }
  };

  const response = await birdApiClient.post('/channels/messages', mediaMessage);
  return response.data;
}
```

## Message Status and Delivery

### Message Lifecycle

1. **Accepted**: Message received by Bird.com
2. **Sent**: Message sent to channel provider
3. **Delivered**: Message delivered to recipient
4. **Read**: Message read by recipient (if supported)
5. **Failed**: Message delivery failed

### Status Tracking

```typescript
// Message status response
interface MessageResponse {
  id: string;
  channelId: string;
  to: string;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
  errors?: MessageError[];
}

enum MessageStatus {
  ACCEPTED = 'accepted',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

interface MessageError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Get message status
async function getMessageStatus(messageId: string): Promise<MessageResponse> {
  const response = await birdApiClient.get(`/channels/messages/${messageId}`);
  return response.data;
}
```

## Batch Messaging

### Bulk Message Sending

```typescript
// Batch message request
interface BatchMessageRequest {
  channelId: string;
  messages: BatchMessage[];
}

interface BatchMessage {
  to: string;
  body: MessageBody;
  reference?: string;
}

// Send appointment reminders to multiple patients
async function sendBatchAppointmentReminders(
  appointments: AppointmentReminder[]
): Promise<BatchMessageResponse> {
  const messages: BatchMessage[] = appointments.map(appointment => ({
    to: appointment.phoneNumber,
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
    reference: `appointment_${appointment.id}`
  }));

  const batchRequest: BatchMessageRequest = {
    channelId: whatsappConfig.channelId,
    messages
  };

  const response = await birdApiClient.post('/channels/messages/batch', batchRequest);
  return response.data;
}
```

## Channel Management

### Channel Information

```typescript
// Get channel information
async function getChannelInfo(channelId: string): Promise<ChannelInfo> {
  const response = await birdApiClient.get(`/channels/${channelId}`);
  return response.data;
}

interface ChannelInfo {
  id: string;
  name: string;
  type: 'whatsapp' | 'sms' | 'email' | 'voice';
  status: 'active' | 'inactive' | 'pending';
  configuration: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
```

### Channel Capabilities

```typescript
// Check channel capabilities
async function getChannelCapabilities(channelId: string): Promise<ChannelCapabilities> {
  const response = await birdApiClient.get(`/channels/${channelId}/capabilities`);
  return response.data;
}

interface ChannelCapabilities {
  messageTypes: string[];
  maxMessageLength: number;
  supportedMediaTypes: string[];
  interactiveFeatures: string[];
  templateSupport: boolean;
}
```

## Medical Practice Use Cases

### 1. Appointment Reminders

```typescript
// Medical appointment reminder system
class AppointmentReminderService {
  private channelId: string;
  
  constructor(channelId: string) {
    this.channelId = channelId;
  }

  async sendReminder(appointment: Appointment): Promise<void> {
    const message = `Hola ${appointment.patientName}, 
    
Te recordamos tu cita con el Dr. Andrés Durán:
📅 Fecha: ${appointment.date}
🕐 Hora: ${appointment.time}
📍 Dirección: ${appointment.location}

Por favor confirma tu asistencia respondiendo a este mensaje.`;

    await sendTextMessage(this.channelId, appointment.phoneNumber, message);
  }

  async sendConfirmationRequest(appointment: Appointment): Promise<void> {
    const appointmentDetails = `Cita programada:
📅 ${appointment.date}
🕐 ${appointment.time}
👨‍⚕️ Dr. Andrés Durán`;

    await sendAppointmentConfirmation(appointment.phoneNumber, appointmentDetails);
  }
}
```

### 2. Post-Operative Follow-up

```typescript
// Post-operative follow-up messaging
class PostOperativeFollowUp {
  private channelId: string;
  
  constructor(channelId: string) {
    this.channelId = channelId;
  }

  async sendFollowUpMessage(patient: Patient, daysAfterSurgery: number): Promise<void> {
    const messages = {
      1: `Hola ${patient.name}, esperamos que te encuentres bien después de tu cirugía. 
      
¿Cómo te sientes hoy? Por favor compártenos cualquier síntoma o pregunta que tengas.`,
      
      7: `Hola ${patient.name}, han pasado 7 días desde tu cirugía. 
      
Es hora de programar tu cita de seguimiento. ¿Cuándo te viene mejor esta semana?`,
      
      30: `Hola ${patient.name}, ¡ya ha pasado un mes desde tu cirugía! 
      
Nos gustaría conocer cómo te sientes y ver tu progreso. ¿Podrías enviarnos una foto de la zona tratada?`
    };

    const message = messages[daysAfterSurgery];
    if (message) {
      await sendTextMessage(this.channelId, patient.phoneNumber, message);
    }
  }
}
```

### 3. Payment Reminders

```typescript
// Payment reminder system
class PaymentReminderService {
  private channelId: string;
  
  constructor(channelId: string) {
    this.channelId = channelId;
  }

  async sendPaymentReminder(patient: Patient, amount: number, dueDate: string): Promise<void> {
    const message = `Hola ${patient.name},
    
Te recordamos que tienes un pago pendiente:
💰 Monto: $${amount.toLocaleString('es-CO')} COP
📅 Fecha límite: ${dueDate}

Para realizar el pago, puedes:
🏦 Transferencia bancaria
💳 Pago con tarjeta
📱 PSE

¿Necesitas ayuda con el proceso de pago?`;

    await sendTextMessage(this.channelId, patient.phoneNumber, message);
  }
}
```

## Error Handling

### Common Channel Errors

```typescript
// Channel-specific error handling
class ChannelErrorHandler {
  static handleChannelError(error: any): void {
    switch (error.code) {
      case 'CHANNEL_NOT_FOUND':
        console.error('Channel not found or inactive');
        break;
      case 'INVALID_RECIPIENT':
        console.error('Invalid recipient number or address');
        break;
      case 'TEMPLATE_NOT_APPROVED':
        console.error('WhatsApp template not approved');
        break;
      case 'RATE_LIMIT_EXCEEDED':
        console.error('Channel rate limit exceeded');
        break;
      case 'INSUFFICIENT_BALANCE':
        console.error('Insufficient account balance');
        break;
      default:
        console.error('Unknown channel error:', error);
    }
  }
}
```

## Rate Limits and Best Practices

### Rate Limiting

- **WhatsApp**: 250 messages per second per phone number
- **SMS**: 100 messages per second per connection
- **Email**: 1000 messages per hour per domain

### Best Practices

1. **Message Queueing**: Implement message queues for high-volume sending
2. **Retry Logic**: Implement exponential backoff for failed messages
3. **Template Optimization**: Use approved templates for better delivery rates
4. **Recipient Validation**: Validate phone numbers and email addresses
5. **Compliance**: Follow channel-specific messaging policies

## Integration with DRAD System

### Channel Selection Logic

```typescript
// Intelligent channel selection
class ChannelSelector {
  static selectOptimalChannel(
    patient: Patient,
    messageType: MessageType,
    urgency: 'low' | 'medium' | 'high'
  ): string {
    if (urgency === 'high') {
      return patient.preferredChannel || 'sms';
    }
    
    if (messageType === 'rich_media') {
      return 'whatsapp';
    }
    
    if (patient.hasWhatsApp) {
      return 'whatsapp';
    }
    
    return 'sms';
  }
}
```

### Message Tracking

```typescript
// Message tracking for medical compliance
class MedicalMessageTracker {
  async trackMessage(
    messageId: string,
    patientId: string,
    messageType: string,
    content: string
  ): Promise<void> {
    const record = {
      messageId,
      patientId,
      messageType,
      content: this.sanitizeContent(content),
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    // Store in compliance database
    await this.storeComplianceRecord(record);
  }

  private sanitizeContent(content: string): string {
    // Remove sensitive information for compliance logging
    return content.replace(/\d{10,}/g, '***REDACTED***');
  }
}
```

## Next Steps

1. **Set up channels**: Configure WhatsApp and SMS channels
2. **Create templates**: Design message templates for common scenarios
3. **Implement sending logic**: Build message sending utilities
4. **Set up monitoring**: Track message delivery and response rates
5. **Test integration**: Verify message sending across all channels

## References

- [Bird.com Channels API Documentation](https://docs.bird.com/api/channels-api)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Contacts API Guide](./bird-contacts-api.md)
- [Webhooks Documentation](./bird-webhooks.md)