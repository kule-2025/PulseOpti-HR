#!/bin/bash

# PulseOpti HR - Vercel 部署脚本
# 此脚本帮助快速部署到 Vercel

set -e

echo "======================================"
echo "  PulseOpti HR - Vercel 部署脚本"
echo "======================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查依赖
check_dependencies() {
    echo -e "${YELLOW}检查依赖...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}错误: 未找到 Node.js${NC}"
        exit 1
    fi
    
    if ! command -v pnpm &> /dev/null; then
        echo -e "${RED}错误: 未找到 pnpm${NC}"
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        echo -e "${YELLOW}安装 Vercel CLI...${NC}"
        npm install -g vercel
    fi
    
    echo -e "${GREEN}✓ 依赖检查通过${NC}"
    echo ""
}

# 运行测试
run_tests() {
    echo -e "${YELLOW}运行测试...${NC}"
    if [ -f "scripts/test-all.js" ]; then
        node scripts/test-all.js
        echo -e "${GREEN}✓ 测试通过${NC}"
    else
        echo -e "${YELLOW}⚠ 未找到测试脚本，跳过${NC}"
    fi
    echo ""
}

# 构建项目
build_project() {
    echo -e "${YELLOW}构建项目...${NC}"
    pnpm build
    echo -e "${GREEN}✓ 构建成功${NC}"
    echo ""
}

# 部署到预览环境
deploy_preview() {
    echo -e "${YELLOW}部署到预览环境...${NC}"
    vercel
    echo -e "${GREEN}✓ 预览部署完成${NC}"
    echo ""
}

# 部署到生产环境
deploy_production() {
    echo -e "${YELLOW}部署到生产环境...${NC}"
    vercel --prod
    echo -e "${GREEN}✓ 生产部署完成${NC}"
    echo ""
}

# 主函数
main() {
    echo "请选择部署环境："
    echo "1) 预览环境"
    echo "2) 生产环境"
    echo ""
    read -p "请输入选项 (1/2): " choice
    
    case $choice in
        1)
            check_dependencies
            run_tests
            build_project
            deploy_preview
            ;;
        2)
            check_dependencies
            run_tests
            build_project
            deploy_production
            ;;
        *)
            echo -e "${RED}无效选项${NC}"
            exit 1
            ;;
    esac
    
    echo ""
    echo -e "${GREEN}======================================"
    echo "  部署完成！"
    echo "======================================${NC}"
    echo ""
    echo "下一步："
    echo "1. 检查应用功能是否正常"
    echo "2. 配置环境变量（如果尚未配置）"
    echo "3. 执行数据库迁移"
    echo "4. 设置监控和告警"
    echo ""
    echo "如需帮助，请参考：docs/VERCEL_DEPLOYMENT.md"
}

# 运行主函数
main
