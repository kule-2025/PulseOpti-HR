# PulseOpti HR 脉策聚效 - 环境变量执行详细步骤

## 📝 文档说明

本文档针对 **MVP 阶段**，提供 0 成本的验证码登录和邮箱登录解决方案。

---

## 🚀 MVP 阶段 0 成本方案

### 核心特性

✅ **无需配置真实短信服务** - 开发环境使用固定验证码 `123456`
✅ **无需配置真实邮件服务** - 开发环境使用固定验证码 `123456`
✅ **跳过频率限制** - 开发环境无发送频率限制
✅ **快速启动** - 5 分钟内完成本地开发环境配置

---

## ⚙️ 必需的环境变量（MVP 最小配置）

### 1. 创建 .env 文件

在项目根目录下创建 `.env` 文件：

```cmd
cd C:\PulseOpti-HR\PulseOpti-HR
copy .env.example .env
```

### 2. 配置核心环境变量

打开 `.env` 文件，配置以下**最小必需**的变量：

```env
# ========================================
# 数据库配置（必需）
# ========================================
# 从 Vercel Dashboard 或 Neon 控制台获取
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require

# ========================================
# JWT 认证配置（必需）
# ========================================
# 生成方法：node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long-here
JWT_EXPIRES_IN=7d

# ========================================
# 应用配置（必需）
# ========================================
NEXT_PUBLIC_APP_URL=http://localhost:5000
NODE_ENV=development

# ========================================
# 功能开关（MVP 阶段设为 false）
# ========================================
ENABLE_EMAIL_SERVICE=false
ENABLE_SMS_SERVICE=false
LOG_LEVEL=info
```

---

## 📦 可选的环境变量（生产环境使用）

生产环境需要配置真实的短信和邮件服务，以下为预留的配置项：

```env
# ========================================
# 邮件服务（生产环境使用）
# ========================================
EMAIL_PROVIDER=smtp

# SMTP 配置（使用 Gmail）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=PulseOpti HR <PulseOptiHR@163.com>
SMTP_NAME=PulseOpti HR 脉策聚效

# 或使用 163 邮箱
# SMTP_HOST=smtp.163.com
# SMTP_PORT=465
# SMTP_SECURE=true
# SMTP_USER=your-email@163.com
# SMTP_PASSWORD=your-authorization-code
# SMTP_FROM=PulseOpti HR <your-email@163.com>

# ========================================
# 短信服务（生产环境使用）
# ========================================
SMS_PROVIDER=aliyun

# 阿里云短信配置
ALIYUN_SMS_ACCESS_KEY_ID=your-aliyun-access-key
ALIYUN_SMS_ACCESS_KEY_SECRET=your-aliyun-secret
ALIYUN_SMS_REGION=cn-hangzhou
ALIYUN_SMS_SIGN_NAME=PulseOpti HR
ALIYUN_SMS_TEMPLATE_CODE=SMS_123456789

# ========================================
# 功能开关（生产环境设为 true）
# ========================================
ENABLE_EMAIL_SERVICE=true
ENABLE_SMS_SERVICE=true
```

---

## 🔧 详细配置步骤

### 步骤 1：获取数据库连接字符串

#### 方法 A：使用 Neon（推荐）

1. 访问 https://neon.tech
2. 注册/登录账号
3. 创建新项目
4. 选择区域（推荐：AWS → Tokyo 或 Singapore）
5. 复制 Connection String

格式示例：
```
postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
```

#### 方法 B：使用 Vercel Dashboard

1. 访问 https://vercel.com/dashboard
2. 选择项目：pulseopti-hr
3. 进入 Settings → Environment Variables
4. 复制 `DATABASE_URL` 的值

### 步骤 2：生成 JWT_SECRET

打开 CMD，执行以下命令：

```cmd
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

复制输出的 64 位十六进制字符串，粘贴到 `.env` 文件的 `JWT_SECRET`。

### 步骤 3：验证环境变量配置

在项目根目录下创建一个测试文件 `test-env.js`：

```cmd
echo require('dotenv').config(); > test-env.js
echo console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ 已配置' : '✗ 未配置'); >> test-env.js
echo console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ 已配置' : '✗ 未配置'); >> test-env.js
echo console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL); >> test-env.js
echo console.log('NODE_ENV:', process.env.NODE_ENV); >> test-env.js
```

运行测试：

```cmd
node test-env.js
```

预期输出：

```
DATABASE_URL: ✓ 已配置
JWT_SECRET: ✓ 已配置
NEXT_PUBLIC_APP_URL: http://localhost:5000
NODE_ENV: development
```

### 步骤 4：清理测试文件

```cmd
del test-env.js
```

---

## 🎯 MVP 模式验证码规则

### 开发环境（NODE_ENV=development）

| 注册方式 | 验证码 | 发送限制 | 说明 |
|---------|-------|---------|------|
| 手机注册 | `123456` | 无限制 | 前端直接显示验证码 |
| 邮箱注册 | `123456` | 无限制 | 前端直接显示验证码 |
| 手机登录 | `123456` | 无限制 | 前端直接显示验证码 |
| 邮箱登录 | `123456` | 无限制 | 前端直接显示验证码 |

**前端显示示例：**

```json
{
  "success": true,
  "message": "验证码已发送",
  "data": {
    "code": "123456",
    "tip": "MVP模式：使用验证码 123456",
    "expiresAt": 1705675200000
  }
}
```

### 生产环境（NODE_ENV=production）

| 注册方式 | 验证码 | 发送限制 | 说明 |
|---------|-------|---------|------|
| 手机注册 | 6位随机数字 | 60秒/次 | 需配置真实短信服务 |
| 邮箱注册 | 6位随机数字 | 60秒/次 | 需配置真实邮件服务 |
| 手机登录 | 6位随机数字 | 60秒/次 | 需配置真实短信服务 |
| 邮箱登录 | 6位随机数字 | 60秒/次 | 需配置真实邮件服务 |

---

## 🚀 快速启动（MVP 模式）

### 1. 安装依赖

```cmd
cd C:\PulseOpti-HR\PulseOpti-HR
pnpm install
```

### 2. 配置 .env 文件

按照上述步骤配置 `DATABASE_URL` 和 `JWT_SECRET`。

### 3. 运行数据库迁移

```cmd
pnpm db:push
```

### 4. 启动开发服务器

```cmd
pnpm dev
```

或指定端口：

```cmd
pnpm dev --port 5000
```

### 5. 访问应用

打开浏览器，访问：http://localhost:5000

---

## 🧪 测试注册流程

### 测试密码注册

1. 访问 http://localhost:5000/register
2. 选择「密码注册」
3. 填写以下信息：
   - 邮箱：`test@example.com`
   - 姓名：`测试用户`
   - 密码：`Test1234`
   - 确认密码：`Test1234`
   - 企业名称：`测试企业`
4. 勾选「我已阅读并同意服务条款和隐私政策」
5. 点击「注册并开始免费试用」
6. 预期：跳转到 Dashboard

### 测试手机注册

1. 访问 http://localhost:5000/register
2. 选择「手机注册」
3. 填写以下信息：
   - 手机号：`13800138000`
   - 点击「获取验证码」
   - 前端会显示验证码：`123456`
   - 输入验证码：`123456`
   - 姓名：`测试用户`
   - 密码：`Test1234`
   - 企业名称：`测试企业`
4. 点击「注册并开始免费试用」
5. 预期：跳转到 Dashboard

### 测试邮箱注册

1. 访问 http://localhost:5000/register
2. 选择「邮箱注册」
3. 填写以下信息：
   - 邮箱：`test@example.com`
   - 点击「获取验证码」
   - 前端会显示验证码：`123456`
   - 输入验证码：`123456`
   - 姓名：`测试用户`
   - 密码：`Test1234`
   - 企业名称：`测试企业`
4. 点击「注册并开始免费试用」
5. 预期：跳转到 Dashboard

---

## 🔍 常见问题排查

### Q1: 提示「DATABASE_URL environment variable is not set」

**原因：** `.env` 文件中未配置 `DATABASE_URL`

**解决：**
1. 打开 `.env` 文件
2. 确保 `DATABASE_URL=` 后面有有效的 PostgreSQL 连接字符串
3. 确保没有多余的空格或引号
4. 重启开发服务器：`Ctrl+C` → `pnpm dev`

### Q2: 提示「JWT_SECRET 环境变量未设置」

**原因：** `.env` 文件中未配置 `JWT_SECRET`

**解决：**
1. 打开 `.env` 文件
2. 执行命令生成密钥：`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. 将生成的密钥粘贴到 `JWT_SECRET=` 后面
4. 重启开发服务器

### Q3: 注册时提示「参数验证失败」

**原因：** 表单字段不满足验证规则

**解决：**
- 邮箱格式：必须是有效的邮箱地址
- 手机号格式：必须是 11 位手机号，以 1 开头
- 密码：至少 8 位，包含字母和数字
- 姓名：至少 2 个字符
- 企业名称：至少 2 个字符

### Q4: 验证码发送失败

**原因（MVP 模式）：** 网络请求失败

**解决：**
1. 检查开发服务器是否正常运行：`curl http://localhost:5000`
2. 检查控制台是否有错误信息
3. 重启开发服务器

### Q5: 注册成功但无法跳转到 Dashboard

**原因：** Token 存储失败或路由问题

**解决：**
1. 打开浏览器控制台（F12）
2. 检查 `localStorage` 中是否有 `token` 和 `user`
3. 检查网络请求是否成功（200 状态码）
4. 清除浏览器缓存后重试

---

## 📊 环境变量清单

### MVP 模式（最小配置）

| 变量名 | 是否必需 | 默认值 | 说明 |
|-------|---------|-------|------|
| `DATABASE_URL` | ✅ 必需 | - | PostgreSQL 数据库连接字符串 |
| `JWT_SECRET` | ✅ 必需 | - | JWT 签名密钥（至少 32 位） |
| `JWT_EXPIRES_IN` | ⚪ 可选 | `7d` | Token 过期时间 |
| `NEXT_PUBLIC_APP_URL` | ✅ 必需 | - | 应用 URL |
| `NODE_ENV` | ✅ 必需 | `development` | 环境类型 |
| `ENABLE_EMAIL_SERVICE` | ⚪ 可选 | `false` | 是否启用邮件服务 |
| `ENABLE_SMS_SERVICE` | ⚪ 可选 | `false` | 是否启用短信服务 |
| `LOG_LEVEL` | ⚪ 可选 | `info` | 日志级别 |

### 生产环境（完整配置）

| 变量名 | 是否必需 | 默认值 | 说明 |
|-------|---------|-------|------|
| `EMAIL_PROVIDER` | ⚪ 可选 | - | 邮件服务提供商 |
| `SMTP_HOST` | ⚪ 可选 | - | SMTP 服务器地址 |
| `SMTP_PORT` | ⚪ 可选 | - | SMTP 服务器端口 |
| `SMTP_SECURE` | ⚪ 可选 | - | 是否使用 SSL |
| `SMTP_USER` | ⚪ 可选 | - | SMTP 用户名 |
| `SMTP_PASSWORD` | ⚪ 可选 | - | SMTP 密码 |
| `SMTP_FROM` | ⚪ 可选 | - | 发件人地址 |
| `SMS_PROVIDER` | ⚪ 可选 | - | 短信服务提供商 |
| `ALIYUN_SMS_ACCESS_KEY_ID` | ⚪ 可选 | - | 阿里云 AccessKey ID |
| `ALIYUN_SMS_ACCESS_KEY_SECRET` | ⚪ 可选 | - | 阿里云 AccessKey Secret |
| `ALIYUN_SMS_REGION` | ⚪ 可选 | - | 阿里云区域 |
| `ALIYUN_SMS_SIGN_NAME` | ⚪ 可选 | - | 阿里云短信签名 |
| `ALIYUN_SMS_TEMPLATE_CODE` | ⚪ 可选 | - | 阿里云短信模板代码 |

---

## 🚀 从 MVP 迁移到生产环境

### 步骤 1：配置邮件服务

1. 申请 Gmail 应用密码（或使用企业邮箱）
2. 在 `.env` 文件中配置 SMTP 参数
3. 将 `ENABLE_EMAIL_SERVICE` 设置为 `true`

### 步骤 2：配置短信服务

1. 注册阿里云短信服务
2. 创建短信签名和模板
3. 在 `.env` 文件中配置阿里云短信参数
4. 将 `ENABLE_SMS_SERVICE` 设置为 `true`

### 步骤 3：更新环境变量

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
ENABLE_EMAIL_SERVICE=true
ENABLE_SMS_SERVICE=true
```

### 步骤 4：部署到生产环境

```cmd
vercel --prod
```

---

## 📞 技术支持

- **邮箱**: PulseOptiHR@163.com
- **文档**: https://github.com/tomato-writer-2024/PulseOpti-HR
- **问题反馈**: https://github.com/tomato-writer-2024/PulseOpti-HR/issues

---

## ✅ 检查清单

在启动开发环境前，请确保：

- [ ] 已安装 Node.js 24+
- [ ] 已安装 pnpm
- [ ] 已创建 `.env` 文件
- [ ] 已配置 `DATABASE_URL`
- [ ] 已配置 `JWT_SECRET`（至少 32 位）
- [ ] 已配置 `NEXT_PUBLIC_APP_URL`
- [ ] 已配置 `NODE_ENV=development`
- [ ] 已运行 `pnpm install`
- [ ] 已运行 `pnpm db:push`
- [ ] 已运行 `pnpm dev`
- [ ] 已测试 http://localhost:5000 可访问

完成以上所有项后，即可开始使用 MVP 模式的应用！

---

**祝您使用愉快！** 🎉
