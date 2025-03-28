import React, { useState, useEffect } from 'react';
import TimerDisplay from './components/Timer/TimerDisplay';
import TimerControls from './components/Timer/TimerControls';
import SettingsPanel, { ThemeType } from './components/Settings/SettingsPanel';
import './styles/index.css';

// 声明全局Window类型，包含electronAPI
declare global {
  interface Window {
    electronAPI: {
      minimizeWindow: () => Promise<void>;
      closeWindow: () => Promise<void>;
      startTimer: (workTime: number, restTime: number) => Promise<boolean>;
      pauseTimer: () => Promise<boolean>;
      resetTimer: () => Promise<boolean>;
      finishRest: () => Promise<boolean>;
      onTimerUpdate: (callback: (data: any) => void) => () => void;
      onRestStart: (callback: () => void) => () => void;
      onRestEnd: (callback: () => void) => () => void;
      onBrowserControlStatus: (callback: (status: { connected: boolean, message?: string }) => void) => () => void;
    };
  }
}

// 本地存储键
const STORAGE_KEY = 'eyecare-settings';

// 默认设置
const DEFAULT_WORK_TIME = 25 * 60; // 25分钟（秒）
const DEFAULT_REST_TIME = 20; // 20秒
const DEFAULT_THEME: ThemeType = 'blue'; // 默认主题

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

const App: React.FC = () => {
  // 加载保存的设置
  const savedSettings = loadSettings();
  
  // 状态
  const [workTime, setWorkTime] = useState<number>(savedSettings.workTime || DEFAULT_WORK_TIME);
  const [restTime, setRestTime] = useState<number>(savedSettings.restTime || DEFAULT_REST_TIME);
  const [theme, setTheme] = useState<ThemeType>(savedSettings.theme || DEFAULT_THEME);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [browserConnected, setBrowserConnected] = useState<boolean>(false);
  const [browserMessage, setBrowserMessage] = useState<string>('');

  // 应用主题到根元素
  useEffect(() => {
    document.documentElement.className = `theme-${theme}`;
  }, [theme]);

  // 监听计时器更新
  useEffect(() => {
    const removeListener = window.electronAPI.onTimerUpdate((data) => {
      console.log('收到计时器更新:', data); // 添加详细日志
      setRemainingTime(data.remainingTime);
      
      // 根据状态更新UI状态
      if (data.state === 1) { // WORKING
        console.log('进入工作状态');
        setIsActive(true);
        setIsPaused(false);
      } else if (data.state === 2) { // RESTING
        console.log('进入休息状态');
        setIsActive(true);
        setIsPaused(false);
      } else if (data.state === 3) { // PAUSED
        console.log('进入暂停状态');
        setIsActive(true);
        setIsPaused(true);
      } else { // IDLE
        console.log('进入空闲状态');
        setIsActive(false);
        setIsPaused(false);
      }
    });

    return () => removeListener();
  }, []);

  // 监听休息开始
  useEffect(() => {
    const removeListener = window.electronAPI.onRestStart(() => {
      console.log('休息开始');
    });

    return () => removeListener();
  }, []);

  // 监听休息结束
  useEffect(() => {
    const removeListener = window.electronAPI.onRestEnd(() => {
      console.log('休息结束');
    });

    return () => removeListener();
  }, []);

  // 监听浏览器控制状态
  useEffect(() => {
    const removeListener = window.electronAPI.onBrowserControlStatus((status) => {
      console.log('浏览器控制状态更新:', status);
      setBrowserConnected(status.connected);
      if (status.message) {
        setBrowserMessage(status.message);
      }
    });

    return () => removeListener();
  }, []);

  // 处理开始按钮点击
  const handleStart = () => {
    console.log('点击开始按钮, 当前状态:', { isActive, isPaused });
    window.electronAPI.startTimer(workTime, restTime);
  };

  // 处理暂停按钮点击
  const handlePause = () => {
    console.log('点击暂停按钮, 当前状态:', { isActive, isPaused });
    window.electronAPI.pauseTimer();
  };

  // 处理重置按钮点击
  const handleReset = () => {
    console.log('点击重置按钮');
    window.electronAPI.resetTimer();
  };

  // 处理设置按钮点击
  const handleSettings = () => {
    console.log('点击设置按钮');
    setShowSettings(true);
  };

  // 处理设置更新
  const handleSettingsUpdate = (newWorkTime: number, newRestTime: number, newTheme: ThemeType) => {
    console.log('保存设置:', { newWorkTime, newRestTime, newTheme });
    
    setWorkTime(newWorkTime);
    setRestTime(newRestTime);
    setTheme(newTheme);
    setShowSettings(false);
    
    // 保存设置到本地存储
    saveSettings({
      workTime: newWorkTime,
      restTime: newRestTime,
      theme: newTheme
    });
  };

  // 处理窗口最小化
  const handleMinimize = () => {
    window.electronAPI.minimizeWindow();
  };

  // 处理窗口关闭
  const handleClose = () => {
    window.electronAPI.closeWindow();
  };

  return (
    <div className={`app-container theme-${theme}`}>
      {/* 自定义标题栏 */}
      <div className="title-bar">
        <div className="drag-area">护眼小助手</div>
        <div className="window-controls">
          <button onClick={handleMinimize} className="minimize-btn">—</button>
          <button onClick={handleClose} className="close-btn">×</button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="main-content">
        {/* 浏览器连接状态指示器 */}
        {browserMessage && (
          <div className={`browser-status ${browserConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-icon">{browserConnected ? '✓' : '!'}</span>
            <span className="status-text">{browserMessage}</span>
          </div>
        )}

        {showSettings ? (
          <SettingsPanel
            workTime={workTime}
            restTime={restTime}
            theme={theme}
            onSave={handleSettingsUpdate}
            onCancel={() => setShowSettings(false)}
          />
        ) : (
          <>
            <TimerDisplay
              remainingTime={remainingTime}
              totalTime={isActive ? workTime : 0}
            />
            <TimerControls
              isActive={isActive}
              isPaused={isPaused}
              onStart={handleStart}
              onPause={handlePause}
              onReset={handleReset}
              onSettings={handleSettings}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default App;