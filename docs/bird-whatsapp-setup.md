# Bird.com WhatsApp Channel Setup Guide

This guide provides step-by-step instructions for configuring Robert AI Agent with Bird.com WhatsApp Business API.

## Prerequisites

- [x] Bird.com account with workspace access
- [x] Bird.com API Access Key
- [x] WhatsApp Business API access
- [x] Robert application deployed and running
- [x] Public webhook URL accessible

## Step 1: Prepare Your Environment

### 1.1 Environment Variables

Ensure your `.env` file contains:

```bash
# Bird.com Configuration
BIRD_API_KEY=81oJ01ksBMEOopJMXmqsffTSM35UDusmUVuY
BIRD_WORKSPACE_ID=cfdaa80e-8f05-4dae-a4bb-707784a99b4a
BIRD_WEBHOOK_SECRET=your_webhook_secret_here

# Application URLs
PUBLIC_WEBHOOK_URL=https://your-domain.com/webhooks/bird
APPLICATION_URL=https://your-domain.com

# Other required variables
OPENAI_API_KEY=your_openai_key_here
DATABASE_URL=your_database_url_here
```

### 1.2 Verify Robert is Running

Check that Robert is initialized and healthy:

```bash
curl https://your-domain.com/health/agent
```

Expected response:
```json
{
  "agent": {
    "name": "Robert - Neero AI Agent",
    "version": "1.0.0",
    "environment": "production",
    "initialized": true,
    "uptime": 3600
  },
  "health": {
    "healthy": true,
    "issues": [],
    "details": {
      "database": true,
      "birdApi": true,
      "knowledgeBase": true,
      "templates": true,
      "escalation": true
    }
  }
}
```

## Step 2: Configure WhatsApp Channel in Bird.com

### 2.1 Access Bird.com Console

1. Log in to [Bird.com Console](https://console.bird.com)
2. Navigate to your workspace
3. Go to **Channels** → **WhatsApp**

### 2.2 Create WhatsApp Business Account

If you don't have a WhatsApp Business account connected:

1. Click **"Add WhatsApp"**
2. Select **"WhatsApp Business API"**
3. Follow the verification process:
   - Provide business information
   - Verify phone number
   - Complete business verification

### 2.3 Configure WhatsApp Channel

1. **Channel Name**: `Robert-WhatsApp-Channel`
2. **Display Name**: `Neero AI Assistant`
3. **Description**: `AI-powered automation assistant for Neero.ai`

### 2.4 Get Channel ID

After creating the channel, note the **Channel ID** (format: `ch_xxxxxxxxx`)

Update your environment:
```bash
BIRD_WHATSAPP_CHANNEL_ID=e29b197b-fe69-5d1c-a561-30bf607c300b
```

## Step 3: Configure Webhooks

### 3.1 Set Webhook URL

In Bird.com Console:

1. Go to **Settings** → **Webhooks**
2. Add webhook endpoint:
   - **URL**: `https://your-domain.com/webhooks/bird`
   - **Events**: Select all message events
     - `message.received`
     - `message.delivered`
     - `message.read`
     - `message.failed`
     - `conversation.created`
     - `conversation.updated`

### 3.2 Generate Webhook Secret

1. Generate a secure random string for webhook validation:
   ```bash
   openssl rand -hex 32
   ```

2. Add this to your Bird.com webhook configuration
3. Update your `.env` file:
   ```bash
   BIRD_WEBHOOK_SECRET=your_generated_secret_here
   ```

### 3.3 Test Webhook Connectivity

Test the webhook endpoint:

```bash
# Test webhook verification (GET request)
curl "https://your-domain.com/webhooks/bird?challenge=test123"

# Should return: test123

# Test webhook health
curl https://your-domain.com/webhooks/health
```

## Step 4: Configure Message Templates

### 4.1 WhatsApp Business Templates

WhatsApp requires pre-approved templates for business-initiated conversations. You need to create templates in Bird.com:

1. Go to **WhatsApp** → **Templates**
2. Create the following templates:

#### Welcome Template
- **Name**: `neero_welcome`
- **Category**: `UTILITY`
- **Language**: `es` (Spanish)
- **Content**:
  ```
  ¡Hola! 👋 Soy Robert, asistente virtual de Neero.ai
  
  Ayudo a empresas como la tuya a implementar soluciones de IA y automatización.
  
  ¿En qué puedo ayudarte hoy?
  ```

#### Handoff Template
- **Name**: `neero_handoff`
- **Category**: `UTILITY`
- **Language**: `es`
- **Content**:
  ```
  Te voy a conectar con uno de nuestros especialistas humanos 👨‍💼
  
  En un momento alguien de nuestro equipo se comunicará contigo.
  
  Gracias por tu paciencia.
  ```

#### Business Hours Template
- **Name**: `neero_after_hours`
- **Category**: `UTILITY`
- **Language**: `es`
- **Content**:
  ```
  ¡Hola! 👋 Soy Robert de Neero.ai
  
  Aunque es fuera del horario laboral, puedo ayudarte con información sobre nuestros servicios.
  
  Nuestro equipo humano está disponible de 9 AM a 6 PM 🕘
  
  ¿En qué puedo ayudarte?
  ```

### 4.2 Submit Templates for Approval

1. Submit all templates to WhatsApp for approval
2. Wait for approval (typically 24-48 hours)
3. Update your configuration with approved template names

## Step 5: Test the Integration

### 5.1 End-to-End Message Flow Test

1. **Send a test message** to your WhatsApp Business number:
   ```
   Hola, necesito información sobre automatización
   ```

2. **Check logs** for proper message processing:
   ```bash
   # Check application logs
   docker logs robert-app

   # Check webhook logs
   curl https://your-domain.com/health/agent/stats
   ```

3. **Verify response** comes from Robert with appropriate content

### 5.2 Test Escalation Flow

1. **Send escalation trigger**:
   ```
   Necesito hablar con un humano urgente
   ```

2. **Verify escalation** is triggered and logged
3. **Check handoff template** is sent

### 5.3 Test Knowledge Base Integration

1. **Ask about services**:
   ```
   ¿Qué servicios ofrece Neero?
   ```

2. **Verify knowledge base** response is used
3. **Check conversation flow** progresses properly

## Step 6: Production Considerations

### 6.1 Rate Limiting

Configure rate limits for WhatsApp API:

```bash
# Update config/config.ts
export const config = {
  bird: {
    rateLimits: {
      messagesPerSecond: 10,
      messagesPerMinute: 100,
      messagesPerHour: 1000,
    }
  }
}
```

### 6.2 Message Queue Setup

For high-volume scenarios, implement message queuing:

```bash
# Add Redis for message queue
REDIS_URL=redis://your-redis-instance

# Enable queue processing
ENABLE_MESSAGE_QUEUE=true
QUEUE_WORKERS=3
```

### 6.3 Monitoring Setup

Configure monitoring and alerts:

```bash
# Health check frequency
HEALTH_CHECK_INTERVAL=300000  # 5 minutes

# Alert thresholds
MAX_RESPONSE_TIME=5000  # 5 seconds
MIN_SUCCESS_RATE=0.95   # 95%
```

### 6.4 Backup and Failover

1. **Database backups**: Configure automated PostgreSQL backups
2. **Failover webhooks**: Set up backup webhook endpoints
3. **Circuit breakers**: Implement API circuit breakers

## Step 7: Verification Checklist

- [ ] Bird.com API connection successful
- [ ] WhatsApp channel created and configured
- [ ] Webhook endpoints responding correctly
- [ ] Message templates approved and active
- [ ] Robert responds to test messages
- [ ] Escalation flow working properly
- [ ] Knowledge base integration functioning
- [ ] Conversation tracking in database
- [ ] Logging and monitoring active
- [ ] Error handling tested

## Common Issues and Troubleshooting

### Issue: Webhook signature validation fails

**Solution:**
1. Verify `BIRD_WEBHOOK_SECRET` matches Bird.com configuration
2. Check webhook payload format
3. Ensure proper HMAC-SHA256 calculation

```bash
# Test webhook signature
curl -X POST https://your-domain.com/webhooks/test \
  -H "Content-Type: application/json" \
  -d '{"test": "message"}'
```

### Issue: Messages not being processed

**Solution:**
1. Check Robert agent health: `GET /health/agent`
2. Verify database connectivity
3. Check OpenAI API key validity
4. Review application logs

### Issue: Templates not working

**Solution:**
1. Verify templates are approved in WhatsApp
2. Check template names match configuration
3. Ensure proper template variable substitution

### Issue: Knowledge base not responding

**Solution:**
1. Check knowledge base files exist
2. Verify file permissions and paths
3. Restart Robert to reload knowledge base

## API Endpoints Reference

### Health Endpoints
- `GET /health` - Overall system health
- `GET /health/agent` - Robert agent specific status
- `GET /health/agent/stats` - Agent statistics

### Webhook Endpoints  
- `POST /webhooks/bird` - Bird.com webhook receiver
- `GET /webhooks/bird` - Webhook verification
- `POST /webhooks/test` - Test webhook endpoint

### Agent Management
- `GET /api/agent/info` - Agent information
- `GET /api/conversations` - Active conversations
- `GET /api/messages` - Message history

## Support

For issues specific to:
- **Bird.com**: Contact Bird.com support
- **WhatsApp Business API**: Check WhatsApp Business API documentation
- **Robert AI Agent**: Check application logs and health endpoints

## Next Steps

After successful setup:
1. Monitor conversation quality and escalation rates
2. Optimize knowledge base based on common queries
3. Adjust escalation rules based on business needs
4. Implement additional integrations (CRM, analytics)
5. Scale infrastructure based on message volume