# 🔧 Git Pull 错误修复指南

**错误信息：**
```
error: invalid path 'C:\PulseOpti-HR\fix-build-errors.bat'
error: invalid path 'C:\PulseOpti-HR\src\lib\auth\verification.ts'
```

**问题原因：**
Git 仓库历史中包含了 Windows 绝对路径（带有 `C:\` 驱动器号），这在 Git 中是无效的路径格式。

---

## ✅ 解决方案（推荐）

### 方法1：强制同步（最简单）

在本地 C:\PulseOpti-HR 目录执行以下命令：

```cmd
cd C:\PulseOpti-HR

# 强制同步到远程最新版本
git fetch --all
git reset --hard origin/main
```

**说明：**
- `git fetch --all` - 获取所有远程分支的最新信息
- `git reset --hard origin/main` - 强制将本地 main 分支重置为远程版本

**预期输出：**
```
HEAD is now at 3fde849 fix: 删除错误的Windows路径文件
```

---

### 方法2：删除本地缓存（备选）

如果方法1失败，可以尝试：

```cmd
cd C:\PulseOpti-HR

# 清理 Git 索引
rm -rf .git/objects/info/alternates

# 获取最新代码
git fetch --all

# 强制重置
git reset --hard origin/main
```

---

### 方法3：克隆新仓库（终极方案）

如果上述方法都失败，可以重新克隆：

```cmd
# 1. 备份本地更改（如果有）
cd C:\
ren PulseOpti-HR PulseOpti-HR-backup

# 2. 重新克隆
git clone https://github.com/tomato-writer-2024/PulseOpti-HR.git PulseOpti-HR

# 3. 进入新目录
cd C:\PulseOpti-HR

# 4. 安装依赖（如果需要）
pnpm install
```

---

## 🔍 验证修复结果

执行完上述操作后，验证是否成功：

```cmd
cd C:\PulseOpti-HR

# 1. 检查当前状态
git status
```

**预期输出：**
```
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

```cmd
# 2. 检查最新提交
git log --oneline -3
```

**预期输出：**
```
3fde849 fix: 删除错误的Windows路径文件
58dee79 docs: 创建文件同步完成报告
5f96e64 fix: 修复reset-password验证码导入错误，创建文件同步状态报告
```

```cmd
# 3. 验证关键文件存在
dir src\lib\auth\verification.ts
dir src\app\api\auth\reset-password\route.ts
```

---

## 📊 修复后的文件状态

修复成功后，以下文件应该正常存在：

| 文件路径 | 状态 | 说明 |
|---------|------|------|
| `src/lib/auth/verification.ts` | ✅ 应该存在 | 验证码管理工具 |
| `src/app/api/auth/reset-password/route.ts` | ✅ 应该存在 | 已修复导入路径 |
| `src/app/api/auth/register/email/route.ts` | ✅ 应该存在 | 导入正确 |
| `src/app/api/auth/register/sms/route.ts` | ✅ 应该存在 | 导入正确 |
| `src/storage/database/shared/schema.ts` | ✅ 应该存在 | 包含systemSettings表 |
| `tmp/FILE_SYNC_STATUS_REPORT.md` | ✅ 应该存在 | 状态报告 |
| `tmp/SYNC_COMPLETION_REPORT.md` | ✅ 应该存在 | 完成报告 |

---

## 🎯 下一步操作

修复成功后：

1. **验证代码：**
   ```cmd
   type src\app\api\auth\reset-password\route.ts | findstr "import"
   ```
   
   **应该显示：**
   ```
   import { verifySmsCode, verifyEmailCode } from '@/lib/auth/verification';
   ```

2. **等待 Vercel 自动部署**
   - 代码已推送到 GitHub
   - Vercel 会自动触发构建
   - 约 2-3 分钟后可以访问超管端

3. **访问超管端：**
   - 地址：https://admin.aizhixuan.com.cn
   - 预期：可以正常访问，无错误

---

## 🚨 如果仍然失败

如果执行上述操作后仍然失败，请提供以下信息：

```cmd
# 1. Git 版本
git --version

# 2. 完整的错误信息
git pull 2>&1

# 3. Git 状态
git status

# 4. Git 配置
git config --list | findstr core
```

**常见问题：**

### Q1: 提示 "fatal: not a git repository"

**解决方案：**
```cmd
cd C:\PulseOpti-HR
```

### Q2: 提示 "Permission denied"

**解决方案：**
以管理员身份运行 CMD 或 PowerShell。

### Q3: 提示 "Connection failed"

**解决方案：**
检查网络连接：
```cmd
ping github.com
```

---

## 📞 需要帮助？

如果问题仍未解决，请提供：
1. 执行的命令
2. 完整的错误信息
3. Git 版本号
4. 操作系统版本

---

**修复指南版本：** 1.0  
**创建时间：** 2025-01-20 11:40  
**适用系统：** Windows 10/11
