# 超管端外网访问配置指南

## 📋 概述

**问题**: 超管端（/admin）无法在外网访问
**目标**: 配置admin.aizhixuan.com.cn域名，实现超管端外网访问
**预计时间**: 30分钟

---

## 🔧 一、域名配置步骤

### 步骤1：登录域名服务商

1. 登录您的域名服务商（阿里云、腾讯云、Cloudflare等）
2. 找到域名aizhixuan.com.cn的DNS管理页面

### 步骤2：添加DNS记录

在DNS管理页面，添加以下记录：

```
记录类型: CNAME
主机记录: admin
记录值: cname.vercel-dns.com
TTL: 600（或默认值）
```

**完整配置示例**:

| 记录类型 | 主机记录 | 记录值 | TTL |
|----------|----------|--------|-----|
| CNAME | admin | cname.vercel-dns.com | 600 |

### 步骤3：等待DNS生效

- DNS生效时间：通常10分钟-24小时
- 验证DNS生效：使用以下命令检查
  ```bash
  ping admin.aizhixuan.com.cn
  ```

---

## 🚀 二、Vercel域名配置

### 步骤1：登录Vercel

1. 访问 [https://vercel.com](https://vercel.com)
2. 登录您的账号

### 步骤2：选择项目

1. 找到项目：pulseopti-hr
2. 点击进入项目设置

### 步骤3：添加域名

1. 点击 "Settings" → "Domains"
2. 点击 "Add Domain"
3. 输入域名：`admin.aizhixuan.com.cn`
4. 点击 "Add"

### 步骤4：配置环境变量（可选）

如果需要，可以为admin.aizhixuan.com.cn配置特定的环境变量：

1. 点击 "Settings" → "Environment Variables"
2. 添加环境变量：
   - `NEXT_PUBLIC_ADMIN_URL`: https://admin.aizhixuan.com.cn

---

## ✅ 三、验证配置

### 验证1：DNS解析

使用以下命令验证DNS解析是否正确：

```bash
# Windows
ping admin.aizhixuan.com.cn

# Linux/Mac
ping admin.aizhixuan.com.cn
```

**预期输出**: 应该指向Vercel的IP地址

### 验证2：HTTP访问

在浏览器中访问：
```
https://admin.aizhixuan.com.cn
```

**预期结果**:
- 如果已登录：跳转到 `/admin/dashboard`
- 如果未登录：跳转到 `/admin/login`

### 验证3：HTTPS证书

检查HTTPS证书是否正确：
- 浏览器地址栏应显示锁形图标
- 点击锁形图标，查看证书信息
- 证书应包含 `admin.aizhixuan.com.cn`

### 验证4：功能测试

1. **登录测试**:
   - 访问 `https://admin.aizhixuan.com.cn`
   - 输入超级管理员账号（208343256@qq.com / admin123）
   - 点击登录
   - 应成功跳转到 `/admin/dashboard`

2. **导航测试**:
   - 点击各个导航项（用户管理、企业管理、订阅管理等）
   - 应能正常访问

3. **数据同步测试**:
   - 在用户端创建订单
   - 在超管端查看订单列表
   - 应能实时看到新订单

---

## 🔍 四、故障排查

### 问题1：DNS解析失败

**症状**: ping admin.aizhixuan.com.cn 失败

**解决方案**:
1. 检查DNS记录是否正确配置
2. 检查TTL是否过期（等待24小时）
3. 尝试使用公共DNS（8.8.8.8或1.1.1.1）
4. 使用在线DNS查询工具验证：
   - https://www.nslookup.io/
   - https://dnschecker.org/

### 问题2：访问404错误

**症状**: 访问admin.aizhixuan.com.cn显示404

**解决方案**:
1. 检查Vercel域名配置是否正确
2. 检查项目是否部署成功
3. 检查路由配置（`src/app/admin/page.tsx`是否存在）
4. 重新部署项目

### 问题3：HTTPS证书错误

**症状**: 浏览器提示证书错误

**解决方案**:
1. 等待证书自动生成（Vercel自动配置）
2. 检查DNS记录是否正确
3. 在Vercel中重新添加域名
4. 联系Vercel客服

### 问题4：登录失败

**症状**: 超级管理员无法登录

**解决方案**:
1. 检查账号密码是否正确（208343256@qq.com / admin123）
2. 检查用户表中的`isSuperAdmin`字段是否为`true`
3. 检查JWT_SECRET环境变量是否配置
4. 查看Vercel日志，检查错误信息

---

## 📝 五、配置检查清单

使用以下检查清单确保配置正确：

- [ ] DNS记录已添加（CNAME: admin → cname.vercel-dns.com）
- [ ] DNS已生效（ping成功）
- [ ] Vercel域名已添加（admin.aizhixuan.com.cn）
- [ ] HTTPS证书已生效（浏览器显示锁形图标）
- [ ] 超级管理员可以登录
- [ ] 导航可以正常访问
- [ ] 数据同步正常（用户端和超管端）

---

## 🎯 六、完成后验证

### 验证1：访问超管端

1. 访问：`https://admin.aizhixuan.com.cn`
2. 输入账号：`208343256@qq.com`
3. 输入密码：`admin123`
4. 点击登录
5. 应成功跳转到仪表盘

### 验证2：数据闭环

1. 在用户端注册新账号
2. 在超管端查看新用户
3. 在用户端创建订单
4. 在超管端查看订单
5. 数据应实时同步

### 验证3：用户端访问

1. 访问：`https://www.aizhixuan.com.cn`
2. 点击导航栏的"超管端"
3. 应跳转到：`https://admin.aizhixuan.com.cn`

---

## 📚 七、参考文档

- [Vercel Domains Documentation](https://vercel.com/docs/concepts/projects/domains)
- [Vercel Custom Domains](https://vercel.com/docs/custom-domains)
- [DNS Configuration Guide](https://vercel.com/docs/custom-domains/configure-a-domain)

---

## 🆘 八、获取帮助

如果遇到问题，可以：

1. 查看Vercel日志
2. 查看项目文档
3. 联系技术支持：PulseOptiHR@163.com

---

**配置完成后，超管端将可以通过 `https://admin.aizhixuan.com.cn` 在外网访问。**
