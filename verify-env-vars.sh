#!/bin/bash

# 环境变量验证脚本

echo "========================================"
echo "Vercel 环境变量验证"
echo "========================================"
echo ""

# 必需的环境变量
REQUIRED_VARS=(
    "DATABASE_URL"
    "COZE_BUCKET_ENDPOINT_URL"
    "COZE_BUCKET_NAME"
    "COZE_WORKLOAD_IDENTITY_API_KEY"
)

# 可选的环境变量
OPTIONAL_VARS=(
    "JWT_SECRET"
    "NEXT_PUBLIC_APP_URL"
    "NODE_ENV"
    "SMTP_HOST"
    "SMTP_PORT"
    "SMTP_USER"
    "SMTP_PASSWORD"
)

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "检查本地 .env 文件..."
echo "========================================"

if [ -f ".env" ]; then
    echo "✅ .env 文件存在"
    echo ""
else
    echo "❌ .env 文件不存在"
    echo ""
    exit 1
fi

echo "检查必需的环境变量..."
echo "========================================"

missing_vars=0
for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^${var}=" .env; then
        value=$(grep "^${var}=" .env | cut -d'=' -f2- | head -c 20)
        echo -e "${GREEN}✅${NC} $var = ${value}..."
    else
        echo -e "${RED}❌${NC} $var 未设置"
        missing_vars=$((missing_vars + 1))
    fi
done

echo ""
echo "检查可选的环境变量..."
echo "========================================"

for var in "${OPTIONAL_VARS[@]}"; do
    if grep -q "^${var}=" .env; then
        value=$(grep "^${var}=" .env | cut -d'=' -f2- | head -c 20)
        echo -e "${GREEN}✅${NC} $var = ${value}..."
    else
        echo -e "${YELLOW}⚠${NC}  $var 未设置"
    fi
done

echo ""
echo "========================================"
echo "验证结果"
echo "========================================"
echo ""

if [ $missing_vars -eq 0 ]; then
    echo -e "${GREEN}✅ 所有必需的环境变量都已设置${NC}"
    echo ""
else
    echo -e "${RED}❌ 缺少 $missing_vars 个必需的环境变量${NC}"
    echo ""
    echo "请在 .env 文件中添加以下环境变量："
    for var in "${REQUIRED_VARS[@]}"; do
        if ! grep -q "^${var}=" .env; then
            echo "  - $var"
        fi
    done
    echo ""
    exit 1
fi

echo "========================================"
echo "Vercel 环境变量配置指南"
echo "========================================"
echo ""
echo "确保在 Vercel Dashboard 中也配置了这些环境变量："
echo ""
echo "1. 访问 Vercel Dashboard"
echo "   https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/settings/environment-variables"
echo ""
echo "2. 添加以下环境变量："
echo ""
for var in "${REQUIRED_VARS[@]}"; do
    value=$(grep "^${var}=" .env | cut -d'=' -f2-)
    echo "   $var=$value"
done
echo ""
echo "3. 点击 'Save' 保存"
echo ""
echo "4. 重新触发部署"
echo ""
