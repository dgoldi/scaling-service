// Type definitions for the API

// File upload with image file
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

// Extend Express Request interface to include file property
import 'express';
declare module 'express' {
  interface Request {
    file?: FileUpload;
  }
}

// Health check response
export interface HealthResponse {
  status: 'ok';
  timestamp: string;
  version?: string;
  uptime?: number;
}

// Error response
export interface ErrorResponse {
  error: string;
  message: string;
  details?: Array<Record<string, unknown>>;
}

// Image scaling request
export interface ImageScaleRequest {
  width?: number;
  quality?: number;
}
