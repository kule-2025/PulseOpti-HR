# 超管端域名配置快速参考

## ⚡ 3分钟快速配置

### 1️⃣ DNS配置（域名服务商）

```
记录类型: CNAME
主机记录: admin
记录值: cname.vercel-dns.com
TTL: 600
```

### 2️⃣ Vercel配置

1. 登录 https://vercel.com
2. 进入项目 `pulseopti-hr`
3. Settings → Domains → Add Domain
4. 输入：`admin.aizhixuan.com.cn`
5. 点击 Add

### 3️⃣ 等待DNS生效

```cmd
ping admin.aizhixuan.com.cn
```

**等待时间**: 10-30分钟

---

## ✅ 验证步骤

### 1. 访问测试
```
https://admin.aizhixuan.com.cn
```

### 2. 登录测试
- 账号：`208343256@qq.com`
- 密码：`admin123`

### 3. 功能测试
- 查看用户列表
- 查看订单列表
- 验证数据同步

---

## 🔧 常见问题

### 问题：ping不通
**解决**：等待DNS生效（10-30分钟），或清除DNS缓存：
```cmd
ipconfig /flushdns
```

### 问题：Vercel显示"Invalid Configuration"
**解决**：检查DNS记录必须是CNAME类型，记录值必须是 `cname.vercel-dns.com`

### 问题：访问404
**解决**：确认项目已部署成功，在Vercel中重新部署

### 问题：证书错误
**解决**：等待5-10分钟，Vercel会自动生成HTTPS证书

---

## 📞 获取帮助

详细步骤：查看 `ADMIN_DOMAIN_CONFIG_STEP_BY_STEP.md`

在线诊断：
- DNS检查：https://www.nslookup.io/
- 证书检查：https://www.ssllabs.com/ssltest/

---

## 📋 关键信息

| 项目 | 值 |
|------|-----|
| 用户端域名 | https://www.aizhixuan.com.cn |
| 超管端域名 | https://admin.aizhixuan.com.cn |
| 超级管理员 | 208343256@qq.com / admin123 |
| DNS记录值 | cname.vercel-dns.com |
| 预计配置时间 | 30-45分钟 |

---

**💡 提示**：DNS配置需要等待10-30分钟生效，请耐心等待。
