/**
 * PulseOpti HR 脉策聚效 主题配置
 * 统一管理品牌色彩、尺寸、动画等设计令牌
 */

export const theme = {
  // 品牌色彩
  colors: {
    primary: {
      light: '#3B82F6',
      DEFAULT: '#2563EB',
      dark: '#1D4ED8',
    },
    purple: {
      light: '#8B5CF6',
      DEFAULT: '#7C3AED',
      dark: '#6D28D9',
    },
    orange: {
      light: '#FBBF24',
      DEFAULT: '#F59E0B',
      dark: '#D97706',
    },
    green: {
      light: '#34D399',
      DEFAULT: '#10B981',
      dark: '#059669',
    },
    red: {
      light: '#F87171',
      DEFAULT: '#EF4444',
      dark: '#DC2626',
    },
  },

  // 渐变
  gradients: {
    primary: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
    secondary: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
    success: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    warning: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    danger: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
  },

  // 圆角
  radius: {
    sm: '0.5rem',
    DEFAULT: '0.75rem',
    md: '1rem',
    lg: '1.25rem',
    xl: '1.5rem',
    full: '9999px',
  },

  // 阴影
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    glow: '0 0 20px -5px rgb(37 99 235 / 0.3)',
  },

  // 间距
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
    '3xl': '3rem',
    '4xl': '4rem',
  },

  // 过渡动画
  transition: {
    fast: '150ms ease-in-out',
    DEFAULT: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },

  // 字体大小
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },

  // 断点
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// 导出类型
export type ThemeColors = typeof theme.colors;
export type ThemeGradients = typeof theme.gradients;
export type ThemeRadius = typeof theme.radius;
export type ThemeShadow = typeof theme.shadow;

// 常用工具函数
export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

export const getGradient = (type: keyof ThemeGradients) => {
  return theme.gradients[type];
};

export const getColor = (
  color: keyof ThemeColors,
  shade?: 'light' | 'DEFAULT' | 'dark'
) => {
  return shade ? theme.colors[color][shade] : theme.colors[color].DEFAULT;
};
