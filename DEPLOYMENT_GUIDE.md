# PulseOpti HR 脉策聚效 - 完整部署指南

> 本指南详细说明如何将 PulseOpti HR 项目部署到 Vercel 和 Neon PostgreSQL

## 📋 目录

- [前置准备](#前置准备)
- [步骤一：部署到 Vercel](#步骤一部署到-vercel)
- [步骤二：配置 Neon 数据库](#步骤二配置-neon-数据库)
- [步骤三：运行数据库迁移](#步骤三运行数据库迁移)
- [步骤四：配置环境变量](#步骤四配置环境变量)
- [步骤五：部署验证](#步骤五部署验证)
- [常见问题](#常见问题)

---

## 前置准备

### 必需账号

1. **GitHub 账号**：项目已上传至 https://github.com/tomato-writer-2024/PulseOpti-HR
2. **Vercel 账号**：https://vercel.com/signup（可使用 GitHub 登录）
3. **Neon 账号**：https://neon.tech/signup（可使用 GitHub 登录）

### 项目信息

- **GitHub 仓库**：https://github.com/tomato-writer-2024/PulseOpti-HR
- **Neon 连接字符串**：`postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require`

---

## 步骤一：部署到 Vercel

### 1.1 访问 Vercel 并登录

1. 打开浏览器访问：https://vercel.com
2. 点击右上角 **"Sign Up"** 或 **"Login"**
3. 选择 **"Continue with GitHub"** 使用 GitHub 账号登录

### 1.2 导入项目

1. 登录后，点击 **"Add New"** → **"Project"**
2. 在 **"Import Git Repository"** 页面：
   - 找到并选择 `PulseOpti-HR` 仓库
   - 点击 **"Import"** 按钮

### 1.3 配置项目设置

在 **"Configure Project"** 页面：

#### 基础设置

```
Project Name: pulseopti-hr
Framework Preset: Next.js
Root Directory: ./
Build Command: pnpm run build
Output Directory: .next
Install Command: pnpm install
```

#### 高级设置（点击 "Advanced Settings"）

```
Node.js Version: 18.x 或更高
Environment Variables: 暂不配置（后续步骤配置）
```

### 1.4 部署项目

1. 点击 **"Deploy"** 按钮
2. 等待构建完成（约 2-5 分钟）
3. 部署成功后，你会获得一个临时的 Vercel 域名：
   - 例如：`https://pulseopti-hr.vercel.app`

### 1.5 配置自定义域名（可选）

1. 在项目页面，点击 **"Settings"** → **"Domains"**
2. 点击 **"Add Domain"** 输入你的域名
3. 按照提示配置 DNS 记录

---

## 步骤二：配置 Neon 数据库

### 2.1 验证 Neon 连接

你已经提供了 Neon 连接字符串：
```
postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 2.2 测试数据库连接（可选）

在本地 CMD 中测试连接：

```cmd
# 检查是否安装 psql（PostgreSQL 客户端）
psql --version

# 如果未安装，可以使用 Docker 快速测试
docker run --rm postgres:15 psql "postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require" -c "SELECT version();"
```

### 2.3 Neon 控制台配置

1. 访问：https://console.neon.tech
2. 登录后，查看你的项目 `ep-dry-sunset-ah7xpibr`
3. 确认数据库连接池 URL 正确

---

## 步骤三：配置环境变量

### 3.1 在 Vercel 配置环境变量

1. 在 Vercel 项目页面，点击 **"Settings"** → **"Environment Variables"**
2. 添加以下环境变量（逐个添加）：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require` | Neon 数据库连接字符串 |
| `JWT_SECRET` | `pulseopti-hr-secret-key-2024-production` | JWT 密钥（建议修改为随机字符串） |
| `JWT_EXPIRES_IN` | `7d` | JWT 过期时间 |
| `NODE_ENV` | `production` | 运行环境 |
| `NEXT_PUBLIC_APP_URL` | `https://pulseopti-hr.vercel.app` | 应用访问地址（部署后替换为实际域名） |

### 3.2 重要说明

#### JWT_SECRET 生成建议

生成一个安全的随机密钥：

```cmd
# 在 CMD 中生成随机密钥（Node.js）
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 分环境配置

```
Production (生产环境):
- DATABASE_URL: 使用上述 Neon 连接字符串
- JWT_SECRET: 生产环境密钥
- NODE_ENV: production

Preview (预览环境):
- DATABASE_URL: 使用上述 Neon 连接字符串（或创建单独的 Neon 项目）
- JWT_SECRET: 预览环境密钥
- NODE_ENV: preview
```

### 3.3 验证环境变量

添加完成后，点击 **"Save"** 保存每个环境变量。

---

## 步骤四：运行数据库迁移

### 4.1 本地运行迁移（推荐）

在你的沙箱环境中执行：

```bash
# 进入项目目录
cd /workspace/projects/

# 设置环境变量
export DATABASE_URL="postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"

# 运行数据库迁移（生成并执行 SQL）
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### 4.2 在 Vercel 中运行迁移（备选）

#### 方法 1：使用 Vercel CLI

```cmd
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 运行迁移
vercel env pull .env.local
pnpm drizzle-kit migrate
vercel env push
```

#### 方法 2：使用 Neon SQL 编辑器

1. 访问：https://console.neon.tech
2. 打开 SQL Editor
3. 手动执行数据库表创建脚本（从 `drizzle` 目录获取）

### 4.3 验证数据库表

在 Neon SQL Editor 中执行：

```sql
-- 查看所有表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 预期结果：应显示 59 个表（如 users, roles, workflows 等）
```

---

## 步骤五：部署验证

### 5.1 重新部署 Vercel 项目

配置完环境变量后：

1. 在 Vercel 项目页面，点击 **"Deployments"**
2. 点击最新部署右侧的 **"..."** → **"Redeploy"**
3. 勾选 **"Apply current environment variables"**
4. 点击 **"Redeploy"** 按钮

### 5.2 验证部署

#### 检查 1：访问首页

```
URL: https://pulseopti-hr.vercel.app
预期：显示 PulseOpti HR 脉策聚效 首页
```

#### 检查 2：测试 API

在 CMD 中测试 API 端点：

```cmd
# 测试健康检查
curl https://pulseopti-hr.vercel.app/api/health

# 测试用户注册
curl -X POST https://pulseopti-hr.vercel.app/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"test\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

#### 检查 3：查看 Vercel 日志

1. 在 Vercel 项目页面，点击 **"Logs"**
2. 查看是否有错误信息
3. 如果有 500 错误，查看详细错误堆栈

### 5.3 功能测试清单

- [ ] 首页加载正常
- [ ] 登录页面显示正常
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 数据库连接正常（无数据库错误）
- [ ] 微信二维码显示正常
- [ ] 页脚联系信息正确

---

## 常见问题

### 问题 1：构建失败 - pnpm not found

**解决方案：**
在 Vercel 项目设置中，确保 `Install Command` 设置为：
```
pnpm install
```

### 问题 2：数据库连接错误

**错误信息：**
```
ConnectionError: could not connect to server
```

**解决方案：**
1. 检查 `DATABASE_URL` 环境变量是否正确
2. 确认 Neon 项目未暂停
3. 验证连接字符串中的密码是否正确

### 问题 3：JWT 验证失败

**错误信息：**
```
JsonWebTokenError: invalid signature
```

**解决方案：**
1. 确保 `JWT_SECRET` 环境变量已设置
2. 前端和后端的 `JWT_SECRET` 必须一致
3. 重新部署项目以确保环境变量生效

### 问题 4：图片资源 404

**错误信息：**
```
Failed to load resource: net::ERR_NAME_NOT_RESOLVED
```

**解决方案：**
1. 确保 `public/assets/` 目录已上传到 GitHub
2. 检查图片路径是否正确（应为 `/assets/wechat-qr.png`）
3. 确认图片文件存在且可访问

### 问题 5：API 请求 CORS 错误

**错误信息：**
```
Access to fetch at 'https://pulseopti-hr.vercel.app/api/...' from origin 'https://...' has been blocked by CORS policy
```

**解决方案：**
1. 检查 `vercel.json` 中的 CORS 配置
2. 确保 API 路由正确设置响应头
3. 使用 `https://pulseopti-hr.vercel.app` 访问而非自定义域名（如果 CORS 配置不正确）

---

## 🎉 部署完成！

你的 PulseOpti HR 脉策聚效 系统已成功部署到生产环境！

### 生产环境信息

- **应用地址**：https://pulseopti-hr.vercel.app
- **数据库**：Neon PostgreSQL (AWS us-east-1)
- **框架**：Next.js 16 + React 19
- **构建时间**：约 2-5 分钟

### 后续维护

1. **代码更新**：推送到 GitHub main 分支后，Vercel 自动部署
2. **监控日志**：定期查看 Vercel Logs 和 Neon 监控
3. **数据库备份**：Neon 提供自动备份，定期检查备份状态
4. **安全更新**：定期更新依赖包并重新部署

### 技术支持

- **GitHub Issues**：https://github.com/tomato-writer-2024/PulseOpti-HR/issues
- **Vercel 文档**：https://vercel.com/docs
- **Neon 文档**：https://neon.tech/docs

---

**祝你使用愉快！🚀**
