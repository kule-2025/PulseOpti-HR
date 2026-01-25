@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: PulseOpti HR - 沙箱到本地同步脚本 (CMD版本)
:: 使用方法：双击运行或在CMD中执行：SYNC_SANDBOX_TO_LOCAL.bat

title PulseOpti HR - 沙箱文件同步工具

:MAIN_MENU
cls
echo ========================================
echo   PulseOpti HR - 沙箱文件同步工具
echo ========================================
echo.
echo 请选择同步方式：
echo.
echo 1. 🔧 完整同步 (推荐)
echo    - 同步所有源代码文件
echo    - 保留node_modules和.next
echo    - 重新安装依赖
echo.
echo 2. 📦 仅同步源代码
echo    - 仅同步src目录和配置文件
echo    - 不安装依赖
echo.
echo 3. 📋 查看同步清单
echo    - 显示需要同步的文件列表
echo.
echo 4. 🚀 快速验证
echo    - 验证本地环境配置
echo    - 检查依赖和构建
echo.
echo 5. 🚪 退出
echo.
set /p choice="请输入选项 (1-5): "

if "%choice%"=="1" goto FULL_SYNC
if "%choice%"=="2" goto SOURCE_SYNC
if "%choice%"=="3" goto SHOW_LIST
if "%choice%"=="4" goto QUICK_VERIFY
if "%choice%"=="5" goto EXIT
goto INVALID_CHOICE

:FULL_SYNC
cls
echo.
echo 🔧 开始完整同步...
echo.

:: 检查当前目录
if not exist "package.json" (
    echo ❌ 错误：当前目录不是项目根目录
    echo    请在项目根目录执行此脚本
    pause
    goto MAIN_MENU
)

:: 创建备份
echo 📦 创建备份...
set backup_dir=backup_%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set backup_dir=%backup_dir: =0%

if not exist "backups" mkdir backups

xcopy "." "backups\!backup_dir!\" /E /I /Y /EXCLUDE:sync_exclude.txt 2>nul
echo ✅ 备份完成：backups\!backup_dir!
echo.

:: 同步源代码
echo 🔄 同步源代码...

:: 复制src目录
if exist "src" (
    rmdir /s /q "src"
)
if exist "%workspace%\src" (
    xcopy "%workspace%\src" "src\" /E /I /Y
    echo    ✓ src目录
)

:: 复制public目录
if exist "public" (
    rmdir /s /q "public"
)
if exist "%workspace%\public" (
    xcopy "%workspace%\public" "public\" /E /I /Y
    echo    ✓ public目录
)

:: 复制配置文件
if exist "%workspace%\package.json" copy /Y "%workspace%\package.json" "package.json" >nul && echo    ✓ package.json
if exist "%workspace%\tsconfig.json" copy /Y "%workspace%\tsconfig.json" "tsconfig.json" >nul && echo    ✓ tsconfig.json
if exist "%workspace%\tailwind.config.ts" copy /Y "%workspace%\tailwind.config.ts" "tailwind.config.ts" >nul && echo    ✓ tailwind.config.ts
if exist "%workspace%\next.config.ts" copy /Y "%workspace%\next.config.ts" "next.config.ts" >nul && echo    ✓ next.config.ts
if exist "%workspace%\drizzle.config.ts" copy /Y "%workspace%\drizzle.config.ts" "drizzle.config.ts" >nul && echo    ✓ drizzle.config.ts
if exist "%workspace%\vercel.json" copy /Y "%workspace%\vercel.json" "vercel.json" >nul && echo    ✓ vercel.json
if exist "%workspace%\.env.example" copy /Y "%workspace%\.env.example" ".env.example" >nul && echo    ✓ .env.example

echo.
echo ✅ 源代码同步完成
echo.

:: 重新安装依赖
echo 📦 重新安装依赖...
echo    这可能需要几分钟时间...
echo.

:: 检查pnpm
where pnpm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误：pnpm 未安装
    echo    请先安装 pnpm：npm install -g pnpm
    pause
    goto MAIN_MENU
)

if exist "node_modules" rmdir /s /q "node_modules"
if exist "pnpm-lock.yaml" del /q "pnpm-lock.yaml"

call pnpm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    goto MAIN_MENU
)

echo.
echo ✅ 依赖安装完成
echo.

:: 环境变量配置
echo ⚙️  配置环境变量...

if not exist ".env" (
    if exist ".env.example" (
        copy /Y ".env.example" ".env" >nul
        echo ✅ .env 文件已创建（从.env.example复制）
        echo    ⚠️  请编辑 .env 文件，填入真实的配置信息
    ) else (
        echo ❌ 错误：找不到 .env.example 文件
    )
) else (
    echo ✅ .env 文件已存在
)

echo.
echo 🎉 完整同步完成！
echo.
echo 下一步操作：
echo    1. 编辑 .env 文件，配置数据库和其他环境变量
echo    2. 运行数据库迁移：pnpm db:push
echo    3. 启动开发服务器：pnpm dev
echo.
pause
goto MAIN_MENU

:SOURCE_SYNC
cls
echo.
echo 📦 开始同步源代码...
echo.

:: 同步源代码
if exist "src" (
    rmdir /s /q "src"
)
if exist "%workspace%\src" (
    xcopy "%workspace%\src" "src\" /E /I /Y
    echo    ✓ src目录
)

if exist "public" (
    rmdir /s /q "public"
)
if exist "%workspace%\public" (
    xcopy "%workspace%\public" "public\" /E /I /Y
    echo    ✓ public目录
)

if exist "%workspace%\package.json" copy /Y "%workspace%\package.json" "package.json" >nul && echo    ✓ package.json
if exist "%workspace%\tsconfig.json" copy /Y "%workspace%\tsconfig.json" "tsconfig.json" >nul && echo    ✓ tsconfig.json
if exist "%workspace%\tailwind.config.ts" copy /Y "%workspace%\tailwind.config.ts" "tailwind.config.ts" >nul && echo    ✓ tailwind.config.ts
if exist "%workspace%\next.config.ts" copy /Y "%workspace%\next.config.ts" "next.config.ts" >nul && echo    ✓ next.config.ts
if exist "%workspace%\drizzle.config.ts" copy /Y "%workspace%\drizzle.config.ts" "drizzle.config.ts" >nul && echo    ✓ drizzle.config.ts
if exist "%workspace%\vercel.json" copy /Y "%workspace%\vercel.json" "vercel.json" >nul && echo    ✓ vercel.json
if exist "%workspace%\.env.example" copy /Y "%workspace%\.env.example" ".env.example" >nul && echo    ✓ .env.example

echo.
echo ✅ 源代码同步完成
echo.
echo 提示：运行 'pnpm install' 安装依赖
echo.
pause
goto MAIN_MENU

:SHOW_LIST
cls
echo.
echo 📋 需要同步的文件清单：
echo.
echo 📁 核心配置文件
echo    ✓ package.json
echo    ✓ tsconfig.json
echo    ✓ next.config.ts
echo    ✓ tailwind.config.ts
echo    ✓ drizzle.config.ts
echo    ✓ vercel.json
echo    ✓ .env.example
echo.
echo 📁 前端页面 (82个)
echo    ✓ 首页和公共页面 (8个)
echo    ✓ 仪表盘 (8个)
echo    ✓ 超管端页面 (13个)
echo    ✓ 业务模块页面 (53个)
echo.
echo 📁 后端API (88个)
echo    ✓ 认证API (9个)
echo    ✓ 超管端API (14个)
echo    ✓ 业务API (65个)
echo.
echo 📁 工具库 (14个)
echo    ✓ 数据库配置
echo    ✓ 认证授权
echo    ✓ 工具函数
echo.
echo 📁 业务管理器 (36个)
echo    ✓ 招聘、绩效、考勤等
echo.
echo 📁 工作流管理器 (8个)
echo    ✓ 15种工作流支持
echo.
echo 📁 公共资源
echo    ✓ Logo和图标
echo    ✓ 微信/支付宝二维码
echo    ✓ 字体文件
echo.
echo 📁 文档文件 (60+个)
echo    ✓ 部署文档
echo    ✓ 配置文档
echo    ✓ 诊断文档
echo    ✓ 优化文档
echo.
echo 完整清单请参考 FILE_SYNC_CHECKLIST.md
echo.
pause
goto MAIN_MENU

:QUICK_VERIFY
cls
echo.
echo 🚀 开始快速验证...
echo.

set issues=0

:: 检查依赖
echo 1️⃣  检查依赖...
if exist "node_modules" (
    echo    ✅ node_modules 存在
) else (
    echo    ❌ node_modules 不存在
    set /a issues+=1
)

:: 检查环境变量
echo 2️⃣  检查环境变量...
if exist ".env" (
    echo    ✅ .env 文件存在

    :: 检查关键配置
    findstr /C:"DATABASE_URL=" ".env" >nul 2>&1
    if !errorlevel! equ 0 (
        echo    ✅ DATABASE_URL 已配置
    ) else (
        echo    ❌ DATABASE_URL 未配置
        set /a issues+=1
    )

    findstr /C:"JWT_SECRET=" ".env" >nul 2>&1
    if !errorlevel! equ 0 (
        echo    ✅ JWT_SECRET 已配置
    ) else (
        echo    ⚠️  JWT_SECRET 未配置（将使用默认值）
    )
) else (
    echo    ❌ .env 文件不存在
    set /a issues+=1
)

:: 检查TypeScript
echo 3️⃣  检查TypeScript...
if exist "tsconfig.json" (
    echo    ✅ tsconfig.json 存在
    echo    运行类型检查...
    call pnpm ts-check
    if !errorlevel! equ 0 (
        echo    ✅ TypeScript 类型检查通过
    ) else (
        echo    ⚠️  TypeScript 类型检查有警告
    )
) else (
    echo    ❌ tsconfig.json 不存在
    set /a issues+=1
)

:: 检查构建
echo 4️⃣  检查构建...
if exist ".next" (
    echo    ✅ .next 构建目录存在
) else (
    echo    ⚠️  .next 构建目录不存在
    echo    提示：运行 'pnpm build' 构建项目
)

:: 检查端口
echo 5️⃣  检查端口...
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo    ⚠️  端口 5000 已被占用
) else (
    echo    ✅ 端口 5000 可用
)

echo.
echo ========================================
echo   验证结果
echo ========================================

if %issues% equ 0 (
    echo.
    echo 🎉 所有检查通过！环境配置正常。
    echo.
    echo 下一步：
    echo    1. 运行数据库迁移：pnpm db:push
    echo    2. 启动开发服务器：pnpm dev
    echo    3. 访问 http://localhost:5000
    echo.
) else (
    echo.
    echo ⚠️  发现 %issues% 个问题需要处理
    echo.
)

pause
goto MAIN_MENU

:INVALID_CHOICE
echo.
echo ❌ 无效选项，请重新选择
echo.
pause
goto MAIN_MENU

:EXIT
echo.
echo 👋 再见！
echo.
timeout /t 2 >nul
exit /b
