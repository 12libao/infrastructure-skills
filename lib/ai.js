#!/usr/bin/env node
/**
 * AI Model Client - 极简实现
 * 从第一性原理重构：单文件、零抽象、直接高效
 */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.INFRA_ROOT || join(__dirname, '..');

// ============================================================================
// 核心：配置管理
// ============================================================================

class Config {
  constructor() {
    this.env = null;
    this.models = null;
  }

  loadEnv() {
    if (this.env) return this.env;
    
    try {
      const envFile = join(ROOT, '.env.local');
      const content = readFileSync(envFile, 'utf-8');
      this.env = Object.fromEntries(
        content.split('\n')
          .filter(line => line && !line.startsWith('#') && line.includes('='))
          .map(line => {
            const idx = line.indexOf('=');
            return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
          })
      );
    } catch {
      this.env = {};
    }
    
    return this.env;
  }

  loadModels() {
    if (this.models) return this.models;
    
    try {
      const modelsFile = join(ROOT, 'config/models.json');
      this.models = JSON.parse(readFileSync(modelsFile, 'utf-8'));
    } catch {
      this.models = {};
    }
    
    return this.models;
  }

  get(key, defaultValue = null) {
    return process.env[key] || this.loadEnv()[key] || defaultValue;
  }

  getModel(alias) {
    const models = this.loadModels();
    return models[alias] || null;
  }
}

// ============================================================================
// 核心：HTTP 客户端（零依赖）
// ============================================================================

async function httpRequest(url, options = {}) {
  const https = await import('https');
  const http = await import('http');
  const timeout = options.timeout || 120000;

  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;

    const req = client.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.setTimeout(timeout, () => {
      req.destroy(new Error(`Request timeout after ${timeout}ms`));
    });
    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// ============================================================================
// 核心：AI 客户端
// ============================================================================

class AI {
  constructor() {
    this.config = new Config();
  }

  async call(modelAlias, prompt, options = {}) {
    const startTime = Date.now();
    
    const modelConfig = this.config.getModel(modelAlias);
    const modelName = modelConfig ? modelConfig.name : modelAlias;
    const baseURL = modelConfig?.baseURL || this.config.get('YUNWU_BASE_URL', 'http://hw.yunwu.ai:3000/v1');
    const apiKey = this.config.get(modelConfig?.apiKeyEnv || 'YUNWU_API_KEY');
    
    if (!apiKey) {
      throw new Error('API key not configured');
    }

    const messages = Array.isArray(prompt) 
      ? prompt 
      : [{ role: 'user', content: prompt }];

    const { temperature = 0.7, max_tokens = 4000, timeout, ...extraBody } = options;

    const response = await httpRequest(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      timeout,
      body: {
        model: modelName,
        messages,
        temperature,
        max_tokens,
        ...extraBody
      }
    });

    if (response.status !== 200) {
      throw new Error(`API error: ${response.status} ${JSON.stringify(response.data)}`);
    }

    const elapsed = Date.now() - startTime;
    const content = response.data.choices[0].message.content;

    return {
      content,
      model: modelName,
      usage: response.data.usage,
      elapsed: `${elapsed}ms`
    };
  }

  async listModels() {
    const baseURL = this.config.get('YUNWU_BASE_URL', 'http://hw.yunwu.ai:3000/v1');
    const apiKey = this.config.get('YUNWU_API_KEY');

    if (!apiKey) {
      throw new Error('API key not configured');
    }

    const response = await httpRequest(`${baseURL}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.status !== 200) {
      throw new Error(`API error: ${response.status}`);
    }

    const presetModels = this.config.loadModels();
    const apiModels = response.data.data || [];

    return {
      preset: Object.entries(presetModels).map(([alias, config]) => ({
        alias,
        name: config.name,
        description: config.description
      })),
      available: apiModels.map(m => ({
        id: m.id,
        name: m.id
      }))
    };
  }

  async checkModels(aliases = null) {
    const models = this.config.loadModels();
    const targets = aliases || Object.keys(models);
    return Promise.all(targets.map(async (alias) => {
      const modelConfig = models[alias];
      const entry = { alias, name: modelConfig?.name || alias, role: modelConfig?.role || 'unknown' };
      const start = Date.now();
      try {
        await this.call(alias, 'Reply OK', { max_tokens: 10, timeout: 15000 });
        entry.available = true;
        entry.latencyMs = Date.now() - start;
      } catch (e) {
        entry.available = false;
        entry.latencyMs = Date.now() - start;
        entry.error = e.message;
      }
      return entry;
    }));
  }
}

// ============================================================================
// CLI 接口
// ============================================================================

async function cli() {
  const args = process.argv.slice(2);
  const ai = new AI();

  try {
    if (args.length === 0 || args[0] === 'help' || args[0] === '--help') {
      console.log(`
AI Model Client - 极简版

用法:
  node lib/ai.js call <model> <prompt>    调用模型
  node lib/ai.js list                     列出模型
  node lib/ai.js check                    检查模型可用性
  node lib/ai.js help                     显示帮助

示例:
  node lib/ai.js call claude-opus-4-6 "你好"
  node lib/ai.js call gpt-5 "写一首诗"
  node lib/ai.js list
`);
      return;
    }

    const command = args[0];

    if (command === 'call') {
      const [, modelAlias, ...promptParts] = args;
      const prompt = promptParts.join(' ');

      if (!modelAlias || !prompt) {
        console.error('❌ 用法: node lib/ai.js call <model> <prompt>');
        process.exit(1);
      }

      console.log(`🤖 调用模型: ${modelAlias}`);
      console.log(`📝 提示: ${prompt}\n`);

      const result = await ai.call(modelAlias, prompt);

      console.log('✅ 响应:\n');
      console.log(result.content);
      console.log(`\n🤖 模型: ${result.model}`);
      console.log(`⏱️  耗时: ${result.elapsed}`);
      if (result.usage) {
        console.log(`📊 Token: ${result.usage.total_tokens}`);
      }
    }
    else if (command === 'list') {
      console.log('📋 获取模型列表...\n');
      
      const models = await ai.listModels();

      console.log('🎯 预设模型别名:');
      models.preset.forEach(m => {
        console.log(`  ${m.alias.padEnd(20)} → ${m.name}`);
        if (m.description) {
          console.log(`  ${' '.repeat(22)}${m.description}`);
        }
      });

      console.log('\n🌐 可用模型 (直通):');
      models.available.slice(0, 10).forEach(m => {
        console.log(`  ${m.id}`);
      });
      
      if (models.available.length > 10) {
        console.log(`  ... 还有 ${models.available.length - 10} 个模型`);
      }
    }
    else if (command === 'check') {
      console.log('🔍 检查模型可用性...\n');
      const results = await ai.checkModels();

      console.log('Alias'.padEnd(22) + 'Role'.padEnd(12) + 'Status'.padEnd(10) + 'Latency');
      console.log('-'.repeat(56));
      for (const r of results) {
        console.log(
          r.alias.padEnd(22) + r.role.padEnd(12) +
          (r.available ? 'OK' : 'FAIL').padEnd(10) +
          (r.available ? `${r.latencyMs}ms` : r.error || '-')
        );
      }
      const ok = results.filter(r => r.available).length;
      console.log(`\n✅ ${ok}/${results.length} models available`);
    }
    else {
      console.error(`❌ 未知命令: ${command}`);
      console.log('运行 "node lib/ai.js help" 查看帮助');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

export { AI, Config };

if (import.meta.url === `file://${process.argv[1]}`) {
  cli();
}
