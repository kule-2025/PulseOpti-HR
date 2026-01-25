@echo off
chcp 65001 >nul
echo ================================================
echo PulseOpti HR - Vercel部署验证脚本
echo ================================================
echo.

REM 检查curl是否可用
where curl >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到curl命令，请确保系统支持curl
    pause
    exit /b 1
)

echo [1/5] 检查主域名 (pulseopti-hr.vercel.app)...
echo ------------------------------------------------
curl -I --max-time 10 https://pulseopti-hr.vercel.app 2>&1 | findstr /C:"HTTP"
echo.
if %errorlevel% equ 0 (
    echo [✓] 主域名可访问
) else (
    echo [✗] 主域名无法访问，可能还在部署中
)
echo.

echo [2/5] 检查超管端域名 (admin.aizhixuan.com.cn)...
echo ------------------------------------------------
curl -I --max-time 10 https://admin.aizhixuan.com.cn 2>&1 | findstr /C:"HTTP"
echo.
if %errorlevel% equ 0 (
    echo [✓] 超管端域名可访问
) else (
    echo [✗] 超管端域名无法访问
    echo    可能原因：
    echo    1. Vercel自动部署还在进行中（需要2-3分钟）
    echo    2. DNS记录还在传播中（可能需要24-48小时）
    echo    3. 域名未正确配置到Vercel
)
echo.

echo [3/5] 检查Git仓库状态...
echo ------------------------------------------------
git status
echo.
if %errorlevel% equ 0 (
    echo [✓] Git仓库状态正常
) else (
    echo [✗] Git仓库状态异常
)
echo.

echo [4/5] 检查最新提交...
echo ------------------------------------------------
git log --oneline -1
echo.

echo [5/5] 检查仓库历史（确认无C:\路径）...
echo ------------------------------------------------
git ls-files | findstr /i "^[A-Z]:" >nul 2>nul
if %errorlevel% neq 0 (
    echo [✓] 仓库中未发现Windows盘符路径
) else (
    echo [✗] 仓库中仍存在Windows盘符路径
    echo    以下文件包含Windows路径：
    git ls-files | findstr /i "^[A-Z]:"
)
echo.

echo ================================================
echo 验证完成
echo ================================================
echo.
echo 下一步操作：
echo 1. 如果显示"可访问"，请打开浏览器访问以下地址：
echo    - 超管端登录页: https://admin.aizhixuan.com.cn/admin/login
echo    - 用户端首页: https://admin.aizhixuan.com.cn
echo.
echo 2. 如果显示"无法访问"，请：
echo    - 等待2-3分钟后重新运行此脚本
echo    - 或访问 https://vercel.com 查看部署日志
echo.
echo 3. 超级管理员账号：
echo    - 邮箱: 208343256@qq.com
echo    - 密码: admin123
echo.
pause
