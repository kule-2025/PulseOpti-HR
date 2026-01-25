# PulseOpti HR - 163邮箱配置脚本（PowerShell版）
# 使用方法：右键点击文件 → 使用PowerShell运行

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   PulseOpti HR - 163邮箱快速配置工具" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 检查.env文件
if (-not (Test-Path ".env")) {
    Write-Host "[错误] 未找到.env文件！" -ForegroundColor Red
    Write-Host "请先复制.env.example为.env：" -ForegroundColor Yellow
    Write-Host "    Copy-Item .env.example .env" -ForegroundColor Gray
    Write-Host ""
    Read-Host "按回车键退出"
    exit 1
}

# 步骤1：输入邮箱地址
Write-Host "[步骤1] 请输入你的163邮箱地址（例如：yourname@163.com）" -ForegroundColor Green
$emailUser = Read-Host "邮箱地址"

# 验证邮箱格式
if ($emailUser -notmatch "^[a-zA-Z0-9._%+-]+@163\.com$") {
    Write-Host "[错误] 请输入有效的163邮箱地址！" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}

Write-Host ""

# 步骤2：输入授权码
Write-Host "[步骤2] 请输入163邮箱授权码（16位字符）" -ForegroundColor Green
Write-Host "提示：登录163邮箱 → 设置 → POP3/SMTP/IMAP → 授权码" -ForegroundColor Yellow
$emailPassword = Read-Host "授权码"

# 验证授权码长度
if ($emailPassword.Length -ne 16) {
    Write-Host "[警告] 授权码应该是16位字符，请确认是否正确" -ForegroundColor Yellow
    $confirm = Read-Host "是否继续？(Y/N)"
    if ($confirm -ne "Y" -and $confirm -ne "y") {
        Write-Host "配置已取消" -ForegroundColor Yellow
        Read-Host "按回车键退出"
        exit 1
    }
}

Write-Host ""

# 步骤3：备份和配置
Write-Host "[步骤3] 配置邮件服务参数..." -ForegroundColor Green

# 备份原有.env文件
Copy-Item ".env" ".env.backup" -Force
Write-Host "[信息] 已备份原有.env文件到 .env.backup" -ForegroundColor Gray

# 检查是否已有SMTP配置
$hasSmtpConfig = Select-String -Path ".env" -Pattern "SMTP_HOST=" -Quiet
if ($hasSmtpConfig) {
    Write-Host "[信息] 检测到已有SMTP配置，将进行更新..." -ForegroundColor Gray
} else {
    Write-Host "[信息] 添加新的SMTP配置..." -ForegroundColor Gray
}

# 添加配置到.env文件
$envContent = @"

# ========================================
# 163邮箱SMTP配置
# ========================================
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=$emailUser
SMTP_PASSWORD=$emailPassword
SMTP_FROM=PulseOpti HR <$emailUser>
SMTP_NAME=PulseOpti HR 脉策聚效
EMAIL_PROVIDER=smtp
ENABLE_EMAIL_SERVICE=true
"@

Add-Content -Path ".env" -Value $envContent

Write-Host ""

# 步骤4：验证配置
Write-Host "[步骤4] 验证配置..." -ForegroundColor Green

$envContentAfter = Get-Content ".env" -Raw
if ($envContentAfter -notmatch "SMTP_HOST=smtp\.163\.com") {
    Write-Host "[错误] SMTP_HOST配置失败" -ForegroundColor Red
    goto Error
}

if ($envContentAfter -notmatch "SMTP_USER=$emailUser") {
    Write-Host "[错误] SMTP_USER配置失败" -ForegroundColor Red
    goto Error
}

if ($envContentAfter -notmatch "SMTP_PASSWORD=$emailPassword") {
    Write-Host "[错误] SMTP_PASSWORD配置失败" -ForegroundColor Red
    goto Error
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "[成功] 163邮箱配置完成！" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "配置信息：" -ForegroundColor Cyan
Write-Host "  邮箱地址: $emailUser" -ForegroundColor White
Write-Host "  SMTP服务器: smtp.163.com" -ForegroundColor White
Write-Host "  端口: 465 (SSL)" -ForegroundColor White
Write-Host "  授权码: $emailPassword" -ForegroundColor White
Write-Host ""
Write-Host "下一步操作：" -ForegroundColor Cyan
Write-Host "  1. 重启开发服务器: pnpm dev" -ForegroundColor Gray
Write-Host "  2. 访问登录页面测试邮件发送: http://localhost:5000/login" -ForegroundColor Gray
Write-Host "  3. 详细配置指南: EMAIL_SETUP_163.md" -ForegroundColor Gray
Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Read-Host "按回车键退出"
exit 0

:Error
Write-Host ""
Write-Host "==========================================================" -ForegroundColor Red
Write-Host "[错误] 配置失败，请检查.env文件" -ForegroundColor Red
Write-Host "==========================================================" -ForegroundColor Red
Write-Host ""
Write-Host "恢复备份文件..." -ForegroundColor Yellow
Copy-Item ".env.backup" ".env" -Force
Write-Host "已恢复原有配置" -ForegroundColor Gray
Write-Host ""
Read-Host "按回车键退出"
exit 1
