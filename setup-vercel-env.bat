@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo   Vercel 环境变量快速配置脚本
echo ========================================
echo.

echo 此脚本将自动配置所有生产环境变量
echo 请确保已执行 vercel login 登录
echo.

set "DATABASE_URL=postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
set "JWT_SECRET=PulseOptiHR_SuperSecretKey_2024_Production_Secure_Random_String_DoNotChangeInProduction"
set "JWT_EXPIRES_IN=7d"
set "NODE_ENV=production"
set "NEXT_PUBLIC_APP_URL=https://pulseopti-hr.vercel.app"

echo 正在配置环境变量...
echo.

echo [1/5] 配置 DATABASE_URL...
echo %DATABASE_URL% | vercel env add DATABASE_URL production
if %errorlevel% equ 0 (
    echo ✅ DATABASE_URL 配置成功
) else (
    echo ❌ DATABASE_URL 配置失败
    pause
    exit /b 1
)
echo.

echo [2/5] 配置 JWT_SECRET...
echo %JWT_SECRET% | vercel env add JWT_SECRET production
if %errorlevel% equ 0 (
    echo ✅ JWT_SECRET 配置成功
) else (
    echo ⚠️  JWT_SECRET 可能已存在，跳过
)
echo.

echo [3/5] 配置 JWT_EXPIRES_IN...
echo %JWT_EXPIRES_IN% | vercel env add JWT_EXPIRES_IN production
if %errorlevel% equ 0 (
    echo ✅ JWT_EXPIRES_IN 配置成功
) else (
    echo ⚠️  JWT_EXPIRES_IN 可能已存在，跳过
)
echo.

echo [4/5] 配置 NODE_ENV...
echo %NODE_ENV% | vercel env add NODE_ENV production
if %errorlevel% equ 0 (
    echo ✅ NODE_ENV 配置成功
) else (
    echo ⚠️  NODE_ENV 可能已存在，跳过
)
echo.

echo [5/5] 配置 NEXT_PUBLIC_APP_URL...
echo %NEXT_PUBLIC_APP_URL% | vercel env add NEXT_PUBLIC_APP_URL production
if %errorlevel% equ 0 (
    echo ✅ NEXT_PUBLIC_APP_URL 配置成功
) else (
    echo ⚠️  NEXT_PUBLIC_APP_URL 可能已存在，跳过
)
echo.

echo ========================================
echo   ✅ 所有环境变量配置完成！
echo ========================================
echo.

echo 查看所有环境变量：
echo    vercel env ls
echo.

echo 现在可以执行生产部署：
echo    vercel --prod
echo.

pause
