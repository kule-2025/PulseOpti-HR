@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo   Vercel 外网访问诊断工具
echo ========================================
echo.

echo [1/6] 检查 Vercel CLI 安装...
vercel --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('vercel --version') do set vercelVersion=%%i
    echo ✅ Vercel CLI 已安装: !vercelVersion!
) else (
    echo ❌ Vercel CLI 未安装
    echo 请执行: npm install -g vercel
    pause
    exit /b 1
)
echo.

echo [2/6] 检查登录状态...
vercel whoami >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('vercel whoami') do set username=%%i
    echo ✅ 已登录 Vercel: !username!
) else (
    echo ❌ 未登录 Vercel
    echo 请执行: vercel login
    pause
    exit /b 1
)
echo.

echo [3/6] 检查生产环境部署状态...
echo.
vercel ls --prod
echo.

echo [4/6] 检查生产环境变量...
echo.
echo 生产环境变量列表:
vercel env ls --environment=production
echo.

echo [5/6] 检查最近部署日志（最后 10 条）...
echo.
vercel logs --prod -n 10
echo.

echo [6/6] 测试外网访问...
echo 正在测试 https://pulseopti-hr.vercel.app ...
curl -I --max-time 10 https://pulseopti-hr.vercel.app 2>nul
if %errorlevel% equ 0 (
    echo ✅ 外网访问成功
) else (
    echo ⚠️  外网访问超时或失败
    echo.
    echo 可能的原因：
    echo 1. Vercel 部署未完成
    echo 2. 本地网络问题（尝试使用手机热点）
    echo 3. DNS 解析问题（执行 ipconfig /flushdns）
)
echo.

echo ========================================
echo   诊断完成
echo ========================================
echo.

echo 📋 问题排查建议：
echo.
echo 1. 如果生产环境未部署：
echo    vercel --prod
echo.
echo 2. 如果环境变量缺失：
echo    vercel env add DATABASE_URL production
echo    （逐个添加所有环境变量）
echo.
echo 3. 如果外网访问失败：
echo    - 使用手机热点测试
echo    - 刷新 DNS: ipconfig /flushdns
echo    - 使用 VPN 测试
echo    - 禁用 IPv6
echo.
echo 4. 查看详细文档：
echo    TROUBLESHOOT_EXTERNAL_ACCESS.md
echo.

echo 🔗 生产环境地址：
echo    https://pulseopti-hr.vercel.app
echo.

pause
