@echo off
chcp 65001 >nul
title PulseOpti HR - 开发环境配置助手

echo.
echo ========================================
echo   PulseOpti HR 脉策聚效 - 开发环境配置
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

REM 检查Node.js是否安装
echo [步骤 1/7] 检查Node.js安装...
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到Node.js，请先安装Node.js 18+
    echo [提示] 访问: https://nodejs.org/
    pause
    exit /b 1
)
echo [成功] Node.js版本:
node --version
echo.

REM 检查pnpm是否安装
echo [步骤 2/7] 检查pnpm安装...
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo [信息] 未检测到pnpm，正在安装...
    npm install -g pnpm
    if errorlevel 1 (
        echo [错误] pnpm安装失败
        pause
        exit /b 1
    )
)
echo [成功] pnpm版本:
pnpm --version
echo.

REM 检查.env文件是否存在
echo [步骤 3/7] 检查环境变量配置文件...
if not exist .env (
    if exist .env.example (
        echo [信息] 正在复制 .env.example 到 .env...
        copy .env.example .env >nul
        echo [成功] .env 文件已创建
        echo.
        echo [重要] 请编辑 .env 文件，配置必需的环境变量
        echo         - DATABASE_URL (数据库连接字符串)
        echo         - JWT_SECRET (JWT密钥)
        echo         - SMTP_USER (Gmail邮箱)
        echo         - SMTP_PASSWORD (Gmail应用专用密码)
        echo.
        echo [提示] 按 'Y' 打开 .env 文件进行编辑，或按其他键跳过
        choice /C YN /M "是否现在编辑 .env 文件"
        if errorlevel 2 goto skip_edit
        if errorlevel 1 (
            notepad .env
            echo.
            echo [提示] 编辑完成后请按任意键继续...
            pause >nul
        )
    ) else (
        echo [警告] 未找到 .env.example 文件
    )
) else (
    echo [成功] .env 文件已存在
)
:skip_edit
echo.

REM 安装依赖
echo [步骤 4/7] 安装项目依赖...
echo [信息] 首次安装可能需要 3-5 分钟，请耐心等待...
echo.
pnpm install
if errorlevel 1 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)
echo [成功] 依赖安装完成
echo.

REM 生成数据库迁移文件
echo [步骤 5/7] 生成数据库迁移文件...
pnpm run db:generate
if errorlevel 1 (
    echo [警告] 数据库迁移文件生成失败，请检查 .env 中的 DATABASE_URL 配置
    echo.
    echo [提示] 是否跳过数据库初始化？
    choice /C YN /M "跳过数据库初始化"
    if errorlevel 2 goto skip_db
    if errorlevel 1 goto skip_db
)
echo [成功] 数据库迁移文件已生成
echo.

REM 推送数据库表结构
echo [步骤 6/7] 推送数据库表结构...
pnpm run db:push
if errorlevel 1 (
    echo [错误] 数据库表结构推送失败
    echo.
    echo [提示] 请检查以下配置：
    echo         - DATABASE_URL 是否正确
    echo         - Neon数据库是否在线
    echo         - 网络连接是否正常
    echo.
    echo [提示] 是否跳过数据库初始化？
    choice /C YN /M "跳过数据库初始化"
    if errorlevel 2 goto skip_db
    if errorlevel 1 goto skip_db
)
echo [成功] 数据库表结构已推送（59个表）
echo.
:skip_db

REM 启动开发服务器
echo [步骤 7/7] 启动开发服务器...
echo.
echo ========================================
echo   开发环境配置完成！
echo ========================================
echo.
echo [信息] 正在启动开发服务器...
echo [提示] 开发服务器启动后，访问: http://localhost:3000
echo.
echo [提示] 按 Ctrl+C 可停止开发服务器
echo.
echo ========================================
echo.

REM 启动开发服务器
pnpm run dev

REM 如果开发服务器异常退出
echo.
echo [信息] 开发服务器已停止
pause
