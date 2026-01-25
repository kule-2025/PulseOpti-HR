# 修复Vercel多区域错误 - 终极方案

## 问题原因

虽然本地 `vercel.json` 已删除 regions 配置，但Vercel服务器端的项目设置中可能还有 regions 配置。

错误提示仍在出现：
```
Error: Deploying Serverless Functions to multiple regions is restricted to the Pro and Enterprise plans.
```

---

## 解决方案（3选1）

### 方案1：删除.vercel目录重新链接（推荐）

#### 步骤1：删除本地Vercel配置
```cmd
rmdir /s /q .vercel
```

#### 步骤2：重新链接项目
```cmd
vercel link
```

#### 步骤3：选择正确的项目
会看到项目列表，选择：
```
? Link to existing project
❯ tomato-writer-2024/pulseopti-hr
  tomato-ai-writer/pulseopti-hr
```

选择 **tomato-writer-2024/pulseopti-hr**（这是正确的项目）

#### 步骤4：部署
```cmd
vercel --prod --yes
```

---

### 方案2：删除vercel.json文件

#### 步骤1：删除vercel.json
```cmd
del vercel.json
```

#### 步骤2：部署
```cmd
vercel --prod --yes
```

**说明**：删除后，Vercel将使用默认配置（无regions限制）。

---

### 方案3：在Vercel Web控制台修改

#### 步骤1：访问项目设置
访问：https://vercel.com/tomato-writer-2024/pulseopti-hr/settings

#### 步骤2：找到Function配置
找到 "Functions" 或 "Regions" 设置

#### 步骤3：移除区域配置
将regions设置为默认（或移除hkg1和sin1）

#### 步骤4：保存并重新部署
```cmd
vercel --prod --yes
```

---

## 一键修复脚本

创建 `fix-vercel-regions.bat`：

```batch
@echo off
chcp 65001 >nul
echo ========================================
echo 修复Vercel多区域配置错误
echo ========================================
echo.

echo [1/4] 删除本地Vercel配置...
if exist .vercel (
    rmdir /s /q .vercel
    echo ✓ .vercel目录已删除
) else (
    echo .vercel目录不存在，跳过
)
echo.

echo [2/4] 备份vercel.json（如果有）...
if exist vercel.json (
    copy vercel.json vercel.json.backup
    echo ✓ vercel.json已备份
)
echo.

echo [3/4] 重新链接项目...
vercel link
echo.

echo [4/4] 部署到生产环境...
vercel --prod --yes
echo.

echo ========================================
echo 修复完成！
echo ========================================
pause
```

---

## 推荐操作流程

### 立即执行（推荐）

```cmd
# 1. 删除.vercel目录
rmdir /s /q .vercel

# 2. 重新链接
vercel link
# 选择：tomato-writer-2024/pulseopti-hr

# 3. 部署
vercel --prod --yes
```

### 或使用简化版本

```cmd
# 删除vercel.json，使用默认配置
del vercel.json
vercel --prod --yes
```

---

## 验证成功

部署成功后会看到：

```
✓ Production: https://pulseopti-xxxxx.vercel.app
```

然后：
1. 访问部署URL
2. 测试前端功能
3. 访问 /admin 路径测试超管端
4. 配置DNS: admin.aizhixuan.com.cn → cname.vercel-dns.com

---

## 常见问题

### Q1：重新链接时看不到正确项目？
**A**：确保登录了正确的GitHub账号（tomato-writer-2024）
```cmd
vercel whoami
```

### Q2：删除vercel.json会影响其他配置吗？
**A**：是的，但大部分配置（CORS、headers等）可以在Next.js中配置。如果需要保留，使用方案1。

### Q3：部署成功后 regions 限制仍然存在？
**A**：在Vercel Web控制台检查项目设置，手动移除regions配置。

### Q4：如何确认当前项目？
**A**：
```cmd
type .vercel\project.json
```

---

## 快速参考

| 操作 | 命令 |
|------|------|
| 删除.vercel | `rmdir /s /q .vercel` |
| 重新链接 | `vercel link` |
| 查看当前项目 | `type .vercel\project.json` |
| 部署 | `vercel --prod --yes` |
| 查看环境变量 | `vercel env ls` |

---

## 立即执行

**推荐流程（复制粘贴）**：

```cmd
rmdir /s /q .vercel
vercel link
vercel --prod --yes
```

选择正确的项目：**tomato-writer-2024/pulseopti-hr**

等待部署完成即可！
