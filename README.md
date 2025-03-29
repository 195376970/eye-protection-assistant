# 护眼小助手 (Eye Protection Assistant)

> 一款专注于保护视力健康的桌面应用，基于Electron和React构建

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Electron](https://img.shields.io/badge/electron-v28.0.0-blue.svg)
![React](https://img.shields.io/badge/react-v18.2.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-v5.0.4-3178c6.svg)

## 项目简介

护眼小助手是一款桌面应用程序，旨在帮助长时间使用电脑的用户保护视力健康。通过合理安排工作与休息时间，提醒用户适时休息，预防视疲劳和相关健康问题。

## 核心功能

### 智能计时提醒

- **自定义工作/休息周期**：基于番茄工作法，支持自定义工作和休息时长
- **全屏休息提醒**：休息时间到达时，显示全屏提醒页面，并提供护眼小贴士
- **浏览器集成**：能够检测浏览器视频播放状态，避免在用户观看重要内容时打断

### 用户体验优化

- **多主题支持**：提供蓝色、暗黑、暖色、自然四种主题风格，满足不同用户需求
- **进度可视化**：直观的计时器进度环，实时展示剩余工作时间
- **自动化休息流程**：工作结束后自动切换至休息模式，减少用户操作

## 快速开始

### 安装

```bash
# 克隆项目
git clone https://github.com/yourusername/eye-protection-assistant.git

# 进入项目目录
cd eye-protection-assistant

# 安装依赖
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建与打包

```bash
# 构建应用
npm run build

# 打包为可执行文件
npm run package
```

## 技术栈

本项目采用现代前端技术栈开发：

- **前端框架**：React 18 + TypeScript
- **桌面应用**：Electron 28
- **构建工具**：Vite
- **测试框架**：Jest
- **浏览器集成**：Chrome DevTools Protocol

## 技术特点

- **多进程架构**：利用Electron的主进程与渲染进程分离设计，实现高效的任务分配
- **跨进程通信**：基于IPC机制实现进程间通信，保证数据流转高效可靠
- **浏览器集成**：通过CDP协议检测浏览器视频播放状态，提供智能的休息提醒策略
- **响应式设计**：使用React函数式组件和Hooks，确保UI响应及时且高效
- **可扩展主题**：基于CSS变量实现的主题系统，易于扩展和维护

## 项目结构

```
护眼小助手/
├── src/                 # 源代码
│   ├── main/           # Electron主进程
│   │   ├── main.ts     # 主进程入口
│   │   ├── timer.ts    # 计时器逻辑
│   │   └── browser-control.ts # 浏览器控制
│   ├── renderer/       # 渲染进程
│   │   ├── components/ # React组件
│   │   └── styles/     # 样式文件
│   └── preload/        # 预加载脚本
├── docs/                # 文档
├── tests/               # 单元测试
└── assets/              # 静态资源
```

## 参与贡献

欢迎提交PR或Issue来改进项目！详细的贡献方法请参考[贡献指南](./CONTRIBUTING.md)。

## 许可证

本项目基于ISC许可证开源。

## 免责声明

护眼小助手仅作为辅助工具，不能替代专业的医疗建议。如有眼部不适，请及时咨询眼科医生。