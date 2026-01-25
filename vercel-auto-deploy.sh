#!/bin/bash

# Vercel 自动部署解决方案脚本
# 这个脚本会尝试多种方法来触发 Vercel 部署

set -e

echo "========================================"
echo "Vercel 自动部署解决方案"
echo "========================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 方法 1: 使用 Vercel CLI（需要登录）
echo "方法 1: 使用 Vercel CLI 部署"
echo "========================================"
echo ""

if command -v vercel &> /dev/null; then
    echo -e "${GREEN}✅${NC} Vercel CLI 已安装: $(vercel --version)"
    echo ""

    # 检查是否已登录
    if vercel whoami &> /dev/null; then
        echo -e "${GREEN}✅${NC} 已登录到 Vercel"
        echo ""

        echo "正在部署到生产环境..."
        vercel --prod --yes

        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}✅ 部署成功！${NC}"
            echo ""
            echo "应用 URL: https://pulseopti-hr.vercel.app"
            echo ""
            exit 0
        else
            echo ""
            echo -e "${RED}❌ 部署失败${NC}"
            echo ""
        fi
    else
        echo -e "${YELLOW}⚠ 未登录到 Vercel${NC}"
        echo ""
        echo "请运行以下命令登录："
        echo "  vercel login"
        echo ""
    fi
else
    echo -e "${YELLOW}⚠ Vercel CLI 未安装${NC}"
    echo ""
    echo "请运行以下命令安装："
    echo "  pnpm add -g vercel"
    echo ""
fi

# 方法 2: 使用 GitHub Webhook（Vercel 已连接到 GitHub）
echo ""
echo "方法 2: 使用 GitHub Webhook 触发"
echo "========================================"
echo ""

echo "这个方法会创建一个空 commit 并推送到 GitHub，"
echo "如果 Vercel 已连接到 GitHub，应该会自动触发部署。"
echo ""

read -p "是否继续？(y/n): " choice
if [[ "$choice" =~ ^[Yy]$ ]]; then
    echo ""
    echo "创建触发 commit..."
    echo "[Vercel Auto-Deploy] Trigger deployment" >> .vercel-trigger
    git add .vercel-trigger
    git commit -m "[vercel] 触发自动部署 - $(date)"

    echo ""
    echo "推送代码到 GitHub..."
    git push origin main

    echo ""
    echo -e "${GREEN}✅ 触发完成${NC}"
    echo ""
    echo "如果 Vercel 已正确连接到 GitHub，应该会自动触发部署。"
    echo ""
    echo "访问以下链接查看部署状态："
    echo "  https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments"
    echo ""

    # 清理触发文件
    sleep 2
    git rm .vercel-trigger
    git commit -m "[vercel] 清理触发文件"
    git push origin main
else
    echo ""
    echo "已跳过"
fi

# 方法 3: 手动操作指南
echo ""
echo "方法 3: 手动触发部署"
echo "========================================"
echo ""

echo "如果以上方法都无法触发部署，请按照以下步骤手动触发："
echo ""
echo "1. 访问 Vercel Dashboard"
echo "   https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr"
echo ""
echo "2. 进入部署列表"
echo "   https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments"
echo ""
echo "3. 找到最新的部署记录"
echo "4. 点击右侧的 '...' 菜单"
echo "5. 选择 'Redeploy'"
echo "6. 在弹出的对话框中，选择 'Redeploy to Production'"
echo "7. 点击 'Redeploy'"
echo ""

# 验证部署
echo ""
echo "验证部署"
echo "========================================"
echo ""

read -p "是否现在验证部署？(y/n): " verify_choice
if [[ "$verify_choice" =~ ^[Yy]$ ]]; then
    echo ""
    echo "等待 10 秒后检查部署状态..."
    sleep 10

    if curl -I --max-time 10 https://pulseopti-hr.vercel.app &> /dev/null; then
        echo -e "${GREEN}✅ 应用可以访问！${NC}"
        echo ""
        echo "应用 URL: https://pulseopti-hr.vercel.app"
        echo ""
    else
        echo -e "${YELLOW}⚠ 应用暂时无法访问${NC}"
        echo ""
        echo "请稍后再试，或访问 Vercel Dashboard 查看部署状态"
        echo "https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments"
        echo ""
    fi
fi

echo "========================================"
echo "完成"
echo "========================================"
echo ""
