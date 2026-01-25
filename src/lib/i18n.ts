// 国际化配置
export const locales = ['zh', 'en'] as const;
export type Locale = (typeof locales)[number];

export const translations = {
  zh: {
    // 通用
    common: {
      save: '保存',
      cancel: '取消',
      confirm: '确认',
      delete: '删除',
      edit: '编辑',
      view: '查看',
      search: '搜索',
      refresh: '刷新',
      loading: '加载中...',
      noData: '暂无数据',
      success: '成功',
      error: '失败',
    },
    // 导航
    nav: {
      dashboard: '仪表盘',
      hr: '人力资源',
      attendance: '考勤管理',
      payroll: '薪酬管理',
      performance: '绩效管理',
      recruitment: '招聘管理',
      training: '培训管理',
      settings: '设置',
    },
    // 用户
    user: {
      profile: '个人信息',
      logout: '退出登录',
      login: '登录',
      register: '注册',
    },
    // 企业
    company: {
      name: '企业名称',
      industry: '行业',
      scale: '企业规模',
      contact: '联系方式',
    },
  },
  en: {
    // Common
    common: {
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      search: 'Search',
      refresh: 'Refresh',
      loading: 'Loading...',
      noData: 'No data',
      success: 'Success',
      error: 'Error',
    },
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      hr: 'Human Resources',
      attendance: 'Attendance',
      payroll: 'Payroll',
      performance: 'Performance',
      recruitment: 'Recruitment',
      training: 'Training',
      settings: 'Settings',
    },
    // User
    user: {
      profile: 'Profile',
      logout: 'Logout',
      login: 'Login',
      register: 'Register',
    },
    // Company
    company: {
      name: 'Company Name',
      industry: 'Industry',
      scale: 'Company Scale',
      contact: 'Contact',
    },
  },
};

export function getTranslation(locale: Locale, key: string) {
  const keys = key.split('.');
  let value: any = translations[locale];

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      // 回退到中文
      value = translations.zh;
      for (const k2 of keys) {
        value = value?.[k2];
      }
      break;
    }
  }

  return value || key;
}

export function useTranslation(locale: Locale) {
  return {
    t: (key: string) => getTranslation(locale, key),
    locale,
  };
}
