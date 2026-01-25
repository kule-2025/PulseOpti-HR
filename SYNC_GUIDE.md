# PulseOpti HR - 沙箱到本地同步指南

> 本指南帮助你将沙箱中开发的PulseOpti HR系统完整同步到本地环境

## 📚 目录

1. [快速开始](#快速开始)
2. [同步方式](#同步方式)
3. [详细步骤](#详细步骤)
4. [常见问题](#常见问题)
5. [验证清单](#验证清单)

## 🚀 快速开始

### 前提条件

确保你的本地环境已安装：

- ✅ **Node.js** (v20 或更高版本)
- ✅ **pnpm** (v9.0.0 或更高版本)
- ✅ **PowerShell** (Windows) 或 **Bash** (Linux/Mac)
- ✅ **Git** (可选，但推荐)

### 一键同步

#### Windows 用户

1. **下载项目文件**（从沙箱）
2. **进入项目目录**
   ```cmd
   cd C:\PulseOpti-HR
   ```

3. **运行同步脚本**（二选一）
   ```cmd
   # 方式1：双击运行（最简单）
   SYNC_SANDBOX_TO_LOCAL.bat

   # 方式2：PowerShell运行
   powershell -ExecutionPolicy Bypass -File SYNC_SANDBOX_TO_LOCAL.ps1
   ```

4. **选择同步方式**
   - 输入 `1` 选择完整同步（推荐）

5. **等待同步完成**
   - 同步过程可能需要 5-10 分钟
   - 依赖安装时间取决于网络速度

#### Linux/Mac 用户

1. **下载项目文件**
2. **进入项目目录**
   ```bash
   cd ~/PulseOpti-HR
   ```

3. **运行同步脚本**
   ```bash
   bash sync-sandbox-to-local.sh
   ```

4. **选择同步方式**
   - 输入 `1` 选择完整同步

## 🔄 同步方式

### 方式1：完整同步（推荐）

**适用场景**：
- 首次从沙箱同步到本地
- 本地代码混乱需要重置
- 需要确保所有文件都是最新版本

**同步内容**：
- ✅ 所有源代码文件（src目录）
- ✅ 所有配置文件
- ✅ 公共资源（public目录）
- ✅ 重新安装依赖（node_modules）
- ✅ 创建 .env 配置文件

**同步时间**：5-10分钟

**命令**：
```cmd
# Windows
SYNC_SANDBOX_TO_LOCAL.bat
# 选择 1

# PowerShell
.\SYNC_SANDBOX_TO_LOCAL.ps1
# 选择 1
```

### 方式2：仅同步源代码

**适用场景**：
- 只需要更新源代码
- 不想重新安装依赖
- 依赖安装时间过长

**同步内容**：
- ✅ 源代码文件（src目录）
- ✅ 配置文件
- ❌ 不安装依赖
- ❌ 不创建 .env 文件

**同步时间**：2-5分钟

**命令**：
```cmd
# Windows
SYNC_SANDBOX_TO_LOCAL.bat
# 选择 2

# PowerShell
.\SYNC_SANDBOX_TO_LOCAL.ps1
# 选择 2
```

### 方式3：增量同步

**适用场景**：
- 沙箱有少量更新
- 需要快速同步最新改动
- 网络速度较慢

**同步内容**：
- ✅ 仅同步修改过的文件
- ✅ 基于文件时间戳对比
- ❌ 不安装依赖

**同步时间**：1-3分钟

**命令**：
```cmd
# PowerShell（推荐）
.\SYNC_SANDBOX_TO_LOCAL.ps1
# 选择 3
```

## 📝 详细步骤

### Step 1：准备环境

#### Windows

```cmd
# 1. 安装 Node.js
# 下载地址：https://nodejs.org/

# 2. 安装 pnpm
npm install -g pnpm

# 3. 验证安装
node --version
pnpm --version
```

#### Linux/Mac

```bash
# 1. 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. 安装 pnpm
npm install -g pnpm

# 3. 验证安装
node --version
pnpm --version
```

### Step 2：下载项目文件

#### 从沙箱下载（推荐）

1. **在沙箱中打包**
   ```bash
   cd /workspace/projects
   tar -czf pulseopti-hr.tar.gz \
     --exclude='node_modules' \
     --exclude='.next' \
     --exclude='.git' \
     .
   ```

2. **下载 tar.gz 文件到本地**

3. **解压到项目目录**
   ```cmd
   # Windows (使用 7-Zip 或 WinRAR)
   # 或使用 PowerShell
   tar -xzf pulseopti-hr.tar.gz

   # Linux/Mac
   tar -xzf pulseopti-hr.tar.gz
   cd PulseOpti-HR
   ```

#### 从 GitHub 克隆（如果有远程仓库）

```bash
git clone https://github.com/your-username/PulseOpti-HR.git
cd PulseOpti-HR
```

### Step 3：运行同步脚本

#### Windows

```cmd
# 进入项目目录
cd C:\PulseOpti-HR

# 运行批处理脚本
SYNC_SANDBOX_TO_LOCAL.bat

# 或使用 PowerShell
powershell -ExecutionPolicy Bypass -File SYNC_SANDBOX_TO_LOCAL.ps1
```

#### PowerShell 脚本权限问题

如果遇到权限错误：

```powershell
# 以管理员身份运行 PowerShell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
# 然后再次运行
.\SYNC_SANDBOX_TO_LOCAL.ps1
```

#### Linux/Mac

```bash
# 进入项目目录
cd ~/PulseOpti-HR

# 给脚本添加执行权限
chmod +x sync-sandbox-to-local.sh

# 运行脚本
./sync-sandbox-to-local.sh
```

### Step 4：配置环境变量

同步完成后，需要配置 `.env` 文件：

```cmd
# 复制环境变量模板
copy .env.example .env

# 编辑 .env 文件
notepad .env
```

**必需配置项**：

```env
# 数据库配置（必需）
DATABASE_URL=postgresql://user:password@host:5432/dbname

# JWT密钥（必需）
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# 豆包AI配置（可选，用于AI功能）
DOUBAO_API_KEY=your-doubao-api-key

# 邮件配置（可选，用于发送邮件）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 对象存储配置（可选）
S3_ENDPOINT=https://s3.example.com
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET=pulseopti-hr

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:5000
NODE_ENV=development
```

**配置数据库**：

如果你使用 Neon PostgreSQL：

```env
# 从 Neon 控制台获取连接字符串
DATABASE_URL=postgresql://neondb_owner:password@ep-cool-region.aws.neon.tech/neondb?sslmode=require
```

### Step 5：初始化数据库

```cmd
# 运行数据库迁移
pnpm db:push

# 或使用迁移文件
pnpm db:migrate
```

### Step 6：启动开发服务器

```cmd
# 启动开发服务器
pnpm dev

# 访问应用
# 超管端：http://localhost:5000/admin/login
# 用户端：http://localhost:5000/login
```

### Step 7：验证功能

```cmd
# 在另一个终端运行快速验证
SYNC_SANDBOX_TO_LOCAL.bat
# 选择 5 - 快速验证
```

## ❓ 常见问题

### Q1：同步脚本无法运行

**Windows**：
- 确保以管理员身份运行
- 检查 PowerShell 执行策略：
  ```powershell
  Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

**Linux/Mac**：
- 添加执行权限：
  ```bash
  chmod +x sync-sandbox-to-local.sh
  ```

### Q2：依赖安装失败

**问题**：`pnpm install` 失败或很慢

**解决方案**：

```cmd
# 1. 清除缓存
rm -rf node_modules .next
rm -f pnpm-lock.yaml

# 2. 使用国内镜像
pnpm config set registry https://registry.npmmirror.com

# 3. 重新安装
pnpm install
```

### Q3：数据库连接失败

**问题**：`Error: Connection refused` 或类似错误

**解决方案**：

1. 检查 `.env` 文件中的 `DATABASE_URL` 是否正确
2. 确保数据库服务正在运行
3. 测试数据库连接：
   ```cmd
   pnpm db:studio
   ```
4. 如果使用 Neon，确保连接字符串包含 `?sslmode=require`

### Q4：端口被占用

**问题**：端口 5000 已被其他程序占用

**解决方案**：

```cmd
# Windows：查找占用端口的进程
netstat -ano | findstr :5000
taskkill /PID <进程ID> /F

# 或使用其他端口
pnpm dev --port 3001
```

### Q5：TypeScript 类型错误

**问题**：`pnpm ts-check` 报错

**解决方案**：

```cmd
# 1. 重新生成类型
pnpm db:generate

# 2. 清除构建缓存
rm -rf .next

# 3. 重新检查
pnpm ts-check
```

### Q6：页面显示 404

**问题**：访问页面显示 404 Not Found

**解决方案**：

1. 检查路由文件是否存在：
   ```cmd
   dir src\app\admin\page.tsx
   ```

2. 重启开发服务器：
   ```cmd
   # 按 Ctrl+C 停止
   pnpm dev
   ```

3. 检查浏览器缓存：
   - 按 `Ctrl + Shift + R` 强制刷新

### Q7：登录失败

**问题**：登录时提示"用户名或密码错误"

**解决方案**：

1. 确认已运行数据库迁移：
   ```cmd
   pnpm db:push
   ```

2. 使用超级管理员账号登录：
   - 账号：`admin`
   - 密码：`admin123`

3. 如果仍然失败，检查控制台错误信息

## ✅ 验证清单

同步完成后，请按照以下清单验证：

### 基础验证

- [ ] **项目结构**
  - [ ] `src/` 目录存在
  - [ ] `public/` 目录存在
  - [ ] `package.json` 存在
  - [ ] `.env` 文件存在

- [ ] **依赖安装**
  - [ ] `node_modules/` 目录存在
  - [ ] `pnpm install` 无错误
  - [ ] `pnpm list` 显示依赖列表

- [ ] **配置文件**
  - [ ] `tsconfig.json` 存在
  - [ ] `tailwind.config.ts` 存在
  - [ ] `next.config.ts` 存在
  - [ ] `.env` 文件已配置

### 类型检查

- [ ] **TypeScript**
  - [ ] `pnpm ts-check` 无错误
  - [ ] 编辑器无红色波浪线

### 数据库

- [ ] **数据库连接**
  - [ ] `DATABASE_URL` 已配置
  - [ ] 数据库服务可访问
  - [ ] `pnpm db:push` 成功执行

### 开发服务器

- [ ] **启动**
  - [ ] `pnpm dev` 成功启动
  - [ ] 端口 5000 可访问
  - [ ] 控制台无错误信息

- [ ] **页面访问**
  - [ ] http://localhost:5000 - 首页可访问
  - [ ] http://localhost:5000/login - 登录页可访问
  - [ ] http://localhost:5000/admin/login - 超管端登录可访问

### 功能验证

- [ ] **用户端**
  - [ ] 可以正常注册
  - [ ] 可以正常登录
  - [ ] 导航菜单正常显示

- [ ] **超管端**
  - [ ] 可以登录（admin/admin123）
  - [ ] 仪表盘数据正常显示
  - [ ] 用户管理页面可访问

- [ ] **API**
  - [ ] `/api/auth/login` 可调用
  - [ ] `/api/admin/dashboard/stats` 可调用
  - [ ] 其他 API 端点响应正常

## 📞 获取帮助

如果遇到问题：

1. **查看文档**
   - [系统诊断文档](SYSTEM_DIAGNOSIS.md)
   - [快速修复指南](QUICK_FIX_GUIDE.md)
   - [部署文档](DEPLOYMENT_GUIDE.md)

2. **运行诊断**
   ```cmd
   SYNC_SANDBOX_TO_LOCAL.bat
   # 选择 5 - 快速验证
   ```

3. **联系支持**
   - 邮箱：PulseOptiHR@163.com
   - 地址：广州市天河区

## 🎯 下一步

同步完成后，你可以：

1. **开始开发**
   - 运行 `pnpm dev` 启动开发服务器
   - 使用 `pnpm build` 构建生产版本

2. **部署到生产**
   - 参考 [Vercel部署指南](VERCEL_DEPLOYMENT_GUIDE.md)
   - 配置环境变量
   - 部署到 Vercel

3. **贡献代码**
   - 使用 Git 管理代码
   - 创建分支进行开发
   - 提交 Pull Request

---

**祝你使用愉快！** 🎉
