# 快速部署 CMD 操作步骤

> 本文档提供在 CMD 中快速部署 PulseOpti HR 的详细命令步骤

---

## 📦 前置准备

### 1. 安装必需工具

```cmd
REM 1. 安装 Node.js (如果未安装)
REM 访问 https://nodejs.org 下载并安装 LTS 版本 (18.x 或更高)

REM 2. 验证 Node.js 安装
node --version
npm --version

REM 3. 安装 pnpm (如果未安装)
npm install -g pnpm
pnpm --version

REM 4. 安装 Vercel CLI (用于部署)
npm install -g vercel
vercel --version

REM 5. 安装 Git (如果未安装)
REM 访问 https://git-scm.com/downloads 下载并安装
git --version
```

### 2. 准备账号信息

- **GitHub 账号**：https://github.com/tomato-writer-2024/PulseOpti-HR
- **Vercel 账号**：https://vercel.com（使用 GitHub 登录）
- **Neon 连接字符串**：
  ```
  postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
  ```

---

## 🚀 部署步骤

### 步骤 1：克隆项目到本地

```cmd
REM 1. 进入目标目录（建议放在 C:\Projects）
cd C:\
mkdir Projects
cd C:\Projects

REM 2. 克隆 GitHub 仓库
git clone https://github.com/tomato-writer-2024/PulseOpti-HR.git

REM 3. 进入项目目录
cd PulseOpti-HR

REM 4. 查看项目文件
dir
```

### 步骤 2：安装依赖

```cmd
REM 安装项目依赖
pnpm install

REM 验证安装成功
dir node_modules
```

### 步骤 3：本地测试构建

```cmd
REM 构建项目
pnpm run build

REM 如果构建成功，会看到以下输出：
REM ✓ Compiled successfully
REM ✓ Linting and checking validity of types
REM ✓ Collecting page data
REM ✓ Generating static pages (60/60)
REM ✓ Collecting build traces
REM ✓ Finalizing page optimization

REM 启动本地开发服务器（测试）
pnpm run start

REM 访问 http://localhost:3000 查看页面
REM 按 Ctrl+C 停止服务
```

### 步骤 4：登录 Vercel

```cmd
REM 登录 Vercel（会打开浏览器进行授权）
vercel login

REM 按照提示选择：
REM - Log in to Vercel: Yes
REM - Log in to which account: 选择你的 GitHub 账号
REM - Link to existing project: No (首次部署)
```

### 步骤 5：部署到 Vercel

```cmd
REM 部署项目（会询问配置信息）
vercel

REM 按照提示回答以下问题：

REM ? Set up and deploy "~/C:\Projects\PulseOpti-HR"? [Y/n] 
REM 输入: Y

REM ? Which scope do you want to deploy to? 
REM 选择: Your Username

REM ? Link to existing project? [y/N]
REM 输入: N

REM ? What's your project's name?
REM 输入: pulseopti-hr

REM ? In which directory is your code located?
REM 输入: ./

REM ? Want to override the settings? [y/N]
REM 输入: N (会自动识别 Next.js 项目)

REM 等待构建和部署完成（约 2-5 分钟）
REM 部署成功后会显示：
REM ✓ Production: https://pulseopti-hr.vercel.app [2m 30s]
```

### 步骤 6：配置环境变量

#### 方法 1：使用 Vercel CLI（推荐）

```cmd
REM 1. 添加 DATABASE_URL 环境变量
vercel env add DATABASE_URL production

REM 按照提示输入值（复制以下连接字符串）：
REM postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

REM 2. 添加 JWT_SECRET 环境变量
vercel env add JWT_SECRET production

REM 输入: pulseopti-hr-secret-key-2024-production

REM 3. 添加 JWT_EXPIRES_IN 环境变量
vercel env add JWT_EXPIRES_IN production

REM 输入: 7d

REM 4. 添加 NODE_ENV 环境变量
vercel env add NODE_ENV production

REM 输入: production

REM 5. 添加 NEXT_PUBLIC_APP_URL 环境变量
vercel env add NEXT_PUBLIC_APP_URL production

REM 输入: https://pulseopti-hr.vercel.app
```

#### 方法 2：使用 Vercel 网页界面

1. 访问：https://vercel.com/dashboard
2. 找到 `pulseopti-hr` 项目
3. 点击 **"Settings"** → **"Environment Variables"**
4. 点击 **"Add New"** 添加环境变量：

| 变量名 | 值 |
|--------|-----|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | `pulseopti-hr-secret-key-2024-production` |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_APP_URL` | `https://pulseopti-hr.vercel.app` |

### 步骤 7：运行数据库迁移

```cmd
REM 1. 设置临时环境变量（仅用于迁移）
set DATABASE_URL=postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

REM 2. 生成数据库迁移文件
pnpm drizzle-kit generate

REM 3. 执行数据库迁移
pnpm drizzle-kit migrate

REM 4. 验证数据库表已创建
REM 访问 https://console.neon.tech 查看 SQL Editor
REM 执行以下 SQL 验证：
REM SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
REM 应该看到 59 个表
```

### 步骤 8：重新部署应用

```cmd
REM 配置完环境变量后，需要重新部署
vercel --prod

REM 等待部署完成（约 2-3 分钟）
REM 看到 ✓ Production: https://pulseopti-hr.vercel.app 即成功
```

### 步骤 9：验证部署

```cmd
REM 1. 测试应用访问
start https://pulseopti-hr.vercel.app

REM 2. 测试 API 端点
curl https://pulseopti-hr.vercel.app/api/health

REM 3. 测试用户注册 API
curl -X POST https://pulseopti-hr.vercel.app/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"test\",\"email\":\"test@example.com\",\"password\":\"password123\"}"

REM 4. 查看部署日志
vercel logs --prod
```

---

## 🔄 更新和重新部署

### 代码更新后重新部署

```cmd
REM 1. 进入项目目录
cd C:\Projects\PulseOpti-HR

REM 2. 拉取最新代码
git pull origin main

REM 3. 安装依赖（如果有新依赖）
pnpm install

REM 4. 重新部署
vercel --prod
```

### 修改环境变量后重新部署

```cmd
REM 1. 修改环境变量
vercel env add VARIABLE_NAME production

REM 2. 重新部署
vercel --prod
```

---

## 🐛 故障排查

### 问题 1：构建失败

```cmd
REM 查看构建日志
vercel logs --prod

REM 常见解决方案：
REM - 检查 Node.js 版本 (需要 18.x 或更高)
REM - 确保 pnpm 已安装
REM - 删除 node_modules 重新安装
rmdir /s /q node_modules
pnpm install
```

### 问题 2：数据库连接错误

```cmd
REM 测试数据库连接
REM 使用 psql 命令（需安装 PostgreSQL 客户端）
psql "postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require" -c "SELECT version();"

REM 检查环境变量是否正确设置
vercel env ls production
```

### 问题 3：环境变量未生效

```cmd
REM 1. 重新拉取环境变量
vercel env pull .env.local

REM 2. 重新部署
vercel --prod

REM 3. 清除缓存重新部署
vercel rm pulseopti-hr --yes
vercel link
vercel --prod
```

---

## 📊 部署后检查清单

- [ ] 应用可访问：https://pulseopti-hr.vercel.app
- [ ] 首页正常显示 PulseOpti HR 脉策聚效 品牌
- [ ] 登录页面可正常访问
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 数据库连接正常（无错误日志）
- [ ] 微信二维码显示正常
- [ ] 页脚联系信息正确
- [ ] API 响应正常（测试健康检查）
- [ ] Vercel 日志无严重错误

---

## 🎉 部署完成！

你的 PulseOpti HR 脉策聚效 系统已成功部署！

### 访问地址

- **生产环境**：https://pulseopti-hr.vercel.app
- **Vercel Dashboard**：https://vercel.com/dashboard
- **Neon 控制台**：https://console.neon.tech

### 后续维护

```cmd
REM 查看部署日志
vercel logs --prod

REM 查看环境变量
vercel env ls

REM 查看项目信息
vercel inspect
```

---

**祝你使用愉快！🚀**

如有问题，请参考详细文档：[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
