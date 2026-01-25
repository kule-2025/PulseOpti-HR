# PulseOpti HR - Vercel 部署故障排查指南

## 📋 目录

1. [快速诊断](#快速诊断)
2. [常见问题分类](#常见问题分类)
3. [详细解决方案](#详细解决方案)
4. [诊断工具](#诊断工具)
5. [联系支持](#联系支持)

---

## 快速诊断

### 步骤 1：检查部署状态

访问 Vercel Dashboard：https://vercel.com/leyou-2026/pulseopti-hr/deployments

| 状态 | 说明 | 操作 |
|------|------|------|
| 🟢 Ready | 部署成功 | 检查应用功能 |
| 🔴 Error | 部署失败 | 查看错误日志 |
| 🟡 Building | 正在构建 | 等待构建完成 |
| 🟠 Canceled | 部署被取消 | 重新触发部署 |

### 步骤 2：查看错误日志

1. 点击失败的部署记录
2. 查看构建日志
3. 找到错误信息（通常以 `Error:` 开头）

### 步骤 3：对照常见问题

根据错误信息，在本文档中查找对应的解决方案。

---

## 常见问题分类

### 1. 环境变量问题

#### 症状
- 部署失败，提示 `Environment variable not defined`
- 登录失败，提示 `JWT_SECRET is not defined`
- 数据库连接失败，提示 `DATABASE_URL is not defined`

#### 原因
- 环境变量未配置
- 环境变量配置错误
- 环境变量未保存

#### 解决方案

**步骤 1：访问环境变量配置页面**
```
https://vercel.com/leyou-2026/pulseopti-hr/settings/environment-variables
```

**步骤 2：检查必需的环境变量**

确保以下环境变量已配置：

| 环境变量 | 必需 | 示例值 |
|----------|------|--------|
| `DATABASE_URL` | ✅ | `postgresql://...` |
| `JWT_SECRET` | ✅ | `your-secret-key` |
| `JWT_EXPIRES_IN` | ✅ | `7d` |
| `NEXT_PUBLIC_APP_URL` | ✅ | `https://www.aizhixuan.com.cn` |
| `NODE_ENV` | ✅ | `production` |
| `ADMIN_EMAIL` | ✅ | `208343256@qq.com` |
| `ADMIN_PASSWORD` | ✅ | `admin123` |
| `ADMIN_INIT_KEY` | ✅ | `pulseopti-init-2025` |
| `COZE_WORKLOAD_IDENTITY_API_KEY` | ✅ | `a915ab35-9534-43ad-b925-d9102c5007ba` |

**步骤 3：修复环境变量**

如果环境变量缺失：
1. 点击 **"Add New"**
2. 输入 Key 和 Value
3. 选择 Environment 为 **Production**
4. 点击 **"Save"**

如果环境变量错误：
1. 点击环境变量右侧的 **"..."**
2. 选择 **"Edit"**
3. 修改 Value
4. 点击 **"Save"**

**步骤 4：重新部署**

环境变量修改后必须重新部署：
1. 进入 **Deployments** 标签
2. 找到最新部署记录
3. 点击 **"..."** → **"Redeploy"**
4. 点击 **"Redeploy"** 确认

---

### 2. 数据库连接问题

#### 症状
- 登录失败，提示数据库连接错误
- 注册失败，提示数据库连接错误
- 数据加载失败，提示数据库连接错误

#### 原因
- `DATABASE_URL` 配置错误
- 数据库服务不可用
- 数据库连接数已满
- SSL 证书问题

#### 解决方案

**步骤 1：检查数据库 URL**

确认 `DATABASE_URL` 格式正确：

```
postgresql://username:password@host:port/database?sslmode=require
```

示例：
```
postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**步骤 2：测试数据库连接**

使用以下命令测试数据库连接：

```bash
# 使用 psql 测试
psql $DATABASE_URL -c "SELECT 1;"

# 或者使用 Node.js 测试
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT 1', (err, res) => {
  if (err) console.error('Database connection failed:', err);
  else console.log('Database connection successful');
  pool.end();
});
"
```

**步骤 3：检查数据库状态**

1. 访问 Neon Dashboard：https://console.neon.tech
2. 检查数据库实例状态
3. 检查连接数使用情况
4. 检查 CPU 和内存使用情况

**步骤 4：重启数据库实例**

如果数据库实例异常：
1. 在 Neon Dashboard 中找到数据库实例
2. 点击 **"Restart"**
3. 等待重启完成（通常 1-2 分钟）
4. 重新部署 Vercel 应用

---

### 3. JWT 认证问题

#### 症状
- 登录成功但 token 无效
- API 请求返回 401 Unauthorized
- 提示 `Invalid token` 或 `Token expired`

#### 原因
- `JWT_SECRET` 未配置
- `JWT_SECRET` 配置错误
- `JWT_EXPIRES_IN` 配置错误
- Token 已过期

#### 解决方案

**步骤 1：检查 JWT 配置**

确认以下环境变量已正确配置：

| 环境变量 | 值 |
|----------|-----|
| `JWT_SECRET` | `a915ab35-9534-43ad-b925-d9102c5007ba-PulseOpti-HR-JWT-Secret-Key-2025-01-19-PROD` |
| `JWT_EXPIRES_IN` | `7d` |

**步骤 2：重新登录**

JWT 配置修改后：
1. 清除浏览器 Cookie
2. 重新登录
3. 验证登录是否成功

**步骤 3：检查 JWT 代码**

确认 JWT 验证逻辑正确：

```typescript
// lib/jwt.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function generateToken(payload: any) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
```

---

### 4. 构建超时问题

#### 症状
- 部署失败，提示 `Build timeout exceeded`
- 构建过程中断

#### 原因
- 代码量太大（1030 个文件）
- 依赖太多
- 构建时间超过限制（默认 60 秒）

#### 解决方案

**步骤 1：增加构建超时时间**

1. 访问：https://vercel.com/leyou-2026/pulseopti-hr/settings/general
2. 找到 **Build & Development Settings**
3. 修改 **Build Timeout** 为 `300` 秒（5 分钟）
4. 点击 **"Save"**

**步骤 2：优化构建配置**

在 `next.config.js` 中添加优化配置：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 优化构建
  swcMinify: true,
  compress: true,
  
  // 减少构建时间
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false, // 不忽略 TypeScript 错误
  },
  
  // 优化输出
  output: 'standalone',
};

module.exports = nextConfig;
```

**步骤 3：清理依赖**

检查 `package.json`，移除不必要的依赖：

```bash
# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装依赖
pnpm install

# 提交更新
git add .
git commit -m "optimize build: clean dependencies"
git push origin main
```

---

### 5. 内存不足问题

#### 症状
- 构建失败，提示 `Process exited with signal 11`
- 运行时错误，提示 `JavaScript heap out of memory`

#### 原因
- Vercel Serverless Function 内存限制（默认 1GB）
- 代码占用内存过大
- 并发请求过多

#### 解决方案

**步骤 1：增加内存限制**

在 `vercel.json` 中增加内存限制：

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "memory": 2048
    }
  }
}
```

**步骤 2：优化代码**

优化内存使用：

```typescript
// 避免一次性加载大量数据
// ❌ 错误
const allUsers = await db.select().from(users);

// ✅ 正确：分页加载
const users = await db.select()
  .from(users)
  .limit(100)
  .offset(page * 100);

// 及时释放资源
if (stream) {
  stream.getTracks().forEach(track => track.stop());
}
```

**步骤 3：使用缓存**

使用 Redis 或内存缓存减少数据库查询：

```typescript
import { cache } from 'react';

export const getUsers = cache(async () => {
  return await db.select().from(users);
});
```

---

### 6. 环境变量未生效

#### 症状
- 环境变量已配置但应用读取不到
- 使用旧的环境变量值

#### 原因
- 环境变量未保存到 Production 环境
- 环境变量修改后未重新部署
- 环境变量名称错误（区分大小写）

#### 解决方案

**步骤 1：确认环境变量配置**

1. 访问：https://vercel.com/leyou-2026/pulseopti-hr/settings/environment-variables
2. 确认所有环境变量已添加到 **Production** 环境
3. 检查环境变量名称是否正确

**步骤 2：保存环境变量**

1. 点击 **"Save"** 按钮
2. 等待保存完成（通常 5-10 秒）

**步骤 3：重新部署**

环境变量修改后必须重新部署：

```bash
# 方法 1：推送新代码
git add .
git commit -m "trigger redeploy for env vars"
git push origin main

# 方法 2：在 Vercel Dashboard 中手动重新部署
# 进入 Deployments 标签 → 找到最新部署 → 点击 "..." → "Redeploy"
```

**步骤 4：验证环境变量**

在 API 中添加日志验证：

```typescript
// app/api/test-env/route.ts
export async function GET() {
  return Response.json({
    DATABASE_URL: process.env.DATABASE_URL ? '✓ Configured' : '✗ Not configured',
    JWT_SECRET: process.env.JWT_SECRET ? '✓ Configured' : '✗ Not configured',
    NODE_ENV: process.env.NODE_ENV,
  });
}
```

访问 `/api/test-env` 验证环境变量。

---

### 7. AI 功能无法使用

#### 症状
- AI 功能返回错误
- 提示 `COZE_WORKLOAD_IDENTITY_API_KEY is not defined`

#### 原因
- `COZE_WORKLOAD_IDENTITY_API_KEY` 未配置
- API Key 无效
- API 调用方式错误

#### 解决方案

**步骤 1：检查 API Key**

确认 `COZE_WORKLOAD_IDENTITY_API_KEY` 已配置：

```
COZE_WORKLOAD_IDENTITY_API_KEY=a915ab35-9534-43ad-b925-d9102c5007ba
```

**步骤 2：验证 API Key**

使用以下命令验证 API Key：

```bash
curl -X POST https://api.coze.com/v1/chat \
  -H "Authorization: Bearer $COZE_WORKLOAD_IDENTITY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "bot_id": "your_bot_id",
    "query": "Hello"
  }'
```

**步骤 3：检查 API 调用代码**

确认 API 调用代码正确：

```typescript
// lib/coze-sdk.ts
import { CozeClient } from '@coze-dev/sdk';

const client = new CozeClient({
  token: process.env.COZE_WORKLOAD_IDENTITY_API_KEY!,
});

export async function chatWithAI(message: string) {
  const response = await client.chat.stream({
    bot_id: process.env.COZE_BOT_ID!,
    additional_messages: [
      {
        role: 'user',
        content: message,
      },
    ],
  });

  return response;
}
```

---

### 8. 邮件发送失败

#### 症状
- 邮件发送失败，提示 SMTP 错误
- 验证邮件无法发送

#### 原因
- SMTP 配置错误
- SMTP 账号密码错误
- SMTP 服务器不可用

#### 解决方案

**步骤 1：检查 SMTP 配置**

确认以下环境变量已配置：

| 环境变量 | 说明 |
|----------|------|
| `SMTP_HOST` | SMTP 服务器地址 |
| `SMTP_PORT` | SMTP 端口（通常 587） |
| `SMTP_USER` | SMTP 用户名 |
| `SMTP_PASS` | SMTP 密码 |
| `SMTP_FROM` | 发件人邮箱 |

**步骤 2：测试 SMTP 连接**

使用以下命令测试 SMTP 连接：

```bash
telnet $SMTP_HOST $SMTP_PORT
```

或者使用 Node.js 测试：

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) console.error('SMTP connection failed:', error);
  else console.log('SMTP connection successful');
});
```

**步骤 3：检查邮件发送代码**

确认邮件发送代码正确：

```typescript
// lib/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM!,
    to,
    subject,
    html,
  });

  return info;
}
```

---

### 9. 支付功能无法使用

#### 症状
- 支付下单失败
- 支付回调失败
- 退款失败

#### 原因
- 支付配置错误
- 支付密钥错误
- 支付回调 URL 错误

#### 解决方案

**步骤 1：检查支付配置**

确认以下环境变量已配置：

| 环境变量 | 说明 |
|----------|------|
| `WECHAT_PAY_APP_ID` | 微信支付 App ID |
| `WECHAT_PAY_MCH_ID` | 微信支付商户号 |
| `WECHAT_PAY_API_KEY` | 微信支付 API Key |
| `ALIPAY_APP_ID` | 支付宝 App ID |
| `ALIPAY_PRIVATE_KEY` | 支付宝私钥 |
| `ALIPAY_PUBLIC_KEY` | 支付宝公钥 |

**步骤 2：检查回调 URL**

确认回调 URL 正确：

```
https://www.aizhixuan.com.cn/api/payment/callback
```

**步骤 3：测试支付功能**

使用沙箱环境测试支付功能：

1. 使用微信支付沙箱账号测试
2. 使用支付宝沙箱账号测试
3. 验证支付回调是否正常

---

### 10. 域名无法访问

#### 症状
- 自定义域名无法访问
- 提示 DNS_PROBE_POSSIBLE
- 提示 ERR_NAME_NOT_RESOLVED

#### 原因
- DNS 记录未配置
- DNS 记录配置错误
- DNS 传播未完成
- 证书未签发

#### 解决方案

**步骤 1：检查 DNS 记录**

在域名注册商处检查 DNS 记录：

| Type | Name | Value |
|------|------|-------|
| CNAME | www | cname.vercel-dns.com |
| CNAME | admin | cname.vercel-dns.com |

**步骤 2：检查 DNS 配置**

1. 访问：https://vercel.com/leyou-2026/pulseopti-hr/settings/domains
2. 查看域名状态
3. 确认 DNS 记录已配置

**步骤 3：等待 DNS 传播**

DNS 传播通常需要 5-10 分钟，最长 24 小时。

使用以下命令检查 DNS 解析：

```bash
# 检查 A 记录
dig www.aizhixuan.com.cn

# 检查 CNAME 记录
nslookup www.aizhixuan.com.cn
```

**步骤 4：检查证书状态**

1. 访问：https://vercel.com/leyou-2026/pulseopti-hr/settings/domains
2. 查看证书状态
3. 等待证书签发（通常 5-10 分钟）

---

## 诊断工具

### 工具 1：Vercel CLI

安装 Vercel CLI：

```bash
npm install -g vercel
```

使用 Vercel CLI 诊断：

```bash
# 登录 Vercel
vercel login

# 链接项目
vercel link

# 查看环境变量
vercel env ls

# 查看部署日志
vercel logs

# 本地部署测试
vercel
```

### 工具 2：Vercel Function Logs

1. 访问：https://vercel.com/leyou-2026/pulseopti-hr
2. 点击 **"Functions"** 标签
3. 查看函数日志

### 工具 3：浏览器控制台

按 `F12` 打开浏览器控制台：
- 查看 Console 标签（JavaScript 错误）
- 查看 Network 标签（API 请求）
- 查看 Application 标签（Cookie、LocalStorage）

### 工具 4：API 测试工具

使用以下工具测试 API：

```bash
# 测试登录
curl -X POST https://www.aizhixuan.com.cn/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "208343256@qq.com",
    "password": "admin123"
  }'

# 测试环境变量
curl https://www.aizhixuan.com.cn/api/test-env
```

---

## 联系支持

如果以上解决方案都无法解决问题，请联系支持：

1. **Vercel 支持**：https://vercel.com/support
2. **Neon 数据库支持**：https://neon.tech/support
3. **Coze AI 支持**：https://www.coze.com/support

---

## 📚 相关文档

- [完整环境变量配置](./ALL_ENV_VARIABLES.md)
- [部署详细步骤](./VERCEL_DEPLOYMENT_STEP_BY_STEP.md)
- [环境变量快速配置](./vercel-env-vars-copy.txt)
- [完整版本部署记录](./COMPLETE_VERSION_DEPLOYED.md)

---

## 💡 提示

1. **查看错误日志是解决问题的第一步**
2. **环境变量修改后必须重新部署**
3. **使用诊断工具可以快速定位问题**
4. **查阅官方文档可以获得更多帮助**

---

**文档版本：** v1.0
**更新时间：** 2025-01-19
**项目：** PulseOpti HR 脉策聚效
