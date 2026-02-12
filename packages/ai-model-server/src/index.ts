#!/usr/bin/env node
/**
 * AI Model MCP Server v2
 * =======================
 * 
 * 将外部 AI 模型调用能力暴露为 MCP 工具，让 Cline 可以直接调用外部大模型。
 * 
 * v2 新特性:
 *   - 直通模式: 直接传 yunwu 模型名即可调用，无需预先注册
 *   - 动态发现: 调用 /v1/models API 获取 yunwu 最新可用模型列表
 *   - 预设模型: 常用模型带角色标签，方便智能选择
 * 
 * 工具列表:
 *   - call_model      : 调用外部 AI 模型（支持预设ID或直接传模型名）
 *   - list_models     : 列出所有可用模型（预设 + yunwu 实时）
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import OpenAI from 'openai';

// ============================================================
// 模型配置
// ============================================================

interface ModelConfig {
  id: string;
  name: string;
  role: string;
  model: string;
  maxTokens: number;
  description: string;
}

interface ProviderConfig {
  baseUrl: string;
  apiKey: string;
}

function getPresetModels(): ModelConfig[] {
  return [
    {
      id: 'claude-opus',
      name: 'Claude Opus 4.6',
      role: 'general',
      model: process.env.YUNWU_MODEL || 'claude-opus-4-6',
      maxTokens: 16000,
      description: '旗舰级通用 AI，擅长专业任务、长上下文理解',
    },
    {
      id: 'claude-thinking',
      name: 'Claude Opus 4.6 Thinking',
      role: 'thinking',
      model: process.env.YUNWU_THINKING_MODEL || 'claude-opus-4-6-thinking',
      maxTokens: 16000,
      description: '深度分析模型，专为复杂决策和逻辑推理而生',
    },
    {
      id: 'search-deepseek',
      name: 'DeepSeek R1 Searching',
      role: 'search',
      model: process.env.YUNWU_SEARCH_MODEL || 'deepseek-r1-searching',
      maxTokens: 8192,
      description: '深度推理+中文网搜索，擅长百度/知乎/微信公众号',
    },
    {
      id: 'search-perplexity',
      name: 'Perplexity Sonar Pro',
      role: 'search',
      model: process.env.YUNWU_SEARCH_B_MODEL || 'perplexity-sonar-pro',
      maxTokens: 8192,
      description: '多源聚合搜索引擎，自动引用来源',
    },
    {
      id: 'search-gemini',
      name: 'Gemini 2.5 Flash (Search)',
      role: 'search',
      model: process.env.YUNWU_SEARCH_C_MODEL || 'gemini-2.5-flash-search',
      maxTokens: 8192,
      description: 'Google生态搜索，擅长英文权威源',
    },
    {
      id: 'search-kimi',
      name: 'Kimi K2 (Moonshot)',
      role: 'search',
      model: process.env.YUNWU_SEARCH_D_MODEL || 'kimi-k2',
      maxTokens: 8192,
      description: '中文深度搜索+长文档解析',
    },
    {
      id: 'gpt52',
      name: 'GPT-5.2',
      role: 'racer',
      model: process.env.YUNWU_RACER_B_MODEL || 'gpt-5.2',
      maxTokens: 16000,
      description: 'OpenAI 最强旗舰，擅长复杂推理与综合分析',
    },
    {
      id: 'gemini-racer',
      name: 'Gemini 3 Pro Preview',
      role: 'racer',
      model: process.env.YUNWU_RACER_C_MODEL || 'gemini-3-pro-preview',
      maxTokens: 16000,
      description: 'Google 最新推理模型，思考链+多模态',
    },
    {
      id: 'gpt51',
      name: 'GPT-5.1',
      role: 'fast',
      model: process.env.YUNWU_FAST_MODEL || 'gpt-5.1',
      maxTokens: 8192,
      description: 'OpenAI 高性价比旗舰，适合快速辅助分析',
    },
  ];
}

function getFallbackProviders(): Array<ModelConfig & { baseUrl: string; apiKey: string }> {
  const fallbacks: Array<ModelConfig & { baseUrl: string; apiKey: string }> = [];

  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    fallbacks.push({
      id: 'gemini',
      name: 'Google Gemini 3 Pro',
      role: 'fallback',
      model: process.env.GEMINI_MODEL || 'gemini-3-pro-preview',
      maxTokens: 4096,
      description: 'Google 旗舰模型，备选方案',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
      apiKey: geminiKey,
    });
  }

  const githubToken = process.env.GITHUB_TOKEN;
  if (githubToken) {
    fallbacks.push({
      id: 'github-gpt4o',
      name: 'GitHub Models (GPT-4o)',
      role: 'fallback',
      model: process.env.GITHUB_MODEL || 'gpt-4o',
      maxTokens: 4096,
      description: 'GitHub Models 兜底方案',
      baseUrl: 'https://models.inference.ai.azure.com',
      apiKey: githubToken,
    });
  }

  return fallbacks;
}

// ============================================================
// Thinking 标签清理
// ============================================================

function cleanThinkingTags(text: string): { content: string; thinking: string } {
  if (!text) return { content: '', thinking: '' };

  const thinkingParts: string[] = [];
  const pattern = /<[Tt]hinking>([\s\S]*?)<\/[Tt]hinking>/g;

  let match;
  while ((match = pattern.exec(text)) !== null) {
    thinkingParts.push(match[1].trim());
  }

  let cleaned = text.replace(/<[Tt]hinking>[\s\S]*?<\/[Tt]hinking>/g, '');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

  return {
    content: cleaned,
    thinking: thinkingParts.join('\n\n---\n\n'),
  };
}

// ============================================================
// MCP Server
// ============================================================

class AIModelServer {
  private server: Server;
  private presetModels: Map<string, ModelConfig>;
  private modelNameIndex: Map<string, ModelConfig>;
  private fallbacks: Array<ModelConfig & { baseUrl: string; apiKey: string }>;
  private yunwuConfig: ProviderConfig | null;
  private cachedYunwuModels: string[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000;

  constructor() {
    const yunwuKey = process.env.YUNWU_API_KEY;
    const yunwuBase = process.env.YUNWU_BASE_URL || 'http://hw.yunwu.ai:3000/v1';
    this.yunwuConfig = yunwuKey ? { baseUrl: yunwuBase, apiKey: yunwuKey } : null;

    this.presetModels = new Map();
    this.modelNameIndex = new Map();

    if (this.yunwuConfig) {
      for (const m of getPresetModels()) {
        this.presetModels.set(m.id, m);
        this.modelNameIndex.set(m.model, m);
      }
    }

    this.fallbacks = getFallbackProviders();
    for (const fb of this.fallbacks) {
      this.presetModels.set(fb.id, fb);
      this.modelNameIndex.set(fb.model, fb);
    }

    this.server = new Server(
      { name: 'ai-model-server', version: '2.0.0' },
      { capabilities: { tools: {} } }
    );

    this.setupToolHandlers();
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private resolveModel(modelId: string): {
    model: string; name: string; maxTokens: number; baseUrl: string; apiKey: string;
  } | null {
    const preset = this.presetModels.get(modelId);
    if (preset) {
      const fb = this.fallbacks.find(f => f.id === modelId);
      if (fb) {
        return { model: fb.model, name: fb.name, maxTokens: fb.maxTokens, baseUrl: fb.baseUrl, apiKey: fb.apiKey };
      }if (this.yunwuConfig) {
        return { model: preset.model, name: preset.name, maxTokens: preset.maxTokens, baseUrl: this.yunwuConfig.baseUrl, apiKey: this.yunwuConfig.apiKey };
      }
    }

    const byName = this.modelNameIndex.get(modelId);
    if (byName) {
      const fb = this.fallbacks.find(f => f.model === modelId);
      if (fb) {
        return { model: fb.model, name: fb.name, maxTokens: fb.maxTokens, baseUrl: fb.baseUrl, apiKey: fb.apiKey };
      }
      if (this.yunwuConfig) {
        return { model: byName.model, name: byName.name, maxTokens: byName.maxTokens, baseUrl: this.yunwuConfig.baseUrl, apiKey: this.yunwuConfig.apiKey };
      }
    }

    if (this.yunwuConfig) {
      return { model: modelId, name: `${modelId} (直通)`, maxTokens: 16000, baseUrl: this.yunwuConfig.baseUrl, apiKey: this.yunwuConfig.apiKey };
    }

    return null;
  }

  private async fetchYunwuModels(): Promise<string[]> {
    if (!this.yunwuConfig) return [];
    if (this.cachedYunwuModels && (Date.now() - this.cacheTimestamp) < this.CACHE_TTL) {
      return this.cachedYunwuModels;
    }

    try {
      const client = new OpenAI({ baseURL: this.yunwuConfig.baseUrl, apiKey: this.yunwuConfig.apiKey, timeout: 10000 });
      const response = await client.models.list();
      const models: string[] = [];
      for await (const model of response) { models.push(model.id); }
      models.sort();
      this.cachedYunwuModels = models;
      this.cacheTimestamp = Date.now();
      return models;
    } catch (error) {
      console.error('[fetchYunwuModels]', error);
      return [];
    }
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const presetIds = Array.from(this.presetModels.keys());
      return {
        tools: [
          {
            name: 'call_model',
            description: `调用外部 AI 模型。支持 ${this.presetModels.size} 个预设模型：${Array.from(this.presetModels.values()).map(m => `${m.id}(${m.role})`).join('、')}。也支持直接传 yunwu 模型名（如 deepseek-v3）进行直通调用。`,
            inputSchema: {
              type: 'object' as const,
              properties: {
                model_id: { type: 'string', description: `模型 ID。可选值: ${presetIds.join(', ')}。也可直接传 yunwu 模型全名。默认: claude-opus` },
                prompt: { type: 'string', description: '用户提示词（必填）' },
                system_prompt: { type: 'string', description: '系统提示词（可选）' },
                max_tokens: { type: 'number', description: '最大输出 token 数（默认: 16000）' },
                clean_thinking: { type: 'boolean', description: '是否清理 <thinking> 标签（默认: true）' },
              },
              required: ['prompt'],
            },
          },
          {
            name: 'list_models',
            description: '列出所有可用的外部 AI 模型及其角色、能力描述',
            inputSchema: { type: 'object' as const, properties: {} },
          },
        ],};
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'call_model': return this.handleCallModel(request.params.arguments);
        case 'list_models': return this.handleListModels();
        default: throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
      }
    });
  }

  private async handleCallModel(args: Record<string, unknown> | undefined) {
    if (!args || typeof args.prompt !== 'string' || !args.prompt) {
      throw new McpError(ErrorCode.InvalidParams, '缺少必填参数: prompt');
    }

    const modelId = (args.model_id as string) || 'claude-opus';
    const prompt = args.prompt as string;
    const systemPrompt = (args.system_prompt as string) || '';
    const cleanThinking = args.clean_thinking !== false;

    const resolved = this.resolveModel(modelId);
    if (!resolved) {
      return { content: [{ type: 'text', text: `❌ 无法解析模型: ${modelId}\n\n没有可用的 API 配置。` }], isError: true };
    }

    const maxTokens = (args.max_tokens as number) || resolved.maxTokens;
    const startTime = Date.now();

    try {
      const client = new OpenAI({ baseURL: resolved.baseUrl, apiKey: resolved.apiKey, timeout: 300000 });
      const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
      messages.push({ role: 'user', content: prompt });

      const response = await client.chat.completions.create({ model: resolved.model, max_tokens: maxTokens, messages });
      const rawContent = response.choices[0]?.message?.content || '';
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      let finalContent: string;
      let thinkingContent = '';
      if (cleanThinking) {
        const cleaned = cleanThinkingTags(rawContent);
        finalContent = cleaned.content;
        thinkingContent = cleaned.thinking;
      } else {
        finalContent = rawContent;
      }

      const meta = [
        `📡 模型: ${resolved.name} (${resolved.model})`,
        `⏱️ 耗时: ${duration}秒`,
        `📊 内容: ${finalContent.length} 字符`,
      ];
      if (thinkingContent) meta.push(`🧠 思考过程: ${thinkingContent.length} 字符`);

      const parts: Array<{ type: string; text: string }> = [];
      parts.push({ type: 'text', text: finalContent });
      parts.push({ type: 'text', text: `\n---\n${meta.join(' | ')}` });
      if (thinkingContent) {
        parts.push({ type: 'text', text: `\n<details><summary>🧠 思考过程</summary>\n\n${thinkingContent}\n\n</details>` });
      }

      return { content: parts };
    } catch (error: unknown) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      const errMsg = error instanceof Error ? error.message : String(error);
      return { content: [{ type: 'text', text: `❌ 调用模型 ${resolved.name} 失败 (${duration}秒)\n\n错误: ${errMsg}` }], isError: true };
    }
  }

  private async handleListModels() {
    const roleIcons: Record<string, string> = {
      general: '💬', thinking: '🧠', search: '🔍', racer: '🏇', fast: '⚡', fallback: '🔄',
    };

    const lines: string[] = [];
    lines.push(`## 📌 预设模型 (${this.presetModels.size} 个)\n`);
    lines.push('| 短 ID | 名称 | 角色 | 模型名 | 描述 |');
    lines.push('|---|---|---|---|---|');

    for (const m of this.presetModels.values()) {
      const icon = roleIcons[m.role] || '🤖';
      lines.push(`| \`${m.id}\` | ${icon} ${m.name} | ${m.role} | \`${m.model}\` | ${m.description} |`);
    }

    if (this.yunwuConfig) {
      lines.push('\n## 🌐 Yunwu 可用模型（实时查询）\n');
      try {
        const yunwuModels = await this.fetchYunwuModels();
        if (yunwuModels.length > 0) {
          const presetModelNames = new Set(
            Array.from(this.presetModels.values())
              .filter(m => !this.fallbacks.find(f => f.id === m.id))
              .map(m => m.model)
          );
          const presetList: string[] = [];
          const otherList: string[] = [];
          for (const name of yunwuModels) {
            if (presetModelNames.has(name)) presetList.push(`✅ \`${name}\``);
            else otherList.push(`\`${name}\``);
          }
          if (presetList.length > 0) lines.push(`**已预设** (${presetList.length}): ${presetList.join(', ')}\n`);
          if (otherList.length > 0) lines.push(`**可直通调用** (${otherList.length}): ${otherList.join(', ')}\n`);lines.push(`\n> 💡 直通调用: \`call_model(model_id="模型名", prompt="...")\``);
        } else {
          lines.push('> ⚠️ 无法获取 yunwu 模型列表，但直通调用仍然可用');
        }
      } catch {
        lines.push('> ⚠️ 获取 yunwu 模型列表失败，但直通调用仍然可用');
      }
    }

    lines.push('\n---');
    lines.push('**使用方式**: `call_model(model_id="claude-opus", prompt="...")`');

    return { content: [{ type: 'text', text: lines.join('\n') }] };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error(`AI Model MCP Server v2 running (${this.presetModels.size} preset models, pass-through enabled)`);
  }
}

const server = new AIModelServer();
server.run().catch(console.error);