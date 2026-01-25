# 推送代码到 tomato-ai-writer/pulseopti-hr 仓库

## 当前状态

### 现有远程仓库
- **origin**: `tomato-writer-2024/PulseOpti-HR`

### 目标仓库
- **tomato-ai-writer/pulseopti-hr`

## 步骤

### 步骤 1: 添加远程仓库

```bash
git remote add tomato-ai-writer https://github.com/tomato-ai-writer/pulseopti-hr.git
```

### 步骤 2: 验证远程仓库

```bash
git remote -v
```

### 步骤 3: 推送代码

```bash
git push tomato-ai-writer main
```

### 步骤 4: 验证推送

```bash
git log tomato-ai-writer/main -1 --oneline
```

---

## 完整命令

```bash
# 添加远程仓库
git remote add tomato-ai-writer https://github.com/tomato-ai-writer/pulseopti-hr.git

# 推送代码
git push tomato-ai-writer main

# 验证
git log tomato-ai-writer/main -1 --oneline
```

---

## 注意事项

如果远程仓库已存在，使用：

```bash
# 更新远程仓库 URL
git remote set-url tomato-ai-writer https://github.com/tomato-ai-writer/pulseopti-hr.git

# 推送代码
git push tomato-ai-writer main
```

---

## 推送完成后

- 访问：https://github.com/tomato-ai-writer/pulseopti-hr
- 验证所有文件已推送
- 检查最新的 commit: db43935
