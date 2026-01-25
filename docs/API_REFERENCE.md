# PulseOpti HR 脉策聚效 SaaS平台 - API参考文档

## 目录

- [概述](#概述)
- [认证](#认证)
- [通用响应格式](#通用响应格式)
- [API接口列表](#api接口列表)
- [错误码](#错误码)

## 概述

### 基础信息

- **Base URL**: `http://localhost:5000/api`
- **数据格式**: JSON
- **字符编码**: UTF-8
- **时间格式**: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)

### 请求方法

| 方法 | 说明 |
|------|------|
| GET | 获取资源 |
| POST | 创建资源 |
| PUT | 更新资源 |
| DELETE | 删除资源 |

## 认证

### 1. JWT认证

所有API请求（除登录注册外）都需要在请求头中包含JWT token：

```http
Authorization: Bearer <your-jwt-token>
```

### 2. 获取Token

#### 登录

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应**:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "张三"
    }
  }
}
```

#### 邮箱登录

```http
POST /api/auth/login/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

## 通用响应格式

### 成功响应

```json
{
  "success": true,
  "data": {},
  "message": "操作成功"
}
```

### 错误响应

```json
{
  "success": false,
  "error": "错误描述",
  "code": "ERROR_CODE"
}
```

## API接口列表

### 1. 认证接口

#### 用户注册

```http
POST /api/auth/register
```

**请求参数**:

```json
{
  "name": "张三",
  "email": "user@example.com",
  "password": "password123",
  "phone": "13800138000"
}
```

#### 获取当前用户信息

```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### 重置密码

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "newPassword": "newPassword123"
}
```

### 2. 员工管理接口

#### 获取员工列表

```http
GET /api/employees?page=1&pageSize=20&companyId=demo-company
Authorization: Bearer <token>
```

**查询参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认20 |
| companyId | string | 是 | 企业ID |
| departmentId | string | 否 | 部门ID筛选 |
| search | string | 否 | 搜索关键词 |

#### 创建员工

```http
POST /api/employees/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "张三",
  "employeeNo": "E001",
  "email": "zhangsan@example.com",
  "phone": "13800138000",
  "departmentId": "dept-123",
  "positionId": "pos-123",
  "companyId": "demo-company",
  "hireDate": "2024-01-01T00:00:00.000Z",
  "salary": 15000,
  "employmentStatus": "active"
}
```

#### 获取员工详情

```http
GET /api/employees/{id}
Authorization: Bearer <token>
```

#### 更新员工信息

```http
PUT /api/employees/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "张三",
  "salary": 16000
}
```

### 3. 部门管理接口

#### 获取部门列表

```http
GET /api/departments?companyId=demo-company
Authorization: Bearer <token>
```

#### 创建部门

```http
POST /api/departments
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "技术部",
  "companyId": "demo-company",
  "managerId": "user-123",
  "description": "负责技术研发"
}
```

### 4. 招聘管理接口

#### 获取职位列表

```http
GET /api/jobs?companyId=demo-company
Authorization: Bearer <token>
```

#### 创建职位

```http
POST /api/jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "高级前端工程师",
  "departmentId": "dept-123",
  "companyId": "demo-company",
  "description": "负责前端开发工作",
  "requirements": "3年以上前端开发经验",
  "salaryMin": 15000,
  "salaryMax": 25000,
  "status": "open"
}
```

#### 简历解析（AI）

```http
POST /api/ai/resume-parse
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: resume.pdf
```

**响应**:

```json
{
  "success": true,
  "data": {
    "name": "张三",
    "email": "zhangsan@example.com",
    "phone": "13800138000",
    "education": "本科",
    "experience": "5年",
    "skills": ["JavaScript", "React", "Node.js"]
  }
}
```

### 5. 绩效管理接口

#### 获取绩效记录

```http
GET /api/performance-records?companyId=demo-company
Authorization: Bearer <token>
```

#### 创建绩效记录

```http
POST /api/performance-records
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeId": "emp-123",
  "companyId": "demo-company",
  "period": "2024-Q1",
  "goals": [
    {
      "title": "完成项目A",
      "weight": 50,
      "target": "按时交付",
      "actual": "按时交付"
    }
  ],
  "status": "pending"
}
```

### 6. 统计分析接口

#### 获取统计数据

```http
GET /api/dashboard/stats?companyId=demo-company
Authorization: Bearer <token>
```

**响应**:

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalEmployees": 100,
      "activeEmployees": 95,
      "totalJobs": 20,
      "openJobs": 5,
      "avgSalary": 15000
    },
    "departmentStats": [...],
    "positionStats": [...],
    "hireTrend": [...]
  }
}
```

### 7. AI分析接口

#### 流式AI分析

```http
POST /api/ai/analysis
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "employee",
  "data": {
    "totalEmployees": 100,
    "avgSalary": 15000
  }
}
```

**响应**: SSE流式输出

#### AI问答

```http
PUT /api/ai/analysis
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": "如何提高员工满意度？",
  "context": "{}"
}
```

**响应**:

```json
{
  "success": true,
  "data": {
    "answer": "根据数据分析，提高员工满意度的建议包括..."
  }
}
```

### 8. 工作流接口

#### 创建工作流实例

```http
POST /api/workflow/instance
Authorization: Bearer <token>
Content-Type: application/json

{
  "workflowDefinitionId": "workflow-123",
  "businessType": "leave",
  "businessId": "leave-123",
  "variables": {
    "days": 3,
    "reason": "年假"
  }
}
```

#### 审批操作

```http
PUT /api/workflow/instance
Authorization: Bearer <token>
Content-Type: application/json

{
  "instanceId": "instance-123",
  "nodeId": "node-123",
  "action": "approve",
  "comment": "同意"
}
```

#### 获取工作流实例详情

```http
GET /api/workflow/instance?instanceId=instance-123
Authorization: Bearer <token>
```

### 9. 权限管理接口

#### 导出权限配置

```http
POST /api/permissions/config/export
Authorization: Bearer <token>
Content-Type: application/json

{
  "companyId": "demo-company"
}
```

**响应**: JSON配置文件

#### 导入权限配置

```http
POST /api/permissions/config/import
Authorization: Bearer <token>
Content-Type: application/json

{
  "config": { ... }
}
```

### 10. 告警接口

#### 获取告警列表

```http
GET /api/alerts
Authorization: Bearer <token>
```

#### 确认告警

```http
POST /api/alerts
Authorization: Bearer <token>
Content-Type: application/json

{
  "alertId": "alert-123",
  "userId": "user-123"
}
```

### 11. 数据同步接口

#### 获取同步任务列表

```http
GET /api/sync/tasks
Authorization: Bearer <token>
```

#### 创建同步任务

```http
POST /api/sync/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "full",
  "source": "feishu",
  "config": {}
}
```

## 错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 500 | 服务器内部错误 |
| 503 | 服务不可用 |

### 业务错误码

| 错误码 | 说明 |
|--------|------|
| USER_NOT_FOUND | 用户不存在 |
| INVALID_PASSWORD | 密码错误 |
| EMAIL_EXISTS | 邮箱已存在 |
| PERMISSION_DENIED | 权限不足 |
| COMPANY_NOT_FOUND | 企业不存在 |
| DEPARTMENT_NOT_FOUND | 部门不存在 |
| POSITION_NOT_FOUND | 职位不存在 |

## 附录

### A. 分页响应格式

```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

### B. 限流规则

- 每个IP每分钟最多100次请求
- 每个用户每分钟最多200次请求
- 超过限制返回429错误

### C. 版本信息

- **当前版本**: v1.0.0
- **API版本**: v1
- **文档更新**: 2025-01-09

---

*如有问题，请联系技术支持: PulseOptiHR@163.com*
