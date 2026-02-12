# 贡献指南

感谢你对MCP Infrastructure项目的关注！

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git

### 本地开发

1. **Fork并克隆仓库**

```bash
git clone https://github.com/YOUR_USERNAME/mcp-infrastructure.git
cd mcp-infrastructure
```

2. **安装依赖**

```bash
pnpm install
```

3. **开发模式**

```bash
# 启动所有包的watch模式
pnpm dev

# 或只开发特定包
cd packages/ai-model-server
pnpm dev
```

4. **构建**

```bash
pnpm build
```

5. **测试**

```bash
pnpm test
```

## 📝 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type类型

- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 示例

```bash
feat(ai-model-server): add support for new AI provider

- Add DeepSeek provider implementation
- Update model configuration
- Add tests for new provider

Closes #123
```

## 🌳 分支策略

- `master` - 主分支，保持稳定
- `develop` - 开发分支
- `feature/*` - 功能分支
- `fix/*` - 修复分支

## 🔍 代码审查

所有PR都需要经过代码审查：

1. 确保所有测试通过
2. 代码符合项目风格
3. 更新相关文档
4. 添加必要的测试

## 📦 添加新的MCP服务

1. 在 `packages/` 下创建新目录
2. 初始化 `package.json`
3. 实现MCP服务接口
4. 添加测试和文档
5. 更新根README

示例结构：
```
packages/your-server/
├── src/
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## 🐛 报告Bug

使用GitHub Issues报告bug，请包含：

- 问题描述
- 复现步骤
- 预期行为
- 实际行为
- 环境信息（OS、Node版本等）

## 💡 功能建议

欢迎提出新功能建议！请在Issue中详细描述：

- 功能描述
- 使用场景
- 预期效果
- 可能的实现方案

## 📄 License

通过贡献代码，你同意你的贡献将在MIT许可证下发布。