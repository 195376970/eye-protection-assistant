# 护眼小助手 API 参考

本文档提供了护眼小助手应用的主要 API 详细说明，包括主进程模块和跨进程通信接口。

## 1. 计时器模块 (Timer Module)

### TimerState 枚举

```typescript
enum TimerState {
  IDLE = 0,     // 空闲状态
  WORKING = 1,  // 工作中状态
  RESTING = 2,  // 休息中状态
  PAUSED = 3,   // 暂停状态
}
```

### Timer 类

#### 构造函数

```typescript
constructor()
```

创建一个新的 Timer 实例。

#### 属性

| 属性 | 类型 | 描述 |
|---------|---------|-------|
| state | TimerState | 读取当前计时器状态 |

#### 方法

##### setUpdateCallback

```typescript
setUpdateCallback(callback: (state: TimerState, remainingTime: number, totalTime: number) => void): void
```

设置计时器更新时的回调函数。每次计时器状态或剩余时间变化时都会调用该回调。

- **参数**:
  - `callback`: 更新回调函数，接收当前状态、剩余时间和总时间作为参数

##### setRestStartCallback

```typescript
setRestStartCallback(callback: () => void): void
```

设置休息开始时的回调函数。当工作时间结束进入休息时间时调用。

- **参数**:
  - `callback`: 休息开始回调函数

##### setRestEndCallback

```typescript
setRestEndCallback(callback: () => void): void
```

设置休息结束时的回调函数。当休息时间结束或被手动终止时调用。

- **参数**:
  - `callback`: 休息结束回调函数

##### startTimer

```typescript
startTimer(workTime: number, restTime: number): void
```

启动计时器。如果计时器已处于暂停状态，则会恢复计时。

- **参数**:
  - `workTime`: 工作时间，以秒为单位
  - `restTime`: 休息时间，以秒为单位

##### pauseTimer

```typescript
pauseTimer(): void
```

暂停当前运行的计时器。

##### resetTimer

```typescript
resetTimer(): void
```

重置计时器到空闲状态。

##### finishRest

```typescript
finishRest(): void
```

提前结束休息时间。必须在 `RESTING` 状态才会生效。

## 2. 浏览器控制模块 (Browser Control Module)

### BrowserControl 类

#### 构造函数

```typescript
constructor()
```

创建一个新的 BrowserControl 实例。

#### 方法

##### connect

```typescript
async connect(): Promise<boolean>
```

连接到浏览器。需要浏览器启用远程调试功能。

- **返回值**: 连接是否成功。

##### disconnect

```typescript
async disconnect(): Promise<void>
```

断开与浏览器的连接。

##### startVideoMonitoring

```typescript
startVideoMonitoring(callback: (isPlaying: boolean) => void): void
```

开始监测浏览器中的视频播放状态。

- **参数**:
  - `callback`: 当视频状态变化时的回调函数，参数为是否有视频正在播放

## 3. IPC 通信接口 (Renderer Process API)

以下是通过 `contextBridge` 暴露给渲染进程的 API：

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
  
  // 事件监听器
  onTimerUpdate: (callback: (data: any) => void) => () => void;
  onRestStart: (callback: () => void) => () => void;
  onRestEnd: (callback: () => void) => () => void;
  onBrowserControlStatus: (callback: (status: { connected: boolean, message?: string }) => void) => () => void;
};
```

### 方法详情

#### minimizeWindow

```typescript
minimizeWindow(): Promise<void>
```

最小化应用窗口。

#### closeWindow

```typescript
closeWindow(): Promise<void>
```

关闭应用窗口。

#### startTimer

```typescript
startTimer(workTime: number, restTime: number): Promise<boolean>
```

启动计时器。

- **参数**:
  - `workTime`: 工作时间（秒）
  - `restTime`: 休息时间（秒）
- **返回值**: 是否成功启动计时器

#### pauseTimer

```typescript
pauseTimer(): Promise<boolean>
```

暂停计时器。

- **返回值**: 是否成功暂停计时器

#### resetTimer

```typescript
resetTimer(): Promise<boolean>
```

重置计时器。

- **返回值**: 是否成功重置计时器

#### finishRest

```typescript
finishRest(): Promise<boolean>
```

提前结束休息时间。

- **返回值**: 是否成功结束休息

#### onTimerUpdate

```typescript
onTimerUpdate(callback: (data: { state: number, remainingTime: number, totalTime: number }) => void): () => void
```

注册计时器更新事件监听器。

- **参数**:
  - `callback`: 当计时器状态更新时的回调函数
- **返回值**: 取消监听的函数

#### onRestStart

```typescript
onRestStart(callback: () => void): () => void
```

注册休息开始事件监听器。

- **参数**:
  - `callback`: 当休息开始时的回调函数
- **返回值**: 取消监听的函数

#### onRestEnd

```typescript
onRestEnd(callback: () => void): () => void
```

注册休息结束事件监听器。

- **参数**:
  - `callback`: 当休息结束时的回调函数
- **返回值**: 取消监听的函数

#### onBrowserControlStatus

```typescript
onBrowserControlStatus(callback: (status: { connected: boolean, message?: string }) => void): () => void
```

注册浏览器控制状态事件监听器。

- **参数**:
  - `callback`: 当浏览器控制状态变化时的回调函数
- **返回值**: 取消监听的函数

## 4. 全局状态管理 (State Management)

应用使用 React 内置的状态管理和 Context API 来管理用户界面状态。主要状态包括：

```typescript
// 应用核心状态
const [workTime, setWorkTime] = useState<number>(savedSettings.workTime || DEFAULT_WORK_TIME);
const [restTime, setRestTime] = useState<number>(savedSettings.restTime || DEFAULT_REST_TIME);
const [theme, setTheme] = useState<ThemeType>(savedSettings.theme || DEFAULT_THEME);
const [remainingTime, setRemainingTime] = useState<number>(0);
const [isActive, setIsActive] = useState<boolean>(false);
const [isPaused, setIsPaused] = useState<boolean>(false);
const [showSettings, setShowSettings] = useState<boolean>(false);
const [browserConnected, setBrowserConnected] = useState<boolean>(false);
const [browserMessage, setBrowserMessage] = useState<string>('');
```

## 5. 本地存储 (Local Storage)

应用使用浏览器的 localStorage API 来持久化用户设置：

```typescript
// 本地存储键
const STORAGE_KEY = 'eyecare-settings';

// 从本地存储加载设置
const loadSettings = () => {
  try {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error('加载设置失败:', error);
  }
  return {
    workTime: DEFAULT_WORK_TIME,
    restTime: DEFAULT_REST_TIME,
    theme: DEFAULT_THEME
  };
};

// 保存设置到本地存储
const saveSettings = (settings: { workTime: number; restTime: number; theme: ThemeType }) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('保存设置失败:', error);
  }
};
```