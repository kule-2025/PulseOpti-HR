#!/bin/bash

# Vercel 自动部署脚本

set -e

echo "========================================"
echo "Vercel 自动部署"
echo "========================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Vercel CLI 是否已安装
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI 未安装${NC}"
    echo "正在安装 Vercel CLI..."
    pnpm add -g vercel
fi

echo -e "${GREEN}✅ Vercel CLI 已安装: $(vercel --version)${NC}"
echo ""

# 检查是否已登录
echo "检查 Vercel 登录状态..."
if vercel whoami &> /dev/null; then
    echo -e "${GREEN}✅ 已登录到 Vercel${NC}"
    vercel whoami
else
    echo -e "${YELLOW}⚠ 未登录到 Vercel${NC}"
    echo ""
    echo "请提供 Vercel Token 来自动部署："
    echo ""
    echo "获取 Vercel Token："
    echo "1. 访问 https://vercel.com/account/tokens"
    echo "2. 点击 'Create Token'"
    echo "3. 输入 Token 名称（如：Auto-Deploy）"
    echo "4. 选择 Token 作用域：Full Account"
    echo "5. 复制生成的 Token"
    echo ""
    read -p "请输入 Vercel Token (或按 Enter 跳过): " VERCEL_TOKEN

    if [ -z "$VERCEL_TOKEN" ]; then
        echo -e "${RED}❌ 未提供 Vercel Token，无法继续${NC}"
        echo ""
        echo "备选方案："
        echo "1. 访问 Vercel Dashboard 手动触发部署"
        echo "   https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments"
        echo ""
        echo "2. 手动运行 'vercel login' 登录"
        echo ""
        exit 1
    fi

    # 使用 token 登录
    echo "正在登录到 Vercel..."
    echo "$VERCEL_TOKEN" | vercel login --token "$VERCEL_TOKEN"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 登录成功${NC}"
    else
        echo -e "${RED}❌ 登录失败${NC}"
        exit 1
    fi
fi

echo ""
echo "========================================"
echo "开始部署到生产环境"
echo "========================================"
echo ""

# 部署到生产环境
echo "正在部署到生产环境..."
vercel --prod --yes

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ 部署成功${NC}"
    echo ""
    echo "应用 URL: https://pulseopti-hr.vercel.app"
    echo "Vercel Dashboard: https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr"
    echo ""
else
    echo ""
    echo -e "${RED}❌ 部署失败${NC}"
    echo ""
    echo "请检查错误信息并重试"
    echo ""
    exit 1
fi

echo "========================================"
echo "验证部署"
echo "========================================"
echo ""

# 等待部署完成
echo "等待部署完成..."
sleep 5

# 检查应用是否可以访问
echo "检查应用是否可以访问..."
if curl -I https://pulseopti-hr.vercel.app &> /dev/null; then
    echo -e "${GREEN}✅ 应用可以访问${NC}"
else
    echo -e "${YELLOW}⚠ 应用暂时无法访问，可能还在部署中${NC}"
    echo "请稍后再试：https://pulseopti-hr.vercel.app"
fi

echo ""
echo "========================================"
echo "部署完成"
echo "========================================"
echo ""
