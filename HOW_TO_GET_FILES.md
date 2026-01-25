# 如何获取 one-click-deploy.ps1 文件

## 问题说明

`one-click-deploy.ps1` 文件已经在远程 GitHub 仓库中创建，但您的本地电脑还没有拉取最新的代码。

---

## 🚀 解决方案（3 种方法）

---

### 方法 1: 从 GitHub 拉取最新代码（推荐）⭐⭐⭐

#### 步骤:

1. **打开 PowerShell**
   - 右键点击"开始"按钮
   - 选择 "Windows PowerShell"

2. **导航到项目目录**
   ```powershell
   cd C:\Users\Administrator\Desktop\PulseOpti-HR
   ```
   （替换为您的实际项目路径）

3. **拉取最新代码**
   ```powershell
   git pull origin main
   ```

4. **检查文件是否存在**
   ```powershell
   dir one-click-deploy.ps1
   ```

5. **运行部署脚本**
   ```powershell
   .\one-click-deploy.ps1
   ```

---

### 方法 2: 直接从 GitHub 下载文件（最简单）⭐⭐⭐

#### 步骤:

1. **访问 GitHub 仓库**
   打开浏览器访问：
   ```
   https://github.com/tomato-writer-2024/PulseOpti-HR
   ```

2. **查找文件**
   在仓库页面中，找到以下文件：
   - `one-click-deploy.ps1`
   - `one-click-deploy.bat`
   - `WINDOWS_QUICK_START.md`

3. **下载文件**
   - 点击文件名
   - 点击页面右上角的 "Raw" 按钮
   - 右键点击页面，选择 "另存为"
   - 保存到项目目录

4. **运行部署脚本**
   - 找到 `one-click-deploy.bat` 文件
   - 双击运行
   - 或右键点击 `one-click-deploy.ps1`，选择"使用 PowerShell 运行"

---

### 方法 3: 使用 Git Bash（如果已安装）⭐⭐

#### 步骤:

1. **打开 Git Bash**
   - 右键点击项目文件夹
   - 选择 "Git Bash Here"

2. **拉取最新代码**
   ```bash
   git pull origin main
   ```

3. **运行部署脚本**
   ```bash
   bash one-click-deploy.sh
   ```

---

## 📁 文件位置

所有部署文件都在项目根目录：

```
PulseOpti-HR/
├── one-click-deploy.ps1          # PowerShell 部署脚本
├── one-click-deploy.bat           # 批处理部署脚本
├── one-click-deploy.sh            # Bash 部署脚本
├── WINDOWS_QUICK_START.md         # Windows 快速开始指南
├── WINDOWS_DEPLOY_GUIDE.md        # Windows 详细部署指南
├── PENDING_DEPLOY_REPORT.md       # 待部署版本报告
└── ... (其他文件)
```

---

## 🔍 验证文件是否下载成功

### PowerShell

```powershell
# 检查文件是否存在
dir one-click-deploy.ps1

# 查看文件内容
type one-click-deploy.ps1
```

### CMD

```cmd
# 检查文件是否存在
dir one-click-deploy.ps1

# 查看文件内容
type one-click-deploy.ps1
```

---

## 🎯 最简单的方法（推荐新手）

### 步骤 1: 打开浏览器

访问：
```
https://github.com/tomato-writer-2024/PulseOpti-HR
```

### 步骤 2: 找到文件

在仓库页面中找到 `one-click-deploy.bat` 文件

### 步骤 3: 下载文件

1. 点击 `one-click-deploy.bat` 文件名
2. 点击页面右上角的 "Raw" 按钮
3. 右键点击页面，选择 "另存为"
4. 保存到项目目录（例如：`C:\Users\Administrator\Desktop\PulseOpti-HR\`）

### 步骤 4: 运行

找到下载的 `one-click-deploy.bat` 文件，双击运行！

---

## 📞 遇到问题？

### 问题 1: 找不到项目目录

**解决方案**：
1. 打开文件管理器
2. 导航到您的项目目录
3. 在地址栏中输入 `cmd` 或 `powershell`，打开命令行
4. 然后执行拉取命令

### 问题 2: Git 未安装

**解决方案**：
1. 下载 Git for Windows: https://git-scm.com/download/win
2. 安装后重试方法 1 或方法 3

### 问题 3: 没有项目文件夹

**解决方案**：
1. 克隆项目：
   ```powershell
   git clone https://github.com/tomato-writer-2024/PulseOpti-HR.git
   ```
2. 导航到项目目录：
   ```powershell
   cd PulseOpti-HR
   ```

---

## 🔗 快速链接

- **GitHub 仓库**: https://github.com/tomato-writer-2024/PulseOpti-HR
- **one-click-deploy.ps1**: https://github.com/tomato-writer-2024/PulseOpti-HR/blob/main/one-click-deploy.ps1
- **one-click-deploy.bat**: https://github.com/tomato-writer-2024/PulseOpti-HR/blob/main/one-click-deploy.bat

---

## 💡 建议

**最简单的方法**：
1. 直接从 GitHub 下载 `one-click-deploy.bat` 文件
2. 保存到项目目录
3. 双击运行

**最快的方法**：
1. 使用 PowerShell 执行 `git pull origin main`
2. 运行 `.\one-click-deploy.ps1`

---

**提示**：如果您的本地项目是空的或没有这些文件，建议先拉取最新的代码。
