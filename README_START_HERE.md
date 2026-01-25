# PulseOpti HR 脉策聚效 - 配置完成，开始使用

## 🎉 恭喜！环境配置已完成

根据您提供的真实信息，已为您完成所有配置：

✅ Neon数据库连接字符串已配置
✅ QQ邮箱SMTP已配置
✅ 豆包大语言模型API Key已配置
✅ 超级管理员账号已确认
✅ 自定义域名已记录

---

## 📌 项目信息

### 项目路径
```
C:\PulseOpti-HR\PulseOpti-HR
```

### 自定义域名
```
https://www.aizhixuan.com.cn
```

### 超级管理员账号
```
邮箱：208343256@qq.com
密码：admin123
```

---

## 🚀 快速开始（5分钟）

### 方法1：使用记事本创建 .env 文件（推荐）

**步骤1：打开CMD并切换到项目目录**
```cmd
cd /d C:\PulseOpti-HR\PulseOpti-HR
```

**步骤2：创建 .env 文件**
```cmd
notepad .env
```

**步骤3：复制配置内容**
打开 `ENV_FILE_CONTENT.txt` 文件，复制全部内容，粘贴到 .env 文件中，保存并关闭。

**步骤4：安装依赖**
```cmd
pnpm install
```

**步骤5：初始化数据库**
```cmd
pnpm run db:generate
pnpm run db:push
```

**步骤6：启动开发服务器**
```cmd
pnpm run dev
```

**步骤7：访问应用**
打开浏览器：http://localhost:3000

---

## 📚 文档导航

### 核心文档（必读）

1. **[ENV_COMPLETE_CONFIG.md](ENV_COMPLETE_CONFIG.md)** - 完整环境变量配置文件
   - 包含所有配置项的详细说明
   - 完整的 .env 文件内容
   - 配置验证清单

2. **[CMD_EXECUTION_STEPS.md](CMD_EXECUTION_STEPS.md)** - CMD执行命令详细步骤
   - 13个详细步骤
   - 每个步骤的命令和预期输出
   - 常见问题解决方案
   - 部署到生产环境的步骤

3. **[ENV_FILE_CONTENT.txt](ENV_FILE_CONTENT.txt)** - .env 文件内容（直接复制）
   - 完整的 .env 文件内容
   - 所有配置项已填入真实信息
   - 直接复制到 .env 文件使用

4. **[QUICK_REFERENCE_CARD.md](QUICK_REFERENCE_CARD.md)** - 快速参考卡片
   - 核心配置信息汇总
   - 超级管理员账号
   - 常用命令速查
   - 常见问题快速解决

---

## 🔑 核心配置信息

### 数据库配置
```
DATABASE_URL=postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### JWT认证
```
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1
JWT_EXPIRES_IN=7d
```

### 邮件服务（QQ邮箱）
```
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=208343256@qq.com
SMTP_PASSWORD=xxwbcxaojrqwbjia
```

### AI集成（豆包）
```
COZE_API_KEY=a915ab35-9534-43ad-b925-d9102c5007ba
```

---

## 🌐 域名配置

### 本地开发环境
```
http://localhost:3000
```

### 生产环境
```
自定义域名：https://www.aizhixuan.com.cn
Vercel域名：https://pulseopti-hr.vercel.app
```

### DNS配置（生产环境）
在域名服务商添加以下DNS记录：

| 类型 | 主机记录 | 记录值 | TTL |
|------|----------|--------|-----|
| CNAME | www | cname.vercel-dns.com | 600 |

---

## 🛠️ 常用命令

### 开发命令
```cmd
pnpm run dev              # 启动开发服务器
pnpm run build            # 构建生产版本
pnpm run start            # 启动生产服务器
pnpm run type-check       # 类型检查
```

### 数据库命令
```cmd
pnpm run db:generate      # 生成迁移文件
pnpm run db:push          # 推送表结构到数据库
pnpm run db:studio        # 打开数据库可视化工具
```

---

## 🚨 常见问题快速解决

### 问题1：端口3000被占用
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### 问题2：依赖安装失败
```cmd
pnpm store prune
rmdir /s /q node_modules
pnpm install
```

### 问题3：数据库连接失败
```cmd
# 检查配置
type .env | findstr DATABASE_URL

# 测试连接
pnpm run db:studio
```

---

## ✅ 配置验证清单

完成配置后，请验证以下项目：

- [ ] .env 文件已创建
- [ ] DATABASE_URL 配置正确
- [ ] JWT_SECRET 已配置
- [ ] SMTP 配置正确（QQ邮箱）
- [ ] COZE_API_KEY 已配置
- [ ] 依赖安装成功
- [ ] 数据库初始化成功（59个表）
- [ ] 开发服务器启动成功
- [ ] 可以访问 http://localhost:3000
- [ ] 可以使用超级管理员账号登录（208343256@qq.com / admin123）

---

## 🌐 部署到生产环境

### 步骤1：构建生产版本
```cmd
pnpm run build
```

### 步骤2：配置Vercel环境变量
在Vercel Dashboard中配置以下环境变量：

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

### 步骤3：部署到Vercel
```cmd
vercel --prod
```

### 步骤4：配置DNS解析
在域名服务商添加CNAME记录。

### 步骤5：验证部署
访问：https://www.aizhixuan.com.cn

---

## 📞 联系支持

```
邮箱：PulseOptiHR@163.com
地址：广州市天河区
```

---

## 📖 相关文档

- [ENV_COMPLETE_CONFIG.md](ENV_COMPLETE_CONFIG.md) - 完整环境变量配置文件
- [CMD_EXECUTION_STEPS.md](CMD_EXECUTION_STEPS.md) - CMD执行命令详细步骤
- [ENV_FILE_CONTENT.txt](ENV_FILE_CONTENT.txt) - .env 文件内容（直接复制）
- [QUICK_REFERENCE_CARD.md](QUICK_REFERENCE_CARD.md) - 快速参考卡片
- [QUICK_START_WINDOWS.md](QUICK_START_WINDOWS.md) - Windows快速开始指南
- [WINDOWS_INSTALL_GUIDE.md](WINDOWS_INSTALL_GUIDE.md) - Windows本地环境配置指南

---

**配置完成时间：** 2025-01-11
**配置状态：** ✅ 已完成
**配置版本：** v1.0

---

## 🎯 下一步操作

1. 打开 `ENV_FILE_CONTENT.txt` 文件
2. 复制全部内容
3. 创建 `.env` 文件并粘贴内容
4. 执行 `pnpm install` 安装依赖
5. 执行 `pnpm run db:generate` 和 `pnpm run db:push` 初始化数据库
6. 执行 `pnpm run dev` 启动开发服务器
7. 访问 http://localhost:3000
8. 使用超级管理员账号登录（208343256@qq.com / admin123）

**祝您使用愉快！** 🎉
