#!/bin/bash

echo "=========================================================="
echo "   PulseOpti HR - 登录流程完整测试"
echo "=========================================================="
echo ""

# 检查开发服务器是否运行
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000)
if [ "$HTTP_CODE" != "200" ] && [ "$HTTP_CODE" != "404" ]; then
    echo "[错误] 开发服务器未运行！"
    echo "请先启动开发服务器: pnpm dev"
    echo ""
    exit 1
fi

echo "[测试1] 测试发送邮箱验证码"
echo ""
curl -X POST http://localhost:5000/api/auth/send-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","purpose":"login"}' \
  -s
echo ""
echo ""

echo "[测试2] 测试发送短信验证码"
echo ""
curl -X POST http://localhost:5000/api/auth/send-sms \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","purpose":"login"}' \
  -s
echo ""
echo ""

echo "[测试3] 测试密码登录"
echo ""
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"account":"test","password":"wrongpassword"}' \
  -s
echo ""
echo ""

echo "[测试4] 测试邮箱验证码登录（验证码不正确）"
echo ""
curl -X POST http://localhost:5000/api/auth/login/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}' \
  -s
echo ""
echo ""

echo "[测试5] 测试短信验证码登录（验证码不正确）"
echo ""
curl -X POST http://localhost:5000/api/auth/login/sms \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","code":"123456"}' \
  -s
echo ""
echo ""

echo "=========================================================="
echo "测试完成！"
echo "=========================================================="
echo ""
echo "预期结果："
echo "  - 所有API都应返回有效的JSON响应"
echo "  - 不应该出现 'Unexpected end of JSON input' 错误"
echo "  - 验证码测试应返回成功（开发环境）"
echo "  - 登录测试应返回错误（用户不存在或验证码错误）"
echo ""
echo "=========================================================="
