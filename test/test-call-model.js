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

  it('Config.loadModels() loads 12 models', () => {
    const config = new Config();
    const models = config.loadModels();
    const keys = Object.keys(models);
    assert.equal(keys.length, 12, `Expected 12 models, got ${keys.length}: ${keys.join(', ')}`);
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
    assert.equal(models.preset.length, 12, `Expected 12 preset models, got ${models.preset.length}`);
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

  it('scenario: smoke test covers all models with responses', async () => {
    const ai = new AI();
    const expectedCount = Object.keys(new Config().loadModels()).length;
    const results = await ai.checkModels(null, { probe: true });

    assert.equal(results.length, expectedCount, `Expected ${expectedCount} results, got ${results.length}`);
    for (const r of results) {
      assert.ok(r.alias, 'should have alias');
      assert.ok(r.role, 'should have role');
      assert.equal(typeof r.available, 'boolean', 'available should be boolean');
      assert.equal(typeof r.latencyMs, 'number', 'latencyMs should be a number');
      if (r.available) {
        assert.ok(r.content, `${r.alias} should have response content`);
        assert.ok(r.content.length > 0, `${r.alias} content should not be empty`);
      }
    }

    const reachable = results.filter(r => r.available);
    const withContent = reachable.filter(r => r.content && r.content.length > 0);
    console.log(`\n  Smoke test: ${reachable.length}/${expectedCount} reachable, ${withContent.length}/${expectedCount} generated text`);
    for (const r of results) {
      const status = r.available ? 'OK' : 'FAIL';
      const response = r.available ? `"${r.content}"` : (r.error || '');
      const latency = r.available ? `${r.latencyMs}ms` : '-';
      console.log(`    ${r.alias.padEnd(22)} ${r.role.padEnd(10)} ${status.padEnd(6)} ${response.slice(0, 40).padEnd(42)} ${latency}`);
    }
    assert.ok(reachable.length > 0, 'at least 1 model should be reachable');
  }, { timeout: 120000 });

  it('scenario: health check covers all 12 models', async () => {
    const ai = new AI();
    const results = await ai.checkModels();

    assert.equal(results.length, 12, `Expected 12 results, got ${results.length}`);
    for (const r of results) {
      assert.ok(r.alias, 'should have alias');
      assert.equal(typeof r.available, 'boolean', 'available should be boolean');
      assert.equal(typeof r.latencyMs, 'number', 'latencyMs should be a number');
    }

    const available = results.filter(r => r.available);
    console.log(`\n  Health check: ${available.length}/${results.length} models available\n`);
    console.log(`    ${'Alias'.padEnd(22)} ${'Role'.padEnd(10)} ${'Status'.padEnd(8)} Latency`);
    console.log(`    ${'-'.repeat(56)}`);
    for (const r of results) {
      const status = r.available ? 'OK' : 'FAIL';
      const latency = r.available ? `${r.latencyMs}ms` : (r.error ? r.error.slice(0, 30) : '-');
      console.log(`    ${r.alias.padEnd(22)} ${r.role.padEnd(10)} ${status.padEnd(8)} ${latency}`);
    }
    assert.ok(available.length > 0, 'at least 1 model should be reachable');
  }, { timeout: 120000 });
});
