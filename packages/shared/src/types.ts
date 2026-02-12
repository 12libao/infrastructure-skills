/**
 * Common types for MCP infrastructure
 */

export interface MCPServerConfig {
  name: string;
  version: string;
  description: string;
}

export interface AIModelConfig {
  provider: 'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'qwen';
  model: string;
  apiKey?: string;
  baseURL?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
}