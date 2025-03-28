import { BrowserWindow, ipcMain, screen } from 'electron';
import path from 'path';

// 计时器状态枚举
enum TimerState {
  IDLE,
  WORKING,
  RESTING,
  PAUSED
}

// 事件回调类型
type EventCallback = () => void;

// 计时器类
export class Timer {
  private state: TimerState = TimerState.IDLE;
  private workTime: number = 25 * 60; // 默认25分钟工作时间（秒）
  private restTime: number = 20; // 默认20秒休息时间
  private remainingTime: number = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private mainWindow: BrowserWindow | null = null;
  private reminderWindow: BrowserWindow | null = null;
  
  // 事件回调
  private restStartCallbacks: EventCallback[] = [];
  private restEndCallbacks: EventCallback[] = [];

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.setupIpcHandlers();
  }

  // 设置IPC处理程序
  private setupIpcHandlers() {
    ipcMain.handle('start-timer', (_event, workTime, restTime) => {
      this.startTimer(workTime, restTime);
      return true;
    });

    ipcMain.handle('pause-timer', () => {
      this.pauseTimer();
      return true;
    });

    ipcMain.handle('reset-timer', () => {
      this.resetTimer();
      return true;
    });

    ipcMain.handle('finish-rest', () => {
      this.finishRest();
      return true;
    });
  }

  // 注册休息开始事件监听器
  public onRestStart(callback: EventCallback): void {
    this.restStartCallbacks.push(callback);
  }

  // 注册休息结束事件监听器
  public onRestEnd(callback: EventCallback): void {
    this.restEndCallbacks.push(callback);
  }

  // 开始计时器
  public startTimer(workTime?: number, restTime?: number) {
    console.log(`startTimer调用，当前状态: ${this.state}，剩余时间: ${this.remainingTime}`);
    if (workTime !== undefined) this.workTime = workTime;
    if (restTime !== undefined) this.restTime = restTime;

    if (this.state === TimerState.PAUSED) {
      // 如果是暂停状态，恢复计时
      console.log('从暂停状态恢复计时，剩余时间:', this.remainingTime);
      // 维持之前的状态，继续之前的工作或休息
      if (this.remainingTime === 0) {
        // 防止出现剩余时间为0的情况
        this.remainingTime = this.workTime;
        this.state = TimerState.WORKING;
      } else {
        this.state = TimerState.WORKING; // 默认恢复到工作状态
      }
    } else {
      // 重新开始计时
      console.log('重新开始计时');
      this.state = TimerState.WORKING;
      this.remainingTime = this.workTime;
    }

    // 强制更新UI，确保状态显示正确
    this.updateTimerUI();
    // 然后开始计数
    this.startCounting();
  }

  // 暂停计时器
  public pauseTimer() {
    console.log(`pauseTimer调用，当前状态: ${this.state}`);
    
    if (this.state === TimerState.WORKING || this.state === TimerState.RESTING) {
      console.log('设置状态为PAUSED，当前剩余时间:', this.remainingTime);
      this.state = TimerState.PAUSED;
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      // 确保在暂停后立即更新UI状态
      this.updateTimerUI();
    } else {
      console.log(`当前状态 ${this.state} 不允许暂停`);
    }
  }

  // 重置计时器
  public resetTimer() {
    this.state = TimerState.IDLE;
    this.remainingTime = 0;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.updateTimerUI();
    this.closeReminderWindow();
  }

  // 结束休息
  public finishRest() {
    this.closeReminderWindow();
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.mainWindow?.webContents.send('rest-end');
    
    // 触发休息结束事件
    this.triggerRestEndCallbacks();
    
    // 休息结束后，自动开始新的工作时间倒计时
    console.log('休息结束，自动开始新的工作时间倒计时');
    this.state = TimerState.WORKING;
    this.remainingTime = this.workTime;
    this.updateTimerUI(); // 立即更新UI
    this.startCounting(); // 开始新的计时
  }

  // 开始计数
  private startCounting() {
    console.log('开始计数，当前状态:', this.state, '剩余时间:', this.remainingTime);
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
        this.updateTimerUI();
      } else {
        if (this.state === TimerState.WORKING) {
          console.log('工作时间结束，开始休息');
          this.startRest();
        } else if (this.state === TimerState.RESTING) {
          console.log('休息时间结束');
          this.finishRest();
        } else {
          console.log('计时器到达零，但状态既不是工作也不是休息:', this.state);
          // 异常情况处理，重置为工作状态
          this.state = TimerState.WORKING;
          this.remainingTime = this.workTime;
          this.updateTimerUI();
        }
      }
    }, 1000);
  }

  // 开始休息
  private startRest() {
    this.state = TimerState.RESTING;
    this.remainingTime = this.restTime;
    this.showReminderWindow();
    this.mainWindow?.webContents.send('rest-start');
    
    // 触发休息开始事件
    this.triggerRestStartCallbacks();
  }

  // 触发休息开始事件回调
  private triggerRestStartCallbacks() {
    for (const callback of this.restStartCallbacks) {
      try {
        callback();
      } catch (error) {
        console.error('执行休息开始回调时出错:', error);
      }
    }
  }

  // 触发休息结束事件回调
  private triggerRestEndCallbacks() {
    for (const callback of this.restEndCallbacks) {
      try {
        callback();
      } catch (error) {
        console.error('执行休息结束回调时出错:', error);
      }
    }
  }

  // 更新计时器UI
  private updateTimerUI() {
    console.log(`发送UI更新：状态=${this.state}，剩余时间=${this.remainingTime}`);
    if (this.mainWindow) {
      this.mainWindow.webContents.send('timer-update', {
        state: this.state,
        remainingTime: this.remainingTime,
        totalTime: this.state === TimerState.WORKING ? this.workTime : this.restTime
      });
    }

    if (this.reminderWindow && this.state === TimerState.RESTING) {
      this.reminderWindow.webContents.send('rest-timer-update', {
        remainingTime: this.remainingTime,
        totalTime: this.restTime
      });
    }
  }

  // 显示提醒窗口
  private showReminderWindow() {
    if (this.reminderWindow) {
      this.reminderWindow.focus();
      return;
    }

    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    
    this.reminderWindow = new BrowserWindow({
      width,
      height,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: false,
      fullscreen: true,
      closable: true,
      movable: false,
      resizable: false,
      hasShadow: false,
      webPreferences: {
        preload: path.join(__dirname, '../preload/preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
      // 设置窗口级别为屏幕保护级别，确保在所有应用之上
      type: 'normal', // 使用normal类型而不是使用screen-saver类型，避免某些兼容性问题
    });

    // 设置窗口为顶层，确保在全屏视频上方显示
    this.reminderWindow.setAlwaysOnTop(true, 'screen-saver', 1);
    
    if (process.env.NODE_ENV === 'development') {
      this.reminderWindow.loadURL('http://localhost:5173/reminder.html');
    } else {
      this.reminderWindow.loadFile(path.join(__dirname, '../renderer/reminder.html'));
    }

    // 窗口加载完成后，再次确保窗口在最顶层
    this.reminderWindow.webContents.on('did-finish-load', () => {
      if (this.reminderWindow) {
        this.reminderWindow.setAlwaysOnTop(true, 'screen-saver', 1);
        this.reminderWindow.focus();
        
        // 额外设置显示在全屏视频上方
        setTimeout(() => {
          if (this.reminderWindow) {
            this.reminderWindow.setAlwaysOnTop(true, 'screen-saver', 1);
            this.reminderWindow.focus();
          }
        }, 300);
      }
    });

    this.reminderWindow.on('closed', () => {
      this.reminderWindow = null;
      if (this.state === TimerState.RESTING) {
        this.finishRest();
      }
    });
  }

  // 关闭提醒窗口
  private closeReminderWindow() {
    if (this.reminderWindow) {
      this.reminderWindow.close();
      this.reminderWindow = null;
    }
  }
}