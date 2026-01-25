# PulseOpti HR - 沙箱到本地文件同步清单

> 生成时间：2025-06-18
> 项目版本：v0.1.0
> 同步范围：完整项目文件覆盖

## 📋 同步总览

- **前端页面**：82个（新增超管端13个页面）
- **后端API**：88个（新增超管端API、AI功能API）
- **数据库表**：59个
- **业务管理器**：36个
- **工作流管理器**：8个
- **配置文件**：6个
- **文档文件**：60+
- **工具库**：14个

## 🎯 核心文件同步清单

### 1. 根目录配置文件

```
✅ package.json
✅ tsconfig.json
✅ next.config.ts
✅ tailwind.config.ts
✅ drizzle.config.ts
✅ vercel.json
✅ vercel.optimized.json
✅ .env.example
✅ .coze
```

### 2. 前端页面 (src/app/)

#### 2.1 超管端页面 (新增13个)
```
✅ src/app/admin/page.tsx
✅ src/app/admin/login/page.tsx
✅ src/app/admin/dashboard/page.tsx
✅ src/app/admin/users/page.tsx
✅ src/app/admin/users/[id]/page.tsx
✅ src/app/admin/companies/page.tsx
✅ src/app/admin/companies/[id]/page.tsx
✅ src/app/admin/subscriptions/page.tsx
✅ src/app/admin/reports/page.tsx
✅ src/app/admin/settings/page.tsx
✅ src/app/admin/audit-logs/page.tsx
✅ src/app/admin/sub-accounts/page.tsx
✅ src/app/admin/workflows/page.tsx
```

#### 2.2 主要业务页面 (69个)
```
✅ src/app/page.tsx (首页)
✅ src/app/login/page.tsx
✅ src/app/forgot-password/page.tsx
✅ src/app/membership/page.tsx
✅ src/app/orders/page.tsx
✅ src/app/contact/page.tsx
✅ src/app/docs/page.tsx
✅ src/app/features/page.tsx
✅ src/app/pricing/page.tsx
✅ src/app/privacy/page.tsx

✅ src/app/dashboard/page.tsx (仪表盘)
✅ src/app/dashboard/overview/page.tsx
✅ src/app/dashboard/membership/page.tsx
✅ src/app/dashboard/feishu-dashboard/page.tsx
✅ src/app/dashboard/ai-interview/page.tsx
✅ src/app/dashboard/ai-training/page.tsx
✅ src/app/dashboard/salary-analytics/page.tsx
✅ src/app/dashboard/workflow-editor/page.tsx

✅ src/app/employees/page.tsx
✅ src/app/organization/page.tsx
✅ src/app/recruitment/page.tsx
✅ src/app/recruitment/candidates/page.tsx
✅ src/app/recruitment/jobs/page.tsx
✅ src/app/recruitment/offers/page.tsx
✅ src/app/recruitment/interview-scheduling/page.tsx
✅ src/app/recruitment/job-posting/page.tsx
✅ src/app/recruitment/offer-management/page.tsx

✅ src/app/performance/page.tsx
✅ src/app/performance/cycles/page.tsx
✅ src/app/performance/goal-setting/page.tsx
✅ src/app/performance/performance-assessment/page.tsx
✅ src/app/performance/result-analysis/page.tsx

✅ src/app/attendance/page.tsx
✅ src/app/attendance/clock-in/page.tsx
✅ src/app/attendance/scheduling/page.tsx
✅ src/app/attendance/leave-approval/page.tsx
✅ src/app/attendance/overtime/page.tsx

✅ src/app/compensation/page.tsx
✅ src/app/compensation/salary-calculation/page.tsx
✅ src/app/compensation/salary-structure/page.tsx
✅ src/app/compensation/social-insurance/page.tsx

✅ src/app/training/page.tsx
✅ src/app/offboarding/page.tsx
✅ src/app/compliance/page.tsx
✅ src/app/points/page.tsx
✅ src/app/points/dashboard/page.tsx
✅ src/app/points/rules/page.tsx
✅ src/app/points/records/page.tsx
✅ src/app/points/exchange/page.tsx
✅ src/app/points/reports/page.tsx

✅ src/app/ai/page.tsx
✅ src/app/ai-assistant/page.tsx
✅ src/app/ai-prediction/page.tsx
✅ src/app/analytics/page.tsx
✅ src/app/efficiency/page.tsx
✅ src/app/hr-reports/page.tsx
✅ src/app/job-hierarchy/page.tsx
✅ src/app/job-profile/page.tsx
✅ src/app/lifecycle/page.tsx
✅ src/app/employee-portal/page.tsx
✅ src/app/data-migration/page.tsx
✅ src/app/cases/page.tsx
```

### 3. 后端API端点 (src/app/api/)

#### 3.1 超管端API (新增14个)
```
✅ src/app/api/admin/dashboard/stats/route.ts
✅ src/app/api/admin/users/route.ts
✅ src/app/api/admin/users/[id]/route.ts
✅ src/app/api/admin/companies/route.ts
✅ src/app/api/admin/companies/[id]/route.ts
✅ src/app/api/admin/subscriptions/route.ts
✅ src/app/api/admin/subscriptions/[id]/route.ts
✅ src/app/api/admin/reports/stats/route.ts
✅ src/app/api/admin/settings/route.ts
✅ src/app/api/admin/audit-logs/route.ts
✅ src/app/api/admin/sub-accounts/route.ts
✅ src/app/api/admin/sub-accounts/[id]/route.ts
✅ src/app/api/admin/sub-accounts/quota/route.ts
✅ src/app/api/admin/init/plans/route.ts
```

#### 3.2 主要业务API (74个)
```
✅ src/app/api/auth/login/route.ts
✅ src/app/api/auth/register/route.ts
✅ src/app/api/auth/register/sms/route.ts
✅ src/app/api/auth/register/email/route.ts
✅ src/app/api/auth/verify/route.ts
✅ src/app/api/auth/me/route.ts
✅ src/app/api/auth/reset-password/route.ts
✅ src/app/api/auth/send-sms/route.ts
✅ src/app/api/auth/send-email/route.ts

✅ src/app/api/dashboard/stats/route.ts
✅ src/app/api/employees/route.ts
✅ src/app/api/employees/[id]/route.ts
✅ src/app/api/departments/route.ts
✅ src/app/api/jobs/route.ts

✅ src/app/api/recruitment/candidates/route.ts
✅ src/app/api/recruitment/candidates/[id]/route.ts
✅ src/app/api/recruitment/candidates/[id]/advance/route.ts
✅ src/app/api/recruitment/candidates/[id]/reject/route.ts
✅ src/app/api/recruitment/jobs/route.ts
✅ src/app/api/recruitment/interviews/route.ts
✅ src/app/api/recruitment/offers/route.ts

✅ src/app/api/performance/cycles/route.ts
✅ src/app/api/performance/records/route.ts

✅ src/app/api/attendance/clock-in/route.ts
✅ src/app/api/attendance/leave/route.ts
✅ src/app/api/attendance/overtime/route.ts
✅ src/app/api/attendance/scheduling/route.ts
✅ src/app/api/attendance/statistics/route.ts
✅ src/app/api/attendance/abnormal/route.ts

✅ src/app/api/compensation/payroll/route.ts
✅ src/app/api/compensation/smart-analysis/route.ts

✅ src/app/api/training/courses/route.ts
✅ src/app/api/training/records/route.ts
✅ src/app/api/training/ai-recommendation/route.ts

✅ src/app/api/exit-interviews/route.ts
✅ src/app/api/handovers/route.ts
✅ src/app/api/resignations/route.ts
✅ src/app/api/contracts/route.ts

✅ src/app/api/points/dashboard/route.ts
✅ src/app/api/points/rules/route.ts
✅ src/app/api/points/transactions/route.ts
✅ src/app/api/points/leaderboard/route.ts
✅ src/app/api/points/exchange-items/route.ts
✅ src/app/api/points/exchanges/route.ts

✅ src/app/api/memberships/plans/route.ts
✅ src/app/api/memberships/pricing/route.ts
✅ src/app/api/memberships/orders/route.ts
✅ src/app/api/memberships/orders/[id]/pay/route.ts
✅ src/app/api/subscriptions/route.ts

✅ src/app/api/orders/create/route.ts
✅ src/app/api/orders/verify/route.ts
✅ src/app/api/orders/list/route.ts
✅ src/app/api/payments/callback/route.ts

✅ src/app/api/workflows/route.ts
✅ src/app/api/workflows/[id]/route.ts
✅ src/app/api/workflows/instances/route.ts
✅ src/app/api/workflows/instances/[id]/route.ts
✅ src/app/api/workflows/instances/[id]/submit/route.ts
✅ src/app/api/workflows/instances/[id]/approve/route.ts
✅ src/app/api/workflows/instances/[id]/pause/route.ts
✅ src/app/api/workflows/instances/[id]/cancel/route.ts
✅ src/app/api/workflows/history/route.ts

✅ src/app/api/ai/prediction/route.ts
✅ src/app/api/ai/job-description/route.ts
✅ src/app/api/ai/talent-profile/route.ts
✅ src/app/api/ai/turnover-prediction/route.ts
✅ src/app/api/ai/turnover-analysis/route.ts
✅ src/app/api/ai/talent-grid/route.ts
✅ src/app/api/ai/idp/route.ts
✅ src/app/api/ai/advanced-prediction/route.ts
✅ src/app/api/ai/interview-score/route.ts
✅ src/app/api/ai/attribution/route.ts
✅ src/app/api/ai/recommendation/route.ts

✅ src/app/api/efficiency/dashboard/route.ts
✅ src/app/api/efficiency/prediction/route.ts
✅ src/app/api/efficiency/attribution/route.ts
✅ src/app/api/efficiency/recommendations/route.ts
✅ src/app/api/efficiency/init/route.ts

✅ src/app/api/talent/analysis/route.ts
✅ src/app/api/hr-analytics/route.ts
✅ src/app/api/reports/hr-analytics/route.ts

✅ src/app/api/interview/questions/route.ts
✅ src/app/api/interview/ai-interviewer/route.ts

✅ src/app/api/integrations/feishu/sync/route.ts

✅ src/app/api/employee-portal/profile/route.ts
```

### 4. 工具库和管理器 (src/)

#### 4.1 核心库 (14个)
```
✅ src/lib/db/index.ts
✅ src/lib/db/optimized.ts
✅ src/lib/db/schema.ts
✅ src/lib/api/index.ts
✅ src/lib/auth/jwt.ts
✅ src/lib/auth/password.ts
✅ src/lib/auth/middleware.ts
✅ src/lib/auth/permissions.ts
✅ src/lib/cache/query-cache.ts
✅ src/lib/middleware/api-timeout.ts
✅ src/lib/middleware/monitor.ts
✅ src/lib/utils/order.ts
✅ src/lib/vi/config.ts
✅ src/lib/workflow/types.ts
```

#### 4.2 业务管理器 (36个)
```
✅ src/lib/managers/*.ts (36个文件)
```

#### 4.3 工作流管理器 (8个)
```
✅ src/lib/workflows/*.ts (8个文件)
```

#### 4.4 组件 (shadcn/ui + 自定义)
```
✅ src/components/ui/*.ts (40+个UI组件)
✅ src/components/branding/Logo.tsx
✅ src/components/branding/ThemeSwitcher.tsx
✅ src/components/navigation/*.tsx (导航组件)
✅ src/components/dashboard/*.tsx (仪表盘组件)
```

### 5. 公共资源 (public/)

```
✅ public/assets/logo.svg
✅ public/assets/logo-light.svg
✅ public/assets/wechat-qr.png
✅ public/assets/alipay-qr.png
✅ public/icons/*.svg (图标文件)
✅ public/fonts/* (字体文件)
✅ public/test-success.html (测试页面)
```

### 6. 数据库配置

```
✅ drizzle.config.ts
✅ src/lib/db/schema.ts (完整59张表定义)
✅ src/lib/db/migrations/* (迁移文件)
```

### 7. 文档文件 (60+个)

#### 7.1 核心文档
```
✅ README.md
✅ README_SETUP.md
✅ QUICKSTART.md
✅ START_HERE.md
✅ DEPLOYMENT.md
✅ ENV_COMPLETE_CONFIG.md
✅ SYSTEM_AUDIT_REPORT.md
✅ FEATURE_COMPLETION_SUMMARY.md
```

#### 7.2 部署文档
```
✅ DEPLOYMENT_GUIDE.md
✅ DEPLOYMENT_STEP_BY_STEP.md
✅ DEPLOYMENT_CHECKLIST.md
✅ VERCEL_DEPLOYMENT_GUIDE.md
✅ NEON_DATABASE_SETUP.md
✅ CMD_EXECUTION_GUIDE.md
✅ CMD_EXECUTION_STEPS.md
```

#### 7.3 配置文档
```
✅ ENV_SETUP_GUIDE.md
✅ ENV_CONFIGURATION_GUIDE.md
✅ ADD_SUPER_ADMIN_CONFIG.md
✅ SUPER_ADMIN_GUIDE.md
✅ SUPER_ADMIN_CONFIG_GUIDE.md
```

#### 7.4 诊断文档
```
✅ SYSTEM_DIAGNOSIS.md
✅ QUICK_FIX_GUIDE.md
✅ TROUBLESHOOT_EXTERNAL_ACCESS.md
✅ FIX_AUTH_GUIDE.md
```

#### 7.5 优化文档
```
✅ OPTIMIZE_VERCEL_NEON.md
✅ QUICK_OPTIMIZATION.md
✅ APPLY_OPTIMIZATION.md
✅ PERFORMANCE_OPTIMIZATION.md
```

#### 7.6 同步文档
```
✅ SANDBOX_SYNC_README.md
✅ QUICKSTART_SYNC.md
✅ FILE_SYNC_CHECKLIST.md (本文件)
✅ SYNC_GUIDE.md
```

### 8. 配置和环境

```
✅ .env.example (完整环境变量模板)
✅ .coze (项目配置)
✅ vercel.json (Vercel部署配置)
✅ vercel.optimized.json (优化配置)
✅ components.json (shadcn/ui配置)
✅ tsconfig.json (TypeScript配置)
✅ tailwind.config.ts (Tailwind配置)
✅ next.config.ts (Next.js配置)
✅ package.json (依赖配置)
```

## 🔧 同步方法

### 方法1：手动同步 (推荐用于首次同步)

1. **从沙箱导出项目**
   ```bash
   # 在沙箱中打包项目
   cd /workspace/projects
   tar -czf pulseopti-hr-sync.tar.gz --exclude='node_modules' --exclude='.next' --exclude='.git' .
   ```

2. **下载到本地并解压**
   ```bash
   # 在本地解压
   tar -xzf pulseopti-hr-sync.tar.gz
   ```

3. **安装依赖**
   ```bash
   pnpm install
   ```

4. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，填入真实配置
   ```

5. **运行数据库迁移**
   ```bash
   pnpm db:push
   ```

6. **启动开发服务器**
   ```bash
   pnpm dev
   ```

### 方法2：使用Git同步 (推荐用于持续开发)

1. **在本地初始化Git仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - sync from sandbox"
   ```

2. **添加远程仓库**
   ```bash
   git remote add origin <你的GitHub仓库地址>
   git branch -M main
   git push -u origin main
   ```

3. **从沙箱拉取更新**
   ```bash
   git pull origin main
   ```

### 方法3：使用自动化脚本 (推荐)

参见 `SYNC_SANDBOX_TO_LOCAL.bat` 或 `SYNC_SANDBOX_TO_LOCAL.ps1`

## ✅ 同步后验证清单

- [ ] 依赖安装成功 (`pnpm install` 无错误)
- [ ] TypeScript类型检查通过 (`pnpm ts-check`)
- [ ] 开发服务器启动成功 (`pnpm dev` 端口5000)
- [ ] 数据库连接成功
- [ ] 超管端可以访问 (`/admin/login`)
- [ ] 用户端可以访问 (`/login`)
- [ ] 所有API端点响应正常
- [ ] 页面导航无404错误

## 📝 注意事项

1. **不要同步 node_modules**
   - 每次同步后重新安装依赖：`pnpm install`

2. **不要同步 .next 目录**
   - 每次同步后重新构建：`pnpm build`

3. **环境变量必须重新配置**
   - 复制 `.env.example` 到 `.env`
   - 填入真实的数据库URL、密钥等配置

4. **数据库迁移必须执行**
   - `pnpm db:push` 推送schema变更
   - 或 `pnpm db:migrate` 执行迁移

5. **Git管理建议**
   - 初始化Git仓库追踪变更
   - 使用 `.gitignore` 排除敏感文件
   - 定期提交代码到远程仓库

## 🆘 故障排除

### 问题1：依赖安装失败
```bash
# 清除缓存重试
rm -rf node_modules .next
pnpm install
```

### 问题2：数据库连接失败
```bash
# 检查环境变量
cat .env | grep DATABASE_URL

# 测试数据库连接
pnpm db:studio
```

### 问题3：TypeScript类型错误
```bash
# 重新生成类型
pnpm db:generate
pnpm ts-check
```

### 问题4：端口被占用
```bash
# 查看端口占用
netstat -ano | findstr :5000

# 修改端口
pnpm dev --port 3001
```

## 📞 技术支持

- 联系邮箱：PulseOptiHR@163.com
- 地址：广州市天河区
- 文档中心：/docs
- 系统诊断：/admin/settings

---

**同步完成日期**：__________
**同步执行人**：__________
**验证状态**：__________
