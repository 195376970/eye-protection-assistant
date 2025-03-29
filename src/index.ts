/**
 * 应用程序入口文件
 */
import { app } from 'electron';
import * as path from 'path';

// 防止多实例启动
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log('应用程序已经在运行中，退出当前实例');
  app.quit();
} else {
  // 设置应用程序名称
  app.setName('护眼小助手');
  
  // 当前是否为开发环境
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // 开发环境下加载热重载模块
    try {
      require('electron-reloader')(module, { debug: true });
      console.log('已启用热重载');
    } catch (err) {
      console.error('热重载模块加载失败:', err);
    }
  }
  
  // 在 Windows 上启动时将应用图标添加到通知区
  if (process.platform === 'win32') {
    app.setAppUserModelId(app.getName());
  }
  
  // 当Electron完成初始化时导入主模块
  app.whenReady().then(() => {
    console.log('应用程序已就绪，加载主模块...');
    import('./main/main');
  });
}