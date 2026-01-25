#!/bin/bash

# Vercel GitHub Webhook 触发脚本

echo "========================================"
echo "Vercel GitHub Webhook 触发"
echo "========================================"
echo ""

# 获取最新的 commit hash
LATEST_COMMIT=$(git rev-parse HEAD)
echo "最新提交: $LATEST_COMMIT"
echo ""

# 检查远程仓库状态
echo "检查远程仓库状态..."
git fetch origin main
REMOTE_COMMIT=$(git rev-parse origin/main)

if [ "$LATEST_COMMIT" == "$REMOTE_COMMIT" ]; then
    echo "✅ 本地和远程同步"
else
    echo "⚠ 本地和远程不同步"
    echo "正在推送代码..."
    git push origin main
fi

echo ""
echo "========================================"
echo "触发 Vercel 部署"
echo "========================================"
echo ""

# 如果 Vercel 已经连接到 GitHub，推送代码会自动触发部署
# 让我们创建一个空的 commit 来触发 webhook

echo "创建空 commit 来触发 Vercel Webhook..."
echo "[Vercel Auto-Deploy] Trigger deployment" >> .vercel-deploy-trigger
git add .vercel-deploy-trigger
git commit -m "[vercel] 触发自动部署"

echo "推送代码到 GitHub..."
git push origin main

echo ""
echo "========================================"
echo "等待 Vercel 自动部署"
echo "========================================"
echo ""

echo "代码已推送到 GitHub，Vercel 应该会自动检测并触发部署"
echo ""
echo "你可以："
echo "1. 访问 Vercel Dashboard 查看部署状态"
echo "   https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments"
echo ""
echo "2. 访问 GitHub 查看最新的 commit"
echo "   https://github.com/tomato-writer-2024/PulseOpti-HR/commits/main"
echo ""
echo "3. 等待 2-5 分钟后访问应用"
echo "   https://pulseopti-hr.vercel.app"
echo ""

# 清理触发文件
git rm .vercel-deploy-trigger
git commit -m "[vercel] 清理触发文件"
git push origin main

echo "✅ 触发完成"
echo ""
