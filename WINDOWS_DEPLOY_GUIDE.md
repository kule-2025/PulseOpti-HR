# Vercel Windows 部署指南

## 🚀 Windows 部署方法

### 方法 1: 使用 PowerShell（推荐）⭐⭐⭐

#### 步骤 1: 打开 PowerShell

右键点击"开始"按钮，选择 "Windows PowerShell" 或 "终端"

#### 步骤 2: 安装 Vercel CLI

```powershell
npm install -g vercel
```

或者使用 pnpm：

```powershell
pnpm add -g vercel
```

#### 步骤 3: 登录 Vercel

```powershell
vercel login
```

按照提示操作：
- 选择登录方式（推荐 GitHub）
- 在浏览器中授权 Vercel 访问你的 GitHub 账号

#### 步骤 4: 导航到项目目录

```powershell
cd C:\Users\Administrator\Desktop\PulseOpti-HR
```

或者您的项目实际路径

#### 步骤 5: 链接项目（首次需要）

```powershell
vercel link
```

按照提示选择：
- 检测到现有项目
- 选择 `tomato-writer-2024s-projects/pulseopti-hr`
- 选择生产环境配置

#### 步骤 6: 部署到生产环境

```powershell
vercel --prod --yes
```

等待 2-5 分钟，直到看到：
```
✅ Production: https://pulseopti-hr.vercel.app [2m]
```

#### 步骤 7: 验证部署

```powershell
curl -I https://pulseopti-hr.vercel.app
```

应该返回：
```
HTTP/2 200
content-type: text/html; charset=utf-8
...
```

或者直接在浏览器中访问：https://pulseopti-hr.vercel.app

---

### 方法 2: 使用 CMD 命令提示符

#### 步骤 1: 打开 CMD

按 `Win + R`，输入 `cmd`，回车

#### 步骤 2: 安装 Vercel CLI

```cmd
npm install -g vercel
```

#### 步骤 3: 登录 Vercel

```cmd
vercel login
```

#### 步骤 4: 导航到项目目录

```cmd
cd C:\Users\Administrator\Desktop\PulseOpti-HR
```

#### 步骤 5: 链接项目

```cmd
vercel link
```

#### 步骤 6: 部署到生产环境

```cmd
vercel --prod --yes
```

#### 步骤 7: 验证部署

```cmd
curl -I https://pulseopti-hr.vercel.app
```

---

### 方法 3: 使用 Git Bash（如果有安装）⭐⭐⭐

如果您已安装 Git for Windows，可以使用 Git Bash。

#### 步骤 1: 打开 Git Bash

右键点击文件夹，选择 "Git Bash Here"

#### 步骤 2: 安装 Vercel CLI

```bash
pnpm add -g vercel
```

#### 步骤 3: 登录 Vercel

```bash
vercel login
```

#### 步骤 4: 链接项目

```bash
vercel link
```

#### 步骤 5: 部署到生产环境

```bash
vercel --prod --yes
```

#### 步骤 6: 验证部署

```bash
curl -I https://pulseopti-hr.vercel.app
```

---

### 方法 4: 使用 WSL（Windows Subsystem for Linux）⭐⭐⭐

如果您已安装 WSL，可以使用 Linux 环境。

#### 步骤 1: 打开 WSL

按 `Win + R`，输入 `wsl`，回车

#### 步骤 2: 导航到项目目录

```bash
cd /mnt/c/Users/Administrator/Desktop/PulseOpti-HR
```

#### 步骤 3: 执行部署

```bash
bash one-click-deploy.sh
```

或使用一行命令：

```bash
vercel login && vercel link && vercel --prod --yes && curl -I https://pulseopti-hr.vercel.app
```

---

## 🔧 安装 Git Bash（推荐）

如果没有安装 Git Bash，建议安装：

### 1. 下载 Git for Windows

访问：https://git-scm.com/download/win

### 2. 安装

下载后运行安装程序，使用默认设置即可。

### 3. 打开 Git Bash

安装完成后，右键点击文件夹，选择 "Git Bash Here"。

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

# 验证部署
curl -I https://pulseopti-hr.vercel.app
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

## ⚡ Windows 一键部署（PowerShell）

### 打开 PowerShell，复制粘贴以下命令：

```powershell
# 导航到项目目录
cd C:\Users\Administrator\Desktop\PulseOpti-HR

# 登录 Vercel（首次需要）
vercel login

# 链接项目（首次需要）
vercel link

# 部署到生产环境
vercel --prod --yes

# 验证部署
curl -I https://pulseopti-hr.vercel.app
```

---

## 📞 遇到问题？

### 问题 1: Vercel CLI 未安装

**PowerShell**:
```powershell
npm install -g vercel
```

**CMD**:
```cmd
npm install -g vercel
```

### 问题 2: 找不到 curl 命令

在 Windows 上，curl 命令可能需要使用完整路径或安装 Git Bash。

或者直接在浏览器中访问：https://pulseopti-hr.vercel.app

### 问题 3: 部署失败

1. 查看错误信息
2. 确认环境变量配置
3. 访问 Vercel Dashboard 查看详细日志：https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments

### 问题 4: 权限问题

以管理员身份运行 PowerShell 或 CMD：

1. 右键点击 "PowerShell" 或 "命令提示符"
2. 选择 "以管理员身份运行"

---

## 🎯 推荐的 Windows 部署流程

### 步骤 1: 打开 PowerShell

右键点击"开始"按钮，选择 "Windows PowerShell"

### 步骤 2: 导航到项目目录

```powershell
cd C:\Users\Administrator\Desktop\PulseOpti-HR
```

（替换为您的实际项目路径）

### 步骤 3: 登录 Vercel（首次需要）

```powershell
vercel login
```

### 步骤 4: 链接项目（首次需要）

```powershell
vercel link
```

### 步骤 5: 部署到生产环境

```powershell
vercel --prod --yes
```

### 步骤 6: 在浏览器中验证

打开浏览器访问：https://pulseopti-hr.vercel.app

---

## 🔗 快速链接

- **应用 URL**: https://pulseopti-hr.vercel.app
- **Vercel Dashboard**: https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr
- **部署列表**: https://vercel.com/tomato-writer-2024s-projects/pulseopti-hr/deployments

---

## 💡 建议

1. **推荐使用 PowerShell**：Windows 自带，功能强大
2. **安装 Git Bash**：提供类似 Linux 的命令行环境
3. **安装 WSL**：如果需要完整的 Linux 环境

---

**提示**：Windows 10/11 的 PowerShell 已经很强大，可以直接使用。如果习惯 Linux 命令，建议安装 Git Bash。

**状态**: ✅ Windows 部署方法已准备就绪

**推荐方法**: 使用 PowerShell，步骤 1-6
