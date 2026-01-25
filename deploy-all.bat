@echo off
REM ============================================
REM PulseOpti HR - 一键部署脚本
REM ============================================

echo.
echo ==========================================
echo   PulseOpti HR 脉策聚效 - 一键部署工具
echo ==========================================
echo.

REM 检查是否在项目目录中
if not exist "package.json" (
    echo ❌ 错误：未找到 package.json
    echo.
    echo 请确保在项目根目录中运行此脚本
    echo.
    pause
    exit /b 1
)

REM 检查 Node.js
echo [检查] 验证 Node.js 安装...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装
    echo 请访问 https://nodejs.org 下载安装
    pause
    exit /b 1
)
echo ✅ Node.js 已安装

REM 检查 pnpm
echo [检查] 验证 pnpm 安装...
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pnpm 未安装
    echo 正在安装 pnpm...
    call npm install -g pnpm
    if errorlevel 1 (
        echo ❌ pnpm 安装失败
        pause
        exit /b 1
    )
)
echo ✅ pnpm 已安装

REM 检查 Git
echo [检查] 验证 Git 安装...
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git 未安装
    echo 请访问 https://git-scm.com/downloads 下载安装
    pause
    exit /b 1
)
echo ✅ Git 已安装

REM 检查 Vercel CLI
echo [检查] 验证 Vercel CLI 安装...
vercel --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Vercel CLI 未安装
    echo 正在安装 Vercel CLI...
    call npm install -g vercel
    if errorlevel 1 (
        echo ❌ Vercel CLI 安装失败
        pause
        exit /b 1
    )
)
echo ✅ Vercel CLI 已安装

echo.
echo ==========================================
echo   工具检查完成
echo ==========================================
echo.

REM 主菜单
:MENU
echo 请选择操作：
echo.
echo 1. 安装依赖
echo 2. 本地构建测试
echo 3. 登录 Vercel
echo 4. 部署到 Vercel
echo 5. 配置环境变量
echo 6. 运行数据库迁移
echo 7. 验证部署
echo 8. 一键完整部署（推荐）
echo 0. 退出
echo.
set /p choice=请输入选项 (0-8):

if "%choice%"=="1" goto INSTALL
if "%choice%"=="2" goto BUILD
if "%choice%"=="3" goto LOGIN
if "%choice%"=="4" goto DEPLOY
if "%choice%"=="5" goto ENV
if "%choice%"=="6" goto MIGRATE
if "%choice%"=="7" goto VERIFY
if "%choice%"=="8" goto FULL_DEPLOY
if "%choice%"=="0" exit /b 0

echo 无效选项，请重新选择
goto MENU

:INSTALL
echo.
echo ==========================================
echo   安装依赖
echo ==========================================
echo.
call pnpm install
if errorlevel 1 (
    echo ❌ 依赖安装失败
    pause
    goto MENU
)
echo ✅ 依赖安装成功
pause
goto MENU

:BUILD
echo.
echo ==========================================
echo   本地构建测试
echo ==========================================
echo.
call pnpm run build
if errorlevel 1 (
    echo ❌ 构建失败
    pause
    goto MENU
)
echo ✅ 构建成功
pause
goto MENU

:LOGIN
echo.
echo ==========================================
echo   登录 Vercel
echo ==========================================
echo.
call vercel login
if errorlevel 1 (
    echo ❌ Vercel 登录失败
    pause
    goto MENU
)
echo ✅ Vercel 登录成功
pause
goto MENU

:DEPLOY
echo.
echo ==========================================
echo   部署到 Vercel
echo ==========================================
echo.
call vercel
if errorlevel 1 (
    echo ❌ 部署失败
    pause
    goto MENU
)
echo ✅ 部署成功
echo.
echo 请记录部署 URL：https://pulseopti-hr.vercel.app
pause
goto MENU

:ENV
echo.
echo ==========================================
echo   配置环境变量
echo ==========================================
echo.

echo 设置 DATABASE_URL...
call vercel env add DATABASE_URL production
if errorlevel 1 (
    echo ❌ DATABASE_URL 设置失败
    pause
    goto MENU
)

echo 设置 JWT_SECRET...
call vercel env add JWT_SECRET production
if errorlevel 1 (
    echo ❌ JWT_SECRET 设置失败
    pause
    goto MENU
)

echo 设置 JWT_EXPIRES_IN...
call vercel env add JWT_EXPIRES_IN production
if errorlevel 1 (
    echo ❌ JWT_EXPIRES_IN 设置失败
    pause
    goto MENU
)

echo 设置 NODE_ENV...
call vercel env add NODE_ENV production
if errorlevel 1 (
    echo ❌ NODE_ENV 设置失败
    pause
    goto MENU
)

echo 设置 NEXT_PUBLIC_APP_URL...
call vercel env add NEXT_PUBLIC_APP_URL production
if errorlevel 1 (
    echo ❌ NEXT_PUBLIC_APP_URL 设置失败
    pause
    goto MENU
)

echo ✅ 所有环境变量设置成功
pause
goto MENU

:MIGRATE
echo.
echo ==========================================
echo   运行数据库迁移
echo ==========================================
echo.

REM 设置环境变量
set DATABASE_URL=postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

echo 生成迁移文件...
call pnpm drizzle-kit generate
if errorlevel 1 (
    echo ❌ 生成迁移文件失败
    pause
    goto MENU
)

echo 执行迁移...
call pnpm drizzle-kit migrate
if errorlevel 1 (
    echo ❌ 执行迁移失败
    pause
    goto MENU
)

echo ✅ 数据库迁移成功
echo.
echo 请访问 https://console.neon.tech 验证数据库表
pause
goto MENU

:VERIFY
echo.
echo ==========================================
echo   验证部署
echo ==========================================
echo.
call verify-deploy.bat
goto MENU

:FULL_DEPLOY
echo.
echo ==========================================
echo   一键完整部署
echo ==========================================
echo.
echo 此操作将依次执行：
echo   1. 安装依赖
echo   2. 本地构建测试
echo   3. 部署到 Vercel
echo   4. 配置环境变量
echo   5. 运行数据库迁移
echo   6. 重新部署（应用环境变量）
echo   7. 验证部署
echo.
set /p confirm=是否继续？(Y/N):
if /i not "%confirm%"=="Y" (
    echo 操作已取消
    goto MENU
)

REM 步骤 1: 安装依赖
echo.
echo [1/7] 安装依赖...
call pnpm install
if errorlevel 1 (
    echo ❌ 依赖安装失败
    pause
    goto MENU
)
echo ✅ 依赖安装成功

REM 步骤 2: 本地构建测试
echo [2/7] 本地构建测试...
call pnpm run build
if errorlevel 1 (
    echo ❌ 构建失败
    pause
    goto MENU
)
echo ✅ 构建成功

REM 步骤 3: 部署到 Vercel
echo [3/7] 部署到 Vercel...
call vercel
if errorlevel 1 (
    echo ❌ 部署失败
    pause
    goto MENU
)
echo ✅ 部署成功

REM 步骤 4: 配置环境变量
echo [4/7] 配置环境变量...
call vercel env add DATABASE_URL production
call vercel env add JWT_SECRET production
call vercel env add JWT_EXPIRES_IN production
call vercel env add NODE_ENV production
call vercel env add NEXT_PUBLIC_APP_URL production
echo ✅ 环境变量配置成功

REM 步骤 5: 运行数据库迁移
echo [5/7] 运行数据库迁移...
set DATABASE_URL=postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
call pnpm drizzle-kit generate
call pnpm drizzle-kit migrate
if errorlevel 1 (
    echo ❌ 数据库迁移失败
    pause
    goto MENU
)
echo ✅ 数据库迁移成功

REM 步骤 6: 重新部署
echo [6/7] 重新部署（应用环境变量）...
call vercel --prod
if errorlevel 1 (
    echo ❌ 重新部署失败
    pause
    goto MENU
)
echo ✅ 重新部署成功

REM 步骤 7: 验证部署
echo [7/7] 验证部署...
call verify-deploy.bat

echo.
echo ==========================================
echo   部署完成！
echo ==========================================
echo.
echo 生产环境 URL: https://pulseopti-hr.vercel.app
echo Vercel Dashboard: https://vercel.com/dashboard
echo Neon Console: https://console.neon.tech
echo.
pause
goto MENU
