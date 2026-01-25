#!/bin/bash

# PulseOpti HR 性能监控脚本
# 用于测试关键API端点的响应时间

echo "=========================================="
echo "  PulseOpti HR 性能监控"
echo "=========================================="
echo ""

BASE_URL="http://localhost:5000"

# 测试函数
test_endpoint() {
    local name=$1
    local url=$2
    local method=$3
    local data=$4

    echo "📊 测试: $name"
    echo "   URL: $url"

    if [ -z "$data" ]; then
        response_time=$(curl -w "总耗时: %{time_total}s\n" -o /dev/null -s -X "$method" "$url")
    else
        response_time=$(curl -w "总耗时: %{time_total}s\n" -o /dev/null -s -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
    fi

    echo "   $response_time"
    echo ""

    # 提取数值部分
    time_value=$(echo "$response_time" | grep -oP '\d+\.\d+')
    echo "$time_value" | awk '{printf "   评级: "; if($1<0.5) print "✅ 优秀"; else if($1<1) print "⚠️  良好"; else if($1<2) print "🟡 一般"; else print "❌ 较慢"}'
    echo ""
}

# 测试首页
test_endpoint "首页" "$BASE_URL" "GET"

# 测试登录API
test_endpoint "登录API" "$BASE_URL/api/auth/login" "POST" '{"account":"test@test.com","password":"test123"}'

# 测试用户列表API（需要登录token，这里只测健康检查）
test_endpoint "API健康检查" "$BASE_URL/api/health" "GET"

echo "=========================================="
echo "  性能优化建议："
echo "=========================================="
echo ""
echo "✅ 优秀: < 0.5秒  - 无需优化"
echo "⚠️  良好: 0.5-1秒  - 可以接受"
echo "🟡 一般: 1-2秒    - 建议优化"
echo "❌ 较慢: > 2秒     - 必须优化"
echo ""
echo "常见优化方向："
echo "  1. 数据库查询优化（索引、连接池）"
echo "  2. API并行请求处理"
echo "  3. 响应数据精简（避免返回不必要字段）"
echo "  4. 添加缓存层（Redis）"
echo "  5. 静态资源CDN加速"
echo ""
