# Vercel设备授权操作指引

## 当前状态

你正在使用Vercel设备授权方式登录，设备代码：**QDBL-HJDN**

---

## 立即操作（3步完成）

### 第1步：打开浏览器授权页面

**方法A（推荐）**：按回车键自动打开浏览器
```
直接按 [ENTER] 键
```

**方法B**：手动复制链接打开
```
访问：https://vercel.com/oauth/device?user_code=QDBL-HJDN
```

### 第2步：输入设备代码

在打开的页面中：
1. 你会看到设备代码输入框
2. 输入代码：**QDBL-HJDN**
3. 点击 "Continue" 或 "继续" 按钮

### 第3步：授权Vercel访问

1. 选择登录方式：**GitHub**
2. 使用你的 GitHub 账号登录（tomato-writer-2024）
3. 授权 Vercel CLI 访问你的账户
4. 看到授权成功页面

---

## 授权成功后的操作

授权成功后，CMD窗口会自动显示：

```
✓ Success! Logged in as tomato-writer-2024
```

然后脚本会自动继续执行后续部署步骤。

---

## 如果脚本没有自动继续

如果授权成功但脚本仍在等待：

### 方案1：按回车键继续
```
直接按 [ENTER] 键
```

### 方案2：停止并重新运行
```
1. 按 Ctrl+C 停止当前脚本
2. 运行快速部署脚本：
   deploy-admin-express.bat
```

### 方案3：手动部署
```cmd
vercel whoami  # 验证登录状态
vercel --prod --yes  # 直接部署
```

---

## 常见问题

### Q1：按回车键后浏览器没有打开怎么办？
**A**：复制链接 https://vercel.com/oauth/device?user_code=QDBL-HJDN 手动在浏览器中打开。

### Q2：输入设备代码后提示"代码已过期"怎么办？
**A**：
1. 在CMD窗口按 `Ctrl+C` 停止
2. 重新执行 `vercel login`
3. 会获得新的设备代码
4. 立即在浏览器中输入新代码（有效期通常5-10分钟）

### Q3：GitHub授权后显示"授权被拒绝"怎么办？
**A**：
1. 确保使用的是正确的GitHub账号（tomato-writer-2024）
2. 检查Vercel账户是否已创建
3. 重新尝试授权流程

### Q4：授权成功但CMD仍在等待？
**A**：按回车键，或按Ctrl+C停止后运行 `deploy-admin-express.bat`

---

## 快速操作流程

```
1. 按 [ENTER] 键
   ↓
2. 浏览器打开授权页面
   ↓
3. 输入设备代码：QDBL-HJDN
   ↓
4. 选择GitHub登录
   ↓
5. 授权Vercel访问
   ↓
6. 返回CMD窗口
   ↓
7. 看到登录成功提示
   ↓
8. 脚本自动继续部署
```

---

## 授权成功后的预期输出

```
Waiting for authentication...
✓ Success! Logged in as tomato-writer-2024

[步骤 2/10] 检查 Vercel 登录状态...
✅ 已登录Vercel

[步骤 3/10] 准备部署...
...
```

---

## 下一步

授权成功并登录后：

1. 脚本会自动继续执行部署
2. 等待部署完成（约3-5分钟）
3. 配置DNS记录：admin → cname.vercel-dns.com
4. 访问超管端：https://admin.aizhixuan.com.cn

---

## 验证登录状态

任何时候都可以验证登录状态：

```cmd
vercel whoami
```

输出：
```
tomato-writer-2024
```

---

## 如果遇到问题

### 超时/卡住
- 按 Ctrl+C 停止
- 运行：`vercel login` 重新登录
- 或运行：`deploy-admin-express.bat`

### 授权失败
- 确认GitHub账号正确
- 检查网络连接
- 尝试重新授权

### 部署失败
- 检查登录状态：`vercel whoami`
- 查看错误信息
- 尝试手动部署：`vercel --prod --yes`

---

## 当前需要做的

**立即执行**：

1. **按 [ENTER] 键**（让Vercel CLI自动打开浏览器）

或

2. **手动访问**：https://vercel.com/oauth/device?user_code=QDBL-HJDN

3. **输入代码**：QDBL-HJDN

4. **完成授权**

5. **等待脚本继续执行**

---

准备好了吗？现在按回车键开始授权吧！
