# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Project Name**: UrbanHub AI Agents for Bird.com
**Purpose**: Comprehensive AI agent ecosystem built on Bird.com platform to automate UrbanHub's customer acquisition workflow. The project develops specialized conversational AI agents that handle lead qualification, warming, tour scheduling, and follow-up automation for UrbanHub's real estate operations across Mexico.
**Target Audience**: UrbanHub leasing agents, property managers, potential tenants, and operations teams seeking automated lead-to-lease conversion through intelligent WhatsApp/SMS conversations.

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

**Platform**: Bird.com omnichannel messaging platform with AI agents
**Backend**: Node.js with TypeScript for webhook handlers and business logic
**Database**: PostgreSQL for conversation tracking, lead management, and analytics
**AI Engine**: OpenAI GPT models for natural language processing and conversation
**Messaging Channels**: WhatsApp Business API, SMS, and email integration
**Integrations**: HubSpot CRM, Leasing Agent calendars, OXXO payments
**Monitoring**: Bird.com dashboards, custom analytics, and conversation tracking

---

## Project Structure

```text
├── bmad-config.yaml              # BMAD configuration for AI agent development
├── bmad-core/                    # Core BMAD framework
│   └── expansion-packs/
│       └── urbanhub-real-estate/ # Real estate domain agents and workflows
├── docs/
│   ├── brief.md                  # Updated project requirements for AI agents
│   ├── bird-*.md                 # Bird.com API integration documentation
│   └── workflow-diagram.mmd      # Customer acquisition flow diagram
├── src/
│   ├── agents/                   # Specialized AI agent implementations
│   ├── services/                 # Bird.com API integration services
│   ├── webhooks/                 # Webhook handlers for real-time events
│   ├── models/                   # Database models for conversations and leads
│   └── utils/                    # Shared utilities and helpers
├── config/                       # Bird.com and integration configurations
└── package.json                  # Node.js dependencies and scripts
```

---

## Development Commands

```bash
# Bird.com Integration Commands
npm run bird:setup              # Setup Bird.com API configuration and webhooks
npm run bird:test-webhook       # Test webhook connectivity and signature validation
npm run bird:deploy-agents      # Deploy AI agents to Bird.com platform
npm run bird:sync-templates     # Sync WhatsApp message templates

# Agent Development Commands
npm run agent:test              # Test individual agent responses and logic
npm run agent:validate          # Validate agent configurations and knowledge base
npm run agent:simulate          # Simulate conversation flows for testing

# BMAD-METHOD Framework Commands
npm run bmad:init               # Initialize BMAD session for agent development
npm run bmad:story              # Create user stories for agent behaviors
npm run bmad:architect          # Run architecture planning for agent system

# Development and Quality
npm install                     # Install dependencies
npm run dev                     # Start development server with hot reload
npm test                        # Run test suite for agent logic and integrations
npx prettier --write .          # Format code with Prettier
npm run typecheck               # TypeScript compilation check
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

### Automation Efficiency

- **Lead Response Time**: < 5 minutes for initial AI contact
- **Tour Conversion Rate**: 25%+ of qualified leads schedule tours
- **Automation Coverage**: 80%+ of interactions handled by AI agents
- **Escalation Rate**: < 15% of conversations require human intervention

### Conversation Quality

- **User Satisfaction**: 4.5+ stars average for AI interaction experience
- **Conversation Completion**: 90%+ of initiated conversations reach logical conclusion
- **Understanding Rate**: 95%+ of user intents correctly identified
- **Response Accuracy**: 98%+ of agent responses factually correct

### Business Impact

- **Lead Velocity**: 50% reduction in time from lead to tour scheduled
- **Operational Efficiency**: 60% reduction in manual lead management tasks
- **Leasing Agent Productivity**: 40% increase in tours per agent per day
- **Cost per Lead**: 30% reduction in customer acquisition costs

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
