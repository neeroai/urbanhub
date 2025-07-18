# Bird.com Conversations API

## Overview

The Bird.com Conversations API enables centralized management of message exchanges between patients and the medical practice. This API provides comprehensive conversation threading, agent assignment, and interaction tracking capabilities essential for maintaining context throughout the patient journey in the DRAD system.

## Core Concepts

### Conversation Model

A conversation represents a thread of messages between participants, maintaining context across multiple interactions and channels.

```typescript
interface Conversation {
  id: string;
  participants: Participant[];
  channels: ConversationChannel[];
  status: ConversationStatus;
  assignedAgent?: Agent;
  tags: string[];
  metadata: ConversationMetadata;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
}

interface Participant {
  id: string;
  type: 'contact' | 'agent' | 'bot';
  contactId?: string;
  agentId?: string;
  name?: string;
  role?: string;
}

interface ConversationChannel {
  channelId: string;
  channelType: 'whatsapp' | 'sms' | 'email' | 'voice';
  isActive: boolean;
  lastActivityAt: string;
}

enum ConversationStatus {
  ACTIVE = 'active',
  WAITING = 'waiting',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}
```

### Medical Practice Conversation Model

```typescript
interface MedicalConversation extends Conversation {
  metadata: MedicalConversationMetadata;
}

interface MedicalConversationMetadata {
  patientId: string;
  appointmentId?: string;
  surgeryId?: string;
  conversationType: MedicalConversationType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: MedicalConversationCategory;
  requiresFollowUp: boolean;
  lastNurseReview?: string;
  lastDoctorReview?: string;
  complianceNotes?: string;
  
  // Medical context
  symptoms?: string[];
  medications?: string[];
  allergies?: string[];
  emergencyContact?: boolean;
  
  // Appointment context
  appointmentDate?: string;
  appointmentType?: string;
  rescheduleRequested?: boolean;
  
  // Surgery context
  surgeryType?: string;
  preOpInstructions?: boolean;
  postOpDay?: number;
  recoveryStage?: string;
  
  // Payment context
  paymentAmount?: number;
  paymentDueDate?: string;
  paymentStatus?: 'pending' | 'overdue' | 'paid';
}

enum MedicalConversationType {
  CONSULTATION = 'consultation',
  APPOINTMENT = 'appointment',
  SURGERY = 'surgery',
  FOLLOW_UP = 'follow_up',
  PAYMENT = 'payment',
  EMERGENCY = 'emergency',
  GENERAL = 'general'
}

enum MedicalConversationCategory {
  SCHEDULING = 'scheduling',
  MEDICAL_INQUIRY = 'medical_inquiry',
  POST_OPERATIVE = 'post_operative',
  BILLING = 'billing',
  COMPLAINT = 'complaint',
  REFERRAL = 'referral'
}
```

## Conversation Management

### Creating Conversations

```typescript
// Create a new medical conversation
async function createMedicalConversation(
  patientContactId: string,
  channelId: string,
  conversationType: MedicalConversationType,
  initialMessage?: string
): Promise<MedicalConversation> {
  const conversation = {
    participants: [
      {
        id: patientContactId,
        type: 'contact' as const,
        contactId: patientContactId
      }
    ],
    channels: [
      {
        channelId,
        channelType: 'whatsapp' as const,
        isActive: true,
        lastActivityAt: new Date().toISOString()
      }
    ],
    status: ConversationStatus.ACTIVE,
    tags: [conversationType],
    metadata: {
      patientId: patientContactId,
      conversationType,
      priority: 'medium',
      category: MedicalConversationCategory.GENERAL,
      requiresFollowUp: false
    }
  };

  const response = await birdApiClient.post('/conversations', conversation);
  
  // Send initial message if provided
  if (initialMessage) {
    await sendConversationMessage(response.data.id, initialMessage);
  }
  
  return response.data;
}

// Create conversation for specific medical scenarios
async function createAppointmentConversation(
  patientContactId: string,
  appointmentId: string,
  channelId: string
): Promise<MedicalConversation> {
  const conversation = await createMedicalConversation(
    patientContactId,
    channelId,
    MedicalConversationType.APPOINTMENT
  );

  // Update with appointment-specific metadata
  return await updateConversation(conversation.id, {
    metadata: {
      ...conversation.metadata,
      appointmentId,
      category: MedicalConversationCategory.SCHEDULING,
      priority: 'high'
    }
  });
}

async function createPostOpConversation(
  patientContactId: string,
  surgeryId: string,
  postOpDay: number,
  channelId: string
): Promise<MedicalConversation> {
  const conversation = await createMedicalConversation(
    patientContactId,
    channelId,
    MedicalConversationType.SURGERY,
    `Seguimiento post-operatorio - Día ${postOpDay}`
  );

  return await updateConversation(conversation.id, {
    metadata: {
      ...conversation.metadata,
      surgeryId,
      category: MedicalConversationCategory.POST_OPERATIVE,
      priority: 'high',
      postOpDay,
      requiresFollowUp: true
    }
  });
}
```

### Updating Conversations

```typescript
// Update conversation metadata
async function updateConversation(
  conversationId: string,
  updates: Partial<MedicalConversation>
): Promise<MedicalConversation> {
  const response = await birdApiClient.put(`/conversations/${conversationId}`, updates);
  return response.data;
}

// Update conversation status
async function updateConversationStatus(
  conversationId: string,
  status: ConversationStatus,
  reason?: string
): Promise<void> {
  await updateConversation(conversationId, {
    status,
    metadata: {
      statusChangeReason: reason,
      statusChangedAt: new Date().toISOString()
    }
  });
}

// Mark conversation as requiring follow-up
async function markForFollowUp(
  conversationId: string,
  followUpDate: string,
  notes: string
): Promise<void> {
  await updateConversation(conversationId, {
    metadata: {
      requiresFollowUp: true,
      followUpDate,
      followUpNotes: notes
    },
    tags: ['follow-up-required']
  });
}
```

## Message Management

### Sending Messages in Conversations

```typescript
// Send message within a conversation
async function sendConversationMessage(
  conversationId: string,
  message: string,
  messageType: 'text' | 'template' | 'interactive' = 'text'
): Promise<ConversationMessage> {
  const messagePayload = {
    conversationId,
    body: {
      type: messageType,
      text: {
        text: message
      }
    }
  };

  const response = await birdApiClient.post('/conversations/messages', messagePayload);
  return response.data;
}

// Send structured medical message
async function sendMedicalMessage(
  conversationId: string,
  messageType: MedicalMessageType,
  content: MedicalMessageContent
): Promise<ConversationMessage> {
  const templates = {
    appointment_reminder: {
      name: 'appointment_reminder',
      language: { code: 'es' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: content.patientName },
            { type: 'text', text: content.appointmentDate },
            { type: 'text', text: content.appointmentTime }
          ]
        }
      ]
    },
    post_op_check: {
      name: 'post_op_check',
      language: { code: 'es' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: content.patientName },
            { type: 'text', text: content.postOpDay.toString() }
          ]
        }
      ]
    }
  };

  const messagePayload = {
    conversationId,
    body: {
      type: 'template',
      template: templates[messageType]
    }
  };

  const response = await birdApiClient.post('/conversations/messages', messagePayload);
  return response.data;
}

enum MedicalMessageType {
  APPOINTMENT_REMINDER = 'appointment_reminder',
  APPOINTMENT_CONFIRMATION = 'appointment_confirmation',
  POST_OP_CHECK = 'post_op_check',
  PAYMENT_REMINDER = 'payment_reminder',
  FOLLOW_UP_REQUIRED = 'follow_up_required'
}

interface MedicalMessageContent {
  patientName: string;
  appointmentDate?: string;
  appointmentTime?: string;
  postOpDay?: number;
  paymentAmount?: number;
  dueDate?: string;
  [key: string]: any;
}
```

### Receiving and Processing Messages

```typescript
// Handle incoming messages
async function handleIncomingMessage(
  conversationId: string,
  message: IncomingMessage
): Promise<void> {
  const conversation = await getConversation(conversationId);
  
  // Update conversation activity
  await updateConversation(conversationId, {
    lastMessageAt: new Date().toISOString(),
    status: ConversationStatus.WAITING
  });

  // Process message based on conversation type
  await processMessageByType(conversation, message);
  
  // Check if agent assignment is needed
  await checkForAgentAssignment(conversation, message);
}

// Process messages based on medical conversation type
async function processMessageByType(
  conversation: MedicalConversation,
  message: IncomingMessage
): Promise<void> {
  switch (conversation.metadata.conversationType) {
    case MedicalConversationType.APPOINTMENT:
      await processAppointmentMessage(conversation, message);
      break;
    case MedicalConversationType.SURGERY:
      await processSurgeryMessage(conversation, message);
      break;
    case MedicalConversationType.FOLLOW_UP:
      await processFollowUpMessage(conversation, message);
      break;
    case MedicalConversationType.EMERGENCY:
      await processEmergencyMessage(conversation, message);
      break;
    default:
      await processGeneralMessage(conversation, message);
  }
}

// Process appointment-related messages
async function processAppointmentMessage(
  conversation: MedicalConversation,
  message: IncomingMessage
): Promise<void> {
  const messageText = message.body.text?.text?.toLowerCase() || '';
  
  if (messageText.includes('confirmar') || messageText.includes('si')) {
    await updateConversation(conversation.id, {
      metadata: {
        ...conversation.metadata,
        appointmentConfirmed: true
      },
      tags: [...conversation.tags, 'confirmed']
    });
    
    await sendConversationMessage(
      conversation.id,
      '✅ Perfecto! Tu cita ha sido confirmada. Te esperamos en la fecha y hora programada.'
    );
  } else if (messageText.includes('reprogramar') || messageText.includes('cambiar')) {
    await updateConversation(conversation.id, {
      metadata: {
        ...conversation.metadata,
        rescheduleRequested: true
      },
      tags: [...conversation.tags, 'reschedule-requested']
    });
    
    await sendConversationMessage(
      conversation.id,
      '📅 Entiendo que necesitas reprogramar tu cita. Un miembro de nuestro equipo te contactará pronto para ayudarte.'
    );
    
    // Assign to scheduling agent
    await assignToAgent(conversation.id, 'scheduling-agent');
  }
}

// Process post-operative messages
async function processSurgeryMessage(
  conversation: MedicalConversation,
  message: IncomingMessage
): Promise<void> {
  const messageText = message.body.text?.text?.toLowerCase() || '';
  
  // Check for concerning symptoms
  const concerningSymptoms = [
    'dolor', 'sangrado', 'hinchazón', 'fiebre', 'infección',
    'mareo', 'náuseas', 'vómito', 'dificultad'
  ];
  
  const hasConcerningSSymptoms = concerningSymptoms.some(symptom => 
    messageText.includes(symptom)
  );
  
  if (hasConcerningSSymptoms) {
    await updateConversation(conversation.id, {
      metadata: {
        ...conversation.metadata,
        priority: 'urgent',
        symptoms: [messageText]
      },
      tags: [...conversation.tags, 'urgent-symptoms']
    });
    
    // Immediately assign to medical professional
    await assignToAgent(conversation.id, 'medical-professional');
    
    await sendConversationMessage(
      conversation.id,
      '🚨 Hemos recibido tu mensaje. Un profesional médico revisará tu caso de inmediato y te contactará pronto.'
    );
  } else {
    await sendConversationMessage(
      conversation.id,
      '✅ Gracias por tu mensaje. Continuamos monitoreando tu recuperación. Si tienes alguna preocupación, no dudes en contactarnos.'
    );
  }
}
```

## Agent Management

### Agent Assignment

```typescript
// Agent configuration
interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  specializations: string[];
  availability: AgentAvailability;
  maxConcurrentConversations: number;
  currentConversations: number;
}

enum AgentRole {
  RECEPTIONIST = 'receptionist',
  NURSE = 'nurse',
  DOCTOR = 'doctor',
  BILLING = 'billing',
  COORDINATOR = 'coordinator'
}

interface AgentAvailability {
  status: 'available' | 'busy' | 'offline';
  schedule: {
    [day: string]: {
      start: string;
      end: string;
    };
  };
}

// Assign conversation to agent
async function assignToAgent(
  conversationId: string,
  agentId: string,
  reason?: string
): Promise<void> {
  await updateConversation(conversationId, {
    assignedAgent: {
      id: agentId,
      assignedAt: new Date().toISOString(),
      reason
    }
  });

  // Notify agent
  await notifyAgent(agentId, conversationId);
}

// Intelligent agent assignment
async function assignToOptimalAgent(
  conversation: MedicalConversation
): Promise<void> {
  const availableAgents = await getAvailableAgents();
  let selectedAgent: Agent | null = null;

  // Assignment logic based on conversation type and priority
  switch (conversation.metadata.conversationType) {
    case MedicalConversationType.EMERGENCY:
      selectedAgent = availableAgents.find(a => 
        a.role === AgentRole.DOCTOR || a.role === AgentRole.NURSE
      );
      break;
    case MedicalConversationType.APPOINTMENT:
      selectedAgent = availableAgents.find(a => 
        a.role === AgentRole.COORDINATOR || a.role === AgentRole.RECEPTIONIST
      );
      break;
    case MedicalConversationType.PAYMENT:
      selectedAgent = availableAgents.find(a => 
        a.role === AgentRole.BILLING
      );
      break;
    default:
      selectedAgent = availableAgents.find(a => 
        a.role === AgentRole.RECEPTIONIST
      );
  }

  if (selectedAgent) {
    await assignToAgent(conversation.id, selectedAgent.id, 'auto-assignment');
  }
}

// Check if agent assignment is needed
async function checkForAgentAssignment(
  conversation: MedicalConversation,
  message: IncomingMessage
): Promise<void> {
  const requiresAgent = [
    // Emergency keywords
    'emergencia', 'urgente', 'dolor severo', 'sangrado abundante',
    // Complex inquiries
    'complicación', 'problema', 'preocupación',
    // Scheduling requests
    'reprogramar', 'cambiar cita', 'cancelar'
  ];

  const messageText = message.body.text?.text?.toLowerCase() || '';
  const needsAgent = requiresAgent.some(keyword => messageText.includes(keyword));

  if (needsAgent && !conversation.assignedAgent) {
    await assignToOptimalAgent(conversation);
  }
}
```

### Agent Workflows

```typescript
// Agent workflow management
class AgentWorkflowManager {
  // Handle agent responses
  async handleAgentResponse(
    agentId: string,
    conversationId: string,
    response: string,
    action?: AgentAction
  ): Promise<void> {
    await sendConversationMessage(conversationId, response);
    
    if (action) {
      await this.executeAgentAction(conversationId, action);
    }
    
    // Update agent activity
    await this.updateAgentActivity(agentId, conversationId);
  }

  // Execute agent actions
  private async executeAgentAction(
    conversationId: string,
    action: AgentAction
  ): Promise<void> {
    switch (action.type) {
      case 'close_conversation':
        await updateConversationStatus(conversationId, ConversationStatus.CLOSED, action.reason);
        break;
      case 'schedule_appointment':
        await this.scheduleAppointment(conversationId, action.appointmentData);
        break;
      case 'request_follow_up':
        await markForFollowUp(conversationId, action.followUpDate, action.notes);
        break;
      case 'escalate_to_doctor':
        await this.escalateToDoctor(conversationId, action.escalationReason);
        break;
    }
  }

  // Schedule appointment from conversation
  private async scheduleAppointment(
    conversationId: string,
    appointmentData: AppointmentData
  ): Promise<void> {
    // Integration with appointment scheduling system
    const appointment = await scheduleAppointmentInAgendaPro(appointmentData);
    
    await updateConversation(conversationId, {
      metadata: {
        appointmentId: appointment.id,
        appointmentDate: appointment.date,
        appointmentTime: appointment.time
      }
    });
  }

  // Escalate to doctor
  private async escalateToDoctor(
    conversationId: string,
    reason: string
  ): Promise<void> {
    const availableDoctors = await getAvailableAgents();
    const doctor = availableDoctors.find(a => a.role === AgentRole.DOCTOR);
    
    if (doctor) {
      await assignToAgent(conversationId, doctor.id, `Escalated: ${reason}`);
      await updateConversation(conversationId, {
        metadata: {
          priority: 'high',
          escalationReason: reason
        }
      });
    }
  }
}

interface AgentAction {
  type: 'close_conversation' | 'schedule_appointment' | 'request_follow_up' | 'escalate_to_doctor';
  reason?: string;
  appointmentData?: AppointmentData;
  followUpDate?: string;
  notes?: string;
  escalationReason?: string;
}
```

## Conversation Analytics

### Conversation Metrics

```typescript
// Conversation analytics
class ConversationAnalytics {
  // Get conversation metrics
  async getConversationMetrics(
    dateRange: DateRange,
    filters?: ConversationFilters
  ): Promise<ConversationMetrics> {
    const response = await birdApiClient.get('/conversations/analytics', {
      params: {
        startDate: dateRange.start,
        endDate: dateRange.end,
        ...filters
      }
    });
    
    return response.data;
  }

  // Get agent performance metrics
  async getAgentMetrics(
    agentId: string,
    dateRange: DateRange
  ): Promise<AgentMetrics> {
    const response = await birdApiClient.get(`/conversations/agents/${agentId}/metrics`, {
      params: {
        startDate: dateRange.start,
        endDate: dateRange.end
      }
    });
    
    return response.data;
  }

  // Get response time analytics
  async getResponseTimeAnalytics(
    dateRange: DateRange
  ): Promise<ResponseTimeAnalytics> {
    const conversations = await this.getConversations(dateRange);
    
    const responseTimes = conversations.map(conv => {
      const messages = conv.messages.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      const patientMessages = messages.filter(m => m.from === 'patient');
      const agentMessages = messages.filter(m => m.from === 'agent');
      
      const responseDelays = patientMessages.map(patientMsg => {
        const nextAgentMsg = agentMessages.find(agentMsg => 
          new Date(agentMsg.timestamp) > new Date(patientMsg.timestamp)
        );
        
        if (nextAgentMsg) {
          return new Date(nextAgentMsg.timestamp).getTime() - new Date(patientMsg.timestamp).getTime();
        }
        return null;
      }).filter(delay => delay !== null);
      
      return {
        conversationId: conv.id,
        averageResponseTime: responseDelays.length > 0 
          ? responseDelays.reduce((sum, delay) => sum + delay, 0) / responseDelays.length
          : 0
      };
    });
    
    return {
      averageResponseTime: responseTimes.reduce((sum, rt) => sum + rt.averageResponseTime, 0) / responseTimes.length,
      medianResponseTime: this.calculateMedian(responseTimes.map(rt => rt.averageResponseTime)),
      conversationResponseTimes: responseTimes
    };
  }
}

interface ConversationMetrics {
  totalConversations: number;
  activeConversations: number;
  resolvedConversations: number;
  averageResolutionTime: number;
  patientSatisfactionScore: number;
  conversationsByType: Record<string, number>;
  conversationsByChannel: Record<string, number>;
}

interface AgentMetrics {
  agentId: string;
  totalConversations: number;
  averageResponseTime: number;
  customerSatisfactionScore: number;
  conversationsResolved: number;
  conversationsEscalated: number;
}
```

## Integration with Medical Systems

### Agenda Pro Integration

```typescript
// Sync conversations with Agenda Pro
class AgendaProConversationSync {
  // Create conversation from Agenda Pro appointment
  async createConversationFromAppointment(
    appointment: AgendaProAppointment
  ): Promise<MedicalConversation> {
    const patientContact = await findContactByPhone(appointment.patientPhone);
    
    if (!patientContact) {
      throw new Error('Patient contact not found');
    }
    
    const conversation = await createAppointmentConversation(
      patientContact.id,
      appointment.id,
      'whatsapp' // Default channel
    );
    
    // Send appointment confirmation
    await sendMedicalMessage(conversation.id, MedicalMessageType.APPOINTMENT_CONFIRMATION, {
      patientName: appointment.patientName,
      appointmentDate: appointment.date,
      appointmentTime: appointment.time
    });
    
    return conversation;
  }

  // Update appointment from conversation
  async updateAppointmentFromConversation(
    conversationId: string,
    appointmentUpdates: Partial<AgendaProAppointment>
  ): Promise<void> {
    const conversation = await getConversation(conversationId);
    
    if (conversation.metadata.appointmentId) {
      await updateAgendaProAppointment(
        conversation.metadata.appointmentId,
        appointmentUpdates
      );
    }
  }
}
```

## Compliance and Audit

### Medical Compliance

```typescript
// Medical compliance tracking
class MedicalComplianceTracker {
  // Track conversation for compliance
  async trackConversationCompliance(
    conversationId: string,
    complianceData: ComplianceData
  ): Promise<void> {
    const complianceRecord = {
      conversationId,
      patientId: complianceData.patientId,
      timestamp: new Date().toISOString(),
      dataType: complianceData.dataType,
      accessReason: complianceData.accessReason,
      userId: complianceData.userId,
      action: complianceData.action
    };
    
    await this.storeComplianceRecord(complianceRecord);
  }

  // Generate compliance report
  async generateComplianceReport(
    dateRange: DateRange
  ): Promise<ComplianceReport> {
    const conversations = await this.getConversationsInRange(dateRange);
    
    return {
      totalConversations: conversations.length,
      patientsAffected: new Set(conversations.map(c => c.metadata.patientId)).size,
      complianceIssues: await this.identifyComplianceIssues(conversations),
      dataRetentionStatus: await this.checkDataRetention(conversations)
    };
  }
}

interface ComplianceData {
  patientId: string;
  dataType: 'medical_info' | 'personal_info' | 'payment_info';
  accessReason: string;
  userId: string;
  action: 'view' | 'modify' | 'delete';
}
```

## Next Steps

1. **Set up conversation flows**: Define medical conversation workflows
2. **Configure agent assignments**: Set up agent roles and specializations
3. **Implement message processing**: Build intelligent message routing
4. **Create templates**: Design medical message templates
5. **Set up analytics**: Implement conversation tracking and metrics

## References

- [Bird.com Conversations API Documentation](https://docs.bird.com/api/conversations-api)
- [Channels API Integration](./bird-channels-api.md)
- [Contacts API Integration](./bird-contacts-api.md)
- [Webhooks for Conversation Events](./bird-webhooks.md)