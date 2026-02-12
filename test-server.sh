#!/bin/bash
# 快速测试 MCP 服务器是否能正常启动

cd "$(dirname "$0")"

echo "🧪 测试 AI Model MCP Server..."
echo ""

# 检查环境变量是否已设置
if [ -z "$YUNWU_API_KEY" ]; then
    echo "⚠️  警告: YUNWU_API_KEY 未设置"
    echo "   请设置环境变量后再测试"
    echo ""
    echo "   export YUNWU_API_KEY='your-key'"
    echo "   export YUNWU_BASE_URL='http://hw.yunwu.ai:3000/v1'"
    echo ""
    exit 1
fi

echo "✓ 环境变量已设置"
echo ""

# 启动服务器（后台运行，3秒超时）
timeout 3s node packages/ai-model-server/dist/index.js 2>&1 &
PID=$!

sleep 1

if ps -p $PID > /dev/null 2>&1; then
    echo "✅ 服务器启动成功 (PID: $PID)"
    kill $PID 2>/dev/null
    echo "✅ 测试通过"
    exit 0
else
    echo "❌ 服务器启动失败"
    exit 1
fi