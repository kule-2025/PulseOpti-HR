@echo off
REM 超管端环境配置和部署脚本
REM 用于快速部署超管端并配置共享数据库

echo ========================================
echo   PulseOpti HR 超管端部署脚本
echo ========================================
echo.

REM 设置颜色
color 0A

REM 检查必要的环境变量
echo [1/6] 检查环境变量...
if not defined DATABASE_URL (
    echo ❌ 错误：DATABASE_URL 环境变量未设置
    echo.
    echo 请先设置环境变量：
    echo set DATABASE_URL=postgres://neondb_owner:PASSWORD@ep-xxx.aws.neon.tech/neondb?sslmode=require
    echo.
    pause
    exit /b 1
)

echo ✅ DATABASE_URL 已设置
echo.

REM 测试数据库连接
echo [2/6] 测试数据库连接...
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); pool.query('SELECT NOW()', (err, res) => { if (err) { console.error('❌ 数据库连接失败:', err.message); process.exit(1); } else { console.log('✅ 数据库连接成功'); pool.end(); } });"

if errorlevel 1 (
    echo.
    echo 数据库连接失败，请检查 DATABASE_URL 配置
    pause
    exit /b 1
)
echo.

REM 运行数据库迁移
echo [3/6] 运行数据库迁移...
call pnpm db:push

if errorlevel 1 (
    echo.
    echo 数据库迁移失败
    pause
    exit /b 1
)
echo.

REM 创建超级管理员账号
echo [4/6] 创建超级管理员账号...
node create-super-admin.js

if errorlevel 1 (
    echo.
    echo 创建超级管理员失败
    pause
    exit /b 1
)
echo.

REM 验证数据表
echo [5/6] 验证数据表结构...
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); pool.query(\"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'\", (err, res) => { if (err) { console.error('❌ 查询失败:', err.message); process.exit(1); } else { console.log('✅ 找到', res.rows.length, '张数据表'); pool.end(); } });"

if errorlevel 1 (
    echo.
    echo 数据表验证失败
    pause
    exit /b 1
)
echo.

REM 提交代码
echo [6/6] 提交代码到Git...
git add .
git commit -m "feat: 配置超管端共享数据库"
git push origin main

if errorlevel 1 (
    echo.
    echo Git提交失败
    pause
    exit /b 1
)
echo.

echo ========================================
echo   配置完成！
echo ========================================
echo.
echo 接下来的步骤：
echo 1. 访问 https://vercel.com 创建超管端项目
echo 2. 在Vercel项目中配置环境变量（使用相同的DATABASE_URL）
echo 3. 配置自定义域名：admin.aizhixuan.com.cn
echo 4. 等待部署完成
echo 5. 访问 https://admin.aizhixuan.com.cn
echo.
echo 超级管理员账号：
echo 邮箱：admin@aizhixuan.com.cn
echo 密码：Admin123456
echo.
echo 按任意键退出...
pause > nul
