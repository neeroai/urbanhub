# UrbanHub AI Agent Conversation Flows

## Document Overview

This document defines the conversation flows for UrbanHub's AI agents based on the customer acquisition workflow outlined in meetings and research documents.

**Platform**: Bird.com with OpenAI integration  
**Primary Channel**: WhatsApp Business API  
**Secondary Channels**: SMS, Email  
**Language**: Mexican Spanish with cultural context  
**Target**: Mexico City premium rental market

---

## Agent Architecture Overview

### Specialized Agent Types
Based on the meeting discussion and workflow diagram analysis:

1. **Lead Qualifier Agent** - Initial contact classification and basic qualification
2. **Lead Warming Agent** - Automated outreach for unresponsive leads  
3. **Tour Scheduling Agent** - Calendar management and booking automation
4. **Pre-screening Agent** - Information collection by priority
5. **Follow-up Agent** - Post-tour experience optimization
6. **Escalation Agent** - Intelligent routing to human agents

### Conversation Triggers
- **New HubSpot Lead**: Automated initial contact within 5 minutes
- **Unresponsive Lead**: Warming sequence after 24-48 hours
- **Tour Interest**: Immediate scheduling assistance
- **Post-Tour**: Follow-up after 24 hours
- **Human Request**: Escalation with context handoff

---

## Lead Qualifier Agent

### Purpose
Initial contact classification and basic qualification for new leads from HubSpot or direct WhatsApp contact.

### Conversation Flow

#### Opening Message (Personalized)
```
¡Hola [Nombre]! 👋

Soy Maya, asistente digital de Urbanista. Vi que mostraste interés en [Propiedad] y me da mucho gusto contactarte.

¿Te gustaría que platiquemos sobre tu búsqueda de departamento? Solo me tomará 2 minutos conocer lo que buscas para poder ayudarte mejor.
```

#### Qualification Questions (Progressive)

**1. Timeline Qualification**
```
Para empezar, ¿cuándo estarías buscando mudarte?

A) En las próximas 4 semanas
B) En 1-3 meses  
C) En 3-6 meses
D) Más de 6 meses
E) Solo estoy explorando opciones
```

**Response Handling**:
- A, B: Proceed to immediate qualification
- C: Schedule for follow-up in 60 days
- D, E: Add to nurturing campaign

**2. Property Interest**
```
Perfecto. ¿Qué tipo de departamento te interesa más?

- Estudio (ideal para una persona)
- 1 recámara (perfecto para pareja o profesional)  
- 2 recámaras (ideal para compartir o familia pequeña)
- Aún no estoy seguro/a
```

**3. Location Preference**
```
Excelente. ¿Conoces nuestras propiedades?

🏢 **Josefa** - Reforma 390 (junto al Ángel de la Independencia)
🏛️ **Matilde** - Donato Guerra 1 (Colonia Juárez, estilo Art Deco)

¿Alguna te llama más la atención o te gustaría conocer ambas?
```

**4. Budget Qualification (Subtle)**
```
Para asegurarme de mostrarte las mejores opciones, ¿qué rango de renta mensual estás considerando?

- Hasta $20,000
- $20,000 - $30,000  
- $30,000 - $40,000
- Más de $40,000
- Prefiero no decir por ahora
```

**5. Tour Scheduling**
```
¡Perfecto! Basándome en lo que me comentas, tengo algunas opciones excelentes para mostrarte.

¿Te gustaría agendar una visita? Nuestros leasing agents están disponibles:
- Mañana por la mañana
- Mañana por la tarde  
- Pasado mañana por la mañana
- Otro día que te convenga mejor

¿Qué horario te funciona mejor?
```

### Decision Tree Logic

#### Qualification Outcomes
- **Hot Lead**: Timeline < 3 months + Budget match + Tour interest → Immediate scheduling
- **Warm Lead**: Timeline 3-6 months + Budget match → Nurturing campaign  
- **Cold Lead**: Timeline > 6 months or budget mismatch → Long-term nurturing
- **Unqualified**: No budget info + no timeline → Information gathering

#### HubSpot Status Updates
- Hot Lead → "Qualified" + Tour Scheduling Agent handoff
- Warm Lead → "Contacted" + Follow-up sequence
- Cold Lead → "Nurturing" + Quarterly check-in
- Unqualified → "Unresponsive" if no engagement

---

## Lead Warming Agent

### Purpose
Automated WhatsApp/SMS outreach for leads that haven't scheduled tours within 24-48 hours.

### Warming Sequence

#### Day 1: Soft Follow-up
```
Hola [Nombre], 

Maya de Urbanista nuevamente. 

Ayer platicamos sobre tu búsqueda de departamento y me quedé pensando que tal vez te interesaría saber que tenemos algunas promociones especiales esta semana.

¿Te gustaría que te platique los detalles? 🏠✨
```

#### Day 3: Value-Added Content
```
¡Hola [Nombre]! 

Te comparto algo que podría interesarte:

📸 [Video/Fotos de amenidades]

Estas son las increíbles amenidades que tenemos en [Propiedad]. Gym 24/7, terraza con vista panorámica, y espacios de coworking.

¿Te gustaría conocerlas en persona?
```

#### Day 7: Social Proof
```
Hola [Nombre],

Quería contarte que esta semana tuvimos varias familias que se mudaron a [Propiedad] y están encantadas con la experiencia.

Uno de nuestros nuevos residentes me comentó: "La ubicación es perfecta y las amenidades superaron mis expectativas"

¿Te animas a conocer por qué nuestros residentes están tan contentos?
```

#### Day 14: Last Attempt + Incentive
```
¡Hola [Nombre]!

Entiendo que encontrar el departamento perfecto lleva tiempo. 

Como última oportunidad, me gustaría ofrecerte una visita VIP donde puedes conocer tanto Josefa como Matilde en una sola cita, y te platican sobre nuestras opciones de financiamiento flexibles.

¿Te interesa? Solo me tomaría confirmar un horario contigo.

Si prefieres que no te contacte más por ahora, solo responde "PARAR" y respeto tu decisión. 🙏
```

### Warming Logic
- **Response at any stage**: Transfer to appropriate agent
- **No response after Day 14**: Mark as "Closed Lost - Unresponsive"
- **STOP request**: Respect opt-out immediately
- **Engagement without tour**: Transfer to Pre-screening Agent

---

## Tour Scheduling Agent

### Purpose
Calendar management and tour booking automation with leasing agent integration.

### Scheduling Flow

#### Availability Check
```
¡Excelente! Me da mucho gusto que quieras conocer [Propiedad].

Déjame revisar la disponibilidad de nuestros leasing agents...

✅ Tengo estos horarios disponibles:

**Mañana (viernes)**
- 10:00 AM con Andrea
- 2:00 PM con Carlos  

**Pasado mañana (sábado)**  
- 11:00 AM con Andrea
- 4:00 PM con Carlos

¿Cuál te conviene mejor?
```

#### Confirmation Process
```
Perfecto, queda confirmado:

📅 **Tu visita a Josefa**
🗓️ Fecha: Viernes 19 de julio
⏰ Hora: 10:00 AM  
👤 Leasing Agent: Andrea
📍 Ubicación: Reforma 390, CDMX

Andrea te estará esperando en el lobby.

¿Necesitas que te comparta la ubicación exacta o alguna información especial para llegar?
```

#### Pre-Tour Information Collection
```
Para que Andrea pueda preparar la visita perfecta para ti, ¿podrías ayudarme con un par de datos rápidos?

🐕 ¿Tienes mascotas?
🚗 ¿Necesitarías estacionamiento?  
📋 ¿Algún requerimiento especial que debamos considerar?

Esto nos ayuda a mostrarte exactamente lo que necesitas.
```

#### Confirmation & Reminders
**24 Hours Before**:
```
¡Hola [Nombre]!

Solo para recordarte tu visita mañana:

📅 Viernes 19 de julio a las 10:00 AM
👤 Con Andrea en Josefa (Reforma 390)

¿Todo confirmado? 

Si necesitas cambiar el horario, solo avísame.
```

**2 Hours Before**:
```
¡Buenos días [Nombre]!

Tu visita a Josefa es en 2 horas (10:00 AM).

Andrea ya está preparando todo para recibirte. 

📍 Reforma 390, CDMX (frente al Ángel de la Independencia)

¡Nos vemos pronto! 🏠
```

### Calendar Integration Logic
- **Real-time availability**: Query leasing agent calendars
- **Automatic booking**: Create calendar event for agent
- **Conflict handling**: Offer alternative times if conflicts arise
- **No-show tracking**: Update HubSpot if customer doesn't arrive

---

## Pre-screening Agent

### Purpose
Intelligent information collection by priority for qualified leads.

### Information Priority Matrix

#### High Priority (Always Collect)
1. **Move-in timeline**: Specific dates for planning
2. **Budget confirmation**: Exact range for property matching
3. **Space requirements**: Studio, 1BR, 2BR preference
4. **Location flexibility**: Multiple properties consideration

#### Medium Priority (Collect if Engaged)
1. **Lease duration**: 6 months, 1 year, 2+ years
2. **Pet ownership**: Type and size for pet policy
3. **Parking needs**: Car ownership and parking requirements
4. **Work situation**: Remote work, office location for commute

#### Low Priority (Collect During Tour)
1. **Furnishing preferences**: Furnished vs unfurnished
2. **Amenity priorities**: Gym, pool, coworking space importance
3. **Previous housing**: Current living situation
4. **Decision makers**: Solo decision or involves others

### Conversation Flow

#### Information Collection
```
Para poder mostrarte las opciones perfectas en tu visita, me gustaría conocerte un poco mejor.

¿Te parece si platicamos 2 minutos sobre lo que buscas?

Primero, ¿cuándo exactamente te gustaría mudarte?
[Collect specific date range]

¿Y cuál sería tu presupuesto ideal para la renta mensual?
[Confirm budget range]

¿Estarías abierto/a a conocer opciones en ambas propiedades (Josefa y Matilde) o tienes preferencia por alguna?
[Location flexibility]
```

#### Progressive Profiling
```
Perfecto, con esa información ya puedo preparar opciones excelentes.

Una pregunta más: ¿tienes mascota? 
[Si sí: ¿Qué tipo y tamaño?]

¿Y necesitarías estacionamiento?
[Confirm parking needs]

¡Listo! Andrea va a tener todo preparado para mostrarte exactamente lo que buscas.
```

### Data Capture Logic
- **Mandatory fields**: Before tour confirmation
- **Optional fields**: During natural conversation flow
- **Incomplete data**: Follow up during post-tour sequence
- **HubSpot sync**: Real-time contact property updates

---

## Follow-up Agent

### Purpose
Post-tour experience feedback and conversion optimization.

### Post-Tour Sequence

#### 24 Hours After Tour
```
¡Hola [Nombre]!

Espero que hayas disfrutado tu visita a [Propiedad] ayer con [Leasing Agent].

¿Qué te pareció? Me encantaría conocer tu opinión 😊

¿Alguna pregunta que haya quedado pendiente?
```

#### Experience Assessment
```
Me da mucho gusto que te haya gustado la experiencia.

En una escala del 1 al 10, ¿qué tan probable sería que recomendaras Urbanista a un amigo?

¿Hay algo específico que te haya encantado o algo que podríamos mejorar?
```

#### Conversion Push (If Positive)
```
¡Excelente! Me alegra mucho escuchar eso.

¿Ya tienes una idea de cuándo te gustaría tomar la decisión? 

Puedo ayudarte con información sobre el proceso de aplicación o conectarte directamente con [Leasing Agent] para los siguientes pasos.

¿Qué te sería más útil?
```

#### Objection Handling
**Price Concerns**:
```
Entiendo perfectamente la consideración del precio. 

¿Te gustaría que te explique nuestras opciones de pago flexibles o los beneficios incluidos que hacen que la inversión valga la pena?

También podríamos explorar opciones en diferentes plantas o con variaciones que podrían ajustarse mejor a tu presupuesto.
```

**Timeline Concerns**:
```
No hay problema, entiendo que es una decisión importante.

¿Hay algo específico que te está haciendo dudar o necesitas tiempo para consultarlo con alguien más?

Mientras tanto, puedo mantenerte al día sobre disponibilidad y cualquier promoción especial que pueda surgir.
```

**Comparison Shopping**:
```
Por supuesto, es importante que explores todas tus opciones.

¿Hay algo específico que te gustaría comparar? Estaré aquí para cualquier pregunta que tengas durante tu proceso de decisión.

¿Te parece si te contacto en una semana para ver cómo vas con tu búsqueda?
```

### Conversion Optimization
- **Positive feedback**: Fast-track to application process
- **Neutral feedback**: Address specific concerns
- **Negative feedback**: Escalate to human agent
- **No response**: Gentle nudge after 3 days

---

## Escalation Agent

### Purpose
Intelligent routing to human agents when AI limitations are reached.

### Escalation Triggers

#### Automatic Escalation
- Complex legal questions about lease terms
- Specific accommodation requests
- Complaint or negative experience
- Multiple failed conversation attempts
- Technical issues with property systems

#### Customer-Requested Escalation
- "I want to speak to a person"
- "Can I talk to someone?"
- "This isn't answering my question"
- "I need human help"

### Escalation Flow

#### Immediate Handoff
```
Por supuesto, entiendo que prefieres hablar directamente con una persona.

Te voy a conectar con [Leasing Agent Name] quien es expert@ en [Property/Issue].

Mientras tanto, voy a enviarle un resumen de nuestra conversación para que tenga todo el contexto.

[Leasing Agent] te contactará en los próximos 30 minutos. ¿El número desde el que me escribes es el mejor para contactarte?
```

#### Context Handoff
**To Human Agent** (Internal Message):
```
🚨 ESCALATION REQUEST

Contact: [Name] - [Phone]
Property Interest: [Property Name]
Issue Category: [Category]
Conversation Summary: [AI Summary]
Urgency: [High/Medium/Low]
Customer Request: "[Exact quote]"

Last Message: [Timestamp]
Preferred Contact: [Phone/WhatsApp]

[Full conversation transcript attached]
```

#### Follow-up Confirmation
```
[Leasing Agent] ya tiene toda la información de nuestra conversación y te contactará pronto.

¿Hay algo más que pueda hacer por ti mientras tanto?

¡Gracias por tu paciencia! 🙏
```

### Escalation Categories
- **Sales**: Complex pricing, custom lease terms
- **Technical**: Property systems, amenity booking
- **Service**: Maintenance, resident services  
- **Administrative**: Legal questions, documentation
- **Urgent**: Emergency situations, time-sensitive issues

---

## Conversation Quality Guidelines

### Tone and Voice
- **Friendly but Professional**: Mexican Spanish warmth with business credibility
- **Helpful and Patient**: Never rush customers, allow natural conversation pace
- **Knowledgeable**: Demonstrate expertise about properties and process
- **Respectful**: Honor cultural communication preferences

### Cultural Considerations
- **WhatsApp Etiquette**: Understand Mexican WhatsApp communication norms
- **Formal vs Informal**: Start formal, mirror customer's tone
- **Time Sensitivity**: Respect Mexican business hours and response expectations
- **Family Decisions**: Understand that housing decisions often involve multiple family members

### Error Prevention
- **Never Guarantee**: Availability, pricing, or approval without confirmation
- **Always Verify**: Customer information before finalizing appointments
- **Escalate When Uncertain**: Don't guess on complex questions
- **Maintain Context**: Keep conversation history for seamless experience

---

## Analytics and Optimization

### Conversation Metrics
- **Response Rate**: Percentage of customers who engage after initial contact
- **Qualification Rate**: Percentage reaching qualified status
- **Tour Booking Rate**: Qualified leads who schedule tours
- **Escalation Rate**: Conversations requiring human intervention
- **Customer Satisfaction**: Post-conversation ratings

### A/B Testing Opportunities
- **Opening messages**: Test different greeting styles
- **Question order**: Optimize qualification sequence
- **Tone variations**: Formal vs casual language testing
- **Timing**: Optimal follow-up intervals
- **Incentives**: Effectiveness of tour incentives

### Continuous Improvement
- **Weekly Review**: Analyze conversation logs for optimization opportunities
- **Customer Feedback**: Incorporate post-tour feedback into conversation design
- **Agent Performance**: Compare AI vs human agent conversion rates
- **Seasonal Adjustments**: Adapt messaging for rental market cycles

---

## Implementation Checklist

### Technical Setup
- [ ] Bird.com agent configuration
- [ ] OpenAI model training with UrbanHub data
- [ ] HubSpot API integration for status updates
- [ ] Calendar system connections
- [ ] WhatsApp Business API compliance

### Content Preparation
- [ ] Mexican Spanish conversation scripts
- [ ] Property-specific knowledge bases
- [ ] Objection handling responses
- [ ] Escalation procedures documentation
- [ ] Cultural adaptation review

### Testing and Validation
- [ ] Conversation flow testing
- [ ] Integration testing with HubSpot
- [ ] Calendar booking validation
- [ ] Escalation workflow testing
- [ ] Customer experience validation

### Launch Preparation
- [ ] Leasing agent training on AI handoffs
- [ ] Customer service protocol updates
- [ ] Monitoring and analytics setup
- [ ] Feedback collection procedures
- [ ] Continuous improvement processes