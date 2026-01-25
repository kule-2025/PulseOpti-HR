# 用户前端与超管端实时数据同步 - 快速开始

## 🚀 5分钟快速实现

### 前提条件
- ✅ 已有Neon PostgreSQL数据库
- ✅ 前端已部署到 https://www.aizhixuan.com.cn
- ✅ 数据库迁移已完成（59个表已创建）

---

## 📝 操作步骤（5步完成）

### 第1步：配置DNS（2分钟）

登录 Cloudflare，添加CNAME记录：

```
类型    名称              内容                    代理状态
CNAME   admin            cname.vercel-dns.com   ✅ 已代理
```

---

### 第2步：配置Vercel环境变量（1分钟）

在Vercel项目中添加环境变量：

```env
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
JWT_SECRET=your-jwt-secret-key-here
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_APP_URL=https://admin.aizhixuan.com.cn
NODE_ENV=production
```

**关键**：`DATABASE_URL` 必须与前端相同！

---

### 第3步：部署超管端（2分钟）

```bash
git add .
git commit -m "feat: 部署超管端"
git push origin main
```

Vercel自动检测并部署，等待3-5分钟。

---

### 第4步：登录超管端（30秒）

访问：https://admin.aizhixuan.com.cn/admin/login

```
账号：208343256@qq.com
密码：admin123
```

---

### 第5步：验证数据同步（30秒）

1. 前端注册用户：https://www.aizhixuan.com.cn
2. 超管端查看用户：https://admin.aizhixuan.com.cn/admin/users
3. 验证：新用户立即显示（0延迟）

---

## ✅ 验证清单

- [ ] DNS记录已配置（admin.aizhixuan.com.cn）
- [ ] Vercel环境变量已配置（DATABASE_URL相同）
- [ ] 超管端已部署成功
- [ ] 超级管理员账号可登录
- [ ] 前端注册用户后，超管端立即可见

---

## 🔍 架构说明

```
前端 (www.aizhixuan.com.cn)
    ↓ 写入数据
Neon PostgreSQL (共享数据库)
    ↓ 实时读取
超管端 (admin.aizhixuan.com.cn)
```

**特点**：
- 🚀 0延迟同步
- 🛡️ ACID保证
- 💡 无需中间件
- 💰 低成本

---

## 📞 技术支持

- 邮箱：PulseOptiHR@163.com
- 详细文档：https://www.aizhixuan.com.cn/sync-guide

---

**完成时间**：约5分钟
**难度**：⭐⭐☆☆☆（简单）
