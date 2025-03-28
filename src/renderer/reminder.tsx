import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import FullScreenReminder from './components/Reminder/FullScreenReminder';
import './styles/reminder.css';

// 休息页面组件
const ReminderApp: React.FC = () => {
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);

  // 监听计时更新
  useEffect(() => {
    const removeListener = window.electronAPI.onTimerUpdate((data: any) => {
      setRemainingTime(data.remainingTime);
      setTotalTime(data.totalTime);
    });

    return () => removeListener();
  }, []);

  // 处理休息完成
  const handleFinish = () => {
    window.electronAPI.finishRest();
  };

  return (
    <FullScreenReminder
      remainingTime={remainingTime}
      totalTime={totalTime}
      onFinish={handleFinish}
    />
  );
};

ReactDOM.createRoot(document.getElementById('reminder-root') as HTMLElement).render(
  <React.StrictMode>
    <ReminderApp />
  </React.StrictMode>
);