# HubSpot Integration Requirements

## Document Overview

This document defines the technical requirements for bidirectional integration between Bird.com AI agents and UrbanHub's HubSpot CRM, based on confirmed capabilities discussed in the stakeholder meeting.

**Integration Type**: Real-time bidirectional synchronization  
**Primary Platform**: HubSpot CRM (committed until 2027)  
**Secondary Platform**: Bird.com conversational AI  
**Timeline**: Demo by Tuesday, Production by August 1, 2025

---

## Integration Architecture

### Confirmed Technical Approach
Based on the meeting transcription, the technical team confirmed:
- "Direct HubSpot integration with official API"
- "Real-time synchronization of contacts, deals, activities"
- "Bidirectional triggers and actions between Bird and HubSpot"
- "Custom extensions for any missing functionality"

### Data Flow Pattern
```
HubSpot CRM ←→ Bird Platform ←→ WhatsApp/SMS ←→ Customer
```

#### Inbound Flow (HubSpot → Bird)
- New leads trigger AI agent contact initiation
- Lead status changes trigger conversation workflows
- Property assignments route to appropriate agents
- Contact information populates conversation context

#### Outbound Flow (Bird → HubSpot)
- Conversation outcomes update lead status
- Customer responses create activity records
- Tour scheduling generates calendar events
- Qualification data updates contact properties

---

## Core Integration Requirements

### 1. Contact Management

#### Contact Creation/Updates
- **Trigger**: New WhatsApp/SMS conversation from unknown number
- **Action**: Create new HubSpot contact with phone number, conversation source
- **Data Points**:
  - Phone number (primary identifier)
  - First name (collected during conversation)
  - Last name (collected during conversation)
  - Email address (if provided)
  - Property interest (building preference)
  - Lead source (WhatsApp, SMS, referral)
  - Conversation language preference

#### Contact Enrichment
- **Trigger**: AI agent collects qualification information
- **Action**: Update existing HubSpot contact properties
- **Data Points**:
  - Budget range
  - Move-in timeline
  - Number of bedrooms required
  - Pet ownership status
  - Parking requirements
  - Lease duration preference
  - Special requirements/notes

### 2. Deal/Opportunity Management

#### Deal Creation
- **Trigger**: Lead qualifies for tour scheduling
- **Action**: Create HubSpot deal with property and timeline
- **Required Fields**:
  - Deal name: "[Contact Name] - [Property Name] Tour"
  - Deal stage: "Tour Scheduled"
  - Property association: Josefa, Matilde, or future properties
  - Expected close date: Based on move-in timeline
  - Deal value: Estimated based on property and lease length

#### Deal Progression
- **Trigger**: Conversation milestones and outcomes
- **Action**: Update deal stage in HubSpot pipeline
- **Stage Mapping**:
  - New Lead → "Initial Contact"
  - Qualified → "Qualified Lead"
  - Tour Scheduled → "Tour Scheduled"
  - Tour Completed → "Tour Completed"
  - Application Submitted → "Application in Review"
  - Lease Signed → "Closed Won"
  - Lost/Unresponsive → "Closed Lost"

### 3. Activity Tracking

#### Conversation Logging
- **Trigger**: Every AI agent interaction
- **Action**: Create HubSpot activity record
- **Activity Details**:
  - Activity type: "WhatsApp Conversation" or "SMS Conversation"
  - Subject: Conversation summary
  - Description: Full conversation transcript
  - Outcome: Qualified, scheduled, follow-up needed, escalated
  - Next action: Automated or manual follow-up required

#### Task Creation
- **Trigger**: Escalation or manual follow-up required
- **Action**: Create HubSpot task for leasing agent
- **Task Details**:
  - Task type: "Follow-up Call" or "Tour Preparation"
  - Assigned to: Property leasing agent
  - Due date: Based on urgency and customer timeline
  - Priority: High for hot leads, normal for standard follow-up
  - Context: Conversation summary and customer requirements

### 4. Calendar Integration

#### Tour Scheduling
- **Trigger**: Customer agrees to tour during AI conversation
- **Action**: Create calendar event for leasing agent
- **Integration Points**:
  - Calendly (if used by leasing agents)
  - Google Calendar
  - Outlook Calendar
  - HubSpot meetings tool

#### Event Details
- **Event Title**: "Property Tour - [Contact Name]"
- **Duration**: 60 minutes (configurable)
- **Location**: Property address (Josefa or Matilde)
- **Attendees**: Leasing agent, customer
- **Description**: Customer requirements and conversation context
- **HubSpot Association**: Link to contact and deal records

---

## Lead Status Management

### Current HubSpot Lead Stages
Based on meeting discussion, UrbanHub uses multiple lead states in HubSpot. The AI agents must support these transitions:

#### Standard Lead Progression
1. **New/Uncontacted**: Fresh lead from marketing campaigns
2. **Contacted**: Initial AI agent engagement completed
3. **Qualified**: Budget, timeline, and requirements confirmed
4. **Tour Scheduled**: Calendar appointment booked
5. **Tour Completed**: Property visit finished
6. **Follow-up Required**: Additional nurturing needed
7. **Application Submitted**: Formal rental application received
8. **Closed Won**: Lease signed and completed
9. **Closed Lost**: Lead decided not to proceed

#### Exception Handling
- **Unresponsive**: Multiple contact attempts without response
- **Call Back Later**: Customer requested delayed follow-up
- **Need to Discuss**: Requires partner/family consultation
- **Budget Mismatch**: Outside property price range
- **Timing Mismatch**: Move-in date too far in future

### Automated Status Updates

#### Trigger-Based Updates
From the meeting: *"How does Bird change the lead status and trigger tasks?"*

**Conversation Outcome → HubSpot Status**:
- Customer responds positively → "Contacted"
- Qualification completed → "Qualified"
- Tour date confirmed → "Tour Scheduled"
- Customer unresponsive for 48 hours → "Unresponsive"
- Customer requests later contact → "Call Back Later"
- Budget/timeline doesn't match → "Closed Lost"

#### Workflow Triggers
**HubSpot Status → Bird Action**:
- "New/Uncontacted" → Trigger initial AI outreach
- "Call Back Later" → Schedule delayed follow-up campaign
- "Unresponsive" → Initiate warming sequence
- "Tour Scheduled" → Send confirmation and reminder messages
- "Follow-up Required" → Human agent task creation

---

## Technical Implementation

### API Integration Approach

#### HubSpot API Requirements
- **Authentication**: OAuth 2.0 with refresh token handling
- **Rate Limiting**: Respect HubSpot's 100 requests/10 seconds limit
- **Error Handling**: Retry logic for temporary failures
- **Webhooks**: Real-time notifications for HubSpot changes

#### Required HubSpot Scopes
- `contacts` - Create and update contact records
- `deals` - Create and update opportunity records
- `tickets` - Create support tickets for escalations
- `timeline` - Add conversation activities to contact timeline
- `automation` - Trigger HubSpot workflows
- `calendar` - Create and update calendar events

### Bird Platform Integration

#### Webhook Configuration
- **Incoming Messages**: New WhatsApp/SMS messages trigger AI agent
- **Conversation Events**: Status changes sync to HubSpot
- **Escalation Events**: Create HubSpot tasks for human agents
- **Scheduled Messages**: Automated follow-up campaigns

#### Data Mapping
- **Bird Contact ID ↔ HubSpot Contact ID**: Primary relationship key
- **Bird Conversation ID ↔ HubSpot Activity ID**: Conversation tracking
- **Bird Agent Type → HubSpot Lead Source**: Attribution tracking
- **Bird Conversation Status → HubSpot Deal Stage**: Pipeline progression

---

## Data Synchronization

### Real-time Sync Requirements

#### Immediate Sync Events (< 30 seconds)
- New conversation initiated
- Customer qualification completed
- Tour scheduled or cancelled
- Escalation to human agent required
- Deal stage changes

#### Batch Sync Events (Every 15 minutes)
- Conversation transcript updates
- Contact property enrichment
- Activity summaries
- Performance metrics

### Data Consistency

#### Conflict Resolution
- **HubSpot as Source of Truth**: For contact basic information
- **Bird as Source of Truth**: For conversation content and status
- **Timestamp Priority**: Most recent update wins for shared fields
- **Manual Override**: Human agents can override AI decisions

#### Error Handling
- **Failed Sync**: Retry with exponential backoff
- **Data Conflicts**: Log for manual resolution
- **API Limits**: Queue updates and process in order
- **Timeout Handling**: Graceful degradation without blocking conversations

---

## Security and Compliance

### Data Protection
- **Encryption**: All data transmission via HTTPS/TLS
- **Authentication**: Secure API keys and OAuth tokens
- **Access Control**: Role-based permissions for integration access
- **Audit Logging**: Complete trail of all data synchronization

### Mexican Compliance
- **Data Localization**: Ensure Mexican data residency requirements
- **WhatsApp Business**: Comply with Meta's business messaging policies
- **Privacy Regulations**: Mexican data protection law compliance
- **Retention Policies**: Configurable data retention periods

---

## Testing and Validation

### Integration Testing

#### Demo Environment (By Tuesday)
- Mock HubSpot data with sample leads
- Test conversation flows with status updates
- Validate calendar integration
- Demonstrate escalation workflows

#### Production Testing
- **Unit Tests**: Individual API endpoint validation
- **Integration Tests**: End-to-end workflow testing
- **Load Tests**: High-volume conversation handling
- **Error Tests**: Failure scenario validation

### Success Criteria
- 99%+ data synchronization accuracy
- < 30 second delay for real-time updates
- Zero data loss during integration failures
- Complete conversation audit trail in HubSpot

---

## Monitoring and Analytics

### Key Metrics
- **Sync Success Rate**: Percentage of successful API calls
- **Response Time**: Average time for data synchronization
- **Error Rate**: Failed integration attempts per hour
- **Data Quality**: Completeness and accuracy of synced data

### Alerting
- **Critical**: Integration failures affecting customer conversations
- **Warning**: Slow response times or increased error rates
- **Info**: Successful batch synchronization completion

---

## Implementation Timeline

### Phase 1: Demo Preparation (This Week)
- [ ] Basic HubSpot API connection
- [ ] Contact creation and update workflows
- [ ] Simple conversation logging
- [ ] Demo environment configuration

### Phase 2: Core Integration (Weeks 2-3)
- [ ] Deal management automation
- [ ] Calendar integration
- [ ] Bidirectional status synchronization
- [ ] Error handling and retry logic

### Phase 3: Production Deployment (Week 4)
- [ ] Security hardening
- [ ] Performance optimization
- [ ] Monitoring and alerting setup
- [ ] Team training and handover

---

## Open Questions for UrbanHub Team

### HubSpot Configuration
1. What are the exact names and definitions of current lead status values?
2. Which HubSpot properties are used for qualification data (budget, timeline, etc.)?
3. Are there custom HubSpot objects or properties we need to support?
4. What are the current deal pipeline stages and progression rules?

### Calendar Systems
1. Which calendar platforms do leasing agents currently use?
2. Are there specific booking rules or availability patterns?
3. How far in advance can tours be scheduled?
4. What happens when calendar conflicts occur?

### Business Logic
1. What triggers a lead to be marked as "qualified"?
2. How long should the AI wait before marking a lead "unresponsive"?
3. What scenarios require immediate escalation to human agents?
4. Are there different qualification criteria for different properties?

### Data Requirements
1. What additional customer information should be collected during conversations?
2. Are there compliance requirements for conversation data retention?
3. What reports or analytics are needed from the integrated system?
4. How should duplicate contacts be handled across multiple conversations?