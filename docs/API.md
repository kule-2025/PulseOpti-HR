# PulseOpti HR 脉策聚效 SaaS 平台 API 文档

## 目录

- [认证说明](#认证说明)
- [通用响应格式](#通用响应格式)
- [员工管理 API](#员工管理-api)
- [数据同步 API](#数据同步-api)
- [告警管理 API](#告警管理-api)

## 认证说明

所有 API 请求需要在请求头中携带用户认证信息：

```http
x-user-id: {"id":"user-id","companyId":"company-id","role":"admin"}
Content-Type: application/json
```

## 通用响应格式

### 成功响应

```json
{
  "success": true,
  "message": "操作成功",
  "data": {}
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

### HTTP 状态码

- `200` - 请求成功
- `400` - 请求参数错误
- `401` - 未授权访问
- `404` - 资源不存在
- `500` - 服务器内部错误

---

## 员工管理 API

### 1. 创建员工档案

创建新的员工档案，支持完整的员工信息录入。

**接口地址：** `POST /api/employees/create`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 员工姓名 |
| email | string | 是 | 员工邮箱（唯一） |
| phone | string | 是 | 员工电话 |
| gender | string | 否 | 性别（male/female/unknown） |
| birthDate | string | 否 | 出生日期（YYYY-MM-DD） |
| idNumber | string | 否 | 身份证号 |
| departmentId | string | 是 | 部门ID |
| positionId | string | 是 | 职位ID |
| level | string | 否 | 职级 |
| employmentType | string | 否 | 用工类型（full-time/part-time/contract/intern） |
| hireDate | string | 是 | 入职日期（YYYY-MM-DD） |
| probationEndDate | string | 否 | 试用期结束日期 |
| contractType | string | 否 | 合同类型 |
| workLocation | string | 否 | 工作地点 |
| managerId | string | 否 | 直属上级ID |
| address | string | 否 | 居住地址 |
| emergencyContact | string | 否 | 紧急联系人 |
| emergencyPhone | string | 否 | 紧急联系电话 |
| education | string | 否 | 学历 |
| workExperience | string | 否 | 工作经历 |
| skills | string | 否 | 技能描述 |
| notes | string | 否 | 备注信息 |
| avatar | string | 否 | 头像URL |

**请求示例：**

```bash
curl -X POST http://localhost:5000/api/employees/create \
  -H "Content-Type: application/json" \
  -H "x-user-id: {\"id\":\"user-123\",\"companyId\":\"company-456\",\"role\":\"admin\"}" \
  -d '{
    "name": "张三",
    "email": "zhangsan@example.com",
    "phone": "13800138000",
    "gender": "male",
    "birthDate": "1990-01-01",
    "departmentId": "dept-001",
    "positionId": "pos-001",
    "level": "P5",
    "employmentType": "full-time",
    "hireDate": "2024-01-01",
    "probationEndDate": "2024-04-01",
    "workLocation": "广州市天河区"
  }'
```

**响应示例：**

```json
{
  "success": true,
  "message": "员工档案创建成功",
  "data": {
    "id": "employee-uuid"
  }
}
```

### 2. 获取员工列表

分页获取员工列表，支持搜索和筛选。

**接口地址：** `GET /api/employees/create`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| companyId | string | 是 | 企业ID |
| page | number | 否 | 页码（默认1） |
| limit | number | 否 | 每页数量（默认20） |
| search | string | 否 | 搜索关键词（姓名/邮箱/电话） |
| departmentId | string | 否 | 部门ID筛选 |
| employmentStatus | string | 否 | 在职状态筛选（active/inactive） |

**请求示例：**

```bash
curl -X GET "http://localhost:5000/api/employees/create?companyId=company-456&page=1&limit=20&search=张"
```

**响应示例：**

```json
{
  "success": true,
  "data": [
    {
      "id": "employee-001",
      "name": "张三",
      "email": "zhangsan@example.com",
      "phone": "13800138000",
      "gender": "male",
      "avatar": null,
      "departmentId": "dept-001",
      "positionId": "pos-001",
      "level": "P5",
      "employmentType": "full-time",
      "employmentStatus": "active",
      "hireDate": "2024-01-01T00:00:00.000Z",
      "probationEndDate": "2024-04-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "departmentName": "研发部",
      "positionName": "高级工程师"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## 数据同步 API

### 1. 创建同步任务

创建新的数据同步任务。

**接口地址：** `POST /api/sync/create`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | string | 是 | 同步类型（full/incremental/realtime） |
| source | string | 是 | 同步源（user/department/position/employee/all） |
| priority | number | 否 | 优先级（1-10，默认5） |
| scheduledFor | string | 否 | 计划执行时间（ISO 8601格式） |

**请求示例：**

```bash
curl -X POST http://localhost:5000/api/sync/create \
  -H "Content-Type: application/json" \
  -d '{
    "type": "incremental",
    "source": "employee",
    "priority": 7
  }'
```

**响应示例：**

```json
{
  "success": true,
  "message": "同步任务创建成功",
  "data": {
    "taskId": "sync-task-uuid"
  }
}
```

### 2. 获取同步任务列表

获取同步任务列表。

**接口地址：** `GET /api/sync/create`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | string | 否 | 状态筛选（pending/running/completed/failed） |
| limit | number | 否 | 返回数量（默认20） |

**请求示例：**

```bash
curl -X GET "http://localhost:5000/api/sync/create?status=pending&limit=10"
```

**响应示例：**

```json
{
  "success": true,
  "data": [
    {
      "id": "sync-task-001",
      "type": "incremental",
      "source": "employee",
      "status": "pending",
      "priority": 7,
      "retryCount": 0,
      "maxRetries": 3,
      "progress": 0,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 3. 取消同步任务

取消指定的同步任务。

**接口地址：** `POST /api/sync/task`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| taskId | string | 是 | 任务ID |

**请求示例：**

```bash
curl -X POST http://localhost:5000/api/sync/task \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "sync-task-001"
  }'
```

**响应示例：**

```json
{
  "success": true,
  "message": "任务已取消"
}
```

### 4. 重试失败任务

重新执行失败的同步任务。

**接口地址：** `PUT /api/sync/task`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| taskId | string | 是 | 任务ID |

**请求示例：**

```bash
curl -X PUT http://localhost:5000/api/sync/task \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "sync-task-001"
  }'
```

**响应示例：**

```json
{
  "success": true,
  "message": "任务已重新加入队列"
}
```

### 5. 获取同步日志

获取同步任务的执行日志。

**接口地址：** `GET /api/sync/logs`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| taskId | string | 否 | 任务ID |
| level | string | 否 | 日志级别（info/warn/error） |
| limit | number | 否 | 返回数量（默认50） |

**请求示例：**

```bash
curl -X GET "http://localhost:5000/api/sync/logs?taskId=sync-task-001&limit=50"
```

**响应示例：**

```json
{
  "success": true,
  "data": [
    {
      "id": "log-001",
      "taskId": "sync-task-001",
      "level": "info",
      "message": "开始执行incremental同步任务",
      "data": null,
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "log-002",
      "taskId": "sync-task-001",
      "level": "error",
      "message": "同步任务失败: 连接超时",
      "data": null,
      "timestamp": "2024-01-01T00:01:00.000Z"
    }
  ]
}
```

### 6. 获取同步统计

获取数据同步的统计信息。

**接口地址：** `GET /api/sync/stats`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| timeRange | number | 否 | 时间范围（小时，默认24） |

**请求示例：**

```bash
curl -X GET "http://localhost:5000/api/sync/stats?timeRange=24"
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalTasks": 100,
      "completedTasks": 85,
      "failedTasks": 10,
      "runningTasks": 5,
      "errorLogs": 25
    },
    "taskStats": [
      {
        "status": "completed",
        "count": 85
      },
      {
        "status": "failed",
        "count": 10
      }
    ],
    "logStats": [
      {
        "level": "error",
        "count": 25
      }
    ],
    "typeStats": [
      {
        "type": "incremental",
        "source": "employee",
        "total": 50,
        "success": 45,
        "failed": 5
      }
    ]
  }
}
```

---

## 告警管理 API

### 1. 获取活跃告警

获取所有未确认的活跃告警列表。

**接口地址：** `GET /api/alerts`

**响应示例：**

```json
{
  "success": true,
  "data": [
    {
      "id": "alert-sync-failure-employee",
      "ruleId": "sync-failure",
      "type": "sync_failure",
      "severity": "high",
      "title": "incremental - employee 同步频繁失败",
      "message": "在最近 30 分钟内，incremental - employee 同步任务已失败 3 次，请及时处理。",
      "taskId": "sync-task-001",
      "metadata": {
        "type": "incremental",
        "source": "employee",
        "failureCount": 3
      },
      "acknowledged": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. 确认告警

确认指定的告警。

**接口地址：** `POST /api/alerts`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| alertId | string | 是 | 告警ID |
| userId | string | 是 | 用户ID |

**请求示例：**

```bash
curl -X POST http://localhost:5000/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "alertId": "alert-sync-failure-employee",
    "userId": "user-123"
  }'
```

**响应示例：**

```json
{
  "success": true,
  "message": "告警已确认"
}
```

### 3. 获取告警规则

获取所有告警规则。

**接口地址：** `GET /api/alerts/rules`

**响应示例：**

```json
{
  "success": true,
  "data": [
    {
      "id": "sync-failure",
      "type": "sync_failure",
      "condition": {
        "errorThreshold": 3,
        "timeWindow": 30
      },
      "enabled": true,
      "notificationChannels": ["dashboard", "email"],
      "recipients": []
    },
    {
      "id": "sync-timeout",
      "type": "sync_timeout",
      "condition": {
        "timeoutMinutes": 60
      },
      "enabled": true,
      "notificationChannels": ["dashboard"],
      "recipients": []
    },
    {
      "id": "error-threshold",
      "type": "error_threshold",
      "condition": {
        "errorThreshold": 10,
        "timeWindow": 10
      },
      "enabled": true,
      "notificationChannels": ["dashboard", "email"],
      "recipients": []
    }
  ]
}
```

### 4. 添加告警规则

添加新的告警规则。

**接口地址：** `POST /api/alerts/rules`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 否 | 规则ID（不传自动生成） |
| type | string | 是 | 规则类型（sync_failure/sync_timeout/error_threshold） |
| condition | object | 是 | 条件配置 |
| enabled | boolean | 否 | 是否启用（默认true） |
| notificationChannels | array | 否 | 通知渠道（dashboard/email/sms） |
| recipients | array | 否 | 接收人列表 |

**请求示例：**

```bash
curl -X POST http://localhost:5000/api/alerts/rules \
  -H "Content-Type: application/json" \
  -d '{
    "type": "sync_failure",
    "condition": {
      "errorThreshold": 5,
      "timeWindow": 60
    },
    "enabled": true,
    "notificationChannels": ["dashboard", "email"],
    "recipients": ["user-123"]
  }'
```

**响应示例：**

```json
{
  "success": true,
  "message": "告警规则添加成功",
  "data": {
    "id": "rule-1234567890",
    "type": "sync_failure",
    "condition": {
      "errorThreshold": 5,
      "timeWindow": 60
    },
    "enabled": true,
    "notificationChannels": ["dashboard", "email"],
    "recipients": ["user-123"]
  }
}
```

### 5. 更新告警规则

更新现有的告警规则。

**接口地址：** `PUT /api/alerts/rules`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| ruleId | string | 是 | 规则ID |
| enabled | boolean | 否 | 是否启用 |
| notificationChannels | array | 否 | 通知渠道 |
| recipients | array | 否 | 接收人列表 |
| condition | object | 否 | 条件配置 |

**请求示例：**

```bash
curl -X PUT http://localhost:5000/api/alerts/rules \
  -H "Content-Type: application/json" \
  -d '{
    "ruleId": "sync-failure",
    "enabled": false
  }'
```

**响应示例：**

```json
{
  "success": true,
  "message": "告警规则更新成功"
}
```

### 6. 删除告警规则

删除指定的告警规则。

**接口地址：** `DELETE /api/alerts/rules?ruleId=rule-id`

**请求示例：**

```bash
curl -X DELETE "http://localhost:5000/api/alerts/rules?ruleId=sync-failure"
```

**响应示例：**

```json
{
  "success": true,
  "message": "告警规则删除成功"
}
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| UNAUTHORIZED | 未授权访问 |
| INVALID_PARAMS | 请求参数错误 |
| RESOURCE_NOT_FOUND | 资源不存在 |
| DUPLICATE_RECORD | 重复记录 |
| INTERNAL_ERROR | 服务器内部错误 |
| SYNC_FAILED | 同步失败 |
| TIMEOUT | 请求超时 |

---

## 联系方式

- **邮箱：** PulseOptiHR@163.com
- **地址：** 广州市天河区
- **服务时间：** 周一至周五 9:00-12:00, 14:00-18:00

---

## 版本说明

- **当前版本：** v1.0.0
- **更新日期：** 2024年
