/**
 * 移动端适配工具类
 * 提供设备检测、屏幕适配、触摸事件处理等功能
 */

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  platform: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
  browser: string;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  orientation: 'portrait' | 'landscape';
}

export interface BreakpointConfig {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

/**
 * 移动端适配工具
 */
export class MobileAdapter {
  private static instance: MobileAdapter;
  private deviceInfo: DeviceInfo;
  private listeners: Array<(info: DeviceInfo) => void> = [];
  
  private constructor() {
    this.deviceInfo = this.detectDevice();
    this.setupEventListeners();
  }
  
  static getInstance(): MobileAdapter {
    if (!MobileAdapter.instance) {
      MobileAdapter.instance = new MobileAdapter();
    }
    return MobileAdapter.instance;
  }
  
  /**
   * 检测设备信息
   */
  private detectDevice(): DeviceInfo {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        platform: 'unknown',
        browser: 'unknown',
        screenWidth: 1920,
        screenHeight: 1080,
        pixelRatio: 1,
        orientation: 'landscape',
      };
    }
    
    const ua = navigator.userAgent;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    
    // 平台检测
    let platform: DeviceInfo['platform'] = 'unknown';
    if (/iPad|iPhone|iPod/.test(ua)) {
      platform = 'ios';
    } else if (/Android/.test(ua)) {
      platform = 'android';
    } else if (/Windows/.test(ua)) {
      platform = 'windows';
    } else if (/Macintosh|Mac OS X/.test(ua)) {
      platform = 'macos';
    } else if (/Linux/.test(ua)) {
      platform = 'linux';
    }
    
    // 浏览器检测
    let browser = 'unknown';
    if (/Chrome/.test(ua)) {
      browser = 'Chrome';
    } else if (/Safari/.test(ua)) {
      browser = 'Safari';
    } else if (/Firefox/.test(ua)) {
      browser = 'Firefox';
    } else if (/Edge/.test(ua)) {
      browser = 'Edge';
    }
    
    // 设备类型检测
    const isMobile = screenWidth < 640;
    const isTablet = screenWidth >= 640 && screenWidth < 1024;
    const isDesktop = screenWidth >= 1024;
    
    // 屏幕方向
    const orientation = screenWidth > screenHeight ? 'landscape' : 'portrait';
    
    return {
      isMobile,
      isTablet,
      isDesktop,
      platform,
      browser,
      screenWidth,
      screenHeight,
      pixelRatio,
      orientation,
    };
  }
  
  /**
   * 设置事件监听器
   */
  private setupEventListeners() {
    if (typeof window === 'undefined') return;
    
    let resizeTimeout: NodeJS.Timeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.deviceInfo = this.detectDevice();
        this.notifyListeners();
      }, 100);
    });
    
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.deviceInfo = this.detectDevice();
        this.notifyListeners();
      }, 100);
    });
  }
  
  /**
   * 通知监听器
   */
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.deviceInfo));
  }
  
  /**
   * 添加监听器
   */
  addListener(listener: (info: DeviceInfo) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  /**
   * 获取设备信息
   */
  getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo };
  }
  
  /**
   * 是否为移动设备
   */
  isMobile(): boolean {
    return this.deviceInfo.isMobile;
  }
  
  /**
   * 是否为平板
   */
  isTablet(): boolean {
    return this.deviceInfo.isTablet;
  }
  
  /**
   * 是否为桌面设备
   */
  isDesktop(): boolean {
    return this.deviceInfo.isDesktop;
  }
  
  /**
   * 获取断点配置
   */
  getBreakpoints(): BreakpointConfig {
    return {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    };
  }
  
  /**
   * 获取当前断点
   */
  getCurrentBreakpoint(): keyof BreakpointConfig {
    const breakpoints = this.getBreakpoints();
    const { screenWidth } = this.deviceInfo;
    
    if (screenWidth >= breakpoints['2xl']) return '2xl';
    if (screenWidth >= breakpoints.xl) return 'xl';
    if (screenWidth >= breakpoints.lg) return 'lg';
    if (screenWidth >= breakpoints.md) return 'md';
    return 'sm';
  }
  
  /**
   * 转换为rem单位
   */
  toRem(px: number, base: number = 16): string {
    return `${px / base}rem`;
  }
  
  /**
   * 转换为vw单位（视窗宽度百分比）
   */
  toVw(px: number, designWidth: number = 750): string {
    return `${(px / designWidth) * 100}vw`;
  }
  
  /**
   * 检查是否支持触摸
   */
  isTouchSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }
  
  /**
   * 检查是否支持暗色模式
   */
  isDarkModeSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  
  /**
   * 检查是否为高分辨率屏幕
   */
  isRetina(): boolean {
    return this.deviceInfo.pixelRatio >= 2;
  }
  
  /**
   * 获取安全区域（刘海屏适配）
   */
  getSafeAreaInsets() {
    if (typeof window === 'undefined') {
      return { top: 0, right: 0, bottom: 0, left: 0 };
    }
    
    const computedStyle = getComputedStyle(document.documentElement);
    return {
      top: parseInt(computedStyle.getPropertyValue('safe-area-inset-top') || '0'),
      right: parseInt(computedStyle.getPropertyValue('safe-area-inset-right') || '0'),
      bottom: parseInt(computedStyle.getPropertyValue('safe-area-inset-bottom') || '0'),
      left: parseInt(computedStyle.getPropertyValue('safe-area-inset-left') || '0'),
    };
  }
  
  /**
   * 适配图片尺寸
   */
  adaptImageSize(originalSize: { width: number; height: number }): { width: number; height: number } {
    const { screenWidth, screenHeight } = this.deviceInfo;
    const maxWidth = Math.min(screenWidth * 0.9, originalSize.width);
    const maxHeight = screenHeight * 0.6;
    
    const ratio = Math.min(maxWidth / originalSize.width, maxHeight / originalSize.height);
    
    return {
      width: Math.round(originalSize.width * ratio),
      height: Math.round(originalSize.height * ratio),
    };
  }
  
  /**
   * 获取移动端优化的字体大小
   */
  getOptimizedFontSize(baseSize: number): number {
    if (this.isMobile()) {
      return Math.round(baseSize * 0.9); // 移动端字体缩小10%
    }
    return baseSize;
  }
  
  /**
   * 获取移动端优化的间距
   */
  getOptimizedSpacing(baseSpacing: number): number {
    if (this.isMobile()) {
      return Math.round(baseSpacing * 0.8); // 移动端间距缩小20%
    }
    return baseSpacing;
  }
}

export const mobileAdapter = MobileAdapter.getInstance();

/**
 * React Hook: 使用设备信息
 */
export function useDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = React.useState(() => mobileAdapter.getDeviceInfo());
  
  React.useEffect(() => {
    const unsubscribe = mobileAdapter.addListener((info) => {
      setDeviceInfo(info);
    });
    
    return unsubscribe;
  }, []);
  
  return deviceInfo;
}

// 添加React导入
import React from 'react';
