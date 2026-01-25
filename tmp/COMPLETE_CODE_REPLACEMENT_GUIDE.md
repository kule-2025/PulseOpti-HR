# 完整代码替换指南

## 文件夹结构定位

请在您的 C:\PulseOpti-HR 项目目录中定位以下文件夹：

```
C:\PulseOpti-HR\
├── src\
│   ├── lib\
│   │   └── auth\                    [创建此文件夹]
│   │       └── verification.ts     [新建文件]
│   ├── app\
│   │   └── api\
│   │       └── auth\
│   │           ├── send-email\
│   │           │   └── route.ts    [替换整个文件]
│   │           ├── send-sms\
│   │           │   └── route.ts    [替换整个文件]
│   │           └── register\
│   │               ├── email\
│   │               │   └── route.ts [修改第9行]
│   │               └── sms\
│   │                   └── route.ts [修改第9行]
│   └── storage\
│       └── database\
│           └── shared\
│               └── schema.ts       [添加systemSettings表定义]
```

---

## 1. 新建文件：src/lib/auth/verification.ts

**完整代码：**

```typescript
// 验证码管理工具
import { getDb } from '@/lib/db/index';

export interface VerificationCode {
  code: string;
  expiresAt: Date;
  attempts: number;
}

// 验证码存储（内存缓存，生产环境应该使用Redis）
const verificationCodes = new Map<string, VerificationCode>();

// 频率限制存储
const rateLimits = new Map<string, { count: number; lastSent: Date }>();

// 验证码有效期（5分钟）
const CODE_EXPIRY = 5 * 60 * 1000;

// 频率限制（1分钟内最多发送1次）
const RATE_LIMIT = 60 * 1000;

/**
 * 保存邮箱验证码
 */
export async function saveEmailCode(email: string, code: string): Promise<void> {
  verificationCodes.set(email, {
    code,
    expiresAt: new Date(Date.now() + CODE_EXPIRY),
    attempts: 0
  });
}

/**
 * 保存短信验证码
 */
export async function saveSmsCode(phone: string, code: string): Promise<void> {
  verificationCodes.set(phone, {
    code,
    expiresAt: new Date(Date.now() + CODE_EXPIRY),
    attempts: 0
  });
}

/**
 * 验证邮箱验证码
 */
export async function verifyEmailCode(email: string, code: string): Promise<boolean> {
  const stored = verificationCodes.get(email);
  
  if (!stored) {
    return false;
  }

  // 检查是否过期
  if (Date.now() > stored.expiresAt.getTime()) {
    verificationCodes.delete(email);
    return false;
  }

  // 验证码正确
  if (stored.code === code) {
    verificationCodes.delete(email);
    return true;
  }

  // 验证码错误，增加尝试次数
  stored.attempts++;
  
  // 超过5次尝试，删除验证码
  if (stored.attempts >= 5) {
    verificationCodes.delete(email);
  }

  return false;
}

/**
 * 验证短信验证码
 */
export async function verifySmsCode(phone: string, code: string): Promise<boolean> {
  const stored = verificationCodes.get(phone);
  
  if (!stored) {
    return false;
  }

  // 检查是否过期
  if (Date.now() > stored.expiresAt.getTime()) {
    verificationCodes.delete(phone);
    return false;
  }

  // 验证码正确
  if (stored.code === code) {
    verificationCodes.delete(phone);
    return true;
  }

  // 验证码错误，增加尝试次数
  stored.attempts++;
  
  // 超过5次尝试，删除验证码
  if (stored.attempts >= 5) {
    verificationCodes.delete(phone);
  }

  return false;
}

/**
 * 检查邮箱发送频率限制
 */
export function checkEmailRateLimit(email: string): boolean {
  const now = Date.now();
  const last = rateLimits.get(email);
  
  if (!last) {
    rateLimits.set(email, { count: 1, lastSent: new Date() });
    return true;
  }

  // 1分钟内只能发送1次
  if (now - last.lastSent.getTime() < RATE_LIMIT) {
    return false;
  }

  // 更新记录
  rateLimits.set(email, { count: last.count + 1, lastSent: new Date() });
  return true;
}

/**
 * 检查短信发送频率限制
 */
export function checkSmsRateLimit(phone: string): boolean {
  const now = Date.now();
  const last = rateLimits.get(phone);
  
  if (!last) {
    rateLimits.set(phone, { count: 1, lastSent: new Date() });
    return true;
  }

  // 1分钟内只能发送1次
  if (now - last.lastSent.getTime() < RATE_LIMIT) {
    return false;
  }

  // 更新记录
  rateLimits.set(phone, { count: last.count + 1, lastSent: new Date() });
  return true;
}
```

---

## 2. 替换文件：src/app/api/auth/send-email/route.ts

**完整代码：**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/utils/email';
import { saveEmailCode, checkEmailRateLimit } from '@/lib/auth/verification';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: '邮箱地址不能为空' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 检查发送频率限制
    if (!checkEmailRateLimit(email)) {
      return NextResponse.json(
        { error: '发送频率过快，请1分钟后再试' },
        { status: 429 }
      );
    }

    // 生成6位数字验证码
    const code = crypto.randomInt(100000, 999999).toString();

    // 保存验证码
    await saveEmailCode(email, code);

    // 发送邮件
    const subject = 'PulseOpti HR 脉策聚效 - 验证码';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563EB;">欢迎使用 PulseOpti HR 脉策聚效</h2>
        <p>您的验证码是：</p>
        <p style="font-size: 32px; font-weight: bold; color: #7C3AED; letter-spacing: 5px; margin: 20px 0;">${code}</p>
        <p>验证码有效期为5分钟，请尽快使用。</p>
        <p style="color: #666; font-size: 14px;">如果这不是您的操作，请忽略此邮件。</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">
          PulseOpti HR 脉策聚效<br>
          邮箱：PulseOptiHR@163.com<br>
          地址：广州市天河区
        </p>
      </div>
    `;

    await sendEmail(email, subject, html);

    return NextResponse.json({
      success: true,
      message: '验证码发送成功'
    });

  } catch (error) {
    console.error('发送验证码失败:', error);
    return NextResponse.json(
      { error: '发送验证码失败，请稍后重试' },
      { status: 500 }
    );
  }
}
```

---

## 3. 替换文件：src/app/api/auth/send-sms/route.ts

**完整代码：**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { saveSmsCode, checkSmsRateLimit } from '@/lib/auth/verification';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { error: '手机号不能为空' },
        { status: 400 }
      );
    }

    // 验证手机号格式（中国大陆）
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: '手机号格式不正确' },
        { status: 400 }
      );
    }

    // 检查发送频率限制
    if (!checkSmsRateLimit(phone)) {
      return NextResponse.json(
        { error: '发送频率过快，请1分钟后再试' },
        { status: 429 }
      );
    }

    // 生成6位数字验证码
    const code = crypto.randomInt(100000, 999999).toString();

    // 保存验证码
    await saveSmsCode(phone, code);

    // TODO: 集成真实短信服务（阿里云/腾讯云）
    // 这里只是模拟发送，实际环境需要配置短信服务
    console.log(`【模拟短信】发送到 ${phone}，验证码：${code}`);

    return NextResponse.json({
      success: true,
      message: '验证码发送成功'
    });

  } catch (error) {
    console.error('发送验证码失败:', error);
    return NextResponse.json(
      { error: '发送验证码失败，请稍后重试' },
      { status: 500 }
    );
  }
}
```

---

## 4. 修改文件：src/app/api/auth/register/email/route.ts

**修改位置：第9行**

**原代码：**
```typescript
import { verifyEmailCode } from '@/app/api/auth/send-email/route';
```

**新代码：**
```typescript
import { verifyEmailCode } from '@/lib/auth/verification';
```

**完整文件代码：**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db/index';
import { verifyEmailCode } from '@/lib/auth/verification';
import { users, companies, departments } from '@/storage/database/shared/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, verificationCode } = body;

    // 验证必填字段
    if (!email || !password || !name || !verificationCode) {
      return NextResponse.json(
        { error: '所有字段都是必填的' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 验证密码强度
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度不能少于6位' },
        { status: 400 }
      );
    }

    // 验证验证码
    const isValidCode = await verifyEmailCode(email, verificationCode);
    if (!isValidCode) {
      return NextResponse.json(
        { error: '验证码错误或已过期' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 检查邮箱是否已注册
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 409 }
      );
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建公司
    const companyResult = await db.insert(companies).values({
      name: `${name}的公司`,
      plan: 'free',
      employeeLimit: 5,
      subAccountLimit: 0
    }).returning();

    const companyId = companyResult[0].id;

    // 创建默认部门
    const departmentResult = await db.insert(departments).values({
      companyId,
      name: '总经办',
      parentId: null
    }).returning();

    const departmentId = departmentResult[0].id;

    // 创建用户
    const userResult = await db.insert(users).values({
      email,
      password: hashedPassword,
      name,
      phone: '',
      companyId,
      departmentId,
      role: 'admin',
      status: 'active'
    }).returning();

    const user = userResult[0];

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      message: '注册成功',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('注册失败:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
```

---

## 5. 修改文件：src/app/api/auth/register/sms/route.ts

**修改位置：第9行**

**原代码：**
```typescript
import { verifySmsCode } from '@/app/api/auth/send-sms/route';
```

**新代码：**
```typescript
import { verifySmsCode } from '@/lib/auth/verification';
```

**完整文件代码：**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db/index';
import { verifySmsCode } from '@/lib/auth/verification';
import { users, companies, departments } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, password, name, verificationCode } = body;

    // 验证必填字段
    if (!phone || !password || !name || !verificationCode) {
      return NextResponse.json(
        { error: '所有字段都是必填的' },
        { status: 400 }
      );
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: '手机号格式不正确' },
        { status: 400 }
      );
    }

    // 验证密码强度
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度不能少于6位' },
        { status: 400 }
      );
    }

    // 验证验证码
    const isValidCode = await verifySmsCode(phone, verificationCode);
    if (!isValidCode) {
      return NextResponse.json(
        { error: '验证码错误或已过期' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 检查手机号是否已注册
    const existingUser = await db.query.users.findFirst({
      where: eq(users.phone, phone)
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '该手机号已被注册' },
        { status: 409 }
      );
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建公司
    const companyResult = await db.insert(companies).values({
      name: `${name}的公司`,
      plan: 'free',
      employeeLimit: 5,
      subAccountLimit: 0
    }).returning();

    const companyId = companyResult[0].id;

    // 创建默认部门
    const departmentResult = await db.insert(departments).values({
      companyId,
      name: '总经办',
      parentId: null
    }).returning();

    const departmentId = departmentResult[0].id;

    // 创建用户
    const userResult = await db.insert(users).values({
      email: '',
      password: hashedPassword,
      name,
      phone,
      companyId,
      departmentId,
      role: 'admin',
      status: 'active'
    }).returning();

    const user = userResult[0];

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      message: '注册成功',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('注册失败:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
```

---

## 6. 修改文件：src/storage/database/shared/schema.ts

**在文件末尾添加以下表定义：**

```typescript
// 系统设置表
export const systemSettings = pgTable('systemSettings', {
  id: serial('id').primaryKey(),
  siteName: varchar('siteName', { length: 255 }).notNull().default('PulseOpti HR 脉策聚效'),
  siteUrl: varchar('siteUrl', { length: 500 }).notNull(),
  logoUrl: varchar('logoUrl', { length: 500 }),
  enableRegistration: boolean('enableRegistration').notNull().default(true),
  maintenanceMode: boolean('maintenanceMode').notNull().default(false),
  supportEmail: varchar('supportEmail', { length: 255 }).notNull().default('PulseOptiHR@163.com'),
  supportPhone: varchar('supportPhone', { length: 20 }),
  address: varchar('address', { length: 500 }).notNull().default('广州市天河区'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Type inference
export type SystemSettings = typeof systemSettings.$inferSelect;
export type NewSystemSettings = typeof systemSettings.$inferInsert;
```

---

## 操作步骤

### 步骤1：创建文件夹结构

```cmd
cd C:\PulseOpti-HR
mkdir src\lib\auth
```

### 步骤2：创建和替换文件

1. 创建 `src\lib\auth\verification.ts`（复制上面第1部分的代码）
2. 替换 `src\app\api\auth\send-email\route.ts`（复制上面第2部分的代码）
3. 替换 `src\app\api\auth\send-sms\route.ts`（复制上面第3部分的代码）
4. 修改 `src\app\api\auth\register\email\route.ts`（只修改第9行导入语句）
5. 修改 `src\app\api\auth\register\sms\route.ts`（只修改第9行导入语句）
6. 修改 `src\storage\database\shared\schema.ts`（在文件末尾添加第6部分的代码）

### 步骤3：提交代码

```cmd
cd C:\PulseOpti-HR
git add .
git commit -m "fix: 修复验证码导入错误和systemSettings表定义缺失"
git push
```

### 步骤4：重新部署到Vercel

```cmd
vercel --prod --yes
```

### 步骤5：验证部署

访问 https://admin.aizhixuan.com.cn 查看超管端是否正常运行。

---

## 验证清单

- [ ] 创建了 `src/lib/auth/verification.ts` 文件
- [ ] 替换了 `src/app/api/auth/send-email/route.ts` 文件
- [ ] 替换了 `src/app/api/auth/send-sms/route.ts` 文件
- [ ] 修改了 `src/app/api/auth/register/email/route.ts` 第9行
- [ ] 修改了 `src/app/api/auth/register/sms/route.ts` 第9行
- [ ] 在 `src/storage/database/shared/schema.ts` 添加了 systemSettings 表定义
- [ ] 提交并推送到 GitHub
- [ ] Vercel 部署成功
- [ ] 访问 https://admin.aizhixuan.com.cn 验证超管端正常运行

---

## 常见问题

### Q1: 找不到 schema.ts 文件怎么办？

A: 文件路径是 `C:\PulseOpti-HR\src\storage\database\shared\schema.ts`，确保路径正确。

### Q2: 修改后 Vercel 仍然构建失败怎么办？

A: 确保所有文件都已正确保存，并且使用 `git push` 推送到 GitHub。Vercel 会自动触发新的构建。

### Q3: 如何确认修改已生效？

A: 在 Vercel 控制台查看构建日志，应该看到没有错误。同时访问超管端页面，应该能正常显示。
