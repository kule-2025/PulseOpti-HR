# SMTP 邮件服务配置指南

本文档介绍如何为 PulseOpti HR 系统配置 SMTP 邮件服务，以便发送告警通知和系统通知。

## 目录

- [支持的邮件服务](#支持的邮件服务)
- [配置步骤](#配置步骤)
- [常见邮件服务配置示例](#常见邮件服务配置示例)
- [测试邮件配置](#测试邮件配置)
- [故障排查](#故障排查)

---

## 支持的邮件服务

PulseOpti HR 支持所有兼容 SMTP 协议的邮件服务，包括：

1. **Gmail**
2. **Outlook / Microsoft 365**
3. **QQ 企业邮箱**
4. **阿里企业邮箱**
5. **腾讯企业邮箱**
6. **163 企业邮箱**
7. **自建 SMTP 服务器**

---

## 配置步骤

### 1. 获取 SMTP 凭据

根据您使用的邮件服务，获取以下信息：

- **SMTP 服务器地址** (SMTP Host)
- **SMTP 端口** (SMTP Port)
- **用户名** (SMTP User)
- **密码** (SMTP Pass)
- **是否使用 SSL/TLS**

### 2. 配置环境变量

在项目根目录下创建或编辑 `.env.local` 文件，添加以下配置：

```bash
# SMTP 服务器配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

### 3. 重启应用

修改环境变量后，需要重启应用使配置生效：

```bash
# 开发环境
pnpm dev

# 生产环境
pnpm build
pnpm start
```

---

## 常见邮件服务配置示例

### Gmail 配置

Gmail 需要使用"应用专用密码"，而不是普通密码。

#### 获取应用专用密码：

1. 登录 Google 账户
2. 进入"安全性"设置
3. 启用"两步验证"
4. 选择"应用专用密码"
5. 创建新密码，选择"邮件"和"其他设备"
6. 复制生成的 16 位密码

#### 配置示例：

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM=noreply@yourdomain.com
```

**注意**：`SMTP_PASS` 中的空格需要保留。

---

### Outlook / Microsoft 365 配置

```bash
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_FROM=noreply@yourdomain.com
```

---

### QQ 企业邮箱配置

```bash
SMTP_HOST=smtp.exmail.qq.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@company.com
SMTP_PASS=your-password
SMTP_FROM=noreply@company.com
```

---

### 阿里企业邮箱配置

```bash
SMTP_HOST=smtp.mxhichina.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@company.com
SMTP_PASS=your-password
SMTP_FROM=noreply@company.com
```

---

### 腾讯企业邮箱配置

```bash
SMTP_HOST=smtp.exmail.qq.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@company.com
SMTP_PASS=your-password
SMTP_FROM=noreply@company.com
```

---

### 163 企业邮箱配置

```bash
SMTP_HOST=smtp.ym.163.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@company.com
SMTP_PASS=your-password
SMTP_FROM=noreply@company.com
```

---

## 测试邮件配置

创建一个测试脚本验证配置是否正确：

```typescript
// test-email.ts
import { emailService } from './src/lib/email-service';

async function testEmail() {
  // 初始化邮件服务
  emailService.initialize();

  if (!emailService.isReady()) {
    console.error('邮件服务未配置');
    return;
  }

  // 发送测试邮件
  const success = await emailService.sendEmail({
    to: 'test@example.com',
    subject: 'PulseOpti HR 测试邮件',
    text: '这是一封测试邮件，如果您收到此邮件，说明邮件配置成功！',
  });

  if (success) {
    console.log('测试邮件发送成功！');
  } else {
    console.error('测试邮件发送失败');
  }
}

testEmail();
```

运行测试：

```bash
npx tsx test-email.ts
```

---

## 故障排查

### 1. 邮件发送失败

**可能原因**：
- SMTP 凭据错误
- SMTP 服务器地址或端口错误
- 防火墙阻止 SMTP 连接
- 邮件服务提供商限制了发送频率

**解决方法**：
- 检查环境变量配置是否正确
- 尝试使用 telnet 测试 SMTP 连接：
  ```bash
  telnet smtp.gmail.com 587
  ```
- 查看应用日志，定位具体错误信息

---

### 2. Gmail 认证失败

**可能原因**：
- 使用了普通密码而非应用专用密码
- 两步验证未启用
- 账户被锁定

**解决方法**：
- 重新生成应用专用密码
- 检查 Google 账户安全设置
- 解锁 Google 账户

---

### 3. 邮件发送到垃圾箱

**可能原因**：
- 发件人信誉度低
- 邮件内容触发垃圾邮件过滤器
- SPF/DKIM/DMARC 记录未配置

**解决方法**：
- 配置域名 SPF 记录
- 配置 DKIM 签名
- 检查邮件内容，避免敏感词汇
- 提醒用户将发件人邮箱添加到联系人列表

---

### 4. SSL/TLS 连接错误

**可能原因**：
- `SMTP_SECURE` 配置错误
- SSL 证书问题

**解决方法**：
- 使用 587 端口时，设置 `SMTP_SECURE=false`
- 使用 465 端口时，设置 `SMTP_SECURE=true`

---

## 安全建议

1. **不要在代码中硬编码 SMTP 凭据**
   - 始终使用环境变量

2. **使用应用专用密码**
   - 特别是 Gmail、Outlook 等个人邮箱

3. **限制发件人邮箱权限**
   - 创建专门的系统通知邮箱
   - 不要使用管理员邮箱

4. **定期更换密码**
   - 每 3-6 个月更换一次 SMTP 密码

5. **监控邮件发送量**
   - 避免超出邮件服务提供商的发送限制
   - 设置发送频率限制

---

## 进阶配置

### 自定义邮件模板

您可以在 `src/lib/email-service.ts` 中修改邮件模板，自定义邮件样式。

### 添加附件

扩展 `sendEmail` 方法，支持发送附件：

```typescript
await emailService.sendEmail({
  to: 'recipient@example.com',
  subject: '带附件的邮件',
  html: '<p>请查收附件</p>',
  attachments: [
    {
      filename: 'report.pdf',
      path: '/path/to/report.pdf',
    },
  ],
});
```

### 使用邮件队列

对于大量邮件发送，建议使用队列系统（如 Bull）来异步发送邮件，避免阻塞主线程。

---

## 技术支持

如遇到问题，请联系：

- **邮箱**：PulseOptiHR@163.com
- **地址**：广州市天河区
- **服务时间**：周一至周五 9:00-12:00, 14:00-18:00

---

**最后更新时间**：2024年
