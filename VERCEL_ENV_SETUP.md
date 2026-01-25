# ========================================
# Vercel 环境变量配置指南
# ========================================

## 📝 步骤说明

### 1. 登录 Vercel 控制台
访问：https://vercel.com/dashboard

### 2. 进入项目设置
- 找到项目 `PulseOpti-HR`
- 点击进入项目
- 点击顶部的 "Settings" 标签

### 3. 添加环境变量
- 点击左侧菜单的 "Environment Variables"
- 点击 "Add New" 添加每个环境变量

### 4. 环境变量列表

**核心配置（必须）**

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `COZE_WORKLOAD_IDENTITY_API_KEY` | `a915ab35-9534-43ad-b925-d9102c5007ba` | Production |
| `COZE_BUCKET_ENDPOINT_URL` | `https://s3.cn-beijing.amazonaws.com.cn` | Production |
| `COZE_BUCKET_NAME` | `pulseopti-hr-storage` | Production |

**数据库配置（必须）**

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require` | Production |

**JWT认证配置（必须）**

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `JWT_SECRET` | `a915ab35-9534-43ad-b925-d9102c5007ba-PulseOpti-HR-JWT-Secret-Key-2025-01-19-PROD` | Production |
| `JWT_EXPIRES_IN` | `7d` | Production |

**应用配置（必须）**

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `NEXT_PUBLIC_APP_URL` | `https://www.aizhixuan.com.cn` | Production |
| `NODE_ENV` | `production` | Production |

**邮件服务配置（可选）**

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `SMTP_HOST` | `smtp.qq.com` | Production |
| `SMTP_PORT` | `587` | Production |
| `SMTP_SECURE` | `false` | Production |
| `SMTP_USER` | `208343256@qq.com` | Production |
| `SMTP_PASSWORD` | `xxwbcxaojrqwbjia` | Production |
| `SMTP_FROM` | `PulseOpti HR <PulseOptiHR@163.com>` | Production |
| `SMTP_NAME` | `PulseOpti HR 脉策聚效` | Production |
| `EMAIL_PROVIDER` | `smtp` | Production |
| `ENABLE_EMAIL_SERVICE` | `true` | Production |

**超级管理员账号（必须）**

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `ADMIN_EMAIL` | `208343256@qq.com` | Production |
| `ADMIN_PASSWORD` | `admin123` | Production |

**短信服务配置（可选，Mock模式）**

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `SMS_PROVIDER` | `mock` | Production |
| `ENABLE_SMS_SERVICE` | `true` | Production |

**日志配置（可选）**

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `LOG_LEVEL` | `info` | Production |

### 5. 环境选择
- 对于所有环境变量，确保选中 "Production"、"Preview" 和 "Development" 环境
- 或者只为 "Production" 环境添加（推荐）

### 6. 保存并重新部署
- 添加完所有环境变量后，点击顶部的 "Deployments" 标签
- 点击最新的部署记录右侧的 "..." 菜单
- 选择 "Redeploy"
- 等待部署完成

## ⚠️ 注意事项

1. **敏感信息保护**：
   - 不要在前端代码中使用这些环境变量
   - 只有 `NEXT_PUBLIC_` 开头的变量可以在前端访问

2. **变量值验证**：
   - `DATABASE_URL` 必须是有效的 PostgreSQL 连接字符串
   - `JWT_SECRET` 建议使用强随机字符串
   - 邮件和短信服务的配置需要先在对应平台开通服务

3. **部署失败排查**：
   - 如果仍然失败，检查环境变量是否正确设置
   - 查看Vercel部署日志，确认具体错误信息
   - 确保数据库连接字符串有效

## 🔧 故障排除

### 错误：API key is required
**原因**：缺少 `COZE_WORKLOAD_IDENTITY_API_KEY` 环境变量
**解决**：添加该环境变量并重新部署

### 错误：Connection refused
**原因**：数据库连接失败
**解决**：检查 `DATABASE_URL` 是否正确，数据库是否可访问

### 错误：Invalid JWT
**原因**：JWT密钥配置错误
**解决**：检查 `JWT_SECRET` 和 `JWT_EXPIRES_IN` 配置

## 📚 参考文档

- [Vercel 环境变量文档](https://vercel.com/docs/projects/environment-variables)
- [Next.js 环境变量文档](https://nextjs.org/docs/basic-features/environment-variables)
