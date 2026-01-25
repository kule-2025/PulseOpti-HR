# 超管端部署检查清单

## 📋 部署前准备

### 环境检查
- [ ] 拥有 Windows 10/11 电脑
- [ ] 已安装 Node.js 18+（执行 `node --version` 检查）
- [ ] 已安装 pnpm（执行 `pnpm --version` 检查）
- [ ] 已安装 Git（可选，用于克隆项目）

### 账号准备
- [ ] 拥有 Vercel 账号（https://vercel.com/signup）
- [ ] 已部署前端应用到 Vercel
- [ ] 拥有域名管理权限（aizhixuan.com.cn）

### 文件准备
- [ ] 已获取项目代码（克隆或下载）
- [ ] 已在项目根目录（包含 package.json）
- [ ] 脚本文件存在（deploy-admin-to-vercel.bat）

---

## 🚀 执行部署

### 步骤 1：进入项目目录
- [ ] 打开文件资源管理器
- [ ] 导航到项目目录：`C:\path\to\PulseOpti-HR`
- [ ] 确认看到以下文件：
  - [ ] `deploy-admin-to-vercel.bat`
  - [ ] `package.json`

### 步骤 2：执行脚本
- [ ] 双击 `deploy-admin-to-vercel.bat` 文件
- [ ] 等待脚本开始运行

### 步骤 3：Vercel 登录
- [ ] 浏览器自动打开 Vercel 登录页面
- [ ] 选择登录方式（GitHub/GitLab/Bitbucket/Email）
- [ ] 完成登录授权
- [ ] 等待脚本继续执行

### 步骤 4：自动部署过程
- [ ] 步骤 1/10：检查 Vercel CLI ✅
- [ ] 步骤 2/10：检查登录状态 ✅
- [ ] 步骤 3/10：获取数据库连接 ✅
- [ ] 步骤 4/10：部署超管端 ✅
- [ ] 步骤 5/10：配置环境变量 ✅
- [ ] 步骤 6/10：添加自定义域名 ✅
- [ ] 步骤 7/10：重新部署 ✅

---

## 🌐 配置 DNS

### 步骤 5：配置 DNS 记录
- [ ] 登录域名注册商控制台
- [ ] 找到域名 `aizhixuan.com.cn`
- [ ] 进入 DNS 管理页面
- [ ] 添加新记录：
  - [ ] 类型：CNAME
  - [ ] 主机记录：admin
  - [ ] 记录值：cname.vercel-dns.com
  - [ ] TTL：600
- [ ] 保存配置
- [ ] 确认记录已添加成功

### 步骤 6：等待 DNS 生效
- [ ] 等待 5-10 分钟
- [ ] 打开 CMD，执行：`nslookup admin.aizhixuan.com.cn`
- [ ] 确认 DNS 已生效（显示 cname.vercel-dns.com）
- [ ] 如果未生效，继续等待或联系域名注册商

---

## ✅ 验证部署

### 步骤 7：访问超管端
- [ ] 打开浏览器
- [ ] 访问：https://admin.aizhixuan.com.cn
- [ ] 确认显示超管端登录页面
- [ ] 确认无 404 或其他错误

### 步骤 8：创建管理员账号
- [ ] 访问：https://admin.aizhixuan.com.cn/register
- [ ] 填写注册信息：
  - [ ] 邮箱：208343256@qq.com
  - [ ] 密码：admin123
  - [ ] 确认密码：admin123
  - [ ] 姓名：超级管理员
  - [ ] 手机：13800138000（可选）
- [ ] 点击"注册"
- [ ] 确认注册成功

### 步骤 9：登录超管端
- [ ] 访问：https://admin.aizhixuan.com.cn/login
- [ ] 输入管理员账号：
  - [ ] 邮箱：208343256@qq.com
  - [ ] 密码：admin123
- [ ] 点击"登录"
- [ ] 确认登录成功
- [ ] 确认显示超管端仪表盘

### 步骤 10：测试数据同步
- [ ] 打开新的浏览器标签页
- [ ] 访问前端：https://www.aizhixuan.com.cn
- [ ] 注册一个测试用户：
  - [ ] 邮箱：test@example.com
  - [ ] 密码：test123
  - [ ] 姓名：测试用户
- [ ] 返回超管端
- [ ] 访问：https://admin.aizhixuan.com.cn/admin/users
- [ ] 确认能看到刚注册的测试用户
- [ ] 确认数据实时同步成功

---

## 🔍 高级验证

### 可选验证步骤

#### 验证 API 健康状态
- [ ] 访问：https://admin.aizhixuan.com.cn/api/health
- [ ] 确认返回 200 状态码

#### 运行验证脚本
- [ ] 在项目目录执行：`verify-data-sync.bat`
- [ ] 确认所有检查通过：
  - [ ] 前端网络连接正常
  - [ ] 超管端网络连接正常
  - [ ] 前端 API 健康状态：200 OK
  - [ ] 超管端 API 健康状态：200 OK
  - [ ] 前端数据库连接正常
  - [ ] 超管端数据库连接正常
  - [ ] 数据库连接字符串相同

#### 检查环境变量
- [ ] 打开 CMD
- [ ] 执行：`vercel env ls production`
- [ ] 确认以下环境变量已配置：
  - [ ] DATABASE_URL
  - [ ] JWT_SECRET
  - [ ] NEXT_PUBLIC_APP_URL
  - [ ] NEXT_PUBLIC_API_URL
  - [ ] NODE_ENV
  - [ ] SUPER_ADMIN_EMAIL
  - [ ] SUPER_ADMIN_PASSWORD
  - [ ] ADMIN_MODE

#### 检查部署日志
- [ ] 打开 CMD
- [ ] 执行：`vercel logs --follow`
- [ ] 确认无错误日志

---

## 📝 常见问题排查

### 如果访问 404
- [ ] 检查 DNS 配置是否正确
- [ ] 等待 5-10 分钟让 DNS 生效
- [ ] 重新部署：`vercel --prod`

### 如果登录失败
- [ ] 检查环境变量配置：`vercel env ls production`
- [ ] 检查 DATABASE_URL 是否正确
- [ ] 检查 JWT_SECRET 是否配置
- [ ] 查看日志：`vercel logs --follow`

### 如果数据不同步
- [ ] 确认 DATABASE_URL 与前端相同
- [ ] 重新配置 DATABASE_URL
- [ ] 重新部署：`vercel --prod`

### 如果 SSL 证书错误
- [ ] 等待 5-10 分钟让证书生效
- [ ] 检查 DNS 配置
- [ ] 访问 Vercel Dashboard 查看 SSL 状态

---

## 🎉 完成检查

### 最终确认
- [ ] 超管端可以正常访问
- [ ] 管理员账号创建成功
- [ ] 可以正常登录
- [ ] 数据实时同步正常
- [ ] 所有功能测试通过

### 记录关键信息
```
超管端地址：https://admin.aizhixuan.com.cn
前端地址：https://www.aizhixuan.com.cn
管理员邮箱：208343256@qq.com
管理员密码：admin123
DNS 配置：CNAME admin → cname.vercel-dns.com
数据库：共享 PostgreSQL（Neon）
部署日期：____/____/____
```

---

## 📞 获取帮助

如果遇到问题：

1. **查看详细文档**
   - [ ] HOW_TO_RUN_DEPLOYMENT_SCRIPT.md
   - [ ] REALTIME_DATA_SYNC_DETAILED_STEPS.md
   - [ ] VISUAL_DEPLOYMENT_GUIDE.md

2. **查看快速参考**
   - [ ] QUICK_REFERENCE_CARD.md
   - [ ] ONE_PAGE_DEPLOYMENT_GUIDE.md

3. **查看故障排查**
   - [ ] 本文档的"常见问题排查"部分
   - [ ] REALTIME_DATA_SYNC_DETAILED_STEPS.md 的故障排查章节

4. **运行诊断工具**
   - [ ] verify-data-sync.bat

---

## 📊 部署时间估算

```
任务                    预计时间    实际时间    完成状态
────────────────────────────────────────────────────────
环境准备                5 分钟       _____       ☐
执行脚本                10 分钟      _____       ☐
配置 DNS                5 分钟       _____       ☐
等待 DNS 生效           10 分钟      _____       ☐
创建管理员账号          3 分钟       _____       ☐
测试数据同步            5 分钟       _____       ☐
────────────────────────────────────────────────────────
总计                    38 分钟      _____       ☐
```

---

**检查清单版本**：v1.0.0
**更新时间**：2024-12-19

打印本检查清单，在部署时逐项勾选，确保不遗漏任何步骤！
