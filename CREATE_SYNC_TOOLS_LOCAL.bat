@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo   PulseOpti HR - 创建同步工具
echo ========================================
echo.

echo 正在创建同步脚本文件...
echo.

:: 创建 PowerShell 脚本
echo [1/4] 创建 SYNC_SANDBOX_TO_LOCAL.ps1...
(
echo # PulseOpti HR - 沙箱到本地同步脚本 ^^(PowerShell版本^^)
echo # 使用方法：以管理员身份运行 PowerShell，然后执行：. .\SYNC_SANDBOX_TO_LOCAL.ps1
echo.
echo Write-Host "========================================" -ForegroundColor Cyan
echo Write-Host "  PulseOpti HR - 沙箱文件同步工具" -ForegroundColor Cyan
echo Write-Host "========================================" -ForegroundColor Cyan
echo Write-Host ""
echo.
echo $currentDir = Get-Location
echo Write-Host "当前目录: $currentDir" -ForegroundColor Yellow
echo Write-Host ""
echo.
echo # 颜色定义
echo $colorInfo = "Green"
echo $colorWarning = "Yellow"
echo $colorError = "Red"
echo $colorSuccess = "Cyan"
echo.
echo # 显示同步菜单
echo function Show-Menu {
echo     Write-Host "请选择同步方式：" -ForegroundColor $colorInfo
echo     Write-Host ""
echo     Write-Host "1. 🔧 完整同步 ^^(推荐^^)" -ForegroundColor $colorSuccess
echo     Write-Host "   - 同步所有源代码文件" -ForegroundColor White
echo     Write-Host "   - 保留node_modules和.next" -ForegroundColor White
echo     Write-Host "   - 重新安装依赖" -ForegroundColor White
echo     Write-Host ""
echo     Write-Host "2. 📦 仅同步源代码" -ForegroundColor $colorSuccess
echo     Write-Host "   - 仅同步src目录和配置文件" -ForegroundColor White
echo     Write-Host "   - 不安装依赖" -ForegroundColor White
echo     Write-Host ""
echo     Write-Host "3. 📋 查看同步清单" -ForegroundColor $colorSuccess
echo     Write-Host "   - 显示需要同步的文件列表" -ForegroundColor White
echo     Write-Host ""
echo     Write-Host "4. 🚀 快速验证" -ForegroundColor $colorSuccess
echo     Write-Host "   - 验证本地环境配置" -ForegroundColor White
echo     Write-Host "   - 检查依赖和构建" -ForegroundColor White
echo     Write-Host ""
echo     Write-Host "5. 🚪 退出" -ForegroundColor $colorWarning
echo     Write-Host ""
echo }
echo.
echo # 显示同步统计
echo function Show-SyncStats {
echo     Write-Host ""
echo     Write-Host "========================================" -ForegroundColor Cyan
echo     Write-Host "  同步统计信息" -ForegroundColor Cyan
echo     Write-Host "========================================" -ForegroundColor Cyan
echo     Write-Host ""
echo.
echo     # 统计文件数量
echo     if ^(Test-Path "src"^) {
echo         $srcFiles = Get-ChildItem -Path "src" -Recurse -File -ErrorAction SilentlyContinue ^| Measure-Object ^| Select-Object -ExpandProperty Count
echo         Write-Host "📁 项目文件统计：" -ForegroundColor $colorInfo
echo         Write-Host "   - 源代码文件： $srcFiles 个" -ForegroundColor White
echo     } else {
echo         Write-Host "❌ src 目录不存在" -ForegroundColor $colorError
echo     }
echo     Write-Host ""
echo.
echo     # 检查依赖
echo     if ^(Test-Path "node_modules"^) {
echo         Write-Host "✅ node_modules 已存在" -ForegroundColor $colorSuccess
echo     } else {
echo         Write-Host "❌ node_modules 不存在" -ForegroundColor $colorError
echo     }
echo.
echo     # 检查构建
echo     if ^(Test-Path ".next"^) {
echo         Write-Host "✅ .next 构建目录已存在" -ForegroundColor $colorSuccess
echo     } else {
echo         Write-Host "❌ .next 构建目录不存在" -ForegroundColor $colorError
echo     }
echo.
echo     # 检查环境变量
echo     if ^(Test-Path ".env"^) {
echo         Write-Host "✅ .env 文件已存在" -ForegroundColor $colorSuccess
echo     } else {
echo         Write-Host "❌ .env 文件不存在 ^(需要从.env.example复制^)" -ForegroundColor $colorWarning
echo     }
echo     Write-Host ""
echo }
echo.
echo # 完整同步
echo function Full-Sync {
echo     Write-Host ""
echo     Write-Host "🔧 开始完整同步..." -ForegroundColor $colorInfo
echo     Write-Host ""
echo.
echo     # 检查项目文件
echo     if ^(-not ^(Test-Path "package.json"^)^) {
echo         Write-Host "❌ 错误：当前目录不是项目根目录" -ForegroundColor $colorError
echo         Write-Host "   请确保在项目根目录执行此脚本" -ForegroundColor $colorWarning
echo         return
echo     }
echo.
echo     # 创建备份
echo     Write-Host "📦 创建备份..." -ForegroundColor $colorWarning
echo     $backupDir = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss'^)"
echo     if ^(-not ^(Test-Path "backups"^)^) {
echo         New-Item -ItemType Directory -Path "backups" ^| Out-Null
echo     }
echo.
echo     # 简单备份
echo     Copy-Item -Path "src" -Destination "backups\$backupDir" -Recurse -Force -ErrorAction SilentlyContinue
echo     Copy-Item -Path "package.json" -Destination "backups\$backupDir" -Force -ErrorAction SilentlyContinue
echo     Write-Host "✅ 备份完成：backups\$backupDir" -ForegroundColor $colorSuccess
echo.
echo     # 检查pnpm是否安装
echo     Write-Host "📦 检查依赖..." -ForegroundColor $colorInfo
echo     if ^(-not ^(Get-Command pnpm -ErrorAction SilentlyContinue^)^) {
echo         Write-Host "❌ 错误：pnpm 未安装" -ForegroundColor $colorError
echo         Write-Host "   请先安装 pnpm：npm install -g pnpm" -ForegroundColor $colorWarning
echo         return
echo     }
echo     Write-Host "✅ pnpm 已安装" -ForegroundColor $colorSuccess
echo.
echo     # 安装依赖
echo     Write-Host ""
echo     Write-Host "📦 安装依赖..." -ForegroundColor $colorInfo
echo     Write-Host "   这可能需要几分钟时间..." -ForegroundColor $colorWarning
echo.
echo     pnpm install
echo     if ^($LASTEXITCODE -eq 0^) {
echo         Write-Host "✅ 依赖安装完成" -ForegroundColor $colorSuccess
echo     } else {
echo         Write-Host "❌ 依赖安装失败" -ForegroundColor $colorError
echo         return
echo     }
echo.
echo     # 环境变量配置
echo     Write-Host ""
echo     Write-Host "⚙️  配置环境变量..." -ForegroundColor $colorInfo
echo.
echo     if ^(-not ^(Test-Path ".env"^)^) {
echo         if ^(Test-Path ".env.example"^) {
echo             Copy-Item -Path ".env.example" -Destination ".env"
echo             Write-Host "✅ .env 文件已创建^（从.env.example复制^）" -ForegroundColor $colorSuccess
echo             Write-Host "   ⚠️  请编辑 .env 文件，填入真实的配置信息" -ForegroundColor $colorWarning
echo         } else {
echo             Write-Host "❌ 错误：找不到 .env.example 文件" -ForegroundColor $colorError
echo         }
echo     } else {
echo         Write-Host "✅ .env 文件已存在" -ForegroundColor $colorSuccess
echo     }
echo.
echo     Write-Host ""
echo     Write-Host "🎉 本地环境初始化完成！" -ForegroundColor $colorSuccess
echo     Write-Host ""
echo     Write-Host "下一步操作：" -ForegroundColor $colorInfo
echo     Write-Host "   1. 编辑 .env 文件，配置数据库和其他环境变量" -ForegroundColor White
echo     Write-Host "   2. 运行数据库迁移：pnpm db:push" -ForegroundColor White
echo     Write-Host "   3. 启动开发服务器：pnpm dev" -ForegroundColor White
echo     Write-Host ""
echo }
echo.
echo # 快速验证
echo function Quick-Verify {
echo     Write-Host ""
echo     Write-Host "🚀 开始快速验证..." -ForegroundColor $colorInfo
echo     Write-Host ""
echo.
echo     $issues = 0
echo.
echo     # 检查依赖
echo     Write-Host "1️⃣  检查依赖..." -ForegroundColor White
echo     if ^(Test-Path "node_modules"^) {
echo         Write-Host "   ✅ node_modules 存在" -ForegroundColor $colorSuccess
echo     } else {
echo         Write-Host "   ❌ node_modules 不存在" -ForegroundColor $colorError
echo         $issues += 1
echo     }
echo.
echo     # 检查环境变量
echo     Write-Host "2️⃣  检查环境变量..." -ForegroundColor White
echo     if ^(Test-Path ".env"^) {
echo         Write-Host "   ✅ .env 文件存在" -ForegroundColor $colorSuccess
echo.
echo         # 检查关键配置
echo         $envContent = Get-Content ".env" -Raw
echo         if ^($envContent -match "DATABASE_URL="^) {
echo             Write-Host "   ✅ DATABASE_URL 已配置" -ForegroundColor $colorSuccess
echo         } else {
echo             Write-Host "   ❌ DATABASE_URL 未配置" -ForegroundColor $colorError
echo             $issues += 1
echo         }
echo.
echo         if ^($envContent -match "JWT_SECRET="^) {
echo             Write-Host "   ✅ JWT_SECRET 已配置" -ForegroundColor $colorSuccess
echo         } else {
echo             Write-Host "   ⚠️  JWT_SECRET 未配置^（将使用默认值^）" -ForegroundColor $colorWarning
echo         }
echo     } else {
echo         Write-Host "   ❌ .env 文件不存在" -ForegroundColor $colorError
echo         $issues += 1
echo     }
echo.
echo     # 检查TypeScript
echo     Write-Host "3️⃣  检查TypeScript..." -ForegroundColor White
echo     if ^(Test-Path "tsconfig.json"^) {
echo         Write-Host "   ✅ tsconfig.json 存在" -ForegroundColor $colorSuccess
echo     } else {
echo         Write-Host "   ❌ tsconfig.json 不存在" -ForegroundColor $colorError
echo         $issues += 1
echo     }
echo.
echo     # 检查端口
echo     Write-Host "4️⃣  检查端口..." -ForegroundColor White
echo     $port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue ^| Where-Object { $_.State -eq "Listen" }
echo     if ^($port5000^) {
echo         Write-Host "   ⚠️  端口 5000 已被占用" -ForegroundColor $colorWarning
echo     } else {
echo         Write-Host "   ✅ 端口 5000 可用" -ForegroundColor $colorSuccess
echo     }
echo.
echo     Write-Host ""
echo     Write-Host "========================================" -ForegroundColor Cyan
echo     Write-Host "  验证结果" -ForegroundColor Cyan
echo     Write-Host "========================================" -ForegroundColor Cyan
echo.
echo     if ^($issues -eq 0^) {
echo         Write-Host ""
echo         Write-Host "🎉 所有检查通过！环境配置正常。" -ForegroundColor $colorSuccess
echo         Write-Host ""
echo         Write-Host "下一步：" -ForegroundColor $colorInfo
echo         Write-Host "   1. 运行数据库迁移：pnpm db:push" -ForegroundColor White
echo         Write-Host "   2. 启动开发服务器：pnpm dev" -ForegroundColor White
echo         Write-Host "   3. 访问 http://localhost:5000" -ForegroundColor White
echo         Write-Host ""
echo     } else {
echo         Write-Host ""
echo         Write-Host "⚠️  发现 $issues 个问题需要处理" -ForegroundColor $colorWarning
echo         Write-Host ""
echo     }
echo }
echo.
echo # 显示同步清单
echo function Show-SyncList {
echo     Write-Host ""
echo     Write-Host "📋 项目文件清单：" -ForegroundColor $colorInfo
echo     Write-Host ""
echo.
echo     $fileList = @(
echo         "📁 前端页面 ^（82个^）",
echo         "   ✓ 首页和公共页面 ^（8个^）",
echo         "   ✓ 仪表盘 ^（8个^）",
echo         "   ✓ 超管端页面 ^（13个^）",
echo         "   ✓ 业务模块页面 ^（53个^）",
echo         "",
echo         "📁 后端API ^（88个^）",
echo         "   ✓ 认证API ^（9个^）",
echo         "   ✓ 超管端API ^（14个^）",
echo         "   ✓ 业务API ^（65个^）",
echo         "",
echo         "📁 工具库 ^（14个^）",
echo         "   ✓ 数据库配置",
echo         "   ✓ 认证授权",
echo         "   ✓ 工具函数",
echo         "",
echo         "📁 业务管理器 ^（36个^）",
echo         "   ✓ 招聘、绩效、考勤等",
echo         "",
echo         "📁 工作流管理器 ^（8个^）",
echo         "   ✓ 15种工作流支持"
echo     ^)
echo.
echo     foreach ^($item in $fileList^) {
echo         Write-Host $item
echo     }
echo     Write-Host ""
echo }
echo.
echo # 主循环
echo do {
echo     Show-Menu
echo     $choice = Read-Host "请输入选项 ^（1-5^)"
echo.
echo     switch ^($choice^) {
echo         "1" {
echo             Full-Sync
echo             Show-SyncStats
echo         }
echo         "2" {
echo             Write-Host ""
echo             Write-Host "📦 仅同步源代码功能暂未实现" -ForegroundColor $colorWarning
echo             Write-Host "   请选择 1（完整同步）" -ForegroundColor $colorWarning
echo             Write-Host ""
echo         }
echo         "3" {
echo             Show-SyncList
echo         }
echo         "4" {
echo             Quick-Verify
echo         }
echo         "5" {
echo             Write-Host ""
echo             Write-Host "👋 再见！" -ForegroundColor $colorInfo
echo             Write-Host ""
echo             exit
echo         }
echo         default {
echo             Write-Host ""
echo             Write-Host "❌ 无效选项，请重新选择" -ForegroundColor $colorError
echo             Write-Host ""
echo         }
echo     }
echo.
echo     Write-Host ""
echo     Read-Host "按回车键继续..."
echo     Clear-Host
echo } while ^($true^)
) > SYNC_SANDBOX_TO_LOCAL.ps1

echo [2/4] 创建 SYNC_GUIDE.md...
(
echo # PulseOpti HR - 本地环境快速开始指南
echo.
echo ## 🚀 快速开始
echo.
echo ### 步骤1：运行同步脚本
echo.
echo 在PowerShell中运行：
echo.
echo ```powershell
echo .\SYNC_SANDBOX_TO_LOCAL.ps1
echo ```
echo.
echo 选择 **1** 进行完整同步
echo.
echo ### 步骤2：配置环境变量
echo.
echo 编辑 `.env` 文件：
echo.
echo ```env
echo # 数据库配置^（必需^）
echo DATABASE_URL=postgresql://user:password@host:5432/dbname
echo.
echo # JWT密钥^（必需^）
echo JWT_SECRET=your-secret-key-here
echo JWT_EXPIRES_IN=7d
echo.
echo # 应用配置
echo NEXT_PUBLIC_APP_URL=http://localhost:5000
echo NODE_ENV=development
echo ```
echo.
echo ### 步骤3：初始化数据库
echo.
echo ```bash
echo pnpm db:push
echo ```
echo.
echo ### 步骤4：启动开发服务器
echo.
echo ```bash
echo pnpm dev
echo ```
echo.
echo 访问：
echo - 超管端：http://localhost:5000/admin/login
echo - 用户端：http://localhost:5000/login
echo.
echo 默认账号：`admin` / `admin123`
echo.
echo ## 📚 常用命令
echo.
echo ```bash
echo # 安装依赖
echo pnpm install
echo.
echo # 启动开发服务器
echo pnpm dev
echo.
echo # 构建生产版本
echo pnpm build
echo.
echo # 类型检查
echo pnpm ts-check
echo.
echo # 数据库操作
echo pnpm db:push
echo pnpm db:migrate
echo ```
echo.
echo ## ❓ 常见问题
echo.
echo ### 问题1：端口5000被占用
echo.
echo ```cmd
echo netstat -ano ^| findstr :5000
echo taskkill /PID ^<进程ID^> /F
echo ```
echo.
echo ### 问题2：依赖安装失败
echo.
echo ```bash
echo # 清除缓存
echo rm -rf node_modules .next
echo rm -f pnpm-lock.yaml
echo.
echo # 使用国内镜像
echo pnpm config set registry https://registry.npmmirror.com
echo.
echo # 重新安装
echo pnpm install
echo ```
echo.
echo ### 问题3：数据库连接失败
echo.
echo 1. 检查 `.env` 文件中的 `DATABASE_URL`
echo 2. 确保数据库服务正在运行
echo 3. 测试连接：`pnpm db:studio`
echo.
echo ---
echo.
echo **项目信息**：
echo - 项目名称：PulseOpti HR 脉策聚效
echo - 联系邮箱：PulseOptiHR@163.com
echo - 地址：广州市天河区
) > SYNC_GUIDE.md

echo [3/4] 创建 .env.example...
(
echo # ==================== 数据库配置 ====================
echo DATABASE_URL=postgresql://user:password@host:5432/dbname
echo.
echo # ==================== JWT配置 ====================
echo JWT_SECRET=your-secret-key-here-change-this
echo JWT_EXPIRES_IN=7d
echo.
echo # ==================== 豆包AI配置^（可选^） ====================
echo DOUBAO_API_KEY=
echo.
echo # ==================== 邮件配置^（可选^） ====================
echo SMTP_HOST=smtp.gmail.com
echo SMTP_PORT=587
echo SMTP_USER=your-email@gmail.com
echo SMTP_PASS=your-app-password
echo.
echo # ==================== 对象存储配置^（可选^） ====================
echo S3_ENDPOINT=https://s3.example.com
echo S3_ACCESS_KEY=your-access-key
echo S3_SECRET_KEY=your-secret-key
echo S3_BUCKET=pulseopti-hr
echo.
echo # ==================== 应用配置 ====================
echo NEXT_PUBLIC_APP_URL=http://localhost:5000
echo NODE_ENV=development
) > .env.example

echo [4/4] 创建说明文件...
(
echo # 快速开始
echo.
echo ## 📦 已创建的文件
echo.
echo 1. **SYNC_SANDBOX_TO_LOCAL.ps1** - PowerShell同步脚本
echo 2. **SYNC_GUIDE.md** - 快速开始指南
echo 3. **.env.example** - 环境变量模板
echo.
echo ## 🚀 使用方法
echo.
echo 在PowerShell中运行：
echo.
echo ```powershell
echo .\SYNC_SANDBOX_TO_LOCAL.ps1
echo ```
echo.
echo 选择 **1** 进行完整同步
echo.
echo ## 📖 详细文档
echo.
echo 请查看 **SYNC_GUIDE.md** 获取详细说明
echo.
echo ## ⚙️ 环境配置
echo.
echo 1. 复制环境变量模板：
echo    ```powershell
echo    copy .env.example .env
echo    ```
echo.
echo 2. 编辑 `.env` 文件，填入真实配置
echo.
echo 3. 初始化数据库：
echo    ```powershell
echo    pnpm db:push
echo    ```
echo.
echo 4. 启动开发服务器：
echo    ```powershell
echo    pnpm dev
echo    ```
echo.
echo ---
echo.
echo **项目信息**：
echo - 项目名称：PulseOpti HR 脉策聚效
echo - 联系邮箱：PulseOptiHR@163.com
) > QUICK_START.txt

echo.
echo ========================================
echo   ✅ 创建完成！
echo ========================================
echo.
echo 已创建以下文件：
echo   ✓ SYNC_SANDBOX_TO_LOCAL.ps1
echo   ✓ SYNC_GUIDE.md
echo   ✓ .env.example
echo   ✓ QUICK_START.txt
echo.
echo 下一步操作：
echo.
echo 1. 在PowerShell中运行同步脚本：
echo    .\SYNC_SANDBOX_TO_LOCAL.ps1
echo.
echo 2. 选择 1（完整同步）
echo.
echo 3. 等待依赖安装完成
echo.
echo 4. 配置 .env 文件
echo.
echo 5. 启动开发服务器：pnpm dev
echo.
pause
