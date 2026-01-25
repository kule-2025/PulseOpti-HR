// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

// API 基础URL（Vercel部署时使用相对路径）
const API_BASE_URL = '';

// 请求配置
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  cache?: RequestCache;
}

// 通用 API 请求函数
async function request<T>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    cache = 'no-store',
  } = options;

  // 从 localStorage 获取 token（客户端）
  let token = '';
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token') || '';
  }

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    cache,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);

    if (!response.ok) {
      let errorMessage = '请求失败';
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.error || errorMessage;
      } catch {
        errorMessage = `请求失败 (${response.status})`;
      }
      throw new Error(errorMessage);
    }

    // 处理 204 No Content 或空响应
    if (response.status === 204) {
      return { success: true, data: undefined } as ApiResponse<T>;
    }

    // 检查响应体是否为空
    const text = await response.text();
    if (!text.trim()) {
      return { success: true, data: undefined } as ApiResponse<T>;
    }

    try {
      const result = JSON.parse(text);
      return result as ApiResponse<T>;
    } catch {
      // 如果不是有效的 JSON，返回原始文本
      return { success: true, data: text as any } as ApiResponse<T>;
    }
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
}

// ========== 招聘管理 API ==========

export const recruitmentApi = {
  // 获取岗位列表
  getJobs: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/recruitment/jobs${queryString ? `?${queryString}` : ''}`);
  },

  // 创建岗位
  createJob: async (data: any) => {
    return request('/api/recruitment/jobs', {
      method: 'POST',
      body: data,
    });
  },

  // 获取候选人列表
  getCandidates: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/recruitment/candidates${queryString ? `?${queryString}` : ''}`);
  },

  // 创建候选人
  createCandidate: async (data: any) => {
    return request('/api/recruitment/candidates', {
      method: 'POST',
      body: data,
    });
  },

  // 获取面试记录
  getInterviews: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/recruitment/interviews${queryString ? `?${queryString}` : ''}`);
  },

  // 创建面试记录
  createInterview: async (data: any) => {
    return request('/api/recruitment/interviews', {
      method: 'POST',
      body: data,
    });
  },

  // 获取Offer列表
  getOffers: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/recruitment/offers${queryString ? `?${queryString}` : ''}`);
  },

  // 创建Offer
  createOffer: async (data: any) => {
    return request('/api/recruitment/offers', {
      method: 'POST',
      body: data,
    });
  },
};

// ========== 薪酬管理 API ==========

export const compensationApi = {
  // 获取薪资记录
  getPayroll: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/compensation/payroll${queryString ? `?${queryString}` : ''}`);
  },

  // 计算薪资
  calculatePayroll: async (data: any) => {
    return request('/api/compensation/payroll/calculate', {
      method: 'POST',
      body: data,
    });
  },

  // 获取薪酬结构
  getSalaryStructures: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/compensation/salary-structures${queryString ? `?${queryString}` : ''}`);
  },

  // 获取薪酬智能分析
  getSmartAnalysis: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/compensation/smart-analysis${queryString ? `?${queryString}` : ''}`);
  },
};

// ========== 绩效管理 API ==========

export const performanceApi = {
  // 获取绩效周期
  getCycles: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/performance/cycles${queryString ? `?${queryString}` : ''}`);
  },

  // 创建绩效周期
  createCycle: async (data: any) => {
    return request('/api/performance/cycles', {
      method: 'POST',
      body: data,
    });
  },

  // 获取绩效记录
  getRecords: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/performance/records${queryString ? `?${queryString}` : ''}`);
  },

  // 创建绩效记录
  createRecord: async (data: any) => {
    return request('/api/performance/records', {
      method: 'POST',
      body: data,
    });
  },

  // 更新绩效记录
  updateRecord: async (id: string, data: any) => {
    return request('/api/performance/records', {
      method: 'PUT',
      body: { id, ...data },
    });
  },
};

// ========== 离职管理 API ==========

export const resignationApi = {
  // 获取离职申请列表
  getResignations: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/resignations${queryString ? `?${queryString}` : ''}`);
  },

  // 创建离职申请
  createResignation: async (data: any) => {
    return request('/api/resignations', {
      method: 'POST',
      body: data,
    });
  },

  // 更新离职申请
  updateResignation: async (id: string, data: any) => {
    return request('/api/resignations', {
      method: 'PUT',
      body: { id, ...data },
    });
  },

  // 获取交接清单列表
  getHandovers: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/handovers${queryString ? `?${queryString}` : ''}`);
  },

  // 创建交接清单
  createHandover: async (data: any) => {
    return request('/api/handovers', {
      method: 'POST',
      body: data,
    });
  },

  // 更新交接清单
  updateHandover: async (id: string, data: any) => {
    return request('/api/handovers', {
      method: 'PUT',
      body: { id, ...data },
    });
  },

  // 获取离职访谈列表
  getExitInterviews: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/exit-interviews${queryString ? `?${queryString}` : ''}`);
  },

  // 创建离职访谈
  createExitInterview: async (data: any) => {
    return request('/api/exit-interviews', {
      method: 'POST',
      body: data,
    });
  },

  // 更新离职访谈
  updateExitInterview: async (id: string, data: any) => {
    return request('/api/exit-interviews', {
      method: 'PUT',
      body: { id, ...data },
    });
  },
};

// ========== 员工自助 API ==========

export const employeePortalApi = {
  // 获取员工个人信息
  getProfile: async () => {
    return request('/api/employee-portal/profile');
  },

  // 更新员工个人信息
  updateProfile: async (data: any) => {
    return request('/api/employee-portal/profile', {
      method: 'PUT',
      body: data,
    });
  },

  // 获取请假列表
  getLeaves: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/attendance/leave${queryString ? `?${queryString}` : ''}`);
  },

  // 创建请假申请
  createLeave: async (data: any) => {
    return request('/api/attendance/leave', {
      method: 'POST',
      body: data,
    });
  },

  // 获取加班记录
  getOvertimes: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/attendance/overtime${queryString ? `?${queryString}` : ''}`);
  },

  // 创建加班申请
  createOvertime: async (data: any) => {
    return request('/api/attendance/overtime', {
      method: 'POST',
      body: data,
    });
  },

  // 获取薪资记录
  getPayroll: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/employee-portal/payroll${queryString ? `?${queryString}` : ''}`);
  },

  // 获取培训记录
  getTrainingRecords: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/employee-portal/training${queryString ? `?${queryString}` : ''}`);
  },

  // 获取考勤记录
  getAttendance: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/employee-portal/attendance${queryString ? `?${queryString}` : ''}`);
  },
};

// ========== 积分系统 API ==========

export const pointsApi = {
  // 获取积分统计
  getDashboard: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/points/dashboard${queryString ? `?${queryString}` : ''}`);
  },

  // 获取积分规则列表
  getRules: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/points/rules${queryString ? `?${queryString}` : ''}`);
  },

  // 创建积分规则
  createRule: async (data: any) => {
    return request('/api/points/rules', {
      method: 'POST',
      body: data,
    });
  },

  // 获取积分记录列表
  getTransactions: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/points/transactions${queryString ? `?${queryString}` : ''}`);
  },

  // 获取兑换商品列表
  getExchangeItems: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/points/exchange-items${queryString ? `?${queryString}` : ''}`);
  },

  // 创建兑换商品
  createExchangeItem: async (data: any) => {
    return request('/api/points/exchange-items', {
      method: 'POST',
      body: data,
    });
  },

  // 获取兑换记录列表
  getExchanges: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/points/exchanges${queryString ? `?${queryString}` : ''}`);
  },

  // 创建兑换申请
  createExchange: async (data: any) => {
    return request('/api/points/exchanges', {
      method: 'POST',
      body: data,
    });
  },

  // 获取排行榜
  getLeaderboard: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/points/leaderboard${queryString ? `?${queryString}` : ''}`);
  },
};

// ========== 培训管理 API ==========

export const trainingApi = {
  // 获取培训课程
  getCourses: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/training/courses${queryString ? `?${queryString}` : ''}`);
  },

  // 创建培训课程
  createCourse: async (data: any) => {
    return request('/api/training/courses', {
      method: 'POST',
      body: data,
    });
  },

  // 更新培训课程
  updateCourse: async (id: string, data: any) => {
    return request(`/api/training/courses?id=${id}`, {
      method: 'PUT',
      body: { id, ...data },
    });
  },

  // 删除培训课程
  deleteCourse: async (id: string) => {
    return request(`/api/training/courses?id=${id}`, {
      method: 'DELETE',
    });
  },

  // 获取培训记录
  getRecords: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/training/records${queryString ? `?${queryString}` : ''}`);
  },

  // 创建培训记录（报名）
  createRecord: async (data: any) => {
    return request('/api/training/records', {
      method: 'POST',
      body: data,
    });
  },

  // 更新培训记录
  updateRecord: async (id: string, data: any) => {
    return request('/api/training/records', {
      method: 'PUT',
      body: { id, ...data },
    });
  },

  // 获取AI培训推荐
  getAiRecommendation: async (data: any) => {
    return request('/api/training/ai-recommendation', {
      method: 'POST',
      body: data,
    });
  },
};

// ========== 离职/合规/员工自助 API ==========

export const complianceApi = {
  // 获取离职申请
  getResignations: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/resignations${queryString ? `?${queryString}` : ''}`);
  },

  // 创建离职申请
  createResignation: async (data: any) => {
    return request('/api/resignations', {
      method: 'POST',
      body: data,
    });
  },

  // 更新离职申请
  updateResignation: async (id: string, data: any) => {
    return request('/api/resignations', {
      method: 'PUT',
      body: { id, ...data },
    });
  },

  // 获取交接清单
  getHandovers: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/handovers${queryString ? `?${queryString}` : ''}`);
  },

  // 创建交接清单
  createHandover: async (data: any) => {
    return request('/api/handovers', {
      method: 'POST',
      body: data,
    });
  },

  // 更新交接清单
  updateHandover: async (id: string, data: any) => {
    return request('/api/handovers', {
      method: 'PUT',
      body: { id, ...data },
    });
  },

  // 获取离职访谈
  getExitInterviews: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/exit-interviews${queryString ? `?${queryString}` : ''}`);
  },

  // 创建离职访谈
  createExitInterview: async (data: any) => {
    return request('/api/exit-interviews', {
      method: 'POST',
      body: data,
    });
  },

  // 更新离职访谈
  updateExitInterview: async (id: string, data: any) => {
    return request('/api/exit-interviews', {
      method: 'PUT',
      body: { id, ...data },
    });
  },

  // 获取劳动合同
  getContracts: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/contracts${queryString ? `?${queryString}` : ''}`);
  },

  // 创建劳动合同
  createContract: async (data: any) => {
    return request('/api/contracts', {
      method: 'POST',
      body: data,
    });
  },

  // 更新劳动合同
  updateContract: async (id: string, data: any) => {
    return request('/api/contracts', {
      method: 'PUT',
      body: { id, ...data },
    });
  },
};

// ========== 人才库管理 API ==========

export const talentPoolApi = {
  // 获取候选人库
  getCandidates: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/talent/candidates${queryString ? `?${queryString}` : ''}`);
  },

  // 创建候选人
  createCandidate: async (data: any) => {
    return request('/api/talent/candidates', {
      method: 'POST',
      body: data,
    });
  },

  // 更新候选人
  updateCandidate: async (id: string, data: any) => {
    return request('/api/talent/candidates', {
      method: 'PUT',
      body: { id, ...data },
    });
  },

  // 删除候选人
  deleteCandidate: async (id: string) => {
    return request('/api/talent/candidates', {
      method: 'DELETE',
      body: { id },
    });
  },

  // AI智能匹配
  getAiMatch: async (data: any) => {
    return request('/api/talent/ai-match', {
      method: 'POST',
      body: data,
    });
  },

  // 获取人才分析
  getAnalysis: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/talent/analysis${queryString ? `?${queryString}` : ''}`);
  },
};

// ========== HR报表中心 API ==========

export const reportsApi = {
  // 获取HR分析报表
  getHrAnalytics: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/reports/hr-analytics${queryString ? `?${queryString}` : ''}`);
  },

  // 获取人力结构报表
  getStructureReport: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/reports/structure${queryString ? `?${queryString}` : ''}`);
  },

  // 获取人效报表
  getEfficiencyReport: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/reports/efficiency${queryString ? `?${queryString}` : ''}`);
  },

  // 获取离职报表
  getTurnoverReport: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/reports/turnover${queryString ? `?${queryString}` : ''}`);
  },

  // 获取薪酬报表
  getCompensationReport: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/reports/compensation${queryString ? `?${queryString}` : ''}`);
  },

  // 获取培训报表
  getTrainingReport: async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/reports/training${queryString ? `?${queryString}` : ''}`);
  },
};

// 导出所有 API
export const api = {
  recruitment: recruitmentApi,
  compensation: compensationApi,
  performance: performanceApi,
  training: trainingApi,
  compliance: complianceApi,
  employeePortal: employeePortalApi,
  talentPool: talentPoolApi,
  reports: reportsApi,
};
