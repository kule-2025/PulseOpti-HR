# 快速参考 - 需要修改的文件清单

## 文件清单

1. ✏️ **创建**：`src/lib/auth/verification.ts`
2. 🔄 **替换**：`src/app/api/auth/send-email/route.ts`
3. 🔄 **替换**：`src/app/api/auth/send-sms/route.ts`
4. ✏️ **修改第9行**：`src/app/api/auth/register/email/route.ts`
5. ✏️ **修改第9行**：`src/app/api/auth/register/sms/route.ts`
6. ✏️ **添加表定义**：`src/storage/database/shared/schema.ts`

---

## 完整代码位置

所有完整代码都在这个文件中：`COMPLETE_FIX_GUIDE.md`

---

## 快速操作

### 方式1：查看完整指南
```cmd
notepad COMPLETE_FIX_GUIDE.md
```

### 方式2：运行辅助脚本
```cmd
fix-build-errors.bat
```

### 方式3：手动操作
1. 用记事本打开 `COMPLETE_FIX_GUIDE.md`
2. 复制对应的完整代码
3. 粘贴到对应文件
4. 保存所有文件
5. 执行提交命令

---

## 提交和部署

```cmd
git add -A && git commit -m "fix: 修复所有构建错误" && git push && vercel --prod --yes
```

---

## 预期结果

修改完成后，Vercel构建应该成功，不再出现以下3个错误：

1. ✅ `Can't resolve '../send-email/route'`
2. ✅ `Can't resolve '../send-sms/route'`
3. ✅ `Export systemSettings doesn't exist`

---

## 重要提示

- 所有代码都在 `COMPLETE_FIX_GUIDE.md` 文件中
- 请仔细阅读指南中的每个步骤
- 确保修改的是正确的文件和位置
- 修改完成后务必保存文件
