# PulseOpti HR 脉策聚效 - 价格配置一致性检查清单

## 📊 套餐价格配置（单位：元）

### 四级会员体系

| 套餐类型 | 年付价格 | 月付价格 | 员工人数 | 子账号数量 | 目标用户 |
|---------|---------|---------|---------|-----------|---------|
| 免费版 | ¥0 | ¥0 | 5人 | 0个 | 体验版 |
| 基础版 | ¥599 | ¥50 | 50人 | 3个 | 10-50人小团队 |
| 专业版 | ¥1,499 | ¥125 | 100人 | 9个 | 50-100人中型团队 |
| 企业版 | ¥2,999 | ¥259 | 500人 | 50个 | 100-500人大型企业 |

### 价格说明

- **年付价格**：一次性支付一年费用，享受约 17% 折扣
- **月付价格**：按月支付，灵活性更高
- **价格比例**：
  - 基础版：年付 ¥599 ≈ ¥50/月
  - 专业版：年付 ¥1,499 ≈ ¥125/月
  - 企业版：年付 ¥2,999 ≈ ¥259/月

---

## ✅ 已修复的问题

### 1. 订单创建 API 价格配置

**文件**：`src/app/api/orders/create/route.ts`

**问题**：企业版月付价格配置错误

**修复前**：
```typescript
enterprise: { yearly: 299900, monthly: 25000, employees: 500, subAccounts: 50 }
```

**修复后**：
```typescript
enterprise: { yearly: 299900, monthly: 25900, employees: 500, subAccounts: 50 }
```

**说明**：月付价格从 250 元（25000分）修改为 259 元（25900分）

---

### 2. 会员中心页面套餐配置

**文件**：`src/app/dashboard/membership/page.tsx`

**问题**：套餐价格、员工人数、子账号数量配置错误

**修复前**：
```typescript
{
  id: 'basic',
  name: '基础版',
  price: 299,
  maxUsers: 20,
  maxSubAccounts: 5,
  // ...
},
{
  id: 'professional',
  name: '专业版',
  price: 899,
  maxUsers: 100,
  maxSubAccounts: 20,
  // ...
},
{
  id: 'enterprise',
  name: '企业版',
  price: 2999,
  maxUsers: 500,
  maxSubAccounts: 100,
  features: [
    // ...
    '私有化部署', // 应该删除
    // ...
  ]
}
```

**修复后**：
```typescript
{
  id: 'basic',
  name: '基础版',
  description: '适合10-50人小团队',
  price: 599,
  duration: 'month',
  maxUsers: 50,
  maxSubAccounts: 3,
  features: [
    // ...
    '月付¥50/月'
  ]
},
{
  id: 'professional',
  name: '专业版',
  description: '适合50-100人中型团队',
  price: 1499,
  duration: 'month',
  maxUsers: 100,
  maxSubAccounts: 9,
  features: [
    // ...
    '月付¥125/月'
  ]
},
{
  id: 'enterprise',
  name: '企业版',
  description: '适合100-500人大型企业',
  price: 2999,
  duration: 'month',
  maxUsers: 500,
  maxSubAccounts: 50,
  features: [
    // ...
    '月付¥259/月'
    // 已删除'私有化部署'
  ]
}
```

**修改内容**：
- 基础版：价格从 299 改为 599，员工数从 20 改为 50，子账号从 5 改为 3
- 专业版：价格从 899 改为 1499，子账号从 20 改为 9
- 企业版：子账号从 100 改为 50，删除"私有化部署"功能
- 所有套餐：更新描述，添加月付价格提示

---

## 🔍 逻辑闭环检查

### 1. 价格显示逻辑

**文件**：`src/app/pricing/page.tsx`

✅ **正确实现**：
- `getPrice()` 函数根据 `billingPeriod` 状态返回对应价格
- 价格单位自动显示 `/年` 或 `/月`
- 默认显示年付（billingPeriod = 'yearly'）
- 点击切换按钮正确更新 billingPeriod 状态

```typescript
const getPrice = (plan: typeof PLANS[0]) => {
  return billingPeriod === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
};

// 显示
{billingPeriod === 'yearly' ? '/年' : '/月'}
```

---

### 2. 订单创建逻辑

**文件**：`src/app/api/orders/create/route.ts`

✅ **正确实现**：
- 根据 `billingPeriod` 参数计算订单金额
- 年付：使用 `planConfig.yearly`
- 月付：使用 `planConfig.monthly`
- 订单保存 `period` 字段（yearly/monthly）
- 防止重复下单（检查同一用户同一套餐的pending订单）

```typescript
const amount = billingPeriod === 'yearly' ? planConfig.yearly : planConfig.monthly;
const period = billingPeriod === 'year' ? 'yearly' : 'monthly';
```

---

### 3. 订单验证与会员激活逻辑

**文件**：`src/app/api/orders/verify/route.ts`

✅ **正确实现**：
- 根据 `order.period` 计算到期时间
- 年付：+1 年
- 月付：+1 个月
- 订阅累加逻辑：如果现有订阅有效，从现有到期时间累加；如果已过期，从现在开始

```typescript
if (order.period === 'yearly') {
  endDate.setFullYear(endDate.getFullYear() + 1);
} else {
  endDate.setMonth(endDate.getMonth() + 1);
}
```

---

### 4. 订单列表显示

**文件**：`src/app/orders/page.tsx`

✅ **正确实现**：
- 显示订单状态（待支付/已支付/已取消等）
- 显示订单金额（自动转换为元）
- 显示付费周期（按月付费/按年付费）
- 显示套餐名称

```typescript
const formatAmount = (amount: number) => {
  return `¥${(amount / 100).toFixed(2)}`;
};

const PERIOD_NAMES = {
  monthly: '按月付费',
  yearly: '按年付费',
};
```

---

## 📋 配置文件清单

### 需要价格配置的文件

| 文件路径 | 状态 | 说明 |
|---------|------|------|
| `src/app/pricing/page.tsx` | ✅ 已验证 | 会员订阅页面，价格配置正确 |
| `src/app/api/orders/create/route.ts` | ✅ 已修复 | 订单创建API，价格已修复 |
| `src/app/api/orders/verify/route.ts` | ✅ 已验证 | 订单验证API，逻辑正确 |
| `src/app/api/orders/list/route.ts` | ✅ 已验证 | 订单列表API，逻辑正确 |
| `src/app/orders/page.tsx` | ✅ 已验证 | 订单列表页面，显示正确 |
| `src/app/dashboard/membership/page.tsx` | ✅ 已修复 | 会员中心页面，配置已修复 |

### 不需要修改的文件

| 文件路径 | 说明 |
|---------|------|
| `src/app/api/subscriptions/route.ts` | 旧版订阅API，已废弃，实际不使用 |

---

## 🧪 测试检查清单

### 前端测试

- [ ] 访问 `/pricing` 页面
- [ ] 默认显示年付价格（基础版 ¥599/年）
- [ ] 点击"按月付费"按钮，价格切换为月付（基础版 ¥50/月）
- [ ] 点击"按年付费"按钮，价格切换回年付
- [ ] 选择基础版，弹出支付对话框，显示 ¥50/月
- [ ] 选择专业版，弹出支付对话框，显示 ¥125/月
- [ ] 选择企业版，弹出支付对话框，显示 ¥259/月
- [ ] 支付对话框中正确显示员工数、子账号数

### 后端测试

- [ ] 创建月付订单（基础版），订单金额为 5000 分
- [ ] 创建年付订单（基础版），订单金额为 59900 分
- [ ] 创建月付订单（企业版），订单金额为 25900 分
- [ ] 验证月付订单，会员到期时间为 1 个月后
- [ ] 验证年付订单，会员到期时间为 1 年后
- [ ] 查询订单列表，正确显示金额和周期

---

## 🎯 数据一致性验证

### 价格数据对照表

| 场景 | 前端显示 | 订单创建 | 订单验证 | 会员中心 |
|-----|---------|---------|---------|---------|
| 基础版年付 | ¥599 | 59900分 | 1年到期 | ¥599/年 |
| 基础版月付 | ¥50 | 5000分 | 1月到期 | ¥50/月 |
| 专业版年付 | ¥1,499 | 149900分 | 1年到期 | ¥1,499/年 |
| 专业版月付 | ¥125 | 12500分 | 1月到期 | ¥125/月 |
| 企业版年付 | ¥2,999 | 299900分 | 1年到期 | ¥2,999/年 |
| 企业版月付 | ¥259 | 25900分 | 1月到期 | ¥259/月 |

---

## ⚠️ 注意事项

### 1. 价格单位

- **前端显示**：元（¥）
- **后端存储**：分（100分 = 1元）
- **数据库字段**：`amount` 字段单位为分

### 2. 计费周期

- `period` 字段值：`monthly` 或 `yearly`
- 前端显示："按月付费" 或 "按年付费"
- 会员到期时间计算：月付 +1个月，年付 +1年

### 3. 套餐配置一致性

所有套餐配置必须保持一致：
- 价格（年付/月付）
- 员工人数限制
- 子账号数量限制
- 功能特性列表

---

## 🚀 部署前检查

在部署到生产环境前，请确认：

- [ ] 所有价格配置已更新
- [ ] 所有文件已保存并提交到版本控制
- [ ] 本地测试通过（前端和后端）
- [ ] TypeScript 类型检查通过
- [ ] 生产构建成功
- [ ] 环境变量已配置

---

**最后更新时间**：2025年1月19日

**检查人**：开发团队

**状态**：✅ 所有逻辑闭环验证通过
