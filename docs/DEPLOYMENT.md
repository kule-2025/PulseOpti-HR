# PulseOpti HR 脉策聚效 SaaS平台 - 部署文档

## 目录

- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [环境配置](#环境配置)
- [数据库初始化](#数据库初始化)
- [构建和部署](#构建和部署)
- [生产环境配置](#生产环境配置)
- [故障排查](#故障排查)

## 环境要求

### 必需环境

- **Node.js**: >= 24.x
- **pnpm**: >= 9.x
- **PostgreSQL**: >= 15.x
- **Redis**: >= 7.x (可选，用于缓存和会话管理)

### 推荐环境

- **CPU**: 4核+
- **内存**: 8GB+
- **存储**: 50GB+ SSD

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd pulse-opti-hr
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

创建 `.env.local` 文件：

```env
# 数据库配置
DATABASE_URL="postgresql://user:password@localhost:5432/pulse_opti_hr"
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pulse_opti_hr
DB_USER=user
DB_PASSWORD=password

# JWT配置
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# AI配置
DOUBAO_API_KEY=your-doubao-api-key
DOUBAO_MODEL=doubao-seed-1-8-251228

# 对象存储配置
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET=your-bucket-name
S3_ENDPOINT=https://your-s3-endpoint.com
S3_REGION=your-region

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=PulseOpti HR
NEXT_PUBLIC_SUPPORT_EMAIL=PulseOptiHR@163.com

# 日志级别
LOG_LEVEL=INFO
```

### 4. 初始化数据库

```bash
# 生成数据库迁移
pnpm db:generate

# 运行数据库迁移
pnpm db:migrate

# 初始化种子数据（可选）
pnpm db:seed
```

### 5. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:5000

## 环境配置

### 开发环境

```env
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/pulse_opti_hr_dev
LOG_LEVEL=DEBUG
```

### 生产环境

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@your-db-host:5432/pulse_opti_hr_prod
LOG_LEVEL=WARN
```

## 数据库初始化

### 1. 创建数据库

```sql
CREATE DATABASE pulse_opti_hr;
```

### 2. 运行迁移

```bash
pnpm drizzle-kit push:pg
```

### 3. 初始化基础数据

```bash
curl -X POST http://localhost:5000/api/init/database
```

## 构建和部署

### 1. 构建应用

```bash
pnpm build
```

### 2. 启动生产服务器

```bash
pnpm start
```

### 3. 使用 PM2 管理（推荐）

```bash
# 安装 PM2
pnpm add -g pm2

# 启动应用
pm2 start ecosystem.config.js

# 查看日志
pm2 logs

# 重启应用
pm2 restart pulse-opti-hr

# 停止应用
pm2 stop pulse-opti-hr
```

### 4. 使用 Docker 部署

创建 `Dockerfile`:

```dockerfile
FROM node:24-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm build

EXPOSE 5000

CMD ["pnpm", "start"]
```

构建和运行：

```bash
docker build -t pulse-opti-hr .
docker run -p 5000:5000 --env-file .env pulse-opti-hr
```

## 生产环境配置

### 1. 反向代理配置（Nginx）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. SSL配置

使用 Let's Encrypt：

```bash
sudo certbot --nginx -d your-domain.com
```

### 3. 数据库备份

创建备份脚本 `backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/pulse-opti-hr"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="pulse_opti_hr_prod"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
pg_dump $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# 压缩备份文件
gzip $BACKUP_DIR/backup_$DATE.sql

# 删除30天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

设置定时任务：

```bash
crontab -e

# 每天凌晨2点执行备份
0 2 * * * /path/to/backup.sh
```

### 4. 监控配置

使用健康检查：

```bash
curl http://localhost:5000/api/health
```

## 故障排查

### 1. 数据库连接失败

**症状**: 应用启动失败，日志显示数据库连接错误

**解决方案**:
- 检查数据库连接字符串是否正确
- 确认数据库服务是否运行
- 检查防火墙设置
- 验证数据库用户权限

### 2. API响应慢

**症状**: API请求响应时间过长

**解决方案**:
- 检查数据库查询性能
- 查看日志中的性能警告
- 添加数据库索引
- 启用Redis缓存

### 3. 内存占用过高

**症状**: 服务器内存占用持续增长

**解决方案**:
- 检查是否有内存泄漏
- 调整Node.js内存限制
- 优化数据库查询
- 启用数据库连接池

### 4. 日志查看

查看应用日志：

```bash
# PM2日志
pm2 logs pulse-opti-hr

# Docker日志
docker logs -f pulse-opti-hr

# 系统日志
tail -f /var/log/syslog
```

查看数据库日志：

```bash
tail -f /var/log/postgresql/postgresql-*.log
```

### 5. 性能优化

- 启用数据库连接池
- 使用CDN加速静态资源
- 启用HTTP/2
- 配置Redis缓存
- 优化数据库查询
- 启用Gzip压缩

## 联系方式

如有问题，请联系：

- 邮箱: PulseOptiHR@163.com
- 地址: 广州市天河区
- 服务时间: 周一至周五 9:00-12:00, 14:00-18:00
