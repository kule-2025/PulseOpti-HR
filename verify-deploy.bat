@echo off
REM ============================================
REM PulseOpti HR - 部署验证脚本
REM ============================================

set APP_URL=https://pulseopti-hr.vercel.app
set TOTAL_CHECKS=12
set PASSED_CHECKS=0

echo.
echo ==========================================
echo   部署验证工具
echo ==========================================
echo.
echo 目标: %APP_URL%
echo.

REM 检查 1: 应用首页
echo [1/12] 检查应用首页...
curl -I -s -o nul -w "%%{http_code}" %APP_URL% > temp_status.txt
set /p STATUS_CODE=<temp_status.txt
del temp_status.txt
if "%STATUS_CODE%"=="200" (
    echo ✅ 首页访问正常 (200 OK)
    set /a PASSED_CHECKS+=1
) else (
    echo ❌ 首页访问失败 (%STATUS_CODE%)
)

REM 检查 2: 健康检查 API
echo [2/12] 检查健康检查 API...
curl -s -o nul -w "%%{http_code}" %APP_URL%/api/health > temp_status.txt
set /p STATUS_CODE=<temp_status.txt
del temp_status.txt
if "%STATUS_CODE%"=="200" (
    echo ✅ 健康检查 API 正常 (200 OK)
    set /a PASSED_CHECKS+=1
) else (
    echo ❌ 健康检查 API 失败 (%STATUS_CODE%)
)

REM 检查 3: 登录页面
echo [3/12] 检查登录页面...
curl -I -s -o nul -w "%%{http_code}" %APP_URL%/login > temp_status.txt
set /p STATUS_CODE=<temp_status.txt
del temp_status.txt
if "%STATUS_CODE%"=="200" (
    echo ✅ 登录页面访问正常 (200 OK)
    set /a PASSED_CHECKS+=1
) else (
    echo ❌ 登录页面访问失败 (%STATUS_CODE%)
)

REM 检查 4: 功能介绍页面
echo [4/12] 检查功能介绍页面...
curl -I -s -o nul -w "%%{http_code}" %APP_URL%/features > temp_status.txt
set /p STATUS_CODE=<temp_status.txt
del temp_status.txt
if "%STATUS_CODE%"=="200" (
    echo ✅ 功能介绍页面访问正常 (200 OK)
    set /a PASSED_CHECKS+=1
) else (
    echo ❌ 功能介绍页面访问失败 (%STATUS_CODE%)
)

REM 检查 5: AI 功能页面
echo [5/12] 检查 AI 功能页面...
curl -I -s -o nul -w "%%{http_code}" %APP_URL%/ai > temp_status.txt
set /p STATUS_CODE=<temp_status.txt
del temp_status.txt
if "%STATUS_CODE%"=="200" (
    echo ✅ AI 功能页面访问正常 (200 OK)
    set /a PASSED_CHECKS+=1
) else (
    echo ❌ AI 功能页面访问失败 (%STATUS_CODE%)
)

REM 检查 6: 定价页面
echo [6/12] 检查定价页面...
curl -I -s -o nul -w "%%{http_code}" %APP_URL%/pricing > temp_status.txt
set /p STATUS_CODE=<temp_status.txt
del temp_status.txt
if "%STATUS_CODE%"=="200" (
    echo ✅ 定价页面访问正常 (200 OK)
    set /a PASSED_CHECKS+=1
) else (
    echo ❌ 定价页面访问失败 (%STATUS_CODE%)
)

REM 检查 7: 联系我们页面
echo [7/12] 检查联系我们页面...
curl -I -s -o nul -w "%%{http_code}" %APP_URL%/contact > temp_status.txt
set /p STATUS_CODE=<temp_status.txt
del temp_status.txt
if "%STATUS_CODE%"=="200" (
    echo ✅ 联系我们页面访问正常 (200 OK)
    set /a PASSED_CHECKS+=1
) else (
    echo ❌ 联系我们页面访问失败 (%STATUS_CODE%)
)

REM 检查 8: 文档中心页面
echo [8/12] 检查文档中心页面...
curl -I -s -o nul -w "%%{http_code}" %APP_URL%/docs > temp_status.txt
set /p STATUS_CODE=<temp_status.txt
del temp_status.txt
if "%STATUS_CODE%"=="200" (
    echo ✅ 文档中心页面访问正常 (200 OK)
    set /a PASSED_CHECKS+=1
) else (
    echo ❌ 文档中心页面访问失败 (%STATUS_CODE%)
)

REM 检查 9: 服务条款页面
echo [9/12] 检查服务条款页面...
curl -I -s -o nul -w "%%{http_code}" %APP_URL%/terms > temp_status.txt
set /p STATUS_CODE=<temp_status.txt
del temp_status.txt
if "%STATUS_CODE%"=="200" (
    echo ✅ 服务条款页面访问正常 (200 OK)
    set /a PASSED_CHECKS+=1
) else (
    echo ❌ 服务条款页面访问失败 (%STATUS_CODE%)
)

REM 检查 10: 隐私政策页面
echo [10/12] 检查隐私政策页面...
curl -I -s -o nul -w "%%{http_code}" %APP_URL%/privacy > temp_status.txt
set /p STATUS_CODE=<temp_status.txt
del temp_status.txt
if "%STATUS_CODE%"=="200" (
    echo ✅ 隐私政策页面访问正常 (200 OK)
    set /a PASSED_CHECKS+=1
) else (
    echo ❌ 隐私政策页面访问失败 (%STATUS_CODE%)
)

REM 检查 11: 微信二维码图片
echo [11/12] 检查微信二维码图片...
curl -I -s -o nul -w "%%{http_code}" %APP_URL%/assets/wechat-qr.png > temp_status.txt
set /p STATUS_CODE=<temp_status.txt
del temp_status.txt
if "%STATUS_CODE%"=="200" (
    echo ✅ 微信二维码图片访问正常 (200 OK)
    set /a PASSED_CHECKS+=1
) else (
    echo ❌ 微信二维码图片访问失败 (%STATUS_CODE%)
)

REM 检查 12: API 注册功能
echo [12/12] 检查 API 注册功能...
curl -s -o nul -w "%%{http_code}" -X POST %APP_URL%/api/auth/register -H "Content-Type: application/json" -d "{\"username\":\"test\",\"email\":\"test@example.com\",\"password\":\"password123\"}" > temp_status.txt
set /p STATUS_CODE=<temp_status.txt
del temp_status.txt
if "%STATUS_CODE%"=="200" (
    echo ✅ API 注册功能正常 (200 OK)
    set /a PASSED_CHECKS+=1
) else (
    echo ❌ API 注册功能失败 (%STATUS_CODE%)
)

echo.
echo ==========================================
echo   验证结果
echo ==========================================
echo.
echo 总检查数: %TOTAL_CHECKS%
echo 通过数: %PASSED_CHECKS%
echo 失败数: %TOTAL_CHECKS%-%PASSED_CHECKS%
echo.

if %PASSED_CHECKS%==%TOTAL_CHECKS% (
    echo ✅ 所有检查通过！部署成功！
) else (
    echo ⚠️  部分检查失败，请查看上面的详细信息
    echo.
    echo 建议操作：
    echo   1. 检查 Vercel 部署日志: vercel logs --prod
    echo   2. 验证环境变量配置: vercel env ls production
    echo   3. 检查数据库连接: 访问 https://console.neon.tech
)

echo.
echo ==========================================
echo   手动验证项目
echo ==========================================
echo.
echo 请在浏览器中访问以下页面进行手动验证：
echo   - 首页: %APP_URL%
echo   - 品牌名称: PulseOpti HR 脉策聚效
echo   - 微信二维码: 应正常显示
echo   - 页脚信息: 邮箱应为 PulseOptiHR@163.com
echo   - 登录功能: %APP_URL%/login
echo.

pause
