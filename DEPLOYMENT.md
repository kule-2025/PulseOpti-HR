# HR Navigator - Vercel & Neon 部署指南

## 前置准备

### 1. Neon PostgreSQL 数据库
1. 访问 [Neon](https://neon.tech) 注册账号
2. 创建新项目：
   - 选择 `PostgreSQL 16`
   - 选择离你最近的区域（推荐：`ap-southeast-1` 新加坡）
3. 获取连接字符串：
   - 在项目 Dashboard 点击 "Connection Details"
   - 复制 "Connection string"（格式：`postgresql://user:password@ep-xxx.aws.neon.tech/dbname`）
   - **重要**：添加 `?sslmode=require` 到连接字符串末尾

### 2. 环境变量配置
在 Vercel 项目设置中配置以下环境变量：

#### 必需变量
```bash
DATABASE_URL=postgresql://user:password@ep-xxx.aws.neon.tech/dbname?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### 可选变量（AI集成）
```bash
COZE_API_KEY=your-coze-api-key
```

### 3. Vercel 项目设置

#### 区域选择
- 推荐区域：`Hong Kong (hkg1)` 或 `Singapore (sin1)`
- 优势：访问速度快，延迟低

#### 构建配置
```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

## 部署步骤

### 方法一：通过 Vercel CLI（推荐）

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署
vercel --prod

# 4. 配置环境变量
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
vercel env add COZE_API_KEY production
```

### 方法二：通过 Vercel Dashboard

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 导入 GitHub 仓库
4. 配置环境变量：
   - 项目 Settings → Environment Variables
   - 添加上述必需变量
5. 点击 "Deploy"

## 数据库迁移

### 首次部署
部署完成后，需要在 Vercel 环境中运行数据库迁移：

```bash
# 1. 设置环境变量
vercel env pull .env.local

# 2. 推送数据库 schema
npx drizzle-kit push:pg

# 3. 或者生成迁移文件（推荐）
npx drizzle-kit generate:pg
npx drizzle-kit migrate
```

### 后续更新
1. 修改数据库 Schema（`src/storage/database/shared/schema.ts`）
2. 生成迁移文件：`npx drizzle-kit generate:pg`
3. 在 Vercel 环境中运行迁移

## 监控与维护

### 1. 数据库健康检查
Vercel 会自动监控数据库连接。你也可以通过以下端点检查：
```
https://your-app.vercel.app/api/health
```

### 2. 日志查看
- Vercel Dashboard → Logs
- 查看 API 请求、错误、性能

### 3. 性能优化
- 使用 Neon 连接池（在连接字符串中添加 `?pgbouncer=true`）
- 配置 Vercel Edge Functions 提升响应速度
- 使用 Vercel CDN 缓存静态资源

## 故障排查

### 问题1：数据库连接失败
**错误信息**：`getaddrinfo ENOTFOUND ep-xxx.aws.neon.tech`

**解决方案**：
1. 检查 `DATABASE_URL` 是否正确
2. 确认添加了 `?sslmode=require`
3. 检查 Neon 项目是否已暂停

### 问题2：构建失败
**错误信息**：`Cannot find module 'coze-coding-dev-sdk'`

**解决方案**：
1. 确保已更新数据库连接代码（使用 `@/lib/db`）
2. 检查 `pnpm install` 是否成功
3. 清除缓存重新部署

### 问题3：API 请求超时
**错误信息**：`504 Gateway Timeout`

**解决方案**：
1. 检查 `vercel.json` 中的 `maxDuration` 设置
2. 优化数据库查询（添加索引）
3. 使用 Vercel Edge Functions

## 安全建议

1. **JWT_SECRET**：使用强随机字符串（至少32字符）
2. **DATABASE_URL**：不要在代码中硬编码
3. **API Key**：不要提交到 Git（使用 `.env.local`）
4. **HTTPS**：Vercel 自动提供 SSL 证书
5. **CORS**：已配置 CORS 策略（见 `vercel.json`）

## 域名配置

### 自定义域名
1. Vercel Dashboard → Settings → Domains
2. 添加自定义域名（如 `hr.yourcompany.com`）
3. 配置 DNS：
   - A 记录：`76.76.21.21`
   - CNAME 记录：`cname.vercel-dns.com`

## 成本预估

### Vercel（免费版）
- 100GB 带宽/月
- 6,000分钟构建/月
- 无限项目

### Neon（免费版）
- 0.5GB 存储
- 500小时计算/月
- 3个数据库项目

**总计**：完全免费（适合50人以下企业）

## 性能优化建议

1. **数据库层面**：
   - 为常用查询字段添加索引
   - 使用连接池（pgbouncer模式）
   - 优化复杂查询

2. **应用层面**：
   - 使用 Next.js ISR（增量静态生成）
   - 启用 Edge Functions
   - 实现请求缓存

3. **CDN层面**：
   - Vercel 自动 CDN
   - 图片优化（next/image）
   - 静态资源缓存

## 支持

如有问题，请：
1. 查看 Vercel 日志
2. 检查 Neon Dashboard
3. 联系技术支持
