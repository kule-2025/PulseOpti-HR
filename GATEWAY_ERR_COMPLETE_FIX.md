# GatewayErr 持续报错 - 完整诊断与修复方案

## 错误分析

**错误信息**：
```
GatewayErr: (code: 699024202, message: raw response: , unmarshal response err
```

**错误码含义**：
- `699024202`: 豆包大语言模型服务返回的网关错误
- `raw response: , unmarshal response err`: 接收到了空的响应，无法解析

**可能原因**：

1. **豆包 API Key 未配置或无效**（最可能）
2. **豆包服务暂时不可用**
3. **网络连接问题**
4. **环境变量未正确传递到应用**

---

## 存储配置检查 ✅

根据您的配置，存储对象是**匹配的**：

| 配置项 | .env 文件 | vercel.json | 代码使用 | 状态 |
|--------|----------|-------------|----------|------|
| `COZE_BUCKET_ENDPOINT_URL` | `https://s3.cn-beijing.amazonaws.com.cn` | `@coze-bucket-endpoint-url` | ✅ 使用 | ✅ 匹配 |
| `COZE_BUCKET_NAME` | `pulseopti-hr-storage` | `@coze-bucket-name` | ✅ 使用 | ✅ 匹配 |

**存储配置没有问题，问题出在 AI 服务上。**

---

## 紧急修复步骤

### 步骤 1：确认 Vercel 环境变量配置

访问：https://vercel.com/your-username/pulseopti-hr/settings/environment-variables

**必须配置以下环境变量**：

#### 数据库配置（已有，请确认）
- ✅ `DATABASE_URL` - Neon PostgreSQL 连接字符串
- ✅ `COZE_BUCKET_ENDPOINT_URL` - `https://s3.cn-beijing.amazonaws.com.cn`
- ✅ `COZE_BUCKET_NAME` - `pulseopti-hr-storage`

#### AI 服务配置（**必须添加**）
- ⚠️ `DOUBAO_API_KEY` - 豆包大语言模型 API Key
- ⚠️ `SEEDREAM_API_KEY` - 豆包生图模型 API Key
- ⚠️ `VOICE_API_KEY` - 豆包语音模型 API Key

**重要提示**：
- 这三个环境变量**必须添加**，否则 AI 功能无法使用
- 建议使用相同的豆包 API Key
- 必须勾选所有环境：☑ Production ☑ Preview ☑ Development

### 步骤 2：获取豆包 API Key

如果您还没有 API Key：

1. 访问火山引擎控制台：https://console.volcengine.com/ark
2. 登录/注册账号（需要手机号和实名认证）
3. 点击左侧菜单 **"API Key 管理"**
4. 点击 **"创建 API Key"**
5. 复制生成的 API Key

**API Key 格式**：
```
a1b2c3d4-5678-90ab-cdef-1234567890ab
```
（36 个字符的 UUID 格式）

### 步骤 3：在 Vercel 中添加环境变量

#### 添加 DOUBAO_API_KEY

1. 点击 **"Add New"** 按钮
2. 填写：
   - **Name**: `DOUBAO_API_KEY` （精确匹配，区分大小写）
   - **Value**: 您的豆包 API Key
   - **Environment**: 勾选 ☑ Production ☑ Preview ☑ Development
3. 点击 **"Save"**

#### 添加 SEEDREAM_API_KEY

1. 点击 **"Add New"** 按钮
2. 填写：
   - **Name**: `SEEDREAM_API_KEY` （精确匹配，区分大小写）
   - **Value**: 您的豆包 API Key（通常与 DOUBAO 相同）
   - **Environment**: 勾选 ☑ Production ☑ Preview ☑ Development
3. 点击 **"Save"**

#### 添加 VOICE_API_KEY

1. 点击 **"Add New"** 按钮
2. 填写：
   - **Name**: `VOICE_API_KEY` （精确匹配，区分大小写）
   - **Value**: 您的豆包 API Key（通常与 DOUBAO 相同）
   - **Environment**: 勾选 ☑ Production ☑ Preview ☑ Development
3. 点击 **"Save"**

### 步骤 4：触发重新部署

Vercel 会自动检测到环境变量变更并触发部署。

如果没有自动触发，请手动操作：

1. 访问：https://vercel.com/your-username/pulseopti-hr/deployments
2. 找到最新的部署
3. 点击 **"Redeploy"** 按钮

---

## 验证配置

### 方法 1：检查环境变量列表

在 Vercel Dashboard 中确认以下环境变量都已配置：

```
✅ DATABASE_URL
✅ COZE_BUCKET_ENDPOINT_URL
✅ COZE_BUCKET_NAME
✅ DOUBAO_API_KEY         ← 必须有
✅ SEEDREAM_API_KEY       ← 必须有
✅ VOICE_API_KEY          ← 必须有
```

### 方法 2：查看部署日志

部署完成后，查看日志：

1. 访问最新部署页面
2. 点击 **"Logs"** 标签
3. 查找与 AI 服务相关的错误

**如果配置正确，应该不会再看到 GatewayErr 错误。**

### 方法 3：测试 AI 功能

部署成功后，测试简历解析功能：

```bash
curl -X POST https://pulseopti-hr.vercel.app/api/ai/resume-parse \
  -F "file=@test-resume.pdf"
```

---

## 常见问题排查

### Q: 配置了环境变量还是报错？

**检查清单**：
1. 环境变量名称是否精确匹配（区分大小写）
   - ✅ `DOUBAO_API_KEY` （不是 `doubao_api_key` 或 `DoubaoApiKey`）
   - ✅ `SEEDREAM_API_KEY` （不是 `seedream_api_key`）
   - ✅ `VOICE_API_KEY` （不是 `voice_api_key`）

2. API Key 是否有效
   - 检查 API Key 是否过期
   - 确认 API Key 有使用权限

3. 是否选择了正确的环境
   - 必须勾选：☑ Production ☑ Preview ☑ Development

4. 是否触发了重新部署
   - 环境变量变更后必须重新部署才能生效

### Q: API Key 格式不对怎么办？

**正确格式**：
```
a1b2c3d4-5678-90ab-cdef-1234567890ab
```

**错误格式**：
- ❌ `a1b2c3d4-5678-90ab-cdef` （太短）
- ❌ `Bearer a1b2c3d4-5678-90ab-cdef-1234567890ab` （不要加前缀）
- ❌ `API_KEY: a1b2c3d4-5678-90ab-cdef-1234567890ab` （不要加标签）

### Q: 豆包服务暂时不可用？

**临时解决方案**：
1. 检查火山引擎控制台的服务状态
2. 查看是否有服务维护公告
3. 联系豆包技术支持：https://www.volcengine.com/docs/6348/72761

### Q: 网络连接问题？

**排查方法**：
1. 检查 Vercel 部署日志中的网络错误
2. 确认 Vercel 可以访问豆包 API
3. 检查是否有防火墙或 IP 限制

---

## 技术支持

如果按照上述步骤操作后问题仍然存在：

1. **收集错误信息**：
   - 完整的错误日志（包括 logID）
   - 部署日志
   - 环境变量列表（可以截图）

2. **联系支持**：
   - 豆包官方文档：https://www.volcengine.com/docs/6348/72761
   - Vercel 技术支持：https://vercel.com/support
   - 豆包技术支持：通过火山引擎控制台提交工单

---

## 已完成的配置检查

### ✅ 存储配置（完全匹配）
- `COZE_BUCKET_ENDPOINT_URL` → `https://s3.cn-beijing.amazonaws.com.cn`
- `COZE_BUCKET_NAME` → `pulseopti-hr-storage`

### ⚠️ AI 服务配置（需要添加）
- `DOUBAO_API_KEY` → **需要配置**
- `SEEDREAM_API_KEY` → **需要配置**
- `VOICE_API_KEY` → **需要配置**

### ✅ 数据库配置（已有）
- `DATABASE_URL` → Neon PostgreSQL 连接字符串

---

## 下一步行动

1. **立即执行**：在 Vercel 中添加 `DOUBAO_API_KEY`、`SEEDREAM_API_KEY`、`VOICE_API_KEY`
2. **触发重新部署**
3. **等待部署完成**（约 3-5 分钟）
4. **验证 AI 功能正常工作**

---

**最后更新**：2025-01-19
**优先级**：🔴 紧急
