# Demo Setup Guide - UrbanHub AI Agents

## Guía Completa para Demo del Martes
**Objetivo**: Configuración paso a paso para demostración exitosa de agentes de IA de UrbanHub en plataforma Bird.com

---

## Pre-requisitos de Demo

### 1. Cuentas y Accesos Requeridos
- [ ] **Bird.com Workspace** - Acceso con permisos de administrador
- [ ] **WhatsApp Business API** - Número mexicano registrado (+52)
- [ ] **HubSpot CRM** - Acceso API con permisos de deals/contacts
- [ ] **Calendarios** - Acceso a calendarios de agentes de leasing
- [ ] **Entorno de desarrollo** - Node.js 18+, PostgreSQL, ngrok

### 2. Datos de Demo Preparados
- [ ] **Leads de prueba** en HubSpot (mínimo 10 leads)
- [ ] **Propiedades UrbanHub** - Datos de Josefa y Matilde
- [ ] **Agentes de leasing** - Calendarios con disponibilidad
- [ ] **Scripts conversacionales** - Español mexicano validado

---

## Fase 1: Configuración Bird.com Platform

### 1.1 Setup Workspace México
```bash
# 1. Configurar workspace para México
npm run bird:setup

# 2. Validar configuración
npm run bird:test-webhook
```

### 1.2 Configuración Regional México
- **Timezone**: `America/Mexico_City`
- **Idioma**: `es-MX` (Español México)
- **Moneda**: `MXN` (Peso Mexicano)
- **Formato teléfono**: `+52 XX XXXX XXXX`

### 1.3 WhatsApp Business API Setup
```bash
# Configurar canal WhatsApp
curl -X POST https://api.bird.com/v2/channels \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "whatsapp",
    "name": "UrbanHub México",
    "config": {
      "phoneNumber": "+52XXXXXXXXXX",
      "businessName": "UrbanHub México",
      "timezone": "America/Mexico_City"
    }
  }'
```

---

## Fase 2: Deployment de Agentes IA

### 2.1 Configurar 5 Agentes Especializados

#### Lead Qualifier Agent
```yaml
# config/agents/lead-qualifier.yaml
name: "UrbanHub Lead Qualifier"
model: "gpt-4"
language: "es-MX"
personality: "profesional, amigable, eficiente"
knowledge_base: "urbanhub_properties"
main_goal: "Calificar leads por timeline, presupuesto e interés"
escalation_triggers:
  - "lead_qualified_immediate"
  - "complex_financial_question"
  - "legal_inquiry"
```

#### Lead Warming Agent
```yaml
# config/agents/lead-warmer.yaml  
name: "UrbanHub Lead Warmer"
model: "gpt-4"
language: "es-MX"
personality: "cálido, persistente, servicial"
knowledge_base: "urbanhub_nurturing_content"
main_goal: "Reavivar leads que no han agendado tours"
sequence_triggers:
  - "24h_no_response"
  - "48h_no_tour_scheduled"
```

#### Tour Scheduling Agent
```yaml
# config/agents/tour-scheduler.yaml
name: "UrbanHub Tour Scheduler"
model: "gpt-4"
language: "es-MX"
personality: "organizado, detallista, confirmativo"
integrations: ["calendly", "google_calendar"]
main_goal: "Agendar y confirmar tours de propiedades"
```

### 2.2 Deploy Agentes
```bash
# Deploy todos los agentes
npm run bird:deploy-agents

# Validar deployment
npm run agent:validate
```

---

## Fase 3: Integración HubSpot + Calendarios

### 3.1 HubSpot API Configuration
```javascript
// config/integrations/hubspot.js
const hubspotConfig = {
  apiKey: process.env.HUBSPOT_API_KEY,
  baseUrl: 'https://api.hubapi.com',
  dealPipeline: 'urbanhub-mexico',
  leadSources: ['whatsapp', 'sms', 'web'],
  syncInterval: '5min'
};
```

### 3.2 Calendar Integration Setup
```bash
# Configurar integraciones de calendario
npm run calendar:setup

# Test sincronización
npm run calendar:test-sync
```

### 3.3 Webhook Endpoints
```bash
# Configurar webhooks para demo
ngrok http 3000

# Registrar webhooks en Bird.com
curl -X POST https://api.bird.com/v2/webhooks \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "url": "https://YOUR_NGROK.ngrok.io/webhooks/bird",
    "events": ["message.created", "conversation.updated"]
  }'
```

---

## Fase 4: Datos de Demo y Testing

### 4.1 Preparar Leads de Prueba
```javascript
// scripts/demo/prepare-leads.js
const demoLeads = [
  {
    name: "Carlos Mendoza",
    phone: "+52 55 1234 5678", 
    budget: "25000-35000",
    timeline: "2 semanas",
    property_interest: "Josefa"
  },
  {
    name: "Ana Rodríguez", 
    phone: "+52 55 2345 6789",
    budget: "20000-30000", 
    timeline: "1 mes",
    property_interest: "Matilde"
  }
  // ... más leads de prueba
];
```

### 4.2 Scenarios de Testing
```bash
# Test scenario 1: Lead qualification
npm run demo:test-qualification

# Test scenario 2: Tour scheduling  
npm run demo:test-scheduling

# Test scenario 3: Lead warming
npm run demo:test-warming

# Test scenario 4: Escalation to human
npm run demo:test-escalation
```

---

## Fase 5: Configuración Conversacional México

### 5.1 Templates WhatsApp México
```json
{
  "welcome_message": {
    "es_MX": "¡Hola! Soy el asistente virtual de UrbanHub México. ¿Te interesa conocer nuestros espacios de coworking premium en CDMX?",
    "fallback": "Disculpa, no entendí tu mensaje. ¿Podrías repetirlo?"
  },
  "qualification_questions": {
    "budget": "Para ofrecerte las mejores opciones, ¿cuál sería tu presupuesto mensual aproximado?",
    "timeline": "¿En qué plazo estarías buscando mudarte?",
    "property_type": "¿Te interesa más el ambiente dinámico de Josefa o el espacio tranquilo de Matilde?"
  }
}
```

### 5.2 Frases Mexicanas Localizadas
```javascript
// config/localization/es-MX.js
const mexicanPhrases = {
  greetings: ["¡Qué tal!", "¡Hola!", "¡Buenos días!"],
  confirmations: ["¡Perfecto!", "¡Excelente!", "¡Qué padre!"],
  transitions: ["Ahora bien", "Por cierto", "Te platico que"],
  courtesy: ["Por favor", "Con mucho gusto", "Para servirte"]
};
```

---

## Fase 6: Monitoreo y Analytics Demo

### 6.1 Dashboard de Demo
- **Conversaciones activas** en tiempo real
- **Leads calificados** por agente
- **Tours agendados** del día
- **Escalaciones** a humanos
- **Response time** promedio

### 6.2 Métricas Clave para Demo
```javascript
// Métricas a mostrar durante demo
const demoMetrics = {
  lead_response_time: "< 2 minutos",
  qualification_rate: "85%+",
  tour_conversion: "25%+", 
  automation_coverage: "80%+",
  escalation_rate: "< 15%"
};
```

---

## Checklist Pre-Demo (1 Hora Antes)

### Validaciones Técnicas
- [ ] **Bird.com API** - Status 200 en todos los endpoints
- [ ] **WhatsApp Business** - Canal activo y funcionando
- [ ] **HubSpot Sync** - Leads sincronizando correctamente
- [ ] **Agentes IA** - Todos los 5 agentes respondiendo
- [ ] **Webhooks** - Ngrok tunnel activo y estable
- [ ] **Base de datos** - PostgreSQL corriendo, tablas creadas

### Validaciones de Negocio
- [ ] **Leads de prueba** cargados en HubSpot
- [ ] **Calendarios** con disponibilidad para demos
- [ ] **Scripts conversacionales** en español mexicano
- [ ] **Propiedades UrbanHub** - Información actualizada
- [ ] **Templates WhatsApp** aprobados y activos

### Preparación Demo
- [ ] **Teléfonos demo** con WhatsApp listo
- [ ] **Pantallas** - Bird.com dashboard + HubSpot
- [ ] **Scripts demo** - Scenarios preparados
- [ ] **Backup plan** - ¿Qué hacer si algo falla?

---

## Scenarios de Demo Sugeridos

### Scenario 1: Calificación de Lead (5 minutos)
1. **Lead nuevo** llega por WhatsApp
2. **Qualifier Agent** inicia conversación en español
3. **Calificación completa** - budget, timeline, preferencias
4. **Escalación automática** a agente humano
5. **Sincronización HubSpot** - Deal creado automáticamente

### Scenario 2: Warming de Lead Frío (3 minutos)
1. **Lead inactivo** (48 horas sin respuesta)
2. **Warming Agent** envía mensaje personalizado
3. **Re-engagement** con contenido relevante
4. **Tour scheduling** cuando lead responde
5. **Follow-up** automático programado

### Scenario 3: Agendamiento de Tour (4 minutos) 
1. **Lead calificado** solicita ver propiedades
2. **Scheduler Agent** muestra disponibilidad
3. **Calendario sync** en tiempo real
4. **Confirmación automática** con detalles
5. **Pre-tour info** enviada por WhatsApp

---

## Troubleshooting Demo

### Problemas Comunes

#### Bird.com API Issues
```bash
# Check API status
curl -I https://api.bird.com/health

# Verify authentication  
npm run bird:test-auth
```

#### WhatsApp Connection Issues
```bash
# Test WhatsApp channel
npm run whatsapp:test-connection

# Refresh webhook subscription
npm run whatsapp:refresh-webhook
```

#### HubSpot Sync Issues
```bash
# Test HubSpot API
npm run hubspot:test-connection

# Manual lead sync
npm run hubspot:sync-leads
```

---

## Post-Demo Actions

### 1. Demo Feedback Collection
- [ ] **Stakeholder feedback** - Notas y comentarios
- [ ] **Technical issues** - Lista de problemas encontrados  
- [ ] **Improvement opportunities** - Sugerencias de optimización
- [ ] **Next steps** - Prioridades para producción

### 2. Documentation Updates
- [ ] **Update this guide** con lecciones aprendidas
- [ ] **Bug tracking** - Issues encontrados durante demo
- [ ] **Performance metrics** - Datos reales del demo
- [ ] **Stakeholder requirements** - Cambios solicitados

---

## Contact & Support

### Demo Day Support
- **Technical Lead**: [Contacto técnico]
- **Product Manager**: [Contacto producto] 
- **Bird.com Support**: support@bird.com
- **Emergency**: [Número de emergencia]

### Resources
- **Bird.com Documentation**: `/docs/bird-*.md`
- **Conversation Flows**: `/docs/conversation-flows.md`
- **Technical Architecture**: `/docs/technical-integration-guide.md`
- **BMAD Framework**: `/bmad-core/expansion-packs/urbanhub-real-estate/`

---

**¡Éxito en el demo! 🚀**

*Esta guía está diseñada para asegurar una demostración exitosa del sistema de agentes IA de UrbanHub en la plataforma Bird.com, mostrando capacidades completas de automatización conversacional para el mercado mexicano.*