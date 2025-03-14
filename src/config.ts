// Get current environment
const nodeEnv = process.env.NODE_ENV || 'development';

/**
 * Determine the appropriate log level based on environment
 * and LOG_LEVEL environment variable
 */
function getLogLevel(): string {
  // If LOG_LEVEL is explicitly set, use that value
  const envLogLevel = process.env.LOG_LEVEL;
  if (envLogLevel) {
    switch (envLogLevel.toLowerCase()) {
      case 'fatal':
      case 'error':
      case 'warn':
      case 'info':
      case 'debug':
      case 'trace':
        return envLogLevel.toLowerCase();
      default:
        console.warn(`Invalid LOG_LEVEL "${envLogLevel}", falling back to "info"`);
        return 'info';
    }
  }

  // Otherwise, determine based on environment
  switch (nodeEnv) {
    case 'production':
      return 'info';
    case 'test':
      return 'warn';
    case 'development':
    default:
      return 'debug';
  }
}

// Configuration settings for the application
export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  nodeEnv,
  logLevel: getLogLevel(),
  maxFileSize: process.env.MAX_FILE_SIZE
    ? parseInt(process.env.MAX_FILE_SIZE, 10)
    : 20 * 1024 * 1024, // 20MB
};
