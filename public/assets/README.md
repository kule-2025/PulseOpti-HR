# 微信二维码说明

## 当前状态

✅ 已替换为真实的微信二维码（PNG格式，70KB）

## 二维码信息

- **文件路径**: `public/assets/wechat-qr.png`
- **文件格式**: PNG
- **文件大小**: 70KB
- **使用位置**: `src/app/page.tsx` 页脚区域

## 如何更新二维码

### 方法1：替换PNG文件（最简单）

1. 使用微信生成新的二维码
2. 保存为PNG格式
3. 重命名为 `wechat-qr.png`
4. 覆盖 `public/assets/wechat-qr.png` 文件

### 方法2：更换为SVG格式

1. 使用在线二维码生成器（如：https://cli.im/、https://www.wwei.cn/）生成你的微信二维码
2. 下载为SVG格式
3. 将文件重命名为 `wechat-qr.svg`
4. 替换 `public/assets/wechat-qr.svg` 文件
5. 修改 `src/app/page.tsx` 第561行，将 `.png` 改为 `.svg`

## 推荐的二维码生成工具

1. **联图二维码生成器**: https://cli.im/
2. **草料二维码**: https://www.wwei.cn/
3. **微信官方生成器**: 在微信中 → 设置 → 我的二维码 → 保存图片

## 注意事项

- 建议二维码尺寸不小于 200x200 像素，确保清晰可扫描
- 使用SVG格式可以获得更好的显示效果和加载性能
- 确保二维码中的微信号或二维码可以正常使用
