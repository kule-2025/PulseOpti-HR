@echo off
chcp 65001 >nul
cls
echo ==========================================
echo   PulseOpti HR 快速性能修复工具
echo ==========================================
echo.

echo 正在检查Next.js进程...
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /I /N "node.exe">nul
if "%ERRORLEVEL%"=="0" (
    echo [1/3] 检测到Next.js进程正在运行
    echo.
    echo 是否要停止当前的Next.js进程？
    choice /C YN /M "请选择 (Y=停止并重启, N=仅测试)"

    if "%ERRORLEVEL%"=="1" (
        echo.
        echo 正在停止Next.js进程...
        taskkill /F /IM node.exe 2>nul
        timeout /t 2 >nul
        echo [✓] Next.js进程已停止
        echo.
        set RESTART=1
    ) else (
        set RESTART=0
    )
) else (
    echo [1/3] 未检测到Next.js进程
    set RESTART=1
)

echo.
echo [2/3] 清除Next.js缓存...
if exist ".next" (
    rmdir /S /Q .next 2>nul
    echo [✓] .next目录已删除
)
if exist "node_modules\.cache" (
    rmdir /S /Q node_modules\.cache 2>nul
    echo [✓] 缓存目录已删除
)
echo.

if "%RESTART%"=="1" (
    echo [3/3] 启动开发服务器...
    echo.
    echo ==========================================
    echo   正在启动服务器，请稍候...
    echo ==========================================
    echo.
    start /B cmd /c "pnpm run dev > dev-server.log 2>&1"

    echo [✓] 服务器正在启动中...
    echo.
    echo 等待服务器就绪（10秒）...
    timeout /t 10 >nul

    echo.
    echo 检查服务器状态...
    curl -s -o nul -w "HTTP状态: %%{http_code}" http://localhost:5000
    echo.

    echo.
    echo ==========================================
    echo   服务器启动完成！
    echo ==========================================
    echo.
    echo 访问地址: http://localhost:5000
    echo 日志文件: dev-server.log
    echo.
    echo 现在运行性能测试...
    echo.
) else (
    echo [3/3] 跳过服务器启动（用户选择仅测试）
    echo.
)

echo ==========================================
echo   正在运行性能测试...
echo ==========================================
echo.

set BASE_URL=http://localhost:5000

echo [测试 1/3] 首页性能...
for /f "tokens=*" %%i in ('curl -w "%%{time_total}" -o nul -s "%BASE_URL%"') do set result1=%%i
echo 首页响应时间: %result1%秒

echo.
echo [测试 2/3] 登录API性能...
for /f "tokens=*" %%i in ('curl -w "%%{time_total}" -o nul -s -X POST -H "Content-Type: application/json" -d "{\"account\":\"test@test.com\",\"password\":\"test123\"}" "%BASE_URL%/api/auth/login"') do set result2=%%i
echo 登录API响应时间: %result2%秒

echo.
echo [测试 3/3] 健康检查...
for /f "tokens=*" %%i in ('curl -w "%%{time_total}" -o nul -s "%BASE_URL%/api/health"') do set result3=%%i
echo 健康检查响应时间: %result3%秒

echo.
echo ==========================================
echo   性能测试结果
echo ==========================================
echo.

:: 评估结果
echo 首页:    %result1%秒
if "%result1:~0,1%"=="0" (
    echo         评级: ✅ 优秀
) else if "%result1:~0,1%"=="1" (
    echo         评级: ⚠️ 良好
) else if "%result1:~0,1%"=="2" (
    echo         评级: ❌ 较慢 - 建议使用简化版首页
) else (
    echo         评级: 🔴 严重 - 必须优化！
)
echo.

echo 登录API: %result2%秒
if "%result2:~0,1%"=="0" (
    echo         评级: ✅ 优秀
) else if "%result2:~0,1%"=="1" (
    echo         评级: ⚠️ 良好
) else (
    echo         评级: ❌ 较慢 - 需要优化
)
echo.

echo 健康检查: %result3%秒
if "%result3:~0,1%"=="0" (
    echo         评级: ✅ 优秀
) else if "%result3:~0,1%"=="1" (
    echo         评级: ⚠️ 良好
) else (
    echo         评级: ❌ 较慢
)
echo.

if "%result1:~0,1%"=="2" (
    echo ==========================================
    echo   🚨 检测到性能问题
    echo ==========================================
    echo.
    echo 首页响应时间超过2秒，建议：
    echo.
    echo 1. 使用简化版首页：
    echo    copy src\app\page-simple.tsx src\app\page.tsx
    echo.
    echo 2. 或者访问简化版：
    echo    http://localhost:5000/page-simple
    echo.
    echo 3. 参考详细优化指南：
    echo    docs\PERFORMANCE_FIX_GUIDE.md
    echo.
)

echo ==========================================
echo.
echo 按任意键关闭此窗口...
pause >nul
