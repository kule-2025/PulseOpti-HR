# ngrok 快速配置指南

> Authtoken: `38SsXQWvNJMl9FHBb1g9dnHW49q_7HFkQT2YyiPR1XxdJzea3`

## 🚀 一键启动（推荐）

**双击运行：`start-ngrok-quick.bat`**

这个脚本会自动：
1. ✅ 配置你的ngrok authtoken
2. ✅ 启动本地服务（如果未运行）
3. ✅ 启动ngrok内网穿透
4. ✅ 使用亚太区域（香港/新加坡，速度快）

---

## 📋 完整步骤

### Step 1：安装ngrok（如果未安装）

#### Windows用户
1. 访问：https://ngrok.com/download
2. 下载：`ngrok-stable-windows-amd64.zip`
3. 解压到目录，例如：`C:\ngrok\`
4. 添加到系统PATH：
   - 右键"此电脑" → 属性 → 高级系统设置 → 环境变量
   - 在"系统变量"中找到"Path"，点击"编辑"
   - 点击"新建"，添加 `C:\ngrok`
   - 点击"确定"保存

#### 验证安装
打开命令提示符（CMD），输入：
```batch
ngrok version
```
如果显示版本号，说明安装成功。

---

### Step 2：配置Authtoken

**Authtoken已经准备好：**
```
38SsXQWvNJMl9FHBb1g9dnHW49q_7HFkQT2YyiPR1XxdJzea3
```

**配置方法**（三选一）：

#### 方法1：使用配置脚本（推荐）
```batch
setup-ngrok.bat
```

#### 方法2：使用快速启动脚本
```batch
start-ngrok-quick.bat
```
（会自动配置authtoken）

#### 方法3：手动配置
打开CMD，运行：
```batch
ngrok config add-authtoken 38SsXQWvNJMl9FHBb1g9dnHW49q_7HFkQT2YyiPR1XxdJzea3
```

---

### Step 3：启动服务

#### 方法1：快速启动（推荐）
```batch
start-ngrok-quick.bat
```

#### 方法2：手动启动
```batch
# 先启动本地服务
pnpm run dev

# 另开一个CMD窗口，启动ngrok
ngrok http 5000 --region ap
```

---

### Step 4：获取公网URL

ngrok启动成功后，会显示类似信息：

```
Session Status                online
Forwarding                    https://abc1-123-45-67-89.ngrok-free.app -> http://localhost:5000
```

**复制 `Forwarding` 后面的HTTPS地址**，例如：
```
https://abc1-123-45-67-89.ngrok-free.app
```

这个URL就是你的公网访问地址，可以分享给任何人访问！

---

## 🌐 区域选择

| 区域代码 | 区域 | 延迟（从中国大陆） |
|----------|------|-------------------|
| **ap** | 亚太（香港/新加坡） | **推荐（50-100ms）** |
| us | 美国 | 150-300ms |
| eu | 欧洲 | 200-400ms |
| au | 澳大利亚 | 100-200ms |

**推荐使用 `ap` 区域**，访问速度最快。

修改区域：
```batch
ngrok http 5000 --region ap
```

---

## 🔧 高级功能

### 查看流量监控

访问：http://localhost:4040

可以查看：
- 实时请求列表
- 请求详情
- 响应时间
- 错误信息

### 自定义子域名（需要付费）

```batch
ngrok http 5000 --subdomain pulseopti-hr --region ap
```

访问地址：
```
https://pulseopti-hr.ngrok-free.app
```

### 持久化配置

创建配置文件 `ngrok.yml`：
```yaml
version: "2"
authtoken: 38SsXQWvNJMl9FHBb1g9dnHW49q_7HFkQT2YyiPR1XxdJzea3

tunnels:
  web:
    proto: http
    addr: 5000
    region: ap
    bind_tls: true
```

启动：
```batch
ngrok start web
```

---

## 📊 脚本对比

| 脚本 | 用途 | 特点 |
|------|------|------|
| `start-ngrok-quick.bat` | 一键启动 | 自动配置、自动启动服务 |
| `start-ngrok.bat` | 完整启动 | 选择区域、详细检查 |
| `setup-ngrok.bat` | 仅配置 | 配置authtoken、验证安装 |

---

## ❓ 常见问题

### Q1: ngrok提示 "authtoken invalid"？
**A**: 确保authtoken正确（区分大小写）：
```
38SsXQWvNJMl9FHBb1g9dnHW49q_7HFkQT2YyiPR1XxdJzea3
```

### Q2: 连接超时怎么办？
**A**:
1. 尝试更换区域：`--region ap`
2. 检查本地服务是否运行：http://localhost:5000
3. 重启ngrok

### Q3: 如何停止ngrok？
**A**: 在ngrok窗口按 `Ctrl+C`

### Q4: ngrok URL会变化吗？
**A**: 免费版每次启动URL会变化，付费版可以固定子域名。

### Q5: ngrok安全吗？
**A**: 
- ngrok提供HTTPS加密
- 可以设置密码保护（付费版）
- 建议仅临时使用，长期部署用Vercel

---

## 💡 使用建议

### 场景1：快速演示给客户
```batch
start-ngrok-quick.bat
```
复制URL发送给客户即可

### 场景2：长期项目分享
```batch
ngrok http 5000 --region ap
```
查看 http://localhost:4040 监控流量

### 场景3：测试生产环境
使用ngrok测试生产环境配置，然后部署到Vercel

---

## 🎯 下一步

1. **立即尝试**：双击 `start-ngrok-quick.bat`
2. **复制URL**：复制 `Forwarding` 地址
3. **分享访问**：发送给同事/客户测试

---

## 📞 技术支持

- ngrok官方文档：https://ngrok.com/docs
- 项目支持：PulseOptiHR@163.com

---

**现在就开始：双击 `start-ngrok-quick.bat`！**
