# PowerShell 快速部署脚本
# 自动部署优化后的应用到 Vercel

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PulseOpti HR 快速部署工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Git 状态
Write-Host "[检查] Git 状态..." -ForegroundColor Green
$gitStatus = git status --porcelain 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Git 不可用或不是 Git 仓库" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Git 仓库正常" -ForegroundColor Gray
Write-Host ""

# 显示待提交的更改
if ($gitStatus) {
    Write-Host "待提交的更改:" -ForegroundColor Yellow
    Write-Host $gitStatus -ForegroundColor Gray
    Write-Host ""
}

# 提交更改
Write-Host "[步骤 1/4] 提交代码..." -ForegroundColor Green
git add .
$commitMsg = "feat: 应用Vercel+Neon性能优化配置

优化内容:
- Vercel 超时时间: 30s → 60s
- Vercel 内存: 1024MB → 2048MB
- 部署区域: 香港/新加坡
- 图片优化、CSS优化、ISR缓存
- SWC 压缩和 Webpack 优化
- API 超时和重试机制
- 查询缓存系统
- 性能监控中间件"

git commit -m $commitMsg
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 代码提交成功" -ForegroundColor Green
} else {
    Write-Host "! 没有新的更改需要提交" -ForegroundColor Yellow
}
Write-Host ""

# 推送到远程
Write-Host "[步骤 2/4] 推送到远程仓库..." -ForegroundColor Green
git push
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 推送成功" -ForegroundColor Green
} else {
    Write-Host "✗ 推送失败" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 检查 Vercel CLI
Write-Host "[步骤 3/4] 检查 Vercel CLI..." -ForegroundColor Green
$vercelVersion = vercel --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Vercel CLI 已安装 ($vercelVersion)" -ForegroundColor Gray
} else {
    Write-Host "! Vercel CLI 未安装，正在安装..." -ForegroundColor Yellow
    pnpm add -D vercel
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Vercel CLI 安装成功" -ForegroundColor Green
    } else {
        Write-Host "✗ Vercel CLI 安装失败" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

# 部署到 Vercel
Write-Host "[步骤 4/4] 部署到 Vercel 生产环境..." -ForegroundColor Green
Write-Host "这可能需要 3-5 分钟，请耐心等待..." -ForegroundColor Yellow
Write-Host ""

vercel --prod
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "部署成功！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "生产环境地址:" -ForegroundColor Yellow
    Write-Host "  https://pulseopti-hr.vercel.app" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "下一步操作:" -ForegroundColor Yellow
    Write-Host "  1. 访问网站验证功能正常" -ForegroundColor Gray
    Write-Host "  2. 在 Vercel 控制台配置环境变量" -ForegroundColor Gray
    Write-Host "  3. 运行数据库迁移: vercel env pull .env.local && pnpm run db:push" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "✗ 部署失败，请检查错误信息" -ForegroundColor Red
    exit 1
}
