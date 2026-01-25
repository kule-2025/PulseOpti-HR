# ========================================
# HR Navigator - PowerShell 部署脚本
# ========================================

param(
    [switch]$SkipInstall = $false,
    [switch]$SkipBuild = $false
)

function Write-Header {
    param([string]$Message)
    Write-Host "`n==========================================" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Yellow
    Write-Host "==========================================" -ForegroundColor Cyan
}

function Write-Step {
    param([string]$Step, [string]$Message)
    Write-Host "`n[$Step] $Message" -ForegroundColor Green
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

# 开始部署
Write-Header "HR Navigator - Vercel & Neon 部署工具"

# 检查必需工具
Write-Step "1/8" "检查必需工具..."

$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Error "Node.js 未安装，请先安装: https://nodejs.org"
    exit 1
}
Write-Success "Node.js 已安装: $nodeVersion"

$pnpmVersion = pnpm --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "pnpm 未安装，正在安装..." -ForegroundColor Yellow
    npm install -g pnpm
    if ($LASTEXITCODE -ne 0) {
        Write-Error "pnpm 安装失败"
        exit 1
    }
}
Write-Success "pnpm 已安装: $(pnpm --version)"

$vercelVersion = vercel --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Vercel CLI 未安装，正在安装..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Vercel CLI 安装失败"
        exit 1
    }
}
Write-Success "Vercel CLI 已安装: $(vercel --version)"

# 安装依赖
if (-not $SkipInstall) {
    Write-Step "2/8" "安装项目依赖..."
    pnpm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "依赖安装失败"
        exit 1
    }
    Write-Success "依赖安装成功"
} else {
    Write-Warning "跳过依赖安装（使用了 -SkipInstall 参数）"
}

# 本地构建测试
if (-not $SkipBuild) {
    Write-Step "3/8" "本地构建测试..."
    pnpm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "构建失败，请检查错误信息"
        exit 1
    }
    Write-Success "构建成功"
} else {
    Write-Warning "跳过构建测试（使用了 -SkipBuild 参数）"
}

# 登录Vercel
Write-Step "4/8" "登录Vercel..."
vercel login
if ($LASTEXITCODE -ne 0) {
    Write-Error "Vercel 登录失败"
    exit 1
}
Write-Success "Vercel 登录成功"

# 初始化Vercel项目
Write-Step "5/8" "初始化Vercel项目..."
vercel
if ($LASTEXITCODE -ne 0) {
    Write-Error "Vercel 项目初始化失败"
    exit 1
}
Write-Success "Vercel 项目初始化成功"

# 配置环境变量
Write-Step "6/8" "配置环境变量..."
Write-Host "`n请按照提示输入以下环境变量：" -ForegroundColor Cyan
Write-Host "1. DATABASE_URL (Neon数据库连接字符串)"
Write-Host "2. JWT_SECRET (至少32字符的密钥)"
Write-Host "3. NEXT_PUBLIC_APP_URL (Vercel应用URL)"
Write-Host "4. NODE_ENV (production)"
Write-Host ""

# 检查环境变量是否已配置
$envVars = vercel env ls
if ($envVars -match "DATABASE_URL") {
    Write-Success "DATABASE_URL 已配置"
} else {
    Write-Warning "DATABASE_URL 未配置，请手动添加:"
    Write-Host "  vercel env add DATABASE_URL production" -ForegroundColor Yellow
}

if ($envVars -match "JWT_SECRET") {
    Write-Success "JWT_SECRET 已配置"
} else {
    Write-Warning "JWT_SECRET 未配置，请手动添加:"
    Write-Host "  vercel env add JWT_SECRET production" -ForegroundColor Yellow
}

if ($envVars -match "NEXT_PUBLIC_APP_URL") {
    Write-Success "NEXT_PUBLIC_APP_URL 已配置"
} else {
    Write-Warning "NEXT_PUBLIC_APP_URL 未配置，请手动添加:"
    Write-Host "  vercel env add NEXT_PUBLIC_APP_URL production" -ForegroundColor Yellow
}

if ($envVars -match "NODE_ENV") {
    Write-Success "NODE_ENV 已配置"
} else {
    Write-Warning "NODE_ENV 未配置，请手动添加:"
    Write-Host "  vercel env add NODE_ENV production" -ForegroundColor Yellow
}

$continue = Read-Host "`n环境变量配置完成后，按回车继续"

# 生产环境部署
Write-Step "7/8" "生产环境部署..."
vercel --prod
if ($LASTEXITCODE -ne 0) {
    Write-Error "部署失败"
    exit 1
}
Write-Success "部署成功"

# 数据库迁移
Write-Step "8/8" "数据库迁移..."
Write-Host "拉取生产环境变量..." -ForegroundColor Yellow
vercel env pull .env.local

Write-Host "推送数据库Schema..." -ForegroundColor Yellow
npx drizzle-kit push:pg
if ($LASTEXITCODE -ne 0) {
    Write-Warning "数据库迁移失败，请手动检查"
    Write-Host "运行命令: npx drizzle-kit push:pg" -ForegroundColor Yellow
} else {
    Write-Success "数据库迁移成功"
}

# 完成
Write-Header "🎉 部署完成！"
Write-Host "`n请访问你的Vercel Dashboard获取应用URL:" -ForegroundColor Cyan
Write-Host "https://vercel.com/dashboard`n" -ForegroundColor White

Write-Host "查看详细部署指南:" -ForegroundColor Cyan
Write-Host "DEPLOYMENT_GUIDE_CMD.md`n" -ForegroundColor White

Write-Host "常用命令:" -ForegroundColor Cyan
Write-Host "  查看部署历史: vercel list" -ForegroundColor White
Write-Host "  查看环境变量: vercel env ls" -ForegroundColor White
Write-Host "  查看日志: vercel logs`n" -ForegroundColor White

Write-Host "祝使用愉快！`n" -ForegroundColor Green
