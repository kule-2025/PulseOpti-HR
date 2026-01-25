# 外网访问问题修复（无需文件）

## 🚨 直接执行以下命令（复制粘贴即可）

### 步骤 1：重新部署到生产环境

在 CMD 中执行：

```cmd
cd C:\PulseOpti-HR\PulseOpti-HR
vercel --prod --force
```

等待部署完成，看到：
```
✅ Production: https://pulseopti-hr.vercel.app [完成时间]
```

---

### 步骤 2：检查环境变量

```cmd
vercel env ls --environment=production
```

**预期应该看到 5 个变量**：
- DATABASE_URL
- JWT_SECRET
- JWT_EXPIRES_IN
- NODE_ENV
- NEXT_PUBLIC_APP_URL

**如果缺失任何变量，继续执行步骤 3。**

---

### 步骤 3：添加缺失的环境变量（逐个执行）

#### 3.1 添加 DATABASE_URL

```cmd
vercel env add DATABASE_URL production
```

粘贴：
```
postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

按回车确认。

#### 3.2 添加 JWT_SECRET

```cmd
vercel env add JWT_SECRET production
```

粘贴：
```
PulseOptiHR_SuperSecretKey_2024_Production_Secure_Random_String_DoNotChangeInProduction
```

按回车确认。

#### 3.3 添加 JWT_EXPIRES_IN

```cmd
vercel env add JWT_EXPIRES_IN production
```

粘贴：
```
7d
```

按回车确认。

#### 3.4 添加 NODE_ENV

```cmd
vercel env add NODE_ENV production
```

粘贴：
```
production
```

按回车确认。

#### 3.5 添加 NEXT_PUBLIC_APP_URL

```cmd
vercel env add NEXT_PUBLIC_APP_URL production
```

粘贴：
```
https://pulseopti-hr.vercel.app
```

按回车确认。

---

### 步骤 4：再次部署（让环境变量生效）

```cmd
vercel --prod --force
```

---

### 步骤 5：运行数据库迁移

```cmd
pnpm drizzle-kit push
```

---

### 步骤 6：验证部署

```cmd
vercel ls --prod
```

应该看到类似：
```
Project                     | Production URL                                    | ...
pulseopti-hr                | https://pulseopti-hr.vercel.app                   | ...
```

---

## 🌐 测试外网访问

### 方法 1：直接访问（在浏览器中）

打开浏览器访问：https://pulseopti-hr.vercel.app

### 方法 2：如果无法访问，使用手机热点

1. 用手机开启热点
2. 电脑连接手机热点
3. 访问 https://pulseopti-hr.vercel.app

### 方法 3：刷新 DNS

在 CMD 中执行：

```cmd
ipconfig /flushdns
```

然后重新访问：https://pulseopti-hr.vercel.app

---

## 📋 验证功能

访问 https://pulseopti-hr.vercel.app 后测试：

### 1. 用户端功能
- ✅ 首页加载
- ✅ 用户注册
- ✅ 用户登录

### 2. 超管端功能
- ✅ 访问 /admin
- ✅ 超管登录
  - 账号：admin@pulseopti.com
  - 密码：admin123

---

## 🔍 检查部署日志（如果仍有问题）

```cmd
vercel logs --prod
```

查看是否有错误信息。

---

## 📊 环境变量完整列表

| 变量名 | 值 |
|--------|-----|
| DATABASE_URL | postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require |
| JWT_SECRET | PulseOptiHR_SuperSecretKey_2024_Production_Secure_Random_String_DoNotChangeInProduction |
| JWT_EXPIRES_IN | 7d |
| NODE_ENV | production |
| NEXT_PUBLIC_APP_URL | https://pulseopti-hr.vercel.app |

---

## 🔗 重要链接

- **生产环境地址**: https://pulseopti-hr.vercel.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **外网检测**: https://downforeveryoneorjustme.com/pulseopti-hr.vercel.app

---

## 📞 获取帮助

- **邮箱**: PulseOptiHR@163.com
- **地址**: 广州市天河区

---

## ⏱️ 预计时间

- 步骤 1（部署）：3-5 分钟
- 步骤 2（检查环境变量）：1 分钟
- 步骤 3（添加环境变量）：3-5 分钟
- 步骤 4（再次部署）：3-5 分钟
- 步骤 5（数据库迁移）：1-2 分钟
- 步骤 6（验证）：1 分钟

**总计：约 15 分钟**

---

**现在可以打开 CMD，从步骤 1 开始复制粘贴命令执行！** 🚀
