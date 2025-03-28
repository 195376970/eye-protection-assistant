import { contextBridge, ipcRenderer } from 'electron';

// 添加日志
console.log('Preload script is running');

// 检查IPC连接
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM content loaded in preload');
});

// 向渲染进程暴露受控的API
contextBridge.exposeInMainWorld('electronAPI', {
  // 窗口控制
  minimizeWindow: () => {
    console.log('Minimize window called');
    return ipcRenderer.invoke('minimize-window');
  },
  closeWindow: () => {
    console.log('Close window called');
    return ipcRenderer.invoke('close-window');
  },

  // 计时器控制
  startTimer: (workTime: number, restTime: number) => {
    console.log(`Start timer called: work=${workTime}, rest=${restTime}`);
    return ipcRenderer.invoke('start-timer', workTime, restTime);
  },
  pauseTimer: () => {
    console.log('Pause timer called');
    return ipcRenderer.invoke('pause-timer');
  },
  resetTimer: () => {
    console.log('Reset timer called');
    return ipcRenderer.invoke('reset-timer');
  },
  finishRest: () => {
    console.log('Finish rest called');
    return ipcRenderer.invoke('finish-rest');
  },
  
  // 事件监听器
  onTimerUpdate: (callback: (data: any) => void) => {
    console.log('Timer update listener registered');
    const listener = (_event: any, data: any) => {
      console.log('Timer update received:', data);
      callback(data);
    };
    ipcRenderer.on('timer-update', listener);
    return () => ipcRenderer.removeListener('timer-update', listener);
  },
  
  onRestStart: (callback: () => void) => {
    console.log('Rest start listener registered');
    const listener = () => {
      console.log('Rest start received');
      callback();
    };
    ipcRenderer.on('rest-start', listener);
    return () => ipcRenderer.removeListener('rest-start', listener);
  },
  
  onRestEnd: (callback: () => void) => {
    console.log('Rest end listener registered');
    const listener = () => {
      console.log('Rest end received');
      callback();
    };
    ipcRenderer.on('rest-end', listener);
    return () => ipcRenderer.removeListener('rest-end', listener);
  },
  
  // 浏览器控制状态
  onBrowserControlStatus: (callback: (status: { connected: boolean, message?: string }) => void) => {
    console.log('Browser control status listener registered');
    const listener = (_event: any, status: { connected: boolean, message?: string }) => {
      console.log('Browser control status received:', status);
      callback(status);
    };
    ipcRenderer.on('browser-control-status', listener);
    return () => ipcRenderer.removeListener('browser-control-status', listener);
  },
});