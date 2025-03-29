# 🧩 护眼小助手功能接口指南

> 这份文档以简洁友好的方式介绍护眼小助手的主要功能接口

## 🕒 计时器功能

### 状态类型

计时器有这几种状态：
- `空闲`: 还没开始计时
- `工作中`: 正在工作计时阶段
- `休息中`: 正在休息计时阶段
- `暂停`: 计时器被暂停

### 主要功能

#### ⏱️ 开始计时

```typescript
startTimer(工作时间, 休息时间)
```

启动一个新的计时周期，参数是工作和休息的秒数。

#### ⏸️ 暂停计时

```typescript
pauseTimer()
```

暂停当前正在进行的计时。

#### 🔄 重置计时

```typescript
resetTimer()
```

将计时器恢复到初始状态。

#### ⏭️ 提前结束休息

```typescript
finishRest()
```

如果你想提前结束休息，可以调用这个。

## 📱 浏览器功能

### 主要功能

#### 🔌 连接浏览器

```typescript
connect()
```

连接到Chrome浏览器，用于检测视频播放状态。

#### 📺 监控视频

```typescript
startVideoMonitoring(状态变化回调)
```

开始监控浏览器中的视频播放状态，当状态变化时会触发回调函数。

## 🔄 渲染进程可用功能

渲染进程（界面）可以使用以下功能：

### 窗口控制

- `minimizeWindow()`: 最小化窗口
- `closeWindow()`: 关闭窗口

### 计时器控制

- `startTimer(工作时间, 休息时间)`: 开始计时
- `pauseTimer()`: 暂停计时
- `resetTimer()`: 重置计时器
- `finishRest()`: 结束休息

### 事件监听

- `onTimerUpdate(回调)`: 监听计时器更新
- `onRestStart(回调)`: 监听休息开始
- `onRestEnd(回调)`: 监听休息结束
- `onBrowserControlStatus(回调)`: 监听浏览器连接状态

## 🗄️ 本地存储

应用会保存你的设置到本地存储：

```typescript
// 存储的设置包括
{
  workTime: 工作时间（秒）,
  restTime: 休息时间（秒）,
  theme: 主题名称
}
```

---

💡 这份文档会随着应用的更新而更新，请定期查看最新变化