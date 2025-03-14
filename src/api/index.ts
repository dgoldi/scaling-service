import { Router } from 'express';
import healthRouter from './health.js';
import imagesRouter from './images.js';

// Create main router
const router = Router();

// Register route handlers
router.use('/health', healthRouter);
router.use('/images', imagesRouter);

export default router;
