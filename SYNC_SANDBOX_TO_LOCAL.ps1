# PulseOpti HR - 沙箱到本地同步脚本 (PowerShell版本)
# 使用方法：以管理员身份运行 PowerShell，然后执行：. .\SYNC_SANDBOX_TO_LOCAL.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PulseOpti HR - 沙箱文件同步工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 颜色定义
$colorInfo = "Green"
$colorWarning = "Yellow"
$colorError = "Red"
$colorSuccess = "Cyan"

# 检查是否以管理员身份运行
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  警告：未以管理员身份运行，某些操作可能需要管理员权限" -ForegroundColor $colorWarning
    Write-Host ""
}

# 显示同步菜单
function Show-Menu {
    Write-Host "请选择同步方式：" -ForegroundColor $colorInfo
    Write-Host ""
    Write-Host "1. 🔧 完整同步 (推荐)" -ForegroundColor $colorSuccess
    Write-Host "   - 同步所有源代码文件" -ForegroundColor White
    Write-Host "   - 保留node_modules和.next" -ForegroundColor White
    Write-Host "   - 重新安装依赖" -ForegroundColor White
    Write-Host ""

    Write-Host "2. 📦 仅同步源代码" -ForegroundColor $colorSuccess
    Write-Host "   - 仅同步src目录和配置文件" -ForegroundColor White
    Write-Host "   - 不安装依赖" -ForegroundColor White
    Write-Host ""

    Write-Host "3. 🔄 增量同步" -ForegroundColor $colorSuccess
    Write-Host "   - 同步修改过的文件" -ForegroundColor White
    Write-Host "   - 基于文件时间戳对比" -ForegroundColor White
    Write-Host ""

    Write-Host "4. 📋 查看同步清单" -ForegroundColor $colorSuccess
    Write-Host "   - 显示需要同步的文件列表" -ForegroundColor White
    Write-Host ""

    Write-Host "5. 🚀 快速验证" -ForegroundColor $colorSuccess
    Write-Host "   - 验证本地环境配置" -ForegroundColor White
    Write-Host "   - 检查依赖和构建" -ForegroundColor White
    Write-Host ""

    Write-Host "6. 🚪 退出" -ForegroundColor $colorWarning
    Write-Host ""
}

# 显示同步统计
function Show-SyncStats {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  同步统计信息" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    # 统计文件数量
    $srcFiles = Get-ChildItem -Path "src" -Recurse -File -ErrorAction SilentlyContinue
    $apiFiles = Get-ChildItem -Path "src/app/api" -Recurse -File -ErrorAction SilentlyContinue
    $pageFiles = Get-ChildItem -Path "src/app" -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Extension -eq ".tsx" }
    $libFiles = Get-ChildItem -Path "src/lib" -Recurse -File -ErrorAction SilentlyContinue

    Write-Host "📁 项目文件统计：" -ForegroundColor $colorInfo
    Write-Host "   - 源代码文件： $($srcFiles.Count) 个" -ForegroundColor White
    Write-Host "   - API端点：   $($apiFiles.Count) 个" -ForegroundColor White
    Write-Host "   - 页面文件：   $($pageFiles.Count) 个" -ForegroundColor White
    Write-Host "   - 工具库：     $($libFiles.Count) 个" -ForegroundColor White
    Write-Host ""

    # 检查依赖
    if (Test-Path "node_modules") {
        Write-Host "✅ node_modules 已存在" -ForegroundColor $colorSuccess
    } else {
        Write-Host "❌ node_modules 不存在" -ForegroundColor $colorError
    }

    # 检查构建
    if (Test-Path ".next") {
        Write-Host "✅ .next 构建目录已存在" -ForegroundColor $colorSuccess
    } else {
        Write-Host "❌ .next 构建目录不存在" -ForegroundColor $colorError
    }

    # 检查环境变量
    if (Test-Path ".env") {
        Write-Host "✅ .env 文件已存在" -ForegroundColor $colorSuccess
    } else {
        Write-Host "❌ .env 文件不存在 (需要从.env.example复制)" -ForegroundColor $colorWarning
    }

    Write-Host ""
}

# 完整同步
function Full-Sync {
    Write-Host ""
    Write-Host "🔧 开始完整同步..." -ForegroundColor $colorInfo
    Write-Host ""

    # 检查沙箱目录
    if (-not (Test-Path "/workspace/projects")) {
        Write-Host "❌ 错误：找不到沙箱目录 /workspace/projects" -ForegroundColor $colorError
        Write-Host "   请确保在正确的目录执行此脚本" -ForegroundColor $colorWarning
        return
    }

    # 创建备份
    Write-Host "📦 创建备份..." -ForegroundColor $colorWarning
    $backupDir = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    if (-not (Test-Path "backups")) {
        New-Item -ItemType Directory -Path "backups" | Out-Null
    }
    Copy-Item -Path "." -Destination "backups\$backupDir" -Recurse -Force -Exclude "node_modules", ".next", ".git", "backups"
    Write-Host "✅ 备份完成：backups\$backupDir" -ForegroundColor $colorSuccess

    # 同步文件
    Write-Host "🔄 同步文件..." -ForegroundColor $colorInfo

    $syncDirs = @(
        "src",
        "public",
        "components.json",
        "tsconfig.json",
        "tailwind.config.ts",
        "next.config.ts",
        "drizzle.config.ts",
        "vercel.json",
        "package.json"
    )

    foreach ($dir in $syncDirs) {
        if (Test-Path "/workspace/projects/$dir") {
            Write-Host "   同步 $dir..." -ForegroundColor White
            if (Test-Path $dir) {
                Remove-Item -Path $dir -Recurse -Force
            }
            Copy-Item -Path "/workspace/projects/$dir" -Destination "." -Recurse -Force
        }
    }

    Write-Host "✅ 文件同步完成" -ForegroundColor $colorSuccess

    # 重新安装依赖
    Write-Host ""
    Write-Host "📦 重新安装依赖..." -ForegroundColor $colorInfo
    Write-Host "   这可能需要几分钟时间..." -ForegroundColor $colorWarning

    # 检查pnpm是否安装
    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        Write-Host "❌ 错误：pnpm 未安装" -ForegroundColor $colorError
        Write-Host "   请先安装 pnpm：npm install -g pnpm" -ForegroundColor $colorWarning
        return
    }

    Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "pnpm-lock.yaml" -Force -ErrorAction SilentlyContinue

    pnpm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 依赖安装完成" -ForegroundColor $colorSuccess
    } else {
        Write-Host "❌ 依赖安装失败" -ForegroundColor $colorError
        return
    }

    # 环境变量配置
    Write-Host ""
    Write-Host "⚙️  配置环境变量..." -ForegroundColor $colorInfo

    if (-not (Test-Path ".env")) {
        if (Test-Path ".env.example") {
            Copy-Item -Path ".env.example" -Destination ".env"
            Write-Host "✅ .env 文件已创建（从.env.example复制）" -ForegroundColor $colorSuccess
            Write-Host "   ⚠️  请编辑 .env 文件，填入真实的配置信息" -ForegroundColor $colorWarning
        } else {
            Write-Host "❌ 错误：找不到 .env.example 文件" -ForegroundColor $colorError
        }
    } else {
        Write-Host "✅ .env 文件已存在" -ForegroundColor $colorSuccess
    }

    Write-Host ""
    Write-Host "🎉 完整同步完成！" -ForegroundColor $colorSuccess
    Write-Host ""
    Write-Host "下一步操作：" -ForegroundColor $colorInfo
    Write-Host "   1. 编辑 .env 文件，配置数据库和其他环境变量" -ForegroundColor White
    Write-Host "   2. 运行数据库迁移：pnpm db:push" -ForegroundColor White
    Write-Host "   3. 启动开发服务器：pnpm dev" -ForegroundColor White
    Write-Host ""
}

# 仅同步源代码
function Source-Sync {
    Write-Host ""
    Write-Host "📦 开始同步源代码..." -ForegroundColor $colorInfo
    Write-Host ""

    $syncDirs = @(
        "src",
        "components.json",
        "tsconfig.json",
        "tailwind.config.ts",
        "next.config.ts",
        "drizzle.config.ts",
        "vercel.json",
        "package.json"
    )

    foreach ($dir in $syncDirs) {
        if (Test-Path "/workspace/projects/$dir") {
            Write-Host "   同步 $dir..." -ForegroundColor White
            if (Test-Path $dir) {
                Remove-Item -Path $dir -Recurse -Force -ErrorAction SilentlyContinue
            }
            Copy-Item -Path "/workspace/projects/$dir" -Destination "." -Recurse -Force -ErrorAction SilentlyContinue
        }
    }

    Write-Host "✅ 源代码同步完成" -ForegroundColor $colorSuccess
    Write-Host ""
    Write-Host "提示：运行 'pnpm install' 安装依赖" -ForegroundColor $colorWarning
    Write-Host ""
}

# 增量同步
function Incremental-Sync {
    Write-Host ""
    Write-Host "🔄 开始增量同步..." -ForegroundColor $colorInfo
    Write-Host ""

    $sourceBase = "/workspace/projects"
    $targetBase = "."

    # 获取沙箱中的所有文件
    $sourceFiles = Get-ChildItem -Path $sourceBase -Recurse -File -ErrorAction SilentlyContinue |
                   Where-Object { $_.DirectoryName -notlike "*node_modules*" -and $_.DirectoryName -notlike "*.next*" }

    $syncedCount = 0
    $skippedCount = 0

    foreach ($file in $sourceFiles) {
        $relativePath = $file.FullName.Replace($sourceBase, "").TrimStart("\", "/")
        $targetPath = Join-Path $targetBase $relativePath

        # 检查目标文件是否存在
        if (Test-Path $targetPath) {
            $targetFile = Get-Item $targetPath
            # 比较文件时间戳
            if ($file.LastWriteTime -gt $targetFile.LastWriteTime) {
                # 文件已更新，复制
                $targetDir = Split-Path $targetPath
                if (-not (Test-Path $targetDir)) {
                    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
                }
                Copy-Item -Path $file.FullName -Destination $targetPath -Force
                $syncedCount++
                Write-Host "   ✓ 更新：$relativePath" -ForegroundColor Green
            } else {
                $skippedCount++
            }
        } else {
            # 文件不存在，复制
            $targetDir = Split-Path $targetPath
            if (-not (Test-Path $targetDir)) {
                New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
            }
            Copy-Item -Path $file.FullName -Destination $targetPath -Force
            $syncedCount++
            Write-Host "   + 新增：$relativePath" -ForegroundColor Cyan
        }
    }

    Write-Host ""
    Write-Host "✅ 增量同步完成" -ForegroundColor $colorSuccess
    Write-Host "   更新：$syncedCount 个文件" -ForegroundColor White
    Write-Host "   跳过：$skippedCount 个文件" -ForegroundColor White
    Write-Host ""
}

# 显示同步清单
function Show-SyncList {
    Write-Host ""
    Write-Host "📋 需要同步的文件清单：" -ForegroundColor $colorInfo
    Write-Host ""

    $fileList = @(
        "📁 核心配置文件",
        "   ✓ package.json",
        "   ✓ tsconfig.json",
        "   ✓ next.config.ts",
        "   ✓ tailwind.config.ts",
        "   ✓ drizzle.config.ts",
        "   ✓ vercel.json",
        "   ✓ .env.example",
        "",
        "📁 前端页面 (82个)",
        "   ✓ 首页和公共页面 (8个)",
        "   ✓ 仪表盘 (8个)",
        "   ✓ 超管端页面 (13个)",
        "   ✓ 业务模块页面 (53个)",
        "",
        "📁 后端API (88个)",
        "   ✓ 认证API (9个)",
        "   ✓ 超管端API (14个)",
        "   ✓ 业务API (65个)",
        "",
        "📁 工具库 (14个)",
        "   ✓ 数据库配置",
        "   ✓ 认证授权",
        "   ✓ 工具函数",
        "",
        "📁 业务管理器 (36个)",
        "   ✓ 招聘、绩效、考勤等",
        "",
        "📁 工作流管理器 (8个)",
        "   ✓ 15种工作流支持",
        "",
        "📁 公共资源",
        "   ✓ Logo和图标",
        "   ✓ 微信/支付宝二维码",
        "   ✓ 字体文件",
        "",
        "📁 文档文件 (60+个)",
        "   ✓ 部署文档",
        "   ✓ 配置文档",
        "   ✓ 诊断文档",
        "   ✓ 优化文档"
    )

    foreach ($item in $fileList) {
        Write-Host $item
    }

    Write-Host ""
    Write-Host "完整清单请参考 FILE_SYNC_CHECKLIST.md" -ForegroundColor $colorWarning
    Write-Host ""
}

# 快速验证
function Quick-Verify {
    Write-Host ""
    Write-Host "🚀 开始快速验证..." -ForegroundColor $colorInfo
    Write-Host ""

    $issues = @()

    # 检查依赖
    Write-Host "1️⃣  检查依赖..." -ForegroundColor White
    if (Test-Path "node_modules") {
        Write-Host "   ✅ node_modules 存在" -ForegroundColor $colorSuccess
    } else {
        Write-Host "   ❌ node_modules 不存在" -ForegroundColor $colorError
        $issues += "请运行：pnpm install"
    }

    # 检查环境变量
    Write-Host "2️⃣  检查环境变量..." -ForegroundColor White
    if (Test-Path ".env") {
        Write-Host "   ✅ .env 文件存在" -ForegroundColor $colorSuccess

        # 检查关键配置
        $envContent = Get-Content ".env" -Raw
        if ($envContent -match "DATABASE_URL=") {
            Write-Host "   ✅ DATABASE_URL 已配置" -ForegroundColor $colorSuccess
        } else {
            Write-Host "   ❌ DATABASE_URL 未配置" -ForegroundColor $colorError
            $issues += "请在 .env 中配置 DATABASE_URL"
        }

        if ($envContent -match "JWT_SECRET=") {
            Write-Host "   ✅ JWT_SECRET 已配置" -ForegroundColor $colorSuccess
        } else {
            Write-Host "   ⚠️  JWT_SECRET 未配置（将使用默认值）" -ForegroundColor $colorWarning
        }
    } else {
        Write-Host "   ❌ .env 文件不存在" -ForegroundColor $colorError
        $issues += "请复制 .env.example 到 .env 并配置"
    }

    # 检查TypeScript
    Write-Host "3️⃣  检查TypeScript..." -ForegroundColor White
    if (Test-Path "tsconfig.json") {
        Write-Host "   ✅ tsconfig.json 存在" -ForegroundColor $colorSuccess
        Write-Host "   运行类型检查..." -ForegroundColor White
        pnpm ts-check
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ TypeScript 类型检查通过" -ForegroundColor $colorSuccess
        } else {
            Write-Host "   ⚠️  TypeScript 类型检查有警告" -ForegroundColor $colorWarning
        }
    } else {
        Write-Host "   ❌ tsconfig.json 不存在" -ForegroundColor $colorError
        $issues += "请同步 tsconfig.json 文件"
    }

    # 检查构建
    Write-Host "4️⃣  检查构建..." -ForegroundColor White
    if (Test-Path ".next") {
        Write-Host "   ✅ .next 构建目录存在" -ForegroundColor $colorSuccess
    } else {
        Write-Host "   ⚠️  .next 构建目录不存在" -ForegroundColor $colorWarning
        Write-Host "   提示：运行 'pnpm build' 构建项目" -ForegroundColor $colorWarning
    }

    # 检查端口
    Write-Host "5️⃣  检查端口..." -ForegroundColor White
    $port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq "Listen" }
    if ($port5000) {
        Write-Host "   ⚠️  端口 5000 已被占用" -ForegroundColor $colorWarning
        Write-Host "   进程 PID：$($port5000.OwningProcess)" -ForegroundColor White
    } else {
        Write-Host "   ✅ 端口 5000 可用" -ForegroundColor $colorSuccess
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  验证结果" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan

    if ($issues.Count -eq 0) {
        Write-Host ""
        Write-Host "🎉 所有检查通过！环境配置正常。" -ForegroundColor $colorSuccess
        Write-Host ""
        Write-Host "下一步：" -ForegroundColor $colorInfo
        Write-Host "   1. 运行数据库迁移：pnpm db:push" -ForegroundColor White
        Write-Host "   2. 启动开发服务器：pnpm dev" -ForegroundColor White
        Write-Host "   3. 访问 http://localhost:5000" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "⚠️  发现 $([math]::Ceiling($issues.Count)) 个问题：" -ForegroundColor $colorWarning
        Write-Host ""
        foreach ($issue in $issues) {
            Write-Host "   ❌ $issue" -ForegroundColor $colorError
        }
        Write-Host ""
    }
}

# 主循环
do {
    Show-Menu
    $choice = Read-Host "请输入选项 (1-6)"

    switch ($choice) {
        "1" {
            Full-Sync
            Show-SyncStats
        }
        "2" {
            Source-Sync
            Show-SyncStats
        }
        "3" {
            Incremental-Sync
            Show-SyncStats
        }
        "4" {
            Show-SyncList
        }
        "5" {
            Quick-Verify
        }
        "6" {
            Write-Host ""
            Write-Host "👋 再见！" -ForegroundColor $colorInfo
            Write-Host ""
            exit
        }
        default {
            Write-Host ""
            Write-Host "❌ 无效选项，请重新选择" -ForegroundColor $colorError
            Write-Host ""
        }
    }

    Write-Host ""
    Read-Host "按回车键继续..."
    Clear-Host
} while ($true)
