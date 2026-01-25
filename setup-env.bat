@echo off
REM ============================================
REM PulseOpti HR - 环境变量设置脚本
REM ============================================

echo.
echo ==========================================
echo   设置环境变量
echo ==========================================
echo.

REM 设置数据库连接字符串
echo [1/5] 设置 DATABASE_URL...
set DATABASE_URL=postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
echo ✅ DATABASE_URL 已设置

REM 设置 JWT 密钥
echo [2/5] 设置 JWT_SECRET...
set JWT_SECRET=pulseopti-hr-secret-key-2024-production
echo ✅ JWT_SECRET 已设置

REM 设置 JWT 过期时间
echo [3/5] 设置 JWT_EXPIRES_IN...
set JWT_EXPIRES_IN=7d
echo ✅ JWT_EXPIRES_IN 已设置

REM 设置运行环境
echo [4/5] 设置 NODE_ENV...
set NODE_ENV=production
echo ✅ NODE_ENV 已设置

REM 设置应用 URL
echo [5/5] 设置 NEXT_PUBLIC_APP_URL...
set NEXT_PUBLIC_APP_URL=https://pulseopti-hr.vercel.app
echo ✅ NEXT_PUBLIC_APP_URL 已设置

echo.
echo ==========================================
echo   环境变量设置完成
echo ==========================================
echo.
echo 当前环境变量：
echo DATABASE_URL = %DATABASE_URL%
echo JWT_SECRET = %JWT_SECRET%
echo JWT_EXPIRES_IN = %JWT_EXPIRES_IN%
echo NODE_ENV = %NODE_ENV%
echo NEXT_PUBLIC_APP_URL = %NEXT_PUBLIC_APP_URL%
echo.
echo ==========================================
echo.

pause
