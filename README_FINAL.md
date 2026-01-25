# PulseOpti HR 脉策聚效 - 完整配置指南

## 📌 重要提示

### 超管端环境变量配置问题

**问：用户端环境变量已经增加，需要增加超管端的环境变量么？**

**答：不需要独立的超管端环境变量，当前配置已支持所有超管端功能！**

---

## 🔍 核心说明

### 为什么不需要独立的超管端环境变量？

1. **共享数据库和API**
   - 超管端和用户端使用相同的数据库和API
   - 通过JWT token中的 `role` 和 `isSuperAdmin` 字段来区分权限

2. **权限控制基于数据库字段**
   - 用户表中有 `role` 字段：`'super_admin'`, `'admin'`, `'manager'`, `'employee'`
   - 用户表中有 `isSuperAdmin` 布尔字段

3. **统一的环境变量配置**
   - 当前配置已经支持所有功能
   - 超管端和用户端使用相同的环境变量

---

## ✅ 当前配置状态

### 已配置的用户端环境变量

| 配置项 | 值 | 状态 |
|--------|-----|------|
| DATABASE_URL | postgresql://neondb_owner:npg_vWZaXz1Ai4jp@... | ✅ 已配置 |
| JWT_SECRET | a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1 | ✅ 已配置 |
| NEXT_PUBLIC_APP_URL | http://localhost:3000 | ✅ 已配置 |
| NODE_ENV | development | ✅ 已配置 |
| SMTP_HOST | smtp.qq.com | ✅ 已配置 |
| SMTP_USER | 208343256@qq.com | ✅ 已配置 |
| SMTP_PASSWORD | xxwbcxaojrqwbjia | ✅ 已配置 |
| COZE_API_KEY | a915ab35-9534-43ad-b925-d9102c5007ba | ✅ 已配置 |

### 支持的超管端功能

| 功能 | 状态 | 访问路径 |
|------|------|----------|
| 超级管理员登录 | ✅ 已支持 | /login |
| 子账号管理 | ✅ 已支持 | /admin/sub-accounts |
| 工作流管理 | ✅ 已支持 | /admin/workflows |
| 系统监控 | ✅ 已支持 | /admin/monitor |
| 审计日志 | ✅ 已支持 | /admin/audit |

---

## 🔐 超级管理员账号

```
邮箱：208343256@qq.com
密码：admin123
```

---

## 🚀 快速开始

### 步骤1：创建 .env 文件

```cmd
cd /d C:\PulseOpti-HR\PulseOpti-HR
notepad .env
```

复制 `ENV_FILE_CONTENT.txt` 中的内容到 .env 文件，保存。

---

### 步骤2：安装依赖并初始化数据库

```cmd
pnpm install
pnpm run db:generate
pnpm run db:push
```

---

### 步骤3：启动开发服务器

```cmd
pnpm run dev
```

---

### 步骤4：访问应用

- **首页：** http://localhost:3000
- **超管端：** http://localhost:3000/admin/sub-accounts
- **工作流管理：** http://localhost:3000/admin/workflows

---

## 🎯 三种配置方案

### 方案1：不添加超管端配置（推荐开发环境）✅

**说明：** 只配置用户端必需的环境变量，所有超管端功能使用默认配置。

**适用场景：**
- ✅ 开发环境
- ✅ 快速测试
- ✅ 功能验证

**优点：**
- 配置简单
- 快速启动
- 适合开发测试

**当前状态：** ✅ 您的配置已经支持超管端所有功能

---

### 方案2：添加功能开关（推荐测试环境）

**说明：** 添加功能开关配置，控制超管端功能的开启/关闭。

**适用场景：**
- 测试环境
- 功能降级
- 灰度发布

**需要添加的配置：**

打开 `.env` 文件，在末尾添加：

```env

# 超管端功能开关
ENABLE_SUB_ACCOUNT_MANAGEMENT=true
ENABLE_WORKFLOW_MANAGEMENT=true
ENABLE_AUDIT_LOG=false
ENABLE_SYSTEM_MONITOR=false
```

---

### 方案3：完整配置（推荐生产环境）

**说明：** 添加所有超管端配置，包括功能开关、审计日志、安全策略、通知配置。

**适用场景：**
- 生产环境
- 企业部署
- 安全要求高

**操作步骤：**

1. 打开 `ENV_WITH_SUPER_ADMIN.txt` 文件
2. 复制从 `# 超管端功能开关` 开始的所有内容
3. 粘贴到 `.env` 文件的末尾
4. 保存文件
5. 重启开发服务器

**需要添加的配置：**
- 功能开关（4个）
- 审计日志配置（3个）
- 安全策略配置（9个）
- 子账号配置（4个）
- 超管端通知配置（4个）

**总计：24个配置项**

---

## 📋 配置文件清单

### 用户端配置文件

1. **ENV_FILE_CONTENT.txt** - 用户端 .env 文件内容（可直接复制）
2. **ENV_COMPLETE_CONFIG.md** - 用户端环境变量配置完整说明
3. **CMD_EXECUTION_STEPS.md** - CMD执行命令详细步骤

### 超管端配置文件

4. **SUPER_ADMIN_CONFIG_GUIDE.md** - 超管端环境变量配置详细指南
5. **ADD_SUPER_ADMIN_CONFIG.md** - 快速添加超管端配置
6. **SUPER_ADMIN_CONFIG_SUMMARY.md** - 超管端配置总结（本文档）
7. **ENV_WITH_SUPER_ADMIN.txt** - 包含超管端配置的完整 .env 文件

### 快速参考

8. **QUICK_REFERENCE_CARD.md** - 快速参考卡片
9. **QUICK_START_WINDOWS.md** - Windows快速开始指南
10. **WINDOWS_INSTALL_GUIDE.md** - Windows本地环境配置指南

---

## ✅ 验证清单

### 基础配置验证

- [ ] .env 文件已创建
- [ ] DATABASE_URL 配置正确
- [ ] JWT_SECRET 配置正确
- [ ] 邮件服务配置正确（208343256@qq.com / xxwbcxaojrqwbjia）
- [ ] 豆包API Key配置正确（a915ab35-9534-43ad-b925-d9102c5007ba）

### 功能验证

- [ ] 开发服务器启动成功（pnpm run dev）
- [ ] 可以访问 http://localhost:3000
- [ ] 可以使用超级管理员账号登录（208343256@qq.com / admin123）
- [ ] 可以访问超管端页面（/admin/sub-accounts）
- [ ] 可以创建子账号
- [ ] 可以管理工作流

### 超管端配置验证（可选）

如果添加了超管端配置：

- [ ] 功能开关生效
- [ ] 审计日志正常记录
- [ ] 安全策略生效
- [ ] 超管端通知正常

---

## 🌐 域名配置

### 本地开发环境
```
http://localhost:3000
```

### 生产环境
```
https://www.aizhixuan.com.cn
```

### DNS配置（生产环境）

在域名服务商（阿里云/腾讯云）添加以下DNS记录：

| 类型 | 主机记录 | 记录值 | TTL |
|------|----------|--------|-----|
| CNAME | www | cname.vercel-dns.com | 600 |

### Vercel环境变量（生产环境）

```
NEXT_PUBLIC_APP_URL=https://www.aizhixuan.com.cn
NODE_ENV=production
```

---

## 🚨 常见问题

### Q1：是否需要为超管端增加独立的环境变量？

**A：不需要！** 当前配置已支持所有超管端功能。

---

### Q2：如何访问超管端？

**A：** 登录超级管理员账号后，访问以下路径：

- 子账号管理：`http://localhost:3000/admin/sub-accounts`
- 工作流管理：`http://localhost:3000/admin/workflows`

---

### Q3：如何创建子账号？

**A：**
1. 登录超级管理员账号
2. 访问 `/admin/sub-accounts`
3. 点击"创建子账号"
4. 填写子账号信息
5. 点击"确认创建"

---

### Q4：超管端配置是必需的吗？

**A：**
- **开发和测试环境：** 不必需，当前配置已够用
- **生产环境：** 推荐添加完整配置，增强安全性和管理功能

---

### Q5：如何添加超管端配置？

**A：**
1. 打开 `.env` 文件
2. 在末尾添加超管端配置（参考 `ENV_WITH_SUPER_ADMIN.txt`）
3. 保存文件
4. 重启开发服务器

---

## 📞 联系支持

- **邮箱：** PulseOptiHR@163.com
- **地址：** 广州市天河区

---

## 📚 相关文档

- **ENV_FILE_CONTENT.txt** - 用户端 .env 文件内容
- **ENV_COMPLETE_CONFIG.md** - 用户端环境变量配置详细说明
- **CMD_EXECUTION_STEPS.md** - CMD执行命令详细步骤
- **SUPER_ADMIN_CONFIG_SUMMARY.md** - 超管端配置总结
- **ADD_SUPER_ADMIN_CONFIG.md** - 快速添加超管端配置
- **SUPER_ADMIN_CONFIG_GUIDE.md** - 超管端环境变量配置详细指南
- **ENV_WITH_SUPER_ADMIN.txt** - 包含超管端配置的完整 .env 文件
- **QUICK_REFERENCE_CARD.md** - 快速参考卡片

---

## 🎉 总结

### 核心答案

✅ **不需要独立的超管端环境变量**

✅ **当前配置已支持所有超管端功能**

✅ **可以选择添加超管端特定配置来增强功能**

### 您的选择

1. **不添加配置**（推荐开发环境）→ 当前配置已够用 ✅
2. **添加功能开关**（推荐测试环境）→ 添加4个配置项
3. **添加完整配置**（推荐生产环境）→ 添加24个配置项

### 建议

- **开发和测试阶段：** 不添加配置，使用当前配置即可 ✅
- **生产部署阶段：** 添加完整配置，增强安全性和管理功能

---

**文档创建时间：** 2025-01-11
**文档版本：** v1.0
**当前状态：** ✅ 可以直接使用，无需额外配置
