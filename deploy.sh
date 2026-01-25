#!/bin/bash

# Vercel 部署快速启动脚本

echo "========================================"
echo "Vercel 部署快速启动"
echo "========================================"
echo ""

# 检查 Vercel CLI 是否已安装
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装"
    echo "正在安装 Vercel CLI..."
    pnpm add -g vercel
fi

echo "✅ Vercel CLI 已安装: $(vercel --version)"
echo ""

# 检查是否已登录
echo "检查 Vercel 登录状态..."
if vercel whoami &> /dev/null; then
    echo "✅ 已登录到 Vercel"
    vercel whoami
else
    echo "❌ 未登录到 Vercel"
    echo ""
    echo "请运行以下命令登录："
    echo "  vercel login"
    echo ""
    echo "或者使用 GitHub Actions 自动部署："
    echo "  1. 访问 https://vercel.com/account/tokens 创建 Token"
    echo "  2. 在 GitHub 添加 Secret: VERCEL_TOKEN"
    echo "  3. 推送代码触发自动部署"
    exit 1
fi

echo ""
echo "========================================"
echo "选择部署方式"
echo "========================================"
echo ""
echo "1. 生产环境部署 (vercel --prod)"
echo "2. 预览环境部署 (vercel)"
echo "3. 退出"
echo ""
read -p "请选择 (1-3): " choice

case $choice in
    1)
        echo ""
        echo "开始生产环境部署..."
        vercel --prod
        ;;
    2)
        echo ""
        echo "开始预览环境部署..."
        vercel
        ;;
    3)
        echo "退出"
        exit 0
        ;;
    *)
        echo "无效选择"
        exit 1
        ;;
esac

echo ""
echo "========================================"
echo "部署完成"
echo "========================================"
echo ""
echo "生产环境 URL: https://pulseopti-hr.vercel.app"
echo "Vercel Dashboard: https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr"
echo ""
