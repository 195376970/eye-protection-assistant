import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { Timer } from './timer';
import { BrowserControl } from './browser-control';

// 声明主窗口
let mainWindow: BrowserWindow | null = null;

// 声明计时器和浏览器控制实例
let timer: Timer | null = null;
let browserControl: BrowserControl | null = null;

// 防止多个实例运行
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // 当运行第二个实例时，将焦点设置到主窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  console.log('Creating main window...');
  // 创建主窗口
  mainWindow = new BrowserWindow({
    width: 450,
    height: 650,
    minWidth: 400,
    minHeight: 600,
    frame: false, // 无框窗口，使用自定义标题栏
    transparent: true, // 启用透明效果
    backgroundColor: '#00000000', // 完全透明背景
    show: false, // 先不显示窗口，等待ready-to-show事件
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    // 设置窗口阴影和圆角
    roundedCorners: true,
    vibrancy: 'under-window', // 尝试在支持的平台上使用vibrancy
    visualEffectState: 'active',
  });

  console.log('Preload path:', path.join(__dirname, 'preload.js'));

  console.log('Main window created, preparing to load content...');

  // 加载应用
  if (process.env.NODE_ENV === 'development') {
    // 开发环境：使用Vite开发服务器
    console.log('Development: loading dev server URL');
    
    // 添加错误处理
    mainWindow.webContents.on('did-fail-load', (_event, code, desc) => {
      console.error('Failed to load URL:', code, desc);
      // 尝试重新加载
      setTimeout(() => {
        console.log('Attempting to reload...');
        mainWindow?.loadURL('http://localhost:5173');
      }, 2000);
    });
    
    // 添加控制台日志输出
    mainWindow.webContents.on('console-message', (_event, _level, message, line, sourceId) => {
      console.log(`Renderer (${sourceId}:${line}): ${message}`);
    });
    
    // 渲染进程崩溃处理
    mainWindow.webContents.on('crashed', () => {
      console.error('Renderer process crashed!');
    });
    
    // 渲染进程挂起处理
    mainWindow.on('unresponsive', () => {
      console.error('Window became unresponsive!');
    });
    
    // 打开DevTools以便调试
    mainWindow.webContents.openDevTools({ mode: 'bottom' });
    
    // 加载渲染进程
    console.log('Loading URL: http://localhost:5173');
    mainWindow.loadURL('http://localhost:5173')
      .then(() => console.log('URL loaded successfully'))
      .catch(err => console.error('Error loading URL:', err));
  } else {
    // 生产环境：加载打包后的文件
    const htmlPath = path.join(__dirname, '../renderer/index.html');
    console.log('Production: loading HTML file:', htmlPath);
    mainWindow.loadFile(htmlPath);
  }

  // 监听窗口准备显示事件
  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show...');
    
    // 应用窗口效果
    if (mainWindow) {
      console.log('应用玻璃态效果...');
      // 设置背景色为透明，不添加黄色
      mainWindow.setBackgroundColor('rgba(0, 0, 0, 0)');
      // 设置适当的透明度
      mainWindow.setOpacity(1.0);
    }
    
    // 显示窗口
    mainWindow?.show();
    mainWindow?.focus(); // 确保窗口获得焦点
  });

  // 监听窗口显示事件
  mainWindow.on('show', () => {
    console.log('Window shown');
  });

  // 监听页面加载失败事件
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error('Page load failed:', errorCode, errorDescription);
  });

  // 监听窗口关闭事件
  mainWindow.on('closed', () => {
    console.log('Window closed');
    mainWindow = null;
  });

  // 初始化计时器
  timer = new Timer(mainWindow);

  // 初始化浏览器控制
  browserControl = new BrowserControl();
  browserControl.init().then((success) => {
    if (success) {
      console.log('🎉 浏览器控制初始化成功，可以控制视频');
      // 通知渲染进程浏览器连接状态
      if (mainWindow) {
        mainWindow.webContents.send('browser-control-status', { connected: true });
      }
    } else {
      console.log('⚠️ 浏览器控制初始化失败，无法控制视频');
      // 通知渲染进程浏览器连接状态
      if (mainWindow) {
        mainWindow.webContents.send('browser-control-status', { 
          connected: false,
          message: '无法连接到Edge浏览器，请确保以调试模式启动Edge (--remote-debugging-port=9222)'
        });
      }
      
      // 在5秒后再次尝试初始化
      setTimeout(() => {
        console.log('🔄 重新尝试初始化浏览器控制...');
        browserControl?.init().then((retrySuccess) => {
          console.log(`🔄 浏览器控制重新初始化${retrySuccess ? '成功' : '失败'}`);
          // 更新渲染进程的状态
          if (mainWindow) {
            mainWindow.webContents.send('browser-control-status', { 
              connected: retrySuccess,
              message: retrySuccess ? 
                '已成功连接到Edge浏览器' : 
                '无法连接到Edge浏览器，请手动启动并打开bilibili网站'
            });
          }
        });
      }, 5000);
    }
  });

  // 添加休息开始和结束事件的监听器
  timer.onRestStart(() => {
    // 当休息开始时暂停视频
    console.log('🎬 休息开始，尝试暂停视频...');
    if (browserControl) {
      browserControl.pauseBilibiliVideo().then(success => {
        console.log(`🎬 视频暂停${success ? '成功' : '失败'}`);
        
        // 如果第一次尝试失败，再尝试一次
        if (!success) {
          console.log('🎬 首次暂停失败，300ms后重试...');
          setTimeout(() => {
            browserControl?.pauseBilibiliVideo().then(retrySuccess => {
              console.log(`🎬 视频暂停重试${retrySuccess ? '成功' : '失败'}`);
            });
          }, 300);
        }
      });
    } else {
      console.log('🎬 浏览器控制未初始化，无法暂停视频');
    }
  });

  timer.onRestEnd(() => {
    // 当休息结束时恢复视频播放
    console.log('🎬 休息结束，尝试恢复视频播放...');
    if (browserControl) {
      browserControl.resumeBilibiliVideo().then(success => {
        console.log(`🎬 视频恢复${success ? '成功' : '失败'}`);
        
        // 如果第一次尝试失败，再尝试一次
        if (!success) {
          console.log('🎬 首次恢复失败，300ms后重试...');
          setTimeout(() => {
            browserControl?.resumeBilibiliVideo().then(retrySuccess => {
              console.log(`🎬 视频恢复重试${retrySuccess ? '成功' : '失败'}`);
            });
          }, 300);
        }
      });
    } else {
      console.log('🎬 浏览器控制未初始化，无法恢复视频');
    }
  });
}

// 应用就绪后创建窗口
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // 在macOS上，点击dock图标时没有活动窗口则创建新窗口
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 当所有窗口关闭时退出应用 (Windows & Linux)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// 注册IPC处理函数
ipcMain.handle('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('close-window', () => {
  if (mainWindow) mainWindow.close();
});

// 在这里添加计时器逻辑和浏览器控制功能
// TODO: 实现计时器模块
// TODO: 实现浏览器控制模块