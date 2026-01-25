# PowerShell 优化配置应用脚本
# 解决 Windows 文件名大小写敏感问题

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PulseOpti HR 性能优化配置应用工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查当前目录
$currentDir = Get-Location
Write-Host "当前目录: $currentDir" -ForegroundColor Yellow
Write-Host ""

# 步骤1：备份当前配置
Write-Host "[步骤 1/5] 备份当前配置..." -ForegroundColor Green
if (Test-Path "vercel.json") {
    Copy-Item "vercel.json" "vercel.json.backup" -Force
    Write-Host "✓ 已备份 vercel.json" -ForegroundColor Gray
}
if (Test-Path "next.config.ts") {
    Copy-Item "next.config.ts" "next.config.ts.backup" -Force
    Write-Host "✓ 已备份 next.config.ts" -ForegroundColor Gray
}
Write-Host ""

# 步骤2：应用优化配置
Write-Host "[步骤 2/5] 应用优化配置..." -ForegroundColor Green
if (Test-Path "vercel.optimized.json") {
    Copy-Item "vercel.optimized.json" "vercel.json" -Force
    Write-Host "✓ 已应用 vercel.optimized.json" -ForegroundColor Gray
} else {
    Write-Host "✗ 找不到 vercel.optimized.json" -ForegroundColor Red
    exit 1
}

if (Test-Path "next.config.optimized.ts") {
    Copy-Item "next.config.optimized.ts" "next.config.ts" -Force
    Write-Host "✓ 已应用 next.config.optimized.ts" -ForegroundColor Gray
} else {
    Write-Host "✗ 找不到 next.config.optimized.ts" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 步骤3：清理构建缓存
Write-Host "[步骤 3/5] 清理构建缓存..." -ForegroundColor Green
if (Test-Path ".next") {
    Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✓ 已清理 .next 目录" -ForegroundColor Gray
}
if (Test-Path "node_modules\.cache") {
    Remove-Item "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✓ 已清理 node_modules\.cache" -ForegroundColor Gray
}
Write-Host ""

# 步骤4：重新构建
Write-Host "[步骤 4/5] 重新构建项目..." -ForegroundColor Green
$buildResult = pnpm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 构建成功！" -ForegroundColor Green
} else {
    Write-Host "✗ 构建失败！" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 步骤5：显示优化摘要
Write-Host "[步骤 5/5] 优化配置摘要..." -ForegroundColor Green
Write-Host ""
Write-Host "已应用的优化配置:" -ForegroundColor Cyan
Write-Host "  • Vercel 超时时间: 30s → 60s" -ForegroundColor Gray
Write-Host "  • Vercel 内存: 1024MB → 2048MB" -ForegroundColor Gray
Write-Host "  • 部署区域: 默认 → 香港/新加坡" -ForegroundColor Gray
Write-Host "  • 运行时: nodejs20.x" -ForegroundColor Gray
Write-Host "  • 图片优化: 启用" -ForegroundColor Gray
Write-Host "  • CSS 优化: 启用" -ForegroundColor Gray
Write-Host "  • ISR 缓存: 50MB" -ForegroundColor Gray
Write-Host "  • SWC 压缩: 启用" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "优化配置应用完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步操作:" -ForegroundColor Yellow
Write-Host "  1. 提交代码: git add . && git commit -m 'feat: 应用Vercel+Neon性能优化配置'" -ForegroundColor Gray
Write-Host "  2. 推送到远程: git push" -ForegroundColor Gray
Write-Host "  3. Vercel自动部署: 无需手动操作" -ForegroundColor Gray
Write-Host "  4. 验证部署: 访问 https://pulseopti-hr.vercel.app" -ForegroundColor Gray
Write-Host ""
Write-Host "或者使用快速部署脚本:" -ForegroundColor Yellow
Write-Host "  .\DEPLOY_VERCEL.ps1" -ForegroundColor Gray
Write-Host ""
