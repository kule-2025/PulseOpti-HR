# PulseOpti HR 脉策聚效 SaaS平台 - 运维手册

## 目录

- [系统概述](#系统概述)
- [日常维护](#日常维护)
- [监控和告警](#监控和告警)
- [备份和恢复](#备份和恢复)
- [性能优化](#性能优化)
- [安全管理](#安全管理)
- [故障处理](#故障处理)
- [版本更新](#版本更新)

## 系统概述

### 系统架构

```
┌─────────────────┐
│   客户端（浏览器） │
└────────┬────────┘
         │ HTTPS
         ↓
┌─────────────────┐
│   Nginx (反向代理)│
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Next.js (应用) │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  PostgreSQL (DB)│
└─────────────────┘
```

### 核心组件

1. **前端**: Next.js 16 + React 19
2. **后端**: Next.js API Routes
3. **数据库**: PostgreSQL 15+
4. **对象存储**: S3兼容存储
5. **AI服务**: 豆包大模型

## 日常维护

### 1. 健康检查

```bash
# 检查应用状态
curl http://localhost:5000/api/health

# 检查数据库连接
psql -U user -d pulse_opti_hr -c "SELECT 1"

# 检查Redis连接
redis-cli ping
```

### 2. 日志管理

查看应用日志：

```bash
# 查看实时日志
pm2 logs pulse-opti-hr

# 查看错误日志
pm2 logs pulse-opti-hr --err

# 查看过去1小时的日志
pm2 logs pulse-opti-hr --lines 1000 --nostream
```

清理日志：

```bash
# 清理PM2日志
pm2 flush

# 清理应用日志
find /path/to/logs -name "*.log" -mtime +30 -delete
```

### 3. 数据库维护

数据库优化：

```sql
-- 分析表
ANALYZE;

-- 清理死元组
VACUUM;

-- 重建索引
REINDEX DATABASE pulse_opti_hr;
```

数据库监控：

```sql
-- 查看活跃连接
SELECT count(*) FROM pg_stat_activity;

-- 查看慢查询
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### 4. 系统更新

系统更新：

```bash
# 更新依赖
pnpm update

# 运行测试
pnpm test

# 构建应用
pnpm build

# 重启服务
pm2 restart pulse-opti-hr
```

## 监控和告警

### 1. 系统监控

监控指标：

- **CPU使用率**: 正常 < 70%
- **内存使用率**: 正常 < 80%
- **磁盘使用率**: 正常 < 85%
- **网络流量**: 正常波动

监控命令：

```bash
# 查看CPU和内存
htop

# 查看磁盘使用
df -h

# 查看网络流量
iftop
```

### 2. 应用监控

监控指标：

- **API响应时间**: 正常 < 500ms
- **错误率**: 正常 < 1%
- **并发连接数**: 正常 < 1000
- **数据库查询时间**: 正常 < 100ms

### 3. 告警配置

配置告警规则：

- CPU使用率 > 90% 持续5分钟
- 内存使用率 > 90% 持续5分钟
- 磁盘使用率 > 90%
- API错误率 > 5%
- 数据库连接失败

## 备份和恢复

### 1. 数据库备份

全量备份：

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/pulse-opti-hr"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份数据库
pg_dump -U user pulse_opti_hr > $BACKUP_DIR/backup_$DATE.sql

# 压缩备份
gzip $BACKUP_DIR/backup_$DATE.sql

# 上传到对象存储
aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://your-bucket/backups/

# 删除本地30天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

增量备份（使用WAL）：

```bash
# 配置归档
wal_level = replica
archive_mode = on
archive_command = 'cp %p /var/backups/wal/%f'
```

### 2. 数据恢复

恢复数据库：

```bash
# 停止应用
pm2 stop pulse-opti-hr

# 恢复数据库
gunzip -c /var/backups/pulse-opti-hr/backup_YYYYMMDD_HHMMSS.sql.gz | psql -U user pulse_opti_hr

# 重启应用
pm2 start pulse-opti-hr
```

### 3. 对象存储备份

备份配置和文件：

```bash
# 备份对象存储配置
aws s3 sync s3://your-bucket/config /var/backups/s3-config

# 备份上传的文件
aws s3 sync s3://your-bucket/uploads /var/backups/s3-uploads
```

## 性能优化

### 1. 应用层优化

启用缓存：

```javascript
// Redis缓存示例
import { cache } from '@/lib/cache';

async function getUser(id: string) {
  const cacheKey = `user:${id}`;
  const cached = await cache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const user = await db.select().from(users).where(eq(users.id, id));
  await cache.set(cacheKey, user, 3600); // 缓存1小时

  return user;
}
```

优化数据库查询：

```javascript
// 使用索引
// 在 Schema 中定义索引
export const employees = pgTable('employees', {
  // ... 字段
}, (table) => ({
  companyIdIdx: index('company_id_idx').on(table.companyId),
  emailIdx: index('email_idx').on(table.email),
}));
```

### 2. 数据库优化

添加索引：

```sql
-- 为常用查询添加索引
CREATE INDEX idx_employees_company_id ON employees(company_id);
CREATE INDEX idx_employees_department_id ON employees(department_id);
CREATE INDEX idx_employees_email ON employees(email);
```

优化连接池：

```env
# 数据库连接池配置
DB_POOL_MIN=5
DB_POOL_MAX=20
```

### 3. 系统优化

调整系统参数：

```bash
# /etc/sysctl.conf
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_tw_reuse = 1
```

## 安全管理

### 1. 访问控制

配置防火墙：

```bash
# 只允许特定IP访问
ufw allow from your.ip.address to any port 5000
ufw allow from your.ip.address to any port 22
ufw enable
```

### 2. 数据加密

启用SSL：

```nginx
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
}
```

### 3. 权限管理

最小权限原则：

```sql
-- 创建只读用户
CREATE USER readonly_user WITH PASSWORD 'strong-password';
GRANT CONNECT ON DATABASE pulse_opti_hr TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
```

### 4. 安全审计

启用审计日志：

```javascript
import { logger } from '@/lib/logger';

function auditLog(action: string, resource: string, resourceId: string, userId: string, companyId: string, changes?: any) {
  logger.audit(action, resource, resourceId, userId, companyId, changes);
}
```

## 故障处理

### 1. 常见故障

#### 数据库连接失败

**症状**: 应用无法连接数据库

**排查步骤**:
1. 检查数据库服务状态
2. 验证连接字符串
3. 检查网络连接
4. 查看数据库日志

**解决方案**:
```bash
# 重启数据库
systemctl restart postgresql

# 检查连接数
psql -U user -d pulse_opti_hr -c "SELECT count(*) FROM pg_stat_activity"
```

#### 应用内存溢出

**症状**: 应用崩溃，日志显示内存不足

**排查步骤**:
1. 检查内存使用情况
2. 查看应用日志
3. 分析内存泄漏

**解决方案**:
```bash
# 增加Node.js内存限制
NODE_OPTIONS="--max-old-space-size=4096" pm2 start ecosystem.config.js

# 优化代码，减少内存占用
```

#### API响应慢

**症状**: API请求响应时间长

**排查步骤**:
1. 检查数据库查询性能
2. 查看慢查询日志
3. 检查网络延迟

**解决方案**:
```sql
-- 优化慢查询
EXPLAIN ANALYZE SELECT * FROM employees WHERE ...

-- 添加索引
CREATE INDEX idx_employees_company_hire_date ON employees(company_id, hire_date);
```

### 2. 紧急恢复

快速回滚：

```bash
# 停止应用
pm2 stop pulse-opti-hr

# 恢复上一个版本
git checkout previous-version
pnpm install
pnpm build

# 重启应用
pm2 start pulse-opti-hr
```

数据恢复：

```bash
# 从备份恢复
gunzip -c /var/backups/pulse-opti-hr/backup_YYYYMMDD_HHMMSS.sql.gz | psql -U user pulse_opti_hr
```

## 版本更新

### 1. 更新流程

1. **准备阶段**
   - 备份数据库
   - 备份配置文件
   - 测试新版本

2. **更新阶段**
   - 拉取最新代码
   - 更新依赖
   - 运行迁移
   - 构建应用
   - 重启服务

3. **验证阶段**
   - 健康检查
   - 功能测试
   - 性能测试

### 2. 回滚计划

如果更新失败，执行回滚：

```bash
# 恢复数据库
gunzip -c /var/backups/pulse-opti-hr/backup_PRE_UPDATE.sql.gz | psql -U user pulse_opti_hr

# 恢复代码
git checkout previous-version
pnpm install
pnpm build
pm2 restart pulse-opti-hr
```

## 联系方式

如有问题，请联系：

- 邮箱: PulseOptiHR@163.com
- 地址: 广州市天河区
- 服务时间: 周一至周五 9:00-12:00, 14:00-18:00

## 附录

### A. 常用命令

```bash
# 应用管理
pm2 start ecosystem.config.js
pm2 restart pulse-opti-hr
pm2 stop pulse-opti-hr
pm2 delete pulse-opti-hr

# 数据库管理
pg_dump -U user pulse_opti_hr > backup.sql
psql -U user pulse_opti_hr < backup.sql

# 日志查看
pm2 logs pulse-opti-hr
tail -f /var/log/postgresql/postgresql-*.log
```

### B. 环境变量参考

见部署文档中的环境配置部分。

### C. 监控指标

| 指标 | 阈值 | 告警级别 |
|------|------|---------|
| CPU使用率 | > 90% | 严重 |
| 内存使用率 | > 90% | 严重 |
| 磁盘使用率 | > 90% | 严重 |
| API响应时间 | > 1s | 警告 |
| 错误率 | > 5% | 严重 |
| 数据库连接数 | > 80% | 警告 |
