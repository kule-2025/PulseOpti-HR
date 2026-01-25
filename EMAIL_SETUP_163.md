# 163邮箱配置指南

## 一、环境变量配置

在你的 `.env` 文件中添加以下配置：

```bash
# 邮件服务配置
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@163.com
SMTP_PASSWORD=your-authorization-code
SMTP_FROM=PulseOpti HR <your-email@163.com>
SMTP_NAME=PulseOpti HR 脉策聚效

# 功能开关
EMAIL_PROVIDER=smtp
ENABLE_EMAIL_SERVICE=true
```

## 二、获取163邮箱授权码

### 步骤1：登录163邮箱

访问 https://mail.163.com 并使用你的账号登录

### 步骤2：开启SMTP服务

1. 点击右上角「设置」按钮
2. 选择「POP3/SMTP/IMAP」
3. 找到「SMTP服务」并点击「开启」
4. 阅读服务条款并勾选同意
5. 点击「确定」

### 步骤3：获取授权码

1. 在同一页面，点击「授权码」标签
2. 点击「新增授权码」按钮
3. 通过手机短信验证
4. 验证成功后，系统会显示一个16位的授权码
5. **重要**：立即复制授权码（关闭窗口后将无法再次查看）

### 步骤4：填写环境变量

将授权码填入 `.env` 文件的 `SMTP_PASSWORD` 字段：

```bash
SMTP_USER=yourname@163.com
SMTP_PASSWORD=abcdefghijklmnopqrstuvwxyz1234  # 16位授权码
```

## 三、163邮箱SMTP参数说明

| 参数 | 值 | 说明 |
|------|-----|------|
| SMTP_HOST | smtp.163.com | 163邮箱SMTP服务器地址 |
| SMTP_PORT | 465 | SSL加密端口（推荐）|
| SMTP_PORT | 587 | TLS加密端口（备选）|
| SMTP_SECURE | true | 465端口使用SSL |
| SMTP_SECURE | false | 587端口使用TLS |

## 四、常见问题

### Q1: 邮件发送失败，提示认证错误

**原因**：授权码输入错误

**解决方案**：
- 检查授权码是否正确复制（16位字符，无空格）
- 如果忘记授权码，可以重新生成新的授权码
- 确保没有使用邮箱密码，必须使用授权码

### Q2: 邮件发送成功但收不到

**原因**：可能被邮箱的垃圾邮件过滤器拦截

**解决方案**：
- 检查邮箱的「垃圾邮件」文件夹
- 将发件人添加到白名单
- 163邮箱可能有每日发送限制（通常为200封/天）

### Q3: 连接超时

**原因**：网络连接问题或端口被防火墙阻止

**解决方案**：
- 检查服务器网络连接
- 尝试使用587端口（TLS）代替465端口（SSL）
- 检查防火墙设置

### Q4: 频率限制触发

**原因**：短时间内发送过多邮件

**解决方案**：
- 163邮箱限制：200封/天，10封/分钟
- 适当添加发送延迟
- 考虑使用企业邮箱或第三方邮件服务（阿里云邮件、SendGrid等）

## 五、测试邮件发送

### 方法1：使用Postman测试

发送POST请求到：
```
http://localhost:5000/api/auth/send-email
```

请求体：
```json
{
  "email": "your-test-email@163.com",
  "purpose": "login"
}
```

### 方法2：使用curl测试

```bash
curl -X POST http://localhost:5000/api/auth/send-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test-email@163.com","purpose":"login"}'
```

### 方法3：在前端测试

1. 访问登录页面：`http://localhost:5000/login`
2. 选择邮箱登录方式
3. 输入邮箱地址
4. 点击「获取验证码」按钮
5. 检查邮箱是否收到验证码

## 六、生产环境建议

### 1. 使用企业邮箱

- 申请163企业邮箱或阿里企业邮箱
- 提升发信信誉度
- 增加发送配额

### 2. 配置域名邮箱

- 使用自己的域名（如 `admin@yourcompany.com`）
- 在163邮箱中添加域名邮箱
- 更专业的品牌形象

### 3. 使用第三方邮件服务

如果163邮箱的限制无法满足需求，可以考虑：

- **阿里云邮件推送**：https://www.aliyun.com/product/directmail
- **腾讯云邮件**：https://cloud.tencent.com/product/ses
- **SendGrid**：https://sendgrid.com（国际）
- **Mailgun**：https://www.mailgun.com（国际）

### 4. 监控和日志

- 记录邮件发送日志
- 监控发送成功率
- 设置失败告警

## 七、其他邮箱服务商配置

### QQ邮箱

```bash
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@qq.com
SMTP_PASSWORD=your-authorization-code
```

获取授权码：登录QQ邮箱 → 设置 → 账户 → 开启SMTP服务

### Gmail

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

获取应用密码：Google账户 → 安全 → 应用密码

## 八、快速检查清单

配置完成后，请确认：

- [ ] 已获取163邮箱授权码（16位字符）
- [ ] 已在 `.env` 文件中正确配置所有SMTP参数
- [ ] 已安装 `nodemailer` 依赖
- [ ] `ENABLE_EMAIL_SERVICE=true` 已启用
- [ ] 开发环境可以正常发送测试邮件
- [ ] 生产环境已配置正确的域名

## 九、联系方式

如遇到问题，请联系：

- 邮箱：PulseOptiHR@163.com
- 地址：广州市天河区

---

© 2024 PulseOpti HR 脉策聚效
