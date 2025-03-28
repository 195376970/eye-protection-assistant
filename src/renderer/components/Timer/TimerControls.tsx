import React from 'react';

interface TimerControlsProps {
  isActive: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSettings: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({ 
  isActive, 
  isPaused, 
  onStart, 
  onPause, 
  onReset,
  onSettings
}) => {
  return (
    <div className="timer-controls">
      {/* 顶部设置按钮 */}
      <button 
        className="settings-button" 
        onClick={onSettings}
        title="设置"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19.4 15C19.1686 15.6213 19.3209 16.3255 19.8 16.8L19.91 16.91C20.3355 17.3355 20.5754 17.9053 20.5754 18.5C20.5754 19.0947 20.3355 19.6645 19.91 20.09C19.4645 20.5355 18.8947 20.7754 18.3 20.7754C17.7053 20.7754 17.1355 20.5355 16.69 20.09L16.59 19.99C16.1155 19.5109 15.4113 19.3586 14.79 19.59C14.1798 19.8113 13.7682 20.3726 13.76 21V21.2C13.76 22.3046 12.8646 23.2 11.76 23.2H11.24C10.1354 23.2 9.24 22.3046 9.24 21.2V21.09C9.22113 20.4463 8.77374 19.8993 8.14 19.69C7.51865 19.4586 6.81444 19.6109 6.34 20.09L6.24 20.19C5.79447 20.6355 5.22468 20.8754 4.63 20.8754C4.03532 20.8754 3.46553 20.6355 3.02 20.19C2.59447 19.7445 2.35461 19.1747 2.35461 18.58C2.35461 17.9853 2.59447 17.4155 3.02 16.97L3.12 16.87C3.59912 16.3955 3.75143 15.6913 3.52 15.07C3.29879 14.4598 2.73748 14.0482 2.11 14.04H2C0.895431 14.04 0 13.1446 0 12.04V11.52C0 10.4154 0.895431 9.52 2 9.52H2.11C2.75371 9.5013 3.30093 9.07539 3.51 8.46C3.74143 7.83865 3.58912 7.13444 3.11 6.66L3.01 6.56C2.58447 6.11447 2.34461 5.54468 2.34461 4.95C2.34461 4.35532 2.58447 3.78553 3.01 3.34C3.45553 2.91447 4.02532 2.67461 4.62 2.67461C5.21468 2.67461 5.78447 2.91447 6.23 3.34L6.33 3.44C6.80443 3.91912 7.50865 4.07143 8.13 3.84H8.21C8.82022 3.61879 9.23178 3.05748 9.24 2.43V2.2C9.24 1.09543 10.1354 0.2 11.24 0.2H11.76C12.8646 0.2 13.76 1.09543 13.76 2.2V2.31C13.7682 2.93743 14.1798 3.49869 14.79 3.72C15.4113 3.95143 16.1155 3.79912 16.59 3.32L16.69 3.22C17.1355 2.77447 17.7053 2.53461 18.3 2.53461C18.8947 2.53461 19.4645 2.77447 19.91 3.22C20.3355 3.66553 20.5754 4.23532 20.5754 4.83C20.5754 5.42468 20.3355 5.99447 19.91 6.44L19.8 6.54C19.3209 7.01444 19.1686 7.71865 19.4 8.34V8.42C19.6212 9.03022 20.1825 9.44178 20.81 9.45H21C22.1046 9.45 23 10.3454 23 11.45V11.97C23 13.0746 22.1046 13.97 21 13.97H20.9C20.2726 13.9782 19.7112 14.3898 19.49 15.01L19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      {/* 主控制按钮区域 */}
      <div className="main-controls">
        {/* 重置按钮 */}
        <button 
          className={`control-button ${isActive ? 'visible' : 'hidden'}`}
          onClick={onReset}
          disabled={!isActive}
          title="重置"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3.51 15C4.15839 17.3304 5.6355 19.3292 7.61244 20.5925C9.58938 21.8559 11.9408 22.3133 14.216 21.8751C16.4912 21.437 18.515 20.1362 19.9069 18.2487C21.2989 16.3611 21.9599 14.0108 21.7644 11.6558C21.5689 9.30072 20.5306 7.09805 18.8421 5.4992C17.1536 3.90035 14.9354 3.0017 12.5786 2.95059C10.2217 2.89948 7.9646 3.70018 6.2076 5.24001C4.4506 6.77985 3.32536 8.93823 3 11.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        {/* 开始/暂停按钮 */}
        <button 
          className="control-button primary-button"
          onClick={isActive && !isPaused ? onPause : onStart}
          title={isActive && !isPaused ? '暂停' : '开始'}
        >
          {isActive && !isPaused ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 4H6V20H10V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 4H14V20H18V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 3L19 12L5 21V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default TimerControls;