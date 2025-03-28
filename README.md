# 护眼小助手

一款Windows桌面应用，帮助用户定时休息，保护视力健康。

## 功能特点

- **定时提醒系统**：自定义工作和休息时间，倒计时结束后自动触发休息提醒
- **全屏提醒**：休息时显示全屏提醒，确保用户真正休息眼睛
- **浏览器视频控制**：自动暂停Edge浏览器中播放的bilibili视频（非直播）
- **玻璃态设计**：采用现代化的半透明磨砂UI效果
- **用户友好界面**：简洁直观的操作方式，美观的视觉设计

## 技术栈

- **框架**：Electron + React + TypeScript
- **UI构建**：React + CSS
- **构建工具**：Vite
- **浏览器交互**：Chrome DevTools Protocol

## 安装与使用

### 开发环境

1. 克隆仓库
   ```
   git clone https://github.com/195376970/eye-protection-assistant.git
   cd eye-protection-assistant
   ```

2. 安装依赖
   ```
   npm install
   ```

3. 启动开发服务器
   ```
   npm run dev
   ```

### 构建应用

```
npm run build
npm run package
```

构建完成的应用将位于`dist`目录中。

## 使用说明

1. 设置工作时间和休息时间
2. 点击"开始"按钮，应用将开始计时
3. 工作时间结束后，会弹出全屏休息提醒
4. 休息时间结束后，提醒自动关闭，可以继续工作

## 注意事项

- 视频控制功能仅支持Edge浏览器中的bilibili视频页面
- 要使用视频控制功能，Edge浏览器需要以调试模式启动
- 应用仅支持Windows操作系统

## 许可证

MIT License