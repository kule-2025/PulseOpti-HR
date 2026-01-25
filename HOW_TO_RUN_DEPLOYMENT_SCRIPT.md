# 自动化脚本执行详细步骤

## 📍 脚本位置

脚本文件位于项目根目录：
- `deploy-admin-to-vercel.bat` (CMD 版本)
- `deploy-admin-to-vercel.ps1` (PowerShell 版本)

**项目根目录**：`/workspace/projects/PulseOpti-HR/`

---

## 🖥️ 方式 1：在本地 Windows 电脑执行（推荐）

### 前提条件
- Windows 10/11 操作系统
- 已安装 Node.js 18+ ([下载地址](https://nodejs.org/))
- 已安装 pnpm ([安装命令](https://pnpm.io/installation))：
  ```cmd
  npm install -g pnpm
  ```
- 拥有 Vercel 账号 ([注册地址](https://vercel.com/signup))
- 已部署前端应用到 Vercel

### 执行步骤

#### 步骤 1：获取项目代码
```cmd
# 如果还没有项目代码，先克隆
git clone https://github.com/tomato-writer-2024/PulseOpti-HR.git
cd PulseOpti-HR

# 如果已经在项目目录，跳过此步骤
```

#### 步骤 2：安装项目依赖
```cmd
# 安装项目依赖
pnpm install
```

**预期结果**：
```
Packages: +xxx
Done in xx seconds
```

#### 步骤 3：验证脚本文件存在
```cmd
# 检查脚本文件是否存在
dir deploy-admin-to-vercel.bat
dir deploy-admin-to-vercel.ps1
```

**预期结果**：
```
驱动器 C 中的卷没有标签。
 卷的序列号是 XXXX-XXXX

 C:\path\to\PulseOpti-HR 的目录

2024/12/19  XX:XX    XXXX deploy-admin-to-vercel.bat
2024/12/19  XX:XX    XXXX deploy-admin-to-vercel.ps1
               2 个文件     XXXX 字节
```

#### 步骤 4：选择脚本版本并执行

**选项 A：使用 CMD 脚本（推荐新手）**

```cmd
# 方式 1：双击运行
# 在文件资源管理器中找到 deploy-admin-to-vercel.bat，双击运行

# 方式 2：在 CMD 中运行
deploy-admin-to-vercel.bat

# 方式 3：在 CMD 中完整路径运行
.\deploy-admin-to-vercel.bat
```

**选项 B：使用 PowerShell 脚本（推荐高级用户）**

```powershell
# 打开 PowerShell（推荐 PowerShell 7.0+）
# 按 Win+X，选择 "Windows PowerShell" 或 "Terminal"

# 进入项目目录
cd C:\path\to\PulseOpti-HR

# 运行脚本
.\deploy-admin-to-vercel.ps1

# 如果遇到执行策略错误，先执行：
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 步骤 5：跟随脚本提示完成部署

脚本会自动执行以下操作：

**1. 检查 Vercel CLI 安装**
```
[步骤 1/10] 检查 Vercel CLI 安装状态...
✅ Vercel CLI 已安装
```

如果未安装，脚本会自动安装：
```
❌ Vercel CLI 未安装，正在安装...
✅ Vercel CLI 安装成功
```

**2. 检查 Vercel 登录状态**
```
[步骤 2/10] 检查 Vercel 登录状态...
⚠️  需要登录 Vercel
正在打开登录页面...
```

此时会自动打开浏览器，访问 Vercel 登录页面：
1. 点击 "Continue"
2. 选择登录方式（GitHub/GitLab/Bitbucket/Email）
3. 完成登录授权

**3. 获取前端数据库连接**
```
[步骤 3/10] 获取前端数据库连接信息...
正在拉取前端环境变量...
✅ 成功获取前端 DATABASE_URL
   数据库连接字符串：postgresql://user:pass@host...
```

**4. 部署超管端到 Vercel**
```
[步骤 4/10] 部署超管端到 Vercel...
正在创建新项目并部署...
✅ 部署成功
```

**5. 配置环境变量**
```
[步骤 5/10] 配置超管端环境变量...
配置 DATABASE_URL...
✅ DATABASE_URL 配置成功
配置 JWT_SECRET...
✅ JWT_SECRET 配置成功
...
✅ 环境变量配置完成
```

**6. 添加自定义域名**
```
[步骤 6/10] 配置自定义域名...
正在添加域名 admin.aizhixuan.com.cn...
✅ 域名添加成功
```

**7. 重新部署**
```
[步骤 7/10] 重新部署以应用配置...
✅ 重新部署成功
```

**8. 等待 DNS 生效**
```
[步骤 8/10] 等待 DNS 生效（需要 5-10 分钟）...
DNS 配置信息：
  类型：CNAME
  主机记录：admin
  记录值：cname.vercel-dns.com

请在域名注册商（腾讯云/阿里云等）添加上述 DNS 记录
```

此时需要手动配置 DNS，继续阅读下方步骤。

#### 步骤 6：配置 DNS 记录

**方式 A：腾讯云配置**
1. 登录腾讯云控制台：https://console.cloud.tencent.com/cns
2. 找到域名 `aizhixuan.com.cn`
3. 点击 "解析"
4. 点击 "添加记录"
5. 填写信息：
   - 记录类型：CNAME
   - 主机记录：admin
   - 记录值：cname.vercel-dns.com
   - TTL：600（默认）
6. 点击 "保存"

**方式 B：阿里云配置**
1. 登录阿里云控制台：https://dns.console.aliyun.com/
2. 找到域名 `aizhixuan.com.cn`
3. 点击 "解析设置"
4. 点击 "添加记录"
5. 填写信息：
   - 记录类型：CNAME
   - 主机记录：admin
   - 记录值：cname.vercel-dns.com
   - TTL：600（默认）
6. 点击 "确认"

**方式 C：其他域名注册商**
参考你的域名注册商提供的文档，添加 CNAME 记录。

#### 步骤 7：等待 DNS 生效
```
DNS 生效通常需要 5-10 分钟，最长可能需要 48 小时

可以使用以下命令检查 DNS 解析状态：
nslookup admin.aizhixuan.com.cn
```

**预期结果**（DNS 生效后）：
```
服务器:  UnKnown
Address:  ::1

名称:    admin.aizhixuan.com.cn
Address:  xxx.xxx.xxx.xxx  (Vercel 的 IP 地址)
Aliases:  cname.vercel-dns.com
```

#### 步骤 8：验证部署

**方式 A：运行验证脚本**
```cmd
verify-data-sync.bat
```

**方式 B：手动验证**

1. **访问超管端**
   - 打开浏览器访问：https://admin.aizhixuan.com.cn
   - 预期结果：显示超管端登录页面

2. **创建超级管理员账号**
   - 访问：https://admin.aizhixuan.com.cn/register
   - 填写信息：
     - 邮箱：208343256@qq.com
     - 密码：admin123
     - 姓名：超级管理员
     - 手机：13800138000（可选）
   - 点击 "注册"
   - 预期结果：注册成功，跳转到登录页面

3. **登录超管端**
   - 访问：https://admin.aizhixuan.com.cn/login
   - 输入：
     - 邮箱：208343256@qq.com
     - 密码：admin123
   - 点击 "登录"
   - 预期结果：登录成功，显示超管端仪表盘

4. **测试数据同步**
   - 在前端注册新用户：https://www.aizhixuan.com.cn/register
   - 注册完成后，在超管端查看：https://admin.aizhixuan.com.cn/admin/users
   - 预期结果：能看到刚注册的用户

---

## 💻 方式 2：在云服务器执行

### 前提条件
- 拥有一台云服务器（腾讯云/阿里云/AWS 等）
- 服务器已安装 Node.js 18+
- 服务器已安装 pnpm
- 已安装 Git

### 执行步骤

#### 步骤 1：连接到服务器
```bash
# SSH 连接到服务器
ssh user@your-server-ip

# 输入密码
```

#### 步骤 2：克隆项目
```bash
# 克隆项目
git clone https://github.com/tomato-writer-2024/PulseOpti-HR.git
cd PulseOpti-HR
```

#### 步骤 3：安装依赖
```bash
# 安装项目依赖
pnpm install
```

#### 步骤 4：执行部署脚本
```bash
# 运行 CMD 脚本（服务器通常使用 Linux，需要转换为 bash）
# 或者手动执行步骤

# 手动安装 Vercel CLI
pnpm add -g vercel

# 登录 Vercel
vercel login

# 按照手动步骤执行后续操作
```

**注意**：云服务器通常是 Linux 系统，`.bat` 脚本无法直接运行。建议：
1. 使用手动部署方式（参考 REALTIME_DATA_SYNC_DETAILED_STEPS.md）
2. 或在本地 Windows 电脑执行自动化脚本

---

## 🐧 方式 3：在 Linux/Mac 执行

### 前提条件
- Linux/Mac 操作系统
- 已安装 Node.js 18+
- 已安装 pnpm

### 执行步骤

#### 步骤 1：克隆项目
```bash
git clone https://github.com/tomato-writer-2024/PulseOpti-HR.git
cd PulseOpti-HR
```

#### 步骤 2：安装依赖
```bash
pnpm install
```

#### 步骤 3：安装 Vercel CLI
```bash
pnpm add -g vercel
```

#### 步骤 4：执行手动部署
```bash
# .bat 脚本无法在 Linux/Mac 运行
# 使用手动部署方式，参考 REALTIME_DATA_SYNC_DETAILED_STEPS.md

# 登录 Vercel
vercel login

# 部署超管端
vercel --prod --yes --name pulseopti-hr-admin

# 配置环境变量
# (参考详细文档)
```

---

## 📋 完整执行流程图

```
┌─────────────────────────────────────────────────────────────┐
│  步骤 1：准备环境                                            │
│  - Windows 10/11 电脑                                       │
│  - 安装 Node.js 18+                                         │
│  - 安装 pnpm                                                 │
│  - 克隆/下载项目代码                                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  步骤 2：进入项目目录                                        │
│  cd C:\path\to\PulseOpti-HR                                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  步骤 3：安装项目依赖                                        │
│  pnpm install                                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  步骤 4：执行自动化脚本                                      │
│  deploy-admin-to-vercel.bat (CMD)                           │
│  或                                                         │
│  .\deploy-admin-to-vercel.ps1 (PowerShell)                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  步骤 5：跟随脚本提示                                        │
│  - 浏览器登录 Vercel                                        │
│  - 等待自动部署完成                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  步骤 6：配置 DNS 记录                                       │
│  在域名注册商添加 CNAME 记录：                               │
│  admin → cname.vercel-dns.com                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  步骤 7：等待 DNS 生效（5-10 分钟）                          │
│  使用 nslookup 检查：                                        │
│  nslookup admin.aizhixuan.com.cn                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  步骤 8：验证部署                                            │
│  - 访问 https://admin.aizhixuan.com.cn                      │
│  - 创建超级管理员账号                                        │
│  - 测试数据同步                                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
                         ✅ 部署完成
```

---

## ❓ 常见问题

### Q1：脚本在哪里？
**A**：脚本位于项目根目录，即：
```
PulseOpti-HR/
├── deploy-admin-to-vercel.bat    ← CMD 脚本
├── deploy-admin-to-vercel.ps1    ← PowerShell 脚本
└── ... (其他文件)
```

### Q2：在哪个目录执行脚本？
**A**：在项目根目录执行，即包含 `package.json` 和脚本文件的目录。

### Q3：执行脚本时提示"找不到命令"？
**A**：可能是以下原因：
1. 不在正确的目录，执行：`cd C:\path\to\PulseOpti-HR`
2. 脚本文件不存在，执行：`dir deploy-admin-to-vercel.bat` 检查
3. 使用完整路径：`C:\path\to\PulseOpti-HR\deploy-admin-to-vercel.bat`

### Q4：PowerShell 提示"无法加载脚本"？
**A**：这是 PowerShell 的执行策略限制，执行以下命令：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Q5：双击运行脚本后窗口一闪而过？
**A**：
1. 右键点击脚本
2. 选择"编辑"
3. 在最后一行添加：`pause`
4. 保存后重新运行
5. 或者在 CMD 中运行：`deploy-admin-to-vercel.bat`

### Q6：脚本执行到一半停止了？
**A**：
1. 查看错误信息
2. 检查网络连接
3. 检查 Vercel 登录状态
4. 查看日志：`vercel logs --follow`

### Q7：Linux/Mac 能运行这个脚本吗？
**A**：不能，`.bat` 脚本是 Windows 专用。Linux/Mac 用户请使用手动部署方式。

### Q8：需要什么权限？
**A**：
- Vercel 账号权限
- 域名管理权限（配置 DNS）
- 项目部署权限（如果没有 Vercel 项目，会自动创建）

### Q9：执行时间需要多久？
**A**：
- 脚本自动部分：约 5-10 分钟
- DNS 生效时间：5-10 分钟（最长 48 小时）
- 总计：约 10-20 分钟

### Q10：执行失败了怎么办？
**A**：
1. 查看错误信息
2. 参考故障排查：REALTIME_DATA_SYNC_DETAILED_STEPS.md
3. 查看日志：`vercel logs --follow`
4. 尝试手动部署

---

## 🔍 故障排查

### 问题 1：Vercel CLI 安装失败
**解决**：
```cmd
# 清除缓存
pnpm store prune

# 重新安装
pnpm add -g vercel

# 验证安装
vercel --version
```

### 问题 2：Vercel 登录失败
**解决**：
```cmd
# 清除登录缓存
vercel logout

# 重新登录
vercel login
```

### 问题 3：获取 DATABASE_URL 失败
**解决**：
```cmd
# 手动获取
vercel env pull .env.local
cat .env.local | findstr DATABASE_URL
```

### 问题 4：部署失败
**解决**：
```cmd
# 查看日志
vercel logs --follow

# 检查构建错误
vercel inspect

# 重新部署
vercel --prod
```

### 问题 5：域名添加失败
**解决**：
```cmd
# 检查域名是否已存在
vercel domains ls

# 手动添加域名
vercel domains add admin.aizhixuan.com.cn
```

---

## 📞 获取帮助

如果遇到问题：

1. **查看详细文档**：REALTIME_DATA_SYNC_DETAILED_STEPS.md
2. **查看故障排查**：本文档的"故障排查"部分
3. **查看 Vercel 文档**：https://vercel.com/docs
4. **查看项目 README**：https://github.com/tomato-writer-2024/PulseOpti-HR

---

## 📝 执行检查清单

执行脚本前，请确认：

- [ ] 拥有 Windows 10/11 电脑
- [ ] 已安装 Node.js 18+（执行 `node --version` 检查）
- [ ] 已安装 pnpm（执行 `pnpm --version` 检查）
- [ ] 已获取项目代码（克隆或下载）
- [ ] 已在项目根目录（包含 package.json）
- [ ] 脚本文件存在（执行 `dir deploy-admin-to-vercel.bat` 检查）
- [ ] 拥有 Vercel 账号
- [ ] 已部署前端应用到 Vercel
- [ ] 拥有域名管理权限

---

**文档版本**：v1.0.0
**更新时间**：2024-12-19
**作者**：PulseOpti HR 团队
