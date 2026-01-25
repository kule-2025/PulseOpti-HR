# Git Clone 问题解决方案

## ❌ 问题诊断

你遇到的错误：
```
fatal: unable to access 'https://github.com/tomato-writer-2024/PulseOpti-HR.git/': Empty reply from server
```

**原因**：网络连接问题，无法访问 GitHub。

---

## ✅ 解决方案

### 方案 1：使用代理（推荐，如果有代理）

```cmd
# 临时设置 Git 代理（替换为你的代理地址）
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy https://127.0.0.1:7890

# 克隆项目
git clone https://github.com/tomato-writer-2024/PulseOpti-HR.git

# 克隆完成后，取消代理
git config --global --unset http.proxy
git config --global --unset https.proxy
```

---

### 方案 2：使用 Gitee 镜像（推荐，无需代理）

如果 GitHub 无法访问，使用 Gitee 镜像仓库（同步更新的 GitHub 仓库）：

```cmd
# 克隆 Gitee 镜像仓库
git clone https://gitee.com/tomato-writer-2024/PulseOpti-HR.git

# 进入项目目录
cd PulseOpti-HR

# 如果需要从 GitHub 拉取最新更新，可以添加 GitHub 作为远程仓库
git remote add github https://github.com/tomato-writer-2024/PulseOpti-HR.git
```

---

### 方案 3：手动下载 ZIP 包（最简单，无需 Git）

如果你无法使用 Git，可以直接下载 ZIP 包：

1. **访问 Gitee 仓库**：
   - 打开浏览器访问：https://gitee.com/tomato-writer-2024/PulseOpti-HR
   - 点击右侧的"克隆/下载"
   - 选择"下载 ZIP"

2. **或者访问 GitHub 仓库**：
   - 打开浏览器访问：https://github.com/tomato-writer-2024/PulseOpti-HR
   - 点击绿色的 "Code" 按钮
   - 选择 "Download ZIP"

3. **解压文件**：
   - 下载完成后，解压 ZIP 文件
   - 解压到：`C:\PulseOpti-HR\`
   - 确保解压后的路径是：`C:\PulseOpti-HR\PulseOpti-HR`

4. **进入项目目录**：
   ```cmd
   cd C:\PulseOpti-HR\PulseOpti-HR
   ```

---

### 方案 4：修改 DNS 服务器

如果是 DNS 解析问题，尝试修改 DNS：

1. 打开"网络连接"设置
2. 右键点击网络连接，选择"属性"
3. 双击"Internet 协议版本 4 (TCP/IPv4)"
4. 使用以下 DNS 服务器：
   - 首选 DNS：`223.5.5.5`（阿里云）
   - 备用 DNS：`114.114.114.114`（114 DNS）
5. 点击"确定"

然后重试克隆：
```cmd
git clone https://github.com/tomato-writer-2024/PulseOpti-HR.git
```

---

### 方案 5：使用 SSH 克隆（如果有 SSH 密钥）

如果你配置了 SSH 密钥：

```cmd
# 使用 SSH 协议克隆
git clone git@github.com:tomato-writer-2024/PulseOpti-HR.git
```

---

## 🎯 推荐操作流程

### 如果你有代理：
```cmd
# 1. 设置代理
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy https://127.0.0.1:7890

# 2. 克隆项目
git clone https://github.com/tomato-writer-2024/PulseOpti-HR.git

# 3. 进入目录
cd PulseOpti-HR

# 4. 取消代理
git config --global --unset http.proxy
git config --global --unset https.proxy

# 5. 继续部署
deploy-admin-to-vercel.bat
```

### 如果没有代理：
```cmd
# 1. 克隆 Gitee 镜像
git clone https://gitee.com/tomato-writer-2024/PulseOpti-HR.git

# 2. 进入目录
cd PulseOpti-HR

# 3. 继续部署
deploy-admin-to-vercel.bat
```

### 最简单方式：
```cmd
# 1. 浏览器访问下载
# https://gitee.com/tomato-writer-2024/PulseOpti-HR
# 点击"下载 ZIP"

# 2. 解压到 C:\PulseOpti-HR\PulseOpti-HR

# 3. 进入目录
cd C:\PulseOpti-HR\PulseOpti-HR

# 4. 继续部署
deploy-admin-to-vercel.bat
```

---

## 🔍 验证是否成功

成功克隆后，你应该能看到以下文件：

```cmd
# 进入项目目录
cd PulseOpti-HR

# 查看文件列表
dir

# 预期输出（部分文件）：
# deploy-admin-to-vercel.bat
# deploy-admin-to-vercel.ps1
# package.json
# src/
# public/
# ...
```

---

## 📝 如果仍然失败

### 检查网络连接
```cmd
# 测试 GitHub 连接
ping github.com

# 测试 Gitee 连接
ping gitee.com

# 测试代理（如果有）
curl -I https://github.com
```

### 使用镜像站点
如果 GitHub 完全无法访问，使用以下镜像：

| 镜像站 | 地址 |
|--------|------|
| Gitee（推荐） | https://gitee.com/tomato-writer-2024/PulseOpti-HR |
| GitHub 加速站 | https://hub.fastgit.xyz/tomato-writer-2024/PulseOpti-HR |
| GitHub 镜像站 | https://github.com.cnpmjs.org/tomato-writer-2024/PulseOpti-HR |

### 使用镜像命令
```cmd
# 使用 FastGit 镜像
git clone https://hub.fastgit.xyz/tomato-writer-2024/PulseOpti-HR.git

# 使用 cnpmjs 镜像
git clone https://github.com.cnpmjs.org/tomato-writer-2024/PulseOpti-HR.git
```

---

## 🚀 克隆成功后的下一步

### 确认在正确的目录
```cmd
# 进入项目目录
cd PulseOpti-HR

# 确认看到关键文件
dir deploy-admin-to-vercel.bat
dir package.json
```

### 安装依赖
```cmd
# 安装项目依赖
pnpm install
```

### 执行部署脚本
```cmd
# 双击运行或命令行执行
deploy-admin-to-vercel.bat
```

---

## 📞 获取帮助

如果所有方案都失败：

1. **检查防火墙设置**
   - 确保防火墙允许 Git 和网络连接

2. **检查杀毒软件**
   - 临时关闭杀毒软件再试

3. **使用手机热点**
   - 切换到手机热点网络

4. **联系技术支持**
   - 提供错误截图和系统信息

---

**文档版本**：v1.0.0
**更新时间**：2024-12-19
