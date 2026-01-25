# 快速参考卡 - 超管端部署

## 🎯 本次更新

### ✅ 定价页面修复
- 基础版：¥59/月
- 专业版：¥129/月
- 企业版：¥259/月

### ✅ UI深度重构
- 参考飞书、钉钉、薪人薪事设计
- 优化排版、布局、字体、颜色
- 添加微动效和呼吸感

### ✅ Vercel配置优化
- 创建 `vercel.json`
- 移除regions配置错误

### ✅ 超管端域名配置
- 创建完整配置指南
- 共享数据库架构
- 实时数据同步

---

## 🚀 快速部署步骤

### 步骤 1: 配置 Cloudflare DNS（2分钟）

```
1. 登录 Cloudflare (dash.cloudflare.com)
2. 选择域名 aizhixuan.com.cn
3. DNS → Records → Add Record
4. 填写：
   - Type: CNAME
   - Name: admin
   - Target: pulseopti-hr.vercel.app
   - Proxy: Proxied (橙色云朵)
5. Save
```

### 步骤 2: 在 Vercel 添加域名（1分钟）

```
1. 登录 Vercel (vercel.com/dashboard)
2. 选择项目 PulseOpti HR
3. Settings → Domains
4. Add Domain: admin.aizhixuan.com.cn
5. 等待 HTTPS 证书（5-10分钟）
```

### 步骤 3: 创建超级管理员（1分钟）

```sql
-- 连接 Neon 数据库
UPDATE users
SET is_super_admin = true
WHERE email = '208343256@qq.com';
```

### 步骤 4: 验证部署（1分钟）

```
1. 访问: https://www.aizhixuan.com.cn/pricing
   - 验证价格显示正确
   - 验证UI优化效果

2. 访问: https://admin.aizhixuan.com.cn/admin/login
   - 账号: 208343256@qq.com
   - 密码: admin123
   - 验证登录成功
```

---

## 🔧 常见问题

### Q: admin.aizhixuan.com.cn 显示 404？
**A**: 等待 DNS 传播（1-2分钟），清除浏览器缓存

### Q: 超管端登录失败？
**A**: 检查 `is_super_admin` 字段是否为 true

### Q: 看不到用户数据？
**A**: 确保用户端和超管端使用同一个数据库

### Q: 价格未更新？
**A**: 清除浏览器缓存或强制刷新（Ctrl+F5）

---

## 📚 详细文档

- **超管端配置指南**: `ADMIN_DOMAIN_SETUP_GUIDE.md`
- **部署验证指南**: `DEPLOYMENT_VERIFICATION_GUIDE.md`

---

## 📞 联系方式

- **邮箱**: PulseOptiHR@163.com
- **地址**: 广州市天河区

---

**快速开始**:
1. 配置 DNS → 2. 配置 Vercel → 3. 创建账号 → 4. 验证部署

**总耗时**: 约 5 分钟
