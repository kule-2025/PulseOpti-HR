# HR Navigator API 文档

本文档描述了HR Navigator人力资源SaaS平台的所有API接口。

## 基础信息

- Base URL: `http://localhost:5000/api`
- 认证方式: Bearer Token (待实现)
- 数据格式: JSON
- 字符编码: UTF-8

## 通用响应格式

所有API响应都遵循以下格式：

```json
{
  "success": true,
  "message": "操作成功",
  "data": { ... }
}
```

错误响应格式：

```json
{
  "success": false,
  "error": "错误信息",
  "details": "详细错误信息"
}
```

---

## 1. 认证模块 (Auth)

### 1.1 用户注册

**接口地址:** `POST /api/auth/register`

**请求参数:**

```json
{
  "email": "user@example.com",
  "phone": "13800138000",
  "password": "password123",
  "name": "张三",
  "companyName": "示例科技有限公司",
  "industry": "互联网",
  "companySize": "51-200"
}
```

**响应示例:**

```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "userId": "xxx-xxx-xxx",
    "companyId": "xxx-xxx-xxx",
    "name": "张三",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

### 1.2 用户登录

**接口地址:** `POST /api/auth/login`

**请求参数:**

```json
{
  "account": "user@example.com",
  "password": "password123"
}
```

**响应示例:**

```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": "xxx-xxx-xxx",
      "name": "张三",
      "email": "user@example.com",
      "role": "admin"
    },
    "companyId": "xxx-xxx-xxx",
    "subscription": {
      "isValid": true,
      "tier": "free",
      "maxEmployees": 30,
      "expiresAt": "2025-12-31T00:00:00Z"
    }
  }
}
```

---

## 2. 组织人事模块 (Employees)

### 2.1 获取员工列表

**接口地址:** `GET /api/employees`

**查询参数:**

- `companyId` (必需): 企业ID
- `departmentId` (可选): 部门ID
- `employmentStatus` (可选): 在职状态 (active, probation, resigned, terminated)
- `page` (可选): 页码，默认1
- `limit` (可选): 每页数量，默认20

**响应示例:**

```json
{
  "success": true,
  "data": [
    {
      "id": "xxx-xxx-xxx",
      "name": "张三",
      "employeeNumber": "E001",
      "department": "研发部",
      "position": "前端工程师",
      "hireDate": "2024-01-15T00:00:00Z",
      "employmentStatus": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### 2.2 创建员工

**接口地址:** `POST /api/employees`

**请求参数:**

```json
{
  "companyId": "xxx-xxx-xxx",
  "name": "张三",
  "gender": "male",
  "birthDate": "1990-01-01",
  "phone": "13800138000",
  "email": "zhangsan@example.com",
  "departmentId": "xxx-xxx-xxx",
  "positionId": "xxx-xxx-xxx",
  "hireDate": "2024-01-15",
  "employmentType": "fulltime",
  "salary": 15000
}
```

### 2.3 获取员工详情

**接口地址:** `GET /api/employees/:id`

### 2.4 更新员工信息

**接口地址:** `PUT /api/employees/:id`

### 2.5 删除员工

**接口地址:** `DELETE /api/employees/:id`

---

## 3. 部门管理模块 (Departments)

### 3.1 获取部门列表

**接口地址:** `GET /api/departments`

**查询参数:**

- `companyId` (必需): 企业ID
- `parentId` (可选): 父部门ID
- `isActive` (可选): 是否激活

**响应示例:**

```json
{
  "success": true,
  "data": [
    {
      "id": "xxx-xxx-xxx",
      "name": "研发部",
      "code": "RD",
      "parentId": null,
      "managerId": "xxx-xxx-xxx",
      "sort": 1
    }
  ]
}
```

### 3.2 创建部门

**接口地址:** `POST /api/departments`

**请求参数:**

```json
{
  "companyId": "xxx-xxx-xxx",
  "name": "研发部",
  "code": "RD",
  "parentId": null,
  "managerId": "xxx-xxx-xxx",
  "description": "负责产品研发",
  "sort": 1
}
```

---

## 4. 招聘管理模块 (Jobs)

### 4.1 获取职位列表

**接口地址:** `GET /api/jobs`

**查询参数:**

- `companyId` (必需): 企业ID
- `departmentId` (可选): 部门ID
- `status` (可选): 状态 (draft, open, closed)
- `page` (可选): 页码
- `limit` (可选): 每页数量

**响应示例:**

```json
{
  "success": true,
  "data": [
    {
      "id": "xxx-xxx-xxx",
      "title": "前端工程师",
      "department": "研发部",
      "hireCount": 2,
      "salaryMin": 15000,
      "salaryMax": 25000,
      "status": "open"
    }
  ]
}
```

### 4.2 创建职位

**接口地址:** `POST /api/jobs`

**请求参数:**

```json
{
  "companyId": "xxx-xxx-xxx",
  "title": "前端工程师",
  "departmentId": "xxx-xxx-xxx",
  "hireCount": 2,
  "salaryMin": 15000,
  "salaryMax": 25000,
  "location": "北京",
  "description": "负责前端开发",
  "requirements": "3年以上经验",
  "status": "draft",
  "createdBy": "xxx-xxx-xxx"
}
```

---

## 5. 绩效管理模块 (Performance)

### 5.1 获取绩效周期列表

**接口地址:** `GET /api/performance/cycles`

**查询参数:**

- `companyId` (必需): 企业ID
- `status` (可选): 状态 (draft, active, completed)

**响应示例:**

```json
{
  "success": true,
  "data": [
    {
      "id": "xxx-xxx-xxx",
      "name": "2025年Q1绩效",
      "type": "quarterly",
      "startDate": "2025-01-01T00:00:00Z",
      "endDate": "2025-03-31T23:59:59Z",
      "status": "active"
    }
  ]
}
```

### 5.2 创建绩效周期

**接口地址:** `POST /api/performance/cycles`

**请求参数:**

```json
{
  "companyId": "xxx-xxx-xxx",
  "name": "2025年Q1绩效",
  "type": "quarterly",
  "startDate": "2025-01-01",
  "endDate": "2025-03-31",
  "description": "第一季度绩效考核"
}
```

---

## 6. 数据驾驶舱 (Dashboard)

### 6.1 获取关键指标

**接口地址:** `GET /api/dashboard/stats`

**查询参数:**

- `companyId` (必需): 企业ID

**响应示例:**

```json
{
  "success": true,
  "data": {
    "employees": {
      "total": 128,
      "active": 120,
      "probation": 8,
      "newHires": 12
    },
    "recruitment": {
      "activeJobs": 5
    },
    "performance": {
      "cycleId": "xxx-xxx-xxx",
      "cycleName": "2025年Q1绩效",
      "completedRecords": 80,
      "totalRecords": 120,
      "completionRate": "66.7",
      "avgScore": "85.2"
    },
    "efficiency": {
      "avgRevenuePerEmployee": 423000,
      "growth": "+12%"
    },
    "subscription": {
      "isValid": true,
      "tier": "free",
      "maxEmployees": 30,
      "expiresAt": "2025-12-31T00:00:00Z"
    }
  }
}
```

---

## 7. AI能力模块 (AI)

### 7.1 生成岗位描述

**接口地址:** `POST /api/ai/job-description`

**请求参数:**

```json
{
  "jobTitle": "前端工程师",
  "department": "研发部",
  "businessGoal": "开发高质量的前端产品，提升用户体验",
  "keyResponsibilities": "负责Web应用开发，参与需求分析和设计",
  "requirements": "熟练掌握Vue/React，有3年以上经验",
  "salaryRange": "15000-25000"
}
```

**响应示例:**

```json
{
  "success": true,
  "message": "岗位描述生成成功",
  "data": {
    "title": "前端工程师",
    "description": "完整的岗位描述内容...",
    "responsibilities": [
      "负责前端页面开发和维护",
      "参与需求分析和系统设计",
      "优化前端性能和用户体验"
    ],
    "requirements": [
      "本科及以上学历，计算机相关专业",
      "3年以上前端开发经验",
      "熟练掌握Vue或React框架"
    ],
    "interviewQuestions": [
      "请介绍一下你最满意的项目",
      "如何处理前端性能优化问题？"
    ]
  }
}
```

### 7.2 生成人才盘点九宫格

**接口地址:** `POST /api/ai/talent-grid`

**请求参数:**

```json
{
  "department": "研发部",
  "teamSize": 20,
  "criteria": {
    "performance": "基于KPI考核结果和项目贡献",
    "potential": "基于学习能力和成长潜力",
    "values": "基于价值观匹配度"
  },
  "employees": [
    {
      "name": "张三",
      "position": "前端工程师",
      "performanceScore": 4.5,
      "potentialScore": 4.0,
      "keyStrengths": "技术能力强，学习快",
      "developmentNeeds": "需要提升团队管理能力"
    }
  ]
}
```

### 7.3 生成离职分析报告

**接口地址:** `POST /api/ai/turnover-analysis`

**请求参数:**

```json
{
  "companyId": "xxx-xxx-xxx",
  "timeRange": "2024年1月-2024年12月",
  "turnoverData": {
    "totalEmployees": 100,
    "resignedCount": 12,
    "averageTenure": 18,
    "topResignationReasons": [
      {
        "reason": "薪酬偏低",
        "count": 5,
        "percentage": 41.7
      }
    ],
    "departmentBreakdown": [
      {
        "department": "研发部",
        "employeeCount": 30,
        "resignedCount": 4,
        "turnoverRate": 13.3
      }
    ],
    "tenureBreakdown": [
      {
        "range": "0-6个月",
        "employeeCount": 10,
        "resignedCount": 3,
        "turnoverRate": 30.0
      }
    ]
  }
}
```

---

## 8. 工作流引擎 (Workflows)

### 8.1 获取工作流列表

**接口地址:** `GET /api/workflows`

**查询参数:**

- `companyId` (必需): 企业ID
- `type` (可选): 工作流类型 (recruitment, performance, onboarding, resignation, promotion)
- `status` (可选): 状态 (draft, active, paused, completed, cancelled)

**响应示例:**

```json
{
  "success": true,
  "data": [
    {
      "id": "xxx-xxx-xxx",
      "companyId": "xxx-xxx-xxx",
      "type": "recruitment",
      "name": "前端工程师招聘流程",
      "status": "active",
      "currentStepIndex": 2,
      "steps": [
        {
          "id": "xxx-xxx-xxx",
          "name": "创建招聘需求",
          "status": "completed",
          "startTime": "2024-01-15T00:00:00Z",
          "endTime": "2024-01-15T01:00:00Z"
        },
        {
          "id": "xxx-xxx-xxx",
          "name": "简历筛选",
          "status": "completed"
        },
        {
          "id": "xxx-xxx-xxx",
          "name": "初试面试",
          "status": "in_progress",
          "startTime": "2024-01-16T00:00:00Z"
        }
      ]
    }
  ]
}
```

### 8.2 创建工作流

**接口地址:** `POST /api/workflows`

**请求参数:**

```json
{
  "companyId": "xxx-xxx-xxx",
  "type": "recruitment",
  "name": "前端工程师招聘流程",
  "description": "招聘前端开发人员",
  "initiatorId": "xxx-xxx-xxx",
  "relatedEntityId": "xxx-xxx-xxx"
}
```

### 8.3 更新工作流状态

**接口地址:** `PATCH /api/workflows`

**请求参数:**

```json
{
  "workflowId": "xxx-xxx-xxx",
  "action": "start" // start, pause, resume, complete, cancel
}
```

---

## 9. 订阅管理模块 (Subscriptions)

### 9.1 获取套餐列表

**接口地址:** `GET /api/subscriptions`

**响应示例:**

```json
{
  "success": true,
  "data": {
    "free": {
      "name": "免费版",
      "price": 0,
      "period": "forever",
      "maxEmployees": 30,
      "maxJobs": 3,
      "features": [
        "基础招聘（3个职位）",
        "30人以内员工档案",
        "基础报表"
      ]
    },
    "professional": {
      "name": "专业版",
      "price": 999,
      "period": "yearly",
      "maxEmployees": 150,
      "maxJobs": 999,
      "features": [
        "全部核心模块",
        "HRBP支持模块",
        "最多150人"
      ]
    },
    "enterprise": {
      "name": "企业版",
      "price": null,
      "period": "custom",
      "maxEmployees": 99999,
      "maxJobs": 99999,
      "features": [
        "专业版所有功能",
        "定制字段/流程",
        "专属成功经理"
      ]
    }
  }
}
```

### 9.2 创建订阅（发起支付）

**接口地址:** `POST /api/subscriptions`

**请求参数:**

```json
{
  "companyId": "xxx-xxx-xxx",
  "tier": "professional",
  "period": "yearly",
  "paymentMethod": "wechat"
}
```

**响应示例:**

```json
{
  "success": true,
  "message": "订单创建成功",
  "data": {
    "subscription": {
      "id": "xxx-xxx-xxx",
      "tier": "professional",
      "amount": 99900,
      "startDate": "2025-01-15T00:00:00Z",
      "endDate": "2026-01-15T00:00:00Z",
      "status": "pending"
    },
    "paymentInfo": {
      "orderId": "SUB-1234567890-abc123",
      "amount": 999,
      "currency": "CNY",
      "qrCode": "data:image/svg+xml;base64,...",
      "wechatPayUrl": "https://pay.weixin.qq.com/mock?orderId=...",
      "alipayUrl": "https://qr.alipay.com/mock?orderId=..."
    }
  }
}
```

---

## 10. 支付模块 (Payments)

### 10.1 支付回调（Webhook）

**接口地址:** `POST /api/payments/callback`

**请求参数:**

```json
{
  "orderId": "SUB-1234567890-abc123",
  "transactionId": "WX202501151234567890",
  "status": "success",
  "amount": 999,
  "paymentMethod": "wechat"
}
```

### 10.2 查询支付状态

**接口地址:** `GET /api/payments/callback?orderId=xxx-xxx-xxx`

**响应示例:**

```json
{
  "success": true,
  "data": {
    "orderId": "SUB-1234567890-abc123",
    "status": "success",
    "paidAt": "2025-01-15T12:34:56Z"
  }
}
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 使用示例

### 1. 用户注册并登录

```javascript
// 注册
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: '张三',
    companyName: '示例科技有限公司'
  })
});

// 登录
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    account: 'user@example.com',
    password: 'password123'
  })
});
```

### 2. 获取数据驾驶舱指标

```javascript
const response = await fetch('/api/dashboard/stats?companyId=xxx-xxx-xxx');
const data = await response.json();
console.log(data);
```

### 3. 生成岗位描述

```javascript
const response = await fetch('/api/ai/job-description', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jobTitle: '前端工程师',
    businessGoal: '开发高质量的前端产品'
  })
});

const data = await response.json();
console.log(data.data.description);
```

---

## 注意事项

1. **认证**: 所有API（除了注册和登录）都需要在请求头中携带认证Token
2. **时间格式**: 所有时间字段使用ISO 8601格式
3. **分页**: 所有列表接口都支持分页，默认每页20条
4. **错误处理**: 所有错误响应都包含error字段
5. **AI功能**: AI相关API可能需要较长时间，建议使用异步方式调用
