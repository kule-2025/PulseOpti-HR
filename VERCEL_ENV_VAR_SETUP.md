# Vercel 环境变量配置指南

## 问题说明

当前部署失败，原因：**缺少大语言模型 API Key 配置**

错误信息：
```
GatewayErr: (code: 699024202, message: raw response: , unmarshal response err
```

这表明 AI 服务调用失败，因为缺少必要的 API Key。

## 必须配置的环境变量

请在 **Vercel Dashboard → Settings → Environment Variables** 中添加以下变量：

### 1. AI 服务配置（必需）

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `DOUBAO_API_KEY` | 豆包大语言模型 API Key | [获取指南](#获取-doubao_api_key) |
| `SEEDREAM_API_KEY` | 豆包生图模型 API Key | [获取指南](#获取-seedream_api_key) |
| `VOICE_API_KEY` | 豆包语音模型 API Key | [获取指南](#获取-voice_api_key) |

### 2. 已有配置（请确认）

| 变量名 | 说明 |
|--------|------|
| `DATABASE_URL` | PostgreSQL 数据库连接字符串 |
| `COZE_BUCKET_ENDPOINT_URL` | 对象存储端点 URL |
| `COZE_BUCKET_NAME` | 存储桶名称 |

## 配置步骤

### 步骤 1：获取 API Key

#### 获取 DOUBAO_API_KEY

1. 访问：https://console.volcengine.com/ark
2. 登录火山引擎账号
3. 进入 **API Key 管理**
4. 创建新的 API Key 或使用现有 Key
5. 复制 API Key（格式类似：`a1b2c3d4-5678-90ab-cdef-1234567890ab`）

#### 获取 SEEDREAM_API_KEY

1. 访问：https://console.volcengine.com/ark
2. 进入 **生图服务** 或使用与 DOUBAO 相同的 Key
3. 如果需要单独申请，按照平台指引申请生图服务权限

#### 获取 VOICE_API_KEY

1. 访问：https://console.volcengine.com/ark
2. 进入 **语音服务** 或使用与 DOUBAO 相同的 Key
3. 如果需要单独申请，按照平台指引申请语音服务权限

**注意**：很多情况下，这三个服务可以使用同一个 API Key。建议先尝试使用相同的 Key。

### 步骤 2：在 Vercel 中配置环境变量

1. 访问 Vercel Dashboard：https://vercel.com/your-username/pulseopti-hr/settings/environment-variables
2. 点击 **"Add New"** 按钮
3. 添加以下环境变量（逐个添加）：

#### 添加 DOUBAO_API_KEY

- **Key**: `DOUBAO_API_KEY`
- **Value**: 您的豆包 API Key
- **Environment**: 勾选所有选项（☑ Production, ☑ Preview, ☑ Development）
- 点击 **"Save"**

#### 添加 SEEDREAM_API_KEY

- **Key**: `SEEDREAM_API_KEY`
- **Value**: 您的生图 API Key（通常与 DOUBAO 相同）
- **Environment**: 勾选所有选项
- 点击 **"Save"**

#### 添加 VOICE_API_KEY

- **Key**: `VOICE_API_KEY`
- **Value**: 您的语音 API Key（通常与 DOUBAO 相同）
- **Environment**: 勾选所有选项
- 点击 **"Save"**

### 步骤 3：重新部署

配置完成后，Vercel 会自动触发重新部署。如果没有，请手动触发：

1. 访问：https://vercel.com/your-username/pulseopti-hr/deployments
2. 点击最新的部署
3. 点击 **"Redeploy"** 按钮

## 验证配置

部署完成后，您可以通过以下方式验证配置：

### 方法 1：查看部署日志

1. 访问最新的部署页面
2. 点击 **"Logs"** 标签
3. 查看是否有 AI 服务相关的错误

### 方法 2：测试 API

部署成功后，测试简历解析功能：

```bash
curl -X POST https://pulseopti-hr.vercel.app/api/ai/resume-parse \
  -H "Content-Type: application/json" \
  -F "file=@your-resume.pdf"
```

## 常见问题

### Q1: 我没有火山引擎账号怎么办？

A: 您需要注册火山引擎账号并开通相关服务：
- 注册地址：https://console.volcengine.com/ark
- 新用户通常有免费额度

### Q2: API Key 格式是什么样的？

A: 豆包 API Key 通常格式为：
```
a1b2c3d4-5678-90ab-cdef-1234567890ab
```
（36 个字符的 UUID 格式）

### Q3: 可以使用相同的 API Key 吗？

A: 是的，通常 `DOUBAO_API_KEY`、`SEEDREAM_API_KEY`、`VOICE_API_KEY` 可以使用同一个豆包 API Key。

### Q4: 配置后还是报错怎么办？

A: 请检查：
1. 环境变量是否正确配置（区分大小写）
2. API Key 是否有效（未过期且有权限）
3. 是否选择了正确的环境（Production/Preview/Development）
4. 查看完整的错误日志以获取更多信息

## 联系支持

如果问题仍未解决，请联系：
- 火山引擎技术支持：https://www.volcengine.com/docs/6348/72761
- Vercel 技术支持：https://vercel.com/support

---

**最后更新时间**：2025-01-19
**文档版本**：1.0
