# UrbanHub AI Agents Knowledge Base

## Project Context

### Company Overview
**UrbanHub Mexico** is a premium multifamily rental operator managing 1,300+ apartments across 9 properties in Mexico City. The company operates under the consumer brand **Urbanista** and is scaling to 15,000+ properties over 10 years with $300M investment.

### Properties Portfolio

#### Josefa (Reforma 390)
- **Ubicación**: Paseo de la Reforma 390, Ciudad de México (junto al Ángel de la Independencia)
- **Tipo**: Torre de departamentos de lujo, 17 niveles residenciales
- **Inversión**: 600 millones de pesos en renovación
- **Amenidades**:
  - Gimnasio equipado con área de yoga y spinning
  - Terrazas en rooftop con vistas panorámicas a Reforma
  - Sala de cine privada
  - Espacios de coworking con WiFi de alta velocidad
  - Simulador de golf
  - Alberca climatizada y spa
  - Salón de eventos y área de BBQ
  - Seguridad 24/7 y acceso controlado
- **Tipos de Unidades**:
  - Studios: 45-55 m², desde $25,700 MXN/mes + servicios
  - 1 Recámara: 60-75 m², desde $29,000 MXN/mes + servicios
  - 2 Recámaras: 90-110 m², desde $36,000 MXN/mes + servicios
  - Penthouse: 150-200 m², precios a consultar
- **Características Técnicas**:
  - Acabados premium, aire acondicionado, ventanas de doble cristal
  - Cocinas integrales con electrodomésticos de alta gama
  - Balcones privados en la mayoría de unidades
- **Vecindario y Transporte**:
  - Ubicación privilegiada sobre Paseo de la Reforma
  - Acceso inmediato a transporte público (Metrobús, Metro Insurgentes)
  - Cercanía a centros comerciales, restaurantes, parques y oficinas corporativas
- **Políticas de Renta**:
  - Contrato mínimo: 12 meses
  - Depósito: 1 mes de renta
  - No se requiere aval, solo comprobante de ingresos
  - Pet-friendly (con restricciones)
  - Incluye mantenimiento y acceso a amenidades
- **Perfil Ideal de Inquilino**: Profesionales urbanos, expatriados, ejecutivos, nómadas digitales

#### Matilde (Donato Guerra 1)
- **Ubicación**: Donato Guerra 1, Colonia Juárez, Ciudad de México
- **Tipo**: Edificio Art Deco restaurado, 5 niveles residenciales
- **Inversión**: 62 millones de pesos en restauración
- **Amenidades**:
  - Lobby histórico con detalles originales
  - Terraza-jardín con área de lectura y café
  - Gimnasio boutique
  - Salón de usos múltiples
  - Espacios de coworking y salas de juntas
  - Seguridad 24/7 y acceso digital
- **Tipos de Unidades**:
  - Lofts: 40-50 m², desde $22,000 MXN/mes + servicios
  - 1 Recámara: 55-70 m², desde $25,500 MXN/mes + servicios
  - 2 Recámaras: 80-95 m², desde $32,000 MXN/mes + servicios
- **Características Técnicas**:
  - Conservación de elementos Art Deco originales
  - Acabados modernos, iluminación LED, aislamiento acústico
  - Cocinas equipadas, closets amplios
- **Vecindario y Transporte**:
  - Ubicación en el corazón de Colonia Juárez, zona cultural y gastronómica
  - A pasos de Paseo de la Reforma y Metro Juárez
  - Cercanía a museos, galerías, cafés y vida nocturna
- **Políticas de Renta**:
  - Contrato mínimo: 12 meses
  - Depósito: 1 mes de renta
  - No se requiere aval, solo comprobante de ingresos
  - Pet-friendly (con restricciones)
  - Incluye mantenimiento y acceso a amenidades
- **Perfil Ideal de Inquilino**: Profesionales creativos, amantes de la arquitectura, comunidad internacional, parejas jóvenes

### Target Customer Profile
- **Demographics**: Urban professionals, young professionals, digital nomads, expatriates
- **Age Range**: 25-40 years old
- **Income Level**: Premium segment, budget $20,000-$40,000+ MXN monthly
- **Lifestyle**: Values convenience, community, amenities, location over space
- **Communication**: WhatsApp-first, immediate response expectations

## Current Business Challenge

### Manual Lead Management Issues
- Response delays of hours or days causing prospect drop-off
- Leasing agents overwhelmed with qualification and scheduling tasks
- Inconsistent lead qualification processes
- No automated warming for unresponsive prospects
- HubSpot contains data but lacks conversational engagement

### Growth Constraints
- Current manual process cannot scale to 15,000+ properties
- Missing lead conversion opportunities due to delayed responses
- Competitive Mexico City rental market requires immediate engagement
- Limited agent productivity due to repetitive tasks

## AI Agent Solution Architecture

### Platform Integration
- **Primary Platform**: Bird.com conversational AI with OpenAI GPT-4
- **CRM Integration**: HubSpot (bidirectional real-time sync)
- **Communication**: WhatsApp Business API (primary), SMS (backup)
- **Calendar Systems**: Calendly, Google Calendar, Outlook integration

### Specialized AI Agents

#### 1. Lead Qualifier Agent
- **Purpose**: Initial contact classification and basic qualification
- **Trigger**: New leads from HubSpot or direct WhatsApp contact
- **Process**: Greeting → Timeline assessment → Property interest → Budget qualification → Tour scheduling
- **HubSpot Update**: Status change to "Contacted" or "Qualified"

#### 2. Lead Warming Agent
- **Purpose**: Automated nurturing for unresponsive leads
- **Trigger**: No response 24-48 hours after initial contact
- **Sequence**: Day 1 soft follow-up → Day 3 value content → Day 7 social proof → Day 14 final attempt
- **Goal**: Re-engage prospects without being pushy

#### 3. Tour Scheduling Agent
- **Purpose**: Calendar integration and booking automation
- **Trigger**: Qualified lead expresses tour interest
- **Process**: Check availability → Present options → Confirm booking → Create calendar event → Send confirmations
- **Integration**: Real-time leasing agent calendar synchronization

#### 4. Pre-screening Agent
- **Purpose**: Progressive information collection by priority
- **Process**: High priority (timeline, budget) → Medium priority (preferences) → Low priority (details)
- **Goal**: Maximize information gathering without conversation fatigue

#### 5. Follow-up Agent
- **Purpose**: Post-tour experience optimization and conversion
- **Trigger**: 24 hours after tour completion
- **Process**: Experience feedback → Address concerns → Facilitate next steps
- **Goal**: Convert tours to applications and leases

#### 6. Escalation Agent
- **Purpose**: Intelligent routing to human agents
- **Triggers**: Complex questions, explicit human request, complaint, multiple failed attempts
- **Process**: Context handoff → Human agent notification → Clear expectations

## Mexican Market Considerations

### Communication Preferences
- **WhatsApp First**: Primary business communication channel
- **Formal Beginning**: Start with "usted," mirror customer tone
- **Natural Spanish**: Mexican expressions and cultural context
- **Family Decisions**: Allow consultation time, provide shareable info
- **Relationship Building**: Emphasize trust and personal connection

### Cultural Adaptation
- **Business Hours**: Respect Mexican business timing
- **Decision Making**: Often involves multiple family members
- **Trust Building**: Transparency about AI vs human assistance
- **Communication Style**: Professional yet warm and approachable

## HubSpot Integration Specifications

### Contact Management
- **Primary ID**: Phone number (Mexican format +52XXXXXXXXXX)
- **New Contact**: Auto-create on first WhatsApp conversation
- **Update Triggers**: Qualification completion, status changes, tour booking

### Custom Properties
- **ai_conversation_status**: Tracks AI interaction progress
- **property_interest**: Josefa, Matilde, both, undecided
- **budget_range**: Under $20k, $20k-$30k, $30k-$40k, over $40k
- **move_in_timeline**: ASAP, 1-3 months, 3-6 months, 6+ months

### Deal Lifecycle
- **Creation Trigger**: Tour scheduled
- **Pipeline Stages**: New Lead → Contacted → Qualified → Tour Scheduled → Tour Completed → Application → Lease Signed
- **Automation**: Status updates based on conversation outcomes

## Success Metrics Framework

### Response Efficiency
- **Lead Response Time**: < 5 minutes (vs current hours/days)
- **Automation Coverage**: 80% of interactions handled by AI
- **Tour Conversion**: 25% improvement over manual process

### Integration Performance
- **HubSpot Sync**: 99%+ accuracy for bidirectional updates
- **Real-time Updates**: < 30 seconds for status changes
- **Escalation Rate**: < 15% requiring human intervention

### Customer Experience
- **Satisfaction Rating**: 4.5+ stars for AI interactions
- **Response Quality**: 95%+ intent recognition accuracy
- **Completion Rate**: 90%+ of conversations reach logical conclusion

## Implementation Timeline

### Critical Milestones
- **Tuesday Demo**: Marketing director approval presentation
- **July 25th**: Core functionality complete and tested
- **August 1st**: Full system operational and team trained
- **August 8th**: Complete handover before team departure

### Risk Factors
- **Timeline Pressure**: Extremely tight delivery schedule
- **Stakeholder Skepticism**: Marketing director committed to HubSpot until 2027
- **Integration Complexity**: Real-time bidirectional sync requirements
- **Cultural Adaptation**: Mexican Spanish and business communication norms

## Competitive Positioning

### Direct Competitor: Nomad Bucareli
- **Location**: Also in Colonia Juárez
- **Pricing**: Starting ~$19,200 MXN (vs Urbanista's $25,700+)
- **Value Prop**: Similar (no aval, pet-friendly, amenities)
- **Differentiation**: Urbanista's premium positioning and historic property narrative

### Competitive Advantages
- **Response Speed**: AI-powered < 5 minute response vs manual competitors
- **Quality Experience**: Premium service maintained while scaling
- **Cultural Fit**: Mexican-optimized AI communication
- **Integration**: Seamless HubSpot workflow enhancement

## Knowledge Base Usage Guidelines

### For AI Conversation Designer
- Use property details for accurate information sharing
- Reference customer profile for conversation tone and approach
- Apply cultural considerations for Mexican market appropriateness
- Follow success metrics for conversation optimization

### For Integration Specialist
- Use HubSpot specifications for data mapping
- Reference timeline constraints for development prioritization
- Apply risk factors for robust error handling
- Follow success metrics for integration validation

### For Customer Experience Optimizer
- Use competitive positioning for value proposition
- Reference customer profile for experience design
- Apply success metrics for quality assurance
- Follow cultural considerations for satisfaction optimization

## Continuous Updates

This knowledge base should be updated with:
- New property acquisitions and details
- Customer feedback and conversation insights
- Performance metrics and optimization results
- Market changes and competitive intelligence
- Technical integration learnings and best practices

## Scripts de Calificación de Leads (Paso a Paso)

### 1. Saludo y Presentación
"¡Hola [Nombre]! 👋 Soy Maya, asistente digital de UrbanHub. Vi que te interesa uno de nuestros departamentos y me encantaría ayudarte a encontrar el ideal para ti. ¿Te gustaría que te haga unas preguntas rápidas para conocerte mejor?"

### 2. Calificación de Timeline
"¿Para cuándo te gustaría mudarte?"
- A) En las próximas 4 semanas
- B) En 1-3 meses
- C) En 3-6 meses
- D) Más adelante

*Respuesta sugerida según opción:*
- "¡Perfecto! Tenemos opciones disponibles para ese periodo."

### 3. Interés en Propiedad
"¿Hay alguna propiedad que te interese más? Tenemos Josefa en Reforma y Matilde en Juárez, o si prefieres te cuento de ambas."
- A) Josefa
- B) Matilde
- C) No estoy seguro/a

*Respuesta sugerida:*
- "¡Excelente elección! Te cuento más detalles de [propiedad]."
- "No te preocupes, te puedo ayudar a comparar ambas para que elijas la mejor para ti."

### 4. Calificación de Presupuesto
"¿Cuál es tu presupuesto mensual aproximado para la renta?"
- A) Menos de $25,000 MXN
- B) $25,000 - $30,000 MXN
- C) $30,000 - $40,000 MXN
- D) Más de $40,000 MXN

*Respuesta sugerida:*
- "¡Gracias! Con ese presupuesto tenemos varias opciones que pueden interesarte."

### 5. Preferencias y Necesidades
"¿Buscas algún número de recámaras en particular, o alguna amenidad que sea indispensable para ti? (ejemplo: pet-friendly, coworking, gimnasio, terraza, etc.)"

*Respuesta sugerida:*
- "¡Perfecto! Tomo nota de tus preferencias para mostrarte solo lo que realmente te interesa."

### 6. Cierre y Agendamiento de Tour
"¿Te gustaría agendar una visita para conocer el departamento? Puede ser presencial o virtual, como prefieras. ¿Qué día y hora te acomoda?"

*Respuesta sugerida:*
- "¡Listo! Te agendo la visita y te mando la confirmación por WhatsApp. Si tienes alguna otra duda, aquí estoy para ayudarte."

## Preguntas Frecuentes (FAQs) y Respuestas Naturales

### ¿Qué es UrbanHub y qué lo hace diferente?
UrbanHub es una plataforma premium de renta de departamentos y espacios de coworking en la Ciudad de México. Nos diferenciamos por ofrecer ubicaciones privilegiadas, amenidades de primer nivel y atención personalizada, todo con procesos ágiles y sin burocracia. ¡Queremos que encuentres tu nuevo hogar o espacio de trabajo sin complicaciones!

### ¿Cuáles son los requisitos para rentar un departamento?
Solo necesitas comprobante de ingresos y una identificación oficial. No pedimos aval. El contrato mínimo es de 12 meses y se solicita un mes de depósito. Somos pet-friendly en la mayoría de nuestras propiedades (aplican restricciones).

### ¿Qué incluye la renta mensual?
La renta incluye el acceso a todas las amenidades del edificio, mantenimiento y seguridad 24/7. Los servicios (agua, luz, internet) se pagan por separado, pero te ayudamos a gestionarlos fácilmente.

### ¿Puedo agendar una visita para conocer los departamentos?
¡Por supuesto! Solo dime qué día y hora te acomoda y te ayudo a agendar una visita guiada. También puedes hacer un tour virtual si lo prefieres.

### ¿Qué amenidades tienen Josefa y Matilde?
- **Josefa**: Gimnasio, terrazas con vista, cine privado, coworking, simulador de golf, alberca, spa, salón de eventos y más.
- **Matilde**: Terraza-jardín, lobby histórico, gimnasio boutique, coworking, salón de usos múltiples, seguridad digital.

### ¿Aceptan mascotas?
Sí, somos pet-friendly en la mayoría de nuestras propiedades. Solo te pedimos avisar con anticipación y cumplir con el reglamento interno.

### ¿Cómo es el proceso de renta?
1. Calificamos tu perfil y preferencias.
2. Agendamos tu visita (presencial o virtual).
3. Si te gusta, te ayudamos con el papeleo digital.
4. Firmas contrato y ¡listo! Puedes mudarte en cuanto lo desees.

### ¿Qué opciones de pago aceptan?
Aceptamos transferencias SPEI, tarjetas de crédito/débito y pagos en OXXO. Te damos flexibilidad para que elijas la opción que más te convenga.

### ¿Puedo compartir departamento o rentar como extranjero?
Sí, puedes compartir con roomies y también rentar si eres extranjero. Solo requerimos documentación básica y comprobante de ingresos.

### ¿Cómo puedo contactar a un asesor humano?
En cualquier momento puedes pedir hablar con un asesor y te conectamos con alguien de nuestro equipo para atención personalizada.

### ¿Qué hago si tengo una emergencia o problema en el departamento?
Contamos con soporte 24/7. Puedes escribirnos por WhatsApp y nuestro equipo de mantenimiento te ayudará lo antes posible.

## Estructura para Bird.com Embeddings (Formato JSON)

Para optimizar la búsqueda semántica y la generación de respuestas naturales en Bird.com, la knowledge base debe estructurarse en formato JSON con los siguientes elementos:

### 1. Estructura General
```json
[
  {
    "intent": "faq_pet_policy",
    "question": "¿Aceptan mascotas?",
    "answer": "Sí, somos pet-friendly en la mayoría de nuestras propiedades. Solo te pedimos avisar con anticipación y cumplir con el reglamento interno.",
    "tags": ["mascotas", "pet-friendly", "reglamento", "política"],
    "property": ["josefa", "matilde"],
    "keywords": ["perros", "gatos", "animales", "aceptan mascotas"],
    "synonyms": ["permiten mascotas", "puedo llevar a mi perro", "pet policy"],
    "persona": ["young_professional", "startup_founder"]
  },
  {
    "intent": "tour_scheduling",
    "question": "¿Puedo agendar una visita?",
    "answer": "¡Por supuesto! Solo dime qué día y hora te acomoda y te ayudo a agendar una visita guiada. También puedes hacer un tour virtual si lo prefieres.",
    "tags": ["visita", "tour", "agendar", "recorrido"],
    "property": ["josefa", "matilde"],
    "keywords": ["cita", "ver departamento", "tour virtual"],
    "synonyms": ["agendar cita", "programar visita", "quiero conocer"],
    "persona": ["executive", "international_executive"]
  }
]
```

### 2. Campos recomendados
- **intent**: Intención principal de la pregunta/respuesta
- **question**: Pregunta en lenguaje natural
- **answer**: Respuesta optimizada para WhatsApp
- **tags**: Temas principales para filtrado rápido
- **property**: Propiedades relevantes (opcional)
- **keywords**: Palabras clave para mejorar el matching semántico
- **synonyms**: Variaciones y sinónimos comunes
- **persona**: Segmentos de usuario o perfil

### 3. Ejemplo de entrada para objeción de precio
```json
{
  "intent": "objection_price",
  "question": "¿Por qué es más caro que otros edificios?",
  "answer": "El valor de UrbanHub está en sus amenidades premium, ubicación privilegiada y atención personalizada. Además, ofrecemos promociones y flexibilidad de pago para que aproveches lo mejor del mercado.",
  "tags": ["precio", "valor", "amenidades", "ubicación"],
  "property": ["josefa", "matilde"],
  "keywords": ["caro", "costoso", "precio alto"],
  "synonyms": ["es más caro", "por qué cuesta más", "precio comparado"],
  "persona": ["business_consultant", "young_professional"]
}
```

### 4. Metadata y personalización
- Incluir campos como `language`, `tone`, `context` para adaptar la respuesta al perfil del lead.
- Ejemplo:
```json
{
  "intent": "greeting",
  "question": "Hola, ¿me pueden dar información?",
  "answer": "¡Hola {{name}}! 👋 Gracias por tu interés en {{property_name}}. Soy tu asistente de UrbanHub y estoy aquí para ayudarte a encontrar el hogar perfecto. ¿En qué te puedo ayudar hoy?",
  "tags": ["saludo", "bienvenida"],
  "language": "es-MX",
  "tone": "friendly_professional",
  "context": "first_contact"
}
```

### 5. Recomendaciones
- Usar expresiones y sinónimos del español mexicano (ver archivo `mexican-context.json`).
- Asociar cada entrada a perfiles de usuario y escenarios de conversación.
- Mantener respuestas breves, cálidas y claras para WhatsApp.
- Actualizar la base de conocimiento con nuevas preguntas y feedback de usuarios.

## Información de Mercado y Diferenciadores vs Competencia

### Comparativa: UrbanHub vs Nomad Bucareli

| Característica         | UrbanHub (Josefa/Matilde)                | Nomad Bucareli                |
|-----------------------|-------------------------------------------|-------------------------------|
| Ubicación             | Reforma, Juárez, Polanco                  | Colonia Juárez                |
| Precio inicial        | $22,000 - $55,000 MXN                     | ~$19,200 MXN                  |
| Amenidades            | Premium: gym, coworking, spa, rooftop, cine, business center, alberca, concierge, wine cellar | Básicas: gym, pet-friendly, roof garden, coworking |
| Proceso de renta      | 100% digital, sin aval, flexibilidad, atención personalizada | Sin aval, proceso digital     |
| Perfil de inquilino   | Ejecutivos, creativos, internacionales, nómadas digitales | Jóvenes, pet-friendly         |
| Seguridad             | 24/7, acceso controlado, tecnología LEED  | 24/7, acceso controlado       |
| Integración digital   | WhatsApp, CRM, automatización IA          | WhatsApp, web                 |
| Experiencia cliente   | Asistente IA, tours virtuales, soporte 24/7 | Tours presenciales, soporte   |

### Diferenciadores Clave de UrbanHub
- **Amenidades superiores**: Spa, piscina infinity, business center, wine cellar, terrazas panorámicas, simulador de golf.
- **Ubicaciones premium**: Reforma, Polanco, Juárez, cerca de zonas financieras y culturales.
- **Atención personalizada**: Asistente IA, tours virtuales, soporte 24/7, procesos sin fricción.
- **Flexibilidad y transparencia**: Sin aval, contratos digitales, opciones para extranjeros y roomies.
- **Innovación tecnológica**: Integración con WhatsApp, CRM, automatización de procesos y seguimiento personalizado.
- **Comunidad y networking**: Espacios de coworking, eventos, enfoque en profesionales y ejecutivos.
- **Sustentabilidad**: Certificaciones LEED, paneles solares, sistemas ecológicos.

### Argumentos de Venta para el Agente IA
- "UrbanHub te ofrece mucho más que un departamento: es un estilo de vida premium con amenidades exclusivas y atención personalizada."
- "A diferencia de otras opciones, aquí puedes rentar sin aval, con procesos 100% digitales y soporte en todo momento."
- "Nuestras ubicaciones están en las mejores zonas de la CDMX, cerca de todo lo que necesitas para vivir y trabajar."
- "Si buscas comunidad, networking y espacios para crecer profesionalmente, UrbanHub es tu mejor opción."
- "¿Te gustaría conocer las promociones actuales o agendar una visita para descubrir la diferencia?"

## Templates de Respuesta WhatsApp (Variaciones Culturales)

### 1. Mensaje de Bienvenida
"¡Hola {{name}}! 👋 Gracias por tu interés en {{property_name}}. Soy tu asistente de UrbanHub y estoy aquí para ayudarte a encontrar el hogar perfecto. ¿En qué te puedo ayudar hoy?"

### 2. Confirmación de Tour
"¡Listo {{name}}! 🎉 Tu visita está confirmada:

📅 {{date}}
🕐 {{time}}
🏢 {{property_name}}
📍 {{address}}
👤 Te atenderá {{agent_name}}

Te enviaré un recordatorio 1 día antes. ¡Nos vemos pronto! 🏠"

### 3. Seguimiento/Nurture
"¡Hola {{name}}! 😊 ¿Cómo vas con tus planes de mudanza? Recuerda que en {{property_name}} tenemos:

✅ {{feature_1}}
✅ {{feature_2}}
✅ {{feature_3}}

¿Te gustaría agendar una visita esta semana?"

### 4. Escalación a Humano
"{{name}}, entiendo que necesitas atención especializada. Te voy a conectar con {{specialist_name}}, nuestro {{specialist_role}}, quien te podrá ayudar mejor con {{specific_need}}.

📞 {{phone}}
📧 {{email}}

¿Prefieres que te contacte hoy o hay algún horario específico que te acomode?"

### 5. Variaciones según tipo de lead y momento del día
- Formal: "Buenos días {{name}}, quedo a sus órdenes para cualquier consulta sobre {{property_name}}."
- Casual: "¡Qué gusto saludarte, {{name}}! ¿Listo para conocer tu nuevo depa en {{property_name}}?"
- Noche: "¡Hola {{name}}! Si prefieres, podemos agendar tu visita para mañana o el fin de semana. Avísame qué te acomoda."

### 6. Expresiones mexicanas y personalización
- "¡Está padrísimo el departamento que te voy a mostrar!"
- "Cualquier duda, aquí estoy para servirte."
- "Te mando ubicación por WhatsApp para que llegues sin problema."
- "Si tienes roomie o mascota, también son bienvenidos."