# 外网访问问题 - 解决方案

## 🎯 一键启动（推荐）

双击运行 **`QUICK_START.bat`**，根据提示选择适合你的场景！

---

## 📊 方案总览

| 方案 | 耗时 | 难度 | 稳定性 | 推荐场景 |
|------|------|------|--------|----------|
| **本地环境** | 1分钟 | ⭐ | ⭐⭐⭐⭐⭐ | 日常开发（强烈推荐） |
| **LocalTunnel** | 2分钟 | ⭐ | ⭐⭐⭐ | 快速演示 |
| **修复网络** | 10分钟 | ⭐⭐⭐ | ⭐⭐⭐ | 生产环境 |

---

## 🚀 快速使用

### 方案1：本地开发环境（⭐⭐⭐强烈推荐）

**适用场景**：日常开发、仅自己使用

**优点**：
- ✅ 无需外网连接
- ✅ 速度最快（< 50ms）
- ✅ 支持热更新（HMR）
- ✅ 开发体验最佳
- ✅ 完全本地运行，安全可靠

**操作步骤**：

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

#### Step 2：启动本地环境
双击运行：
```batch
start-local-env.bat
```

#### Step 3：访问系统
在浏览器打开：http://localhost:5000

**开发体验**：
- ✅ 修改代码自动热更新
- ✅ TypeScript实时检查
- ✅ 调试工具完整
- ✅ 本地数据库连接

---

### 方案2：LocalTunnel（需要分享）

**适用场景**：需要快速分享给他人看演示

**优点**：
- ✅ 无需注册账户
- ✅ 2分钟启动
- ✅ 自动HTTPS

**操作**：
双击运行：
```batch
start-localtunnel.bat
```

**获取公网URL**：脚本会显示 `https://xxx.loca.lt`

**适合场景**：
- 快速演示给客户
- 临时分享给同事
- 远程协助

---

### 方案3：修复网络（生产环境）

**适用场景**：必须访问 https://pulseopti-hr.vercel.app

**自动修复**：
```batch
fix-network-issues.bat
```

选择 `0` 执行全部修复，包括：
- 刷新DNS
- 清除代理
- 更换DNS服务器
- 禁用IPv6

**其他方案**：
- 使用手机热点
- 使用VPN（ExpressVPN, NordVPN）

---

## 🔍 诊断工具

**运行诊断**：
```batch
diagnose-network.bat
```

**诊断内容**：
- 本地服务状态（端口5000）
- DNS解析
- 生产环境连接
- IPv6状态
- 代理设置
- 外网连接

---

## 📖 详细文档

完整解决方案请查看：**`NETWORK_SOLUTIONS.md`**

内容包括：
- 详细操作步骤
- 常见问题（FAQ）
- 性能对比
- 使用场景推荐
- 技术支持

---

## 💡 推荐决策

```
日常开发？
├─ 是 → 使用本地环境（http://localhost:5000）⭐⭐⭐⭐⭐

需要分享给他人？
├─ 临时演示 → 使用LocalTunnel（自动生成公网URL）
└─ 长期分享 → 考虑部署到Vercel或使用CDN

必须访问生产环境？
└─ 修复网络 或 使用手机热点/VPN
```

---

## 📝 系统信息

- **生产环境**：https://pulseopti-hr.vercel.app
- **本地端口**：5000
- **技术栈**：Next.js 16 + React 19 + PostgreSQL
- **页面数量**：144
- **API数量**：78

---

## 🆘 遇到问题？

### 本地环境启动失败？
1. 检查端口5000是否被占用：`netstat -ano | find ":5000"`
2. 检查Node.js是否安装：`node --version`
3. 检查依赖是否安装：`pnpm install`
4. 检查环境变量配置：查看 `.env.local`

### 数据库连接失败？
1. 确认Neon数据库URL格式正确
2. 检查网络是否允许访问Neon
3. 运行数据库迁移：`npx drizzle-kit push`

### LocalTunnel连接不稳定？
这是正常现象（免费服务），如需稳定连接，建议使用本地环境。

---

## 🎉 快速开始

**现在就双击 `QUICK_START.bat` 开始使用！**

---

## 📁 工具文件

| 文件 | 说明 |
|------|------|
| `QUICK_START.bat` | 快速启动向导 |
| `NETWORK_SOLUTIONS.md` | 详细方案文档 |
| `NETWORK_README.md` | 快速指南（本文件） |
| `diagnose-network.bat` | 网络诊断 |
| `fix-network-issues.bat` | 网络修复 |
| `start-localtunnel.bat` | LocalTunnel启动 |
| `start-local-env.bat` | 本地环境启动 |

---

**文档结束**
