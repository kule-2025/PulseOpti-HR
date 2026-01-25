@echo off
REM PulseOpti HR 简化部署测试脚本
REM 快速验证 https://www.aizhixuan.com.cn 是否在线

echo ========================================
echo   PulseOpti HR 快速测试
echo ========================================
echo.

set API_URL=https://www.aizhixuan.com.cn

echo [1/3] 测试网站是否在线...
curl -I %API_URL% --max-time 10
echo.
echo.

echo [2/3] 测试登录API是否响应...
curl -I %API_URL%/api/auth/login --max-time 10
echo.
echo.

echo [3/3] 测试注册API是否响应...
curl -I %API_URL%/api/auth/register/email --max-time 10
echo.
echo.

echo ========================================
echo   测试完成
echo ========================================
echo.
echo 如果看到 HTTP/1.1 200 或 HTTP/2 200 表示成功
echo 如果看到连接超时，请检查：
echo   1. Vercel部署是否完成
echo   2. 网络连接是否正常
echo   3. 防火墙是否阻止访问
echo.
echo 访问地址：%API_URL%
echo.
echo 按任意键退出...
pause > nul
