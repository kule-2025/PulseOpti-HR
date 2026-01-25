# PulseOpti HR - Vercel 部署快速修复指南

## 🚨 快速修复步骤

### 问题 1：部署失败 - 环境变量未配置

**快速修复：**

```bash
# 1. 访问环境变量配置页面
https://vercel.com/leyou-2026/pulseopti-hr/settings/environment-variables

# 2. 添加必需的环境变量（复制以下内容）
DATABASE_URL=postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=a915ab35-9534-43ad-b925-d9102c5007ba-PulseOpti-HR-JWT-Secret-Key-2025-01-19-PROD
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_APP_URL=https://www.aizhixuan.com.cn
NODE_ENV=production
ADMIN_EMAIL=208343256@qq.com
ADMIN_PASSWORD=admin123
ADMIN_INIT_KEY=pulseopti-init-2025
COZE_WORKLOAD_IDENTITY_API_KEY=a915ab35-9534-43ad-b925-d9102c5007ba

# 3. 保存环境变量后，手动触发重新部署
# 访问：https://vercel.com/leyou-2026/pulseopti-hr/deployments
# 找到最新部署 → 点击 "..." → "Redeploy"
```

---

### 问题 2：登录失败 - JWT 配置错误

**快速修复：**

```bash
# 1. 确认 JWT_SECRET 已配置
# 访问：https://vercel.com/leyou-2026/pulseopti-hr/settings/environment-variables

# 2. 检查以下环境变量
JWT_SECRET=a915ab35-9534-43ad-b925-d9102c5007ba-PulseOpti-HR-JWT-Secret-Key-2025-01-19-PROD
JWT_EXPIRES_IN=7d

# 3. 保存后重新部署

# 4. 清除浏览器 Cookie 并重新登录
```

---

### 问题 3：数据库连接失败

**快速修复：**

```bash
# 1. 检查 DATABASE_URL 是否正确配置
# 访问：https://vercel.com/leyou-2026/pulseopti-hr/settings/environment-variables

# 2. 确认 DATABASE_URL 格式
DATABASE_URL=postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

# 3. 测试数据库连接（在 Vercel CLI 中）
vercel env pull .env.local
psql $DATABASE_URL -c "SELECT 1;"

# 4. 如果数据库连接失败，检查 Neon 数据库状态
# 访问：https://console.neon.tech

# 5. 重启数据库实例并重新部署
```

---

### 问题 4：构建超时

**快速修复：**

```bash
# 1. 访问构建配置页面
https://vercel.com/leyou-2026/pulseopti-hr/settings/general

# 2. 修改 Build Timeout 为 300 秒（5 分钟）
# Build & Development Settings → Build Timeout → 300

# 3. 保存后重新部署

# 4. 如果仍然超时，添加 vercel.json 配置
# 创建 vercel.json 文件，内容如下：

{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "buildTimeout": 300
}
```

---

### 问题 5：AI 功能无法使用

**快速修复：**

```bash
# 1. 确认 COZE_WORKLOAD_IDENTITY_API_KEY 已配置
# 访问：https://vercel.com/leyou-2026/pulseopti-hr/settings/environment-variables

# 2. 添加以下环境变量
COZE_WORKLOAD_IDENTITY_API_KEY=a915ab35-9534-43ad-b925-d9102c5007ba

# 3. 保存后重新部署

# 4. 测试 API 调用
curl -X POST https://api.coze.com/v1/chat \
  -H "Authorization: Bearer a915ab35-9534-43ad-b925-d9102c5007ba" \
  -H "Content-Type: application/json" \
  -d '{"query": "test"}'
```

---

### 问题 6：环境变量未生效

**快速修复：**

```bash
# 1. 确认环境变量已添加到 Production 环境
# 访问：https://vercel.com/leyou-2026/pulseopti-hr/settings/environment-variables
# 检查所有环境变量的 Environments 是否包含 Production

# 2. 保存环境变量（点击 Save 按钮）

# 3. 触发重新部署
# 方法 1：推送新代码
git add .
git commit -m "trigger redeploy for env vars"
git push origin main

# 方法 2：在 Vercel Dashboard 中手动重新部署
# 访问：https://vercel.com/leyou-2026/pulseopti-hr/deployments
# 找到最新部署 → 点击 "..." → "Redeploy"

# 4. 验证环境变量（访问 /api/test-env）
curl https://www.aizhixuan.com.cn/api/test-env
```

---

### 问题 7：域名无法访问

**快速修复：**

```bash
# 1. 检查 DNS 记录
# 在域名注册商处添加以下 CNAME 记录：

www.aizhixuan.com.cn → cname.vercel-dns.com
admin.aizhixuan.com.cn → cname.vercel-dns.com

# 2. 等待 DNS 传播（5-10 分钟）

# 3. 检查 DNS 解析
dig www.aizhixuan.com.cn
nslookup www.aizhixuan.com.cn

# 4. 访问 Vercel 域名检查是否正常
https://leyou-2026-pulseopti-hr.vercel.app

# 5. 检查域名配置状态
https://vercel.com/leyou-2026/pulseopti-hr/settings/domains
```

---

### 问题 8：部署成功但功能异常

**快速修复：**

```bash
# 1. 检查浏览器控制台错误
# 按 F12 打开浏览器控制台
# 查看 Console 标签的 JavaScript 错误

# 2. 检查 Vercel Function Logs
# 访问：https://vercel.com/leyou-2026/pulseopti-hr/functions

# 3. 检查 API 请求
# 在浏览器控制台的 Network 标签中查看 API 请求

# 4. 重新部署最新代码
git pull origin main
git push origin main

# 5. 清除浏览器缓存并刷新页面
```

---

## 🔧 一键修复脚本

创建一个 Shell 脚本快速修复常见问题：

```bash
#!/bin/bash
# quick-fix-vercel.sh

echo "🔧 PulseOpti HR - Vercel 部署快速修复"
echo "======================================"

# 检查 Vercel CLI 是否安装
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI 未安装，正在安装..."
    npm install -g vercel
fi

# 登录 Vercel
echo "📝 登录 Vercel..."
vercel login

# 链接项目
echo "🔗 链接项目..."
vercel link

# 拉取环境变量
echo "📥 拉取环境变量..."
vercel env pull .env.local

# 检查必需的环境变量
echo "🔍 检查环境变量..."
required_vars=(
    "DATABASE_URL"
    "JWT_SECRET"
    "JWT_EXPIRES_IN"
    "NEXT_PUBLIC_APP_URL"
    "NODE_ENV"
    "ADMIN_EMAIL"
    "ADMIN_PASSWORD"
    "ADMIN_INIT_KEY"
    "COZE_WORKLOAD_IDENTITY_API_KEY"
)

for var in "${required_vars[@]}"
do
    if [ -z "${!var}" ]
    then
        echo "❌ $var 未配置"
    else
        echo "✅ $var 已配置"
    fi
done

# 测试数据库连接
echo "🔍 测试数据库连接..."
if command -v psql &> /dev/null
then
    psql $DATABASE_URL -c "SELECT 1;" 2>/dev/null && echo "✅ 数据库连接成功" || echo "❌ 数据库连接失败"
else
    echo "⚠️  psql 未安装，跳过数据库连接测试"
fi

# 触发重新部署
echo "🚀 触发重新部署..."
vercel --prod

echo "✅ 修复完成！"
```

使用方法：

```bash
# 赋予执行权限
chmod +x quick-fix-vercel.sh

# 运行脚本
./quick-fix-vercel.sh
```

---

## 📊 故障诊断清单

在修复问题之前，请先完成以下诊断：

### 1. 检查部署状态

- [ ] 部署状态为 "Ready"（绿色）
- [ ] 最新部署成功（无错误）
- [ ] 部署时间在合理范围内（< 20 分钟）

### 2. 检查环境变量

- [ ] 所有必需的环境变量已配置
- [ ] 环境变量已保存到 Production 环境
- [ ] 环境变量值正确无误

### 3. 检查数据库连接

- [ ] DATABASE_URL 配置正确
- [ ] 数据库实例运行正常
- [ ] 数据库连接测试成功

### 4. 检查域名配置

- [ ] DNS 记录已配置
- [ ] DNS 传播完成
- [ ] HTTPS 证书已签发

### 5. 检查应用功能

- [ ] 登录功能正常
- [ ] 核心功能正常
- [ ] AI 功能正常（如已配置）

---

## 🆘 紧急联系方式

如果以上快速修复方法都无法解决问题，请：

1. **查看完整故障排查指南**：[VERCEL_DEPLOYMENT_TROUBLESHOOTING.md](./VERCEL_DEPLOYMENT_TROUBLESHOOTING.md)
2. **查看详细部署步骤**：[VERCEL_DEPLOYMENT_STEP_BY_STEP.md](./VERCEL_DEPLOYMENT_STEP_BY_STEP.md)
3. **联系 Vercel 支持**：https://vercel.com/support
4. **检查 Vercel 状态页面**：https://www.vercel-status.com/

---

## 💡 最佳实践

1. **定期检查部署状态**
2. **监控应用性能**
3. **查看错误日志**
4. **及时修复问题**
5. **备份数据库**

---

## 📚 相关文档

- [完整环境变量配置](./ALL_ENV_VARIABLES.md)
- [部署详细步骤](./VERCEL_DEPLOYMENT_STEP_BY_STEP.md)
- [故障排查指南](./VERCEL_DEPLOYMENT_TROUBLESHOOTING.md)
- [环境变量快速配置](./vercel-env-vars-copy.txt)
- [完整版本部署记录](./COMPLETE_VERSION_DEPLOYED.md)

---

**文档版本：** v1.0
**更新时间：** 2025-01-19
**项目：** PulseOpti HR 脉策聚效
