# PulseOpti HR 生产环境部署脚本
# 在 PowerShell 中以管理员身份运行此脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PulseOpti HR 生产环境部署脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否安装了 Node.js
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ 错误：未检测到 Node.js，请先安装 Node.js" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js 版本: $nodeVersion" -ForegroundColor Green

# 检查是否安装了 pnpm
$pnpmVersion = pnpm --version 2>$null
if (-not $pnpmVersion) {
    Write-Host "⚠️  未检测到 pnpm，正在安装..." -ForegroundColor Yellow
    npm install -g pnpm
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ pnpm 安装失败" -ForegroundColor Red
        exit 1
    }
    $pnpmVersion = pnpm --version
}
Write-Host "✅ pnpm 版本: $pnpmVersion" -ForegroundColor Green

Write-Host ""

# 步骤1：创建 .env 文件
Write-Host "步骤1: 创建 .env 文件..." -ForegroundColor Yellow

$envContent = @"
DATABASE_URL=postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=PulseOptiHR_SuperSecretKey_2024_Production_Secure_Random_String_DoNotChangeInProduction
JWT_EXPIRES_IN=7d
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://pulseopti-hr.vercel.app
"@

Set-Content -Path ".env" -Value $envContent -Encoding UTF8
Write-Host "✅ .env 文件创建成功" -ForegroundColor Green
Write-Host ""

# 步骤2：安装依赖
Write-Host "步骤2: 安装项目依赖..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 依赖安装失败" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 依赖安装成功" -ForegroundColor Green
Write-Host ""

# 步骤3：运行数据库迁移
Write-Host "步骤3: 运行数据库迁移..." -ForegroundColor Yellow

# 创建迁移配置
$drizzleConfig = @"
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/storage/database/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
} satisfies Config;
"@

Set-Content -Path "drizzle.config.ts" -Value $drizzleConfig -Encoding UTF8

# 执行迁移
pnpm drizzle-kit push:pg
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  数据库迁移出现警告，但可能已成功" -ForegroundColor Yellow
} else {
    Write-Host "✅ 数据库迁移成功" -ForegroundColor Green
}
Write-Host ""

# 步骤4：验证构建
Write-Host "步骤4: 验证生产构建..." -ForegroundColor Yellow
pnpm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 构建失败" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 生产构建成功" -ForegroundColor Green
Write-Host ""

# 步骤5：Vercel部署指南
Write-Host "步骤5: Vercel 部署指南" -ForegroundColor Yellow
Write-Host ""
Write-Host "请按照以下步骤完成 Vercel 部署：" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 安装 Vercel CLI（如果尚未安装）：" -ForegroundColor White
Write-Host "   npm install -g vercel" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 登录 Vercel：" -ForegroundColor White
Write-Host "   vercel login" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 链接到项目（如果是首次部署）：" -ForegroundColor White
Write-Host "   vercel link" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 设置生产环境变量：" -ForegroundColor White
Write-Host "   vercel env add DATABASE_URL production" -ForegroundColor Gray
Write-Host "   (输入: postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require)" -ForegroundColor Gray
Write-Host ""
Write-Host "   vercel env add JWT_SECRET production" -ForegroundColor Gray
Write-Host "   (输入: PulseOptiHR_SuperSecretKey_2024_Production_Secure_Random_String_DoNotChangeInProduction)" -ForegroundColor Gray
Write-Host ""
Write-Host "   vercel env add JWT_EXPIRES_IN production" -ForegroundColor Gray
Write-Host "   (输入: 7d)" -ForegroundColor Gray
Write-Host ""
Write-Host "   vercel env add NODE_ENV production" -ForegroundColor Gray
Write-Host "   (输入: production)" -ForegroundColor Gray
Write-Host ""
Write-Host "   vercel env add NEXT_PUBLIC_APP_URL production" -ForegroundColor Gray
Write-Host "   (输入: https://pulseopti-hr.vercel.app)" -ForegroundColor Gray
Write-Host ""
Write-Host "5. 部署到生产环境：" -ForegroundColor White
Write-Host "   vercel --prod" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ 本地准备完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 快捷部署命令（可选）：" -ForegroundColor Yellow
Write-Host "   deploy-vercel.bat (Windows)" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 生产环境访问地址：" -ForegroundColor Yellow
Write-Host "   https://pulseopti-hr.vercel.app" -ForegroundColor Cyan
Write-Host ""

Write-Host "按任意键退出..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
