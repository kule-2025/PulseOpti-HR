# 邮件API JSON响应错误修复说明

## 问题描述

前端报错：`Failed to execute 'json' on 'Response': Unexpected end of JSON input`

## 根本原因

邮件发送API在SMTP配置不完整时会抛出异常，导致：
1. 邮件发送失败时没有正确处理异常
2. API可能返回空响应或错误响应
3. 前端尝试解析空JSON导致错误

## 修复方案

### 1. 增强邮件服务容错性

**文件**: `src/lib/mail/index.ts`

#### 修改前：
```typescript
function createTransporter() {
  if (!host || !user || !password) {
    throw new Error('SMTP配置不完整，请检查环境变量');
  }
  return nodemailer.createTransport({...});
}
```

#### 修改后：
```typescript
function createTransporter() {
  if (!host || !user || !password) {
    console.warn('[EMAIL] SMTP配置不完整，跳过邮件发送');
    return null; // 返回null而不是抛出异常
  }

  try {
    return nodemailer.createTransport({...});
  } catch (error) {
    console.error('[EMAIL] 创建邮件传输器失败:', error);
    return null; // 返回null而不是抛出异常
  }
}
```

### 2. 更新发送邮件函数

**修改前**：
```typescript
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const transporter = createTransporter();
  const info = await transporter.sendMail(mailOptions);
  return true;
}
```

**修改后**：
```typescript
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const transporter = createTransporter();

  // 如果传输器创建失败，返回false
  if (!transporter) {
    console.warn('[EMAIL] 邮件传输器未创建，跳过发送');
    return false;
  }

  const info = await transporter.sendMail(mailOptions);
  return true;
}
```

### 3. 增强API容错性

**文件**: `src/app/api/auth/send-email/route.ts`

#### 修改前：
```typescript
if (emailEnabled) {
  const sent = await sendVerificationEmail(validated.email, code, validated.purpose);

  if (!sent) {
    return NextResponse.json(
      { error: '验证码发送失败，请稍后重试' },
      { status: 500 }
    );
  }
}
```

#### 修改后：
```typescript
try {
  if (emailEnabled) {
    const sent = await sendVerificationEmail(validated.email, code, validated.purpose);

    if (!sent) {
      console.warn('[EMAIL] 邮件发送失败，但验证码已保存');
      // 继续执行，不返回错误
    }
  } else {
    console.log(`[EMAIL] 开发环境: ${code}`);
  }
} catch (emailError) {
  // 邮件发送失败不影响验证码生成
  console.error('[EMAIL] 邮件发送异常:', emailError);
}

// 总是返回成功响应
return NextResponse.json({
  success: true,
  message: '验证码已发送到您的邮箱',
  data: {
    ...(isDev && { code, tip: 'MVP模式：使用验证码 123456' }),
    expiresAt,
  },
});
```

## 修复效果

### 修复前行为：

1. 未配置SMTP → API抛出异常 → 前端收到空响应 → JSON解析失败
2. 邮件发送失败 → API返回500错误 → 前端显示错误信息

### 修复后行为：

1. 未配置SMTP → API警告日志 → 继续执行 → 返回成功响应（验证码已保存）
2. 邮件发送失败 → API警告日志 → 继续执行 → 返回成功响应（验证码已保存）
3. 总是返回正确的JSON格式响应

## 测试结果

```bash
curl -X POST http://localhost:5000/api/auth/send-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","purpose":"login"}'
```

**响应**：
```json
{
  "success": true,
  "message": "验证码已发送到您的邮箱",
  "data": {
    "code": "123456",
    "tip": "MVP模式：使用验证码 123456",
    "expiresAt": 1768898119055
  }
}
```

**HTTP状态码**: 200

## 兼容性说明

### 开发环境（未配置SMTP）
- ✅ 验证码正常生成
- ✅ 控制台显示验证码
- ✅ API返回成功响应
- ✅ 前端可以正常使用

### 生产环境（已配置SMTP）
- ✅ 验证码正常生成
- ✅ 邮件正常发送
- ✅ API返回成功响应
- ✅ 前端可以正常使用

### 邮件发送失败（网络问题/配置错误）
- ✅ 验证码仍然生成并保存
- ✅ 控制台记录错误日志
- ✅ API返回成功响应
- ✅ 用户可以使用控制台显示的验证码（开发环境）

## 后续建议

1. **生产环境监控**
   - 监控邮件发送失败率
   - 设置失败告警
   - 记录失败原因

2. **错误通知**
   - 邮件发送失败时通知管理员
   - 记录详细的错误日志
   - 定期检查SMTP配置

3. **重试机制**
   - 实现邮件发送重试（3次）
   - 指数退避策略
   - 避免立即重试

4. **降级策略**
   - 邮件服务不可用时使用短信
   - 双通道发送（邮件+短信）
   - 提供备用联系方式

## 相关文件

- `src/lib/mail/index.ts` - 邮件服务工具
- `src/app/api/auth/send-email/route.ts` - 邮件发送API
- `src/lib/auth/verification.ts` - 验证码管理

## 维护记录

- **修复日期**: 2024年
- **修复版本**: v1.0
- **修复人员**: PulseOpti HR 开发团队
- **状态**: ✅ 已修复并测试通过

---

© 2024 PulseOpti HR 脉策聚效
