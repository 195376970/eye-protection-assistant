/**
 * 浏览器控制模块
 * 使用Chrome DevTools Protocol连接和控制浏览器
 */

import CDP from 'chrome-remote-interface';

// 回调类型定义
type BrowserControlCallbacks = {
  onStatusUpdate: (status: { connected: boolean; message?: string }) => void;
};

/**
 * 浏览器控制类
 * 实现与浏览器的通信和控制功能
 */
export class BrowserControl {
  // 状态
  private connected: boolean = false;
  // CDP客户端
  private client: any = null;
  // 定时器
  private monitorIntervalId: NodeJS.Timeout | null = null;
  // 检查间隔（毫秒）
  private readonly CHECK_INTERVAL = 5000;
  // 浏览器断开连接后的自动重连次数
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 3;
  // 回调函数
  private callbacks: BrowserControlCallbacks;

  /**
   * 构造函数
   * @param callbacks 回调函数
   */
  constructor(callbacks: BrowserControlCallbacks) {
    this.callbacks = callbacks;
    this.updateStatus(false, '未连接浏览器');
  }

  /**
   * 连接到浏览器
   * @returns 是否连接成功
   */
  async connect(): Promise<boolean> {
    if (this.connected) {
      console.log('已经连接到浏览器');
      return true;
    }

    try {
      // 尝试连接到Chrome
      console.log('尝试连接到浏览器...');
      this.client = await CDP({ port: 9222 });
      
      // 启用必要的CDP域
      const { Network, Page, Runtime } = this.client;
      await Promise.all([
        Network.enable(),
        Page.enable(),
        Runtime.enable(),
      ]);

      console.log('浏览器连接成功!');
      this.connected = true;
      this.updateStatus(true, '浏览器已连接');

      // 开始定期监控浏览器状态
      this.startMonitoring();

      return true;
    } catch (error) {
      console.error('连接浏览器失败:', error);
      this.connected = false;
      this.updateStatus(false, '浏览器连接失败');
      return false;
    }
  }

  /**
   * 断开浏览器连接
   */
  disconnect(): void {
    // 停止监控
    this.stopMonitoring();

    // 关闭客户端连接
    if (this.client) {
      console.log('关闭浏览器连接');
      this.client.close();
      this.client = null;
    }

    this.connected = false;
    this.updateStatus(false, '已断开浏览器连接');
  }

  /**
   * 开始监控浏览器状态
   */
  private startMonitoring(): void {
    // 停止已存在的监控
    this.stopMonitoring();

    // 创建新的定时器
    this.monitorIntervalId = setInterval(() => this.checkBrowserStatus(), this.CHECK_INTERVAL);
    console.log(`已启动浏览器状态监控，间隔: ${this.CHECK_INTERVAL}ms`);
  }

  /**
   * 停止监控浏览器状态
   */
  private stopMonitoring(): void {
    if (this.monitorIntervalId !== null) {
      clearInterval(this.monitorIntervalId);
      this.monitorIntervalId = null;
      console.log('已停止浏览器状态监控');
    }
  }

  /**
   * 检查浏览器状态
   */
  private async checkBrowserStatus(): Promise<void> {
    if (!this.client) {
      // 如果客户端不存在，尝试重新连接
      this.reconnectAttempts++;
      if (this.reconnectAttempts <= this.MAX_RECONNECT_ATTEMPTS) {
        console.log(`浏览器连接已丢失，尝试重新连接 (第${this.reconnectAttempts}次)...`);
        await this.connect();
      } else {
        console.log(`超过最大重连次数(${this.MAX_RECONNECT_ATTEMPTS})，停止重连`);
        this.stopMonitoring();
        this.updateStatus(false, '浏览器断开连接，请手动重连');
      }
      return;
    }

    try {
      // 检查浏览器是否仍然可用
      const { Runtime } = this.client;
      await Runtime.evaluate({ expression: '1 + 1' });

      // 成功响应，重置重连计数器
      this.reconnectAttempts = 0;
      
      // 检测当前浏览器标签页是否有视频播放
      await this.checkVideoPlayback();
    } catch (error) {
      console.error('浏览器状态检查失败:', error);
      
      // 关闭客户端连接
      if (this.client) {
        this.client.close();
        this.client = null;
      }
      
      this.connected = false;
      this.updateStatus(false, '浏览器连接丢失');
    }
  }

  /**
   * 检查视频播放状态
   */
  private async checkVideoPlayback(): Promise<void> {
    try {
      const { Runtime } = this.client;
      
      // 检查是否有正在播放的视频
      const result = await Runtime.evaluate({
        expression: `
          (function() {
            const videos = Array.from(document.querySelectorAll('video'));
            const playingVideos = videos.filter(video => 
              !video.paused && 
              !video.ended && 
              video.currentTime > 0 &&
              video.readyState > 2
            );
            return {
              total: videos.length,
              playing: playingVideos.length,
              details: playingVideos.map(v => ({
                src: v.src || '(embedded)',
                duration: v.duration,
                currentTime: v.currentTime,
                width: v.width,
                height: v.height
              }))
            };
          })()
        `,
        returnByValue: true
      });

      const videoStatus = result.result.value;
      
      if (videoStatus.playing > 0) {
        console.log(`检测到${videoStatus.playing}个正在播放的视频:`, videoStatus.details);
        this.updateStatus(true, `浏览器中有${videoStatus.playing}个视频正在播放`);
      } else if (videoStatus.total > 0) {
        console.log(`检测到${videoStatus.total}个视频元素，但没有正在播放的`);
        this.updateStatus(true, `浏览器已连接`);
      } else {
        console.log('未检测到视频元素');
        this.updateStatus(true, `浏览器已连接`);
      }
    } catch (error) {
      console.error('检查视频播放状态失败:', error);
    }
  }

  /**
   * 更新状态并通知回调
   */
  private updateStatus(connected: boolean, message?: string): void {
    this.callbacks.onStatusUpdate({ connected, message });
  }
}
