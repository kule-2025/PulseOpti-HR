# ⚡ 快速修复 Git Pull 错误

## 立即执行以下命令：

```cmd
cd C:\PulseOpti-HR
git fetch --all
git reset --hard origin/main
```

## 如果上面的命令失败，尝试：

```cmd
cd C:\PulseOpti-HR
git clean -fd
git fetch --all
git reset --hard origin/main
```

## 验证是否成功：

```cmd
git status
```

**预期输出：**
```
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

## 如果仍然失败，使用终极方案：

```cmd
cd C:\
rmdir /s /q PulseOpti-HR
git clone https://github.com/tomato-writer-2024/PulseOpti-HR.git PulseOpti-HR
cd PulseOpti-HR
pnpm install
```

---

**执行完上述命令后，告诉我结果！**
