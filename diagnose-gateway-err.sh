#!/bin/bash

# GatewayErr 诊断脚本
# 用于检查 Vercel 部署中 AI 服务配置是否正确

echo "========================================"
echo "GatewayErr 诊断脚本"
echo "========================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "检查项目："
echo ""

# 检查 1: 检查 .env 文件是否存在
echo -n "1. 检查 .env 文件是否存在... "
if [ -f .env ]; then
    echo -e "${GREEN}✓ 存在${NC}"
else
    echo -e "${RED}✗ 不存在${NC}"
    echo "   请创建 .env 文件并配置环境变量"
    exit 1
fi
echo ""

# 检查 2: 检查必需的环境变量
echo "2. 检查必需的环境变量："
check_env_var() {
    local var_name=$1
    local is_critical=$2

    if grep -q "^${var_name}=" .env; then
        local value=$(grep "^${var_name}=" .env | cut -d'=' -f2)
        if [ -n "$value" ]; then
            echo -e "   ${GREEN}✓${NC} ${var_name}"
        else
            if [ "$is_critical" = "critical" ]; then
                echo -e "   ${RED}✗${NC} ${var_name} (值为空，这是关键配置！)"
            else
                echo -e "   ${YELLOW}⚠${NC} ${var_name} (值为空)"
            fi
        fi
    else
        if [ "$is_critical" = "critical" ]; then
            echo -e "   ${RED}✗${NC} ${var_name} (不存在，这是关键配置！)"
        else
            echo -e "   ${YELLOW}⚠${NC} ${var_name} (不存在)"
        fi
    fi
}

check_env_var "DATABASE_URL" "critical"
check_env_var "COZE_BUCKET_ENDPOINT_URL" "critical"
check_env_var "COZE_BUCKET_NAME" "critical"
check_env_var "DOUBAO_API_KEY" "critical"
check_env_var "SEEDREAM_API_KEY" "critical"
check_env_var "VOICE_API_KEY" "critical"
echo ""

# 检查 3: 检查 vercel.json 文件
echo -n "3. 检查 vercel.json 文件是否存在... "
if [ -f vercel.json ]; then
    echo -e "${GREEN}✓ 存在${NC}"
else
    echo -e "${RED}✗ 不存在${NC}"
    echo "   请创建 vercel.json 文件"
    exit 1
fi
echo ""

# 检查 4: 检查 vercel.json 中是否引用了正确的环境变量
echo "4. 检查 vercel.json 环境变量引用："
check_vercel_env() {
    local var_name=$1
    if grep -q "@${var_name}" vercel.json; then
        echo -e "   ${GREEN}✓${NC} ${var_name}"
    else
        echo -e "   ${YELLOW}⚠${NC} ${var_name} (未在 vercel.json 中引用)"
    fi
}

check_vercel_env "coze-bucket-endpoint-url"
check_vercel_env "coze-bucket-name"
echo ""

# 检查 5: 检查 API Key 格式
echo "5. 检查 API Key 格式："
check_api_key_format() {
    local var_name=$1
    if grep -q "^${var_name}=" .env; then
        local value=$(grep "^${var_name}=" .env | cut -d'=' -f2)
        local length=${#value}

        if [ $length -eq 36 ] && [[ $value =~ ^[a-f0-9-]{36}$ ]]; then
            echo -e "   ${GREEN}✓${NC} ${var_name} (格式正确)"
        else
            echo -e "   ${RED}✗${NC} ${var_name} (格式错误，应该是 36 位 UUID)"
            echo "     当前长度: ${length}"
        fi
    else
        echo -e "   ${YELLOW}-${NC} ${var_name} (未配置)"
    fi
}

check_api_key_format "DOUBAO_API_KEY"
check_api_key_format "SEEDREAM_API_KEY"
check_api_key_format "VOICE_API_KEY"
echo ""

# 检查 6: 检查存储配置
echo "6. 检查存储配置："
if grep -q "^COZE_BUCKET_ENDPOINT_URL=https://s3.cn-beijing.amazonaws.com.cn" .env; then
    echo -e "   ${GREEN}✓${NC} COZE_BUCKET_ENDPOINT_URL (正确)"
else
    echo -e "   ${YELLOW}⚠${NC} COZE_BUCKET_ENDPOINT_URL (值可能不正确)"
fi

if grep -q "^COZE_BUCKET_NAME=pulseopti-hr-storage" .env; then
    echo -e "   ${GREEN}✓${NC} COZE_BUCKET_NAME (正确)"
else
    echo -e "   ${YELLOW}⚠${NC} COZE_BUCKET_NAME (值可能不正确)"
fi
echo ""

# 检查 7: 检查 AI 服务代码
echo -n "7. 检查 AI 服务代码文件... "
if [ -f "src/lib/ai/llm-client.ts" ]; then
    echo -e "${GREEN}✓ 存在${NC}"
else
    echo -e "${YELLOW}⚠ 不存在${NC}"
fi
echo ""

# 诊断总结
echo "========================================"
echo "诊断总结"
echo "========================================"
echo ""

# 统计问题数量
critical_issues=0
warnings=0

# 检查关键环境变量
for var in "DATABASE_URL" "COZE_BUCKET_ENDPOINT_URL" "COZE_BUCKET_NAME" "DOUBAO_API_KEY" "SEEDREAM_API_KEY" "VOICE_API_KEY"; do
    if ! grep -q "^${var}=" .env; then
        ((critical_issues++))
    fi
done

if [ $critical_issues -gt 0 ]; then
    echo -e "${RED}发现 ${critical_issues} 个关键问题${NC}"
    echo ""
    echo "必须修复的问题："
    echo "1. 在 .env 文件中添加缺失的环境变量"
    echo "2. 在 Vercel Dashboard 中配置相同的环境变量"
    echo "3. 触发 Vercel 重新部署"
    echo ""
    echo "详细步骤请查看 GATEWAY_ERR_COMPLETE_FIX.md"
elif [ $warnings -gt 0 ]; then
    echo -e "${YELLOW}发现 ${warnings} 个警告${NC}"
    echo ""
    echo "建议优化项目以提高配置质量"
else
    echo -e "${GREEN}✓ 所有配置检查通过${NC}"
    echo ""
    echo "建议操作："
    echo "1. 确认 Vercel Dashboard 中的环境变量与 .env 文件一致"
    echo "2. 触发 Vercel 重新部署"
    echo "3. 测试 AI 功能是否正常"
fi

echo ""
echo "========================================"
