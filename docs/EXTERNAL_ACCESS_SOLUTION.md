# 彻底解决外网访问问题 - 完整解决方案

## 🎯 目标
让本地开发环境（localhost:5000）能够从外网访问，供客户演示或团队协作使用。

---

## 方案一：使用 ngrok 内网穿透（推荐 ⭐）

### 优势
✅ 5分钟搞定，零配置
✅ 免费版足够开发使用
✅ 自动HTTPS
✅ 支持自定义子域名（付费版）

### 前提条件
- 已安装 Node.js
- 本地服务运行在 5000 端口
- 有 ngrok 账号（免费）

### 📋 详细步骤（CMD 执行）

#### 步骤 1：下载 ngrok

打开 CMD，执行：

```cmd
cd C:\PulseOpti-HR\PulseOpti-HR
```

下载 ngrok（选择适合你系统的版本）：

**Windows 64位**：
```cmd
curl -o ngrok.zip https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-windows-amd64.zip
```

**或者手动下载**：
1. 访问：https://ngrok.com/download
2. 下载 Windows 64-bit 版本
3. 解压到 `C:\PulseOpti-HR\PulseOpti-HR\ngrok.exe`

#### 步骤 2：解压并配置

```cmd
# 解压（如果是手动下载的zip，跳过）
tar -xf ngrok.zip

# 添加到 PATH（可选，方便全局使用）
# 或者直接使用完整路径
```

#### 步骤 3：注册并获取 authtoken

1. 访问：https://ngrok.com/signup
2. 注册账号（免费）
3. 登录后访问：https://dashboard.ngrok.com/get-started/your-authtoken
4. 复制你的 authtoken

```cmd
# 连接你的账号（替换为你的token）
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

#### 步骤 4：启动本地服务（如果还没运行）

打开新的 CMD 窗口：

```cmd
cd C:\PulseOpti-HR\PulseOpti-HR
pnpm run dev
```

**保持这个窗口打开，不要关闭！**

#### 步骤 5：启动 ngrok 隧道

打开另一个 CMD 窗口：

```cmd
cd C:\PulseOpti-HR\PulseOpti-HR

# 启动 ngrok，映射 5000 端口
ngrok http 5000
```

#### 步骤 6：获取公网访问地址

ngrok 启动后会显示：

```
ngrok by @inconshreveable                                       (Ctrl+C to quit)

Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        Asia Pacific (ap)
Forwarding                    https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:5000
                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                              这是你的公网地址！复制它！

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**复制 `https://xxxx-xx-xx-xx-xx.ngrok-free.app` 这个地址**

#### 步骤 7：测试外网访问

1. 在手机或另一台电脑浏览器中访问复制的地址
2. 应该能看到 PulseOpti HR 首页

#### 步骤 8：分享给他人

直接分享 ngrok 地址即可，例如：
```
https://abcd-123-45-67-89.ngrok-free.app
```

### 常见问题解决

**Q: ngrok 地址每次都不一样？**
A: 免费版每次重启都会变。升级付费版可获得固定子域名。

**Q: 如何停止 ngrok？**
A: 在 ngrok 运行的窗口按 `Ctrl + C`

**Q: 如何查看访问日志？**
A: ngrok 运行窗口会实时显示所有访问请求

---

## 方案二：部署到云服务器（生产推荐 ⭐⭐⭐）

### 优势
✅ 永久固定域名
✅ 高性能，24/7 在线
✅ 支持自定义域名
✅ 适合生产环境

### 推荐平台
1. **Vercel**（最简单，免费额度）
2. **腾讯云/阿里云**（国内访问快）
3. **AWS/Google Cloud**（全球访问）

### 📋 详细步骤 - 部署到 Vercel

#### 步骤 1：安装 Vercel CLI

```cmd
# 全局安装 Vercel CLI
npm install -g vercel

# 或者使用 pnpm
pnpm add -g vercel
```

#### 步骤 2：登录 Vercel

```cmd
cd C:\PulseOpti-HR\PulseOpti-HR

# 登录 Vercel
vercel login
```

浏览器会自动打开，选择登录方式（GitHub推荐）

#### 步骤 3：准备部署配置

确保项目中已有 `.env` 文件（如果缺失，复制 `.env.example`）：

```cmd
# 复制环境变量文件
copy .env.example .env

# 编辑 .env 文件，填入真实的数据库URL等
notepad .env
```

**必须配置的关键环境变量**：
```
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-change-this
```

#### 步骤 4：部署到 Vercel

```cmd
cd C:\PulseOpti-HR\PulseOpti-HR

# 首次部署
vercel

# 按提示操作：
# - Set up and deploy? Y
# - Which scope? 选择你的账号
# - Link to existing project? No
# - Project name? pulseopti-hr
# - In which directory is your code located? ./ (默认)
# - Want to modify these settings? N (使用默认)
```

部署完成后，Vercel 会显示访问地址，例如：
```
https://pulseopti-hr.vercel.app
```

#### 步骤 5：运行数据库迁移

```cmd
# 进入 Vercel 环境运行迁移
vercel env pull .env.production
vercel exec -- npx drizzle-kit push
```

或者直接在 Vercel 控制台的 Settings → Environment Variables 中配置环境变量。

#### 步骤 6：测试生产环境

在浏览器中访问：`https://pulseopti-hr.vercel.app`

#### 步骤 7：设置自定义域名（可选）

在 Vercel 控制台：
1. 进入项目 → Settings → Domains
2. 添加你的域名（如 `hr.pulseopti.com`）
3. 按提示配置 DNS 记录

---

## 方案三：使用其他内网穿透工具

### 1. Cloudflare Tunnel（免费，推荐）

```cmd
# 安装 cloudflared
curl -o cloudflared.exe https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe

# 登录
cloudflared tunnel login

# 创建隧道
cloudflared tunnel create pulseopti-hr

# 启动隧道
cloudflared tunnel --url http://localhost:5000
```

### 2. LocalTunnel（无需注册，最简单）

```cmd
# 安装
npm install -g localtunnel

# 启动
lt --port 5000
```

### 3. FRP（自建，适合高级用户）

需要有一台有公网IP的服务器。

---

## 📊 方案对比

| 方案 | 难度 | 速度 | 稳定性 | 成本 | 推荐度 |
|------|------|------|--------|------|--------|
| **ngrok** | ⭐ | 快 | 高 | 免费 | ⭐⭐⭐⭐⭐ |
| **Vercel** | ⭐⭐ | 快 | 极高 | 免费额度 | ⭐⭐⭐⭐⭐ |
| **Cloudflare Tunnel** | ⭐⭐ | 快 | 极高 | 免费 | ⭐⭐⭐⭐ |
| **LocalTunnel** | ⭐ | 快 | 中 | 免费 | ⭐⭐⭐ |
| **云服务器** | ⭐⭐⭐ | 中 | 极高 | 付费 | ⭐⭐⭐⭐ |

---

## 🚀 推荐操作流程

### 快速演示（5分钟）
1. 使用 **ngrok** 方案
2. 立即可用，分享给客户

### 长期使用（30分钟）
1. 使用 **Vercel** 方案
2. 部署到生产环境
3. 获得永久公网地址

---

## 🛠️ 一键启动脚本（ngrok）

创建文件 `start-public.bat`：

```batch
@echo off
chcp 65001 >nul
echo ==========================================
echo   PulseOpti HR - 公网访问启动工具
echo ==========================================
echo.

echo [1/2] 启动本地开发服务器...
start cmd /k "pnpm run dev"
timeout /t 5 >nul

echo [2/2] 启动 ngrok 隧道...
start cmd /k "ngrok http 5000"

echo.
echo ==========================================
echo   公网访问地址生成中...
echo ==========================================
echo.
echo 请查看 ngrok 窗口中的 "Forwarding" 地址
echo 格式: https://xxxx-xx-xx-xx-xx.ngrok-free.app
echo.
pause
```

使用方法：
```cmd
start-public.bat
```

---

## 📝 注意事项

### 安全性
- ngrok 免费版地址会变化，不适合长期使用
- 生产环境必须使用 HTTPS 和自定义域名
- 不要在公网地址中暴露敏感信息

### 性能
- 内网穿透速度取决于你的网络带宽
- Vercel 免费版有每月 100GB 带宽限制

### 法律合规
- 确保遵守相关法律法规
- 不要用于非法用途

---

## 🎯 总结

### 最快方案（5分钟）：ngrok
```cmd
ngrok http 5000
```

### 最稳方案（30分钟）：Vercel
```cmd
vercel login
vercel
```

### 推荐组合
- 开发测试：ngrok
- 生产环境：Vercel 或 云服务器

---

**文档更新**: 2025-01-18
