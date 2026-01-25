# 🔄 实时数据同步解决方案

## 📋 需求分析

**你的需求**：
1. 超管端需要看到真实用户在前端（https://www.aizhixuan.com.cn）产生的数据
2. 超管端的数据必须与前端实时同步

---

## 🎯 解决方案架构

### 方案概述

采用**共享数据库架构**，前端和超管端共享同一个Neon PostgreSQL数据库，实现天然的数据实时同步。

```
前端用户 (https://www.aizhixuan.com.cn)
    ↓
    ├─ 注册/登录 → 写入数据库
    ├─ 创建订单 → 写入数据库
    ├─ 业务操作 → 写入数据库
    └─ 所有操作 → 记录审计日志
            ↓
    共享数据库 (Neon PostgreSQL)
            ↓
超管端 (https://pulseopti-hr.loca.lt)
    ↓
    ├─ 查询用户数据 ← 从数据库读取
    ├─ 查询订单数据 ← 从数据库读取
    ├─ 查询审计日志 ← 从数据库读取
    └─ 实时刷新 ← 定时轮询
```

---

## ✅ 当前配置状态

### 数据库配置

**共享数据库**：Neon PostgreSQL
```
postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**环境变量**：
```env
DATABASE_URL=postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
NEXT_PUBLIC_APP_URL=https://www.aizhixuan.com.cn
```

### 前端配置

**域名**：https://www.aizhixuan.com.cn
**状态**：需要在Vercel部署
**数据库**：使用相同的Neon PostgreSQL

### 超管端配置

**域名**：https://pulseopti-hr.loca.lt（临时）
**状态**：已启动，通过LocalTunnel访问
**数据库**：使用相同的Neon PostgreSQL

---

## 🔧 实现步骤

### 步骤1：确保共享数据库连接 ⭐⭐⭐⭐⭐

**关键点**：前端和超管端必须使用相同的`DATABASE_URL`环境变量

**验证方法**：

1. **前端环境变量**（Vercel控制台）：
   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

2. **超管端环境变量**（.env文件）：
   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

3. **检查数据库连接**：
   ```bash
   # 在两个环境分别运行
   pnpm db:studio
   ```

   如果都能看到相同的数据库表和内容，说明共享成功。

---

### 步骤2：启用审计日志 ⭐⭐⭐⭐⭐

确保所有用户操作都记录到审计日志表。

**审计日志表结构**：
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  company_id UUID,
  user_id UUID,
  user_name VARCHAR(255),
  action VARCHAR(100),
  resource_type VARCHAR(100),
  resource_id UUID,
  status VARCHAR(50),
  error_message TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**关键操作必须记录**：
- ✅ 用户注册
- ✅ 用户登录
- ✅ 创建订单
- ✅ 支付成功
- ✅ 修改个人信息
- ✅ 创建/修改/删除业务数据

**审计日志API**：
```typescript
// src/app/api/admin/audit-logs/route.ts
export async function GET(request: NextRequest) {
  const db = await getDb();
  const logs = await db.select().from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(100);
  
  return NextResponse.json({ success: true, data: logs });
}
```

---

### 步骤3：实现超管端实时刷新 ⭐⭐⭐⭐

**方法1：定时轮询（推荐，简单）**

在超管端页面添加定时刷新：

```typescript
// src/app/admin/dashboard/page.tsx
useEffect(() => {
  // 初始加载
  fetchDashboardData();
  
  // 每30秒刷新一次
  const interval = setInterval(() => {
    fetchDashboardData();
  }, 30000);
  
  return () => clearInterval(interval);
}, []);
```

**方法2：WebSocket（高级，实时）**

如果需要真正的实时更新：

```typescript
// 使用服务器推送事件（SSE）
const eventSource = new EventSource('/api/admin/realtime');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateDashboard(data);
};
```

---

### 步骤4：前端部署到Vercel ⭐⭐⭐⭐⭐

将前端代码部署到Vercel，使用域名 https://www.aizhixuan.com.cn

#### 4.1 配置Vercel环境变量

在Vercel控制台配置以下环境变量：

```env
DATABASE_URL=postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=a915ab35-9534-43ad-b925-d9102c5007ba-PulseOpti-HR-JWT-Secret-Key-2025-01-19
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_APP_URL=https://www.aizhixuan.com.cn
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=208343256@qq.com
SMTP_PASSWORD=xxwbcxaojrqwbjia
SMTP_FROM=PulseOpti HR <PulseOptiHR@163.com>
SMTP_NAME=PulseOpti HR 脉策聚效
COZE_API_KEY=a915ab35-9534-43ad-b925-d9102c5007ba
ADMIN_EMAIL=208343256@qq.com
ADMIN_PASSWORD=admin123
```

#### 4.2 部署到Vercel

```bash
# 登录Vercel
vercel login

# 部署
vercel

# 配置域名
vercel domains add www.aizhixuan.com.cn
```

#### 4.3 配置自定义域名

在Vercel控制台：
1. 进入项目设置 → Domains
2. 添加域名：`www.aizhixuan.com.cn`
3. 按照Vercel提供的DNS配置，更新域名解析

**DNS配置**（在域名提供商处）：
```
类型: CNAME
名称: www
值: cname.vercel-dns.com
TTL: 300
```

#### 4.4 运行数据库迁移

```bash
# 拉取生产环境变量
vercel env pull .env.production

# 运行迁移
npx drizzle-kit push

# 创建超级管理员
npx tsx --env-file=.env.production create-admin.ts
```

---

### 步骤5：超管端访问配置 ⭐⭐⭐

**临时方案**：使用LocalTunnel
```
https://pulseopti-hr.loca.lt/admin/dashboard
```

**长期方案**：部署到Vercel，使用子域名
```
https://admin.aizhixuan.com.cn
```

---

## 🔄 数据流向图

### 用户注册流程

```
用户访问 https://www.aizhixuan.com.cn
    ↓
填写注册表单
    ↓
POST /api/auth/register
    ↓
写入数据库：users表
    ↓
写入审计日志：audit_logs表
    ↓
返回JWT token
    ↓
前端保存token到localStorage
    ↓
超管端查询：
GET /api/admin/users
    ↓
从数据库读取users表
    ↓
显示新注册用户
```

### 订单创建流程

```
用户选择套餐 → 点击订阅
    ↓
POST /api/orders/create
    ↓
写入数据库：orders表
    ↓
写入数据库：subscriptions表
    ↓
写入审计日志：audit_logs表
    ↓
返回订单信息
    ↓
超管端查询：
GET /api/admin/subscriptions
    ↓
从数据库读取subscriptions表
    ↓
显示新订阅
```

### 实时刷新流程

```
超管端页面加载
    ↓
useEffect 触发
    ↓
调用 API: GET /api/admin/dashboard/stats
    ↓
从数据库查询：
  - SELECT COUNT(*) FROM users
  - SELECT COUNT(*) FROM companies
  - SELECT COUNT(*) FROM subscriptions
  - SELECT COUNT(*) FROM workflow_instances
    ↓
返回实时统计数据
    ↓
更新超管端UI
    ↓
30秒后自动刷新
```

---

## 📊 超管端功能模块

### 1. 仪表盘（/admin/dashboard）

**实时数据**：
- 总用户数
- 总公司数
- 总订阅数
- 活跃工作流数
- 本月收入
- 本周新增用户

**数据来源**：
```typescript
GET /api/admin/dashboard/stats
→ 查询数据库：users, companies, subscriptions, workflow_instances
```

---

### 2. 用户管理（/admin/users）

**实时数据**：
- 用户列表
- 用户详情
- 用户状态
- 用户操作记录

**数据来源**：
```typescript
GET /api/admin/users
→ 查询数据库：users, companies, subscriptions

GET /api/admin/audit-logs?userId=xxx
→ 查询数据库：audit_logs
```

---

### 3. 企业管理（/admin/companies）

**实时数据**：
- 公司列表
- 公司详情
- 公司员工数
- 公司订阅状态

**数据来源**：
```typescript
GET /api/admin/companies
→ 查询数据库：companies, users, subscriptions
```

---

### 4. 订阅管理（/admin/subscriptions）

**实时数据**：
- 订阅列表
- 订阅状态
- 订单记录
- 收入统计

**数据来源**：
```typescript
GET /api/admin/subscriptions
→ 查询数据库：subscriptions, orders, companies

GET /api/admin/reports/revenue
→ 查询数据库：orders, subscriptions
```

---

### 5. 审计日志（/admin/audit-logs）

**实时数据**：
- 所有用户操作记录
- 系统事件
- 错误日志

**数据来源**：
```typescript
GET /api/admin/audit-logs
→ 查询数据库：audit_logs
```

---

## ✅ 验证清单

### 前端验证

- [ ] 域名访问：https://www.aizhixuan.com.cn
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 订单创建功能正常
- [ ] 所有操作写入数据库
- [ ] 所有操作记录审计日志

### 超管端验证

- [ ] 域名访问：https://pulseopti-hr.loca.lt
- [ ] 登录功能正常
- [ ] 仪表盘数据显示
- [ ] 用户管理页面显示实时用户
- [ ] 企业管理页面显示实时企业
- [ ] 订阅管理页面显示实时订阅
- [ ] 审计日志显示实时操作记录
- [ ] 数据自动刷新（30秒）

### 数据同步验证

- [ ] 前端注册用户 → 超管端立即看到
- [ ] 前端创建订单 → 超管端立即看到
- [ ] 前端支付成功 → 超管端立即看到
- [ ] 数据一致性检查

---

## 🚀 快速开始

### 1. 启动超管端（已完成）

```bash
# 超管端已通过LocalTunnel启动
# 访问地址：https://pulseopti-hr.loca.lt/admin/login
```

### 2. 部署前端到Vercel

```bash
# 登录Vercel
vercel login

# 部署
vercel

# 配置环境变量（在Vercel控制台）
# 配置自定义域名：www.aizhixuan.com.cn
```

### 3. 测试数据同步

1. 在前端注册一个新用户
2. 在超管端查看用户管理页面
3. 确认新用户立即显示

---

## 🎯 下一步操作

### 立即可用

1. **使用超管端**：
   ```
   https://pulseopti-hr.loca.lt/admin/login
   ```

2. **查看数据**：
   - 仪表盘：查看统计
   - 用户管理：查看用户列表
   - 审计日志：查看操作记录

### 待完成

1. **部署前端到Vercel**（需要你操作）
2. **配置域名 www.aizhixuan.com.cn**（需要你操作）
3. **测试数据同步**（需要你操作）

---

## 📞 常见问题

### Q1: 为什么数据不同步？

**A**: 检查以下几点：
1. 前端和超管端是否使用相同的DATABASE_URL？
2. 数据库连接是否正常？
3. 审计日志是否正确记录？
4. 超管端是否刷新页面？

### Q2: 如何实现真正的实时更新？

**A**: 有两种方案：
1. **定时轮询**（推荐）：每30秒刷新一次
2. **WebSocket/SSE**：真正的实时推送

### Q3: 超管端可以修改用户数据吗？

**A**: 可以，但需要：
1. 实现更新API（PUT/DELETE）
2. 记录修改到审计日志
3. 验证操作权限

### Q4: 如何查看用户的具体操作？

**A**: 查看审计日志：
```
超管端 → 审计日志 → 筛选用户ID
```

---

**最后更新**: 2026-01-19 22:30
**状态**: ✅ 方案设计完成，等待前端部署
