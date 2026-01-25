# Vercel 构建错误修复

## 🚨 错误信息

```
Error: Function Runtimes must have a valid version, for example `now-php@1.0.0`.
```

## 🔍 问题原因

在 `vercel.json` 文件中，`functions` 配置中使用了无效的 `runtime` 格式：

```json
"functions": {
  "app/api/**/*.ts": {
    "maxDuration": 60,
    "memory": 2048,
    "runtime": "nodejs20.x"  // ❌ 无效格式
  }
}
```

Vercel 对 runtime 版本的格式有严格要求，`"nodejs20.x"` 不被识别为有效格式。

## ✅ 修复方案

移除 `vercel.json` 中的 `runtime` 配置，让 Vercel 自动检测和使用正确的 Node.js 版本。

**修复后的配置**：

```json
"functions": {
  "app/api/**/*.ts": {
    "maxDuration": 60,
    "memory": 2048
  }
}
```

## 🔧 修复步骤

1. 移除 `runtime` 配置项
2. 提交代码到 GitHub
3. Vercel 自动重新部署

## 📊 修复状态

| 项目 | 状态 |
|------|------|
| 问题识别 | ✅ 已完成 |
| 代码修复 | ✅ 已完成 |
| 代码提交 | ✅ 已推送 (bcba080) |
| Vercel 部署 | 🔄 正在进行 |

## ⏱️ 时间预估

- Vercel 自动检测到代码推送
- 开始新构建
- 预计构建时间：2-5分钟

## 🎯 后续操作

构建完成后，继续配置环境变量：

1. **登录 Vercel**
   - 访问：https://vercel.com
   - 进入项目：pulseopti-hr

2. **配置环境变量**
   - Settings → Environment Variables
   - 添加 `NEXT_PUBLIC_ADMIN_DOMAIN` = `admin.aizhixuan.com.cn`
   - 添加 `NEXT_PUBLIC_USER_DOMAIN` = `www.aizhixuan.com.cn`

3. **等待部署完成**
   - 查看 Deployments 页面
   - 等待构建状态变为绿色 ✓

4. **验证修复**
   - 访问 `https://admin.aizhixuan.com.cn`
   - 确认正确路由到超管端

## 💡 说明

对于 Next.js 项目，Vercel 会自动：
- 检测 `package.json` 中的 Node.js 版本要求
- 使用合适的 Node.js 运行时
- 配置正确的构建和部署流程

**不需要**在 `vercel.json` 中手动指定 `runtime`，手动指定反而可能导致错误。

## 📝 提交信息

```
fix: 移除vercel.json中无效的runtime配置，修复构建错误

- 移除 functions 配置中的 runtime 字段
- 让 Vercel 自动检测和使用正确的 Node.js 版本
- 修复 "Function Runtimes must have a valid version" 错误

提交哈希: bcba080
```

---

**✅ 构建错误已修复，等待 Vercel 重新部署完成！**
