# PowerShell 直接部署指南（无需脚本文件）

## 🚀 方式一：在 CMD 中执行（最简单）

### 步骤 1：打开 CMD

按 `Win + R`，输入 `cmd`，按回车

### 步骤 2：进入项目目录

```cmd
cd C:\PulseOpti-HR\PulseOpti-HR
```

### 步骤 3：创建 .env 文件

```cmd
(
echo DATABASE_URL=postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
echo JWT_SECRET=PulseOptiHR_SuperSecretKey_2024_Production_Secure_Random_String_DoNotChangeInProduction
echo JWT_EXPIRES_IN=7d
echo NODE_ENV=production
echo NEXT_PUBLIC_APP_URL=https://pulseopti-hr.vercel.app
) > .env
```

### 步骤 4：检查文件

```cmd
type .env
```

### 步骤 5：安装依赖

```cmd
pnpm install
```

### 步骤 6：安装 Vercel CLI

```cmd
npm install -g vercel
```

### 步骤 7：登录 Vercel

```cmd
vercel login
```

### 步骤 8：链接项目

```cmd
vercel link
```

### 步骤 9：配置环境变量（逐个执行）

```cmd
vercel env add DATABASE_URL production
```
粘贴：
```
postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

```cmd
vercel env add JWT_SECRET production
```
粘贴：
```
PulseOptiHR_SuperSecretKey_2024_Production_Secure_Random_String_DoNotChangeInProduction
```

```cmd
vercel env add JWT_EXPIRES_IN production
```
粘贴：
```
7d
```

```cmd
vercel env add NODE_ENV production
```
粘贴：
```
production
```

```cmd
vercel env add NEXT_PUBLIC_APP_URL production
```
粘贴：
```
https://pulseopti-hr.vercel.app
```

### 步骤 10：运行数据库迁移

```cmd
pnpm drizzle-kit push
```

### 步骤 11：部署到生产环境

```cmd
vercel --prod
```

---

## 🚀 方式二：在 PowerShell 中直接执行（无需脚本）

### 步骤 1：打开 PowerShell

右键"开始"菜单，选择"Windows PowerShell"

### 步骤 2：进入项目目录

```powershell
cd C:\PulseOpti-HR\PulseOpti-HR
```

### 步骤 3：创建 .env 文件

```powershell
@"
DATABASE_URL=postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=PulseOptiHR_SuperSecretKey_2024_Production_Secure_Random_String_DoNotChangeInProduction
JWT_EXPIRES_IN=7d
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://pulseopti-hr.vercel.app
"@ | Out-File -FilePath ".env" -Encoding UTF8
```

### 步骤 4：检查文件

```powershell
Get-Content .env
```

### 步骤 5：安装依赖

```powershell
pnpm install
```

### 步骤 6：安装 Vercel CLI

```powershell
npm install -g vercel
```

### 步骤 7：登录 Vercel

```powershell
vercel login
```

### 步骤 8：链接项目

```powershell
vercel link
```

### 步骤 9：配置环境变量（逐个执行）

```powershell
vercel env add DATABASE_URL production
```
粘贴：
```
postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

```powershell
vercel env add JWT_SECRET production
```
粘贴：
```
PulseOptiHR_SuperSecretKey_2024_Production_Secure_Random_String_DoNotChangeInProduction
```

```powershell
vercel env add JWT_EXPIRES_IN production
```
粘贴：
```
7d
```

```powershell
vercel env add NODE_ENV production
```
粘贴：
```
production
```

```powershell
vercel env add NEXT_PUBLIC_APP_URL production
```
粘贴：
```
https://pulseopti-hr.vercel.app
```

### 步骤 10：运行数据库迁移

```powershell
pnpm drizzle-kit push
```

### 步骤 11：部署到生产环境

```powershell
vercel --prod
```

---

## ✅ 验证部署

### 1. 访问生产环境

打开浏览器访问：https://pulseopti-hr.vercel.app

### 2. 测试关键功能

- ✅ 首页加载（预期 < 0.5 秒）
- ✅ 用户注册
- ✅ 用户登录
- ✅ 数据库连接

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

**推荐使用 CMD 方式（方式一），更简单直接！** 🚀
