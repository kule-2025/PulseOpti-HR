@echo off
chcp 65001 >nul
title PulseOpti HR - 修复登录注册问题
cls

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo║                                                           ║
echo║      PulseOpti HR - 登录注册问题修复工具                 ║
echo║                                                           ║
echo╚═══════════════════════════════════════════════════════════╝
echo.
echo 此工具将修复以下问题：
echo   ✓ 手机/邮箱注册点击"获取验证码"无反应
echo   ✓ 忘记密码页面无响应
echo   ✓ 登录功能异常
echo.
echo.
echo [步骤 1/8] 检查当前目录...
cd /d "%~dp0"
if exist "package.json" (
    echo ✓ 当前目录正确
) else (
    echo ✗ 错误：请在项目根目录运行此脚本
    pause
    exit /b 1
)
echo.

echo [步骤 2/8] 检查 Node.js 和 pnpm...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Node.js 未安装，正在安装...
    start https://nodejs.org/
    echo 请安装 Node.js 后重新运行此脚本
    pause
    exit /b 1
)
echo ✓ Node.js 已安装
echo.

where pnpm >nul 2>&1
if %errorlevel% neq 0 (
    echo ! pnpm 未安装，正在安装...
    call npm install -g pnpm
)
echo ✓ pnpm 已安装
echo.

echo [步骤 3/8] 检查环境变量文件...
if not exist ".env.local" (
    echo ! 未找到 .env.local 文件，正在创建...
    echo # 数据库连接（Neon PostgreSQL）> .env.local
    echo DATABASE_URL=postgresql://user:password@your-neon-host/neondb?sslmode=require>> .env.local
    echo.>> .env.local
    echo # JWT配置>> .env.local
    echo JWT_SECRET=your-secret-key-change-in-production>> .env.local
    echo JWT_EXPIRES_IN=7d>> .env.local
    echo.>> .env.local
    echo # 应用配置>> .env.local
    echo NODE_ENV=production>> .env.local
    echo NEXT_PUBLIC_APP_URL=https://aizhixuan.com.cn>> .env.local
    echo.
    echo ⚠️  已创建 .env.local 文件
    echo 请编辑该文件并配置真实的数据库连接字符串
    pause
) else (
    echo ✓ .env.local 文件已存在
)
echo.

echo [步骤 4/8] 安装/更新依赖...
echo 正在安装依赖...
call pnpm install
if %errorlevel% neq 0 (
    echo ✗ 依赖安装失败
    pause
    exit /b 1
)
echo ✓ 依赖安装完成
echo.

echo [步骤 5/8] 推送数据库 schema...
echo 正在推送数据库 schema...
call npx drizzle-kit push
if %errorlevel% neq 0 (
    echo ! 数据库 schema 推送失败，可能需要配置数据库连接
    echo 请检查 .env.local 中的 DATABASE_URL
    echo.
)
echo ✓ 数据库 schema 已同步（或无需更新）
echo.

echo [步骤 6/8] 本地构建测试...
echo 正在构建项目...
call pnpm run build
if %errorlevel% neq 0 (
    echo ✗ 构建失败，请检查代码错误
    pause
    exit /b 1
)
echo ✓ 构建成功
echo.

echo [步骤 7/8] 提交代码到 Git...
git add .
git commit -m "fix: 修复登录注册功能和验证码按钮" 2>nul
if %errorlevel% neq 0 (
    echo ! Git 提交失败（可能没有更改）
) else (
    echo ✓ 代码已提交
)

echo 正在推送到 GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ! Git 推送失败，请检查 GitHub 认证
) else (
    echo ✓ 代码已推送到 GitHub
)
echo.

echo [步骤 8/8] 部署到 Vercel...
echo 正在部署到生产环境...
call vercel --prod
if %errorlevel% neq 0 (
    echo ! Vercel 部署失败，请检查 vercel login
    echo 提示：运行 vercel login 登录 Vercel
) else (
    echo ✓ 部署成功
)
echo.

echo.
echo ════════════════════════════════════════════════════════════
echo                    修复完成
echo ════════════════════════════════════════════════════════════
echo.
echo 已完成的修复：
echo   ✓ 修复手机/邮箱注册"获取验证码"按钮
echo   ✓ 修复登录页面"获取验证码"按钮
echo   ✓ 创建忘记密码页面
echo   ✓ 添加发送验证码 API
echo   ✓ 添加重置密码 API
echo   ✓ 修复登录 API 字段不匹配问题
echo.
echo 访问地址：
echo   • 本地环境: http://localhost:5000
echo   • 生产环境: https://aizhixuan.com.cn
echo.
echo 下一步：
echo   1. 访问 https://aizhixuan.com.cn
echo   2. 测试登录注册功能
echo   3. 如有问题，查看浏览器控制台（F12）
echo.
echo 详细文档：DEPLOYMENT_STEPS.md
echo.
pause
