import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { ErrorResponse } from '../api/types.js';

// Custom error class for API errors
export class ApiError extends Error {
  statusCode: number;
  details?: Array<Record<string, unknown>>;

  constructor(message: string, statusCode = 500, details?: Array<Record<string, unknown>>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  // Default error values
  let statusCode = 500;
  let errorMessage = 'Internal Server Error';
  let errorCode = 'server_error';
  let details;

  // Handle known API errors
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    errorMessage = err.message;
    errorCode = `error_${statusCode}`;
    details = err.details;

    // Log error with appropriate level
    if (statusCode >= 500) {
      logger.error({ err, statusCode }, errorMessage);
    } else {
      logger.warn({ err, statusCode }, errorMessage);
    }
  } else {
    // Unknown error - always log as error
    logger.error({ err }, errorMessage);
  }

  // Create error response
  const errorResponse: ErrorResponse = {
    error: errorCode,
    message: errorMessage,
  };

  // Add details if available
  if (details) {
    errorResponse.details = details;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};
