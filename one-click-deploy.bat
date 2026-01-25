@echo off
chcp 65001 >nul
cls
echo ========================================
echo Vercel 一键部署（Windows 版本）
echo ========================================
echo.

REM 颜色设置
set GREEN=[92m
set RED=[91m
set YELLOW=[93m
set BLUE=[94m
set NC=[0m

echo %BLUE%步骤 1: 检查 Vercel CLI%NC%
echo ----------------------------------------

where vercel >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo %GREEN%✓ Vercel CLI 已安装%NC%
    vercel --version
) else (
    echo %RED%✗ Vercel CLI 未安装%NC%
    echo.
    echo 正在安装 Vercel CLI...
    npm install -g vercel
    if %ERRORLEVEL% NEQ 0 (
        echo %RED%✗ 安装失败%NC%
        pause
        exit /b 1
    )
    echo %GREEN%✓ 安装成功%NC%
)
echo.

echo %BLUE%步骤 2: 检查登录状态%NC%
echo ----------------------------------------

vercel whoami >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo %GREEN%✓ 已登录到 Vercel%NC%
    vercel whoami
) else (
    echo %YELLOW%⚠ 未登录到 Vercel%NC%
    echo.
    echo 正在登录 Vercel...
    vercel login
    if %ERRORLEVEL% NEQ 0 (
        echo %RED%✗ 登录失败%NC%
        pause
        exit /b 1
    )
    echo %GREEN%✓ 登录成功%NC%
)
echo.

echo %BLUE%步骤 3: 检查 Git 状态%NC%
echo ----------------------------------------

git rev-parse --git-dir >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo %GREEN%✓ Git 仓库存在%NC%
    echo 当前分支:
    git branch --show-current
    echo 最新提交:
    git log -1 --oneline
    echo.

    REM 检查是否有未推送的提交
    git fetch origin main >nul 2>&1
    for /f "delims=" %%i in ('git rev-parse HEAD') do set LOCAL_COMMIT=%%i
    for /f "delims=" %%i in ('git rev-parse origin/main 2^>nul') do set REMOTE_COMMIT=%%i

    if not "%LOCAL_COMMIT%"=="%REMOTE_COMMIT%" (
        echo %YELLOW%⚠ 检测到未推送的提交%NC%
        echo 正在推送到 GitHub...
        git push origin main
        if %ERRORLEVEL% EQU 0 (
            echo %GREEN%✓ 推送成功%NC%
        ) else (
            echo %RED%✗ 推送失败%NC%
        )
    ) else (
        echo %GREEN%✓ 代码已同步%NC%
    )
) else (
    echo %RED%✗ 不是 Git 仓库%NC%
    pause
    exit /b 1
)
echo.

echo %BLUE%步骤 4: 检查项目链接%NC%
echo ----------------------------------------

if exist ".vercel\project.json" (
    echo %GREEN%✓ 项目已链接%NC%
) else (
    echo %YELLOW%⚠ 项目未链接%NC%
    echo 正在链接项目...
    vercel link
    if %ERRORLEVEL% NEQ 0 (
        echo %RED%✗ 链接失败%NC%
        pause
        exit /b 1
    )
    echo %GREEN%✓ 链接成功%NC%
)
echo.

echo %BLUE%步骤 5: 部署到生产环境%NC%
echo ----------------------------------------
echo 正在部署到生产环境...
echo.

vercel --prod --yes
if %ERRORLEVEL% EQU 0 (
    echo.
    echo %GREEN%✓ 部署成功%NC%
) else (
    echo.
    echo %RED%✗ 部署失败%NC%
    pause
    exit /b 1
)
echo.

echo %BLUE%步骤 6: 等待部署完成%NC%
echo ----------------------------------------
echo 等待 10 秒后验证部署...
timeout /t 10 /nobreak >nul
echo.

echo %BLUE%步骤 7: 验证部署%NC%
echo ----------------------------------------
echo 正在检查应用 URL...

curl -I --max-time 10 https://pulseopti-hr.vercel.app >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo %GREEN%✓ 应用可以访问%NC%
    echo.
    echo 应用 URL: https://pulseopti-hr.vercel.app
) else (
    echo %YELLOW%⚠ 应用暂时无法访问%NC%
    echo.
    echo 可能还在部署中，请稍后再试：
    echo   https://pulseopti-hr.vercel.app
    echo.
    echo 或者访问 Vercel Dashboard 查看部署状态：
    echo   https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments
)
echo.

echo ========================================
echo %GREEN%部署流程完成%NC%
echo ========================================
echo.
echo 应用 URL: https://pulseopti-hr.vercel.app
echo Vercel Dashboard: https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr
echo.
echo 如果遇到问题，请查看：
echo   - WINDOWS_DEPLOY_GUIDE.md
echo   - QUICK_COMMANDS.md
echo.

pause
