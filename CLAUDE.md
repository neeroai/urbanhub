# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Primary Objective**: Create, configure, and deploy a fully functional AI conversation agent on Bird.com platform for UrbanHub Mexico's premium real estate operations using mockup data and Bird.com's native capabilities.

**Demo Focus**: Live demonstration of WhatsApp-based lead qualification, tour scheduling, and customer engagement workflows without external integrations.

### Demo Objective
Create a working AI agent that demonstrates:
1. **Lead Qualification**: Intelligent conversation flows for prospect evaluation
2. **Tour Scheduling**: Automated calendar management and booking
3. **Follow-up Automation**: Persistent customer engagement workflows
4. **Mexican Market Adaptation**: Spanish-language, cultural context awareness

## Technical Specifications

### Platform: Bird.com
- **Primary Channel**: WhatsApp Business API
- **AI Engine**: Bird.com ya tiene una integracion con OpenAI activa
- **Knowledge Base**: Property-specific information for each UrbanHub building

### Agent Capabilities Required
1. **Conversation Intelligence**
   - Natural Language Processing in Mexican Spanish
   - Context retention across multiple interactions
   - Sentiment analysis and urgency detection
   - Cultural context and local market understanding

2. **Lead Management**
   - Automatic lead classification (hot, warm, cold)
   - Budget qualification (rental range detection)
   - Timeline assessment (move-in urgency)
   - Property preference matching

3. **Tour Coordination**
   - Availability checking and booking
   - Calendar integration simulation
   - Confirmation and reminder workflows
   - Rescheduling and cancellation handling

4. **Escalation Management**
   - Complex inquiry detection
   - Human handoff triggers
   - Context preservation during transfers
   - Priority routing based on lead quality

## Conversation Flows

### Primary Flow: Lead Qualification
1. **Welcome Message**: Greeting and service overview
2. **Need Assessment**: Budget, timeline, preferences discovery
3. **Property Matching**: Recommendation based on criteria
4. **Tour Scheduling**: Calendar availability and booking
5. **Confirmation**: Details confirmation and next steps

### Secondary Flow: Information Requests
1. **Property Inquiries**: Amenities, pricing, availability
2. **Neighborhood Information**: Area details, transportation
3. **Leasing Process**: Application requirements, timelines
4. **Virtual Tours**: Digital property showcase options

### Escalation Flow: Complex Situations
1. **Trigger Detection**: Complex legal, financial, or technical questions
2. **Context Capture**: Conversation summary and customer details
3. **Agent Routing**: Appropriate human specialist assignment
4. **Handoff Protocol**: Seamless transition with context preservation

## Implementation Notes

### Bird.com Configuration Priority
1. **Agent Setup**: Create specialized conversation agent
2. **Knowledge Base**: Upload property and company information
3. **Conversation Flows**: Design decision trees for common scenarios
4. **Response Templates**: Prepare Mexican Spanish message templates
5. **Escalation Rules**: Define handoff triggers and procedures

**Project Name**: UrbanHub AI Agents Demo for Bird.com
**Purpose**: Demonstrate Bird.com platform capabilities for sophisticated real estate conversations using realistic mockup data from UrbanHub's operations across Mexico City properties.
**Target Audience**: UrbanHub stakeholders evaluating Bird.com platform capabilities for automating customer acquisition workflows.

---

## To-Do Conventions

- **SEQUENTIAL**: true
  <!-- Instructs Claude to follow the task list strictly in order. The next task should not begin until the previous one is explicitly marked as completed. -->

- **AUTOMARK**: false
  <!-- Prevents Claude from marking tasks as completed automatically. Tasks will only be marked as done when explicitly instructed by the user (e.g., "Mark task #1 as completed"). -->

---

## Mandatory Workflow Requirements (MUST)

1. **ALWAYS create ACTION_PLAN.md before coding complex tasks**
2. **Get human approval before implementation**
3. **Break large tasks into checkboxes in the plan file**
4. **Update progress in the plan file as you work**
5. **Use TodoWrite tool to track task progress**

---

## Standard Workflow

1. **Planning Phase**:
   - Think through the problem thoroughly
   - Read the codebase for relevant files and patterns
   - Write a detailed plan to ACTION_PLAN.md with checkboxes

2. **Approval Phase**:
   - Present the plan to the human
   - Wait for explicit approval before proceeding
   - Clarify any questions or concerns

3. **Implementation Phase**:
   - Work on todo items sequentially
   - Mark tasks as complete only when fully done
   - Provide high-level explanations of changes made

4. **Quality Assurance**:
   - Keep every change as simple as possible
   - Minimize code impact - prefer small, focused changes
   - Run tests and linting after each change

5. **Documentation**:
   - Add a review section to ACTION_PLAN.md
   - Summarize changes made and lessons learned

---

## Testing Standards (MUST)

- **Write failing tests first (TDD)**
- **Confirm test failures before implementation**
- **Implement only to make tests pass**
- **Never modify test files during implementation**
- **Run tests after each change**

---

## Technology Stack

**Platform**: Bird.com omnichannel messaging platform with native AI agent capabilities
**AI Engine**: Bird.com's integrated OpenAI GPT models for natural language processing
**Primary Channel**: WhatsApp Business API with Mexican market compliance
**Knowledge Base**: Bird.com native storage for property information and conversation context
**Demo Data**: Realistic mockup scenarios for UrbanHub properties (Josefa, Matilde buildings)
**Analytics**: Bird.com platform dashboards for conversation tracking and performance metrics
**Language Support**: Mexican Spanish with cultural context and real estate terminology

---

## Project Structure

```text
├── bmad-config.yaml              # BMAD configuration for AI agent development
├── bmad-core/                    # Core BMAD framework
│   └── expansion-packs/
│       └── urbanhub-real-estate/ # Real estate domain agents and workflows
├── docs/
│   ├── brief.md                  # Demo project requirements for Bird.com platform
│   ├── bird-platform-setup.md   # Bird.com platform configuration guide
│   ├── demo-scenarios.md         # Demo conversation flows and test scenarios
│   ├── mockup-data.md            # Property and lead data for demonstration
│   └── workflow-diagram.mmd      # Customer acquisition flow diagram
├── demo-data/
│   ├── properties/               # Josefa and Matilde building information
│   ├── leads/                    # Sample prospect profiles and scenarios
│   ├── conversations/            # Example conversation flows
│   └── schedules/                # Mockup availability and calendar data
├── bird-config/
│   ├── agent-templates/          # Conversation agent configurations
│   ├── knowledge-base/           # Property information for AI agents
│   ├── conversation-flows/       # Dialog trees and response templates
│   └── escalation-rules/         # Human handoff triggers and procedures
└── README.md                     # Demo setup and execution instructions
```

---

## Development Commands

```bash
# Bird.com Platform Setup Commands
npm run bird:setup              # Setup Bird.com platform configuration and agent creation
npm run bird:upload-knowledge   # Upload property knowledge base to Bird.com platform
npm run bird:configure-flows    # Configure conversation flows and decision trees
npm run bird:test-agent         # Test AI agent responses with mockup scenarios

# Demo Preparation Commands
npm run demo:prepare            # Prepare mockup data and conversation scenarios
npm run demo:validate           # Validate demo scenarios and conversation quality
npm run demo:reset              # Reset demo environment to initial state
npm run demo:simulate           # Simulate complete customer journey scenarios

# Agent Testing Commands
npm run agent:test-spanish      # Test Mexican Spanish conversation quality
npm run agent:test-escalation   # Test human handoff triggers and context preservation
npm run agent:test-scheduling   # Test tour booking and calendar integration simulation

# BMAD-METHOD Framework Commands
npm run bmad:init               # Initialize BMAD session for agent development
npm run bmad:story              # Create user stories for agent behaviors
npm run bmad:architect          # Run architecture planning for agent system

# Quality Assurance
npm run validate:conversations  # Validate conversation flows and cultural appropriateness
npm run test:demo-scenarios     # Test all demo scenarios for realistic interactions
```

---

## Productivity Shortcuts

### QNEW

When I type "qnew", this means:

```text
Understand all BEST PRACTICES listed in CLAUDE.md.
Your code SHOULD ALWAYS follow these best practices.
Review the agent system architecture, Bird.com integration patterns, and quality requirements.
```

### QPLAN

When I type "qplan", this means:

```text
Analyze similar agent implementations and determine whether your plan:
- Is consistent with Bird.com platform patterns
- Reuses existing agent logic and conversation flows
- Follows established conversational AI best practices
- Integrates properly with existing UrbanHub systems
```

### QCODE

When I type "qcode", this means:

```text
Implement your agent plan and ensure conversation tests pass.
Always test webhook flows and Bird.com integration.
Test conversational logic with realistic customer scenarios.
Follow TDD: write failing conversation tests first, then implement.
```

### QCHECK

When I type "qcheck", this means:

```text
You are a SKEPTICAL senior conversational AI engineer.
Perform agent quality analysis for every MAJOR change:
1. Conversation Flow Quality Checklist
2. Agent Response Quality Checklist
3. Integration Best Practices
Look for potential conversation failures, edge cases, and user experience issues.
```

### QUX

When I type "qux", this means:

```text
Imagine you are a potential UrbanHub tenant interacting with our AI agents.
Test conversation scenarios from lead warming through tour scheduling.
Include edge cases, misunderstandings, and escalation triggers.
Verify Mexican cultural context and Spanish language quality.
```

### QGIT

When I type "qgit", this means:

```text
Add all changes to staging, create a commit, and push to remote.
Use conventional commits format focused on agent functionality.
Examples: feat(agent): add lead qualification logic
          fix(webhook): resolve Bird.com signature validation
          docs(setup): update WhatsApp integration guide
```

---

## Code Quality Standards

### Conversation Flow Quality Checklist

When evaluating agent conversations, check:

1. **Natural Flow**: Does the conversation feel natural and human-like?
2. **Context Awareness**: Does the agent maintain context throughout the conversation?
3. **Error Handling**: How does the agent handle misunderstandings or invalid input?
4. **Escalation Logic**: When and how does the agent escalate to human agents?
5. **Cultural Sensitivity**: Is the conversation appropriate for Mexican culture and context?
6. **Business Goals**: Does the conversation drive towards business objectives (tours, leads)?
7. **Response Time**: Are agent responses fast enough for real-time conversation?
8. **Fallback Strategies**: What happens when the agent can't understand or help?

### Agent Response Quality Checklist

1. **Clarity**: Are responses clear and easy to understand?
2. **Relevance**: Do responses address the user's specific question or need?
3. **Completeness**: Is enough information provided without overwhelming?
4. **Tone**: Is the tone professional yet friendly and approachable?
5. **Actionability**: Do responses include clear next steps when appropriate?
6. **Accuracy**: Is information about UrbanHub properties and processes correct?
7. **Compliance**: Do responses follow Mexican real estate regulations?
8. **Personalization**: Are responses tailored to the specific user and context?

---

## AI Agent Architecture

### Bird.com Platform Integration

- **API Integration**: RESTful API client with rate limiting and error handling
- **Webhook Processing**: Real-time event handling for messages and conversations
- **Channel Management**: Multi-channel support (WhatsApp, SMS, Email)
- **Template System**: Pre-approved WhatsApp Business templates for notifications

### Specialized AI Agents

Based on `workflow-diagram.mmd` customer acquisition flow:

#### 1. Lead Qualifier Agent

- **Purpose**: Initial contact classification and basic qualification
- **Triggers**: New leads from HubSpot integration
- **Actions**: Determine lead quality, collect basic information, route to appropriate agent
- **Integration**: HubSpot API for lead data sync

#### 2. Lead Warming Agent (Bird AI)

- **Purpose**: Automated WhatsApp/SMS outreach for unresponsive leads
- **Triggers**: Leads that haven't scheduled tours within 24-48 hours
- **Actions**: Personalized warming messages, objection handling, tour promotion
- **Logic**: Conversational AI with property-specific knowledge

#### 3. Tour Scheduling Agent

- **Purpose**: Calendar management and tour booking automation
- **Triggers**: Qualified leads expressing interest in property visits
- **Actions**: Available slot presentation, booking confirmation, pre-tour preparation
- **Integration**: Leasing Agent calendars (one building per LA)

#### 4. Pre-screening Agent

- **Purpose**: Intelligent information collection by importance priority
- **Triggers**: During tour scheduling process
- **Actions**: Progressive profiling, qualification scoring, preference collection
- **Logic**: Smart conversational flow adapting to user responses

#### 5. Follow-up Agent

- **Purpose**: Post-tour experience feedback and conversion optimization
- **Triggers**: 24 hours after completed tours
- **Actions**: Experience surveys, objection handling, lease application promotion
- **Analytics**: Feedback analysis and conversion tracking

#### 6. Escalation Agent

- **Purpose**: Intelligent routing to human agents when needed
- **Triggers**: Complex queries, urgent requests, agent limitations reached
- **Actions**: Context handoff, priority assignment, human agent notification
- **Integration**: Internal team management systems

---

## Business Context & Workflow

### UrbanHub Customer Acquisition Flow

Based on `workflow-diagram.mmd`:

1. **Lead Generation**: Names and contacts recovered from HubSpot
2. **Initial Contact**: Bird AI automated WhatsApp/SMS outreach
3. **Lead Assessment**: Tour scheduled vs. not scheduled decision point
4. **Lead Warming**: AI-driven conversations for unresponsive leads
5. **Tour Scheduling**: Calendar integration with Leasing Agents
6. **Pre-screening**: Smart information collection by priority
7. **Tour Execution**: Leasing Agent handles physical tour
8. **Follow-up**: Post-tour feedback and experience optimization

### UrbanHub Business Model

UrbanHub Mexico operates across two markets:

- **Mexico City**: 1,300+ apartments across 9 properties (65,000 m² residential, 4,200 m² commercial)
- **Mérida**: Premium coworking space with Herman Miller furniture
- **Expansion Goal**: Scale to 15,000+ properties over 10 years with $300M investment

### Mexican Market Integration

- **Language**: Spanish conversation capabilities with Mexican expressions
- **Payment Methods**: SPEI, OXXO, credit/debit card integration
- **Cultural Context**: Mexican business practices and communication styles
- **Compliance**: Mexican real estate regulations and data protection laws
- **Local Preferences**: WhatsApp as primary communication channel

---

## Development Guidelines

### Bird.com Integration Patterns

1. **Webhook First**: All agent interactions driven by Bird.com webhook events
2. **Stateless Agents**: Each agent interaction is independent and contextual
3. **Template Driven**: Use pre-approved WhatsApp templates for business-initiated messages
4. **Error Resilient**: Graceful handling of API failures and rate limits

### Conversation Design Principles

1. **User-Centric**: Always prioritize user experience and natural conversation flow
2. **Goal-Oriented**: Every conversation should progress toward business objectives
3. **Context-Aware**: Maintain conversation history and user preferences
4. **Escalation-Ready**: Know when to involve human agents appropriately

### Integration Best Practices

**MUST Rules** (enforced):

- **A-1**: Always validate webhook signatures from Bird.com
- **A-2**: Implement proper rate limiting for all API calls
- **A-3**: Log all conversation interactions for analysis
- **A-4**: Use approved WhatsApp templates for business messages
- **A-5**: Maintain GDPR compliance for Mexican data protection

**SHOULD Rules** (strongly recommended):

- **A-6**: Cache frequently accessed data (property info, availability)
- **A-7**: Implement circuit breakers for external API calls
- **A-8**: Use conversation analytics to improve agent responses
- **A-9**: Test agent logic with realistic conversation scenarios

---

## Do NOT (Firm Guardrails)

### BMAD-Core Framework Protection (MANDATORY)

- **NEVER delete, modify, or remove any files in the bmad-core/ directory**
- **NEVER alter the bmad-core/expansion-packs/ structure or contents**
- **NEVER change existing bmad-core/ configuration files without explicit permission**
- **NEVER remove or relocate bmad-core/ framework components**
- **The bmad-core/ directory is critical infrastructure and must remain intact**

### Agent Safety

- **Never expose internal system information to users**
- **Never make promises about property availability without verification**
- **Never collect sensitive personal information beyond business needs**
- **Never bypass escalation when human intervention is required**
- **Never ignore rate limits or abuse Bird.com API quotas**

### Conversation Safety

- **Never engage in conversations outside business scope**
- **Never provide legal or financial advice**
- **Never discriminate based on personal characteristics**
- **Never share other customers' private information**
- **Never make unauthorized commitments on behalf of UrbanHub**

### Technical Safety

- **Never ignore webhook signature validation**
- **Never store sensitive data without proper encryption**
- **Never deploy agents without thorough conversation testing**
- **Never modify conversation logic without approval**
- **Never bypass error handling in webhook processing**

---

## Success Metrics

### Demo Success Criteria

- **Platform Capability**: Bird.com agent handles complex real estate conversations naturally
- **Spanish Language Quality**: Culturally appropriate Mexican Spanish with real estate terminology
- **Conversation Intelligence**: Agent correctly identifies lead qualification scenarios and responds appropriately
- **Tour Scheduling**: Seamless booking workflow using mockup availability data
- **Context Retention**: Agent maintains conversation context throughout multi-turn interactions
- **Escalation Handling**: Intelligent detection of complex scenarios requiring human handoff

### Conversation Quality Demonstration

- **Natural Flow**: Conversations feel authentic and human-like during demo scenarios
- **Cultural Appropriateness**: Mexican cultural context and business practices reflected accurately
- **Business Logic**: Agent successfully guides prospects through qualification and scheduling workflows
- **Error Recovery**: Graceful handling of misunderstandings and invalid input during demo
- **Response Relevance**: All agent responses directly address prospect inquiries and needs

### Technical Platform Validation

- **Real-time Processing**: Immediate agent responses through WhatsApp Business API
- **Knowledge Base Access**: Agent accurately retrieves and presents property information
- **Conversation Analytics**: Platform dashboards show interaction patterns and performance metrics
- **Mockup Data Integration**: Realistic scenarios demonstrate production-ready capability

---

## Context Management Guidelines

### Token Economy

- This CLAUDE.md is prepended to every prompt - keep additions minimal and high-value
- Focus on agent-specific patterns and Bird.com integration requirements
- Delegate detailed conversation flows to separate agent configuration files
- Prioritize actionable guidance over theoretical concepts

### Memory Management

- Use `/memory` command to inspect loaded context for agent development
- Document agent conversations and flows in dedicated files
- Keep agent logic modular and testable
- Use ACTION_PLAN.md for complex agent implementation planning

---

## Key Documentation

- **Agent Workflows**: `docs/agent-workflows.md` - Detailed agent behavior specifications
- **Bird.com Integration**: `docs/bird-*.md` - Complete API integration documentation
- **Conversation Flows**: `docs/conversation-flows.md` - User journey and dialog design
- **Business Requirements**: `docs/brief.md` - Updated requirements for AI agent system
- **Configuration**: `bmad-config.yaml` - BMAD settings for agent development

---

## Version Control Standards

### Commit Message Format

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types**: feat, fix, docs, style, refactor, test, chore

**Agent-Specific Examples**:

- `feat(agent): add lead qualification logic for Mexico City properties`
- `fix(webhook): resolve Bird.com signature validation failure`
- `docs(setup): update WhatsApp Business API configuration guide`

---

## Notes

- Project focuses on conversational AI agents built on Bird.com platform
- BMAD-METHOD provides structured development methodology for agent creation
- All agents designed specifically for Mexican real estate market and UrbanHub operations
- Emphasis on automation while maintaining high-quality customer experience
- Integration-heavy system requiring coordination with HubSpot, calendars, and payment systems
