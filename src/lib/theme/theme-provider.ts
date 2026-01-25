/**
 * 暗黑模式服务
 * 提供全局主题切换和持久化功能
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

/**
 * 获取系统主题偏好
 */
function getSystemTheme(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * 主题Store
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light',
      isDark: false,
      
      setTheme: (mode) => {
        const isDark = mode === 'auto' ? getSystemTheme() : mode === 'dark';
        set({ mode, isDark });
        
        // 应用主题到DOM
        if (typeof document !== 'undefined') {
          const html = document.documentElement;
          if (isDark) {
            html.classList.add('dark');
            html.classList.remove('light');
          } else {
            html.classList.add('light');
            html.classList.remove('dark');
          }
        }
      },
      
      toggleTheme: () => {
        set((state) => {
          const newMode = state.isDark ? 'light' : 'dark';
          const newIsDark = !state.isDark;
          
          // 应用主题到DOM
          if (typeof document !== 'undefined') {
            const html = document.documentElement;
            if (newIsDark) {
              html.classList.add('dark');
              html.classList.remove('light');
            } else {
              html.classList.add('light');
              html.classList.remove('dark');
            }
          }
          
          return { mode: newMode, isDark: newIsDark };
        });
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // 恢复时应用主题
        if (state) {
          const isDark = state.mode === 'auto' ? getSystemTheme() : state.mode === 'dark';
          state.isDark = isDark;
          
          if (typeof document !== 'undefined') {
            const html = document.documentElement;
            if (isDark) {
              html.classList.add('dark');
            } else {
              html.classList.remove('dark');
            }
          }
        }
      },
    }
  )
);

/**
 * 监听系统主题变化
 */
export function initThemeListener() {
  if (typeof window === 'undefined') return;

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = (e: MediaQueryListEvent) => {
    const { mode } = useThemeStore.getState();
    if (mode === 'auto') {
      useThemeStore.getState().setTheme('auto');
    }
  };

  mediaQuery.addEventListener('change', handleChange);
  
  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
}

/**
 * 初始化主题
 */
export function initTheme() {
  // 从本地存储恢复主题
  const stored = localStorage.getItem('theme-storage');
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      useThemeStore.getState().setTheme(state.mode);
    } catch (error) {
      console.error('恢复主题失败:', error);
      useThemeStore.getState().setTheme('light');
    }
  } else {
    useThemeStore.getState().setTheme('light');
  }

  // 监听系统主题变化
  initThemeListener();
}

/**
 * 主题配置对象
 */
export const themeConfig = {
  light: {
    background: '#ffffff',
    foreground: '#09090b',
    primary: '#3b82f6',
    'primary-foreground': '#ffffff',
    secondary: '#f1f5f9',
    'secondary-foreground': '#0f172a',
    muted: '#f4f4f5',
    'muted-foreground': '#71717a',
    accent: '#f1f5f9',
    'accent-foreground': '#0f172a',
    border: '#e4e4e7',
    input: '#e4e4e7',
    ring: '#3b82f6',
    card: '#ffffff',
    'card-foreground': '#09090b',
  },
  dark: {
    background: '#09090b',
    foreground: '#fafafa',
    primary: '#3b82f6',
    'primary-foreground': '#ffffff',
    secondary: '#27272a',
    'secondary-foreground': '#fafafa',
    muted: '#27272a',
    'muted-foreground': '#a1a1aa',
    accent: '#27272a',
    'accent-foreground': '#fafafa',
    border: '#27272a',
    input: '#27272a',
    ring: '#3b82f6',
    card: '#09090b',
    'card-foreground': '#fafafa',
  },
};

/**
 * Tailwind CSS 主题类名
 */
export const getThemeClass = (mode: ThemeMode): string => {
  if (mode === 'auto') {
    return 'dark';
  }
  return mode === 'dark' ? 'dark' : '';
};
