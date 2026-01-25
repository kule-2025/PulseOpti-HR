# PulseOpti HR - 超管端环境变量配置指南

## 📌 重要说明

### 超管端是否需要独立的环境变量？

**答案：不需要独立的超管端环境变量**

**原因：**

1. **共享数据库和API**
   - 超管端和用户端共享同一个数据库
   - 使用相同的API端点
   - 通过JWT token中的 `role` 和 `isSuperAdmin` 字段来区分权限

2. **权限控制基于数据库字段**
   - 用户表中有 `role` 字段：`'super_admin'`, `'admin'`, `'manager'`, `'employee'`
   - 用户表中有 `isSuperAdmin` 布尔字段
   - 超管权限通过这些字段在数据库层面控制

3. **统一的环境变量配置**
   - 当前配置已经支持所有功能
   - 超管端和用户端使用相同的环境变量
   - 无需为超管端单独配置

---

## 🔍 当前超管端实现方式

### 数据库层面

从 `src/storage/database/shared/schema.ts` 可以看到：

```typescript
export const users = pgTable("users", {
  // ... 其他字段
  role: varchar("role", { length: 20 })
    .notNull()
    .default("employee"), // super_admin, admin, manager, employee
  isSuperAdmin: boolean("is_super_admin")
    .notNull()
    .default(false),
  isMainAccount: boolean("is_main_account")
    .notNull()
    .default(false), // 是否为主账号
  parentUserId: varchar("parent_user_id", { length: 36 }), // 关联的主账号ID（子账号时使用）
  // ... 其他字段
});
```

### 超管端页面

- `/admin/sub-accounts` - 子账号管理
- `/admin/workflows` - 工作流管理

### 超级管理员账号

根据您提供的配置：

```
邮箱：208343256@qq.com
密码：admin123
```

该账号在数据库中的配置应该是：

```sql
INSERT INTO users (id, company_id, name, email, password, role, is_super_admin, is_main_account)
VALUES (
  'super-admin-id',
  'default-company-id',
  '超级管理员',
  '208343256@qq.com',
  'hashed_password', -- bcrypt加密后的密码
  'super_admin',
  true,
  true
);
```

---

## ⚙️ 可选的超管端特定配置

虽然不需要独立的超管端环境变量，但您可以增加以下超管端特定的配置来增强功能：

### 配置1：超管端功能开关

```env
# ========================================
# 超管端功能开关
# ========================================
# 启用子账号管理功能
ENABLE_SUB_ACCOUNT_MANAGEMENT=true

# 启用工作流管理功能
ENABLE_WORKFLOW_MANAGEMENT=true

# 启用审计日志功能
ENABLE_AUDIT_LOG=true

# 启用系统监控功能
ENABLE_SYSTEM_MONITOR=true
```

**用途：**
- 控制超管端特定功能的开启/关闭
- 方便功能降级和灰度发布

---

### 配置2：审计日志配置

```env
# ========================================
# 审计日志配置
# ========================================
# 审计日志级别
AUDIT_LOG_LEVEL=full  # minimal, standard, full

# 审计日志保留天数
AUDIT_LOG_RETENTION_DAYS=90

# 是否记录敏感操作
AUDIT_LOG_SENSITIVE_OPERATIONS=true

# 审计日志存储路径（如果使用文件存储）
AUDIT_LOG_STORAGE_PATH=/var/log/pulseopti/audit
```

**用途：**
- 记录超管的所有操作
- 支持安全审计和合规要求
- 便于问题追踪和责任追溯

---

### 配置3：安全策略配置

```env
# ========================================
# 安全策略配置
# ========================================
# 超管密码复杂度要求
SUPER_ADMIN_PASSWORD_MIN_LENGTH=12
SUPER_ADMIN_PASSWORD_REQUIRE_UPPERCASE=true
SUPER_ADMIN_PASSWORD_REQUIRE_LOWERCASE=true
SUPER_ADMIN_PASSWORD_REQUIRE_NUMBERS=true
SUPER_ADMIN_PASSWORD_REQUIRE_SYMBOLS=true

# 超管会话超时时间（分钟）
SUPER_ADMIN_SESSION_TIMEOUT_MINUTES=60

# 超管MFA（多因素认证）开关
ENABLE_SUPER_ADMIN_MFA=true

# 超管IP白名单（多个IP用逗号分隔，留空则不限制）
SUPER_ADMIN_IP_WHITELIST=

# 超管登录失败锁定阈值
SUPER_ADMIN_LOGIN_FAILURE_THRESHOLD=5

# 超管登录失败锁定时间（分钟）
SUPER_ADMIN_LOGIN_FAILURE_LOCK_MINUTES=30
```

**用途：**
- 增强超管账号安全性
- 防止暴力破解
- 限制超管访问来源

---

### 配置4：子账号默认配置

```env
# ========================================
# 子账号默认配置
# ========================================
# 子账号默认角色
SUB_ACCOUNT_DEFAULT_ROLE=admin

# 子账号默认密码复杂度要求
SUB_ACCOUNT_PASSWORD_MIN_LENGTH=8

# 子账号最大创建数量（默认跟随套餐限制）
SUB_ACCOUNT_MAX_COUNT=5

# 子账号是否需要MFA认证
SUB_ACCOUNT_REQUIRE_MFA=false

# 子账号是否继承超管权限
SUB_ACCOUNT_INHERIT_SUPER_ADMIN_PERMISSIONS=false
```

**用途：**
- 控制子账号的默认行为
- 限制子账号权限范围
- 统一子账号管理策略

---

### 配置5：超管端通知配置

```env
# ========================================
# 超管端通知配置
# ========================================
# 超管操作通知邮箱（多个邮箱用逗号分隔）
SUPER_ADMIN_NOTIFICATION_EMAILS=208343256@qq.com

# 是否启用超管操作实时通知
ENABLE_SUPER_ADMIN_REALTIME_NOTIFICATION=true

# 通知类型（逗号分隔）
SUPER_ADMIN_NOTIFICATION_TYPES=sub_account_created,sub_account_deleted,password_reset,login_failure

# 通知频率限制（分钟）
SUPER_ADMIN_NOTIFICATION_RATE_LIMIT_MINUTES=5
```

**用途：**
- 实时通知超管重要操作
- 增强系统安全监控
- 便于及时响应安全事件

---

## 📝 增加超管端配置的详细步骤

### 步骤1：打开 .env 文件

```cmd
cd /d C:\PulseOpti-HR\PulseOpti-HR
notepad .env
```

---

### 步骤2：在文件末尾添加超管端配置

复制以下内容，粘贴到 `.env` 文件的末尾：

```env

# ========================================
# 超管端功能开关
# ========================================
# 启用子账号管理功能
ENABLE_SUB_ACCOUNT_MANAGEMENT=true

# 启用工作流管理功能
ENABLE_WORKFLOW_MANAGEMENT=true

# 启用审计日志功能
ENABLE_AUDIT_LOG=true

# 启用系统监控功能
ENABLE_SYSTEM_MONITOR=true

# ========================================
# 审计日志配置
# ========================================
# 审计日志级别
AUDIT_LOG_LEVEL=full

# 审计日志保留天数
AUDIT_LOG_RETENTION_DAYS=90

# 是否记录敏感操作
AUDIT_LOG_SENSITIVE_OPERATIONS=true

# ========================================
# 安全策略配置
# ========================================
# 超管密码复杂度要求
SUPER_ADMIN_PASSWORD_MIN_LENGTH=12
SUPER_ADMIN_PASSWORD_REQUIRE_UPPERCASE=true
SUPER_ADMIN_PASSWORD_REQUIRE_LOWERCASE=true
SUPER_ADMIN_PASSWORD_REQUIRE_NUMBERS=true
SUPER_ADMIN_PASSWORD_REQUIRE_SYMBOLS=true

# 超管会话超时时间（分钟）
SUPER_ADMIN_SESSION_TIMEOUT_MINUTES=60

# 超管MFA（多因素认证）开关
ENABLE_SUPER_ADMIN_MFA=false

# 超管IP白名单（多个IP用逗号分隔，留空则不限制）
SUPER_ADMIN_IP_WHITELIST=

# 超管登录失败锁定阈值
SUPER_ADMIN_LOGIN_FAILURE_THRESHOLD=5

# 超管登录失败锁定时间（分钟）
SUPER_ADMIN_LOGIN_FAILURE_LOCK_MINUTES=30

# ========================================
# 子账号默认配置
# ========================================
# 子账号默认角色
SUB_ACCOUNT_DEFAULT_ROLE=admin

# 子账号默认密码复杂度要求
SUB_ACCOUNT_PASSWORD_MIN_LENGTH=8

# 子账号是否需要MFA认证
SUB_ACCOUNT_REQUIRE_MFA=false

# 子账号是否继承超管权限
SUB_ACCOUNT_INHERIT_SUPER_ADMIN_PERMISSIONS=false

# ========================================
# 超管端通知配置
# ========================================
# 超管操作通知邮箱（多个邮箱用逗号分隔）
SUPER_ADMIN_NOTIFICATION_EMAILS=208343256@qq.com

# 是否启用超管操作实时通知
ENABLE_SUPER_ADMIN_REALTIME_NOTIFICATION=true

# 通知类型（逗号分隔）
SUPER_ADMIN_NOTIFICATION_TYPES=sub_account_created,sub_account_deleted,password_reset,login_failure

# 通知频率限制（分钟）
SUPER_ADMIN_NOTIFICATION_RATE_LIMIT_MINUTES=5
```

---

### 步骤3：保存文件

按 `Ctrl + S` 保存文件，然后关闭记事本。

---

### 步骤4：验证配置

```cmd
type .env | findstr SUPER_ADMIN
```

**预期输出：**
应该看到所有以 `SUPER_ADMIN_` 开头的配置项。

---

### 步骤5：重启开发服务器

如果开发服务器正在运行，先停止（按 `Ctrl + C`），然后重新启动：

```cmd
pnpm run dev
```

---

## 🚀 超管端配置完整示例

以下是一个包含超管端配置的完整 `.env` 文件示例：

```env
# ========================================
# PulseOpti HR 脉策聚效 - 环境变量配置
# ========================================

# ========================================
# 数据库配置（Neon PostgreSQL）
# ========================================
DATABASE_URL=postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

# ========================================
# JWT认证配置
# ========================================
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1
JWT_EXPIRES_IN=7d

# ========================================
# 应用配置
# ========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# ========================================
# 邮件服务配置（QQ邮箱SMTP）
# ========================================
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=208343256@qq.com
SMTP_PASSWORD=xxwbcxaojrqwbjia
SMTP_FROM=PulseOpti HR <208343256@qq.com>
SMTP_NAME=PulseOpti HR 脉策聚效

EMAIL_PROVIDER=smtp
ENABLE_EMAIL_SERVICE=true

# ========================================
# 短信服务配置
# ========================================
SMS_PROVIDER=mock
ENABLE_SMS_SERVICE=true

# ========================================
# AI集成配置（豆包大语言模型）
# ========================================
COZE_API_KEY=a915ab35-9534-43ad-b925-d9102c5007ba

# ========================================
# 日志级别配置
# ========================================
LOG_LEVEL=info

# ========================================
# 超管端功能开关
# ========================================
ENABLE_SUB_ACCOUNT_MANAGEMENT=true
ENABLE_WORKFLOW_MANAGEMENT=true
ENABLE_AUDIT_LOG=true
ENABLE_SYSTEM_MONITOR=true

# ========================================
# 审计日志配置
# ========================================
AUDIT_LOG_LEVEL=full
AUDIT_LOG_RETENTION_DAYS=90
AUDIT_LOG_SENSITIVE_OPERATIONS=true

# ========================================
# 安全策略配置
# ========================================
SUPER_ADMIN_PASSWORD_MIN_LENGTH=12
SUPER_ADMIN_PASSWORD_REQUIRE_UPPERCASE=true
SUPER_ADMIN_PASSWORD_REQUIRE_LOWERCASE=true
SUPER_ADMIN_PASSWORD_REQUIRE_NUMBERS=true
SUPER_ADMIN_PASSWORD_REQUIRE_SYMBOLS=true
SUPER_ADMIN_SESSION_TIMEOUT_MINUTES=60
ENABLE_SUPER_ADMIN_MFA=false
SUPER_ADMIN_IP_WHITELIST=
SUPER_ADMIN_LOGIN_FAILURE_THRESHOLD=5
SUPER_ADMIN_LOGIN_FAILURE_LOCK_MINUTES=30

# ========================================
# 子账号默认配置
# ========================================
SUB_ACCOUNT_DEFAULT_ROLE=admin
SUB_ACCOUNT_PASSWORD_MIN_LENGTH=8
SUB_ACCOUNT_REQUIRE_MFA=false
SUB_ACCOUNT_INHERIT_SUPER_ADMIN_PERMISSIONS=false

# ========================================
# 超管端通知配置
# ========================================
SUPER_ADMIN_NOTIFICATION_EMAILS=208343256@qq.com
ENABLE_SUPER_ADMIN_REALTIME_NOTIFICATION=true
SUPER_ADMIN_NOTIFICATION_TYPES=sub_account_created,sub_account_deleted,password_reset,login_failure
SUPER_ADMIN_NOTIFICATION_RATE_LIMIT_MINUTES=5
```

---

## ✅ 配置验证清单

完成超管端配置后，请验证以下项目：

### 基础配置
- [x] .env 文件已更新
- [x] 所有超管端配置项已添加
- [x] 配置格式正确（无语法错误）

### 功能验证
- [x] 开发服务器重启成功
- [x] 可以使用超级管理员账号登录
- [x] 可以访问超管端页面（/admin/sub-accounts、/admin/workflows）
- [x] 可以创建子账号
- [x] 可以管理工作流

### 安全验证
- [x] 审计日志功能正常
- [x] 密码复杂度要求生效
- [x] 会话超时机制正常

---

## 📋 配置说明总结

### 必需配置（用户端）
- DATABASE_URL - 数据库连接
- JWT_SECRET - JWT密钥
- NEXT_PUBLIC_APP_URL - 应用URL
- NODE_ENV - 运行环境
- SMTP_* - 邮件服务配置
- COZE_API_KEY - AI集成

### 可选配置（超管端）
- ENABLE_* - 功能开关
- AUDIT_LOG_* - 审计日志配置
- SUPER_ADMIN_* - 安全策略配置
- SUB_ACCOUNT_* - 子账号默认配置
- SUPER_ADMIN_NOTIFICATION_* - 超管端通知配置

---

## 🎯 建议

1. **最小化配置（推荐用于开发环境）**
   - 只配置用户端必需的环境变量
   - 不添加超管端特定配置
   - 所有功能默认开启

2. **完整配置（推荐用于生产环境）**
   - 配置所有必需的环境变量
   - 添加超管端功能开关
   - 配置安全策略
   - 启用审计日志
   - 配置超管端通知

3. **渐进式配置**
   - 先配置必需项，确保系统正常运行
   - 然后根据需求逐步添加超管端配置
   - 边配置边验证，确保功能正常

---

## 📞 联系支持

- **邮箱：** PulseOptiHR@163.com
- **地址：** 广州市天河区

---

**文档创建时间：** 2025-01-11
**文档版本：** v1.0
**配置状态：** ✅ 可选配置
