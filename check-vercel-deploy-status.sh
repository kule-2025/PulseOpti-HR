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
NC='\033[0m' # No Color

# 检查 Git 状态
echo "1. Git 状态"
echo "----------------------------------------"
echo "最新提交:"
git log -1 --oneline
echo ""
echo "远程提交:"
git log origin/main -1 --oneline
echo ""

# 检查本地和远程是否同步
LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/main)

if [ "$LOCAL_COMMIT" == "$REMOTE_COMMIT" ]; then
    echo -e "${GREEN}✅${NC} 本地和远程同步"
else
    echo -e "${YELLOW}⚠${NC} 本地和远程不同步"
fi
echo ""

# 检查应用状态
echo "2. 应用状态"
echo "----------------------------------------"
echo "正在检查应用 URL..."
if curl -I --max-time 10 https://pulseopti-hr.vercel.app &> /dev/null; then
    echo -e "${GREEN}✅${NC} 应用可以访问: https://pulseopti-hr.vercel.app"
else
    echo -e "${RED}❌${NC} 应用无法访问: https://pulseopti-hr.vercel.app"
    echo ""
    echo "可能的原因："
    echo "1. Vercel 没有自动触发部署"
    echo "2. 部署正在进行中"
    echo "3. 部署失败了"
    echo "4. GitHub 集成未正确配置"
fi
echo ""

# 提供诊断建议
echo "========================================"
echo "诊断建议"
echo "========================================"
echo ""
echo "如果应用无法访问，请尝试以下步骤："
echo ""
echo "步骤 1: 访问 Vercel Dashboard 查看部署状态"
echo "  https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments"
echo ""
echo "步骤 2: 检查 Vercel Git 集成状态"
echo "  https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/settings/git"
echo ""
echo "步骤 3: 手动触发部署（如果需要）"
echo "  在 Vercel Dashboard 中点击 'Redeploy' 按钮"
echo ""
echo "步骤 4: 查看部署日志"
echo "  如果部署失败，查看详细的错误日志"
echo ""
