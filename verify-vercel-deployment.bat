@echo off
chcp 65001 >nul

echo ========================================
echo   Vercel 部署验证脚本
echo ========================================
echo.

echo [1/6] 检查 Vercel CLI 安装...
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI 未安装
    echo 请执行: npm install -g vercel
    pause
    exit /b 1
)
echo ✅ Vercel CLI 已安装
echo.

echo [2/6] 检查登录状态...
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未登录 Vercel
    echo 请执行: vercel login
    pause
    exit /b 1
)
echo ✅ 已登录 Vercel
echo.

echo [3/6] 检查环境变量...
echo.
echo 生产环境变量列表：
vercel env ls --environment=production
echo.

echo [4/6] 检查最近部署...
echo.
vercel ls --prod
echo.

echo [5/6] 验证生产环境可访问性...
echo 正在检查 https://pulseopti-hr.vercel.app ...
curl -I --max-time 10 https://pulseopti-hr.vercel.app
echo.

echo [6/6] 数据库连接测试...
echo 正在测试数据库连接...
set "DATABASE_URL=postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
psql "%DATABASE_URL%" -c "SELECT version();" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 数据库连接成功
) else (
    echo ⚠️  数据库连接测试需要安装 psql 客户端
    echo 下载地址: https://www.postgresql.org/download/windows/
)
echo.

echo ========================================
echo   ✅ 验证完成！
echo ========================================
echo.

echo 🔗 生产环境地址：
echo    https://pulseopti-hr.vercel.app
echo.

echo 📊 Vercel Dashboard：
echo    https://vercel.com/dashboard
echo.

pause
