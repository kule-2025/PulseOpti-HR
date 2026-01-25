#!/bin/bash

# Vercel 部署诊断与触发脚本

echo "========================================"
echo "Vercel 部署诊断与触发"
echo "========================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 检查 Git 状态
echo "1. Git 状态检查"
echo "----------------------------------------"
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Git 仓库存在"
    git status
    echo ""
else
    echo -e "${RED}✗${NC} 不是 Git 仓库"
    exit 1
fi

# 2. 检查远程仓库
echo "2. 远程仓库检查"
echo "----------------------------------------"
REMOTE=$(git remote get-url origin 2>/dev/null)
if [ -n "$REMOTE" ]; then
    echo -e "${GREEN}✓${NC} 远程仓库: $REMOTE"
    echo ""
else
    echo -e "${RED}✗${NC} 未配置远程仓库"
    exit 1
fi

# 3. 检查最新提交
echo "3. 最新提交检查"
echo "----------------------------------------"
LOCAL_COMMIT=$(git rev-parse HEAD)
echo "本地最新提交: $LOCAL_COMMIT"
git log -1 --oneline
echo ""

# 4. 检查远程分支状态
echo "4. 远程分支状态检查"
echo "----------------------------------------"
git fetch origin main 2>/dev/null
REMOTE_COMMIT=$(git rev-parse origin/main 2>/dev/null)
if [ -n "$REMOTE_COMMIT" ]; then
    echo "远程最新提交: $REMOTE_COMMIT"
    if [ "$LOCAL_COMMIT" == "$REMOTE_COMMIT" ]; then
        echo -e "${GREEN}✓${NC} 本地和远程同步"
    else
        echo -e "${YELLOW}⚠${NC} 本地和远程不同步"
        echo "本地领先/落后远程: $(git rev-list --count --left-right origin/main...HEAD)"
    fi
else
    echo -e "${YELLOW}⚠${NC} 无法获取远程分支状态"
fi
echo ""

# 5. 检查 Vercel 配置
echo "5. Vercel 配置检查"
echo "----------------------------------------"
if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✓${NC} vercel.json 存在"
    echo "构建命令: $(grep -o '"buildCommand": "[^"]*"' vercel.json | cut -d'"' -f4)"
    echo "输出目录: $(grep -o '"outputDirectory": "[^"]*"' vercel.json | cut -d'"' -f4)"
    echo "框架: $(grep -o '"framework": "[^"]*"' vercel.json | cut -d'"' -f4)"
else
    echo -e "${YELLOW}⚠${NC} vercel.json 不存在"
fi
echo ""

# 6. 检查 Next.js 配置
echo "6. Next.js 配置检查"
echo "----------------------------------------"
if [ -f "next.config.ts" ] || [ -f "next.config.js" ]; then
    echo -e "${GREEN}✓${NC} Next.js 配置存在"
else
    echo -e "${YELLOW}⚠${NC} Next.js 配置不存在"
fi
echo ""

# 7. 检查环境变量
echo "7. 环境变量检查"
echo "----------------------------------------"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env 文件存在"
    echo "环境变量:"
    grep -E "^[A-Z_]+" .env | sed 's/=.*/=***/' | head -10
else
    echo -e "${YELLOW}⚠${NC} .env 文件不存在"
fi
echo ""

# 8. 检查 Vercel CLI
echo "8. Vercel CLI 检查"
echo "----------------------------------------"
if command -v vercel &> /dev/null; then
    echo -e "${GREEN}✓${NC} Vercel CLI 已安装: $(vercel --version)"
else
    echo -e "${YELLOW}⚠${NC} Vercel CLI 未安装"
fi
echo ""

# 9. 部署状态总结
echo "========================================"
echo "部署状态总结"
echo "========================================"
echo ""
echo "项目信息:"
echo "  仓库名称: tomato-writer-2024/PulseOpti-HR"
echo "  Vercel Dashboard: https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr"
echo "  部署列表: https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments"
echo ""
echo "应用 URL:"
echo "  生产环境: https://pulseopti-hr.vercel.app"
echo "  预览环境: https://pulseopti-hr-git-tomato-writer-2024-pulseopti-hr.vercel.app"
echo ""

# 10. 诊断结果
echo "========================================"
echo "诊断结果"
echo "========================================"
echo ""

# 检查是否需要推送
if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
    echo -e "${YELLOW}⚠${NC} 需要推送代码到远程仓库"
    echo "运行: git push origin main"
    echo ""
fi

# 11. 下一步操作
echo "========================================"
echo "下一步操作"
echo "========================================"
echo ""
echo "方式 1: 通过 Vercel Dashboard 触发部署"
echo "  1. 访问: https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments"
echo "  2. 点击 'Redeploy' 按钮"
echo "  3. 选择 'Redeploy to Production'"
echo ""
echo "方式 2: 通过 GitHub Webhook（如果已配置）"
echo "  1. 确保代码已推送到 GitHub"
echo "  2. Vercel 会自动检测到新的提交并触发部署"
echo ""
echo "方式 3: 使用 Vercel CLI（需要登录）"
echo "  1. 登录 Vercel: vercel login"
echo "  2. 触发部署: vercel --prod"
echo ""
echo "方式 4: 通过 GitHub Actions（如果已配置）"
echo "  1. 访问: https://github.com/tomato-writer-2024/PulseOpti-HR/actions"
echo "  2. 查看工作流状态"
echo ""
