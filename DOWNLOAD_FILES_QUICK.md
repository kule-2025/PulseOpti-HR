# 🚀 快速获取部署文件（直接下载）

## 📥 直接下载链接

### Windows 用户必需文件

#### 1. one-click-deploy.bat（批处理脚本，双击即可运行）

**下载链接**：
```
https://raw.githubusercontent.com/tomato-writer-2024/PulseOpti-HR/main/one-click-deploy.bat
```

**保存位置**：
```
C:\Users\Administrator\Desktop\PulseOpti-HR\one-click-deploy.bat
```

#### 2. one-click-deploy.ps1（PowerShell 脚本）

**下载链接**：
```
https://raw.githubusercontent.com/tomato-writer-2024/PulseOpti-HR/main/one-click-deploy.ps1
```

**保存位置**：
```
C:\Users\Administrator\Desktop\PulseOpti-HR\one-click-deploy.ps1
```

#### 3. WINDOWS_QUICK_START.md（快速开始指南）

**下载链接**：
```
https://raw.githubusercontent.com/tomato-writer-2024/PulseOpti-HR/main/WINDOWS_QUICK_START.md
```

**保存位置**：
```
C:\Users\Administrator\Desktop\PulseOpti-HR\WINDOWS_QUICK_START.md
```

---

## 🎯 下载步骤（最简单）

### 步骤 1: 创建项目文件夹

1. 打开文件管理器
2. 导航到桌面
3. 创建新文件夹，命名为 `PulseOpti-HR`
4. 路径应该是：`C:\Users\Administrator\Desktop\PulseOpti-HR`

### 步骤 2: 下载 one-click-deploy.bat

1. 复制以下链接到浏览器地址栏：
   ```
   https://raw.githubusercontent.com/tomato-writer-2024/PulseOpti-HR/main/one-click-deploy.bat
   ```

2. 浏览器会显示文件内容

3. 右键点击页面，选择"另存为"

4. 保存到：
   ```
   C:\Users\Administrator\Desktop\PulseOpti-HR\one-click-deploy.bat
   ```

### 步骤 3: 运行部署脚本

1. 打开文件管理器
2. 导航到 `C:\Users\Administrator\Desktop\PulseOpti-HR`
3. 找到 `one-click-deploy.bat` 文件
4. **双击运行**

就这么简单！

---

## 🔧 替代方法（使用 PowerShell）

如果您更喜欢使用 PowerShell：

### 步骤 1: 打开 PowerShell

右键点击"开始"按钮，选择 "Windows PowerShell"

### 步骤 2: 创建项目文件夹

```powershell
New-Item -ItemType Directory -Path "C:\Users\Administrator\Desktop\PulseOpti-HR" -Force
cd "C:\Users\Administrator\Desktop\PulseOpti-HR"
```

### 步骤 3: 下载文件

```powershell
# 下载 one-click-deploy.bat
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/tomato-writer-2024/PulseOpti-HR/main/one-click-deploy.bat" -OutFile "one-click-deploy.bat"

# 下载 one-click-deploy.ps1
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/tomato-writer-2024/PulseOpti-HR/main/one-click-deploy.ps1" -OutFile "one-click-deploy.ps1"

# 下载 WINDOWS_QUICK_START.md
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/tomato-writer-2024/PulseOpti-HR/main/WINDOWS_QUICK_START.md" -OutFile "WINDOWS_QUICK_START.md"
```

### 步骤 4: 运行部署脚本

```powershell
.\one-click-deploy.bat
```

或者：

```powershell
.\one-click-deploy.ps1
```

---

## 📋 检查文件是否下载成功

### PowerShell

```powershell
cd "C:\Users\Administrator\Desktop\PulseOpti-HR"
dir
```

应该看到：
```
one-click-deploy.bat
one-click-deploy.ps1
WINDOWS_QUICK_START.md
```

### 文件管理器

打开 `C:\Users\Administrator\Desktop\PulseOpti-HR` 文件夹，应该看到这些文件。

---

## 🎨 最快部署流程（完整版）

### 1. 下载文件

**方法 A: 浏览器下载（推荐）**

1. 访问：https://raw.githubusercontent.com/tomato-writer-2024/PulseOpti-HR/main/one-click-deploy.bat
2. 右键点击页面，选择"另存为"
3. 保存到桌面（或任何位置）
4. 重命名为 `one-click-deploy.bat`

**方法 B: PowerShell 下载（推荐）**

打开 PowerShell，执行：

```powershell
# 创建文件夹
New-Item -ItemType Directory -Path "$HOME\Desktop\PulseOpti-HR" -Force

# 下载文件
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/tomato-writer-2024/PulseOpti-HR/main/one-click-deploy.bat" -OutFile "$HOME\Desktop\PulseOpti-HR\one-click-deploy.bat"
```

### 2. 运行部署脚本

找到下载的 `one-click-deploy.bat` 文件，双击运行！

---

## 🔗 所有文件下载链接

| 文件名 | 下载链接 | 必需 |
|--------|----------|------|
| one-click-deploy.bat | [下载](https://raw.githubusercontent.com/tomato-writer-2024/PulseOpti-HR/main/one-click-deploy.bat) | ✅ |
| one-click-deploy.ps1 | [下载](https://raw.githubusercontent.com/tomato-writer-2024/PulseOpti-HR/main/one-click-deploy.ps1) | ✅ |
| WINDOWS_QUICK_START.md | [下载](https://raw.githubusercontent.com/tomato-writer-2024/PulseOpti-HR/main/WINDOWS_QUICK_START.md) | ⭐ |
| WINDOWS_DEPLOY_GUIDE.md | [下载](https://raw.githubusercontent.com/tomato-writer-2024/PulseOpti-HR/main/WINDOWS_DEPLOY_GUIDE.md) | ⭐ |
| PENDING_DEPLOY_REPORT.md | [下载](https://raw.githubusercontent.com/tomato-writer-2024/PulseOpti-HR/main/PENDING_DEPLOY_REPORT.md) | ⭐ |

---

## 💡 提示

### 保存文件时注意：

1. **文件扩展名**：确保保存为 `.bat` 或 `.ps1`，不要保存为 `.txt`
2. **保存位置**：建议保存到桌面或项目文件夹，便于找到
3. **文件名**：确保文件名正确，特别是 `one-click-deploy.bat`

### 如果保存为 .txt 文件：

1. 右键点击文件
2. 选择"重命名"
3. 删除 `.txt` 后缀
4. 确保文件名是 `one-click-deploy.bat`

---

## 📞 遇到问题？

### 问题 1: 下载的文件是 .txt 格式

**解决方案**：
1. 右键点击文件
2. 选择"重命名"
3. 删除 `.txt` 后缀
4. 确保文件名是 `one-click-deploy.bat`

### 问题 2: 浏览器显示的是文件内容而不是下载

**解决方案**：
1. 右键点击页面
2. 选择"另存为"
3. 选择保存位置
4. 输入文件名 `one-click-deploy.bat`
5. 点击"保存"

### 问题 3: 不知道保存到哪个文件夹

**解决方案**：
保存到桌面即可，路径：`C:\Users\Administrator\Desktop\`

---

## 🎯 最简单的方法总结

### 只需 3 步：

1. **下载文件**
   - 访问：https://raw.githubusercontent.com/tomato-writer-2024/PulseOpti-HR/main/one-click-deploy.bat
   - 右键点击页面，选择"另存为"
   - 保存到桌面，文件名：`one-click-deploy.bat`

2. **运行脚本**
   - 找到桌面的 `one-click-deploy.bat` 文件
   - 双击运行

3. **完成！**
   - 按照提示操作
   - 等待部署完成

---

**提示**：如果您的项目文件夹在桌面，下载文件到项目文件夹即可。

**最简单的方法**：直接下载 `one-click-deploy.bat` 到桌面，双击运行！
