import { Router, Request, Response, NextFunction } from 'express';
import { uploadFileAsync, processUploadAsync, parseScalingParams } from '../services/upload.js';
import { scaleImage } from '../services/scale.js';
import { logger } from '../utils/logger.js';

// Create router
const router = Router();
/**
 * Main image scaling handler that coordinates the process
 */
const handleImageScaling = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Step 1: Handle file upload with multipart processing
    await uploadFileAsync(req, res);

    // Step 2: Process and validate the uploaded file
    const file = await processUploadAsync(req);

    // Step 3: Parse and validate scaling parameters
    const params = parseScalingParams(req);

    // Step 4: Log processing start
    logger.info(`Processing image: ${file.originalname} (${file.size} bytes)`);

    // Step 5: Scale and convert the image
    const processedImage = await scaleImage(file, params);

    // Set response headers
    res.set({
      'Content-Type': 'image/webp',
      'Content-Length': processedImage.length,
    });

    // Send the processed image
    res.send(processedImage);
  } catch (error) {
    // Pass any errors to the error handling middleware
    logger.error(
      `Error in image scaling: ${error instanceof Error ? error.message : 'unknown error'}`,
    );
    next(error);
  }
};

// Register the route
router.post('/scale', handleImageScaling);

export default router;
