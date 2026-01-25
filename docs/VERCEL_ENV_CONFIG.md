# Vercel 环境变量配置指南

## 🎯 目的
确保 Vercel 生产环境正常运行，必须配置关键环境变量。

---

## 📋 必需的环境变量

### 1. DATABASE_URL（必需）
PostgreSQL 数据库连接字符串。

**格式**：
```
postgresql://username:password@host:port/database?sslmode=require
```

**示例**：
```
postgresql://postgres:abc123@ep-cool-xxx.aws.neon.tech/neondb?sslmode=require
```

**获取方式**：
- **Neon**: https://console.neon.tech/dashboard → 选择项目 → Connection Details
- **Supabase**: https://supabase.com/dashboard → Settings → Database
- **自建 PostgreSQL**: 使用实际的连接字符串

### 2. JWT_SECRET（必需）
JWT token 加密密钥。

**格式**：随机字符串，至少32个字符

**示例**：
```
your-super-secret-jwt-key-change-this-in-production-123
```

**生成方式**：
```cmd
# 方法1: 使用 PowerShell
Write-Output (New-Guid).Guid | clip

# 方法2: 使用在线生成器
https://www.uuidgenerator.net/

# 方法3: 手动输入（至少32位）
随便输入一串复杂的字符
```

---

## 🔧 配置步骤（Vercel 控制台）

### 步骤 1：访问 Vercel 控制台

1. 打开浏览器
2. 访问：https://vercel.com/dashboard
3. 登录你的账号

### 步骤 2：进入项目设置

1. 找到 `pulseopti-hr` 项目
2. 点击项目名称进入
3. 点击顶部菜单的 **Settings** 标签

### 步骤 3：配置环境变量

1. 在左侧菜单找到 **Environment Variables**
2. 点击 **Add New** 按钮

### 步骤 4：添加 DATABASE_URL

- **Key**: `DATABASE_URL`
- **Value**: 你的 PostgreSQL 连接字符串
- **Environment**: 勾选所有选项（Production, Preview, Development）
- 点击 **Save**

**示例**：
```
Key: DATABASE_URL
Value: postgresql://postgres:abc123@ep-cool-xxx.aws.neon.tech/neondb?sslmode=require
Environments: ☑ Production  ☑ Preview  ☑ Development
```

### 步骤 5：添加 JWT_SECRET

- 点击 **Add New**
- **Key**: `JWT_SECRET`
- **Value**: 你的 JWT 密钥（随机字符串）
- **Environment**: 勾选所有选项
- 点击 **Save**

**示例**：
```
Key: JWT_SECRET
Value: your-super-secret-jwt-key-change-this-in-production-123
Environments: ☑ Production  ☑ Preview  ☑ Development
```

### 步骤 6：添加其他可选变量（根据需要）

如果需要其他功能，可以添加：

**邮件服务（可选）**：
```
ENABLE_EMAIL_SERVICE=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**对象存储（可选）**：
```
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_REGION=us-east-1
S3_BUCKET=your-bucket-name
```

---

## 🚀 重新部署

配置完环境变量后，必须重新部署才能生效。

### 方法 1：通过控制台重新部署

1. 访问：https://vercel.com/dashboard
2. 进入 `pulseopti-hr` 项目
3. 点击 **Deployments** 标签
4. 找到最新的部署
5. 点击右侧的 **...** 菜单
6. 选择 **Redeploy**
7. 点击 **Redeploy** 确认

### 方法 2：通过命令行重新部署

```cmd
cd C:\PulseOpti-HR\PulseOpti-HR
vercel --prod
```

---

## ✅ 验证部署

### 1. 访问应用

打开浏览器，访问：
```
https://pulseopti-hr.vercel.app
```

### 2. 测试登录

访问登录页面：
```
https://pulseopti-hr.vercel.app/login
```

### 3. 检查 API

使用 curl 测试 API：

```cmd
curl https://pulseopti-hr.vercel.app/api/auth/login -X POST -H "Content-Type: application/json" -d "{\"account\":\"test@test.com\",\"password\":\"test123\"}"
```

预期返回：
```json
{
  "error": "账号或密码错误"
}
```
（这是正常的，说明 API 正常工作）

---

## 🐛 故障排查

### 问题 1：访问显示 500 错误

**原因**：环境变量未配置或数据库连接失败

**解决**：
1. 检查环境变量是否已配置
2. 检查 DATABASE_URL 是否正确
3. 查看 Vercel 部署日志：Deployments → 点击部署 → Logs

### 问题 2：无法连接数据库

**原因**：数据库 URL 错误或数据库不可达

**解决**：
1. 验证 DATABASE_URL 格式是否正确
2. 确保数据库允许 Vercel 的 IP 访问
3. 检查数据库是否正在运行

### 问题 3：登录失败

**原因**：JWT_SECRET 未配置或数据库中无用户

**解决**：
1. 配置 JWT_SECRET
2. 运行数据库迁移：`vercel exec -- npx drizzle-kit push`
3. 创建管理员账号

---

## 📊 快速检查清单

在访问应用前，确保：

- [ ] DATABASE_URL 已配置并正确
- [ ] JWT_SECRET 已配置（至少32位）
- [ ] 已重新部署
- [ ] 数据库迁移已完成
- [ ] 可以访问应用首页

---

## 🎯 下一步

配置完成后：

1. **测试访问**：确保应用能正常访问
2. **运行数据库迁移**：创建数据表
3. **创建管理员账号**：用于首次登录
4. **设置自定义域名**（可选）

---

## 📚 相关文档

- **Vercel 官方文档**: https://vercel.com/docs/environment-variables
- **Neon 数据库文档**: https://neon.tech/docs
- **项目完整文档**: docs/ 目录

---

**更新时间**: 2025-01-18
