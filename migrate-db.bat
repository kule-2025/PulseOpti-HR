@echo off
REM ============================================
REM PulseOpti HR - 数据库迁移脚本
REM ============================================

echo.
echo ==========================================
echo   数据库迁移工具
echo ==========================================
echo.

REM 检查是否已设置环境变量
if "%DATABASE_URL%"=="" (
    echo ❌ 错误：DATABASE_URL 环境变量未设置
    echo.
    echo 请先运行 setup-env.bat 设置环境变量
    echo.
    pause
    exit /b 1
)

echo 当前数据库连接：
echo %DATABASE_URL%
echo.

REM 询问是否继续
echo ⚠️  即将执行数据库迁移，此操作将：
echo   - 创建新的数据库表
echo   - 修改现有表结构
echo   - 可能会清除部分数据
echo.
set /p confirm=是否继续？(Y/N):
if /i not "%confirm%"=="Y" (
    echo 操作已取消
    pause
    exit /b 0
)

echo.
echo ==========================================
echo   步骤 1/2: 生成迁移文件
echo ==========================================
echo.

call pnpm drizzle-kit generate

if errorlevel 1 (
    echo.
    echo ❌ 生成迁移文件失败
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ 迁移文件生成成功
echo.

echo ==========================================
echo   步骤 2/2: 执行数据库迁移
echo ==========================================
echo.

call pnpm drizzle-kit migrate

if errorlevel 1 (
    echo.
    echo ❌ 数据库迁移失败
    echo.
    echo 可能的原因：
    echo   - 数据库连接失败
    echo   - 表已存在
    echo   - 迁移文件有错误
    echo.
    echo 请检查错误信息并重试
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ 数据库迁移成功
echo.
echo ==========================================
echo   验证数据库表
echo ==========================================
echo.

echo 请访问以下 URL 验证数据库表：
echo https://console.neon.tech
echo.
echo 执行以下 SQL 查询：
echo SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
echo.
echo 预期结果：应该看到 59 个表
echo.
echo ==========================================
echo   完成
echo ==========================================
echo.

pause
