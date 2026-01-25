# PowerShell 验证脚本
# 检查优化配置是否正确应用

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PulseOpti HR 优化配置验证工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true

# 检查 1: vercel.json 配置
Write-Host "[检查 1/6] vercel.json 配置..." -ForegroundColor Green
if (Test-Path "vercel.json") {
    $vercelConfig = Get-Content "vercel.json" -Raw | ConvertFrom-Json

    # 检查 maxDuration
    $maxDuration = $vercelConfig.functions.'app/api/**/*.ts'.maxDuration
    if ($maxDuration -ge 60) {
        Write-Host "  ✓ Vercel 超时时间: $maxDuration 秒（推荐: 60秒）" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Vercel 超时时间: $maxDuration 秒（推荐: 60秒）" -ForegroundColor Red
        $allPassed = $false
    }

    # 检查 memory
    $memory = $vercelConfig.functions.'app/api/**/*.ts'.memory
    if ($memory -ge 2048) {
        Write-Host "  ✓ Vercel 内存: $memory MB（推荐: 2048MB）" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Vercel 内存: $memory MB（推荐: 2048MB）" -ForegroundColor Red
        $allPassed = $false
    }

    # 检查 regions
    $regions = $vercelConfig.regions -join ", "
    if ($vercelConfig.regions -contains "hkg1" -or $vercelConfig.regions -contains "sin1") {
        Write-Host "  ✓ 部署区域: $regions（推荐: 香港/新加坡）" -ForegroundColor Green
    } else {
        Write-Host "  ! 部署区域: $regions（推荐: 香港/新加坡）" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✗ vercel.json 文件不存在" -ForegroundColor Red
    $allPassed = $false
}
Write-Host ""

# 检查 2: next.config.ts 配置
Write-Host "[检查 2/6] next.config.ts 配置..." -ForegroundColor Green
if (Test-Path "next.config.ts") {
    $nextConfig = Get-Content "next.config.ts" -Raw

    if ($nextConfig -match "images:\s*\{[^}]*unoptimized:\s*false") {
        Write-Host "  ✓ 图片优化: 已启用" -ForegroundColor Green
    } else {
        Write-Host "  ✗ 图片优化: 未启用" -ForegroundColor Red
        $allPassed = $false
    }

    if ($nextConfig -match "optimizeCss:\s*true") {
        Write-Host "  ✓ CSS 优化: 已启用" -ForegroundColor Green
    } else {
        Write-Host "  ✗ CSS 优化: 未启用" -ForegroundColor Red
        $allPassed = $false
    }

    if ($nextConfig -match "swcMinify:\s*true") {
        Write-Host "  ✓ SWC 压缩: 已启用" -ForegroundColor Green
    } else {
        Write-Host "  ✗ SWC 压缩: 未启用" -ForegroundColor Red
        $allPassed = $false
    }

    if ($nextConfig -match "isrMemoryCacheSize:\s*50") {
        Write-Host "  ✓ ISR 缓存: 50MB（推荐值）" -ForegroundColor Green
    } else {
        Write-Host "  ! ISR 缓存: 未配置或值不正确" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✗ next.config.ts 文件不存在" -ForegroundColor Red
    $allPassed = $false
}
Write-Host ""

# 检查 3: 优化模块是否存在
Write-Host "[检查 3/6] 优化模块文件..." -ForegroundColor Green
$requiredFiles = @(
    "src/lib/middleware/api-timeout.ts",
    "src/lib/cache/query-cache.ts",
    "src/lib/middleware/monitor.ts",
    "src/lib/db/optimized.ts"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file" -ForegroundColor Red
        $allPassed = $false
    }
}
Write-Host ""

# 检查 4: 构建状态
Write-Host "[检查 4/6] 构建状态..." -ForegroundColor Green
if (Test-Path ".next") {
    Write-Host "  ✓ 构建目录存在" -ForegroundColor Green

    if (Test-Path ".next\BUILD_ID") {
        $buildId = Get-Content ".next\BUILD_ID"
        Write-Host "  ✓ 构建ID: $buildId" -ForegroundColor Green
    }
} else {
    Write-Host "  ! 构建目录不存在（需要运行 pnpm run build）" -ForegroundColor Yellow
}
Write-Host ""

# 检查 5: 依赖安装
Write-Host "[检查 5/6] 依赖包..." -ForegroundColor Green
if (Test-Path "node_modules") {
    Write-Host "  ✓ node_modules 目录存在" -ForegroundColor Green

    if (Test-Path "node_modules\next") {
        $nextVersion = node -p "require('./node_modules/next/package.json').version"
        Write-Host "  ✓ Next.js 版本: $nextVersion" -ForegroundColor Green
    }
} else {
    Write-Host "  ! node_modules 目录不存在（需要运行 pnpm install）" -ForegroundColor Yellow
}
Write-Host ""

# 检查 6: Git 状态
Write-Host "[检查 6/6] Git 状态..." -ForegroundColor Green
$gitStatus = git status --porcelain 2>&1
if ($LASTEXITCODE -eq 0) {
    $uncommitted = ($gitStatus | Measure-Object).Count
    if ($uncommitted -eq 0) {
        Write-Host "  ✓ 工作目录干净，无未提交的更改" -ForegroundColor Green
    } else {
        Write-Host "  ! 有 $uncommitted 个未提交的更改" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ! Git 不可用或不是 Git 仓库" -ForegroundColor Yellow
}
Write-Host ""

# 总结
Write-Host "========================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "✓ 所有检查通过！优化配置已正确应用。" -ForegroundColor Green
} else {
    Write-Host "✗ 部分检查失败，请检查上述错误信息。" -ForegroundColor Red
}
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "下一步操作:" -ForegroundColor Yellow
Write-Host "  1. 如果所有检查通过，可以部署到 Vercel" -ForegroundColor Gray
Write-Host "  2. 如果有检查失败，请重新运行: .\APPLY_OPTIMIZATION.ps1" -ForegroundColor Gray
Write-Host "  3. 部署脚本: .\DEPLOY_VERCEL.ps1" -ForegroundColor Gray
Write-Host ""

# 返回退出码
if ($allPassed) {
    exit 0
} else {
    exit 1
}
