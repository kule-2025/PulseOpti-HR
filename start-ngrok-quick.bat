@echo off
chcp 65001 >nul
title PulseOpti HR - ngrok 快速启动
cls

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo║                                                           ║
echo║       PulseOpti HR - ngrok 一键启动                        ║
echo║                                                           ║
echo╚═══════════════════════════════════════════════════════════╝
echo.

REM 使用预先配置的authtoken
set AUTHTOKEN=38SsXQWvNJMl9FHBb1g9dnHW49q_7HFkQT2YyiPR1XxdJzea3

echo 配置信息：
echo   Authtoken: %AUTHTOKEN%
echo   区域: ap (亚太/香港)
echo   本地端口: 5000
echo.

REM 检查ngrok
where ngrok >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ 未检测到ngrok
    echo.
    echo 正在下载ngrok...
    echo.
    echo 请手动完成以下步骤：
    echo 1. 访问 https://ngrok.com/download
    echo 2. 下载Windows版本
    echo 3. 解压并添加到PATH
    echo 4. 重新运行本脚本
    pause
    exit /b 1
)

REM 配置authtoken
echo 配置ngrok authtoken...
ngrok config add-authtoken %AUTHTOKEN% 2>nul
if %errorlevel% equ 0 (
    echo ✓ Authtoken配置成功
) else (
    echo ! Authtoken可能已配置，继续...
)

REM 启动本地服务
echo.
echo 检查本地服务...
curl -I --max-time 2 http://localhost:5000 2>nul
if %errorlevel% neq 0 (
    echo 本地服务未启动，正在启动...
    start "Next.js Dev" cmd /k "pnpm run dev"
    echo 等待服务启动（15秒）...
    timeout /t 15 /nobreak >nul
)

REM 启动ngrok
echo.
echo ════════════════════════════════════════════════════════
echo.
echo 正在启动ngrok（亚太区域）...
echo.
echo 启动成功后，复制 "Forwarding" 后面的HTTPS地址即可访问
echo.
echo ════════════════════════════════════════════════════════
echo.

ngrok http 5000 --region ap

pause
