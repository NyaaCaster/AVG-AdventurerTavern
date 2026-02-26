#!/bin/bash
# 推送前的完整检查脚本

set -e

echo "🔍 开始推送前检查..."

# 1. 检查编码问题
echo "\n📝 检查文件编码..."
if npm run check-encoding; then
    echo "✅ 编码检查通过"
else
    echo "❌ 发现编码问题"
    read -p "是否自动修复？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run fix-encoding
        echo "✅ 编码问题已修复，请重新提交"
        exit 1
    else
        echo "❌ 请手动修复编码问题"
        exit 1
    fi
fi

# 2. 类型检查
echo "\n🔍 运行 TypeScript 类型检查..."
if npm run lint; then
    echo "✅ 类型检查通过"
else
    echo "❌ 类型检查失败"
    exit 1
fi

# 3. 构建测试
echo "\n🏗️  测试构建..."
if npm run build; then
    echo "✅ 构建成功"
else
    echo "❌ 构建失败"
    exit 1
fi

echo "\n✅ 所有检查通过，可以安全推送！"
</contents>