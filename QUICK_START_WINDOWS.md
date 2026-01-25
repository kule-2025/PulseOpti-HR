# PulseOpti HR - 5分钟快速开始（Windows）

## 📌 项目路径

```
C:\PulseOpti-HR\PulseOpti-HR
```

---

## ⚡ 5分钟快速开始

### 步骤1：打开CMD并切换到项目目录

按 `Win + R`，输入 `cmd`，然后执行：

```cmd
cd /d C:\PulseOpti-HR\PulseOpti-HR
```

---

### 步骤2：创建 .env 文件

**方法1：使用记事本（推荐）**

1. 执行以下命令：
```cmd
notepad .env
```

2. 如果提示"不存在该文件，是否创建？"，点击"是"

3. 复制以下内容并粘贴到记事本：

```env
# 数据库配置（从Neon控制台复制）
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/pulsoptihr?sslmode=require

# JWT认证配置（运行: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"）
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

4. 修改以下必需配置：
   - `DATABASE_URL`: 替换为你的Neon数据库连接字符串
   - `JWT_SECRET`: 运行 `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` 生成密钥
   - `SMTP_USER`: 替换为你的Gmail邮箱
   - `SMTP_PASSWORD`: 替换为你的Gmail应用专用密码

5. 保存文件（Ctrl + S），关闭记事本

---

**方法2：使用命令行复制**

```cmd
(
echo # 数据库配置（从Neon控制台复制）
echo DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/pulsoptihr?sslmode=require
echo.
echo # JWT认证配置
echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
echo JWT_EXPIRES_IN=7d
echo.
echo # 应用配置
echo NEXT_PUBLIC_APP_URL=http://localhost:3000
echo NODE_ENV=development
echo.
echo # 邮件服务配置 - Gmail SMTP
echo SMTP_HOST=smtp.gmail.com
echo SMTP_PORT=587
echo SMTP_SECURE=false
echo SMTP_USER=your-email@gmail.com
echo SMTP_PASSWORD=your-app-password
echo SMTP_FROM=PulseOpti HR ^<PulseOptiHR@163.com^>
echo SMTP_NAME=PulseOpti HR 脉策聚效
echo.
echo # 功能开关
echo EMAIL_PROVIDER=smtp
echo ENABLE_EMAIL_SERVICE=true
echo.
echo # 短信服务配置 - Mock模式
echo SMS_PROVIDER=mock
echo ENABLE_SMS_SERVICE=true
) > .env
```

然后编辑 `.env` 文件修改必需配置：

```cmd
notepad .env
```

---

### 步骤3：安装依赖

```cmd
pnpm install
```

**预计时间：** 3-5分钟（首次安装）

---

### 步骤4：初始化数据库

```cmd
pnpm run db:generate
pnpm run db:push
```

**说明：** 这将在Neon数据库中创建59个表

---

### 步骤5：启动开发服务器

```cmd
pnpm run dev
```

**保持CMD窗口打开，不要关闭**

---

### 步骤6：访问应用

打开浏览器，访问：http://localhost:3000

**🎉 恭喜！应用已成功启动！**

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

---

### 2. JWT密钥

**生成命令：**

打开新CMD窗口，执行：

```cmd
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**复制输出的随机字符串，替换到 .env 文件的 JWT_SECRET**

**示例输出：**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1
```

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

**重要：** 使用应用专用密码，不是Gmail登录密码！

---

## 🛠️ 常用命令

```cmd
# 启动开发服务器
pnpm run dev

# 构建生产版本
pnpm run build

# 启动生产服务器
pnpm run start

# 类型检查
pnpm run type-check

# 生成数据库迁移文件
pnpm run db:generate

# 推送表结构到数据库
pnpm run db:push

# 打开数据库可视化工具
pnpm run db:studio
```

---

## 🚨 常见问题

### 问题1：.env 文件保存为 .env.txt

**解决方案：**

1. 打开文件夹
2. 点击"查看" → 勾选"文件扩展名"
3. 重命名文件，删除 `.txt` 后缀

---

### 问题2：端口3000被占用

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

```cmd
# 清理缓存
pnpm store prune

# 删除node_modules
rmdir /s /q node_modules

# 重新安装
pnpm install
```

---

### 问题4：数据库连接失败

**检查清单：**
1. `DATABASE_URL` 是否正确
2. Neon数据库是否在线
3. 网络连接是否正常

**测试数据库连接：**
```cmd
pnpm run db:studio
```

---

## 🌐 应用访问地址

### 本地开发环境
- **首页：** http://localhost:3000
- **数据库：** http://localhost:4983（Drizzle Studio）

### 生产环境
- **自定义域名：** https://www.aizhixuan.com.cn
- **Vercel域名：** https://pulseopti-hr.vercel.app

---

## 📞 联系支持

- **邮箱：** PulseOptiHR@163.com
- **地址：** 广州市天河区

---

**最后更新时间：** 2025-01-11
**文档版本：** v1.0
