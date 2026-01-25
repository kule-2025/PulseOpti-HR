@echo off
chcp 65001 >nul
echo ========================================
echo   PulseOpti HR - 代码修复一键执行脚本
echo ========================================
echo.

cd /d C:\PulseOpti-HR

echo [1/7] 检查项目目录...
if not exist "C:\PulseOpti-HR" (
    echo ❌ 错误：找不到项目目录 C:\PulseOpti-HR
    pause
    exit /b 1
)
echo ✅ 项目目录存在
echo.

echo [2/7] 创建文件夹结构...
if not exist "src\lib\auth" (
    mkdir src\lib\auth
    echo ✅ 创建文件夹：src\lib\auth
) else (
    echo ℹ️ 文件夹已存在：src\lib\auth
)
echo.

echo [3/7] 检查文件状态...
if exist "src\lib\auth\verification.ts" (
    echo ℹ️ 文件已存在：src\lib\auth\verification.ts
) else (
    echo ⚠️ 文件不存在：src\lib\auth\verification.ts
)
echo.

echo ========================================
echo 📋 接下来的操作需要手动完成
echo ========================================
echo.
echo 请按照以下步骤操作：
echo.
echo 步骤1：打开文件编辑器（VS Code推荐）
echo.
echo 步骤2：创建/修改以下文件：
echo   1. 新建：src\lib\auth\verification.ts
echo   2. 替换：src\app\api\auth\send-email\route.ts
echo   3. 替换：src\app\api\auth\send-sms\route.ts
echo   4. 修改：src\app\api\auth\register\email\route.ts（第9行）
echo   5. 修改：src\app\api\auth\register\sms\route.ts（第9行）
echo   6. 修改：src\storage\database\shared\schema.ts（文件末尾）
echo.
echo 步骤3：所有文件代码已保存在以下位置：
echo   - %TEMP%\verification.ts（第1个文件）
echo   - %TEMP%\send-email-route.ts（第2个文件）
echo   - %TEMP%\send-sms-route.ts（第3个文件）
echo   - %TEMP%\register-email-route.ts（第4个文件）
echo   - %TEMP%\register-sms-route.ts（第5个文件）
echo   - %TEMP%\COMPLETE_CODE_REPLACEMENT_GUIDE.md（完整指南）
echo   - %TEMP%\QUICK_REFERENCE_CARD.md（快速参考）
echo.
echo 步骤4：完成文件修改后，按任意键继续提交和部署...
echo.

pause

echo.
echo [4/7] 添加所有更改到Git...
git add .
if %ERRORLEVEL% neq 0 (
    echo ❌ Git add 失败
    pause
    exit /b 1
)
echo ✅ Git add 成功
echo.

echo [5/7] 提交更改...
git commit -m "fix: 修复验证码导入错误和systemSettings表定义缺失"
if %ERRORLEVEL% neq 0 (
    echo ❌ Git commit 失败
    pause
    exit /b 1
)
echo ✅ Git commit 成功
echo.

echo [6/7] 推送到GitHub...
git push
if %ERRORLEVEL% neq 0 (
    echo ❌ Git push 失败
    pause
    exit /b 1
)
echo ✅ Git push 成功
echo.

echo [7/7] 部署到Vercel...
vercel --prod --yes
if %ERRORLEVEL% neq 0 (
    echo ❌ Vercel 部署失败
    pause
    exit /b 1
)
echo ✅ Vercel 部署成功
echo.

echo ========================================
echo ✅ 所有操作已完成！
echo ========================================
echo.
echo 请访问以下地址验证部署：
echo   - 超管端：https://admin.aizhixuan.com.cn
echo   - 用户端：https://www.aizhixuan.com.cn
echo.
echo 感谢使用！
pause
