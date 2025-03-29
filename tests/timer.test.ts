/**
 * 计时器模块的单元测试
 */
import { Timer, TimerState } from '../src/main/timer';

// 模拟计时器对象
describe('Timer', () => {
  let timer: Timer;
  let updateCallback: jest.Mock;
  let restStartCallback: jest.Mock;
  let restEndCallback: jest.Mock;
  
  beforeEach(() => {
    // 初始化计时器和回调函数
    timer = new Timer();
    
    // 模拟回调函数
    updateCallback = jest.fn();
    restStartCallback = jest.fn();
    restEndCallback = jest.fn();
    
    // 设置回调
    timer.setUpdateCallback(updateCallback);
    timer.setRestStartCallback(restStartCallback);
    timer.setRestEndCallback(restEndCallback);
    
    // 模拟定时器
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    // 恢复实际定时器
    jest.useRealTimers();
  });
  
  test('初始状态应为空闲', () => {
    expect(timer.state).toBe(TimerState.IDLE);
  });
  
  test('启动计时器后状态应为工作中', () => {
    // 启动计时器（5分钟工作，10秒休息）
    timer.startTimer(300, 10);
    
    // 验证状态和回调
    expect(timer.state).toBe(TimerState.WORKING);
    expect(updateCallback).toHaveBeenCalledWith(TimerState.WORKING, 300, 300);
  });
  
  test('暂停和恢复计时器', () => {
    // 启动计时器
    timer.startTimer(300, 10);
    
    // 暂停
    timer.pauseTimer();
    expect(timer.state).toBe(TimerState.PAUSED);
    expect(updateCallback).toHaveBeenCalledWith(TimerState.PAUSED, 300, 300);
    
    // 恢复
    timer.startTimer(0, 0); // 如果是暂停状态，就会恢复
    expect(timer.state).toBe(TimerState.WORKING);
    expect(updateCallback).toHaveBeenCalledWith(TimerState.WORKING, 300, 300);
  });
  
  test('重置计时器', () => {
    // 启动计时器
    timer.startTimer(300, 10);
    
    // 重置
    timer.resetTimer();
    expect(timer.state).toBe(TimerState.IDLE);
    expect(updateCallback).toHaveBeenCalledWith(TimerState.IDLE, 0, 0);
  });
  
  test('工作时间结束应进入休息时间', () => {
    // 启动计时器（1秒工作，10秒休息）
    timer.startTimer(1, 10);
    
    // 前进时间超过1秒
    jest.advanceTimersByTime(1100);
    
    // 验证进入休息状态
    expect(timer.state).toBe(TimerState.RESTING);
    expect(restStartCallback).toHaveBeenCalled();
    expect(updateCallback).toHaveBeenCalledWith(TimerState.RESTING, 10, 10);
  });
  
  test('休息时间结束应回到空闲状态', () => {
    // 启动计时器（1秒工作，1秒休息）
    timer.startTimer(1, 1);
    
    // 前进时间超过1秒，进入休息
    jest.advanceTimersByTime(1100);
    
    // 前进时间超过1秒，休息结束
    jest.advanceTimersByTime(1100);
    
    // 验证进入空闲状态
    expect(timer.state).toBe(TimerState.IDLE);
    expect(restEndCallback).toHaveBeenCalled();
    expect(updateCallback).toHaveBeenCalledWith(TimerState.IDLE, 0, 0);
  });
  
  test('提前结束休息', () => {
    // 启动计时器（1秒工作，10秒休息）
    timer.startTimer(1, 10);
    
    // 前进时间超过1秒，进入休息
    jest.advanceTimersByTime(1100);
    
    // 提前结束休息
    timer.finishRest();
    
    // 验证状态和回调
    expect(timer.state).toBe(TimerState.IDLE);
    expect(restEndCallback).toHaveBeenCalled();
    expect(updateCallback).toHaveBeenCalledWith(TimerState.IDLE, 0, 0);
  });
});