import { Router, Request, Response } from 'express';
import { HealthResponse } from './types.js';

// Create a new router
const router = Router();

// Get the start time of the server
const startTime = Date.now();

/**
 * GET /health
 * Health check endpoint that returns the status of the server
 */
router.get('/', (_req: Request, res: Response) => {
  const healthResponse: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    version: process.env.npm_package_version,
  };

  res.status(200).json(healthResponse);
});

export default router;
