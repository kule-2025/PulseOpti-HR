# PulseOpti HR - Windows本地环境配置指南

## 📌 重要说明

**当前情况：**
- **沙箱环境：** `/workspace/projects`（文件实际所在位置）
- **本地环境：** `C:\PulseOpti-HR\PulseOpti-HR`（您的工作目录）

**解决方案：**
您需要在本地创建配置文件，可以手动创建或使用以下直接可用的方法。

---

## 🚀 方法1：手动创建配置文件（推荐）

### 步骤1：打开项目目录

```cmd
cd /d C:\PulseOpti-HR\PulseOpti-HR
```

### 步骤2：创建环境变量文件

打开记事本，复制以下内容，保存为 `.env`：

```env
# ========================================
# PulseOpti HR 脉策聚效 - 环境变量配置
# ========================================

# 数据库配置（从Neon控制台复制）
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/pulsoptihr?sslmode=require

# JWT认证配置（运行以下命令生成）
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# 邮件服务配置 - Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=PulseOpti HR <PulseOptiHR@163.com>
SMTP_NAME=PulseOpti HR 脉策聚效

# 功能开关
EMAIL_PROVIDER=smtp
ENABLE_EMAIL_SERVICE=true

# 短信服务配置 - Mock模式（开发环境，0成本）
SMS_PROVIDER=mock
ENABLE_SMS_SERVICE=true
```

**保存步骤：**
1. 文件 → 另存为
2. 文件名：`.env`
3. 保存类型：所有文件
4. 保存位置：`C:\PulseOpti-HR\PulseOpti-HR`

---

### 步骤3：安装依赖

```cmd
cd /d C:\PulseOpti-HR\PulseOpti-HR
pnpm install
```

---

### 步骤4：初始化数据库

```cmd
pnpm run db:generate
pnpm run db:push
```

---

### 步骤5：启动开发服务器

```cmd
pnpm run dev
```

---

### 步骤6：访问应用

打开浏览器：http://localhost:3000

---

## 🔑 获取必需配置

### 1. Neon数据库连接字符串

**步骤：**
1. 访问：https://console.neon.tech
2. 登录并创建项目
3. 点击"Connection Details"
4. 复制连接字符串
5. 替换 `.env` 文件中的 `DATABASE_URL`

---

### 2. JWT密钥

**生成命令：**

打开新CMD窗口，执行：

```cmd
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**复制输出的随机字符串，替换到 .env 文件的 JWT_SECRET**

---

### 3. Gmail应用专用密码

**步骤：**
1. 访问：https://myaccount.google.com/security
2. 开启"两步验证"
3. 访问：https://myaccount.google.com/apppasswords
4. 选择"邮件" → "其他（自定义名称）"
5. 输入"PulseOpti HR" → 点击"生成"
6. 复制16位密码（格式：`xxxx xxxx xxxx xxxx`）
7. 替换 `.env` 文件中的 `SMTP_PASSWORD`

---

## 🛠️ 常用命令

### 开发命令

```cmd
# 启动开发服务器
pnpm run dev

# 构建生产版本
pnpm run build

# 启动生产服务器
pnpm run start

# 类型检查
pnpm run type-check

# 代码格式化
pnpm run format

# 代码规范检查
pnpm run lint
```

### 数据库命令

```cmd
# 生成迁移文件
pnpm run db:generate

# 推送表结构到数据库
pnpm run db:push

# 打开数据库可视化工具
pnpm run db:studio
```

---

## 🌐 自定义域名配置

### 生产环境域名

**自定义域名：** www.aizhixuan.com.cn

### 配置自定义域名（Vercel）

**步骤1：在Vercel Dashboard添加域名**

1. 访问：https://vercel.com/dashboard
2. 选择 `pulseopti-hr` 项目
3. 点击"Settings" → "Domains"
4. 输入域名：`www.aizhixuan.com.cn`
5. 点击"Add"

**步骤2：配置DNS解析**

登录域名服务商（如阿里云、腾讯云），添加以下DNS记录：

| 类型 | 主机记录 | 记录值 | TTL |
|------|----------|--------|-----|
| CNAME | www | cname.vercel-dns.com | 600 |

**步骤3：等待DNS生效**

DNS解析生效时间：10分钟 - 48小时

**步骤4：配置环境变量**

在Vercel Dashboard中配置环境变量：

```
NEXT_PUBLIC_APP_URL=https://www.aizhixuan.com.cn
NODE_ENV=production
DATABASE_URL=你的数据库连接字符串
JWT_SECRET=你的JWT密钥
```

**步骤5：重新部署**

```cmd
vercel --prod
```

---

## 🚨 常见问题

### 问题1：文件扩展名隐藏

**问题：** 保存 `.env` 文件后，文件名变成 `.env.txt`

**解决方案：**

1. 打开文件夹
2. 点击"查看" → 勾选"文件扩展名"
3. 重命名文件，删除 `.txt` 后缀

---

### 问题2：端口3000被占用

**解决方案：**

```cmd
# 查找占用端口的进程
netstat -ano | findstr :3000

# 关闭进程（替换<PID>为实际PID）
taskkill /PID <PID> /F

# 或更换端口
pnpm run dev -- -p 3001
```

---

### 问题3：依赖安装失败

**解决方案：**

```cmd
# 清理缓存
pnpm store prune

# 删除node_modules
rmdir /s /q node_modules

# 重新安装
pnpm install
```

---

### 问题4：环境变量未加载

**解决方案：**

1. 检查 `.env` 文件是否存在
2. 检查文件名是否正确（不要有 .txt 后缀）
3. 重启开发服务器

---

### 问题5：Gmail邮件发送失败

**错误：** `Invalid login`

**解决方案：**

1. 确认开启了两步验证
2. 使用应用专用密码，不是Gmail登录密码
3. 重新生成应用专用密码
4. 更新`.env`文件中的`SMTP_PASSWORD`

---

## 📊 验证配置清单

### 手动验证步骤

**1. 检查环境变量文件**
```cmd
dir .env
```

**2. 检查依赖是否安装**
```cmd
dir node_modules
```

**3. 检查Node.js版本**
```cmd
node --version
```

**4. 检查pnpm版本**
```cmd
pnpm --version
```

**5. 测试数据库连接**
```cmd
pnpm run db:studio
```

**6. 类型检查**
```cmd
pnpm run type-check
```

**7. 构建测试**
```cmd
pnpm run build
```

---

## 🌐 应用访问地址

### 本地开发环境
- **首页：** http://localhost:3000
- **数据库：** http://localhost:4983（Drizzle Studio）

### 生产环境
- **自定义域名：** https://www.aizhixuan.com.cn
- **Vercel默认域名：** https://pulseopti-hr.vercel.app
- **Vercel Dashboard：** https://vercel.com/dashboard

---

## 📞 联系支持

- **邮箱：** PulseOptiHR@163.com
- **地址：** 广州市天河区

---

## 📝 完整配置检查清单

在启动开发服务器之前，请确保完成以下检查：

### 必需配置（必须完成）

- [ ] 创建 `.env` 文件
- [ ] 配置 `DATABASE_URL`（Neon数据库连接字符串）
- [ ] 配置 `JWT_SECRET`（至少32个字符）
- [ ] 安装项目依赖（`pnpm install`）
- [ ] 初始化数据库（`pnpm run db:generate` 和 `pnpm run db:push`）

### 可选配置（推荐完成）

- [ ] 配置邮件服务（Gmail SMTP）
- [ ] 配置短信服务（Mock模式）

### 验证步骤

- [ ] 运行 `pnpm run type-check`（类型检查）
- [ ] 运行 `pnpm run build`（构建测试）
- [ ] 运行 `pnpm run dev`（启动开发服务器）
- [ ] 访问 http://localhost:3000（测试页面访问）

---

**最后更新时间：** 2025-01-11
**文档版本：** v1.0（Windows本地环境配置）
