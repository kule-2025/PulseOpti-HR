# Vercel 本地部署命令步骤

## 方法 1: 使用 Vercel CLI 部署（推荐）

### 步骤 1: 确认 Vercel CLI 已安装

```bash
vercel --version
```

如果显示版本号（如 50.5.0），说明已安装。如果没有，运行：

```bash
pnpm add -g vercel
```

### 步骤 2: 登录 Vercel

```bash
vercel login
```

按照提示操作：
- 选择登录方式（推荐 GitHub）
- 在浏览器中授权 Vercel 访问你的 GitHub 账号
- 授权后返回终端

### 步骤 3: 链接项目（如果需要）

```bash
vercel link
```

按照提示操作：
- 检测到现有项目，选择 `tomato-writer-2024s-projects/pulseopti-hr`
- 选择项目配置（生产环境）

### 步骤 4: 部署到生产环境

```bash
vercel --prod --yes
```

参数说明：
- `--prod`: 部署到生产环境
- `--yes`: 自动确认所有提示

### 步骤 5: 等待部署完成

部署过程可能需要 2-5 分钟，等待直到看到：
```
✅ Production: https://pulseopti-hr.vercel.app [2m]
```

### 步骤 6: 验证部署

```bash
curl -I https://pulseopti-hr.vercel.app
```

应该返回：
```
HTTP/2 200
content-type: text/html; charset=utf-8
...
```

---

## 方法 2: 使用自动部署脚本

### 步骤 1: 使用自动部署脚本

```bash
bash vercel-auto-deploy.sh
```

按照提示操作：
- 方法 1：使用 Vercel CLI（推荐）
- 方法 2：使用 GitHub Webhook
- 方法 3：查看手动操作指南

### 步骤 2: 选择方法

输入 `y` 或 `n` 来选择是否继续。

---

## 方法 3: 通过 GitHub Webhook 触发

### 步骤 1: 创建触发 commit

```bash
echo "[Vercel Auto-Deploy] Trigger deployment" >> .vercel-trigger
git add .vercel-trigger
git commit -m "[vercel] 触发自动部署"
```

### 步骤 2: 推送到 GitHub

```bash
git push origin main
```

### 步骤 3: 清理触发文件

```bash
git rm .vercel-trigger
git commit -m "[vercel] 清理触发文件"
git push origin main
```

### 步骤 4: 等待部署

如果 Vercel 已正确连接到 GitHub，应该会自动触发部署。等待 2-5 分钟。

### 步骤 5: 验证部署

```bash
curl -I https://pulseopti-hr.vercel.app
```

---

## 方法 4: 使用自动脚本（一行命令）

### 使用 trigger-vercel-webhook.sh

```bash
bash trigger-vercel-webhook.sh
```

这个脚本会自动：
1. 检查 Git 状态
2. 创建触发 commit
3. 推送到 GitHub
4. 清理触发文件

---

## 验证和检查命令

### 检查 Vercel 部署状态

```bash
bash check-vercel-deploy-status.sh
```

### 检查 Git 状态

```bash
git status
```

### 检查最新提交

```bash
git log -1 --oneline
```

### 检查远程提交

```bash
git log origin/main -1 --oneline
```

---

## 快速命令汇总（推荐顺序）

### 方案 A: 使用 Vercel CLI（最可靠）

```bash
# 1. 登录 Vercel（首次使用）
vercel login

# 2. 部署到生产环境
vercel --prod --yes

# 3. 验证部署
curl -I https://pulseopti-hr.vercel.app
```

### 方案 B: 使用自动脚本（最简单）

```bash
# 1. 运行自动部署脚本
bash vercel-auto-deploy.sh

# 2. 按照提示操作

# 3. 验证部署
curl -I https://pulseopti-hr.vercel.app
```

### 方案 C: 通过 GitHub Webhook（需要 Git 集成正确配置）

```bash
# 1. 触发部署
bash trigger-vercel-webhook.sh

# 2. 等待 2-5 分钟

# 3. 验证部署
curl -I https://pulseopti-hr.vercel.app
```

---

## 故障排除

### 问题 1: Vercel CLI 未登录

**症状**：运行 `vercel login` 后提示 "No existing credentials found"

**解决**：
```bash
vercel login
```

按照提示在浏览器中授权。

### 问题 2: 项目未链接

**症状**：运行 `vercel --prod` 提示需要链接项目

**解决**：
```bash
vercel link
```

### 问题 3: 部署失败

**症状**：`vercel --prod` 执行过程中报错

**解决**：
1. 检查错误信息
2. 确认环境变量配置
3. 访问 Vercel Dashboard 查看详细日志：https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments

### 问题 4: 应用无法访问

**症状**：部署成功但 `curl -I https://pulseopti-hr.vercel.app` 返回错误

**解决**：
```bash
# 1. 检查部署状态
bash check-vercel-deploy-status.sh

# 2. 访问 Vercel Dashboard
https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments

# 3. 查看部署日志
```

---

## 推荐执行流程（完整版）

```bash
# ========================================
# 完整的 Vercel 部署流程
# ========================================

# 步骤 1: 检查环境
echo "=== 步骤 1: 检查环境 ==="
vercel --version
git status

# 步骤 2: 确保代码已推送
echo "=== 步骤 2: 确保代码已推送 ==="
git push origin main

# 步骤 3: 登录 Vercel（首次使用）
echo "=== 步骤 3: 登录 Vercel ==="
vercel login

# 步骤 4: 链接项目（如果需要）
echo "=== 步骤 4: 链接项目 ==="
vercel link

# 步骤 5: 部署到生产环境
echo "=== 步骤 5: 部署到生产环境 ==="
vercel --prod --yes

# 步骤 6: 等待部署完成
echo "=== 步骤 6: 等待部署完成 ==="
echo "请等待 2-5 分钟..."

# 步骤 7: 验证部署
echo "=== 步骤 7: 验证部署 ==="
sleep 10
curl -I https://pulseopti-hr.vercel.app

# 步骤 8: 访问应用
echo "=== 步骤 8: 访问应用 ==="
echo "应用 URL: https://pulseopti-hr.vercel.app"
```

---

## 一键执行（复制粘贴即可）

### 最简单的方法（推荐）

```bash
vercel login && vercel link && vercel --prod --yes && curl -I https://pulseopti-hr.vercel.app
```

### 如果需要跳过链接步骤

```bash
vercel login && vercel --prod --yes && curl -I https://pulseopti-hr.vercel.app
```

### 使用自动脚本

```bash
bash vercel-auto-deploy.sh
```

---

## 后续操作

部署成功后：

1. 访问应用：https://pulseopti-hr.vercel.app
2. 测试功能：
   - ✅ 访问首页
   - ✅ 测试 AI 功能（简历解析、面试辅助等）
   - ✅ 测试数据库连接
   - ✅ 测试对象存储功能

3. 查看部署状态：
   - Vercel Dashboard: https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments

4. 如果有问题，查看部署日志。

---

## 联系支持

如果以上方法都无法解决问题：

- **Vercel 支持**: https://vercel.com/support
- **Vercel Dashboard**: https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr
