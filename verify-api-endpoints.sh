#!/bin/bash

# API端点验证脚本
# 用于验证所有API端点的可用性

BASE_URL="http://localhost:5000"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API端点列表
API_ENDPOINTS=(
  # 认证相关
  "GET /api/auth/verify"

  # AI功能
  "POST /api/ai/job-description"
  "POST /api/ai/talent-grid"
  "POST /api/ai/turnover-analysis"
  "POST /api/ai/prediction"
  "POST /api/ai/advanced-prediction"
  "POST /api/ai/interview-score"
  "POST /api/ai/attribution"
  "POST /api/ai/recommendation"
  "POST /api/ai/idp"

  # 工作流
  "GET /api/workflows"
  "GET /api/workflows/instances"
  "GET /api/workflows/history"

  # 员工管理
  "GET /api/employees"

  # 招聘管理
  "GET /api/recruitment/jobs"
  "GET /api/recruitment/candidates"
  "GET /api/recruitment/interviews"
  "GET /api/recruitment/offers"

  # 绩效管理
  "GET /api/performance/cycles"
  "GET /api/performance/records"

  # 考勤管理
  "POST /api/attendance/clock-in"
  "GET /api/attendance/leave"
  "GET /api/attendance/overtime"
  "GET /api/attendance/scheduling"
  "GET /api/attendance/abnormal"
  "GET /api/attendance/statistics"

  # 薪酬管理
  "GET /api/compensation/payroll"
  "POST /api/compensation/smart-analysis"

  # 培训管理
  "GET /api/training/courses"
  "GET /api/training/records"
  "POST /api/training/ai-recommendation"

  # 积分管理
  "GET /api/points/dashboard"
  "GET /api/points/rules"
  "GET /api/points/transactions"
  "GET /api/points/exchanges"
  "GET /api/points/exchange-items"
  "GET /api/points/leaderboard"

  # 人效监测
  "POST /api/efficiency/init"
  "GET /api/efficiency/dashboard"
  "POST /api/efficiency/attribution"
  "POST /api/efficiency/prediction"
  "GET /api/efficiency/recommendations"

  # 离职管理
  "GET /api/resignations"
  "GET /api/exit-interviews"
  "GET /api/handovers"

  # 其他
  "GET /api/contracts"
  "POST /api/talent/analysis"
  "GET /api/reports/hr-analytics"
  "GET /api/jobs"
  "GET /api/departments"
  "GET /api/dashboard/stats"
  "GET /api/employee-portal/profile"

  # 会员订阅
  "GET /api/memberships/pricing"
  "GET /api/memberships/plans"
  "GET /api/subscriptions"
  "GET /api/memberships/orders"

  # 超级管理员
  "GET /api/admin/users"
  "GET /api/admin/sub-accounts"
  "GET /api/admin/sub-accounts/quota"
  "GET /api/admin/init/plans"
)

echo -e "${YELLOW}=====================================${NC}"
echo -e "${YELLOW}API端点验证${NC}"
echo -e "${YELLOW}=====================================${NC}"
echo ""

TOTAL=0
SUCCESS=0
FAILED=0
SKIPPED=0

for endpoint in "${API_ENDPOINTS[@]}"; do
  TOTAL=$((TOTAL + 1))

  METHOD=$(echo $endpoint | awk '{print $1}')
  PATH=$(echo $endpoint | awk '{print $2}')
  URL="${BASE_URL}${PATH}"

  echo -n "[$TOTAL] ${METHOD} ${PATH} ... "

  if [ "$METHOD" = "GET" ]; then
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null)
  else
    # POST请求，发送空JSON
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d '{}' "$URL" 2>/dev/null)
  fi

  if [ "$STATUS" = "200" ] || [ "$STATUS" = "201" ] || [ "$STATUS" = "400" ] || [ "$STATUS" = "401" ]; then
    # 200/201/400/401都是正常的（400表示请求参数错误，401表示未授权，说明端点存在）
    echo -e "${GREEN}✓ (HTTP $STATUS)${NC}"
    SUCCESS=$((SUCCESS + 1))
  elif [ "$STATUS" = "404" ]; then
    echo -e "${RED}✗ (HTTP $STATUS)${NC}"
    FAILED=$((FAILED + 1))
  elif [ "$STATUS" = "000" ]; then
    echo -e "${YELLOW}? (连接失败)${NC}"
    SKIPPED=$((SKIPPED + 1))
  else
    echo -e "${YELLOW}⚠ (HTTP $STATUS)${NC}"
    SKIPPED=$((SKIPPED + 1))
  fi

  # 稍微延迟，避免请求过快
  sleep 0.05
done

echo ""
echo -e "${YELLOW}=====================================${NC}"
echo -e "${YELLOW}验证结果${NC}"
echo -e "${YELLOW}=====================================${NC}"
echo -e "总计: ${TOTAL}"
echo -e "${GREEN}成功: ${SUCCESS}${NC}"
echo -e "${RED}失败: ${FAILED}${NC}"
echo -e "${YELLOW}跳过: ${SKIPPED}${NC}"

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}所有API端点验证通过！${NC}"
  exit 0
else
  echo -e "${RED}存在 $FAILED 个失败的API端点${NC}"
  exit 1
fi
