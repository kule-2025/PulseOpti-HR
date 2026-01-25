# 外网访问问题诊断和解决方案

## 🔍 诊断步骤

### 步骤 1：检查 Vercel 部署状态

在 CMD 或 PowerShell 中执行：

```cmd
vercel ls --prod
```

**预期输出**：
```
Project                     | Production URL                                    | ...
pulseopti-hr                | https://pulseopti-hr.vercel.app                   | ...
```

如果看不到部署信息，说明没有成功部署到生产环境。

---

### 步骤 2：检查 Vercel 环境变量

```cmd
vercel env ls --environment=production
```

**预期输出**：应该看到 5 个环境变量
- DATABASE_URL
- JWT_SECRET
- JWT_EXPIRES_IN
- NODE_ENV
- NEXT_PUBLIC_APP_URL

如果环境变量列表为空或不完整，需要重新配置。

---

### 步骤 3：验证 Vercel 部署日志

```cmd
vercel logs --prod
```

查看最新的部署日志，检查是否有错误。

---

## 🚨 常见问题和解决方案

### 问题 1：Vercel 没有成功部署到生产环境

**症状**：
- `vercel ls --prod` 显示没有生产环境
- 访问 https://pulseopti-hr.vercel.app 显示 404 或无法访问

**解决方案**：

```cmd
# 1. 确保已链接到 Vercel 项目
vercel link

# 2. 部署到生产环境
vercel --prod
```

等待部署完成，应该看到：
```
✅ Production: https://pulseopti-hr.vercel.app [2s]
```

---

### 问题 2：环境变量未配置到 Vercel

**症状**：
- 部署成功但访问时报错 "Database connection failed"
- 或其他与环境变量相关的错误

**解决方案**：

**检查环境变量**：
```cmd
vercel env ls --environment=production
```

**如果缺失，逐个重新添加**：

```cmd
# 1. 数据库连接
vercel env add DATABASE_URL production
```
粘贴：
```
postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

```cmd
# 2. JWT 密钥
vercel env add JWT_SECRET production
```
粘贴：
```
PulseOptiHR_SuperSecretKey_2024_Production_Secure_Random_String_DoNotChangeInProduction
```

```cmd
# 3. JWT 过期时间
vercel env add JWT_EXPIRES_IN production
```
粘贴：
```
7d
```

```cmd
# 4. Node 环境
vercel env add NODE_ENV production
```
粘贴：
```
production
```

```cmd
# 5. 应用 URL
vercel env add NEXT_PUBLIC_APP_URL production
```
粘贴：
```
https://pulseopti-hr.vercel.app
```

**重新部署**：
```cmd
vercel --prod
```

---

### 问题 3：本地网络无法访问 Vercel（最常见）

**症状**：
- Vercel Dashboard 显示部署成功
- 其他地方可以访问，但本地无法访问
- 错误：ERR_CONNECTION_TIMED_OUT

**原因**：
- 本地 ISP（互联网服务提供商）网络问题
- DNS 解析问题
- IPv6 连接问题

**解决方案**：

#### 方案 A：使用手机热点测试（成功率 80%）

1. 用手机开启热点
2. 电脑连接手机热点
3. 访问 https://pulseopti-hr.vercel.app

如果可以访问，说明是本地 ISP 的问题。

#### 方案 B：使用 VPN（成功率 70%）

1. 连接 VPN（推荐使用免费 VPN，如 ProtonVPN）
2. 访问 https://pulseopti-hr.vercel.app

#### 方案 C：刷新 DNS

在 CMD 中执行：

```cmd
ipconfig /flushdns
```

然后重新访问。

#### 方案 D：禁用 IPv6

1. 打开"网络连接"
2. 右键当前网络连接，选择"属性"
3. 取消勾选"Internet 协议版本 6 (TCP/IPv6)"
4. 点击"确定"
5. 重启浏览器，重新访问

#### 方案 E：使用本地开发环境作为临时方案

如果外网暂时无法访问，可以先在本地运行：

```cmd
cd C:\PulseOpti-HR\PulseOpti-HR
pnpm dev
```

然后访问：http://localhost:3000

---

### 问题 4：Vercel 构建失败

**症状**：
- 部署时显示构建错误
- 部署日志中有红色错误信息

**解决方案**：

**查看详细错误**：
```cmd
vercel logs --prod --follow
```

**本地测试构建**：
```cmd
cd C:\PulseOpti-HR\PulseOpti-HR
pnpm run build
```

如果本地构建失败，修复错误后再部署。

**强制重新部署**：
```cmd
vercel --prod --force
```

---

### 问题 5：数据库连接失败

**症状**：
- 部署成功但访问时报错 "Database connection failed"
- 或 "Error: connect ETIMEDOUT"

**解决方案**：

**测试数据库连接**：
```cmd
psql "postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require" -c "SELECT version();"
```

如果连接失败，检查：
1. DATABASE_URL 是否正确
2. 网络是否可以访问 Neon 数据库
3. Neon 账号是否正常

**重新运行数据库迁移**：
```cmd
pnpm drizzle-kit push
```

---

## 📊 完整诊断流程

### 步骤 1：检查 Vercel 部署

```cmd
vercel ls --prod
```

如果显示部署信息 ✅，继续步骤 2；否则，执行：
```cmd
vercel --prod
```

### 步骤 2：检查环境变量

```cmd
vercel env ls --environment=production
```

如果显示 5 个环境变量 ✅，继续步骤 3；否则，重新添加环境变量（参考问题 2）。

### 步骤 3：检查部署日志

```cmd
vercel logs --prod
```

查看是否有错误信息。

### 步骤 4：测试外网访问

打开浏览器访问：https://pulseopti-hr.vercel.app

- 如果可以访问 ✅，问题解决！
- 如果显示连接超时 ⚠️，尝试方案 A-E（参考问题 3）

### 步骤 5：使用网络诊断工具

访问以下网站检查 Vercel 服务状态：
- https://status.vercel.com
- https://downforeveryoneorjustme.com/pulseopti-hr.vercel.app

---

## 🔧 一键诊断脚本

创建一个诊断脚本 `diagnose-vercel.cmd`：

```cmd
@echo off
chcp 65001 >nul

echo ========================================
echo   Vercel 诊断工具
echo ========================================
echo.

echo [1/5] 检查 Vercel CLI...
vercel --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Vercel CLI 已安装
) else (
    echo ❌ Vercel CLI 未安装
    pause
    exit /b 1
)
echo.

echo [2/5] 检查部署状态...
vercel ls --prod
echo.

echo [3/5] 检查环境变量...
vercel env ls --environment=production
echo.

echo [4/5] 检查最近部署日志...
vercel logs --prod -n 10
echo.

echo [5/5] 测试外网访问...
echo 正在测试 https://pulseopti-hr.vercel.app ...
curl -I --max-time 10 https://pulseopti-hr.vercel.app
echo.

echo ========================================
echo   诊断完成
echo ========================================
echo.

pause
```

执行：
```cmd
diagnose-vercel.cmd
```

---

## 🆘 获取更多帮助

### Vercel 官方支持
- Vercel Dashboard: https://vercel.com/dashboard
- Vercel 文档: https://vercel.com/docs
- Vercel 状态: https://status.vercel.com

### 联系支持
- **邮箱**: PulseOptiHR@163.com
- **地址**: 广州市天河区

---

## 📝 问题排查检查清单

- [ ] Vercel 部署成功（`vercel ls --prod` 显示部署信息）
- [ ] 所有环境变量已配置（5 个变量）
- [ ] 本地构建测试通过（`pnpm run build`）
- [ ] 部署日志无错误
- [ ] 数据库连接正常
- [ ] 外网可以访问（或使用手机热点/VPN 测试）

---

**按照以上步骤逐一排查，应该可以找到并解决外网访问问题！** 🚀
