@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo   Vercel 快速修复工具
echo ========================================
echo.

echo 此工具将帮助您修复常见的 Vercel 部署问题
echo.

pause

echo.
echo [1/5] 重新部署到生产环境...
vercel --prod --force
if %errorlevel% equ 0 (
    echo ✅ 重新部署成功
) else (
    echo ❌ 重新部署失败
    pause
    exit /b 1
)
echo.

echo [2/5] 验证环境变量...
echo.
echo 当前生产环境变量：
vercel env ls --environment=production
echo.

echo [3/5] 重新配置环境变量（如缺失）...
echo.

echo 检查 DATABASE_URL...
vercel env ls --environment=production | findstr /C:"DATABASE_URL" >nul
if %errorlevel% neq 0 (
    echo ⚠️  DATABASE_URL 缺失，正在添加...
    echo postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require | vercel env add DATABASE_URL production
) else (
    echo ✅ DATABASE_URL 已存在
)
echo.

echo 检查 JWT_SECRET...
vercel env ls --environment=production | findstr /C:"JWT_SECRET" >nul
if %errorlevel% neq 0 (
    echo ⚠️  JWT_SECRET 缺失，正在添加...
    echo PulseOptiHR_SuperSecretKey_2024_Production_Secure_Random_String_DoNotChangeInProduction | vercel env add JWT_SECRET production
) else (
    echo ✅ JWT_SECRET 已存在
)
echo.

echo 检查 JWT_EXPIRES_IN...
vercel env ls --environment=production | findstr /C:"JWT_EXPIRES_IN" >nul
if %errorlevel% neq 0 (
    echo ⚠️  JWT_EXPIRES_IN 缺失，正在添加...
    echo 7d | vercel env add JWT_EXPIRES_IN production
) else (
    echo ✅ JWT_EXPIRES_IN 已存在
)
echo.

echo 检查 NODE_ENV...
vercel env ls --environment=production | findstr /C:"NODE_ENV" >nul
if %errorlevel% neq 0 (
    echo ⚠️  NODE_ENV 缺失，正在添加...
    echo production | vercel env add NODE_ENV production
) else (
    echo ✅ NODE_ENV 已存在
)
echo.

echo 检查 NEXT_PUBLIC_APP_URL...
vercel env ls --environment=production | findstr /C:"NEXT_PUBLIC_APP_URL" >nul
if %errorlevel% neq 0 (
    echo ⚠️  NEXT_PUBLIC_APP_URL 缺失，正在添加...
    echo https://pulseopti-hr.vercel.app | vercel env add NEXT_PUBLIC_APP_URL production
) else (
    echo ✅ NEXT_PUBLIC_APP_URL 已存在
)
echo.

echo [4/5] 运行数据库迁移...
pnpm drizzle-kit push
if %errorlevel% equ 0 (
    echo ✅ 数据库迁移成功
) else (
    echo ⚠️  数据库迁移可能出现警告，但通常不影响
)
echo.

echo [5/5] 最终部署验证...
echo.
echo 当前生产环境部署：
vercel ls --prod
echo.

echo ========================================
echo   ✅ 修复完成！
echo ========================================
echo.

echo 📋 下一步：
echo.
echo 1. 访问生产环境测试：
echo    https://pulseopti-hr.vercel.app
echo.
echo 2. 如果仍然无法访问，尝试：
echo    - 使用手机热点
echo    - 刷新 DNS: ipconfig /flushdns
echo    - 使用 VPN
echo    - 查看详细诊断: diagnose-vercel.cmd
echo.
echo 3. 如果问题持续，查看：
echo    TROUBLESHOOT_EXTERNAL_ACCESS.md
echo.

pause
