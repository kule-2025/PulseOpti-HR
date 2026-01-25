# 用户前端与超管端实时数据同步操作指南

## 🎯 核心原理

**共享数据库架构**：前端和超管端使用同一个Neon PostgreSQL数据库，实现数据天然实时同步。

```
┌─────────────────┐
│  用户前端       │
│  www.aizhixuan. │
│  com.cn         │
└────────┬────────┘
         │ 读写
         ↓
┌─────────────────────────┐
│  Neon PostgreSQL        │
│  (共享数据库)           │
│  DATABASE_URL           │
└────────┬────────────────┘
         │ 读取
         ↓
┌─────────────────┐
│  超管端         │
│  admin.aizhixuan│
│  .com.cn        │
└─────────────────┘
```

## 📋 前置条件检查清单

在开始之前，请确认以下条件已满足：

### ✅ 数据库条件
- [ ] 已有Neon PostgreSQL数据库
- [ ] 数据库连接字符串（DATABASE_URL）可用
- [ ] 已运行数据库迁移（59张表已创建）

### ✅ 前端条件
- [ ] 前端已部署到 https://www.aizhixuan.com.cn
- [ ] 登录注册功能正常工作
- [ ] 可以创建用户和企业

### ✅ 超管端条件
- [ ] 超管端代码已准备好（已在本项目中）
- [ ] 超管端独立域名（admin.aizhixuan.com.cn）

## 🚀 完整操作步骤

### 步骤1：验证当前数据库连接

首先验证前端的数据库连接是否正常。

```bash
# 检查环境变量（在Vercel项目设置中）
# 打开：https://vercel.com/your-username/pulseopti-hr/settings/environment-variables
# 确认以下变量已配置：
# - DATABASE_URL: postgresql://xxx.xxx@xxx.aws.neon.tech/neondb?sslmode=require
```

**测试数据库连接：**

```bash
# 在沙箱环境中测试
cd /workspace/projects

# 检查数据库健康状态
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://neondb_owner:npg_G3Ov4gD0rZfH@ep-solitary-cell-a5c5u9xxp.us-east-2.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('数据库连接失败:', err);
  else console.log('✅ 数据库连接成功:', res.rows[0]);
  pool.end();
});
"
```

**预期输出：**
```
✅ 数据库连接成功: { now: 2025-01-19T22:30:00.000Z }
```

---

### 步骤2：检查当前数据表结构

确认数据库中已有所有必要的表。

```bash
cd /workspace/projects

# 运行数据库迁移（如果尚未运行）
pnpm db:push

# 预期输出：
# ✅ Database schema pushed successfully
```

**验证关键表：**
- `users` - 用户表
- `companies` - 企业表
- `subscriptions` - 订阅表
- `audit_logs` - 审计日志表

---

### 步骤3：创建超管端独立项目

超管端需要独立部署，但使用**相同**的数据库连接。

**方式一：使用独立仓库（推荐）**

```bash
# 1. 创建超管端仓库（在GitHub）
# 仓库名：pulseopti-hr-admin

# 2. 克隆前端代码
cd /tmp
git clone https://github.com/your-username/pulseopti-hr.git pulseopti-hr-admin
cd pulseopti-hr-admin

# 3. 修改超管端首页，只显示超管端内容
# 编辑 src/app/admin/page.tsx
# 确保内容为超管端专用

# 4. 推送到新仓库
git remote set-url origin https://github.com/your-username/pulseopti-hr-admin.git
git push -u origin main
```

**方式二：使用多环境部署（简单）**

继续使用当前仓库，通过环境变量区分：

- **生产环境（前端）**：`www.aizhixuan.com.cn`
- **超管环境（超管端）**：`admin.aizhixuan.com.cn`

---

### 步骤4：配置Vercel超管端项目

#### 4.1 创建新的Vercel项目

1. 访问 https://vercel.com/new
2. 导入项目：选择 `pulseopti-hr` 仓库（或新建的超管端仓库）
3. 项目名称：`pulseopti-hr-admin`
4. 框架预设：Next.js
5. 根目录：`./`
6. 构建命令：`pnpm run build`
7. 输出目录：`.next`
8. 安装命令：`pnpm install`

#### 4.2 配置环境变量（关键！）

在Vercel项目设置中添加以下环境变量：

**必须使用与前端相同的DATABASE_URL！**

```env
# 数据库配置（与前端完全相同）
DATABASE_URL=postgres://neondb_owner:YOUR_PASSWORD@ep-xxx.aws.neon.tech/neondb?sslmode=require

# JWT配置
JWT_SECRET=your-jwt-secret-key-here
JWT_EXPIRES_IN=7d

# 应用配置
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://admin.aizhixuan.com.cn

# AI配置（可选）
DOUBAO_API_KEY=your-doubao-api-key
```

**重要说明**：
- `DATABASE_URL` 必须与前端完全相同
- 这样超管端和前端共享同一个数据库
- 数据自然实时同步

---

### 步骤5：配置自定义域名

#### 5.1 配置超管端域名

1. 在Vercel项目中，进入 "Settings" → "Domains"
2. 添加域名：`admin.aizhixuan.com.cn`
3. Vercel会提供DNS配置信息

#### 5.2 配置DNS记录

在Cloudflare（或您的DNS提供商）添加以下记录：

```
类型: CNAME
名称: admin
内容: cname.vercel-dns.com
代理状态: 已代理（橙色云朵）
TTL: 自动
```

**DNS配置示例（Cloudflare）：**

```
┌─────────────────────────────────────────────────────────┐
│  类型    名称    内容                   TTL   代理状态  │
├─────────────────────────────────────────────────────────┤
│  CNAME   admin   cname.vercel-dns.com  自动   已代理    │
│  CNAME   www     cname.vercel-dns.com  自动   已代理    │
└─────────────────────────────────────────────────────────┘
```

#### 5.3 等待DNS生效

DNS生效通常需要5-15分钟，最长可能需要24小时。

**验证DNS是否生效：**

```bash
# 在Windows CMD中运行
nslookup admin.aizhixuan.com.cn

# 预期输出（显示Vercel的IP地址）：
# Non-authoritative answer:
# Name:    admin.aizhixuan.com.cn
# Address: 76.76.21.21
```

---

### 步骤6：部署超管端到Vercel

#### 6.1 触发部署

```bash
# 方式一：通过Git推送触发（推荐）
cd /workspace/projects
git add .
git commit -m "feat: 配置超管端共享数据库"
git push origin main

# 方式二：在Vercel控制台手动部署
# 访问：https://vercel.com/your-username/pulseopti-hr-admin/deployments
# 点击 "Redeploy"
```

#### 6.2 监控部署过程

在Vercel控制台查看部署日志：

1. 访问：https://vercel.com/your-username/pulseopti-hr-admin/deployments
2. 查看部署状态：
   - ✅ Queued（排队中）
   - 🔄 Building（构建中）
   - ✅ Deployed（部署成功）
   - ❌ Error（部署失败）

**预期部署时间**：3-5分钟

---

### 步骤7：验证超管端部署

#### 7.1 测试超管端首页

```bash
# 测试超管端是否可以访问
curl -I https://admin.aizhixuan.com.cn --max-time 10

# 预期输出：
# HTTP/2 200
# content-type: text/html; charset=utf-8
```

#### 7.2 测试超管端API

```bash
# 测试超管端统计API
curl https://admin.aizhixuan.com.cn/api/admin/dashboard/stats \
  -H "Content-Type: application/json" \
  --max-time 10

# 预期输出（如果有数据）：
# {
#   "totalUsers": 10,
#   "totalCompanies": 5,
#   "totalRevenue": 15000,
#   "activeUsers": 8
# }
```

#### 7.3 浏览器测试

访问：https://admin.aizhixuan.com.cn

检查以下内容：
- ✅ 页面正常加载
- ✅ 导航菜单显示正确
- ✅ 超管端Logo显示
- ✅ 登录页面可访问

---

### 步骤8：创建超管管理员账号

```bash
cd /workspace/projects

# 创建超管管理员脚本
cat > create-super-admin.js << 'EOF'
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://neondb_owner:npg_G3Ov4gD0rZfH@ep-solitary-cell-a5c5u9xxp.us-east-2.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function createSuperAdmin() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 创建超级管理员企业
    const companyResult = await client.query(`
      INSERT INTO companies (id, name, industry, size, subscription_tier, max_employees)
      VALUES ('admin-company-id-001', 'PulseOpti HR 管理公司', '互联网', '10-50人', 'enterprise', 1000)
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `);

    const companyId = companyResult.rows[0]?.id || 'admin-company-id-001';

    // 创建超级管理员账号
    const adminResult = await client.query(`
      INSERT INTO users (id, company_id, email, name, password, role, is_super_admin, is_active)
      VALUES ('admin-user-id-001', $1, 'admin@aizhixuan.com.cn', '超级管理员', '$2b$10$YourHashedPasswordHere', 'admin', true, true)
      ON CONFLICT (email) DO UPDATE SET
        role = 'admin',
        is_super_admin = true
      RETURNING *
    `, [companyId]);

    console.log('✅ 超级管理员创建成功：');
    console.log('   邮箱：admin@aizhixuan.com.cn');
    console.log('   密码：Admin123456（默认）');
    console.log('   角色：超级管理员');
    console.log('   企业ID：', companyId);
    console.log('   用户ID：', adminResult.rows[0].id);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 创建失败：', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createSuperAdmin();
EOF

# 运行脚本
node create-super-admin.js
```

**修改默认密码：**

```bash
# 生成密码哈希
node -e "
const bcrypt = require('bcryptjs');
bcrypt.hash('Admin123456', 10).then(hash => console.log(hash));
"
```

将生成的哈希替换到脚本中的 `$2b$10$YourHashedPasswordHere`

---

### 步骤9：验证实时数据同步

#### 9.1 在前端创建测试用户

访问：https://www.aizhixuan.com.cn

1. 点击"注册"
2. 填写注册信息：
   - 邮箱：test-user@example.com
   - 验证码：123456
   - 密码：Test123456
   - 企业名称：测试企业
   - 姓名：测试用户
3. 提交注册

#### 9.2 在超管端查看数据

访问：https://admin.aizhixuan.com.cn

1. 使用超级管理员账号登录
   - 邮箱：admin@aizhixuan.com.cn
   - 密码：Admin123456
2. 进入"用户管理"页面
3. 搜索刚才注册的 `test-user@example.com`

**预期结果：**
- ✅ 可以看到刚注册的用户
- ✅ 可以看到刚创建的企业
- ✅ 数据实时同步（延迟<1秒）

#### 9.3 API验证

```bash
# 在前端创建用户后，立即在超管端查询

# 1. 前端：创建用户
curl -X POST https://www.aizhixuan.com.cn/api/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sync-test@example.com",
    "code": "123456",
    "password": "Test123456",
    "companyName": "同步测试企业",
    "name": "同步测试用户"
  }'

# 2. 超管端：立即查询用户列表
curl https://admin.aizhixuan.com.cn/api/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  --max-time 10

# 预期输出：
# {
#   "users": [
#     {
#       "id": "...",
#       "email": "sync-test@example.com",
#       "name": "同步测试用户",
#       "companyName": "同步测试企业",
#       ...
#     }
#   ]
# }
```

---

## 🔍 数据同步原理说明

### 为什么数据能实时同步？

1. **共享数据库**：前端和超管端使用相同的 `DATABASE_URL`
2. **直接写入**：前端写入数据库后，数据立即在数据库中可用
3. **即时查询**：超管端查询时直接从数据库读取最新数据
4. **无延迟**：无需同步机制，数据天然一致

### 数据流向示例

```
用户注册流程：
1. 用户在前端填写注册表单
   ↓
2. 前端调用 POST /api/auth/register/email
   ↓
3. API写入Neon数据库
   - INSERT INTO users (...)
   - INSERT INTO companies (...)
   - INSERT INTO subscriptions (...)
   ↓
4. 数据立即在数据库中可用
   ↓
5. 超管端查询数据库
   - SELECT * FROM users
   ↓
6. 看到最新注册的用户（延迟<1秒）
```

---

## 📊 监控数据同步

### 实时监控脚本

创建监控脚本 `sync-monitor.js`：

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function monitorSync() {
  const client = await pool.connect();
  try {
    // 查询当前数据统计
    const result = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM users) as user_count,
        (SELECT COUNT(*) FROM companies) as company_count,
        (SELECT COUNT(*) FROM subscriptions) as subscription_count,
        NOW() as timestamp
    `);

    const stats = result.rows[0];

    console.log('📊 数据同步监控：');
    console.log('   用户数量：', stats.user_count);
    console.log('   企业数量：', stats.company_count);
    console.log('   订阅数量：', stats.subscription_count);
    console.log('   更新时间：', stats.timestamp);
    console.log('');

    // 查询最近10分钟的用户
    const recentUsers = await client.query(`
      SELECT email, name, created_at
      FROM users
      WHERE created_at > NOW() - INTERVAL '10 minutes'
      ORDER BY created_at DESC
      LIMIT 5
    `);

    if (recentUsers.rows.length > 0) {
      console.log('🆕 最近10分钟注册的用户：');
      recentUsers.rows.forEach(user => {
        console.log(`   - ${user.email} (${user.name}) - ${user.created_at}`);
      });
    } else {
      console.log('   暂无新用户注册');
    }
  } finally {
    client.release();
  }
}

// 每10秒执行一次监控
setInterval(monitorSync, 10000);
monitorSync();
```

**运行监控：**

```bash
node sync-monitor.js
```

---

## 🛠️ 故障排查

### 问题1：超管端看不到前端创建的用户

**检查清单：**

```bash
# 1. 确认数据库连接是否相同
echo "前端DATABASE_URL:"
echo $FRONTEND_DATABASE_URL
echo ""
echo "超管端DATABASE_URL:"
echo $ADMIN_DATABASE_URL

# 2. 验证数据库中的数据
psql $DATABASE_URL -c "SELECT email, name FROM users ORDER BY created_at DESC LIMIT 5;"

# 3. 检查超管端API是否正常
curl https://admin.aizhixuan.com.cn/api/admin/users
```

**解决方案：**
- 确保前端和超管端的 `DATABASE_URL` 完全相同
- 检查超管端是否有读取权限
- 验证数据库迁移是否成功

### 问题2：DNS解析失败

**检查方法：**

```bash
# 检查DNS解析
nslookup admin.aizhixuan.com.cn

# 检查Vercel配置
curl -I https://admin.aizhixuan.com.cn
```

**解决方案：**
- 等待DNS生效（5-15分钟）
- 检查Cloudflare DNS配置
- 确认Vercel已正确配置域名

### 问题3：超管端登录失败

**检查方法：**

```bash
# 检查超级管理员账号是否存在
psql $DATABASE_URL -c "SELECT email, is_super_admin FROM users WHERE is_super_admin = true;"

# 检查密码哈希
psql $DATABASE_URL -c "SELECT email, password FROM users WHERE email = 'admin@aizhixuan.com.cn';"
```

**解决方案：**
- 重新创建超级管理员账号
- 确认密码哈希正确
- 检查JWT配置是否正确

---

## ✅ 验证清单

完成以下步骤确认数据同步正常：

- [ ] 超管端成功部署到 https://admin.aizhixuan.com.cn
- [ ] DNS解析正常
- [ ] 超管端可以访问
- [ ] 前端和超管端使用相同的DATABASE_URL
- [ ] 超级管理员账号创建成功
- [ ] 超管端可以登录
- [ ] 在前端创建测试用户
- [ ] 超管端可以看到前端创建的用户
- [ ] 数据实时同步（延迟<1秒）
- [ ] 监控脚本正常运行

---

## 📞 技术支持

如有问题，请联系：
- 邮箱：PulseOptiHR@163.com
- 地址：广州市天河区

---

**创建时间**：2025-01-19 22:30
**更新时间**：2025-01-19 22:30
**版本**：v1.0
