# PulseOpti HR - Windows 快速开始指南

## 📌 项目路径

**本地存储路径：**
```
C:\PulseOpti-HR\PulseOpti-HR
```

---

## 🚀 方法1：使用自动化脚本（推荐）

### 步骤1：打开CMD命令提示符

- 按 `Win + R`
- 输入 `cmd`
- 按回车

### 步骤2：切换到项目目录

```cmd
cd /d C:\PulseOpti-HR\PulseOpti-HR
```

### 步骤3：运行环境配置脚本

```cmd
start-setup.bat
```

**脚本将自动完成：**
1. 检查Node.js和pnpm安装
2. 创建.env文件
3. 提示编辑环境变量
4. 安装依赖
5. 初始化数据库
6. 启动开发服务器

---

## ⚙️ 方法2：手动配置

### 步骤1：切换到项目目录

```cmd
cd /d C:\PulseOpti-HR\PulseOpti-HR
```

### 步骤2：创建环境变量文件

```cmd
copy .env.example .env
```

### 步骤3：编辑环境变量

```cmd
notepad .env
```

**配置以下必需项：**

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

### 步骤4：安装依赖

```cmd
pnpm install
```

### 步骤5：初始化数据库

```cmd
pnpm run db:generate
pnpm run db:push
```

### 步骤6：启动开发服务器

```cmd
pnpm run dev
```

### 步骤7：访问应用

打开浏览器，访问：http://localhost:3000

---

## 🔑 获取必需配置

### 1. Neon数据库连接字符串

**步骤：**
1. 访问：https://console.neon.tech
2. 登录并创建项目
3. 点击"Connection Details"
4. 复制连接字符串

**格式：**
```
postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/pulsoptihr?sslmode=require
```

### 2. JWT密钥

**生成命令：**

打开新CMD窗口，执行：

```cmd
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**复制输出的随机字符串，替换到 .env 文件的 JWT_SECRET**

### 3. Gmail应用专用密码

**步骤：**
1. 访问：https://myaccount.google.com/security
2. 开启"两步验证"
3. 访问：https://myaccount.google.com/apppasswords
4. 选择"邮件" → "其他（自定义名称）"
5. 输入"PulseOpti HR" → 点击"生成"
6. 复制16位密码（格式：`xxxx xxxx xxxx xxxx`）

**配置到 .env 文件：**

```env
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
```

---

## 🌐 自定义域名配置

### 生产环境域名

**自定义域名：** www.aizhixuan.com.cn

**Vercel项目域名：** pulseopti-hr.vercel.app

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
```

**步骤5：重新部署**

```cmd
vercel --prod
```

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

### 验证命令

```cmd
# 验证环境变量配置
verify-env-config.cmd

# 验证数据库连接
pnpm run db:studio

# 验证类型检查
pnpm run type-check
```

---

## 🚨 常见问题

### 问题1：无法执行 .cmd 文件

**错误信息：**
```
'setup-development-env.cmd' 不是内部或外部命令
```

**解决方案：**

1. 确保在正确的目录：
```cmd
cd /d C:\PulseOpti-HR\PulseOpti-HR
dir
```

2. 检查文件是否存在：
```cmd
dir *.cmd
```

3. 使用正确的执行方式：
```cmd
# 方式1：使用 .bat 文件
start-setup.bat

# 方式2：直接执行 .cmd 文件
.\setup-development-env.cmd

# 方式3：使用 call 命令
call setup-development-env.cmd
```

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

### 问题4：环境变量未加载

**解决方案：**

```cmd
# 检查.env文件是否存在
dir .env

# 重启开发服务器
pnpm run dev
```

### 问题5：Gmail邮件发送失败

**错误：** `Invalid login`

**解决方案：**

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

如遇问题，请联系：

- **邮箱：** PulseOptiHR@163.com
- **地址：** 广州市天河区

---

## 📚 相关文档

- [环境变量配置完整指南](ENV_CONFIGURATION_GUIDE.md)
- [CMD操作步骤完整指南](CMD_EXECUTION_GUIDE.md)
- [快速参考指南](QUICK_REFERENCE.md)
- [环境配置总览](ENV_SETUP_GUIDE_MASTER.md)

---

**最后更新时间：** 2025-01-11
**文档版本：** v1.1（包含自定义域名配置）
