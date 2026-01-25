@echo off
chcp 65001 > nul
echo ========================================
echo   PulseOpti HR - Vercel CLI 部署脚本
echo ========================================
echo.

cd /d C:\PulseOpti-HR\PulseOpti-HR

echo [1/6] 检查 Vercel CLI 登录状态...
vercel whoami
if %errorlevel% neq 0 (
    echo ❌ 未登录 Vercel，正在登录...
    vercel login
)

echo.
echo [2/6] 删除旧的 Vercel 配置...
if exist .vercel (
    rmdir /s /q .vercel
    echo ✓ 已删除旧配置
) else (
    echo ✓ 无旧配置
)

echo.
echo [3/6] 开始部署到生产环境...
echo.
echo 请按照提示回答问题：
echo   - Set up and deploy: yes
echo   - Which scope: tomato-ai-writer
echo   - Link to existing project: no
echo   - Project name: pulseopti-hr
echo   - In which directory: （按 Enter）
echo   - Override settings: no
echo.
pause

vercel --prod

echo.
echo [4/6] 配置环境变量...
echo.
echo 需要依次添加以下环境变量：
echo   1. DATABASE_URL
echo   2. JWT_SECRET
echo   3. JWT_EXPIRES_IN
echo   4. NODE_ENV
echo   5. NEXT_PUBLIC_APP_URL
echo.
pause

echo 添加 DATABASE_URL...
vercel env add DATABASE_URL production

echo 添加 JWT_SECRET...
vercel env add JWT_SECRET production

echo 添加 JWT_EXPIRES_IN...
vercel env add JWT_EXPIRES_IN production

echo 添加 NODE_ENV...
vercel env add NODE_ENV production

echo 添加 NEXT_PUBLIC_APP_URL...
vercel env add NEXT_PUBLIC_APP_URL production

echo.
echo [5/6] 重新部署应用环境变量...
vercel --prod

echo.
echo [6/6] 部署完成！
echo.
echo 测试以下 URL：
echo   - 主页: https://pulseopti-hr.vercel.app
echo   - 登录: https://pulseopti-hr.vercel.app/login
echo   - API: https://pulseopti-hr.vercel.app/api/health
echo.
pause
