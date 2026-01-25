# 登录问题已解决 ✅

## 问题描述
用户反映无法登录系统，浏览器显示"都登录不了"。

## 根本原因
数据库中不存在超级管理员账号，导致登录验证失败。

---

## 🔧 解决方案

### 1. 修复数据库连接超时

**问题**: 数据库连接超时设置过短（2秒），导致Neon连接失败。

**修复**: 将连接超时从2000ms增加到10000ms

```typescript
// src/lib/db/index.ts
poolInstance = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
  max: 20,
  min: 2,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000, // 从2000ms增加到10000ms
});
```

### 2. 创建超级管理员账号

**执行脚本**: `npx tsx --env-file=.env create-admin.ts`

**创建内容**:
- ✅ 默认公司：PulseOpti HR 示例公司
- ✅ 默认部门：总经办
- ✅ 默认职位：总经理
- ✅ 超级管理员账号

### 3. 验证登录功能

**测试API**:
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"account":"208343256@qq.com","password":"admin123"}' \
  http://localhost:5000/api/auth/login
```

**返回结果**:
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": "eb343606-4520-4bde-bb05-763843e46f38",
      "name": "系统超级管理员",
      "email": "208343256@qq.com",
      "phone": "13800138000",
      "avatarUrl": null,
      "role": "admin",
      "isSuperAdmin": true
    },
    "companyId": "5f4d50d5-c1ad-441f-b973-95beff3dfa51",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "subscription": {
      "isValid": false,
      "tier": "free",
      "maxEmployees": 30,
      "expiresAt": null
    }
  }
}
```

---

## ✅ 当前登录信息

### 超级管理员账号

```
邮箱: 208343256@qq.com
密码: admin123
角色: admin (超级管理员)
```

### 登录地址

**推荐使用**:
- http://127.0.0.1:5000/admin/login ⭐
- http://9.128.251.174:5000/admin/login

**备用地址**:
- http://localhost:5000/admin/login

---

## 🔍 问题排查步骤

### 1. 检查数据库连接
```bash
# 测试数据库连接
curl -X POST -H "Content-Type: application/json" \
  -d '{"account":"208343256@qq.com","password":"admin123"}' \
  http://localhost:5000/api/auth/login
```

### 2. 检查服务状态
```bash
# 检查5000端口
ss -lptn 'sport = :5000'

# 检查HTTP响应
curl -I http://localhost:5000
```

### 3. 查看服务日志
```bash
# 查看Next.js日志（如果服务在后台运行）
# 检查控制台输出
```

---

## 📝 创建的文件

### create-admin.ts
超级管理员初始化脚本，用于创建默认的公司、部门、职位和超级管理员账号。

**使用方法**:
```bash
npx tsx --env-file=.env create-admin.ts
```

**功能**:
- 检查管理员是否已存在
- 创建默认公司
- 创建默认部门
- 创建默认职位
- 创建超级管理员账号（密码加密）
- 输出登录信息

---

## 🎯 登录流程

### 前端流程
1. 用户输入邮箱和密码
2. 前端调用 `/api/auth/login`
3. 传递 `account` 和 `password`
4. 接收JWT token和用户信息
5. 保存到 localStorage
6. 检查 `isSuperAdmin` 字段
7. 跳转到 `/admin/dashboard`

### 后端流程
1. 接收登录请求
2. 通过 `getUserByAnyAccount()` 查找用户（支持邮箱、手机号、用户名）
3. 使用 `bcryptjs` 验证密码
4. 检查用户状态（`isActive`）
5. 生成JWT token
6. 记录审计日志
7. 返回用户信息和token

---

## 🚀 后续操作

### 如果需要重置密码

**创建重置密码脚本**:
```typescript
import { getDb } from './src/lib/db/index.js';
import { users } from './src/storage/database/shared/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function resetPassword() {
  const db = await getDb();
  const hashedPassword = await bcrypt.hash('newpassword', 10);

  await db.update(users)
    .set({ password: hashedPassword })
    .where(eq(users.email, '208343256@qq.com'));

  console.log('密码已重置');
}

resetPassword();
```

### 如果需要创建新的超级管理员

修改 `create-admin.ts` 中的邮箱和密码，然后重新运行。

---

## ⚠️ 注意事项

1. **数据库连接超时**: Neon PostgreSQL需要较长的连接超时时间（建议10秒以上）
2. **SSL连接**: Neon必须使用SSL连接
3. **密码加密**: 使用bcryptjs加密，rounds=10
4. **JWT密钥**: 确保JWT_SECRET环境变量已配置
5. **超级管理员标识**: `isSuperAdmin` 字段必须为 `true`

---

## 📊 系统状态

- ✅ 数据库连接正常
- ✅ 超级管理员账号已创建
- ✅ 登录API正常工作
- ✅ JWT token生成正常
- ✅ 前端登录页面正常
- ✅ 开发服务器运行在5000端口

---

**最后更新**: 2026-01-19 21:45
**状态**: ✅ 登录功能已修复，可以正常使用
