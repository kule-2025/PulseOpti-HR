# 超管端部署到Vercel详细操作指南

## 目标
- 将超管端部署到Vercel，使用子域名：https://admin.aizhixuan.com.cn
- 实现用户前端（www.aizhixuan.com.cn）与超管端（admin.aizhixuan.com.cn）的实时数据同步
- 采用共享数据库架构，两端使用同一个Neon PostgreSQL数据库

---

## 前置条件检查

### 步骤1：确认Vercel CLI已安装
**执行方式**：命令行

```bash
# 检查Vercel CLI版本
vercel --version
```

**预期结果**：
```
Vercel CLI XX.X.X
```

**如果未安装，执行安装命令**：
```bash
# Windows用户（使用PowerShell管理员权限）
npm install -g vercel

# 或使用pnpm安装
pnpm add -g vercel
```

---

### 步骤2：登录Vercel账号
**执行方式**：命令行

```bash
vercel login
```

**交互步骤**：
1. 选择登录方式：推荐使用 `Log in with GitHub`
2. 浏览器自动打开，授权Vercel访问GitHub
3. 授权成功后，命令行显示 `✓ Logged in as [your-username]`

**预期结果**：
```
✓ Logged in as [your-username]
```

---

### 步骤3：检查本地项目状态
**执行方式**：命令行

```bash
# 确认当前在项目根目录
cd %COZE_WORKSPACE_PATH%

# 查看当前目录内容
dir

# 检查Git状态
git status
```

**预期结果**：
- 能够看到项目文件列表
- Git状态正常（或显示未提交的更改）

---

## 方案选择：两种部署方式

### 方案A：创建新的Vercel项目（推荐）
**优势**：
- 前端和超管端独立部署，互不影响
- 便于分别管理环境变量
- 独立的域名和配置

**适用场景**：
- 前端已部署到 www.aizhixuan.com.cn
- 需要独立的超管端管理后台

---

### 方案B：使用现有Vercel项目（不推荐）
**劣势**：
- 需要配置多域名路由
- 环境变量管理复杂
- 容易造成配置冲突

**本指南采用方案A**

---

## 部署详细步骤

### 步骤4：为超管端创建新的Git分支
**执行方式**：命令行

```bash
# 创建超管端专用分支
git checkout -b admin-deployment

# 查看当前分支
git branch
```

**预期结果**：
```
* admin-deployment
  main
```

---

### 步骤5：修改超管端环境变量配置
**执行方式**：文本编辑器

需要创建或修改 `.env.admin` 文件，内容如下：

**创建文件**：`.env.admin`

```env
# 数据库配置（必须与前端完全相同！）
DATABASE_URL=postgresql://[username]:[password]@[host]/[database]?sslmode=require

# JWT配置
JWT_SECRET=[与前端相同的JWT密钥]
JWT_EXPIRES_IN=7d

# 应用配置
NEXT_PUBLIC_APP_URL=https://admin.aizhixuan.com.cn
NODE_ENV=production

# 邮件配置（与前端相同）
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_USER=your-email@qq.com
SMTP_PASS=your-authorization-code

# 短信配置（与前端相同）
SMS_ACCESS_KEY_ID=your-access-key-id
SMS_ACCESS_KEY_SECRET=your-secret
SMS_SIGN_NAME=your-sign-name

# 豆包AI配置（与前端相同）
DOUBAO_API_KEY=your-doubao-api-key
```

**重要提示**：
1. `DATABASE_URL` 必须与前端（www.aizhixuan.com.cn）完全一致
2. `JWT_SECRET` 必须与前端完全一致
3. 其他配置建议与前端保持一致

---

### 步骤6：创建Vercel项目配置文件（超管端专用）
**执行方式**：文本编辑器

**创建文件**：`vercel.admin.json`

```json
{
  "name": "pulseopti-hr-admin",
  "buildCommand": "pnpm run build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization, X-Requested-With"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        }
      ]
    }
  ],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60,
      "memory": 2048,
      "runtime": "nodejs20.x"
    }
  },
  "regions": ["hkg1", "sin1"]
}
```

---

### 步骤7：创建部署脚本
**执行方式**：文本编辑器

**创建文件**：`deploy-admin.bat`（Windows用户）

```batch
@echo off
chcp 65001 >nul
echo ========================================
echo 超管端部署到Vercel脚本
echo ========================================
echo.

echo [步骤1] 检查Vercel登录状态...
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未登录Vercel，正在登录...
    vercel login
    if %errorlevel% neq 0 (
        echo ❌ 登录失败，请检查网络或账号信息
        pause
        exit /b 1
    )
)
echo ✓ 已登录Vercel
echo.

echo [步骤2] 创建超管端分支...
git checkout main
git pull origin main
git checkout -b admin-deployment
if %errorlevel% neq 0 (
    echo ℹ 分支已存在，切换到admin-deployment
    git checkout admin-deployment
)
echo ✓ 已切换到admin-deployment分支
echo.

echo [步骤3] 检查环境变量文件...
if not exist .env.admin (
    echo ❌ 错误：.env.admin 文件不存在
    echo 请先创建 .env.admin 文件并配置环境变量
    pause
    exit /b 1
)
echo ✓ .env.admin 文件存在
echo.

echo [步骤4] 部署到Vercel...
echo 项目名称：pulseopti-hr-admin
echo 环境变量：.env.admin
echo 配置文件：vercel.admin.json
echo.

vercel --prod --env-file .env.admin --name pulseopti-hr-admin --yes --yes

if %errorlevel% neq 0 (
    echo ❌ 部署失败
    pause
    exit /b 1
)
echo.

echo [步骤5] 获取部署URL...
for /f "tokens=*" %%i in ('vercel ls --scope [your-username] --token [your-token]') do (
    echo %%i
)
echo.

echo ========================================
echo ✓ 部署完成！
echo ========================================
echo.
echo 下一步操作：
echo 1. 访问Vercel控制台：https://vercel.com/dashboard
echo 2. 找到项目：pulseopti-hr-admin
echo 3. 配置自定义域名：admin.aizhixuan.com.cn
echo 4. 运行数据库迁移：vercel env pull .env.admin --environment=production
echo 5. 验证数据同步：在前端注册用户，超管端查看
echo.
pause
```

---

### 步骤8：执行部署命令
**执行方式**：命令行

```bash
# 方法1：使用部署脚本（推荐）
deploy-admin.bat

# 方法2：手动部署
vercel --prod --env-file .env.admin --name pulseopti-hr-admin --yes
```

**交互步骤**：
1. Vercel CLI询问：`Set up and deploy "~/path/to/project"? [Y/n]` → 输入 `Y`
2. Vercel CLI询问：`Which scope do you want to deploy to?` → 选择你的账号
3. Vercel CLI询问：`Link to existing project? [y/N]` → 输入 `N`（创建新项目）
4. 等待构建完成

**预期结果**：
```
✓ Production: https://pulseopti-hr-admin.vercel.app
```

---

### 步骤9：配置自定义域名
**执行方式**：Vercel网页控制台

1. **访问Vercel控制台**
   - URL：https://vercel.com/dashboard
   - 登录你的账号

2. **找到项目**
   - 搜索项目名称：`pulseopti-hr-admin`
   - 点击进入项目

3. **进入域名设置**
   - 点击顶部菜单：`Settings`（设置）
   - 左侧菜单选择：`Domains`（域名）

4. **添加自定义域名**
   - 点击按钮：`Add Domain`（添加域名）
   - 输入域名：`admin.aizhixuan.com.cn`
   - 点击按钮：`Add`

5. **配置DNS记录**
   - Vercel会显示需要的DNS记录：
     ```
     Type: CNAME
     Name: admin
     Value: cname.vercel-dns.com
     ```
   - 登录你的域名注册商（如阿里云、腾讯云、Cloudflare）
   - 添加CNAME记录：
     - 主机记录：`admin`
     - 记录值：`cname.vercel-dns.com`
     - TTL：`600`（或默认值）

6. **等待DNS生效**
   - 通常需要10分钟到1小时
   - Vercel会自动检测DNS状态
   - 当显示 `✓ Valid Configuration` 时表示配置成功

**验证DNS生效**：
```bash
# Windows用户
nslookup admin.aizhixuan.com.cn

# Linux/Mac用户
dig admin.aizhixuan.com.cn
```

**预期结果**：
```
cname.vercel-dns.com
```

---

### 步骤10：配置Vercel环境变量（网页控制台）
**执行方式**：Vercel网页控制台

1. **进入环境变量设置**
   - 在Vercel项目页面
   - 点击：`Settings` → `Environment Variables`

2. **添加以下环境变量**（必须与前端完全一致）

   | 变量名 | 值 | 环境 |
   |--------|-----|------|
   | `DATABASE_URL` | `postgresql://[username]:[password]@[host]/[database]?sslmode=require` | Production |
   | `JWT_SECRET` | `[与前端相同的密钥]` | Production |
   | `JWT_EXPIRES_IN` | `7d` | Production |
   | `NEXT_PUBLIC_APP_URL` | `https://admin.aizhixuan.com.cn` | Production |
   | `NODE_ENV` | `production` | Production |
   | `SMTP_HOST` | `smtp.qq.com` | Production |
   | `SMTP_PORT` | `587` | Production |
   | `SMTP_USER` | `your-email@qq.com` | Production |
   | `SMTP_PASS` | `your-authorization-code` | Production |
   | `DOUBAO_API_KEY` | `[豆包API密钥]` | Production |

3. **保存并重新部署**
   - 添加完所有环境变量后
   - 点击：`Save`（保存）
   - 点击：`Redeploy`（重新部署）
   - 确认：`Redeploy to Production`

---

### 步骤11：验证部署成功
**执行方式**：命令行 + 浏览器

**方法1：命令行验证**
```bash
# 检查部署状态
vercel ls --scope [your-username]

# 查看最新部署
vercel inspect --prod --scope [your-username]
```

**方法2：浏览器验证**
```bash
# 访问超管端首页
https://admin.aizhixuan.com.cn

# 预期看到：超管端登录页面
```

**方法3：API健康检查**
```bash
# Windows用户
curl -I https://admin.aizhixuan.com.cn/api/health

# 或使用PowerShell
Invoke-WebRequest -Uri "https://admin.aizhixuan.com.cn/api/health" -Method Head
```

**预期结果**：
```
HTTP/2 200
```

---

### 步骤12：验证数据同步
**执行方式**：浏览器 + 数据库查询

**测试流程**：

1. **在前端注册新用户**
   - 访问：https://www.aizhixuan.com.cn
   - 点击：注册
   - 填写信息：邮箱、密码、姓名
   - 提交注册

2. **在超管端查看新用户**
   - 访问：https://admin.aizhixuan.com.cn/admin
   - 登录超级管理员账号（208343256@qq.com / admin123）
   - 进入：用户管理 → 用户列表
   - 查看是否能看到刚注册的用户

3. **验证数据库数据**
   ```sql
   -- 查询最新用户
   SELECT id, email, name, created_at
   FROM users
   ORDER BY created_at DESC
   LIMIT 5;
   ```

**预期结果**：
- 前端注册的用户在超管端可以立即看到
- 数据实时同步，无需额外操作

---

## 常见问题排查

### 问题1：部署失败 - "Build failed"
**可能原因**：
- 依赖安装失败
- TypeScript类型错误
- 环境变量缺失

**解决方法**：
```bash
# 本地测试构建
pnpm install
pnpm run build

# 检查TypeScript错误
pnpm run ts-check

# 确保所有环境变量已配置
type .env.admin
```

---

### 问题2：DNS配置失败 - "Invalid Configuration"
**可能原因**：
- DNS记录未生效
- 域名服务商缓存
- CNAME记录错误

**解决方法**：
```bash
# 检查DNS记录
nslookup admin.aizhixuan.com.cn

# 清除本地DNS缓存
# Windows
ipconfig /flushdns

# Linux/Mac
sudo systemctl restart nscd
# 或
sudo dscacheutil -flushcache
```

---

### 问题3：数据不同步
**可能原因**：
- DATABASE_URL不一致
- 数据库连接池配置问题
- 缓存未清除

**解决方法**：
```bash
# 1. 检查超管端的DATABASE_URL
# 在Vercel控制台 → Settings → Environment Variables
# 确认DATABASE_URL与前端完全一致

# 2. 清除Vercel缓存
# 在Vercel控制台 → Deployments → Redeploy

# 3. 重新运行数据库迁移
vercel env pull .env.admin --environment=production
pnpm run db:push
```

---

### 问题4：登录失败 - "Invalid token"
**可能原因**：
- JWT_SECRET不一致
- Token过期时间不同
- 域名跨域问题

**解决方法**：
```bash
# 1. 确保JWT_SECRET完全一致
# 在Vercel控制台检查前后端的JWT_SECRET

# 2. 检查域名白名单
# 在next.config.ts中添加admin域名
# 或在vercel.admin.json中配置CORS

# 3. 清除浏览器Cookie和LocalStorage
```

---

## 验证清单

完成部署后，请逐项验证以下内容：

- [ ] Vercel CLI已安装并登录
- [ ] admin-deployment分支已创建
- [ ] .env.admin文件已创建并配置完整
- [ ] vercel.admin.json文件已创建
- [ ] Vercel项目创建成功（pulseopti-hr-admin）
- [ ] 部署成功，无错误日志
- [ ] 自定义域名admin.aizhixuan.com.cn已配置
- [ ] DNS记录已生效（CNAME → cname.vercel-dns.com）
- [ ] 所有环境变量已配置（特别是DATABASE_URL和JWT_SECRET）
- [ ] 超管端首页可访问（https://admin.aizhixuan.com.cn）
- [ ] 超管端登录功能正常
- [ ] 前端注册用户，超管端可实时看到
- [ ] 超管端创建数据，前端可实时看到
- [ ] 数据库查询验证两端数据一致

---

## 维护操作

### 更新超管端代码
```bash
# 切换到main分支，拉取最新代码
git checkout main
git pull origin main

# 切换到admin-deployment分支，合并最新代码
git checkout admin-deployment
git merge main

# 重新部署
deploy-admin.bat
```

### 查看部署日志
```bash
# 查看最近部署
vercel ls --scope [your-username]

# 查看部署详情
vercel inspect [deployment-url] --scope [your-username]
```

### 回滚部署
```bash
# 在Vercel控制台
# 1. 进入项目：pulseopti-hr-admin
# 2. 点击：Deployments
# 3. 找到要回滚的版本
# 4. 点击右侧菜单 → ... → Promote to Production
```

---

## 技术架构说明

### 数据共享架构
```
┌─────────────────────────────────────────────────────────┐
│                    Neon PostgreSQL                       │
│              (Shared Database Instance)                 │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   users     │  │  companies  │  │  orders     │     │
│  │ table       │  │  table      │  │  table      │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
         ↕                  ↕                    ↕
    Same               Same               Same
  Connection         Connection         Connection
         ↕                  ↕                    ↕
┌────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   Frontend     │  │   Admin Portal   │  │  Admin Portal    │
│   (用户端)      │  │   (超管端)        │  │   (超管端)        │
│                │  │                  │  │                  │
│ www.aizhixuan  │  │  admin.aizhixuan │  │  admin.aizhixuan │
│   .com.cn      │  │     .com.cn      │  │     .com.cn      │
│                │  │                  │  │                  │
│  DATABASE_URL  │  │  DATABASE_URL    │  │  DATABASE_URL    │
│    (相同)      │  │    (相同)         │  │    (相同)         │
└────────────────┘  └──────────────────┘  └──────────────────┘
```

### 实时同步原理
1. **共享数据库连接**：前端和超管端使用相同的`DATABASE_URL`
2. **统一数据源**：所有操作直接操作同一个数据库实例
3. **实时性**：数据库层面的实时更新，无需额外同步逻辑
4. **一致性**：通过事务和外键约束保证数据一致性

### 环境变量对比

| 变量名 | 前端值 | 超管端值 | 说明 |
|--------|--------|---------|------|
| `DATABASE_URL` | `postgres://...` | `postgres://...` | **必须完全相同** |
| `JWT_SECRET` | `your-secret` | `your-secret` | **必须完全相同** |
| `JWT_EXPIRES_IN` | `7d` | `7d` | 建议相同 |
| `NEXT_PUBLIC_APP_URL` | `https://www.aizhixuan.com.cn` | `https://admin.aizhixuan.com.cn` | 不同 |
| `NODE_ENV` | `production` | `production` | 相同 |

---

## 联系与支持

如果遇到问题：
1. 检查本文档的"常见问题排查"部分
2. 查看Vercel部署日志
3. 检查数据库连接状态
4. 联系技术支持：PulseOptiHR@163.com

---

## 附录：快速命令参考

```bash
# === 部署相关 ===
vercel login                              # 登录Vercel
vercel whoami                             # 查看登录账号
vercel ls                                 # 查看项目列表
vercel inspect [url]                      # 查看部署详情
vercel --prod                             # 部署到生产环境

# === Git相关 ===
git checkout main                         # 切换到main分支
git checkout -b admin-deployment          # 创建并切换分支
git pull origin main                      # 拉取最新代码
git merge main                            # 合并main分支

# === 构建相关 ===
pnpm install                              # 安装依赖
pnpm run build                            # 构建项目
pnpm run ts-check                         # TypeScript检查

# === 数据库相关 ===
pnpm run db:push                          # 推送数据库变更
pnpm run db:studio                        # 打开数据库管理界面

# === DNS相关 ===
nslookup admin.aizhixuan.com.cn           # Windows查询DNS
dig admin.aizhixuan.com.cn                # Linux/Mac查询DNS
ipconfig /flushdns                        # Windows清除DNS缓存

# === 测试相关 ===
curl -I https://admin.aizhixuan.com.cn    # HTTP头检查
curl https://admin.aizhixuan.com.cn/api/health  # API健康检查
```

---

**文档版本**：v1.0
**最后更新**：2024年
**适用版本**：Next.js 16, Vercel, Neon PostgreSQL
