import React, { useState } from 'react';

// 添加主题枚举类型
export type ThemeType = 'blue' | 'dark' | 'warm' | 'nature';

interface SettingsPanelProps {
  workTime: number;
  restTime: number;
  theme: ThemeType; // 添加主题属性
  onSave: (workTime: number, restTime: number, theme: ThemeType) => void; // 更新保存回调
  onCancel: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  workTime,
  restTime,
  theme,
  onSave,
  onCancel
}) => {
  // 将秒转换为分钟和秒
  const initialWorkMinutes = Math.floor(workTime / 60);
  const initialWorkSeconds = workTime % 60;
  const initialRestSeconds = restTime;

  // 状态
  const [workMinutes, setWorkMinutes] = useState(initialWorkMinutes);
  const [workSeconds, setWorkSeconds] = useState(initialWorkSeconds);
  const [restSeconds, setRestSeconds] = useState(initialRestSeconds);
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(theme);

  // 处理保存
  const handleSave = () => {
    // 验证输入
    const newWorkTime = (workMinutes * 60) + workSeconds;
    const newRestTime = restSeconds;
    
    // 调用保存回调，添加主题参数
    onSave(newWorkTime, newRestTime, selectedTheme);
  };

  // 处理分钟输入变化
  const handleWorkMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 0;
    setWorkMinutes(Math.max(0, Math.min(value, 60))); // 限制0-60分钟
  };

  // 处理秒输入变化
  const handleWorkSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 0;
    setWorkSeconds(Math.max(0, Math.min(value, 59))); // 限制0-59秒
  };

  // 处理休息时间输入变化
  const handleRestSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 0;
    setRestSeconds(Math.max(0, Math.min(value, 120))); // 限制0-120秒
  };

  // 处理主题变化
  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTheme(e.target.value as ThemeType);
  };

  return (
    <div className="settings-panel">
      <h2 className="settings-title">设置</h2>
      
      <div className="settings-group">
        <label className="settings-label">工作时间</label>
        <div className="time-inputs">
          <div className="input-group">
            <input
              type="number"
              min="0"
              max="60"
              value={workMinutes}
              onChange={handleWorkMinutesChange}
              className="time-input"
            />
            <span className="time-label">分钟</span>
          </div>
          <div className="input-group">
            <input
              type="number"
              min="0"
              max="59"
              value={workSeconds}
              onChange={handleWorkSecondsChange}
              className="time-input"
            />
            <span className="time-label">秒</span>
          </div>
        </div>
      </div>
      
      <div className="settings-group">
        <label className="settings-label">休息时间</label>
        <div className="input-group">
          <input
            type="number"
            min="0"
            max="120"
            value={restSeconds}
            onChange={handleRestSecondsChange}
            className="time-input"
          />
          <span className="time-label">秒</span>
        </div>
      </div>
      
      {/* 添加主题选择部分 */}
      <div className="settings-group">
        <label className="settings-label">主题风格</label>
        <div className="theme-options">
          <div className="theme-option">
            <input
              type="radio"
              id="theme-blue"
              name="theme"
              value="blue"
              checked={selectedTheme === 'blue'}
              onChange={handleThemeChange}
            />
            <label htmlFor="theme-blue" className="theme-label">
              <span className="theme-color theme-blue-sample"></span>
              蓝色海洋
            </label>
          </div>
          
          <div className="theme-option">
            <input
              type="radio"
              id="theme-dark"
              name="theme"
              value="dark"
              checked={selectedTheme === 'dark'}
              onChange={handleThemeChange}
            />
            <label htmlFor="theme-dark" className="theme-label">
              <span className="theme-color theme-dark-sample"></span>
              暗黑优雅
            </label>
          </div>
          
          <div className="theme-option">
            <input
              type="radio"
              id="theme-warm"
              name="theme"
              value="warm"
              checked={selectedTheme === 'warm'}
              onChange={handleThemeChange}
            />
            <label htmlFor="theme-warm" className="theme-label">
              <span className="theme-color theme-warm-sample"></span>
              暖阳夏照
            </label>
          </div>
          
          <div className="theme-option">
            <input
              type="radio"
              id="theme-nature"
              name="theme"
              value="nature"
              checked={selectedTheme === 'nature'}
              onChange={handleThemeChange}
            />
            <label htmlFor="theme-nature" className="theme-label">
              <span className="theme-color theme-nature-sample"></span>
              自然清新
            </label>
          </div>
        </div>
      </div>
      
      <div className="settings-actions">
        <button className="cancel-button" onClick={onCancel}>取消</button>
        <button className="save-button" onClick={handleSave}>保存</button>
      </div>
    </div>
  );
};

export default SettingsPanel;