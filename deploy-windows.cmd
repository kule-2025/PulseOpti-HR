@echo off
REM ========================================
REM HR Navigator - Windows CMD 一键部署脚本
REM ========================================

echo.
echo ==========================================
echo   HR Navigator - Vercel & Neon 部署工具
echo ==========================================
echo.

REM 检查必需工具
echo [1/7] 检查必需工具...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装，请先安装: https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js 已安装

pnpm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pnpm 未安装，正在安装...
    npm install -g pnpm
    if errorlevel 1 (
        echo ❌ pnpm 安装失败
        pause
        exit /b 1
    )
)
echo ✅ pnpm 已安装

vercel --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Vercel CLI 未安装，正在安装...
    npm install -g vercel
    if errorlevel 1 (
        echo ❌ Vercel CLI 安装失败
        pause
        exit /b 1
    )
)
echo ✅ Vercel CLI 已安装

echo.
echo [2/7] 安装项目依赖...
pnpm install
if errorlevel 1 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)
echo ✅ 依赖安装成功

echo.
echo [3/7] 本地构建测试...
pnpm run build
if errorlevel 1 (
    echo ❌ 构建失败，请检查错误信息
    pause
    exit /b 1
)
echo ✅ 构建成功

echo.
echo [4/7] 登录Vercel...
vercel login
if errorlevel 1 (
    echo ❌ Vercel 登录失败
    pause
    exit /b 1
)
echo ✅ Vercel 登录成功

echo.
echo [5/7] 初始化Vercel项目...
vercel
if errorlevel 1 (
    echo ❌ Vercel 项目初始化失败
    pause
    exit /b 1
)
echo ✅ Vercel 项目初始化成功

echo.
echo [6/7] 配置环境变量...
echo.
echo 请按照提示输入以下环境变量：
echo 1. DATABASE_URL (Neon数据库连接字符串)
echo 2. JWT_SECRET (至少32字符的密钥)
echo 3. NEXT_PUBLIC_APP_URL (Vercel应用URL)
echo 4. NODE_ENV (production)
echo.

set /p continue="环境变量配置完成后，按回车继续..."

echo.
echo [7/7] 生产环境部署...
vercel --prod
if errorlevel 1 (
    echo ❌ 部署失败
    pause
    exit /b 1
)
echo ✅ 部署成功

echo.
echo [8/7] 数据库迁移...
vercel env pull .env.local
npx drizzle-kit push:pg
if errorlevel 1 (
    echo ⚠️  数据库迁移失败，请手动检查
    echo 运行命令: npx drizzle-kit push:pg
) else (
    echo ✅ 数据库迁移成功
)

echo.
echo ==========================================
echo   🎉 部署完成！
echo ==========================================
echo.
echo 请访问你的Vercel Dashboard获取应用URL:
echo https://vercel.com/dashboard
echo.
echo 查看详细部署指南: DEPLOYMENT_GUIDE_CMD.md
echo.

pause
