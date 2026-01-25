# 系统诊断和修复指南

## 🔍 问题分析

根据您的反馈，存在两个主要问题：
1. 用户前端的修改未按要求修改好
2. 后端登录失败

## 📋 完整诊断流程

### 第一步：检查环境变量

#### 1.1 检查 .env 文件是否存在

```bash
cd C:\PulseOpti-HR\PulseOpti-HR
dir .env
```

**预期结果**：应该看到 .env 文件

#### 1.2 检查 .env 文件内容

```bash
type .env
```

**关键配置项**：
- `DATABASE_URL`：数据库连接字符串
- `JWT_SECRET`：JWT密钥
- `SMTP_*`：邮件服务配置（可选）

---

### 第二步：检查数据库

#### 2.1 检查数据库表是否已创建

```bash
pnpm run db:generate
```

**预期结果**：应该显示 "59 tables"

#### 2.2 推送数据库结构

```bash
pnpm run db:push
```

**预期结果**：应该显示 "No changes detected" 或创建表的日志

---

### 第三步：创建超级管理员

#### 3.1 运行初始化脚本

```bash
npx tsx init-admin.ts
```

**预期输出**：
```
🚀 开始初始化超级管理员...
📦 创建默认公司...
✅ 公司创建成功
📋 创建默认部门...
✅ 部门创建成功
💼 创建默认职位...
✅ 职位创建成功
👑 创建超级管理员...
✅ 超级管理员创建成功！

═══════════════════════════════════
📧 邮箱: admin@aizhixuan.com.cn
🔐 密码: Admin@123
👑 角色: admin (超级管理员)
═══════════════════════════════════

🎉 现在可以使用此账号登录系统了！
🌐 登录地址: http://localhost:3000
```

---

### 第四步：测试登录

#### 4.1 测试用户端登录

访问：http://localhost:3000/login

**登录信息**：
- 账号：admin@aizhixuan.com.cn
- 密码：Admin@123

#### 4.2 测试超管端登录

访问：http://localhost:3000/admin/login

**登录信息**：
- 账号：admin@aizhixuan.com.cn
- 密码：Admin@123

---

### 第五步：清除缓存并重启

#### 5.1 删除 .next 缓存目录

```bash
rmdir /s /q .next
```

#### 5.2 重启开发服务器

```bash
pnpm run dev
```

#### 5.3 清除浏览器缓存

在浏览器中按 `Ctrl + Shift + R` 强制刷新

---

## 🔧 常见问题修复

### 问题1：登录提示"账号或密码错误"

**原因**：超级管理员未创建或密码不正确

**解决方案**：
1. 运行 `npx tsx init-admin.ts` 创建超级管理员
2. 使用正确的账号密码登录

---

### 问题2：登录提示"数据库连接失败"

**原因**：DATABASE_URL 配置错误或数据库未创建

**解决方案**：
1. 检查 .env 文件中的 DATABASE_URL
2. 运行 `pnpm run db:push` 创建数据库表

---

### 问题3：登录成功但跳转失败

**原因**：localStorage 未正确设置或路由错误

**解决方案**：
1. 打开浏览器控制台（F12）
2. 检查 Application → Local Storage 是否有 user 和 token
3. 检查控制台是否有 JavaScript 错误

---

### 问题4：超管端显示404

**原因**：/admin 路由文件未正确创建

**解决方案**：

在 PowerShell 中执行（切换到项目目录后）：

```powershell
cd C:\PulseOpti-HR\PulseOpti-HR

$code = @'
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    const isSuperAdmin = localStorage.getItem('isSuperAdmin');

    if (user && isSuperAdmin === 'true') {
      router.push('/admin/dashboard');
    } else {
      router.push('/admin/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-r-transparent" />
        <p className="mt-4 text-white">加载中...</p>
      </div>
    </div>
  );
}
'@

Set-Content -Path "src\app\admin\page.tsx" -Value $code -Encoding UTF8
Write-Host "✅ 文件创建成功" -ForegroundColor Green
```

然后重启开发服务器。

---

## 🚀 一键修复脚本

将以下命令复制到 PowerShell 执行，可以自动完成大部分修复：

```powershell
Write-Host "开始系统修复..." -ForegroundColor Cyan

# 切换到项目目录
Set-Location "C:\PulseOpti-HR\PulseOpti-HR"

# 1. 检查环境变量
Write-Host "`n[1/5] 检查环境变量..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env 文件存在" -ForegroundColor Green
} else {
    Write-Host "❌ .env 文件不存在，需要手动创建" -ForegroundColor Red
}

# 2. 创建超管端主页
Write-Host "`n[2/5] 创建超管端主页..." -ForegroundColor Yellow
$code = @'
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function AdminPage() {
  const router = useRouter();
  useEffect(() => {
    const user = localStorage.getItem('user');
    const isSuperAdmin = localStorage.getItem('isSuperAdmin');
    if (user && isSuperAdmin === 'true') {
      router.push('/admin/dashboard');
    } else {
      router.push('/admin/login');
    }
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-r-transparent" />
        <p className="mt-4 text-white">加载中...</p>
      </div>
    </div>
  );
}
'@
Set-Content -Path "src\app\admin\page.tsx" -Value $code -Encoding UTF8
Write-Host "✅ 超管端主页已创建" -ForegroundColor Green

# 3. 创建超级管理员
Write-Host "`n[3/5] 创建超级管理员..." -ForegroundColor Yellow
Write-Host "请手动运行: npx tsx init-admin.ts" -ForegroundColor Cyan

# 4. 删除缓存
Write-Host "`n[4/5] 删除 .next 缓存..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✅ 缓存已删除" -ForegroundColor Green
} else {
    Write-Host "⚠️  缓存目录不存在" -ForegroundColor Yellow
}

# 5. 完成
Write-Host "`n[5/5] 修复完成！" -ForegroundColor Green
Write-Host "`n下一步操作：" -ForegroundColor Cyan
Write-Host "1. 运行: pnpm run dev" -ForegroundColor White
Write-Host "2. 运行: npx tsx init-admin.ts" -ForegroundColor White
Write-Host "3. 访问: http://localhost:3000/admin/login" -ForegroundColor White
Write-Host "4. 使用账号: admin@aizhixuan.com.cn" -ForegroundColor White
Write-Host "5. 使用密码: Admin@123" -ForegroundColor White
```

---

## 📞 需要帮助？

如果以上步骤都无法解决问题，请提供以下信息：

1. **错误截图**：浏览器控制台（F12）的错误信息
2. **日志输出**：`pnpm run dev` 的启动日志
3. **环境变量**：.env 文件的前几行（隐藏敏感信息）
4. **数据库状态**：`pnpm run db:push` 的输出

---

**最后更新**：2025-01-19
