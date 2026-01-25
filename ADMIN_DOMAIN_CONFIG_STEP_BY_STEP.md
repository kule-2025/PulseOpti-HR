# 超管端域名配置完整操作指南

## 📋 目标
配置 `admin.aizhixuan.com.cn` 域名，实现超管端外网访问

**预计时间**: 30-45分钟  
**难度**: ⭐⭐☆☆☆（中级）

---

## 🎯 前置准备

在开始之前，请确保你已经具备：
- ✅ 域名 `aizhixuan.com.cn` 的管理权限
- ✅ Vercel 账号登录权限
- ✅ 超级管理员账号（208343256@qq.com / admin123）
- ✅ 项目已部署到 Vercel（pulseopti-hr）

---

## 📝 第一部分：域名DNS配置（10分钟）

### 步骤1：登录域名服务商

#### 场景A：如果你使用阿里云

1. **访问阿里云域名控制台**
   - 网址：https://dc.console.aliyun.com/
   - 使用阿里云账号登录

2. **找到域名管理**
   - 点击左侧菜单「域名」→「域名列表」
   - 在域名列表中找到 `aizhixuan.com.cn`
   - 点击「解析」按钮

3. **进入DNS解析页面**
   - 你会看到DNS解析管理页面
   - 点击「添加记录」按钮

#### 场景B：如果你使用腾讯云

1. **访问腾讯云DNSPod控制台**
   - 网址：https://console.cloud.tencent.com/cns
   - 使用腾讯云账号登录

2. **找到域名管理**
   - 在域名列表中找到 `aizhixuan.com.cn`
   - 点击「解析」按钮

3. **进入DNS解析页面**
   - 点击「添加记录」按钮

#### 场景C：如果你使用Cloudflare

1. **访问Cloudflare控制台**
   - 网址：https://dash.cloudflare.com/
   - 使用Cloudflare账号登录

2. **选择域名**
   - 在首页选择 `aizhixuan.com.cn`

3. **进入DNS管理**
   - 点击左侧菜单「DNS」
   - 找到DNS记录列表，点击「Add record」

### 步骤2：添加CNAME记录

**重要提示**: 所有域名服务商的配置界面可能略有不同，但核心参数是一样的。

#### 配置参数：

| 参数 | 值 | 说明 |
|------|-----|------|
| **记录类型** | CNAME | 别名记录 |
| **主机记录** | admin | 子域名前缀 |
| **记录值** | cname.vercel-dns.com | Vercel提供的CNAME |
| **TTL** | 600 或默认 | 缓存时间（秒） |

#### 阿里云配置界面：

```
记录类型:    选择 [CNAME]
主机记录:    输入 [admin]
记录值:      输入 [cname.vercel-dns.com]
TTL:        选择 [10分钟] 或 [600]
```

#### 腾讯云配置界面：

```
主机记录:    输入 [admin]
记录类型:    选择 [CNAME]
线路类型:    选择 [默认]
记录值:      输入 [cname.vercel-dns.com]
TTL:        选择 [600]
```

#### Cloudflare配置界面：

```
Type:       选择 [CNAME]
Name:       输入 [admin]
Target:     输入 [cname.vercel-dns.com]
Proxy:      关闭（灰色云朵图标）
```

**⚠️ 重要提示**:
- 主机记录是 `admin`，不是 `www` 或其他
- 记录值是 `cname.vercel-dns.com`，不要加任何后缀
- TTL可以保持默认值，600秒（10分钟）即可

### 步骤3：保存配置

点击「保存」或「添加」按钮，保存DNS记录配置。

### 步骤4：等待DNS生效

DNS生效时间通常需要：
- **最快**: 10分钟
- **通常**: 30分钟
- **最慢**: 24小时

**验证DNS是否生效**：

**Windows系统**:
```cmd
ping admin.aizhixuan.com.cn
```

**Mac/Linux系统**:
```bash
ping admin.aizhixuan.com.cn
```

**预期输出**:
```
正在 Ping admin.aizhixuan.com.cn [76.76.21.21] 具有 32 字节的数据:
来自 76.76.21.21 的回复: 字节=32 时间=20ms TTL=56
```

**注意**: IP地址可能不同，但必须能ping通。

---

## 🚀 第二部分：Vercel域名配置（15分钟）

### 步骤1：登录Vercel

1. **访问Vercel官网**
   - 网址：https://vercel.com
   - 使用你的账号登录

2. **进入Dashboard**
   - 登录后会自动跳转到Dashboard
   - 显示你的所有项目列表

### 步骤2：选择项目

1. **找到项目**
   - 在项目列表中找到 `pulseopti-hr`
   - 或者使用搜索功能搜索 `pulseopti-hr`

2. **进入项目**
   - 点击项目卡片，进入项目详情页面

### 步骤3：进入项目设置

1. **找到Settings标签**
   - 在项目页面顶部，找到「Settings」标签
   - 点击进入Settings页面

2. **导航到Domains**
   - 在左侧菜单中找到「Domains」
   - 点击进入域名配置页面

### 步骤4：添加新域名

1. **点击添加域名**
   - 在Domains页面，点击「Add Domain」按钮

2. **输入域名**
   - 在输入框中输入：`admin.aizhixuan.com.cn`
   - 不要加 `http://` 或 `https://`
   - 不要加尾部斜杠

3. **点击Add**
   - 点击「Add」按钮

### 步骤5：验证DNS配置

Vercel会自动检测DNS配置：

**如果DNS已生效**:
- ✅ 状态会显示绿色✓
- ✅ 自动配置HTTPS证书
- ✅ 域名立即可用

**如果DNS未生效**:
- ⚠️ 状态会显示黄色警告
- ⚠️ 提示「Invalid Configuration」
- ⚠️ 需要等待DNS生效（见步骤4）

### 步骤6：配置路由（可选）

如果你的主域名 `www.aizhixuan.com.cn` 也指向Vercel，你需要区分用户端和超管端：

**当前架构**:
- 用户端: `https://www.aizhixuan.com.cn` (所有页面)
- 超管端: `https://admin.aizhixuan.com.cn` (重定向到 /admin)

由于Next.js的App Router会自动根据域名路由到对应的页面，所以不需要额外配置Vercel的路由。

### 步骤7：配置环境变量（可选）

如果需要区分不同域名下的行为，可以添加环境变量：

1. **回到Settings页面**
   - 点击「Settings」标签

2. **进入Environment Variables**
   - 在左侧菜单中找到「Environment Variables」
   - 点击进入

3. **添加环境变量**
   - 点击「Add New」
   - Key: `NEXT_PUBLIC_ADMIN_URL`
   - Value: `https://admin.aizhixuan.com.cn`
   - Environment: 选择「Production」
   - 点击「Save」

4. **重新部署**
   - 添加环境变量后，需要重新部署项目
   - 点击「Deployments」标签
   - 找到最新的部署，点击右侧的「···」
   - 选择「Redeploy」

---

## ✅ 第三部分：验证配置（10分钟）

### 验证1：DNS解析检查

**方法1：使用ping命令**
```cmd
ping admin.aizhixuan.com.cn
```

**预期结果**:
- 能ping通
- 返回Vercel的IP地址（如 76.76.21.21）

**方法2：使用在线工具**
- 访问：https://www.nslookup.io/
- 输入：`admin.aizhixuan.com.cn`
- 点击「Lookup」

**预期结果**:
- 显示解析到Vercel的IP
- 无错误提示

### 验证2：HTTP访问测试

1. **在浏览器中访问**
   - 输入：`https://admin.aizhixuan.com.cn`
   - 不要使用 `http://`

2. **检查跳转行为**
   - **如果未登录**: 应自动跳转到 `/admin/login`
   - **如果已登录**: 应自动跳转到 `/admin/dashboard`

3. **检查页面加载**
   - 页面应正常加载
   - 无404、502等错误

### 验证3：HTTPS证书检查

1. **查看浏览器地址栏**
   - 地址栏左侧应有🔒锁形图标
   - 如果显示⚠️警告图标，说明证书配置有问题

2. **查看证书详情**
   - 点击锁形图标
   - 选择「证书有效」或「证书」
   - 查看证书信息

**预期结果**:
- 证书状态: 有效
- 颁发给: `admin.aizhixuan.com.cn`
- 颁发者: Let's Encrypt（Vercel自动配置）

### 验证4：登录功能测试

1. **访问登录页**
   - 地址：`https://admin.aizhixuan.com.cn`
   - 应自动跳转到登录页

2. **输入超级管理员账号**
   - 账号：`208343256@qq.com`
   - 密码：`admin123`

3. **点击登录**

4. **检查跳转**
   - 应成功跳转到 `/admin/dashboard`
   - 显示超管端仪表盘

5. **检查功能**
   - 左侧导航栏应显示：用户管理、企业管理、订阅管理、报表中心、系统设置、审计日志
   - 点击各个菜单项，应能正常访问

### 验证5：数据同步测试

**测试步骤**:

1. **在用户端创建数据**
   - 访问：`https://www.aizhixuan.com.cn`
   - 注册新账号（或使用已有账号）
   - 创建一个订单

2. **在超管端查看数据**
   - 访问：`https://admin.aizhixuan.com.cn`
   - 登录超管端
   - 进入「用户管理」，查看新用户
   - 进入「订阅管理」，查看新订单

3. **验证数据一致性**
   - 用户端和超管端数据应一致
   - 无延迟（实时同步）

---

## 🔍 第四部分：常见问题解决

### 问题1：ping不通DNS

**症状**:
```cmd
ping admin.aizhixuan.com.cn
Ping请求找不到主机 admin.aizhixuan.com.cn。
```

**原因**: DNS配置未生效或配置错误

**解决方案**:

1. **检查DNS记录**
   - 登录域名服务商
   - 确认CNAME记录存在
   - 确认主机记录是 `admin`
   - 确认记录值是 `cname.vercel-dns.com`

2. **检查TTL时间**
   - DNS生效需要时间（10分钟-24小时）
   - 如果刚配置完成，请等待

3. **使用公共DNS**
   ```cmd
   # 临时修改DNS为Google DNS
   nslookup admin.aizhixuan.com.cn 8.8.8.8
   ```

4. **清除本地DNS缓存**
   ```cmd
   # Windows
   ipconfig /flushdns
   
   # Mac
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   ```

### 问题2：Vercel提示"Invalid Configuration"

**症状**: Vercel域名页面显示黄色警告「Invalid Configuration」

**原因**: DNS记录配置错误或未生效

**解决方案**:

1. **检查DNS记录类型**
   - 必须是 `CNAME` 类型
   - 不能是 `A` 记录

2. **检查记录值**
   - 必须是 `cname.vercel-dns.com`
   - 不能是 `vercel-dns.com` 或其他

3. **检查TTL**
   - TTL设置为 600 或更小
   - 太大的TTL会导致DNS更新缓慢

4. **等待DNS生效**
   - 等待10-30分钟后，刷新Vercel页面
   - Vercel会自动重新检测

### 问题3：访问404错误

**症状**: 访问 `https://admin.aizhixuan.com.cn` 显示404 Not Found

**原因**: Vercel路由配置问题或代码问题

**解决方案**:

1. **检查Vercel部署**
   - 进入Vercel项目
   - 查看最新的部署状态
   - 确保部署成功（绿色✓）

2. **检查路由代码**
   - 确认 `src/app/admin/page.tsx` 存在
   - 确认 `src/app/admin/login/page.tsx` 存在
   - 确认 `src/app/admin/dashboard/page.tsx` 存在

3. **检查部署日志**
   - 在Vercel中点击部署记录
   - 查看Build Log
   - 检查是否有错误

4. **重新部署**
   - 在GitHub推送代码
   - 或在Vercel中点击「Redeploy」

### 问题4：HTTPS证书错误

**症状**: 浏览器提示「您的连接不是私密连接」或证书错误

**原因**: HTTPS证书未自动生成

**解决方案**:

1. **等待证书生成**
   - Vercel会自动为每个配置的域名生成Let's Encrypt证书
   - 证书生成通常需要5-10分钟

2. **检查DNS配置**
   - HTTPS证书生成需要DNS配置正确
   - 确认DNS记录已生效

3. **强制更新证书**
   - 在Vercel域名页面
   - 找到域名
   - 点击「···」→「Regenerate Certificate」

4. **检查证书状态**
   - 在Vercel域名页面
   - 查看证书状态
   - 如果显示错误，检查DNS配置

### 问题5：登录失败

**症状**: 输入正确的账号密码但无法登录

**原因**: 数据库中超级管理员账号不存在或状态异常

**解决方案**:

1. **检查账号是否存在**
   - 连接数据库
   - 查询 `users` 表
   ```sql
   SELECT * FROM users WHERE email = '208343256@qq.com';
   ```

2. **检查isSuperAdmin字段**
   - 确认 `isSuperAdmin` 字段为 `true`
   - 如果不是，执行更新：
   ```sql
   UPDATE users SET isSuperAdmin = true WHERE email = '208343256@qq.com';
   ```

3. **检查密码**
   - 如果密码错误，重置密码
   - 密码哈希应使用bcrypt加密

4. **检查JWT_SECRET**
   - 确认Vercel环境变量中配置了 `JWT_SECRET`
   - 确认用户端和超管端使用相同的 `JWT_SECRET`

### 问题6：数据不同步

**症状**: 用户端创建数据后，超管端看不到

**原因**: 环境变量配置不一致或数据库连接问题

**解决方案**:

1. **检查DATABASE_URL**
   - 确认用户端和超管端使用相同的 `DATABASE_URL`
   - 确认环境变量在Production环境已配置

2. **检查数据库连接**
   - 测试数据库连接是否正常
   - 检查数据库是否可访问

3. **检查部署状态**
   - 确认最新的部署已成功
   - 确认代码已推送

4. **清除缓存**
   - 清除浏览器缓存
   - 清除Vercel缓存（重新部署）

---

## 📋 第五部分：配置检查清单

使用以下检查清单确保配置正确：

### DNS配置检查
- [ ] 已登录域名服务商（阿里云/腾讯云/Cloudflare）
- [ ] 已添加CNAME记录（admin → cname.vercel-dns.com）
- [ ] 已保存DNS配置
- [ ] DNS已生效（ping成功）
- [ ] DNS解析指向Vercel IP

### Vercel配置检查
- [ ] 已登录Vercel
- [ ] 已选择项目（pulseopti-hr）
- [ ] 已进入Settings → Domains
- [ ] 已添加域名（admin.aizhixuan.com.cn）
- [ ] Vercel显示域名状态为有效（绿色✓）
- [ ] HTTPS证书已生成（状态为Valid）

### 功能验证检查
- [ ] 能访问 https://admin.aizhixuan.com.cn
- [ ] 自动跳转到登录页或仪表盘
- [ ] 超级管理员能登录
- [ ] 导航菜单正常显示
- [ ] 各个页面能正常访问
- [ ] 数据同步正常（用户端↔超管端）

### 安全检查
- [ ] 使用HTTPS协议
- [ ] 证书有效且无警告
- [ ] 登录功能正常
- [ ] 环境变量已配置（JWT_SECRET等）

---

## 🎯 第六部分：完成后的下一步

配置完成后，你可以：

1. **开始使用超管端**
   - 访问：`https://admin.aizhixuan.com.cn`
   - 登录：`208343256@qq.com` / `admin123`
   - 管理用户、企业、订阅等

2. **监控数据同步**
   - 在用户端创建订单
   - 在超管端查看订单列表
   - 验证实时同步

3. **配置更多功能**
   - 飞书集成
   - 钉钉集成
   - 真实支付集成
   - 真实短信/邮件服务

4. **推广产品**
   - 完善产品文档
   - 制作宣传视频
   - 开展市场推广

---

## 📞 第七部分：获取帮助

如果配置过程中遇到问题：

### 1. 查看日志
- **Vercel日志**: 在Vercel项目 → Deployments → 查看Build Log
- **应用日志**: 在Vercel项目 → Logs → 查看Runtime Log

### 2. 在线诊断工具
- **DNS检查**: https://www.nslookup.io/
- **证书检查**: https://www.ssllabs.com/ssltest/
- **HTTP检查**: https://httpstatus.io/

### 3. 常用命令

```cmd
# 检查DNS解析
nslookup admin.aizhixuan.com.cn

# 检查路由跟踪
tracert admin.aizhixuan.com.cn

# 测试HTTP访问
curl -I https://admin.aizhixuan.com.cn
```

### 4. 联系支持
- **Vercel支持**: https://vercel.com/support
- **域名服务商支持**: 阿里云/腾讯云/Cloudflare客服

---

## 📝 附录：快速参考卡片

### DNS配置信息

```
记录类型: CNAME
主机记录: admin
记录值: cname.vercel-dns.com
TTL: 600
```

### 访问地址

```
用户端: https://www.aizhixuan.com.cn
超管端: https://admin.aizhixuan.com.cn
```

### 超级管理员账号

```
邮箱: 208343256@qq.com
密码: admin123
```

### Vercel项目

```
项目名称: pulseopti-hr
Git仓库: https://github.com/tomato-writer-2024/PulseOpti-HR
```

---

**祝配置顺利！如有问题，请参考常见问题解决部分。**
