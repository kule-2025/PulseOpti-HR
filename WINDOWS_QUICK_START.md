# 🚀 Windows 快速开始指南

## ⭐ 推荐方法（3 选 1）

---

### 方法 1: 双击运行批处理脚本（最简单）⭐⭐⭐

**步骤**：

1. 在文件管理器中找到项目文件夹
2. 找到 `one-click-deploy.bat` 文件
3. 双击运行

脚本会自动完成所有步骤：
- ✅ 检查 Vercel CLI
- ✅ 登录 Vercel
- ✅ 链接项目
- ✅ 部署到生产环境
- ✅ 验证部署成功

---

### 方法 2: 使用 PowerShell 脚本（推荐）⭐⭐⭐

**步骤**：

1. 右键点击 `one-click-deploy.ps1` 文件
2. 选择"使用 PowerShell 运行"

或者在 PowerShell 中执行：

```powershell
# 导航到项目目录
cd C:\Users\Administrator\Desktop\PulseOpti-HR

# 运行部署脚本
.\one-click-deploy.ps1
```

如果遇到执行策略错误，先运行：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### 方法 3: 使用 PowerShell 手动命令（最可控）⭐⭐

**步骤**：

1. 右键点击"开始"按钮
2. 选择 "Windows PowerShell"
3. 导航到项目目录：
```powershell
cd C:\Users\Administrator\Desktop\PulseOpti-HR
```

4. 执行以下命令：

```powershell
# 登录 Vercel（首次需要）
vercel login

# 链接项目（首次需要）
vercel link

# 部署到生产环境
vercel --prod --yes
```

5. 等待 2-5 分钟

6. 在浏览器中访问：https://pulseopti-hr.vercel.app

---

## 📋 首次部署详细步骤（PowerShell）

### 步骤 1: 打开 PowerShell

右键点击"开始"按钮，选择 "Windows PowerShell"

### 步骤 2: 导航到项目目录

```powershell
cd C:\Users\Administrator\Desktop\PulseOpti-HR
```

（替换为您的实际项目路径）

### 步骤 3: 检查 Vercel CLI

```powershell
vercel --version
```

如果显示版本号（如 50.5.0），说明已安装。

如果没有，运行：

```powershell
npm install -g vercel
```

### 步骤 4: 登录 Vercel

```powershell
vercel login
```

按照提示操作：
- 选择登录方式（推荐 GitHub）
- 在浏览器中授权 Vercel 访问你的 GitHub 账号

### 步骤 5: 链接项目（首次需要）

```powershell
vercel link
```

按照提示选择：
- 检测到现有项目
- 选择 `tomato-writer-2024s-projects/pulseopti-hr`
- 选择生产环境配置

### 步骤 6: 部署到生产环境

```powershell
vercel --prod --yes
```

等待 2-5 分钟，直到看到：
```
✅ Production: https://pulseopti-hr.vercel.app [2m]
```

### 步骤 7: 在浏览器中验证

打开浏览器访问：https://pulseopti-hr.vercel.app

---

## 🔧 安装 Vercel CLI

如果还没有安装 Vercel CLI：

### PowerShell

```powershell
npm install -g vercel
```

或者使用 pnpm：

```powershell
pnpm add -g vercel
```

### CMD

```cmd
npm install -g vercel
```

---

## 🔍 Windows 常用命令

### PowerShell 命令

```powershell
# 检查 Vercel CLI 版本
vercel --version

# 检查登录状态
vercel whoami

# 检查 Git 状态
git status

# 检查最新提交
git log -1 --oneline

# 验证部署（使用 PowerShell）
Invoke-WebRequest -Uri "https://pulseopti-hr.vercel.app" -Method Head
```

### CMD 命令

```cmd
# 检查 Vercel CLI 版本
vercel --version

# 检查登录状态
vercel whoami

# 检查 Git 状态
git status

# 验证部署
curl -I https://pulseopti-hr.vercel.app
```

---

## ⚡ Windows 快速命令汇总

| 命令 | 用途 |
|------|------|
| `vercel --version` | 检查 Vercel CLI 版本 |
| `vercel login` | 登录 Vercel |
| `vercel link` | 链接项目 |
| `vercel --prod --yes` | 部署到生产环境 |
| `.\one-click-deploy.bat` | 运行批处理部署脚本 |
| `.\one-click-deploy.ps1` | 运行 PowerShell 部署脚本 |

---

## 📞 遇到问题？

### 问题 1: 找不到 vercel 命令

**解决方案**：安装 Vercel CLI

```powershell
npm install -g vercel
```

### 问题 2: PowerShell 执行策略错误

**错误信息**：
```
无法加载文件 one-click-deploy.ps1，因为在此系统上禁止运行脚本
```

**解决方案**：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 问题 3: 找不到 curl 命令

在 Windows 上，curl 可能不可用。使用 PowerShell 的 Invoke-WebRequest 替代：

```powershell
Invoke-WebRequest -Uri "https://pulseopti-hr.vercel.app" -Method Head
```

或者直接在浏览器中访问：https://pulseopti-hr.vercel.app

### 问题 4: 部署失败

1. 查看错误信息
2. 确认环境变量配置
3. 访问 Vercel Dashboard 查看详细日志：https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments

### 问题 5: 权限问题

以管理员身份运行 PowerShell：

1. 右键点击 "PowerShell"
2. 选择 "以管理员身份运行"

---

## 🎯 最快部署方法（推荐新手）

### 双击运行即可

1. 在文件管理器中找到项目文件夹
2. 找到 `one-click-deploy.bat` 文件
3. 双击运行
4. 按照提示操作

就这么简单！

---

## 🔗 快速链接

- **应用 URL**: https://pulseopti-hr.vercel.app
- **Vercel Dashboard**: https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr
- **部署列表**: https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments

---

## 📚 相关文档

| 文档 | 用途 | 推荐度 |
|------|------|--------|
| **WINDOWS_QUICK_START.md** | Windows 快速开始指南（当前文档） | ⭐⭐⭐ |
| WINDOWS_DEPLOY_GUIDE.md | Windows 详细部署指南 | ⭐⭐⭐ |
| one-click-deploy.bat | 批处理部署脚本 | ⭐⭐⭐ |
| one-click-deploy.ps1 | PowerShell 部署脚本 | ⭐⭐⭐ |

---

## 💡 建议

1. **最简单**：双击运行 `one-click-deploy.bat`
2. **最推荐**：使用 `one-click-deploy.ps1`（功能更强大）
3. **最可控**：使用 PowerShell 手动命令（便于学习）

---

## ✅ Windows 部署流程总结

### 方法 A: 双击运行（最简单）

1. 找到 `one-click-deploy.bat`
2. 双击运行
3. 完成！

### 方法 B: PowerShell 脚本（推荐）

1. 右键点击 `one-click-deploy.ps1`
2. 选择"使用 PowerShell 运行"
3. 完成！

### 方法 C: 手动命令（最可控）

```powershell
cd C:\Users\Administrator\Desktop\PulseOpti-HR
vercel login
vercel link
vercel --prod --yes
```

4. 在浏览器中访问：https://pulseopti-hr.vercel.app

---

**提示**：Windows 10/11 的 PowerShell 已经很强大，推荐使用。双击运行 `.bat` 文件是最简单的方法。

**状态**: ✅ Windows 部署工具已准备就绪

**推荐方法**: 双击运行 `one-click-deploy.bat`
