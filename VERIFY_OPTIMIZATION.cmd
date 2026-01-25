@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo PulseOpti HR 优化配置验证工具
echo ========================================
echo.

REM 检查 PowerShell 是否可用
where powershell >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] PowerShell 不可用
    pause
    exit /b 1
)

echo 正在启动验证脚本...
echo.

REM 运行 PowerShell 验证脚本
powershell -ExecutionPolicy Bypass -File "VERIFY_OPTIMIZATION.ps1"

echo.
echo ========================================
echo 验证完成
echo ========================================
pause
