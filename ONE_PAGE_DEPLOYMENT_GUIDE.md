# 超管端部署 - 一页纸快速指南

## 🎯 目标
部署超管端到 https://admin.aizhixuan.com.cn，实现前端与超管端实时数据同步

## ⚡ 快速部署（推荐）

### 使用自动化脚本
```cmd
# Windows CMD
deploy-admin-to-vercel.bat

# Windows PowerShell
.\deploy-admin-to-vercel.ps1
```

脚本会自动完成所有配置，包括：
- ✅ 检查 Vercel CLI
- ✅ 登录 Vercel
- ✅ 获取前端数据库连接
- ✅ 部署超管端
- ✅ 配置所有环境变量
- ✅ 添加自定义域名

---

## 📝 手动部署（10步）

### 步骤 1：安装工具
```bash
pnpm add -g vercel
```

### 步骤 2：登录
```bash
vercel login
```

### 步骤 3：获取数据库连接
```bash
vercel env pull .env.local
cat .env.local | grep DATABASE_URL
# 复制完整的 DATABASE_URL
```

### 步骤 4：部署超管端
```bash
vercel --prod --yes --name pulseopti-hr-admin
```

### 步骤 5：配置环境变量
```bash
# 关键：DATABASE_URL 必须与前端相同
vercel env add DATABASE_URL production
# 粘贴步骤 3 复制的 DATABASE_URL

# 其他配置
echo super_admin_jwt_secret_key_change_in_production | vercel env add JWT_SECRET production
echo https://admin.aizhixuan.com.cn | vercel env add NEXT_PUBLIC_APP_URL production
echo https://admin.aizhixuan.com.cn | vercel env add NEXT_PUBLIC_API_URL production
echo production | vercel env add NODE_ENV production
echo 208343256@qq.com | vercel env add SUPER_ADMIN_EMAIL production
echo admin123 | vercel env add SUPER_ADMIN_PASSWORD production
echo true | vercel env add ADMIN_MODE production
```

### 步骤 6：添加域名
```bash
vercel domains add admin.aizhixuan.com.cn
```

### 步骤 7：配置 DNS
在域名注册商（腾讯云/阿里云）添加：

| 类型 | 主机记录 | 记录值 |
|------|---------|--------|
| CNAME | admin | cname.vercel-dns.com |

### 步骤 8：等待 DNS 生效
```bash
# 5-10 分钟后检查
dig admin.aizhixuan.com.cn
```

### 步骤 9：重新部署
```bash
vercel --prod
```

### 步骤 10：创建管理员账号
访问：https://admin.aizhixuan.com.cn/register

填写：
- 邮箱：208343256@qq.com
- 密码：admin123
- 姓名：超级管理员

---

## 🔑 关键信息

### 访问地址
- **超管端**：https://admin.aizhixuan.com.cn
- **前端**：https://www.aizhixuan.com.cn

### 管理员账号
- 邮箱：208343256@qq.com
- 密码：admin123

### 环境变量（必填）
```bash
DATABASE_URL=<与前端完全相同>
JWT_SECRET=super_admin_jwt_secret_key_change_in_production
NEXT_PUBLIC_APP_URL=https://admin.aizhixuan.com.cn
NEXT_PUBLIC_API_URL=https://admin.aizhixuan.com.cn
NODE_ENV=production
SUPER_ADMIN_EMAIL=208343256@qq.com
SUPER_ADMIN_PASSWORD=admin123
ADMIN_MODE=true
```

---

## ✅ 验证部署

### 1. 访问测试
打开浏览器访问：https://admin.aizhixuan.com.cn

### 2. 创建管理员
访问：https://admin.aizhixuan.com.cn/register

### 3. 测试数据同步
```bash
# 运行验证脚本
verify-data-sync.bat
```

或手动测试：
1. 在前端注册用户：https://www.aizhixuan.com.cn/register
2. 在超管端查看：https://admin.aizhixuan.com.cn/admin/users
3. 确认能看到刚注册的用户

---

## 📊 架构说明

```
前端 (www.aizhixuan.com.cn)
    ↓
共享数据库 (PostgreSQL on Neon)
    ↓
超管端 (admin.aizhixuan.com.cn)
```

**关键**：
- 前端和超管端使用同一个 DATABASE_URL
- 数据天然实时同步
- 通过 JWT token 实现权限隔离

---

## 🔧 常用命令

```bash
# 查看日志
vercel logs --follow

# 重新部署
vercel --prod

# 查看环境变量
vercel env ls production

# 查看部署列表
vercel ls
```

---

## ❓ 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 访问 404 | DNS 未生效 | 等待 5-10 分钟 |
| 登录失败 | 环境变量错误 | 检查 DATABASE_URL 和 JWT_SECRET |
| 数据不同步 | DATABASE_URL 不一致 | 确保两个项目使用相同的 DATABASE_URL |
| SSL 错误 | 证书未生效 | 等待 5-10 分钟 |

---

## 📞 获取帮助

- **详细文档**：REALTIME_DATA_SYNC_DETAILED_STEPS.md
- **快速开始**：QUICKSTART_ADMIN_DEPLOY.md
- **部署总结**：ADMIN_DEPLOYMENT_SUMMARY.md
- **GitHub**：https://github.com/tomato-writer-2024/PulseOpti-HR

---

## ✅ 部署清单

部署完成后，请确认：

- [ ] 超管端可以访问
- [ ] 管理员账号创建成功
- [ ] 可以登录超管端
- [ ] 前端注册的用户可以在超管端看到
- [ ] DATABASE_URL 与前端相同
- [ ] DNS 配置正确
- [ ] SSL 证书正常

---

**文档版本**：v1.0.0
**更新时间**：2024-12-19
**作者**：PulseOpti HR 团队
