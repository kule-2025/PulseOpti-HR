#!/bin/bash

# Vercel 部署状态检查脚本

echo "========================================"
echo "Vercel 部署状态检查"
echo "========================================"
echo ""

# 检查 Git 状态
echo "1. Git 状态"
echo "----------------------------------------"
git log --oneline -5
echo ""

# 检查远程仓库
echo "2. 远程仓库"
echo "----------------------------------------"
git remote -v
echo ""

# 显示部署信息
echo "3. 部署信息"
echo "----------------------------------------"
echo "Vercel Dashboard:"
echo "  https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr"
echo ""
echo "部署列表:"
echo "  https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments"
echo ""

# 显示应用 URL
echo "4. 应用 URL"
echo "----------------------------------------"
echo "生产环境:"
echo "  https://pulseopti-hr.vercel.app"
echo ""
echo "预览环境:"
echo "  https://pulseopti-hr-git-tomato-writer-2024-pulseopti-hr.vercel.app"
echo ""

# 显示环境变量配置提示
echo "5. 环境变量配置"
echo "----------------------------------------"
echo "请确保在 Vercel Dashboard 中配置以下环境变量："
echo "  DATABASE_URL"
echo "  COZE_BUCKET_ENDPOINT_URL"
echo "  COZE_BUCKET_NAME"
echo "  COZE_WORKLOAD_IDENTITY_API_KEY"
echo ""
echo "配置页面:"
echo "  https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/settings/environment-variables"
echo ""

# 显示健康检查命令
echo "6. 健康检查"
echo "----------------------------------------"
echo "检查应用是否正常运行："
echo "  curl -I https://pulseopti-hr.vercel.app"
echo ""

# 显示下一步操作
echo "========================================"
echo "下一步操作"
echo "========================================"
echo ""
echo "1. 访问 Vercel Dashboard 查看部署状态"
echo "2. 检查环境变量是否配置正确"
echo "3. 部署完成后测试应用功能"
echo "4. 查看部署日志确认没有错误"
echo ""
echo "详细文档: DEPLOYMENT_STATUS.md"
echo ""
