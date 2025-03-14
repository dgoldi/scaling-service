import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { logger } from './utils/logger.js';
import { requestLogger } from './middleware/logging.js';
import { errorHandler } from './middleware/error-handler.js';
import apiRoutes from './api/index.js';
import { setupSwaggerUi } from './api/openapi.js';

// Create Express application
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Add support for urlencoded form data
app.use(requestLogger);

// Set up Swagger UI
setupSwaggerUi(app);

// Content type middleware to log the content type
app.use((req, _res, next) => {
  const contentType = req.headers['content-type'] || '';

  // Log the content type for debugging
  logger.debug(`Request to ${req.path} with Content-Type: ${contentType}`);
  next();
});

// API routes
app.use('/', apiRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Only start the server if this file is run directly
// This prevents the server from starting during tests
if (import.meta.url.startsWith('file:')) {
  const modulePath = process.argv[1] ? new URL(`file://${process.argv[1]}`) : null;
  const isDirectRun = modulePath && import.meta.url === modulePath.href;

  if (isDirectRun) {
    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      logger.info(`API documentation available at http://localhost:${config.port}/api-docs`);
    });

    // Handle graceful shutdown
    const gracefulShutdown = () => {
      logger.info('Shutting down server...');
      server.close(() => {
        logger.info('Server shut down successfully');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forcing server shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Listen for shutdown signals
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
  }
}

export default app;
