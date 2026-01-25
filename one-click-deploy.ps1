# Vercel 一键部署（PowerShell 版本）

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Vercel 一键部署（PowerShell 版本）" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 步骤 1: 检查 Vercel CLI
Write-Host "步骤 1: 检查 Vercel CLI" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

$vercelPath = Get-Command vercel -ErrorAction SilentlyContinue
if ($vercelPath) {
    Write-Host "✓ Vercel CLI 已安装" -ForegroundColor Green
    vercel --version
} else {
    Write-Host "✗ Vercel CLI 未安装" -ForegroundColor Red
    Write-Host ""
    Write-Host "正在安装 Vercel CLI..."
    npm install -g vercel

    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ 安装失败" -ForegroundColor Red
        pause
        exit 1
    }

    Write-Host "✓ 安装成功" -ForegroundColor Green
}
Write-Host ""

# 步骤 2: 检查登录状态
Write-Host "步骤 2: 检查登录状态" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

try {
    $user = vercel whoami 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 已登录到 Vercel" -ForegroundColor Green
        Write-Host $user
    } else {
        throw "Not logged in"
    }
} catch {
    Write-Host "⚠ 未登录到 Vercel" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "正在登录 Vercel..."
    vercel login

    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ 登录失败" -ForegroundColor Red
        pause
        exit 1
    }

    Write-Host "✓ 登录成功" -ForegroundColor Green
}
Write-Host ""

# 步骤 3: 检查 Git 状态
Write-Host "步骤 3: 检查 Git 状态" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

try {
    $gitDir = git rev-parse --git-dir 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Git 仓库存在" -ForegroundColor Green
        Write-Host "当前分支: $(git branch --show-current)"
        Write-Host "最新提交: $(git log -1 --oneline)"
        Write-Host ""

        # 检查是否有未推送的提交
        git fetch origin main 2>&1 | Out-Null
        $localCommit = git rev-parse HEAD
        $remoteCommit = git rev-parse origin/main 2>&1

        if ($localCommit -ne $remoteCommit) {
            Write-Host "⚠ 检测到未推送的提交" -ForegroundColor Yellow
            Write-Host "正在推送到 GitHub..."
            git push origin main

            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ 推送成功" -ForegroundColor Green
            } else {
                Write-Host "✗ 推送失败" -ForegroundColor Red
            }
        } else {
            Write-Host "✓ 代码已同步" -ForegroundColor Green
        }
    } else {
        throw "Not a git repo"
    }
} catch {
    Write-Host "✗ 不是 Git 仓库" -ForegroundColor Red
    pause
    exit 1
}
Write-Host ""

# 步骤 4: 检查项目链接
Write-Host "步骤 4: 检查项目链接" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

if (Test-Path ".vercel\project.json") {
    Write-Host "✓ 项目已链接" -ForegroundColor Green
} else {
    Write-Host "⚠ 项目未链接" -ForegroundColor Yellow
    Write-Host "正在链接项目..."
    vercel link

    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ 链接失败" -ForegroundColor Red
        pause
        exit 1
    }

    Write-Host "✓ 链接成功" -ForegroundColor Green
}
Write-Host ""

# 步骤 5: 部署到生产环境
Write-Host "步骤 5: 部署到生产环境" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "正在部署到生产环境..."
Write-Host ""

vercel --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ 部署成功" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✗ 部署失败" -ForegroundColor Red
    pause
    exit 1
}
Write-Host ""

# 步骤 6: 等待部署完成
Write-Host "步骤 6: 等待部署完成" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "等待 10 秒后验证部署..."
Start-Sleep -Seconds 10
Write-Host ""

# 步骤 7: 验证部署
Write-Host "步骤 7: 验证部署" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "正在检查应用 URL..."

try {
    $response = Invoke-WebRequest -Uri "https://pulseopti-hr.vercel.app" -Method Head -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✓ 应用可以访问" -ForegroundColor Green
    Write-Host ""
    Write-Host "应用 URL: https://pulseopti-hr.vercel.app"
} catch {
    Write-Host "⚠ 应用暂时无法访问" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "可能还在部署中，请稍后再试："
    Write-Host "  https://pulseopti-hr.vercel.app"
    Write-Host ""
    Write-Host "或者访问 Vercel Dashboard 查看部署状态："
    Write-Host "  https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments"
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "部署流程完成" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "应用 URL: https://pulseopti-hr.vercel.app"
Write-Host "Vercel Dashboard: https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr"
Write-Host ""
Write-Host "如果遇到问题，请查看："
Write-Host "  - WINDOWS_DEPLOY_GUIDE.md"
Write-Host "  - QUICK_COMMANDS.md"
Write-Host ""

Write-Host "按任意键退出..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
