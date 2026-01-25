#!/bin/bash

# Vercel 部署状态检查脚本

echo "========================================="
echo "Vercel 部署状态检查"
echo "========================================="
echo ""

# 1. 检查 Vercel CLI 是否安装
echo "1. 检查 Vercel CLI..."
if command -v vercel &> /dev/null; then
    echo "   ✅ Vercel CLI 已安装"
    vercel --version
else
    echo "   ❌ Vercel CLI 未安装"
    echo "   安装命令: npm i -g vercel"
fi
echo ""

# 2. 检查 Git 状态
echo "2. 检查 Git 状态..."
git remote -v | grep "kule-2025"
if [ $? -eq 0 ]; then
    echo "   ✅ kule-2025 remote 已配置"
    git log -1 --oneline kule-2025/main
else
    echo "   ❌ kule-2025 remote 未配置"
fi
echo ""

# 3. 检查 GitHub 仓库访问
echo "3. 检查 GitHub 仓库..."
GITHUB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://github.com/kule-2025/PulseOpti-HR)
if [ "$GITHUB_STATUS" -eq 200 ]; then
    echo "   ✅ GitHub 仓库可访问 (HTTP 200)"
else
    echo "   ❌ GitHub 仓库无法访问 (HTTP $GITHUB_STATUS)"
fi
echo ""

# 4. 检查 Vercel 项目状态
echo "4. 检查 Vercel 项目..."
if vercel whoami &> /dev/null; then
    echo "   ✅ Vercel CLI 已登录"
    vercel ls
else
    echo "   ❌ Vercel CLI 未登录"
    echo "   登录命令: vercel login"
fi
echo ""

# 5. 检查环境变量文件
echo "5. 检查环境变量..."
if [ -f ".env.production" ]; then
    echo "   ✅ .env.production 文件存在"
    echo "   包含的变量："
    grep -E "^[A-Z_]" .env.production | head -10
else
    echo "   ❌ .env.production 文件不存在"
fi
echo ""

# 6. 检查 vercel.json 配置
echo "6. 检查 vercel.json 配置..."
if [ -f "vercel.json" ]; then
    echo "   ✅ vercel.json 文件存在"
    echo "   构建命令: $(grep -A 1 'buildCommand' vercel.json | tail -1 | cut -d'"' -f 2)"
    echo "   安装命令: $(grep -A 1 'installCommand' vercel.json | tail -1 | cut -d'"' -f 2)"
else
    echo "   ❌ vercel.json 文件不存在"
fi
echo ""

echo "========================================="
echo "检查完成"
echo "========================================="
echo ""
echo "建议操作："
echo "1. 访问 Vercel Dashboard: https://vercel.com/leyou-2026/pulseopti-hr"
echo "2. 检查项目配置和 GitHub 集成"
echo "3. 确认环境变量已配置"
echo "4. 手动触发部署"
echo ""
