# 🚀 Vercel 本地部署 - 立即执行

## ⭐ 推荐方法（3 选 1）

### 方法 1: 一键部署脚本（最简单）⭐⭐⭐

```bash
bash one-click-deploy.sh
```

这个脚本会自动完成：
- ✅ 检查 Vercel CLI
- ✅ 登录 Vercel
- ✅ 链接项目
- ✅ 部署到生产环境
- ✅ 验证部署成功

---

### 方法 2: 一行命令部署（最快速）⭐⭐⭐

```bash
vercel login && vercel link && vercel --prod --yes && curl -I https://pulseopti-hr.vercel.app
```

复制粘贴这一行命令到终端执行即可。

---

### 方法 3: 分步执行（最可控）⭐⭐

```bash
# 步骤 1: 登录 Vercel
vercel login

# 步骤 2: 链接项目（首次需要）
vercel link

# 步骤 3: 部署到生产环境
vercel --prod --yes

# 步骤 4: 验证部署
curl -I https://pulseopti-hr.vercel.app
```

---

## 📋 首次部署详细步骤

### 1. 检查 Vercel CLI

```bash
vercel --version
```

如果显示版本号（如 50.5.0），说明已安装。如果没有，运行：

```bash
pnpm add -g vercel
```

### 2. 登录 Vercel

```bash
vercel login
```

按照提示操作：
- 选择登录方式（推荐 GitHub）
- 在浏览器中授权 Vercel 访问你的 GitHub 账号

### 3. 链接项目（首次需要）

```bash
vercel link
```

按照提示选择：
- 检测到现有项目
- 选择 `tomato-writer-2024s-projects/pulseopti-hr`
- 选择生产环境配置

### 4. 部署到生产环境

```bash
vercel --prod --yes
```

等待 2-5 分钟，直到看到：
```
✅ Production: https://pulseopti-hr.vercel.app [2m]
```

### 5. 验证部署

```bash
curl -I https://pulseopti-hr.vercel.app
```

应该返回：
```
HTTP/2 200
content-type: text/html; charset=utf-8
...
```

### 6. 访问应用

打开浏览器访问：https://pulseopti-hr.vercel.app

---

## 🔍 常用检查命令

```bash
# 检查 Vercel CLI 版本
vercel --version

# 检查登录状态
vercel whoami

# 检查 Git 状态
git status

# 检查最新提交
git log -1 --oneline

# 检查 Vercel 部署状态
bash check-vercel-deploy-status.sh

# 验证应用可访问性
curl -I https://pulseopti-hr.vercel.app
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
| `bash check-vercel-deploy-status.sh` | 检查部署状态 |

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

在浏览器中授权 Vercel 访问你的 GitHub 账号。

### 问题 3: 部署失败

1. 查看错误信息
2. 确认环境变量配置
3. 访问 Vercel Dashboard 查看详细日志：https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments

### 问题 4: 应用无法访问

```bash
# 检查部署状态
bash check-vercel-deploy-status.sh

# 或者访问 Vercel Dashboard
# https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments
```

---

## 🔗 快速链接

- **应用 URL**: https://pulseopti-hr.vercel.app
- **Vercel Dashboard**: https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr
- **部署列表**: https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments

---

## 📚 详细文档

- **QUICK_COMMANDS.md**: 快速命令参考
- **LOCAL_DEPLOY_COMMANDS.md**: 详细部署步骤
- **VERCEL_AUTO_DEPLOY_SOLUTION.md**: 完整解决方案

---

## ✅ 推荐执行流程

```bash
# ========================================
# Vercel 本地部署完整流程
# ========================================

# 1. 登录 Vercel（首次需要）
vercel login

# 2. 链接项目（首次需要）
vercel link

# 3. 部署到生产环境
vercel --prod --yes

# 4. 验证部署
curl -I https://pulseopti-hr.vercel.app

# 5. 访问应用
# 打开浏览器访问: https://pulseopti-hr.vercel.app
```

---

**提示**：
- 首次部署建议使用方法 3（分步执行），便于了解每一步
- 熟悉后可以使用方法 2（一行命令）
- 最简单的是方法 1（一键部署脚本）

**状态**: ✅ 所有工具和文档已准备就绪，可以立即开始部署

**Git 提交**: 72252d9 - docs: 添加 Vercel 本地部署命令步骤和一键部署脚本
