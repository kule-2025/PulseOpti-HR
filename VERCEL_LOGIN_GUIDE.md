# Vercel登录详细操作指南

## 当前状态

脚本停在"[步骤 2/10] 检查 Vercel 登录状态..."，这是正常的。

**原因**：脚本检测到你可能还未登录Vercel，或者登录状态需要确认。

---

## 解决方案

### 方法1：手动登录（推荐）

#### 步骤1：打开新的CMD窗口
按 `Win + R`，输入 `cmd`，按回车

#### 步骤2：执行登录命令
```cmd
cd C:\PulseOpti-HR
vercel login
```

#### 步骤3：选择登录方式
你会看到类似这样的提示：
```
? Log in to Vercel (Use arrow keys)
❯ Continue with GitHub
  Continue with GitLab
  Continue with Bitbucket
```

**选择 "Continue with GitHub"**（按回车）

#### 步骤4：浏览器授权
1. 浏览器会自动打开 Vercel 登录页面
2. 如果浏览器未自动打开，复制命令行中的链接手动打开
3. 使用你的 GitHub 账号登录（tomato-writer-2024）
4. 授权 Vercel CLI 访问你的 GitHub 账号
5. 授权成功后，返回 CMD 窗口

#### 步骤5：确认登录成功
CMD 会显示：
```
✓ Success! Logged in as tomato-writer-2024
```

#### 步骤6：返回原CMD窗口
回到正在运行 `deploy-admin-to-vercel.bat` 的窗口，**按回车键**继续

---

### 方法2：修改脚本使用非交互模式

如果上述方法不行，可以修改脚本：

#### 创建新脚本 `deploy-admin-express.bat`

```batch
@echo off
echo ========================================
echo 超管端快速部署（非交互模式）
echo ========================================
echo.

echo [1/5] 检查Vercel登录状态...
vercel whoami
if errorlevel 1 (
    echo 未登录Vercel，请先执行: vercel login
    echo.
    echo 登录步骤：
    echo 1. 执行命令: vercel login
    echo 2. 选择 "Continue with GitHub"
    echo 3. 在浏览器中授权
    echo 4. 登录成功后重新运行本脚本
    pause
    exit /b 1
)
echo ✓ 已登录
echo.

echo [2/5] 部署到Vercel生产环境...
vercel --prod --yes
echo ✓ 部署完成
echo.

echo [3/5] 获取部署URL...
for /f "tokens=2" %%i in ('vercel ls --scope tomato-writer-2024 2^>nul ^| findstr PulseOpti-HR') do set VERCEL_URL=%%i
echo 部署URL: %VERCEL_URL%
echo.

echo [4/5] 配置环境变量...
echo 请访问以下URL配置环境变量：
echo https://vercel.com/tomato-writer-2024/pulseopti-hr/settings/environment-variables
echo.
echo 需要配置的变量：
echo - DATABASE_URL (与主站相同)
echo - JWT_SECRET (与主站相同)
echo - NEXT_PUBLIC_APP_URL=https://www.aizhixuan.com.cn
echo.

echo [5/5] 配置DNS记录...
echo 请访问域名管理面板添加CNAME记录：
echo - 名称: admin
echo - 值: cname.vercel-dns.com
echo.

echo ========================================
echo 部署完成！
echo ========================================
echo.
echo 访问地址: https://admin.aizhixuan.com.cn
echo 登录账号: admin@pulseopti-hr.com
echo 登录密码: admin123
echo.
pause
```

---

### 方法3：直接使用命令行部署

如果脚本有问题，直接执行以下命令：

```cmd
# 步骤1：登录
vercel login

# 步骤2：部署
vercel --prod --yes

# 步骤3：查看部署状态
vercel ls
```

---

## 登录后继续部署

### 如果使用原脚本

回到运行 `deploy-admin-to-vercel.bat` 的窗口，按 `Ctrl+C` 停止当前脚本，然后重新运行：

```cmd
deploy-admin-to-vercel.bat
```

### 如果使用新脚本

```cmd
deploy-admin-express.bat
```

### 如果使用命令行

```cmd
vercel --prod --yes
```

---

## 常见问题

### Q1：浏览器没有自动打开怎么办？
**A**：复制命令行中显示的链接，手动在浏览器中打开。

### Q2：GitHub授权失败怎么办？
**A**：
1. 检查是否已登录GitHub
2. 检查网络连接
3. 确认Vercel账户已创建（使用tomato-writer-2024）

### Q3：登录成功但脚本仍然卡住？
**A**：
1. 按 `Ctrl+C` 停止脚本
2. 重新运行 `vercel whoami` 确认登录状态
3. 重新运行部署脚本

### Q4：显示"Not logged in"怎么办？
**A**：执行 `vercel login` 重新登录

### Q5：GitHub账户没有Vercel项目怎么办？
**A**：需要先在Vercel创建项目，或者使用命令行导入：
```cmd
vercel link
```

---

## 验证登录状态

在任何CMD窗口执行：

```cmd
vercel whoami
```

如果显示用户名，说明登录成功：
```
tomato-writer-2024
```

---

## 下一步操作

登录Vercel后：

1. **继续运行部署脚本**（推荐）
2. 或执行命令：`vercel --prod --yes`
3. 配置环境变量（主站已配置，可共享）
4. 配置DNS记录：admin → cname.vercel-dns.com
5. 验证访问：https://admin.aizhixuan.com.cn

---

## 推荐操作流程

```cmd
# 1. 打开新CMD窗口
# 2. 登录Vercel
vercel login

# 3. 选择 Continue with GitHub
# 4. 浏览器授权

# 5. 验证登录
vercel whoami

# 6. 回到原窗口，按Ctrl+C停止脚本

# 7. 重新运行
deploy-admin-to-vercel.bat

# 或直接部署
vercel --prod --yes
```

---

## 快速参考

| 操作 | 命令 |
|------|------|
| 登录 | `vercel login` |
| 检查登录状态 | `vercel whoami` |
| 部署到生产环境 | `vercel --prod --yes` |
| 查看部署列表 | `vercel ls` |
| 查看项目信息 | `vercel inspect` |
