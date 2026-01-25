# PulseOpti HR - 快速启动指南

## ⚡ 3 分钟快速部署

### 步骤 1：准备环境（30 秒）

```powershell
# 确保已安装 Node.js 和 pnpm
node --version
pnpm --version
```

如果没有，先安装：
```powershell
npm install -g pnpm
```

### 步骤 2：运行一键部署（2 分钟）

```powershell
# 进入项目目录
cd C:\PulseOpti-HR\PulseOpti-HR

# 运行一键部署脚本
.\deploy-vercel.bat
```

### 步骤 3：配置 Vercel（1 分钟）

在新窗口中执行：

```powershell
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 链接项目
vercel link

# 快速配置环境变量
.\setup-vercel-env.bat

# 部署到生产环境
vercel --prod
```

## ✅ 部署成功！

访问：https://pulseopti-hr.vercel.app

---

## 📚 详细文档

- **完整部署指南**: `VERCEL_DEPLOYMENT_GUIDE.md`
- **部署总结**: `DEPLOYMENT_SUMMARY.md`

## 🆘 遇到问题？

### 常见问题

**Q: 脚本执行失败？**
A: 确保以管理员身份运行 PowerShell

**Q: Vercel 登录失败？**
A: 检查网络连接，尝试使用 GitHub 登录

**Q: 环境变量配置失败？**
A: 手动逐个配置，参考 `VERCEL_DEPLOYMENT_GUIDE.md`

## 🔗 重要链接

- **生产环境**: https://pulseopti-hr.vercel.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub 仓库**: https://github.com/tomato-writer-2024/PulseOpti-HR

## 📞 联系支持

- **邮箱**: PulseOptiHR@163.com
- **地址**: 广州市天河区

---

祝使用愉快！🎉
