# 🚀 部署到Vercel - 快速启动指南

## 📋 部署前检查清单

### ✅ 前置条件

- [ ] 已安装Node.js 24+
- [ ] 已安装pnpm
- [ ] 已注册Vercel账号
- [ ] 已配置域名 www.aizhixuan.com.cn
- [ ] 已准备Neon数据库连接字符串
- [ ] 已准备QQ邮箱SMTP配置

### ✅ 本地准备

- [ ] 克隆代码到本地
- [ ] 安装依赖：`pnpm install`
- [ ] 测试本地运行：`pnpm dev --port 5000`
- [ ] 确认5000端口可访问

---

## 🚀 Vercel部署步骤

### 步骤1：登录Vercel CLI

```bash
vercel login
```

按照提示输入邮箱和密码登录。

### 步骤2：部署到Vercel

```bash
# 在项目根目录执行
vercel
```

按照提示操作：
1. 选择"Set up and deploy"（新建项目）或"Link to existing project"（链接已有项目）
2. 如果是新项目，输入项目名称：`PulseOpti-HR`
3. 选择"Next.js"框架
4. Vercel会自动检测配置并开始构建
5. 等待构建完成（通常2-3分钟）

**预期输出**：
```
✅ Production: https://pulseopti-hr.vercel.app [2m 30s]
```

### 步骤3：配置环境变量

在Vercel控制台配置环境变量：

#### 方法1：通过Vercel CLI

```bash
# 进入项目
cd /workspace/projects

# 添加环境变量
vercel env add DATABASE_URL production
# 粘贴：postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

vercel env add JWT_SECRET production
# 粘贴：a915ab35-9534-43ad-b925-d9102c5007ba-PulseOpti-HR-JWT-Secret-Key-2025-01-19

vercel env add JWT_EXPIRES_IN production
# 粘贴：7d

vercel env add NEXT_PUBLIC_APP_URL production
# 粘贴：https://www.aizhixuan.com.cn

vercel env add SMTP_HOST production
# 粘贴：smtp.qq.com

vercel env add SMTP_PORT production
# 粘贴：587

vercel env add SMTP_SECURE production
# 粘贴：false

vercel env add SMTP_USER production
# 粘贴：208343256@qq.com

vercel env add SMTP_PASSWORD production
# 粘贴：xxwbcxaojrqwbjia

vercel env add SMTP_FROM production
# 粘贴：PulseOpti HR <PulseOptiHR@163.com>

vercel env add SMTP_NAME production
# 粘贴：PulseOpti HR 脉策聚效

vercel env add COZE_API_KEY production
# 粘贴：a915ab35-9534-43ad-b925-d9102c5007ba

vercel env add ADMIN_EMAIL production
# 粘贴：208343256@qq.com

vercel env add ADMIN_PASSWORD production
# 粘贴：admin123
```

#### 方法2：通过Vercel网页控制台

1. 访问：https://vercel.com/dashboard
2. 选择项目：PulseOpti-HR
3. 进入：Settings → Environment Variables
4. 点击"Add New"添加环境变量
5. 输入以下变量（选择"Production"环境）：

| Key | Value | Environment |
|-----|-------|-------------|
| DATABASE_URL | postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require | Production |
| JWT_SECRET | a915ab35-9534-43ad-b925-d9102c5007ba-PulseOpti-HR-JWT-Secret-Key-2025-01-19 | Production |
| JWT_EXPIRES_IN | 7d | Production |
| NEXT_PUBLIC_APP_URL | https://www.aizhixuan.com.cn | Production |
| SMTP_HOST | smtp.qq.com | Production |
| SMTP_PORT | 587 | Production |
| SMTP_SECURE | false | Production |
| SMTP_USER | 208343256@qq.com | Production |
| SMTP_PASSWORD | xxwbcxaojrqwbjia | Production |
| SMTP_FROM | PulseOpti HR <PulseOptiHR@163.com> | Production |
| SMTP_NAME | PulseOpti HR 脉策聚效 | Production |
| COZE_API_KEY | a915ab35-9534-43ad-b925-d9102c5007ba | Production |
| ADMIN_EMAIL | 208343256@qq.com | Production |
| ADMIN_PASSWORD | admin123 | Production |

### 步骤4：重新部署

添加环境变量后，需要重新部署：

```bash
vercel --prod
```

### 步骤5：配置自定义域名

#### 方法1：通过Vercel CLI

```bash
vercel domains add www.aizhixuan.com.cn
```

#### 方法2：通过Vercel网页控制台

1. 访问：https://vercel.com/dashboard
2. 选择项目：PulseOpti-HR
3. 进入：Settings → Domains
4. 点击"Add Domain"
5. 输入：`www.aizhixuan.com.cn`
6. 点击"Add"

Vercel会显示DNS配置信息，类似：

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 步骤6：配置域名解析

登录你的域名提供商（阿里云、腾讯云等），添加DNS记录：

**添加CNAME记录**：

| 类型 | 主机记录 | 记录值 | TTL |
|------|----------|--------|-----|
| CNAME | www | cname.vercel-dns.com | 600 |

**添加A记录（可选，支持根域名）**：

| 类型 | 主机记录 | 记录值 | TTL |
|------|----------|--------|-----|
| A | @ | 76.76.21.21 | 600 |

### 步骤7：等待DNS生效

DNS配置后，通常需要10分钟到24小时生效。

**验证DNS生效**：
```bash
# Windows
nslookup www.aizhixuan.com.cn

# Mac/Linux
dig www.aizhixuan.com.cn
```

返回的IP应该指向Vercel。

### 步骤8：运行数据库迁移

```bash
# 拉取生产环境变量
vercel env pull .env.production

# 运行数据库迁移
pnpm db:push

# 创建超级管理员
npx tsx --env-file=.env.production create-admin.ts
```

---

## ✅ 验证部署

### 1. 检查前端访问

访问：https://www.aizhixuan.com.cn

**预期结果**：
- 页面正常加载
- 显示PulseOpti HR首页
- 功能正常

### 2. 检查注册功能

1. 访问：https://www.aizhixuan.com.cn/register
2. 填写注册表单
3. 提交注册

**预期结果**：
- 注册成功
- 自动登录
- 跳转到首页

### 3. 检查超管端访问

访问：https://pulseopti-hr.loca.lt/admin/login

**预期结果**：
- 超管端正常访问
- 可以登录
- 可以看到新注册的用户

### 4. 验证数据同步

1. 在前端注册一个新用户
2. 在超管端查看用户管理页面
3. 确认新用户立即显示

---

## 🔍 故障排查

### 问题1：环境变量未生效

**症状**：应用报错`DATABASE_URL is not set`

**解决**：
1. 检查Vercel控制台环境变量是否配置
2. 重新部署：`vercel --prod`
3. 检查环境变量是否选择"Production"环境

### 问题2：域名无法访问

**症状**：访问域名显示"无法访问"

**解决**：
1. 检查DNS配置是否正确
2. 使用nslookup检查DNS解析
3. 等待DNS生效（可能需要10分钟到24小时）
4. 检查Vercel控制台域名状态

### 问题3：数据库连接失败

**症状**：应用报错"Database connection failed"

**解决**：
1. 检查DATABASE_URL是否正确
2. 检查Neon数据库是否正常运行
3. 检查网络连接
4. 运行数据库迁移：`pnpm db:push`

### 问题4：页面500错误

**症状**：访问页面显示500 Internal Server Error

**解决**：
1. 查看Vercel部署日志
2. 检查环境变量是否正确
3. 检查代码是否有语法错误
4. 本地运行测试：`pnpm dev`

---

## 📊 部署完成后

### 访问地址

**前端**：
- 生产环境：https://www.aizhixuan.com.cn
- 备用地址：https://pulseopti-hr.vercel.app

**超管端**：
- 临时地址：https://pulseopti-hr.loca.lt/admin/login
- 未来地址：https://admin.aizhixuan.com.cn（待配置）

### 默认账号

**超级管理员**：
- 邮箱：208343256@qq.com
- 密码：admin123

### 数据库

- 类型：Neon PostgreSQL
- 连接字符串：已在环境变量中配置
- 数据表：59张

---

## 🎯 下一步

1. **测试前端功能**：
   - [ ] 用户注册
   - [ ] 用户登录
   - [ ] 创建订单
   - [ ] 支付流程

2. **测试超管端功能**：
   - [ ] 查看用户列表
   - [ ] 查看订单列表
   - [ ] 查看统计数据
   - [ ] 查看审计日志

3. **测试数据同步**：
   - [ ] 前端注册 → 超管端看到
   - [ ] 前端下单 → 超管端看到
   - [ ] 数据一致性验证

---

## 📞 技术支持

### 常用命令

```bash
# 查看部署状态
vercel ls

# 查看部署日志
vercel logs

# 查看环境变量
vercel env ls

# 删除环境变量
vercel env rm DATABASE_URL production

# 重新部署
vercel --prod

# 本地构建测试
pnpm build

# 本地运行
pnpm dev --port 5000

# 数据库迁移
pnpm db:push

# 数据库管理
pnpm db:studio
```

### 文档链接

- Vercel官方文档：https://vercel.com/docs
- Neon文档：https://neon.tech/docs
- Next.js文档：https://nextjs.org/docs

---

**最后更新**: 2026-01-19 22:45
**状态**: ✅ 部署指南完成，等待执行
