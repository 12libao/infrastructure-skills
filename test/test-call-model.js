/**
 * Tests for call-model skill (lib/ai.js)
 *
 * Unit tests: Config, AI constructor, CLI help
 * Integration tests: real API calls (skipped without API key)
 */

import { execSync } from 'child_process';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { AI, Config } from '../lib/ai.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function hasApiKey() {
  const config = new Config();
  return !!config.get('YUNWU_API_KEY');
}

// ============================================================================
// Unit tests (no API calls)
// ============================================================================

describe('call-model: unit', () => {

  it('Config.loadModels() loads 9 models', () => {
    const config = new Config();
    const models = config.loadModels();
    const keys = Object.keys(models);
    assert.equal(keys.length, 9, `Expected 9 models, got ${keys.length}: ${keys.join(', ')}`);
  });

  it('Config.getModel("claude-opus-4-6") returns correct config', () => {
    const config = new Config();
    const model = config.getModel('claude-opus-4-6');
    assert.ok(model, 'claude-opus-4-6 should exist');
    assert.equal(model.name, 'claude-opus-4-6');
    assert.equal(model.role, 'racer');
  });

  it('Config.getModel("nonexistent") returns null', () => {
    const config = new Config();
    const model = config.getModel('nonexistent');
    assert.equal(model, null);
  });

  it('Config.get() prioritizes process.env over default', () => {
    const config = new Config();
    const key = '__TEST_CONFIG_KEY__';
    process.env[key] = 'from_env';
    try {
      assert.equal(config.get(key, 'default_value'), 'from_env');
    } finally {
      delete process.env[key];
    }
    assert.equal(config.get(key, 'default_value'), 'default_value');
  });

  it('AI constructor does not throw', () => {
    const ai = new AI();
    assert.ok(ai);
    assert.ok(ai.config instanceof Config);
  });

  it('CLI help exits 0 and shows usage', () => {
    const output = execSync('node lib/ai.js help', { encoding: 'utf-8', cwd: ROOT });
    assert.ok(output.includes('call'), 'help should mention "call" command');
    assert.ok(output.includes('list'), 'help should mention "list" command');
  });
});

// ============================================================================
// Integration tests (real API calls — skipped without API key)
// ============================================================================

describe('call-model: integration', { skip: !hasApiKey() ? 'No API key configured' : false }, () => {

  it('scenario: call external model to answer a question', async () => {
    const ai = new AI();
    const result = await ai.call('claude-opus-4-6', 'Reply with exactly: TEST_OK');
    assert.ok(result.content, 'response should have content');
    assert.ok(result.content.length > 0, 'content should not be empty');
    assert.ok(result.model, 'response should have model name');
    assert.ok(result.elapsed, 'response should have elapsed time');
  });

  it('scenario: list all available models', async () => {
    const ai = new AI();
    const models = await ai.listModels();
    assert.ok(Array.isArray(models.preset), 'preset should be an array');
    assert.equal(models.preset.length, 9, `Expected 9 preset models, got ${models.preset.length}`);
    assert.ok(Array.isArray(models.available), 'available should be an array');
    // Verify preset model structure
    const claude = models.preset.find(m => m.alias === 'claude-opus-4-6');
    assert.ok(claude, 'claude-opus-4-6 should be in preset');
    assert.equal(claude.name, 'claude-opus-4-6');
  });

  it('scenario: call a different model (claude-opus-4-5)', async () => {
    const ai = new AI();
    const result = await ai.call('claude-opus-4-5', 'Reply with exactly: TEST_OK');
    assert.ok(result.content, 'response should have content');
    assert.ok(result.content.length > 0, 'content should not be empty');
  });

  it('scenario: CLI call command works end-to-end', () => {
    const output = execSync('node lib/ai.js call claude-opus-4-6 "Reply with: OK"', {
      encoding: 'utf-8',
      cwd: ROOT,
      timeout: 60000
    });
    assert.ok(output.length > 0, 'CLI should produce output');
  });
});
