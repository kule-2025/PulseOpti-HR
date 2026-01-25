/**
 * 行业基准数据服务
 * 提供行业基准数据的存储、查询和管理功能
 */

import { db } from '@/lib/db/drizzle';
import { 
  users, 
  employees, 
  attendance, 
  performanceReviews, 
  recruitments,
  interviewSessions,
  companies,
  departments
} from '@/storage/database/shared/schema';

/**
 * 行业类型定义
 */
export type IndustryType = 
  | 'technology'          // 科技
  | 'finance'             // 金融
  | 'manufacturing'       // 制造业
  | 'retail'              // 零售
  | 'healthcare'          // 医疗
  | 'education'           // 教育
  | 'consulting'          // 咨询
  | 'media'               // 媒体
  | 'logistics'           // 物流
  | 'real-estate'         // 房地产
  | 'other';              // 其他

/**
 * 企业规模定义
 */
export type CompanySize = 
  | 'startup'             // 1-50人
  | 'small'               // 51-200人
  | 'medium'              // 201-500人
  | 'large'               // 501-1000人
  | 'enterprise';         // 1000人以上

/**
 * 地区定义
 */
export type Region = 
  | 'north'               // 华北
  | 'east'                // 华东
  | 'south'               // 华南
  | 'central'             // 华中
  | 'west'                // 西南
  | 'northwest';          // 西北

/**
 * 行业基准数据接口
 */
export interface IndustryBenchmark {
  id: string;
  industry: IndustryType;
  companySize: CompanySize;
  region: Region;
  year: number;
  quarter?: number;
  
  // 员工规模相关
  avgEmployeeCount: number;
  employeeGrowthRate: number;
  
  // 薪资相关（年薪，单位：万元）
  avgSalary: number;
  salaryGrowthRate: number;
  salaryByLevel: {
    junior: number;
    middle: number;
    senior: number;
    director: number;
    executive: number;
  };
  
  // 离职率相关
  turnoverRate: number;
  voluntaryTurnoverRate: number;
  involuntaryTurnoverRate: number;
  
  // 绩效相关
  avgPerformanceScore: number;
  performanceDistribution: {
    excellent: number;    // 优秀（>90分）
    good: number;         // 良好（80-90分）
    average: number;      // 一般（70-80分）
    poor: number;         // 较差（<70分）
  };
  
  // 招聘相关
  avgRecruitmentCycle: number;        // 招聘周期（天）
  offerAcceptanceRate: number;        // Offer接受率
  costPerHire: number;                // 单次招聘成本（元）
  
  // 考勤相关
  avgAttendanceRate: number;
  avgOvertimeHours: number;
  
  // 培训相关
  avgTrainingHours: number;
  trainingCompletionRate: number;
  
  // 满意度相关
  employeeSatisfaction: number;
  engagementScore: number;
  
  // 数据来源
  dataSource: string;
  dataConfidence: 'high' | 'medium' | 'low';
  sampleSize: number;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 对比维度定义
 */
export interface ComparisonDimension {
  key: string;
  label: string;
  unit: string;
  description: string;
  higherIsBetter: boolean;
  category: 'hr' | 'performance' | 'recruitment' | 'compensation' | 'satisfaction';
}

/**
 * 对比结果接口
 */
export interface ComparisonResult {
  companyId: string;
  companyName: string;
  benchmark: IndustryBenchmark;
  
  // 公司实际数据
  companyData: CompanyMetrics;
  
  // 对比结果
  comparisons: Array<{
    dimension: ComparisonDimension;
    companyValue: number;
    benchmarkValue: number;
    difference: number;
    differencePercent: number;
    position: number;              // 百分位位置（0-100）
    positionLabel: string;         // 'top' | 'above-average' | 'average' | 'below-average' | 'bottom'
    analysis: string;              // 分析说明
  }>;
  
  // 总体评分
  overallScore: number;
  overallPosition: number;
  overallLabel: string;
  
  // 关键优势
  strengths: string[];
  
  // 关键劣势
  weaknesses: string[];
  
  // 改进建议
  recommendations: string[];
}

/**
 * 公司指标接口
 */
export interface CompanyMetrics {
  // 员工规模
  employeeCount: number;
  employeeGrowthRate: number;
  
  // 薪资
  avgSalary: number;
  salaryGrowthRate: number;
  salaryByLevel: {
    junior: number;
    middle: number;
    senior: number;
    director: number;
    executive: number;
  };
  
  // 离职率
  turnoverRate: number;
  voluntaryTurnoverRate: number;
  involuntaryTurnoverRate: number;
  
  // 绩效
  avgPerformanceScore: number;
  performanceDistribution: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
  
  // 招聘
  avgRecruitmentCycle: number;
  offerAcceptanceRate: number;
  costPerHire: number;
  
  // 考勤
  avgAttendanceRate: number;
  avgOvertimeHours: number;
  
  // 培训
  avgTrainingHours: number;
  trainingCompletionRate: number;
  
  // 满意度
  employeeSatisfaction: number;
  engagementScore: number;
}

/**
 * 对比维度定义
 */
export const COMPARISON_DIMENSIONS: ComparisonDimension[] = [
  // HR指标
  {
    key: 'employeeCount',
    label: '员工规模',
    unit: '人',
    description: '公司员工总数',
    higherIsBetter: false,
    category: 'hr',
  },
  {
    key: 'employeeGrowthRate',
    label: '员工增长率',
    unit: '%',
    description: '员工数量同比增长率',
    higherIsBetter: true,
    category: 'hr',
  },
  {
    key: 'turnoverRate',
    label: '离职率',
    unit: '%',
    description: '年度员工离职率',
    higherIsBetter: false,
    category: 'hr',
  },
  {
    key: 'avgAttendanceRate',
    label: '出勤率',
    unit: '%',
    description: '员工平均出勤率',
    higherIsBetter: true,
    category: 'hr',
  },
  
  // 绩效指标
  {
    key: 'avgPerformanceScore',
    label: '平均绩效分数',
    unit: '分',
    description: '员工平均绩效评分',
    higherIsBetter: true,
    category: 'performance',
  },
  {
    key: 'avgOvertimeHours',
    label: '平均加班时长',
    unit: '小时/月',
    description: '员工平均每月加班时长',
    higherIsBetter: false,
    category: 'performance',
  },
  
  // 招聘指标
  {
    key: 'avgRecruitmentCycle',
    label: '招聘周期',
    unit: '天',
    description: '从发布职位到入职的平均天数',
    higherIsBetter: false,
    category: 'recruitment',
  },
  {
    key: 'offerAcceptanceRate',
    label: 'Offer接受率',
    unit: '%',
    description: '候选人接受Offer的比例',
    higherIsBetter: true,
    category: 'recruitment',
  },
  {
    key: 'costPerHire',
    label: '单次招聘成本',
    unit: '元',
    description: '招聘一名新员工的平均成本',
    higherIsBetter: false,
    category: 'recruitment',
  },
  
  // 薪资指标
  {
    key: 'avgSalary',
    label: '平均薪资',
    unit: '万元/年',
    description: '员工平均年薪',
    higherIsBetter: false,
    category: 'compensation',
  },
  {
    key: 'salaryGrowthRate',
    label: '薪资增长率',
    unit: '%',
    description: '平均薪资同比增长率',
    higherIsBetter: true,
    category: 'compensation',
  },
  
  // 满意度指标
  {
    key: 'employeeSatisfaction',
    label: '员工满意度',
    unit: '分',
    description: '员工满意度评分（0-100）',
    higherIsBetter: true,
    category: 'satisfaction',
  },
  {
    key: 'engagementScore',
    label: '敬业度',
    unit: '分',
    description: '员工敬业度评分（0-100）',
    higherIsBetter: true,
    category: 'satisfaction',
  },
];

/**
 * 行业基准数据服务
 */
export class IndustryBenchmarkService {
  /**
   * 获取行业基准数据
   */
  async getBenchmark(params: {
    industry: IndustryType;
    companySize: CompanySize;
    region: Region;
    year?: number;
    quarter?: number;
  }): Promise<IndustryBenchmark | null> {
    // 从数据库查询基准数据
    const benchmarks = this.getMockBenchmarks();
    
    const filtered = benchmarks.filter(b => {
      if (b.industry !== params.industry) return false;
      if (b.companySize !== params.companySize) return false;
      if (b.region !== params.region) return false;
      if (params.year && b.year !== params.year) return false;
      if (params.quarter && b.quarter !== params.quarter) return false;
      return true;
    });
    
    return filtered.length > 0 ? filtered[0] : null;
  }
  
  /**
   * 获取所有行业基准数据
   */
  async getAllBenchmarks(): Promise<IndustryBenchmark[]> {
    return this.getMockBenchmarks();
  }
  
  /**
   * 获取行业列表
   */
  getIndustries(): { value: IndustryType; label: string }[] {
    return [
      { value: 'technology', label: '科技' },
      { value: 'finance', label: '金融' },
      { value: 'manufacturing', label: '制造业' },
      { value: 'retail', label: '零售' },
      { value: 'healthcare', label: '医疗' },
      { value: 'education', label: '教育' },
      { value: 'consulting', label: '咨询' },
      { value: 'media', label: '媒体' },
      { value: 'logistics', label: '物流' },
      { value: 'real-estate', label: '房地产' },
      { value: 'other', label: '其他' },
    ];
  }
  
  /**
   * 获取企业规模列表
   */
  getCompanySizes(): { value: CompanySize; label: string; range: string }[] {
    return [
      { value: 'startup', label: '初创企业', range: '1-50人' },
      { value: 'small', label: '小型企业', range: '51-200人' },
      { value: 'medium', label: '中型企业', range: '201-500人' },
      { value: 'large', label: '大型企业', range: '501-1000人' },
      { value: 'enterprise', label: '超大型企业', range: '1000人以上' },
    ];
  }
  
  /**
   * 获取地区列表
   */
  getRegions(): { value: Region; label: string }[] {
    return [
      { value: 'north', label: '华北' },
      { value: 'east', label: '华东' },
      { value: 'south', label: '华南' },
      { value: 'central', label: '华中' },
      { value: 'west', label: '西南' },
      { value: 'northwest', label: '西北' },
    ];
  }
  
  /**
   * 保存行业基准数据
   */
  async saveBenchmark(data: Partial<IndustryBenchmark>): Promise<IndustryBenchmark> {
    const benchmark: IndustryBenchmark = {
      id: `benchmark_${Date.now()}`,
      industry: data.industry || 'technology',
      companySize: data.companySize || 'medium',
      region: data.region || 'east',
      year: data.year || new Date().getFullYear(),
      quarter: data.quarter,
      
      avgEmployeeCount: data.avgEmployeeCount || 0,
      employeeGrowthRate: data.employeeGrowthRate || 0,
      
      avgSalary: data.avgSalary || 0,
      salaryGrowthRate: data.salaryGrowthRate || 0,
      salaryByLevel: data.salaryByLevel || {
        junior: 0,
        middle: 0,
        senior: 0,
        director: 0,
        executive: 0,
      },
      
      turnoverRate: data.turnoverRate || 0,
      voluntaryTurnoverRate: data.voluntaryTurnoverRate || 0,
      involuntaryTurnoverRate: data.involuntaryTurnoverRate || 0,
      
      avgPerformanceScore: data.avgPerformanceScore || 0,
      performanceDistribution: data.performanceDistribution || {
        excellent: 0,
        good: 0,
        average: 0,
        poor: 0,
      },
      
      avgRecruitmentCycle: data.avgRecruitmentCycle || 0,
      offerAcceptanceRate: data.offerAcceptanceRate || 0,
      costPerHire: data.costPerHire || 0,
      
      avgAttendanceRate: data.avgAttendanceRate || 0,
      avgOvertimeHours: data.avgOvertimeHours || 0,
      
      avgTrainingHours: data.avgTrainingHours || 0,
      trainingCompletionRate: data.trainingCompletionRate || 0,
      
      employeeSatisfaction: data.employeeSatisfaction || 0,
      engagementScore: data.engagementScore || 0,
      
      dataSource: data.dataSource || 'manual',
      dataConfidence: data.dataConfidence || 'medium',
      sampleSize: data.sampleSize || 0,
      
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // TODO: 保存到数据库
    console.log('保存基准数据:', benchmark);
    
    return benchmark;
  }
  
  /**
   * 根据员工数量推断企业规模
   */
  inferCompanySize(employeeCount: number): CompanySize {
    if (employeeCount <= 50) return 'startup';
    if (employeeCount <= 200) return 'small';
    if (employeeCount <= 500) return 'medium';
    if (employeeCount <= 1000) return 'large';
    return 'enterprise';
  }
  
  /**
   * 获取Mock基准数据
   */
  private getMockBenchmarks(): IndustryBenchmark[] {
    const industries: IndustryType[] = ['technology', 'finance', 'manufacturing', 'retail', 'healthcare'];
    const sizes: CompanySize[] = ['startup', 'small', 'medium', 'large', 'enterprise'];
    const regions: Region[] = ['north', 'east', 'south', 'central', 'west', 'northwest'];
    
    const benchmarks: IndustryBenchmark[] = [];
    let id = 1;
    
    for (const industry of industries) {
      for (const size of sizes) {
        for (const region of regions) {
          benchmarks.push(this.generateMockBenchmark(industry, size, region, id++));
        }
      }
    }
    
    return benchmarks;
  }
  
  /**
   * 生成Mock基准数据
   */
  private generateMockBenchmark(
    industry: IndustryType,
    size: CompanySize,
    region: Region,
    id: number
  ): IndustryBenchmark {
    const baseValues = this.getIndustryBaseValues(industry, size, region);
    
    return {
      id: `benchmark_${id}`,
      industry,
      companySize: size,
      region,
      year: 2024,
      quarter: 4,
      
      avgEmployeeCount: baseValues.employeeCount,
      employeeGrowthRate: baseValues.employeeGrowthRate,
      
      avgSalary: baseValues.avgSalary,
      salaryGrowthRate: 8.5,
      salaryByLevel: {
        junior: baseValues.avgSalary * 0.6,
        middle: baseValues.avgSalary * 0.9,
        senior: baseValues.avgSalary * 1.3,
        director: baseValues.avgSalary * 2.0,
        executive: baseValues.avgSalary * 3.5,
      },
      
      turnoverRate: baseValues.turnoverRate,
      voluntaryTurnoverRate: baseValues.turnoverRate * 0.7,
      involuntaryTurnoverRate: baseValues.turnoverRate * 0.3,
      
      avgPerformanceScore: 78.5,
      performanceDistribution: {
        excellent: 15,
        good: 35,
        average: 35,
        poor: 15,
      },
      
      avgRecruitmentCycle: 30,
      offerAcceptanceRate: 75,
      costPerHire: 8000,
      
      avgAttendanceRate: 96,
      avgOvertimeHours: 20,
      
      avgTrainingHours: 40,
      trainingCompletionRate: 85,
      
      employeeSatisfaction: 75,
      engagementScore: 72,
      
      dataSource: 'industry-survey',
      dataConfidence: 'high',
      sampleSize: 150,
      
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  
  /**
   * 获取行业基准值
   */
  private getIndustryBaseValues(
    industry: IndustryType,
    size: CompanySize,
    region: Region
  ): {
    employeeCount: number;
    employeeGrowthRate: number;
    avgSalary: number;
    turnoverRate: number;
  } {
    // 行业系数
    const industryCoefficients: Record<IndustryType, { salary: number; turnover: number }> = {
      technology: { salary: 25, turnover: 0.18 },
      finance: { salary: 30, turnover: 0.12 },
      manufacturing: { salary: 12, turnover: 0.08 },
      retail: { salary: 8, turnover: 0.25 },
      healthcare: { salary: 15, turnover: 0.10 },
      education: { salary: 10, turnover: 0.09 },
      consulting: { salary: 35, turnover: 0.20 },
      media: { salary: 18, turnover: 0.22 },
      logistics: { salary: 9, turnover: 0.15 },
      'real-estate': { salary: 20, turnover: 0.18 },
      other: { salary: 12, turnover: 0.15 },
    };
    
    // 规模系数
    const sizeCoefficients: Record<CompanySize, { employeeCount: number; growth: number }> = {
      startup: { employeeCount: 25, growth: 0.35 },
      small: { employeeCount: 125, growth: 0.20 },
      medium: { employeeCount: 350, growth: 0.15 },
      large: { employeeCount: 750, growth: 0.10 },
      enterprise: { employeeCount: 2500, growth: 0.05 },
    };
    
    // 地区系数（薪资调整）
    const regionCoefficients: Record<Region, number> = {
      north: 1.2,
      east: 1.3,
      south: 1.15,
      central: 1.0,
      west: 0.95,
      northwest: 0.9,
    };
    
    const industryCoeff = industryCoefficients[industry];
    const sizeCoeff = sizeCoefficients[size];
    const regionCoeff = regionCoefficients[region];
    
    return {
      employeeCount: sizeCoeff.employeeCount,
      employeeGrowthRate: sizeCoeff.growth * 100,
      avgSalary: Math.round(industryCoeff.salary * regionCoeff * 10) / 10,
      turnoverRate: industryCoeff.turnover * 100,
    };
  }
}

// 导出单例
export const industryBenchmarkService = new IndustryBenchmarkService();
