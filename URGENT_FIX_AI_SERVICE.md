# 紧急修复：AI 服务配置缺失导致部署失败

## 问题描述

**错误信息**：
```
GatewayErr: (code: 699024202, message: raw response: , unmarshal response err
```

**根本原因**：
您的项目使用了豆包大语言模型服务，但是 Vercel 环境变量中**缺少必要的 API Key**。

## 立即修复步骤（3分钟内完成）

### 步骤 1：访问 Vercel Dashboard

1. 打开浏览器，访问：https://vercel.com/your-username/pulseopti-hr/settings/environment-variables
2. 确保您已登录到正确的项目

### 步骤 2：添加 AI 服务环境变量

您需要添加以下 3 个环境变量（建议使用相同的 API Key）：

#### 添加 DOUBAO_API_KEY

点击 **"Add New"** 按钮，填写：
- **Name**: `DOUBAO_API_KEY` （精确匹配，区分大小写）
- **Value**: 您的豆包 API Key
- **Environment**: 勾选所有选项 ☑ Production ☑ Preview ☑ Development
- 点击 **"Save"**

#### 添加 SEEDREAM_API_KEY

点击 **"Add New"** 按钮，填写：
- **Name**: `SEEDREAM_API_KEY` （精确匹配，区分大小写）
- **Value**: 您的豆包 API Key（通常与 DOUBAO 相同）
- **Environment**: 勾选所有选项 ☑ Production ☑ Preview ☑ Development
- 点击 **"Save"**

#### 添加 VOICE_API_KEY

点击 **"Add New"** 按钮，填写：
- **Name**: `VOICE_API_KEY` （精确匹配，区分大小写）
- **Value**: 您的豆包 API Key（通常与 DOUBAO 相同）
- **Environment**: 勾选所有选项 ☑ Production ☑ Preview ☑ Development
- 点击 **"Save"**

### 步骤 3：触发重新部署

Vercel 会自动检测到环境变量变更并触发部署。如果没有，请手动触发：

1. 访问：https://vercel.com/your-username/pulseopti-hr/deployments
2. 找到最新的部署
3. 点击 **"Redeploy"** 按钮

## 如何获取豆包 API Key？

如果您还没有豆包 API Key，请按以下步骤获取：

### 注册火山引擎账号

1. 访问：https://console.volcengine.com/ark
2. 点击 **"注册"** 创建账号（如果已有账号则直接登录）
3. 完成实名认证（需要手机号和身份证）

### 创建 API Key

1. 登录后，进入 **控制台**
2. 点击 **"API Key 管理"**
3. 点击 **"创建 API Key"**
4. 复制生成的 API Key（格式类似：`a1b2c3d4-5678-90ab-cdef-1234567890ab`）

### 检查服务权限

确认您已开通以下服务：
- ✅ 豆包大语言模型（Doubao-Seed）
- ✅ 豆包生图模型（Seedream）
- ✅ 豆包语音模型（Voice）

**注意**：大多数情况下，这三个服务使用同一个 API Key。

## 验证修复

部署完成后，您可以通过以下方式验证：

### 方法 1：查看部署状态

访问 Vercel Dashboard，检查：
- ✅ 部署状态是否为 "Ready"
- ✅ 没有错误日志

### 方法 2：测试 AI 功能

部署成功后，测试简历解析功能：

```bash
# 测试简历解析 API
curl -X POST https://pulseopti-hr.vercel.app/api/ai/resume-parse \
  -F "file=@your-resume.pdf"
```

## 常见问题

### Q: API Key 格式是什么样的？

A: 豆包 API Key 是 36 个字符的 UUID 格式：
```
a1b2c3d4-5678-90ab-cdef-1234567890ab
```

### Q: 可以使用测试 API Key 吗？

A: 建议使用正式的 API Key。新用户通常有免费额度。

### Q: 为什么需要三个 API Key？

A: 虽然可以使用相同的 Key，但不同服务可能需要不同的权限配置。建议先用相同的 Key 测试，如果出现权限错误再考虑分开配置。

### Q: 配置后还是报错怎么办？

请检查：
1. 环境变量名称是否完全匹配（区分大小写）
2. API Key 是否有效（未过期）
3. 是否选择了正确的环境（Production/Preview/Development）
4. 查看完整的错误日志获取更多信息

## 已完成的工作

✅ 更新 `vercel.json` 文件，添加了 AI 服务环境变量引用
✅ 创建了详细的环境变量配置指南（`VERCEL_ENV_VAR_SETUP.md`）
✅ 创建了这份紧急修复文档

## 下一步

1. 按照上述步骤配置环境变量
2. 等待 Vercel 自动重新部署
3. 验证部署成功
4. 测试 AI 功能是否正常工作

## 技术支持

如果问题仍未解决：
- 豆包官方文档：https://www.volcengine.com/docs/6348/72761
- Vercel 技术支持：https://vercel.com/support

---

**最后更新**：2025-01-19
**优先级**：🔴 紧急
