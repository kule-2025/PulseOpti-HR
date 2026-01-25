# PulseOpti HR 脉策聚效 - CMD操作步骤完整指南

## 📋 目录
- [本地开发环境准备](#本地开发环境准备)
- [环境变量配置](#环境变量配置)
- [依赖安装](#依赖安装)
- [数据库初始化](#数据库初始化)
- [启动开发服务器](#启动开发服务器)
- [运行数据库迁移](#运行数据库迁移)
- [启动开发服务器](#启动开发服务器-1)
- [常用命令](#常用命令)
- [部署到Vercel](#部署到vercel)
- [故障排查](#故障排查)

---

## 💻 本地开发环境准备

### 步骤1：安装Node.js

**系统要求：**
- Node.js >= 18.17.0
- 推荐使用 Node.js 24 LTS

**安装步骤：**

1. **下载Node.js**
   - 访问：https://nodejs.org/
   - 下载 LTS 版本（推荐 v20.x 或 v24.x）

2. **安装Node.js**
   - 双击下载的安装包
   - 选择"Next" → 勾选"Automatically install the necessary tools" → "Next"
   - 点击"Install" → 等待安装完成 → "Finish"

3. **验证安装**
   打开CMD命令提示符，执行：

```cmd
node --version
npm --version
```

**预期输出：**
```
v20.11.0
10.2.4
```

---

### 步骤2：安装pnpm包管理器

**pnpm 是快速、节省磁盘空间的包管理器**

```cmd
npm install -g pnpm
```

**验证安装：**

```cmd
pnpm --version
```

**预期输出：**
```
9.4.0
```

---

### 步骤3：切换到项目目录

```cmd
cd /d C:\PulseOpti-HR\PulseOpti-HR
```

**验证当前目录：**

```cmd
dir
```

**预期输出：**
```
驱动器 C 中的卷是 OS
卷的序列号是 XXXX-XXXX

C:\PulseOpti-HR\PulseOpti-HR 的目录

2025/01/11  10:30    <DIR>          .
2025/01/11  10:30    <DIR>          ..
2025/01/11  10:30             5,234 .env.example
2025/01/11  10:30               156 .gitignore
2025/01/11  10:30             3,456 next.config.ts
2025/01/11  10:30             2,890 package.json
2025/01/11  10:30    <DIR>          src
2025/01/11  10:30    <DIR>          public
2025/01/11  10:30             1,234 tsconfig.json
              6 个文件
```

---

## ⚙️ 环境变量配置

### 步骤1：复制环境变量示例文件

```cmd
copy .env.example .env
```

**预期输出：**
```
已复制         1 个文件。
```

---

### 步骤2：编辑环境变量文件

使用记事本或其他文本编辑器打开 `.env` 文件：

```cmd
notepad .env
```

**或使用VS Code：**

```cmd
code .env
```

---

### 步骤3：配置必需环境变量

打开 `.env` 文件后，修改以下必需配置：

#### 3.1 数据库配置

```env
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/pulsoptihr?sslmode=require
```

**参数说明：**
- `username`: 替换为你的Neon数据库用户名
- `password`: 替换为你的Neon数据库密码
- `ep-xxx.us-east-2.aws.neon.tech`: 替换为你的Neon服务器地址
- `pulsoptihr`: 替换为你的数据库名称（默认为pulsoptihr）

**获取Neon连接字符串：**
1. 访问：https://console.neon.tech
2. 登录并选择你的项目
3. 点击"Connection Details"
4. 复制"Connection string"

---

#### 3.2 JWT认证配置

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-1234567890
JWT_EXPIRES_IN=7d
```

**生成安全的JWT密钥：**

打开CMD，执行：

```cmd
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**复制输出的随机字符串，替换到 JWT_SECRET**

**示例输出：**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1
```

---

#### 3.3 应用基础配置

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

#### 3.4 邮件服务配置（Gmail SMTP - 推荐）

**步骤1：获取Gmail应用专用密码**

1. 访问：https://myaccount.google.com/security
2. 确保"两步验证"已开启
3. 访问：https://myaccount.google.com/apppasswords
4. 选择"邮件" → "其他（自定义名称）"
5. 输入"PulseOpti HR" → 点击"生成"
6. 复制生成的16位密码（格式：xxxx xxxx xxxx xxxx）

**步骤2：配置环境变量**

```env
# ========================================
# 邮件服务配置 - Gmail SMTP
# ========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # 刚才生成的16位密码
SMTP_FROM=PulseOpti HR <PulseOptiHR@163.com>
SMTP_NAME=PulseOpti HR 脉策聚效

# 功能开关
EMAIL_PROVIDER=smtp
ENABLE_EMAIL_SERVICE=true
```

**参数说明：**
- `SMTP_USER`: 替换为你的Gmail邮箱地址
- `SMTP_PASSWORD`: 替换为刚才生成的16位应用专用密码
- `SMTP_FROM`: 替换为你的发件人邮箱地址（可以是163、QQ等）

---

#### 3.5 短信服务配置（MVP阶段使用Mock模式）

**开发阶段使用固定验证码，0成本，无需真实短信服务**

```env
# ========================================
# 短信服务配置 - Mock模式（开发环境）
# ========================================
SMS_PROVIDER=mock
ENABLE_SMS_SERVICE=true
```

**使用说明：**
- 在注册/登录页面点击"获取验证码"
- 使用固定验证码：`123456`（60秒内有效）

---

### 步骤4：保存并关闭文件

- 按 `Ctrl + S` 保存文件
- 按 `Alt + F4` 或点击窗口关闭按钮

---

## 📦 依赖安装

### 步骤1：清理缓存（可选）

如果之前安装过依赖，建议先清理：

```cmd
pnpm store prune
```

---

### 步骤2：安装项目依赖

```cmd
pnpm install
```

**预期输出：**
```
Packages: +1289
Progress: resolved 1289, reused 1256, downloaded 33, added 1289, done

Done in 45.2s
```

**安装时间：** 首次安装约 1-5 分钟（取决于网络速度）

---

### 步骤3：验证依赖安装

```cmd
dir node_modules
```

**预期输出：**
```
驱动器 C 中的卷是 OS
卷的序列号是 XXXX-XXXX

C:\PulseOpti-HR\PulseOpti-HR\node_modules 的目录

2025/01/11  10:35    <DIR>          .
2025/01/11  10:35    <DIR>          ..
2025/01/11  10:35    <DIR>          .pnpm
2025/01/11  10:35    <DIR>          @next
2025/01/11  10:35    <DIR>          @radix-ui
2025/01/11  10:35    <DIR>          @types
2025/01/11  10:35    <DIR>          next
2025/01/11  10:35    <DIR>          react
2025/01/11  10:35    <DIR>          drizzle-orm
              ...（更多目录）
```

---

## 🗄️ 数据库初始化

### 步骤1：生成数据库迁移文件

```cmd
pnpm run db:generate
```

**预期输出：**
```
drizzle-kit generate:pg

✓ generating 59 migrations
[+] Migration files created at drizzle

Done in 2.5s
```

---

### 步骤2：推送数据库表结构到Neon

```cmd
pnpm run db:push
```

**预期输出：**
```
drizzle-kit push:postgres

✓ Connected to database
✓ Database schema pushed successfully
✓ 59 tables created

Done in 5.3s
```

**说明：**
- 此命令会在Neon数据库中创建59个表
- 包括：用户、公司、员工、薪酬、考勤、绩效、招聘、离职等

---

### 步骤3：验证数据库表创建（可选）

打开浏览器，访问：

```
http://localhost:4983
```

**说明：**
- 这是Drizzle Studio，用于可视化数据库
- 可以查看所有59个表的数据结构

**如果Drizzle Studio未启动，执行：**

```cmd
pnpm run db:studio
```

保持CMD窗口打开，浏览器访问 http://localhost:4983

---

## 🚀 启动开发服务器

### 步骤1：启动开发服务器

```cmd
pnpm run dev
```

**预期输出：**
```
  ▲ Next.js 16.0.0
  - Local:        http://localhost:3000
  - Network:      http://192.168.1.100:3000

 ✓ Starting...
 ✓ Ready in 3.2s
```

**说明：**
- 开发服务器启动在 http://localhost:3000
- 保持CMD窗口打开，不要关闭
- 修改代码后自动热更新（HMR）

---

### 步骤2：访问应用

打开浏览器，访问：

```
http://localhost:3000
```

**预期页面：**
- PulseOpti HR 首页
- 品牌Logo、导航栏、功能介绍、定价卡片

---

### 步骤3：测试环境变量加载

查看CMD窗口的输出，确认环境变量加载成功：

```
✓ Database connected successfully
✓ JWT secret loaded
✓ Email service initialized (Gmail SMTP)
✓ SMS service initialized (Mock mode)
```

---

## 🔄 运行数据库迁移

### 场景：修改数据库表结构后

如果修改了 `src/lib/db/schema.ts` 文件，需要重新运行迁移：

```cmd
pnpm run db:generate
pnpm run db:push
```

---

## 🛠️ 常用命令

### 开发相关

```cmd
# 启动开发服务器（支持热更新）
pnpm run dev

# 构建生产版本
pnpm run build

# 启动生产服务器
pnpm run start

# 类型检查
pnpm run type-check

# 格式化代码
pnpm run format

# 检查代码规范
pnpm run lint
```

---

### 数据库相关

```cmd
# 生成迁移文件
pnpm run db:generate

# 推送表结构到数据库
pnpm run db:push

# 打开数据库可视化工具
pnpm run db:studio

# 查看数据库迁移历史
pnpm run db:migrate
```

---

### 依赖管理

```cmd
# 安装新依赖
pnpm add <package-name>

# 安装开发依赖
pnpm add -D <package-name>

# 移除依赖
pnpm remove <package-name>

# 更新依赖
pnpm update

# 清理缓存
pnpm store prune
```

---

## 🌐 部署到Vercel

### 步骤1：安装Vercel CLI

```cmd
npm install -g vercel
```

**验证安装：**

```cmd
vercel --version
```

**预期输出：**
```
37.4.0
```

---

### 步骤2：登录Vercel

```cmd
vercel login
```

**按提示操作：**
1. 选择邮箱登录方式（Email）
2. 输入邮箱地址
3. 检查邮箱中的验证码
4. 输入验证码完成登录

**预期输出：**
```
✓ Email verified
✓ Logged in as your-email@example.com
```

---

### 步骤3：链接项目到Vercel

```cmd
vercel link
```

**按提示操作：**
1. 选择"Link to existing project" 或 "Set up a new project"
2. 输入项目名称：`pulseopti-hr`
3. 选择Vercel团队（个人或团队）

**预期输出：**
```
✓ Linked to your-username/pulseopti-hr
✓ Created .vercel directory
```

---

### 步骤4：配置Vercel环境变量

#### 方式1：通过Vercel Dashboard（推荐）

1. 访问：https://vercel.com/dashboard
2. 选择 `pulseopti-hr` 项目
3. 点击"Settings" → "Environment Variables"
4. 添加所有环境变量（从本地 `.env` 文件复制）

**必需配置：**
```
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
NEXT_PUBLIC_APP_URL
NODE_ENV
```

**可选配置（邮件/短信）：**
```
EMAIL_PROVIDER
SMTP_HOST
SMTP_PORT
SMTP_SECURE
SMTP_USER
SMTP_PASSWORD
SMTP_FROM
SMTP_NAME
ENABLE_EMAIL_SERVICE

SMS_PROVIDER
ENABLE_SMS_SERVICE
```

#### 方式2：通过CLI

```cmd
vercel env add DATABASE_URL
```

按提示输入环境变量值。

---

### 步骤5：部署到Vercel

```cmd
vercel --prod
```

**预期输出：**
```
✓ Building...
✓ Deploying...
✓ Preview URL: https://pulseopti-hr-xxx.vercel.app
✓ Production URL: https://pulseopti-hr.vercel.app
```

---

### 步骤6：运行数据库迁移（Vercel环境）

```cmd
vercel env pull .env.local
pnpm run db:push
```

---

## 🔧 故障排查

### 问题1：端口3000被占用

**错误信息：**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案：**

**方法1：关闭占用端口的进程**

```cmd
netstat -ano | findstr :3000
```

找到占用端口的PID，执行：

```cmd
taskkill /PID <PID> /F
```

**方法2：更换端口**

```cmd
pnpm run dev -- -p 3001
```

---

### 问题2：数据库连接失败

**错误信息：**
```
Error: Connection refused
```

**解决方案：**

1. 检查 `DATABASE_URL` 是否正确
2. 检查Neon数据库是否在线
3. 尝试使用 `pgbouncer=true` 参数：

```env
DATABASE_URL=postgres://username:password@ep-cool-xxx.aws.neon.tech/pulsoptihr?pgbouncer=true
```

---

### 问题3：依赖安装失败

**错误信息：**
```
Error: Cannot find module 'xxx'
```

**解决方案：**

```cmd
# 清理缓存
pnpm store prune

# 重新安装
rm -rf node_modules
rm -rf .pnpm-store
pnpm install
```

---

### 问题4：环境变量未加载

**错误信息：**
```
Error: JWT_SECRET is not defined
```

**解决方案：**

1. 检查 `.env` 文件是否存在：

```cmd
dir .env
```

2. 检查环境变量名称是否正确（区分大小写）
3. 重启开发服务器：

```cmd
# 按 Ctrl+C 停止服务器
# 重新启动
pnpm run dev
```

---

### 问题5：Gmail邮件发送失败

**错误信息：**
```
Error: Invalid login
```

**解决方案：**

1. 确认开启了两步验证
2. 确认使用的是"应用专用密码"，不是Gmail登录密码
3. 检查 `SMTP_USER` 和 `SMTP_PASSWORD` 是否正确

**重新生成应用专用密码：**
1. 访问：https://myaccount.google.com/apppasswords
2. 删除旧密码
3. 重新生成新密码
4. 更新 `.env` 文件中的 `SMTP_PASSWORD`

---

### 问题6：TypeScript类型错误

**错误信息：**
```
Error: Type 'xxx' is not assignable to type 'yyy'
```

**解决方案：**

```cmd
# 运行类型检查
pnpm run type-check

# 查看具体错误位置
pnpm run type-check 2>&1 | findstr "error TS"
```

---

### 问题7：构建失败

**错误信息：**
```
Error: Build failed
```

**解决方案：**

```cmd
# 清理构建缓存
rm -rf .next

# 重新构建
pnpm run build
```

---

## 📊 性能优化命令

### 构建优化

```cmd
# 压缩构建
pnpm run build -- --profile

# 查看构建分析
pnpm run build -- --analyze
```

### 依赖优化

```cmd
# 检查依赖漏洞
pnpm audit

# 自动修复漏洞
pnpm audit fix
```

---

## 📝 开发工作流建议

### 每日开发

1. **拉取最新代码**

```cmd
git pull origin main
```

2. **安装最新依赖**

```cmd
pnpm install
```

3. **启动开发服务器**

```cmd
pnpm run dev
```

4. **打开浏览器**

```
http://localhost:3000
```

---

### 功能开发

1. **创建新功能分支**

```cmd
git checkout -b feature/new-feature
```

2. **开发代码**

3. **类型检查**

```cmd
pnpm run type-check
```

4. **提交代码**

```cmd
git add .
git commit -m "feat: add new feature"
```

5. **推送分支**

```cmd
git push origin feature/new-feature
```

---

### 发布前检查

1. **类型检查**

```cmd
pnpm run type-check
```

2. **代码规范检查**

```cmd
pnpm run lint
```

3. **构建测试**

```cmd
pnpm run build
```

4. **数据库迁移**

```cmd
pnpm run db:push
```

5. **部署到Vercel**

```cmd
vercel --prod
```

---

## 📞 联系支持

如遇问题，请联系：

- **邮箱**: PulseOptiHR@163.com
- **地址**: 广州市天河区

---

## 📚 相关文档

- [环境变量配置指南](ENV_CONFIGURATION_GUIDE.md)
- [部署快速开始](QUICKSTART.md)
- [数据库迁移指南](NEON_DATABASE_SETUP.md)
- [部署检查清单](DEPLOYMENT_CHECKLIST.md)

---

**最后更新时间：** 2025-01-11
**文档版本：** v1.0
