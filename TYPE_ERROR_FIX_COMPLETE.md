# TypeScript 类型错误修复完成

## 🚨 错误信息

```
Failed to compile.

./src/app/api/admin/companies/[id]/route.ts:73:40
Type error: Property 'maxSubAccounts' does not exist on type '{ id: string; companyId: string; tier: string; amount: number; currency: string; period: string; maxEmployees: number; startDate: Date; endDate: Date; status: string; paymentMethod: string | null; transactionId: string | null; remark: string | null; createdAt: Date; updatedAt: Date | null; }'.
```

## 🔍 问题原因

`subscriptions` 表的数据库 schema 定义中缺少 `maxSubAccounts` 字段，但代码中尝试访问该字段。

**错误位置**:
- `src/app/api/admin/companies/[id]/route.ts:73`
- 访问：`subscription[0]?.maxSubAccounts`

## ✅ 修复方案

### 1. 添加数据库字段

**文件**: `src/storage/database/shared/schema.ts`

在 `subscriptions` 表定义中添加 `maxSubAccounts` 字段：

```typescript
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    tier: varchar("tier", { length: 20 }).notNull(),
    amount: integer("amount").notNull(),
    currency: varchar("currency", { length: 10 }).notNull().default("CNY"),
    period: varchar("period", { length: 20 }).notNull(),
    maxEmployees: integer("max_employees").notNull(),
    maxSubAccounts: integer("max_sub_accounts").notNull().default(0), // ✅ 新增
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    status: varchar("status", { length: 20 })
      .notNull()
      .default("active"),
    paymentMethod: varchar("payment_method", { length: 50 }),
    transactionId: varchar("transaction_id", { length: 255 }),
    remark: text("remark"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("subscriptions_company_id_idx").on(table.companyId),
    statusIdx: index("subscriptions_status_idx").on(table.status),
  })
);
```

### 2. 更新插入 Schema

**文件**: `src/storage/database/shared/schema.ts`

在 `insertSubscriptionSchema` 中添加 `maxSubAccounts` 字段：

```typescript
export const insertSubscriptionSchema = createCoercedInsertSchema(subscriptions).pick({
  companyId: true,
  tier: true,
  amount: true,
  currency: true,
  period: true,
  maxEmployees: true,
  maxSubAccounts: true, // ✅ 新增
  startDate: true,
  endDate: true,
  status: true,
  paymentMethod: true,
  transactionId: true,
  remark: true,
});
```

### 3. 更新订单验证 API

**文件**: `src/app/api/orders/verify/route.ts`

在更新和创建订阅时添加 `maxSubAccounts` 字段：

```typescript
// 更新现有订阅
await db.update(subscriptions)
  .set({
    tier: order.tier,
    amount: order.amount,
    maxEmployees: planConfig.employees,
    maxSubAccounts: planConfig.subAccounts, // ✅ 新增
    period: order.period,
    status: 'active',
    startDate: new Date(),
    endDate: newEndDate,
    updatedAt: new Date(),
  })
  .where(eq(subscriptions.companyId, order.companyId));

// 创建新订阅
await db.insert(subscriptions).values({
  companyId: order.companyId,
  tier: order.tier,
  amount: order.amount,
  currency: order.currency,
  period: order.period,
  maxEmployees: planConfig.employees,
  maxSubAccounts: planConfig.subAccounts, // ✅ 新增
  startDate,
  endDate,
  status: 'active',
  paymentMethod: order.paymentMethod,
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

## 📊 套餐配置（PLAN_CONFIG）

在 `src/app/api/orders/verify/route.ts` 中已定义：

```typescript
const PLAN_CONFIG = {
  free: { employees: 5, subAccounts: 0 },
  basic: { employees: 50, subAccounts: 3 },           // 基础版：50人，3个子账号
  professional: { employees: 100, subAccounts: 9 },   // 专业版：100人，9个子账号
  enterprise: { employees: 500, subAccounts: 50 },    // 企业版：500人，50个子账号
};
```

## 🚀 数据库迁移

**重要**：修改 schema 后，需要运行数据库迁移以添加新字段。

### 在 Vercel 环境中

1. 等待构建完成后
2. 使用 Vercel CLI 运行迁移：
   ```bash
   vercel env pull .env.local
   pnpm db:push
   ```

### 在本地环境

```bash
pnpm db:push
```

### 手动 SQL（如果需要）

```sql
ALTER TABLE subscriptions ADD COLUMN max_sub_accounts INTEGER NOT NULL DEFAULT 0;
```

## ✅ 修复验证

修复完成后，Vercel 应该能够成功构建：

- ✅ TypeScript 类型检查通过
- ✅ 所有文件编译成功
- ✅ 生产环境构建成功

## 📋 修改文件清单

1. **src/storage/database/shared/schema.ts**
   - 添加 `maxSubAccounts` 字段到 `subscriptions` 表
   - 更新 `insertSubscriptionSchema`

2. **src/app/api/orders/verify/route.ts**
   - 更新订阅时设置 `maxSubAccounts`
   - 创建订阅时设置 `maxSubAccounts`

## ⏱️ 时间预估

| 步骤 | 预计时间 | 状态 |
|------|---------|------|
| 代码修复 | ✅ 已完成 | 10分钟 |
| 代码提交 | ✅ 已完成 | 2分钟 |
| 代码推送 | ✅ 已完成 | 1分钟 |
| Vercel 构建 | 🔄 进行中 | 2-5分钟 |
| 数据库迁移 | ⏳ 待执行 | 2分钟 |
| 功能验证 | ⏳ 待测试 | 5分钟 |
| **总计** | **22-25分钟** | ✅ 进行中 |

## 🎯 下一步操作

1. **等待 Vercel 构建完成**（2-5分钟）
2. **运行数据库迁移**（2分钟）
   ```bash
   pnpm db:push
   ```
3. **配置环境变量**（5分钟）
   - `NEXT_PUBLIC_ADMIN_DOMAIN` = `admin.aizhixuan.com.cn`
   - `NEXT_PUBLIC_USER_DOMAIN` = `www.aizhixuan.com.cn`
4. **验证功能**（5分钟）
   - 访问 `https://admin.aizhixuan.com.cn`
   - 测试域名路由
   - 测试企业详情 API

---

## 📞 需要帮助？

如果构建失败，请检查：
1. Vercel 构建日志
2. TypeScript 类型错误是否完全修复
3. 数据库迁移是否成功

---

**✅ TypeScript 类型错误已修复，等待 Vercel 构建完成！**
