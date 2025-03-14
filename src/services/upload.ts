import fileUpload from 'express-fileupload';
import { Request, Response } from 'express';
import { ApiError } from '../middleware/error-handler.js';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import { FileUpload, ImageScaleRequest } from '../api/types.js';

// Create fileUpload middleware configuration (internal use only)
const uploadMiddleware = fileUpload({
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

/**
 * Process the uploaded file and convert to our FileUpload type (Promise version)
 */
export const processUploadAsync = async (req: Request): Promise<FileUpload> => {
  // Log information about the request for debugging
  logger.debug(`Processing upload. Content-Type: ${req.headers['content-type']}`);

  // Check if any files were uploaded
  if (!req.files || Object.keys(req.files).length === 0) {
    throw new ApiError('No image file uploaded', 400);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const files = req.files as Record<string, any>;
  logger.debug(`Available file fields: ${Object.keys(files).join(', ')}`);
  const uploadedFile = files.image;

  if (!uploadedFile) {
    throw new ApiError('No image field found in upload', 400);
  }

  if (Array.isArray(uploadedFile)) {
    throw new ApiError('Only one image file can be processed at a time', 400);
  }

  if (!uploadedFile.mimetype.startsWith('image/')) {
    throw new ApiError(
      `Unsupported file type: ${uploadedFile.mimetype}. Only image files are allowed.`,
      415,
    );
  }

  const file: FileUpload = {
    fieldname: 'image',
    originalname: uploadedFile.name,
    encoding: 'binary',
    mimetype: uploadedFile.mimetype,
    buffer: uploadedFile.data,
    size: uploadedFile.size,
  };

  return file;
};

/**
 * Handle file uploads asynchronously with content type validation
 */
export const uploadFileAsync = async (req: Request, res: Response): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Verify that the content type is multipart/form-data
    const contentType = req.headers['content-type'] || '';
    logger.debug(`Request content type: ${contentType}`);

    if (!contentType.includes('multipart/form-data')) {
      logger.warn('Content-Type is not multipart/form-data');
      // Continue anyway, let's see if we can process it
    }

    // Apply the file upload middleware
    uploadMiddleware(req, res, (err) => {
      if (err) {
        logger.error(`Upload middleware error: ${err.message}`);
        try {
          // Process the error through our handler
          handleUploadErrors(err);
        } catch (processedError) {
          reject(processedError);
          return;
        }
        reject(err); // This will only run if handleUploadErrors doesn't throw
      } else {
        logger.debug('Upload middleware processed successfully');
        resolve();
      }
    });
  });
};

/**
 * Parse and validate image scaling parameters from request
 */
export const parseScalingParams = (req: Request): ImageScaleRequest => {
  let width: number | undefined = undefined;
  let quality: number | undefined = undefined;

  // Handle width parameter
  if (req.body.width) {
    const widthValue = parseInt(req.body.width, 10);
    if (isNaN(widthValue) || widthValue < 1 || widthValue > 10000) {
      throw new ApiError('Width must be between 1 and 10000 pixels', 400);
    }
    width = widthValue;
  }

  // Handle quality parameter
  if (req.body.quality) {
    const qualityValue = parseInt(req.body.quality, 10);
    if (isNaN(qualityValue) || qualityValue < 1 || qualityValue > 100) {
      throw new ApiError('Quality must be between 1 and 100', 400);
    }
    quality = qualityValue;
  }

  return { width, quality };
};

// Handle upload errors (internal use only)
const handleUploadErrors = (err: Error | unknown) => {
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
