import { describe, it } from 'node:test';
import assert from 'node:assert';
import { config } from './config.js';

describe('Config', () => {
  it('should have default values', () => {
    assert.strictEqual(typeof config.port, 'number');
    assert.strictEqual(typeof config.nodeEnv, 'string');
    assert.strictEqual(typeof config.logLevel, 'string');
    assert.strictEqual(typeof config.maxFileSize, 'number');
  });
});
