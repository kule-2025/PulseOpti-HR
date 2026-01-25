# PulseOpti HR 脉策聚效 - 环境配置快速开始

## 📌 项目信息

**项目名称：** PulseOpti HR 脉策聚效
**本地路径：** C:\PulseOpti-HR\PulseOpti-HR
**生产域名：** https://www.aizhixuan.com.cn
**Vercel域名：** https://pulseopti-hr.vercel.app

---

## 🚀 快速开始（3步）

### 步骤1：运行配置脚本

双击运行以下任一文件：

- **start-setup.bat** - 自动化环境配置（推荐）
- **setup-development-env.cmd** - 环境配置脚本

或使用CMD命令：

```cmd
cd /d C:\PulseOpti-HR\PulseOpti-HR
start-setup.bat
```

### 步骤2：配置环境变量

根据脚本提示，编辑`.env`文件，配置以下必需项：

```env
# 数据库（从Neon控制台复制）
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/pulsoptihr?sslmode=require

# JWT密钥（运行: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"）
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

### 步骤3：启动开发服务器

```cmd
pnpm run dev
```

访问：http://localhost:3000

---

## 🔑 获取必需配置

### Neon数据库连接字符串

1. 访问：https://console.neon.tech
2. 创建项目并获取连接字符串
3. 配置到`DATABASE_URL`

### JWT密钥

运行命令生成：

```cmd
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Gmail应用专用密码

1. 访问：https://myaccount.google.com/apppasswords
2. 生成"PulseOpti HR"应用专用密码
3. 配置到`SMTP_PASSWORD`

---

## 📚 文档导航

### 快速开始

- **WINDOWS_QUICKSTART.md** - Windows快速开始指南（推荐新手）
- **ENV_SETUP_GUIDE_MASTER.md** - 环境配置总览
- **QUICK_REFERENCE.md** - 快速参考指南

### 详细配置

- **ENV_CONFIGURATION_GUIDE.md** - 环境变量配置完整指南
- **CMD_EXECUTION_GUIDE.md** - CMD操作步骤完整指南

### 部署相关

- **DEPLOYMENT_GUIDE.md** - 部署指南
- **QUICKSTART.md** - 部署快速开始
- **VERCEL_DEPLOYMENT_GUIDE.md** - Vercel部署指南

---

## 🛠️ 自动化脚本

### 配置脚本

- **start-setup.bat** - 启动环境配置（推荐）
- **setup-development-env.cmd** - 环境配置脚本
- **verify-setup.bat** - 验证环境配置
- **verify-env-config.cmd** - 环境配置验证

### 部署脚本

- **deploy-vercel.bat** - 部署到Vercel
- **setup-vercel-env.bat** - 配置Vercel环境变量
- **verify-vercel-deployment.bat** - 验证Vercel部署

---

## 🌐 自定义域名配置

### 生产环境域名

**自定义域名：** www.aizhixuan.com.cn

**DNS配置：**

| 类型 | 主机记录 | 记录值 | TTL |
|------|----------|--------|-----|
| CNAME | www | cname.vercel-dns.com | 600 |

**Vercel环境变量：**

```env
NEXT_PUBLIC_APP_URL=https://www.aizhixuan.com.cn
NODE_ENV=production
```

---

## 🎯 常用命令

### 开发

```cmd
# 启动开发服务器
pnpm run dev

# 构建生产版本
pnpm run build

# 启动生产服务器
pnpm run start
```

### 数据库

```cmd
# 生成迁移文件
pnpm run db:generate

# 推送表结构到数据库
pnpm run db:push

# 打开数据库可视化工具
pnpm run db:studio
```

### 验证

```cmd
# 验证环境变量配置
verify-setup.bat

# 类型检查
pnpm run type-check

# 代码规范检查
pnpm run lint
```

---

## 🚨 常见问题

### 无法执行 .cmd 文件

**解决方案：**

```cmd
# 方式1：使用 .bat 文件
start-setup.bat

# 方式2：直接执行 .cmd 文件
.\setup-development-env.cmd

# 方式3：使用 call 命令
call setup-development-env.cmd
```

### 端口3000被占用

```cmd
# 查找占用端口的进程
netstat -ano | findstr :3000

# 关闭进程
taskkill /PID <PID> /F

# 或更换端口
pnpm run dev -- -p 3001
```

### 依赖安装失败

```cmd
# 清理缓存
pnpm store prune

# 删除node_modules
rmdir /s /q node_modules

# 重新安装
pnpm install
```

---

## 📞 联系支持

- **邮箱：** PulseOptiHR@163.com
- **地址：** 广州市天河区

---

## 🌐 应用访问地址

### 本地开发
- **首页：** http://localhost:3000
- **数据库：** http://localhost:4983

### 生产环境
- **自定义域名：** https://www.aizhixuan.com.cn
- **Vercel域名：** https://pulseopti-hr.vercel.app

---

**最后更新时间：** 2025-01-11
**文档版本：** v1.1
