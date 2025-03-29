/**
 * 计时器状态枚举
 */
export enum TimerState {
  IDLE = 0,     // 空闲
  WORKING = 1,  // 工作中
  RESTING = 2,  // 休息中
  PAUSED = 3,   // 暂停
}

/**
 * 计时器类
 * 负责管理工作和休息时间的计时
 */
export class Timer {
  private _state: TimerState = TimerState.IDLE;
  private _workTime: number = 0;
  private _restTime: number = 0;
  private _remainingTime: number = 0;
  private _intervalId: NodeJS.Timeout | null = null;
  private _lastTickTime: number = 0;
  
  // 回调函数
  private _updateCallback: ((state: TimerState, remainingTime: number, totalTime: number) => void) | null = null;
  private _restStartCallback: (() => void) | null = null;
  private _restEndCallback: (() => void) | null = null;

  /**
   * 获取当前计时器状态
   */
  get state(): TimerState {
    return this._state;
  }

  /**
   * 设置计时器更新回调
   * @param callback 回调函数
   */
  setUpdateCallback(callback: (state: TimerState, remainingTime: number, totalTime: number) => void): void {
    this._updateCallback = callback;
  }

  /**
   * 设置休息开始回调
   * @param callback 回调函数
   */
  setRestStartCallback(callback: () => void): void {
    this._restStartCallback = callback;
  }

  /**
   * 设置休息结束回调
   * @param callback 回调函数
   */
  setRestEndCallback(callback: () => void): void {
    this._restEndCallback = callback;
  }

  /**
   * 启动计时器
   * @param workTime 工作时间（秒）
   * @param restTime 休息时间（秒）
   */
  startTimer(workTime: number, restTime: number): void {
    console.log(`启动计时器: 工作时间=${workTime}秒, 休息时间=${restTime}秒`);
    
    // 如果当前是暂停状态，恢复计时器
    if (this._state === TimerState.PAUSED) {
      this.resumeTimer();
      return;
    }
    
    // 设置工作和休息时间
    this._workTime = workTime;
    this._restTime = restTime;
    this._remainingTime = workTime;
    
    // 更新状态并启动计时
    this._state = TimerState.WORKING;
    this._startTicking();
    
    // 触发更新回调
    this._triggerUpdate();
  }

  /**
   * 暂停计时器
   */
  pauseTimer(): void {
    console.log('暂停计时器');
    
    // 如果计时器正在运行，暂停它
    if (this._state === TimerState.WORKING || this._state === TimerState.RESTING) {
      this._stopTicking();
      this._state = TimerState.PAUSED;
      
      // 触发更新回调
      this._triggerUpdate();
    }
  }

  /**
   * 恢复计时器
   */
  resumeTimer(): void {
    console.log('恢复计时器');
    
    // 如果计时器处于暂停状态，恢复它
    if (this._state === TimerState.PAUSED) {
      this._startTicking();
      
      // 触发更新回调
      this._triggerUpdate();
    }
  }

  /**
   * 重置计时器
   */
  resetTimer(): void {
    console.log('重置计时器');
    
    // 停止计时并重置状态
    this._stopTicking();
    this._state = TimerState.IDLE;
    this._remainingTime = 0;
    
    // 触发更新回调
    this._triggerUpdate();
  }

  /**
   * 结束休息
   */
  finishRest(): void {
    console.log('结束休息');
    
    // 如果当前是休息状态，提前结束
    if (this._state === TimerState.RESTING) {
      this._stopTicking();
      this._state = TimerState.IDLE;
      this._remainingTime = 0;
      
      // 触发休息结束回调
      if (this._restEndCallback) {
        this._restEndCallback();
      }
      
      // 触发更新回调
      this._triggerUpdate();
    }
  }

  /**
   * 开始计时
   */
  private _startTicking(): void {
    // 先停止已有的计时器
    this._stopTicking();
    
    // 记录开始时间
    this._lastTickTime = Date.now();
    
    // 启动新计时器
    this._intervalId = setInterval(() => this._tick(), 100);
  }

  /**
   * 停止计时
   */
  private _stopTicking(): void {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  /**
   * 计时器周期函数
   */
  private _tick(): void {
    // 计算当前与上次计时的时间差
    const now = Date.now();
    const elapsed = (now - this._lastTickTime) / 1000;
    this._lastTickTime = now;
    
    // 更新剩余时间
    this._remainingTime = Math.max(0, this._remainingTime - elapsed);
    
    // 触发更新回调
    this._triggerUpdate();
    
    // 检查是否达到时间限制
    if (this._remainingTime <= 0) {
      this._handleTimeUp();
    }
  }

  /**
   * 处理时间结束
   */
  private _handleTimeUp(): void {
    // 停止计时
    this._stopTicking();
    
    // 根据当前状态进行相应处理
    if (this._state === TimerState.WORKING) {
      // 工作时间结束，进入休息时间
      console.log('工作时间结束，进入休息时间');
      this._state = TimerState.RESTING;
      this._remainingTime = this._restTime;
      
      // 触发休息开始回调
      if (this._restStartCallback) {
        this._restStartCallback();
      }
      
      // 开始休息计时
      this._startTicking();
    } else if (this._state === TimerState.RESTING) {
      // 休息时间结束，回到空闲状态
      console.log('休息时间结束');
      this._state = TimerState.IDLE;
      
      // 触发休息结束回调
      if (this._restEndCallback) {
        this._restEndCallback();
      }
    }
  }

  /**
   * 触发更新回调
   */
  private _triggerUpdate(): void {
    if (this._updateCallback) {
      const totalTime = this._state === TimerState.WORKING ? this._workTime : 
                        this._state === TimerState.RESTING ? this._restTime : 0;
      
      this._updateCallback(this._state, this._remainingTime, totalTime);
    }
  }
}