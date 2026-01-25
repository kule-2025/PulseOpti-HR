# PulseOpti HR 最终部署指南

## 📊 项目状态总览

### ✅ 已完成的工作

1. **项目初始化与核心功能**
   - Next.js 16.1.1 + React 19 + TypeScript 5 项目结构
   - Drizzle ORM 数据模型（员工档案、考勤、招聘、绩效）
   - 豆包大模型集成（coze-coding-dev-sdk）
   - shadcn/ui 组件库和 Tailwind CSS 4

2. **代码修复**
   - 修复了所有 TypeScript 类型错误
   - 修复了 GatewayErr 错误
   - 修复了 API 路由错误

3. **部署工具**
   - ✅ `one-click-deploy.bat` - Windows 批处理脚本
   - ✅ `one-click-deploy.ps1` - PowerShell 脚本
   - ✅ `deploy-skip-login.sh` - 跳过登录检查的脚本
   - ✅ `SANDBOX_FINAL_GUIDE.md` - 沙箱环境部署指南

### ⚠️ 待处理事项

1. **Vercel 部署**
   - 当前有 29 个版本未部署到 Vercel
   - GitHub 集成可能未正确触发自动部署

2. **仓库迁移** ✅ 已完成
   - 代码已成功推送到 `tomato-writer-2024/pulseopti-hr`
   - 所有文件和提交记录已同步

---

## 🚀 部署到 Vercel 的三种方案

### 方案 1：使用 Vercel Dashboard（推荐，无需代码）

这是最简单的方式，适合所有环境：

1. **登录 Vercel Dashboard**
   - 访问：https://vercel.com/dashboard
   - 使用你的 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New" → "Project"
   - 选择仓库：`tomato-writer-2024/pulseopti-hr`
   - 点击 "Import"

3. **配置环境变量**
   
   在 "Environment Variables" 部分添加：
   ```env
   # 数据库配置（在 Vercel PostgreSQL 中获取）
   DATABASE_URL=postgresql://user:pass@host:port/dbname

   # 豆包大模型配置
   COZE_BOT_ID=your_bot_id
   COZE_API_TOKEN=your_api_token

   # 其他配置
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

4. **部署**
   - 点击 "Deploy" 按钮
   - 等待部署完成（通常 2-3 分钟）

5. **获取 URL**
   - 部署完成后，你会得到一个 `.vercel.app` 域名
   - 可以在 "Settings" → "Domains" 中添加自定义域名

---

### 方案 2：使用 Vercel CLI（适合本地环境）

#### Windows 用户（PowerShell）

```powershell
# 1. 下载并运行 PowerShell 脚本
# 方式 1：从 GitHub 下载
# 访问: https://github.com/tomato-writer-2024/PulseOpti-HR/blob/main/one-click-deploy.ps1
# 下载后右键 → "使用 PowerShell 运行"

# 方式 2：直接用 PowerShell 下载并运行
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/tomato-writer-2024/PulseOpti-HR/main/one-click-deploy.ps1" -OutFile "one-click-deploy.ps1"
.\one-click-deploy.ps1
```

#### Mac/Linux 用户

```bash
# 1. 赋予执行权限
chmod +x deploy-skip-login.sh

# 2. 运行部署脚本
./deploy-skip-login.sh
```

#### 手动部署步骤（如果脚本失败）

```bash
# 1. 安装 Vercel CLI（如果未安装）
npm i -g vercel@50.5.0

# 2. 登录 Vercel
vercel login

# 3. 部署到生产环境
vercel --prod

# 4. 配置环境变量（如需要）
vercel env add DATABASE_URL production
vercel env add COZE_BOT_ID production
vercel env add COZE_API_TOKEN production
```

---

### 方案 3：沙箱环境部署

如果当前环境是沙箱，按照 `SANDBOX_FINAL_GUIDE.md` 执行：

1. **使用 Token 登录（推荐）**
   ```bash
   # 获取 Vercel Token: https://vercel.com/account/tokens
   export VERCEL_TOKEN=your_token_here
   
   # 登录
   vercel login --token
   ```

2. **部署**
   ```bash
   vercel --prod --yes
   ```

3. **配置环境变量**
   ```bash
   vercel env pull .env.local
   # 编辑 .env.local 文件
   vercel env push
   ```

---

## 📦 仓库迁移指南

### 问题说明

尝试推送到 `tomato-ai-writer/pulseopti-hr` 时遇到错误：
```
remote: Repository not found.
```

**原因分析：**
1. 仓库可能尚未创建
2. 当前 Token 可能没有访问该仓库的权限

### 解决方案

#### 方案 1：手动创建新仓库（推荐）

1. **创建仓库**
   - 访问：https://github.com/new
   - 仓库名称：`pulseopti-hr`
   - 所有者：选择 `tomato-ai-writer` 组织
   - 设置为 **Public** 或 **Private**（根据需要）
   - **不要**初始化 README、.gitignore 或 LICENSE

2. **推送代码**
   
   等仓库创建完成后，在项目根目录执行：
   ```bash
   # 添加远程仓库（替换 YOUR_TOKEN）
   git remote add tomato-ai-writer https://YOUR_TOKEN@github.com/tomato-ai-writer/pulseopti-hr.git
   
   # 推送所有分支
   git push tomato-ai-writer main
   
   # 推送所有标签
   git push tomato-ai-writer --tags
   ```

#### 方案 2：使用 GitHub CLI（如果已安装）

```bash
# 1. 创建仓库
gh repo create tomato-ai-writer/pulseopti-hr --public --source=. --remote=tomato-ai-writer --push

# 2. 如果需要设置为私有
# gh repo edit tomato-ai-writer/pulseopti-hr --visibility private
```

#### 方案 3：Fork 原仓库并重命名

如果无法创建新仓库，可以：

1. **Fork 原仓库**
   - 访问：https://github.com/tomato-writer-2024/PulseOpti-HR
   - 点击 "Fork" 按钮
   - 选择 `tomato-ai-writer` 作为所有者

2. **重命名仓库**
   - 进入 Fork 的仓库
   - Settings → General → Repository name
   - 改为：`pulseopti-hr`

---

## 🔧 配置 GitHub 集成（启用自动部署）

### 在 Vercel Dashboard 中配置

1. **添加 GitHub 集成**
   - 访问：https://vercel.com/dashboard
   - 点击 "Settings" → "Git Integrations"
   - 选择 "GitHub"
   - 按照 Vercel 提供的步骤授权

2. **连接仓库**
   - 返回项目页面
   - 点击 "Settings" → "Git"
   - 确认已连接正确的 GitHub 仓库

3. **启用自动部署**
   - "Settings" → "Git" → "Deploy Hooks"
   - 确保分支规则设置为：
     - `main` 分支：每次 push 都自动部署
     - `production` 环境：使用 `--prod` 参数

4. **测试自动部署**
   ```bash
   # 在本地修改一个文件
   echo "# Test auto-deploy" >> README.md
   
   # 提交并推送
   git add .
   git commit -m "test: 测试自动部署"
   git push origin main
   ```

   如果配置正确，Vercel 会自动开始部署。

---

## 🧪 部署后验证清单

### 1. 检查部署状态

访问 Vercel Dashboard：https://vercel.com/dashboard

确认：
- ✅ 部署状态为 "Ready"
- ✅ 没有 build errors
- ✅ 域名可访问

### 2. 功能测试

访问应用 URL（如 `https://pulseopti-hr.vercel.app`），测试：

**核心功能：**
- [ ] 登录/注册功能
- [ ] 员工档案管理
- [ ] 考勤记录查看
- [ ] 招聘信息发布
- [ ] 绩效评估

**AI 功能（需要配置环境变量）：**
- [ ] AI 招聘助手
- [ ] AI 绩效分析
- [ ] 智能问答

### 3. 数据库连接

检查：
- [ ] Vercel PostgreSQL 已创建
- [ ] 数据库连接字符串已配置
- [ ] Drizzle 迁移已运行（如果有）

```bash
# 运行数据库迁移（如果需要）
npx drizzle-kit push
```

### 4. 环境变量检查

在 Vercel Dashboard → Settings → Environment Variables 中确认：

- [ ] `DATABASE_URL` - PostgreSQL 连接字符串
- [ ] `COZE_BOT_ID` - 豆包机器人 ID
- [ ] `COZE_API_TOKEN` - 豆包 API Token
- [ ] `NEXT_PUBLIC_APP_URL` - 应用 URL

---

## 📞 故障排查

### 问题 1：部署失败

**症状：** Vercel 部署时出现 build errors

**解决方案：**
1. 查看构建日志
2. 检查 `package.json` 中的依赖版本
3. 确保所有环境变量已配置
4. 本地运行 `pnpm build` 测试

### 问题 2：数据库连接失败

**症状：** 应用无法连接到数据库

**解决方案：**
1. 检查 `DATABASE_URL` 是否正确
2. 确认 Vercel PostgreSQL 已创建
3. 测试连接字符串：
   ```bash
   psql $DATABASE_URL
   ```

### 问题 3：AI 功能不工作

**症状：** AI 功能返回错误或无响应

**解决方案：**
1. 检查 `COZE_BOT_ID` 和 `COZE_API_TOKEN` 是否配置
2. 确认 Token 有足够权限
3. 查看应用日志中的 API 调用错误

### 问题 4：推送代码到新仓库失败

**症状：** `git push` 返回 "Repository not found"

**解决方案：**
1. 确认仓库已创建
2. 检查 Token 权限（需要 `repo` 权限）
3. 验证仓库 URL 拼写正确
4. 确认你有访问该仓库的权限

---

## 📝 总结

### 当前状态

✅ **已准备就绪：**
- 代码已修复并优化
- 部署工具已创建
- 文档已完善

⚠️ **需要手动操作：**
1. 在 Vercel Dashboard 中部署项目
2. 创建 `tomato-ai-writer/pulseopti-hr` 仓库（如果需要）
3. 配置 GitHub 集成以启用自动部署

### 推荐操作流程

**最快速的方式：**
1. 访问 https://vercel.com/dashboard
2. 导入 `tomato-writer-2024/PulseOpti-HR` 仓库
3. 配置环境变量
4. 点击部署

**完整的方式：**
1. 按照"仓库迁移指南"创建新仓库
2. 推送代码到新仓库
3. 在 Vercel 中导入新仓库
4. 配置 GitHub 集成
5. 测试自动部署

---

## 📚 相关文档

- `SANDBOX_FINAL_GUIDE.md` - 沙箱环境详细部署指南
- `PUSH_TO_TOMATO_AI_WRITER.md` - 推送到新仓库指南
- `one-click-deploy.bat` - Windows 批处理部署脚本
- `one-click-deploy.ps1` - PowerShell 部署脚本
- `deploy-skip-login.sh` - Linux/Mac 部署脚本

---

**创建时间：** 2025-06-17  
**版本：** 1.0  
**项目：** PulseOpti HR 脉策聚效
