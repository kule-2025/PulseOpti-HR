#!/bin/bash

# Vercel 部署脚本（跳过登录检查）

set -e

echo "========================================"
echo "Vercel 部署（跳过登录检查）"
echo "========================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查 Vercel CLI
echo -e "${BLUE}检查 Vercel CLI${NC}"
echo "----------------------------------------"

if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI 未安装${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Vercel CLI 已安装: $(vercel --version)${NC}"
echo ""

# 检查 Git 状态
echo -e "${BLUE}检查 Git 状态${NC}"
echo "----------------------------------------"

if git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Git 仓库存在${NC}"
    echo "当前分支: $(git branch --show-current)"
    echo "最新提交: $(git log -1 --oneline)"
    echo ""

    # 检查是否有未推送的提交
    git fetch origin main > /dev/null 2>&1
    LOCAL_COMMIT=$(git rev-parse HEAD)
    REMOTE_COMMIT=$(git rev-parse origin/main 2>/dev/null)

    if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
        echo -e "${YELLOW}⚠ 检测到未推送的提交${NC}"
        echo "正在推送到 GitHub..."
        git push origin main
        echo -e "${GREEN}✅ 推送成功${NC}"
    else
        echo -e "${GREEN}✅ 代码已同步${NC}"
    fi
else
    echo -e "${RED}❌ 不是 Git 仓库${NC}"
    exit 1
fi
echo ""

# 检查项目链接
echo -e "${BLUE}检查项目链接${NC}"
echo "----------------------------------------"

if [ -f ".vercel/project.json" ]; then
    echo -e "${GREEN}✅ 项目已链接${NC}"
else
    echo -e "${YELLOW}⚠ 项目未链接${NC}"
    echo ""
    echo "尝试链接项目..."
    vercel link --yes

    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 链接失败${NC}"
        echo ""
        echo "提示: 请在 Vercel Dashboard 中手动创建项目并配置 GitHub 集成"
        echo "https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr"
        exit 1
    fi

    echo -e "${GREEN}✅ 链接成功${NC}"
fi
echo ""

# 部署到生产环境
echo -e "${BLUE}部署到生产环境${NC}"
echo "----------------------------------------"
echo "正在部署到生产环境..."
echo ""

vercel --prod --yes

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ 部署成功${NC}"
else
    echo ""
    echo -e "${RED}❌ 部署失败${NC}"
    exit 1
fi
echo ""

# 等待部署完成
echo -e "${BLUE}等待部署完成${NC}"
echo "----------------------------------------"
echo "等待 10 秒后验证部署..."
sleep 10
echo ""

# 验证部署
echo -e "${BLUE}验证部署${NC}"
echo "----------------------------------------"
echo "正在检查应用 URL..."

if curl -I --max-time 10 https://pulseopti-hr.vercel.app &> /dev/null; then
    echo -e "${GREEN}✅ 应用可以访问${NC}"
    echo ""
    echo "应用 URL: https://pulseopti-hr.vercel.app"
else
    echo -e "${YELLOW}⚠ 应用暂时无法访问${NC}"
    echo ""
    echo "可能还在部署中，请稍后再试："
    echo "  https://pulseopti-hr.vercel.app"
    echo ""
    echo "或者访问 Vercel Dashboard 查看部署状态："
    echo "  https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments"
fi
echo ""

echo "========================================"
echo -e "${GREEN}部署流程完成${NC}"
echo "========================================"
echo ""
echo "应用 URL: https://pulseopti-hr.vercel.app"
echo "Vercel Dashboard: https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr"
echo ""
