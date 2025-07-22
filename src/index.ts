import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';

// Load environment variables
dotenv.config();

import { logger } from './utils/logger';
import { connectDatabase } from './config/database';
import { setupRedis } from './config/redis';
import { initializeQueues } from './services/queue';

// Import routes
import webhookRoutes from './routes/webhooks';
import agentRoutes from './routes/agents';
import hubspotRoutes from './routes/hubspot';
import calendarRoutes from './routes/calendar';
import healthRoutes from './routes/health';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Security and middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/webhooks', webhookRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/hubspot', hubspotRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/health', healthRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'UrbanHub AI Agents API',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.originalUrl
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Initialize services and start server
async function startServer() {
  try {
    // Initialize database connection
    await connectDatabase();
    logger.info('Database connected successfully');

    // Initialize Redis connection
    await setupRedis();
    logger.info('Redis connected successfully');

    // Initialize job queues
    await initializeQueues();
    logger.info('Job queues initialized');

    // Start the server
    server.listen(PORT, () => {
      logger.info(`UrbanHub AI Agents API server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;