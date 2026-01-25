@echo off
chcp 65001 >nul
echo ========================================
echo 超管端快速部署（非交互模式）
echo ========================================
echo.

echo [1/5] 检查Vercel登录状态...
vercel whoami 2>nul
if errorlevel 1 (
    echo ✗ 未登录Vercel
    echo.
    echo 请先执行以下命令登录：
    echo   vercel login
    echo.
    echo 登录步骤：
    echo   1. 选择 "Continue with GitHub"
    echo   2. 在浏览器中授权
    echo   3. 登录成功后重新运行本脚本
    echo.
    pause
    exit /b 1
)
echo ✓ 已登录
echo.

echo [2/5] 部署到Vercel生产环境...
echo 这可能需要几分钟，请耐心等待...
echo.
vercel --prod --yes
if errorlevel 1 (
    echo ✗ 部署失败
    pause
    exit /b 1
)
echo ✓ 部署完成
echo.

echo [3/5] 获取部署信息...
echo.
vercel ls
echo.

echo [4/5] 环境变量配置说明...
echo.
echo 项目已配置环境变量（与主站共享）：
echo ✓ DATABASE_URL
echo ✓ JWT_SECRET
echo ✓ NEXT_PUBLIC_APP_URL
echo.
echo 如需修改，访问：
echo https://vercel.com/tomato-writer-2024/pulseopti-hr/settings/environment-variables
echo.

echo [5/5] DNS配置说明...
echo.
echo 请在域名管理面板添加CNAME记录：
echo ┌─────────────────────────────────────┐
echo │ 记录类型: CNAME                     │
echo │ 主机记录: admin                     │
echo │ 记录值:   cname.vercel-dns.com      │
echo └─────────────────────────────────────┘
echo.

echo ========================================
echo 部署完成！
echo ========================================
echo.
echo 📱 访问地址: https://admin.aizhixuan.com.cn
echo 👤 登录账号: admin@pulseopti-hr.com
echo 🔑 登录密码: admin123
echo.
echo 下一步：
echo 1. 配置DNS记录（如未配置）
echo 2. 访问超管端验证功能
echo 3. 测试与主站的数据同步
echo.
pause
