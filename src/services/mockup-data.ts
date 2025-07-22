import { readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  source: string;
  location_preference: string;
  budget_range: string;
  move_in_timeline: string;
  property_interest: string[];
  demographics: {
    age: number;
    occupation: string;
    income_level: string;
    lifestyle: string;
  };
  conversation_context: {
    language: string;
    tone_preference: string;
    communication_style: string;
  };
  qualification_status: string;
  last_contact: string;
  tour_scheduled?: {
    date: string;
    property: string;
    agent: string;
  };
}

interface Property {
  id: string;
  name: string;
  full_name: string;
  location: {
    address: string;
    neighborhood: string;
    city: string;
    postal_code: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  property_type: string;
  total_units: number;
  available_units: number;
  price_range: {
    min: number;
    max: number;
    currency: string;
  };
  amenities: string[];
  unit_types: Array<{
    type: string;
    size_sqm: number;
    price: number;
    available: number;
    features: string[];
  }>;
  contact_info: {
    leasing_agent: string;
    phone: string;
    email: string;
    schedule: string;
  };
}

interface Agent {
  id: string;
  name: string;
  role: string;
  properties: string[];
  phone: string;
  email: string;
  schedule: Record<string, any>;
}

interface ConversationTemplate {
  scenario: string;
  lead_profile: string;
  language: string;
  messages: Array<{
    role: string;
    agent?: string;
    content: string;
    timestamp: string;
  }>;
}

export class MockupDataService {
  private leadsData: { leads: Lead[] } | null = null;
  private propertiesData: { properties: Property[] } | null = null;
  private schedulesData: { agents: Agent[]; tour_availability: any; booking_rules: any } | null = null;
  private conversationsData: { conversation_templates: ConversationTemplate[]; conversation_analytics: any } | null = null;
  private mexicanContextData: any = null;

  private loadData<T>(filename: string): T {
    try {
      const dataPath = join(__dirname, '..', 'data', 'mockups', filename);
      const rawData = readFileSync(dataPath, 'utf-8');
      return JSON.parse(rawData);
    } catch (error) {
      logger.error(`Failed to load mockup data from ${filename}:`, error);
      throw new Error(`Failed to load mockup data: ${filename}`);
    }
  }

  private getLeads(): Lead[] {
    if (!this.leadsData) {
      this.leadsData = this.loadData<{ leads: Lead[] }>('leads.json');
    }
    return this.leadsData.leads;
  }

  private getProperties(): Property[] {
    if (!this.propertiesData) {
      this.propertiesData = this.loadData<{ properties: Property[] }>('properties.json');
    }
    return this.propertiesData.properties;
  }

  private getSchedules() {
    if (!this.schedulesData) {
      this.schedulesData = this.loadData<{ agents: Agent[]; tour_availability: any; booking_rules: any }>('schedules.json');
    }
    return this.schedulesData;
  }

  private getConversations() {
    if (!this.conversationsData) {
      this.conversationsData = this.loadData<{ conversation_templates: ConversationTemplate[]; conversation_analytics: any }>('conversations.json');
    }
    return this.conversationsData;
  }

  private getMexicanContext() {
    if (!this.mexicanContextData) {
      this.mexicanContextData = this.loadData('mexican-context.json');
    }
    return this.mexicanContextData;
  }

  /**
   * Get lead by ID or phone number
   */
  getLeadByIdOrPhone(identifier: string): Lead | null {
    const leads = this.getLeads();
    return leads.find(lead => 
      lead.id === identifier || 
      lead.phone === identifier || 
      lead.phone.replace(/[^\d]/g, '') === identifier.replace(/[^\d]/g, '')
    ) || null;
  }

  /**
   * Get leads by status
   */
  getLeadsByStatus(status: string): Lead[] {
    const leads = this.getLeads();
    return leads.filter(lead => lead.status === status);
  }

  /**
   * Get leads by property interest
   */
  getLeadsByProperty(propertyId: string): Lead[] {
    const leads = this.getLeads();
    return leads.filter(lead => lead.property_interest.includes(propertyId));
  }

  /**
   * Get property by ID
   */
  getPropertyById(propertyId: string): Property | null {
    const properties = this.getProperties();
    return properties.find(property => property.id === propertyId) || null;
  }

  /**
   * Get all properties
   */
  getAllProperties(): Property[] {
    return this.getProperties();
  }

  /**
   * Get properties in budget range
   */
  getPropertiesInBudget(minBudget: number, maxBudget: number): Property[] {
    const properties = this.getProperties();
    return properties.filter(property => {
      const propMin = property.price_range.min;
      const propMax = property.price_range.max;
      return (propMin <= maxBudget && propMax >= minBudget);
    });
  }

  /**
   * Get agent by ID
   */
  getAgentById(agentId: string): Agent | null {
    const schedules = this.getSchedules();
    return schedules.agents.find(agent => agent.id === agentId) || null;
  }

  /**
   * Get agents by property
   */
  getAgentsByProperty(propertyId: string): Agent[] {
    const schedules = this.getSchedules();
    return schedules.agents.filter(agent => agent.properties.includes(propertyId));
  }

  /**
   * Get tour availability for date and property
   */
  getTourAvailability(date: string, propertyId?: string): any[] {
    const schedules = this.getSchedules();
    const availability = schedules.tour_availability[date] || [];
    
    if (propertyId) {
      return availability.filter((slot: any) => slot.property === propertyId);
    }
    
    return availability;
  }

  /**
   * Check if tour slot is available
   */
  isSlotAvailable(date: string, agentId: string, time: string): boolean {
    const availability = this.getTourAvailability(date);
    const agentSlots = availability.find((slot: any) => slot.agent_id === agentId);
    
    if (!agentSlots) return false;
    
    const timeSlot = agentSlots.slots.find((slot: any) => slot.time === time);
    return timeSlot ? timeSlot.available : false;
  }

  /**
   * Get conversation template by scenario
   */
  getConversationTemplate(scenario: string): ConversationTemplate | null {
    const conversations = this.getConversations();
    return conversations.conversation_templates.find(template => template.scenario === scenario) || null;
  }

  /**
   * Get conversation templates by lead profile
   */
  getTemplatesByProfile(profile: string): ConversationTemplate[] {
    const conversations = this.getConversations();
    return conversations.conversation_templates.filter(template => template.lead_profile === profile);
  }

  /**
   * Get WhatsApp template by name
   */
  getWhatsAppTemplate(templateName: string): any {
    const context = this.getMexicanContext();
    return context.whatsapp_templates[templateName] || null;
  }

  /**
   * Get Mexican cultural expressions
   */
  getMexicanExpressions(): string[] {
    const context = this.getMexicanContext();
    return context.cultural_context.language_patterns.mexican_expressions || [];
  }

  /**
   * Get real estate terminology
   */
  getRealEstateTerms(): any {
    const context = this.getMexicanContext();
    return context.cultural_context.real_estate_terminology || {};
  }

  /**
   * Get demo persona by name
   */
  getDemoPersona(name: string): any {
    const context = this.getMexicanContext();
    return context.demo_personas.find((persona: any) => persona.name === name) || null;
  }

  /**
   * Simulate lead qualification
   */
  qualifyLead(leadId: string, responses: Record<string, any>): any {
    const lead = this.getLeadByIdOrPhone(leadId);
    if (!lead) return null;

    // Simulate qualification logic based on mockup data
    const budgetMatch = this.getPropertiesInBudget(
      parseInt(lead.budget_range.split('-')[0]), 
      parseInt(lead.budget_range.split('-')[1])
    );

    const qualification = {
      leadId: lead.id,
      score: Math.floor(Math.random() * 100), // Mock scoring
      budget_qualified: budgetMatch.length > 0,
      timeline_qualified: lead.move_in_timeline !== 'flexible',
      location_match: lead.property_interest.length > 0,
      recommended_properties: budgetMatch.map(p => p.id),
      next_action: this.determineNextAction(lead),
      agent_assignment: this.getAgentsByProperty(lead.property_interest[0])[0]?.id || 'agent_maria'
    };

    logger.info('Lead qualified using mockup data', { leadId, qualification });
    return qualification;
  }

  private determineNextAction(lead: Lead): string {
    switch (lead.qualification_status) {
      case 'highly_qualified':
        return 'schedule_tour_immediately';
      case 'qualified':
        return 'schedule_tour_within_week';
      case 'partially_qualified':
        return 'nurture_and_qualify';
      case 'premium_qualified':
        return 'escalate_to_senior_agent';
      default:
        return 'continue_qualification';
    }
  }

  /**
   * Get conversation analytics
   */
  getConversationAnalytics(): any {
    const conversations = this.getConversations();
    return conversations.conversation_analytics;
  }

  /**
   * Simulate booking a tour
   */
  bookTour(leadId: string, date: string, time: string, propertyId: string): any {
    const lead = this.getLeadByIdOrPhone(leadId);
    const property = this.getPropertyById(propertyId);
    const agents = this.getAgentsByProperty(propertyId);

    if (!lead || !property || agents.length === 0) {
      throw new Error('Invalid booking parameters');
    }

    const agent = agents[0]; // Use first available agent
    const booking = {
      bookingId: `booking_${Date.now()}`,
      leadId: lead.id,
      leadName: lead.name,
      leadPhone: lead.phone,
      propertyId: property.id,
      propertyName: property.name,
      propertyAddress: property.location.address,
      agentId: agent.id,
      agentName: agent.name,
      agentPhone: agent.phone,
      date,
      time,
      duration: propertyId === 'josefa' ? 60 : 90,
      status: 'confirmed',
      confirmationCode: Math.random().toString(36).substring(2, 8).toUpperCase()
    };

    logger.info('Tour booked using mockup data', booking);
    return booking;
  }

  /**
   * Get lead context for conversation personalization
   */
  getLeadContext(leadId: string): any {
    const lead = this.getLeadByIdOrPhone(leadId);
    if (!lead) return null;

    const context = this.getMexicanContext();
    const persona = context.demo_personas.find((p: any) => p.name === lead.name) || context.demo_personas[0];
    
    return {
      lead,
      persona,
      mexican_expressions: this.getMexicanExpressions(),
      real_estate_terms: this.getRealEstateTerms(),
      communication_preferences: context.cultural_context.communication_preferences,
      suggested_properties: this.getPropertiesInBudget(
        parseInt(lead.budget_range.split('-')[0]),
        parseInt(lead.budget_range.split('-')[1])
      )
    };
  }
}

export const mockupDataService = new MockupDataService();