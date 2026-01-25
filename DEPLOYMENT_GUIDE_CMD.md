# HR Navigator - Vercel & Neon 完整部署手册（CMD操作版）

**适用系统**：Windows CMD、PowerShell、macOS Terminal、Linux Shell
**部署目标**：将HR Navigator部署到Vercel，连接Neon PostgreSQL数据库

---

## 📋 前置准备

### 1. 必备工具检查

在CMD中执行以下命令，检查是否已安装必需工具：

```cmd
# 检查Node.js版本（需要18+）
node --version

# 检查pnpm版本（需要9+）
pnpm --version

# 检查git版本（需要2+）
git --version

# 检查Vercel CLI（可选，推荐安装）
vercel --version
```

**如果未安装，按以下步骤安装：**

#### 安装Node.js
1. 访问 https://nodejs.org/
2. 下载LTS版本（推荐Node.js 20.x）
3. 运行安装程序，一路"下一步"
4. 重新打开CMD，验证安装：`node --version`

#### 安装pnpm
```cmd
npm install -g pnpm
pnpm --version
```

#### 安装Git
1. 访问 https://git-scm.com/downloads
2. 下载Windows版本
3. 运行安装程序，一路"下一步"
4. 重新打开CMD，验证安装：`git --version`

#### 安装Vercel CLI（可选）
```cmd
npm install -g vercel
vercel --version
```

---

## 🌟 步骤1：创建Neon PostgreSQL数据库

### 1.1 注册Neon账号

1. 访问：https://neon.tech
2. 点击右上角 **"Sign in"**
3. 使用以下方式注册：
   - GitHub账号（推荐）
   - Google账号
   - Email注册

### 1.2 创建新项目

1. 登录后，点击 **"Create a project"** 按钮
2. 填写项目信息：
   - **Project Name**：`hr-navigator-db`
   - **PostgreSQL Version**：选择 `16`
   - **Region**：推荐 `AWS ap-southeast-1 (Singapore)` 或 `AWS us-east-1 (N. Virginia)`
3. 点击 **"Create project"**

### 1.3 获取连接字符串

1. 项目创建完成后，会自动显示 **"Connection Details"** 界面
2. 复制 **Connection string**（格式如下）：
   ```
   postgresql://username:password@ep-xxx.aws.neon.tech/dbname
   ```

3. **重要**：在连接字符串末尾添加SSL配置：
   ```
   postgresql://username:password@ep-xxx.aws.neon.tech/dbname?sslmode=require
   ```

4. 保存这个连接字符串，稍后会用到

### 1.4 测试数据库连接（可选）

在CMD中执行：
```cmd
# 如果安装了psql客户端
psql "postgresql://username:password@ep-xxx.aws.neon.tech/dbname?sslmode=require"

# 或者使用在线工具测试
# 访问：https://www.psql.io/
```

### 1.5 配置pgbouncer连接池（推荐）

为了提升性能，建议使用Neon的连接池功能：

1. 在Neon Dashboard，点击项目名称
2. 点击左侧菜单 **"Connection Details"**
3. 找到 **"Connection pooling"** 部分
4. 复制 **"Pooled connection string"**
5. 格式：
   ```
   postgres://username:password@ep-xxx.aws.neon.tech/dbname?pgbouncer=true&sslmode=require
   ```

**推荐使用Pooled连接字符串**（更稳定、性能更好）

---

## 📦 步骤2：准备项目代码

### 2.1 克隆或准备项目

**如果项目已在本地：**
```cmd
# 进入项目目录
cd C:\path\to\your\project

# 确认项目文件存在
dir package.json
dir .env.example
dir vercel.json
```

**如果项目在GitHub：**
```cmd
# 克隆仓库
git clone https://github.com/your-username/hr-navigator.git
cd hr-navigator

# 确认项目文件
dir package.json
```

### 2.2 安装依赖

```cmd
# 清理旧的依赖（如果有）
rmdir /s /q node_modules
del package-lock.json pnpm-lock.yaml

# 安装依赖
pnpm install

# 等待安装完成（约2-5分钟）
```

### 2.3 创建本地环境变量文件

```cmd
# 复制环境变量模板
copy .env.example .env.local

# 编辑.env.local文件（推荐使用VS Code）
notepad .env.local
```

**在.env.local中配置以下变量：**

```env
# ========== 必需变量 ==========

# Neon数据库连接字符串（从步骤1.3或1.5获取）
DATABASE_URL=postgresql://username:password@ep-xxx.aws.neon.tech/dbname?sslmode=require&pgbouncer=true

# JWT密钥（必须至少32字符，用于加密token）
# 可以使用以下命令生成随机密钥：
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-change-this

# 应用URL（本地开发暂时填localhost）
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 运行环境
NODE_ENV=development

# ========== 可选变量（AI功能） ==========

# 豆包AI API密钥（如果使用AI功能）
COZE_API_KEY=your-coze-api-key

# ========== 其他可选配置 ==========

# 对象存储（S3兼容）
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_REGION=us-east-1
S3_BUCKET=
S3_ENDPOINT=https://s3.amazonaws.com
```

**保存文件并关闭编辑器**

### 2.4 本地构建测试

```cmd
# 运行类型检查
pnpm run ts-check

# 运行构建测试
pnpm run build

# 如果构建成功，会看到：
# ✓ Compiled successfully
# ✓ Generating static pages (144/144)
```

**如果构建失败：**
```cmd
# 检查错误信息，修复后重试
pnpm run build 2>&1 | findstr /i "error"
```

---

## 🚀 步骤3：部署到Vercel

### 3.1 方法一：使用Vercel CLI（推荐）

#### 3.1.1 登录Vercel

```cmd
# 登录Vercel
vercel login

# 按提示操作：
# 1. 选择登录方式（GitHub/Email）
# 2. 浏览器会自动打开授权页面
# 3. 授权成功后返回CMD
```

#### 3.1.2 初始化项目

```cmd
# 进入项目根目录
cd C:\path\to\hr-navigator

# 初始化Vercel项目
vercel

# 按提示操作：
# 1. Set up and deploy? Y
# 2. Which scope do you want to deploy to? (选择你的账号)
# 3. Link to existing project? N (新项目) 或 Y (已存在项目)
# 4. What's your project's name? hr-navigator
# 5. In which directory is your code located? . (当前目录)
# 6. Want to override the settings? N (使用默认设置)
```

**等待部署完成（约3-5分钟）**

部署成功后会显示：
```
✅ Production: https://hr-navigator-xxx.vercel.app
```

**记录这个URL，稍后会用到**

#### 3.1.3 配置环境变量

```cmd
# 添加DATABASE_URL
vercel env add DATABASE_URL production

# 按提示操作：
# 1. What's the value of DATABASE_URL? (粘贴Neon连接字符串)
# 2. Add to Production, Preview, and Development? Production

# 添加JWT_SECRET
vercel env add JWT_SECRET production

# 按提示操作：
# 1. What's the value of JWT_SECRET? (粘贴你的JWT密钥)
# 2. Add to Production, Preview, and Development? Production

# 添加NEXT_PUBLIC_APP_URL
vercel env add NEXT_PUBLIC_APP_URL production

# 按提示操作：
# 1. What's the value of NEXT_PUBLIC_APP_URL? https://hr-navigator-xxx.vercel.app
# 2. Add to Production, Preview, and Development? Production

# 添加NODE_ENV
vercel env add NODE_ENV production

# 按提示操作：
# 1. What's the value of NODE_ENV? production
# 2. Add to Production, Preview, and Development? Production

# 添加COZE_API_KEY（可选）
vercel env add COZE_API_KEY production
```

#### 3.1.4 生产环境部署

```cmd
# 部署到生产环境
vercel --prod

# 等待部署完成（约3-5分钟）
```

部署成功后显示：
```
✅ Production: https://hr-navigator-xxx.vercel.app
```

#### 3.1.5 验证部署

1. 打开浏览器，访问：`https://hr-navigator-xxx.vercel.app`
2. 确认首页正常加载
3. 测试登录功能（如果有测试账号）

---

### 3.2 方法二：使用Vercel Dashboard（图形界面）

#### 3.2.1 导入GitHub仓库

1. 访问：https://vercel.com/dashboard
2. 点击 **"Add New..."** → **"Project"**
3. 点击 **"Import Git Repository"**
4. 选择你的GitHub仓库（hr-navigator）
5. 点击 **"Import"**

#### 3.2.2 配置项目

**Framework Preset**：
- Framework：`Next.js`
- Root Directory：`./`
- Build Command：`pnpm run build`
- Output Directory：`.next`
- Install Command：`pnpm install`

**Environment Variables**：
点击 **"Environment Variables"** 按钮添加：

| Name | Value | Environment |
|------|-------|-------------|
| DATABASE_URL | `postgresql://username:password@ep-xxx.aws.neon.tech/dbname?sslmode=require` | Production, Preview, Development |
| JWT_SECRET | `your-super-secret-jwt-key-min-32-characters` | Production, Preview, Development |
| NEXT_PUBLIC_APP_URL | `https://hr-navigator-xxx.vercel.app` | Production, Preview, Development |
| NODE_ENV | `production` | Production, Preview, Development |
| COZE_API_KEY | `your-coze-api-key` (可选) | Production, Preview, Development |

#### 3.2.3 配置区域和域名

**区域配置**：
1. 点击 **"Settings"** → **"General"**
2. 在 **"Region"** 下拉菜单中选择：
   - `Hong Kong (hkg1)` - 推荐（亚洲用户访问快）
   - `Singapore (sin1)` - 推荐（亚洲用户访问快）
   - `San Francisco (sfo1)` - 美国用户
3. 点击 **"Save"**

**域名配置（可选）**：
1. 点击 **"Settings"** → **"Domains"**
2. 点击 **"Add"**
3. 输入自定义域名（如 `hr.yourcompany.com`）
4. 按提示配置DNS记录：
   - A记录：`76.76.21.21`
   - CNAME记录：`cname.vercel-dns.com`

#### 3.2.4 部署

1. 返回项目页面
2. 点击 **"Deploy"** 按钮
3. 等待部署完成（约3-5分钟）
4. 部署成功后，点击生成的URL访问

---

## 🗄️ 步骤4：数据库迁移

### 4.1 本地测试迁移（推荐）

```cmd
# 1. 确保本地环境变量配置正确
type .env.local

# 2. 生成迁移文件
npx drizzle-kit generate:pg

# 3. 推送schema到数据库
npx drizzle-kit push:pg

# 如果看到类似输出，说明成功：
# ✓ Database schema synced successfully
```

### 4.2 在Vercel环境中迁移（生产环境）

#### 方法一：使用Vercel CLI

```cmd
# 1. 拉取生产环境变量
vercel env pull .env.local

# 2. 运行迁移
npx drizzle-kit push:pg

# 3. 等待完成，看到成功提示
```

#### 方法二：使用Vercel Dashboard（图形界面）

1. 访问：https://vercel.com/dashboard
2. 选择你的项目
3. 点击 **"Deployments"** 标签
4. 找到最新的部署，点击 **"..."** 按钮
5. 点击 **"Redeploy"** → **"Redeploy with latest commit"**

**Vercel会自动运行构建脚本，但不会自动运行数据库迁移**

#### 方法三：手动在Neon中创建表（备用方案）

1. 访问Neon Dashboard
2. 点击你的项目
3. 点击左侧菜单 **"SQL Editor"**
4. 复制并粘贴以下SQL脚本（根据你的schema生成）：
   ```sql
   -- 创建数据库表的SQL脚本
   -- 从 drizzle-kit 生成的迁移文件中获取
   ```
5. 点击 **"Run"**

### 4.3 验证数据库连接

```cmd
# 测试数据库连接
curl https://hr-navigator-xxx.vercel.app/api/health

# 应该返回：
# {"status":"healthy","message":"Database connection successful"}
```

---

## ✅ 步骤5：验证和测试

### 5.1 验证前端访问

1. 打开浏览器，访问：`https://hr-navigator-xxx.vercel.app`
2. 检查以下功能：
   - ✅ 首页正常加载
   - ✅ 静态资源加载正常（图片、CSS、JS）
   - ✅ 页面响应速度快（< 3秒）

### 5.2 测试用户注册和登录

**注册测试账号**：
1. 访问：`https://hr-navigator-xxx.vercel.app/register`
2. 填写注册信息：
   - 账号：`admin@test.com`
   - 密码：`Test123456!`
   - 姓名：`测试管理员`
   - 公司名：`测试公司`
3. 点击 **"注册"**
4. 如果成功，会跳转到登录页

**登录测试**：
1. 访问：`https://hr-navigator-xxx.vercel.app/login`
2. 输入刚注册的账号和密码
3. 点击 **"登录"**
4. 如果成功，会跳转到Dashboard

### 5.3 测试API端点

```cmd
# 测试登录API
curl -X POST https://hr-navigator-xxx.vercel.app/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"account\":\"admin@test.com\",\"password\":\"Test123456!\"}"

# 应该返回：
# {
#   "success": true,
#   "data": { "user": {...}, "token": "...", "companyId": "..." }
# }

# 测试员工列表API（需要token）
curl https://hr-navigator-xxx.vercel.app/api/employees ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5.4 测试数据库读写

1. 登录到Dashboard
2. 点击 **"员工管理"**
3. 尝试创建新员工
4. 刷新页面，确认数据已保存

### 5.5 检查日志和监控

**Vercel Dashboard监控**：
1. 访问：https://vercel.com/dashboard
2. 选择你的项目
3. 点击 **"Logs"** 标签
4. 查看实时日志，检查是否有错误

**Neon Dashboard监控**：
1. 访问：https://console.neon.tech
2. 点击你的项目
3. 点击左侧菜单 **"Monitoring"**
4. 查看数据库连接数、查询次数等

---

## 🛠️ 步骤6：配置自定义域名（可选）

### 6.1 在Vercel中添加域名

1. 访问：https://vercel.com/dashboard
2. 选择你的项目
3. 点击 **"Settings"** → **"Domains"**
4. 点击 **"Add"**
5. 输入你的域名（如 `hr.yourcompany.com`）
6. 点击 **"Add"**

### 6.2 配置DNS记录

Vercel会显示需要配置的DNS记录：

```
A记录
Type: A
Name: hr
Value: 76.76.21.21
TTL: 600

或

CNAME记录
Type: CNAME
Name: hr
Value: cname.vercel-dns.com
TTL: 600
```

**在你的域名DNS管理后台配置**：
1. 登录域名管理网站（如阿里云、腾讯云、GoDaddy）
2. 找到DNS解析设置
3. 添加上述DNS记录
4. 保存并等待生效（10分钟-24小时）

### 6.3 验证域名配置

```cmd
# 测试DNS解析
nslookup hr.yourcompany.com

# 应该返回：
# Name:    hr.yourcompany.com
# Address: 76.76.21.21
```

### 6.4 更新环境变量

```cmd
# 更新NEXT_PUBLIC_APP_URL
vercel env rm NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_APP_URL production

# 输入：https://hr.yourcompany.com

# 重新部署
vercel --prod
```

---

## 🔒 步骤7：安全加固

### 7.1 配置HTTPS证书

Vercel会自动为你的域名提供免费SSL证书（Let's Encrypt）

1. 访问：https://vercel.com/dashboard
2. 选择你的项目
3. 点击 **"Settings"** → **"Domains"**
4. 确认域名状态为 **"Valid Configuration"**

### 7.2 配置CORS策略

如果需要跨域访问API，在 `vercel.json` 中已配置：

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

### 7.3 配置JWT密钥安全

```cmd
# 生成强随机JWT密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 复制生成的密钥，更新环境变量
vercel env rm JWT_SECRET production
vercel env add JWT_SECRET production

# 粘贴新密钥，重新部署
vercel --prod
```

---

## 📊 步骤8：监控和维护

### 8.1 配置告警通知

1. 访问：https://vercel.com/dashboard
2. 选择你的项目
3. 点击 **"Settings"** → **"Notifications"**
4. 配置告警：
   - 部署失败
   - 错误率超过阈值
   - 响应时间超过阈值

### 8.2 配置日志保留

1. 点击 **"Settings"** → **"Logs"**
2. 设置日志保留时间（建议：7天）

### 8.3 配置性能监控

1. 访问：https://vercel.com/analytics
2. 选择你的项目
3. 启用 **Web Vitals** 监控

---

## 🔄 步骤9：更新和维护

### 9.1 更新代码

```cmd
# 拉取最新代码
git pull origin main

# 安装新依赖
pnpm install

# 本地测试构建
pnpm run build

# 提交到GitHub
git add .
git commit -m "Update: new features"
git push origin main

# Vercel会自动部署
# 或手动部署：
vercel --prod
```

### 9.2 数据库迁移更新

```cmd
# 生成新的迁移文件
npx drizzle-kit generate:pg

# 推送到生产环境
vercel env pull .env.local
npx drizzle-kit push:pg
```

---

## 🆘 常见问题和解决方案

### 问题1：部署失败，提示"Cannot find module"

**原因**：依赖未正确安装

**解决方案**：
```cmd
# 清理并重新安装
rmdir /s /q node_modules
del package-lock.json
pnpm install
```

### 问题2：数据库连接失败

**错误信息**：`getaddrinfo ENOTFOUND ep-xxx.aws.neon.tech`

**解决方案**：
1. 检查 `DATABASE_URL` 是否正确
2. 确认添加了 `?sslmode=require`
3. 检查Neon项目是否已暂停
4. 在Vercel Dashboard中重新配置环境变量

### 问题3：API请求超时

**错误信息**：`504 Gateway Timeout`

**解决方案**：
1. 检查 `vercel.json` 中的 `maxDuration` 设置
2. 优化数据库查询（添加索引）
3. 使用Vercel Edge Functions

### 问题4：环境变量未生效

**解决方案**：
```cmd
# 确认环境变量已添加
vercel env ls

# 重新部署
vercel --prod
```

### 问题5：域名无法访问

**解决方案**：
1. 检查DNS配置是否正确
2. 等待DNS生效（最多24小时）
3. 检查Vercel Dashboard中的域名状态
4. 联系域名注册商确认DNS设置

---

## 📞 技术支持

如有问题，请联系：

1. **Vercel文档**：https://vercel.com/docs
2. **Neon文档**：https://neon.tech/docs
3. **Next.js文档**：https://nextjs.org/docs
4. **Drizzle ORM文档**：https://orm.drizzle.team/docs

---

## 📝 检查清单

部署完成后，请逐一确认以下项目：

### 基础功能
- [ ] 首页可以正常访问
- [ ] 登录功能正常
- [ ] 注册功能正常
- [ ] API请求正常
- [ ] 数据库连接正常

### 性能优化
- [ ] 页面加载速度 < 3秒
- [ ] API响应时间 < 500ms
- [ ] 数据库查询时间 < 200ms

### 安全配置
- [ ] HTTPS已启用
- [ ] JWT密钥已配置
- [ ] CORS已配置
- [ ] 环境变量已隐藏

### 监控告警
- [ ] 日志监控已启用
- [ ] 性能监控已启用
- [ ] 告警通知已配置

### 备份恢复
- [ ] 数据库备份策略已设置
- [ ] 代码备份已设置（GitHub）

---

**部署完成时间**：__________
**部署人员**：__________
**生产URL**：https://hr-navigator-xxx.vercel.app
**数据库URL**：postgresql://username:password@ep-xxx.aws.neon.tech/dbname

---

**祝部署顺利！** 🎉
