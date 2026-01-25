# 163邮箱配置完整指南

## 📋 文件清单

本目录包含以下163邮箱配置相关文件：

| 文件名 | 说明 |
|--------|------|
| `EMAIL_SETUP_163.md` | 详细配置指南（推荐阅读） |
| `setup-163-email.bat` | Windows CMD配置脚本 |
| `setup-163-email.ps1` | PowerShell配置脚本 |
| `test-email.bat` | 邮件发送测试工具 |
| `README_EMAIL_163.md` | 本文件，快速索引 |

## 🚀 快速开始

### 方法1：使用自动化脚本（推荐）

**Windows CMD用户：**
```cmd
setup-163-email.bat
```

**PowerShell用户：**
```powershell
.\setup-163-email.ps1
```

脚本将自动：
1. 提示输入163邮箱地址
2. 提示输入授权码
3. 备份原有`.env`文件
4. 自动配置所有SMTP参数
5. 验证配置是否成功

### 方法2：手动配置

1. 打开`.env`文件
2. 添加以下配置：

```bash
# 163邮箱SMTP配置
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@163.com
SMTP_PASSWORD=your-authorization-code
SMTP_FROM=PulseOpti HR <your-email@163.com>
SMTP_NAME=PulseOpti HR 脉策聚效
EMAIL_PROVIDER=smtp
ENABLE_EMAIL_SERVICE=true
```

## 🔧 获取163邮箱授权码

1. 登录 https://mail.163.com
2. 点击右上角「设置」→「POP3/SMTP/IMAP」
3. 开启SMTP服务
4. 点击「授权码」标签
5. 点击「新增授权码」
6. 通过手机短信验证
7. 复制显示的16位授权码

## ✅ 测试邮件发送

### 方法1：使用测试脚本

```cmd
test-email.bat
```

### 方法2：使用curl

```bash
curl -X POST http://localhost:5000/api/auth/send-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@163.com","purpose":"login"}'
```

### 方法3：前端测试

1. 访问 `http://localhost:5000/login`
2. 选择邮箱登录方式
3. 输入邮箱地址
4. 点击「获取验证码」按钮
5. 检查邮箱是否收到验证码

## 📚 详细文档

- **完整配置指南**：[EMAIL_SETUP_163.md](EMAIL_SETUP_163.md)
  - 详细的配置步骤
  - 常见问题解答
  - 生产环境建议
  - 其他邮箱服务商配置

## 🛠️ 故障排查

### 邮件发送失败

1. 检查授权码是否正确（16位字符，无空格）
2. 检查`.env`文件中的配置是否正确
3. 查看开发服务器的控制台日志
4. 确认网络连接正常

### 找不到邮件

1. 检查邮箱的「垃圾邮件」文件夹
2. 将发件人添加到白名单
3. 确认邮箱地址输入正确

### 频率限制

163邮箱限制：200封/天，10封/分钟

如需要更高的发送配额，建议使用：
- 阿里云邮件推送
- 腾讯云邮件
- 企业邮箱

## 🔄 恢复配置

如果配置失败，脚本会自动恢复备份：

```cmd
copy .env.backup .env
```

或手动删除`.env`文件中的SMTP配置部分。

## 📞 联系支持

如有问题，请联系：

- 邮箱：PulseOptiHR@163.com
- 地址：广州市天河区

## 📝 配置检查清单

配置完成后，请确认：

- [ ] 已获取163邮箱授权码（16位字符）
- [ ] 已在`.env`文件中正确配置所有SMTP参数
- [ ] 已安装`nodemailer`依赖
- [ ] `ENABLE_EMAIL_SERVICE=true` 已启用
- [ ] 开发环境可以正常发送测试邮件
- [ ] 生产环境已配置正确的域名

## 🎯 下一步

配置完成后，你可以：

1. **测试登录注册功能**
   - 访问 `http://localhost:5000/login`
   - 使用邮箱验证码登录

2. **测试重置密码功能**
   - 访问 `http://localhost:5000/forgot-password`
   - 使用邮箱验证码重置密码

3. **配置生产环境**
   - 在Vercel环境变量中添加SMTP配置
   - 测试生产环境邮件发送

4. **查看详细文档**
   - 阅读完整配置指南
   - 了解生产环境最佳实践

---

© 2024 PulseOpti HR 脉策聚效
