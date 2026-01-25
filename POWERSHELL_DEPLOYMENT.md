# PowerShell 部署快速指南

## 🚀 方式一：使用 CMD 脚本（推荐，无需修改执行策略）

在 PowerShell 中执行：

```powershell
# 进入项目目录
cd C:\PulseOpti-HR\PulseOpti-HR

# 运行启动脚本
.\START_DEPLOYMENT.cmd
```

---

## 🚀 方式二：使用 PowerShell 脚本

在 PowerShell 中执行：

```powershell
# 进入项目目录
cd C:\PulseOpti-HR\PulseOpti-HR

# 临时修改执行策略（仅当前会话）
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# 运行部署脚本
.\Start-Deployment.ps1
```

---

## 📋 完整部署步骤

### 步骤 1：准备环境（2 分钟）

在 PowerShell 中：

```powershell
cd C:\PulseOpti-HR\PulseOpti-HR
.\START_DEPLOYMENT.cmd
```

这会：
- ✅ 检查并创建 .env 文件
- ✅ 检查依赖（Node.js、pnpm、Vercel CLI）

### 步骤 2：安装 Vercel CLI（如果尚未安装）

```powershell
npm install -g vercel
```

### 步骤 3：登录 Vercel

```powershell
vercel login
```

按照提示选择登录方式（推荐 GitHub）

### 步骤 4：链接到 Vercel 项目

```powershell
vercel link
```

- 选择 Vercel 账号
- 选择或创建项目 `pulseopti-hr`

### 步骤 5：配置生产环境变量

在新窗口中，逐个执行以下命令：

```powershell
# 1. 数据库连接
vercel env add DATABASE_URL production
```
粘贴：
```
postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

```powershell
# 2. JWT 密钥
vercel env add JWT_SECRET production
```
粘贴：
```
PulseOptiHR_SuperSecretKey_2024_Production_Secure_Random_String_DoNotChangeInProduction
```

```powershell
# 3. JWT 过期时间
vercel env add JWT_EXPIRES_IN production
```
粘贴：
```
7d
```

```powershell
# 4. Node 环境
vercel env add NODE_ENV production
```
粘贴：
```
production
```

```powershell
# 5. 应用 URL
vercel env add NEXT_PUBLIC_APP_URL production
```
粘贴：
```
https://pulseopti-hr.vercel.app
```

### 步骤 6：运行数据库迁移

```powershell
pnpm drizzle-kit push
```

预期输出：
```
[✓] Pulling schema from database...
[i] No changes detected
```

### 步骤 7：部署到生产环境

```powershell
vercel --prod
```

预期输出：
```
✅ Production: https://pulseopti-hr.vercel.app
```

---

## ✅ 部署验证

### 1. 访问生产环境

打开浏览器访问：https://pulseopti-hr.vercel.app

### 2. 测试关键功能

- ✅ 首页加载（预期 < 0.5 秒）
- ✅ 用户注册
- ✅ 用户登录
- ✅ 数据库连接

---

## 🔍 故障排查

### 问题 1：PowerShell 执行策略限制

**错误**：
```
无法加载文件 Start-Deployment.ps1，因为在此系统上禁止运行脚本
```

**解决方案**：
- 使用 `.\START_DEPLOYMENT.cmd` 而不是 `.ps1` 文件
- 或者临时修改执行策略：
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
  ```

### 问题 2：Vercel 登录失败

**错误**：
```
Error: No existing credentials found
```

**解决方案**：
```powershell
vercel login
```
按照提示完成登录（支持 GitHub、GitLab、Bitbucket）

### 问题 3：环境变量配置失败

**错误**：
```
Error: No project found
```

**解决方案**：
```powershell
vercel link
```
确保已链接到 Vercel 项目

### 问题 4：数据库迁移失败

**错误**：
```
Connection refused
```

**解决方案**：
- 检查 DATABASE_URL 是否正确
- 确保网络可以访问 Neon PostgreSQL
- 尝试手动测试连接：
  ```powershell
  # 需要先安装 psql 客户端
  psql "postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require" -c "SELECT version();"
  ```

---

## 📊 环境变量总结

| 变量名 | 值 |
|--------|-----|
| DATABASE_URL | postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require |
| JWT_SECRET | PulseOptiHR_SuperSecretKey_2024_Production_Secure_Random_String_DoNotChangeInProduction |
| JWT_EXPIRES_IN | 7d |
| NODE_ENV | production |
| NEXT_PUBLIC_APP_URL | https://pulseopti-hr.vercel.app |

---

## 🔗 重要链接

- **生产环境地址**: https://pulseopti-hr.vercel.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub 仓库**: https://github.com/tomato-writer-2024/PulseOpti-HR

---

## 📞 获取帮助

- **邮箱**: PulseOptiHR@163.com
- **地址**: 广州市天河区

---

## 🎉 部署成功！

恭喜！PulseOpti HR 已成功部署到 Vercel 生产环境！

**生产环境地址**：https://pulseopti-hr.vercel.app

现在你可以：
- ✅ 开始使用系统
- ✅ 邀请团队成员
- ✅ 配置业务流程
- ✅ 查看数据分析
