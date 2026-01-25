# PulseOpti HR - 系统一键修复脚本
# 使用方法：在 PowerShell 中执行 .\fix-system.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PulseOpti HR - 系统一键修复工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否在正确的目录
$currentDir = Get-Location
if ($currentDir.Path -notmatch "PulseOpti-HR") {
    Write-Host "❌ 错误：请在项目根目录下运行此脚本" -ForegroundColor Red
    Write-Host "   当前目录: $currentDir" -ForegroundColor Yellow
    exit 1
}

# 步骤 1：检查环境变量
Write-Host "`n[步骤 1/5] 检查环境变量..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env 文件存在" -ForegroundColor Green
    $envContent = Get-Content ".env" | Select-String "DATABASE_URL|JWT_SECRET"
    if ($envContent) {
        Write-Host "✅ 关键配置项已设置" -ForegroundColor Green
    } else {
        Write-Host "⚠️  关键配置项缺失" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ .env 文件不存在，需要手动创建" -ForegroundColor Red
}

# 步骤 2：创建超管端主页
Write-Host "`n[步骤 2/5] 创建超管端主页..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "src\app\admin" | Out-Null

$adminPageCode = @'
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    const isSuperAdmin = localStorage.getItem('isSuperAdmin');

    if (user && isSuperAdmin === 'true') {
      router.push('/admin/dashboard');
    } else {
      router.push('/admin/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-r-transparent" />
        <p className="mt-4 text-white">加载中...</p>
      </div>
    </div>
  );
}
'@

Set-Content -Path "src\app\admin\page.tsx" -Value $adminPageCode -Encoding UTF8
Write-Host "✅ 超管端主页已创建" -ForegroundColor Green

# 步骤 3：检查数据库配置
Write-Host "`n[步骤 3/5] 检查数据库配置..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" | ConvertFrom-Json
if ($packageJson.scripts -contains "db:push") {
    Write-Host "✅ 数据库脚本已配置" -ForegroundColor Green
} else {
    Write-Host "⚠️  数据库脚本未配置" -ForegroundColor Yellow
}

# 步骤 4：删除缓存
Write-Host "`n[步骤 4/5] 删除 Next.js 缓存..." -ForegroundColor Yellow
if (Test-Path ".next") {
    try {
        Remove-Item -Recurse -Force ".next" -ErrorAction Stop
        Write-Host "✅ 缓存已删除" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  删除缓存失败（可能正在运行）" -ForegroundColor Yellow
    }
} else {
    Write-Host "ℹ️  缓存目录不存在" -ForegroundColor Blue
}

# 步骤 5：完成
Write-Host "`n[步骤 5/5] 修复完成！" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  下一步操作指南" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  创建超级管理员账号" -ForegroundColor White
Write-Host "   命令: npx tsx init-admin.ts" -ForegroundColor Cyan
Write-Host ""
Write-Host "2️⃣  推送数据库结构（如需要）" -ForegroundColor White
Write-Host "   命令: pnpm run db:push" -ForegroundColor Cyan
Write-Host ""
Write-Host "3️⃣  启动开发服务器" -ForegroundColor White
Write-Host "   命令: pnpm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "4️⃣  访问系统" -ForegroundColor White
Write-Host "   用户端: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   超管端: http://localhost:3000/admin/login" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  登录信息" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📧 账号: admin@aizhixuan.com.cn" -ForegroundColor Yellow
Write-Host "🔐 密码: Admin@123" -ForegroundColor Yellow
Write-Host "👑 权限: 超级管理员" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "如遇问题，请查看 SYSTEM_DIAGNOSIS.md 文档" -ForegroundColor Yellow
