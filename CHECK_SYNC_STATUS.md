# 沙箱文件同步状态检查清单

> 生成时间：2025-01-19
> 用途：检查本地文件是否已同步

## 📊 沙箱文件统计

| 类别 | 沙箱中的数量 |
|------|-------------|
| 前端页面 (tsx) | 135 个 |
| 后端API (route.ts) | 98 个 |
| 工具库 (ts) | 20 个 |
| 组件 (tsx) | 74 个 |
| 文档文件 (md) | 83 个 |
| **总计** | **410+ 个文件** |

## ✅ 本地文件检查清单

### 1. 基础文件检查

在PowerShell中运行以下命令，确认文件是否存在：

```powershell
# 检查配置文件
Test-Path package.json        # 应返回 True
Test-Path tsconfig.json       # 应返回 True
Test-Path next.config.ts      # 应返回 True
Test-Path tailwind.config.ts  # 应返回 True
Test-Path drizzle.config.ts   # 应返回 True
Test-Path .env                # 应返回 True
Test-Path .env.example        # 应返回 True

# 检查核心目录
Test-Path src                 # 应返回 True
Test-Path public              # 应返回 True
Test-Path node_modules        # 应返回 True
```

### 2. 超管端文件检查

```powershell
# 检查超管端首页
Test-Path src\app\admin\page.tsx

# 检查超管端登录页
Test-Path src\app\admin\login\page.tsx

# 检查超管端API目录
Test-Path src\app\api\admin
```

### 3. 统计本地文件数量

```powershell
# 统计前端页面
(Get-ChildItem -Path src\app -Filter *.tsx -Recurse).Count

# 统计后端API
(Get-ChildItem -Path src\app\api -Filter route.ts -Recurse).Count

# 统计工具库
(Get-ChildItem -Path src\lib -Filter *.ts -Recurse).Count

# 统计组件
(Get-ChildItem -Path src\components -Filter *.tsx -Recurse).Count
```

## 📋 关键文件列表

### 必须存在的文件（基础）

```
✅ package.json
✅ tsconfig.json
✅ next.config.ts
✅ tailwind.config.ts
✅ drizzle.config.ts
✅ components.json
✅ .coze
✅ .env.example
```

### 必须存在的目录（结构）

```
✅ src/
   ✅ app/
      ✅ admin/        # 超管端
      ✅ api/          # API端点
      ✅ dashboard/    # 仪表盘
      ✅ (其他页面)
   ✅ lib/            # 工具库
      ✅ db/          # 数据库配置
      ✅ auth/        # 认证
      ✅ utils/       # 工具函数
   ✅ components/     # 组件
      ✅ ui/          # shadcn/ui组件
✅ public/
   ✅ assets/        # 静态资源
```

### 超管端文件（13个）

```
✅ src/app/admin/page.tsx
✅ src/app/admin/login/page.tsx
✅ src/app/admin/dashboard/page.tsx
✅ src/app/admin/users/page.tsx
✅ src/app/admin/users/[id]/page.tsx
✅ src/app/admin/companies/page.tsx
✅ src/app/admin/companies/[id]/page.tsx
✅ src/app/admin/subscriptions/page.tsx
✅ src/app/admin/reports/page.tsx
✅ src/app/admin/settings/page.tsx
✅ src/app/admin/audit-logs/page.tsx
✅ src/app/admin/sub-accounts/page.tsx
✅ src/app/admin/workflows/page.tsx
```

### 超管端API（14个）

```
✅ src/app/api/admin/dashboard/stats/route.ts
✅ src/app/api/admin/users/route.ts
✅ src/app/api/admin/users/[id]/route.ts
✅ src/app/api/admin/companies/route.ts
✅ src/app/api/admin/companies/[id]/route.ts
✅ src/app/api/admin/subscriptions/route.ts
✅ src/app/api/admin/subscriptions/[id]/route.ts
✅ src/app/api/admin/reports/stats/route.ts
✅ src/app/api/admin/settings/route.ts
✅ src/app/api/admin/audit-logs/route.ts
✅ src/app/api/admin/sub-accounts/route.ts
✅ src/app/api/admin/sub-accounts/[id]/route.ts
✅ src/app/api/admin/sub-accounts/quota/route.ts
✅ src/app/api/admin/init/plans/route.ts
```

## 🔍 快速检查脚本

在PowerShell中运行以下脚本，一键检查所有文件：

```powershell
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PulseOpti HR - 文件同步状态检查" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$checkList = @(
    @{ Name = "package.json"; Path = "package.json" }
    @{ Name = "tsconfig.json"; Path = "tsconfig.json" }
    @{ Name = "next.config.ts"; Path = "next.config.ts" }
    @{ Name = "tailwind.config.ts"; Path = "tailwind.config.ts" }
    @{ Name = "drizzle.config.ts"; Path = "drizzle.config.ts" }
    @{ Name = ".env.example"; Path = ".env.example" }
    @{ Name = "src目录"; Path = "src" }
    @{ Name = "public目录"; Path = "public" }
    @{ Name = "超管端首页"; Path = "src\app\admin\page.tsx" }
    @{ Name = "超管端登录页"; Path = "src\app\admin\login\page.tsx" }
    @{ Name = "超管端API目录"; Path = "src\app\api\admin" }
)

$existsCount = 0
$missingCount = 0

foreach ($item in $checkList) {
    $exists = Test-Path $item.Path
    if ($exists) {
        Write-Host "✅ $($item.Name)" -ForegroundColor Green
        $existsCount++
    } else {
        Write-Host "❌ $($item.Name)" -ForegroundColor Red
        Write-Host "   路径: $($item.Path)" -ForegroundColor Gray
        $missingCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  检查结果" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ 存在: $existsCount 个" -ForegroundColor Green
Write-Host "❌ 缺失: $missingCount 个" -ForegroundColor Red
Write-Host ""

# 统计文件数量
if (Test-Path "src\app") {
    $tsxCount = (Get-ChildItem -Path src\app -Filter *.tsx -Recurse).Count
    Write-Host "📊 前端页面: $tsxCount 个" -ForegroundColor Cyan
}

if (Test-Path "src\app\api") {
    $apiCount = (Get-ChildItem -Path src\app\api -Filter route.ts -Recurse).Count
    Write-Host "📊 后端API: $apiCount 个" -ForegroundColor Cyan
}

if (Test-Path "src\lib") {
    $libCount = (Get-ChildItem -Path src\lib -Filter *.ts -Recurse).Count
    Write-Host "📊 工具库: $libCount 个" -ForegroundColor Cyan
}

Write-Host ""
if ($missingCount -eq 0) {
    Write-Host "🎉 所有文件都已同步！" -ForegroundColor Green
} else {
    Write-Host "⚠️  还有 $missingCount 个文件缺失" -ForegroundColor Yellow
}
```

## 📝 判断标准

### ✅ 文件已完整同步

如果满足以下条件，说明文件已完整同步：

- [ ] 所有基础配置文件都存在
- [ ] src目录结构完整
- [ ] 超管端页面至少有1个（admin/page.tsx）
- [ ] 超管端API目录存在
- [ ] 前端页面数量接近135个
- [ ] 后端API数量接近98个

### ⚠️ 文件部分同步

如果满足以下条件，说明文件部分同步：

- [ ] 基础配置文件存在
- [ ] src目录存在
- [ ] 但部分页面或API缺失
- [ ] 需要从沙箱补充缺失文件

### ❌ 文件未同步

如果满足以下条件，说明文件未同步：

- [ ] 基础配置文件缺失
- [ ] src目录不存在
- [ ] 无法运行 `pnpm install`
- [ ] 需要完整下载项目文件

## 🔧 如何补充缺失文件

### 如果发现文件缺失

1. **从沙箱手动下载**
   - 访问沙箱文件管理器
   - 下载缺失的文件或目录
   - 解压到本地对应位置

2. **使用Git同步（如果有远程仓库）**
   ```powershell
   git pull origin main
   ```

3. **重新下载整个项目**
   - 从Git仓库重新克隆
   - 或从沙箱下载完整项目

## 📞 获取帮助

如果遇到问题：

1. 运行上面的快速检查脚本
2. 将输出结果发给我
3. 我会帮你分析并提供解决方案

---

**项目信息**：
- 项目名称：PulseOpti HR 脉策聚效
- 联系邮箱：PulseOptiHR@163.com
- 地址：广州市天河区
