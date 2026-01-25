@echo off
REM PulseOpti HR Vercel部署测试脚本
REM 用于验证 https://www.aizhixuan.com.cn 的登录注册功能

echo ========================================
echo   PulseOpti HR 部署测试脚本
echo ========================================
echo.

set API_URL=https://www.aizhixuan.com.cn

echo [1/5] 测试服务器健康状态...
curl -I %API_URL% --max-time 10
echo.
echo.

echo [2/5] 测试邮箱注册功能...
curl -X POST %API_URL%/api/auth/register/email ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"code\":\"123456\",\"password\":\"Test123456\",\"companyName\":\"测试公司\",\"name\":\"测试用户\"}" ^
  --max-time 30
echo.
echo.

echo [3/5] 测试手机注册功能...
curl -X POST %API_URL%/api/auth/register/sms ^
  -H "Content-Type: application/json" ^
  -d "{\"phone\":\"13800138000\",\"code\":\"123456\",\"password\":\"Test123456\",\"companyName\":\"测试公司\",\"name\":\"测试用户\"}" ^
  --max-time 30
echo.
echo.

echo [4/5] 测试登录功能...
curl -X POST %API_URL%/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"account\":\"208343256@qq.com\",\"password\":\"admin123\"}" ^
  --max-time 30
echo.
echo.

echo [5/5] 测试API响应时间...
powershell -Command "Measure-Command { curl -I %API_URL% --max-time 10 | Out-Null } | Select-Object -ExpandProperty TotalSeconds"
echo.

echo ========================================
echo   测试完成
echo ========================================
echo.
echo 请检查上述输出：
echo - 状态码 200 表示成功
echo - 状态码 400/401 表示参数或认证问题
echo - 状态码 500 表示服务器错误
echo.
echo 按任意键退出...
pause > nul
