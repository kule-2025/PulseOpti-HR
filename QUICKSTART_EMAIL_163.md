# 163邮箱配置快速开始（3步完成）

## 第1步：获取授权码

1. 登录 https://mail.163.com
2. 设置 → POP3/SMTP/IMAP → 开启SMTP服务
3. 授权码 → 新增授权码 → 复制16位授权码

## 第2步：配置环境变量

**方法A：使用自动化脚本（推荐）**

```cmd
setup-163-email.bat
```

按提示输入：
- 邮箱地址（如：yourname@163.com）
- 授权码（16位字符）

**方法B：手动配置**

在`.env`文件末尾添加：

```bash
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=yourname@163.com
SMTP_PASSWORD=your-authorization-code
SMTP_FROM=PulseOpti HR <yourname@163.com>
SMTP_NAME=PulseOpti HR 脉策聚效
EMAIL_PROVIDER=smtp
ENABLE_EMAIL_SERVICE=true
```

## 第3步：测试邮件发送

```cmd
test-email.bat
```

或访问登录页面测试：
```
http://localhost:5000/login
```

## ✅ 配置完成

现在可以使用邮箱验证码登录、注册和重置密码了！

---

## 📚 详细文档

- [完整配置指南](EMAIL_SETUP_163.md)
- [快速索引](README_EMAIL_163.md)
- [配置总结](EMAIL_CONFIG_SUMMARY.md)

## 🆘 常见问题

**Q: 邮件发送失败？**
A: 检查授权码是否正确（16位字符，不是邮箱密码）

**Q: 收不到邮件？**
A: 检查垃圾邮件文件夹，或将发件人添加到白名单

**Q: 频率限制？**
A: 163邮箱限制200封/天，10封/分钟

---

© 2024 PulseOpti HR 脉策聚效
