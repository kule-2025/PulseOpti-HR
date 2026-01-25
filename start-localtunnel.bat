@echo off
chcp 65001 >nul
cls
echo ==========================================
echo   PulseOpti HR - LocalTunnel 公网访问
echo ==========================================
echo.

:: 检查 localtunnel 是否已安装
npx localtunnel --version >nul 2>&1
if "%ERRORLEVEL%" neq 0 (
    echo [1/3] 首次使用，正在安装 localtunnel...
    echo.
    npx localtunnel --version
    echo [✓] localtunnel 已安装
)

echo.
echo [2/3] 检查本地服务状态...
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /I /N "node.exe">nul
if "%ERRORLEVEL%"=="0" (
    echo [✓] 检测到 Next.js 服务正在运行
) else (
    echo [×] 未检测到 Next.js 服务
    echo.
    echo 正在启动本地开发服务器...
    start "Next.js Dev Server" cmd /k "pnpm run dev"
    echo [✓] 正在启动本地服务器，请等待 10 秒...
    timeout /t 10 >nul
)

echo.
echo [3/3] 启动 localtunnel 隧道...
echo.
echo ==========================================
echo   localtunnel 正在启动...
echo ==========================================
echo.

:: 启动 localtunnel
npx localtunnel --port 5000

echo.
echo ==========================================
echo   ✅ 公网访问已关闭
echo ==========================================
echo.
pause
