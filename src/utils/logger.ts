import { config } from '../config.js';

// Simple logger that outputs to console
export const logger = {
  level: config.logLevel,
  info: (message: string | object, ...args: unknown[]) => {
    console.info(new Date().toISOString(), message, ...args);
  },
  error: (message: string | object, ...args: unknown[]) => {
    console.error(new Date().toISOString(), message, ...args);
  },
  warn: (message: string | object, ...args: unknown[]) => {
    console.warn(new Date().toISOString(), message, ...args);
  },
  debug: (message: string | object, ...args: unknown[]) => {
    if (config.logLevel === 'debug') {
      console.debug(new Date().toISOString(), message, ...args);
    }
  },
};
