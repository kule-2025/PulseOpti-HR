# PulseOpti HR - 完整环境变量配置文档

## 📌 概述

本文档列出了 PulseOpti HR 脉策聚效系统所需的所有环境变量及其详细说明。

---

## 🔑 核心配置

### 数据库配置

```env
# Neon PostgreSQL 数据库连接字符串
DATABASE_URL=postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**说明：**
- PostgreSQL 数据库连接字符串
- 必需：✅ 是
- 用途：连接 Neon PostgreSQL 数据库
- 格式：`postgresql://用户名:密码@主机:端口/数据库名?sslmode=require`

---

### JWT 认证配置

```env
# JWT 认证密钥
JWT_SECRET=a915ab35-9534-43ad-b925-d9102c5007ba-PulseOpti-HR-JWT-Secret-Key-2025-01-19-PROD

# JWT 过期时间
JWT_EXPIRES_IN=7d
```

**说明：**
- `JWT_SECRET`：用于签名和验证 JWT 令牌的密钥
- 必需：✅ 是
- 建议：使用强随机字符串，至少 32 字符
- `JWT_EXPIRES_IN`：令牌有效期，例如：`7d`（7天）、`24h`（24小时）

---

### 应用配置

```env
# 应用 URL（根据环境配置）
# 开发环境
NEXT_PUBLIC_APP_URL=http://localhost:5000
NODE_ENV=development

# 生产环境
# NEXT_PUBLIC_APP_URL=https://www.aizhixuan.com.cn
# NODE_ENV=production
```

**说明：**
- `NEXT_PUBLIC_APP_URL`：应用访问地址，前缀 `NEXT_PUBLIC_` 表示可在客户端访问
- 必需：✅ 是
- `NODE_ENV`：运行环境，`development` 或 `production`

---

### 超级管理员账号配置

```env
# 超级管理员账号
ADMIN_EMAIL=208343256@qq.com
ADMIN_PASSWORD=admin123

# 数据库初始化密钥
ADMIN_INIT_KEY=pulseopti-init-2025
```

**说明：**
- `ADMIN_EMAIL`：超级管理员邮箱地址
- `ADMIN_PASSWORD`：超级管理员登录密码
- `ADMIN_INIT_KEY`：用于生产环境数据库初始化的安全密钥
  - 必需：✅ 是（生产环境）
  - 用途：防止未经授权的数据库初始化操作
  - 使用场景：首次部署或重置数据库时调用 `/api/init`、`/api/init/database` 等接口
  - 建议：使用强随机字符串，至少 16 字符
  - 格式：字母数字组合，例如 `pulseopti-init-2025`

**重要提示：**
- 生产环境中务必修改默认密码 `admin123` 为强密码
- `ADMIN_INIT_KEY` 是生产环境初始化的关键密钥，请妥善保管

---

## 📧 邮件服务配置

### SMTP 邮件服务

```env
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=208343256@qq.com
SMTP_PASSWORD=xxwbcxaojrqwbjia
SMTP_FROM=PulseOpti HR <208343256@qq.com>
SMTP_NAME=PulseOpti HR 脉策聚效
```

**说明：**
- `SMTP_HOST`：SMTP 服务器地址
- `SMTP_PORT`：SMTP 服务器端口（通常是 587 或 465）
- `SMTP_SECURE`：是否使用 SSL/TLS（`false` 表示使用 STARTTLS）
- `SMTP_USER`：SMTP 登录用户名（通常是邮箱地址）
- `SMTP_PASSWORD`：SMTP 授权码（不是邮箱密码）
- `SMTP_FROM`：发件人地址
- `SMTP_NAME`：发件人名称

### 邮件服务开关

```env
EMAIL_PROVIDER=smtp
ENABLE_EMAIL_SERVICE=true
```

**说明：**
- `EMAIL_PROVIDER`：邮件服务提供商，可选值：`smtp`、`mock`
- `ENABLE_EMAIL_SERVICE`：是否启用邮件服务

---

## 📱 短信服务配置

```env
SMS_PROVIDER=mock
ENABLE_SMS_SERVICE=true
```

**说明：**
- `SMS_PROVIDER`：短信服务提供商，可选值：`mock`（开发环境）、`aliyun`、`tencent`
- `ENABLE_SMS_SERVICE`：是否启用短信服务

**注意：** 生产环境需配置真实的短信服务商（阿里云短信或腾讯云短信）

---

## 🤖 AI 服务配置

### 豆包大语言模型

```env
# 豆包大模型 API Key（工作负载身份）
COZE_WORKLOAD_IDENTITY_API_KEY=a915ab35-9534-43ad-b925-d9102c5007ba
```

**说明：**
- `COZE_WORKLOAD_IDENTITY_API_KEY`：豆包大模型 API Key
- 必需：✅ 是（如果使用 AI 功能）
- 用途：调用豆包大语言模型进行智能问答、简历解析等 AI 功能

---

## 🗄️ 对象存储配置

### AWS S3 兼容存储

```env
COZE_BUCKET_ENDPOINT_URL=https://s3.cn-beijing.amazonaws.com.cn
COZE_BUCKET_NAME=pulseopti-hr-storage
```

**说明：**
- `COZE_BUCKET_ENDPOINT_URL`：对象存储服务端点 URL
- `COZE_BUCKET_NAME`：存储桶名称
- 用途：存储简历文件、头像、文档等

---

## 💳 支付服务配置（可选）

### 微信支付

```env
WECHAT_PAY_APP_ID=wx1234567890abcdef
WECHAT_PAY_MCH_ID=1234567890
WECHAT_PAY_API_KEY=your-wechat-api-key-32chars
WECHAT_PAY_API_V3_KEY=your-wechat-api-v3-key-32chars
WECHAT_PAY_SERIAL_NO=your-wechat-serial-no
```

### 支付宝

```env
ALIPAY_APP_ID=2021001234567890
ALIPAY_PRIVATE_KEY=your-alipay-private-key
ALIPAY_PUBLIC_KEY=your-alipay-public-key
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do
```

**说明：**
- 支付服务配置为可选，仅在需要支付功能时配置
- 请根据实际申请的支付服务配置相应参数

---

## 🔒 飞书集成配置（可选）

```env
FEISHU_APP_ID=cli_xxxxxxxxxxxxxxxx
FEISHU_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FEISHU_ENCRYPT_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FEISHU_VERIFICATION_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**说明：**
- 用于飞书单点登录、组织架构同步等功能
- 可选配置

---

## 📊 日志配置

```env
LOG_LEVEL=debug
```

**说明：**
- 日志级别，可选值：`debug`、`info`、`warn`、`error`
- 开发环境推荐：`debug`
- 生产环境推荐：`info` 或 `warn`

---

## 📋 环境变量清单

### 必需环境变量（生产环境）

| 环境变量 | 说明 | 示例值 |
|----------|------|--------|
| `DATABASE_URL` | 数据库连接字符串 | `postgresql://...` |
| `JWT_SECRET` | JWT 认证密钥 | `a915ab35-...` |
| `JWT_EXPIRES_IN` | JWT 过期时间 | `7d` |
| `NEXT_PUBLIC_APP_URL` | 应用访问地址 | `https://www.aizhixuan.com.cn` |
| `NODE_ENV` | 运行环境 | `production` |
| `ADMIN_EMAIL` | 超级管理员邮箱 | `admin@example.com` |
| `ADMIN_PASSWORD` | 超级管理员密码 | `StrongPassword123!` |
| `ADMIN_INIT_KEY` | 数据库初始化密钥 | `pulseopti-init-2025` |
| `COZE_WORKLOAD_IDENTITY_API_KEY` | AI 服务 API Key | `a915ab35-...` |

### 可选环境变量

| 环境变量 | 说明 | 默认值 |
|----------|------|--------|
| `SMTP_HOST` | SMTP 服务器地址 | `smtp.qq.com` |
| `SMTP_PORT` | SMTP 端口 | `587` |
| `SMTP_SECURE` | 是否使用 SSL | `false` |
| `SMTP_USER` | SMTP 用户名 | - |
| `SMTP_PASSWORD` | SMTP 密码 | - |
| `SMTP_FROM` | 发件人地址 | - |
| `SMTP_NAME` | 发件人名称 | - |
| `EMAIL_PROVIDER` | 邮件服务提供商 | `smtp` |
| `ENABLE_EMAIL_SERVICE` | 是否启用邮件服务 | `true` |
| `SMS_PROVIDER` | 短信服务提供商 | `mock` |
| `ENABLE_SMS_SERVICE` | 是否启用短信服务 | `true` |
| `COZE_BUCKET_ENDPOINT_URL` | 对象存储端点 | `https://s3.cn-beijing.amazonaws.com.cn` |
| `COZE_BUCKET_NAME` | 存储桶名称 | `pulseopti-hr-storage` |
| `LOG_LEVEL` | 日志级别 | `info` |

---

## 🔐 安全建议

1. **密钥安全**
   - 所有密钥（`JWT_SECRET`、`ADMIN_INIT_KEY` 等）应使用强随机字符串
   - 建议使用在线工具生成安全的随机密钥

2. **密码安全**
   - `ADMIN_PASSWORD` 必须使用强密码（至少 12 位，包含大小写字母、数字、特殊字符）
   - 不要使用默认密码 `admin123`

3. **环境隔离**
   - 开发环境和生产环境使用不同的配置
   - 不要将生产环境的密钥提交到代码仓库

4. **定期轮换**
   - 定期更换敏感密钥（JWT、API Key 等）

---

## 🚀 Vercel 部署配置

在 Vercel Dashboard 中配置环境变量：

1. 访问项目设置：`Settings` → `Environment Variables`
2. 添加所有必需的环境变量
3. 根据环境（Production / Preview / Development）配置相应的值

**快速配置命令：**

```bash
# 使用 Vercel CLI 配置环境变量
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
vercel env add ADMIN_INIT_KEY production
# ... 添加其他环境变量
```

---

## 📝 常见问题

### Q: CLIENT_KEY 是什么？

A: 系统中没有 `CLIENT_KEY` 这个环境变量。如果您看到这个变量名，可能是：
1. 错误的变量名
2. 其他项目的配置
3. 应该是 `JWT_SECRET` 或 `ADMIN_INIT_KEY`

### Q: ADMIN_INIT_KEY 是必需的吗？

A: 在生产环境中，`ADMIN_INIT_KEY` 是必需的，用于：
- 首次部署时初始化数据库
- 调用 `/api/init`、`/api/init/database` 等初始化接口
- 防止未经授权的数据库初始化操作

### Q: 如何生成安全的密钥？

A: 可以使用以下方法生成随机密钥：

```bash
# 使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 使用 OpenSSL
openssl rand -hex 32

# 在线工具
# https://www.random.org/strings/
```

---

**文档版本：** v1.0
**更新时间：** 2025-01-19
**项目：** PulseOpti HR 脉策聚效
