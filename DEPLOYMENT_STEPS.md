# PulseOpti HR - 完整部署步骤（Cloudflare + Vercel + Neon）

> 部署架构：Cloudflare (域名和加速) + Vercel (应用部署) + Neon (数据库)
> 域名：aizhixuan.com.cn

---

## 📋 前置要求

1. 已注册 Cloudflare 账户
2. 已注册 Vercel 账户
3. 已注册 Neon 账户
4. 已有 GitHub 账户（代码仓库）
5. Windows 操作系统（管理员权限）

---

## 🚀 完整部署步骤（CMD命令）

### 步骤1：克隆代码到本地

打开命令提示符（CMD），执行：

```cmd
cd C:\
git clone https://github.com/tomato-writer-2024/PulseOpti-HR.git
cd PulseOpti-HR
```

---

### 步骤2：安装依赖

```cmd
pnpm install
```

如果提示 `pnpm` 未安装，先安装：

```cmd
npm install -g pnpm
```

---

### 步骤3：配置环境变量

#### 3.1 创建环境变量文件

```cmd
type nul > .env.local
```

#### 3.2 编辑环境变量文件

```cmd
notepad .env.local
```

将以下内容粘贴到 `.env.local` 文件中：

```env
# 数据库连接（Neon PostgreSQL）
# 在 https://console.neon.tech/ 获取连接字符串
DATABASE_URL=postgresql://neondb_owner:your_password@ep-xxx.aws.neon.tech/neondb?sslmode=require

# JWT配置
JWT_SECRET=PulseOptiHR_SecretKey_2025_Change_In_Production
JWT_EXPIRES_IN=7d

# 应用配置
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://aizhixuan.com.cn
```

**重要**：
- 替换 `DATABASE_URL` 为你的 Neon 数据库连接字符串
- 替换 `JWT_SECRET` 为随机字符串（生产环境）
- `NEXT_PUBLIC_APP_URL` 设置为你的域名

保存文件并关闭记事本。

---

### 步骤4：初始化数据库

#### 4.1 生成数据库迁移文件

```cmd
npx drizzle-kit generate
```

#### 4.2 推送数据库 schema 到 Neon

```cmd
npx drizzle-kit push
```

等待执行完成，会显示59个数据表创建成功。

---

### 步骤5：本地测试构建

```cmd
pnpm run build
```

如果构建成功，会显示：
```
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

---

### 步骤6：提交代码到 GitHub

#### 6.1 查看 Git 状态

```cmd
git status
```

#### 6.2 添加所有更改

```cmd
git add .
```

#### 6.3 提交更改

```cmd
git commit -m "feat: 完成登录注册功能修复和数据库配置"
```

#### 6.4 推送到 GitHub

```cmd
git push origin main
```

如果提示需要认证，会弹出浏览器登录 GitHub。

---

### 步骤7：配置 Vercel 部署

#### 7.1 安装 Vercel CLI

```cmd
npm install -g vercel
```

#### 7.2 登录 Vercel

```cmd
vercel login
```

选择邮箱登录，浏览器会打开 Vercel 登录页面。

#### 7.3 链接项目到 Vercel

```cmd
vercel link
```

按提示选择：
- Set up and deploy? `Y`
- Link to existing project? `N`（首次部署）
- Project name: `pulseopti-hr`
- Directory: `.`

#### 7.4 部署到生产环境

```cmd
vercel --prod
```

等待部署完成，会显示：
```
Production: https://pulseopti-hr.vercel.app
```

---

### 步骤8：配置 Vercel 环境变量

#### 8.1 打开 Vercel Dashboard

在浏览器访问：https://vercel.com/dashboard

#### 8.2 找到 `pulseopti-hr` 项目

点击项目名称进入项目设置。

#### 8.3 添加环境变量

依次添加以下环境变量：

| 名称 | 值 | 环境 |
|------|-----|------|
| `DATABASE_URL` | 你的 Neon 数据库连接字符串 | Production, Preview, Development |
| `JWT_SECRET` | PulseOptiHR_SecretKey_2025_Change_In_Production | Production, Preview, Development |
| `JWT_EXPIRES_IN` | 7d | Production, Preview, Development |
| `NODE_ENV` | production | Production, Development |
| `NEXT_PUBLIC_APP_URL` | https://aizhixuan.com.cn | Production, Preview, Development |

**注意**：每个环境变量需要分别添加到 Production、Preview、Development 三个环境。

#### 8.4 重新部署

添加环境变量后，在 Vercel Dashboard 点击 "Redeploy" 按钮，或在本地执行：

```cmd
vercel --prod
```

---

### 步骤9：配置 Cloudflare DNS

#### 9.1 登录 Cloudflare

访问：https://dash.cloudflare.com/

#### 9.2 选择域名

选择 `aizhixuan.com.cn` 域名。

#### 9.3 添加 DNS 记录

点击 "DNS" → "Add record"，添加以下记录：

**记录1：A 记录（根域名）**
- Type: `A`
- Name: `@`
- IPv4 address: `76.76.21.21`（Vercel IP）
- Proxy status: `Proxied`（橙色云朵）
- TTL: Auto

**记录2：CNAME 记录（www）**
- Type: `CNAME`
- Name: `www`
- Target: `pulseopti-hr.vercel.app`
- Proxy status: `Proxied`（橙色云朵）
- TTL: Auto

点击 "Save" 保存。

---

### 步骤10：配置 Cloudflare SSL/TLS

#### 10.1 设置 SSL 模式

在 Cloudflare Dashboard：
1. 点击 "SSL/TLS"
2. 设置 "Encryption mode" 为 "Full"（推荐）

#### 10.2 启用 Always Use HTTPS

1. 点击 "SSL/TLS" → "Edge Certificates"
2. 开启 "Always Use HTTPS"

#### 10.3 设置 HSTS

1. 点击 "SSL/TLS" → "Edge Certificates"
2. 开启 "HTTP Strict Transport Security (HSTS)"
3. 设置 Max Age 为 `31536000`（1年）

---

### 步骤11：配置 Cloudflare 性能优化

#### 11.1 启用自动压缩

1. 点击 "Speed" → "Optimization"
2. 开启 "Auto Minify"：
   - JavaScript: 开启
   - CSS: 开启
   - HTML: 开启

#### 11.2 启用 Brotli 压缩

1. 点击 "Speed" → "Optimization"
2. 开启 "Brotli"

#### 11.3 启用 HTTP/2

1. 点击 "Network"
2. 开启 "HTTP/2"

#### 11.4 配置缓存规则

1. 点击 "Caching" → "Configuration"
2. 设置 "Caching level" 为 "Standard"

---

### 步骤12：配置 Cloudflare 安全设置

#### 12.1 设置防火墙规则（可选）

1. 点击 "Security" → "WAF"
2. 创建规则（如限制特定国家访问）

#### 12.2 启用 Bot Fight Mode

1. 点击 "Security" → "Bot Fight Mode"
2. 开启 "Automatically Mitigate Bots"

---

### 步骤13：验证部署

#### 13.1 检查 DNS 解析

```cmd
nslookup aizhixuan.com.cn
```

应该返回 Cloudflare 的 IP 地址。

#### 13.2 检查 SSL 证书

在浏览器访问：https://aizhixuan.com.cn

应该显示：
- 🔒 安全锁图标
- 证书由 Cloudflare 颁发

#### 13.3 测试功能

打开浏览器，访问：https://aizhixuan.com.cn

测试以下功能：
- ✅ 页面正常加载
- ✅ 点击"手机登录" → 输入手机号 → 点击"获取验证码"
- ✅ 点击"邮箱登录" → 输入邮箱 → 点击"获取验证码"
- ✅ 点击"注册" → 测试各种注册方式
- ✅ 点击"忘记密码" → 测试密码重置

---

## 🔍 故障排查

### 问题1：DNS 解析失败

**解决方法**：
```cmd
ipconfig /flushdns
nslookup aizhixuan.com.cn
```

### 问题2：SSL 证书错误

**解决方法**：
1. 检查 Cloudflare SSL 模式是否为 "Full"
2. 等待 10-15 分钟让证书生效
3. 清除浏览器缓存

### 问题3：Vercel 部署失败

**解决方法**：
```cmd
pnpm run build
```

检查构建错误并修复。

### 问题4：数据库连接失败

**解决方法**：
1. 检查 `.env.local` 中的 `DATABASE_URL` 是否正确
2. 确认 Neon 数据库处于运行状态
3. 重新运行数据库迁移：
```cmd
npx drizzle-kit push
```

### 问题5：登录注册功能无响应

**解决方法**：
1. 打开浏览器开发者工具（F12）
2. 查看 Console 和 Network 标签
3. 检查 API 请求是否返回错误
4. 确认所有环境变量已正确配置

---

## 📊 监控和维护

### 查看网站性能

1. Cloudflare Dashboard → "Analytics" → "Overview"
2. Vercel Dashboard → 项目设置 → "Analytics"

### 查看应用日志

1. Vercel Dashboard → 项目 → "Logs"
2. 查看实时日志和错误信息

### 数据库管理

1. 访问：https://console.neon.tech/
2. 选择你的数据库项目
3. 使用 SQL Editor 执行查询

### 更新代码

```cmd
cd C:\PulseOpti-HR
git pull origin main
vercel --prod
```

---

## 🎉 部署完成

恭喜！你已成功部署 PulseOpti HR 系统。

**访问地址**：https://aizhixuan.com.cn

---

## 📞 技术支持

- 邮箱：PulseOptiHR@163.com
- GitHub：https://github.com/tomato-writer-2024/PulseOpti-HR

---

**文档结束**
