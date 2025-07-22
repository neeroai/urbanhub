import { Client } from '@hubspot/api-client';
import { logger } from '../utils/logger';
import { ContactSync, DealSync, ActivityLog } from '../types/hubspot';

export class HubSpotService {
  private client: Client;

  constructor() {
    this.client = new Client({
      accessToken: process.env.HUBSPOT_ACCESS_TOKEN,
      basePath: process.env.HUBSPOT_BASE_URL
    });
  }

  /**
   * Create or update contact in HubSpot
   */
  async upsertContact(contactData: any): Promise<any> {
    try {
      const properties = {
        email: contactData.email,
        firstname: contactData.firstName,
        lastname: contactData.lastName,
        phone: contactData.phone,
        // Custom properties for AI conversation data
        ai_conversation_status: contactData.conversationStatus,
        ai_agent_last_contact: new Date().toISOString(),
        lead_source: 'Bird.com AI Agent',
        urbanhub_property_interest: contactData.propertyInterest,
        preferred_communication: 'WhatsApp'
      };

      // Try to find existing contact by email or phone
      let existingContact = null;
      if (contactData.email) {
        try {
          const searchResult = await this.client.crm.contacts.searchApi.doSearch({
            filterGroups: [{
              filters: [{
                propertyName: 'email',
                operator: 'EQ',
                value: contactData.email
              }]
            }],
            properties: Object.keys(properties),
            limit: 1
          });
          existingContact = searchResult.results[0] || null;
        } catch (searchError) {
          logger.debug('Contact search by email failed, creating new contact');
        }
      }

      if (existingContact) {
        // Update existing contact
        const response = await this.client.crm.contacts.basicApi.update(
          existingContact.id,
          { properties }
        );
        logger.info(`HubSpot contact updated: ${existingContact.id}`);
        return response;
      } else {
        // Create new contact
        const response = await this.client.crm.contacts.basicApi.create({
          properties
        });
        logger.info(`HubSpot contact created: ${response.id}`);
        return response;
      }
    } catch (error) {
      logger.error('Failed to upsert HubSpot contact:', error);
      throw new Error(`HubSpot contact upsert failed: ${error}`);
    }
  }

  /**
   * Create or update deal in HubSpot
   */
  async upsertDeal(dealData: any): Promise<any> {
    try {
      const properties = {
        dealname: `${dealData.contactName} - ${dealData.propertyName}`,
        dealstage: this.mapAIStageToHubSpot(dealData.aiStage),
        amount: dealData.estimatedRent,
        pipeline: 'default', // or your custom pipeline ID
        source: 'Bird.com AI Agent',
        ai_agent_type: dealData.aiAgent,
        property_name: dealData.propertyName,
        tour_scheduled_date: dealData.tourDate,
        lead_qualification_score: dealData.qualificationScore,
        urbanhub_conversation_id: dealData.conversationId
      };

      // Associate with contact
      const associations = dealData.contactId ? [
        {
          to: { id: dealData.contactId },
          types: [
            {
              associationCategory: 'HUBSPOT_DEFINED',
              associationTypeId: 3 // Contact to Deal association
            }
          ]
        }
      ] : [];

      const response = await this.client.crm.deals.basicApi.create({
        properties,
        associations
      });

      logger.info(`HubSpot deal created: ${response.id}`);
      return response;
    } catch (error) {
      logger.error('Failed to create HubSpot deal:', error);
      throw new Error(`HubSpot deal creation failed: ${error}`);
    }
  }

  /**
   * Log AI conversation activity
   */
  async logActivity(activityData: ActivityLog): Promise<any> {
    try {
      const engagementData = {
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
          body: this.formatActivityBody(activityData)
        }
      };

      const response = await this.client.crm.engagements.basicApi.create(engagementData);
      logger.info(`HubSpot activity logged: ${response.id}`);
      return response;
    } catch (error) {
      logger.error('Failed to log HubSpot activity:', error);
      throw new Error(`HubSpot activity logging failed: ${error}`);
    }
  }

  /**
   * Get contact by phone or email
   */
  async getContact(identifier: string, type: 'email' | 'phone' = 'email'): Promise<any> {
    try {
      const searchResult = await this.client.crm.contacts.searchApi.doSearch({
        filterGroups: [{
          filters: [{
            propertyName: type,
            operator: 'EQ',
            value: identifier
          }]
        }],
        properties: [
          'email',
          'firstname',
          'lastname',
          'phone',
          'ai_conversation_status',
          'ai_agent_last_contact',
          'urbanhub_property_interest',
          'lead_source'
        ],
        limit: 1
      });

      return searchResult.results[0] || null;
    } catch (error) {
      logger.error('Failed to get HubSpot contact:', error);
      return null;
    }
  }

  /**
   * Get deals associated with contact
   */
  async getContactDeals(contactId: string): Promise<any[]> {
    try {
      const response = await this.client.crm.contacts.associationsApi.getAll(
        contactId,
        'deals'
      );

      const dealIds = response.results.map(assoc => assoc.id);
      if (dealIds.length === 0) return [];

      const dealsResponse = await this.client.crm.deals.batchApi.read({
        inputs: dealIds.map(id => ({ id })),
        properties: [
          'dealname',
          'dealstage',
          'amount',
          'source',
          'ai_agent_type',
          'property_name',
          'tour_scheduled_date'
        ]
      });

      return dealsResponse.results;
    } catch (error) {
      logger.error('Failed to get contact deals:', error);
      return [];
    }
  }

  /**
   * Update deal stage based on AI conversation progress
   */
  async updateDealStage(
    dealId: string,
    newStage: string,
    aiAgent: string
  ): Promise<any> {
    try {
      const properties = {
        dealstage: this.mapAIStageToHubSpot(newStage),
        ai_agent_type: aiAgent,
        ai_agent_last_update: new Date().toISOString()
      };

      const response = await this.client.crm.deals.basicApi.update(dealId, {
        properties
      });

      logger.info(`HubSpot deal stage updated: ${dealId} -> ${newStage}`);
      return response;
    } catch (error) {
      logger.error('Failed to update deal stage:', error);
      throw new Error(`HubSpot deal stage update failed: ${error}`);
    }
  }

  /**
   * Get pipeline stages
   */
  async getPipelineStages(pipelineId: string = 'default'): Promise<any[]> {
    try {
      const response = await this.client.crm.pipelines.pipelineStagesApi.getAll(
        'deals',
        pipelineId
      );
      return response.results;
    } catch (error) {
      logger.error('Failed to get pipeline stages:', error);
      return [];
    }
  }

  /**
   * Create custom properties for AI integration
   */
  async createCustomProperties(): Promise<void> {
    const customProperties = [
      {
        name: 'ai_conversation_status',
        label: 'AI Conversation Status',
        type: 'enumeration',
        fieldType: 'select',
        groupName: 'contactinformation',
        options: [
          { label: 'Not Contacted', value: 'not_contacted' },
          { label: 'In Progress', value: 'in_progress' },
          { label: 'Qualified', value: 'qualified' },
          { label: 'Tour Scheduled', value: 'tour_scheduled' },
          { label: 'Completed', value: 'completed' },
          { label: 'Unqualified', value: 'unqualified' }
        ]
      },
      {
        name: 'ai_agent_last_contact',
        label: 'AI Agent Last Contact',
        type: 'datetime',
        fieldType: 'date',
        groupName: 'contactinformation'
      },
      {
        name: 'urbanhub_property_interest',
        label: 'UrbanHub Property Interest',
        type: 'string',
        fieldType: 'text',
        groupName: 'contactinformation'
      }
    ];

    for (const property of customProperties) {
      try {
        await this.client.crm.properties.coreApi.create('contacts', property);
        logger.info(`Custom property created: ${property.name}`);
      } catch (error) {
        if (error.message?.includes('already exists')) {
          logger.debug(`Custom property already exists: ${property.name}`);
        } else {
          logger.error(`Failed to create custom property ${property.name}:`, error);
        }
      }
    }
  }

  /**
   * Map AI conversation stages to HubSpot deal stages
   */
  private mapAIStageToHubSpot(aiStage: string): string {
    const stageMapping: Record<string, string> = {
      'lead': 'qualifiedtobuy',
      'qualified': 'appointmentscheduled',
      'tour_scheduled': 'appointmentscheduled',
      'tour_completed': 'decisionmakerstage',
      'application': 'contractsent',
      'lease_signed': 'closedwon',
      'unqualified': 'closedlost'
    };

    return stageMapping[aiStage] || 'qualifiedtobuy';
  }

  /**
   * Format activity body for HubSpot engagement
   */
  private formatActivityBody(activityData: ActivityLog): string {
    const sections = [
      `AI Agent Activity: ${activityData.activityType}`,
      `Agent: ${activityData.aiAgent || 'Maya'}`,
      `Conversation ID: ${activityData.conversationId}`,
      '',
      'Activity Details:',
      activityData.content,
      '',
      `Timestamp: ${new Date(activityData.timestamp).toLocaleString('es-MX', {
        timeZone: 'America/Mexico_City'
      })}`
    ];

    return sections.join('\n');
  }

  /**
   * Sync contact data from Bird.com to HubSpot
   */
  async syncContactFromBird(birdContactData: any): Promise<ContactSync> {
    try {
      const hubspotContact = await this.upsertContact({
        email: birdContactData.email,
        firstName: birdContactData.firstName || birdContactData.name?.split(' ')[0],
        lastName: birdContactData.lastName || birdContactData.name?.split(' ').slice(1).join(' '),
        phone: birdContactData.phone || birdContactData.msisdn,
        conversationStatus: birdContactData.conversationStatus,
        propertyInterest: birdContactData.propertyInterest
      });

      const syncData: ContactSync = {
        hubspotContactId: hubspotContact.id,
        birdContactId: birdContactData.id,
        phoneNumber: birdContactData.phone || birdContactData.msisdn,
        email: birdContactData.email,
        name: birdContactData.name,
        lastSyncTimestamp: new Date(),
        syncStatus: 'synced'
      };

      logger.info('Contact synced from Bird to HubSpot', {
        hubspotId: hubspotContact.id,
        birdId: birdContactData.id
      });

      return syncData;
    } catch (error) {
      logger.error('Failed to sync contact from Bird to HubSpot:', error);
      throw error;
    }
  }

  /**
   * Test HubSpot connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.crm.contacts.basicApi.getPage(1);
      logger.info('HubSpot connection test successful');
      return true;
    } catch (error) {
      logger.error('HubSpot connection test failed:', error);
      return false;
    }
  }
}

export const hubspotService = new HubSpotService();