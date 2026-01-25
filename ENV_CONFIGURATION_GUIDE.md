# PulseOpti HR 脉策聚效 - 环境变量完整配置指南

## 📋 目录
- [本地存储路径](#本地存储路径)
- [环境变量配置详解](#环境变量配置详解)
- [邮件服务配置](#邮件服务配置)
- [短信服务配置](#短信服务配置)
- [数据库配置](#数据库配置)
- [JWT认证配置](#jwt认证配置)
- [应用基础配置](#应用基础配置)
- [配置检查清单](#配置检查清单)

---

## 📁 本地存储路径

**Windows本地路径：**
```
C:\PulseOpti-HR\PulseOpti-HR
```

**目录结构：**
```
C:\PulseOpti-HR\PulseOpti-HR\
├── .env                    # 环境变量配置文件（敏感信息，不提交Git）
├── .env.example            # 环境变量示例文件
├── next.config.ts          # Next.js配置
├── package.json            # 项目依赖
├── drizzle.config.ts       # 数据库配置
├── vercel.json             # Vercel部署配置
├── src/                    # 源代码
│   ├── app/               # App Router页面
│   ├── components/        # 组件
│   ├── lib/               # 工具库
│   └── middleware.ts      # 中间件
├── public/                # 静态资源
└── docs/                  # 文档
```

---

## ⚙️ 环境变量配置详解

### 创建 .env 文件

在项目根目录创建 `.env` 文件：

```bash
cd C:\PulseOpti-HR\PulseOpti-HR
copy .env.example .env
```

**⚠️ 重要提醒：**
- `.env` 文件包含敏感信息，**绝对不要提交到Git仓库**
- 确保 `.env` 已添加到 `.gitignore` 文件
- 生产环境需要通过平台环境变量配置（如Vercel）

---

## 📧 邮件服务配置

### 方案一：Nodemailer + SMTP（推荐，免费且稳定）

**适用场景：**
- 个人项目、MVP阶段
- 不想开通云服务账号
- 快速验证邮件功能

#### 配置步骤：

1. **Gmail配置（推荐）**

   - 开启两步验证：https://myaccount.google.com/security
   - 生成应用专用密码：https://myaccount.google.com/apppasswords
   - 选择"邮件" → "其他（自定义名称）" → 生成密码

2. **环境变量配置：**

```env
# ========================================
# 邮件服务配置 - Gmail SMTP
# ========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # 生成的应用专用密码，不是Gmail登录密码
SMTP_FROM=PulseOpti HR <PulseOptiHR@163.com>
SMTP_NAME=PulseOpti HR 脉策聚效

# 功能开关
EMAIL_PROVIDER=smtp
ENABLE_EMAIL_SERVICE=true
```

#### 其他SMTP服务商配置：

**QQ邮箱：**
```env
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-qq@qq.com
SMTP_PASSWORD=your-authorization-code  # QQ邮箱授权码
SMTP_FROM=PulseOpti HR <PulseOptiHR@163.com>
SMTP_NAME=PulseOpti HR
```

**163邮箱：**
```env
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-username@163.com
SMTP_PASSWORD=your-authorization-code  # 163邮箱授权码
SMTP_FROM=PulseOpti HR <PulseOptiHR@163.com>
SMTP_NAME=PulseOpti HR
```

**获取163邮箱授权码：**
1. 登录163邮箱 → 设置 → POP3/SMTP/IMAP
2. 开启"IMAP/SMTP服务"
3. 生成"授权码"

---

### 方案二：阿里云邮件推送（企业级）

**适用场景：**
- 企业级应用
- 需要高可靠性和发送量限制
- 已有阿里云账号

#### 配置步骤：

1. **开通阿里云邮件推送服务**
   - 访问：https://www.aliyun.com/product/directmail
   - 购买免费版（每天200封）或付费版

2. **创建发信域名**
   - 添加域名（如 yourdomain.com）
   - 配置DNS解析（TXT、CNAME记录）

3. **创建发信地址**
   - 验证发信域名后，创建发信地址

4. **获取AccessKey**
   - 访问：https://ram.console.aliyun.com/manage/ak
   - 创建AccessKey（推荐使用RAM子账号）

5. **环境变量配置：**

```env
# ========================================
# 邮件服务配置 - 阿里云邮件推送
# ========================================
ALIYUN_ACCESS_KEY_ID=LTAI5txxxxxxxxxxxxxx
ALIYUN_ACCESS_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxx
ALIYUN_REGION=cn-hangzhou
ALIYUN_MAIL_ACCOUNT_NAME=service@yourdomain.com
ALIYUN_MAIL_ALIAS=PulseOpti HR

# 功能开关
EMAIL_PROVIDER=aliyun
ENABLE_EMAIL_SERVICE=true
```

---

### 方案三：腾讯云邮件（企业级）

**适用场景：**
- 企业级应用
- 已有腾讯云账号
- 需要高可靠性

#### 配置步骤：

1. **开通腾讯云邮件服务**
   - 访问：https://cloud.tencent.com/product/ses
   - 购买免费版或付费版

2. **创建发信域名**
   - 配置DNS验证

3. **获取API密钥**
   - 访问：https://console.cloud.tencent.com/cam/capi

4. **环境变量配置：**

```env
# ========================================
# 邮件服务配置 - 腾讯云邮件
# ========================================
TENCENT_SECRET_ID=AKIDxxxxxxxxxxxxxxxxxxxxxx
TENCENT_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxx
TENCENT_REGION=ap-guangzhou
TENCENT_MAIL_FROM=service@yourdomain.com
TENCENT_MAIL_FROM_NAME=PulseOpti HR

# 功能开关
EMAIL_PROVIDER=tencent
ENABLE_EMAIL_SERVICE=true
```

---

## 📱 短信服务配置

### 方案一：阿里云短信（推荐）

**适用场景：**
- 国内短信发送
- 企业级应用
- 已有阿里云账号

#### 配置步骤：

1. **开通阿里云短信服务**
   - 访问：https://www.aliyun.com/product/sms
   - 购买短信套餐（免费版每月100条）

2. **添加签名和模板**
   - 签名：`PulseOpti HR` 或 `脉策聚效`
   - 模板：验证码模板
     ```
     验证码：${code}，您正在进行登录操作，5分钟内有效，请勿泄露给他人。
     ```

3. **获取AccessKey**
   - 与邮件服务使用相同的AccessKey
   - 推荐使用RAM子账号，只授权短信服务权限

4. **环境变量配置：**

```env
# ========================================
# 短信服务配置 - 阿里云短信
# ========================================
ALIYUN_SMS_ACCESS_KEY_ID=LTAI5txxxxxxxxxxxxxx
ALIYUN_SMS_ACCESS_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxx
ALIYUN_SMS_REGION=cn-hangzhou
ALIYUN_SMS_SIGN_NAME=PulseOpti HR
ALIYUN_SMS_TEMPLATE_CODE=SMS_123456789  # 阿里云短信模板CODE

# 功能开关
SMS_PROVIDER=aliyun
ENABLE_SMS_SERVICE=true
```

**MVP阶段配置（0成本）：**
```env
# 开发环境使用固定验证码，不调用真实短信服务
SMS_PROVIDER=mock
ENABLE_SMS_SERVICE=true
```

---

### 方案二：腾讯云短信

**适用场景：**
- 国内短信发送
- 已有腾讯云账号

#### 配置步骤：

1. **开通腾讯云短信服务**
   - 访问：https://cloud.tencent.com/product/sms

2. **创建应用**
   - 获取SDK AppID

3. **添加签名和模板**
   - 签名：`PulseOptiHR`
   - 模板：验证码模板

4. **获取API密钥**
   - 访问：https://console.cloud.tencent.com/cam/capi

5. **环境变量配置：**

```env
# ========================================
# 短信服务配置 - 腾讯云短信
# ========================================
TENCENT_SMS_SECRET_ID=AKIDxxxxxxxxxxxxxxxxxxxxxx
TENCENT_SMS_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxx
TENCENT_SMS_REGION=ap-guangzhou
TENCENT_SMS_SDK_APP_ID=1400123456  # 腾讯云短信应用ID
TENCENT_SMS_SIGN_NAME=PulseOptiHR
TENCENT_SMS_TEMPLATE_ID=123456

# 功能开关
SMS_PROVIDER=tencent
ENABLE_SMS_SERVICE=true
```

---

### 方案三：网易云信

**适用场景：**
- 国内短信发送
- 已有网易云信账号

#### 环境变量配置：

```env
# ========================================
# 短信服务配置 - 网易云信
# ========================================
WY_SMS_APP_KEY=your-wy-app-key
WY_SMS_APP_SECRET=your-wy-app-secret
WY_SMS_TEMPLATE_CODE=123456
WY_SMS_CODE_LENGTH=6

# 功能开关
SMS_PROVIDER=wy
ENABLE_SMS_SERVICE=true
```

---

## 🗄️ 数据库配置

### Neon PostgreSQL（推荐）

**适用场景：**
- 生产环境
- 需要高可用性
- Serverless架构

#### 配置步骤：

1. **创建Neon账号**
   - 访问：https://neon.tech
   - 使用GitHub或邮箱注册

2. **创建项目**
   - 点击"Create Project"
   - 选择区域（推荐：Hong Kong 或 Singapore）
   - 设置数据库名称：`pulsoptihr`

3. **获取连接字符串**
   - 进入项目 → SQL Editor
   - 复制Connection String

4. **环境变量配置：**

```env
# ========================================
# 数据库配置 - Neon PostgreSQL
# ========================================
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/pulsoptihr?sslmode=require

# 使用连接池优化性能（推荐）
DATABASE_URL=postgres://username:password@ep-cool-xxx.aws.neon.tech/pulsoptihr?pgbouncer=true
```

**参数说明：**
- `username`: 数据库用户名
- `password`: 数据库密码
- `ep-xxx.us-east-2.aws.neon.tech`: Neon服务器地址
- `pulsoptihr`: 数据库名称
- `sslmode=require`: 强制SSL连接
- `pgbouncer=true`: 启用连接池（提升性能）

---

### 本地PostgreSQL

**适用场景：**
- 开发环境
- 不依赖云服务

#### 安装步骤：

1. **下载PostgreSQL**
   - 访问：https://www.postgresql.org/download/windows/
   - 下载并安装PostgreSQL 16

2. **创建数据库**

```sql
-- 使用pgAdmin或命令行工具
CREATE DATABASE pulsoptihr;
```

3. **环境变量配置：**

```env
DATABASE_URL=postgresql://postgres:your-password@localhost:5432/pulsoptihr?sslmode=disable
```

---

## 🔐 JWT认证配置

**JWT（JSON Web Token）用于用户认证和授权**

### 环境变量配置：

```env
# ========================================
# JWT认证配置
# ========================================
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-1234567890
JWT_EXPIRES_IN=7d
```

**参数说明：**
- `JWT_SECRET`: JWT密钥（必须保密，建议使用随机字符串）
- `JWT_EXPIRES_IN`: Token过期时间
  - `1h`: 1小时
  - `1d`: 1天
  - `7d`: 7天
  - `30d`: 30天

**生成安全密钥：**

```bash
# 使用Node.js生成随机密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**示例输出：**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1
```

---

## 🌐 应用基础配置

### 环境变量配置：

```env
# ========================================
# 应用配置
# ========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# 生产环境
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
NODE_ENV=production
```

**参数说明：**
- `NEXT_PUBLIC_APP_URL`: 应用访问地址（前端可访问）
  - 开发环境：`http://localhost:3000`
  - 生产环境：`https://pulseopti-hr.vercel.app`
- `NODE_ENV`: 运行环境
  - `development`: 开发环境
  - `production`: 生产环境

---

## 🤖 AI集成配置（豆包大语言模型）

### 环境变量配置：

```env
# ========================================
# AI集成配置 - 豆包大语言模型
# ========================================
COZE_API_KEY=your-coze-api-key-here

# 如果使用代理（可选）
COZE_API_BASE_URL=https://your-proxy.com
```

**获取COZE API Key：**
1. 访问：https://www.coze.cn
2. 登录并创建应用
3. 获取API Key

---

## 📦 对象存储配置（S3兼容）

### 环境变量配置：

```env
# ========================================
# 对象存储配置 - AWS S3或兼容服务
# ========================================
S3_ACCESS_KEY_ID=your-access-key-id
S3_SECRET_ACCESS_KEY=your-secret-access-key
S3_REGION=us-east-1
S3_BUCKET=your-bucket-name
S3_ENDPOINT=https://s3.amazonaws.com

# 阿里云OSS
S3_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com

# 腾讯云COS
S3_ENDPOINT=https://cos.ap-guangzhou.myqcloud.com
```

---

## 💳 支付服务配置

### 微信支付

```env
# ========================================
# 微信支付配置
# ========================================
WECHAT_PAY_APP_ID=wx1234567890abcdef
WECHAT_PAY_MCH_ID=1234567890
WECHAT_PAY_API_KEY=your-wechat-api-key-32chars
WECHAT_PAY_API_V3_KEY=your-wechat-api-v3-key-32chars
WECHAT_PAY_SERIAL_NO=your-wechat-serial-no
```

### 支付宝

```env
# ========================================
# 支付宝配置
# ========================================
ALIPAY_APP_ID=2021001234567890
ALIPAY_PRIVATE_KEY=your-alipay-private-key
ALIPAY_PUBLIC_KEY=your-alipay-public-key
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do
```

---

## 📝 日志级别配置

```env
# ========================================
# 日志级别配置
# ========================================
LOG_LEVEL=info

# 可选值：
# error: 只输出错误日志
# warn: 输出警告和错误日志
# info: 输出信息、警告和错误日志（默认）
# debug: 输出所有日志（仅开发环境）
```

---

## ✅ 配置检查清单

### 必需配置（本地开发）

- [ ] 数据库连接（DATABASE_URL）
- [ ] JWT密钥（JWT_SECRET）
- [ ] 应用URL（NEXT_PUBLIC_APP_URL）
- [ ] 运行环境（NODE_ENV）

### 可选配置（根据功能需求）

- [ ] 邮件服务（SMTP 或 云服务）
  - [ ] 选择邮件提供商（EMAIL_PROVIDER）
  - [ ] 配置SMTP或云服务密钥
  - [ ] 启用邮件服务（ENABLE_EMAIL_SERVICE）

- [ ] 短信服务（云服务或Mock）
  - [ ] 选择短信提供商（SMS_PROVIDER）
  - [ ] 配置云服务密钥或使用Mock模式
  - [ ] 启用短信服务（ENABLE_SMS_SERVICE）

- [ ] AI集成（COZE_API_KEY）
- [ ] 对象存储（S3配置）
- [ ] 支付服务（微信支付/支付宝）

### MVP阶段最小配置

```env
# 最小配置文件（MVP阶段）
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/pulsoptihr?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# 邮件服务（Gmail SMTP）
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=PulseOpti HR <PulseOptiHR@163.com>
SMTP_NAME=PulseOpti HR
ENABLE_EMAIL_SERVICE=true

# 短信服务（Mock模式，0成本）
SMS_PROVIDER=mock
ENABLE_SMS_SERVICE=true
```

---

## 🔧 配置验证

### 验证数据库连接

```bash
cd C:\PulseOpti-HR\PulseOpti-HR
pnpm run db:studio
```

访问：http://localhost:4983

### 验证环境变量加载

```bash
cd C:\PulseOpti-HR\PulseOpti-HR
pnpm run dev
```

查看控制台输出，确认环境变量加载成功。

### 测试邮件发送

访问：http://localhost:3000/register
点击"获取验证码"，检查是否收到邮件。

### 测试短信发送（Mock模式）

访问：http://localhost:3000/register
输入手机号，点击"获取验证码"
使用固定验证码：`123456`

---

## 📞 联系支持

如遇配置问题，请联系：

- **邮箱**: PulseOptiHR@163.com
- **地址**: 广州市天河区

---

## 📚 相关文档

- [CMD执行步骤指南](CMD_EXECUTION_GUIDE.md)
- [部署快速开始](QUICKSTART.md)
- [数据库迁移指南](NEON_DATABASE_SETUP.md)
- [部署检查清单](DEPLOYMENT_CHECKLIST.md)

---

**最后更新时间：** 2025-01-11
**文档版本：** v1.0
