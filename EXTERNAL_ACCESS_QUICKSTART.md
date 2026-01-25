# 外网访问解决方案 - 快速指南

## 🚀 三种方案，任你选择

| 方案 | 适用场景 | 难度 | 时间 | 推荐度 |
|------|----------|------|------|--------|
| **LocalTunnel** | 快速临时演示 | ⭐ 最简单 | 2分钟 | ⭐⭐⭐⭐ |
| **ngrok** | 稳定临时使用 | ⭐⭐ 简单 | 5分钟 | ⭐⭐⭐⭐⭐ |
| **Vercel** | 永久生产环境 | ⭐⭐⭐ 中等 | 30分钟 | ⭐⭐⭐⭐⭐ |

---

## 方案一：LocalTunnel（最快，无需注册）⚡

### 优点
✅ 无需注册账号
✅ 2分钟即可使用
✅ 完全免费

### 缺点
❌ 每次重启地址变化
❌ 不适合长期使用

### 使用步骤

**打开 CMD，执行：**

```cmd
cd C:\PulseOpti-HR\PulseOpti-HR
```

**方法 A：使用脚本（推荐）**
```cmd
start-localtunnel.bat
```

**方法 B：手动执行**
```cmd
npx localtunnel --port 5000
```

**查看公网地址：**
```
your url is: https://xxxxx.loca.lt
```

复制这个地址，分享给他人即可访问！

---

## 方案二：ngrok（推荐，稳定）⭐⭐⭐

### 优点
✅ 性能稳定
✅ 支持HTTPS
✅ 有访问日志
✅ 免费版足够使用

### 缺点
❌ 需要注册账号
❌ 每次重启地址变化（免费版）

### 使用步骤

**步骤 1：下载 ngrok**

访问：https://ngrok.com/download

下载 Windows 64-bit 版本，解压 `ngrok.exe` 到项目根目录。

**步骤 2：注册并获取 authtoken**

1. 访问：https://ngrok.com/signup
2. 注册免费账号
3. 访问：https://dashboard.ngrok.com/get-started/your-authtoken
4. 复制 authtoken

**步骤 3：配置 authtoken**

打开 CMD：

```cmd
cd C:\PulseOpti-HR\PulseOpti-HR

# 替换为你的token
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

**步骤 4：启动隧道**

**方法 A：使用脚本（推荐）**
```cmd
start-public.bat
```

**方法 B：手动执行**
```cmd
ngrok http 5000
```

**步骤 5：获取公网地址**

ngrok 窗口中找到 `Forwarding` 行：

```
Forwarding  https://abcd-123-45-67-89.ngrok-free.app -> http://localhost:5000
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
             复制这个地址！
```

**步骤 6：分享给他人**

直接分享地址：`https://abcd-123-45-67-89.ngrok-free.app`

---

## 方案三：Vercel（永久，生产级）🏆

### 优点
✅ 永久固定域名
✅ 全球CDN加速
✅ 自动HTTPS
✅ 免费额度大
✅ 24/7在线

### 缺点
❌ 需要配置环境变量
❌ 首次部署较复杂

### 使用步骤

**方法 A：使用脚本（推荐）**

```cmd
cd C:\PulseOpti-HR\PulseOpti-HR
deploy-vercel.bat
```

脚本会自动：
1. 安装 Vercel CLI
2. 登录账号
3. 部署到 Vercel
4. 显示访问地址

**方法 B：手动部署**

**步骤 1：安装 Vercel CLI**

```cmd
pnpm add -g vercel
```

**步骤 2：登录**

```cmd
cd C:\PulseOpti-HR\PulseOpti-HR
vercel login
```

浏览器会自动打开，选择登录方式（推荐 GitHub）

**步骤 3：配置环境变量**

```cmd
# 创建 .env 文件
copy .env.example .env

# 编辑文件
notepad .env
```

填入真实的配置：
```
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
JWT_SECRET=your-super-secret-jwt-key
```

**步骤 4：部署**

```cmd
# 部署到生产环境
vercel --prod
```

按照提示操作：
- Scope: 选择你的账号
- Link to existing: No
- Project name: pulseopti-hr
- Directory: ./

**步骤 5：获取访问地址**

部署完成后会显示：
```
https://pulseopti-hr.vercel.app
```

**步骤 6：配置环境变量（重要！）**

在 Vercel 控制台：
1. 访问：https://vercel.com/dashboard
2. 进入你的项目
3. Settings → Environment Variables
4. 添加：
   - `DATABASE_URL` (你的数据库连接字符串)
   - `JWT_SECRET` (JWT密钥)
   - 其他必要的环境变量

**步骤 7：重新部署**

```cmd
vercel --prod
```

---

## 📊 方案对比总结

| 特性 | LocalTunnel | ngrok | Vercel |
|------|-------------|-------|--------|
| **设置时间** | 2分钟 | 5分钟 | 30分钟 |
| **注册要求** | 无 | 需要 | 需要 |
| **地址稳定性** | 每次变 | 每次变 | 永久固定 |
| **HTTPS** | ✅ | ✅ | ✅ |
| **自定义域名** | ❌ | 付费 | ✅ |
| **访问日志** | ❌ | ✅ | ✅ |
| **推荐场景** | 快速演示 | 临时分享 | 生产环境 |

---

## 🎯 推荐使用场景

### 场景 1：快速给客户演示（今天就要用）
👉 **使用 LocalTunnel**
```cmd
start-localtunnel.bat
```

### 场景 2：团队协作测试（本周需要）
👉 **使用 ngrok**
```cmd
start-public.bat
```

### 场景 3：正式上线给客户用（长期）
👉 **使用 Vercel**
```cmd
deploy-vercel.bat
```

---

## ⚠️ 常见问题

### Q1: 外网访问地址打不开？

**A: 检查本地服务是否运行**
```cmd
curl http://localhost:5000
```

应该返回 200 OK，如果失败，启动本地服务：
```cmd
pnpm run dev
```

### Q2: ngrok 启动后提示 403 Forbidden？

**A: authtoken 未配置或过期**
1. 重新获取 token：https://dashboard.ngrok.com/get-started/your-authtoken
2. 重新配置：
```cmd
ngrok config add-authtoken YOUR_NEW_TOKEN
```

### Q3: Vercel 部署后访问报错？

**A: 环境变量未配置**
1. 访问 Vercel 控制台
2. Settings → Environment Variables
3. 添加 `DATABASE_URL` 等必要变量
4. 重新部署

### Q4: 如何查看外网访问日志？

**ngrok:**
直接在 ngrok 运行窗口查看

**Vercel:**
访问 Vercel 控制台 → Logs

### Q5: 如何设置自定义域名？

**ngrok:** 需要升级付费版

**Vercel:**
1. Settings → Domains → Add Domain
2. 配置 DNS 记录
3. 等待验证通过

---

## 📚 更多资源

- **完整文档**: `docs/EXTERNAL_ACCESS_SOLUTION.md`
- **ngrok 官方文档**: https://ngrok.com/docs
- **Vercel 官方文档**: https://vercel.com/docs

---

## 🎉 现在就开始吧！

选择最适合你的方案，立即让外网访问你的应用！

**快速开始（推荐 LocalTunnel）**:
```cmd
start-localtunnel.bat
```

**稳定使用（推荐 ngrok）**:
```cmd
start-public.bat
```

**生产部署（推荐 Vercel）**:
```cmd
deploy-vercel.bat
```

---

**更新时间**: 2025-01-18
**维护团队**: PulseOpti HR Team
