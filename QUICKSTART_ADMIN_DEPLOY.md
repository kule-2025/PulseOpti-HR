# 超管端部署快速开始指南

## 🚀 5分钟快速部署

### 前提条件
- ✅ 已安装 Node.js 18+
- ✅ 已安装 pnpm
- ✅ 拥有 Vercel 账号
- ✅ 已部署前端应用到 Vercel

### 方式 1：使用自动化脚本（推荐）

#### Windows CMD 用户
```cmd
deploy-admin-to-vercel.bat
```

#### Windows PowerShell 用户
```powershell
.\deploy-admin-to-vercel.ps1
```

脚本将自动完成以下操作：
1. 检查 Vercel CLI 安装状态
2. 登录 Vercel 账号
3. 获取前端 DATABASE_URL
4. 部署超管端到 Vercel
5. 配置所有环境变量
6. 添加自定义域名
7. 重新部署
8. 提供后续操作指引

---

### 方式 2：手动部署

#### 步骤 1：安装 Vercel CLI
```bash
pnpm add -g vercel
```

#### 步骤 2：登录 Vercel
```bash
vercel login
```

#### 步骤 3：部署超管端
```bash
vercel --prod --yes --name pulseopti-hr-admin
```

#### 步骤 4：配置环境变量
```bash
# 从前端复制 DATABASE_URL
vercel env add DATABASE_URL production
# 输入前端的 DATABASE_URL

# 配置其他环境变量
echo super_admin_jwt_secret_key_change_in_production | vercel env add JWT_SECRET production
echo https://admin.aizhixuan.com.cn | vercel env add NEXT_PUBLIC_APP_URL production
echo https://admin.aizhixuan.com.cn | vercel env add NEXT_PUBLIC_API_URL production
echo production | vercel env add NODE_ENV production
echo 208343256@qq.com | vercel env add SUPER_ADMIN_EMAIL production
echo admin123 | vercel env add SUPER_ADMIN_PASSWORD production
echo true | vercel env add ADMIN_MODE production
```

#### 步骤 5：添加自定义域名
```bash
vercel domains add admin.aizhixuan.com.cn
```

#### 步骤 6：配置 DNS
在域名注册商（腾讯云/阿里云）添加 DNS 记录：

| 类型 | 主机记录 | 记录值 |
|------|---------|--------|
| CNAME | admin | cname.vercel-dns.com |

#### 步骤 7：重新部署
```bash
vercel --prod
```

---

## ✅ 验证部署

### 1. 访问超管端
打开浏览器访问：https://admin.aizhixuan.com.cn

### 2. 创建超级管理员账号
访问注册页面：https://admin.aizhixuan.com.cn/register

填写信息：
- 邮箱：208343256@qq.com
- 密码：admin123
- 姓名：超级管理员

### 3. 测试数据同步
```bash
# 运行验证脚本
verify-data-sync.bat
```

或手动测试：
1. 在前端注册新用户：https://www.aizhixuan.com.cn/register
2. 在超管端查看：https://admin.aizhixuan.com.cn/admin/users
3. 如果能看到刚注册的用户，说明数据同步正常

---

## 🔑 关键信息

### 访问地址
- **超管端登录页**：https://admin.aizhixuan.com.cn/login
- **超管端首页**：https://admin.aizhixuan.com.cn
- **前端登录页**：https://www.aizhixuan.com.cn/login

### 管理员账号
- **邮箱**：208343256@qq.com
- **密码**：admin123

### 环境变量
| 变量名 | 值 |
|--------|-----|
| DATABASE_URL | 与前端完全相同（关键！） |
| JWT_SECRET | super_admin_jwt_secret_key_change_in_production |
| NEXT_PUBLIC_APP_URL | https://admin.aizhixuan.com.cn |
| NEXT_PUBLIC_API_URL | https://admin.aizhixuan.com.cn |
| NODE_ENV | production |
| SUPER_ADMIN_EMAIL | 208343256@qq.com |
| SUPER_ADMIN_PASSWORD | admin123 |
| ADMIN_MODE | true |

---

## 📊 数据同步架构

```
前端应用 (www.aizhixuan.com.cn)
    ↓
共享数据库 (PostgreSQL on Neon)
    ↓
超管端应用 (admin.aizhixuan.com.cn)
```

**关键点**：
- 前端和超管端使用同一个 DATABASE_URL
- 数据天然实时同步，无需额外同步机制
- 通过 JWT token 实现权限隔离

---

## 🔧 常用命令

### 查看部署日志
```bash
vercel logs --follow
```

### 重新部署
```bash
vercel --prod
```

### 管理环境变量
```bash
# 查看所有环境变量
vercel env ls production

# 添加环境变量
vercel env add VARIABLE_NAME production

# 删除环境变量
vercel env rm VARIABLE_NAME production
```

### 管理域名
```bash
# 查看域名
vercel domains ls

# 添加域名
vercel domains add your-domain.com
```

---

## ❓ 常见问题

### Q1：超管端访问 404
**原因**：DNS 配置未生效
**解决**：
1. 等待 5-10 分钟让 DNS 生效
2. 检查 DNS 配置是否正确
3. 重新部署：`vercel --prod`

### Q2：超管端登录失败
**原因**：环境变量配置错误
**解决**：
1. 检查 DATABASE_URL 是否与前端相同
2. 检查 JWT_SECRET 是否配置
3. 查看日志：`vercel logs --follow`

### Q3：数据不同步
**原因**：DATABASE_URL 不一致
**解决**：
1. 查看前端 DATABASE_URL
2. 确保超管端使用相同的 DATABASE_URL
3. 重新部署：`vercel --prod`

### Q4：SSL 证书错误
**原因**：SSL 证书未生效
**解决**：
1. 等待 5-10 分钟让 Vercel 自动配置 SSL
2. 确保 DNS 配置正确
3. 访问 https://vercel.com/dashboard 查看 SSL 状态

---

## 📞 获取帮助

- **详细文档**：REALTIME_DATA_SYNC_DETAILED_STEPS.md
- **故障排查**：TROUBLESHOOT_EXTERNAL_ACCESS.md
- **GitHub 仓库**：https://github.com/tomato-writer-2024/PulseOpti-HR

---

## 📝 部署清单

部署完成后，请逐一确认：

- [ ] 超管端可以访问（https://admin.aizhixuan.com.cn）
- [ ] 超管端登录页面正常显示
- [ ] 超级管理员账号创建成功
- [ ] 可以登录超管端
- [ ] 前端注册的用户可以在超管端看到
- [ ] DATABASE_URL 与前端相同
- [ ] DNS 配置正确
- [ ] SSL 证书正常
- [ ] 所有 API 正常工作

---

**最后更新时间**：2024-12-19
**文档版本**：v1.0.0
**作者**：PulseOpti HR 团队
