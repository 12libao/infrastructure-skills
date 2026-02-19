/**
 * Tests for race-optimize skill (lib/race.js)
 *
 * Unit tests: scene detection, prompt loading, criteria, Race defaults, CLI
 * Integration tests: full pipeline on bubble-sort.py (skipped without API key)
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, rmSync } from 'fs';
import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Config } from '../lib/ai.js';
import { Race, SCENES, detectScene } from '../lib/race.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function hasApiKey() {
  const config = new Config();
  return !!config.get('YUNWU_API_KEY');
}

// ============================================================================
// Unit tests (no API calls)
// ============================================================================

describe('race-optimize: unit', () => {

  // --- Scene detection ---

  it('detectScene: .py file → code-performance', () => {
    assert.equal(detectScene('sort.py', 'faster execution'), 'code-performance');
  });

  it('detectScene: YAGNI keyword → code-refactor', () => {
    assert.equal(detectScene('sort.py', 'YAGNI refactor'), 'code-refactor');
  });

  it('detectScene: refactor keyword → code-refactor', () => {
    assert.equal(detectScene('utils.js', 'simplify and refactor'), 'code-refactor');
  });

  it('detectScene: prompt keyword → prompt', () => {
    assert.equal(detectScene('prompt.md', 'improve'), 'prompt');
  });

  it('detectScene: .md file → text (default)', () => {
    assert.equal(detectScene('readme.md', 'more clear'), 'text');
  });

  // --- SCENES configuration ---

  it('SCENES has 4 complete scenes', () => {
    const sceneNames = Object.keys(SCENES);
    assert.equal(sceneNames.length, 4);
    assert.ok(sceneNames.includes('code-performance'));
    assert.ok(sceneNames.includes('code-refactor'));
    assert.ok(sceneNames.includes('prompt'));
    assert.ok(sceneNames.includes('text'));

    for (const [key, scene] of Object.entries(SCENES)) {
      assert.ok(scene.name, `${key} should have name`);
      assert.ok(Array.isArray(scene.strategies), `${key} should have strategies array`);
      assert.equal(scene.strategies.length, 5, `${key} should have 5 strategies`);
      assert.ok(scene.defaultCriteria, `${key} should have defaultCriteria`);
    }
  });

  // --- Prompt files ---

  it('all 5 prompt files exist', () => {
    const promptDir = join(ROOT, 'skills', 'race-optimize', 'prompts');
    const files = ['generate.md', 'review.md', 'synthesize.md', 'adversarial.md', 'score.md'];
    for (const f of files) {
      assert.ok(existsSync(join(promptDir, f)), `${f} should exist`);
    }
  });

  it('_loadPrompt substitutes variables correctly', () => {
    const race = new Race({ target: null, scene: 'text', goal: 'test' });
    const result = race._loadPrompt('generate', { GOAL: 'MY_TEST_GOAL', CONTENT: 'some content' });
    assert.ok(result.includes('MY_TEST_GOAL'), 'should contain substituted GOAL');
    assert.ok(!result.includes('%GOAL%'), 'should not contain raw %GOAL% placeholder');
    assert.ok(result.includes('some content'), 'should contain substituted CONTENT');
  });

  it('_loadPromptSection extracts STRATEGY from synthesize.md', () => {
    const race = new Race({ target: null, scene: 'text', goal: 'test' });
    const result = race._loadPromptSection('synthesize', 'STRATEGY', {
      ORIGINAL: 'orig', GOAL: 'goal', VERSIONS: 'v', REVIEWS: 'r'
    });
    assert.ok(result.includes('strategy analysis'), 'should contain strategy analysis content');
    assert.ok(!result.includes('Self-check'), 'should NOT contain MERGE section content');
  });

  it('_loadPromptSection extracts MERGE from synthesize.md', () => {
    const race = new Race({ target: null, scene: 'text', goal: 'test' });
    const result = race._loadPromptSection('synthesize', 'MERGE', {
      ORIGINAL: 'orig', GOAL: 'goal', STRATEGY_RESULT: 's', VERSIONS: 'v'
    });
    assert.ok(result.includes('Self-check'), 'should contain Self-check (MERGE content)');
    assert.ok(!result.includes('Consensus and disagreements'), 'should NOT contain STRATEGY section content');
  });

  it('_loadPromptSection extracts ATTACK from adversarial.md', () => {
    const race = new Race({ target: null, scene: 'text', goal: 'test' });
    const result = race._loadPromptSection('adversarial', 'ATTACK', {
      ORIGINAL: 'orig', GOAL: 'goal', OPTIMIZED: 'opt', CRITERIA_SECTION: ''
    });
    assert.ok(result.includes('harshest'), 'should contain attack review content');
    assert.ok(!result.includes('Patch critical'), 'should NOT contain PATCH section content');
  });

  it('_loadPromptSection extracts PATCH from adversarial.md', () => {
    const race = new Race({ target: null, scene: 'text', goal: 'test' });
    const result = race._loadPromptSection('adversarial', 'PATCH', {
      OPTIMIZED: 'opt', ATTACK_REPORT: 'report'
    });
    assert.ok(result.includes('CRITICAL'), 'should contain PATCH content about fixing critical issues');
    assert.ok(!result.includes('harshest'), 'should NOT contain ATTACK section content');
  });

  // --- Criteria files ---

  it('all 4 criteria files exist with anchored scoring', () => {
    const criteriaDir = join(ROOT, 'skills', 'race-optimize', 'criteria');
    const files = ['code-performance.md', 'code-refactor.md', 'text-general.md', 'prompt-engineering.md'];
    for (const f of files) {
      const path = join(criteriaDir, f);
      assert.ok(existsSync(path), `${f} should exist`);
      const content = readFileSync(path, 'utf-8');
      assert.ok(content.includes('1-3'), `${f} should have 1-3 anchor`);
      assert.ok(content.includes('8-9'), `${f} should have 8-9 anchor`);
    }
  });

  // --- Race constructor ---

  it('Race constructor sets correct defaults', () => {
    const race = new Race({ target: 'test.py', goal: 'faster' });
    assert.equal(race.maxRounds, 3);
    assert.equal(race.converge, true);
    assert.equal(race.convergenceThreshold, 0.05);
    assert.equal(race.judge, 'claude-thinking');
    assert.equal(race.adversary, 'claude-thinking');
    assert.equal(race.goal, 'faster');
    assert.equal(race.scene, 'code-performance');
  });

  it('_defaultRacers() returns 5 racer models', () => {
    const race = new Race({ target: null, scene: 'text' });
    const racers = race._defaultRacers();
    assert.equal(racers.length, 5, `Expected 5 racers, got ${racers.length}: ${racers.join(', ')}`);

    // Verify all are actually racers
    const config = new Config();
    const models = config.loadModels();
    for (const alias of racers) {
      assert.equal(models[alias]?.role, 'racer', `${alias} should have role "racer"`);
    }
  });

  it('init() loads criteria based on scene', () => {
    const outputDir = join(tmpdir(), `race-init-test-${Date.now()}`);
    const race = new Race({
      target: null,
      scene: 'code-performance',
      goal: 'test',
      outputDir
    });
    race.init();
    assert.ok(race.criteria, 'criteria should be loaded');
    assert.ok(race.criteria.includes('Performance'), 'should load code-performance criteria');

    // Cleanup
    try { rmSync(outputDir, { recursive: true }); } catch {}
  });

  it('CLI help exits 0 and shows pipeline info', () => {
    const output = execSync('node lib/race.js help', { encoding: 'utf-8', cwd: ROOT });
    assert.ok(output.includes('Race Optimization'), 'should show title');
    assert.ok(output.includes('code-performance'), 'should mention code-performance scene');
  });
});

// ============================================================================
// Integration tests (real API calls — skipped without API key)
// ============================================================================

describe('race-optimize: integration', { skip: !hasApiKey() ? 'No API key configured' : false }, () => {

  const outputDir = join(tmpdir(), `race-integration-test-${Date.now()}`);

  after(() => {
    try { rmSync(outputDir, { recursive: true }); } catch {}
  });

  it('scenario: optimize bubble sort with 2 racers, 1 round', async () => {
    const fixturePath = join(ROOT, 'test', 'fixtures', 'bubble-sort.py');
    assert.ok(existsSync(fixturePath), 'bubble-sort.py fixture should exist');

    const race = new Race({
      target: fixturePath,
      goal: 'faster execution, use a more efficient sorting algorithm',
      racers: ['claude-opus', 'claude-opus-4-5'],
      judge: 'claude-opus',
      adversary: 'claude-opus',
      maxRounds: 1,
      maxTokens: 4000,
      outputDir
    });

    const result = await race.run();

    // Verify pipeline produced output
    assert.ok(result, 'race.run() should return non-null result');
    assert.ok(result.length > 0, 'result should not be empty');

    // Verify output directory structure
    assert.ok(existsSync(join(outputDir, 'round1')), 'round1/ directory should exist');
    assert.ok(existsSync(join(outputDir, 'final.py')), 'final.py should exist');
    assert.ok(existsSync(join(outputDir, 'report.md')), 'report.md should exist');

    // Verify report contains scoring
    const report = readFileSync(join(outputDir, 'report.md'), 'utf-8');
    assert.ok(report.includes('Score') || report.includes('score'), 'report should contain scoring info');

    // Verify output is non-trivial content (models may wrap in markdown)
    assert.ok(result.length > 50, 'output should be substantial (>50 chars)');
  }, { timeout: 300000 }); // 5 min timeout for full pipeline
});
