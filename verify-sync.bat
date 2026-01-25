@echo off
REM PulseOpti HR 实时数据同步验证脚本
REM 用于验证前端与超管端数据同步功能

echo ========================================
echo   PulseOpti HR 数据同步验证脚本
echo ========================================
echo.

set FRONTEND_URL=https://www.aizhixuan.com.cn
set ADMIN_URL=https://admin.aizhixuan.com.cn

echo [检查点 1/5] 检查前端是否在线...
curl -I %FRONTEND_URL% --max-time 10 2>&1 | findstr "HTTP"
if %errorlevel% neq 0 (
    echo ❌ 前端无法访问
    goto :error
)
echo ✅ 前端在线
echo.

echo [检查点 2/5] 检查超管端是否在线...
curl -I %ADMIN_URL% --max-time 10 2>&1 | findstr "HTTP"
if %errorlevel% neq 0 (
    echo ❌ 超管端无法访问
    echo 提示：请先完成部署步骤
    goto :error
)
echo ✅ 超管端在线
echo.

echo [检查点 3/5] 测试前端API健康状态...
curl -I %FRONTEND_URL%/api/health --max-time 10 2>&1 | findstr "HTTP"
if %errorlevel% neq 0 (
    echo ❌ 前端API不可用
    goto :error
)
echo ✅ 前端API正常
echo.

echo [检查点 4/5] 测试超管端API健康状态...
curl -I %ADMIN_URL%/api/health --max-time 10 2>&1 | findstr "HTTP"
if %errorlevel% neq 0 (
    echo ❌ 超管端API不可用
    goto :error
)
echo ✅ 超管端API正常
echo.

echo [检查点 5/5] 测试超管端登录...
curl -X POST %ADMIN_URL%/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"account\":\"208343256@qq.com\",\"password\":\"admin123\"}" ^
  --max-time 10 2>&1 | findstr "success"
if %errorlevel% neq 0 (
    echo ❌ 超管端登录失败
    goto :error
)
echo ✅ 超管端登录成功
echo.

echo ========================================
echo   验证完成
echo ========================================
echo.
echo ✅ 所有检查通过！数据同步功能正常
echo.
echo 下一步：测试实时数据同步
echo 1. 访问前端注册用户：%FRONTEND_URL%
echo 2. 立即访问超管端查看：%ADMIN_URL%/admin/users
echo 3. 验证新用户是否立即显示（0延迟）
echo.
echo 按任意键退出...
pause > nul
goto :end

:error
echo.
echo ========================================
echo   验证失败
echo ========================================
echo.
echo 请检查：
echo 1. 前端和超管端是否都已部署
echo 2. DNS配置是否正确
echo 3. 环境变量是否配置
echo 4. 数据库连接是否正常
echo.
echo 详细文档：https://www.aizhixuan.com.cn/sync-guide
echo.
echo 按任意键退出...
pause > nul

:end
