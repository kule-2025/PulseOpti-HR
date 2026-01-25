@echo off
chcp 65001 >nul
echo ============================================================
echo PulseOpti HR - 数据同步验证工具
echo ============================================================
echo.
echo 此工具将验证前端和超管端的数据同步是否正常
echo.
echo ============================================================
echo.

REM 检查网络连接
echo [步骤 1/5] 检查网络连接...
ping -n 1 www.aizhixuan.com.cn >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 前端网络连接失败
) else (
    echo ✅ 前端网络连接正常
)

ping -n 1 admin.aizhixuan.com.cn >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 超管端网络连接失败
) else (
    echo ✅ 超管端网络连接正常
)

REM 检查 API 健康状态
echo.
echo [步骤 2/5] 检查 API 健康状态...

curl -s -o nul -w "%%{http_code}" https://www.aizhixuan.com.cn/api/health >frontend_health.txt
set FRONTEND_HEALTH=<frontend_health.txt
if "%FRONTEND_HEALTH%"=="200" (
    echo ✅ 前端 API 健康状态：200 OK
) else (
    echo ❌ 前端 API 健康状态：%FRONTEND_HEALTH%
)

curl -s -o nul -w "%%{http_code}" https://admin.aizhixuan.com.cn/api/health >admin_health.txt
set ADMIN_HEALTH=<admin_health.txt
if "%ADMIN_HEALTH%"=="200" (
    echo ✅ 超管端 API 健康状态：200 OK
) else (
    echo ❌ 超管端 API 健康状态：%ADMIN_HEALTH%
)

REM 检查数据库连接
echo.
echo [步骤 3/5] 检查数据库连接...

curl -s -o frontend_db.json -w "%%{http_code}" https://www.aizhixuan.com.cn/api/health/database >frontend_db_code.txt
set FRONTEND_DB_CODE=<frontend_db_code.txt
if "%FRONTEND_DB_CODE%"=="200" (
    echo ✅ 前端数据库连接正常
) else (
    echo ❌ 前端数据库连接失败：%FRONTEND_DB_CODE%
)

curl -s -o admin_db.json -w "%%{http_code}" https://admin.aizhixuan.com.cn/api/health/database >admin_db_code.txt
set ADMIN_DB_CODE=<admin_db_code.txt
if "%ADMIN_DB_CODE%"=="200" (
    echo ✅ 超管端数据库连接正常
) else (
    echo ❌ 超管端数据库连接失败：%ADMIN_DB_CODE%
)

REM 验证数据库是否相同
echo.
echo [步骤 4/5] 验证数据库是否相同...

if exist frontend_db.json (
    if exist admin_db.json (
        findstr /C:"DATABASE_URL" frontend_db.json >frontend_db_url.txt
        findstr /C:"DATABASE_URL" admin_db.json >admin_db_url.txt

        fc frontend_db_url.txt admin_db_url.txt >nul 2>&1
        if %errorlevel% equ 0 (
            echo ✅ 数据库连接字符串相同，数据同步正常
        ) else (
            echo ❌ 数据库连接字符串不同，数据可能不同步
            echo.
            echo 前端数据库：
            type frontend_db_url.txt
            echo.
            echo 超管端数据库：
            type admin_db_url.txt
        )
    ) else (
        echo ❌ 无法获取超管端数据库信息
    )
) else (
    echo ❌ 无法获取前端数据库信息
)

REM 测试数据同步
echo.
echo [步骤 5/5] 测试数据同步功能...

echo.
echo 请按照以下步骤验证数据同步：
echo.
echo 1. 在前端注册一个测试用户
echo    访问：https://www.aizhixuan.com.cn/register
echo.
echo 2. 注册完成后，在超管端查看该用户
echo    访问：https://admin.aizhixuan.com.cn/admin/users
echo.
echo 3. 如果能看到刚注册的用户，说明数据同步正常
echo.

REM 清理临时文件
del frontend_health.txt 2>nul
del admin_health.txt 2>nul
del frontend_db.json 2>nul
del admin_db.json 2>nul
del frontend_db_code.txt 2>nul
del admin_db_code.txt 2>nul
del frontend_db_url.txt 2>nul
del admin_db_url.txt 2>nul

echo ============================================================
echo 验证完成
echo ============================================================
echo.
echo 如果所有检查都通过，说明数据同步配置正确
echo 如果有问题，请参考 REALTIME_DATA_SYNC_DETAILED_STEPS.md 进行排查
echo.
pause
