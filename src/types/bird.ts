export interface ConversationEvent {
  type: 'conversation.started' | 'message.received' | 'conversation.ended' | 'agent.escalation_triggered';
  id: string;
  timestamp: string;
  conversation?: {
    id: string;
    status: string;
    channel: string;
  };
  contact?: {
    id: string;
    msisdn?: string;
    email?: string;
    name?: string;
    attributes?: Record<string, any>;
  };
  message?: {
    id: string;
    direction: 'inbound' | 'outbound';
    content: {
      text?: string;
      type: string;
    };
    timestamp: string;
    channel: string;
  };
  agent?: {
    id: string;
    name: string;
    type: string;
    status: string;
  };
  escalation?: {
    reason: string;
    priority: 'low' | 'medium' | 'high';
    timestamp: string;
  };
}

export interface MessagePayload {
  to: string;
  channel: 'whatsapp' | 'sms' | 'email';
  type: 'text' | 'template' | 'image' | 'document';
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components: Array<{
      type: string;
      parameters?: Array<{
        type: string;
        text: string;
      }>;
    }>;
  };
  image?: {
    url: string;
    caption?: string;
  };
  document?: {
    url: string;
    filename: string;
    caption?: string;
  };
}

export interface AgentConfig {
  id?: string;
  name: string;
  type: 'qualifier' | 'warmer' | 'scheduler' | 'followup' | 'escalation';
  description?: string;
  model: 'gpt-4' | 'gpt-3.5-turbo';
  language: string;
  personality?: string;
  knowledgeBase?: string;
  maxConversationTurns?: number;
  escalationTriggers?: string[];
  customProperties?: Record<string, any>;
  integrations?: {
    hubspot?: {
      dealStage: string;
      activityType: string;
      customProperties: Record<string, any>;
    };
    calendar?: {
      enabled: boolean;
      availableHours: string;
      bookingDuration: number;
    };
  };
  conversationFlow?: {
    greeting?: string;
    qualificationQuestions?: string[];
    escalationMessage?: string;
    endingMessage?: string;
  };
}

export interface ContactData {
  id: string;
  msisdn?: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  attributes?: {
    propertyInterest?: string;
    budget?: string;
    timeline?: string;
    conversationStatus?: string;
    qualificationScore?: number;
    preferredContactMethod?: string;
    language?: string;
    timezone?: string;
  };
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface ConversationData {
  id: string;
  contactId: string;
  channel: string;
  status: 'active' | 'ended' | 'escalated';
  agentId?: string;
  agentType?: string;
  messages: MessageData[];
  metadata?: {
    startTime: string;
    endTime?: string;
    escalationReason?: string;
    qualificationScore?: number;
    businessOutcome?: string;
  };
}

export interface MessageData {
  id: string;
  conversationId: string;
  direction: 'inbound' | 'outbound';
  content: {
    type: string;
    text?: string;
    template?: string;
  };
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  metadata?: {
    agentId?: string;
    processingTime?: number;
    confidence?: number;
  };
}

export interface WebhookSignature {
  timestamp: string;
  signature: string;
  algorithm: string;
}

export interface BirdApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}

export interface AgentMetrics {
  agentId: string;
  timeframe: string;
  totalConversations: number;
  completedConversations: number;
  escalatedConversations: number;
  averageResponseTime: number;
  customerSatisfaction: number;
  conversionRate: number;
  commonIntents: Array<{
    intent: string;
    count: number;
    confidence: number;
  }>;
  performanceData: Array<{
    date: string;
    conversations: number;
    completionRate: number;
    escalationRate: number;
  }>;
}