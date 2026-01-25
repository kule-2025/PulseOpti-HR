# 外网环境数据库初始化指南

## 概述

在生产环境（外网）中部署 PulseOpti HR 系统后，需要初始化数据库表结构和种子数据。本指南将帮助您完成初始化操作。

## 初始化方式

系统提供了三种初始化方式：

### 方式1：一键初始化（推荐）

使用一键初始化 API 可以一次性完成所有初始化步骤。

```bash
curl -X POST https://www.aizhixuan.com.cn/api/init \
  -H "Content-Type: application/json" \
  -H "x-admin-key: pulseopti-init-2025" \
  -d '{"force": false}'
```

### 方式2：分步初始化

如果需要更细粒度的控制，可以分步执行：

#### 步骤1：初始化数据库表结构

```bash
curl -X POST https://www.aizhixuan.com.cn/api/init/database \
  -H "Content-Type: application/json" \
  -H "x-admin-key: pulseopti-init-2025" \
  -d '{"force": false}'
```

#### 步骤2：初始化种子数据

```bash
curl -X POST https://www.aizhixuan.com.cn/api/init/seed \
  -H "Content-Type: application/json" \
  -H "x-admin-key: pulseopti-init-2025" \
  -d '{"force": false}'
```

### 方式3：通过管理界面

访问以下页面进行初始化（需要管理员权限）：

- 超管端：https://admin.aizhixuan.com.cn/admin/init
- 用户端：https://www.aizhixuan.com.cn/admin/init

## 认证密钥

所有初始化 API 都需要提供 `x-admin-key` 请求头进行身份验证。

**默认密钥：** `pulseopti-init-2025`

**注意：** 为了安全起见，建议在生产环境中修改此密钥。

### 修改初始化密钥

在环境变量文件中设置 `ADMIN_INIT_KEY`：

```bash
# .env.production 或 Vercel 环境变量
ADMIN_INIT_KEY=your-custom-secret-key
```

## 初始化状态检查

### 检查完整初始化状态

```bash
curl -X GET https://www.aizhixuan.com.cn/api/init \
  -H "x-admin-key: pulseopti-init-2025"
```

### 检查数据库表结构状态

```bash
curl -X GET https://www.aizhixuan.com.cn/api/init/database \
  -H "x-admin-key: pulseopti-init-2025"
```

### 检查种子数据状态

```bash
curl -X GET https://www.aizhixuan.com.cn/api/init/seed \
  -H "x-admin-key: pulseopti-init-2025"
```

## 超级管理员账号信息

初始化完成后，可以使用以下超级管理员账号登录系统：

| 字段 | 值 |
|------|-----|
| **邮箱** | 208343256@qq.com |
| **密码** | admin123 |
| **用户名** | 超级管理员 |
| **角色** | 超级管理员 (Super Admin) |
| **公司ID** | a68a530a-be89-4d38-9c1a-b1961d1e6ffe |

### 修改超级管理员密码

登录系统后，建议立即修改超级管理员密码：

1. 访问 https://admin.aizhixuan.com.cn/admin/profile
2. 找到"修改密码"选项
3. 输入新密码并确认

## 强制重新初始化

如果需要重新初始化数据库（⚠️ 警告：会删除现有数据），可以使用 `force` 参数：

```bash
curl -X POST https://www.aizhixuan.com.cn/api/init \
  -H "Content-Type: application/json" \
  -H "x-admin-key: pulseopti-init-2025" \
  -d '{"force": true}'
```

**⚠️ 重要警告：** 使用 `force: true` 会：
- 删除所有现有的数据库表
- 重新创建表结构
- 重新创建种子数据
- 所有用户数据将会丢失！

仅在以下情况使用：
- 首次部署到新环境
- 数据库损坏需要重建
- 清空测试环境数据

## 响应示例

### 成功响应

```json
{
  "success": true,
  "message": "初始化成功",
  "data": {
    "steps": [
      {
        "step": 1,
        "name": "数据库表结构",
        "status": "success",
        "data": {
          "tables": [...],
          "count": 58,
          "initialized": true
        }
      },
      {
        "step": 2,
        "name": "种子数据",
        "status": "success",
        "data": {
          "results": [...]
        }
      },
      {
        "step": 3,
        "name": "超级管理员登录验证",
        "status": "success",
        "data": {
          "email": "208343256@qq.com",
          "name": "超级管理员",
          "isSuperAdmin": true
        }
      }
    ],
    "summary": {
      "total": 3,
      "success": 3,
      "failed": 0
    }
  },
  "adminInfo": {
    "email": "208343256@qq.com",
    "password": "admin123",
    "hint": "请妥善保管此信息，并在初始化后立即修改密码"
  }
}
```

### 错误响应

```json
{
  "success": false,
  "error": "未授权的请求",
  "hint": "请提供正确的 x-admin-key 请求头"
}
```

## 常见问题

### 1. 初始化失败 - 数据库连接错误

**错误信息：** `Failed to connect to database`

**解决方案：**
- 检查 `DATABASE_URL` 环境变量是否正确配置
- 确认数据库服务可访问
- 检查数据库用户权限

### 2. 初始化失败 - 认证失败

**错误信息：** `未授权的请求`

**解决方案：**
- 确认 `x-admin-key` 请求头已正确设置
- 检查密钥是否与 `ADMIN_INIT_KEY` 环境变量匹配

### 3. 初始化后无法登录

**解决方案：**
1. 检查初始化是否成功完成
2. 确认超级管理员账号是否存在
3. 检查用户表是否正确创建
4. 尝试使用数据库检查脚本验证账号

### 4. 表已存在错误

**错误信息：** `Table already exists`

**解决方案：**
- 首次初始化时不使用 `force` 参数
- 如果需要重新初始化，使用 `force: true` 参数
- 或手动删除现有表后重新初始化

## 安全建议

1. **修改初始化密钥**
   - 在生产环境中使用强密码作为 `ADMIN_INIT_KEY`
   - 定期更换密钥

2. **修改超级管理员密码**
   - 初始化完成后立即修改默认密码
   - 使用强密码（至少 12 位，包含大小写字母、数字和特殊字符）

3. **限制初始化 API 访问**
   - 仅在初始化时调用初始化 API
   - 初始化完成后，可以考虑删除或禁用初始化路由

4. **环境变量保护**
   - 不要将 `.env` 文件提交到版本控制
   - 在 Vercel 等平台中安全配置环境变量

## 技术支持

如果遇到问题，请检查：

1. 应用日志：`/app/work/logs/bypass/app.log`
2. 数据库连接是否正常
3. 环境变量是否正确配置

如需进一步帮助，请联系技术支持。
