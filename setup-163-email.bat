@echo off
chcp 65001 >nul
echo ==========================================================
echo    PulseOpti HR - 163邮箱快速配置工具
echo ==========================================================
echo.

REM 检查.env文件是否存在
if not exist ".env" (
    echo [错误] 未找到.env文件！
    echo 请先复制.env.example为.env：
    echo     copy .env.example .env
    echo.
    pause
    exit /b 1
)

echo [步骤1] 请输入你的163邮箱地址（例如：yourname@163.com）
set /p EMAIL_USER="邮箱地址: "

REM 验证邮箱格式
echo %EMAIL_USER% | findstr /i "@163.com$" >nul
if %errorlevel% neq 0 (
    echo [错误] 请输入有效的163邮箱地址！
    pause
    exit /b 1
)

echo.
echo [步骤2] 请输入163邮箱授权码（16位字符）
echo 提示：登录163邮箱 → 设置 → POP3/SMTP/IMAP → 授权码
set /p EMAIL_PASSWORD="授权码: "

REM 验证授权码长度
echo %EMAIL_PASSWORD% | findstr /R "^[a-zA-Z0-9]\{16\}$" >nul
if %errorlevel% neq 0 (
    echo [警告] 授权码应该是16位字符，请确认是否正确
    set /p CONFIRM="是否继续？(Y/N): "
    if /i not "%CONFIRM%"=="Y" (
        echo 配置已取消
        pause
        exit /b 1
    )
)

echo.
echo [步骤3] 配置邮件服务参数...

REM 备份原有.env文件
copy .env .env.backup >nul
echo [信息] 已备份原有.env文件到 .env.backup

REM 检查是否已有SMTP配置
findstr /C:"SMTP_HOST=" .env >nul
if %errorlevel% equ 0 (
    echo [信息] 检测到已有SMTP配置，将进行更新...
) else (
    echo [信息] 添加新的SMTP配置...
)

REM 创建临时配置文件
echo. >> .env
echo # ======================================== >> .env
echo # 163邮箱SMTP配置 >> .env
echo # ======================================== >> .env
echo SMTP_HOST=smtp.163.com >> .env
echo SMTP_PORT=465 >> .env
echo SMTP_SECURE=true >> .env
echo SMTP_USER=%EMAIL_USER% >> .env
echo SMTP_PASSWORD=%EMAIL_PASSWORD% >> .env
echo SMTP_FROM=PulseOpti HR <%EMAIL_USER%> >> .env
echo SMTP_NAME=PulseOpti HR 脉策聚效 >> .env
echo EMAIL_PROVIDER=smtp >> .env
echo ENABLE_EMAIL_SERVICE=true >> .env

echo.
echo [步骤4] 验证配置...

REM 读取配置进行验证
findstr /C:"SMTP_HOST=smtp.163.com" .env >nul
if %errorlevel% neq 0 (
    echo [错误] SMTP_HOST配置失败
    goto ERROR
)

findstr /C:"SMTP_USER=%EMAIL_USER%" .env >nul
if %errorlevel% neq 0 (
    echo [错误] SMTP_USER配置失败
    goto ERROR
)

findstr /C:"SMTP_PASSWORD=%EMAIL_PASSWORD%" .env >nul
if %errorlevel% neq 0 (
    echo [错误] SMTP_PASSWORD配置失败
    goto ERROR
)

echo.
echo ==========================================================
echo [成功] 163邮箱配置完成！
echo ==========================================================
echo.
echo 配置信息：
echo   邮箱地址: %EMAIL_USER%
echo   SMTP服务器: smtp.163.com
echo   端口: 465 (SSL)
echo   授权码: %EMAIL_PASSWORD%
echo.
echo 下一步操作：
echo   1. 重启开发服务器: pnpm dev
echo   2. 访问登录页面测试邮件发送: http://localhost:5000/login
echo   3. 详细配置指南: EMAIL_SETUP_163.md
echo.
echo ==========================================================
pause
exit /b 0

:ERROR
echo.
echo ==========================================================
echo [错误] 配置失败，请检查.env文件
echo ==========================================================
echo.
echo 恢复备份文件...
copy .env.backup .env >nul
echo 已恢复原有配置
echo.
pause
exit /b 1
