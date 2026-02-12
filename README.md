# MCP Infrastructure

统一的MCP基础设施，为所有项目提供可复用的服务。

## 🏗️ 架构设计

采用Monorepo架构，使用pnpm workspace管理多个MCP服务包：

```
mcp-infrastructure/
├── packages/
│   ├── ai-model-server/      # AI模型调用服务
│   ├── shared/                # 共享工具库
│   └── [future-servers]/      # 未来的服务
├── examples/                  # 使用示例
└── docs/                      # 文档
```

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 启动所有服务的开发模式
pnpm dev

# 或启动特定服务
cd packages/ai-model-server
pnpm dev
```

### 构建

```bash
pnpm build
```

## 📦 包列表

### @mcp-infra/ai-model-server

AI模型调用服务，支持多种AI提供商：
- OpenAI
- Anthropic
- Google Gemini
- DeepSeek
- 阿里通义千问

### @mcp-infra/shared

共享工具库，包含：
- 通用类型定义
- 工具函数
- 配置管理

## 🔧 在项目中使用

### 方式1：本地链接（开发阶段）

```bash
# 在基础设施仓库
cd packages/ai-model-server
pnpm link --global

# 在你的项目中
pnpm link --global @mcp-infra/ai-model-server
```

### 方式2：NPM包（生产环境）

```bash
pnpm add @mcp-infra/ai-model-server
```

### 配置MCP

在你的MCP配置文件中：

```json
{
  "mcpServers": {
    "ai-model": {
      "command": "node",
      "args": [
        "/path/to/mcp-infrastructure/packages/ai-model-server/dist/index.js"
      ],
      "env": {
        "OPENAI_API_KEY": "your-key",
        "ANTHROPIC_API_KEY": "your-key"
      }
    }
  }
}
```

## 🛠️ 开发指南

### 添加新服务

1. 在`packages/`下创建新目录
2. 初始化package.json
3. 实现MCP服务接口
4. 添加测试和文档

### 发布流程

```bash
# 更新版本
pnpm version patch|minor|major

# 构建
pnpm build

# 发布（如果配置了NPM）
pnpm publish:all
```

## 📝 最佳实践

1. **版本管理**：每个包独立版本控制
2. **向后兼容**：保持API稳定性
3. **文档完善**：每个服务都有详细文档
4. **测试覆盖**：关键功能必须有测试
5. **类型安全**：使用TypeScript确保类型安全

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 License

MIT