# 部署前检查清单

## 环境变量检查

- [ ] `NODE_ENV` 设置为 `production`
- [ ] `NEXT_PUBLIC_API_URL` 设置为生产域名
- [ ] `DATABASE_URL` 设置为 Neon PostgreSQL 连接字符串
- [ ] `JWT_SECRET` 设置为强随机字符串（至少32位）
- [ ] `JWT_EXPIRES_IN` 设置为合理的过期时间（如 `7d`）
- [ ] `S3_ENDPOINT`、`S3_ACCESS_KEY_ID`、`S3_SECRET_ACCESS_KEY`、`S3_BUCKET`、`S3_REGION` 已配置
- [ ] `DOUBAO_API_KEY` 和 `DOUBAO_API_BASE` 已配置
- [ ] SMTP 配置已设置（`SMTP_HOST`、`SMTP_PORT`、`SMTP_USER`、`SMTP_PASS`、`SMTP_FROM`）
- [ ] 短信配置已设置（`SMS_ACCESS_KEY`、`SMS_SECRET_KEY`、`SMS_SIGN_NAME`）

## 数据库检查

- [ ] Neon 数据库已创建
- [ ] 数据库迁移脚本已执行（`database/migrations/001_initial_schema.sql`）
- [ ] 数据库连接测试通过
- [ ] 初始数据已导入（如有需要）

## 对象存储检查

- [ ] S3 存储桶已创建
- [ ] CORS 配置已设置
- [ ] 访问密钥已生成并配置
- [ ] 存储桶权限策略已配置

## 代码检查

- [ ] TypeScript 构建检查通过（`npx tsc --noEmit`）
- [ ] 所有测试通过（`node scripts/test-all.js`）
- [ ] 生产环境配置正确（`.env.production`）
- [ ] 敏感信息已移除
- [ ] 联系方式已统一为：
  - 邮箱：PulseOptiHR@163.com
  - 地址：广州市天河区
  - 服务时间：周一至周五 9:00-12:00, 14:00-18:00

## 安全检查

- [ ] 未登录用户无法访问 `/dashboard/*` 路径
- [ ] 首页隐藏超管后台入口
- [ ] API 路由都有适当的认证
- [ ] 密码加密（bcryptjs）
- [ ] JWT 验证正确
- [ ] XSS、SQL 注入防护已启用

## 性能检查

- [ ] 图片已优化
- [ ] 代码已压缩
- [ ] 缓存策略已配置
- [ ] 数据库索引已优化

## 监控和告警检查

- [ ] 日志系统已配置
- [ ] 错误监控已设置（如 Sentry）
- [ ] 性能监控已设置
- [ ] 告警规则已配置

## 文档检查

- [ ] README.md 已更新
- [ ] 部署文档已完成
- [ ] API 文档已完成（如需要）
- [ ] 用户手册已完成（如需要）

## 回滚计划

- [ ] 数据库备份已完成
- [ ] 代码版本已标记
- [ ] 回滚流程已测试
- [ ] 回滚时间窗口已确定

## 部署后验证

- [ ] 首页可正常访问
- [ ] 登录功能正常
- [ ] 主要功能模块可正常使用
- [ ] API 路由响应正常
- [ ] 数据库读写正常
- [ ] 文件上传下载正常
- [ ] 邮件和短信发送正常
- [ ] 监控和日志正常
