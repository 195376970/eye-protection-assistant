# 护眼小助手 API 参考文档

本文档详细说明了护眼小助手应用的核心API，供开发者参考。

## 1. 计时器模块 (Timer Module)

### 1.1 TimerState 枚举

```typescript
enum TimerState {
  IDLE = 0,     // 空闲状态
  WORKING = 1,  // 工作中状态
  RESTING = 2,  // 休息中状态
  PAUSED = 3,   // 暂停状态
}
```

### 1.2 Timer 类

#### 构造函数

```typescript
constructor()
```

创建计时器实例。

#### 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| state | TimerState | 当前计时器状态 |

#### 方法

##### setUpdateCallback

```typescript
setUpdateCallback(callback: (state: TimerState, remainingTime: number, totalTime: number) => void): void
```

设置计时器更新回调函数。

**参数:**
- `callback`: 状态更新回调函数，接收当前状态、剩余时间和总时间

##### startTimer

```typescript
startTimer(workTime: number, restTime: number): void
```

启动计时器，开始新的工作-休息周期。

**参数:**
- `workTime`: 工作时间（秒）
- `restTime`: 休息时间（秒）

##### pauseTimer

```typescript
pauseTimer(): void
```

暂停当前计时周期。

##### resetTimer

```typescript
resetTimer(): void
```

重置计时器到初始状态。

##### finishRest

```typescript
finishRest(): void
```

提前结束休息时间。仅在 `RESTING` 状态下有效。

## 2. 浏览器控制模块 (Browser Control)

浏览器控制模块负责连接和监控Chrome浏览器活动。

### 2.1 BrowserControl 类

#### 主要方法

##### connect

```typescript
async connect(): Promise<boolean>
```

尝试连接到Chrome浏览器调试端口。

**返回值:** 
- 连接成功返回 `true`，失败返回 `false`

##### disconnect

```typescript
async disconnect(): Promise<void>
```

断开与浏览器的连接。

##### startVideoMonitoring

```typescript
startVideoMonitoring(callback: (isPlaying: boolean) => void): void
```

开始监控浏览器中的视频播放状态。

**参数:**
- `callback`: 视频状态变化时的回调函数

## 3. IPC 通信接口

通过 Electron 的 contextBridge API 暴露给渲染进程的接口。

### 3.1 渲染进程可用API

```typescript
window.electronAPI = {
  // 窗口控制
  minimizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  
  // 计时器控制
  startTimer: (workTime: number, restTime: number) => Promise<boolean>;
  pauseTimer: () => Promise<boolean>;
  resetTimer: () => Promise<boolean>;
  finishRest: () => Promise<boolean>;
  
  // 事件监听
  onTimerUpdate: (callback: (data: any) => void) => () => void;
  onRestStart: (callback: () => void) => () => void;
  onRestEnd: (callback: () => void) => () => void;
  onBrowserControlStatus: (callback: (status: { connected: boolean, message?: string }) => void) => () => void;
};
```

### 3.2 方法详情

#### 窗口控制

- **minimizeWindow()** - 最小化应用窗口
- **closeWindow()** - 关闭应用窗口

#### 计时器控制

- **startTimer(workTime, restTime)** - 启动计时器
- **pauseTimer()** - 暂停计时器
- **resetTimer()** - 重置计时器
- **finishRest()** - 结束休息

#### 事件监听

- **onTimerUpdate(callback)** - 注册计时器更新事件监听器
- **onRestStart(callback)** - 注册休息开始事件监听器
- **onRestEnd(callback)** - 注册休息结束事件监听器
- **onBrowserControlStatus(callback)** - 注册浏览器控制状态事件监听器

## 4. 本地存储

应用使用 localStorage 进行设置持久化。

### 4.1 存储结构

```typescript
// 存储键名
const STORAGE_KEY = 'eyecare-settings';

// 存储的数据结构
interface Settings {
  workTime: number;      // 工作时间（秒）
  restTime: number;      // 休息时间（秒）
  theme: ThemeType;      // 主题类型
}
```

### 4.2 存储操作

```typescript
// 读取设置
const loadSettings = (): Settings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return defaultSettings;
};

// 保存设置
const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};
```

## 5. 注意事项

- 浏览器控制功能要求Chrome启用远程调试功能
- 计时器状态变更通过IPC通信同步到渲染进程
- 使用事件监听器时需注意在组件卸载时进行清理，防止内存泄漏