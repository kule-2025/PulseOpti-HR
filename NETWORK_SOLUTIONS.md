# PulseOpti HR - 网络访问解决方案

> 最后更新：2025年6月17日
> 版本：v3.0（移除ngrok，专注本地开发）

## 问题诊断

**症状**：无法访问 https://pulseopti-hr.vercel.app
**原因**：本地网络或ISP层面对Vercel的访问限制
**状态**：生产环境已成功部署（144个页面、78个API），代码已同步

---

## 解决方案对比

| 方案 | 优点 | 缺点 | 适合场景 | 推荐度 |
|------|------|------|----------|--------|
| **方案1：本地环境** | 无需外网、速度快、热更新 | 仅限本机访问 | 日常开发 | ⭐⭐⭐⭐⭐ |
| **方案2：LocalTunnel** | 无需注册、2分钟启动、HTTPS | 可能不稳定 | 快速演示、临时分享 | ⭐⭐⭐⭐ |
| **方案3：修复网络** | 可访问生产环境 | 需要时间、不一定成功 | 生产环境访问 | ⭐⭐⭐ |

---

## 方案1：本地开发环境（⭐⭐⭐⭐⭐强烈推荐）

### 特点
- ✅ 完全本地运行，无需外网
- ✅ 支持热更新（HMR）
- ✅ 开发体验最佳
- ✅ 速度最快（响应时间 < 50ms）
- ✅ 完全本地运行，安全可靠

### 操作步骤

#### Step 1：配置环境变量
编辑 `.env.local` 文件（如不存在会自动创建）：

```env
# 数据库连接（必须配置）
DATABASE_URL=postgresql://user:password@your-neon-host/neondb?sslmode=require

# JWT配置
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# 应用配置
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:5000
```

**获取数据库URL**：
- 登录 Neon 控制台：https://console.neon.tech/
- 创建或选择数据库项目
- 复制 Connection String

#### Step 2：启动本地环境
双击运行：
```batch
start-local-env.bat
```

#### Step 3：访问系统
在浏览器打开：http://localhost:5000

### 开发体验
- ✅ 修改代码自动热更新
- ✅ TypeScript实时检查
- ✅ 调试工具完整
- ✅ 本地数据库连接

### 常见问题

**Q1: 端口5000被占用？**
```batch
# 查找占用进程
netstat -ano | find ":5000"

# 结束进程
taskkill /F /PID <进程ID>
```

**Q2: 依赖安装失败？**
```batch
# 清理缓存重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Q3: 环境变量不生效？**
- 确保 `.env.local` 文件在项目根目录
- 重启开发服务器
- 检查文件编码为UTF-8（无BOM）

---

## 方案2：LocalTunnel（快速演示）

### 特点
- ✅ 无需注册账户
- ✅ 自动生成HTTPS公网URL
- ✅ 2分钟内完成配置
- ✅ 支持Windows/Linux/Mac

### 操作步骤

#### Step 1：运行诊断
```batch
diagnose-network.bat
```

#### Step 2：启动LocalTunnel
```batch
start-localtunnel.bat
```

#### Step 3：获取公网地址
脚本会自动显示公网URL，类似：
```
your url is: https://pulseopti-hr.loca.lt
```

#### Step 4：访问系统
在浏览器中打开生成的URL即可访问完整系统

### 注意事项
- 首次运行会自动安装localtunnel（需要1-2分钟）
- 如果提示域名冲突，修改脚本中的 `--subdomain` 参数
- 建议使用Chrome/Edge浏览器（支持现代特性）
- LocalTunnel是免费服务，可能存在不稳定，建议仅用于临时演示

---

## 方案3：修复网络问题（生产环境）

### 常见原因
1. DNS缓存问题
2. IPv6连接问题
3. 代理设置干扰
4. 防火墙阻止
5. ISP限制

### 操作步骤

#### 方式1：自动修复（推荐）
```batch
fix-network-issues.bat
```
选择 `0` 执行全部修复

#### 方式2：手动修复

**刷新DNS**
```batch
ipconfig /flushdns
```

**更换DNS为Google DNS**
```batch
netsh interface ip set dns "以太网" static 8.8.8.8
netsh interface ip add dns "以太网" 8.8.4.4 index=2
```

**更换DNS为114 DNS（国内）**
```batch
netsh interface ip set dns "以太网" static 114.114.114.114
netsh interface ip add dns "以太网" 114.114.114.115 index=2
```

**禁用IPv6**
```batch
powershell -Command "Disable-NetAdapterBinding -Name '*' -ComponentID ms_tcpip6"
```

**清除代理**
```batch
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyEnable /t REG_DWORD /d 0 /f
```

#### 方式3：使用手机热点
1. 开启手机热点
2. 电脑连接热点
3. 尝试访问 https://pulseopti-hr.vercel.app

#### 方式4：使用VPN
推荐VPN服务商：
- ExpressVPN
- NordVPN
- Surfshark

---

## 快速决策树

```
开始
  │
  ├─ 日常开发？
  │   └─ 是 → 使用本地环境（方案1）⭐⭐⭐⭐⭐
  │
  ├─ 需要分享给其他人？
  │   └─ 是 → 使用LocalTunnel（方案2）
  │
  └─ 必须访问生产环境？
      └─ 修复网络（方案3）→ 使用手机热点/VPN
```

---

## 常见问题（FAQ）

### Q1: 为什么推荐本地环境？
**A**: 
- 速度最快（< 50ms vs 生产环境 300-800ms）
- 支持热更新，开发体验最佳
- 无需外网连接，稳定可靠
- 完全本地运行，数据更安全

### Q2: 本地环境如何连接数据库？
**A**: 
使用Neon提供的PostgreSQL连接字符串，配置到 `.env.local` 文件中：
```env
DATABASE_URL=postgresql://user:password@ep-xxx.aws.neon.tech/neondb?sslmode=require
```

### Q3: LocalTunnel连接不稳定？
**A**: LocalTunnel是免费服务，稳定性有限。如需稳定连接，建议：
- 使用本地环境（方案1）进行开发
- 仅在需要临时分享时使用LocalTunnel

### Q4: 生产环境访问慢？
**A**:
1. Vercel已优化部署到香港/新加坡区域
2. 本地网络问题优先使用本地环境（方案1）
3. 考虑使用CDN加速

### Q5: 如何同步本地开发到生产环境？
**A**:
```batch
# 1. 提交代码
git add .
git commit -m "your changes"

# 2. 推送到GitHub
git push origin main

# 3. Vercel自动部署
# 访问 https://vercel.com/dashboard 查看部署状态
```

---

## 性能对比

| 方案 | 响应时间 | 稳定性 | 配置难度 | 成本 | 推荐度 |
|------|----------|--------|----------|------|--------|
| 本地环境 | < 50ms | 最高 | 简单 | 免费 | ⭐⭐⭐⭐⭐ |
| LocalTunnel | 200-500ms | 中等 | 简单 | 免费 | ⭐⭐⭐⭐ |
| 生产环境 | 300-800ms | 高 | 无需配置 | 按需付费 | ⭐⭐⭐ |

---

## 推荐使用场景

### 场景1：日常开发（强烈推荐）
**方案**：本地环境
```batch
start-local-env.bat
```
- 访问：http://localhost:5000
- 优点：速度快、热更新、稳定可靠

### 场景2：快速演示给客户
**方案**：LocalTunnel
```batch
start-localtunnel.bat
```
- 生成URL发送给客户
- 优点：无需注册、快速配置

### 场景3：生产环境部署
**方案**：修复网络 或 使用VPN
- 访问：https://pulseopti-hr.vercel.app
- 优点：完整的生产环境，自动部署

---

## 技术支持

### 获取帮助
1. 运行诊断工具：`diagnose-network.bat`
2. 查看日志：`.next/trace` 目录
3. 检查Vercel部署日志：https://vercel.com/dashboard

### 联系方式
- 邮箱：PulseOptiHR@163.com
- GitHub：https://github.com/tomato-writer-2024/PulseOpti-HR

---

## 版本历史

### v3.0 (2025-06-17)
- 移除ngrok方案
- 简化为核心3种方案
- 强化本地环境推荐
- 优化文档结构

### v2.0 (2025-06-17)
- 新增：网络诊断工具
- 新增：一键修复脚本
- 优化：方案对比表格
- 新增：快速决策树

### v1.0 (2025-06-15)
- 初始版本
- 提供4种解决方案（含ngrok）
- 基础操作指南

---

## 附录：系统信息

- **生产环境URL**：https://pulseopti-hr.vercel.app
- **本地端口**：5000
- **技术栈**：Next.js 16 + React 19 + TypeScript + PostgreSQL
- **页面数量**：144个
- **API数量**：78个
- **数据库表**：59个

---

## 工具文件说明

| 文件 | 说明 | 用途 |
|------|------|------|
| `QUICK_START.bat` | 快速启动向导 | 一键启动，场景选择 |
| `NETWORK_SOLUTIONS.md` | 详细方案文档 | 完整操作指南（本文件） |
| `NETWORK_README.md` | 快速指南 | 简明使用说明 |
| `diagnose-network.bat` | 网络诊断 | 检查连接状态 |
| `fix-network-issues.bat` | 网络修复 | 自动修复网络问题 |
| `start-localtunnel.bat` | LocalTunnel启动 | 内网穿透工具 |
| `start-local-env.bat` | 本地环境启动 | 开发环境启动 |

---

**文档结束**
