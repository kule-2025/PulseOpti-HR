# 使用GitHub仓库克隆指南

## 问题说明
Gitee镜像仓库需要身份验证，而GitHub原始仓库是公开的，可以直接克隆。

## 解决方案1：使用GitHub原始仓库（推荐）

### Windows CMD命令
```cmd
git clone https://github.com/tomato-writer-2024/PulseOpti-HR.git
```

### PowerShell命令
```powershell
git clone https://github.com/tomato-writer-2024/PulseOpti-HR.git
```

### Git Bash命令
```bash
git clone https://github.com/tomato-writer-2024/PulseOpti-HR.git
```

## 解决方案2：下载ZIP包

如果Git克隆仍有问题，可以直接下载ZIP包：

1. 访问：https://github.com/tomato-writer-2024/PulseOpti-HR
2. 点击绿色的 "Code" 按钮
3. 选择 "Download ZIP"
4. 下载完成后解压到 `C:\PulseOpti-HR`

## 解决方案3：使用Gitee镜像（需要访问令牌）

如果必须使用Gitee镜像，需要：

1. 生成Gitee个人访问令牌：
   - 访问：https://gitee.com/profile/personal_access_tokens
   - 点击 "生成新令牌"
   - 选择 "read_repository" 权限
   - 复制生成的令牌

2. 克隆时使用令牌（将YOUR_TOKEN替换为实际令牌）：
```cmd
git clone https://YOUR_TOKEN@gitee.com/tomato-writer-2024/PulseOpti-HR.git
```

## 克隆完成后的下一步

克隆成功后，执行以下命令：

```cmd
cd PulseOpti-HR
pnpm install
```

然后按照部署指南进行后续操作。

## 常见问题

### 问题1：克隆速度慢
- 使用镜像：`git clone https://gitee.com/tomato-writer-2024/PulseOpti-HR.git`
- 或下载ZIP包

### 问题2：克隆中断
- 重新执行克隆命令，Git会支持断点续传
- 或使用下载ZIP包

### 问题3：网络问题
- 检查网络连接
- 尝试使用手机热点
- 或下载ZIP包

## 快速操作（推荐）

在 `C:\` 目录下执行：

```cmd
cd C:\
git clone https://github.com/tomato-writer-2024/PulseOpti-HR.git
cd PulseOpti-HR
pnpm install
```

等待安装完成后，继续执行超管端部署脚本。
