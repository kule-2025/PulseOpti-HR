# 完整代码修复指南 - 同步到本地

## 问题原因

本地文件与GitHub上的最新代码不一致，需要手动更新。

---

## 需要更新/创建的文件

### 1. 创建文件：src/lib/auth/verification.ts

**完整代码：**

```typescript
/**
 * 验证码管理工具
 *
 * 功能：
 * - 邮箱验证码生成、存储、验证
 * - 短信验证码生成、存储、验证
 * - 支持多种用途（登录、注册、重置密码）
 *
 * 注意：
 * - 当前使用内存存储（Map）
 * - 生产环境应使用Redis或其他持久化存储
 */

// 验证码存储（开发环境使用Map，生产环境应使用Redis）
const emailCodeStore = new Map<string, { code: string; expiresAt: number }>();
const smsCodeStore = new Map<string, { code: string; expiresAt: number }>();

/**
 * 生成验证码
 *
 * @returns 6位数字验证码
 */
function generateCode(): string {
  const isDev = process.env.NODE_ENV === 'development';
  // MVP阶段：开发环境使用固定验证码"123456"实现0成本
  return isDev ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 验证码存储键生成
 *
 * @param purpose 用途（login/register/reset）
 * @param identifier 标识符（邮箱/手机号）
 * @returns 存储键
 */
function getStoreKey(purpose: string, identifier: string): string {
  return `${purpose}:${identifier}`;
}

/**
 * 保存邮箱验证码
 *
 * @param email 邮箱
 * @param purpose 用途
 * @returns 验证码和过期时间
 */
export function saveEmailCode(email: string, purpose: string) {
  const code = generateCode();
  const now = Date.now();
  const key = getStoreKey(purpose, email);

  emailCodeStore.set(key, {
    code,
    expiresAt: now + 300000, // 5分钟有效期
  });

  return {
    code,
    expiresAt: now + 300000,
  };
}

/**
 * 保存短信验证码
 *
 * @param phone 手机号
 * @param purpose 用途
 * @returns 验证码和过期时间
 */
export function saveSmsCode(phone: string, purpose: string) {
  const code = generateCode();
  const now = Date.now();
  const key = getStoreKey(purpose, phone);

  smsCodeStore.set(key, {
    code,
    expiresAt: now + 300000, // 5分钟有效期
  });

  return {
    code,
    expiresAt: now + 300000,
  };
}

/**
 * 验证邮箱验证码
 *
 * @param email 邮箱
 * @param code 验证码
 * @param purpose 用途
 * @returns 验证是否成功
 */
export function verifyEmailCode(email: string, code: string, purpose: string): boolean {
  const key = getStoreKey(purpose, email);
  const stored = emailCodeStore.get(key);

  if (!stored) {
    return false;
  }

  // 检查是否过期
  if (Date.now() > stored.expiresAt) {
    emailCodeStore.delete(key);
    return false;
  }

  // 检查验证码是否匹配
  if (stored.code !== code) {
    return false;
  }

  // 验证成功后删除验证码
  emailCodeStore.delete(key);
  return true;
}

/**
 * 验证短信验证码
 *
 * @param phone 手机号
 * @param code 验证码
 * @param purpose 用途
 * @returns 验证是否成功
 */
export function verifySmsCode(phone: string, code: string, purpose: string): boolean {
  const key = getStoreKey(purpose, phone);
  const stored = smsCodeStore.get(key);

  if (!stored) {
    return false;
  }

  // 检查是否过期
  if (Date.now() > stored.expiresAt) {
    smsCodeStore.delete(key);
    return false;
  }

  // 检查验证码是否匹配
  if (stored.code !== code) {
    return false;
  }

  // 验证成功后删除验证码
  smsCodeStore.delete(key);
  return true;
}

/**
 * 检查邮箱验证码发送频率
 *
 * @param email 邮箱
 * @param purpose 用途
 * @returns 是否可以发送（false表示过于频繁）
 */
export function checkEmailRateLimit(email: string, purpose: string): boolean {
  const key = getStoreKey(purpose, email);
  const stored = emailCodeStore.get(key);
  const now = Date.now();

  // 60秒内不能重复发送
  if (stored && now - stored.expiresAt < -54000) {
    return false;
  }

  return true;
}

/**
 * 检查短信验证码发送频率
 *
 * @param phone 手机号
 * @param purpose 用途
 * @returns 是否可以发送（false表示过于频繁）
 */
export function checkSmsRateLimit(phone: string, purpose: string): boolean {
  const key = getStoreKey(purpose, phone);
  const stored = smsCodeStore.get(key);
  const now = Date.now();

  // 60秒内不能重复发送
  if (stored && now - stored.expiresAt < -54000) {
    return false;
  }

  return true;
}
```

---

### 2. 替换文件：src/app/api/auth/send-email/route.ts

**完整代码：**

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

### 3. 替换文件：src/app/api/auth/send-sms/route.ts

**完整代码：**

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

### 4. 修改文件：src/app/api/auth/register/email/route.ts

**只修改第9行：**

找到这一行：
```typescript
import { verifyEmailCode } from '../send-email/route';
```

替换为：
```typescript
import { verifyEmailCode } from '@/lib/auth/verification';
```

---

### 5. 修改文件：src/app/api/auth/register/sms/route.ts

**只修改第9行：**

找到这一行：
```typescript
import { verifySmsCode } from '../send-sms/route';
```

替换为：
```typescript
import { verifySmsCode } from '@/lib/auth/verification';
```

---

### 6. 修改文件：src/storage/database/shared/schema.ts

**在文件开头添加systemSettings表定义（在第一个表定义之前）：**

找到这一段（大约在第1-10行）：
```typescript
import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createSchemaFactory } from "drizzle-zod";
import { z } from "zod";

// ============ 企业表 ============
```

**在 `// ============ 企业表 ============` 之前添加：**

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

## 操作步骤

### 步骤1：打开文件

在C:\PulseOpti-HR目录下，使用记事本或VSCode打开以下文件：

1. `src\lib\auth\verification.ts`（如果不存在则创建）
2. `src\app\api\auth\send-email\route.ts`
3. `src\app\api\auth\send-sms\route.ts`
4. `src\app\api\auth\register\email\route.ts`
5. `src\app\api\auth\register\sms\route.ts`
6. `src\storage\database\shared\schema.ts`

### 步骤2：复制粘贴代码

按照上面的说明，将完整代码复制粘贴到对应文件中。

### 步骤3：保存所有文件

保存所有修改过的文件。

### 步骤4：提交和部署

在CMD中执行：

```cmd
git add -A
git commit -m "fix: 修复所有构建错误"
git push
vercel --prod --yes
```

---

## 验证修改

执行完后，Vercel构建应该会成功，不再出现那3个错误。

---

## 常见问题

### Q1：文件不存在怎么办？
**A**：对于 `src/lib/auth/verification.ts`，需要手动创建新文件。右键 → 新建文本文档 → 重命名为 `verification.ts`。

### Q2：如何找到需要修改的那一行？
**A**：使用记事本的"编辑"→"查找"功能，搜索 `import { verifyEmailCode } from '../send-email/route';`，然后替换它。

### Q3：修改后还是失败？
**A**：
1. 确认所有文件都已保存
2. 确认修改的是正确的文件（路径要对）
3. 运行 `git diff` 查看修改是否生效
4. 重新执行提交和部署命令

---

## 完整的一键命令

修改完所有文件后，执行：

```cmd
git add -A && git commit -m "fix: 修复所有构建错误" && git push && vercel --prod --yes
```
