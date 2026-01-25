@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo PulseOpti HR 性能优化配置应用工具
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

echo 正在启动 PowerShell 脚本...
echo.

REM 运行 PowerShell 脚本
powershell -ExecutionPolicy Bypass -File "APPLY_OPTIMIZATION.ps1"

echo.
echo ========================================
echo 脚本执行完成
echo ========================================
pause
