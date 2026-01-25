# 快速部署检查清单

> 最简化的部署检查清单，确保核心功能正常运行

---

## 📋 部署前准备

### 1. 账号和工具

- [ ] GitHub 账号：https://github.com/tomato-writer-2024/PulseOpti-HR
- [ ] Vercel 账号：https://vercel.com
- [ ] Neon 账号：https://neon.tech
- [ ] Node.js 已安装（18.x 或更高）
- [ ] pnpm 已安装
- [ ] Git 已安装

### 2. 连接信息

- [ ] Neon 连接字符串：
  ```
  postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
  ```

---

## 🚀 部署步骤

### 步骤 1：克隆项目

```cmd
cd C:\Projects
git clone https://github.com/tomato-writer-2024/PulseOpti-HR.git
cd PulseOpti-HR
```

- [ ] 项目克隆成功
- [ ] `dir` 命令显示项目文件

### 步骤 2：安装依赖

```cmd
pnpm install
```

- [ ] 依赖安装成功
- [ ] `node_modules` 目录存在

### 步骤 3：本地测试构建

```cmd
pnpm run build
```

- [ ] 构建成功，无错误
- [ ] 显示 `✓ Compiled successfully`

### 步骤 4：登录 Vercel

```cmd
vercel login
```

- [ ] Vercel 登录成功
- [ ] GitHub 账号已连接

### 步骤 5：部署到 Vercel

```cmd
vercel
```

- [ ] 项目部署成功
- [ ] 获得 Vercel URL：https://pulseopti-hr.vercel.app
- [ ] 部署状态为 Ready

### 步骤 6：配置环境变量

```cmd
REM 添加 DATABASE_URL
vercel env add DATABASE_URL production

REM 添加 JWT_SECRET
vercel env add JWT_SECRET production

REM 添加其他环境变量
vercel env add JWT_EXPIRES_IN production
vercel env add NODE_ENV production
vercel env add NEXT_PUBLIC_APP_URL production
```

- [ ] 所有环境变量已添加
- [ ] `vercel env ls` 显示正确

### 步骤 7：运行数据库迁移

```cmd
REM 设置环境变量
set DATABASE_URL=postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

REM 运行迁移
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

- [ ] 迁移成功执行
- [ ] 59 个表已创建

### 步骤 8：重新部署

```cmd
vercel --prod
```

- [ ] 重新部署成功
- [ ] 部署状态为 Ready

---

## ✅ 验证检查

### 1. 应用访问

- [ ] 访问 https://pulseopti-hr.vercel.app 成功
- [ ] 首页显示 **PulseOpti HR 脉策聚效**
- [ ] 页面加载正常（< 3 秒）

### 2. API 测试

#### 健康检查
```cmd
curl https://pulseopti-hr.vercel.app/api/health
```
- [ ] 返回 200 状态码
- [ ] 返回 JSON 格式响应

#### 用户注册
```cmd
curl -X POST https://pulseopti-hr.vercel.app/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"test\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
```
- [ ] 返回用户信息和 token

### 3. 数据库验证

访问 https://console.neon.tech 打开 SQL Editor，执行：

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

- [ ] 显示 59 个表
- [ ] 无错误信息

### 4. 功能验证

- [ ] 登录页面可访问：https://pulseopti-hr.vercel.app/login
- [ ] 功能介绍可访问：https://pulseopti-hr.vercel.app/features
- [ ] 定价页面可访问：https://pulseopti-hr.vercel.app/pricing
- [ ] 联系我们可访问：https://pulseopti-hr.vercel.app/contact
- [ ] 微信二维码显示正常
- [ ] 页脚信息正确

---

## 📊 性能检查

### 1. 页面性能

- [ ] 首页加载时间 < 3 秒
- [ ] API 响应时间 < 500ms
- [ ] 无 JavaScript 错误

### 2. 日志检查

```cmd
vercel logs --prod
```

- [ ] 无严重错误
- [ ] 无数据库连接错误
- [ ] 无超时错误

---

## 🎯 最终确认

- [ ] 所有关键检查项已通过
- [ ] 应用可正常使用
- [ ] 数据库连接正常
- [ ] API 功能正常
- [ ] 部署文档已更新

---

## 🔗 快速链接

- **GitHub 仓库**：https://github.com/tomato-writer-2024/PulseOpti-HR
- **Vercel Dashboard**：https://vercel.com/dashboard
- **Neon 控制台**：https://console.neon.tech
- **生产环境**：https://pulseopti-hr.vercel.app

---

## 📝 常见问题速查

### 问题：构建失败

**解决**：
```cmd
REM 重新安装依赖
rmdir /s /q node_modules
pnpm install
pnpm run build
```

### 问题：数据库连接失败

**解决**：
1. 检查 `DATABASE_URL` 环境变量
2. 验证 Neon 项目未暂停
3. 测试连接：`psql "连接字符串" -c "SELECT version();"`

### 问题：环境变量未生效

**解决**：
```cmd
REM 重新拉取环境变量
vercel env pull .env.local
vercel --prod
```

---

**祝你部署成功！🚀**

如有问题，请参考详细文档：
- [完整部署指南](./DEPLOYMENT_GUIDE.md)
- [CMD 操作步骤](./QUICK_DEPLOYMENT_CMD.md)
- [Neon 数据库配置](./NEON_DATABASE_SETUP.md)
- [部署验证清单](./DEPLOYMENT_CHECKLIST.md)
