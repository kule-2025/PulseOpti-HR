# 提交更改并重新部署

## 问题原因

Vercel构建时使用的是缓存的旧代码，需要先提交并推送到GitHub。

## 立即执行

### 第1步：检查Git状态

```cmd
git status
```

### 第2步：添加所有更改

```cmd
git add .
```

### 第3步：提交更改

```cmd
git commit -m "fix: 修复3个构建错误（验证码导入和systemSettings表定义）"
```

### 第4步：推送到GitHub

```cmd
git push
```

### 第5步：重新部署

```cmd
vercel --prod --yes
```

---

## 一键执行（复制粘贴）

```cmd
git add . && git commit -m "fix: 修复构建错误" && git push && vercel --prod --yes
```

---

## 说明

Vercel会自动从GitHub拉取最新代码进行构建，所以必须先推送更改。

提交后Vercel会使用最新的代码进行部署。
