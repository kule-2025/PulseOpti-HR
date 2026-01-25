@echo off
echo ========================================
echo Vercel 构建状态检查工具
echo ========================================
echo.
echo 正在检查构建状态...
echo.

vercel ls --scope tomato-writer-2024

echo.
echo ========================================
echo 如需查看实时构建日志，请运行：
echo vercel logs --scope tomato-writer-2024
echo ========================================
echo.
pause
