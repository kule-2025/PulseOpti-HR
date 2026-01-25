@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo PulseOpti HR - 一键部署工具
echo ========================================
echo.

REM 检查是否在项目根目录
if not exist "package.json" (
    echo [错误] 请在项目根目录运行此脚本
    pause
    exit /b 1
)

REM 检查 PowerShell 是否可用
where powershell >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] PowerShell 不可用
    pause
    exit /b 1
)

echo 正在启动部署脚本...
echo.
echo 此脚本将:
echo   1. 提交代码到 Git
echo   2. 推送到 GitHub
echo   3. 推送数据库 schema 到 Neon
echo   4. 显示部署信息
echo.

pause

REM 运行 PowerShell 脚本
powershell -ExecutionPolicy Bypass -File "DEPLOY_TO_VERCEL.ps1"

echo.
echo ========================================
echo 部署完成
echo ========================================
pause
