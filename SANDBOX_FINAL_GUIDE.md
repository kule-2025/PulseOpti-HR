# 🚀 沙箱环境 Vercel 部署最终指南

## 📋 当前环境状态

### ✅ 已准备就绪

- [x] Vercel CLI 已安装 (版本 50.5.0)
- [x] 部署脚本已准备就绪
- [x] 代码已推送到 GitHub (commit: 42948c7)
- [x] Git 仓库已同步

### ⚠️ 需要解决的问题

**问题**: Vercel CLI 需要登录，但沙箱环境无法打开浏览器

**解决方案**: 使用 Vercel Token 登录

---

## 🔐 解决方案：使用 Vercel Token 登录

### 步骤 1: 获取 Vercel Token

1. **访问 Vercel Dashboard**
   ```
   https://vercel.com/account/tokens
   ```

2. **创建新 Token**
   - 点击 "Create Token"
   - 输入 Token 名称（如：Sandbox-Deploy）
   - 选择 Token 作用域：Full Account
   - 点击 "Create Token"
   - **复制生成的 Token**

### 步骤 2: 使用 Token 登录

在沙箱环境中执行：

```bash
echo "YOUR_TOKEN_HERE" | vercel login --token
```

**示例**：
```bash
echo "abc123xyz..." | vercel login --token
```

**重要**: 将 `YOUR_TOKEN_HERE` 替换为您复制的实际 Token。

### 步骤 3: 链接项目

```bash
vercel link
```

按照提示操作：
- 选择项目：`tomato-writer-2024s-projects/pulseopti-hr`
- 选择环境：Production

### 步骤 4: 部署到生产环境

```bash
vercel --prod --yes
```

等待 2-5 分钟。

### 步骤 5: 验证部署

```bash
curl -I https://pulseopti-hr.vercel.app
```

---

## 🎯 完整执行流程

### 步骤 1: 获取 Token（在本地浏览器中）

1. 访问：https://vercel.com/account/tokens
2. 创建新 Token
3. 复制 Token

### 步骤 2: 在沙箱环境中登录

```bash
# 使用 Token 登录
echo "YOUR_TOKEN_HERE" | vercel login --token

# 验证登录状态
vercel whoami
```

### 步骤 3: 链接项目

```bash
vercel link
```

### 步骤 4: 部署

```bash
vercel --prod --yes
```

### 步骤 5: 验证

```bash
curl -I https://pulseopti-hr.vercel.app
```

---

## 🚨 替代方案：使用 Vercel Dashboard

如果无法在沙箱环境中登录 Vercel CLI，可以使用 Vercel Dashboard 手动部署。

### 步骤 1: 访问 Vercel Dashboard

```
https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments
```

### 步骤 2: 检查 GitHub 集成

1. 访问：https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/settings/git
2. 确认 GitHub 集成已正确连接
3. 确保 "Automatic Deployments" 已启用

### 步骤 3: 手动触发部署

1. 在部署列表页面
2. 找到最新的提交（commit: 42948c7）
3. 点击右侧的 "..." 菜单
4. 选择 "Redeploy"
5. 选择 "Redeploy to Production"
6. 点击 "Redeploy"

### 步骤 4: 等待部署完成

等待 2-5 分钟。

### 步骤 5: 验证部署

在浏览器中访问：https://pulseopti-hr.vercel.app

---

## 📊 当前待部署版本

### 最新提交

```
42948c7 - docs: 添加沙箱环境立即部署指南
```

### 待部署更新统计

- **功能更新**: 10 个
- **修复更新**: 10 个（包括 500+ 代码错误修复）
- **文档更新**: 7 个
- **总计**: 27 个

---

## 🔗 快速链接

### Vercel Dashboard

- **项目主页**: https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr
- **部署列表**: https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments
- **Git 设置**: https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/settings/git
- **环境变量**: https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/settings/environment-variables

### Token 创建

- **Vercel Tokens**: https://vercel.com/account/tokens

---

## 💡 推荐

**方案 1: 使用 Vercel CLI（推荐）**

1. 在浏览器中创建 Vercel Token
2. 在沙箱环境中使用 Token 登录
3. 链接项目并部署

**方案 2: 使用 Vercel Dashboard（最简单）**

1. 访问 Vercel Dashboard
2. 手动触发部署
3. 等待部署完成

---

## 📝 示例命令

### 使用 Token 登录

```bash
# 步骤 1: 使用 Token 登录
echo "YOUR_VERCEL_TOKEN" | vercel login --token

# 步骤 2: 验证登录
vercel whoami

# 步骤 3: 链接项目
vercel link

# 步骤 4: 部署
vercel --prod --yes

# 步骤 5: 验证
curl -I https://pulseopti-hr.vercel.app
```

### 一行命令（需要先获取 Token）

```bash
echo "YOUR_VERCEL_TOKEN" | vercel login --token && vercel link && vercel --prod --yes && curl -I https://pulseopti-hr.vercel.app
```

---

## 📞 遇到问题？

### 问题 1: 登录失败

**解决方案**：
1. 检查 Token 是否正确
2. 确保 Token 权限足够
3. 重新创建 Token

### 问题 2: 部署失败

**解决方案**：
1. 访问 Vercel Dashboard 查看详细日志
2. 检查环境变量配置
3. 确认代码是否有错误

### 问题 3: 应用无法访问

**解决方案**：
1. 检查部署状态
2. 查看部署日志
3. 重新部署

---

## ✅ 总结

### 方案 1: Vercel CLI（推荐）

1. 创建 Vercel Token
2. 使用 Token 登录
3. 部署

### 方案 2: Vercel Dashboard（最简单）

1. 访问 Vercel Dashboard
2. 手动触发部署

---

**提示**: 如果无法在沙箱环境中完成登录，推荐使用 Vercel Dashboard 手动部署。

**状态**: ✅ 代码已准备就绪，等待部署

**Git 提交**: 42948c7 - docs: 添加沙箱环境立即部署指南
