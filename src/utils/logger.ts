import winston from 'winston';
import path from 'path';

const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta, null, 2)}`;
    }
    return msg;
  })
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'urbanhub-ai-agents',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
      format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: path.join('logs', 'app.log'),
      level: 'info',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      format: logFormat
    }),
    
    // Separate file for errors
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 3,
      format: logFormat
    })
  ],
  
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'exceptions.log'),
      format: logFormat
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'rejections.log'),
      format: logFormat
    })
  ]
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Add request logging helper
export const logRequest = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    });
  });
  
  next();
};

// Bird.com API logging helper
export const logBirdApiCall = (
  method: string,
  endpoint: string,
  duration: number,
  statusCode: number,
  success: boolean
) => {
  logger.info('Bird API Call', {
    method,
    endpoint,
    duration: `${duration}ms`,
    statusCode,
    success,
    service: 'bird-api'
  });
};

// HubSpot API logging helper
export const logHubSpotApiCall = (
  method: string,
  endpoint: string,
  duration: number,
  statusCode: number,
  success: boolean
) => {
  logger.info('HubSpot API Call', {
    method,
    endpoint,
    duration: `${duration}ms`,
    statusCode,
    success,
    service: 'hubspot-api'
  });
};

// Conversation logging helper
export const logConversation = (
  conversationId: string,
  contactId: string,
  agentType: string,
  event: string,
  metadata?: any
) => {
  logger.info('Conversation Event', {
    conversationId,
    contactId,
    agentType,
    event,
    ...metadata,
    service: 'conversation'
  });
};

// Business metrics logging helper
export const logBusinessMetric = (
  metric: string,
  value: number,
  unit: string,
  metadata?: any
) => {
  logger.info('Business Metric', {
    metric,
    value,
    unit,
    ...metadata,
    service: 'metrics'
  });
};

// Error logging with context
export const logError = (
  error: Error,
  context: string,
  metadata?: any
) => {
  logger.error('Application Error', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    context,
    ...metadata
  });
};

export default logger;