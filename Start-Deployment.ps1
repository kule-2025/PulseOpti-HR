# PulseOpti HR - 部署启动脚本
# 在 PowerShell 中运行: Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; .\Start-Deployment.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PulseOpti HR 生产环境部署准备" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查当前目录
$currentDir = Get-Location
Write-Host "当前目录: $currentDir" -ForegroundColor Gray
Write-Host ""

# 检查 .env 文件
if (Test-Path ".env") {
    Write-Host "✅ .env 文件已存在" -ForegroundColor Green
    Write-Host "内容预览:" -ForegroundColor Gray
    Get-Content ".env" | Select-Object -First 3 | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
    Write-Host "  ..." -ForegroundColor DarkGray
} else {
    Write-Host "❌ .env 文件不存在" -ForegroundColor Red
    Write-Host "正在创建 .env 文件..." -ForegroundColor Yellow

    $envContent = @"
DATABASE_URL=postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=PulseOptiHR_SuperSecretKey_2024_Production_Secure_Random_String_DoNotChangeInProduction
JWT_EXPIRES_IN=7d
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://pulseopti-hr.vercel.app
"@

    Set-Content -Path ".env" -Value $envContent -Encoding UTF8
    Write-Host "✅ .env 文件创建成功" -ForegroundColor Green
}
Write-Host ""

# 检查依赖
Write-Host "检查依赖..." -ForegroundColor Yellow

try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js 版本: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Node.js 未安装" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Node.js 未安装" -ForegroundColor Red
}

try {
    $pnpmVersion = pnpm --version 2>$null
    if ($pnpmVersion) {
        Write-Host "✅ pnpm 版本: $pnpmVersion" -ForegroundColor Green
    } else {
        Write-Host "⚠️  pnpm 未安装" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  pnpm 未安装" -ForegroundColor Yellow
}

try {
    $vercelVersion = vercel --version 2>$null
    if ($vercelVersion) {
        Write-Host "✅ Vercel CLI 版本: $vercelVersion" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Vercel CLI 未安装" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Vercel CLI 未安装" -ForegroundColor Yellow
}
Write-Host ""

# 安装依赖
Write-Host "是否安装项目依赖? (Y/N)" -ForegroundColor Yellow
$installDeps = Read-Host
if ($installDeps -eq 'Y' -or $installDeps -eq 'y') {
    Write-Host "正在安装依赖..." -ForegroundColor Yellow
    pnpm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 依赖安装成功" -ForegroundColor Green
    } else {
        Write-Host "❌ 依赖安装失败" -ForegroundColor Red
    }
}
Write-Host ""

# 显示下一步操作
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ 准备工作完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 下一步操作（在新窗口中执行）：" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 安装 Vercel CLI（如果尚未安装）：" -ForegroundColor White
Write-Host "   npm install -g vercel" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 登录 Vercel：" -ForegroundColor White
Write-Host "   vercel login" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 链接到项目（首次部署）：" -ForegroundColor White
Write-Host "   vercel link" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 设置生产环境变量（逐个执行）：" -ForegroundColor White
Write-Host "   vercel env add DATABASE_URL production" -ForegroundColor Gray
Write-Host "   粘贴: postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require" -ForegroundColor DarkGray
Write-Host ""
Write-Host "   vercel env add JWT_SECRET production" -ForegroundColor Gray
Write-Host "   粘贴: PulseOptiHR_SuperSecretKey_2024_Production_Secure_Random_String_DoNotChangeInProduction" -ForegroundColor DarkGray
Write-Host ""
Write-Host "   vercel env add JWT_EXPIRES_IN production" -ForegroundColor Gray
Write-Host "   粘贴: 7d" -ForegroundColor DarkGray
Write-Host ""
Write-Host "   vercel env add NODE_ENV production" -ForegroundColor Gray
Write-Host "   粘贴: production" -ForegroundColor DarkGray
Write-Host ""
Write-Host "   vercel env add NEXT_PUBLIC_APP_URL production" -ForegroundColor Gray
Write-Host "   粘贴: https://pulseopti-hr.vercel.app" -ForegroundColor DarkGray
Write-Host ""
Write-Host "5. 运行数据库迁移：" -ForegroundColor White
Write-Host "   pnpm drizzle-kit push" -ForegroundColor Gray
Write-Host ""
Write-Host "6. 部署到生产环境：" -ForegroundColor White
Write-Host "   vercel --prod" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔗 生产环境访问地址：" -ForegroundColor Yellow
Write-Host "   https://pulseopti-hr.vercel.app" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "按任意键退出..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
