import { exec } from 'child_process';
import CDP from 'chrome-remote-interface';
import * as CDPModule from 'chrome-remote-interface';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { net } from 'electron';

// Edge browser path (Windows)
const EDGE_PATH_DEFAULT = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
// 备用路径，有些用户可能安装在不同位置
const EDGE_PATH_ALTERNATIVE = 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe';

export class BrowserControl {
  private debugPort: number = 9222;
  private isControlling: boolean = false;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private retryDelay: number = 2000; // 2秒
  private edgePath: string = '';

  // Initialize browser control
  public async init() {
    try {
      console.log('📢 初始化浏览器控制...');
      this.retryCount = 0;
      
      // 确定Edge浏览器路径
      this.edgePath = await this.findEdgePath();
      if (!this.edgePath) {
        console.error('📢 找不到Edge浏览器，请确保已安装Microsoft Edge');
        return false;
      }
      
      // 检查端口是否被占用
      await this.ensurePortAvailable();

      // 检查是否已有Edge浏览器在运行
      const isEdgeRunning = await this.checkIfEdgeIsRunning();
      if (isEdgeRunning) {
        console.log('📢 检测到Edge浏览器正在运行');
        
        // 检查是否在调试模式下运行
        const isDebugModeActive = await this.isDebugPortActive();
        if (isDebugModeActive) {
          console.log('📢 Edge浏览器已在调试模式下运行，尝试直接连接');
        } else {
          console.log('📢 Edge浏览器运行中但未开启调试端口，尝试启动调试模式实例');
          // 启动新的Edge实例，带调试参数
          await this.startEdgeWithDebugger();
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } else {
        console.log('📢 未检测到运行中的Edge浏览器，尝试启动...');
        // 启动浏览器
        await this.forceStartEdgeWithDebugger();
        // 等待浏览器启动
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      // 尝试连接到Chrome DevTools Protocol
      return await this.connectWithRetry();
    } catch (error) {
      console.error('📢 初始化浏览器控制出错:', error);
      return false;
    }
  }

  // 查找Edge浏览器路径
  private async findEdgePath(): Promise<string> {
    // 先检查默认路径
    if (fs.existsSync(EDGE_PATH_DEFAULT)) {
      return EDGE_PATH_DEFAULT;
    }
    
    // 检查备用路径
    if (fs.existsSync(EDGE_PATH_ALTERNATIVE)) {
      return EDGE_PATH_ALTERNATIVE;
    }
    
    // 通过命令查找Edge路径
    return new Promise((resolve) => {
      if (process.platform === 'win32') {
        exec('where msedge', (error, stdout) => {
          if (!error && stdout.trim()) {
            resolve(stdout.trim());
          } else {
            console.log('📢 通过where命令找不到Edge，尝试通过注册表查找');
            // 可以尝试从注册表获取，但复杂度较高
            resolve('');
          }
        });
      } else {
        // 非Windows系统，Edge路径可能不同
        resolve('');
      }
    });
  }

  // 检查调试端口是否已经激活
  private async isDebugPortActive(): Promise<boolean> {
    return new Promise((resolve) => {
      const request = net.request({
        method: 'GET',
        url: `http://localhost:${this.debugPort}/json/version`
      });
      
      request.on('response', (response) => {
        if (response.statusCode === 200) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
      
      request.on('error', () => {
        resolve(false);
      });
      
      request.end();
    });
  }

  // 确保端口可用
  private async ensurePortAvailable(): Promise<void> {
    // 检查端口是否被占用但非Edge使用
    const isActive = await this.isDebugPortActive();
    if (!isActive) {
      // 端口未活跃，可以使用
      return;
    }
    
    try {
      // 尝试连接到端口，检查是否是Edge浏览器
      // 尝试获取目标列表，如果成功且有页面类型，则认为是Edge浏览器
      try {
        const targets = await CDPModule.List({ port: this.debugPort });
        const hasPageTargets = targets.some((target: any) => target.type === 'page');
        if (hasPageTargets) {
          console.log('📢 检测到Edge浏览器已在调试端口运行');
          return;
        }
      } catch (listError) {
        console.log('📢 获取调试目标失败，可能不是Edge浏览器或连接问题');
      }
      
      // 端口被其他程序占用，尝试使用其他端口
      for (let port = 9223; port < 9230; port++) {
        const isPortActive = await this.checkPort(port);
        if (!isPortActive) {
          console.log(`📢 端口${this.debugPort}被占用，改用端口${port}`);
          this.debugPort = port;
          return;
        }
      }
      console.error('📢 无法找到可用的调试端口');
    } catch (error) {
      // 连接失败，可能非Edge使用或无效连接
      console.log('📢 端口连接测试失败，尝试使用其他端口');
      this.debugPort = 9223; // 尝试使用备用端口
    }
  }

  // 检查端口是否可用
  private async checkPort(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const request = net.request({
        method: 'GET',
        url: `http://localhost:${port}/json/version`
      });
      
      request.on('response', () => {
        resolve(false); // 端口被占用
      });
      
      request.on('error', () => {
        resolve(true); // 端口可用
      });
      
      request.end();
    });
  }

  // 使用重试机制连接到Edge浏览器
  private async connectWithRetry(): Promise<boolean> {
    while (this.retryCount < this.maxRetries) {
      try {
        console.log(`📢 连接尝试 #${this.retryCount + 1}/${this.maxRetries}`);
        const connected = await this.connectToEdge();
        if (connected) {
          return true;
        }
        
        // 连接失败，增加重试计数
        this.retryCount++;
        
        if (this.retryCount < this.maxRetries) {
          console.log(`📢 连接失败，${this.retryDelay / 1000}秒后重试...`);
          // 在重试前尝试重启浏览器
          if (this.retryCount > 1) {
            await this.forceStartEdgeWithDebugger();
          }
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        }
      } catch (error) {
        console.error('📢 连接过程中出错:', error);
        this.retryCount++;
        if (this.retryCount < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        }
      }
    }
    
    console.error(`📢 已尝试${this.maxRetries}次连接，全部失败`);
    return false;
  }

  // Check if Edge browser is running
  private checkIfEdgeIsRunning(): Promise<boolean> {
    return new Promise((resolve) => {
      const command = process.platform === 'win32' 
        ? 'tasklist /fi "imagename eq msedge.exe"' 
        : 'ps -ax | grep msedge';
      
      exec(command, (error, stdout) => {
        if (error) {
          console.error('📢 检查Edge进程时出错:', error);
          resolve(false);
          return;
        }

        const isRunning = stdout.toLowerCase().includes('msedge.exe');
        console.log(`📢 Edge浏览器${isRunning ? '正在运行' : '未运行'}`);
        resolve(isRunning);
      });
    });
  }

  // Connect to Edge browser's debugging port
  private async connectToEdge(): Promise<boolean> {
    try {
      console.log(`📢 尝试连接到Edge浏览器调试端口: ${this.debugPort}`);
      
      // 先测试端口是否可连接
      const isAvailable = await this.isDebugPortActive();
      if (!isAvailable) {
        console.log('📢 调试端口未激活，检查Edge浏览器是否正在运行');
        const isEdgeRunning = await this.checkIfEdgeIsRunning();
        
        if (isEdgeRunning) {
          // Edge已经在运行，但没有开启调试端口，尝试重启
          console.log('📢 Edge浏览器已经在运行，但未开启调试端口，尝试重启浏览器');
          await this.forceStartEdgeWithDebugger();
        } else {
          // Edge没有运行，启动它
          console.log('📢 Edge浏览器未运行，尝试启动...');
          await this.forceStartEdgeWithDebugger();
        }
        
        // 等待浏览器启动
        console.log('📢 等待浏览器启动和调试端口激活...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      // List available Chrome debugging targets
      const targets = await CDPModule.List({ port: this.debugPort });
      console.log(`📢 找到${targets.length}个可调试目标`);
      
      // 显示所有目标的URL和类型
      targets.forEach((target, index) => {
        console.log(`📢 目标 #${index + 1}:`, {
          type: target.type,
          url: target.url.substring(0, 100) // 限制长度
        });
      });
      
      // 如果至少找到一个页面目标，认为连接成功
      const pageTargets = targets.filter((target: any) => 
        target.type === 'page');
      
      if (pageTargets.length > 0) {
        console.log('📢 连接成功');
        this.isControlling = true;
        return true;
      } else {
        console.log('📢 未找到可用页面，请在Edge浏览器中打开任意网页');
        this.isControlling = false;
        return false;
      }
    } catch (error) {
      console.error('📢 连接到Edge浏览器失败:', error);
      this.isControlling = false;
      return false;
    }
  }

  // 强制以调试模式启动Edge浏览器
  private async forceStartEdgeWithDebugger(): Promise<void> {
    try {
      // 首先尝试以更温和的方式启动新的Edge实例
      console.log('📢 尝试启动Edge浏览器调试模式而不关闭现有实例...');
      try {
        await this.startEdgeWithDebugger();
        // 给一点时间启动
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 检查是否成功启动
        const isActive = await this.isDebugPortActive();
        if (isActive) {
          console.log('📢 成功启动Edge浏览器调试模式');
          return;
        }
      } catch (startError) {
        console.log('📢 温和启动方式失败，尝试更强制的方法');
      }
      
      // 只有在温和方式失败时才尝试关闭并重启
      if (process.platform === 'win32') {
        console.log('📢 警告：将关闭所有Edge浏览器实例');
        
        // 关闭现有Edge进程，避免冲突
        await new Promise<void>((resolve) => {
          exec('taskkill /f /im msedge.exe', (error) => {
            if (error) {
              console.log('📢 关闭Edge浏览器失败或无运行中实例');
            } else {
              console.log('📢 已成功关闭Edge浏览器');
            }
            // 无论成功失败都继续
            resolve();
          });
        });
        
        // 给进程一些时间完全关闭
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // 直接启动Edge而不指定用户数据目录，这样会使用默认的用户配置
      const command = `"${this.edgePath}" --remote-debugging-port=${this.debugPort}`;
      console.log('📢 启动Edge命令:', command);
      
      // 使用Promise但不等待完成，因为exec会等待进程结束
      return new Promise((resolve) => {
        const childProcess = exec(command, (error) => {
          if (error) {
            console.error('📢 启动Edge浏览器失败:', error);
          }
        });
        
        // 不需要等待进程退出，只需确认它已经启动
        setTimeout(() => {
          console.log('📢 Edge浏览器启动命令已执行');
          resolve();
        }, 1000);
      });
    } catch (error) {
      console.error('📢 启动Edge失败:', error);
      throw error;
    }
  }

  // 启动Edge浏览器的调试模式但不强制关闭现有实例
  private async startEdgeWithDebugger(): Promise<void> {
    try {
      // 使用--new-window参数打开新窗口而不是替换现有窗口
      const command = `"${this.edgePath}" --remote-debugging-port=${this.debugPort} --new-window about:blank`;
      console.log('📢 启动Edge调试模式命令:', command);
      
      return new Promise((resolve) => {
        const childProcess = exec(command, (error) => {
          if (error) {
            console.error('📢 启动Edge调试模式失败:', error);
          }
        });
        
        setTimeout(() => {
          console.log('📢 Edge调试模式启动命令已执行');
          resolve();
        }, 1000);
      });
    } catch (error) {
      console.error('📢 启动Edge调试模式失败:', error);
      throw error;
    }
  }

  // Pause Bilibili video
  public async pauseBilibiliVideo() {
    console.log('📢 尝试暂停bilibili视频...');
    
    if (!this.isControlling) {
      console.log('📢 浏览器控制未初始化，无法暂停视频');
      
      // 尝试重新连接
      console.log('📢 尝试重新连接浏览器...');
      const result = await this.connectToEdge();
      if (!result) {
        console.log('📢 重新连接失败，无法暂停视频');
        return false;
      }
    }
    
    try {
      console.log('📢 正在查找bilibili标签页');
      const targets = await CDPModule.List({ port: this.debugPort });
      
      // Find Bilibili-related tabs
      const bilibiliTargets = targets.filter((target: any) => 
        target.url.includes('bilibili.com') && target.type === 'page');
      
      console.log(`📢 找到${bilibiliTargets.length}个bilibili页面`);
      
      if (bilibiliTargets.length === 0) {
        console.log('📢 没有找到打开的bilibili页面');
        return false;
      }
      
      let pauseSuccess = false;
      
      // Execute pause operation for each Bilibili tab
      for (const target of bilibiliTargets) {
        console.log(`📢 连接到标签页: ${target.url.substring(0, 100)}`);
        const client = await CDP({ target: target.id, port: this.debugPort });
        
        try {
          const { Runtime } = client;
          await Runtime.enable();
          
          console.log('📢 执行暂停视频脚本');
          // 直接控制视频播放状态，不使用模拟点击
          const result = await Runtime.evaluate({
            expression: `
              (function() {
                console.log('在页面内执行暂停视频脚本');
                
                // 记录找到的视频元素
                const videoElements = [];
                let paused = false;
                
                // 查找所有视频元素
                const videos = document.querySelectorAll('video');
                console.log('找到', videos.length, '个视频元素');
                
                videos.forEach((video, index) => {
                  // 记录状态
                  videoElements.push({
                    index,
                    paused: video.paused,
                    duration: video.duration,
                    currentTime: video.currentTime,
                    src: video.src
                  });
                  
                  // 只处理正在播放的视频
                  if (!video.paused) {
                    try {
                      console.log('找到正在播放的视频', index, '，尝试暂停');
                      video.pause();
                      paused = true;
                      console.log('暂停视频', index, '成功');
                    } catch (e) {
                      console.error('暂停视频', index, '失败:', e);
                    }
                  }
                });
                
                // 如果没有找到正在播放的视频，检查B站特定播放器
                if (!paused && videos.length === 0) {
                  // B站播放器查找
                  ['#bilibili-player video', '.bpx-player video', 
                   '.bilibili-player-video video', '.bpx-player-video-wrap video'].forEach(selector => {
                    const player = document.querySelector(selector);
                    if (player && !player.paused) {
                      try {
                        console.log('找到B站视频播放器，尝试暂停');
                        player.pause();
                        paused = true;
                        console.log('暂停B站视频播放器成功');
                      } catch (e) {
                        console.error('暂停B站视频播放器失败:', e);
                      }
                    }
                  });
                }
                
                console.log('视频暂停结果:', paused ? '成功' : '失败');
                return { 
                  paused,
                  videoCount: videos.length,
                  videoElements,
                  url: window.location.href
                };
              })()
            `,
            returnByValue: true
          });
          
          const pauseResult = result.result.value;
          console.log('📢 暂停视频结果:', pauseResult);
          
          if (pauseResult && pauseResult.paused) {
            pauseSuccess = true;
          }
          
        } catch (error) {
          console.error('📢 暂停视频时出错:', error);
        } finally {
          client.close();
        }
      }
      
      console.log(`📢 视频暂停${pauseSuccess ? '成功' : '失败'}`);
      return pauseSuccess;
    } catch (error) {
      console.error('📢 控制视频播放时出错:', error);
      return false;
    }
  }

  // Resume Bilibili video playback
  public async resumeBilibiliVideo() {
    console.log('📢 尝试恢复bilibili视频播放...');
    
    if (!this.isControlling) {
      console.log('📢 浏览器控制未初始化，无法恢复视频播放');
      
      // 尝试重新连接
      console.log('📢 尝试重新连接浏览器...');
      const result = await this.connectToEdge();
      if (!result) {
        console.log('📢 重新连接失败，无法恢复视频播放');
        return false;
      }
    }
    
    try {
      console.log('📢 正在查找bilibili标签页');
      const targets = await CDPModule.List({ port: this.debugPort });
      
      // Find Bilibili-related tabs
      const bilibiliTargets = targets.filter((target: any) => 
        target.url.includes('bilibili.com') && target.type === 'page');
      
      console.log(`📢 找到${bilibiliTargets.length}个bilibili页面`);
      
      if (bilibiliTargets.length === 0) {
        console.log('📢 没有找到打开的bilibili页面');
        return false;
      }
      
      let resumeSuccess = false;
      
      // Execute resume playback operation for each Bilibili tab
      for (const target of bilibiliTargets) {
        console.log(`📢 连接到标签页: ${target.url.substring(0, 100)}`);
        const client = await CDP({ target: target.id, port: this.debugPort });
        
        try {
          const { Runtime } = client;
          await Runtime.enable();
          
          console.log('📢 执行恢复视频播放脚本');
          // 直接控制视频播放状态，不使用模拟点击
          const result = await Runtime.evaluate({
            expression: `
              (function() {
                console.log('在页面内执行恢复视频播放脚本');
                
                // 记录找到的视频元素
                const videoElements = [];
                let resumed = false;
                
                // 查找所有视频元素
                const videos = document.querySelectorAll('video');
                console.log('找到', videos.length, '个视频元素');
                
                videos.forEach((video, index) => {
                  // 记录状态
                  videoElements.push({
                    index,
                    paused: video.paused,
                    duration: video.duration,
                    currentTime: video.currentTime,
                    src: video.src
                  });
                  
                  // 只处理已暂停的视频
                  if (video.paused) {
                    try {
                      console.log('找到已暂停的视频', index, '，尝试播放');
                      video.play().then(() => {
                        console.log('恢复视频', index, '播放成功');
                      }).catch(e => {
                        console.error('恢复视频', index, '播放失败:', e);
                      });
                      resumed = true;
                    } catch (e) {
                      console.error('尝试恢复视频', index, '失败:', e);
                    }
                  }
                });
                
                // 如果没有找到已暂停的视频，检查B站特定播放器
                if (!resumed && videos.length === 0) {
                  // B站播放器查找
                  ['#bilibili-player video', '.bpx-player video', 
                   '.bilibili-player-video video', '.bpx-player-video-wrap video'].forEach(selector => {
                    const player = document.querySelector(selector);
                    if (player && player.paused) {
                      try {
                        console.log('找到已暂停的B站视频播放器，尝试播放');
                        player.play().then(() => {
                          console.log('恢复B站视频播放器播放成功');
                        }).catch(e => {
                          console.error('恢复B站视频播放器播放失败:', e);
                        });
                        resumed = true;
                      } catch (e) {
                        console.error('尝试恢复B站视频播放器失败:', e);
                      }
                    }
                  });
                }
                
                console.log('视频恢复结果:', resumed ? '成功' : '失败');
                return { 
                  resumed,
                  videoCount: videos.length,
                  videoElements,
                  url: window.location.href
                };
              })()
            `,
            returnByValue: true
          });
          
          const resumeResult = result.result.value;
          console.log('📢 恢复视频播放结果:', resumeResult);
          
          if (resumeResult && resumeResult.resumed) {
            resumeSuccess = true;
          }
          
        } catch (error) {
          console.error('📢 恢复视频播放时出错:', error);
        } finally {
          client.close();
        }
      }
      
      console.log(`📢 视频恢复${resumeSuccess ? '成功' : '失败'}`);
      return resumeSuccess;
    } catch (error) {
      console.error('📢 控制视频播放时出错:', error);
      return false;
    }
  }
}