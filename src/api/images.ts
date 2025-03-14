import { Router, Request, Response, NextFunction } from 'express';
import { uploadMiddleware, processUpload, handleUploadErrors } from '../services/upload.js';
import { scaleImage } from '../services/scale.js';
import { ApiError } from '../middleware/error-handler.js';
import { logger } from '../utils/logger.js';
import { FileUpload } from './types.js';

// Create router
const router = Router();

// We now perform validation manually in the route handler

// Error handling middleware for file upload
const uploadErrorHandler = (err: Error, _req: Request, _res: Response, next: NextFunction) => {
  try {
    handleUploadErrors(err);
  } catch (error) {
    next(error);
  }
};

// Route handler for scaling images
router.post(
  '/scale',
  // Apply upload middleware with error handling
  (req: Request, res: Response, next: NextFunction) => {
    try {
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
          return uploadErrorHandler(err, req, res, next);
        }
        logger.debug('Upload middleware processed successfully');
        next();
      });
    } catch (error) {
      logger.error(
        `Unexpected error in upload middleware: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      next(error);
    }
  },
  // Process the uploaded file
  processUpload,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if file was uploaded (should be added by processUpload)
      if (!req.file) {
        throw new ApiError('No image file uploaded', 400);
      }

      // Validate and extract parameters from form data
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

      // Get the file from the request
      const file: FileUpload = req.file as FileUpload;

      logger.info(`Processing image: ${file.originalname} (${file.size} bytes)`);

      // Scale and convert the image
      const processedImage = await scaleImage(file, {
        width,
        quality,
      });

      // Log processing details
      logger.info(`Image processed: ${file.originalname} → WebP (${processedImage.length} bytes)`);

      // Set response headers
      res.set({
        'Content-Type': 'image/webp',
        'Content-Length': processedImage.length,
      });

      // Send the processed image
      res.send(processedImage);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
