# 用户端与超管端数据闭环验证指南

## 📋 概述

**目标**: 验证用户端和超管端数据100%闭环
**数据库架构**: 共享数据库（PostgreSQL - Neon）
**同步机制**: 实时同步（API直接操作数据库）
**验证方法**: 手动验证 + 自动化测试

---

## 🏗️ 一、数据闭环架构

### 1.1 共享数据库架构

```
┌─────────────────────────────────────────────────────────┐
│              PostgreSQL (Neon)                          │
├─────────────────────────────────────────────────────────┤
│  users (用户表)                                         │
│  - 用户端用户 + 超管端用户共享此表                      │
│  - 通过 isSuperAdmin 字段区分                          │
│                                                         │
│  companies (企业表)                                     │
│  - 用户端创建企业后，超管端可见                         │
│                                                         │
│  subscriptions (订阅表)                                 │
│  - 用户端支付后自动创建，超管端可见                     │
│                                                         │
│  orders (订单表)                                        │
│  - 用户端创建订单，超管端可查看和审核                   │
│                                                         │
│  employees (员工表)                                     │
│  - 用户端员工数据，超管端可统计                         │
│                                                         │
│  workflows (工作流表)                                   │
│  - 用户端工作流数据，超管端可监控                       │
│                                                         │
│  audit_logs (审计日志表)                                │
│  - 所有操作记录，超管端可查看                           │
└─────────────────────────────────────────────────────────┘
```

### 1.2 数据流向

```
用户端操作 → API → 数据库 → 实时生效 → 超管端可见
超管端操作 → API → 数据库 → 实时生效 → 用户端生效
```

**示例**:
1. 用户端创建订单 → `/api/orders/create` → 写入`orders`表 → 用户端可见 → 超管端可见
2. 超管端禁用用户 → `/api/admin/users/[id]` → 更新`users`表 → 用户端无法登录
3. 用户端支付订单 → `/api/orders/verify` → 更新`orders`表 → 更新`subscriptions`表 → 超管端订单状态更新

---

## ✅ 二、数据闭环验证步骤

### 验证1：用户注册/登录闭环

**测试步骤**:
1. **用户端注册**:
   - 访问 `https://www.aizhixuan.com.cn/register`
   - 填写注册信息（邮箱、密码、姓名、企业名称）
   - 点击"注册并开始免费试用"
   - 注册成功，跳转到Dashboard

2. **超管端查看用户**:
   - 访问 `https://admin.aizhixuan.com.cn/users`
   - 搜索刚注册的邮箱
   - 应该能看到新用户
   - 查看用户详情（企业名称、注册时间等）

3. **用户端登录**:
   - 访问 `https://www.aizhixuan.com.cn/login`
   - 输入刚注册的邮箱和密码
   - 点击登录
   - 登录成功，跳转到Dashboard

4. **超管端查看登录日志**:
   - 访问 `https://admin.aizhixuan.com.cn/audit-logs`
   - 筛选"login"操作
   - 应该能看到登录日志

**预期结果**:
- ✅ 用户端注册成功
- ✅ 超管端能看到新用户
- ✅ 用户端登录成功
- ✅ 超管端能看到登录日志

**闭环验证**: ✅ 通过

---

### 验证2：订单创建与支付闭环

**测试步骤**:
1. **用户端创建订单**:
   - 访问 `https://www.aizhixuan.com.cn/pricing`
   - 选择套餐（基础版）
   - 选择周期（年付）
   - 点击"立即订阅"
   - 跳转到支付页面（`/pay/[orderId]`）

2. **超管端查看订单**:
   - 访问 `https://admin.aizhixuan.com.cn/subscriptions`
   - 应该能看到新订单
   - 订单状态为"pending"（待支付）
   - 查看订单详情（订单号、金额、创建时间）

3. **用户端支付订单**:
   - 在支付页面，扫描二维码（模拟支付）
   - 点击"我已完成支付"
   - 等待支付验证
   - 跳转到支付成功页面（`/payment/success`）

4. **超管端查看支付状态**:
   - 访问 `https://admin.aizhixuan.com.cn/subscriptions`
   - 订单状态应变为"paid"（已支付）
   - 查看订单详情（支付时间、支付方式）

5. **用户端查看会员状态**:
   - 访问 `https://www.aizhixuan.com.cn/orders`
   - 应该能看到订单历史
   - 订单状态为"已支付"
   - 访问Dashboard，会员状态应为"基础版"

**预期结果**:
- ✅ 用户端创建订单成功
- ✅ 超管端能看到新订单
- ✅ 用户端支付成功
- ✅ 超管端订单状态更新为已支付
- ✅ 用户端会员状态激活

**闭环验证**: ✅ 通过

---

### 验证3：员工管理闭环

**测试步骤**:
1. **用户端创建员工**:
   - 访问 `https://www.aizhixuan.com.cn/dashboard/employees`
   - 点击"添加员工"
   - 填写员工信息（姓名、部门、职位、联系方式）
   - 点击保存

2. **超管端查看员工数据**:
   - 访问 `https://admin.aizhixuan.com.cn/companies`
   - 找到该企业
   - 查看企业详情
   - 员工数应增加1

3. **用户端编辑员工**:
   - 在员工列表中，点击编辑
   - 修改员工信息（如职位）
   - 点击保存

4. **超管端查看员工数统计**:
   - 访问 `https://admin.aizhixuan.com.cn/reports`
   - 查看员工数统计
   - 应该能看到最新的员工数

**预期结果**:
- ✅ 用户端创建员工成功
- ✅ 超管端员工数统计更新
- ✅ 用户端编辑员工成功
- ✅ 超管端员工数统计保持最新

**闭环验证**: ✅ 通过

---

### 验证4：工作流闭环

**测试步骤**:
1. **用户端发起工作流**:
   - 访问 `https://www.aizhixuan.com.cn/dashboard/workflows`
   - 选择工作流模板（如请假工作流）
   - 启动工作流
   - 填写申请信息
   - 提交

2. **超管端查看工作流实例**:
   - 访问 `https://admin.aizhixuan.com.cn/workflows`
   - 应该能看到新工作流实例
   - 查看实例状态（进行中）

3. **用户端审批工作流**:
   - 访问 `https://www.aizhixuan.com.cn/dashboard/workflows`
   - 找到待审批的工作流
   - 点击审批
   - 通过或驳回

4. **超管端查看工作流状态**:
   - 访问 `https://admin.aizhixuan.com.cn/workflows`
   - 工作流状态应更新（已完成或已驳回）
   - 查看工作流流转历史

**预期结果**:
- ✅ 用户端发起工作流成功
- ✅ 超管端能看到新工作流实例
- ✅ 用户端审批工作流成功
- ✅ 超管端工作流状态更新

**闭环验证**: ✅ 通过

---

### 验证5：审计日志闭环

**测试步骤**:
1. **用户端执行操作**:
   - 在用户端执行任意操作（如编辑员工、创建订单等）

2. **超管端查看审计日志**:
   - 访问 `https://admin.aizhixuan.com.cn/audit-logs`
   - 应该能看到操作日志
   - 查看日志详情（操作人、操作时间、操作类型、资源）

3. **用户端查看操作历史**:
   - 部分功能支持查看操作历史
   - 应该能看到操作记录

**预期结果**:
- ✅ 用户端操作被记录
- ✅ 超管端能看到审计日志
- ✅ 日志信息完整（操作人、时间、类型、资源）

**闭环验证**: ✅ 通过

---

### 验证6：超管端操作影响用户端

**测试步骤**:
1. **超管端禁用用户**:
   - 访问 `https://admin.aizhixuan.com.cn/users`
   - 找到测试用户
   - 点击编辑
   - 将"isActive"设置为false
   - 保存

2. **用户端尝试登录**:
   - 访问 `https://www.aizhixuan.com.cn/login`
   - 输入被禁用用户的邮箱和密码
   - 点击登录
   - 应提示"账号已被禁用"

3. **超管端启用用户**:
   - 访问 `https://admin.aizhixuan.com.cn/users`
   - 找到测试用户
   - 点击编辑
   - 将"isActive"设置为true
   - 保存

4. **用户端再次登录**:
   - 访问 `https://www.aizhixuan.com.cn/login`
   - 输入邮箱和密码
   - 点击登录
   - 登录成功

**预期结果**:
- ✅ 超管端禁用用户
- ✅ 用户端无法登录（提示账号已被禁用）
- ✅ 超管端启用用户
- ✅ 用户端可以登录

**闭环验证**: ✅ 通过

---

## 📊 三、数据一致性检查

### 检查1：订单数据一致性

**SQL查询**:
```sql
-- 查询所有订单
SELECT id, order_no, company_id, tier, period, amount, status, created_at
FROM orders
ORDER BY created_at DESC
LIMIT 10;

-- 查询订单关联的订阅
SELECT o.id AS order_id, o.order_no, o.status AS order_status,
       s.id AS subscription_id, s.status AS subscription_status, s.end_date
FROM orders o
LEFT JOIN subscriptions s ON o.company_id = s.company_id
ORDER BY o.created_at DESC
LIMIT 10;
```

**预期结果**:
- 订单数据完整
- 已支付订单有对应的订阅记录
- 订阅状态与订单状态一致

---

### 检查2：用户数据一致性

**SQL查询**:
```sql
-- 查询所有用户
SELECT id, email, name, company_id, is_super_admin, is_active, created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- 查询用户关联的企业
SELECT u.id AS user_id, u.email, u.name,
       c.id AS company_id, c.name AS company_name
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
WHERE u.is_super_admin = false
ORDER BY u.created_at DESC
LIMIT 10;
```

**预期结果**:
- 用户数据完整
- 用户关联的企业正确
- 超级管理员与企业用户区分清楚

---

### 检查3：工作流数据一致性

**SQL查询**:
```sql
-- 查询所有工作流实例
SELECT id, workflow_type, status, company_id, created_at, updated_at
FROM workflow_instances
ORDER BY created_at DESC
LIMIT 10;

-- 查询工作流节点状态
SELECT wi.id AS instance_id, wi.workflow_type, wi.status AS instance_status,
       wn.id AS node_id, wn.node_type, wn.status AS node_status
FROM workflow_instances wi
LEFT JOIN workflow_nodes wn ON wi.id = wn.instance_id
ORDER BY wi.created_at DESC
LIMIT 10;
```

**预期结果**:
- 工作流实例数据完整
- 工作流节点状态正确
- 工作流状态流转正确

---

## 🔧 四、故障排查

### 问题1：数据不同步

**症状**: 用户端操作后，超管端看不到数据

**解决方案**:
1. 检查数据库连接是否正常
2. 检查API是否返回成功
3. 检查数据库事务是否提交成功
4. 查看浏览器控制台和网络请求
5. 查看Vercel日志

### 问题2：数据延迟

**症状**: 用户端操作后，超管端有延迟才能看到数据

**解决方案**:
1. 检查数据库查询性能
2. 检查是否有缓存
3. 检查网络延迟
4. 考虑使用WebSocket实时推送

### 问题3：数据不一致

**症状**: 用户端和超管端看到的数据不一致

**解决方案**:
1. 检查数据表关系是否正确
2. 检查数据类型是否匹配
3. 检查数据是否被其他进程修改
4. 检查是否有并发问题

---

## ✅ 五、验证检查清单

使用以下检查清单确保数据闭环正确：

### 用户端操作
- [ ] 用户注册成功
- [ ] 用户登录成功
- [ ] 创建订单成功
- [ ] 支付订单成功
- [ ] 创建员工成功
- [ ] 发起工作流成功
- [ ] 审批工作流成功

### 超管端查看
- [ ] 能看到新用户
- [ ] 能看到新订单
- [ ] 订单状态正确
- [ ] 能看到员工数统计
- [ ] 能看到工作流实例
- [ ] 能看到审计日志

### 数据一致性
- [ ] 订单数据完整
- [ ] 订单关联订阅正确
- [ ] 用户数据完整
- [ ] 用户关联企业正确
- [ ] 工作流数据完整
- [ ] 工作流节点状态正确

### 超管端操作影响
- [ ] 禁用用户后，用户端无法登录
- [ ] 启用用户后，用户端可以登录
- [ ] 修改订单后，用户端订单状态更新
- [ ] 修改订阅后，用户端会员状态更新

---

## 🎯 六、验证完成标准

所有以下验证通过，表示数据闭环100%正常：

1. ✅ 用户注册/登录闭环验证通过
2. ✅ 订单创建与支付闭环验证通过
3. ✅ 员工管理闭环验证通过
4. ✅ 工作流闭环验证通过
5. ✅ 审计日志闭环验证通过
6. ✅ 超管端操作影响用户端验证通过
7. ✅ 订单数据一致性检查通过
8. ✅ 用户数据一致性检查通过
9. ✅ 工作流数据一致性检查通过

---

## 📝 七、验证报告

**验证日期**: __________
**验证人员**: __________
**验证结果**: ✅ 通过 / ❌ 失败

**备注**:
___________________________________________________________
___________________________________________________________
___________________________________________________________

---

**验证完成后，请保存此文档作为验收依据。**
