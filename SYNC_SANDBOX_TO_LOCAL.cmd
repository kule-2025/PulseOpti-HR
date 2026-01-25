@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo PulseOpti HR - 沙箱配置同步工具
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

echo 正在启动同步脚本...
echo.
echo 此脚本将:
echo   1. 更新 package.json（添加数据库脚本）
echo   2. 更新 vercel.json（性能优化配置）
echo   3. 更新 next.config.ts（Next.js 优化配置）
echo   4. 清理缓存并重新构建
echo.

pause

REM 运行 PowerShell 脚本
powershell -ExecutionPolicy Bypass -File "SYNC_SANDBOX_TO_LOCAL.ps1"

echo.
echo ========================================
echo 同步完成
echo ========================================
pause
