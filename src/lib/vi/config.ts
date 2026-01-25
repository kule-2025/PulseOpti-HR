/**
 * PulseOpti HR 脉策聚效 - VI/视觉识别系统配置
 * 统一管理品牌色彩、字体、圆角、阴影等视觉元素
 */

// ========== 品牌色彩 ==========
export const BRAND_COLORS = {
  // 科技蓝 - 主色
  BLUE: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    DEFAULT: '#2563EB',
  },

  // 智慧紫 - 辅助色
  PURPLE: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    DEFAULT: '#7C3AED',
  },

  // 活力橙 - 强调色
  ORANGE: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    DEFAULT: '#F59E0B',
  },
} as const;

// 语义色彩
export const SEMANTIC_COLORS = {
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  DANGER: '#EF4444',
  INFO: '#3B82F6',
} as const;

// ========== 圆角系统 ==========
export const RADIUS = {
  XS: '0.375rem',   // 6px
  SM: '0.5rem',     // 8px
  MD: '0.625rem',   // 10px
  LG: '0.75rem',    // 12px - 统一标准圆角
  XL: '1rem',       // 16px
  '2XL': '1.25rem', // 20px
  FULL: '9999px',
} as const;

// ========== 阴影系统 ==========
export const SHADOWS = {
  XS: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  SM: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  MD: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  LG: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  XL: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2XL': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  GLOW_BLUE: '0 4px 14px 0 rgba(37, 99, 235, 0.39)',
  GLOW_PURPLE: '0 4px 14px 0 rgba(124, 58, 237, 0.39)',
  GLOW_ORANGE: '0 4px 14px 0 rgba(245, 158, 11, 0.39)',
} as const;

// ========== 动画配置 ==========
export const ANIMATIONS = {
  FAST: '150ms ease-in-out',
  BASE: '200ms ease-in-out',
  SLOW: '300ms ease-in-out',
} as const;

// ========== 渐变配置 ==========
export const GRADIENTS = {
  PRIMARY: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
  PRIMARY_LIGHT: 'linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%)',
  SECONDARY: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
  SUCCESS: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
  WARNING: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
  DANGER: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
} as const;

// ========== 间距系统 ==========
export const SPACING = {
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
} as const;

// ========== Z-Index 层级 ==========
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
} as const;

// ========== 断点配置 ==========
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
} as const;

// ========== 字体配置 ==========
export const FONT_FAMILY = {
  SANS: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  MONO: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
} as const;

// ========== 工具函数 ==========

/**
 * 获取品牌色渐变样式
 */
export function getBrandGradient(type: 'primary' | 'secondary' | 'success' | 'warning' | 'danger') {
  return {
    backgroundImage: GRADIENTS[type.toUpperCase() as keyof typeof GRADIENTS],
  };
}

/**
 * 获取品牌色阴影
 */
export function getBrandGlow(color: 'blue' | 'purple' | 'orange') {
  return {
    boxShadow: SHADOWS[`GLOW_${color.toUpperCase()}` as keyof typeof SHADOWS],
  };
}

/**
 * 获取圆角样式
 */
export function getRadius(size: keyof typeof RADIUS) {
  return {
    borderRadius: RADIUS[size],
  };
}

/**
 * 获取过渡动画
 */
export function getTransition(duration: 'fast' | 'base' | 'slow' = 'base', property = 'all') {
  return {
    transitionProperty: property,
    transitionDuration: ANIMATIONS[duration.toUpperCase() as keyof typeof ANIMATIONS],
    transitionTimingFunction: 'ease-in-out',
  };
}
