# 修复超管端域名路由问题

## 🚨 问题

访问 `admin.aizhixuan.com.cn` 时，显示的是用户端首页，而不是超管端页面。

**原因**：Next.js 默认不会根据域名自动路由，需要配置域名识别逻辑。

---

## ✅ 解决方案

已创建域名路由中间件 `src/middleware.ts`，自动识别域名并路由到对应的页面。

### 路由逻辑

| 域名 | 路由行为 |
|------|---------|
| admin.aizhixuan.com.cn | 重定向到 /admin/* |
| www.aizhixuan.com.cn | 用户端（正常访问） |
| aizhixuan.com.cn | 用户端（正常访问） |
| localhost | 根据路径访问（开发环境）|

### 具体路由规则

**超管端 (admin.aizhixuan.com.cn)**:
- `/` → `/admin`
- `/login` → `/admin/login`
- `/register` → `/admin/login`（超管端不支持注册）
- 其他路径 → `/admin/路径`

**用户端 (www.aizhixuan.com.cn)**:
- `/admin/*` → `/login`（用户端不能访问超管端）
- 其他路径 → 正常访问

---

## 🔧 配置环境变量

需要在 Vercel 中配置以下环境变量：

### 步骤1：进入环境变量配置

1. 登录 Vercel：https://vercel.com
2. 进入项目：pulseopti-hr
3. 点击 `Settings` → `Environment Variables`

### 步骤2：添加环境变量

#### 环境变量1：NEXT_PUBLIC_ADMIN_DOMAIN

- **Name**: `NEXT_PUBLIC_ADMIN_DOMAIN`
- **Value**: `admin.aizhixuan.com.cn`
- **Environment**: Production, Preview, Development

#### 环境变量2：NEXT_PUBLIC_USER_DOMAIN

- **Name**: `NEXT_PUBLIC_USER_DOMAIN`
- **Value**: `www.aizhixuan.com.cn`
- **Environment**: Production, Preview, Development

### 步骤3：保存配置

点击 `Save` 按钮保存环境变量。

---

## 🚀 重新部署

添加环境变量后，需要重新部署项目：

### 方法1：自动部署（推荐）

1. 在 GitHub 中提交代码
2. Vercel 会自动检测到更改并重新部署
3. 等待部署完成（约2-5分钟）

### 方法2：手动部署

1. 在 Vercel 项目页面
2. 点击 `Deployments` 标签
3. 找到最新的部署记录
4. 点击右侧的 `···` 按钮
5. 选择 `Redeploy`
6. 等待部署完成（约2-5分钟）

---

## ✅ 验证修复

部署完成后，测试以下场景：

### 测试1：访问超管端域名

访问：`https://admin.aizhixuan.com.cn`

**预期结果**：
- 自动重定向到 `/admin/dashboard`（如果已登录）
- 或重定向到 `/admin/login`（如果未登录）

### 测试2：访问超管端登录页

访问：`https://admin.aizhixuan.com.cn/login`

**预期结果**：
- 自动重定向到 `/admin/login`
- 显示超管端登录页面

### 测试3：访问用户端域名

访问：`https://www.aizhixuan.com.cn`

**预期结果**：
- 显示用户端首页
- 不重定向到超管端

### 测试4：用户端尝试访问超管端路径

访问：`https://www.aizhixuan.com.cn/admin`

**预期结果**：
- 重定向到 `/login`
- 提示需要登录（但不能访问超管端）

---

## 🔍 调试信息

中间件会输出调试日志，可以在 Vercel 日志中查看：

### 查看日志

1. 在 Vercel 项目页面
2. 点击 `Logs` 标签
3. 选择实时日志模式
4. 访问 `https://admin.aizhixuan.com.cn`
5. 查看日志输出

### 日志示例

```
Middleware - Hostname: admin.aizhixuan.com.cn
Middleware - Path: /
Middleware - Admin Domain: admin.aizhixuan.com.cn
Middleware - User Domain: www.aizhixuan.com.cn
Middleware - Detected admin domain, redirecting to /admin
```

---

## 📋 配置检查清单

- [ ] 已创建 middleware.ts 文件
- [ ] 已在 Vercel 中添加 NEXT_PUBLIC_ADMIN_DOMAIN 环境变量
- [ ] 已在 Vercel 中添加 NEXT_PUBLIC_USER_DOMAIN 环境变量
- [ ] 已重新部署项目
- [ ] 已验证 admin.aizhixuan.com.cn 正确路由到超管端
- [ ] 已验证 www.aizhixuan.com.cn 正确路由到用户端
- [ ] 已检查日志确认中间件正常工作

---

## ⏱️ 预计时间

| 步骤 | 预计时间 |
|------|---------|
| 配置环境变量 | 3分钟 |
| 重新部署 | 2-5分钟 |
| 测试验证 | 5分钟 |
| **总计** | **10-13分钟** |

---

## 🎯 总结

**问题**：`admin.aizhixuan.com.cn` 路由到用户端

**解决**：
1. 创建域名路由中间件 (`src/middleware.ts`)
2. 配置环境变量（`NEXT_PUBLIC_ADMIN_DOMAIN` 和 `NEXT_PUBLIC_USER_DOMAIN`）
3. 重新部署项目

**结果**：
- `admin.aizhixuan.com.cn` → 自动路由到 `/admin`
- `www.aizhixuan.com.cn` → 用户端正常访问

---

## 📞 需要帮助？

如果配置后仍然无法正常路由：

1. 检查环境变量是否正确配置
2. 查看中间件日志，确认域名识别逻辑
3. 检查 Vercel 部署是否成功
4. 清除浏览器缓存后重试

---

## 💡 提示

- **环境变量必须以 `NEXT_PUBLIC_` 开头**，才能在客户端和中间件中使用
- **修改环境变量后必须重新部署**，否则不会生效
- **中间件日志只在开发环境显示**，生产环境可以在 Vercel Logs 中查看
