@echo off
chcp 65001 >nul
echo ========================================
echo Git克隆错误修复脚本
echo ========================================
echo.

echo [1/5] 正在清理旧的克隆目录...
cd C:\
if exist PulseOpti-HR (
    echo 删除 C:\PulseOpti-HR...
    rmdir /s /q PulseOpti-HR
)
echo ✓ 清理完成
echo.

echo [2/5] 正在配置Git以支持Windows长路径...
git config --global core.protectNTFS false
git config --global core.longpaths true
git config --global core.autocrlf true
echo ✓ Git配置完成
echo.

echo [3/5] 正在从GitHub克隆仓库...
git clone https://github.com/tomato-writer-2024/PulseOpti-HR.git
if errorlevel 1 (
    echo ✗ 克隆失败
    pause
    exit /b 1
)
echo ✓ 克隆成功
echo.

echo [4/5] 正在恢复文件（修复检出问题）...
cd PulseOpti-HR
git restore --source=HEAD :/
echo ✓ 文件恢复完成
echo.

echo [5/5] 正在安装项目依赖...
pnpm install
if errorlevel 1 (
    echo ✗ 依赖安装失败，请检查网络连接
    echo 您可以稍后手动执行: cd C:\PulseOpti-HR && pnpm install
) else (
    echo ✓ 依赖安装完成
)
echo.

echo ========================================
echo 修复完成！
echo ========================================
echo.
echo 当前目录: %CD%
echo.
echo 下一步操作：
echo 1. 检查 package.json 是否存在
echo 2. 运行部署脚本: deploy-admin-to-vercel.bat
echo.
pause
