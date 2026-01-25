/**
 * 智能薪酬管理服务
 * 提供薪酬计算、发放、税务处理等核心功能
 * 支持多地区、多币种、多税率
 */

export interface SalaryItem {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  baseSalary: number;
  performanceBonus: number;
  overtimePay: number;
  allowance: number;
  deduction: number;
  socialInsurance: number;
  housingFund: number;
  tax: number;
  netSalary: number;
  paymentDate: Date;
  paymentMethod: 'bank' | 'alipay' | 'wechat';
  bankAccount?: string;
  alipayAccount?: string;
  wechatAccount?: string;
  status: 'pending' | 'approved' | 'paid' | 'failed';
  createdAt: Date;
}

export interface SalaryPeriod {
  id: string;
  year: number;
  month: number;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'processing' | 'completed';
  totalEmployees: number;
  totalAmount: number;
  createdAt: Date;
}

export interface TaxRate {
  bracketId: string;
  minIncome: number;
  maxIncome: number;
  rate: number;
  quickDeduction: number;
}

export interface SalaryConfig {
  region: string; // 地区
  currency: string; // 币种
  taxRates: TaxRate[]; // 税率表
  socialInsuranceRates: {
    employee: number;
    employer: number;
    base: number;
    ceiling: number;
  };
  housingFundRates: {
    employee: number;
    employer: number;
    base: number;
    ceiling: number;
  };
}

/**
 * 薪酬管理服务
 */
export class SalaryService {
  private static instance: SalaryService;
  private salaryConfigs: Map<string, SalaryConfig> = new Map();
  
  private constructor() {
    // 初始化地区税率配置
    this.initializeConfigs();
  }
  
  static getInstance(): SalaryService {
    if (!SalaryService.instance) {
      SalaryService.instance = new SalaryService();
    }
    return SalaryService.instance;
  }
  
  /**
   * 初始化默认配置
   */
  private initializeConfigs() {
    // 中国大陆个税税率（2024年标准）
    const chinaTaxRates: TaxRate[] = [
      { bracketId: '1', minIncome: 0, maxIncome: 3000, rate: 0.03, quickDeduction: 0 },
      { bracketId: '2', minIncome: 3000, maxIncome: 12000, rate: 0.10, quickDeduction: 210 },
      { bracketId: '3', minIncome: 12000, maxIncome: 25000, rate: 0.20, quickDeduction: 1410 },
      { bracketId: '4', minIncome: 25000, maxIncome: 35000, rate: 0.25, quickDeduction: 2660 },
      { bracketId: '5', minIncome: 35000, maxIncome: 55000, rate: 0.30, quickDeduction: 4410 },
      { bracketId: '6', minIncome: 55000, maxIncome: 80000, rate: 0.35, quickDeduction: 7160 },
      { bracketId: '7', minIncome: 80000, maxIncome: Infinity, rate: 0.45, quickDeduction: 15160 },
    ];
    
    this.salaryConfigs.set('china', {
      region: 'china',
      currency: 'CNY',
      taxRates: chinaTaxRates,
      socialInsuranceRates: {
        employee: 0.08, // 个人8%
        employer: 0.19, // 公司19%
        base: 3000,
        ceiling: 30000,
      },
      housingFundRates: {
        employee: 0.05, // 个人5%
        employer: 0.05, // 公司5%
        base: 3000,
        ceiling: 30000,
      },
    });
  }
  
  /**
   * 计算个人所得税（超额累进税率）
   */
  calculateTax(taxableIncome: number, region = 'china'): number {
    const config = this.salaryConfigs.get(region);
    if (!config) {
      throw new Error(`地区 ${region} 不支持`);
    }
    
    // 减除基本减除费用（5000元）
    const afterDeduction = Math.max(0, taxableIncome - 5000);
    
    for (const bracket of config.taxRates) {
      if (afterDeduction > bracket.minIncome && afterDeduction <= bracket.maxIncome) {
        return Math.max(0, afterDeduction * bracket.rate - bracket.quickDeduction);
      }
    }
    
    return 0;
  }
  
  /**
   * 计算社保和公积金
   */
  calculateSocialInsuranceAndHousingFund(
    baseSalary: number,
    region = 'china'
  ): { socialInsurance: number; housingFund: number } {
    const config = this.salaryConfigs.get(region);
    if (!config) {
      throw new Error(`地区 ${region} 不支持`);
    }
    
    // 计算基数（在基数和上限之间）
    const siBase = Math.max(
      config.socialInsuranceRates.base,
      Math.min(baseSalary, config.socialInsuranceRates.ceiling)
    );
    
    const hfBase = Math.max(
      config.housingFundRates.base,
      Math.min(baseSalary, config.housingFundRates.ceiling)
    );
    
    return {
      socialInsurance: siBase * config.socialInsuranceRates.employee,
      housingFund: hfBase * config.housingFundRates.employee,
    };
  }
  
  /**
   * 计算薪酬
   */
  async calculateSalary(params: {
    employeeId: string;
    employeeName: string;
    department: string;
    position: string;
    baseSalary: number;
    performanceBonus: number;
    overtimePay: number;
    allowance: number;
    deduction: number;
    paymentMethod: 'bank' | 'alipay' | 'wechat';
    bankAccount?: string;
    alipayAccount?: string;
    wechatAccount?: string;
    region?: string;
  }): Promise<SalaryItem> {
    const region = params.region || 'china';
    
    // 计算社保和公积金
    const { socialInsurance, housingFund } = this.calculateSocialInsuranceAndHousingFund(
      params.baseSalary,
      region
    );
    
    // 计算应纳税所得额
    const grossIncome = params.baseSalary + params.performanceBonus + params.overtimePay + params.allowance;
    const totalDeduction = params.deduction + socialInsurance + housingFund;
    const taxableIncome = grossIncome - totalDeduction;
    
    // 计算个税
    const tax = this.calculateTax(taxableIncome, region);
    
    // 计算实发工资
    const netSalary = grossIncome - totalDeduction - tax;
    
    return {
      id: crypto.randomUUID(),
      employeeId: params.employeeId,
      employeeName: params.employeeName,
      department: params.department,
      position: params.position,
      baseSalary: params.baseSalary,
      performanceBonus: params.performanceBonus,
      overtimePay: params.overtimePay,
      allowance: params.allowance,
      deduction: params.deduction,
      socialInsurance,
      housingFund,
      tax,
      netSalary,
      paymentDate: new Date(),
      paymentMethod: params.paymentMethod,
      bankAccount: params.bankAccount,
      alipayAccount: params.alipayAccount,
      wechatAccount: params.wechatAccount,
      status: 'pending',
      createdAt: new Date(),
    };
  }
  
  /**
   * 批量计算薪酬
   */
  async batchCalculateSalaries(
    employees: Array<{
      employeeId: string;
      employeeName: string;
      department: string;
      position: string;
      baseSalary: number;
      performanceBonus: number;
      overtimePay: number;
      allowance: number;
      deduction: number;
      paymentMethod: 'bank' | 'alipay' | 'wechat';
      bankAccount?: string;
      alipayAccount?: string;
      wechatAccount?: string;
      region?: string;
    }>
  ): Promise<SalaryItem[]> {
    const results: SalaryItem[] = [];
    
    for (const employee of employees) {
      const salary = await this.calculateSalary(employee);
      results.push(salary);
    }
    
    return results;
  }
  
  /**
   * 创建薪酬周期
   */
  async createSalaryPeriod(params: {
    year: number;
    month: number;
    startDate: Date;
    endDate: Date;
  }): Promise<SalaryPeriod> {
    return {
      id: crypto.randomUUID(),
      year: params.year,
      month: params.month,
      startDate: params.startDate,
      endDate: params.endDate,
      status: 'draft',
      totalEmployees: 0,
      totalAmount: 0,
      createdAt: new Date(),
    };
  }
  
  /**
   * 导出薪酬报表
   */
  exportSalaryReport(salaryItems: SalaryItem[]): string {
    const headers = [
      '员工ID',
      '员工姓名',
      '部门',
      '职位',
      '基本工资',
      '绩效奖金',
      '加班费',
      '津贴',
      '扣款',
      '社保',
      '公积金',
      '个税',
      '实发工资',
      '支付方式',
      '支付日期',
      '状态',
    ];
    
    const rows = salaryItems.map(item => [
      item.employeeId,
      item.employeeName,
      item.department,
      item.position,
      item.baseSalary.toFixed(2),
      item.performanceBonus.toFixed(2),
      item.overtimePay.toFixed(2),
      item.allowance.toFixed(2),
      item.deduction.toFixed(2),
      item.socialInsurance.toFixed(2),
      item.housingFund.toFixed(2),
      item.tax.toFixed(2),
      item.netSalary.toFixed(2),
      item.paymentMethod,
      item.paymentDate.toISOString().split('T')[0],
      item.status,
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }
  
  /**
   * 获取薪酬统计
   */
  getSalaryStatistics(salaryItems: SalaryItem[]) {
    const totalEmployees = salaryItems.length;
    const totalGross = salaryItems.reduce((sum, item) => sum + item.baseSalary + item.performanceBonus + item.overtimePay + item.allowance, 0);
    const totalNet = salaryItems.reduce((sum, item) => sum + item.netSalary, 0);
    const totalTax = salaryItems.reduce((sum, item) => sum + item.tax, 0);
    const totalSocialInsurance = salaryItems.reduce((sum, item) => sum + item.socialInsurance, 0);
    const totalHousingFund = salaryItems.reduce((sum, item) => sum + item.housingFund, 0);
    
    const averageSalary = totalEmployees > 0 ? totalNet / totalEmployees : 0;
    
    // 按部门统计
    const departmentStats = salaryItems.reduce((acc, item) => {
      if (!acc[item.department]) {
        acc[item.department] = {
          count: 0,
          totalSalary: 0,
          averageSalary: 0,
        };
      }
      acc[item.department].count++;
      acc[item.department].totalSalary += item.netSalary;
      acc[item.department].averageSalary = acc[item.department].totalSalary / acc[item.department].count;
      return acc;
    }, {} as Record<string, { count: number; totalSalary: number; averageSalary: number }>);
    
    return {
      totalEmployees,
      totalGross,
      totalNet,
      totalTax,
      totalSocialInsurance,
      totalHousingFund,
      averageSalary,
      departmentStats,
    };
  }
}

export const salaryService = SalaryService.getInstance();
