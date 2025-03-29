import { app, BrowserWindow, ipcMain, screen, shell } from 'electron';
import * as path from 'path';
import { Timer, TimerState } from './timer';
import { BrowserControl } from './browser-control';

// 声明主窗口和提醒窗口
let mainWindow: BrowserWindow | null = null;
let reminderWindow: BrowserWindow | null = null;

// 实例化计时器和浏览器控制器
const timer = new Timer();
const browserControl = new BrowserControl();

// 创建主窗口
function createMainWindow() {
  // 获取屏幕尺寸
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const windowWidth = 360;
  const windowHeight = 500;
  
  // 创建窗口
  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: width - windowWidth - 20,
    y: 20,
    frame: false,
    resizable: false,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../../assets/icon.png'),
  });

  // 加载主窗口HTML
  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  } else {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // 处理外部链接打开方式
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // 窗口关闭时清空引用
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 设置计时器更新回调
  timer.setUpdateCallback((state: TimerState, remainingTime: number, totalTime: number) => {
    if (mainWindow) {
      mainWindow.webContents.send('timer-update', {
        state,
        remainingTime,
        totalTime,
      });
    }

    if (reminderWindow && state === TimerState.RESTING) {
      reminderWindow.webContents.send('timer-update', {
        remainingTime,
        totalTime,
      });
    }
  });

  // 设置计时器休息开始回调
  timer.setRestStartCallback(() => {
    if (mainWindow) {
      mainWindow.webContents.send('rest-start');
    }
    createReminderWindow();
  });

  // 设置计时器休息结束回调
  timer.setRestEndCallback(() => {
    if (mainWindow) {
      mainWindow.webContents.send('rest-end');
    }
    if (reminderWindow) {
      reminderWindow.close();
      reminderWindow = null;
    }
  });

  // 尝试连接浏览器
  connectBrowser();
}

// 创建提醒窗口
function createReminderWindow() {
  // 获取屏幕尺寸
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  // 如果已经存在提醒窗口，先关闭它
  if (reminderWindow) {
    reminderWindow.close();
    reminderWindow = null;
  }

  // 创建全屏提醒窗口
  reminderWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    frame: false,
    fullscreen: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // 加载提醒窗口HTML
  if (app.isPackaged) {
    reminderWindow.loadFile(path.join(__dirname, '../renderer/reminder.html'));
  } else {
    reminderWindow.loadURL('http://localhost:5173/reminder.html');
    // reminderWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // 窗口关闭时清空引用
  reminderWindow.on('closed', () => {
    reminderWindow = null;
  });
}

// 连接浏览器
async function connectBrowser() {
  try {
    const result = await browserControl.connect();
    if (mainWindow) {
      mainWindow.webContents.send('browser-control-status', {
        connected: result,
        message: result ? '浏览器连接成功' : '浏览器连接失败，部分功能可能不可用',
      });
    }

    // 如果连接成功，启动监听视频播放状态
    if (result) {
      browserControl.startVideoMonitoring((isPlaying) => {
        if (isPlaying && timer.state === TimerState.WORKING) {
          console.log('检测到视频播放，暂停计时器');
          timer.pauseTimer();
          if (mainWindow) {
            mainWindow.webContents.send('browser-control-status', {
              connected: true,
              message: '检测到视频播放，已暂停计时器',
            });
          }
        }
      });
    }
  } catch (error) {
    console.error('连接浏览器出错:', error);
    if (mainWindow) {
      mainWindow.webContents.send('browser-control-status', {
        connected: false,
        message: '浏览器连接错误，请确保浏览器已启动',
      });
    }
  }
}

// 应用准备就绪时创建窗口
app.whenReady().then(() => {
  createMainWindow();

  // macOS应用激活时重新创建窗口（如果不存在）
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// 所有窗口关闭时退出应用（macOS除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 注册IPC事件处理器
ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
  return true;
});

ipcMain.handle('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
  return true;
});

ipcMain.handle('start-timer', (_event, workTime: number, restTime: number) => {
  timer.startTimer(workTime, restTime);
  return true;
});

ipcMain.handle('pause-timer', () => {
  timer.pauseTimer();
  return true;
});

ipcMain.handle('reset-timer', () => {
  timer.resetTimer();
  return true;
});

ipcMain.handle('finish-rest', () => {
  timer.finishRest();
  return true;
});
