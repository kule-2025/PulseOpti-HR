#!/bin/bash

# Vercel 部署状态检查脚本

echo "========================================"
echo "Vercel 部署状态检查"
echo "========================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取最新的 20 个提交
echo -e "${BLUE}最近的提交记录${NC}"
echo "----------------------------------------"
git log --oneline -20
echo ""

# 检查本地和远程是否同步
echo -e "${BLUE}检查本地和远程同步状态${NC}"
echo "----------------------------------------"
LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/main 2>/dev/null)

if [ "$LOCAL_COMMIT" == "$REMOTE_COMMIT" ]; then
    echo -e "${GREEN}✓${NC} 本地和远程同步"
    echo "最新提交: $LOCAL_COMMIT"
else
    echo -e "${YELLOW}⚠${NC} 本地和远程不同步"
    echo "本地提交: $LOCAL_COMMIT"
    echo "远程提交: $REMOTE_COMMIT"
fi
echo ""

# 列出应该部署的重要提交
echo -e "${BLUE}应该部署的重要版本${NC}"
echo "----------------------------------------"

# 列出功能更新和修复的提交
git log --oneline --grep="feat:" -10
echo ""

git log --oneline --grep="fix:" -10
echo ""

# 检查应用状态
echo -e "${BLUE}检查应用部署状态${NC}"
echo "----------------------------------------"

if curl -I --max-time 10 https://pulseopti-hr.vercel.app &> /dev/null; then
    echo -e "${GREEN}✓${NC} 应用可以访问"
    echo "应用 URL: https://pulseopti-hr.vercel.app"
else
    echo -e "${RED}✗${NC} 应用无法访问"
    echo "应用 URL: https://pulseopti-hr.vercel.app"
    echo ""
    echo "可能的原因："
    echo "1. Vercel 没有自动触发部署"
    echo "2. 部署正在进行中"
    echo "3. 部署失败了"
    echo "4. GitHub 集成未正确配置"
fi
echo ""

# 统计待部署的提交
echo -e "${BLUE}部署建议${NC}"
echo "----------------------------------------"

echo "由于 Vercel 自动部署似乎没有工作，建议手动部署。"
echo ""
echo "最近的未部署更新："
echo ""

# 列出最近的功能更新
echo -e "${YELLOW}功能更新（需要部署）${NC}:"
git log --oneline --grep="feat:" -5 | head -5
echo ""

echo -e "${YELLOW}修复更新（需要部署）${NC}:"
git log --oneline --grep="fix:" -5 | head -5
echo ""

echo "========================================"
echo -e "${BLUE}立即部署${NC}"
echo "========================================"
echo ""
echo "选择部署方法："
echo ""
echo "1. Windows 用户：双击运行 one-click-deploy.bat"
echo "2. PowerShell 用户：右键运行 one-click-deploy.ps1"
echo "3. 手动部署："
echo "   vercel login"
echo "   vercel link"
echo "   vercel --prod --yes"
echo ""
