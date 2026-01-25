@echo off
chcp 65001 >nul
title PulseOpti HR - 开发环境配置

echo.
echo ========================================
echo   PulseOpti HR 脉策聚效 - 开发环境配置
echo ========================================
echo.

REM 获取脚本所在目录
set "SCRIPT_DIR=%~dp0"

REM 切换到脚本所在目录
cd /d "%SCRIPT_DIR%"

echo [信息] 当前目录: %CD%
echo.

REM 检查setup-development-env.cmd是否存在
if not exist "setup-development-env.cmd" (
    echo [错误] 未找到 setup-development-env.cmd 文件
    echo.
    echo [提示] 请确保此脚本位于项目根目录: C:\PulseOpti-HR\PulseOpti-HR
    echo.
    pause
    exit /b 1
)

REM 执行环境配置脚本
echo [信息] 正在启动环境配置...
echo.
call setup-development-env.cmd

REM 如果脚本异常退出
echo.
echo [信息] 环境配置已完成
pause
