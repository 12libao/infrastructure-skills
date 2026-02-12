# 🔧 更新MCP配置指南

## 📍 新路径

你的MCP服务器现在位于：
```
/Users/libao/git/mcp-infrastructure/packages/ai-model-server/dist/index.js
```

## 🚀 快速更新

### 方式1：自动更新（推荐）

运行以下命令自动更新配置：

```bash
# 备份当前配置
cp ~/Library/Application\ Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json ~/Library/Application\ Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json.backup

# 使用sed更新路径
sed -i '' 's|/Users/libao/Documents/Cline/MCP/ai-model-server/build/index.js|/Users/libao/git/mcp-infrastructure/packages/ai-model-server/dist/index.js|g' ~/Library/Application\ Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

### 方式2：手动更新

1. **打开MCP配置文件**

```bash
code ~/Library/Application\ Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

2. **找到ai-model-server配置**，将 `args` 路径改为：

```json
{
  "mcpServers": {
    "ai-model-server": {
      "command": "node",
      "args": [
        "/Users/libao/git/mcp-infrastructure/packages/ai-model-server/dist/index.js"
      ],
      "env": {
        "YUNWU_API_KEY": "your-key-here",
        "YUNWU_BASE_URL": "http://hw.yunwu.ai:3000/v1",
        "GEMINI_API_KEY": "your-gemini-key",
        "GITHUB_TOKEN": "your-github-token"
      },
      "disabled": false,
      "autoApprove": [
        "list_models",
        "call_model"
      ]
    }
  }
}
```

3. **保存文件**

## 🔄 重启VS Code

配置更新后，需要重启VS Code或重新加载MCP服务器：

- **完全重启**：退出VS Code并重新打开
- **重新加载MCP**：使用命令面板 (Cmd+Shift+P) → "Reload Window"

## ✅ 验证配置

重启后，在Cline中运行：

```
list_models
```

你应该能看到类似这样的输出：

```
## 📌 预设模型 (9 个)

| 短 ID | 名称 | 角色 | 模型名 | 描述 |
|---|---|---|---|---|
| `claude-opus` | 💬 Claude Opus 4.6 | general | `claude-opus-4-6` | 旗舰级通用 AI |
| `claude-thinking` | 🧠 Claude Opus 4.6 Thinking | thinking | `claude-opus-4-6-thinking` | 深度分析模型 |
...
```

## 🗑️ 清理旧文件（可选）

**⚠️ 重要：只有在确认新配置工作正常后才执行此步骤！**

```bash
# 备份旧目录（推荐）
mv ~/Documents/Cline/MCP/ai-model-server ~/Documents/Cline/MCP/ai-model-server.backup

# 或直接删除（谨慎）
# rm -rf ~/Documents/Cline/MCP/ai-model-server
```

## 🔄 未来更新流程

当基础设施仓库有更新时：

```bash
cd /Users/libao/git/mcp-infrastructure
git pull
pnpm install
pnpm build
```

然后重启VS Code，所有项目自动获得更新。

## 🐛 故障排查

### 问题1：MCP服务器无法启动

**检查路径是否正确**：
```bash
ls -la /Users/libao/git/mcp-infrastructure/packages/ai-model-server/dist/index.js
```

如果文件不存在，重新构建：
```bash
cd /Users/libao/git/mcp-infrastructure
pnpm build
```

### 问题2：环境变量未生效

确保在MCP配置的 `env` 部分设置了所有必需的环境变量：
- `YUNWU_API_KEY`（必需）
- `YUNWU_BASE_URL`（可选，默认值已设置）

### 问题3：模型列表为空

检查API密钥是否有效：
```bash
curl -H "Authorization: Bearer YOUR_YUNWU_API_KEY" \
  http://hw.yunwu.ai:3000/v1/models
```

## 📚 相关文档

- [架构设计文档](docs/ARCHITECTURE.md)
- [使用示例](examples/basic-usage.md)
- [迁移总结](MIGRATION_SUMMARY.md)
- [主README](README.md)

## 💬 需要帮助？

如果遇到问题：
1. 查看 [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md)
2. 检查 [GitHub Issues](https://github.com/12libao/mcp-infrastructure/issues)
3. 查看MCP服务器日志（VS Code开发者工具控制台）