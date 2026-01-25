# 🌐 外网访问解决方案

## 🔍 问题分析

你遇到的问题：

1. **浏览器访问不了**：`localhost:5000`、`127.0.0.1:5000`、`9.128.251.174:5000` 都无法访问
2. **原因**：这些地址都是**沙箱服务器内部**地址，你从**自己的电脑**访问，无法连接

**技术说明**：
- `127.0.0.1` 和 `localhost` 永远指向**你自己的电脑**，不是服务器
- `9.128.251.174` 是沙箱服务器的**内网IP**，只有沙箱内部可以访问
- 服务器的公网IP `115.190.192.22` 的5000端口被防火墙阻止

---

## 🚀 解决方案

### 方案1：使用Vercel生产环境（推荐，30分钟）

这是最稳定、最可靠的方案，适合正式使用。

#### 步骤1：登录Vercel
```bash
vercel login
```

#### 步骤2：部署到Vercel
```bash
vercel
```

按照提示操作：
1. 选择"Link to existing project"
2. 选择 "PulseOpti-HR" 项目
3. Vercel会自动构建和部署
4. 部署完成后，会提供一个 `*.vercel.app` 域名

#### 步骤3：配置环境变量

在Vercel控制台配置环境变量：
```
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

#### 步骤4：运行数据库迁移
```bash
vercel env pull .env.production
npx drizzle-kit push
```

#### 步骤5：创建超级管理员
```bash
npx tsx --env-file=.env.production create-admin.ts
```

#### 步骤6：访问
部署完成后，Vercel会提供一个类似这样的地址：
```
https://pulseopti-hr.vercel.app/admin/login
```

---

### 方案2：使用LocalTunnel（快速，2分钟）

适合快速测试和演示，但不稳定。

#### 步骤1：安装localtunnel
```bash
npm install -g localtunnel
```

#### 步骤2：启动隧道
```bash
lt --port 5000 --subdomain pulseopti-hr
```

这会创建一个公网地址，例如：
```
https://pulseopti-hr.loca.lt
```

#### 步骤3：访问
在浏览器中访问：
```
https://pulseopti-hr.loca.lt/admin/login
```

**注意**：
- ⚠️ 第一次访问需要验证手机号
- ⚠️ 服务不稳定，可能随时断开
- ⚠️ 不适合生产环境

---

### 方案3：使用ngrok（稳定，5分钟）

适合快速测试，比localtunnel更稳定。

#### 步骤1：安装ngrok
1. 访问 https://ngrok.com
2. 注册账号
3. 下载对应系统的ngrok
4. 配置authtoken

#### 步骤2：启动隧道
```bash
ngrok http 5000
```

#### 步骤3：访问
ngrok会提供一个公网地址，例如：
```
https://a1b2-c3d4-e5f6.ngrok-free.app
```

在浏览器中访问：
```
https://a1b2-c3d4-e5f6.ngrok-free.app/admin/login
```

**注意**：
- ⚠️ 免费版地址会变化
- ⚠️ 每次重启需要更新地址
- ⚠️ 不适合生产环境

---

## 📋 推荐方案对比

| 方案 | 稳定性 | 速度 | 持久性 | 成本 | 适用场景 |
|------|--------|------|--------|------|----------|
| **Vercel生产环境** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 免费额度充足 | 正式使用 |
| **LocalTunnel** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ | 免费 | 快速测试 |
| **ngrok** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | 免费 | 开发测试 |

---

## 🔧 当前开发环境

### 本地开发（沙箱内部）

在沙箱内部，服务正常运行，可以通过以下方式访问：

```bash
# 在沙箱内部测试
curl http://localhost:5000
curl http://127.0.0.1:5000
curl http://9.128.251.174:5000
```

### 登录信息

```
邮箱: 208343256@qq.com
密码: admin123
```

---

## 💡 重要提示

### 为什么直接访问不行？

**举例说明**：

假设：
- **你的电脑** = 你家里的电脑（192.168.1.100）
- **沙箱服务器** = 云端服务器（115.190.192.22）
- **服务器内部IP** = 9.128.251.174

当你访问 `http://127.0.0.1:5000` 时：
- 浏览器会尝试连接**你自己的电脑**的5000端口
- 但你的电脑上没有运行Next.js服务
- 所以连接失败

当你访问 `http://9.128.251.174:5000` 时：
- 这是沙箱服务器的**内网IP**
- 只有沙箱内部的网络可以访问
- 外网无法访问（防火墙阻止）

---

## 🎯 下一步操作

### 立即可用的方案（推荐）：

**1. 快速测试（2分钟）**：
```bash
npm install -g localtunnel
lt --port 5000 --subdomain pulseopti-hr
```
然后访问：`https://pulseopti-hr.loca.lt/admin/login`

**2. 稳定方案（5分钟）**：
使用ngrok（需要注册）

**3. 生产方案（30分钟）**：
部署到Vercel，获得稳定的 `https://pulseopti-hr.vercel.app` 地址

---

## 📞 如果还有问题

### 检查清单

- [ ] 开发服务器正在运行（`ss -lptn 'sport = :5000'`）
- [ ] 服务监听所有接口（`*:5000`）
- [ ] 本地可以访问（`curl http://localhost:5000`）
- [ ] 使用了正确的公网地址或隧道服务

### 常见错误

**错误1**: "连接被拒绝"
- 原因：使用了错误的地址
- 解决：使用隧道服务或Vercel

**错误2**: "连接超时"
- 原因：防火墙阻止
- 解决：使用隧道服务或Vercel

**错误3**: "无法访问"
- 原因：服务未运行
- 解决：启动开发服务器

---

**最后更新**: 2026-01-19 22:00
**推荐方案**: Vercel生产环境部署
