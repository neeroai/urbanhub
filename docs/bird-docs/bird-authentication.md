# Bird.com API Authentication

## Overview

Bird.com API uses access key authentication to secure API requests. This document provides comprehensive guidance on setting up and managing authentication for the DRAD medical practice management system.

## Authentication Method

### Access Key Authentication

Bird.com uses a simple but secure access key authentication system:

- **Method**: Bearer token authentication
- **Header**: `Authorization: AccessKey <access-key>`
- **Scope**: All API endpoints require authentication
- **Security**: HTTPS enforced for all requests

## Setting Up Authentication

### 1. Obtaining Access Keys

1. **Create Bird.com Account**: Sign up at [bird.com](https://bird.com)
2. **Navigate to API Settings**: Access your account dashboard
3. **Generate Access Key**: Create a new API access key
4. **Store Securely**: Save the access key in a secure location

### 2. Access Key Management

#### Development Environment

```bash
# Environment variable (recommended)
export BIRD_API_KEY="your-access-key-here"

# .env file
BIRD_API_KEY=your-access-key-here
```

#### Production Environment

- Use secure environment variables
- Implement key rotation policies
- Monitor key usage and access logs
- Set up alerts for unusual activity

### 3. Authentication Headers

Every API request must include the authentication header:

```http
Authorization: AccessKey your-access-key-here
Accept: application/json
Content-Type: application/json
```

## Implementation Examples

### Node.js/TypeScript

```typescript
// Environment configuration
const BIRD_API_KEY = process.env.BIRD_API_KEY;
const BIRD_BASE_URL = 'https://api.bird.com';

// HTTP client configuration
const birdApiClient = axios.create({
  baseURL: BIRD_BASE_URL,
  headers: {
    'Authorization': `AccessKey ${BIRD_API_KEY}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Example API call
async function getBirdContacts() {
  try {
    const response = await birdApiClient.get('/contacts');
    return response.data;
  } catch (error) {
    console.error('Authentication failed:', error.response?.status);
    throw error;
  }
}
```

### Fetch API

```javascript
// Authentication utility
function createBirdApiRequest(endpoint, options = {}) {
  const headers = {
    'Authorization': `AccessKey ${process.env.BIRD_API_KEY}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...options.headers
  };

  return fetch(`https://api.bird.com${endpoint}`, {
    ...options,
    headers
  });
}

// Usage example
async function sendMessage(channelId, message) {
  const response = await createBirdApiRequest('/channels/messages', {
    method: 'POST',
    body: JSON.stringify({
      channelId,
      message
    })
  });

  if (!response.ok) {
    throw new Error(`Authentication failed: ${response.status}`);
  }

  return response.json();
}
```

## Security Best Practices

### 1. Access Key Security

- **Never commit keys to version control**
- **Use environment variables in production**
- **Implement key rotation policies**
- **Monitor key usage patterns**
- **Set up access key alerts**

### 2. Network Security

- **Always use HTTPS**
- **Implement request signing for sensitive operations**
- **Use VPN for internal API calls**
- **Implement IP whitelisting when possible**

### 3. Error Handling

```typescript
// Comprehensive error handling
async function authenticatedRequest(endpoint: string, options: RequestOptions) {
  try {
    const response = await birdApiClient.request({
      url: endpoint,
      ...options
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // Authentication failed
      console.error('Invalid or expired access key');
      throw new Error('Authentication failed');
    } else if (error.response?.status === 403) {
      // Insufficient permissions
      console.error('Insufficient permissions for this operation');
      throw new Error('Access denied');
    } else if (error.response?.status === 429) {
      // Rate limit exceeded
      console.error('Rate limit exceeded');
      throw new Error('Rate limit exceeded');
    } else {
      // Other errors
      console.error('API request failed:', error.message);
      throw error;
    }
  }
}
```

## Medical Practice Considerations

### 1. HIPAA Compliance

- **Audit Logging**: Log all API access for compliance
- **Data Encryption**: Ensure all patient data is encrypted
- **Access Control**: Implement role-based access to API keys
- **Data Retention**: Follow medical data retention policies

### 2. Multi-Environment Setup

```typescript
// Environment-specific configuration
interface BirdConfig {
  apiKey: string;
  baseUrl: string;
  environment: 'development' | 'staging' | 'production';
}

const birdConfig: BirdConfig = {
  apiKey: process.env.BIRD_API_KEY!,
  baseUrl: process.env.BIRD_BASE_URL || 'https://api.bird.com',
  environment: process.env.NODE_ENV as 'development' | 'staging' | 'production'
};

// Validate configuration
if (!birdConfig.apiKey) {
  throw new Error('BIRD_API_KEY environment variable is required');
}
```

### 3. Integration with Medical Systems

```typescript
// Medical system integration example
class MedicalBirdApiClient {
  private client: AxiosInstance;
  
  constructor(config: BirdConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Authorization': `AccessKey ${config.apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor for audit logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle authentication failure
          this.handleAuthenticationFailure();
        }
        return Promise.reject(error);
      }
    );
  }

  private handleAuthenticationFailure() {
    // Implement authentication failure handling
    console.error('Bird API authentication failed');
    // Could trigger key rotation or admin notification
  }
}
```

## Troubleshooting Authentication

### Common Issues

1. **Invalid Access Key**
   - Verify key is correct
   - Check for extra spaces or characters
   - Ensure key hasn't expired

2. **Missing Authorization Header**
   - Verify header format: `Authorization: AccessKey <key>`
   - Check for typos in header name

3. **Rate Limit Exceeded**
   - Implement exponential backoff
   - Review rate limit documentation
   - Consider upgrading API plan

4. **Network Issues**
   - Verify HTTPS connectivity
   - Check firewall settings
   - Test with curl or similar tool

### Debug Authentication

```bash
# Test authentication with curl
curl -X GET "https://api.bird.com/contacts" \
  -H "Authorization: AccessKey your-access-key-here" \
  -H "Accept: application/json"
```

## Monitoring and Maintenance

### 1. Access Key Rotation

```typescript
// Access key rotation utility
class BirdKeyRotation {
  private currentKey: string;
  private newKey: string;
  
  async rotateKey(): Promise<void> {
    // 1. Generate new key through Bird API or dashboard
    // 2. Update application configuration
    // 3. Test new key
    // 4. Deactivate old key
    // 5. Update monitoring systems
  }
}
```

### 2. Usage Monitoring

```typescript
// API usage monitoring
class BirdApiMonitor {
  private metrics: Map<string, number> = new Map();
  
  recordRequest(endpoint: string): void {
    const count = this.metrics.get(endpoint) || 0;
    this.metrics.set(endpoint, count + 1);
  }
  
  getUsageReport(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}
```

## Integration with DRAD System

### Configuration Management

```typescript
// DRAD-specific Bird API configuration
interface DradBirdConfig {
  apiKey: string;
  webhookSecret: string;
  defaultChannels: string[];
  medicalCompliance: {
    auditLogging: boolean;
    dataEncryption: boolean;
    retentionPeriod: number;
  };
}

const dradBirdConfig: DradBirdConfig = {
  apiKey: process.env.BIRD_API_KEY!,
  webhookSecret: process.env.BIRD_WEBHOOK_SECRET!,
  defaultChannels: ['whatsapp', 'sms'],
  medicalCompliance: {
    auditLogging: true,
    dataEncryption: true,
    retentionPeriod: 2555 // 7 years in days
  }
};
```

## Next Steps

1. **Set up development environment**: Configure API keys and test authentication
2. **Implement production security**: Set up secure key management
3. **Configure monitoring**: Set up usage tracking and alerts
4. **Test integration**: Verify authentication with all required endpoints
5. **Document procedures**: Create operational procedures for key management

## References

- [Bird.com API Documentation](https://docs.bird.com/api)
- [Bird.com Common API Usage](https://docs.bird.com/api/api-access/common-api-usage)
- [Channels API Guide](./bird-channels-api.md)
- [Webhooks Authentication](./bird-webhooks.md)