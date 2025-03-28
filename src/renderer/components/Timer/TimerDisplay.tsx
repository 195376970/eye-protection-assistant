import React from 'react';

interface TimerDisplayProps {
  remainingTime: number;
  totalTime: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ remainingTime, totalTime }) => {
  // 格式化时间为 分:秒 格式
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 计算圆形进度条的比例
  const calculateProgress = (): number => {
    if (totalTime <= 0) return 0;
    return (remainingTime / totalTime) * 100;
  };

  // 计算圆形进度条的周长和偏移
  const calculateCircleValues = () => {
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const progress = calculateProgress();
    const offset = circumference - (progress / 100) * circumference;
    
    return { circumference, offset };
  };

  const { circumference, offset } = calculateCircleValues();
  
  // 动态计算渐变色
  const progressColor = remainingTime > totalTime * 0.5 
    ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
    : remainingTime > totalTime * 0.25 
      ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' 
      : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';

  return (
    <div className="timer-display">
      {/* 发光效果背景层 */}
      <div className="timer-glow-effect" style={{
        background: progressColor,
        opacity: 0.15,
        filter: 'blur(40px)',
        position: 'absolute',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        zIndex: -1
      }}></div>
      
      <svg className="progress-ring" width="280" height="280" viewBox="0 0 280 280">
        {/* 外部装饰圆 */}
        <circle
          stroke="rgba(255, 255, 255, 0.03)"
          strokeWidth="1"
          fill="none"
          r="136"
          cx="140"
          cy="140"
        />
        
        {/* 背景圆 */}
        <circle
          className="progress-ring__circle-bg"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="10"
          fill="transparent"
          r="120"
          cx="140"
          cy="140"
        />
        
        {/* 刻度线 */}
        {Array.from({ length: 60 }).map((_, i) => (
          <line
            key={i}
            x1="140"
            y1="20"
            x2="140"
            y2={i % 5 === 0 ? "10" : "15"}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={i % 5 === 0 ? "2" : "1"}
            transform={`rotate(${i * 6} 140 140)`}
          />
        ))}
        
        {/* 进度圆 */}
        <circle
          className="progress-ring__circle"
          stroke="url(#progressGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="transparent"
          r="120"
          cx="140"
          cy="140"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 140 140)"
        />
        
        {/* 定义渐变 */}
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={remainingTime > totalTime * 0.5 ? '#3b82f6' : remainingTime > totalTime * 0.25 ? '#f97316' : '#ef4444'} />
            <stop offset="100%" stopColor={remainingTime > totalTime * 0.5 ? '#2563eb' : remainingTime > totalTime * 0.25 ? '#ea580c' : '#dc2626'} />
          </linearGradient>
        </defs>
      </svg>
      
      <div className="timer-text">
        <div className="time">{formatTime(remainingTime)}</div>
        <div className="label">{remainingTime > 0 ? "剩余时间" : "准备开始"}</div>
      </div>
    </div>
  );
};

export default TimerDisplay;