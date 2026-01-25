# 📋 快速参考卡片 - 代码修复要点

## 🎯 需要处理的6个文件

| # | 文件路径 | 操作类型 | 关键修改 |
|---|---------|---------|---------|
| 1 | `src/lib/auth/verification.ts` | 新建 | 创建验证码管理工具 |
| 2 | `src/app/api/auth/send-email/route.ts` | 替换 | 从 `@/lib/auth/verification` 导入 |
| 3 | `src/app/api/auth/send-sms/route.ts` | 替换 | 从 `@/lib/auth/verification` 导入 |
| 4 | `src/app/api/auth/register/email/route.ts` | 修改 | **第9行导入语句** |
| 5 | `src/app/api/auth/register/sms/route.ts` | 修改 | **第9行导入语句** |
| 6 | `src/storage/database/shared/schema.ts` | 添加 | 在文件末尾添加 systemSettings 表 |

---

## ⚡ 关键修改点（仅需修改的部分）

### 修改点1：src/app/api/auth/register/email/route.ts - 第9行

**旧代码：**
```typescript
import { verifyEmailCode } from '@/app/api/auth/send-email/route';
```

**新代码：**
```typescript
import { verifyEmailCode } from '@/lib/auth/verification';
```

---

### 修改点2：src/app/api/auth/register/sms/route.ts - 第9行

**旧代码：**
```typescript
import { verifySmsCode } from '@/app/api/auth/send-sms/route';
```

**新代码：**
```typescript
import { verifySmsCode } from '@/lib/auth/verification';
```

---

### 修改点3：src/storage/database/shared/schema.ts - 文件末尾

**添加以下代码：**

```typescript
// 系统设置表
export const systemSettings = pgTable('systemSettings', {
  id: serial('id').primaryKey(),
  siteName: varchar('siteName', { length: 255 }).notNull().default('PulseOpti HR 脉策聚效'),
  siteUrl: varchar('siteUrl', { length: 500 }).notNull(),
  logoUrl: varchar('logoUrl', { length: 500 }),
  enableRegistration: boolean('enableRegistration').notNull().default(true),
  maintenanceMode: boolean('maintenanceMode').notNull().default(false),
  supportEmail: varchar('supportEmail', { length: 255 }).notNull().default('PulseOptiHR@163.com'),
  supportPhone: varchar('supportPhone', { length: 20 }),
  address: varchar('address', { length: 500 }).notNull().default('广州市天河区'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Type inference
export type SystemSettings = typeof systemSettings.$inferSelect;
export type NewSystemSettings = typeof systemSettings.$inferInsert;
```

---

## 📝 完整文件内容

所有文件的完整代码请查看 `COMPLETE_CODE_REPLACEMENT_GUIDE.md` 文件。

---

## 🚀 快速执行命令

```cmd
REM 1. 进入项目目录
cd C:\PulseOpti-HR

REM 2. 创建文件夹
mkdir src\lib\auth

REM 3. 创建文件（需要手动复制粘贴代码）
REM    - src\lib\auth\verification.ts
REM    - src\app\api\auth\send-email\route.ts
REM    - src\app\api\auth\send-sms\route.ts
REM    - 修改 src\app\api\auth\register\email\route.ts (第9行)
REM    - 修改 src\app\api\auth\register\sms\route.ts (第9行)
REM    - 修改 src\storage\database\shared\schema.ts (文件末尾)

REM 4. 提交代码
git add .
git commit -m "fix: 修复验证码导入错误和systemSettings表定义缺失"
git push

REM 5. 部署到Vercel
vercel --prod --yes
```

---

## ✅ 修复后的预期效果

1. ✅ Vercel 构建成功，0个错误
2. ✅ 超管端可以正常访问：https://admin.aizhixuan.com.cn
3. ✅ 前端注册功能正常工作
4. ✅ 验证码发送和验证功能正常

---

## 🔍 问题排查

如果修改后仍然失败，请检查：

1. **导入路径是否正确**：确保使用 `@/lib/auth/verification` 而不是旧的路径
2. **schema.ts 是否添加成功**：确保在文件末尾正确添加了 systemSettings 表定义
3. **代码是否完整复制**：确保复制了完整的代码，没有遗漏
4. **文件是否正确保存**：确保所有文件都已保存
5. **Git 是否正确推送**：确保 `git push` 成功，Vercel 能获取到最新代码

---

## 📞 需要帮助？

如果遇到问题，请参考以下文档：

- `COMPLETE_CODE_REPLACEMENT_GUIDE.md` - 完整的详细指南
- `BUILD_FIX_SUMMARY.md` - 构建错误总结
- `FIX_VERCEL_REGIONS_ERROR.md` - Vercel 配置修复
