# PowerShell 脚本：一键部署到 Vercel + Neon
# 使用方式: .\DEPLOY_TO_VERCEL.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PulseOpti HR - 一键部署工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查当前目录
$currentDir = Get-Location
Write-Host "当前目录: $currentDir" -ForegroundColor Yellow

# 检查是否在项目根目录
if (!(Test-Path "package.json")) {
    Write-Host ""
    Write-Host "[错误] 请在项目根目录运行此脚本" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}

Write-Host ""

# 步骤 1: 提交代码
Write-Host "[步骤 1/4] 提交代码到 Git..." -ForegroundColor Green
git add .
$commitMsg = "feat: 同步沙箱优化配置

优化内容:
- Vercel 超时: 30s → 60s
- Vercel 内存: 1024MB → 2048MB
- 部署区域: 香港/新加坡
- 图片/CSS/ISR 优化
- SWC 压缩和 Webpack 优化
- 添加数据库管理脚本"

git commit -m $commitMsg
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ 代码提交成功" -ForegroundColor Gray
} else {
    Write-Host "  ! 没有新的更改需要提交" -ForegroundColor Yellow
}
Write-Host ""

# 步骤 2: 推送到远程
Write-Host "[步骤 2/4] 推送到 GitHub..." -ForegroundColor Green
Write-Host "  正在推送..." -ForegroundColor Yellow
git push --force
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ 推送成功" -ForegroundColor Green
} else {
    Write-Host "  ✗ 推送失败，请检查网络连接" -ForegroundColor Red
    Write-Host "  提示: 如果网络不稳定，可以稍后手动执行: git push --force" -ForegroundColor Yellow
    Read-Host "按回车键继续部署数据库"
}
Write-Host ""

# 步骤 3: 推送数据库 schema
Write-Host "[步骤 3/4] 推送数据库 schema 到 Neon..." -ForegroundColor Green

# 检查 DATABASE_URL
if ([string]::IsNullOrEmpty($env:DATABASE_URL)) {
    Write-Host "  ! DATABASE_URL 未设置，从 Vercel 拉取环境变量..." -ForegroundColor Yellow
    Write-Host "  正在执行: vercel env pull .env.local" -ForegroundColor Gray
    vercel env pull .env.local
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ! 拉取环境变量失败，尝试使用本地 .env.local" -ForegroundColor Yellow
    }
}

Write-Host "  正在推送数据库 schema..." -ForegroundColor Yellow
npx drizzle-kit push
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ 数据库 schema 推送成功" -ForegroundColor Green
} else {
    Write-Host "  ✗ 数据库推送失败" -ForegroundColor Red
    Write-Host "  请手动检查数据库连接配置" -ForegroundColor Yellow
    Write-Host "  手动执行: npx drizzle-kit push" -ForegroundColor Yellow
}
Write-Host ""

# 步骤 4: 显示部署信息
Write-Host "[步骤 4/4] 部署信息..." -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "部署流程完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "生产环境地址:" -ForegroundColor Yellow
Write-Host "  https://pulseopti-hr.vercel.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "Vercel 控制台:" -ForegroundColor Yellow
Write-Host "  https://vercel.com/tomato-writer-2024/pulseopti-hr" -ForegroundColor Cyan
Write-Host ""
Write-Host "Neon 数据库控制台:" -ForegroundColor Yellow
Write-Host "  https://console.neon.tech" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步操作:" -ForegroundColor Yellow
Write-Host "  1. 访问生产环境验证功能" -ForegroundColor Gray
Write-Host "  2. 在 Vercel 控制台检查部署日志" -ForegroundColor Gray
Write-Host "  3. 在 Neon 控制台检查数据库表是否创建成功" -ForegroundColor Gray
Write-Host "  4. 测试主要功能（登录、首页、API 等）" -ForegroundColor Gray
Write-Host ""
Write-Host "监控性能:" -ForegroundColor Yellow
Write-Host "  - 首页加载速度（目标: < 1s）" -ForegroundColor Gray
Write-Host "  - API 响应时间（目标: < 0.5s）" -ForegroundColor Gray
Write-Host "  - 国内访问速度（目标: < 3s）" -ForegroundColor Gray
Write-Host "  - 服务器超时率（目标: < 5%）" -ForegroundColor Gray
Write-Host ""
Read-Host "按回车键退出"
