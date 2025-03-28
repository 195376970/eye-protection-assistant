import { app, BrowserWindow, ipcMain, shell } from 'electron';
import * as path from 'path';
import { Timer, TimerState } from './timer';
import { BrowserControl } from './browser-control';

interface WindowManager {
  mainWindow: BrowserWindow | null;
  reminderWindow: BrowserWindow | null;
  createMainWindow: () => void;
  createReminderWindow: () => void;
  closeReminderWindow: () => void;
}

// 窗口管理器
const windowManager: WindowManager = {
  mainWindow: null,
  reminderWindow: null,
  
  // 创建主窗口
  createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 380,
      height: 580,
      frame: false,
      transparent: true,
      resizable: false,
      webPreferences: {
        preload: path.join(__dirname, '../preload/preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // 开发环境加载本地URL，生产环境加载打包后的文件
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL('http://localhost:5173/src/renderer/index.html');
      // 开发过程中打开开发者工具进行调试
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    // 监听窗口关闭事件
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // 阻止创建新窗口，而是在默认浏览器中打开链接
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });
  },
  
  // 创建提醒窗口
  createReminderWindow() {
    if (this.reminderWindow) {
      this.reminderWindow.focus();
      return;
    }

    this.reminderWindow = new BrowserWindow({
      width: 1000,
      height: 800,
      show: false,
      frame: false,
      fullscreen: true,
      webPreferences: {
        preload: path.join(__dirname, '../preload/preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // 加载提醒页面
    if (process.env.NODE_ENV === 'development') {
      this.reminderWindow.loadURL('http://localhost:5173/src/renderer/reminder.html');
      // 开发过程中打开开发者工具进行调试
      this.reminderWindow.webContents.openDevTools();
    } else {
      this.reminderWindow.loadFile(path.join(__dirname, '../renderer/reminder.html'));
    }

    // 准备好后显示窗口
    this.reminderWindow.once('ready-to-show', () => {
      this.reminderWindow?.show();
      this.reminderWindow?.focus();
    });

    // 监听窗口关闭事件
    this.reminderWindow.on('closed', () => {
      this.reminderWindow = null;
    });
  },
  
  // 关闭提醒窗口
  closeReminderWindow() {
    if (this.reminderWindow) {
      this.reminderWindow.close();
      this.reminderWindow = null;
    }
  },
};

// 初始化计时器
const timer = new Timer({
  onUpdate: (data) => {
    // 向所有窗口发送计时器更新
    windowManager.mainWindow?.webContents.send('timer-update', data);
    windowManager.reminderWindow?.webContents.send('timer-update', data);
  },
  onWorkComplete: () => {
    console.log('工作时间结束');
    // 创建提醒窗口
    windowManager.createReminderWindow();
    // 通知所有窗口休息开始
    windowManager.mainWindow?.webContents.send('rest-start');
    windowManager.reminderWindow?.webContents.send('rest-start');
  },
  onRestComplete: () => {
    console.log('休息时间结束');
    // 关闭提醒窗口
    windowManager.closeReminderWindow();
    // 通知主窗口休息结束
    windowManager.mainWindow?.webContents.send('rest-end');
  },
});

// 初始化浏览器控制
const browserControl = new BrowserControl({
  onStatusUpdate: (status) => {
    // 向主窗口发送浏览器控制状态更新
    windowManager.mainWindow?.webContents.send('browser-control-status', status);
  },
});

// 进程启动
(async () => {
  // 监听Electron应用就绪完成
  await app.whenReady();

  // 创建主窗口
  windowManager.createMainWindow();

  // 尝试连接浏览器
  try {
    console.log('连接浏览器...');
    await browserControl.connect();
    console.log('浏览器连接成功！');
  } catch (error) {
    console.error('浏览器连接失败：', error);
  }

  // 监听应用激活
  app.on('activate', () => {
    // macOS上点击dock图标时创建窗口
    if (windowManager.mainWindow === null) {
      windowManager.createMainWindow();
    }
  });

  // 注册进程间通信事件
  registerIpcHandlers();
})();

// 应用关闭
 app.on('window-all-closed', () => {
  // 除了 macOS 外，当所有窗口关闭时退出应用
  if (process.platform !== 'darwin') {
    browserControl.disconnect();
    app.quit();
  }
});

// 应用退出前清理资源
app.on('before-quit', () => {
  timer.stopTimer();
  browserControl.disconnect();
});

// 注册 IPC 处理程序
function registerIpcHandlers() {
  // 窗口控制
  ipcMain.handle('minimize-window', () => {
    if (windowManager.mainWindow) {
      windowManager.mainWindow.minimize();
      return true;
    }
    return false;
  });

  ipcMain.handle('close-window', () => {
    if (windowManager.mainWindow) {
      windowManager.mainWindow.close();
      return true;
    }
    return false;
  });

  // 计时器控制
  ipcMain.handle('start-timer', (_event, workTime, restTime) => {
    return timer.startTimer(workTime, restTime);
  });

  ipcMain.handle('pause-timer', () => {
    return timer.pauseTimer();
  });

  ipcMain.handle('reset-timer', () => {
    return timer.resetTimer();
  });

  ipcMain.handle('finish-rest', () => {
    // 提前完成休息
    if (timer.state === TimerState.RESTING) {
      timer.finishRest();
      return true;
    }
    return false;
  });
}
