# 快速修复：Git Clone 问题

## 🚨 问题原因
网络无法访问 GitHub，导致 Git 克隆失败。

---

## ⚡ 最快解决方案（推荐，5分钟）

### 步骤 1：下载 ZIP 包

**方式 A：使用 Gitee（推荐，国内速度快）**
1. 打开浏览器，访问：https://gitee.com/tomato-writer-2024/PulseOpti-HR
2. 点击右侧的"克隆/下载"按钮
3. 选择"下载 ZIP"
4. 等待下载完成

**方式 B：使用 GitHub**
1. 打开浏览器，访问：https://github.com/tomato-writer-2024/PulseOpti-HR
2. 点击绿色的 "Code" 按钮
3. 选择 "Download ZIP"
4. 等待下载完成

---

### 步骤 2：解压文件

1. 找到下载的 ZIP 文件（通常在"下载"文件夹）
2. 右键点击 ZIP 文件
3. 选择"解压到..."或"全部解压"
4. 解压到：`C:\PulseOpti-HR\`
5. 确保解压后的路径是：`C:\PulseOpti-HR\PulseOpti-HR`

---

### 步骤 3：进入项目目录

打开 CMD，执行：
```cmd
cd C:\PulseOpti-HR\PulseOpti-HR
```

---

### 步骤 4：验证文件

执行以下命令，确认文件存在：
```cmd
dir deploy-admin-to-vercel.bat
dir package.json
```

**预期输出**：
```
驱动器 C 中的卷没有标签。
 卷的序列号是 XXXX-XXXX

 C:\PulseOpti-HR\PulseOpti-HR 的目录

2024/12/19  XX:XX    XXXX deploy-admin-to-vercel.bat
2024/12/19  XX:XX    XXXX package.json
               2 个文件     XXXX 字节
```

---

### 步骤 5：安装依赖

```cmd
pnpm install
```

---

### 步骤 6：执行部署脚本

```cmd
deploy-admin-to-vercel.bat
```

---

## 🔄 备选方案：使用 Gitee 镜像

如果你有 Git 并且网络允许访问 Gitee：

```cmd
cd C:\PulseOpti-HR

git clone https://gitee.com/tomato-writer-2024/PulseOpti-HR.git

cd PulseOpti-HR

pnpm install

deploy-admin-to-vercel.bat
```

---

## ✅ 验证是否成功

进入目录后，执行：
```cmd
dir
```

应该能看到以下关键文件：
- ✅ `deploy-admin-to-vercel.bat`
- ✅ `deploy-admin-to-vercel.ps1`
- ✅ `package.json`
- ✅ `src/`
- ✅ `public/`

---

## 📊 完整流程对比

| 方案 | 难度 | 时间 | 需要 Git | 网络要求 |
|------|------|------|---------|---------|
| **下载 ZIP** | ⭐ 简单 | 5分钟 | ❌ 不需要 | 低 |
| **Gitee 镜像** | ⭐⭐ 中等 | 10分钟 | ✅ 需要 | 中 |
| **GitHub 代理** | ⭐⭐⭐ 困难 | 15分钟 | ✅ 需要 | 高 |

---

## 🎯 推荐选择

**如果你是新手** → 使用 **下载 ZIP** 方式

**如果你有 Git** → 使用 **Gitee 镜像** 方式

**如果你有代理** → 使用 **GitHub 代理** 方式

---

## 📝 常见错误

### 错误 1：`系统找不到指定的路径`
**原因**：目录不存在
**解决**：
```cmd
# 确认解压后的路径是否正确
dir C:\PulseOpti-HR\PulseOpti-HR

# 如果不存在，重新解压
```

### 错误 2：`dir deploy-admin-to-vercel.bat` 显示"找不到文件"
**原因**：文件不存在或路径错误
**解决**：
```cmd
# 查看当前目录下的所有文件
dir

# 如果没有找到，检查解压路径是否正确
```

### 错误 3：`pnpm install` 失败
**原因**：pnpm 未安装
**解决**：
```cmd
# 安装 pnpm
npm install -g pnpm

# 重新安装依赖
pnpm install
```

---

## 🚀 快速开始（复制粘贴版）

### 下载 ZIP 方式
```cmd
# 1. 浏览器访问下载
# https://gitee.com/tomato-writer-2024/PulseOpti-HR
# 点击"下载 ZIP"

# 2. 解压到 C:\PulseOpti-HR\PulseOpti-HR

# 3. 进入目录
cd C:\PulseOpti-HR\PulseOpti-HR

# 4. 验证文件
dir deploy-admin-to-vercel.bat

# 5. 安装依赖
pnpm install

# 6. 执行部署
deploy-admin-to-vercel.bat
```

### Gitee 镜像方式
```cmd
cd C:\PulseOpti-HR

git clone https://gitee.com/tomato-writer-2024/PulseOpti-HR.git

cd PulseOpti-HR

pnpm install

deploy-admin-to-vercel.bat
```

---

**快速修复版本**：v1.0.0
**更新时间**：2024-12-19

现在你可以开始部署了！🚀
