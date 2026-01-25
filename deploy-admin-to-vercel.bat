@echo off
chcp 65001 >nul
echo ============================================================
echo PulseOpti HR - 超管端部署到 Vercel 自动化脚本
echo ============================================================
echo.
echo 此脚本将帮助你：
echo 1. 部署超管端到 Vercel
echo 2. 配置自定义域名 admin.aizhixuan.com.cn
echo 3. 实现前端与超管端实时数据同步
echo.
echo ============================================================
echo.

REM 检查是否安装了 Vercel CLI
echo [步骤 1/10] 检查 Vercel CLI 安装状态...
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI 未安装，正在安装...
    pnpm add -g vercel
    if %errorlevel% neq 0 (
        echo ❌ 安装失败，请手动安装：pnpm add -g vercel
        pause
        exit /b 1
    )
    echo ✅ Vercel CLI 安装成功
) else (
    echo ✅ Vercel CLI 已安装
)

REM 检查是否登录 Vercel
echo.
echo [步骤 2/10] 检查 Vercel 登录状态...
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  需要登录 Vercel
    echo 正在打开登录页面...
    vercel login
    if %errorlevel% neq 0 (
        echo ❌ 登录失败，请重试
        pause
        exit /b 1
    )
    echo ✅ 登录成功
) else (
    echo ✅ 已登录 Vercel
)

REM 获取前端 DATABASE_URL
echo.
echo [步骤 3/10] 获取前端数据库连接信息...
echo 正在拉取前端环境变量...
vercel env pull .env.frontend.temp >nul 2>&1
if exist .env.frontend.temp (
    for /f "tokens=1,2 delims==" %%a in (.env.frontend.temp) do (
        if "%%a"=="DATABASE_URL" set FRONTEND_DATABASE_URL=%%b
    )
    if defined FRONTEND_DATABASE_URL (
        echo ✅ 成功获取前端 DATABASE_URL
        echo    数据库连接字符串：%FRONTEND_DATABASE_URL:~0,50%...
    ) else (
        echo ❌ 未找到 DATABASE_URL
        del .env.frontend.temp
        pause
        exit /b 1
    )
    del .env.frontend.temp
) else (
    echo ❌ 无法获取前端环境变量
    echo 请确保已链接前端项目
    pause
    exit /b 1
)

REM 部署超管端
echo.
echo [步骤 4/10] 部署超管端到 Vercel...
echo 正在创建新项目并部署...
vercel --prod --yes --name pulseopti-hr-admin
if %errorlevel% neq 0 (
    echo ❌ 部署失败
    pause
    exit /b 1
)
echo ✅ 部署成功

REM 配置环境变量
echo.
echo [步骤 5/10] 配置超管端环境变量...

echo 配置 DATABASE_URL...
echo %FRONTEND_DATABASE_URL% | vercel env add DATABASE_URL production
if %errorlevel% neq 0 (
    echo ⚠️  DATABASE_URL 配置失败，请手动配置
)

echo 配置 JWT_SECRET...
echo super_admin_jwt_secret_key_change_in_production | vercel env add JWT_SECRET production
if %errorlevel% neq 0 (
    echo ⚠️  JWT_SECRET 配置失败，请手动配置
)

echo 配置 NEXT_PUBLIC_APP_URL...
echo https://admin.aizhixuan.com.cn | vercel env add NEXT_PUBLIC_APP_URL production
if %errorlevel% neq 0 (
    echo ⚠️  NEXT_PUBLIC_APP_URL 配置失败，请手动配置
)

echo 配置 NEXT_PUBLIC_API_URL...
echo https://admin.aizhixuan.com.cn | vercel env add NEXT_PUBLIC_API_URL production
if %errorlevel% neq 0 (
    echo ⚠️  NEXT_PUBLIC_API_URL 配置失败，请手动配置
)

echo 配置 NODE_ENV...
echo production | vercel env add NODE_ENV production
if %errorlevel% neq 0 (
    echo ⚠️  NODE_ENV 配置失败，请手动配置
)

echo 配置 SUPER_ADMIN_EMAIL...
echo 208343256@qq.com | vercel env add SUPER_ADMIN_EMAIL production
if %errorlevel% neq 0 (
    echo ⚠️  SUPER_ADMIN_EMAIL 配置失败，请手动配置
)

echo 配置 SUPER_ADMIN_PASSWORD...
echo admin123 | vercel env add SUPER_ADMIN_PASSWORD production
if %errorlevel% neq 0 (
    echo ⚠️  SUPER_ADMIN_PASSWORD 配置失败，请手动配置
)

echo 配置 ADMIN_MODE...
echo true | vercel env add ADMIN_MODE production
if %errorlevel% neq 0 (
    echo ⚠️  ADMIN_MODE 配置失败，请手动配置
)

echo ✅ 环境变量配置完成

REM 添加自定义域名
echo.
echo [步骤 6/10] 配置自定义域名...
echo 正在添加域名 admin.aizhixuan.com.cn...
vercel domains add admin.aizhixuan.com.cn
if %errorlevel% neq 0 (
    echo ⚠️  域名添加失败，请手动添加
    echo 访问 https://vercel.com/dashboard 添加域名
) else (
    echo ✅ 域名添加成功
)

REM 重新部署
echo.
echo [步骤 7/10] 重新部署以应用配置...
vercel --prod
if %errorlevel% neq 0 (
    echo ❌ 部署失败
    pause
    exit /b 1
)
echo ✅ 重新部署成功

REM 等待 DNS 生效
echo.
echo [步骤 8/10] 等待 DNS 生效（需要 5-10 分钟）...
echo DNS 配置信息：
echo   类型：CNAME
echo   主机记录：admin
echo   记录值：cname.vercel-dns.com
echo.
echo 请在域名注册商（腾讯云/阿里云等）添加上述 DNS 记录
echo.
pause

REM 验证部署
echo.
echo [步骤 9/10] 验证部署状态...
echo 正在检查部署状态...
vercel ls
echo.
echo 部署信息已显示，请确认项目名称和 URL
pause

REM 创建超级管理员账号
echo.
echo [步骤 10/10] 创建超级管理员账号...
echo.
echo 请通过以下方式创建超级管理员账号：
echo.
echo 方式 1：通过注册页面（推荐）
echo   访问：https://admin.aizhixuan.com.cn/register
echo   填写：
echo     - 邮箱：208343256@qq.com
echo     - 密码：admin123
echo     - 姓名：超级管理员
echo.
echo 方式 2：通过 API
echo   执行以下命令：
echo   curl -X POST https://admin.aizhixuan.com.cn/api/auth/register ^
echo     -H "Content-Type: application/json" ^
echo     -d "{\"email\":\"208343256@qq.com\",\"password\":\"admin123\",\"name\":\"超级管理员\"}"
echo.
pause

REM 完成
echo.
echo ============================================================
echo ✅ 超管端部署完成！
echo ============================================================
echo.
echo 访问地址：
echo   - 超管端登录页：https://admin.aizhixuan.com.cn/login
echo   - 超管端首页：https://admin.aizhixuan.com.cn
echo.
echo 管理员账号：
echo   - 邮箱：208343256@qq.com
echo   - 密码：admin123
echo.
echo 数据同步验证：
echo   1. 访问前端：https://www.aizhixuan.com.cn
echo   2. 注册新用户
echo   3. 访问超管端：https://admin.aizhixuan.com.cn/admin/users
echo   4. 查看是否显示刚注册的用户
echo.
echo 后续维护：
echo   - 查看日志：vercel logs --follow
echo   - 重新部署：vercel --prod
echo   - 管理环境变量：vercel env ls production
echo.
echo ============================================================
echo.
pause
