import { describe, it } from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import path from 'node:path';
import fs from 'node:fs';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import sharp from 'sharp';
import app from '../index.js';

describe('Image Scaling API', () => {
  it('should successfully scale an image with quality 100', async () => {
    const testImagePath = path.resolve(process.cwd(), 'tests/test.JPG');

    const fileExists = fs.existsSync(testImagePath);
    assert.strictEqual(fileExists, true, 'Test image file should exist');

    const response = await supertest(app)
      .post('/images/scale')
      .attach('image', testImagePath)
      .field('quality', '100');

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.headers['content-type'], 'image/webp');

    assert.ok(response.body instanceof Buffer);
    assert.ok(response.body.length > 0, 'Response should contain image data');
  });

  it('should produce an image matching the reference image', async () => {
    const testImagePath = path.resolve(process.cwd(), 'tests/test.JPG');
    const refImagePath = path.resolve(process.cwd(), 'tests/reference.png');

    // Create reference image if it doesn't exist
    if (!fs.existsSync(refImagePath)) {
      // Process using the same parameters we'll test
      const inputBuffer = fs.readFileSync(testImagePath);
      // First convert to webp with the parameters
      const webpBuffer = await sharp(inputBuffer).resize(500).webp({ quality: 80 }).toBuffer();

      // Then convert webp to PNG for pixelmatch (which works with PNG)
      const pngBuffer = await sharp(webpBuffer).png().toBuffer();

      fs.writeFileSync(refImagePath, pngBuffer);
    }

    // Run the API to get the processed image
    const response = await supertest(app)
      .post('/images/scale')
      .attach('image', testImagePath)
      .field('quality', '80')
      .field('width', '500');

    // Convert response image (webp) to PNG for comparison
    const processedImagePng = await sharp(response.body).png().toBuffer();

    // Load PNGs for comparison
    const img1 = PNG.sync.read(processedImagePng);
    const img2 = PNG.sync.read(fs.readFileSync(refImagePath));

    const { width, height } = img1;
    const diff = new PNG({ width, height });

    // Compare images - returns number of pixels that differ
    const numDiffPixels = pixelmatch(
      img1.data,
      img2.data,
      diff.data,
      width,
      height,
      { threshold: 0.1 }, // Threshold for color difference (0 to 1)
    );

    // Calculate percentage difference
    const totalPixels = width * height;
    const diffPercentage = (numDiffPixels / totalPixels) * 100;

    // Assert that the images are similar (less than 1% difference)
    assert.ok(
      diffPercentage < 1,
      `Images differ by ${diffPercentage.toFixed(2)}% of pixels, which exceeds the threshold`,
    );
  });

  it('should scale image to the requested width', async () => {
    const testImagePath = path.resolve(process.cwd(), 'tests/test.JPG');
    const requestedWidth = 500;

    const response = await supertest(app)
      .post('/images/scale')
      .attach('image', testImagePath)
      .field('width', requestedWidth.toString());

    // Get image metadata to verify width
    const metadata = await sharp(response.body).metadata();

    assert.strictEqual(
      metadata.width,
      requestedWidth,
      'Image should be scaled to the requested width',
    );
  });
});
