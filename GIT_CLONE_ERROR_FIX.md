# Git克隆错误修复指南

## 问题分析

### 问题1：双重目录
你在 `C:\PulseOpti-HR` 目录下执行克隆，导致文件被克隆到 `C:\PulseOpti-HR\PulseOpti-HR`

### 问题2：Git检出失败
错误：`invalid path 'C:\PulseOpti-HR\PulseOpti-HR\COPY_PASTE_COMMANDS.md'`

这是Windows文件名路径问题。

---

## 解决方案

### 步骤1：清理错误的克隆

```cmd
cd C:\
rmdir /s /q PulseOpti-HR
```

### 步骤2：配置Git以处理Windows路径

```cmd
git config --global core.protectNTFS false
git config --global core.longpaths true
git config --global core.autocrlf true
```

### 步骤3：重新克隆

```cmd
cd C:\
git clone https://github.com/tomato-writer-2024/PulseOpti-HR.git
```

### 步骤4：如果检出仍然失败，手动恢复

如果再次出现检出错误，执行：

```cmd
cd PulseOpti-HR
git restore --source=HEAD :/
```

---

## 一键执行脚本

创建 `fix-clone.bat` 文件并运行：

```batch
@echo off
echo 正在清理旧的克隆目录...
cd C:\
if exist PulseOpti-HR rmdir /s /q PulseOpti-HR

echo 正在配置Git...
git config --global core.protectNTFS false
git config --global core.longpaths true
git config --global core.autocrlf true

echo 正在克隆仓库...
git clone https://github.com/tomato-writer-2024/PulseOpti-HR.git

echo 克隆完成，正在恢复文件...
cd PulseOpti-HR
git restore --source=HEAD :/

echo 正在安装依赖...
pnpm install

echo 完成！
pause
```

---

## 验证步骤

### 1. 检查目录结构
```cmd
cd C:\PulseOpti-HR
dir
```

应该看到：
- package.json
- src/
- public/
- .git/

### 2. 验证Git状态
```cmd
git status
```

应该显示：
```
On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean
```

### 3. 检查package.json
```cmd
type package.json
```

应该看到项目配置信息。

---

## 备选方案：直接下载ZIP

如果Git克隆仍有问题：

1. 访问：https://github.com/tomato-writer-2024/PulseOpti-HR
2. 点击 "Code" → "Download ZIP"
3. 下载后解压到 `C:\PulseOpti-HR`
4. 删除解压后的ZIP包
5. 确保解压后的文件夹中直接包含 `package.json`

---

## 常见问题

### Q1: 为什么会双重目录？
A: 因为你在 `C:\PulseOpti-HR` 目录下执行克隆，Git会在当前目录下创建同名文件夹。

### Q2: Git检出失败的原因？
A: Windows对文件路径长度和特殊字符有限制，某些文件名可能触发这些限制。

### Q3: 如果不想重新克隆？
A: 可以尝试手动修复：
```cmd
cd C:\PulseOpti-HR\PulseOpti-HR
git restore --source=HEAD :/
pnpm install
```

---

## 下一步

克隆成功后，继续执行：

```cmd
cd C:\PulseOpti-HR
pnpm install
```

然后按照超管端部署指南操作。
