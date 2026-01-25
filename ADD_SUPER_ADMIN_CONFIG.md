# PulseOpti HR - 快速添加超管端配置

## 📌 核心问题

**问：是否需要为超管端增加环境变量？**
**答：不需要独立的超管端环境变量，但可以增加超管端特定的配置**

---

## 🔍 为什么不需要独立的环境变量？

1. **共享数据库和API** - 超管端和用户端使用相同的数据库和API
2. **权限基于数据库字段** - 通过 `role` 和 `isSuperAdmin` 字段区分权限
3. **统一配置管理** - 当前配置已支持所有功能

---

## ⚙️ 可选的超管端配置

### 快速添加（推荐）

**1. 功能开关（4个）**
```env
ENABLE_SUB_ACCOUNT_MANAGEMENT=true
ENABLE_WORKFLOW_MANAGEMENT=true
ENABLE_AUDIT_LOG=true
ENABLE_SYSTEM_MONITOR=true
```

**2. 审计日志配置（3个）**
```env
AUDIT_LOG_LEVEL=full
AUDIT_LOG_RETENTION_DAYS=90
AUDIT_LOG_SENSITIVE_OPERATIONS=true
```

**3. 安全策略配置（9个）**
```env
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
```

**4. 子账号配置（4个）**
```env
SUB_ACCOUNT_DEFAULT_ROLE=admin
SUB_ACCOUNT_PASSWORD_MIN_LENGTH=8
SUB_ACCOUNT_REQUIRE_MFA=false
SUB_ACCOUNT_INHERIT_SUPER_ADMIN_PERMISSIONS=false
```

**5. 超管端通知配置（4个）**
```env
SUPER_ADMIN_NOTIFICATION_EMAILS=208343256@qq.com
ENABLE_SUPER_ADMIN_REALTIME_NOTIFICATION=true
SUPER_ADMIN_NOTIFICATION_TYPES=sub_account_created,sub_account_deleted,password_reset,login_failure
SUPER_ADMIN_NOTIFICATION_RATE_LIMIT_MINUTES=5
```

---

## 🚀 详细添加步骤

### 步骤1：打开 .env 文件

```cmd
cd /d C:\PulseOpti-HR\PulseOpti-HR
notepad .env
```

---

### 步骤2：在文件末尾添加配置

**方法1：手动复制（推荐）**

将以下内容复制到 `.env` 文件的末尾：

```env

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

**方法2：使用命令行追加**

```cmd
cd /d C:\PulseOpti-HR\PulseOpti-HR

(
echo.
echo # ========================================
echo # 超管端功能开关
echo # ========================================
echo ENABLE_SUB_ACCOUNT_MANAGEMENT=true
echo ENABLE_WORKFLOW_MANAGEMENT=true
echo ENABLE_AUDIT_LOG=true
echo ENABLE_SYSTEM_MONITOR=true
echo.
echo # ========================================
echo # 审计日志配置
echo # ========================================
echo AUDIT_LOG_LEVEL=full
echo AUDIT_LOG_RETENTION_DAYS=90
echo AUDIT_LOG_SENSITIVE_OPERATIONS=true
echo.
echo # ========================================
echo # 安全策略配置
echo # ========================================
echo SUPER_ADMIN_PASSWORD_MIN_LENGTH=12
echo SUPER_ADMIN_PASSWORD_REQUIRE_UPPERCASE=true
echo SUPER_ADMIN_PASSWORD_REQUIRE_LOWERCASE=true
echo SUPER_ADMIN_PASSWORD_REQUIRE_NUMBERS=true
echo SUPER_ADMIN_PASSWORD_REQUIRE_SYMBOLS=true
echo SUPER_ADMIN_SESSION_TIMEOUT_MINUTES=60
echo ENABLE_SUPER_ADMIN_MFA=false
echo SUPER_ADMIN_IP_WHITELIST=
echo SUPER_ADMIN_LOGIN_FAILURE_THRESHOLD=5
echo SUPER_ADMIN_LOGIN_FAILURE_LOCK_MINUTES=30
echo.
echo # ========================================
echo # 子账号默认配置
echo # ========================================
echo SUB_ACCOUNT_DEFAULT_ROLE=admin
echo SUB_ACCOUNT_PASSWORD_MIN_LENGTH=8
echo SUB_ACCOUNT_REQUIRE_MFA=false
echo SUB_ACCOUNT_INHERIT_SUPER_ADMIN_PERMISSIONS=false
echo.
echo # ========================================
echo # 超管端通知配置
echo # ========================================
echo SUPER_ADMIN_NOTIFICATION_EMAILS=208343256@qq.com
echo ENABLE_SUPER_ADMIN_REALTIME_NOTIFICATION=true
echo SUPER_ADMIN_NOTIFICATION_TYPES=sub_account_created,sub_account_deleted,password_reset,login_failure
echo SUPER_ADMIN_NOTIFICATION_RATE_LIMIT_MINUTES=5
) >> .env
```

---

### 步骤3：验证配置

```cmd
type .env | findstr SUPER_ADMIN
```

**预期输出：**
应该看到所有以 `SUPER_ADMIN_` 开头的配置项。

---

### 步骤4：重启开发服务器

如果开发服务器正在运行，先停止（按 `Ctrl + C`），然后重新启动：

```cmd
pnpm run dev
```

---

## ✅ 验证超管端功能

### 1. 登录超级管理员账号

访问：http://localhost:3000

登录信息：
- 邮箱：208343256@qq.com
- 密码：admin123

### 2. 访问超管端页面

**子账号管理：**
```
http://localhost:3000/admin/sub-accounts
```

**工作流管理：**
```
http://localhost:3000/admin/workflows
```

### 3. 验证功能

- [ ] 可以查看子账号列表
- [ ] 可以创建新子账号
- [ ] 可以重置子账号密码
- [ ] 可以删除子账号
- [ ] 可以查看工作流模板
- [ ] 可以管理工作流实例

---

## 📋 配置说明

### 最小配置（开发环境）

如果只是开发测试，可以只添加以下配置：

```env
# 超管端功能开关
ENABLE_SUB_ACCOUNT_MANAGEMENT=true
ENABLE_WORKFLOW_MANAGEMENT=true
ENABLE_AUDIT_LOG=false
ENABLE_SYSTEM_MONITOR=false
```

### 完整配置（生产环境）

生产环境建议添加所有配置，增强安全性和管理功能。

---

## 🎯 三种配置方案

### 方案1：不添加超管端配置（推荐开发环境）

**说明：** 只配置用户端必需的环境变量，所有超管端功能使用默认配置。

**优点：**
- 配置简单
- 快速启动
- 适合开发测试

**缺点：**
- 缺少安全策略
- 无审计日志
- 无超管端通知

---

### 方案2：添加功能开关（推荐测试环境）

**说明：** 添加功能开关配置，控制超管端功能的开启/关闭。

**优点：**
- 可以灵活控制功能
- 便于功能降级
- 适合测试环境

**缺点：**
- 缺少安全策略
- 无审计日志

---

### 方案3：完整配置（推荐生产环境）

**说明：** 添加所有超管端配置，包括功能开关、审计日志、安全策略、通知配置。

**优点：**
- 完整的安全策略
- 审计日志支持
- 实时通知功能
- 适合生产环境

**缺点：**
- 配置较复杂
- 需要更多验证

---

## 📊 配置对比表

| 配置项 | 方案1（不添加） | 方案2（功能开关） | 方案3（完整配置） |
|--------|----------------|------------------|------------------|
| 功能开关 | ❌ | ✅ | ✅ |
| 审计日志 | ❌ | ❌ | ✅ |
| 安全策略 | ❌ | ❌ | ✅ |
| 子账号配置 | ❌ | ❌ | ✅ |
| 超管端通知 | ❌ | ❌ | ✅ |
| 适用环境 | 开发环境 | 测试环境 | 生产环境 |

---

## 🚨 常见问题

### 问题1：添加配置后启动失败

**原因：** 配置格式错误

**解决方案：**

```cmd
# 检查配置格式
type .env

# 查找错误
type .env | findstr "="
```

确保每个配置项格式为：`KEY=value`

---

### 问题2：超管端功能不生效

**原因：** 开发服务器未重启

**解决方案：**

```cmd
# 停止开发服务器（按 Ctrl + C）
# 重新启动
pnpm run dev
```

---

### 问题3：审计日志未记录

**原因：** `ENABLE_AUDIT_LOG=false`

**解决方案：**

```cmd
notepad .env
```

修改为：`ENABLE_AUDIT_LOG=true`

保存后重启开发服务器。

---

## 📞 联系支持

- **邮箱：** PulseOptiHR@163.com
- **地址：** 广州市天河区

---

**文档创建时间：** 2025-01-11
**文档版本：** v1.0
