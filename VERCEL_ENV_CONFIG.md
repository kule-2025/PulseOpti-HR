# PulseOpti HR - Vercel环境变量配置指南

## 📌 项目信息

**项目名称：** PulseOpti HR 脉策聚效
**生产域名：** https://www.aizhixuan.com.cn
**Vercel项目：** pulseopti-hr

---

## ⚙️ 环境变量配置清单

### 必需配置（12项）

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require` | Neon数据库连接字符串 |
| `JWT_SECRET` | `a915ab35-9534-43ad-b925-d9102c5007ba-PulseOpti-HR-JWT-Secret-Key-2025-01-19-PROD` | JWT认证密钥 |
| `JWT_EXPIRES_IN` | `7d` | Token过期时间（7天） |
| `NEXT_PUBLIC_APP_URL` | `https://www.aizhixuan.com.cn` | 应用访问地址 |
| `NODE_ENV` | `production` | 运行环境 |
| `SMTP_HOST` | `smtp.qq.com` | SMTP服务器地址 |
| `SMTP_PORT` | `587` | SMTP端口 |
| `SMTP_SECURE` | `false` | 是否使用SSL |
| `SMTP_USER` | `208343256@qq.com` | SMTP用户名 |
| `SMTP_PASSWORD` | `xxwbcxaojrqwbjia` | SMTP密码（QQ邮箱授权码） |
| `SMTP_FROM` | `PulseOpti HR <PulseOptiHR@163.com>` | 发件人邮箱 |
| `SMTP_NAME` | `PulseOpti HR 脉策聚效` | 发件人名称 |

### 可选配置（6项）

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `EMAIL_PROVIDER` | `smtp` | 邮件提供商 |
| `ENABLE_EMAIL_SERVICE` | `true` | 启用邮件服务 |
| `SMS_PROVIDER` | `mock` | 短信提供商（Mock模式） |
| `ENABLE_SMS_SERVICE` | `true` | 启用短信服务 |
| `COZE_API_KEY` | `a915ab35-9534-43ad-b925-d9102c5007ba` | 豆包API密钥 |
| `LOG_LEVEL` | `info` | 日志级别 |

---

## 🚀 配置步骤

### 步骤1：访问Vercel Dashboard

1. 访问：https://vercel.com/dashboard
2. 登录Vercel账号
3. 选择 `pulseopti-hr` 项目

---

### 步骤2：进入环境变量配置

1. 点击项目顶部的"Settings"标签
2. 在左侧菜单中找到"Environment Variables"
3. 点击"Add New"按钮

---

### 步骤3：逐个添加环境变量

#### 第1项：DATABASE_URL

- **Name:** `DATABASE_URL`
- **Value:**
  ```
  postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
  ```
- **Environment:** `Production`、`Preview`、`Development`（全部勾选）
- 点击"Save"

---

#### 第2项：JWT_SECRET

- **Name:** `JWT_SECRET`
- **Value:**
  ```
  a915ab35-9534-43ad-b925-d9102c5007ba-PulseOpti-HR-JWT-Secret-Key-2025-01-19-PROD
  ```
- **Environment:** `Production`、`Preview`、`Development`（全部勾选）
- 点击"Save"

---

#### 第3项：JWT_EXPIRES_IN

- **Name:** `JWT_EXPIRES_IN`
- **Value:** `7d`
- **Environment:** `Production`、`Preview`、`Development`（全部勾选）
- 点击"Save"

---

#### 第4项：NEXT_PUBLIC_APP_URL

- **Name:** `NEXT_PUBLIC_APP_URL`
- **Value:** `https://www.aizhixuan.com.cn`
- **Environment:** `Production`、`Preview`、`Development`（全部勾选）
- 点击"Save"

**注意：** 变量名以 `NEXT_PUBLIC_` 开头，表示可以在客户端访问。

---

#### 第5项：NODE_ENV

- **Name:** `NODE_ENV`
- **Value:** `production`
- **Environment:** `Production`、`Preview`、`Development`（全部勾选）
- 点击"Save"

---

#### 第6项：SMTP_HOST

- **Name:** `SMTP_HOST`
- **Value:** `smtp.qq.com`
- **Environment:** `Production`、`Preview`、`Development`（全部勾选）
- 点击"Save"

---

#### 第7项：SMTP_PORT

- **Name:** `SMTP_PORT`
- **Value:** `587`
- **Environment:** `Production`、`Preview`、`Development`（全部勾选）
- 点击"Save"

---

#### 第8项：SMTP_SECURE

- **Name:** `SMTP_SECURE`
- **Value:** `false`
- **Environment:** `Production`、`Preview`、`Development`（全部勾选）
- 点击"Save"

---

#### 第9项：SMTP_USER

- **Name:** `SMTP_USER`
- **Value:** `208343256@qq.com`
- **Environment:** `Production`、`Preview`、`Development`（全部勾选）
- 点击"Save"

---

#### 第10项：SMTP_PASSWORD

- **Name:** `SMTP_PASSWORD`
- **Value:** `xxwbcxaojrqwbjia`
- **Environment:** `Production`、`Preview`、`Development`（全部勾选）
- 点击"Save"

---

#### 第11项：SMTP_FROM

- **Name:** `SMTP_FROM`
- **Value:** `PulseOpti HR <PulseOptiHR@163.com>`
- **Environment:** `Production`、`Preview`、`Development`（全部勾选）
- 点击"Save"

---

#### 第12项：SMTP_NAME

- **Name:** `SMTP_NAME`
- **Value:** `PulseOpti HR 脉策聚效`
- **Environment:** `Production`、`Preview`、`Development`（全部勾选）
- 点击"Save"

---

### 步骤4：添加可选环境变量

#### EMAIL_PROVIDER

- **Name:** `EMAIL_PROVIDER`
- **Value:** `smtp`
- **Environment:** `Production`、`Preview`、`Development`（全部勾选）
- 点击"Save"

---

#### ENABLE_EMAIL_SERVICE

- **Name:** `ENABLE_EMAIL_SERVICE`
- **Value:** `true`
- **Environment:** `Production`、`Preview`、`Development`（全部勾选）
- 点击"Save"

---

#### SMS_PROVIDER

- **Name:** `SMS_PROVIDER`
- **Value:** `mock`
- **Environment:** `Production`、`Preview`、`Development`（全部勾选）
- 点击"Save"

---

#### ENABLE_SMS_SERVICE

- **Name:** `ENABLE_SMS_SERVICE`
- **Value:** `true`
- **Environment:** `Production`、`Preview`、`Development`（全部勾选）
- 点击"Save"

---

#### COZE_API_KEY

- **Name:** `COZE_API_KEY`
- **Value:** `a915ab35-9534-43ad-b925-d9102c5007ba`
- **Environment:** `Production`、`Preview`、`Development`（全部勾选）
- 点击"Save"

---

#### LOG_LEVEL

- **Name:** `LOG_LEVEL`
- **Value:** `info`
- **Environment:** `Production`、`Preview`、`Development`（全部勾选）
- 点击"Save"

---

## 🔄 步骤5：重新部署

配置完所有环境变量后，需要重新部署项目：

1. 返回项目首页
2. 点击"Deployments"标签
3. 找到最新的部署记录
4. 点击右侧的"..."（三个点）
5. 选择"Redeploy"
6. 确认重新部署

**或使用CLI命令：**

```cmd
vercel --prod
```

---

## ✅ 步骤6：验证配置

部署完成后，验证环境变量是否正确加载：

1. 访问：https://www.aizhixuan.com.cn
2. 打开浏览器控制台（F12）
3. 查看是否有错误日志
4. 测试注册/登录功能

---

## 🌐 自定义域名配置

### 添加域名到Vercel

1. 在Vercel Dashboard中，点击"Settings" → "Domains"
2. 输入域名：`www.aizhixuan.com.cn`
3. 点击"Add"

---

### 配置DNS解析

登录域名服务商，添加以下DNS记录：

| 类型 | 主机记录 | 记录值 | TTL |
|------|----------|--------|-----|
| CNAME | www | cname.vercel-dns.com | 600 |

---

### 等待DNS生效

DNS解析生效时间：10分钟 - 48小时

---

## 🚨 常见问题

### 问题1：环境变量未生效

**解决方案：**

1. 确认环境变量已保存
2. 确认环境变量已勾选所有环境（Production、Preview、Development）
3. 重新部署项目

---

### 问题2：数据库连接失败

**解决方案：**

1. 检查 `DATABASE_URL` 是否正确
2. 检查Neon数据库是否在线
3. 尝试使用连接池参数

---

### 问题3：邮件发送失败

**解决方案：**

1. 检查SMTP配置是否正确
2. 确认QQ邮箱授权码是否有效
3. 检查QQ邮箱是否开启SMTP服务

---

## 📞 联系支持

- **邮箱：** PulseOptiHR@163.com
- **地址：** 广州市天河区

---

## 🌐 应用访问地址

- **生产环境：** https://www.aizhixuan.com.cn
- **Vercel预览：** https://pulseopti-hr.vercel.app
- **Vercel Dashboard：** https://vercel.com/dashboard

---

**最后更新时间：** 2025-01-19
**文档版本：** v1.0
