# PulseOpti HR 脉策聚效 - 部署指南

## 自动部署到 Vercel

本项目已配置 Vercel 自动部署。当代码推送到 GitHub 后，Vercel 会自动触发部署流程。

### 触发自动部署的方法

1. **推送代码到 GitHub**：
   ```bash
   git add .
   git commit -m "feat: 新功能更新"
   git push origin main
   ```
   推送后，Vercel 会自动检测到变更并开始部署。

2. **创建 Pull Request**：
   当你创建或更新 Pull Request 时，Vercel 会自动为该分支创建预览部署。

3. **手动触发部署**：
   - 登录 [Vercel Dashboard](https://vercel.com/dashboard)
   - 选择你的项目
   - 点击 "Deployments" 标签
   - 点击右上角的 "Redeploy" 按钮

### 环境变量配置

在 Vercel 项目设置中配置以下环境变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `COZE_BUCKET_ENDPOINT_URL` | 对象存储端点 | `https://oss.example.com` |
| `COZE_BUCKET_NAME` | 对象存储桶名称 | `pulseopti-hr` |
| `DATABASE_URL` | 数据库连接字符串 | `postgresql://user:pass@host:port/db` |

### 部署流程

1. Vercel 拉取最新代码
2. 安装依赖：`pnpm install`
3. 构建项目：`pnpm build`
4. 部署到 Vercel CDN

### 部署验证

部署完成后，访问：
- 生产环境：`https://pulseopti-hr.vercel.app`
- 预览环境：`https://pulseopti-hr-xxx.vercel.app`（PR 预览链接）

### 常见问题

**Q: 部署失败怎么办？**
A: 检查 Vercel 构建日志，查看错误信息。常见原因：
- 依赖安装失败
- 环境变量缺失
- 构建超时

**Q: 如何回滚？**
A: 在 Vercel Dashboard 的 Deployments 页面，选择之前的部署版本，点击 "Promote to Production"。

**Q: 如何设置自定义域名？**
A: 在 Vercel 项目设置的 Domains 页面添加自定义域名，并配置 DNS。

## 本地开发

### 启动开发服务器
```bash
pnpm dev
```

### 构建生产版本
```bash
pnpm build
```

### 运行生产版本
```bash
pnpm start
```

## 技术栈

- **框架**：Next.js 16 (App Router)
- **React**：React 19
- **TypeScript**：TypeScript 5
- **UI 组件**：shadcn/ui
- **样式**：Tailwind CSS 4
- **数据库**：PostgreSQL (Neon)
- **ORM**：Drizzle ORM
- **对象存储**：S3 兼容存储
- **部署**：Vercel

## 功能特性

✅ 用户认证与授权
✅ 多租户隔离
✅ RBAC 权限管理
✅ 组织人事管理
✅ 招聘管理
✅ 绩效管理
✅ 薪酬管理
✅ 考勤管理
✅ 工作流引擎
✅ AI 智能助手
✅ 数据同步机制
✅ 订阅管理
✅ 审计日志

## 联系方式

- 邮箱：PulseOptiHR@163.com
- 地址：广州市天河区
- 服务时间：周一至周五 9:00-12:00, 14:00-18:00

## 许可证

MIT License
