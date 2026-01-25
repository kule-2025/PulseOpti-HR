# 快速修复指南 - 登录注册功能

## 🎯 问题描述

访问 aizhixuan.com.cn 后：
- 手机注册/邮箱注册点击"获取验证码"没有反应
- 点击"忘记密码"没有反应
- 点击"登录"没有反应

## ✅ 已修复的问题

1. ✅ 手机注册"获取验证码"按钮无响应
2. ✅ 邮箱注册"获取验证码"按钮无响应
3. ✅ 登录页面"获取验证码"按钮无响应
4. ✅ "忘记密码"链接无响应（已创建忘记密码页面）
5. ✅ 登录 API 字段不匹配问题
6. ✅ 缺少发送验证码 API 路由

---

## 🚀 快速修复（3个步骤）

### 步骤1：打开本地项目目录

在 Windows 文件资源管理器中打开项目文件夹：
```
C:\PulseOpti-HR
```

### 步骤2：运行自动修复脚本

双击运行：
```
fix-auth-issues.bat
```

脚本会自动执行：
- ✓ 检查并安装依赖
- ✓ 推送数据库 schema
- ✓ 本地构建测试
- ✓ 提交代码到 GitHub
- ✓ 部署到 Vercel

### 步骤3：等待 Vercel 自动部署

1. 访问：https://vercel.com/dashboard
2. 找到 `pulseopti-hr` 项目
3. 查看部署状态（通常 2-3 分钟）

---

## 📋 完整 CMD 操作步骤（如果自动脚本失败）

### 1. 打开命令提示符（CMD）

按 `Win + R`，输入 `cmd`，回车

### 2. 进入项目目录

```cmd
cd C:\PulseOpti-HR
```

### 3. 安装依赖

```cmd
pnpm install
```

### 4. 配置环境变量（首次需要）

编辑 `.env.local` 文件：

```cmd
notepad .env.local
```

确保包含以下内容：

```env
DATABASE_URL=postgresql://user:password@your-neon-host/neondb?sslmode=require
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://aizhixuan.com.cn
```

保存并关闭。

### 5. 推送数据库 schema

```cmd
npx drizzle-kit push
```

### 6. 本地构建测试

```cmd
pnpm run build
```

### 7. 提交代码

```cmd
git add .
git commit -m "fix: 修复登录注册功能"
git push origin main
```

### 8. 部署到 Vercel

```cmd
vercel --prod
```

---

## 🔍 验证修复

### 方式1：浏览器测试

1. 访问：https://aizhixuan.com.cn
2. 点击"登录"
3. 切换到"手机验证"标签
4. 输入手机号
5. 点击"获取验证码" → 应显示倒计时

### 方式2：查看 API 响应

1. 打开浏览器开发者工具（F12）
2. 切换到 "Network" 标签
3. 执行"获取验证码"操作
4. 查看请求 `/api/auth/send-sms`
5. 应该返回 `{ success: true, message: "验证码已发送" }`

---

## 📊 新增的 API 端点

| API 端点 | 方法 | 说明 |
|----------|------|------|
| `/api/auth/send-sms` | POST | 发送短信验证码 |
| `/api/auth/send-email` | POST | 发送邮箱验证码 |
| `/api/auth/reset-password` | POST | 重置密码 |

---

## 📁 新增的文件

| 文件 | 说明 |
|------|------|
| `src/app/forgot-password/page.tsx` | 忘记密码页面 |
| `src/app/api/auth/send-sms/route.ts` | 发送短信验证码 API |
| `src/app/api/auth/send-email/route.ts` | 发送邮箱验证码 API |
| `src/app/api/auth/reset-password/route.ts` | 重置密码 API |
| `fix-auth-issues.bat` | 自动修复脚本 |
| `DEPLOYMENT_STEPS.md` | 完整部署文档 |

---

## ⚠️ 注意事项

### 验证码功能

当前使用模拟发送（开发模式）：
- 验证码会在控制台（F12 → Console）中打印
- 开发环境会返回验证码：`{ code: "123456" }`

**生产环境集成**：

集成真实短信服务（如阿里云SMS）：
```typescript
// src/app/api/auth/send-sms/route.ts
// TODO: 替换为真实的短信服务调用
await sendSms(validated.phone, `您的验证码是${code}`);
```

集成真实邮件服务（如SendGrid）：
```typescript
// src/app/api/auth/send-email/route.ts
// TODO: 替换为真实的邮件服务调用
await sendEmail(validated.email, '验证码', `您的验证码是${code}`);
```

### 验证码有效期

- 有效期：5分钟
- 频率限制：60秒内只能发送一次

---

## 🎯 测试场景

### 测试1：手机注册

1. 访问 https://aizhixuan.com.cn/register
2. 选择"手机注册"
3. 输入手机号：`13800138000`
4. 点击"获取验证码" → 显示 60秒倒计时
5. 打开 F12 → Console 查看验证码
6. 输入验证码和密码
7. 点击"注册"

### 测试2：邮箱注册

1. 访问 https://aizhixuan.com.cn/register
2. 选择"邮箱注册"
3. 输入邮箱：`test@example.com`
4. 点击"获取验证码" → 显示 60秒倒计时
5. 打开 F12 → Console 查看验证码
6. 输入验证码和密码
7. 点击"注册"

### 测试3：密码登录

1. 访问 https://aizhixuan.com.cn/login
2. 选择"密码登录"
3. 输入账号和密码
4. 点击"登录"

### 测试4：手机验证码登录

1. 访问 https://aizhixuan.com.cn/login
2. 选择"手机验证"
3. 输入手机号
4. 点击"获取验证码"
5. 输入验证码
6. 点击"登录"

### 测试5：忘记密码

1. 访问 https://aizhixuan.com.cn/login
2. 点击"忘记密码?"
3. 选择"手机验证"或"邮箱验证"
4. 输入手机号/邮箱
5. 点击"获取验证码"
6. 输入验证码和新密码
7. 点击"重置密码"

---

## 🆘 常见问题

### Q1: 点击"获取验证码"仍然无反应？

**A**: 
1. 打开浏览器开发者工具（F12）
2. 查看 Console 是否有报错
3. 查看 Network 标签，检查 `/api/auth/send-sms` 请求状态
4. 确认 Vercel 部署已完成

### Q2: 验证码收不到？

**A**: 
- 开发环境：验证码在 F12 → Console 中打印
- 生产环境：需要集成真实短信/邮件服务

### Q3: 登录失败？

**A**: 
1. 确认账号已注册
2. 确认密码正确
3. 检查数据库连接是否正常

### Q4: 部署后功能仍不正常？

**A**: 
1. 检查 Vercel 环境变量是否配置
2. 查看 Vercel 部署日志
3. 确认数据库连接正常

---

## 📞 技术支持

- 邮箱：PulseOptiHR@163.com
- GitHub：https://github.com/tomato-writer-2024/PulseOpti-HR

---

## 🎉 完成

修复完成后，访问 https://aizhixuan.com.cn 测试所有功能！

---

**文档结束**
