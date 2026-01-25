# 🚀 沙箱环境 Vercel 部署详细步骤

## 📋 环境检查

首先检查沙箱环境状态：

```bash
# 检查当前工作目录
pwd

# 检查项目文件
ls -la *.sh *.bat *.ps1 2>/dev/null

# 检查 Vercel CLI
vercel --version

# 检查 Git 状态
git status
```

---

## 🎯 方法 1: 使用一键部署脚本（最简单）⭐⭐⭐

### 步骤 1: 确认脚本存在

```bash
ls -lh one-click-deploy.sh
```

如果文件存在，继续下一步。

### 步骤 2: 运行一键部署脚本

```bash
bash one-click-deploy.sh
```

这个脚本会自动完成：
- ✅ 检查 Vercel CLI
- ✅ 登录 Vercel
- ✅ 链接项目
- ✅ 部署到生产环境
- ✅ 验证部署成功

### 步骤 3: 按照提示操作

脚本会提示您：
1. 检查 Vercel CLI 版本
2. 检查登录状态
3. 检查 Git 状态
4. 链接项目（首次需要）
5. 部署到生产环境
6. 验证部署

按照屏幕上的提示操作即可。

---

## 🎯 方法 2: 使用 Vercel CLI 手动部署（最可控）⭐⭐⭐

### 步骤 1: 检查 Vercel CLI

```bash
vercel --version
```

应该显示版本号，如 `50.5.0`。

如果未安装：

```bash
pnpm add -g vercel
```

### 步骤 2: 登录 Vercel

```bash
vercel login
```

按照提示操作：
- 选择登录方式（推荐 GitHub）
- 复制显示的 URL 到浏览器
- 授权 Vercel 访问你的 GitHub 账号
- 复制返回的 token 粘贴到终端

示例输出：
```
> Log in to Vercel
? Link to existing project or create a new one? [y/N] y
> What's your GitHub username? tomato-writer-2024
> What's your Vercel access token? ...
✓ Logged in as tomato-writer-2024
```

### 步骤 3: 链接项目（首次需要）

```bash
vercel link
```

按照提示操作：
- 选择项目：`tomato-writer-2024s-projects/pulseopti-hr`
- 选择环境：Production

示例输出：
```
> Vercel CLI
> Linking to tomato-writer-2024s-projects/pulseopti-hr
> Which scope should contain your project? tomato-writer-2024
> Link to tomato-writer-2024s-projects/pulseopti-hr? [Y/n] y
✓ Linked to tomato-writer-2024s-projects/pulseopti-hr
```

### 步骤 4: 部署到生产环境

```bash
vercel --prod --yes
```

参数说明：
- `--prod`: 部署到生产环境
- `--yes`: 自动确认所有提示

部署过程需要 2-5 分钟。

示例输出：
```
> Vercel CLI
> Deploying to production...
> Detecting Next.js...
> Building...
✓ Build completed in 45s
> Uploading...
✓ Uploaded in 10s
> Deployed to https://pulseopti-hr.vercel.app [2m]
```

### 步骤 5: 验证部署

```bash
curl -I https://pulseopti-hr.vercel.app
```

期望返回：
```
HTTP/2 200
content-type: text/html; charset=utf-8
...
```

---

## 🎯 方法 3: 使用触发 Webhook 脚本（需要 Git 集成）⭐⭐

### 步骤 1: 运行触发脚本

```bash
bash trigger-vercel-webhook.sh
```

这个脚本会：
1. 检查 Git 状态
2. 创建触发 commit
3. 推送到 GitHub
4. 清理触发文件

### 步骤 2: 等待部署

等待 2-5 分钟，如果 Vercel 已正确连接到 GitHub，会自动触发部署。

### 步骤 3: 验证部署

```bash
curl -I https://pulseopti-hr.vercel.app
```

---

## 🔍 完整的详细步骤（推荐新手）

### 步骤 1: 检查环境

```bash
# 显示当前目录
pwd

# 列出部署相关文件
ls -lh *.sh

# 检查 Vercel CLI
vercel --version

# 检查 Git 状态
git status
```

### 步骤 2: 确认代码已推送

```bash
# 拉取最新代码
git pull origin main

# 检查最新提交
git log -1 --oneline

# 确认本地和远程同步
git rev-parse HEAD
git rev-parse origin/main
```

### 步骤 3: 登录 Vercel

```bash
vercel login
```

按照提示操作：

1. 如果提示选择登录方式，输入 `y` 链接到现有项目
2. 输入 GitHub 用户名：`tomato-writer-2024`
3. 浏览器会打开授权页面
4. 复制显示的 URL 到浏览器
5. 授权 Vercel 访问 GitHub
6. 复制返回的 token 粘贴到终端

### 步骤 4: 链接项目

```bash
vercel link
```

按照提示操作：

1. 检测到现有项目时，选择 `tomato-writer-2024s-projects/pulseopti-hr`
2. 选择生产环境配置

### 步骤 5: 部署到生产环境

```bash
vercel --prod --yes
```

等待 2-5 分钟，观察输出：

```
> Vercel CLI
> Detecting Next.js
> Building...
> Compiling...
✓ Build completed
> Uploading...
✓ Uploaded
> Deployed to https://pulseopti-hr.vercel.app
```

### 步骤 6: 验证部署成功

```bash
# 方法 1: 使用 curl
curl -I https://pulseopti-hr.vercel.app

# 方法 2: 检查 HTTP 状态码
curl -s -o /dev/null -w "%{http_code}" https://pulseopti-hr.vercel.app

# 方法 3: 访问应用首页
curl https://pulseopti-hr.vercel.app | head -20
```

期望看到 `200` 状态码。

### 步骤 7: 测试应用功能

```bash
# 测试 API 端点
curl https://pulseopti-hr.vercel.app/api/health

# 测试登录页面
curl https://pulseopti-hr.vercel.app/login
```

---

## 🛠️ 故障排除

### 问题 1: Vercel CLI 未安装

**症状**：
```
command not found: vercel
```

**解决方案**：
```bash
pnpm add -g vercel
vercel --version
```

### 问题 2: 未登录 Vercel

**症状**：
```
Error: No existing credentials found. Please run `vercel login`
```

**解决方案**：
```bash
vercel login
```

按照提示操作，授权 Vercel 访问 GitHub。

### 问题 3: 项目未链接

**症状**：
```
Error: Could not find an active project
```

**解决方案**：
```bash
vercel link
```

按照提示选择项目：`tomato-writer-2024s-projects/pulseopti-hr`

### 问题 4: 部署失败

**症状**：
```
Error: Build failed
```

**解决方案**：

1. 查看错误信息
2. 检查代码是否有语法错误
3. 检查环境变量是否配置
4. 访问 Vercel Dashboard 查看详细日志：
   https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments

### 问题 5: 应用无法访问

**症状**：
```
curl: (28) Failed to connect to pulseopti-hr.vercel.app
```

**解决方案**：

1. 检查部署状态：
```bash
bash check-vercel-deploy-status.sh
```

2. 访问 Vercel Dashboard：
   https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments

3. 查看部署日志

4. 重新部署：
```bash
vercel --prod --yes
```

---

## 📊 部署检查脚本

### 检查待部署版本

```bash
bash check-pending-deploys.sh
```

这个脚本会：
- 显示最近的提交记录
- 检查本地和远程同步状态
- 列出应该部署的重要版本
- 检查应用部署状态

### 检查部署状态

```bash
bash check-vercel-deploy-status.sh
```

这个脚本会：
- 检查 Git 状态
- 检查应用是否可访问
- 提供诊断建议

---

## 🎯 最快部署方法（一行命令）

### 如果已登录 Vercel

```bash
vercel --prod --yes && curl -I https://pulseopti-hr.vercel.app
```

### 如果需要登录和链接

```bash
vercel login && vercel link && vercel --prod --yes && curl -I https://pulseopti-hr.vercel.app
```

### 使用一键脚本

```bash
bash one-click-deploy.sh
```

---

## 📝 部署后验证

### 步骤 1: 检查应用状态

```bash
curl -I https://pulseopti-hr.vercel.app
```

期望返回 `HTTP/2 200`。

### 步骤 2: 检查关键页面

```bash
# 首页
curl -I https://pulseopti-hr.vercel.app/

# 登录页面
curl -I https://pulseopti-hr.vercel.app/login

# API 健康检查
curl -I https://pulseopti-hr.vercel.app/api/health
```

### 步骤 3: 访问应用

在浏览器中访问：
```
https://pulseopti-hr.vercel.app
```

---

## 🔗 快速链接

- **应用 URL**: https://pulseopti-hr.vercel.app
- **Vercel Dashboard**: https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr
- **部署列表**: https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments

---

## 💡 建议

1. **最简单**: 使用 `bash one-click-deploy.sh`
2. **最快速**: 使用 `vercel --prod --yes`
3. **最可控**: 使用手动步骤（方法 2）

---

**提示**：在沙箱环境中，推荐使用方法 1（一键部署脚本），它会自动完成所有步骤。

**状态**: ✅ 沙箱环境已准备就绪，可以立即部署
