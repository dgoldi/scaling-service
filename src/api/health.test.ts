import { describe, it } from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import app from '../index.js';

describe('Health Endpoint', () => {
  it('should return a 200 status code', async () => {
    const response = await supertest(app).get('/health');
    assert.strictEqual(response.status, 200);
  });

  it('should return a valid health response object', async () => {
    const response = await supertest(app).get('/health');

    assert.strictEqual(response.body.status, 'ok');
    assert.strictEqual(typeof response.body.timestamp, 'string');
    assert.strictEqual(typeof response.body.uptime, 'number');
  });
});
