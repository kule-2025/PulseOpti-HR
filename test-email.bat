@echo off
chcp 65001 >nul
echo ==========================================================
echo    PulseOpti HR - 邮件发送测试工具
echo ==========================================================
echo.

REM 检查开发服务器是否运行
curl -s -o nul -w "%%{http_code}" http://localhost:5000 >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 开发服务器未运行！
    echo 请先启动开发服务器:
    echo     pnpm dev
    echo.
    pause
    exit /b 1
)

echo [信息] 开发服务器运行中
echo.

REM 输入测试邮箱
echo 请输入测试邮箱地址（将发送登录验证码到该邮箱）
set /p TEST_EMAIL="测试邮箱: "

echo.
echo [测试] 发送验证码到 %TEST_EMAIL%...
echo.

REM 发送测试请求
curl -X POST http://localhost:5000/api/auth/send-email ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"%TEST_EMAIL%\",\"purpose\":\"login\"}" ^
  -w "\n\nHTTP状态码: %%{http_code}\n" ^
  -s

echo.
echo ==========================================================
echo.
echo 测试说明：
echo   1. 如果返回 {"success":true, ...} 表示请求成功
echo   2. 请检查邮箱是否收到验证码邮件
echo   3. 验证码有效期为5分钟
echo   4. 如果未收到，请检查垃圾邮件文件夹
echo.
echo ==========================================================
pause
