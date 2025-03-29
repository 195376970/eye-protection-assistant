import Chrome from 'chrome-remote-interface';

/**
 * 浏览器控制类
 * 负责通过Chrome DevTools Protocol与浏览器进行通信
 */
export class BrowserControl {
  private isConnected: boolean = false;
  private client: any = null;
  private videoDetectionInterval: NodeJS.Timeout | null = null;
  private videoCallback: ((isPlaying: boolean) => void) | null = null;
  
  /**
   * 连接到浏览器
   * @returns 是否连接成功
   */
  async connect(): Promise<boolean> {
    // 如果已经连接，先断开连接
    if (this.isConnected && this.client) {
      await this.disconnect();
    }
    
    try {
      console.log('正在连接到浏览器...');
      
      // 尝试获取可用的Chrome实例
      const targets = await Chrome.List();
      if (!targets || targets.length === 0) {
        console.log('未找到可用的Chrome浏览器实例');
        return false;
      }
      
      // 连接到第一个浏览器实例
      this.client = await Chrome();
      console.log('成功连接到浏览器');
      
      // 激活必要的域
      const { Page, Runtime } = this.client;
      await Page.enable();
      await Runtime.enable();
      
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('连接浏览器失败:', error);
      this.isConnected = false;
      this.client = null;
      return false;
    }
  }

  /**
   * 断开浏览器连接
   */
  async disconnect(): Promise<void> {
    try {
      if (this.videoDetectionInterval) {
        clearInterval(this.videoDetectionInterval);
        this.videoDetectionInterval = null;
      }
      
      if (this.client) {
        await this.client.close();
        this.client = null;
      }
      
      this.isConnected = false;
      console.log('断开浏览器连接');
    } catch (error) {
      console.error('断开浏览器连接时出错:', error);
    }
  }

  /**
   * 开始监测视频播放状态
   * @param callback 视频播放状态回调
   */
  startVideoMonitoring(callback: (isPlaying: boolean) => void): void {
    // 保存回调
    this.videoCallback = callback;
    
    // 停止现有的监测器
    if (this.videoDetectionInterval) {
      clearInterval(this.videoDetectionInterval);
      this.videoDetectionInterval = null;
    }
    
    // 如果没有连接浏览器，不进行监测
    if (!this.isConnected || !this.client) {
      console.log('浏览器未连接，无法监测视频状态');
      return;
    }
    
    console.log('开始监测视频播放状态');
    
    // 每5秒检测一次视频状态
    this.videoDetectionInterval = setInterval(async () => {
      try {
        // 执行脚本获取页面中正在播放的视频
        const result = await this.client.Runtime.evaluate({
          expression: `
            (() => {
              const videos = Array.from(document.querySelectorAll('video'));
              const playingVideos = videos.filter(video => 
                !video.paused && 
                !video.ended && 
                video.readyState > 2 && 
                video.disablePictureInPicture !== true &&
                video.style.display !== 'none' &&
                video.offsetParent !== null &&
                video.width > 100 &&
                video.height > 100
              );
              return {
                count: playingVideos.length,
                details: playingVideos.map(v => ({
                  src: v.src || v.currentSrc,
                  width: v.width,
                  height: v.height,
                  currentTime: v.currentTime,
                  duration: v.duration
                }))
              };
            })()
          `,
          returnByValue: true
        });
        
        // 提取结果
        const videoInfo = result.result.value;
        const isPlaying = videoInfo.count > 0;
        
        // 输出调试信息
        if (isPlaying) {
          console.log(`检测到${videoInfo.count}个正在播放的视频:`, videoInfo.details);
        }
        
        // 调用回调函数
        if (this.videoCallback) {
          this.videoCallback(isPlaying);
        }
      } catch (error) {
        console.error('检测视频状态时出错:', error);
        // 如果出错，可能是连接丢失，尝试重新连接
        this.reconnect();
      }
    }, 5000);
  }

  /**
   * 重新连接浏览器
   */
  private async reconnect(): Promise<void> {
    try {
      console.log('尝试重新连接浏览器...');
      await this.disconnect();
      const connected = await this.connect();
      
      if (connected && this.videoCallback) {
        this.startVideoMonitoring(this.videoCallback);
      }
    } catch (error) {
      console.error('重新连接浏览器时出错:', error);
    }
  }
}