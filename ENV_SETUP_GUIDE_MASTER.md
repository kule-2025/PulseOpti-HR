# PulseOpti HR 脉策聚效 - 环境配置总览

## 📌 本地存储路径

**Windows本地路径：**
```
C:\PulseOpti-HR\PulseOpti-HR
```

---

## 📚 文档导航

本指南包含以下文档，点击标题查看详细内容：

### 1. [环境变量配置完整指南](ENV_CONFIGURATION_GUIDE.md)
**详细的环境变量配置说明，包括：**
- 数据库配置（Neon PostgreSQL）
- 邮件服务配置（Gmail SMTP / 阿里云邮件推送 / 腾讯云邮件）
- 短信服务配置（阿里云短信 / 腾讯云短信 / Mock模式）
- JWT认证配置
- 应用基础配置
- AI集成配置
- 对象存储配置
- 支付服务配置
- 配置检查清单

### 2. [CMD操作步骤完整指南](CMD_EXECUTION_GUIDE.md)
**详细的CMD命令操作步骤，包括：**
- 本地开发环境准备（Node.js、pnpm安装）
- 环境变量配置步骤
- 依赖安装步骤
- 数据库初始化步骤
- 启动开发服务器步骤
- 常用命令速查
- 部署到Vercel步骤
- 故障排查指南

### 3. [快速参考指南](QUICK_REFERENCE.md)
**快速查找常用信息，包括：**
- 5分钟快速开始
- 常用命令速查
- 环境变量速查表
- Gmail应用专用密码获取步骤
- 验证码使用说明
- Neon数据库连接字符串获取
- 常见问题快速解决
- 数据库表清单

---

## 🚀 快速开始（推荐流程）

### 方法1：使用自动化脚本（推荐）

#### 步骤1：运行环境配置脚本

```cmd
cd /d C:\PulseOpti-HR\PulseOpti-HR
setup-development-env.cmd
```

**脚本将自动完成：**
1. 检查Node.js和pnpm安装
2. 创建.env文件
3. 提示编辑环境变量
4. 安装依赖
5. 初始化数据库
6. 启动开发服务器

#### 步骤2：编辑环境变量

根据脚本提示，编辑`.env`文件，配置以下必需项：

```env
# 数据库（从Neon控制台复制）
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/pulsoptihr?sslmode=require

# JWT密钥（运行以下命令生成）
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# 邮件服务（Gmail SMTP）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=PulseOpti HR <PulseOptiHR@163.com>
SMTP_NAME=PulseOpti HR
EMAIL_PROVIDER=smtp
ENABLE_EMAIL_SERVICE=true

# 短信服务（Mock模式，0成本）
SMS_PROVIDER=mock
ENABLE_SMS_SERVICE=true
```

#### 步骤3：验证配置

```cmd
verify-env-config.cmd
```

检查所有配置项是否正确配置。

---

### 方法2：手动配置（适合需要自定义配置的用户）

#### 步骤1：安装依赖

```cmd
cd /d C:\PulseOpti-HR\PulseOpti-HR
pnpm install
```

#### 步骤2：创建环境变量文件

```cmd
copy .env.example .env
notepad .env
```

#### 步骤3：配置环境变量

参考[环境变量配置完整指南](ENV_CONFIGURATION_GUIDE.md)配置所有必需的环境变量。

#### 步骤4：初始化数据库

```cmd
pnpm run db:generate
pnpm run db:push
```

#### 步骤5：启动开发服务器

```cmd
pnpm run dev
```

#### 步骤6：访问应用

打开浏览器：http://localhost:3000

---

## 🔑 关键配置说明

### 数据库配置（必需）

**Neon PostgreSQL（推荐）：**

1. 访问：https://console.neon.tech
2. 创建项目，获取连接字符串
3. 配置到`.env`文件：

```env
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/pulsoptihr?sslmode=require
```

### JWT密钥配置（必需）

**生成安全的JWT密钥：**

```cmd
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**配置到`.env`文件：**

```env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1
```

### 邮件服务配置（推荐Gmail SMTP）

**获取Gmail应用专用密码：**

1. 访问：https://myaccount.google.com/security
2. 开启两步验证
3. 访问：https://myaccount.google.com/apppasswords
4. 选择"邮件" → "其他（自定义名称）"
5. 输入"PulseOpti HR" → 生成密码
6. 复制16位密码（格式：`xxxx xxxx xxxx xxxx`）

**配置到`.env`文件：**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
SMTP_FROM=PulseOpti HR <PulseOptiHR@163.com>
SMTP_NAME=PulseOpti HR
EMAIL_PROVIDER=smtp
ENABLE_EMAIL_SERVICE=true
```

### 短信服务配置（MVP阶段使用Mock模式）

**开发环境使用固定验证码，0成本：**

```env
SMS_PROVIDER=mock
ENABLE_SMS_SERVICE=true
```

**使用方法：**
- 在注册/登录页面点击"获取验证码"
- 使用固定验证码：`123456`（60秒内有效）

---

## 📋 环境变量最小配置（MVP阶段）

```env
# 数据库
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/pulsoptihr?sslmode=require

# JWT认证
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# 邮件服务（Gmail SMTP）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=PulseOpti HR <PulseOptiHR@163.com>
SMTP_NAME=PulseOpti HR
EMAIL_PROVIDER=smtp
ENABLE_EMAIL_SERVICE=true

# 短信服务（Mock模式）
SMS_PROVIDER=mock
ENABLE_SMS_SERVICE=true
```

---

## 🛠️ 常用命令速查

### 开发命令

```cmd
# 启动开发服务器（热更新）
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

# 查看迁移历史
pnpm run db:migrate
```

### 依赖管理

```cmd
# 安装依赖
pnpm install

# 添加新依赖
pnpm add <package-name>

# 移除依赖
pnpm remove <package-name>

# 更新依赖
pnpm update

# 清理缓存
pnpm store prune
```

---

## 🌐 应用访问地址

### 本地开发环境
- **首页：** http://localhost:3000
- **数据库：** http://localhost:4983（Drizzle Studio）

### Vercel生产环境
- **首页：** https://pulseopti-hr.vercel.app
- **Vercel Dashboard：** https://vercel.com/dashboard

---

## 🚨 常见问题快速解决

### 问题1：端口3000被占用

```cmd
# 查找占用端口的进程
netstat -ano | findstr :3000

# 关闭进程（替换<PID>）
taskkill /PID <PID> /F

# 或更换端口
pnpm run dev -- -p 3001
```

### 问题2：依赖安装失败

```cmd
# 清理缓存
pnpm store prune

# 删除node_modules
rmdir /s /q node_modules

# 重新安装
pnpm install
```

### 问题3：环境变量未加载

```cmd
# 检查.env文件是否存在
dir .env

# 重启开发服务器（按Ctrl+C停止，然后重新启动）
pnpm run dev
```

### 问题4：Gmail邮件发送失败

**错误：** `Invalid login`

**解决：**
1. 确认开启了两步验证
2. 使用应用专用密码，不是Gmail登录密码
3. 重新生成应用专用密码
4. 更新`.env`文件中的`SMTP_PASSWORD`

---

## 📊 验证配置清单

运行以下命令验证配置：

```cmd
# 验证环境变量配置
verify-env-config.cmd

# 验证数据库连接
pnpm run db:studio

# 验证类型检查
pnpm run type-check

# 验证构建
pnpm run build
```

---

## 📞 联系支持

如遇问题，请联系：

- **邮箱：** PulseOptiHR@163.com
- **地址：** 广州市天河区

---

## 📚 相关文档

- [环境变量配置完整指南](ENV_CONFIGURATION_GUIDE.md) - 详细的环境变量配置说明
- [CMD操作步骤完整指南](CMD_EXECUTION_GUIDE.md) - 详细的CMD命令操作步骤
- [快速参考指南](QUICK_REFERENCE.md) - 快速查找常用信息
- [部署快速开始](QUICKSTART.md) - 部署到Vercel的快速开始指南
- [数据库迁移指南](NEON_DATABASE_SETUP.md) - Neon数据库配置指南
- [部署检查清单](DEPLOYMENT_CHECKLIST.md) - 部署前的检查清单

---

## 🎯 推荐阅读顺序

### 首次配置（推荐顺序）

1. **阅读本文档** - 了解整体配置流程
2. **运行自动化脚本** - `setup-development-env.cmd`
3. **编辑环境变量** - 根据提示配置`.env`文件
4. **验证配置** - 运行`verify-env-config.cmd`
5. **启动开发服务器** - `pnpm run dev`
6. **访问应用** - http://localhost:3000

### 遇到问题（按需查阅）

1. **数据库问题** → [数据库迁移指南](NEON_DATABASE_SETUP.md)
2. **环境变量问题** → [环境变量配置完整指南](ENV_CONFIGURATION_GUIDE.md)
3. **命令操作问题** → [CMD操作步骤完整指南](CMD_EXECUTION_GUIDE.md)
4. **快速查找信息** → [快速参考指南](QUICK_REFERENCE.md)
5. **部署问题** → [部署检查清单](DEPLOYMENT_CHECKLIST.md)

---

**最后更新时间：** 2025-01-11
**文档版本：** v1.0
