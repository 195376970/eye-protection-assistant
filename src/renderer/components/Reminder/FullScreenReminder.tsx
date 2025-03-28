import React, { useState, useEffect } from 'react';

interface FullScreenReminderProps {
  remainingTime: number;
  totalTime: number;
  onFinish: () => void;
}

const FullScreenReminder: React.FC<FullScreenReminderProps> = ({
  remainingTime,
  totalTime,
  onFinish
}) => {
  // 随机选择一个护眼小贴士
  const [tip, setTip] = useState('');
  // 添加动画状态
  const [animate, setAnimate] = useState(false);
  
  // 护眼小贴士列表
  const eyeCareTips = [
    '远眸绿色植物可以缓解眼部疲劳',
    '适当闭目养神，让眼睛得到休息',
    '使祊20-20-20法则：大20分钟，看20英尺外的东西20秒',
    '保持良好的坐姿，屏幕应位于眼睛水平线以下15-20度',
    '眼频率低会导致眼睛干涉，多眼能缓解这一问题',
    '在明亮的环境下使用电脑，减少对比度带来的眼部压力',
    '屏幕亮度不宜过高，应与环境光线协调',
    '使用蓝光过滤器或护眼模式减少蓝光对眼睛的刺激',
    '每隔一小时站起来活动几分钟，促进全身血液循环',
    '保持充足的水分摹入有助于预防眼睛干涉'
  ];
  
  // 计算进度百分比和圆环参数
  const progress = (remainingTime / totalTime) * 100;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (circumference * progress) / 100;
  
  // 在组件加载时随机选择一个小贴士
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * eyeCareTips.length);
    setTip(eyeCareTips[randomIndex]);
    
    // 组件加载后启动动画
    setTimeout(() => setAnimate(true), 100);
  }, []);
  
  // 当剩余时间为0时触发完成回调
  useEffect(() => {
    if (remainingTime <= 0) {
      onFinish();
    }
  }, [remainingTime, onFinish]);

  return (
    <div className="fullscreen-reminder">
      {/* 动态光效背景 */}
      <div className="reminder-background-effects">
        <div className="light-orb" style={{ top: '20%', left: '15%', opacity: animate ? 0.6 : 0 }}></div>
        <div className="light-orb" style={{ top: '70%', left: '80%', opacity: animate ? 0.4 : 0 }}></div>
        <div className="light-orb" style={{ top: '10%', left: '70%', opacity: animate ? 0.3 : 0 }}></div>
      </div>
      
      <div className={`reminder-content ${animate ? 'content-visible' : ''}`}>
        <h1 className="reminder-title">护眼休息时间</h1>
        
        <div className="countdown-container">
          <div className="countdown-ring">
            <svg width="220" height="220" viewBox="0 0 220 220">
              {/* 外部装饰圆环 */}
              <circle
                cx="110"
                cy="110"
                r="104"
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1"
              />
              
              {/* 刻度线 */}
              {Array.from({ length: 60 }).map((_, i) => (
                <line
                  key={i}
                  x1="110"
                  y1="20"
                  x2="110"
                  y2={i % 5 === 0 ? "12" : "16"}
                  stroke="rgba(255, 255, 255, 0.07)"
                  strokeWidth={i % 5 === 0 ? "2" : "1"}
                  transform={`rotate(${i * 6} 110 110)`}
                />
              ))}
              
              {/* 背景圆 */}
              <circle
                cx="110"
                cy="110"
                r="90"
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="10"
              />
              
              {/* 进度圆 */}
              <circle
                cx="110"
                cy="110"
                r="90"
                fill="none"
                stroke="url(#reminderGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 110 110)"
                filter="drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))"
              />
              
              {/* 定义渐变 */}
              <defs>
                <linearGradient id="reminderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
              </defs>
            </svg>
            <div className="countdown-time">{Math.ceil(remainingTime)}</div>
            <div className="countdown-label">秒</div>
          </div>
        </div>
        
        <div className="reminder-instructions">
          <p>请您休息一下，保护眼睛</p>
          <div className="tip-container">
            <div className="tip-icon">💡</div>
            <p className="tip">{tip}</p>
          </div>
        </div>
        
        <button className="skip-button" onClick={onFinish}>
          <span className="skip-text">跳过休息</span>
          <span className="skip-icon">→</span>
        </button>
      </div>
    </div>
  );
};

export default FullScreenReminder;