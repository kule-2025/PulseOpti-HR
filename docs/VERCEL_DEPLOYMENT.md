# Vercel 部署指南

本文档指导如何将 PulseOpti HR 项目部署到 Vercel 生产环境。

## 目录

- [前置准备](#前置准备)
- [环境变量配置](#环境变量配置)
- [数据库设置](#数据库设置)
- [对象存储配置](#对象存储配置)
- [部署步骤](#部署步骤)
- [部署后配置](#部署后配置)
- [故障排查](#故障排查)

---

## 前置准备

### 1. 必需账户

- [Vercel 账户](https://vercel.com/signup)
- [GitHub 账户](https://github.com/signup)
- [Neon 数据库账户](https://neon.tech/signup)
- 对象存储服务账户（AWS S3 或兼容服务）

### 2. 安装 Vercel CLI

```bash
npm install -g vercel
```

### 3. 登录 Vercel

```bash
vercel login
```

---

## 环境变量配置

在 Vercel 项目设置中配置以下环境变量：

### 核心配置

| 变量名 | 说明 | 示例值 | 是否必需 |
|--------|------|--------|----------|
| `NODE_ENV` | 运行环境 | `production` | 是 |
| `NEXT_PUBLIC_API_URL` | API URL | `https://pulseopti-hr.vercel.app` | 是 |
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://...` | 是 |
| `JWT_SECRET` | JWT 签名密钥 | 随机字符串（至少32位） | 是 |
| `JWT_EXPIRES_IN` | JWT 过期时间 | `7d` | 是 |

### 数据库配置

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `DATABASE_URL` | Neon PostgreSQL 连接字符串 | `postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require` |

### 对象存储配置

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `S3_ENDPOINT` | S3 兼容端点 | `https://s3.amazonaws.com` |
| `S3_ACCESS_KEY_ID` | 访问密钥 ID | `AKIAIOSFODNN7EXAMPLE` |
| `S3_SECRET_ACCESS_KEY` | 访问密钥 | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `S3_BUCKET` | 存储桶名称 | `pulseopti-hr` |
| `S3_REGION` | 区域 | `us-east-1` |

### AI 服务配置

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `DOUBAO_API_KEY` | 豆包 API 密钥 | `your-api-key` |
| `DOUBAO_API_BASE` | 豆包 API 基础 URL | `https://ark.cn-beijing.volces.com/api/v3` |

### 邮件和短信配置

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `SMTP_HOST` | SMTP 服务器地址 | `smtp.example.com` |
| `SMTP_PORT` | SMTP 端口 | `587` |
| `SMTP_USER` | SMTP 用户名 | `noreply@pulseopti-hr.com` |
| `SMTP_PASS` | SMTP 密码 | `your-smtp-password` |
| `SMTP_FROM` | 发件人 | `PulseOpti HR <noreply@pulseopti-hr.com>` |
| `SMS_ACCESS_KEY` | 短信访问密钥 | `your-sms-access-key` |
| `SMS_SECRET_KEY` | 短信密钥 | `your-sms-secret-key` |
| `SMS_SIGN_NAME` | 短信签名 | `PulseOptiHR` |

---

## 数据库设置

### 1. 创建 Neon 数据库

1. 访问 [Neon Console](https://console.neon.tech)
2. 创建新项目
3. 选择区域（推荐 `AWS ap-east-1` 或离用户最近的区域）
4. 获取连接字符串

### 2. 执行数据库迁移

```bash
# 下载迁移脚本
curl -o migration.sql https://raw.githubusercontent.com/your-repo/main/database/migrations/001_initial_schema.sql

# 执行迁移
psql $DATABASE_URL < migration.sql
```

或使用 Vercel CLI：

```bash
vercel env pull .env.local
psql $DATABASE_URL < database/migrations/001_initial_schema.sql
```

---

## 对象存储配置

### 1. 创建 S3 存储桶

以 AWS S3 为例：

1. 访问 [AWS S3 Console](https://console.aws.amazon.com/s3/)
2. 创建新存储桶（名称：`pulseopti-hr`）
3. 配置权限策略（允许必要的读写操作）
4. 生成访问密钥

### 2. 配置 CORS

在存储桶的 CORS 配置中添加：

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
    "AllowedOrigins": ["https://pulseopti-hr.vercel.app"],
    "ExposeHeaders": ["ETag"]
  }
]
```

---

## 部署步骤

### 1. 准备代码

```bash
# 克隆项目
git clone https://github.com/your-username/pulseopti-hr.git
cd pulseopti-hr

# 安装依赖
pnpm install

# 运行测试
node scripts/test-all.js
```

### 2. 连接到 Vercel

```bash
# 初始化 Vercel 项目
vercel

# 按提示配置：
# - 链接到现有项目或创建新项目
# - 配置构建命令：pnpm build
# - 配置输出目录：.next
```

### 3. 配置环境变量

```bash
# 在 Vercel Dashboard 中配置环境变量
# 或使用 CLI
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
# ... 其他环境变量
```

### 4. 部署到生产环境

```bash
# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod
```

### 5. 验证部署

```bash
# 检查部署状态
vercel ls

# 访问网站
open https://pulseopti-hr.vercel.app

# 检查健康端点
curl https://pulseopti-hr.vercel.app/api/health
```

---

## 部署后配置

### 1. 配置域名

1. 在 Vercel Dashboard 中添加自定义域名
2. 配置 DNS 记录（CNAME 或 A 记录）
3. 等待 SSL 证书自动签发

### 2. 配置监控和告警

在 Vercel Dashboard 中配置：

- **Log Drains**: 集成日志服务（如 Datadog、Sentry）
- **Alerts**: 配置告警规则（错误率、响应时间）
- **Analytics**: 启用 Vercel Analytics

### 3. 设置定时任务

如果需要定时任务，可以使用：

- **Vercel Cron Jobs**: 配置 cron.yaml 文件
- **外部服务**: 使用 GitHub Actions 或第三方 cron 服务

示例 `cron.yaml`:

```yaml
crons:
  - name: daily-backup
    path: /api/cron/backup
    schedule: "0 2 * * *"  # 每天凌晨 2 点
```

### 4. 配置缓存策略

在 `vercel.json` 中配置：

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, must-revalidate"
        }
      ]
    },
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 故障排查

### 1. 构建失败

**症状**: 构建过程中出现错误

**解决方案**:
- 检查 Node.js 版本是否匹配（建议使用 Node.js 18+）
- 检查依赖是否正确安装：`pnpm install`
- 查看构建日志，定位具体错误

```bash
# 本地构建测试
pnpm build
```

### 2. 环境变量问题

**症状**: 运行时出现环境变量未定义错误

**解决方案**:
```bash
# 检查环境变量是否已设置
vercel env ls

# 拉取环境变量到本地测试
vercel env pull .env.local

# 重新部署
vercel --prod
```

### 3. 数据库连接失败

**症状**: 无法连接到数据库

**解决方案**:
- 检查 `DATABASE_URL` 是否正确
- 确认数据库已运行且允许远程连接
- 检查网络连接和防火墙设置

```bash
# 测试数据库连接
psql $DATABASE_URL -c "SELECT 1"
```

### 4. 性能问题

**症状**: 响应时间过长

**解决方案**:
- 启用 Vercel Edge Network
- 配置适当的缓存策略
- 优化数据库查询
- 使用 CDN 加速静态资源

### 5. SSL 证书问题

**症状**: HTTPS 访问失败

**解决方案**:
- 等待证书自动签发（通常 1-2 分钟）
- 检查 DNS 记录是否正确
- 在 Vercel Dashboard 中强制刷新证书

---

## 监控和维护

### 日志查看

```bash
# 查看实时日志
vercel logs

# 查看生产环境日志
vercel logs --prod

# 过滤日志
vercel logs --filter "error"
```

### 性能监控

- Vercel Analytics
- Vercel Speed Insights
- 自定义性能指标（在代码中集成）

### 备份策略

建议定期备份数据库：

```bash
# 使用备份脚本
node scripts/backup-restore.js backup
```

---

## 更新和维护

### 更新流程

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 运行测试
pnpm test

# 3. 构建测试
pnpm build

# 4. 部署到预览环境
vercel

# 5. 测试预览环境

# 6. 部署到生产环境
vercel --prod
```

### 回滚

```bash
# 列出部署历史
vercel ls

# 回滚到特定部署
vercel rollback <deployment-url>
```

---

## 联系方式

如有问题，请联系：

- 邮箱：PulseOptiHR@163.com
- 地址：广州市天河区
- 服务时间：周一至周五 9:00-12:00, 14:00-18:00

---

## 附录

### 常用命令

```bash
# 部署
vercel                          # 部署到预览环境
vercel --prod                   # 部署到生产环境

# 环境变量
vercel env ls                   # 列出环境变量
vercel env add <key>            # 添加环境变量
vercel env remove <key>         # 删除环境变量
vercel env pull .env.local      # 拉取环境变量

# 日志
vercel logs                     # 查看实时日志
vercel logs --prod              # 查看生产环境日志

# 域名
vercel domains add <domain>     # 添加域名
vercel domains ls               # 列出域名

# 项目
vercel ls                       # 列出项目
vercel inspect                  # 查看项目详情
```

### 资源链接

- [Vercel 文档](https://vercel.com/docs)
- [Neon 文档](https://neon.tech/docs)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
