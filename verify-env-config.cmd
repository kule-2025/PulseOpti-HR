@echo off
chcp 65001 >nul
title PulseOpti HR - 环境变量配置验证

echo.
echo ========================================
echo   PulseOpti HR - 环境变量配置验证
echo ========================================
echo.

REM 切换到项目目录
cd /d "%~dp0"
if errorlevel 1 (
    echo [错误] 无法切换到项目目录
    pause
    exit /b 1
)

echo [信息] 当前目录: %CD%
echo.

REM 初始化计数器
set /a total_checks=0
set /a passed_checks=0

REM 检查1: .env 文件是否存在
echo [检查 1/10] .env 文件是否存在...
set /a total_checks=total_checks+1
if exist .env (
    echo [通过] .env 文件存在
    set /a passed_checks=passed_checks+1
) else (
    echo [失败] .env 文件不存在
    echo [建议] 运行: copy .env.example .env
)
echo.

REM 检查2: DATABASE_URL 是否配置
echo [检查 2/10] DATABASE_URL 是否配置...
set /a total_checks=total_checks+1
findstr /C:"DATABASE_URL=" .env >nul 2>&1
if not errorlevel 1 (
    findstr /C:"DATABASE_URL=" .env | findstr /C:"ep-" >nul 2>&1
    if not errorlevel 1 (
        echo [通过] DATABASE_URL 已配置
        set /a passed_checks=passed_checks+1
    ) else (
        echo [警告] DATABASE_URL 配置可能不正确
        echo [建议] 请检查 DATABASE_URL 格式
    )
) else (
    echo [失败] DATABASE_URL 未配置
    echo [建议] 在 .env 文件中添加: DATABASE_URL=postgresql://...
)
echo.

REM 检查3: JWT_SECRET 是否配置
echo [检查 3/10] JWT_SECRET 是否配置...
set /a total_checks=total_checks+1
findstr /C:"JWT_SECRET=" .env >nul 2>&1
if not errorlevel 1 (
    for /f "tokens=2 delims==" %%a in ('findstr /C:"JWT_SECRET=" .env') do set jwt_secret=%%a
    if not "!jwt_secret!"=="" (
        echo [通过] JWT_SECRET 已配置
        set /a passed_checks=passed_checks+1
    ) else (
        echo [警告] JWT_SECRET 值为空
    )
) else (
    echo [失败] JWT_SECRET 未配置
    echo [建议] 运行: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
)
echo.

REM 检查4: JWT_SECRET 长度
echo [检查 4/10] JWT_SECRET 长度是否足够...
set /a total_checks=total_checks+1
findstr /C:"JWT_SECRET=" .env >nul 2>&1
if not errorlevel 1 (
    for /f "tokens=2 delims==" %%a in ('findstr /C:"JWT_SECRET=" .env') do set jwt_secret=%%a
    call :strlen jwt_secret len
    if !len! GEQ 32 (
        echo [通过] JWT_SECRET 长度: !len! 字符
        set /a passed_checks=passed_checks+1
    ) else (
        echo [警告] JWT_SECRET 长度不足 (!len! 字符)
        echo [建议] JWT_SECRET 至少需要 32 个字符
    )
) else (
    echo [跳过] JWT_SECRET 未配置，无法检查长度
)
echo.

REM 检查5: NEXT_PUBLIC_APP_URL 是否配置
echo [检查 5/10] NEXT_PUBLIC_APP_URL 是否配置...
set /a total_checks=total_checks+1
findstr /C:"NEXT_PUBLIC_APP_URL=" .env >nul 2>&1
if not errorlevel 1 (
    echo [通过] NEXT_PUBLIC_APP_URL 已配置
    set /a passed_checks=passed_checks+1
) else (
    echo [警告] NEXT_PUBLIC_APP_URL 未配置
    echo [建议] 添加: NEXT_PUBLIC_APP_URL=http://localhost:3000
)
echo.

REM 检查6: SMTP配置（邮件服务）
echo [检查 6/10] 邮件服务配置...
set /a total_checks=total_checks+1
findstr /C:"SMTP_HOST=" .env >nul 2>&1
if not errorlevel 1 (
    findstr /C:"SMTP_USER=" .env >nul 2>&1
    if not errorlevel 1 (
        findstr /C:"SMTP_PASSWORD=" .env >nul 2>&1
        if not errorlevel 1 (
            echo [通过] 邮件服务配置完整
            set /a passed_checks=passed_checks+1
        ) else (
            echo [警告] SMTP_PASSWORD 未配置
        )
    ) else (
        echo [警告] SMTP_USER 未配置
    )
) else (
    echo [警告] SMTP_HOST 未配置
    echo [建议] 配置邮件服务以支持注册/登录功能
)
echo.

REM 检查7: 短信服务配置
echo [检查 7/10] 短信服务配置...
set /a total_checks=total_checks+1
findstr /C:"SMS_PROVIDER=" .env >nul 2>&1
if not errorlevel 1 (
    findstr /C:"SMS_PROVIDER=mock" .env >nul 2>&1
    if not errorlevel 1 (
        echo [通过] 短信服务使用 Mock 模式（0成本）
        set /a passed_checks=passed_checks+1
    ) else (
        echo [通过] 短信服务已配置
        set /a passed_checks=passed_checks+1
    )
) else (
    echo [警告] SMS_PROVIDER 未配置
    echo [建议] 添加: SMS_PROVIDER=mock（开发环境）
)
echo.

REM 检查8: node_modules 是否存在
echo [检查 8/10] node_modules 是否存在...
set /a total_checks=total_checks+1
if exist node_modules (
    echo [通过] node_modules 目录存在
    set /a passed_checks=passed_checks+1
) else (
    echo [失败] node_modules 目录不存在
    echo [建议] 运行: pnpm install
)
echo.

REM 检查9: Node.js 版本
echo [检查 9/10] Node.js 版本...
set /a total_checks=total_checks+1
node --version >nul 2>&1
if not errorlevel 1 (
    for /f "tokens=1" %%v in ('node --version') do set node_version=%%v
    echo [通过] Node.js 版本: %node_version%
    set /a passed_checks=passed_checks+1
) else (
    echo [失败] 未检测到 Node.js
    echo [建议] 访问: https://nodejs.org/
)
echo.

REM 检查10: pnpm 版本
echo [检查 10/10] pnpm 版本...
set /a total_checks=total_checks+1
pnpm --version >nul 2>&1
if not errorlevel 1 (
    for /f "tokens=1" %%v in ('pnpm --version') do set pnpm_version=%%v
    echo [通过] pnpm 版本: %pnpm_version%
    set /a passed_checks=passed_checks+1
) else (
    echo [失败] 未检测到 pnpm
    echo [建议] 运行: npm install -g pnpm
)
echo.

REM 输出检查结果
echo ========================================
echo   检查结果汇总
echo ========================================
echo.
echo [总计] 检查项目: %total_checks%
echo [通过] %passed_checks% 项
echo [失败] %total_checks% - %passed_checks% 项
echo.

REM 计算通过率
set /a pass_rate=passed_checks*100/total_checks
echo [通过率] %pass_rate%%%
echo.

if %pass_rate% GEQ 80 (
    echo [状态] ✓ 环境配置良好，可以开始开发
) else if %pass_rate% GEQ 60 (
    echo [状态] ⚠ 环境配置存在一些问题，建议修复后再开发
) else (
    echo [状态] ✗ 环境配置存在严重问题，请优先修复
)
echo.

REM 提供操作建议
echo ========================================
echo   下一步操作建议
echo ========================================
echo.

if not exist .env (
    echo 1. 创建 .env 文件: copy .env.example .env
    echo.
)

if not exist node_modules (
    echo 1. 安装依赖: pnpm install
    echo.
)

echo 如果通过率低于 80%%，请检查并修复上述失败的检查项。
echo 修复后可重新运行此脚本验证。
echo.

echo ========================================
echo.

pause
goto :eof

REM 字符串长度计算函数
:strlen
setlocal enabledelayedexpansion
set "str=!%~1!"
set "len=0"
:strlen_loop
if not "!str:~%len%,1!"=="" (
    set /a len+=1
    goto strlen_loop
)
endlocal & set "%~2=%len%"
goto :eof
