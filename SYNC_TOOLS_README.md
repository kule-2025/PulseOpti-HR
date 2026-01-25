# PulseOpti HR - 沙箱同步工具包

> 🛠️ 完整的沙箱到本地同步解决方案

## 📦 工具包内容

本工具包包含以下文件：

| 文件名 | 类型 | 说明 |
|--------|------|------|
| `SYNC_SANDBOX_TO_LOCAL.bat` | Windows批处理 | Windows自动化同步脚本 |
| `SYNC_SANDBOX_TO_LOCAL.ps1` | PowerShell脚本 | PowerShell自动化同步脚本（功能更强大） |
| `sync-sandbox-to-local.sh` | Bash脚本 | Linux/Mac自动化同步脚本 |
| `FILE_SYNC_CHECKLIST.md` | 文档 | 完整的文件同步清单 |
| `SYNC_GUIDE.md` | 文档 | 详细的同步指南 |
| `QUICK_START_SYNC.md` | 文档 | 快速开始指南（5分钟上手） |
| `SYNC_TOOLS_README.md` | 文档 | 本文档 |

## 🚀 快速开始

### Windows用户

**最简单的方式**：
```cmd
SYNC_SANDBOX_TO_LOCAL.bat
```

**功能更强大的方式**：
```powershell
.\SYNC_SANDBOX_TO_LOCAL.ps1
```

### Linux/Mac用户

```bash
chmod +x sync-sandbox-to-local.sh
./sync-sandbox-to-local.sh
```

## 📋 同步方式对比

| 同步方式 | 适用场景 | 时间 | 优点 | 缺点 |
|---------|---------|------|------|------|
| **完整同步** | 首次同步、代码混乱需要重置 | 5-10分钟 | 最彻底、确保最新版本 | 需要重新安装依赖 |
| **仅同步源代码** | 只需要更新代码 | 2-5分钟 | 快速、不安装依赖 | 可能缺少新依赖 |
| **增量同步** | 少量更新、网络较慢 | 1-3分钟 | 最快、只同步改动 | 可能遗漏隐式依赖 |

## 🎯 推荐工作流

### 首次同步

```bash
# 步骤1：选择完整同步
SYNC_SANDBOX_TO_LOCAL.bat
# 选择 1

# 步骤2：配置环境变量
# 编辑 .env 文件

# 步骤3：初始化数据库
pnpm db:push

# 步骤4：启动开发服务器
pnpm dev
```

### 日常开发

```bash
# 每天工作开始前
./sync-sandbox-to-local.sh
# 选择 3（增量同步）

# 启动开发
pnpm dev
```

### 定期完整同步

```bash
# 每周一次
SYNC_SANDBOX_TO_LOCAL.bat
# 选择 1（完整同步）
```

## 🛠️ 脚本功能对比

| 功能 | BAT | PowerShell | Bash |
|-----|-----|-----------|------|
| 完整同步 | ✅ | ✅ | ✅ |
| 仅同步源代码 | ✅ | ✅ | ✅ |
| 增量同步 | ❌ | ✅ | ✅ |
| 查看同步清单 | ✅ | ✅ | ✅ |
| 快速验证 | ✅ | ✅ | ✅ |
| 彩色输出 | ❌ | ✅ | ✅ |
| 进度显示 | ✅ | ✅ | ✅ |
| 错误处理 | 基础 | 完整 | 完整 |
| 备份功能 | ✅ | ✅ | ✅ |
| 统计信息 | ✅ | ✅ | ✅ |

## 📖 文档说明

### 1. QUICK_START_SYNC.md
- **适用人群**：新手用户
- **内容**：5分钟快速上手指南
- **包含**：三种同步方式、环境配置、常见问题

### 2. SYNC_GUIDE.md
- **适用人群**：所有用户
- **内容**：详细的同步指南
- **包含**：详细步骤、问题排查、验证清单

### 3. FILE_SYNC_CHECKLIST.md
- **适用人群**：高级用户
- **内容**：完整的文件清单
- **包含**：所有文件列表、同步方法、注意事项

### 4. SYNC_TOOLS_README.md
- **适用人群**：所有用户
- **内容**：工具包总览
- **包含**：功能对比、使用建议、文档导航

## 🔧 环境要求

### Windows
- Windows 7 或更高版本
- Node.js v20+
- pnpm v9.0.0+
- PowerShell 5.1+（可选）

### Linux/Mac
- 任意Linux发行版或 macOS 10.12+
- Node.js v20+
- pnpm v9.0.0+
- Bash 4.0+

## 📁 项目结构

```
PulseOpti-HR/
├── SYNC_TOOLS_README.md           # 本文档
├── SYNC_SANDBOX_TO_LOCAL.bat      # Windows批处理脚本
├── SYNC_SANDBOX_TO_LOCAL.ps1      # PowerShell脚本
├── sync-sandbox-to-local.sh       # Bash脚本
├── FILE_SYNC_CHECKLIST.md         # 文件清单
├── SYNC_GUIDE.md                  # 详细指南
├── QUICK_START_SYNC.md            # 快速开始
│
├── src/                           # 源代码
│   ├── app/                       # Next.js应用
│   │   ├── admin/                 # 超管端
│   │   ├── api/                   # API端点
│   │   └── (其他页面)
│   ├── lib/                       # 工具库
│   └── components/                # 组件
│
├── public/                        # 公共资源
│   ├── assets/                    # 静态资源
│   └── (其他文件)
│
├── .env.example                   # 环境变量模板
├── package.json                   # 依赖配置
├── tsconfig.json                  # TypeScript配置
├── next.config.ts                 # Next.js配置
├── tailwind.config.ts             # Tailwind配置
├── drizzle.config.ts              # Drizzle配置
└── vercel.json                    # Vercel配置
```

## 🎨 脚本界面预览

### Windows批处理
```
========================================
  PulseOpti HR - 沙箱文件同步工具
========================================

请选择同步方式：

1. 🔧 完整同步 (推荐)
   - 同步所有源代码文件
   - 保留node_modules和.next
   - 重新安装依赖

2. 📦 仅同步源代码
   - 仅同步src目录和配置文件
   - 不安装依赖

...

请输入选项 (1-5): _
```

### PowerShell/Bash
```
========================================
  PulseOpti HR - 沙箱文件同步工具
========================================

请选择同步方式：

1. 🔧 完整同步 (推荐)
   - 同步所有源代码文件
   - 保留node_modules和.next
   - 重新安装依赖

2. 📦 仅同步源代码
   - 仅同步src目录和配置文件
   - 不安装依赖

...

请输入选项 (1-6): _
```

## 🔍 故障排查

### 脚本无法运行

**Windows批处理**：
- 确保文件扩展名是 `.bat` 不是 `.txt`
- 以管理员身份运行

**PowerShell**：
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Bash**：
```bash
chmod +x sync-sandbox-to-local.sh
```

### 同步失败

1. **检查网络连接**
2. **检查磁盘空间**
3. **检查文件权限**
4. **查看错误日志**

### 依赖安装失败

```bash
# 清除缓存
rm -rf node_modules .next
rm -f pnpm-lock.yaml

# 使用国内镜像
pnpm config set registry https://registry.npmmirror.com

# 重新安装
pnpm install
```

## 📞 获取帮助

### 文档资源

- [快速开始](QUICK_START_SYNC.md)
- [详细指南](SYNC_GUIDE.md)
- [文件清单](FILE_SYNC_CHECKLIST.md)
- [系统诊断](SYSTEM_DIAGNOSIS.md)
- [部署指南](DEPLOYMENT_GUIDE.md)

### 技术支持

- 邮箱：PulseOptiHR@163.com
- 地址：广州市天河区

### 在线资源

- GitHub Issues（如果有）
- 文档中心：/docs
- 系统诊断：/admin/settings

## 🎯 最佳实践

### 1. 定期备份

```bash
# 使用同步脚本自动备份
SYNC_SANDBOX_TO_LOCAL.bat
# 选择 1（会自动创建备份）
```

### 2. 使用Git管理

```bash
# 初始化Git仓库
git init
git add .
git commit -m "Initial sync from sandbox"

# 添加远程仓库
git remote add origin <your-repo-url>
git push -u origin main
```

### 3. 环境隔离

```bash
# 开发环境
cp .env.example .env.development

# 生产环境
cp .env.example .env.production
```

### 4. 定期更新

```bash
# 每周完整同步
./sync-sandbox-to-local.sh
# 选择 1

# 每日增量同步
./sync-sandbox-to-local.sh
# 选择 3
```

## 📊 同步统计

使用同步脚本后，你可以看到以下统计信息：

```
========================================
  同步统计信息
========================================

📁 项目文件统计：
   - 源代码文件： 1500 个
   - API端点：   88 个
   - 页面文件：   82 个
   - 工具库：     36 个

✅ node_modules 已存在
✅ .next 构建目录已存在
✅ .env 文件已存在
```

## 🔐 安全提示

1. **不要提交敏感文件**
   ```gitignore
   .env
   .env.local
   .env.production
   ```

2. **定期更新JWT密钥**
   ```env
   JWT_SECRET=定期更换的高强度密钥
   ```

3. **使用强密码**
   - 数据库密码
   - API密钥
   - JWT密钥

4. **限制API访问**
   - 使用防火墙
   - 配置CORS
   - 启用HTTPS

## 🚀 性能优化

### 1. 使用增量同步

```bash
# 每日使用增量同步
./sync-sandbox-to-local.sh
# 选择 3
```

### 2. 缓存依赖

```bash
# 使用pnpm的本地缓存
pnpm store path
```

### 3. 并行处理

PowerShell脚本支持并行处理，可以提高同步速度。

### 4. 网络优化

```bash
# 使用国内镜像
pnpm config set registry https://registry.npmmirror.com
```

## 📝 更新日志

### v1.0.0 (2025-06-18)
- ✅ 初始版本发布
- ✅ 支持Windows批处理
- ✅ 支持PowerShell
- ✅ 支持Bash脚本
- ✅ 完整文档

## 🎉 总结

本工具包提供了完整的沙箱到本地同步解决方案：

- ✅ **三种同步方式**：完整、仅源代码、增量
- ✅ **多平台支持**：Windows、Linux、Mac
- ✅ **自动化脚本**：减少手动操作
- ✅ **完整文档**：详细的指南和说明
- ✅ **故障排查**：常见问题解决方案

选择适合你的方式，开始使用吧！🚀

---

**项目信息**：
- 项目名称：PulseOpti HR 脉策聚效
- 联系邮箱：PulseOptiHR@163.com
- 地址：广州市天河区
