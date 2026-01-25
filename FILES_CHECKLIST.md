# PulseOpti HR - 文件清单

## 📁 项目目录结构

```
C:\PulseOpti-HR\PulseOpti-HR\
├── 配置文档/
│   ├── README_SETUP.md                    # 环境配置快速开始（首页）
│   ├── ENV_SETUP_GUIDE_MASTER.md          # 环境配置总览
│   ├── ENV_CONFIGURATION_GUIDE.md         # 环境变量配置完整指南
│   ├── CMD_EXECUTION_GUIDE.md             # CMD操作步骤完整指南
│   ├── QUICK_REFERENCE.md                 # 快速参考指南
│   ├── WINDOWS_QUICKSTART.md              # Windows快速开始指南
│   └── FILES_CHECKLIST.md                 # 本文件清单
│
├── 自动化脚本/
│   ├── start-setup.bat                    # 启动环境配置（推荐）
│   ├── verify-setup.bat                   # 验证环境配置
│   ├── setup-development-env.cmd          # 环境配置脚本
│   └── verify-env-config.cmd              # 环境配置验证
│
├── 部署脚本/
│   ├── deploy-vercel.bat                  # 部署到Vercel
│   ├── setup-vercel-env.bat               # 配置Vercel环境变量
│   └── verify-vercel-deployment.bat       # 验证Vercel部署
│
├── 环境变量/
│   ├── .env.example                       # 环境变量示例文件
│   └── .env                               # 环境变量配置文件（需手动创建）
│
├── 项目文件/
│   ├── next.config.ts                     # Next.js配置
│   ├── package.json                       # 项目依赖
│   ├── tsconfig.json                      # TypeScript配置
│   ├── drizzle.config.ts                  # 数据库配置
│   └── vercel.json                        # Vercel部署配置
│
├── 源代码/
│   └── src/                               # 源代码目录
│
└── 静态资源/
    └── public/                            # 静态资源目录
```

---

## 📚 配置文档说明

### 1. README_SETUP.md - 环境配置快速开始（推荐首读）

**用途：** 环境配置的入口文档

**包含内容：**
- 快速开始3步骤
- 获取必需配置的步骤
- 文档导航
- 自动化脚本说明
- 自定义域名配置
- 常用命令
- 常见问题

**适用场景：** 首次配置环境时阅读

---

### 2. ENV_SETUP_GUIDE_MASTER.md - 环境配置总览

**用途：** 环境配置的总体概览

**包含内容：**
- 文档导航
- 推荐配置流程
- 关键配置说明
- 环境变量最小配置
- 常用命令速查
- 应用访问地址
- 推荐阅读顺序

**适用场景：** 了解整体配置流程

---

### 3. ENV_CONFIGURATION_GUIDE.md - 环境变量配置完整指南

**用途：** 详细的环境变量配置说明

**包含内容：**
- 本地存储路径
- 数据库配置（Neon PostgreSQL）
- 邮件服务配置（Gmail SMTP / 阿里云 / 腾讯云）
- 短信服务配置（阿里云 / 腾讯云 / Mock模式）
- JWT认证配置
- 应用基础配置
- AI集成配置
- 对象存储配置
- 支付服务配置
- 配置检查清单

**适用场景：** 详细了解每个环境变量的配置方法

---

### 4. CMD_EXECUTION_GUIDE.md - CMD操作步骤完整指南

**用途：** 详细的CMD命令操作步骤

**包含内容：**
- 本地开发环境准备（Node.js、pnpm安装）
- 环境变量配置步骤
- 依赖安装步骤
- 数据库初始化步骤
- 启动开发服务器步骤
- 常用命令速查
- 部署到Vercel步骤
- 故障排查指南

**适用场景：** 逐步执行配置步骤时参考

---

### 5. QUICK_REFERENCE.md - 快速参考指南

**用途：** 快速查找常用信息

**包含内容：**
- 5分钟快速开始
- 常用命令速查
- 环境变量速查表
- Gmail应用专用密码获取步骤
- 验证码使用说明
- Neon数据库连接字符串获取
- 常见问题快速解决
- 数据库表清单（59个表）

**适用场景：** 快速查找命令、配置、解决方案

---

### 6. WINDOWS_QUICKSTART.md - Windows快速开始指南

**用途：** 专门针对Windows用户的快速开始指南

**包含内容：**
- 项目路径
- 方法1：使用自动化脚本（推荐）
- 方法2：手动配置
- 获取必需配置的步骤
- 自定义域名配置
- 常用命令
- 常见问题
- 应用访问地址

**适用场景：** Windows用户快速开始开发

---

### 7. FILES_CHECKLIST.md - 文件清单（本文件）

**用途：** 列举所有配置文件和文档

**包含内容：**
- 项目目录结构
- 配置文档说明
- 自动化脚本说明
- 部署脚本说明
- 环境变量说明
- 文件使用建议

**适用场景：** 了解项目中所有文件的作用

---

## 🛠️ 自动化脚本说明

### 配置脚本

#### 1. start-setup.bat - 启动环境配置（推荐）

**用途：** 一键启动环境配置

**功能：**
- 自动切换到项目目录
- 调用 setup-development-env.cmd
- 友好的提示信息

**使用方法：**
```cmd
# 双击运行
start-setup.bat

# 或使用CMD
cd /d C:\PulseOpti-HR\PulseOpti-HR
start-setup.bat
```

---

#### 2. setup-development-env.cmd - 环境配置脚本

**用途：** 自动化环境配置

**功能：**
- 检查Node.js和pnpm安装
- 创建.env文件
- 提示编辑环境变量
- 安装依赖
- 初始化数据库
- 启动开发服务器

**使用方法：**
```cmd
cd /d C:\PulseOpti-HR\PulseOpti-HR
setup-development-env.cmd
```

---

#### 3. verify-setup.bat - 验证环境配置

**用途：** 一键验证环境配置

**功能：**
- 自动切换到项目目录
- 调用 verify-env-config.cmd
- 显示验证结果

**使用方法：**
```cmd
# 双击运行
verify-setup.bat

# 或使用CMD
cd /d C:\PulseOpti-HR\PulseOpti-HR
verify-setup.bat
```

---

#### 4. verify-env-config.cmd - 环境配置验证

**用途：** 验证环境变量配置

**功能：**
- 验证10项关键配置
- 输出检查结果和通过率
- 提供修复建议

**验证项目：**
1. .env 文件是否存在
2. DATABASE_URL 是否配置
3. JWT_SECRET 是否配置
4. JWT_SECRET 长度是否足够
5. NEXT_PUBLIC_APP_URL 是否配置
6. 邮件服务配置
7. 短信服务配置
8. node_modules 是否存在
9. Node.js 版本
10. pnpm 版本

**使用方法：**
```cmd
cd /d C:\PulseOpti-HR\PulseOpti-HR
verify-env-config.cmd
```

---

## 🚀 部署脚本说明

#### 1. deploy-vercel.bat - 部署到Vercel

**用途：** 部署应用到Vercel生产环境

**功能：**
- 构建生产版本
- 部署到Vercel
- 显示部署结果

**使用方法：**
```cmd
cd /d C:\PulseOpti-HR\PulseOpti-HR
deploy-vercel.bat
```

---

#### 2. setup-vercel-env.bat - 配置Vercel环境变量

**用途：** 配置Vercel项目环境变量

**功能：**
- 从.env.local读取环境变量
- 配置到Vercel项目
- 显示配置结果

**使用方法：**
```cmd
cd /d C:\PulseOpti-HR\PulseOpti-HR
setup-vercel-env.bat
```

---

#### 3. verify-vercel-deployment.bat - 验证Vercel部署

**用途：** 验证Vercel部署是否成功

**功能：**
- 检查Vercel部署状态
- 测试网站访问
- 显示验证结果

**使用方法：**
```cmd
cd /d C:\PulseOpti-HR\PulseOpti-HR
verify-vercel-deployment.bat
```

---

## ⚙️ 环境变量说明

### .env.example - 环境变量示例文件

**用途：** 环境变量配置模板

**包含内容：**
- 数据库配置
- JWT认证配置
- 应用配置
- 邮件服务配置（3种方案）
- 短信服务配置（3种方案）
- AI集成配置
- 对象存储配置
- 支付服务配置
- 日志级别配置

**使用方法：**
```cmd
# 复制示例文件
copy .env.example .env

# 编辑配置
notepad .env
```

---

### .env - 环境变量配置文件（需手动创建）

**用途：** 实际的环境变量配置文件

**安全提醒：**
- 包含敏感信息，**不要提交到Git**
- 已添加到.gitignore
- 生产环境需要通过Vercel Dashboard配置

---

## 📖 文件使用建议

### 首次配置环境（推荐顺序）

1. **阅读 README_SETUP.md** - 了解快速开始流程
2. **运行 start-setup.bat** - 自动化环境配置
3. **配置 .env 文件** - 参考提示配置必需项
4. **运行 verify-setup.bat** - 验证配置是否正确
5. **启动开发服务器** - `pnpm run dev`
6. **访问应用** - http://localhost:3000

---

### 遇到问题（按需查阅）

1. **环境变量问题** → ENV_CONFIGURATION_GUIDE.md
2. **CMD命令问题** → CMD_EXECUTION_GUIDE.md
3. **快速查找信息** → QUICK_REFERENCE.md
4. **Windows用户** → WINDOWS_QUICKSTART.md
5. **部署问题** → 相关部署文档

---

### 部署到生产环境

1. **配置Vercel环境变量** → setup-vercel-env.bat
2. **部署到Vercel** → deploy-vercel.bat
3. **验证部署** → verify-vercel-deployment.bat
4. **配置自定义域名** → WINDOWS_QUICKSTART.md（自定义域名配置章节）

---

## 🌐 应用访问地址

### 本地开发环境
- **首页：** http://localhost:3000
- **数据库：** http://localhost:4983（Drizzle Studio）

### 生产环境
- **自定义域名：** https://www.aizhixuan.com.cn
- **Vercel域名：** https://pulseopti-hr.vercel.app
- **Vercel Dashboard：** https://vercel.com/dashboard

---

## 📞 联系支持

- **邮箱：** PulseOptiHR@163.com
- **地址：** 广州市天河区

---

**最后更新时间：** 2025-01-11
**文档版本：** v1.1
