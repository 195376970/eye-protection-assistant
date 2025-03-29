// 测试全局设置

// 模拟Electron的ipcMain和ipcRenderer
ject.mock('electron', () => {
  const mockIpcMain = {
    handle: jest.fn(),
    on: jest.fn(),
  };
  
  const mockIpcRenderer = {
    invoke: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
  };
  
  const mockContextBridge = {
    exposeInMainWorld: jest.fn(),
  };
  
  const mockBrowserWindow = jest.fn().mockImplementation(() => ({
    loadFile: jest.fn(),
    loadURL: jest.fn(),
    webContents: {
      openDevTools: jest.fn(),
      send: jest.fn(),
      setWindowOpenHandler: jest.fn(),
    },
    on: jest.fn(),
    close: jest.fn(),
    minimize: jest.fn(),
  }));
  
  return {
    app: {
      whenReady: jest.fn().mockResolvedValue({}),
      on: jest.fn(),
      quit: jest.fn(),
      requestSingleInstanceLock: jest.fn().mockReturnValue(true),
      setName: jest.fn(),
      getName: jest.fn().mockReturnValue('TestApp'),
      setAppUserModelId: jest.fn(),
      isPackaged: false,
    },
    BrowserWindow: mockBrowserWindow,
    ipcMain: mockIpcMain,
    ipcRenderer: mockIpcRenderer,
    contextBridge: mockContextBridge,
    screen: {
      getPrimaryDisplay: jest.fn().mockReturnValue({
        workAreaSize: { width: 1920, height: 1080 },
      }),
    },
    shell: {
      openExternal: jest.fn(),
    },
  };
});

// 模拟chrome-remote-interface
jest.mock('chrome-remote-interface', () => {
  return {
    __esModule: true,
    default: jest.fn().mockResolvedValue({
      Page: { enable: jest.fn() },
      Runtime: { 
        enable: jest.fn(),
        evaluate: jest.fn().mockResolvedValue({
          result: { value: { count: 0, details: [] } }
        })
      },
      close: jest.fn(),
    }),
    List: jest.fn().mockResolvedValue([{ id: '1', type: 'page', url: 'https://example.com' }]),
  };
});

// 模拟控制台
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// 模拟定时器
jest.useFakeTimers();

// 模拟随机数
global.Math.random = jest.fn().mockReturnValue(0.5);

// 模拟Date.now
const mockNow = 1600000000000; // 固定的时间戳
global.Date.now = jest.fn().mockReturnValue(mockNow);