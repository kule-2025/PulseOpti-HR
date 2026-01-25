# Vercel 部署后续步骤完整指南

## 📊 当前状态

✅ **构建成功**：144 个页面 + 78 个 API 路由
✅ **部署完成**：代码已上传到 Vercel
⚠️ **待配置**：环境变量和数据库

---

## 🚀 完整后续步骤（按顺序执行）

### 步骤 1：确认部署地址

**方法 A：使用脚本**
```cmd
cd C:\PulseOpti-HR\PulseOpti-HR
verify-vercel-deployment.bat
```

**方法 B：手动查看**
1. 访问：https://vercel.com/dashboard
2. 进入 `pulseopti-hr` 项目
3. 查看顶部显示的 URL，例如：
   ```
   https://pulseopti-hr.vercel.app
   ```

---

### 步骤 2：配置环境变量（必需！）⚠️

#### 2.1 获取数据库连接字符串

**如果你使用 Neon（推荐）**：

1. 访问：https://console.neon.tech/dashboard
2. 选择你的项目
3. 点击左侧菜单的 **Connection Details**
4. 复制 **Connection string**（类似下面的格式）：
   ```
   postgresql://postgres:abc123@ep-cool-xxx.aws.neon.tech/neondb?sslmode=require
   ```

**如果没有 Neon 账号**：
1. 访问：https://neon.tech/signup
2. 注册免费账号
3. 创建新项目
4. 获取连接字符串

#### 2.2 生成 JWT 密钥

打开 PowerShell，执行：

```powershell
Write-Output (New-Guid).Guid | clip
```

生成的密钥已复制到剪贴板，类似：
```
f47ac10b-58cc-4372-a567-0e02b2c3d479
```

#### 2.3 在 Vercel 配置环境变量

1. 访问：https://vercel.com/dashboard
2. 进入 `pulseopti-hr` 项目
3. 点击 **Settings** → **Environment Variables**
4. 点击 **Add New**

**添加 DATABASE_URL**：
```
Key: DATABASE_URL
Value: postgresql://postgres:abc123@ep-cool-xxx.aws.neon.tech/neondb?sslmode=require
Environments: ☑ Production  ☑ Preview  ☑ Development
```

**添加 JWT_SECRET**：
```
Key: JWT_SECRET
Value: f47ac10b-58cc-4372-a567-0e02b2c3d479
Environments: ☑ Production  ☑ Preview  ☑ Development
```

5. 点击 **Save** 保存

---

### 步骤 3：重新部署（重要！）

配置环境变量后，必须重新部署才能生效。

**方法 A：通过 Vercel 控制台**
1. 访问：https://vercel.com/dashboard
2. 进入 `pulseopti-hr` 项目
3. 点击 **Deployments**
4. 点击最新部署右侧的 **...** 菜单
5. 选择 **Redeploy** → **Redeploy**

**方法 B：通过命令行**
```cmd
cd C:\PulseOpti-HR\PulseOpti-HR
vercel --prod
```

---

### 步骤 4：运行数据库迁移

数据库迁移会创建所有必要的数据表。

**方法 A：使用 vercel exec**
```cmd
cd C:\PulseOpti-HR\PulseOpti-HR
vercel exec -- npx drizzle-kit push
```

**方法 B：使用 Drizzle Kit**
```cmd
cd C:\PulseOpti-HR\PulseOpti-HR
pnpm drizzle-kit push --config=drizzle.config.ts
```

预期输出：
```
✓ Schema pushed to database
```

**如果遇到错误**：
- 确保 DATABASE_URL 配置正确
- 确保数据库可以访问
- 检查数据库连接字符串格式

---

### 步骤 5：验证部署

#### 5.1 测试首页访问

在浏览器中打开：
```
https://pulseopti-hr.vercel.app
```

**预期结果**：
- ✅ 能看到 PulseOpti HR 首页
- ✅ 页面加载正常
- ✅ 无 500 错误

#### 5.2 测试登录 API

使用 curl 测试：

```cmd
curl https://pulseopti-hr.vercel.app/api/auth/login -X POST -H "Content-Type: application/json" -d "{\"account\":\"test@test.com\",\"password\":\"test123\"}"
```

**预期结果**：
```json
{
  "error": "账号或密码错误"
}
```
（这是正常的，说明 API 正常工作）

**如果返回 500 错误**：
- 检查环境变量是否已配置
- 检查数据库迁移是否完成
- 查看 Vercel 日志：Deployments → 点击部署 → Logs

---

### 步骤 6：创建管理员账号

数据库迁移完成后，需要创建第一个管理员账号。

**方法 A：通过 API 创建**

访问注册页面：
```
https://pulseopti-hr.vercel.app/register
```

填写：
- 公司名称：测试公司
- 用户名：admin
- 邮箱：admin@pulseopti.com
- 密码：admin123456
- 角色：Super Admin

**方法 B：通过数据库直接创建**

如果注册页面不可用，可以通过 API 或数据库直接创建。

---

### 步骤 7：登录系统

使用刚创建的账号登录：

1. 访问：https://pulseopti-hr.vercel.app/login
2. 输入邮箱：admin@pulseopti.com
3. 输入密码：admin123456
4. 点击登录

如果登录成功，恭喜！你的应用已经完全部署成功！🎉

---

## 🔧 故障排查

### 问题 1：访问显示 500 错误

**检查清单**：
- [ ] DATABASE_URL 是否已配置
- [ ] JWT_SECRET 是否已配置
- [ ] 是否已重新部署
- [ ] 数据库迁移是否完成
- [ ] 数据库连接是否正常

**解决方法**：
1. 查看 Vercel 日志：https://vercel.com/dashboard → 项目 → Deployments → 点击部署 → Logs
2. 检查错误信息，通常是数据库连接问题
3. 确认环境变量配置正确
4. 重新部署

### 问题 2：数据库连接失败

**可能原因**：
- DATABASE_URL 格式错误
- 数据库不允许 Vercel IP 访问
- 数据库服务未启动

**解决方法**：
1. 验证 DATABASE_URL 格式：
   ```
   postgresql://username:password@host:port/database?sslmode=require
   ```
2. 确保 `?sslmode=require` 已添加
3. 检查数据库是否在运行
4. 测试本地数据库连接

### 问题 3：环境变量未生效

**解决方法**：
1. 确保勾选了 Production 环境
2. 必须重新部署才能生效
3. 检查变量名称拼写（区分大小写）

---

## 📊 部署验证清单

在确认部署成功前，确保完成：

- [ ] 构建成功（144 个页面）
- [ ] 部署完成
- [ ] 环境变量已配置（DATABASE_URL, JWT_SECRET）
- [ ] 已重新部署
- [ ] 数据库迁移完成
- [ ] 首页可正常访问（HTTP 200）
- [ ] 登录 API 正常返回
- [ ] 管理员账号已创建
- [ ] 可以成功登录系统

---

## 🎯 下一步优化

### 1. 设置自定义域名

在 Vercel 控制台：
1. Settings → Domains → Add Domain
2. 输入你的域名（如 `hr.pulseopti.com`）
3. 按提示配置 DNS 记录
4. 等待验证通过

### 2. 配置监控和告警

在 Vercel 控制台：
1. Settings → Integrations
2. 添加 Slack、Discord 或 Email 告警

### 3. 配置自动部署

在 Vercel 控制台：
1. Settings → Git
2. 确保 GitHub 连接正常
3. 推送代码自动触发部署

---

## 📞 获取帮助

**Vercel 文档**：https://vercel.com/docs

**Neon 数据库文档**：https://neon.tech/docs

**项目文档**：`docs/` 目录

**Vercel 社区**：https://vercel.com/community

---

## ✅ 完成总结

当你完成以上所有步骤后，你将拥有：

- ✅ 一个在线可访问的 HR SaaS 应用
- ✅ PostgreSQL 数据库（59 张表）
- ✅ 144 个页面和 78 个 API 路由
- ✅ 全球 CDN 加速
- ✅ 自动 HTTPS
- ✅ 24/7 在线服务

**恭喜！🎉 你已经成功部署了 PulseOpti HR 到生产环境！**

---

**更新时间**: 2025-01-18
**维护团队**: PulseOpti HR Team
