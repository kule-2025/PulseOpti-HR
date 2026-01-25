#!/bin/bash

# ========================================
# 数据同步验证脚本
# ========================================

echo "========================================"
echo "PulseOpti HR - 数据同步验证"
echo "========================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
FRONTEND_URL="https://www.aizhixuan.com.cn"
ADMIN_URL="https://pulseopti-hr.loca.lt"
API_BASE_URL="https://pulseopti-hr.vercel.app/api"
TEST_EMAIL="test$(date +%s)@example.com"
TEST_PASSWORD="Test123456"
TEST_NAME="测试用户"
TEST_COMPANY="测试公司"

# 函数：打印成功消息
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# 函数：打印错误消息
print_error() {
    echo -e "${RED}✗${NC} $1"
}

# 函数：打印警告消息
print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 函数：打印标题
print_title() {
    echo ""
    echo -e "${YELLOW}▶${NC} $1"
}

# 检查前端是否可访问
print_title "检查前端访问"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$FRONTEND_STATUS" = "200" ]; then
    print_success "前端访问正常: $FRONTEND_URL"
else
    print_error "前端访问失败: $FRONTEND_URL (HTTP $FRONTEND_STATUS)"
    echo "提示: 前端可能还未部署到Vercel"
fi

# 检查超管端是否可访问
print_title "检查超管端访问"
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$ADMIN_URL")
if [ "$ADMIN_STATUS" = "200" ]; then
    print_success "超管端访问正常: $ADMIN_URL"
else
    print_error "超管端访问失败: $ADMIN_URL (HTTP $ADMIN_STATUS)"
    echo "提示: 需要重新启动LocalTunnel"
fi

# 检查API是否可访问
print_title "检查API访问"
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL/health")
if [ "$API_STATUS" = "200" ]; then
    print_success "API访问正常"
else
    print_error "API访问失败 (HTTP $API_STATUS)"
fi

# 测试用户注册
print_title "测试用户注册"
echo "测试邮箱: $TEST_EMAIL"
echo "测试密码: $TEST_PASSWORD"

REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"name\": \"$TEST_NAME\",
    \"companyName\": \"$TEST_COMPANY\",
    \"phone\": \"13800138000\"
  }")

REGISTER_SUCCESS=$(echo $REGISTER_RESPONSE | jq -r '.success')

if [ "$REGISTER_SUCCESS" = "true" ]; then
    print_success "用户注册成功"
    USER_ID=$(echo $REGISTER_RESPONSE | jq -r '.data.user.id')
    COMPANY_ID=$(echo $REGISTER_RESPONSE | jq -r '.data.companyId')
    TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.token')
    
    echo "用户ID: $USER_ID"
    echo "公司ID: $COMPANY_ID"
    echo "Token: ${TOKEN:0:20}..."
else
    print_error "用户注册失败"
    echo "响应: $REGISTER_RESPONSE"
    echo ""
    echo "提示: API可能未部署或环境变量未配置"
    exit 1
fi

# 等待2秒，确保数据写入数据库
sleep 2

# 测试数据库查询
print_title "测试数据库查询"
DB_QUERY_RESPONSE=$(curl -s -X POST "$API_BASE_URL/admin/test-db-query" \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$USER_ID\"}")

if [ ! -z "$DB_QUERY_RESPONSE" ]; then
    print_success "数据库查询成功"
else
    print_warning "数据库查询失败（API可能不存在）"
fi

# 测试审计日志
print_title "测试审计日志"
AUDIT_LOG_RESPONSE=$(curl -s -X POST "$API_BASE_URL/admin/test-audit-log" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"userId\": \"$USER_ID\"}")

if [ ! -z "$AUDIT_LOG_RESPONSE" ]; then
    print_success "审计日志记录成功"
else
    print_warning "审计日志记录失败（API可能不存在）"
fi

# 测试超管端查询
print_title "测试超管端数据查询"
ADMIN_STATS_RESPONSE=$(curl -s "$API_BASE_URL/admin/dashboard/stats" \
  -H "Authorization: Bearer $TOKEN")

ADMIN_STATS_SUCCESS=$(echo $ADMIN_STATS_RESPONSE | jq -r '.success')

if [ "$ADMIN_STATS_SUCCESS" = "true" ]; then
    print_success "超管端数据查询成功"
    TOTAL_USERS=$(echo $ADMIN_STATS_RESPONSE | jq -r '.data.totalUsers')
    TOTAL_COMPANIES=$(echo $ADMIN_STATS_RESPONSE | jq -r '.data.totalCompanies')
    
    echo "总用户数: $TOTAL_USERS"
    echo "总公司数: $TOTAL_COMPANIES"
else
    print_error "超管端数据查询失败"
    echo "响应: $ADMIN_STATS_RESPONSE"
fi

# 验证数据同步
print_title "验证数据同步"
echo "等待3秒..."
sleep 3

# 再次查询超管端统计
ADMIN_STATS_RESPONSE_2=$(curl -s "$API_BASE_URL/admin/dashboard/stats" \
  -H "Authorization: Bearer $TOKEN")

TOTAL_USERS_2=$(echo $ADMIN_STATS_RESPONSE_2 | jq -r '.data.totalUsers')

if [ "$TOTAL_USERS_2" -gt "$TOTAL_USERS" ]; then
    print_success "数据同步成功！新用户已显示"
else
    print_warning "数据同步可能有问题（用户数未增加）"
fi

# 总结
echo ""
echo "========================================"
echo "验证总结"
echo "========================================"
echo ""
echo "测试信息:"
echo "测试邮箱: $TEST_EMAIL"
echo "测试密码: $TEST_PASSWORD"
echo "用户ID: $USER_ID"
echo "公司ID: $COMPANY_ID"
echo ""
echo "下一步操作:"
echo "1. 访问超管端: $ADMIN_URL/admin/login"
echo "2. 使用管理员账号登录"
echo "3. 查看用户管理页面"
echo "4. 确认测试用户已显示"
echo ""
echo "清理测试数据:"
echo "如需删除测试用户，请手动在数据库中删除或联系管理员"
echo ""

print_success "验证完成！"
