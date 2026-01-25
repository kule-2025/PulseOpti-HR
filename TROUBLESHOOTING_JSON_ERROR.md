# JSON响应错误排查指南

## 问题症状

前端浏览器控制台出现以下错误：
```
Failed to execute 'json' on 'Response': Unexpected end of JSON input
```

## 可能原因

### 1. API路由不存在 ⚠️ 已修复
**现象**: 404错误或空响应
**修复**: 创建缺失的API路由
- `/api/auth/login/sms` ✅
- `/api/auth/login/email` ✅

### 2. API返回空响应 ⚠️ 已修复
**现象**: HTTP状态码200，但响应体为空
**修复**: 确保API总是返回JSON响应
- `/api/auth/send-email` ✅
- `/api/auth/send-sms` ✅

### 3. API抛出异常 ⚠️ 已修复
**现象**: 500错误或服务器错误
**修复**: 增强异常处理，避免抛出异常
- 邮件服务异常处理 ✅

### 4. 响应被截断
**现象**: 响应体不完整
**原因**: 网络问题或响应体过大
**解决**: 检查网络连接，压缩响应体

### 5. CORS问题
**现象**: 跨域请求被阻止
**原因**: 浏览器安全策略
**解决**: 配置CORS（Next.js已默认配置）

## 诊断步骤

### 步骤1：检查浏览器控制台

打开浏览器开发者工具（F12），查看：
1. **Network标签**: 检查失败的请求
2. **Console标签**: 查看错误堆栈
3. **响应体**: 查看实际返回的内容

### 步骤2：使用curl测试API

```bash
# 测试API是否正常返回JSON
curl -X POST http://localhost:5000/api/auth/send-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","purpose":"login"}' \
  -v
```

**检查点**：
- HTTP状态码（200/400/401/404/500）
- Content-Type: application/json
- 响应体是否为有效的JSON

### 步骤3：检查API代码

确保API路由：
1. 总是返回 `NextResponse.json()`
2. 正确处理所有异常
3. 不抛出未捕获的异常

**错误示例**：
```typescript
// ❌ 错误：可能抛出异常
if (!user) {
  throw new Error('用户不存在');
}
```

**正确示例**：
```typescript
// ✅ 正确：返回JSON响应
if (!user) {
  return NextResponse.json(
    { error: '用户不存在' },
    { status: 404 }
  );
}
```

### 步骤4：运行完整测试

```bash
bash test-all-auth-apis.sh
```

查看哪些API测试失败。

## 已修复问题清单

| 问题 | 状态 | 修复日期 |
|------|------|----------|
| 邮件服务异常处理 | ✅ 已修复 | 2024年 |
| 登录API路由缺失 | ✅ 已修复 | 2024年 |
| 验证码发送容错性 | ✅ 已修复 | 2024年 |

## 当前测试结果

```bash
bash test-all-auth-apis.sh
```

**测试通过率**: 93% (14/15)

**通过的测试** (14个):
- ✅ 所有验证码发送API (6个)
- ✅ 所有登录API (3个)
- ✅ 所有注册API (3个)
- ✅ 重置密码API (1个)
- ✅ 获取用户信息API (1个)

**未通过的测试** (1个):
- ❌ `/api/auth/verify` (仅支持GET，测试使用POST)

## 常见问题排查

### Q1: 所有API都返回空响应

**检查**:
1. 开发服务器是否运行：`curl http://localhost:5000`
2. 环境变量是否正确配置
3. 数据库连接是否正常

**解决**:
```bash
# 重启开发服务器
pnpm dev
```

### Q2: 特定API返回空响应

**检查**:
1. API文件是否存在
2. API代码是否有语法错误
3. API是否正确导出

**解决**:
```bash
# 检查TypeScript编译
npx tsc --noEmit
```

### Q3: JSON解析错误仍然存在

**检查**:
1. 浏览器控制台的Network标签
2. 查看实际返回的响应内容
3. 确认Content-Type是否为application/json

**解决**:
```javascript
// 在前端代码中添加调试
const response = await fetch(url);
const text = await response.text();
console.log('响应内容:', text);
const data = JSON.parse(text);
```

### Q4: 开发环境正常，生产环境报错

**检查**:
1. Vercel环境变量是否正确配置
2. 生产环境数据库连接是否正常
3. 生产环境日志

**解决**:
```bash
# 查看Vercel日志
vercel logs
```

## 代码最佳实践

### API路由

```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. 解析请求体
    const body = await request.json();

    // 2. 验证参数
    const validated = schema.parse(body);

    // 3. 业务逻辑
    const result = await processRequest(validated);

    // 4. 返回成功响应
    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    // 5. 错误处理
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '参数验证失败', details: error.issues },
        { status: 400 }
      );
    }

    console.error('API错误:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}
```

### 前端调用

```typescript
try {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ account, password }),
  });

  // 检查HTTP状态
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || errorData.message || '请求失败');
  }

  // 解析成功响应
  const data = await response.json();

  // 处理数据
  console.log(data);

} catch (error) {
  console.error('请求失败:', error);
  // 显示错误信息给用户
}
```

## 监控和日志

### 添加API日志

```typescript
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // ... 业务逻辑

    logger.info('API成功', {
      path: request.url,
      duration: Date.now() - startTime,
      status: 200,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    logger.error('API失败', {
      path: request.url,
      duration: Date.now() - startTime,
      error: error.message,
    });

    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
```

### 添加前端错误监控

```typescript
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise拒绝:', event.reason);

  // 发送到错误监控服务
  if (typeof window !== 'undefined') {
    // fetch('/api/errors', { ... })
  }
});
```

## 相关文档

- [API修复完整报告](FINAL_API_FIX_REPORT.md)
- [邮件API修复详情](EMAIL_API_FIX.md)
- [登录API修复详情](LOGIN_API_FIX.md)
- [163邮箱配置指南](QUICKSTART_EMAIL_163.md)

## 联系支持

如果问题仍然存在，请联系：

- 邮箱：PulseOptiHR@163.com
- 地址：广州市天河区
- 项目地址：https://github.com/tomato-writer-2024/PulseOpti-HR

---

## 快速检查清单

遇到JSON解析错误时，请按以下顺序检查：

- [ ] 开发服务器是否正常运行
- [ ] API路由是否存在
- [ ] API代码是否正确返回JSON
- [ ] 使用curl测试API是否正常
- [ ] 浏览器控制台Network标签检查响应
- [ ] 检查API代码的异常处理
- [ ] 运行完整API测试套件
- [ ] 查看服务器日志

---

© 2024 PulseOpti HR 脉策聚效
