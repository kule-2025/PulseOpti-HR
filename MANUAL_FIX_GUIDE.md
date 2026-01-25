# 手动修复构建错误指南

## 问题诊断

沙箱中的文件已修复，但你本地（C:\PulseOpti-HR）的文件可能还是旧的。

## 需要手动修改的文件

### 文件1：src/app/api/auth/register/email/route.ts

**第9行，修改导入：**

从：
```typescript
import { verifyEmailCode } from '../send-email/route';
```

改为：
```typescript
import { verifyEmailCode } from '@/lib/auth/verification';
```

---

### 文件2：src/app/api/auth/register/sms/route.ts

**第9行，修改导入：**

从：
```typescript
import { verifySmsCode } from '../send-sms/route';
```

改为：
```typescript
import { verifySmsCode } from '@/lib/auth/verification';
```

---

### 文件3：src/storage/database/shared/schema.ts

**在文件开头添加（在 "import from" 语句之后，第一个表定义之前）：**

```typescript
// ============ 系统设置表 ============
export const systemSettings = pgTable(
  "system_settings",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    siteName: varchar("site_name", { length: 255 }).notNull().default("PulseOpti HR 脉策聚效"),
    siteUrl: varchar("site_url", { length: 500 }),
    logoUrl: text("logo_url"),
    faviconUrl: text("favicon_url"),
    enableRegistration: boolean("enable_registration").notNull().default(true),
    enableEmailVerification: boolean("enable_email_verification").notNull().default(true),
    enableSmsVerification: boolean("enable_sms_verification").notNull().default(true),
    enableAuditLogs: boolean("enable_audit_logs").notNull().default(true),
    enableNotifications: boolean("enable_notifications").notNull().default(true),
    maintenanceMode: boolean("maintenance_mode").notNull().default(false),
    maintenanceMessage: text("maintenance_message"),
    contactEmail: varchar("contact_email", { length: 255 }),
    contactPhone: varchar("contact_phone", { length: 20 }),
    contactAddress: text("contact_address"),
    customCss: text("custom_css"),
    customJs: text("custom_js"),
    privacyPolicyUrl: text("privacy_policy_url"),
    termsOfServiceUrl: text("terms_of_service_url"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  }
);
```

---

### 文件4：src/app/api/auth/send-email/route.ts

**替换整个文件内容为：**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { saveEmailCode, checkEmailRateLimit } from '@/lib/auth/verification';

// 请求Schema
const sendEmailSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  purpose: z.enum(['login', 'register', 'reset']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = sendEmailSchema.parse(body);

    // MVP阶段：开发环境0成本方案，跳过频率限制
    const isDev = process.env.NODE_ENV === 'development';

    if (!isDev) {
      // 生产环境：检查频率限制（60秒内只能发送一次）
      if (!checkEmailRateLimit(validated.email, validated.purpose)) {
        return NextResponse.json(
          { error: '验证码发送过于频繁，请稍后再试' },
          { status: 429 }
        );
      }
    }

    // 生成并保存验证码
    const { code, expiresAt } = saveEmailCode(validated.email, validated.purpose);

    // TODO: 生产环境集成真实的邮件服务（如阿里云邮件、SendGrid、Nodemailer）
    // 这里使用模拟发送，实际调用邮件服务API
    console.log(`[EMAIL] 发送验证码到 ${validated.email} (用途: ${validated.purpose}): ${code}`);

    // 模拟邮件发送成功
    // await sendEmail(validated.email, 'PulseOpti HR - 验证码', `您的验证码是${code}，5分钟内有效。`);

    return NextResponse.json({
      success: true,
      message: '验证码已发送到您的邮箱',
      data: {
        // 开发环境返回验证码，生产环境应删除
        ...(isDev && { code, tip: 'MVP模式：使用验证码 123456' }),
        expiresAt,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('发送邮件验证码错误:', error);
    return NextResponse.json(
      { error: '发送失败，请稍后重试' },
      { status: 500 }
    );
  }
}
```

---

### 文件5：src/app/api/auth/send-sms/route.ts

**替换整个文件内容为：**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { saveSmsCode, checkSmsRateLimit } from '@/lib/auth/verification';

// 请求Schema
const sendSmsSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  purpose: z.enum(['login', 'register', 'reset']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = sendSmsSchema.parse(body);

    // MVP阶段：开发环境0成本方案，跳过频率限制
    const isDev = process.env.NODE_ENV === 'development';

    if (!isDev) {
      // 生产环境：检查频率限制（60秒内只能发送一次）
      if (!checkSmsRateLimit(validated.phone, validated.purpose)) {
        return NextResponse.json(
          { error: '验证码发送过于频繁，请稍后再试' },
          { status: 429 }
        );
      }
    }

    // 生成并保存验证码
    const { code, expiresAt } = saveSmsCode(validated.phone, validated.purpose);

    // TODO: 生产环境集成真实的短信服务（如阿里云SMS、腾讯云SMS）
    // 这里使用模拟发送，实际调用短信服务API
    console.log(`[SMS] 发送验证码到 ${validated.phone} (用途: ${validated.purpose}): ${code}`);

    // 模拟短信发送成功
    // await sendSms(validated.phone, `您的验证码是${code}，5分钟内有效。`);

    return NextResponse.json({
      success: true,
      message: '验证码已发送',
      data: {
        // 开发环境返回验证码，生产环境应删除
        ...(isDev && { code, tip: 'MVP模式：使用验证码 123456' }),
        expiresAt,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('发送短信验证码错误:', error);
    return NextResponse.json(
      { error: '发送失败，请稍后重试' },
      { status: 500 }
    );
  }
}
```

---

## 修改完成后

执行以下命令提交和部署：

```cmd
git add -A
git commit -m "fix: 手动修复构建错误"
git push
vercel --prod --yes
```

---

## 或者使用一键脚本

```cmd
git add -A && git commit -m "fix: 手动修复构建错误" && git push && vercel --prod --yes
```

---

## 重要提示

- 使用记事本、VSCode或其他文本编辑器打开文件
- 按照上面的说明逐个修改文件
- 保存所有修改后再执行Git命令
