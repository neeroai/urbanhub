import { logger } from '../utils/logger';
import { mockupDataService } from './mockup-data';
import { ActivityLog } from '../types/hubspot';

/**
 * Demo version of HubSpot service that uses mockup data instead of real API calls
 * This service simulates all HubSpot operations for demonstration purposes
 */
export class DemoHubSpotService {
  private demoData: Map<string, any> = new Map();
  private contactIdCounter = 1000;
  private dealIdCounter = 2000;
  private activityIdCounter = 3000;

  constructor() {
    this.initializeDemoData();
  }

  /**
   * Initialize demo data with pre-populated contacts and deals
   */
  private initializeDemoData() {
    // Pre-populate with leads from mockup data
    const leads = mockupDataService.getAllProperties().length; // Using properties count as proxy
    
    // Simulate existing HubSpot contacts for demo purposes
    const demoContacts = [
      { id: '1001', email: 'maria.gonzalez@email.com', status: 'new' },
      { id: '1002', email: 'carlos.hernandez@tech.mx', status: 'qualified' },
      { id: '1003', email: 'ana.ruiz@consulting.com', status: 'tour_scheduled' },
      { id: '1004', email: 'diego.martinez@startup.mx', status: 'nurturing' },
      { id: '1005', email: 'isabella.fernandez@international.com', status: 'follow_up_needed' }
    ];

    demoContacts.forEach(contact => {
      this.demoData.set(`contact_${contact.id}`, contact);
    });

    logger.info('Demo HubSpot service initialized with mockup contacts');
  }

  /**
   * Simulate creating or updating contact in HubSpot
   */
  async upsertContact(contactData: any): Promise<any> {
    logger.info('Demo: Simulating HubSpot contact upsert', { email: contactData.email });

    // Check if contact exists in mockup data
    const lead = mockupDataService.getLeadByIdOrPhone(contactData.phone || contactData.email);
    
    let contactId: string;
    let isUpdate = false;

    // Look for existing contact
    for (const [key, contact] of this.demoData.entries()) {
      if (key.startsWith('contact_') && contact.email === contactData.email) {
        contactId = contact.id;
        isUpdate = true;
        break;
      }
    }

    if (!contactId) {
      contactId = (++this.contactIdCounter).toString();
    }

    const hubspotContact = {
      id: contactId,
      properties: {
        email: contactData.email,
        firstname: contactData.firstName,
        lastname: contactData.lastName,
        phone: contactData.phone,
        ai_conversation_status: contactData.conversationStatus || 'new',
        ai_agent_last_contact: new Date().toISOString(),
        lead_source: 'Bird.com AI Agent',
        urbanhub_property_interest: contactData.propertyInterest || (lead?.property_interest?.join(', ') || ''),
        preferred_communication: 'WhatsApp',
        // Add lead data from mockup if available
        budget_range: lead?.budget_range || '',
        move_in_timeline: lead?.move_in_timeline || '',
        location_preference: lead?.location_preference || '',
        demographic_profile: lead?.demographics?.lifestyle || ''
      },
      createdAt: isUpdate ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.demoData.set(`contact_${contactId}`, hubspotContact);

    logger.info(`Demo: HubSpot contact ${isUpdate ? 'updated' : 'created'}: ${contactId}`, {
      email: contactData.email,
      leadData: lead ? 'found' : 'not_found'
    });

    return hubspotContact;
  }

  /**
   * Simulate creating or updating deal in HubSpot
   */
  async upsertDeal(dealData: any): Promise<any> {
    logger.info('Demo: Simulating HubSpot deal creation', { contactName: dealData.contactName });

    const dealId = (++this.dealIdCounter).toString();
    const property = mockupDataService.getPropertyById(dealData.propertyId);

    const hubspotDeal = {
      id: dealId,
      properties: {
        dealname: `${dealData.contactName} - ${property?.name || dealData.propertyName}`,
        dealstage: this.mapAIStageToHubSpot(dealData.aiStage),
        amount: dealData.estimatedRent || property?.price_range?.min || 20000,
        pipeline: 'default',
        source: 'Bird.com AI Agent',
        ai_agent_type: dealData.aiAgent || 'lead_qualifier',
        property_name: property?.name || dealData.propertyName,
        property_address: property?.location?.address || '',
        tour_scheduled_date: dealData.tourDate || null,
        lead_qualification_score: dealData.qualificationScore || Math.floor(Math.random() * 100),
        urbanhub_conversation_id: dealData.conversationId,
        estimated_close_date: this.calculateEstimatedCloseDate(dealData.aiStage),
        deal_probability: this.calculateDealProbability(dealData.aiStage)
      },
      associations: {
        contactId: dealData.contactId
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.demoData.set(`deal_${dealId}`, hubspotDeal);

    logger.info(`Demo: HubSpot deal created: ${dealId}`, {
      property: property?.name,
      stage: dealData.aiStage
    });

    return hubspotDeal;
  }

  /**
   * Simulate logging AI conversation activity
   */
  async logActivity(activityData: ActivityLog): Promise<any> {
    logger.info('Demo: Simulating HubSpot activity log', {
      type: activityData.activityType,
      contactId: activityData.contactId
    });

    const activityId = (++this.activityIdCounter).toString();
    
    const hubspotActivity = {
      id: activityId,
      engagement: {
        active: true,
        type: 'NOTE',
        timestamp: new Date(activityData.timestamp).getTime()
      },
      associations: {
        contactIds: [activityData.contactId],
        dealIds: activityData.dealId ? [activityData.dealId] : []
      },
      metadata: {
        body: this.formatActivityBody(activityData),
        subject: `AI Agent Activity: ${activityData.activityType}`
      },
      createdAt: new Date().toISOString()
    };

    this.demoData.set(`activity_${activityId}`, hubspotActivity);

    logger.info(`Demo: HubSpot activity logged: ${activityId}`);
    return hubspotActivity;
  }

  /**
   * Simulate getting contact by phone or email
   */
  async getContact(identifier: string, type: 'email' | 'phone' = 'email'): Promise<any> {
    logger.debug(`Demo: Searching HubSpot contact by ${type}: ${identifier}`);

    // First check mockup data
    const lead = mockupDataService.getLeadByIdOrPhone(identifier);
    if (lead) {
      // Return simulated HubSpot contact based on lead data
      return {
        id: lead.id.replace('lead_', '100'),
        properties: {
          email: lead.email,
          firstname: lead.name.split(' ')[0],
          lastname: lead.name.split(' ').slice(1).join(' '),
          phone: lead.phone,
          ai_conversation_status: lead.qualification_status,
          ai_agent_last_contact: lead.last_contact,
          urbanhub_property_interest: lead.property_interest.join(', '),
          lead_source: lead.source,
          budget_range: lead.budget_range,
          move_in_timeline: lead.move_in_timeline
        }
      };
    }

    // Check demo data
    for (const [key, contact] of this.demoData.entries()) {
      if (key.startsWith('contact_')) {
        const props = contact.properties;
        if ((type === 'email' && props.email === identifier) ||
            (type === 'phone' && props.phone === identifier)) {
          return contact;
        }
      }
    }

    logger.debug(`Demo: No HubSpot contact found for ${identifier}`);
    return null;
  }

  /**
   * Simulate getting deals associated with contact
   */
  async getContactDeals(contactId: string): Promise<any[]> {
    logger.debug(`Demo: Getting HubSpot deals for contact: ${contactId}`);

    const deals = [];
    for (const [key, deal] of this.demoData.entries()) {
      if (key.startsWith('deal_') && deal.associations?.contactId === contactId) {
        deals.push(deal);
      }
    }

    logger.info(`Demo: Found ${deals.length} deals for contact ${contactId}`);
    return deals;
  }

  /**
   * Simulate updating deal stage based on AI conversation progress
   */
  async updateDealStage(dealId: string, newStage: string, aiAgent: string): Promise<any> {
    logger.info(`Demo: Updating HubSpot deal stage: ${dealId} -> ${newStage}`);

    const deal = this.demoData.get(`deal_${dealId}`);
    if (deal) {
      deal.properties.dealstage = this.mapAIStageToHubSpot(newStage);
      deal.properties.ai_agent_type = aiAgent;
      deal.properties.ai_agent_last_update = new Date().toISOString();
      deal.properties.deal_probability = this.calculateDealProbability(newStage);
      deal.updatedAt = new Date().toISOString();

      this.demoData.set(`deal_${dealId}`, deal);
      
      logger.info(`Demo: HubSpot deal stage updated successfully`);
      return deal;
    }

    logger.warn(`Demo: Deal ${dealId} not found for stage update`);
    return null;
  }

  /**
   * Simulate syncing contact data from Bird.com to HubSpot
   */
  async syncContactFromBird(birdContactData: any): Promise<any> {
    logger.info('Demo: Simulating contact sync from Bird to HubSpot', {
      birdId: birdContactData.id,
      phone: birdContactData.phone
    });

    const hubspotContact = await this.upsertContact({
      email: birdContactData.email,
      firstName: birdContactData.firstName || birdContactData.name?.split(' ')[0],
      lastName: birdContactData.lastName || birdContactData.name?.split(' ').slice(1).join(' '),
      phone: birdContactData.phone || birdContactData.msisdn,
      conversationStatus: birdContactData.conversationStatus,
      propertyInterest: birdContactData.propertyInterest
    });

    const syncData = {
      hubspotContactId: hubspotContact.id,
      birdContactId: birdContactData.id,
      phoneNumber: birdContactData.phone || birdContactData.msisdn,
      email: birdContactData.email,
      name: birdContactData.name,
      lastSyncTimestamp: new Date(),
      syncStatus: 'synced'
    };

    logger.info('Demo: Contact sync completed', {
      hubspotId: hubspotContact.id,
      birdId: birdContactData.id
    });

    return syncData;
  }

  /**
   * Simulate testing HubSpot connection
   */
  async testConnection(): Promise<boolean> {
    logger.info('Demo: Simulating HubSpot connection test - always returns true');
    return true;
  }

  /**
   * Get demo analytics data
   */
  getDemoAnalytics(): any {
    const totalContacts = Array.from(this.demoData.keys()).filter(k => k.startsWith('contact_')).length;
    const totalDeals = Array.from(this.demoData.keys()).filter(k => k.startsWith('deal_')).length;
    const totalActivities = Array.from(this.demoData.keys()).filter(k => k.startsWith('activity_')).length;

    return {
      contacts: {
        total: totalContacts,
        new_today: Math.floor(totalContacts * 0.1),
        qualified: Math.floor(totalContacts * 0.4),
        tour_scheduled: Math.floor(totalContacts * 0.2)
      },
      deals: {
        total: totalDeals,
        in_progress: Math.floor(totalDeals * 0.6),
        closed_won: Math.floor(totalDeals * 0.2),
        closed_lost: Math.floor(totalDeals * 0.2)
      },
      activities: {
        total: totalActivities,
        ai_conversations: Math.floor(totalActivities * 0.8),
        human_handoffs: Math.floor(totalActivities * 0.2)
      },
      sync_status: 'healthy',
      last_sync: new Date().toISOString()
    };
  }

  /**
   * Map AI conversation stages to HubSpot deal stages
   */
  private mapAIStageToHubSpot(aiStage: string): string {
    const stageMapping: Record<string, string> = {
      'new': 'qualifiedtobuy',
      'qualified': 'appointmentscheduled',
      'tour_scheduled': 'appointmentscheduled',
      'tour_completed': 'decisionmakerstage',
      'application': 'contractsent',
      'lease_signed': 'closedwon',
      'unqualified': 'closedlost',
      'nurturing': 'qualifiedtobuy',
      'follow_up_needed': 'decisionmakerstage'
    };

    return stageMapping[aiStage] || 'qualifiedtobuy';
  }

  /**
   * Calculate estimated close date based on stage
   */
  private calculateEstimatedCloseDate(stage: string): string {
    const daysToAdd = {
      'new': 30,
      'qualified': 21,
      'tour_scheduled': 14,
      'tour_completed': 7,
      'application': 3,
      'nurturing': 45
    }[stage] || 30;

    const closeDate = new Date();
    closeDate.setDate(closeDate.getDate() + daysToAdd);
    return closeDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  }

  /**
   * Calculate deal probability based on stage
   */
  private calculateDealProbability(stage: string): number {
    const probabilityMap = {
      'new': 10,
      'qualified': 25,
      'tour_scheduled': 50,
      'tour_completed': 75,
      'application': 90,
      'unqualified': 0,
      'nurturing': 15
    };

    return probabilityMap[stage] || 10;
  }

  /**
   * Format activity body for HubSpot engagement
   */
  private formatActivityBody(activityData: ActivityLog): string {
    const sections = [
      `🤖 AI Agent Activity: ${activityData.activityType}`,
      `Agent: ${activityData.aiAgent || 'Bird AI Assistant'}`,
      `Conversation ID: ${activityData.conversationId}`,
      '',
      '📋 Activity Details:',
      activityData.content,
      '',
      `📅 Timestamp: ${new Date(activityData.timestamp).toLocaleString('es-MX', {
        timeZone: 'America/Mexico_City'
      })}`,
      '',
      '💡 This activity was logged automatically by UrbanHub\'s Bird.com AI integration'
    ];

    return sections.join('\n');
  }

  /**
   * Get all demo data for debugging
   */
  getDemoData(): Map<string, any> {
    return this.demoData;
  }
}

// Export demo service instance
export const demoHubSpotService = new DemoHubSpotService();