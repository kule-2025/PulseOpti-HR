#!/bin/bash

# Vercel 部署诊断脚本
# 用于检查 Vercel 部署状态和常见问题

set -e

echo "=========================================="
echo "Vercel 部署诊断脚本"
echo "=========================================="
echo ""

# 1. 检查 Git 状态
echo "1. 检查 Git 状态..."
if [ -d ".git" ]; then
    BRANCH=$(git branch --show-current)
    LATEST_COMMIT=$(git log -1 --oneline)
    REMOTE_URL=$(git remote get-url origin)

    echo "   ✓ Git 仓库存在"
    echo "   当前分支: $BRANCH"
    echo "   最新提交: $LATEST_COMMIT"
    echo "   远程仓库: $REMOTE_URL"
else
    echo "   ✗ 错误: 不是 Git 仓库"
    exit 1
fi
echo ""

# 2. 检查是否与远程同步
echo "2. 检查远程同步状态..."
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    echo "   ✓ 本地与远程已同步"
    echo "   提交哈希: $LOCAL"
else
    echo "   ⚠ 警告: 本地与远程不同步"
    echo "   本地: $LOCAL"
    echo "   远程: $REMOTE"
    echo "   需要运行: git push origin main"
fi
echo ""

# 3. 检查 vercel.json 配置
echo "3. 检查 vercel.json 配置..."
if [ -f "vercel.json" ]; then
    echo "   ✓ vercel.json 存在"
    BUILD_CMD=$(grep -o '"buildCommand"[^,]*' vercel.json | head -1)
    echo "   $BUILD_CMD"

    # 检查环境变量配置
    if grep -q "env" vercel.json; then
        echo "   ✓ 已配置环境变量引用"
    else
        echo "   ⚠ 警告: 未发现环境变量配置"
    fi
else
    echo "   ✗ 错误: vercel.json 不存在"
fi
echo ""

# 4. 检查 package.json
echo "4. 检查 package.json..."
if [ -f "package.json" ]; then
    echo "   ✓ package.json 存在"

    if grep -q '"build"' package.json; then
        BUILD_SCRIPT=$(grep -A 1 '"build"' package.json | tail -1)
        echo "   构建脚本: $BUILD_SCRIPT"
    fi

    if grep -q '"start"' package.json; then
        START_SCRIPT=$(grep -A 1 '"start"' package.json | tail -1)
        echo "   启动脚本: $START_SCRIPT"
    fi
else
    echo "   ✗ 错误: package.json 不存在"
fi
echo ""

# 5. 检查依赖文件
echo "5. 检查依赖文件..."
if [ -f "pnpm-lock.yaml" ]; then
    echo "   ✓ pnpm-lock.yaml 存在（使用 pnpm）"
elif [ -f "package-lock.json" ]; then
    echo "   ⚠ 警告: package-lock.json 存在（使用 npm，项目要求 pnpm）"
elif [ -f "yarn.lock" ]; then
    echo "   ⚠ 警告: yarn.lock 存在（使用 yarn，项目要求 pnpm）"
else
    echo "   ⚠ 警告: 未找到锁文件"
fi
echo ""

# 6. 检查 .gitignore
echo "6. 检查 .gitignore..."
if [ -f ".gitignore" ]; then
    echo "   ✓ .gitignore 存在"

    if grep -q "\.env" .gitignore; then
        echo "   ✓ 环境变量文件已忽略"
    fi

    if grep -q "node_modules" .gitignore; then
        echo "   ✓ node_modules 已忽略"
    fi
else
    echo "   ⚠ 警告: .gitignore 不存在"
fi
echo ""

# 7. 检查 Next.js 配置
echo "7. 检查 Next.js 配置..."
if [ -f "next.config.ts" ] || [ -f "next.config.js" ]; then
    echo "   ✓ Next.js 配置文件存在"
else
    echo "   ⚠ 警告: 未找到 Next.js 配置文件"
fi
echo ""

# 8. 提供下一步建议
echo "=========================================="
echo "诊断总结"
echo "=========================================="
echo ""
echo "如果 Git 已同步但 Vercel 未部署，请检查："
echo ""
echo "1. Vercel Dashboard 设置："
echo "   https://vercel.com/dashboard"
echo ""
echo "2. 确认以下配置："
echo "   - 项目是否连接到正确的 GitHub 仓库"
echo "   - Git 分支是否设置为 'main'"
echo "   - GitHub Webhook 是否正常工作"
echo ""
echo "3. 环境变量配置："
echo "   在 Vercel Dashboard → Settings → Environment Variables 中配置："
echo "   - DATABASE_URL"
echo "   - COZE_BUCKET_ENDPOINT_URL"
echo "   - COZE_BUCKET_NAME"
echo ""
echo "4. 手动触发部署："
echo "   在 Vercel Dashboard 中点击 'Deployments' → 'New Deployment'"
echo ""
echo "5. 查看详细部署日志："
echo "   https://vercel.com/tomato-writer-2024/PulseOpti-HR/deployments"
echo ""
