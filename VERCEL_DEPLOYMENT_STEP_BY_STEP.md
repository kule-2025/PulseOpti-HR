# PulseOpti HR - Vercel 部署完整操作步骤

## 📋 目录

1. [前置准备](#前置准备)
2. [连接 GitHub 仓库](#连接-github-仓库)
3. [配置环境变量](#配置环境变量)
4. [触发自动部署](#触发自动部署)
5. [监控部署状态](#监控部署状态)
6. [验证部署结果](#验证部署结果)
7. [配置自定义域名](#配置自定义域名)
8. [常见问题解决](#常见问题解决)

---

## 前置准备

### 必需条件

✅ 已有 Vercel 账号（使用 GitHub 账号登录）
✅ 已有 Neon PostgreSQL 数据库
✅ 已有 Coze API Key（用于 AI 功能）
✅ 已将代码推送到 GitHub 仓库：`kule-2025/PulseOpti-HR`

### 必需信息

| 信息项 | 值 |
|--------|-----|
| Vercel 账号 | leyou-2026 |
| Vercel 项目 | pulseopti-hr |
| GitHub 仓库 | kule-2025/PulseOpti-HR |
| 数据库 URL | `postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require` |
| Coze API Key | `a915ab35-9534-43ad-b925-d9102c5007ba` |

---

## 连接 GitHub 仓库

### 步骤 1：访问 Vercel Dashboard

1. 访问：https://vercel.com
2. 使用 GitHub 账号登录
3. 进入 Dashboard

### 步骤 2：创建或进入项目

如果项目已存在：
1. 在 Dashboard 中找到 `pulseopti-hr` 项目
2. 点击进入项目

如果项目不存在：
1. 点击 **"Add New"** → **"Project"**
2. 选择 GitHub 仓库 `kule-2025/PulseOpti-HR`
3. 点击 **"Import"**

### 步骤 3：确认 GitHub 连接

1. 进入项目 **Settings** → **Git**
2. 确认 **"Connected Repository"** 显示为 `kule-2025/PulseOpti-HR`
3. 确认 **"Production Branch"** 为 `main`

---

## 配置环境变量

### 步骤 1：访问环境变量配置页面

1. 进入项目：https://vercel.com/leyou-2026/pulseopti-hr
2. 点击 **"Settings"** 标签
3. 点击 **"Environment Variables"** 子标签

### 步骤 2：添加必需的环境变量

逐个添加以下环境变量：

#### 1. 数据库配置

| Key | Value | Environments |
|-----|-------|--------------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require` | Production, Preview, Development |

#### 2. JWT 认证配置

| Key | Value | Environments |
|-----|-------|--------------|
| `JWT_SECRET` | `a915ab35-9534-43ad-b925-d9102c5007ba-PulseOpti-HR-JWT-Secret-Key-2025-01-19-PROD` | Production, Preview, Development |
| `JWT_EXPIRES_IN` | `7d` | Production, Preview, Development |

#### 3. 应用配置

| Key | Value | Environments |
|-----|-------|--------------|
| `NEXT_PUBLIC_APP_URL` | `https://www.aizhixuan.com.cn` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production, Preview, Development |

#### 4. 管理员配置

| Key | Value | Environments |
|-----|-------|--------------|
| `ADMIN_EMAIL` | `208343256@qq.com` | Production, Preview, Development |
| `ADMIN_PASSWORD` | `admin123` | Production, Preview, Development |
| `ADMIN_INIT_KEY` | `pulseopti-init-2025` | Production, Preview, Development |

#### 5. AI 功能配置

| Key | Value | Environments |
|-----|-------|--------------|
| `COZE_WORKLOAD_IDENTITY_API_KEY` | `a915ab35-9534-43ad-b925-d9102c5007ba` | Production, Preview, Development |

### 步骤 3：保存环境变量

添加完所有环境变量后：
1. 滚动到页面底部
2. 点击 **"Save"** 按钮保存
3. 等待保存完成（通常需要 5-10 秒）

---

## 触发自动部署

### 自动部署（推荐）

如果代码已推送到 GitHub 的 `main` 分支：
1. Vercel 会自动检测到推送
2. 自动触发部署流程
3. 进入 **Deployments** 标签查看部署状态

### 手动触发部署

如果需要手动触发部署：

#### 方法 1：推送新代码（推荐）

```bash
git add .
git commit -m "trigger vercel redeploy"
git push origin main
```

#### 方法 2：在 Vercel Dashboard 中手动触发

1. 进入项目 **Deployments** 标签
2. 找到最新的部署记录
3. 点击右侧的 **"..."** 菜单
4. 选择 **"Redeploy"**
5. 点击 **"Redeploy"** 确认

---

## 监控部署状态

### 步骤 1：访问部署页面

1. 进入项目：https://vercel.com/leyou-2026/pulseopti-hr
2. 点击 **"Deployments"** 标签

### 步骤 2：查看部署状态

部署状态有以下几种：

| 状态 | 说明 |
|------|------|
| 🟡 Building | 正在构建（安装依赖、构建生产版本） |
| 🟢 Ready | 部署成功 |
| 🔴 Error | 部署失败 |
| 🟠 Canceled | 部署被取消 |

### 步骤 3：查看构建日志

1. 点击正在部署的记录
2. 查看实时构建日志
3. 关注以下关键步骤：
   - ✅ Installing dependencies
   - ✅ Building
   - ✅ Deploying to Edge Network

### 步骤 4：等待部署完成

- **正常情况：** 5-10 分钟
- **首次部署：** 10-15 分钟（需要下载依赖、构建生产版本）
- **代码量大：** 15-20 分钟（1030 个文件，300,883+ 行代码）

---

## 验证部署结果

### 步骤 1：访问应用 URL

部署成功后，访问以下 URL：

| URL | 说明 |
|-----|------|
| https://leyou-2026-pulseopti-hr.vercel.app | Vercel 默认域名 |
| https://www.aizhixuan.com.cn | 自定义域名（已配置） |
| https://admin.aizhixuan.com.cn | 超管端域名（已配置） |

### 步骤 2：测试登录功能

#### 超管端登录

1. 访问：https://admin.aizhixuan.com.cn
2. 输入邮箱：`208343256@qq.com`
3. 输入密码：`admin123`
4. 点击 **"登录"**
5. 验证：成功进入超管端仪表盘

#### 用户端登录

1. 访问：https://www.aizhixuan.com.cn
2. 使用注册账号或测试账号登录
3. 验证：成功进入用户端仪表盘

### 步骤 3：测试核心功能

#### 员工档案管理
- [ ] 创建新员工
- [ ] 编辑员工信息
- [ ] 删除员工
- [ ] 搜索员工

#### 考勤打卡
- [ ] 打卡签到
- [ ] 打卡签退
- [ ] 查看考勤记录

#### 招聘职位
- [ ] 发布新职位
- [ ] 编辑职位信息
- [ ] 查看职位列表

#### 绩效评估
- [ ] 创建评估任务
- [ ] 提交评估结果
- [ ] 查看评估报告

#### 薪酬管理
- [ ] 查看薪酬结构
- [ ] 计算薪酬
- [ ] 导出薪酬报表

### 步骤 4：测试 AI 功能（可选）

如果配置了 AI 功能：
- [ ] AI 简历解析
- [ ] AI 离职预测
- [ ] AI 绩效分析
- [ ] AI 招聘助手

---

## 配置自定义域名

### 步骤 1：访问域名配置页面

1. 进入项目：https://vercel.com/leyou-2026/pulseopti-hr
2. 点击 **"Settings"** 标签
3. 点击 **"Domains"** 子标签

### 步骤 2：添加域名

#### 添加主域名

1. 点击 **"Add Domain"**
2. 输入域名：`www.aizhixuan.com.cn`
3. 点击 **"Add"**
4. 等待 DNS 配置完成

#### 添加超管端域名

1. 点击 **"Add Domain"**
2. 输入域名：`admin.aizhixuan.com.cn`
3. 点击 **"Add"**
4. 等待 DNS 配置完成

### 步骤 3：配置 DNS 记录

Vercel 会提供需要添加的 DNS 记录，通常包括：

| Type | Name | Value |
|------|------|-------|
| CNAME | www | cname.vercel-dns.com |
| CNAME | admin | cname.vercel-dns.com |

### 步骤 4：验证 DNS 配置

1. 等待 DNS 传播（通常 5-10 分钟）
2. 访问：https://www.aizhixuan.com.cn
3. 访问：https://admin.aizhixuan.com.cn
4. 验证：域名解析成功

### 步骤 5：启用 HTTPS

Vercel 会自动为自定义域名提供 HTTPS 证书：
1. 等待证书签发（通常 5-10 分钟）
2. 验证：访问 `https://` 版本的域名
3. 确认：HTTPS 证书有效

---

## 常见问题解决

### 问题 1：部署失败 - DATABASE_URL 未配置

**错误信息：**
```
Error: DATABASE_URL is not defined
```

**解决方案：**
1. 进入 Vercel Dashboard → Settings → Environment Variables
2. 添加 `DATABASE_URL` 环境变量
3. 保存后重新部署

### 问题 2：登录失败 - JWT_SECRET 未配置

**错误信息：**
```
Error: JWT_SECRET is not defined
```

**解决方案：**
1. 进入 Vercel Dashboard → Settings → Environment Variables
2. 添加 `JWT_SECRET` 环境变量
3. 保存后重新部署

### 问题 3：AI 功能无法使用

**错误信息：**
```
Error: COZE_WORKLOAD_IDENTITY_API_KEY is not defined
```

**解决方案：**
1. 进入 Vercel Dashboard → Settings → Environment Variables
2. 添加 `COZE_WORKLOAD_IDENTITY_API_KEY` 环境变量
3. 保存后重新部署

### 问题 4：构建超时

**错误信息：**
```
Error: Build timeout exceeded
```

**解决方案：**
1. 进入 Vercel Dashboard → Settings → General
2. 增加 **Build Timeout** 值（默认 60 秒，增加到 300 秒）
3. 重新部署

### 问题 5：域名无法访问

**错误信息：**
```
Error: DNS_PROBE_POSSIBLE
```

**解决方案：**
1. 检查 DNS 记录是否正确配置
2. 等待 DNS 传播完成（最长 24 小时）
3. 使用 `dig` 或 `nslookup` 检查 DNS 解析

### 问题 6：环境变量未生效

**错误信息：**
```
Error: Environment variable not found
```

**解决方案：**
1. 确认环境变量已添加到 Production 环境
2. 保存环境变量后重新部署
3. 检查环境变量名称是否正确（区分大小写）

### 问题 7：部署成功但功能异常

**解决方案：**
1. 检查浏览器控制台是否有错误
2. 检查 Vercel Function Logs
3. 检查数据库连接是否正常
4. 重新部署最新代码

---

## 📚 相关文档

- [完整环境变量配置](./ALL_ENV_VARIABLES.md)
- [故障排查指南](./VERCEL_DEPLOYMENT_TROUBLESHOOTING.md)
- [环境变量快速配置](./vercel-env-vars-copy.txt)
- [完整版本部署记录](./COMPLETE_VERSION_DEPLOYED.md)

---

## 💡 提示

1. **环境变量修改后必须重新部署**
2. **首次部署可能需要较长时间（15-20 分钟）**
3. **部署完成后，代码推送会自动触发部署**
4. **查看部署日志可以帮助定位问题**
5. **使用 Vercel CLI 可以实现自动化部署**

---

## 🎯 部署检查清单

部署完成后，请确认以下所有项：

### 基础检查
- [ ] 部署状态显示为 "Ready"
- [ ] 所有环境变量已配置
- [ ] 自定义域名已配置
- [ ] HTTPS 证书已签发

### 功能检查
- [ ] 超管端登录正常
- [ ] 用户端登录正常
- [ ] 员工档案管理正常
- [ ] 考勤打卡功能正常
- [ ] 招聘职位管理正常
- [ ] 绩效评估功能正常
- [ ] 薪酬管理功能正常

### 集成检查（可选）
- [ ] 邮件发送正常
- [ ] 短信发送正常
- [ ] 支付功能正常
- [ ] AI 功能正常

---

**部署完成时间：** 2025-01-19
**项目：** PulseOpti HR 脉策聚效
**文档版本：** v1.0
