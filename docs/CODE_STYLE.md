# 代码规范

本文档定义了护眼小助手项目的代码规范，以保证代码风格的一致性和可维护性。

## 目录和文件命名

- 目录名称采用小驼峰式命名（camelCase）
- 文件名采用大驼峰式命名（PascalCase）
- React 组件文件以 `.tsx` 结尾
- 样式文件以 `.css` 结尾
- 测试文件以 `.test.ts` 或 `.test.tsx` 结尾

例如：
```
src/renderer/components/Timer/TimerDisplay.tsx
src/renderer/components/Settings/SettingsPanel.tsx
```

## TypeScript 代码规范

### 类型声明

- 始终使用显式类型注释，避免依赖类型推断
- 使用接口（interface）定义数据结构和组件属性
- 组件属性接口名应以 `Props` 结尾，例如 `TimerDisplayProps`
- 无特殊情况下避免使用 `any` 类型

```typescript
// 好的做法
interface TimerDisplayProps {
  remainingTime: number;
  totalTime: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ remainingTime, totalTime }) => {
  // ...
};

// 避免的做法
const TimerDisplay = ({ remainingTime, totalTime }: any) => {
  // ...
};
```

### 命名规范

- 变量和函数使用小驼峰式命名（camelCase）
- 类、接口和类型使用大驼峰式命名（PascalCase）
- 常量使用全大写加下划线（UPPER_SNAKE_CASE）
- React 组件使用大驼峰式命名（PascalCase）
- 事件处理函数以 `handle` 开头，如 `handleClick`

```typescript
// 好的做法
const DEFAULT_WORK_TIME = 25 * 60; // 25分钟

interface TimerState {
  isRunning: boolean;
  remainingTime: number;
}

const calculateRemainingTime = (endTime: number): number => {
  // ...
};

const TimerDisplay: React.FC<TimerDisplayProps> = (props) => {
  const handlePauseClick = () => {
    // ...
  };
};
```

## React 代码规范

### 组件编写

- 优先使用函数组件而非类组件
- 采用 React Hooks 管理组件状态和生命周期
- 尽量将组件拆分为更小的可复用组件
- 对于可能频繁重渲染的组件，使用 `React.memo` 进行优化

```typescript
// 好的做法
const TimerControl: React.FC<TimerControlProps> = React.memo(({ onStart, onPause }) => {
  return (
    <div className="timer-controls">
      <button onClick={onStart}>Start</button>
      <button onClick={onPause}>Pause</button>
    </div>
  );
});
```

### Hooks 使用规范

- Hook 命名以 `use` 开头
- 仅在函数组件或自定义 Hook 中使用 Hook
- 不要在循环、条件或嵌套函数中调用 Hook

```typescript
// 好的做法
const TimerComponent: React.FC = () => {
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setRemainingTime(time => time - 1);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isActive]);
  
  // ...
};

// 自定义 Hook
const useTimer = (initialTime: number) => {
  const [time, setTime] = useState<number>(initialTime);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  
  // ...
  
  return { time, isRunning, start, pause, reset };
};
```

## CSS 规范

### 命名与组织

- 使用语义化的类名
- 采用组件名作为前缀，确保不会冲突
- 为 JavaScript 中使用的类名添加 `js-` 前缀

```css
/* 好的做法 */
.timer-display { /* 主容器 */ }
.timer-display__time { /* 时间显示部分 */ }
.timer-display__controls { /* 控制按钮部分 */ }
.js-timer-start { /* 用于 JavaScript 交互的元素 */ }
```

### 使用 CSS 变量

- 定义全局变量应挂在 `:root` 选择器下
- 主题相关的变量应以 `--` 开头
- 使用变量时应提供后备值

```css
:root {
  --accent-color: #3b82f6;
  --text-color: #ffffff;
  --border-radius: 8px;
}

.button {
  background-color: var(--accent-color, #3b82f6);
  color: var(--text-color, #ffffff);
  border-radius: var(--border-radius, 8px);
}
```

## 注释规范

### TypeScript/JavaScript 注释

- 使用 `//` 进行单行注释
- 使用 `/* ... */` 进行多行注释
- 对于带有参数的函数，添加注释说明参数和返回值

```typescript
// 好的注释实践

/**
 * 格式化时间为 MM:SS 格式
 * @param seconds 总秒数
 * @returns 格式化后的时间字符串
 */
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};
```

### CSS 注释

- 使用 `/* ... */` 进行注释
- 为每个主要部分添加注释头

```css
/* 全屏提醒样式 */
.fullscreen-reminder {
  /* ... */
}

/* 倒计时容器 */
.countdown-container {
  /* ... */
}
```

## 其他编码规范

- 缩进使用 2 个空格
- 行尾不留空格
- 每行不超过 100 个字符
- 采用单引号 `'` 而非双引号 `"`
- 每个文件以一个空行结尾

## 单元测试规范

- 测试文件与被测试文件放在相同目录结构下
- 测试文件使用 `.test.ts` 或 `.test.tsx` 后缀
- 测试描述应清晰表达测试意图

```typescript
// 好的测试实践
describe('Timer', () => {
  let timer: Timer;
  
  beforeEach(() => {
    timer = new Timer();
  });
  
  test('初始状态应为空闲', () => {
    expect(timer.state).toBe(TimerState.IDLE);
  });
  
  test('启动计时器后状态应为工作中', () => {
    timer.startTimer(300, 10);
    expect(timer.state).toBe(TimerState.WORKING);
  });
});
```

遵循这些规范将有助于维护一致、高质量的代码库，使项目更易于理解和维护。