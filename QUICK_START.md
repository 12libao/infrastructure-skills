# 🚀 MCP基础设施 - 快速开始指南

## ✅ 当前状态

你已经完成了所有配置！MCP服务器现在应该可以在VS Code中使用了。

---

## 🧪 测试MCP服务器

### 1. 检查MCP服务器状态

在VS Code中，MCP服务器应该已经自动启动。你可以通过以下方式验证：

**方法A：使用MCP工具**
- 在对话中，尝试使用 `list_models` 工具
- 应该能看到可用的AI模型列表

**方法B：查看MCP日志**
- 在VS Code中查看MCP服务器的输出日志
- 应该看到类似 "AI Model MCP Server v2 running" 的消息

### 2. 可用的MCP工具

你的MCP服务器提供了两个主要工具：

#### `list_models` - 列出可用模型
```
功能：获取所有可用的AI模型列表
返回：9个预设模型 + 动态发现的模型
```

**预设模型**：
- `claude-3-5-sonnet` (thinking) - 深度思考任务
- `claude-3-5-haiku` (fast) - 快速响应
- `gpt-4o` (general) - 通用任务
- `gpt-4o-mini` (fast) - 快速任务
- `gemini-2.0-flash-thinking-exp` (thinking) - 实验性思考模型
- `gemini-2.0-flash-exp` (general) - 实验性通用模型
- `o1` (thinking) - OpenAI推理模型
- `o1-mini` (thinking, fast) - 快速推理
- `o3-mini` (thinking, racer) - 竞速推理

#### `call_model` - 调用AI模型
```
功能：使用指定模型进行AI对话
参数：
  - model: 模型名称（从list_models获取）
  - messages: 对话消息数组
  - options: 可选参数（temperature, max_tokens等）
```

---

## 📝 使用示例

### 示例1：列出所有模型
```
你：请列出所有可用的AI模型

助手会使用 list_models 工具，返回类似：
- claude-3-5-sonnet (thinking)
- gpt-4o (general)
- gemini-2.0-flash-exp (general)
- ... 等等
```

### 示例2：使用特定模型
```
你：使用 claude-3-5-haiku 模型帮我写一个Python函数

助手会使用 call_model 工具调用指定模型
```

### 示例3：直通模式（高级）
```
你：使用 yunwu/qwen-max 模型...

MCP服务器会自动：
1. 检查是否是预设模型
2. 如果不是，直接传递给Yunwu API
3. 动态发现并使用该模型
```

---

## 🔧 配置文件位置

### 本地配置（含API密钥）
```bash
# 环境变量
/Users/libao/git/mcp-infrastructure/.env.local

# MCP配置
/Users/libao/git/mcp-infrastructure/mcp-config-local.json
```

### VS Code MCP配置
```bash
~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

### MCP服务器
```bash
/Users/libao/git/mcp-infrastructure/packages/ai-model-server/dist/index.js
```

---

## 🛠️ 常见操作

### 重新构建MCP服务器
```bash
cd /Users/libao/git/mcp-infrastructure
pnpm build
```

### 更新依赖
```bash
cd /Users/libao/git/mcp-infrastructure
pnpm update
```

### 查看MCP服务器版本
```bash
node packages/ai-model-server/dist/index.js --version
```

### 重启MCP服务器
```bash
# 方法1：重启VS Code
# 方法2：在VS Code中重新加载MCP配置
```

---

## 🗑️ 清理旧目录（可选）

如果旧的MCP服务器目录还在，可以安全删除：

```bash
# 使用清理脚本（推荐）
cd /Users/libao/git/mcp-infrastructure
./cleanup-old-server.sh

# 或手动删除
rm -rf ~/Documents/Cline/MCP/ai-model-server/
```

---

## 🔐 安全提醒

- ✅ `.env.local` 和 `mcp-config-local.json` 已在 `.gitignore` 中
- ✅ 这些文件永远不会被提交到Git
- ✅ GitHub仓库中只有模板文件
- ⚠️ 不要使用 `git add -f` 强制添加敏感文件
- ⚠️ 不要在代码中硬编码API密钥

---

## 📚 更多文档

- **架构设计**: `docs/ARCHITECTURE.md`
- **安全配置**: `SECURITY_SETUP.md`
- **完整验证**: `FINAL_VERIFICATION.md`
- **迁移总结**: `MIGRATION_SUMMARY.md`
- **使用示例**: `examples/basic-usage.md`

---

## 🆘 故障排除

### MCP服务器无法启动

1. **检查构建**：
   ```bash
   cd /Users/libao/git/mcp-infrastructure
   pnpm build
   ```

2. **检查配置**：
   ```bash
   cat ~/Library/Application\ Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
   ```

3. **检查日志**：
   - 在VS Code中查看MCP服务器的输出日志
   - 查找错误信息

### 模型调用失败

1. **检查API密钥**：
   ```bash
   cat /Users/libao/git/mcp-infrastructure/.env.local
   ```

2. **检查网络连接**：
   ```bash
   curl -I http://hw.yunwu.ai:3000/v1/models
   ```

3. **查看错误信息**：
   - MCP服务器会返回详细的错误信息
   - 检查是否是API密钥、网络或配额问题

---

## 🎯 下一步

1. ✅ 在对话中尝试使用 `list_models` 工具
2. ✅ 测试调用不同的AI模型
3. ⏳ 清理旧的MCP服务器目录（可选）
4. 🚀 开始使用新的MCP基础设施！

---

**祝使用愉快！** 🎉

如有问题，请参考其他文档或查看GitHub仓库：
https://github.com/12libao/mcp-infrastructure