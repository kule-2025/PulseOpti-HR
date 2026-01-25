@echo off
chcp 65001 >nul
title PulseOpti HR - 快速启动向导
cls

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo║                                                           ║
echo║      PulseOpti HR - 快速启动向导 v4.0                     ║
echo║                                                           ║
echo╚═══════════════════════════════════════════════════════════╝
echo.
echo.
echo 请选择你的使用场景：
echo.
echo ┌─────────────────────────────────────────────────────┐
echo │                                                     │
echo │   [1] ⭐⭐⭐ 本地开发环境（强烈推荐）                │
echo │       → 无需外网，速度最快                          │
echo │       → 支持热更新，开发体验最佳                    │
echo │       → 访问: http://localhost:5000                 │
echo │                                                     │
echo │   [2] LocalTunnel快速演示（需要分享）              │
echo │       → 无需注册，2分钟生成公网URL                  │
echo │       → 适合临时分享给客户/同事                     │
echo │                                                     │
echo │   [3] 访问生产环境                                 │
echo │       → 修复网络后访问 https://pulseopti-hr.vercel.app │
echo │       → 完整的生产环境                             │
echo │                                                     │
echo │   [4] 诊断网络问题                                 │
echo │       → 检查本地服务和网络连接                     │
echo │                                                     │
echo │   [0] 查看完整文档                                 │
echo │                                                     │
echo └─────────────────────────────────────────────────────┘
echo.

set /p choice=请输入选项 [0-4]:

if "%choice%"=="1" goto local
if "%choice%"=="2" goto localtunnel
if "%choice%"=="3" goto production
if "%choice%"=="4" goto diagnose
if "%choice%"=="0" goto docs

cls
echo 无效选项，请重新运行
pause
exit /b

:local
cls
echo.
echo ════════════════════════════════════════════════════════
echo     方案1：本地开发环境（⭐⭐⭐ 强烈推荐）
echo ════════════════════════════════════════════════════════
echo.
echo 特点：
echo   ✓ 无需外网连接
echo   ✓ 速度最快（响应时间 < 50ms）
echo   ✓ 支持热更新（HMR）
echo   ✓ 开发体验最佳
echo   ✓ 完全本地运行，安全可靠
echo.
echo 访问地址：http://localhost:5000
echo.
echo 正在启动...
echo.
call start-local-env.bat
goto end

:localtunnel
cls
echo.
echo ════════════════════════════════════════════════════════
echo          方案2：LocalTunnel 快速演示
echo ════════════════════════════════════════════════════════
echo.
echo 特点：
echo   ✓ 无需注册账户
echo   ✓ 自动生成HTTPS公网URL
echo   ✓ 2分钟完成配置
echo   ✓ 适合临时分享
echo.
echo 正在启动...
echo.
call start-localtunnel.bat
goto end

:production
cls
echo.
echo ════════════════════════════════════════════════════════
echo           方案3：访问生产环境
echo ════════════════════════════════════════════════════════
echo.
echo 生产环境地址：https://pulseopti-hr.vercel.app
echo.
echo 如果无法访问，请选择修复方案：
echo.
echo [1] 自动修复网络（推荐）
echo [2] 使用手机热点
echo [3] 使用VPN
echo [4] 查看详细文档
echo [5] 返回主菜单
echo.
set /p fix=请选择 [1-5]:
if "%fix%"=="1" call fix-network-issues.bat
if "%fix%"=="2" (
    echo.
    echo 请连接手机热点后，访问：https://pulseopti-hr.vercel.app
    pause
)
if "%fix%"=="3" (
    echo.
    echo 请启动VPN后，访问：https://pulseopti-hr.vercel.app
    echo 推荐VPN：ExpressVPN, NordVPN, Surfshark
    pause
)
if "%fix%"=="4" (
    echo.
    echo 正在打开详细文档...
    start NETWORK_SOLUTIONS.md
)
if "%fix%"=="5" goto start
goto end

:diagnose
cls
echo.
echo ════════════════════════════════════════════════════════
echo           网络问题诊断
echo ════════════════════════════════════════════════════════
echo.
echo 正在运行诊断...
echo.
call diagnose-network.bat
goto end

:docs
cls
echo.
echo ════════════════════════════════════════════════════════
echo           完整文档
echo ════════════════════════════════════════════════════════
echo.
echo 选择文档：
echo.
echo [1] 网络解决方案
echo [2] 快速使用指南
echo [3] 项目文档
echo [4] 返回主菜单
echo.
set /p doc=请选择 [1-4]:
if "%doc%"=="1" (
    echo 正在打开网络解决方案...
    start NETWORK_SOLUTIONS.md
)
if "%doc%"=="2" (
    echo 正在打开快速指南...
    start NETWORK_README.md
)
if "%doc%"=="3" (
    echo 正在打开项目文档...
    start README.md
)
if "%doc%"=="4" goto start
goto end

:start
cls
goto main

:end
echo.
echo ════════════════════════════════════════════════════════
echo.
echo 提示：
echo   - 日常开发推荐使用方案1（本地环境）
echo   - 需要分享给他人时使用方案2（LocalTunnel）
echo   - 如需访问生产环境，使用方案3
echo.
echo 如需更多帮助，请查看：NETWORK_SOLUTIONS.md
echo.
pause
