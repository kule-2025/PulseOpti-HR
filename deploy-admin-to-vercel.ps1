# PulseOpti HR - 超管端部署到 Vercel 自动化脚本 (PowerShell 版本)
# PowerShell 7.0+ 推荐

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "PulseOpti HR - 超管端部署到 Vercel 自动化脚本" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "此脚本将帮助你：" -ForegroundColor Yellow
Write-Host "  1. 部署超管端到 Vercel" -ForegroundColor White
Write-Host "  2. 配置自定义域名 admin.aizhixuan.com.cn" -ForegroundColor White
Write-Host "  3. 实现前端与超管端实时数据同步" -ForegroundColor White
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# 错误处理函数
function Write-ErrorAndExit {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
    Read-Host "按 Enter 键退出"
    exit 1
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

# 步骤 1：检查 Vercel CLI 安装
Write-Info "[步骤 1/10] 检查 Vercel CLI 安装状态..."
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Info "Vercel CLI 未安装，正在安装..."
    pnpm add -g vercel

    if ($LASTEXITCODE -ne 0) {
        Write-ErrorAndExit "Vercel CLI 安装失败，请手动安装：pnpm add -g vercel"
    }

    # 刷新 PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    Write-Success "Vercel CLI 安装成功"
} else {
    Write-Success "Vercel CLI 已安装"
}

# 步骤 2：检查 Vercel 登录状态
Write-Host ""
Write-Info "[步骤 2/10] 检查 Vercel 登录状态..."
$whoamiOutput = vercel whoami 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Warning "需要登录 Vercel"
    Write-Info "正在打开登录页面..."

    Start-Process vercel -ArgumentList "login" -Wait

    if ($LASTEXITCODE -ne 0) {
        Write-ErrorAndExit "Vercel 登录失败，请重试"
    }

    Write-Success "登录成功"
} else {
    Write-Success "已登录 Vercel：$whoamiOutput"
}

# 步骤 3：获取前端 DATABASE_URL
Write-Host ""
Write-Info "[步骤 3/10] 获取前端数据库连接信息..."
Write-Info "正在拉取前端环境变量..."

$envPullOutput = vercel env pull .env.frontend.temp 2>&1

if (Test-Path .env.frontend.temp) {
    $envContent = Get-Content .env.frontend.temp
    Remove-Item .env.frontend.temp

    $frontendDbUrl = ""
    foreach ($line in $envContent) {
        if ($line -match "^DATABASE_URL=(.+)$") {
            $frontendDbUrl = $matches[1]
            break
        }
    }

    if ($frontendDbUrl) {
        Write-Success "成功获取前端 DATABASE_URL"
        Write-Info "数据库连接字符串：$($frontendDbUrl.Substring(0, [Math]::Min(50, $frontendDbUrl.Length)))..."
        $env:FRONTEND_DATABASE_URL = $frontendDbUrl
    } else {
        Write-ErrorAndExit "未找到 DATABASE_URL"
    }
} else {
    Write-ErrorAndExit "无法获取前端环境变量，请确保已链接前端项目"
}

# 步骤 4：部署超管端
Write-Host ""
Write-Info "[步骤 4/10] 部署超管端到 Vercel..."
Write-Info "正在创建新项目并部署..."

$deployOutput = vercel --prod --yes --name pulseopti-hr-admin 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-ErrorAndExit "部署失败，请检查日志：$deployOutput"
}

Write-Success "部署成功"

# 步骤 5：配置环境变量
Write-Host ""
Write-Info "[步骤 5/10] 配置超管端环境变量..."

# 配置 DATABASE_URL
Write-Info "配置 DATABASE_URL..."
$envUrl = $env:FRONTEND_DATABASE_URL
$envUrl | vercel env add DATABASE_URL production 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Success "DATABASE_URL 配置成功"
} else {
    Write-Warning "DATABASE_URL 配置失败，请手动配置"
}

# 配置 JWT_SECRET
Write-Info "配置 JWT_SECRET..."
"super_admin_jwt_secret_key_change_in_production" | vercel env add JWT_SECRET production 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Success "JWT_SECRET 配置成功"
} else {
    Write-Warning "JWT_SECRET 配置失败，请手动配置"
}

# 配置 NEXT_PUBLIC_APP_URL
Write-Info "配置 NEXT_PUBLIC_APP_URL..."
"https://admin.aizhixuan.com.cn" | vercel env add NEXT_PUBLIC_APP_URL production 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Success "NEXT_PUBLIC_APP_URL 配置成功"
} else {
    Write-Warning "NEXT_PUBLIC_APP_URL 配置失败，请手动配置"
}

# 配置 NEXT_PUBLIC_API_URL
Write-Info "配置 NEXT_PUBLIC_API_URL..."
"https://admin.aizhixuan.com.cn" | vercel env add NEXT_PUBLIC_API_URL production 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Success "NEXT_PUBLIC_API_URL 配置成功"
} else {
    Write-Warning "NEXT_PUBLIC_API_URL 配置失败，请手动配置"
}

# 配置 NODE_ENV
Write-Info "配置 NODE_ENV..."
"production" | vercel env add NODE_ENV production 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Success "NODE_ENV 配置成功"
} else {
    Write-Warning "NODE_ENV 配置失败，请手动配置"
}

# 配置 SUPER_ADMIN_EMAIL
Write-Info "配置 SUPER_ADMIN_EMAIL..."
"208343256@qq.com" | vercel env add SUPER_ADMIN_EMAIL production 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Success "SUPER_ADMIN_EMAIL 配置成功"
} else {
    Write-Warning "SUPER_ADMIN_EMAIL 配置失败，请手动配置"
}

# 配置 SUPER_ADMIN_PASSWORD
Write-Info "配置 SUPER_ADMIN_PASSWORD..."
"admin123" | vercel env add SUPER_ADMIN_PASSWORD production 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Success "SUPER_ADMIN_PASSWORD 配置成功"
} else {
    Write-Warning "SUPER_ADMIN_PASSWORD 配置失败，请手动配置"
}

# 配置 ADMIN_MODE
Write-Info "配置 ADMIN_MODE..."
"true" | vercel env add ADMIN_MODE production 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Success "ADMIN_MODE 配置成功"
} else {
    Write-Warning "ADMIN_MODE 配置失败，请手动配置"
}

Write-Success "环境变量配置完成"

# 步骤 6：添加自定义域名
Write-Host ""
Write-Info "[步骤 6/10] 配置自定义域名..."
Write-Info "正在添加域名 admin.aizhixuan.com.cn..."

$domainOutput = vercel domains add admin.aizhixuan.com.cn 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Success "域名添加成功"
} else {
    Write-Warning "域名添加失败，请手动添加"
    Write-Info "访问 https://vercel.com/dashboard 添加域名"
}

# 步骤 7：重新部署
Write-Host ""
Write-Info "[步骤 7/10] 重新部署以应用配置..."

$redeployOutput = vercel --prod 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-ErrorAndExit "重新部署失败，请检查日志：$redeployOutput"
}

Write-Success "重新部署成功"

# 步骤 8：DNS 配置说明
Write-Host ""
Write-Info "[步骤 8/10] DNS 配置说明"
Write-Host ""
Write-Host "DNS 配置信息：" -ForegroundColor Yellow
Write-Host "  类型：CNAME" -ForegroundColor White
Write-Host "  主机记录：admin" -ForegroundColor White
Write-Host "  记录值：cname.vercel-dns.com" -ForegroundColor White
Write-Host ""
Write-Info "请在域名注册商（腾讯云/阿里云等）添加上述 DNS 记录"
Write-Info "DNS 生效需要 5-10 分钟，请耐心等待"
Write-Host ""

# 步骤 9：验证部署
Write-Info "[步骤 9/10] 验证部署状态..."
Write-Info "正在检查部署状态..."
Write-Host ""

vercel ls

Write-Host ""
Write-Success "部署信息已显示，请确认项目名称和 URL"

# 步骤 10：创建超级管理员账号
Write-Host ""
Write-Info "[步骤 10/10] 创建超级管理员账号"
Write-Host ""

Write-Host "请通过以下方式创建超级管理员账号：" -ForegroundColor Yellow
Write-Host ""
Write-Host "方式 1：通过注册页面（推荐）" -ForegroundColor Cyan
Write-Host "  访问：https://admin.aizhixuan.com.cn/register" -ForegroundColor White
Write-Host "  填写：" -ForegroundColor White
Write-Host "    - 邮箱：208343256@qq.com" -ForegroundColor White
Write-Host "    - 密码：admin123" -ForegroundColor White
Write-Host "    - 姓名：超级管理员" -ForegroundColor White
Write-Host ""

Write-Host "方式 2：通过 API" -ForegroundColor Cyan
Write-Host "  执行以下命令：" -ForegroundColor White
Write-Host "  curl -X POST https://admin.aizhixuan.com.cn/api/auth/register" -ForegroundColor White
Write-Host "    -H `"Content-Type: application/json`"" -ForegroundColor White
Write-Host "    -d `"{\`"email\`":\`"208343256@qq.com\`",\`"password\`":\`"admin123\`",\`"name\`":\`"超级管理员\`"}`"" -ForegroundColor White
Write-Host ""

Read-Host "按 Enter 键继续"

# 完成
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "✅ 超管端部署完成！" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "访问地址：" -ForegroundColor Yellow
Write-Host "  - 超管端登录页：https://admin.aizhixuan.com.cn/login" -ForegroundColor Cyan
Write-Host "  - 超管端首页：https://admin.aizhixuan.com.cn" -ForegroundColor Cyan
Write-Host ""
Write-Host "管理员账号：" -ForegroundColor Yellow
Write-Host "  - 邮箱：208343256@qq.com" -ForegroundColor Cyan
Write-Host "  - 密码：admin123" -ForegroundColor Cyan
Write-Host ""
Write-Host "数据同步验证：" -ForegroundColor Yellow
Write-Host "  1. 访问前端：https://www.aizhixuan.com.cn" -ForegroundColor White
Write-Host "  2. 注册新用户" -ForegroundColor White
Write-Host "  3. 访问超管端：https://admin.aizhixuan.com.cn/admin/users" -ForegroundColor White
Write-Host "  4. 查看是否显示刚注册的用户" -ForegroundColor White
Write-Host ""
Write-Host "后续维护：" -ForegroundColor Yellow
Write-Host "  - 查看日志：vercel logs --follow" -ForegroundColor White
Write-Host "  - 重新部署：vercel --prod" -ForegroundColor White
Write-Host "  - 管理环境变量：vercel env ls production" -ForegroundColor White
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

Read-Host "按 Enter 键退出"
