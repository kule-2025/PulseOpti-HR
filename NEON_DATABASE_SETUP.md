# Neon 数据库配置指南

> 本指南详细说明如何配置和使用 Neon PostgreSQL 数据库

---

## 📋 数据库信息

### 当前配置

- **数据库类型**：Neon PostgreSQL
- **连接字符串**：
  ```
  postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
  ```
- **数据库名**：neondb
- **区域**：AWS us-east-1
- **用户名**：neondb_owner

---

## 🔧 配置步骤

### 步骤 1：访问 Neon 控制台

1. 访问：https://console.neon.tech
2. 使用 GitHub 账号登录
3. 找到你的项目 `ep-dry-sunset-ah7xpibr`

### 步骤 2：获取连接字符串

#### 方法 1：从 Neon 控制台获取

1. 在 Neon 控制台，选择你的项目
2. 点击左侧菜单 **"Connection Details"**
3. 复制 **Connection string**（格式如下）：
   ```
   postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

#### 方法 2：使用连接池（推荐）

使用连接池可以提高性能：

```
postgres://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?pgbouncer=true
```

**注意**：使用连接池时，连接字符串以 `postgres://` 开头（而不是 `postgresql://`）

### 步骤 3：测试数据库连接

#### 方法 1：使用 psql 命令行工具

```cmd
REM 安装 PostgreSQL 客户端（如果未安装）
REM 下载地址：https://www.postgresql.org/download/windows/

REM 测试连接
psql "postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require" -c "SELECT version();"

REM 应该看到 PostgreSQL 版本信息
REM PostgreSQL 16.2 (NeonDB (PostgreSQL 16.2)) on x86_64-pc-linux-gnu...
```

#### 方法 2：使用 Docker 快速测试

```cmd
REM 使用 Docker 容器测试连接
docker run --rm postgres:15 psql "postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require" -c "SELECT version();"
```

#### 方法 3：使用 Node.js 测试

```cmd
REM 创建测试脚本
echo const { Client } = require('pg'); > test-db.js
echo const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require' }); >> test-db.js
echo client.connect(); >> test-db.js
echo client.query('SELECT NOW()', (err, res) => { console.log(res.rows[0]); client.end(); }); >> test-db.js

REM 运行测试
node test-db.js

REM 清理测试文件
del test-db.js
```

### 步骤 4：配置 Vercel 环境变量

在 Vercel 项目中添加 `DATABASE_URL` 环境变量：

#### 使用 Vercel CLI

```cmd
REM 添加环境变量
vercel env add DATABASE_URL production

REM 按照提示输入连接字符串
REM postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

#### 使用 Vercel 网页界面

1. 访问：https://vercel.com/dashboard
2. 找到 `pulseopti-hr` 项目
3. 点击 **"Settings"** → **"Environment Variables"**
4. 点击 **"Add New"**
5. 输入：
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require`
6. 选择 **Environment**: `Production`、`Preview`、`Development`
7. 点击 **"Save"**

---

## 🗄️ 运行数据库迁移

### 步骤 1：生成迁移文件

```cmd
REM 设置环境变量
set DATABASE_URL=postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

REM 生成迁移文件
pnpm drizzle-kit generate

REM 生成的文件位置：drizzle/*.sql
REM 示例：drizzle/0001_initial_schema.sql
```

### 步骤 2：执行迁移

```cmd
REM 执行数据库迁移
pnpm drizzle-kit migrate

REM 成功后应该看到：
REM ✓ 59 migrations applied
```

### 步骤 3：验证迁移结果

#### 使用 Neon SQL Editor

1. 访问：https://console.neon.tech
2. 打开你的项目
3. 点击 **"SQL Editor"**
4. 执行以下查询：

```sql
-- 查看所有表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 预期结果：应该看到 59 个表
-- 示例：
-- users
-- roles
-- workflows
-- workflow_instances
-- workflow_templates
-- performance_records
-- compensation_payroll
-- attendance_records
-- ...
```

#### 使用 psql 命令行

```cmd
REM 连接到数据库
psql "postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"

REM 查看所有表
\dt

REM 退出
\q
```

---

## 🔍 数据库管理

### 查看数据库信息

```sql
-- 查看当前数据库
SELECT current_database();

-- 查看数据库大小
SELECT 
    pg_size_pretty(pg_database_size('neondb')) AS size;

-- 查看连接数
SELECT count(*) FROM pg_stat_activity;
```

### 查看表信息

```sql
-- 查看所有表
SELECT 
    table_name,
    pg_size_pretty(pg_total_relation_size(table_name)) AS size
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY pg_total_relation_size(table_name) DESC;

-- 查看特定表结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

### 查看索引

```sql
-- 查看所有索引
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

---

## 📊 监控和优化

### 查看慢查询

```sql
-- 启用慢查询日志（需要在 Neon 控制台配置）
-- 然后查看 pg_stat_statements 表

SELECT 
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### 查看表统计信息

```sql
-- 查看表的行数
SELECT 
    schemaname,
    tablename,
    n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

---

## 🔄 备份和恢复

### Neon 自动备份

Neon 提供以下备份功能：

1. **Point-in-Time Recovery (PITR)**：可以恢复到过去 30 天内的任意时间点
2. **Database Copying**：可以创建数据库副本
3. **Export**：可以导出数据为 SQL 文件

### 手动备份数据

```cmd
REM 使用 pg_dump 导出数据
pg_dump "postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require" > backup.sql

REM 导出特定表
pg_dump "postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require" -t users > users_backup.sql
```

### 恢复数据

```cmd
REM 使用 psql 恢复数据
psql "postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require" < backup.sql
```

---

## 🛠️ 常见问题

### 问题 1：连接超时

**错误信息**：
```
connection timeout expired
```

**解决方案**：
1. 检查网络连接
2. 验证连接字符串是否正确
3. 确认 Neon 项目未暂停
4. 尝试使用连接池 URL

### 问题 2：SSL 错误

**错误信息**：
```
SSL connection has been closed unexpectedly
```

**解决方案**：
确保连接字符串中包含 `sslmode=require`

### 问题 3：权限错误

**错误信息**：
```
permission denied for table users
```

**解决方案**：
1. 检查数据库用户权限
2. 确保使用的是 `neondb_owner` 用户
3. 验证表的所有权

### 问题 4：迁移失败

**错误信息**：
```
relation "users" already exists
```

**解决方案**：
```sql
-- 如果表已存在，先删除
DROP TABLE IF EXISTS users CASCADE;

-- 然后重新运行迁移
pnpm drizzle-kit migrate
```

---

## 📝 最佳实践

1. **使用连接池**：在生产环境中使用连接池 URL 以提高性能
2. **监控连接数**：定期检查 `pg_stat_activity` 避免连接泄漏
3. **定期备份**：虽然 Neon 提供自动备份，但仍建议定期导出重要数据
4. **优化查询**：使用 `EXPLAIN ANALYZE` 分析慢查询
5. **限制权限**：为应用创建专用数据库用户，仅授予必要权限

---

## 🔗 相关链接

- **Neon 文档**：https://neon.tech/docs
- **Vercel 文档**：https://vercel.com/docs
- **PostgreSQL 文档**：https://www.postgresql.org/docs
- **Drizzle ORM 文档**：https://orm.drizzle.team

---

**祝你配置顺利！🚀**
