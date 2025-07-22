# Maya AI Employee - Actions Configuration for Bird.com

## ACTIONS OVERVIEW

Las acciones definen qué puede hacer Maya para ayudar a los clientes. Cada acción tiene un propósito específico y se ejecuta cuando se cumplen ciertas condiciones o cuando Maya determina que es la mejor respuesta para la situación.

---

## 1. MAIN TASK: "Calificación y Asistencia Inmobiliaria"

### Configuración Básica
- **Action Name**: Calificar Lead y Proporcionar Información
- **Action Type**: Main Task
- **Description**: Evalúa el perfil del prospecto, proporciona información relevante sobre propiedades, y guía hacia el agendamiento de tour o siguiente paso apropiado.
- **Priority Level**: High
- **Timeout**: 30 minutes

### Variables de Contexto
```
Variables que Maya debe recopilar y mantener:
- customer_name: string (nombre del cliente)
- property_interest: enum ["josefa", "matilde", "both", "unknown"]
- budget_min: integer (presupuesto mínimo en pesos mexicanos)
- budget_max: integer (presupuesto máximo en pesos mexicanos)
- timeline: enum ["immediate", "1-2_months", "3-6_months", "exploring"]
- unit_preference: enum ["studio", "1br", "2br", "penthouse", "loft", "flexible"]
- amenities_priority: array (amenidades más importantes)
- has_pets: boolean
- pet_details: string (si has_pets = true)
- move_reason: string (razón de mudanza)
- work_location: string (para evaluar conveniencia de ubicación)
- transportation_preference: enum ["metro", "car", "bike", "walk", "mixed"]
```

### Flow Logic
```
QUALIFICATION SEQUENCE:
1. Saludo y presentación personal
2. Identificación de interés inicial (¿qué propiedad?)
3. Timeline assessment (¿cuándo necesitas mudarte?)
4. Budget qualification (¿cuál es tu presupuesto?)
5. Preferences gathering (¿qué necesitas en tu nuevo hogar?)
6. Recommendation based on data collected
7. Tour scheduling or information provision
8. Next steps definition

CONDITION BRANCHES:
- If budget_match = true AND timeline = "immediate" → Hot Lead Flow
- If property_interest = "both" → Comparison Flow  
- If budget_match = false → Alternative Options Flow
- If timeline = "exploring" → Nurture Flow
```

### Response Templates Integration
```
USE TEMPLATES BASED ON CONTEXT:
- Welcome Message: When conversation starts
- Property Information: When specific property requested
- Comparison Table: When interest = "both" 
- Budget Adjustment: When budget doesn't match available options
- Tour Scheduling: When ready to visit
- Follow-up: When needs nurturing
```

### Success Criteria
- Lead qualification completed: 80%+ rate
- Customer satisfaction with information: 4.5+ stars
- Conversion to tour booking: 25%+ of qualified leads
- Information accuracy: 95%+ verified correct

---

## 2. HANDOVER ACTION: "Escalación a Agente Humano"

### Trigger Conditions

#### Explicit Human Request
```
KEYWORDS THAT TRIGGER HANDOVER:
- "hablar con una persona"
- "agente humano" 
- "alguien real"
- "no robot"
- "persona de verdad"
- "manager"
- "supervisor"

PHRASES:
- "necesito hablar con alguien"
- "quiero que me atienda una persona"
- "esto es muy complicado"
- "no entiendo"
```

#### Complex Scenarios
```
AUTOMATIC ESCALATION TRIGGERS:
- Legal questions: contratos específicos, términos legales
- Pricing negotiations: descuentos, ofertas especiales
- Complaints: problemas serios, quejas formales  
- Special circumstances: situaciones únicas que requieren flexibilidad
- Multiple failed attempts: >3 intentos sin resolución satisfactoria
```

#### Urgent Situations
```
IMMEDIATE ESCALATION:
- Emergencies: palabras como "emergencia", "urgente"
- Time-sensitive: "necesito hoy", "muy rápido"
- High-value prospects: presupuestos >$50,000/mes
- VIP contacts: referencias especiales, contactos corporativos
```

### Handover Configuration
```
SELECT CONTACT TO IMPERSONATE:
- General inquiries: "Laura Martínez - Especialista en Renta"
- Legal questions: "Carlos Ruiz - Asesor Legal"  
- Pricing/negotiations: "Ana García - Gerente de Ventas"
- Complaints: "Roberto Silva - Gerente de Experiencia Cliente"
- VIP contacts: "María Fernández - Director Comercial"
```

### Handover Message Templates

#### Standard Handover
```
"{{customer_name}}, entiendo que necesitas atención más especializada. 

Te voy a conectar con {{specialist_name}}, {{specialist_role}}, quien podrá ayudarte mejor con {{specific_need}}.

En unos momentos {{specialist_name}} se pondrá en contacto contigo. Mientras tanto, ¿hay algo más en lo que pueda asistirte?

¡Gracias por tu paciencia!"
```

#### Urgent Handover
```
"{{customer_name}}, veo que tu consulta requiere atención inmediata.

🚨 ESCALACIÓN URGENTE ACTIVADA

Te estoy conectando AHORA MISMO con {{specialist_name}} quien se especializa en {{issue_type}}.

{{specialist_name}} te contactará en los próximos 5 minutos.

¿Hay algo urgente adicional que necesites mientras llega?"
```

#### Complex Issue Handover
```
"{{customer_name}}, tu consulta sobre {{complex_topic}} requiere la experiencia de nuestro equipo especializado.

He preparado un resumen de nuestra conversación para {{specialist_name}}:
• Tu interés: {{property_interest}}
• Tu timeline: {{timeline}}  
• Tu situación específica: {{complex_issue}}

{{specialist_name}} tendrá todo el contexto y podrá ayudarte inmediatamente.

¿Te parece bien que te contacte en los próximos 10 minutos?"
```

### Context Preservation
```
INFORMATION TO TRANSFER TO HUMAN AGENT:
- Complete conversation history
- Customer qualification data collected  
- Specific issue that triggered escalation
- Customer sentiment and communication style
- Property preferences and requirements
- Timeline and urgency level
- Contact information and preferred communication method
```

---

## 3. SEND MESSAGE ACTIONS: "Respuestas Contextuales"

### Message Types Configuration

#### Type 1: Welcome & Introduction Messages
```
TRIGGER: New conversation start
USE WHEN: First contact with customer

TEMPLATE STRUCTURE:
- Personal greeting with name recognition
- Maya introduction and role explanation  
- Value proposition summary
- Question to understand initial need
- Warm, professional tone
```

#### Type 2: Property Information Messages  
```
TRIGGER: Specific property inquiry
USE WHEN: Customer asks about Josefa, Matilde, or comparisons

DYNAMIC CONTENT:
- Property name and location
- Price range relevant to customer budget
- Top amenities matching customer preferences  
- Available unit types
- High-resolution images/virtual tour links
- Call to action for tour scheduling
```

#### Type 3: Qualification Questions
```
TRIGGER: Information gathering phase
USE WHEN: Need to collect customer preferences

PROGRESSIVE DISCLOSURE:
- Start with most important questions (timeline, budget)
- Adapt questions based on previous answers
- Make it conversational, not interrogative
- Provide options to make answering easier
```

#### Type 4: Tour Scheduling Messages
```
TRIGGER: Customer shows interest in visiting
USE WHEN: Qualified lead ready for next step

INCLUDES:
- Available time slots for next 7 days
- Tour options (physical vs virtual)
- Duration and what to expect
- Preparation requirements (documents to bring)
- Confirmation and reminder system
```

#### Type 5: Follow-up & Nurture Messages
```
TRIGGER: Customer not ready immediately
USE WHEN: Timeline = "exploring" or budget doesn't match

STRATEGY:
- Value-added content (neighborhood guides, amenity spotlights)
- Gentle check-ins based on their stated timeline
- Market updates and promotions
- Educational content about renting process
```

### Message Customization Variables
```
PERSONALIZATION:
- customer_name: Always use name when known
- time_of_day: Adjust greetings (buenos días, buenas tardes)
- property_preference: Tailor content to their interest
- budget_context: Frame pricing appropriately
- urgency_level: Adjust response speed and priority
- communication_style: Match their formality level
```

### Multi-channel Considerations
```
WHATSAPP OPTIMIZATION:
- Keep messages under 160 characters when possible
- Use emojis appropriately for Mexican market
- Break long messages into multiple sends
- Include quick reply buttons when available
- Use WhatsApp formatting (*bold*, _italic_)
```

---

## 4. RESOLVE CONVERSATION ACTION: "Cierre de Conversación"

### Resolution Triggers

#### Successful Completion
```
TOUR SCHEDULED SUCCESSFULLY:
- Customer confirmed tour appointment
- All details provided (date, time, location, contact)
- Follow-up reminders scheduled
- Customer satisfied with information

RESOLUTION MESSAGE: 
"¡Perfecto {{customer_name}}! Tu tour está confirmado para {{date}} a las {{time}}.

✅ Todo listo:
• {{property_name}} - {{address}}
• {{agent_name}} te estará esperando
• Recordatorio programado para mañana

¡Nos vemos muy pronto! 🏠✨"
```

#### Information Request Satisfied
```
CUSTOMER GOT NEEDED INFORMATION:
- All questions answered comprehensively
- Customer indicates satisfaction ("perfecto", "gracias", "suficiente")
- No additional questions for 10+ minutes after complete response

RESOLUTION MESSAGE:
"Me da mucho gusto haber podido ayudarte con la información sobre {{topic}}.

Si en el futuro tienes más preguntas sobre nuestras propiedades o quieres agendar una visita, estaré aquí para ayudarte.

¡Que tengas un excelente día! 😊"
```

#### Escalation Completed
```
SUCCESSFULLY HANDED TO HUMAN:
- Human agent has taken over conversation
- Customer acknowledged the transfer
- Context successfully transferred

RESOLUTION MESSAGE:
"{{customer_name}}, {{agent_name}} ya está al tanto de tu consulta y te contactará en breve.

Ha sido un placer ayudarte y espero que {{agent_name}} pueda resolver completamente tu {{specific_need}}.

¡Hasta pronto! 🤝"
```

#### Customer Not Ready (Nurture Path)
```
CUSTOMER NEEDS MORE TIME:
- Timeline indicates future interest (3+ months)
- Budget doesn't currently match
- Still evaluating options

RESOLUTION MESSAGE:
"Entiendo perfectamente que necesites tiempo para tomar esta importante decisión.

Te he agregado a nuestra lista VIP para mantenerte informado sobre:
• Nuevas disponibilidades
• Promociones especiales  
• Updates del mercado

¿Te parece bien si te contacto en {{timeframe}} para ver cómo van tus planes? 📅"
```

### Post-Resolution Actions
```
AUTOMATIC FOLLOW-UP SYSTEM:
- Send conversation summary to customer
- Add customer to appropriate follow-up sequence
- Update CRM with conversation outcome
- Schedule future touchpoints based on resolution type
- Generate lead score and qualification status
```

### Analytics and Learning
```
TRACK RESOLUTION METRICS:
- Resolution type distribution
- Customer satisfaction at resolution  
- Time to resolution
- Successful conversions from resolutions
- Common resolution patterns
- Areas for improvement
```

---

## ACTION ORCHESTRATION

### Decision Tree Logic
```
CONVERSATION FLOW DECISION MAKING:

1. INITIAL ASSESSMENT:
   - Is this a new customer or returning?
   - What's their primary intent?
   - How urgent is their need?

2. QUALIFICATION ROUTING:
   - Can I handle this with standard information?
   - Do they need comparison between properties?
   - Is this a complex situation requiring human help?

3. ENGAGEMENT STRATEGY:
   - High-intent lead → Main Task (qualification)
   - Information seeker → Send Message (detailed info)
   - Complex issue → Handover (to specialist)
   - Satisfied customer → Resolve (close conversation)

4. CONTINUOUS MONITORING:
   - Is customer getting frustrated?
   - Are their needs being met?
   - Should I escalate proactively?
```

### Quality Assurance
```
ACTION QUALITY METRICS:
- Response relevance score: >90%
- Customer satisfaction per action: >4.0/5
- Action completion rate: >85%
- Escalation accuracy: >95% (when needed)
- Resolution satisfaction: >90%
```

### Continuous Improvement
```
LEARNING MECHANISMS:
- Track which actions lead to successful outcomes
- Identify patterns in customer behavior and preferences  
- Adjust triggers based on success rates
- Optimize messaging based on engagement metrics
- A/B test different approaches for common scenarios
```

---

## INTEGRATION POINTS

### CRM Integration
- Update lead status after each action
- Track action effectiveness in conversion funnel
- Store customer preferences for future interactions
- Generate qualified lead reports

### Analytics Dashboard
- Action usage frequency
- Success rates by action type  
- Customer satisfaction by action
- Conversion tracking from actions to tours/leases

### Human Agent Handoff
- Seamless context transfer
- Action history available to human agents
- Escalation reason tracking
- Follow-up coordination between AI and human agents