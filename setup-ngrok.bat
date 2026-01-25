@echo off
chcp 65001 >nul
title PulseOpti HR - ngrok 自动配置
echo.
echo ========================================
echo       ngrok 自动配置工具
echo ========================================
echo.
echo Authtoken: 38SsXQWvNJMl9FHBb1g9dnHW49q_7HFkQT2YyiPR1XxdJzea3
echo.

REM 检查ngrok是否安装
echo [1/4] 检查ngrok安装状态...
where ngrok >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ 未检测到ngrok
    echo.
    echo 请按以下步骤安装ngrok：
    echo.
    echo 1. 访问 https://ngrok.com/download
    echo 2. 下载 Windows版本（ngrok-stable-windows-amd64.zip）
    echo 3. 解压到目录，例如：C:\ngrok\
    echo 4. 将ngrok.exe所在目录添加到系统PATH环境变量
    echo.
    echo 添加PATH的方法：
    echo   - 右键"此电脑" → 属性 → 高级系统设置 → 环境变量
    echo   - 在"系统变量"中找到"Path"，点击"编辑"
    echo   - 点击"新建"，添加 ngrok.exe 的完整路径
    echo   - 例如：C:\ngrok
    echo.
    echo 设置完成后，关闭此窗口重新运行本脚本
    pause
    exit /b 1
)
echo ✓ ngrok已安装
echo.

REM 配置authtoken
echo [2/4] 配置authtoken...
ngrok config add-authtoken 38SsXQWvNJMl9FHBb1g9dnHW49q_7HFkQT2YyiPR1XxdJzea3
if %errorlevel% equ 0 (
    echo ✓ Authtoken配置成功
) else (
    echo ✗ Authtoken配置失败
    pause
    exit /b 1
)
echo.

REM 验证配置
echo [3/4] 验证ngrok配置...
ngrok diagnose 2>nul
if %errorlevel% equ 0 (
    echo ✓ ngrok配置验证通过
) else (
    echo ! ngrok配置验证时出现警告（可忽略）
)
echo.

REM 检查本地服务
echo [4/4] 检查本地服务...
curl -I --max-time 3 http://localhost:5000 2>nul
if %errorlevel% equ 0 (
    echo ✓ 本地服务运行正常
) else (
    echo ! 本地服务未启动
    echo.
    set /p start=是否现在启动本地服务？ [Y/N]:
    if /i "%start%"=="Y" (
        echo 正在启动本地服务...
        start "Next.js Dev" cmd /k "pnpm run dev"
        echo 等待服务启动（10秒）...
        timeout /t 10 /nobreak >nul
    )
)
echo.

echo ========================================
echo         配置完成！
echo ========================================
echo.
echo 现在你可以启动ngrok了：
echo.
echo 方法1：双击运行 start-ngrok.bat
echo.
echo 方法2：手动运行
echo   ngrok http 5000 --region ap
echo.
echo ngrok将为你生成一个公网URL，可以分享给任何人访问
echo.
pause
