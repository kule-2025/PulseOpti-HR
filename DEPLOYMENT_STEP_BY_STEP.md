# CMD 部署详细步骤指南

> 逐步执行，每一步都有详细的命令和验证方法

---

## 📋 部署前准备

### 重要信息

- **GitHub 仓库**：https://github.com/tomato-writer-2024/PulseOpti-HR
- **Neon 连接字符串**：`postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require`
- **项目名称**：pulseopti-hr

### 必需工具清单

在开始之前，请确保已安装以下工具：

1. **Node.js** (18.x 或更高)
2. **Git**
3. **pnpm**（通过 npm 安装）
4. **Vercel CLI**（通过 npm 安装）

---

## 🚀 开始部署

### 步骤 1：验证 Node.js 安装

打开 CMD（以管理员身份运行），执行以下命令：

```cmd
node --version
```

**预期输出**：
```
v18.x.x 或 v20.x.x
```

**如果未安装**：
1. 访问 https://nodejs.org
2. 下载 LTS 版本（推荐 18.x）
3. 安装后重新打开 CMD 验证

---

### 步骤 2：验证 Git 安装

```cmd
git --version
```

**预期输出**：
```
git version 2.x.x
```

**如果未安装**：
1. 访问 https://git-scm.com/downloads
2. 下载 Windows 版本并安装
3. 安装后重新打开 CMD 验证

---

### 步骤 3：安装 pnpm

```cmd
npm install -g pnpm
```

**预期输出**：
```
added 1 package in xx seconds
```

**验证安装**：
```cmd
pnpm --version
```

**预期输出**：
```
9.x.x
```

---

### 步骤 4：安装 Vercel CLI

```cmd
npm install -g vercel
```

**预期输出**：
```
added 1 package in xx seconds
```

**验证安装**：
```cmd
vercel --version
```

**预期输出**：
```
32.x.x
```

---

### 步骤 5：创建工作目录

```cmd
REM 切换到 C 盘根目录
C:

REM 创建 Projects 目录
mkdir Projects

REM 进入 Projects 目录
cd C:\Projects

REM 查看当前目录（应该是 C:\Projects）
cd
```

**预期输出**：
```
C:\Projects
```

---

### 步骤 6：克隆 GitHub 仓库

```cmd
git clone https://github.com/tomato-writer-2024/PulseOpti-HR.git
```

**预期输出**：
```
Cloning into 'PulseOpti-HR'...
remote: Enumerating objects: xxx, done.
remote: Counting objects: 100% (xxx/xxx), done.
remote: Compressing objects: 100% (xxx/xxx), done.
remote: Total xxx (delta xx), reused xx (delta xx), pack-reused 0
Receiving objects: 100% (xxx/xxx), xx.xx MiB | xx.xx MiB/s, done.
Resolving deltas: 100% (xx/xx), done.
```

---

### 步骤 7：进入项目目录

```cmd
cd PulseOpti-HR
```

**验证目录**：
```cmd
REM 查看项目文件
dir
```

**预期输出**：应该看到以下文件/文件夹：
```
DEPLOYMENT_GUIDE.md
DEPLOYMENT_STEP_BY_STEP.md
QUICK_DEPLOYMENT_CMD.md
NEON_DATABASE_SETUP.md
DEPLOYMENT_CHECKLIST.md
QUICK_DEPLOYMENT_CHECKLIST.md
drizzle.config.ts
.env.example
package.json
vercel.json
README.md
src/
public/
...
```

---

### 步骤 8：安装项目依赖

```cmd
pnpm install
```

**预期输出**：
```
Packages: +xxx
Progress: resolved xxx, reused xxx, downloaded xxx, added xxx
node_modules/.pnpm/...
Done in 30s
```

**验证安装**：
```cmd
REM 查看是否有 node_modules 目录
dir node_modules
```

**预期输出**：显示大量的依赖包文件夹

---

### 步骤 9：本地测试构建

```cmd
pnpm run build
```

**预期输出**：
```
> pulseopti-hr@0.1.0 build
> next build

  ▲ Next.js 16.x.x
  - Local:        https://localhost:3000
  - Environments: .env.local

✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (60/60)
✓ Collecting build traces
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    140 kB        140 kB
├ ○ /_not-found                          140 kB        140 kB
├ ○ /api/health                          0 B            90.4 kB
...

○  (Static)  prerendered as static content
```

**如果构建成功**，继续下一步。

**如果构建失败**：
```cmd
REM 清理并重新安装
rmdir /s /q node_modules
pnpm install
pnpm run build
```

---

### 步骤 10：登录 Vercel

```cmd
vercel login
```

**预期操作**：
1. CMD 会提示：
   ```
   ? Vercel username:  [linked]
   ? Log in to Vercel? [Y/n]
   ```
   输入 `Y`

2. 浏览器会自动打开 Vercel 登录页面

3. 使用 GitHub 账号登录

4. 浏览器显示 "Success! Logged in as YourUsername"

5. 回到 CMD，会显示：
   ```
   ✓ Logged in as YourUsername (gitHub)
   ```

---

### 步骤 11：部署项目到 Vercel

```cmd
vercel
```

**会询问以下问题，按提示回答**：

**问题 1**：
```
? Set up and deploy "~/C:\Projects\PulseOpti-HR"? [Y/n]
```
**回答**：输入 `Y` 或直接按回车

**问题 2**：
```
? Which scope do you want to deploy to?
```
**回答**：选择你的 GitHub 账号（通常是第一个）

**问题 3**：
```
? Link to existing project? [y/N]
```
**回答**：输入 `N` 或直接按回车（首次部署选择 N）

**问题 4**：
```
? What's your project's name?
```
**回答**：输入 `pulseopti-hr` 或直接按回车（默认名称）

**问题 5**：
```
? In which directory is your code located?
```
**回答**：输入 `./` 或直接按回车（默认当前目录）

**问题 6**：
```
? Want to override the settings? [y/N]
```
**回答**：输入 `N` 或直接按回车（让 Vercel 自动识别配置）

**预期输出**（构建过程）：
```
Vercel CLI 32.x.x
? Set up and deploy "~/C:\Projects\PulseOpti-HR"? [Y/n] y
? Which scope do you want to deploy to? YourUsername
? Link to existing project? [y/N] n
? What's your project's name? pulseopti-hr
? In which directory is your code located? ./
? Want to override the settings? [y/N] n

🔍  Inspect: https://vercel.com/YourUsername/pulseopti-hr/xxx
✏️  Copy: pulseopti-hr.vercel.app
```

**构建和部署过程**（等待 2-5 分钟）：
```
▲ Next.js 16.x.x
- Local:        https://localhost:3000
- Environments: .env.local
...
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (60/60)
✓ Collecting build traces
✓ Finalizing page optimization

✓ Production: https://pulseopti-hr.vercel.app [2m 30s]
```

**重要信息**：
- **生产环境 URL**：`https://pulseopti-hr.vercel.app`
- **部署时间**：约 2-3 分钟

**记录 URL**：
```
生产环境: https://pulseopti-hr.vercel.app
```

---

### 步骤 12：添加环境变量 - DATABASE_URL

```cmd
vercel env add DATABASE_URL production
```

**预期提示**：
```
? What's the value of DATABASE_URL?
```

**输入以下连接字符串**（复制粘贴）：
```
postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**按回车确认**

**预期输出**：
```
✅ Set env DATABASE_URL in production for project pulseopti-hr
```

---

### 步骤 13：添加环境变量 - JWT_SECRET

```cmd
vercel env add JWT_SECRET production
```

**预期提示**：
```
? What's the value of JWT_SECRET?
```

**输入以下值**：
```
pulseopti-hr-secret-key-2024-production
```

**按回车确认**

**预期输出**：
```
✅ Set env JWT_SECRET in production for project pulseopti-hr
```

**💡 提示**：生产环境建议使用更安全的随机密钥，可以使用以下命令生成：
```cmd
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 步骤 14：添加环境变量 - JWT_EXPIRES_IN

```cmd
vercel env add JWT_EXPIRES_IN production
```

**预期提示**：
```
? What's the value of JWT_EXPIRES_IN?
```

**输入以下值**：
```
7d
```

**按回车确认**

**预期输出**：
```
✅ Set env JWT_EXPIRES_IN in production for project pulseopti-hr
```

---

### 步骤 15：添加环境变量 - NODE_ENV

```cmd
vercel env add NODE_ENV production
```

**预期提示**：
```
? What's the value of NODE_ENV?
```

**输入以下值**：
```
production
```

**按回车确认**

**预期输出**：
```
✅ Set env NODE_ENV in production for project pulseopti-hr
```

---

### 步骤 16：添加环境变量 - NEXT_PUBLIC_APP_URL

```cmd
vercel env add NEXT_PUBLIC_APP_URL production
```

**预期提示**：
```
? What's the value of NEXT_PUBLIC_APP_URL?
```

**输入以下值**：
```
https://pulseopti-hr.vercel.app
```

**按回车确认**

**预期输出**：
```
✅ Set env NEXT_PUBLIC_APP_URL in production for project pulseopti-hr
```

---

### 步骤 17：验证环境变量

```cmd
vercel env ls production
```

**预期输出**：
```
Environment Variables found for project pulseopti-hr:

  Name                  Value                 Environments
  ─────────────────────────────────────────────────────────
  DATABASE_URL          postgresql://...      production
  JWT_SECRET            pulseopti-...         production
  JWT_EXPIRES_IN        7d                    production
  NODE_ENV              production            production
  NEXT_PUBLIC_APP_URL   https://pulse...      production
```

**确认所有 5 个环境变量都已设置**

---

### 步骤 18：设置本地环境变量（用于数据库迁移）

```cmd
set DATABASE_URL=postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**验证环境变量**：
```cmd
REM 查看环境变量
echo %DATABASE_URL%
```

**预期输出**：显示完整的连接字符串

---

### 步骤 19：生成数据库迁移文件

```cmd
pnpm drizzle-kit generate
```

**预期输出**：
```
drizzle-kit: v0.x.x
reading config file drizzle.config.ts
2 migrations found in drizzle folder

✨ migrations generated in drizzle folder
```

**验证迁移文件**：
```cmd
dir drizzle
```

**预期输出**：应该看到 SQL 迁移文件

---

### 步骤 20：执行数据库迁移

```cmd
pnpm drizzle-kit migrate
```

**预期输出**：
```
drizzle-kit: v0.x.x
reading config file drizzle.config.ts
2 migrations found in drizzle folder

Applying migration: 0001_initial_schema
✓ Migration applied successfully

Applying migration: 0002_xxxx
✓ Migration applied successfully

✅ 59 migrations applied
```

**💡 说明**：实际迁移数量可能不同，但应该成功应用所有迁移

---

### 步骤 21：验证数据库表

访问 https://console.neon.tech 打开 SQL Editor，执行以下查询：

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**预期结果**：应该看到 59 个表，包括：
- users
- roles
- user_roles
- workflow_templates
- workflow_instances
- workflow_steps
- workflow_logs
- performance_records
- compensation_payroll
- attendance_records
- ...

**验证关键表存在**：
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'users', 'roles', 'user_roles',
    'workflow_templates', 'workflow_instances',
    'workflow_logs', 'performance_records',
    'compensation_payroll', 'attendance_records'
)
ORDER BY table_name;
```

---

### 步骤 22：重新部署应用（应用环境变量）

```cmd
vercel --prod
```

**预期输出**：
```
Vercel CLI 32.x.x
? Set up and deploy "~/C:\Projects\PulseOpti-HR"? [Y/n] y
? Which scope do you want to deploy to? YourUsername
? Link to existing project? [y/N] y
? What's your project's name? pulseopti-hr

🔍  Inspect: https://vercel.com/YourUsername/pulseopti-hr/xxx
✏️  Copy: pulseopti-hr.vercel.app
```

**构建和部署过程**（等待 2-3 分钟）：
```
▲ Next.js 16.x.x
...
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (60/60)
...
✓ Production: https://pulseopti-hr.vercel.app [2m 20s]
```

**部署成功后，记录 URL**：
```
生产环境: https://pulseopti-hr.vercel.app
```

---

## ✅ 部署验证

### 步骤 23：验证应用访问

```cmd
REM 使用 curl 测试首页
curl -I https://pulseopti-hr.vercel.app
```

**预期输出**：
```
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Cache-Control: public, max-age=0, must-revalidate
...
```

**在浏览器中打开**：
```
https://pulseopti-hr.vercel.app
```

**验证项**：
- [ ] 页面正常显示
- [ ] 品牌名称为 "PulseOpti HR 脉策聚效"
- [ ] Logo 显示正常
- [ ] 导航菜单完整
- [ ] 微信二维码显示正常
- [ ] 页脚信息正确

---

### 步骤 24：测试健康检查 API

```cmd
curl https://pulseopti-hr.vercel.app/api/health
```

**预期输出**：
```json
{
  "status": "ok",
  "timestamp": "2025-01-17T12:00:00.000Z"
}
```

---

### 步骤 25：测试用户注册 API

```cmd
curl -X POST https://pulseopti-hr.vercel.app/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"test\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

**预期输出**：
```json
{
  "user": {
    "id": 1,
    "username": "test",
    "email": "test@example.com",
    "createdAt": "2025-01-17T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 步骤 26：查看 Vercel 日志

```cmd
vercel logs --prod
```

**预期输出**：显示最近的日志记录

**验证项**：
- [ ] 无严重错误（Error）
- [ ] 无数据库连接错误
- [ ] 无超时错误
- [ ] 日志格式正常

**退出日志查看**：
```cmd
按 Ctrl+C
```

---

### 步骤 27：测试各个页面

在浏览器中访问以下页面，确保都能正常加载：

| 页面 | URL | 状态 |
|------|-----|------|
| 首页 | https://pulseopti-hr.vercel.app/ | [ ] 正常 |
| 登录页 | https://pulseopti-hr.vercel.app/login | [ ] 正常 |
| 功能介绍 | https://pulseopti-hr.vercel.app/features | [ ] 正常 |
| AI 功能 | https://pulseopti-hr.vercel.app/ai | [ ] 正常 |
| 定价页面 | https://pulseopti-hr.vercel.app/pricing | [ ] 正常 |
| 联系我们 | https://pulseopti-hr.vercel.app/contact | [ ] 正常 |
| 文档中心 | https://pulseopti-hr.vercel.app/docs | [ ] 正常 |
| 服务条款 | https://pulseopti-hr.vercel.app/terms | [ ] 正常 |
| 隐私政策 | https://pulseopti-hr.vercel.app/privacy | [ ] 正常 |

---

## 🎉 部署完成！

### 部署成功总结

**生产环境 URL**：https://pulseopti-hr.vercel.app

**配置信息**：
- GitHub 仓库：https://github.com/tomato-writer-2024/PulseOpti-HR
- Vercel 项目：https://vercel.com/dashboard
- Neon 数据库：https://console.neon.tech

**环境变量**：
- ✅ DATABASE_URL：已配置
- ✅ JWT_SECRET：已配置
- ✅ JWT_EXPIRES_IN：7d
- ✅ NODE_ENV：production
- ✅ NEXT_PUBLIC_APP_URL：https://pulseopti-hr.vercel.app

**数据库**：
- ✅ 59 个表已创建
- ✅ 数据库连接正常

---

## 📝 后续操作

### 更新代码后重新部署

```cmd
REM 1. 进入项目目录
cd C:\Projects\PulseOpti-HR

REM 2. 拉取最新代码
git pull origin main

REM 3. 重新部署
vercel --prod
```

### 查看环境变量

```cmd
vercel env ls production
```

### 查看部署日志

```cmd
vercel logs --prod
```

### 查看项目信息

```cmd
vercel inspect
```

---

## 🐛 常见问题

### 问题 1：构建失败

**错误信息**：
```
Build failed
```

**解决方案**：
```cmd
REM 清理并重新安装
rmdir /s /q node_modules
pnpm install
pnpm run build
```

---

### 问题 2：数据库连接失败

**错误信息**：
```
ConnectionError: could not connect to server
```

**解决方案**：
```cmd
REM 1. 验证环境变量
vercel env ls production

REM 2. 测试数据库连接
REM 访问 https://console.neon.tech 验证数据库状态

REM 3. 重新设置环境变量
vercel env rm DATABASE_URL production
vercel env add DATABASE_URL production
REM 重新输入连接字符串

REM 4. 重新部署
vercel --prod
```

---

### 问题 3：环境变量未生效

**错误信息**：
```
process.env.DATABASE_URL is not defined
```

**解决方案**：
```cmd
REM 1. 确认环境变量已设置
vercel env ls production

REM 2. 重新拉取环境变量
vercel env pull .env.local

REM 3. 重新部署
vercel --prod
```

---

### 问题 4：迁移失败

**错误信息**：
```
Error: relation "users" already exists
```

**解决方案**：
```sql
REM 在 Neon SQL Editor 中执行
DROP TABLE IF EXISTS users CASCADE;

REM 然后重新运行迁移
pnpm drizzle-kit migrate
```

---

## 📊 部署检查清单

- [ ] Node.js 已安装（18.x 或更高）
- [ ] Git 已安装
- [ ] pnpm 已安装
- [ ] Vercel CLI 已安装
- [ ] 项目已克隆到本地
- [ ] 依赖已安装
- [ ] 本地构建成功
- [ ] Vercel 登录成功
- [ ] 项目已部署到 Vercel
- [ ] 所有环境变量已配置（5 个）
- [ ] 数据库迁移已执行
- [ ] 59 个表已创建
- [ ] 应用已重新部署
- [ ] 应用可正常访问
- [ ] API 端点正常工作
- [ ] 无严重错误日志

**以上项目全部通过，部署成功！** ✅

---

## 🔗 相关资源

- **Vercel Dashboard**：https://vercel.com/dashboard
- **Neon 控制台**：https://console.neon.tech
- **GitHub 仓库**：https://github.com/tomato-writer-2024/PulseOpti-HR
- **生产环境**：https://pulseopti-hr.vercel.app

---

**祝你使用愉快！🚀**

如有问题，请参考本文档中的"常见问题"部分。
