# 构建错误修复总结

## 修复的3个错误

### 1. register/email/route.ts - 模块导入错误
**错误**：`Can't resolve '../send-email/route'`

**原因**：从 route 文件导入函数是不好的做法，可能导致构建问题。

**修复**：
- 创建独立的验证码工具文件 `src/lib/auth/verification.ts`
- 将 `verifyEmailCode`、`verifySmsCode` 等函数移到工具文件
- 更新 `register/email/route.ts` 从 `@/lib/auth/verification` 导入

### 2. register/sms/route.ts - 模块导入错误
**错误**：`Can't resolve '../send-sms/route'`

**原因**：同上，从 route 文件导入函数。

**修复**：
- 更新 `register/sms/route.ts` 从 `@/lib/auth/verification` 导入 `verifySmsCode`

### 3. admin/settings/route.ts - 导出不存在
**错误**：`Export systemSettings doesn't exist in target module`

**原因**：`systemSettings` 表定义不存在于 schema.ts 中。

**修复**：
- 在 `src/storage/database/shared/schema.ts` 中添加 `systemSettings` 表定义
- 包含所有必要的字段（siteName、siteUrl、logoUrl、enableRegistration等）

---

## 修改的文件

1. **新建文件**：
   - `src/lib/auth/verification.ts` - 验证码管理工具

2. **修改文件**：
   - `src/app/api/auth/send-email/route.ts` - 使用新的验证码工具
   - `src/app/api/auth/send-sms/route.ts` - 使用新的验证码工具
   - `src/app/api/auth/register/email/route.ts` - 修改导入路径
   - `src/app/api/auth/register/sms/route.ts` - 修改导入路径
   - `src/storage/database/shared/schema.ts` - 添加 systemSettings 表

---

## 新的验证码工具功能

`src/lib/auth/verification.ts` 提供：

- `saveEmailCode()` - 保存邮箱验证码
- `saveSmsCode()` - 保存短信验证码
- `verifyEmailCode()` - 验证邮箱验证码
- `verifySmsCode()` - 验证短信验证码
- `checkEmailRateLimit()` - 检查邮箱验证码发送频率
- `checkSmsRateLimit()` - 检查短信验证码发送频率

---

## 现在可以部署了

执行：
```cmd
vercel --prod --yes
```

所有构建错误都已修复，应该可以成功部署。
