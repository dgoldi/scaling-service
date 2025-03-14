import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

// Simple request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Skip logging for health check requests
  if (req.path.includes('/health')) {
    return next();
  }

  const start = Date.now();

  // Log when the request completes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    const logMessage = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    };

    if (logLevel === 'error') {
      logger.error(logMessage);
    } else if (logLevel === 'warn') {
      logger.warn(logMessage);
    } else {
      logger.info(logMessage);
    }
  });

  next();
};
