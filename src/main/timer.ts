/**
 * 计时器模块
 * 实现番茄钟工作法的工作和休息计时
 */

// 计时器状态枚举
export enum TimerState {
  IDLE = 0,     // 空闲状态
  WORKING = 1,  // 工作中
  RESTING = 2,  // 休息中
  PAUSED = 3,   // 暂停状态
}

// 计时器事件回调类型
type TimerCallbacks = {
  onUpdate: (data: { remainingTime: number; totalTime: number; state: TimerState }) => void;
  onWorkComplete: () => void;
  onRestComplete: () => void;
};

/**
 * 计时器类
 * 管理番茄钟计时器的不同状态和计时逻辑
 */
export class Timer {
  // 当前状态
  private _state: TimerState = TimerState.IDLE;
  // 工作时间和休息时间（秒）
  private workTime: number = 25 * 60;
  private restTime: number = 20;
  // 剩余时间（秒）
  private remainingTime: number = 0;
  // 计时器间隔ID
  private intervalId: NodeJS.Timeout | null = null;
  // 上次计数时间
  private lastCountTime: number = 0;
  // 事件回调
  private callbacks: TimerCallbacks;

  /**
   * 构造函数
   * @param callbacks 事件回调
   */
  constructor(callbacks: TimerCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * 获取当前状态
   */
  get state(): TimerState {
    return this._state;
  }

  /**
   * 更新状态并通知监听器
   */
  private updateState(newState: TimerState): void {
    this._state = newState;
    this.updateUI();
  }

  /**
   * 更新UI
   */
  private updateUI(): void {
    // 通过回调函数更新UI
    this.callbacks.onUpdate({
      remainingTime: this.remainingTime,
      totalTime: this._state === TimerState.WORKING ? this.workTime : this.restTime,
      state: this._state,
    });
  }

  /**
   * 启动计时器
   * @param workTime 工作时间（秒）
   * @param restTime 休息时间（秒）
   * @returns 是否成功启动
   */
  startTimer(workTime?: number, restTime?: number): boolean {
    console.log(`启动计时器: 当前状态=${this._state}, 工作时间=${workTime}, 休息时间=${restTime}`);

    // 如果已在工作中或休息中，则不重新启动
    if (this._state === TimerState.WORKING || this._state === TimerState.RESTING) {
      console.log('计时器已在运行中，无需重新启动');
      return false;
    }

    // 如果是暂停状态，恢复计时
    if (this._state === TimerState.PAUSED) {
      console.log('从暂停状态恢复计时');
      this.resumeTimer();
      return true;
    }

    // 更新工作时间和休息时间
    if (workTime !== undefined && workTime > 0) {
      this.workTime = workTime;
    }
    if (restTime !== undefined && restTime > 0) {
      this.restTime = restTime;
    }

    // 从空闲状态开始，设置为工作时间
    this.remainingTime = this.workTime;
    this.updateState(TimerState.WORKING);
    
    // 开始计时
    this.startCounting();
    return true;
  }

  /**
   * 暂停计时器
   * @returns 是否成功暂停
   */
  pauseTimer(): boolean {
    // 只有在工作中才能暂停
    if (this._state !== TimerState.WORKING) {
      console.log(`当前状态(${this._state})不支持暂停操作`);
      return false;
    }

    // 暂停计时
    this.stopCounting();
    this.updateState(TimerState.PAUSED);
    return true;
  }

  /**
   * 恢复计时器
   * @returns 是否成功恢复
   */
  private resumeTimer(): boolean {
    // 只有暂停状态才能恢复
    if (this._state !== TimerState.PAUSED) {
      console.log(`当前状态(${this._state})不支持恢复操作`);
      return false;
    }

    // 恢复为工作状态并重新开始计时
    this.updateState(TimerState.WORKING);
    this.startCounting();
    return true;
  }

  /**
   * 重置计时器
   * @returns 是否成功重置
   */
  resetTimer(): boolean {
    // 停止计时
    this.stopCounting();
    // 重置状态为空闲
    this.updateState(TimerState.IDLE);
    // 重置剩余时间
    this.remainingTime = 0;
    this.updateUI();
    return true;
  }

  /**
   * 强制完成休息
   * @returns 是否成功完成休息
   */
  finishRest(): boolean {
    if (this._state !== TimerState.RESTING) {
      console.log(`当前状态(${this._state})不是休息状态，无法完成休息`);
      return false;
    }

    console.log('强制完成休息时间');
    this.stopCounting();
    this.updateState(TimerState.IDLE);
    this.remainingTime = 0;
    this.updateUI();
    this.callbacks.onRestComplete();
    return true;
  }

  /**
   * 停止计时器
   */
  stopTimer(): void {
    this.stopCounting();
    this.updateState(TimerState.IDLE);
  }

  /**
   * 开始倒计时
   */
  private startCounting(): void {
    // 在开始倒计时前停止已存在的定时器
    this.stopCounting();
    
    // 记录当前时间
    this.lastCountTime = Date.now();
    
    // 创建一个新的定时器
    this.intervalId = setInterval(() => this.tick(), 100); // 每100毫秒更新一次
  }

  /**
   * 停止倒计时
   */
  private stopCounting(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * 倒计时执行逻辑
   */
  private tick(): void {
    // 计算实际经过的时间（秒）
    const now = Date.now();
    const elapsed = (now - this.lastCountTime) / 1000;
    this.lastCountTime = now;

    // 更新剩余时间
    this.remainingTime = Math.max(0, this.remainingTime - elapsed);
    
    // 更新UI
    this.updateUI();

    // 检查是否完成
    if (this.remainingTime <= 0) {
      this.handleTimeComplete();
    }
  }

  /**
   * 处理时间完成的逻辑
   */
  private handleTimeComplete(): void {
    this.stopCounting();

    if (this._state === TimerState.WORKING) {
      // 工作时间结束，转入休息时间
      console.log('工作时间结束，转入休息时间');
      this.remainingTime = this.restTime;
      this.updateState(TimerState.RESTING);
      this.startCounting();
      this.callbacks.onWorkComplete();
    } else if (this._state === TimerState.RESTING) {
      // 休息时间结束，回到初始状态
      console.log('休息时间结束，回到初始状态');
      this.updateState(TimerState.IDLE);
      this.callbacks.onRestComplete();
    }
  }
}
