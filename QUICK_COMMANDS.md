# Vercel 部署快速命令（复制即可）

## 🚀 最快部署方法（推荐）

### 方法 1: 一键部署脚本 ⭐⭐⭐

```bash
bash one-click-deploy.sh
```

### 方法 2: 一行命令部署 ⭐⭐⭐

```bash
vercel login && vercel link && vercel --prod --yes && curl -I https://pulseopti-hr.vercel.app
```

### 方法 3: 分步执行 ⭐⭐

```bash
# 1. 登录 Vercel
vercel login

# 2. 链接项目（首次需要）
vercel link

# 3. 部署到生产环境
vercel --prod --yes

# 4. 验证部署
curl -I https://pulseopti-hr.vercel.app
```

---

## 📋 完整步骤（新手推荐）

### 步骤 1: 确认环境

```bash
vercel --version
```

### 步骤 2: 登录 Vercel

```bash
vercel login
```

在浏览器中授权 Vercel 访问你的 GitHub 账号。

### 步骤 3: 链接项目（首次需要）

```bash
vercel link
```

选择项目：`tomato-writer-2024s-projects/pulseopti-hr`

### 步骤 4: 部署到生产环境

```bash
vercel --prod --yes
```

等待 2-5 分钟。

### 步骤 5: 验证部署

```bash
curl -I https://pulseopti-hr.vercel.app
```

应该返回 `HTTP/2 200`。

### 步骤 6: 访问应用

打开浏览器访问：https://pulseopti-hr.vercel.app

---

## 🔍 检查命令

### 检查 Git 状态

```bash
git status
```

### 检查最新提交

```bash
git log -1 --oneline
```

### 检查 Vercel 部署状态

```bash
bash check-vercel-deploy-status.sh
```

---

## ⚡ 快速命令汇总

| 命令 | 用途 |
|------|------|
| `vercel --version` | 检查 Vercel CLI 版本 |
| `vercel login` | 登录 Vercel |
| `vercel link` | 链接项目 |
| `vercel --prod --yes` | 部署到生产环境 |
| `curl -I https://pulseopti-hr.vercel.app` | 验证部署 |
| `bash one-click-deploy.sh` | 一键部署 |

---

## 📞 遇到问题？

### 问题 1: Vercel CLI 未安装

```bash
pnpm add -g vercel
```

### 问题 2: 登录失败

```bash
vercel login
```

按照提示在浏览器中授权。

### 问题 3: 部署失败

1. 检查错误信息
2. 确认环境变量配置
3. 查看详细日志：https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments

### 问题 4: 应用无法访问

```bash
bash check-vercel-deploy-status.sh
```

或者访问 Vercel Dashboard 查看部署状态。

---

## 🎯 推荐流程（复制执行）

```bash
# ========================================
# Vercel 本地部署完整流程
# ========================================

# 1. 登录 Vercel
vercel login

# 2. 链接项目
vercel link

# 3. 部署到生产环境
vercel --prod --yes

# 4. 验证部署
curl -I https://pulseopti-hr.vercel.app

# 5. 访问应用
# 打开浏览器访问: https://pulseopti-hr.vercel.app
```

---

## 📚 详细文档

- **LOCAL_DEPLOY_COMMANDS.md**: 详细的部署步骤和故障排除
- **VERCEL_AUTO_DEPLOY_SOLUTION.md**: 完整的解决方案
- **one-click-deploy.sh**: 一键部署脚本
- **check-vercel-deploy-status.sh**: 检查部署状态

---

## 🔗 快速链接

- **Vercel Dashboard**: https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr
- **部署列表**: https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments
- **应用 URL**: https://pulseopti-hr.vercel.app

---

**提示**: 如果是首次部署，建议使用 `bash one-click-deploy.sh` 脚本，它会自动完成所有步骤。
