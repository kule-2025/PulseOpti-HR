@echo off
chcp 65001 >nul
echo ==========================================
echo   PulseOpti HR 性能监控
echo ==========================================
echo.

set BASE_URL=http://localhost:5000

:: 测试函数
:test_endpoint
setlocal
set "name=%~1"
set "url=%~2"
set "method=%~3"
set "data=%~4"

echo 📊 测试: %name%
echo    URL: %url%

if "%data%"=="" (
    for /f "tokens=*" %%i in ('curl -w "总耗时: %%{time_total}s" -o nul -s -X %method% "%url%"') do set "response_time=%%i"
) else (
    for /f "tokens=*" %%i in ('curl -w "总耗时: %%{time_total}s" -o nul -s -X %method% -H "Content-Type: application/json" -d "%data%" "%url%"') do set "response_time=%%i"
)

echo    %response_time%
echo.

endlocal
goto :eof

:: 测试首页
call :test_endpoint "首页" "%BASE_URL%" "GET"

:: 测试登录API
call :test_endpoint "登录API" "%BASE_URL%/api/auth/login" "POST" "{""account"":""test@test.com"",""password"":""test123""}"

:: 测试API健康检查
call :test_endpoint "API健康检查" "%BASE_URL%/api/health" "GET"

echo ==========================================
echo   性能优化建议：
echo ==========================================
echo.
echo ✅ 优秀: ^< 0.5秒  - 无需优化
echo ⚠️  良好: 0.5-1秒  - 可以接受
echo 🟡 一般: 1-2秒    - 建议优化
echo ❌ 较慢: ^> 2秒     - 必须优化
echo.
echo 常见优化方向：
echo   1. 数据库查询优化（索引、连接池）
echo   2. API并行请求处理
echo   3. 响应数据精简（避免返回不必要字段）
echo   4. 添加缓存层（Redis）
echo   5. 静态资源CDN加速
echo.

pause
