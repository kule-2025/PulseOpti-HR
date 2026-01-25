# PulseOpti HR - 环境变量快速配置指南

## ✅ 配置已完成

已根据您提供的真实信息完成环境变量配置，包括：

### 已配置项目

| 配置项 | 值 | 状态 |
|--------|-----|------|
| **数据库连接字符串** | `postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require` | ✅ 已配置 |
| **自定义域名** | `https://www.aizhixuan.com.cn` | ✅ 已配置 |
| **豆包API Key** | `a915ab35-9534-43ad-b925-d9102c5007ba` | ✅ 已配置 |
| **QQ邮箱** | `208343256@qq.com` | ✅ 已配置 |
| **QQ邮箱授权码** | `xxwbcxaojrqwbjia` | ✅ 已配置 |
| **超级管理员账号** | `208343256@qq.com` | ✅ 已配置 |
| **超级管理员密码** | `admin123` | ✅ 已配置 |

---

## 📁 已创建的配置文件

### 1. `.env` - 开发环境配置文件

**文件位置：** 项目根目录

**用途：** 本地开发环境

**包含配置：**
- Neon数据库连接
- QQ邮箱SMTP配置
- 豆包API Key
- 超级管理员账号
- Mock模式短信服务（0成本）

---

### 2. `.env.production` - 生产环境配置文件

**文件位置：** 项目根目录

**用途：** Vercel生产环境

**包含配置：**
- Neon数据库连接
- QQ邮箱SMTP配置
- 豆包API Key
- 超级管理员账号
- Mock模式短信服务

---

## 🚀 本地开发环境配置

### 步骤1：复制 .env 文件到本地

**方法1：直接创建（推荐）**

在本地 `C:\PulseOpti-HR\PulseOpti-HR` 目录中：

1. 打开记事本
2. 复制以下内容：

```env
# ========================================
# PulseOpti HR 脉策聚效 - 环境变量配置
# ========================================

# 数据库配置 (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

# JWT认证配置
JWT_SECRET=a915ab35-9534-43ad-b925-d9102c5007ba-PulseOpti-HR-JWT-Secret-Key-2025-01-19
JWT_EXPIRES_IN=7d

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# ========================================
# 邮件服务配置 - QQ邮箱SMTP
# ========================================
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=208343256@qq.com
SMTP_PASSWORD=xxwbcxaojrqwbjia
SMTP_FROM=PulseOpti HR <PulseOptiHR@163.com>
SMTP_NAME=PulseOpti HR 脉策聚效

# 功能开关
EMAIL_PROVIDER=smtp
ENABLE_EMAIL_SERVICE=true

# ========================================
# 短信服务配置 - Mock模式（开发环境，0成本）
# ========================================
SMS_PROVIDER=mock
ENABLE_SMS_SERVICE=true

# ========================================
# AI集成配置 - 豆包大语言模型
# ========================================
COZE_API_KEY=a915ab35-9534-43ad-b925-d9102c5007ba

# ========================================
# 超级管理员账号
# ========================================
ADMIN_EMAIL=208343256@qq.com
ADMIN_PASSWORD=admin123

# ========================================
# 日志级别
# ========================================
LOG_LEVEL=info
```

3. 保存为 `.env`（注意：文件名前面有点）
4. 保存位置：`C:\PulseOpti-HR\PulseOpti-HR`

---

**方法2：使用命令行创建**

打开CMD，执行：

```cmd
cd /d C:\PulseOpti-HR\PulseOpti-HR

(
echo # 数据库配置
echo DATABASE_URL=postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
echo.
echo # JWT认证配置
echo JWT_SECRET=a915ab35-9534-43ad-b925-d9102c5007ba-PulseOpti-HR-JWT-Secret-Key-2025-01-19
echo JWT_EXPIRES_IN=7d
echo.
echo # 应用配置
echo NEXT_PUBLIC_APP_URL=http://localhost:3000
echo NODE_ENV=development
echo.
echo # 邮件服务配置
echo SMTP_HOST=smtp.qq.com
echo SMTP_PORT=587
echo SMTP_SECURE=false
echo SMTP_USER=208343256@qq.com
echo SMTP_PASSWORD=xxwbcxaojrqwbjia
echo SMTP_FROM=PulseOpti HR ^<PulseOptiHR@163.com^>
echo SMTP_NAME=PulseOpti HR 脉策聚效
echo.
echo # 功能开关
echo EMAIL_PROVIDER=smtp
echo ENABLE_EMAIL_SERVICE=true
echo.
echo # 短信服务配置
echo SMS_PROVIDER=mock
echo ENABLE_SMS_SERVICE=true
echo.
echo # AI集成配置
echo COZE_API_KEY=a915ab35-9534-43ad-b925-d9102c5007ba
echo.
echo # 超级管理员账号
echo ADMIN_EMAIL=208343256@qq.com
echo ADMIN_PASSWORD=admin123
echo.
echo # 日志级别
echo LOG_LEVEL=info
) > .env
```

---

### 步骤2：安装依赖

```cmd
cd /d C:\PulseOpti-HR\PulseOpti-HR
pnpm install
```

---

### 步骤3：初始化数据库

```cmd
pnpm run db:generate
pnpm run db:push
```

**说明：** 这将在Neon数据库中创建59个表

---

### 步骤4：启动开发服务器

```cmd
pnpm run dev
```

---

### 步骤5：访问应用

打开浏览器：http://localhost:3000

**🎉 恭喜！应用已成功启动！**

---

## 🌐 Vercel生产环境配置

### 方法1：使用Vercel Dashboard（推荐）

**详细步骤：** 请参考 [VERCEL_ENV_CONFIG.md](VERCEL_ENV_CONFIG.md)

**快速步骤：**

1. 访问：https://vercel.com/dashboard
2. 选择 `pulseopti-hr` 项目
3. 点击"Settings" → "Environment Variables"
4. 逐个添加环境变量（共18项）
5. 重新部署项目

---

### 方法2：使用CLI命令

```cmd
cd /d C:\PulseOpti-HR\PulseOpti-HR

# 登录Vercel
vercel login

# 链接项目
vercel link

# 配置环境变量
vercel env add DATABASE_URL
# 输入值：postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
# 选择环境：Production, Preview, Development

vercel env add JWT_SECRET
# 输入值：a915ab35-9534-43ad-b925-d9102c5007ba-PulseOpti-HR-JWT-Secret-Key-2025-01-19-PROD
# 选择环境：Production, Preview, Development

# ... 逐个添加其他环境变量

# 部署到生产环境
vercel --prod
```

---

## 🔑 超级管理员账号

**邮箱：** 208343256@qq.com
**密码：** admin123

**说明：**
- 首次登录后，建议立即修改密码
- 此账号拥有系统最高权限
- 请妥善保管账号信息

---

## 📱 验证码说明

### Mock模式（开发环境）

**固定验证码：** `123456`
**有效期：** 60秒

**使用方法：**
1. 在注册/登录页面输入手机号
2. 点击"获取验证码"
3. 输入验证码：`123456`
4. 点击"提交"

---

### 真实短信服务（生产环境）

如需启用真实短信服务，请配置以下环境变量：

```env
SMS_PROVIDER=aliyun
ALIYUN_SMS_ACCESS_KEY_ID=your-aliyun-access-key
ALIYUN_SMS_ACCESS_KEY_SECRET=your-aliyun-secret
ALIYUN_SMS_REGION=cn-hangzhou
ALIYUN_SMS_SIGN_NAME=PulseOpti HR
ALIYUN_SMS_TEMPLATE_CODE=SMS_123456789
```

---

## 🌐 自定义域名配置

### DNS配置

**域名：** www.aizhixuan.com.cn

**DNS记录：**

| 类型 | 主机记录 | 记录值 | TTL |
|------|----------|--------|-----|
| CNAME | www | cname.vercel-dns.com | 600 |

**配置步骤：**

1. 登录域名服务商（如阿里云、腾讯云）
2. 找到DNS解析管理
3. 添加CNAME记录
4. 等待DNS生效（10分钟 - 48小时）

---

### Vercel域名配置

1. 访问：https://vercel.com/dashboard
2. 选择 `pulseopti-hr` 项目
3. 点击"Settings" → "Domains"
4. 输入域名：`www.aizhixuan.com.cn`
5. 点击"Add"

---

## 🛠️ 常用命令

```cmd
# 本地开发
pnpm run dev

# 构建生产版本
pnpm run build

# 启动生产服务器
pnpm run start

# 类型检查
pnpm run type-check

# 数据库迁移
pnpm run db:generate
pnpm run db:push

# 数据库可视化
pnpm run db:studio

# 部署到Vercel
vercel --prod
```

---

## 📞 联系支持

- **邮箱：** PulseOptiHR@163.com
- **地址：** 广州市天河区

---

## 🌐 应用访问地址

### 本地开发环境
- **首页：** http://localhost:3000
- **数据库：** http://localhost:4983（Drizzle Studio）

### 生产环境
- **自定义域名：** https://www.aizhixuan.com.cn
- **Vercel域名：** https://pulseopti-hr.vercel.app

---

## ✅ 配置检查清单

### 本地开发环境

- [ ] 创建 `.env` 文件
- [ ] 配置 `DATABASE_URL`
- [ ] 配置 `SMTP`（QQ邮箱）
- [ ] 配置 `COZE_API_KEY`
- [ ] 安装依赖（`pnpm install`）
- [ ] 初始化数据库（`pnpm run db:push`）
- [ ] 启动开发服务器（`pnpm run dev`）
- [ ] 访问 http://localhost:3000

### Vercel生产环境

- [ ] 访问 Vercel Dashboard
- [ ] 配置环境变量（18项）
- [ ] 添加自定义域名
- [ ] 配置DNS解析
- [ ] 重新部署项目
- [ ] 访问 https://www.aizhixuan.com.cn

---

**最后更新时间：** 2025-01-19
**文档版本：** v1.0
