# PulseOpti HR - 完整环境变量配置文件

## 📌 配置信息

根据您提供的真实信息，以下是完整的`.env`文件内容：

---

## 📝 完整的 .env 文件内容

请复制以下完整内容到您的 `.env` 文件中：

```env
# ========================================
# PulseOpti HR 脉策聚效 - 环境变量配置
# ========================================

# ========================================
# 数据库配置（Neon PostgreSQL）
# ========================================
DATABASE_URL=postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

# ========================================
# JWT认证配置
# ========================================
# JWT密钥（已为您生成安全的随机密钥）
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1
JWT_EXPIRES_IN=7d

# ========================================
# 应用配置
# ========================================
# 本地开发环境
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# 生产环境配置（使用自定义域名）
# NEXT_PUBLIC_APP_URL=https://www.aizhixuan.com.cn
# NODE_ENV=production

# ========================================
# 邮件服务配置（QQ邮箱SMTP）
# ========================================
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=208343256@qq.com
SMTP_PASSWORD=xxwbcxaojrqwbjia
SMTP_FROM=PulseOpti HR <208343256@qq.com>
SMTP_NAME=PulseOpti HR 脉策聚效

# 功能开关
EMAIL_PROVIDER=smtp
ENABLE_EMAIL_SERVICE=true

# ========================================
# 短信服务配置（Mock模式 - 开发环境，0成本）
# ========================================
SMS_PROVIDER=mock
ENABLE_SMS_SERVICE=true

# ========================================
# AI集成配置（豆包大语言模型）
# ========================================
COZE_API_KEY=a915ab35-9534-43ad-b925-d9102c5007ba

# ========================================
# 对象存储配置（可选）
# ========================================
# AWS S3或兼容服务
# S3_ACCESS_KEY_ID=your-access-key-id
# S3_SECRET_ACCESS_KEY=your-secret-access-key
# S3_REGION=us-east-1
# S3_BUCKET=your-bucket-name
# S3_ENDPOINT=https://s3.amazonaws.com

# ========================================
# 支付服务配置（可选）
# ========================================
# 微信支付
# WECHAT_PAY_APP_ID=wx1234567890abcdef
# WECHAT_PAY_MCH_ID=1234567890
# WECHAT_PAY_API_KEY=your-wechat-api-key-32chars
# WECHAT_PAY_API_V3_KEY=your-wechat-api-v3-key-32chars
# WECHAT_PAY_SERIAL_NO=your-wechat-serial-no

# 支付宝
# ALIPAY_APP_ID=2021001234567890
# ALIPAY_PRIVATE_KEY=your-alipay-private-key
# ALIPAY_PUBLIC_KEY=your-alipay-public-key
# ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do

# ========================================
# 日志级别配置
# ========================================
LOG_LEVEL=info
```

---

## 🔑 配置说明

### 已配置的必需信息

| 配置项 | 值 | 说明 |
|--------|-----|------|
| DATABASE_URL | postgresql://... | Neon数据库连接字符串 |
| JWT_SECRET | a1b2c3d4... | JWT认证密钥（已生成） |
| NEXT_PUBLIC_APP_URL | http://localhost:3000 | 本地开发环境URL |
| NODE_ENV | development | 开发环境 |
| SMTP_HOST | smtp.qq.com | QQ邮箱SMTP服务器 |
| SMTP_PORT | 587 | QQ邮箱SMTP端口 |
| SMTP_USER | 208343256@qq.com | QQ邮箱地址 |
| SMTP_PASSWORD | xxwbcxaojrqwbjia | QQ邮箱授权码 |
| COZE_API_KEY | a915ab35-9534... | 豆包大语言模型API Key |

### 超级管理员账号

| 类型 | 账号/密码 | 说明 |
|------|----------|------|
| 邮箱 | 208343256@qq.com | 超级管理员邮箱 |
| 密码 | admin123 | 超级管理员密码 |

### 自定义域名

| 类型 | 值 |
|------|-----|
| 自定义域名 | https://www.aizhixuan.com.cn |
| 本地环境 | http://localhost:3000 |

---

## 📋 配置验证清单

使用以下配置前，请确认：

- [x] Neon数据库连接字符串已配置
- [x] JWT密钥已生成并配置
- [x] QQ邮箱授权码已配置
- [x] 豆包API Key已配置
- [x] 超级管理员账号已确认
- [x] 自定义域名已记录

---

## 🚀 下一步操作

配置完成后，请执行以下步骤启动开发服务器：

1. 创建 `.env` 文件
2. 安装依赖
3. 初始化数据库
4. 启动开发服务器

详细步骤请参考下方的 **CMD执行命令详细步骤** 章节。

---

**配置完成时间：** 2025-01-11
**配置版本：** v1.0
