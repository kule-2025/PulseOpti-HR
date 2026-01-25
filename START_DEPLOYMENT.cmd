@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo   PulseOpti HR 生产环境部署准备
echo ========================================
echo.

echo 当前目录:
cd
echo.

echo 检查 .env 文件...
if not exist .env (
    echo ❌ .env 文件不存在，正在创建...
    (
        echo DATABASE_URL=postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
        echo JWT_SECRET=PulseOptiHR_SuperSecretKey_2024_Production_Secure_Random_String_DoNotChangeInProduction
        echo JWT_EXPIRES_IN=7d
        echo NODE_ENV=production
        echo NEXT_PUBLIC_APP_URL=https://pulseopti-hr.vercel.app
    ) > .env
    echo ✅ .env 文件创建成功
) else (
    echo ✅ .env 文件已存在
)
echo.

echo 检查依赖...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js 已安装
) else (
    echo ❌ Node.js 未安装
)

pnpm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ pnpm 已安装
) else (
    echo ⚠️  pnpm 未安装
)

vercel --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Vercel CLI 已安装
) else (
    echo ⚠️  Vercel CLI 未安装
)
echo.

echo ========================================
echo   ✅ 准备工作完成！
echo ========================================
echo.

echo 📋 下一步操作（在新窗口中执行）：
echo.
echo 1. 安装 Vercel CLI（如果尚未安装）：
echo    npm install -g vercel
echo.
echo 2. 登录 Vercel：
echo    vercel login
echo.
echo 3. 链接到项目（首次部署）：
echo    vercel link
echo.
echo 4. 设置生产环境变量（逐个执行）：
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
echo 5. 运行数据库迁移：
echo    pnpm drizzle-kit push
echo.
echo 6. 部署到生产环境：
echo    vercel --prod
echo.

echo ========================================
echo 🔗 生产环境访问地址：
echo    https://pulseopti-hr.vercel.app
echo ========================================
echo.

pause
