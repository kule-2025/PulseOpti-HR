# Vercel 环境变量配置

## 🚨 当前问题

Vercel 构建失败，错误信息：
```
Error: API key is required. Set COZE_WORKLOAD_IDENTITY_API_KEY or provide apiKey in config.
```

## 🔍 问题原因

Vercel **不会**自动读取 `.env.production` 文件中的环境变量。环境变量必须在 **Vercel 控制台中手动配置**。

## ✅ 解决方案

### 快速配置步骤

1. **访问 Vercel 控制台**
   - 登录：https://vercel.com/dashboard
   - 进入项目：`PulseOpti-HR`

2. **进入环境变量设置**
   - 点击 "Settings" 标签
   - 点击左侧 "Environment Variables"

3. **添加必需的环境变量**

   逐一添加以下环境变量（选中 "Production" 环境）：

   ```bash
   # AI集成配置
   COZE_WORKLOAD_IDENTITY_API_KEY = a915ab35-9534-43ad-b925-d9102c5007ba

   # 对象存储配置
   COZE_BUCKET_ENDPOINT_URL = https://s3.cn-beijing.amazonaws.com.cn
   COZE_BUCKET_NAME = pulseopti-hr-storage

   # 数据库配置
   DATABASE_URL = postgresql://neondb_owner:npg_vWZaXz1Ai4jp@ep-dry-sunset-ah7xpibr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

   # JWT认证配置
   JWT_SECRET = a915ab35-9534-43ad-b925-d9102c5007ba-PulseOpti-HR-JWT-Secret-Key-2025-01-19-PROD
   JWT_EXPIRES_IN = 7d

   # 应用配置
   NEXT_PUBLIC_APP_URL = https://www.aizhixuan.com.cn
   NODE_ENV = production

   # 超级管理员账号
   ADMIN_EMAIL = 208343256@qq.com
   ADMIN_PASSWORD = admin123
   ```

4. **重新部署**
   - 返回 "Deployments" 标签
   - 点击最新部署右侧的 "..." 菜单
   - 选择 "Redeploy"

## 📋 完整环境变量列表

详见：
- 📄 [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md) - 详细配置指南
- 📄 [.env.vercel](./.env.vercel) - 环境变量列表文件

## 🎯 关键点

1. **必须配置的环境变量**：
   - `COZE_WORKLOAD_IDENTITY_API_KEY` - 解决当前构建错误
   - `DATABASE_URL` - 数据库连接
   - `JWT_SECRET` - JWT认证

2. **配置完成后**：
   - 环境变量会自动应用到新的部署
   - 无需修改代码

3. **最佳实践**：
   - 使用 Production 环境变量
   - 敏感信息不要提交到 Git
   - 定期轮换密钥

## 📚 参考文档

- [Vercel 环境变量文档](https://vercel.com/docs/projects/environment-variables)
- [Next.js 环境变量文档](https://nextjs.org/docs/basic-features/environment-variables)
