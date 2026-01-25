@echo off
chcp 65001 >nul
echo ==========================================
echo   PulseOpti HR 性能测试
echo ==========================================
echo.

set BASE_URL=http://localhost:5000

echo [1/3] 测试首页...
for /f "tokens=*" %%i in ('curl -w "%%{time_total}" -o nul -s "%BASE_URL%"') do set home_time=%%i
echo 首页响应时间: %home_time%秒
echo.

echo [2/3] 测试登录API...
for /f "tokens=*" %%i in ('curl -w "%%{time_total}" -o nul -s -X POST -H "Content-Type: application/json" -d "{\"account\":\"test@test.com\",\"password\":\"test123\"}" "%BASE_URL%/api/auth/login"') do set login_time=%%i
echo 登录API响应时间: %login_time%秒
echo.

echo [3/3] 测试健康检查...
for /f "tokens=*" %%i in ('curl -w "%%{time_total}" -o nul -s "%BASE_URL%/api/health"') do set health_time=%%i
echo 健康检查响应时间: %health_time%秒
echo.

echo ==========================================
echo   性能评估
echo ==========================================
echo.

:: 评估首页
set /a home_int=%home_time:~0,1%
if %home_int% lss 1 (
    echo 首页: ✅ 优秀 ^(%home_time%s^)
) else if %home_int% lss 2 (
    echo 首页: ⚠️ 良好 ^(%home_time%s^)
) else (
    echo 首页: ❌ 较慢 ^(%home_time%s^) - 需要优化！
)
echo.

:: 评估登录
set /a login_int=%login_time:~0,1%
if %login_int% lss 1 (
    echo 登录: ✅ 优秀 ^(%login_time%s^)
) else if %login_int% lss 2 (
    echo 登录: ⚠️ 良好 ^(%login_time%s^)
) else (
    echo 登录: ❌ 较慢 ^(%login_time%s^) - 需要优化！
)
echo.

pause
