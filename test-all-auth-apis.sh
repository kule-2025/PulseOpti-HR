#!/bin/bash

echo "=========================================================="
echo "   PulseOpti HR - 所有认证API完整测试"
echo "=========================================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查开发服务器是否运行
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000)
if [ "$HTTP_CODE" != "200" ] && [ "$HTTP_CODE" != "404" ]; then
    echo -e "${RED}[错误] 开发服务器未运行！${NC}"
    echo "请先启动开发服务器: pnpm dev"
    echo ""
    exit 1
fi

# 测试计数器
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 测试函数
test_api() {
    local test_name=$1
    local method=$2
    local url=$3
    local data=$4

    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "[测试 $TOTAL_TESTS] $test_name ... "

    response=$(curl -s -X "$method" "http://localhost:5000$url" \
        -H "Content-Type: application/json" \
        -d "$data" \
        -w "\n%{http_code}")

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    # 检查HTTP状态码
    if [ -z "$http_code" ] || [ "$http_code" = "000" ]; then
        echo -e "${RED}失败 (连接错误)${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi

    # 检查响应是否为空
    if [ -z "$body" ]; then
        echo -e "${RED}失败 (空响应)${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi

    # 尝试解析JSON
    if ! echo "$body" | python3 -m json.tool > /dev/null 2>&1; then
        echo -e "${RED}失败 (无效JSON)${NC}"
        echo "响应内容: $body"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi

    # 检查是否包含关键字段
    if ! echo "$body" | grep -q '"success"' && ! echo "$body" | grep -q '"error"'; then
        echo -e "${YELLOW}警告 (缺少success/error字段)${NC}"
        echo "响应内容: $body"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    fi

    echo -e "${GREEN}通过${NC} (HTTP $http_code)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    return 0
}

# 开始测试
echo "=========================================="
echo "  1. 验证码发送测试"
echo "=========================================="
echo ""

test_api "发送邮箱验证码(登录)" \
    "POST" \
    "/api/auth/send-email" \
    '{"email":"test@example.com","purpose":"login"}'

test_api "发送邮箱验证码(注册)" \
    "POST" \
    "/api/auth/send-email" \
    '{"email":"test@example.com","purpose":"register"}'

test_api "发送邮箱验证码(重置密码)" \
    "POST" \
    "/api/auth/send-email" \
    '{"email":"test@example.com","purpose":"reset"}'

test_api "发送短信验证码(登录)" \
    "POST" \
    "/api/auth/send-sms" \
    '{"phone":"13800138000","purpose":"login"}'

test_api "发送短信验证码(注册)" \
    "POST" \
    "/api/auth/send-sms" \
    '{"phone":"13800138000","purpose":"register"}'

test_api "发送短信验证码(重置密码)" \
    "POST" \
    "/api/auth/send-sms" \
    '{"phone":"13800138000","purpose":"reset"}'

echo ""
echo "=========================================="
echo "  2. 登录API测试"
echo "=========================================="
echo ""

test_api "密码登录" \
    "POST" \
    "/api/auth/login" \
    '{"account":"test","password":"wrongpassword"}'

test_api "短信验证码登录" \
    "POST" \
    "/api/auth/login/sms" \
    '{"phone":"13800138000","code":"123456"}'

test_api "邮箱验证码登录" \
    "POST" \
    "/api/auth/login/email" \
    '{"email":"test@example.com","code":"123456"}'

echo ""
echo "=========================================="
echo "  3. 注册API测试"
echo "=========================================="
echo ""

test_api "密码注册" \
    "POST" \
    "/api/auth/register" \
    '{"email":"test@example.com","name":"测试用户","password":"password123","companyName":"测试公司"}'

test_api "短信验证码注册" \
    "POST" \
    "/api/auth/register/sms" \
    '{"phone":"13800138000","code":"123456","password":"password123","companyName":"测试公司","name":"测试用户"}'

test_api "邮箱验证码注册" \
    "POST" \
    "/api/auth/register/email" \
    '{"email":"test@example.com","code":"123456","password":"password123","companyName":"测试公司","name":"测试用户"}'

echo ""
echo "=========================================="
echo "  4. 其他认证API测试"
echo "=========================================="
echo ""

test_api "重置密码" \
    "POST" \
    "/api/auth/reset-password" \
    '{"email":"test@example.com","code":"123456","newPassword":"newpassword123"}'

test_api "获取当前用户信息" \
    "GET" \
    "/api/auth/me" \
    ''

test_api "验证Token" \
    "POST" \
    "/api/auth/verify" \
    '{"token":"invalid-token"}'

echo ""
echo "=========================================================="
echo "测试结果汇总"
echo "=========================================================="
echo -e "总测试数: $TOTAL_TESTS"
echo -e "${GREEN}通过: $PASSED_TESTS${NC}"
if [ $FAILED_TESTS -gt 0 ]; then
    echo -e "${RED}失败: $FAILED_TESTS${NC}"
else
    echo -e "${GREEN}失败: $FAILED_TESTS${NC}"
fi
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}所有测试通过！没有JSON解析错误。${NC}"
    exit 0
else
    echo -e "${RED}部分测试失败，请检查失败的API。${NC}"
    exit 1
fi
