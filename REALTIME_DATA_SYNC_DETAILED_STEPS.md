# 用户前端与超管端实时数据同步 - 详细执行步骤

## 🎯 目标
- 使用子域名 https://admin.aizhixuan.com.cn 部署超管端到 Vercel
- 实现前端和超管端实时数据同步（共享数据库架构）

## 📐 架构设计
```
┌─────────────────────────────────────────────────────────────┐
│                      Vercel 平台                            │
│                                                             │
│  ┌──────────────────────┐         ┌──────────────────────┐ │
│  │   前端应用            │         │   超管端应用          │ │
│  │   www.aizhixuan.com.cn        │   admin.aizhixuan.com.cn    │ │
│  │   pulseopti-hr.vercel.app     │   pulseopti-hr-admin.vercel.app  │ │
│  └──────────┬───────────┘         └──────────┬───────────┘ │
│             │                               │              │
│             └─────────────┬─────────────────┘              │
│                           │                                │
│                     ┌─────▼─────┐                          │
│                     │  共享数据库 │                          │
│                     │  PostgreSQL │                          │
│                     │   (Neon)    │                          │
│                     └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

## 📝 详细执行步骤

### 步骤 1：准备工作

#### 1.1 安装必要工具
```bash
# 全局安装 Vercel CLI
pnpm add -g vercel

# 验证安装
vercel --version
```

#### 1.2 登录 Vercel
```bash
# 登录 Vercel（需要浏览器交互）
vercel login
```

**执行方式**：
1. 复制命令到本地终端执行
2. 访问显示的 URL 进行授权
3. 在浏览器中完成登录

---

### 步骤 2：获取前端数据库连接信息

#### 2.1 查看当前项目配置
```bash
# 在项目根目录执行
cd /workspace/projects/PulseOpti-HR

# 查看当前 Vercel 项目信息
vercel link

# 查看环境变量
vercel env ls
```

#### 2.2 获取 DATABASE_URL
```bash
# 导出数据库连接字符串到环境变量
vercel env pull .env.local
```

**执行方式**：
- 在项目根目录执行上述命令
- 这会将 Vercel 环境变量同步到本地 .env.local 文件

#### 2.3 查看并记录 DATABASE_URL
```bash
# 查看数据库连接字符串
cat .env.local | grep DATABASE_URL
```

**重要**：
- 复制完整的 DATABASE_URL 值
- 格式：`postgresql://username:password@host/database?sslmode=require`
- 这个值将在超管端部署时使用

---

### 步骤 3：配置超管端环境变量

#### 3.1 创建超管端环境配置文件
```bash
# 在项目根目录创建超管端配置
cat > .env.admin.local << 'EOF'
# 超管端环境变量配置
# ⚠️ 关键：DATABASE_URL 必须与前端完全相同，以实现数据同步

# 数据库连接（与前端共享同一个数据库）
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# JWT 配置
JWT_SECRET=super_admin_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# 应用配置
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://admin.aizhixuan.com.cn
NEXT_PUBLIC_API_URL=https://admin.aizhixuan.com.cn

# AI 配置
DOUBAO_API_KEY=your_doubao_api_key_here

# 邮件配置
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_USER=your_qq_email@qq.com
SMTP_PASSWORD=your_qq_authorization_code
SMTP_FROM=PulseOptiHR@163.com

# 短信配置（可选）
SMS_ACCESS_KEY_ID=your_access_key
SMS_ACCESS_KEY_SECRET=your_secret_key
SMS_SIGN_NAME=PulseOptiHR

# 对象存储配置（可选）
S3_ENDPOINT=your_s3_endpoint
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_BUCKET=pulseopti-hr
S3_REGION=auto

# 超管端特定配置
SUPER_ADMIN_EMAIL=208343256@qq.com
SUPER_ADMIN_PASSWORD=admin123
ADMIN_MODE=true
EOF
```

**执行方式**：
1. 在项目根目录执行上述命令
2. 将步骤 2.3 中获取的 `DATABASE_URL` 替换到文件中
3. 根据实际情况修改其他配置项

---

### 步骤 4：部署超管端到 Vercel

#### 4.1 创建新的 Vercel 项目用于超管端
```bash
# 在项目根目录执行
vercel --prod --yes

# 或者指定项目名称
vercel --prod --yes --name pulseopti-hr-admin
```

**执行方式**：
- 在项目根目录执行
- 这会创建新的 Vercel 项目并部署

#### 4.2 配置超管端环境变量
```bash
# 添加数据库连接字符串（与前端共享）
vercel env add DATABASE_URL production
# 输入步骤 2.3 获取的 DATABASE_URL

# 添加 JWT 密钥
vercel env add JWT_SECRET production
# 输入：super_admin_jwt_secret_key_change_in_production

# 添加应用 URL
vercel env add NEXT_PUBLIC_APP_URL production
# 输入：https://admin.aizhixuan.com.cn

# 添加 API URL
vercel env add NEXT_PUBLIC_API_URL production
# 输入：https://admin.aizhixuan.com.cn

# 添加 Node 环境
vercel env add NODE_ENV production
# 输入：production

# 添加超管端特定配置
vercel env add SUPER_ADMIN_EMAIL production
# 输入：208343256@qq.com

vercel env add SUPER_ADMIN_PASSWORD production
# 输入：admin123

vercel env add ADMIN_MODE production
# 输入：true
```

**执行方式**：
- 逐条执行上述命令
- 每条命令执行后，输入对应的环境变量值
- 确保所有环境变量都添加成功

#### 4.3 验证环境变量配置
```bash
# 查看所有生产环境变量
vercel env ls production
```

**预期输出**：
```
Environment Variables found in Project pulseopti-hr-admin:

DATABASE_URL
JWT_SECRET
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_API_URL
NODE_ENV
SUPER_ADMIN_EMAIL
SUPER_ADMIN_PASSWORD
ADMIN_MODE
```

---

### 步骤 5：配置自定义域名

#### 5.1 添加自定义域名
```bash
# 方法 1：通过 Vercel CLI
vercel domains add admin.aizhixuan.com.cn

# 方法 2：通过 Vercel Dashboard（推荐）
# 1. 访问 https://vercel.com/dashboard
# 2. 选择项目 pulseopti-hr-admin
# 3. 进入 Settings > Domains
# 4. 添加域名：admin.aizhixuan.com.cn
```

**执行方式**：
- 推荐使用 Vercel Dashboard 配置域名
- 更直观且不易出错

#### 5.2 配置 DNS 记录
```bash
# 查看需要的 DNS 记录
vercel domains inspect admin.aizhixuan.com.cn
```

**DNS 配置步骤**：
1. 登录域名注册商（腾讯云/阿里云等）
2. 找到域名 aizhixuan.com.cn 的 DNS 管理页面
3. 添加以下 DNS 记录：

| 类型 | 主机记录 | 记录值 | TTL |
|------|---------|--------|-----|
| CNAME | admin | cname.vercel-dns.com | 600 |

#### 5.3 验证 DNS 配置
```bash
# 检查 DNS 解析（等待 5-10 分钟后）
dig admin.aizhixuan.com.cn

# 或使用 nslookup
nslookup admin.aizhixuan.com.cn
```

**预期输出**：
```
admin.aizhixuan.com.cn. 300 IN CNAME cname.vercel-dns.com.
```

---

### 步骤 6：重新部署以应用域名配置

```bash
# 重新部署超管端
vercel --prod

# 或使用别名部署
vercel --prod --alias admin.aizhixuan.com.cn
```

**执行方式**：
- 等待 DNS 生效后执行（通常 5-10 分钟）
- 部署完成后访问 https://admin.aizhixuan.com.cn

---

### 步骤 7：验证超管端部署成功

#### 7.1 检查部署状态
```bash
# 查看最新部署信息
vercel ls

# 查看部署日志
vercel logs --follow
```

#### 7.2 访问超管端
```
访问 URL：https://admin.aizhixuan.com.cn/login
```

**预期结果**：
- 页面正常加载
- 显示超管端登录界面
- 无错误信息

---

### 步骤 8：创建超级管理员账号

#### 8.1 方式 1：通过超管端注册页面
```
访问：https://admin.aizhixuan.com.cn/register

填写信息：
- 邮箱：208343256@qq.com
- 密码：admin123
- 姓名：超级管理员
- 手机：13800138000
```

#### 8.2 方式 2：通过 API 创建
```bash
# 创建超级管理员账号的 API 调用
curl -X POST https://admin.aizhixuan.com.cn/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "208343256@qq.com",
    "password": "admin123",
    "name": "超级管理员",
    "phone": "13800138000",
    "role": "SUPER_ADMIN",
    "accountType": "email"
  }'
```

**执行方式**：
- 推荐使用方式 1（通过注册页面）
- 如果 API 调用失败，检查环境变量配置

---

### 步骤 9：测试数据实时同步

#### 9.1 在前端注册新用户
```
访问：https://www.aizhixuan.com.cn/register

填写信息：
- 邮箱：testuser@example.com
- 密码：test123
- 姓名：测试用户
```

#### 9.2 在超管端查看用户数据
```
访问：https://admin.aizhixuan.com.cn/admin/users

操作：
1. 登录超级管理员账号（208343256@qq.com / admin123）
2. 进入"用户管理"页面
3. 查看是否显示刚注册的用户 testuser@example.com
```

**预期结果**：
- 前端注册成功后
- 超管端用户管理页面立即显示该用户
- 数据完全同步，无需额外操作

#### 9.3 验证数据共享机制
```bash
# 通过 API 查询前端用户数据
curl https://www.aizhixuan.com.cn/api/auth/me \
  -H "Authorization: Bearer YOUR_FRONTEND_TOKEN"

# 通过 API 查询超管端用户数据
curl https://admin.aizhixuan.com.cn/api/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**预期结果**：
- 两个 API 返回的用户数据来自同一个数据库
- 数据完全一致

---

### 步骤 10：监控和维护

#### 10.1 查看部署日志
```bash
# 实时查看超管端日志
vercel logs --follow

# 查看前端日志
vercel logs --follow --scope pulseopti-hr
```

#### 10.2 监控数据库连接
```bash
# 使用 Drizzle Studio 查看数据库
pnpm db:studio

# 或连接到 Neon Dashboard 查看连接数
# 访问：https://console.neon.tech
```

#### 10.3 更新超管端代码
```bash
# 1. 修改代码后提交到 Git
git add .
git commit -m "update admin dashboard"
git push

# 2. 触发 Vercel 自动部署
# 访问：https://vercel.com/dashboard
# 查看 pulseopti-hr-admin 项目自动部署状态

# 3. 或手动触发部署
vercel --prod
```

---

## 🔍 故障排查

### 问题 1：超管端访问 404
**原因**：DNS 配置未生效或部署未完成
**解决**：
```bash
# 检查 DNS 解析
dig admin.aizhixuan.com.cn

# 重新部署
vercel --prod

# 等待 5-10 分钟后重试
```

### 问题 2：超管端登录失败
**原因**：JWT_SECRET 配置错误或数据库连接失败
**解决**：
```bash
# 检查环境变量
vercel env ls production

# 检查数据库连接
curl https://admin.aizhixuan.com.cn/api/health

# 查看错误日志
vercel logs --follow
```

### 问题 3：数据不同步
**原因**：DATABASE_URL 不一致
**解决**：
```bash
# 确保两个项目使用相同的 DATABASE_URL
# 查看前端数据库连接
vercel env ls --scope pulseopti-hr production | grep DATABASE_URL

# 查看超管端数据库连接
vercel env ls --scope pulseopti-hr-admin production | grep DATABASE_URL

# 更新超管端数据库连接（如果不同）
vercel env rm DATABASE_URL production
vercel env add DATABASE_URL production
# 输入与前端相同的 DATABASE_URL

# 重新部署
vercel --prod
```

### 问题 4：数据库连接超时
**原因**：连接池配置不当
**解决**：
```bash
# 检查数据库连接池配置
# 编辑 src/lib/db/index.ts
# 确保配置如下：
{
  max: 20,
  min: 2,
  idle_timeout: 10 * 1000,
  connect_timeout: 10 * 1000,
}

# 重新部署
vercel --prod
```

---

## 📊 数据同步架构说明

### 共享数据库架构优势

1. **实时同步**：前端和超管端直接访问同一个数据库，数据天然实时同步
2. **无需同步机制**：不需要额外的数据同步服务或中间件
3. **简化架构**：减少系统复杂度，降低维护成本
4. **数据一致性**：避免数据不一致问题

### 数据隔离机制

虽然共享数据库，但通过以下方式实现数据隔离：

1. **权限控制**：
   - 前端：普通用户权限，只能访问自己的数据
   - 超管端：超级管理员权限，可以访问所有数据

2. **API 层隔离**：
   - 前端 API：`/api/*` - 提供给普通用户
   - 超管端 API：`/api/admin/*` - 提供给超级管理员

3. **JWT 验证**：
   - JWT token 包含用户角色信息
   - 后端 API 根据 token 验证权限

---

## ✅ 验证清单

部署完成后，请逐一验证以下项目：

- [ ] 超管端可以正常访问（https://admin.aizhixuan.com.cn）
- [ ] 超管端登录页面正常显示
- [ ] 超级管理员账号创建成功
- [ ] 超管端可以登录（208343256@qq.com / admin123）
- [ ] 超管端仪表盘正常显示
- [ ] 超管端用户管理页面可以查看前端用户
- [ ] 前端注册新用户后，超管端实时显示
- [ ] 超管端创建企业后，前端可以看到对应数据
- [ ] 环境变量配置正确（DATABASE_URL 相同）
- [ ] DNS 解析正常（admin.aizhixuan.com.cn → cname.vercel-dns.com）
- [ ] SSL 证书正常（HTTPS 可访问）
- [ ] 数据库连接正常（无连接错误日志）
- [ ] API 调用正常（无 500 错误）

---

## 🚀 快速部署命令汇总

### 一键部署超管端
```bash
# 1. 安装 Vercel CLI
pnpm add -g vercel

# 2. 登录 Vercel
vercel login

# 3. 创建新项目并部署
vercel --prod --name pulseopti-hr-admin

# 4. 配置环境变量（逐条执行）
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NODE_ENV production
vercel env add SUPER_ADMIN_EMAIL production
vercel env add SUPER_ADMIN_PASSWORD production
vercel env add ADMIN_MODE production

# 5. 添加自定义域名
vercel domains add admin.aizhixuan.com.cn

# 6. 重新部署
vercel --prod

# 7. 访问超管端
# https://admin.aizhixuan.com.cn/login
```

### 验证数据同步
```bash
# 1. 在前端注册用户
# 访问：https://www.aizhixuan.com.cn/register

# 2. 在超管端查看
# 访问：https://admin.aizhixuan.com.cn/admin/users

# 3. 验证数据一致
```

---

## 📞 技术支持

如遇问题，请参考以下文档：
- [Vercel 官方文档](https://vercel.com/docs)
- [Neon 数据库文档](https://neon.tech/docs)
- [项目 README](https://github.com/tomato-writer-2024/PulseOpti-HR)

---

## 📝 注意事项

1. **DATABASE_URL 必须相同**：这是实现数据同步的关键
2. **环境变量配置**：确保所有必要的环境变量都已添加
3. **DNS 配置时间**：DNS 生效需要 5-10 分钟，请耐心等待
4. **SSL 证书**：Vercel 会自动为自定义域名配置 SSL
5. **数据库连接池**：合理配置连接池参数，避免连接超时
6. **JWT 密钥安全**：生产环境请使用强密码
7. **定期监控**：定期查看部署日志和数据库连接数

---

**最后更新时间**：2024-12-19
**文档版本**：v1.0.0
**作者**：PulseOpti HR 团队
