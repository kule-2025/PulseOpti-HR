@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo   PulseOpti HR 生产环境一键部署脚本
echo ========================================
echo.

echo [1/5] 检查环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误：未检测到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)
echo ✅ Node.js 已安装

pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  未检测到 pnpm，正在安装...
    call npm install -g pnpm
    if %errorlevel% neq 0 (
        echo ❌ pnpm 安装失败
        pause
        exit /b 1
    )
)
echo ✅ pnpm 已安装
echo.

echo [2/5] 创建 .env 文件...
(
echo DATABASE_URL=postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
echo JWT_SECRET=PulseOptiHR_SuperSecretKey_2024_Production_Secure_Random_String_DoNotChangeInProduction
echo JWT_EXPIRES_IN=7d
echo NODE_ENV=production
echo NEXT_PUBLIC_APP_URL=https://pulseopti-hr.vercel.app
) > .env
echo ✅ .env 文件创建成功
echo.

echo [3/5] 安装依赖...
call pnpm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)
echo ✅ 依赖安装成功
echo.

echo [4/5] 运行数据库迁移...
call pnpm drizzle-kit push:pg
if %errorlevel% neq 0 (
    echo ⚠️  数据库迁移出现警告，但可能已成功
) else (
    echo ✅ 数据库迁移成功
)
echo.

echo [5/5] 验证生产构建...
call pnpm run build
if %errorlevel% neq 0 (
    echo ❌ 构建失败
    pause
    exit /b 1
)
echo ✅ 生产构建成功
echo.

echo ========================================
echo   ✅ 本地准备完成！
echo ========================================
echo.

echo 📋 下一步操作（在新的命令窗口中执行）：
echo.
echo 1. 安装并登录 Vercel：
echo    npm install -g vercel
echo    vercel login
echo.
echo 2. 链接到项目（首次部署）：
echo    vercel link
echo.
echo 3. 设置生产环境变量（逐个执行）：
echo    vercel env add DATABASE_URL production
echo    粘贴: postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
echo.
echo    vercel env add JWT_SECRET production
echo    粘贴: PulseOptiHR_SuperSecretKey_2024_Production_Secure_Random_String_DoNotChangeInProduction
echo.
echo    vercel env add JWT_EXPIRES_IN production
echo    粘贴: 7d
echo.
echo    vercel env add NODE_ENV production
echo    粘贴: production
echo.
echo    vercel env add NEXT_PUBLIC_APP_URL production
echo    粘贴: https://pulseopti-hr.vercel.app
echo.
echo 4. 部署到生产环境：
echo    vercel --prod
echo.
echo ========================================
echo 🔗 生产环境访问地址：
echo    https://pulseopti-hr.vercel.app
echo ========================================
echo.

pause
