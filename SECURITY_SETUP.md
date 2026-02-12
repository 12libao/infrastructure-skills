# API密钥安全配置指南

## 🔐 安全原则

**绝不将API密钥提交到Git仓库！**

## 📁 本地文件结构

```
mcp-infrastructure/
├── .env.local              # ✅ 本地API密钥（已在.gitignore中）
├── mcp-config-local.json   # ✅ 本地MCP配置（已在.gitignore中）
├── .env.example            # ✅ 模板文件（可提交）
└── mcp-config-template.json # ✅ 模板文件（可提交）
```

## 🔧 配置步骤

### 1. 本地API密钥已保存

你的实际API密钥已保存在：
- `.env.local` - 环境变量格式
- `mcp-config-local.json` - MCP配置格式

这两个文件已被`.gitignore`忽略，不会被提交到Git。

### 2. 更新VS Code的MCP配置

**方法A：使用本地配置文件（推荐）**

编辑VS Code的MCP配置文件：
```bash
code ~/Library/Application\ Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

复制 `mcp-config-local.json` 的内容到上述文件。

**方法B：使用环境变量**

1. 编辑你的shell配置文件（`~/.zshrc` 或 `~/.bashrc`）：
```bash
export YUNWU_API_KEY="your-key"
export GEMINI_API_KEY="your-key"
export GITHUB_TOKEN="your-token"
```

2. 重新加载配置：
```bash
source ~/.zshrc
```

3. MCP配置使用环境变量：
```json
{
  "mcpServers": {
    "ai-model-server": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "YUNWU_API_KEY": "${YUNWU_API_KEY}",
        "GEMINI_API_KEY": "${GEMINI_API_KEY}",
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

### 3. 验证安全性

运行以下命令确保没有敏感信息会被提交：

```bash
# 检查Git状态
git status

# 搜索仓库中的API密钥（应该找不到）
grep -r "sk-MCmzWd80\|AIzaSyBJrGm2\|github_pat_11ALPPDSY0" . \
  --exclude-dir=.git \
  --exclude-dir=node_modules \
  --exclude=".env.local" \
  --exclude="mcp-config-local.json"
```

### 4. 团队协作

其他开发者克隆仓库后：

1. 复制模板文件：
```bash
cp .env.example .env.local
cp mcp-config-template.json mcp-config-local.json
```

2. 填入自己的API密钥

3. 更新VS Code的MCP配置

## ⚠️ 重要提醒

- ✅ `.env.local` 和 `mcp-config-local.json` 已在 `.gitignore` 中
- ✅ 这些文件永远不会被Git追踪
- ✅ GitHub仓库中只有模板文件
- ❌ 永远不要 `git add -f` 强制添加这些文件
- ❌ 不要在代码中硬编码API密钥

## 🔍 定期检查

在每次提交前运行：
```bash
git diff --cached | grep -i "api.*key\|token\|secret"
```

如果有输出，说明可能包含敏感信息，需要检查！