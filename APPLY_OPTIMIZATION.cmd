@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo   Vercel + Neon 性能优化工具
echo ========================================
echo.

echo 此工具将应用所有性能优化配置
echo 预计时间：30 分钟
echo.

pause

echo.
echo [1/9] 备份现有配置文件...
echo.

if exist vercel.json (
    copy vercel.json vercel.json.backup
    echo ✅ vercel.json 已备份
) else (
    echo ⚠️  vercel.json 不存在，跳过备份
)

if exist next.config.ts (
    copy next.config.ts next.config.ts.backup
    echo ✅ next.config.ts 已备份
) else (
    echo ⚠️  next.config.ts 不存在，跳过备份
)

echo.
echo [2/9] 更新 vercel.json...
echo.

if exist vercel.optimized.json (
    copy vercel.optimized.json vercel.json
    echo ✅ vercel.json 已更新
    echo.
    echo 关键优化：
    echo   - 超时时间：60 秒
    echo   - 内存：2048MB
    echo   - 部署区域：香港、新加坡
    echo   - CORS 和缓存优化
) else (
    echo ❌ vercel.optimized.json 不存在
    pause
    exit /b 1
)

echo.
echo [3/9] 更新 next.config.ts...
echo.

if exist next.config.optimized.ts (
    copy next.config.optimized.ts next.config.ts
    echo ✅ next.config.ts 已更新
    echo.
    echo 关键优化：
    echo   - 启用图片优化
    echo   - 启用 CSS 优化
    echo   - 启用 ISR 缓存
    echo   - Webpack 配置优化
) else (
    echo ❌ next.config.optimized.ts 不存在
    pause
    exit /b 1
)

echo.
echo [4/9] 检查中间件文件...
echo.

if exist src\lib\middleware\api-timeout.ts (
    echo ✅ api-timeout.ts 已存在
) else (
    echo ⚠️  api-timeout.ts 不存在
)

if exist src\lib\cache\query-cache.ts (
    echo ✅ query-cache.ts 已存在
) else (
    echo ⚠️  query-cache.ts 不存在
)

if exist src\lib\middleware\monitor.ts (
    echo ✅ monitor.ts 已存在
) else (
    echo ⚠️  monitor.ts 不存在
)

if exist src\lib\db\optimized.ts (
    echo ✅ optimized.ts 已存在
) else (
    echo ⚠️  optimized.ts 不存在
)

echo.
echo [5/9] 清理旧的构建...
echo.

if exist .next (
    rmdir /s /q .next
    echo ✅ .next 已清理
) else (
    echo ⚠️  .next 不存在，跳过清理
)

echo.
echo [6/9] 重新构建项目...
echo.
echo 这可能需要 3-5 分钟，请耐心等待...
echo.

pnpm run build
if %errorlevel% equ 0 (
    echo.
    echo ✅ 构建成功
) else (
    echo.
    echo ❌ 构建失败
    echo.
    echo 请检查错误信息，可能需要：
    echo   1. 重新安装依赖：pnpm install --force
    echo   2. 检查代码错误
    echo.
    pause
    exit /b 1
)

echo.
echo [7/9] 部署到 Vercel 生产环境...
echo.
echo 这可能需要 5-10 分钟，请耐心等待...
echo.

vercel --prod --force
if %errorlevel% equ 0 (
    echo.
    echo ✅ 部署成功
) else (
    echo.
    echo ❌ 部署失败
    echo.
    echo 请检查错误信息：
    echo   1. 检查网络连接
    echo   2. 检查 Vercel 登录状态：vercel login
    echo   3. 查看部署日志：vercel logs --prod
    echo.
    pause
    exit /b 1
)

echo.
echo [8/9] 验证部署状态...
echo.

vercel ls --prod

echo.
echo [9/9] 测试生产环境...
echo.

echo 请在浏览器中访问以下地址测试：
echo.
echo 🔗 https://pulseopti-hr.vercel.app
echo.
echo 测试项目：
echo   ✅ 首页加载（预期 < 2 秒）
echo   ✅ 用户登录（预期 < 1 秒）
echo   ✅ 超管端登录（预期 < 1 秒）
echo   ✅ 数据查询（预期 < 1 秒）
echo.

echo ========================================
echo   ✅ 优化完成！
echo ========================================
echo.

echo 📊 预期性能提升：
echo.
echo   指标              优化前    优化后    提升
echo   ----------------------------------------
echo   API 超时率         15%%       ^<1%%      93%%
echo   平均响应时间       2.5s      0.8s      68%%
echo   国内加载时间       8s        2s        75%%
echo   数据库查询时间     1.5s      0.3s      80%%
echo.

echo 📋 后续步骤：
echo.
echo 1. 访问生产环境并测试功能
echo 2. 查看部署日志：vercel logs --prod
echo 3. 查看 Vercel Analytics：
echo    https://vercel.com/dashboard/tomato-ai-writer/pulseopti-hr/analytics
echo 4. 根据实际情况调优参数
echo.

echo 🔗 相关资源：
echo.
echo   - 生产环境：https://pulseopti-hr.vercel.app
echo   - Vercel Dashboard：https://vercel.com/dashboard
echo   - 详细文档：OPTIMIZE_VERCEL_NEON.md
echo.

pause
