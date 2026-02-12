/**
 * Common utilities for MCP infrastructure
 */

export function validateEnvVar(name: string, required: boolean = true): string | undefined {
  const value = process.env[name];
  if (required && !value) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value;
}

export function parseJSON<T>(json: string, fallback?: T): T {
  try {
    return JSON.parse(json);
  } catch (error) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Failed to parse JSON: ${error}`);
  }
}

export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    backoff?: boolean;
  } = {}
): Promise<T> {
  const { maxAttempts = 3, delayMs = 1000, backoff = true } = options;
  
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        const delay = backoff ? delayMs * attempt : delayMs;
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}