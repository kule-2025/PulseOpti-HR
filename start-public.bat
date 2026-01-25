@echo off
chcp 65001 >nul
cls
echo ==========================================
echo   PulseOpti HR - 公网访问启动工具
echo ==========================================
echo.

:: 检查 ngrok 是否存在
if not exist "ngrok.exe" (
    echo [错误] 未找到 ngrok.exe
    echo.
    echo 请先执行以下步骤：
    echo 1. 访问 https://ngrok.com/download
    echo 2. 下载 Windows 64-bit 版本
    echo 3. 解压 ngrok.exe 到项目根目录
    echo 4. 运行: ngrok config add-authtoken YOUR_TOKEN
    echo.
    pause
    exit /b 1
)

echo [1/3] 检查本地服务状态...
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
echo [2/3] 检查 5000 端口是否可访问...
curl -s -o nul -w "HTTP状态: %%{http_code}" http://localhost:5000
echo.
echo.

echo [3/3] 启动 ngrok 隧道...
echo.
echo ==========================================
echo   ngrok 正在启动，请稍候...
echo ==========================================
echo.

:: 启动 ngrok
start "ngrok Tunnel" cmd /k "ngrok http 5000"

:: 等待 ngrok 启动
echo 等待 ngrok 隧道建立（5秒）...
timeout /t 5 >nul

echo.
echo ==========================================
echo   ✅ 公网访问已启动！
echo ==========================================
echo.
echo 📱 使用说明：
echo.
echo 1. 打开 "ngrok Tunnel" 窗口
echo 2. 找到 "Forwarding" 行
echo 3. 复制 https:// 开头的地址
echo 4. 分享给他人即可访问
echo.
echo 示例地址格式：
echo    https://abcd-123-45-67-89.ngrok-free.app
echo.
echo ⚠️  注意事项：
echo - ngrok 窗口必须保持打开
echo - 每次重启地址会变化
echo - 适合临时演示使用
echo.
echo 📚 更多方案：
echo    查看 docs\EXTERNAL_ACCESS_SOLUTION.md
echo.
echo 按任意键关闭此窗口（ngrok 和服务继续运行）...
pause >nul
