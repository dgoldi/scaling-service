import sharp from 'sharp';
import { logger } from '../utils/logger.js';
import { ApiError } from '../middleware/error-handler.js';
import { FileUpload, ImageScaleRequest } from '../api/types.js';

/**
 * Scale and convert an image to WebP format
 */
export const scaleImage = async (
  file: FileUpload,
  options: ImageScaleRequest = {},
): Promise<Buffer> => {
  try {
    // Set default quality if not provided
    const quality = options.quality ?? 80;

    // Start with the image processing pipeline
    let imageProcessor = sharp(file.buffer);

    // Get image metadata
    const metadata = await imageProcessor.metadata();

    // Log image details
    logger.debug(
      `Processing image: ${file.originalname}, format: ${metadata.format}, size: ${file.size} bytes`,
    );

    // Apply resizing if width is specified
    if (options.width) {
      logger.debug(`Resizing image to width: ${options.width}px`);

      imageProcessor = imageProcessor.resize({
        width: options.width,
        withoutEnlargement: true, // Don't enlarge small images
      });
    }

    // Apply optimizations for large images
    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      logger.debug('Applying optimizations for large image');
      // Apply optimizations for large images
      imageProcessor = imageProcessor.timeout({ seconds: 60 }); // Increase timeout for large images
    }

    // Convert to WebP with specified quality
    const outputBuffer = await imageProcessor.webp({ quality }).toBuffer();

    logger.info(`Image processed successfully. Output size: ${outputBuffer.length} bytes`);

    return outputBuffer;
  } catch (error) {
    // Handle Sharp errors
    if (error instanceof Error) {
      logger.error(`Image processing error: ${error.message}`);
      throw new ApiError(`Failed to process image: ${error.message}`, 500);
    }

    // Unknown error
    throw error;
  }
};
