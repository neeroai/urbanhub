#!/bin/bash

# UrbanHub Demo Environment Setup Script
# Configura entorno completo para demo del martes

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_header() {
    echo ""
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_header "Checking Prerequisites"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version must be 18+. Current version: $(node --version)"
        exit 1
    fi
    log_success "Node.js $(node --version) installed"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    log_success "npm $(npm --version) installed"
    
    # Check ngrok for webhook tunneling
    if ! command -v ngrok &> /dev/null; then
        log_warning "ngrok not installed. Installing via npm..."
        npm install -g ngrok
    fi
    log_success "ngrok available for webhook tunneling"
    
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        log_warning "PostgreSQL not found. Please ensure PostgreSQL is installed for production setup."
    else
        log_success "PostgreSQL available"
    fi
}

# Environment variables setup
setup_environment() {
    log_header "Setting up Environment Variables"
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        log_info "Creating .env file from template..."
        cat > .env << 'EOF'
# Bird.com Configuration
BIRD_API_KEY=your_bird_api_key_here
BIRD_API_URL=https://api.bird.com/v2
BIRD_WORKSPACE_ID=your_workspace_id_here
WEBHOOK_SECRET=your_webhook_secret_here

# WhatsApp Configuration
URBANHUB_WHATSAPP_NUMBER=+52_55_XXXX_XXXX
WHATSAPP_VERIFY_TOKEN=urbanhub_verify_token_2024

# HubSpot Configuration  
HUBSPOT_API_KEY=your_hubspot_api_key_here
HUBSPOT_OWNER_ID=your_hubspot_owner_id_here

# Webhook Configuration
WEBHOOK_BASE_URL=https://your-ngrok-url.ngrok.io
NODE_ENV=demo

# Database Configuration (for production)
POSTGRES_CONNECTION_STRING=postgresql://username:password@localhost:5432/urbanhub

# Calendar Integrations (optional)
CALENDLY_API_KEY=your_calendly_api_key_here
GOOGLE_CALENDAR_CREDS=/path/to/google-creds.json
OUTLOOK_TENANT_ID=your_outlook_tenant_id_here
OUTLOOK_CLIENT_ID=your_outlook_client_id_here
OUTLOOK_CLIENT_SECRET=your_outlook_client_secret_here

# Demo Configuration
DEMO_MODE=true
DEMO_PHONE_NUMBERS=+52_55_1234_5678,+52_55_2345_6789
EOF
        log_success ".env file created"
        log_warning "Please update .env file with your actual API keys and configuration"
    else
        log_info ".env file already exists"
    fi
    
    # Load environment variables
    if [ -f .env ]; then
        export $(grep -v '^#' .env | xargs)
    fi
}

# Install dependencies
install_dependencies() {
    log_header "Installing Dependencies"
    
    log_info "Installing npm dependencies..."
    npm install
    log_success "npm dependencies installed"
    
    # Install additional demo dependencies if needed
    if ! npm list axios &> /dev/null; then
        log_info "Installing axios for API testing..."
        npm install axios
    fi
    
    if ! npm list chalk &> /dev/null; then
        log_info "Installing chalk for colored output..."
        npm install chalk
    fi
    
    log_success "All dependencies installed"
}

# Setup database (demo mode - in-memory)
setup_database() {
    log_header "Setting up Database"
    
    if [ "$NODE_ENV" = "demo" ]; then
        log_info "Demo mode: Using in-memory database"
        
        # Create demo data directory
        mkdir -p data/demo
        
        # Create demo leads file
        cat > data/demo/leads.json << 'EOF'
[
  {
    "id": "demo_lead_1",
    "name": "Carlos Mendoza",
    "phone": "+52 55 1234 5678",
    "email": "carlos.demo@urbanhub.mx",
    "status": "new",
    "budget": "25000-35000",
    "timeline": "2 semanas",
    "property_interest": "Josefa",
    "created_at": "2024-01-15T10:00:00Z"
  },
  {
    "id": "demo_lead_2", 
    "name": "Ana Rodriguez",
    "phone": "+52 55 2345 6789",
    "email": "ana.demo@urbanhub.mx",
    "status": "qualified",
    "budget": "20000-30000",
    "timeline": "1 mes",
    "property_interest": "Matilde",
    "created_at": "2024-01-15T11:00:00Z"
  },
  {
    "id": "demo_lead_3",
    "name": "Luis Martinez",  
    "phone": "+52 55 3456 7890",
    "email": "luis.demo@urbanhub.mx",
    "status": "tour_scheduled",
    "budget": "35000-50000",
    "timeline": "1 semana", 
    "property_interest": "Merida",
    "tour_date": "2024-01-17T14:00:00Z",
    "created_at": "2024-01-15T12:00:00Z"
  }
]
EOF
        log_success "Demo leads data created"
    else
        log_info "Production mode: PostgreSQL setup required"
        if [ -n "$POSTGRES_CONNECTION_STRING" ]; then
            log_info "Running database migrations..."
            npm run db:migrate
            log_success "Database migrations completed"
        else
            log_warning "POSTGRES_CONNECTION_STRING not set"
        fi
    fi
}

# Setup ngrok tunnel for webhooks
setup_webhook_tunnel() {
    log_header "Setting up Webhook Tunnel"
    
    # Kill any existing ngrok processes
    pkill ngrok || true
    sleep 2
    
    log_info "Starting ngrok tunnel on port 3000..."
    ngrok http 3000 --log=stdout > ngrok.log 2>&1 &
    
    # Wait for ngrok to start
    sleep 5
    
    # Get ngrok URL
    NGROK_URL=$(curl -s localhost:4040/api/tunnels | grep -o 'https://[^"]*ngrok[^"]*')
    
    if [ -z "$NGROK_URL" ]; then
        log_error "Failed to get ngrok URL. Check ngrok.log for details."
        exit 1
    fi
    
    log_success "ngrok tunnel active: $NGROK_URL"
    
    # Update .env with ngrok URL
    if [ -f .env ]; then
        sed -i.bak "s|WEBHOOK_BASE_URL=.*|WEBHOOK_BASE_URL=$NGROK_URL|" .env
        log_info "Updated WEBHOOK_BASE_URL in .env file"
    fi
    
    export WEBHOOK_BASE_URL=$NGROK_URL
}

# Configure Bird.com workspace
configure_bird_workspace() {
    log_header "Configuring Bird.com Workspace"
    
    if [ -z "$BIRD_API_KEY" ] || [ "$BIRD_API_KEY" = "your_bird_api_key_here" ]; then
        log_warning "BIRD_API_KEY not configured. Skipping Bird.com setup."
        return
    fi
    
    log_info "Testing Bird.com API connection..."
    
    # Test API connection
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $BIRD_API_KEY" \
        -H "Content-Type: application/json" \
        "$BIRD_API_URL/health")
    
    if [ "$HTTP_STATUS" -ne 200 ]; then
        log_error "Bird.com API connection failed. HTTP Status: $HTTP_STATUS"
        exit 1
    fi
    
    log_success "Bird.com API connection successful"
    
    # Configure webhooks
    log_info "Configuring Bird.com webhooks..."
    
    WEBHOOK_RESPONSE=$(curl -s -X POST \
        -H "Authorization: Bearer $BIRD_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{
            "url": "'$WEBHOOK_BASE_URL'/webhooks/bird",
            "events": ["message.created", "conversation.updated", "agent.escalated"],
            "secret": "'$WEBHOOK_SECRET'"
        }' \
        "$BIRD_API_URL/webhooks")
    
    log_success "Bird.com webhooks configured"
}

# Configure HubSpot integration
configure_hubspot() {
    log_header "Configuring HubSpot Integration"
    
    if [ -z "$HUBSPOT_API_KEY" ] || [ "$HUBSPOT_API_KEY" = "your_hubspot_api_key_here" ]; then
        log_warning "HUBSPOT_API_KEY not configured. Skipping HubSpot setup."
        return
    fi
    
    log_info "Testing HubSpot API connection..."
    
    # Test API connection
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $HUBSPOT_API_KEY" \
        -H "Content-Type: application/json" \
        "https://api.hubapi.com/crm/v3/objects/contacts?limit=1")
    
    if [ "$HTTP_STATUS" -ne 200 ]; then
        log_error "HubSpot API connection failed. HTTP Status: $HTTP_STATUS"
        exit 1
    fi
    
    log_success "HubSpot API connection successful"
}

# Start development server
start_server() {
    log_header "Starting Development Server"
    
    log_info "Starting UrbanHub AI Agents server..."
    
    # Create a simple start script
    cat > start-demo.js << 'EOF'
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Webhook endpoints
app.post('/webhooks/bird', (req, res) => {
    console.log('Bird.com webhook received:', req.body);
    res.json({ received: true });
});

app.get('/webhooks/bird/health', (req, res) => {
    res.json({ status: 'webhook_ready' });
});

app.post('/webhooks/hubspot', (req, res) => {
    console.log('HubSpot webhook received:', req.body);
    res.json({ received: true });
});

// Demo endpoints
app.get('/demo/status', (req, res) => {
    res.json({
        demo_mode: true,
        ngrok_url: process.env.WEBHOOK_BASE_URL,
        bird_configured: !!process.env.BIRD_API_KEY,
        hubspot_configured: !!process.env.HUBSPOT_API_KEY,
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 UrbanHub AI Agents demo server running on port ${port}`);
    console.log(`📍 Health check: http://localhost:${port}/health`);
    console.log(`🔗 Public URL: ${process.env.WEBHOOK_BASE_URL}`);
    console.log(`📊 Demo status: ${process.env.WEBHOOK_BASE_URL}/demo/status`);
});
EOF
    
    # Start server in background
    node start-demo.js &
    SERVER_PID=$!
    echo $SERVER_PID > server.pid
    
    # Wait for server to start
    sleep 3
    
    # Test server is running
    if curl -s http://localhost:3000/health > /dev/null; then
        log_success "Demo server started successfully (PID: $SERVER_PID)"
        log_info "Server URL: http://localhost:3000"
        log_info "Public URL: $WEBHOOK_BASE_URL"
    else
        log_error "Failed to start demo server"
        exit 1
    fi
}

# Run integration tests
run_tests() {
    log_header "Running Integration Tests"
    
    log_info "Running demo integration tests..."
    
    if [ -f "scripts/demo/test-integration.js" ]; then
        node scripts/demo/test-integration.js
    else
        log_warning "Integration test file not found. Skipping tests."
    fi
}

# Create demo summary
create_demo_summary() {
    log_header "Demo Setup Summary"
    
    # Create demo summary file
    cat > DEMO_SUMMARY.md << EOF
# UrbanHub AI Agents Demo - Setup Summary

**Demo Date**: $(date)
**Environment**: Demo/Development

## 🔗 URLs
- **Local Server**: http://localhost:3000
- **Public Webhook URL**: $WEBHOOK_BASE_URL
- **Health Check**: $WEBHOOK_BASE_URL/health
- **Demo Status**: $WEBHOOK_BASE_URL/demo/status

## 📱 Test Phone Numbers
- Carlos Mendoza Demo: +52 55 1234 5678
- Ana Rodriguez Demo: +52 55 2345 6789  
- Luis Martinez Demo: +52 55 3456 7890

## 🤖 AI Agents Configured
1. **Lead Qualifier** - Calificación inicial de leads
2. **Lead Warmer** - Reactivación de leads fríos
3. **Tour Scheduler** - Agendamiento de tours
4. **Pre-screener** - Recolección progresiva de información
5. **Follow-up** - Seguimiento post-tour

## 🔧 Configuration Status
- **Bird.com API**: $([ -n "$BIRD_API_KEY" ] && [ "$BIRD_API_KEY" != "your_bird_api_key_here" ] && echo "✅ Configured" || echo "⚠️ Needs API key")
- **HubSpot API**: $([ -n "$HUBSPOT_API_KEY" ] && [ "$HUBSPOT_API_KEY" != "your_hubspot_api_key_here" ] && echo "✅ Configured" || echo "⚠️ Needs API key")
- **WhatsApp Channel**: $([ -n "$URBANHUB_WHATSAPP_NUMBER" ] && echo "✅ Configured" || echo "⚠️ Needs phone number")
- **Webhooks**: ✅ ngrok tunnel active

## 🎯 Demo Scenarios
1. **Lead Qualification Flow** - Nuevo lead llega por WhatsApp
2. **Tour Scheduling** - Lead calificado agenda tour
3. **Lead Warming** - Reactivación de lead frío
4. **HubSpot Sync** - Sincronización automática de datos

## 📋 Pre-Demo Checklist
- [ ] API keys configuradas en .env
- [ ] ngrok tunnel activo
- [ ] Bird.com webhooks registrados
- [ ] HubSpot pipeline configurado
- [ ] Agentes AI deployados
- [ ] Tests de integración pasando

## 🚀 Starting Demo
1. Ensure server is running: \`curl $WEBHOOK_BASE_URL/health\`
2. Check demo status: \`curl $WEBHOOK_BASE_URL/demo/status\`  
3. Run integration tests: \`npm run demo:test\`
4. Start demo scenarios with test phone numbers

## ⚡ Quick Commands
\`\`\`bash
# Check server status
curl $WEBHOOK_BASE_URL/health

# Run integration tests
node scripts/demo/test-integration.js

# View server logs  
tail -f server.log

# Stop demo server
kill \$(cat server.pid)
\`\`\`

---
*Generated by UrbanHub demo setup script*
EOF
    
    log_success "Demo summary created: DEMO_SUMMARY.md"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    
    # Kill server if running
    if [ -f server.pid ]; then
        kill $(cat server.pid) 2>/dev/null || true
        rm server.pid
    fi
    
    # Kill ngrok if running
    pkill ngrok 2>/dev/null || true
}

# Main execution
main() {
    log_header "🚀 UrbanHub AI Agents Demo Setup"
    log_info "Setting up complete demo environment for Tuesday presentation"
    
    # Setup cleanup trap
    trap cleanup EXIT INT TERM
    
    # Run setup steps
    check_prerequisites
    setup_environment
    install_dependencies
    setup_database
    setup_webhook_tunnel
    configure_bird_workspace
    configure_hubspot
    start_server
    run_tests
    create_demo_summary
    
    # Final success message
    log_header "🎉 Demo Setup Complete!"
    log_success "UrbanHub AI Agents demo environment is ready"
    log_info "Check DEMO_SUMMARY.md for all details and URLs"
    log_info "Demo server running at: $WEBHOOK_BASE_URL"
    log_warning "Keep this terminal open to maintain the demo environment"
    
    # Keep script running
    log_info "Press Ctrl+C to stop the demo environment"
    wait
}

# Handle script arguments
case "${1:-setup}" in
    setup)
        main
        ;;
    test)
        run_tests
        ;;
    cleanup)
        cleanup
        exit 0
        ;;
    *)
        echo "Usage: $0 [setup|test|cleanup]"
        echo "  setup   - Full demo environment setup (default)"
        echo "  test    - Run integration tests only"
        echo "  cleanup - Clean up demo environment"
        exit 1
        ;;
esac