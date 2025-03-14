import fileUpload from 'express-fileupload';
import { Request, NextFunction } from 'express';
import { ApiError } from '../middleware/error-handler.js';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import { FileUpload } from '../api/types.js';

// Create fileUpload middleware configuration
export const uploadMiddleware = fileUpload({
  limits: {
    fileSize: config.maxFileSize, // From config (default: 20MB)
  },
  abortOnLimit: true,
  useTempFiles: false,
  debug: config.nodeEnv === 'development',
  // More conservative parsing settings
  createParentPath: false,
  preserveExtension: true,
  safeFileNames: true,
});

// Process the uploaded file and convert to our FileUpload type
export const processUpload = (req: Request, _res: unknown, next: NextFunction) => {
  try {
    // Log information about the request for debugging
    logger.debug(`Processing upload. Content-Type: ${req.headers['content-type']}`);
    logger.debug(`Files received: ${req.files ? Object.keys(req.files).join(', ') : 'none'}`);
    logger.debug(`Body fields: ${Object.keys(req.body || {}).join(', ')}`);

    // Check if any files were uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      throw new ApiError('No image file uploaded', 400);
    }

    // Get the uploaded file (assuming 'image' field name)
    // Cast req.files to Record to avoid TypeScript errors with the declaration file
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const files = req.files as Record<string, any>;
    logger.debug(`Available file fields: ${Object.keys(files).join(', ')}`);
    const uploadedFile = files.image;

    if (!uploadedFile) {
      throw new ApiError('No image field found in upload', 400);
    }

    // Handle case where multiple files are uploaded
    if (Array.isArray(uploadedFile)) {
      throw new ApiError('Only one image file can be processed at a time', 400);
    }

    // Check file type
    if (!uploadedFile.mimetype.startsWith('image/')) {
      throw new ApiError(
        `Unsupported file type: ${uploadedFile.mimetype}. Only image files are allowed.`,
        415,
      );
    }

    // Convert to our FileUpload interface
    const file: FileUpload = {
      fieldname: 'image',
      originalname: uploadedFile.name,
      encoding: 'binary',
      mimetype: uploadedFile.mimetype,
      buffer: uploadedFile.data,
      size: uploadedFile.size,
    };

    // Attach to request for the next middleware
    req.file = file;
    next();
  } catch (error) {
    next(error);
  }
};

// Handle upload errors
export const handleUploadErrors = (err: Error | unknown) => {
  // Check if it's a file size limit error from express-fileupload
  if (err instanceof Error && err.message.includes('File size limit')) {
    throw new ApiError(
      `File too large. Maximum file size is ${config.maxFileSize / (1024 * 1024)}MB.`,
      413,
    );
  }

  // Handle Busboy errors
  if (
    err instanceof Error &&
    (err.message.includes('Unexpected end of form') ||
      err.message.includes('Multipart: Boundary not found'))
  ) {
    logger.error(`Upload parsing error: ${err.message}`);
    throw new ApiError('Error parsing multipart form data. Please check your request format.', 400);
  }

  // Log and rethrow other errors
  if (err instanceof Error) {
    logger.error(`Upload error: ${err.message}`);
    throw new ApiError(`Upload failed: ${err.message}`, 400);
  }

  // Unknown error
  throw err;
};
