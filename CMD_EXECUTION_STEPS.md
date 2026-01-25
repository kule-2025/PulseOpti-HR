# PulseOpti HR - CMD执行命令详细步骤

## 📌 重要说明

**本页面提供可直接在CMD中执行的命令步骤**
**请按照以下步骤逐一执行**

---

## 🚀 完整执行流程

### 步骤1：打开CMD命令提示符

**操作方法：**
1. 按 `Win + R`
2. 输入 `cmd`
3. 按回车键

---

### 步骤2：切换到项目目录

**执行以下命令：**

```cmd
cd /d C:\PulseOpti-HR\PulseOpti-HR
```

**验证：**
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
2025/01/11  10:30           5,234 package.json
2025/01/11  10:30           3,456 next.config.ts
2025/01/11  10:30    <DIR>          src
2025/01/11  10:30    <DIR>          public
```

---

### 步骤3：创建 .env 文件

**方法1：使用记事本创建（推荐）**

**执行以下命令：**

```cmd
notepad .env
```

**操作步骤：**
1. 系统会打开记事本
2. 如果提示"不存在该文件，是否创建？"，点击"是"
3. 复制以下完整内容（从 ENV_COMPLETE_CONFIG.md 中复制）
4. 粘贴到记事本中
5. 保存文件（Ctrl + S）
6. 关闭记事本

**验证文件已创建：**

```cmd
dir .env
```

**预期输出：**
```
2025/01/11  10:35           2,345 .env
```

---

### 步骤4：验证 .env 文件内容

**执行以下命令：**

```cmd
type .env
```

**预期输出：**
应该看到完整的配置内容，包括：
- DATABASE_URL=postgresql://...
- JWT_SECRET=a1b2c3d4...
- SMTP_USER=208343256@qq.com
- COZE_API_KEY=a915ab35-9534...
- 等等...

---

### 步骤5：检查Node.js是否安装

**执行以下命令：**

```cmd
node --version
```

**预期输出：**
```
v20.11.0
```

**如果未安装，请先安装Node.js：**
- 访问：https://nodejs.org/
- 下载并安装 LTS 版本（推荐 v20.x 或 v24.x）

---

### 步骤6：检查pnpm是否安装

**执行以下命令：**

```cmd
pnpm --version
```

**预期输出：**
```
9.4.0
```

**如果未安装，执行以下命令：**

```cmd
npm install -g pnpm
```

---

### 步骤7：安装项目依赖

**执行以下命令：**

```cmd
pnpm install
```

**预期输出：**
```
Packages: +1289
Progress: resolved 1289, reused 1256, downloaded 33, added 1289, done

Done in 45.2s
```

**说明：**
- 首次安装可能需要 3-5 分钟
- 请耐心等待安装完成

---

### 步骤8：生成数据库迁移文件

**执行以下命令：**

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

**说明：**
- 此命令会生成数据库迁移文件
- 会在 `drizzle` 目录下创建迁移文件

---

### 步骤9：推送数据库表结构到Neon

**执行以下命令：**

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

**如果出现错误，检查：**
- `DATABASE_URL` 是否正确
- Neon数据库是否在线
- 网络连接是否正常

---

### 步骤10：验证数据库连接（可选）

**执行以下命令：**

```cmd
pnpm run db:studio
```

**操作步骤：**
1. 保持CMD窗口打开
2. 打开浏览器，访问：http://localhost:4983
3. 应该能看到Drizzle Studio界面
4. 可以查看所有59个表的数据结构

**说明：**
- 这是数据库可视化工具
- 可以查看和管理数据库表
- 验证数据库连接是否成功

**完成后：**
- 关闭浏览器标签页
- 按 `Ctrl + C` 停止Drizzle Studio

---

### 步骤11：启动开发服务器

**执行以下命令：**

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

### 步骤12：访问应用

**操作步骤：**
1. 打开浏览器
2. 访问：http://localhost:3000
3. 应该能看到PulseOpti HR首页

**预期页面：**
- PulseOpti HR 脉策聚效品牌Logo
- 导航栏
- 功能介绍
- 定价卡片

---

## 🔐 步骤13：使用超级管理员账号登录

**操作步骤：**
1. 点击页面右上角的"登录"按钮
2. 输入邮箱：`208343256@qq.com`
3. 输入密码：`admin123`
4. 点击"登录"

**预期结果：**
- 成功登录到系统
- 进入仪表盘页面

---

## ✅ 验证配置成功

### 验证清单

请在浏览器中完成以下验证：

- [ ] 访问 http://localhost:3000 成功
- [ ] 首页显示正常
- [ ] 使用超级管理员账号登录成功
- [ ] 仪表盘页面显示正常

---

## 🛠️ 常用命令（开发过程中）

### 启动开发服务器

```cmd
pnpm run dev
```

### 停止开发服务器

在CMD窗口中按 `Ctrl + C`

### 重新启动开发服务器

```cmd
# 按 Ctrl + C 停止
# 然后重新执行
pnpm run dev
```

### 类型检查

```cmd
pnpm run type-check
```

### 代码格式化

```cmd
pnpm run format
```

### 代码规范检查

```cmd
pnpm run lint
```

### 重新生成数据库迁移

```cmd
pnpm run db:generate
pnpm run db:push
```

### 查看数据库

```cmd
pnpm run db:studio
```

---

## 🚨 常见问题及解决方案

### 问题1：端口3000被占用

**错误信息：**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案：**

**查找占用端口的进程：**

```cmd
netstat -ano | findstr :3000
```

**关闭进程（替换<PID>为实际PID）：**

```cmd
taskkill /PID <PID> /F
```

**或更换端口：**

```cmd
pnpm run dev -- -p 3001
```

然后访问：http://localhost:3001

---

### 问题2：依赖安装失败

**错误信息：**
```
Error: Cannot find module 'xxx'
```

**解决方案：**

**清理缓存：**

```cmd
pnpm store prune
```

**删除node_modules：**

```cmd
rmdir /s /q node_modules
```

**重新安装：**

```cmd
pnpm install
```

---

### 问题3：数据库连接失败

**错误信息：**
```
Error: Connection refused
```

**解决方案：**

**检查DATABASE_URL配置：**

```cmd
type .env | findstr DATABASE_URL
```

**验证数据库连接：**

```cmd
pnpm run db:studio
```

**如果仍然失败，检查：**
- Neon数据库是否在线
- 网络连接是否正常
- DATABASE_URL格式是否正确

---

### 问题4：环境变量未加载

**错误信息：**
```
Error: JWT_SECRET is not defined
```

**解决方案：**

**检查.env文件是否存在：**

```cmd
dir .env
```

**检查环境变量配置：**

```cmd
type .env
```

**重启开发服务器：**

```cmd
# 按 Ctrl + C 停止
# 重新启动
pnpm run dev
```

---

### 问题5：邮件发送失败

**错误信息：**
```
Error: Invalid login
```

**解决方案：**

**检查SMTP配置：**

```cmd
type .env | findstr SMTP
```

**确认配置正确：**
- SMTP_USER: 208343256@qq.com
- SMTP_PASSWORD: xxwbcxaojrqwbjia
- SMTP_HOST: smtp.qq.com

---

## 🌐 部署到生产环境（使用自定义域名）

### 步骤1：构建生产版本

```cmd
pnpm run build
```

### 步骤2：启动生产服务器

```cmd
pnpm run start
```

### 步骤3：配置Vercel环境变量

**在Vercel Dashboard中配置：**

1. 访问：https://vercel.com/dashboard
2. 选择 `pulseopti-hr` 项目
3. 点击"Settings" → "Environment Variables"
4. 添加以下环境变量：

```
DATABASE_URL=postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_APP_URL=https://www.aizhixuan.com.cn
NODE_ENV=production
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=208343256@qq.com
SMTP_PASSWORD=xxwbcxaojrqwbjia
SMTP_FROM=PulseOpti HR <208343256@qq.com>
SMTP_NAME=PulseOpti HR 脉策聚效
EMAIL_PROVIDER=smtp
ENABLE_EMAIL_SERVICE=true
SMS_PROVIDER=mock
ENABLE_SMS_SERVICE=true
COZE_API_KEY=a915ab35-9534-43ad-b925-d9102c5007ba
LOG_LEVEL=info
```

### 步骤4：部署到Vercel

```cmd
vercel --prod
```

### 步骤5：配置自定义域名DNS解析

**在域名服务商（阿里云/腾讯云）添加DNS记录：**

| 类型 | 主机记录 | 记录值 | TTL |
|------|----------|--------|-----|
| CNAME | www | cname.vercel-dns.com | 600 |

### 步骤6：等待DNS生效

DNS解析生效时间：10分钟 - 48小时

### 步骤7：验证部署

访问：https://www.aizhixuan.com.cn

---

## 📊 配置信息汇总

### 环境变量配置

| 配置项 | 值 |
|--------|-----|
| DATABASE_URL | postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require |
| JWT_SECRET | a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1 |
| NEXT_PUBLIC_APP_URL | http://localhost:3000 |
| NODE_ENV | development |
| SMTP_HOST | smtp.qq.com |
| SMTP_PORT | 587 |
| SMTP_SECURE | false |
| SMTP_USER | 208343256@qq.com |
| SMTP_PASSWORD | xxwbcxaojrqwbjia |
| COZE_API_KEY | a915ab35-9534-43ad-b925-d9102c5007ba |

### 超级管理员账号

| 类型 | 值 |
|------|-----|
| 邮箱 | 208343256@qq.com |
| 密码 | admin123 |

### 域名配置

| 类型 | 值 |
|------|-----|
| 自定义域名 | https://www.aizhixuan.com.cn |
| 本地环境 | http://localhost:3000 |
| Vercel域名 | https://pulseopti-hr.vercel.app |

---

## 📞 联系支持

- **邮箱：** PulseOptiHR@163.com
- **地址：** 广州市天河区

---

**文档创建时间：** 2025-01-11
**文档版本：** v1.0
**配置状态：** ✅ 已完成
