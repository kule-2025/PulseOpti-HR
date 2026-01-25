# PulseOpti HR - 超管端使用指南

## 📋 概述

PulseOpti HR 脉策聚效 系统包含两个独立的端：
- **用户前端**：http://localhost:3000/ - 面向普通员工和HR使用者
- **超管端**：http://localhost:3000/admin - 面向超级管理员，用于系统管理

## 🔐 超管端访问方式

### 方式一：通过首页入口（推荐）

1. 访问 http://localhost:3000/
2. 点击顶部导航栏的 **"超管后台"** 链接（带有皇冠图标👑）
3. 自动跳转到超管端登录页面

### 方式二：直接访问超管端

直接在浏览器中访问：
- 超管端首页：http://localhost:3000/admin
- 超管端登录：http://localhost:3000/admin/login

## 🔑 超级管理员账号

### 默认管理员信息

如果已运行 `npx tsx init-admin.ts` 初始化脚本，可使用以下账号登录：

| 项目 | 值 |
|------|-----|
| **账号** | admin@aizhixuan.com.cn |
| **密码** | Admin@123 |
| **权限** | 超级管理员 |
| **登录地址** | http://localhost:3000/admin/login |

### 注意事项

- 只有拥有 `isSuperAdmin: true` 的账号才能登录超管端
- 普通管理员账号（role: admin 但 isSuperAdmin: false）无法访问超管端
- 如果忘记管理员密码，需要通过数据库重置

## 🎯 超管端功能模块

### 1. 概览（仪表盘）

**路径**：`/admin/dashboard`

显示系统运行状态和关键数据：
- 总用户数
- 企业总数
- 活跃订阅数
- 活跃工作流数
- 本月收入

### 2. 用户管理

**路径**：`/admin/users`

管理所有用户账号：
- 查看用户列表
- 添加/编辑/删除用户
- 重置用户密码
- 管理用户权限

### 3. 企业管理

**路径**：`/admin/companies`

管理所有企业客户：
- 查看企业列表
- 添加/编辑/删除企业
- 管理企业订阅状态
- 查看企业员工信息

### 4. 子账号管理

**路径**：`/admin/sub-accounts`

管理子管理员账号：
- 查看子账号列表
- 创建子账号
- 重置子账号密码
- 管理子账号配额

### 5. 订阅管理

**路径**：`/admin/subscriptions`

管理企业订阅：
- 查看所有订阅
- 管理订阅状态
- 查看订单记录
- 处理续费请求

### 6. 工作流管理

**路径**：`/admin/workflows`

监控工作流运行：
- 查看所有工作流实例
- 监控工作流状态
- 查看工作流历史
- 管理工作流模板

### 7. 报表中心

**路径**：`/admin/reports`

查看系统报表：
- 用户增长报表
- 收入统计报表
- 企业活跃度报表
- 工作流效率报表

### 8. 系统设置

**路径**：`/admin/settings`

系统配置管理：
- 系统参数配置
- 权限配置
- 日志查看
- 系统维护

## 🔐 权限验证机制

### 登录验证流程

1. 用户在超管端登录页面输入账号密码
2. 系统调用 `/api/auth/login` 验证账号
3. 检查用户是否拥有超级管理员权限（`isSuperAdmin: true`）
4. 如果验证成功，跳转到 `/admin/dashboard`
5. 如果验证失败，显示错误信息

### Token 验证

所有超管端 API 端点都会验证 JWT token：
```typescript
const token = request.headers.get('authorization')?.replace('Bearer ', '');
const decoded = verifyToken(token);
if (!decoded || !decoded.isSuperAdmin) {
  return NextResponse.json({ error: '无权访问' }, { status: 403 });
}
```

## 📝 创建新的超级管理员

### 方法一：使用初始化脚本

```bash
cd C:\PulseOpti-HR\PulseOpti-HR
npx tsx init-admin.ts
```

### 方法二：通过数据库直接创建

1. 使用 Drizzle Studio：
   ```bash
   pnpm run db:studio
   ```
2. 访问 https://local.drizzle.studio
3. 找到 `users` 表
4. 添加新用户记录，设置 `is_super_admin` 为 `true`

### 方法三：通过 API 创建（需要现有超管账号）

使用 `/api/admin/sub-accounts` 接口创建子账号，然后手动设置为超级管理员。

## 🚨 常见问题

### Q1: 登录超管端时提示"该账号不是超级管理员"

**原因**：账号的 `isSuperAdmin` 字段为 `false`

**解决**：
1. 使用 Drizzle Studio 打开 `users` 表
2. 找到该用户记录
3. 将 `is_super_admin` 字段设置为 `true`
4. 保存后重新登录

### Q2: 忘记超级管理员密码

**解决**：
1. 使用 Drizzle Studio 打开 `users` 表
2. 找到超级管理员记录
3. 将 `password` 字段设置为以下加密值：
   ```
   $2a$10$rKZyYqM3lM7wZ7jY8zK8EeQzG6l7wZ7jY8zK8EeQzG6l7wZ7jY8zK
   ```
4. 使用密码 `Admin@123` 登录

### Q3: 超管端页面显示 404

**原因**：未创建对应的路由页面

**解决**：
1. 确认文件存在于 `src/app/admin/[page]/page.tsx`
2. 重启开发服务器：`pnpm run dev`

### Q4: API 返回 403 错误

**原因**：
1. Token 无效或已过期
2. 用户不是超级管理员

**解决**：
1. 退出登录重新登录
2. 检查用户权限设置

## 🔗 快速链接

| 页面 | URL |
|------|-----|
| 用户端首页 | http://localhost:3000/ |
| 用户端登录 | http://localhost:3000/login |
| 超管端首页 | http://localhost:3000/admin |
| 超管端登录 | http://localhost:3000/admin/login |
| 超管端仪表盘 | http://localhost:3000/admin/dashboard |

## 📞 技术支持

如有问题，请联系：
- 邮箱：PulseOptiHR@163.com
- 地址：广州市天河区

---

**最后更新**：2025-01-19
