# 基本使用示例

## 1. 本地开发

```bash
# 安装依赖
cd /Users/libao/git/mcp-infrastructure
pnpm install

# 构建所有包
pnpm build

# 开发模式（自动重新编译）
pnpm dev
```

## 2. 在MCP配置中使用

编辑你的MCP配置文件（通常在 `~/.config/cline/mcp_settings.json`）：

```json
{
  "mcpServers": {
    "ai-model": {
      "command": "node",
      "args": [
        "/Users/libao/git/mcp-infrastructure/packages/ai-model-server/dist/index.js"
      ],
      "env": {
        "YUNWU_API_KEY": "your-key",
        "YUNWU_BASE_URL": "http://hw.yunwu.ai:3000/v1"
      }
    }
  }
}
```

## 3. 在其他项目中使用

### 方式A：本地链接（推荐开发阶段）

```bash
# 在基础设施仓库
cd /Users/libao/git/mcp-infrastructure/packages/ai-model-server
pnpm link --global

# 在你的项目中
cd /Users/libao/git/family
pnpm link --global @mcp-infra/ai-model-server
```

### 方式B：相对路径引用

在你的项目的 `package.json` 中：

```json
{
  "dependencies": {
    "@mcp-infra/ai-model-server": "file:../mcp-infrastructure/packages/ai-model-server"
  }
}
```

## 4. 调用示例

```typescript
import { OpenAIProvider } from '@mcp-infra/ai-model-server';

const provider = new OpenAIProvider({
  provider: 'openai',
  model: 'claude-opus-4-6',
  apiKey: process.env.YUNWU_API_KEY,
  baseURL: 'http://hw.yunwu.ai:3000/v1',
  maxTokens: 4096,
});

const response = await provider.chat([
  { role: 'user', content: '你好，请介绍一下自己' }
]);

console.log(response.content);