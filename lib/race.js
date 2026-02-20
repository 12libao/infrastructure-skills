#!/usr/bin/env node
/**
 * Race Optimization Engine v4.0
 *
 * Five-phase pipeline: DIVERGE → EVALUATE → CONVERGE → STRESS → VERIFY
 * Prompts externalized to skills/race-optimize/prompts/
 * Criteria in skills/race-optimize/criteria/
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, extname, join } from 'path';
import { fileURLToPath } from 'url';
import { AI } from './ai.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.INFRA_ROOT || join(__dirname, '..');
const PROMPTS_DIR = join(ROOT, 'skills', 'race-optimize', 'prompts');
const CRITERIA_DIR = join(ROOT, 'skills', 'race-optimize', 'criteria');

// ============================================================================
// Scene configuration
// ============================================================================

const SCENES = {
  'code-performance': {
    name: 'Code Performance',
    defaultCriteria: 'code-performance.md',
    hasVerify: true,
    hasBenchmark: true,
    strategies: [
      'Aggressive algorithm optimization, maximize performance gains',
      'Robust improvement, avoid regressions, focus on hot paths',
      'Innovative approach, try entirely different data structures or algorithms',
      'Memory optimization first, reduce allocations and GC pressure',
      'Parallelization/async, utilize multi-core and I/O'
    ]
  },
  'code-refactor': {
    name: 'Code Refactoring (YAGNI)',
    defaultCriteria: 'code-refactor.md',
    hasVerify: true,
    hasBenchmark: false,
    strategies: [
      'Minimalism, delete all unnecessary abstractions and indirection',
      'Merge modules, reduce file count and interfaces',
      'Flatten design, eliminate unnecessary inheritance and layers',
      'Rename first, make code self-documenting',
      'Functional style, reduce state and side effects'
    ]
  },
  'prompt': {
    name: 'Prompt Engineering',
    defaultCriteria: 'prompt-engineering.md',
    hasVerify: false,
    hasBenchmark: false,
    strategies: [
      'Structure first, use clear sections and markdown formatting',
      'Token efficiency first, achieve best results with fewest words',
      'Constraint-driven, strengthen rules and boundary conditions',
      'Example-driven, optimize few-shot example quality',
      'Robustness first, handle edge inputs and anomalies'
    ]
  },
  'text': {
    name: 'Text Optimization',
    defaultCriteria: 'text-general.md',
    hasVerify: false,
    hasBenchmark: false,
    strategies: [
      'Restructure, optimize overall logical architecture',
      'Refine expression, delete redundancy, every sentence counts',
      'Deepen expertise, strengthen terminology and argumentation',
      'Reader perspective, optimize readability and accessibility',
      'Creative expression, find stronger arguments and rhetoric'
    ]
  }
};

// ============================================================================
// Utilities
// ============================================================================

function detectScene(target, goal) {
  const ext = extname(target).toLowerCase();
  const codeExts = ['.js','.ts','.py','.java','.c','.cpp','.go','.rs','.rb','.php','.swift','.kt','.sh','.bash'];
  const goalLower = (goal || '').toLowerCase();

  if (goalLower.includes('yagni') || goalLower.includes('refactor') || goalLower.includes('simplif')) {
    return 'code-refactor';
  }
  if (goalLower.includes('prompt') || target.toLowerCase().includes('prompt')) {
    return 'prompt';
  }
  if (codeExts.includes(ext)) {
    return 'code-performance';
  }
  return 'text';
}

function truncate(text, maxLen) {
  if (!text || text.length <= maxLen) return text || '';
  return text.slice(0, maxLen) + '\n... (truncated)';
}

function log(icon, msg) {
  console.log(`${icon} ${msg}`);
}

function separator(char = '=', len = 60) {
  console.log(char.repeat(len));
}

// ============================================================================
// Progress tracking
// ============================================================================

class Progress {
  constructor(dir) {
    this.file = join(dir, '.progress');
    this.start = Date.now();
  }

  update(step, status, detail = '') {
    try {
      const elapsed = ((Date.now() - this.start) / 1000).toFixed(1);
      writeFileSync(this.file, JSON.stringify({
        step, status, detail, elapsed: `${elapsed}s`,
        updated: new Date().toISOString(),
        pid: process.pid
      }, null, 2), 'utf-8');
    } catch {}
  }
}

// ============================================================================
// Race Optimization Engine v4.0
// ============================================================================

class Race {
  constructor(opts = {}) {
    this.target = opts.target;
    this.goal = opts.goal || 'optimize';
    this.scene = opts.scene || (this.target ? detectScene(this.target, this.goal) : 'text');

    this.ai = new AI();

    this.racers = opts.racers || this._defaultRacers();
    this.judge = opts.judge || 'claude-thinking';
    this.adversary = opts.adversary || 'claude-thinking';

    this.verify = opts.verify || null;
    this.benchmark = opts.benchmark || null;

    this.maxRounds = opts.maxRounds ?? 3;
    this.converge = opts.converge ?? true;
    this.convergenceThreshold = opts.convergenceThreshold ?? 0.05;

    this.outputDir = opts.outputDir || join(process.cwd(), 'race_output');
    this.maxTokens = opts.maxTokens || 8000;
    this.systemPrompt = opts.systemPrompt || null;

    this._criteriaInput = opts.criteria || null;
    this.criteria = null;

    this.progress = null;
    this.history = [];
    this.originalContent = '';
  }

  _defaultRacers() {
    const models = this.ai.config.loadModels();
    return Object.entries(models)
      .filter(([, v]) => v.role === 'racer')
      .map(([k]) => k);
  }

  // ========================================================================
  // Prompt loading (replaces inline prompts)
  // ========================================================================

  _loadPrompt(name, vars = {}) {
    const filePath = join(PROMPTS_DIR, `${name}.md`);
    let text = readFileSync(filePath, 'utf-8');
    for (const [k, v] of Object.entries(vars)) {
      text = text.replaceAll(`%${k}%`, v || '');
    }
    return text;
  }

  _loadPromptSection(name, section, vars = {}) {
    const full = this._loadPrompt(name, vars);
    const marker = `## ${section}`;
    const start = full.indexOf(marker);
    if (start === -1) return full;
    const rest = full.slice(start + marker.length);
    const nextSection = rest.search(/\n## [A-Z][A-Z]/);
    const content = nextSection === -1 ? rest : rest.slice(0, nextSection);
    // Remove the separator line if present
    return content.replace(/^[\s]*---[\s]*$/m, '').trim();
  }

  _criteriaSection() {
    return this.criteria ? `\n## Evaluation criteria\n${this.criteria}` : '';
  }

  // ========================================================================
  // Init
  // ========================================================================

  init() {
    mkdirSync(this.outputDir, { recursive: true });
    this.progress = new Progress(this.outputDir);

    // Load criteria
    if (this._criteriaInput) {
      if (existsSync(this._criteriaInput)) {
        this.criteria = readFileSync(this._criteriaInput, 'utf-8');
      } else if (this._criteriaInput.includes('\n') || this._criteriaInput.length > 100) {
        this.criteria = this._criteriaInput;
      } else {
        const asPath = this._criteriaInput.startsWith('/') ? this._criteriaInput : join(ROOT, this._criteriaInput);
        try { this.criteria = readFileSync(asPath, 'utf-8'); } catch {}
      }
    }
    if (!this.criteria) {
      const sceneConfig = SCENES[this.scene];
      if (sceneConfig) {
        try {
          this.criteria = readFileSync(join(CRITERIA_DIR, sceneConfig.defaultCriteria), 'utf-8');
        } catch {}
      }
    }

    // Load target file
    if (this.target && existsSync(this.target)) {
      this.originalContent = readFileSync(this.target, 'utf-8');
    }

    if (this.originalContent) {
      this._save('original.md', this.originalContent);
    }
  }

  _save(filename, content) {
    const fp = join(this.outputDir, filename);
    mkdirSync(dirname(fp), { recursive: true });
    writeFileSync(fp, typeof content === 'string' ? content : JSON.stringify(content, null, 2), 'utf-8');
    return fp;
  }

  // ========================================================================
  // Safe model call (with fallback)
  // ========================================================================

  async _call(model, prompt, opts = {}) {
    const messages = typeof prompt === 'string'
      ? [{ role: 'user', content: prompt }]
      : prompt;

    if (this.systemPrompt && messages[0]?.role !== 'system') {
      messages.unshift({ role: 'system', content: this.systemPrompt });
    }

    try {
      return await this.ai.call(model, messages, { max_tokens: this.maxTokens, ...opts });
    } catch (e) {
      log('warning', `[${model}] failed: ${e.message}`);
      const models = this.ai.config.loadModels();
      const fallbacks = Object.entries(models)
        .filter(([, v]) => v.role === 'fallback')
        .map(([k]) => k);

      for (const fb of fallbacks) {
        try {
          log('retry', `trying fallback: ${fb}`);
          return await this.ai.call(fb, messages, { max_tokens: this.maxTokens, ...opts });
        } catch { continue; }
      }
      return { content: `ERROR: ${model} and all fallbacks failed`, error: true };
    }
  }

  // ========================================================================
  // Phase 1: DIVERGE (parallel generation)
  // ========================================================================

  async phaseDiverge(round, baseContent) {
    const labels = 'ABCDEFGHIJ'.split('');
    const sceneConfig = SCENES[this.scene];

    separator();
    log('Phase 1', `[Round ${round}] DIVERGE (${this.racers.length} models in parallel)`);
    separator();
    this.progress?.update(`round${round}_diverge`, 'running', 'Parallel generation');

    const roundContext = round > 1
      ? `\nThis is round ${round}. The content below is the best version from the previous round. Improve it further.`
      : '';

    const promises = this.racers.map(async (model, i) => {
      const label = labels[i] || `R${i}`;
      const strategy = sceneConfig?.strategies?.[i % sceneConfig.strategies.length] || '';

      const prompt = this._loadPrompt('generate', {
        GOAL: this.goal,
        CONTENT: baseContent,
        CRITERIA_SECTION: this._criteriaSection(),
        STRATEGY: strategy,
        ROUND_CONTEXT: roundContext
      });

      log('start', `[${label}] ${model}...`);
      const start = Date.now();
      const result = await this._call(model, prompt);
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);

      if (!result.error) {
        log('done', `[${label}] ${model} (${elapsed}s, ${result.content.length} chars)`);
        this._save(`round${round}/version_${label}.md`, result.content);
      } else {
        log('fail', `[${label}] ${model} failed`);
      }
      return { label, model, content: result.content, error: result.error, elapsed };
    });

    return await Promise.all(promises);
  }

  // ========================================================================
  // Phase 2: EVALUATE (cross-review + essence extraction)
  // ========================================================================

  async phaseEvaluate(round, versions) {
    separator();
    log('Phase 2', `[Round ${round}] EVALUATE (cross-review + essence extraction)`);
    separator();
    this.progress?.update(`round${round}_evaluate`, 'running', 'Cross-review');

    const validVersions = versions.filter(v => !v.error);

    const versionsText = validVersions
      .map(v => `### Version ${v.label} (${v.model})\n\`\`\`\n${truncate(v.content, 6000)}\n\`\`\``)
      .join('\n\n');

    const prompt = this._loadPrompt('review', {
      ORIGINAL: truncate(this.originalContent, 4000),
      GOAL: this.goal,
      VERSIONS: versionsText,
      CRITERIA_SECTION: this._criteriaSection()
    });

    // Multiple reviewers in parallel (cross-perspective)
    const reviewerCount = Math.min(3, this.racers.length);
    const reviewers = this.racers
      .filter(r => r !== this.judge)
      .slice(0, reviewerCount);

    if (reviewers.length < 2) {
      const extra = this.racers.filter(r => !reviewers.includes(r)).slice(0, 2 - reviewers.length);
      reviewers.push(...extra);
    }

    const promises = reviewers.map(async (model, i) => {
      log('start', `[Reviewer ${i + 1}] ${model}...`);
      const start = Date.now();
      const result = await this._call(model, prompt);
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);

      if (!result.error) {
        log('done', `[Reviewer ${i + 1}] ${model} (${elapsed}s)`);
        this._save(`round${round}/review_${i + 1}.md`, result.content);
      }
      return { model, content: result.content, error: result.error };
    });

    return await Promise.all(promises);
  }

  // ========================================================================
  // Phase 3: CONVERGE (deep thinking synthesis)
  // ========================================================================

  async phaseConverge(round, versions, reviews) {
    separator();
    log('Phase 3', `[Round ${round}] CONVERGE (${this.judge}, deep thinking)`);
    separator();
    this.progress?.update(`round${round}_converge`, 'running', 'Judge synthesis');

    const validVersions = versions.filter(v => !v.error);

    const versionsText = validVersions
      .map(v => `### Version ${v.label} (${v.model})\n\`\`\`\n${truncate(v.content, 5000)}\n\`\`\``)
      .join('\n\n');

    const reviewsText = reviews
      .filter(r => !r.error)
      .map((r, i) => `### Reviewer ${i + 1} (${r.model})\n${truncate(r.content, 4000)}`)
      .join('\n\n');

    // Pass 1: Strategy analysis
    const strategyPrompt = this._loadPromptSection('synthesize', 'STRATEGY', {
      ORIGINAL: truncate(this.originalContent, 3000),
      GOAL: this.goal,
      VERSIONS: versionsText,
      REVIEWS: reviewsText
    });

    log('thinking', 'Strategy analysis...');
    const strategyResult = await this._call(this.judge, strategyPrompt);
    if (strategyResult.error) {
      log('fail', 'Strategy analysis failed');
      return { content: validVersions[0]?.content || '', error: true };
    }
    this._save(`round${round}/strategy.md`, strategyResult.content);
    log('done', 'Strategy analysis complete');

    // Pass 2: Essence fusion
    const mergePrompt = this._loadPromptSection('synthesize', 'MERGE', {
      ORIGINAL: truncate(this.originalContent, 3000),
      GOAL: this.goal,
      STRATEGY_RESULT: truncate(strategyResult.content, 5000),
      VERSIONS: versionsText
    });

    log('thinking', 'Essence fusion...');
    const start = Date.now();
    const mergeResult = await this._call(this.judge, mergePrompt);
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);

    if (!mergeResult.error) {
      log('done', `Fusion complete (${elapsed}s, ${mergeResult.content.length} chars)`);
      this._save(`round${round}/merged.md`, mergeResult.content);
    } else {
      log('fail', 'Fusion failed');
    }

    return mergeResult;
  }

  // ========================================================================
  // Phase 4: STRESS (adversarial review + auto-patch)
  // ========================================================================

  async phaseStress(round, mergedContent) {
    separator();
    log('Phase 4', `[Round ${round}] STRESS (${this.adversary})`);
    separator();
    this.progress?.update(`round${round}_stress`, 'running', 'Adversarial review');

    const attackPrompt = this._loadPromptSection('adversarial', 'ATTACK', {
      ORIGINAL: truncate(this.originalContent, 3000),
      GOAL: this.goal,
      OPTIMIZED: truncate(mergedContent, 6000),
      CRITERIA_SECTION: this._criteriaSection()
    });

    log('attack', 'Adversarial review...');
    const attackResult = await this._call(this.adversary, attackPrompt);

    if (attackResult.error) {
      log('warning', 'Adversarial review failed, skipping');
      return { content: mergedContent, attackReport: null };
    }

    this._save(`round${round}/adversarial.md`, attackResult.content);

    const hasRedFlags = /[-*]\s*CRITICAL\b/i.test(attackResult.content) ||
                        /severity[:\s]*critical/i.test(attackResult.content);

    if (!hasRedFlags) {
      log('done', 'Adversarial review passed, no critical issues');
      return { content: mergedContent, attackReport: attackResult.content };
    }

    // Critical issues found -> patch
    log('patch', 'Critical issues found, patching...');

    const patchPrompt = this._loadPromptSection('adversarial', 'PATCH', {
      OPTIMIZED: truncate(mergedContent, 5000),
      ATTACK_REPORT: truncate(attackResult.content, 4000)
    });

    const fixResult = await this._call(this.judge, patchPrompt);

    if (!fixResult.error) {
      log('done', 'Patch complete');
      this._save(`round${round}/fixed.md`, fixResult.content);
      return { content: fixResult.content, attackReport: attackResult.content };
    }

    log('warning', 'Patch failed, using unpatched version');
    return { content: mergedContent, attackReport: attackResult.content };
  }

  // ========================================================================
  // Phase 5: VERIFY (evidence-based)
  // ========================================================================

  async phaseVerify(round, optimizedContent) {
    separator();
    log('Phase 5', `[Round ${round}] VERIFY (evidence-based)`);
    separator();
    this.progress?.update(`round${round}_verify`, 'running', 'Verification');

    const evidence = {
      round,
      tests: null,
      benchmark: null,
      score: null,
      comparison: null,
      timestamp: new Date().toISOString()
    };

    // === Code verification: run tests ===
    if (this.verify) {
      log('test', `Running tests: ${this.verify}`);
      const origContent = this.target ? readFileSync(this.target, 'utf-8') : null;

      try {
        if (this.target) {
          writeFileSync(this.target, optimizedContent, 'utf-8');
        }

        const testOutput = execSync(this.verify, {
          timeout: 180000,
          encoding: 'utf-8',
          stdio: 'pipe',
          cwd: process.cwd()
        });
        evidence.tests = { passed: true, output: testOutput.slice(-1000) };
        log('done', 'Tests passed');
      } catch (e) {
        evidence.tests = {
          passed: false,
          output: ((e.stdout || '') + (e.stderr || '')).slice(-1000)
        };
        log('fail', 'Tests failed');
      } finally {
        if (this.target && origContent !== null) {
          writeFileSync(this.target, origContent, 'utf-8');
        }
      }
    }

    // === Code verification: benchmark ===
    if (this.benchmark && evidence.tests?.passed !== false) {
      log('bench', `Running benchmark: ${this.benchmark}`);
      try {
        const benchOutput = execSync(this.benchmark, {
          timeout: 180000,
          encoding: 'utf-8',
          stdio: 'pipe'
        });
        evidence.benchmark = { output: benchOutput.trim() };
        log('result', `Benchmark: ${truncate(benchOutput.trim(), 200)}`);
      } catch (e) {
        log('warning', `Benchmark error: ${e.message}`);
        evidence.benchmark = { error: e.message };
      }
    }

    // === Scoring (using externalized prompt) ===
    const scorePrompt = this._loadPrompt('score', {
      ORIGINAL: truncate(this.originalContent, 3000),
      OPTIMIZED: truncate(optimizedContent, 5000),
      GOAL: this.goal,
      CRITERIA_SECTION: this._criteriaSection()
    });

    const scorers = this.racers.filter(r => r !== this.judge).slice(0, 2);
    const scorePromises = scorers.map(async (model) => {
      const result = await this._call(model, scorePrompt, { max_tokens: 2000 });
      if (!result.error) {
        try {
          const match = result.content.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            if (typeof parsed.totalScore === 'number' && parsed.totalScore >= 0 && parsed.totalScore <= 100) {
              return parsed;
            }
          }
        } catch {}
      }
      return null;
    });

    const scores = (await Promise.all(scorePromises)).filter(Boolean);

    if (scores.length > 0) {
      const totalScores = scores.map(s => s.totalScore).sort((a, b) => a - b);
      const medianScore = totalScores[Math.floor(totalScores.length / 2)];

      // Variance detection
      const maxDiff = scores.length > 1 ? Math.max(...totalScores) - Math.min(...totalScores) : 0;

      evidence.score = {
        median: medianScore,
        individual: scores,
        variance: maxDiff,
        highVariance: maxDiff > 15,
        improvements: scores[0]?.improvements || [],
        remainingIssues: scores[0]?.remainingIssues || [],
        assessment: scores[0]?.overallAssessment || ''
      };

      log('score', `Score: ${medianScore}/100${evidence.score.highVariance ? ` (WARNING: high variance ${maxDiff}pts)` : ''}`);
      if (evidence.score.improvements?.length) {
        evidence.score.improvements.forEach(imp => log('  +', imp));
      }
    }

    // === Comparison ===
    evidence.comparison = {
      originalLength: this.originalContent.length,
      optimizedLength: optimizedContent.length,
      lengthChange: `${((optimizedContent.length - this.originalContent.length) / this.originalContent.length * 100).toFixed(1)}%`
    };

    this._save(`round${round}/verification.json`, evidence);
    return evidence;
  }

  // ========================================================================
  // Convergence detection
  // ========================================================================

  _hasConverged(evidence) {
    if (!this.converge) return false;
    if (this.history.length < 2) return false;

    const prev = this.history[this.history.length - 1];
    const curr = evidence;

    if (curr.tests && !curr.tests.passed) return false;

    if (curr.score?.median && prev.score?.median) {
      const improvement = (curr.score.median - prev.score.median) / prev.score.median;
      if (Math.abs(improvement) < this.convergenceThreshold) {
        log('converge', `Score change ${(improvement * 100).toFixed(1)}% < ${(this.convergenceThreshold * 100)}% threshold`);
        return true;
      }
    }

    return false;
  }

  // ========================================================================
  // Report generation
  // ========================================================================

  _generateReport(totalElapsed) {
    const sceneConfig = SCENES[this.scene];
    let report = `# Race Optimization Report\n\n`;
    report += `## Summary\n`;
    report += `| Field | Value |\n|-------|-------|\n`;
    report += `| Scene | ${sceneConfig?.name || this.scene} |\n`;
    report += `| Goal | ${this.goal} |\n`;
    report += `| File | ${this.target || '(inline)'} |\n`;
    report += `| Racers | ${this.racers.join(', ')} |\n`;
    report += `| Judge | ${this.judge} |\n`;
    report += `| Adversary | ${this.adversary} |\n`;
    report += `| Rounds | ${this.history.length} |\n`;
    report += `| Duration | ${totalElapsed}s |\n\n`;

    report += `## Per-Round Results\n\n`;
    for (let i = 0; i < this.history.length; i++) {
      const h = this.history[i];
      report += `### Round ${i + 1}\n`;
      if (h.tests) report += `- Tests: ${h.tests.passed ? 'PASSED' : 'FAILED'}\n`;
      if (h.benchmark?.output) report += `- Benchmark: ${truncate(h.benchmark.output, 200)}\n`;
      if (h.score) {
        report += `- Score: **${h.score.median}/100**${h.score.highVariance ? ' (HIGH VARIANCE)' : ''}\n`;
        if (h.score.improvements?.length) {
          report += `- Improvements:\n`;
          h.score.improvements.forEach(imp => report += `  - ${imp}\n`);
        }
        if (h.score.remainingIssues?.length) {
          report += `- Remaining issues:\n`;
          h.score.remainingIssues.forEach(iss => report += `  - ${iss}\n`);
        }
        if (h.score.assessment) report += `- Assessment: ${h.score.assessment}\n`;
      }
      if (h.comparison) {
        report += `- Length change: ${h.comparison.lengthChange}\n`;
      }
      report += '\n';
    }

    if (this.history.length > 1) {
      const scores = this.history.map(h => h.score?.median).filter(Boolean);
      if (scores.length > 1) {
        report += `## Convergence\n\n`;
        report += `| Round | Score | Change |\n|-------|-------|--------|\n`;
        scores.forEach((s, i) => {
          const change = i > 0 ? `${((s - scores[i-1]) / scores[i-1] * 100).toFixed(1)}%` : '-';
          report += `| ${i + 1} | ${s} | ${change} |\n`;
        });
        report += '\n';
      }
    }

    return report;
  }

  // ========================================================================
  // Main pipeline
  // ========================================================================

  async run() {
    this.init();
    const totalStart = Date.now();

    // Pre-flight: check model availability
    const allModels = [...new Set([...this.racers, this.judge, this.adversary])];
    const checkResults = await this.ai.checkModels(allModels);
    this.preflightResults = checkResults;

    separator();
    log('PREFLIGHT', 'Model availability');
    console.log('  ' + 'Model'.padEnd(22) + 'Role'.padEnd(24) + 'Status'.padEnd(10) + 'Latency');
    console.log('  ' + '-'.repeat(66));
    for (const r of checkResults) {
      const roles = [];
      if (this.racers.includes(r.alias)) roles.push('racer');
      if (this.judge === r.alias) roles.push('judge');
      if (this.adversary === r.alias) roles.push('adversary');
      console.log('  ' + r.alias.padEnd(22) + roles.join('+').padEnd(24) +
        (r.available ? 'OK' : 'FAIL').padEnd(10) +
        (r.available ? `${r.latencyMs}ms` : '-'));
    }

    const unavailable = new Set(checkResults.filter(r => !r.available).map(r => r.alias));
    if (unavailable.size > 0) {
      this.racers = this.racers.filter(r => !unavailable.has(r));
      log('WARNING', `Removed unavailable: ${[...unavailable].join(', ')}`);
      if (unavailable.has(this.judge)) {
        log('WARNING', `Judge "${this.judge}" unavailable, will use fallbacks`);
      }
      if (this.racers.length === 0) {
        log('ABORT', 'No available racer models, stopping');
        this.progress?.update('done', 'failed', 'No available models');
        return null;
      }
    }
    console.log('');

    separator('=');
    log('START', 'Race Optimization Engine v4.0');
    separator('=');
    log('scene', `${SCENES[this.scene]?.name || this.scene}`);
    log('goal', this.goal);
    log('file', this.target || '(inline)');
    log('racers', this.racers.join(', '));
    log('judge', `${this.judge} (deep thinking)`);
    log('adversary', this.adversary);
    log('rounds', `max ${this.maxRounds}${this.converge ? ' (with convergence detection)' : ''}`);
    if (this.verify) log('verify', this.verify);
    if (this.benchmark) log('benchmark', this.benchmark);
    if (this.criteria) log('criteria', 'loaded');

    let currentBest = this.originalContent;
    let finalResult = null;

    for (let round = 1; round <= this.maxRounds; round++) {
      console.log('');
      separator('=');
      log('ROUND', `${round}/${this.maxRounds}`);
      separator('=');

      const versions = await this.phaseDiverge(round, currentBest);
      const validVersions = versions.filter(v => !v.error);

      if (validVersions.length === 0) {
        log('fail', 'All models failed, stopping');
        break;
      }

      const reviews = await this.phaseEvaluate(round, validVersions);

      const merged = await this.phaseConverge(round, validVersions, reviews);
      if (merged.error) {
        log('fail', 'Judge fusion failed, using best single version');
        finalResult = validVersions[0].content;
        break;
      }

      const { content: optimized } = await this.phaseStress(round, merged.content);

      const evidence = await this.phaseVerify(round, optimized);

      if (evidence.tests && !evidence.tests.passed) {
        log('warning', 'Tests failed, keeping previous round version');
        this.history.push(evidence);
        continue;
      }

      const converged = this._hasConverged(evidence);

      currentBest = optimized;
      finalResult = optimized;
      this.history.push(evidence);

      if (converged) {
        log('CONVERGED', 'Stopping early');
        break;
      }
    }

    // ====== Save final results ======
    const totalElapsed = ((Date.now() - totalStart) / 1000).toFixed(1);

    if (finalResult) {
      const ext = this.target ? extname(this.target) : '.md';
      this._save(`final${ext}`, finalResult);

      const report = this._generateReport(totalElapsed);
      this._save('report.md', report);

      console.log('');
      separator('=');
      log('DONE', `Race complete! ${totalElapsed}s, ${this.history.length} round(s)`);
      log('output', `${this.outputDir}/final${ext}`);
      log('report', `${this.outputDir}/report.md`);

      if (this.history.length > 0) {
        const last = this.history[this.history.length - 1];
        if (last.tests) {
          log(last.tests.passed ? 'pass' : 'fail', `Tests: ${last.tests.passed ? 'PASSED' : 'FAILED'}`);
        }
        if (last.score?.median) {
          log('score', `Final score: ${last.score.median}/100`);
        }
      }
      separator('=');

      this.progress?.update('done', 'completed', `${this.history.length} rounds, ${totalElapsed}s`);
    } else {
      log('fail', 'Race optimization failed, no valid output');
      this.progress?.update('done', 'failed');
    }

    return finalResult;
  }
}

// ============================================================================
// CLI (simplified: just <file> "<goal>")
// ============================================================================

async function cli() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === 'help' || args[0] === '--help') {
    console.log(`
Race Optimization Engine v4.0

Usage:
  node lib/race.js <file> "<goal>"    Optimize a file
  node lib/race.js demo               Run demo
  node lib/race.js help               Show help

Scenes (auto-detected):
  code-performance  Code files (.js, .py, .ts, etc.)
  code-refactor     Keywords: "refactor", "YAGNI", "simplify"
  prompt            Keywords: "prompt"
  text              Default for non-code files

Examples:
  node lib/race.js sort.py "faster execution"
  node lib/race.js README.md "more clear and professional"
  node lib/race.js prompt.md "more accurate and robust"
  node lib/race.js utils.js "YAGNI refactor"

Programmatic API:
  import { Race } from './lib/race.js';
  await new Race({ target: 'file.py', goal: 'faster' }).run();
`);
    return;
  }

  if (args[0] === 'demo') {
    log('demo', 'Running race demo...\n');
    const race = new Race({
      target: null,
      goal: 'Write a better four-line poem about AI',
      scene: 'text',
      racers: ['claude-opus-4-6', 'gpt-5'],
      judge: 'claude-opus-4-6',
      adversary: 'claude-opus-4-6',
      maxRounds: 2,
      maxTokens: 2000,
      outputDir: join(process.cwd(), 'race_demo_output')
    });
    race.originalContent = 'In silicon depths algorithms grow, through data streams they learn to know. Iron frames that cannot cry, yet toil for humankind nearby.';
    await race.run();
    return;
  }

  // Simple CLI: <file> "<goal>"
  const target = args[0];
  const goal = args[1] || 'optimize';

  if (!existsSync(target)) {
    console.error(`File not found: ${target}`);
    process.exit(1);
  }

  const race = new Race({ target, goal });
  await race.run();
}

// ============================================================================
// Exports
// ============================================================================

export { detectScene, Race, SCENES };

if (import.meta.url === `file://${process.argv[1]}`) {
  cli().catch(e => { console.error('Error:', e.message); process.exit(1); });
}
