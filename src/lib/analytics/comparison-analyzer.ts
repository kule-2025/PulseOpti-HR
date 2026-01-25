/**
 * 对比分析服务
 * 执行多维度对比分析，生成可视化数据和改进建议
 */

import { 
  ComparisonResult, 
  ComparisonDimension, 
  CompanyMetrics,
  IndustryBenchmark 
} from './industry-benchmark';
import { COMPARISON_DIMENSIONS } from './industry-benchmark';
import { industryBenchmarkService } from './industry-benchmark';

/**
 * 可视化图表数据接口
 */
export interface ChartData {
  type: 'bar' | 'line' | 'radar' | 'scatter' | 'pie';
  title: string;
  data: any;
  options?: any;
}

/**
 * 对比分析服务
 */
export class ComparisonAnalyzerService {
  /**
   * 执行对比分析
   */
  async compare(
    companyId: string,
    companyName: string,
    benchmark: IndustryBenchmark,
    companyMetrics: CompanyMetrics
  ): Promise<ComparisonResult> {
    // 执行多维度对比
    const comparisons = this.performComparisons(benchmark, companyMetrics);
    
    // 计算总体评分
    const { overallScore, overallPosition, overallLabel } = this.calculateOverallScore(comparisons);
    
    // 识别优势
    const strengths = this.identifyStrengths(comparisons);
    
    // 识别劣势
    const weaknesses = this.identifyWeaknesses(comparisons);
    
    // 生成改进建议
    const recommendations = this.generateRecommendations(weaknesses, comparisons);
    
    return {
      companyId,
      companyName,
      benchmark,
      companyData: companyMetrics,
      comparisons,
      overallScore,
      overallPosition,
      overallLabel,
      strengths,
      weaknesses,
      recommendations,
    };
  }
  
  /**
   * 执行多维度对比
   */
  private performComparisons(
    benchmark: IndustryBenchmark,
    companyData: CompanyMetrics
  ): Array<{
    dimension: ComparisonDimension;
    companyValue: number;
    benchmarkValue: number;
    difference: number;
    differencePercent: number;
    position: number;
    positionLabel: string;
    analysis: string;
  }> {
    const comparisons: any[] = [];
    
    // 员工规模对比
    comparisons.push({
      dimension: COMPARISON_DIMENSIONS[0],
      companyValue: companyData.employeeCount,
      benchmarkValue: benchmark.avgEmployeeCount,
      difference: companyData.employeeCount - benchmark.avgEmployeeCount,
      differencePercent: this.calculateDifferencePercent(
        companyData.employeeCount,
        benchmark.avgEmployeeCount,
        false
      ),
      position: this.calculatePosition(
        companyData.employeeCount,
        benchmark.avgEmployeeCount,
        false
      ),
      analysis: this.analyzeEmployeeSize(companyData.employeeCount, benchmark.avgEmployeeCount),
    });
    
    // 员工增长率对比
    comparisons.push({
      dimension: COMPARISON_DIMENSIONS[1],
      companyValue: companyData.employeeGrowthRate,
      benchmarkValue: benchmark.employeeGrowthRate,
      difference: companyData.employeeGrowthRate - benchmark.employeeGrowthRate,
      differencePercent: this.calculateDifferencePercent(
        companyData.employeeGrowthRate,
        benchmark.employeeGrowthRate,
        true
      ),
      position: this.calculatePosition(
        companyData.employeeGrowthRate,
        benchmark.employeeGrowthRate,
        true
      ),
      analysis: this.analyzeGrowthRate(companyData.employeeGrowthRate, benchmark.employeeGrowthRate),
    });
    
    // 离职率对比
    comparisons.push({
      dimension: COMPARISON_DIMENSIONS[2],
      companyValue: companyData.turnoverRate,
      benchmarkValue: benchmark.turnoverRate,
      difference: companyData.turnoverRate - benchmark.turnoverRate,
      differencePercent: this.calculateDifferencePercent(
        companyData.turnoverRate,
        benchmark.turnoverRate,
        false
      ),
      position: this.calculatePosition(
        companyData.turnoverRate,
        benchmark.turnoverRate,
        false
      ),
      analysis: this.analyzeTurnoverRate(companyData.turnoverRate, benchmark.turnoverRate),
    });
    
    // 出勤率对比
    comparisons.push({
      dimension: COMPARISON_DIMENSIONS[3],
      companyValue: companyData.avgAttendanceRate,
      benchmarkValue: benchmark.avgAttendanceRate,
      difference: companyData.avgAttendanceRate - benchmark.avgAttendanceRate,
      differencePercent: this.calculateDifferencePercent(
        companyData.avgAttendanceRate,
        benchmark.avgAttendanceRate,
        true
      ),
      position: this.calculatePosition(
        companyData.avgAttendanceRate,
        benchmark.avgAttendanceRate,
        true
      ),
      analysis: this.analyzeAttendanceRate(companyData.avgAttendanceRate, benchmark.avgAttendanceRate),
    });
    
    // 平均绩效分数对比
    comparisons.push({
      dimension: COMPARISON_DIMENSIONS[4],
      companyValue: companyData.avgPerformanceScore,
      benchmarkValue: benchmark.avgPerformanceScore,
      difference: companyData.avgPerformanceScore - benchmark.avgPerformanceScore,
      differencePercent: this.calculateDifferencePercent(
        companyData.avgPerformanceScore,
        benchmark.avgPerformanceScore,
        true
      ),
      position: this.calculatePosition(
        companyData.avgPerformanceScore,
        benchmark.avgPerformanceScore,
        true
      ),
      analysis: this.analyzePerformanceScore(companyData.avgPerformanceScore, benchmark.avgPerformanceScore),
    });
    
    // 平均加班时长对比
    comparisons.push({
      dimension: COMPARISON_DIMENSIONS[5],
      companyValue: companyData.avgOvertimeHours,
      benchmarkValue: benchmark.avgOvertimeHours,
      difference: companyData.avgOvertimeHours - benchmark.avgOvertimeHours,
      differencePercent: this.calculateDifferencePercent(
        companyData.avgOvertimeHours,
        benchmark.avgOvertimeHours,
        false
      ),
      position: this.calculatePosition(
        companyData.avgOvertimeHours,
        benchmark.avgOvertimeHours,
        false
      ),
      analysis: this.analyzeOvertimeHours(companyData.avgOvertimeHours, benchmark.avgOvertimeHours),
    });
    
    // 招聘周期对比
    comparisons.push({
      dimension: COMPARISON_DIMENSIONS[6],
      companyValue: companyData.avgRecruitmentCycle,
      benchmarkValue: benchmark.avgRecruitmentCycle,
      difference: companyData.avgRecruitmentCycle - benchmark.avgRecruitmentCycle,
      differencePercent: this.calculateDifferencePercent(
        companyData.avgRecruitmentCycle,
        benchmark.avgRecruitmentCycle,
        false
      ),
      position: this.calculatePosition(
        companyData.avgRecruitmentCycle,
        benchmark.avgRecruitmentCycle,
        false
      ),
      analysis: this.analyzeRecruitmentCycle(companyData.avgRecruitmentCycle, benchmark.avgRecruitmentCycle),
    });
    
    // Offer接受率对比
    comparisons.push({
      dimension: COMPARISON_DIMENSIONS[7],
      companyValue: companyData.offerAcceptanceRate,
      benchmarkValue: benchmark.offerAcceptanceRate,
      difference: companyData.offerAcceptanceRate - benchmark.offerAcceptanceRate,
      differencePercent: this.calculateDifferencePercent(
        companyData.offerAcceptanceRate,
        benchmark.offerAcceptanceRate,
        true
      ),
      position: this.calculatePosition(
        companyData.offerAcceptanceRate,
        benchmark.offerAcceptanceRate,
        true
      ),
      analysis: this.analyzeOfferAcceptanceRate(companyData.offerAcceptanceRate, benchmark.offerAcceptanceRate),
    });
    
    // 单次招聘成本对比
    comparisons.push({
      dimension: COMPARISON_DIMENSIONS[8],
      companyValue: companyData.costPerHire,
      benchmarkValue: benchmark.costPerHire,
      difference: companyData.costPerHire - benchmark.costPerHire,
      differencePercent: this.calculateDifferencePercent(
        companyData.costPerHire,
        benchmark.costPerHire,
        false
      ),
      position: this.calculatePosition(
        companyData.costPerHire,
        benchmark.costPerHire,
        false
      ),
      analysis: this.analyzeCostPerHire(companyData.costPerHire, benchmark.costPerHire),
    });
    
    // 平均薪资对比
    comparisons.push({
      dimension: COMPARISON_DIMENSIONS[9],
      companyValue: companyData.avgSalary,
      benchmarkValue: benchmark.avgSalary,
      difference: companyData.avgSalary - benchmark.avgSalary,
      differencePercent: this.calculateDifferencePercent(
        companyData.avgSalary,
        benchmark.avgSalary,
        false
      ),
      position: this.calculatePosition(
        companyData.avgSalary,
        benchmark.avgSalary,
        false
      ),
      analysis: this.analyzeSalary(companyData.avgSalary, benchmark.avgSalary),
    });
    
    // 薪资增长率对比
    comparisons.push({
      dimension: COMPARISON_DIMENSIONS[10],
      companyValue: companyData.salaryGrowthRate,
      benchmarkValue: benchmark.salaryGrowthRate,
      difference: companyData.salaryGrowthRate - benchmark.salaryGrowthRate,
      differencePercent: this.calculateDifferencePercent(
        companyData.salaryGrowthRate,
        benchmark.salaryGrowthRate,
        true
      ),
      position: this.calculatePosition(
        companyData.salaryGrowthRate,
        benchmark.salaryGrowthRate,
        true
      ),
      analysis: this.analyzeSalaryGrowthRate(companyData.salaryGrowthRate, benchmark.salaryGrowthRate),
    });
    
    // 员工满意度对比
    comparisons.push({
      dimension: COMPARISON_DIMENSIONS[11],
      companyValue: companyData.employeeSatisfaction,
      benchmarkValue: benchmark.employeeSatisfaction,
      difference: companyData.employeeSatisfaction - benchmark.employeeSatisfaction,
      differencePercent: this.calculateDifferencePercent(
        companyData.employeeSatisfaction,
        benchmark.employeeSatisfaction,
        true
      ),
      position: this.calculatePosition(
        companyData.employeeSatisfaction,
        benchmark.employeeSatisfaction,
        true
      ),
      analysis: this.analyzeSatisfaction(companyData.employeeSatisfaction, benchmark.employeeSatisfaction),
    });
    
    // 敬业度对比
    comparisons.push({
      dimension: COMPARISON_DIMENSIONS[12],
      companyValue: companyData.engagementScore,
      benchmarkValue: benchmark.engagementScore,
      difference: companyData.engagementScore - benchmark.engagementScore,
      differencePercent: this.calculateDifferencePercent(
        companyData.engagementScore,
        benchmark.engagementScore,
        true
      ),
      position: this.calculatePosition(
        companyData.engagementScore,
        benchmark.engagementScore,
        true
      ),
      analysis: this.analyzeEngagement(companyData.engagementScore, benchmark.engagementScore),
    });
    
    return comparisons;
  }
  
  /**
   * 计算差异百分比
   */
  private calculateDifferencePercent(
    companyValue: number,
    benchmarkValue: number,
    higherIsBetter: boolean
  ): number {
    if (benchmarkValue === 0) return 0;
    
    const diff = ((companyValue - benchmarkValue) / benchmarkValue) * 100;
    return Math.round(diff * 10) / 10;
  }
  
  /**
   * 计算百分位位置
   */
  private calculatePosition(
    companyValue: number,
    benchmarkValue: number,
    higherIsBetter: boolean
  ): number {
    const ratio = companyValue / benchmarkValue;
    
    // 将比率映射到0-100的百分位
    let position: number;
    if (higherIsBetter) {
      if (ratio >= 1.3) position = 95;
      else if (ratio >= 1.2) position = 85;
      else if (ratio >= 1.1) position = 75;
      else if (ratio >= 1.05) position = 65;
      else if (ratio >= 0.95) position = 55;
      else if (ratio >= 0.9) position = 45;
      else if (ratio >= 0.8) position = 35;
      else if (ratio >= 0.7) position = 25;
      else position = 15;
    } else {
      if (ratio <= 0.7) position = 95;
      else if (ratio <= 0.8) position = 85;
      else if (ratio <= 0.9) position = 75;
      else if (ratio <= 0.95) position = 65;
      else if (ratio <= 1.05) position = 55;
      else if (ratio <= 1.1) position = 45;
      else if (ratio <= 1.2) position = 35;
      else if (ratio <= 1.3) position = 25;
      else position = 15;
    }
    
    return position;
  }
  
  /**
   * 获取位置标签
   */
  getPositionLabel(position: number): string {
    if (position >= 80) return 'top';
    if (position >= 60) return 'above-average';
    if (position >= 40) return 'average';
    if (position >= 20) return 'below-average';
    return 'bottom';
  }
  
  /**
   * 计算总体评分
   */
  private calculateOverallScore(comparisons: any[]): {
    overallScore: number;
    overallPosition: number;
    overallLabel: string;
  } {
    // 计算平均位置
    const avgPosition = comparisons.reduce((sum, c) => sum + c.position, 0) / comparisons.length;
    
    return {
      overallScore: Math.round(avgPosition),
      overallPosition: Math.round(avgPosition),
      overallLabel: this.getPositionLabel(avgPosition),
    };
  }
  
  /**
   * 识别优势
   */
  private identifyStrengths(comparisons: any[]): string[] {
    return comparisons
      .filter(c => c.position >= 60)
      .map(c => `${c.dimension.label}（${c.positionLabel === 'top' ? '领先' : '高于'}行业${c.position}%位）`);
  }
  
  /**
   * 识别劣势
   */
  private identifyWeaknesses(comparisons: any[]): string[] {
    return comparisons
      .filter(c => c.position < 40)
      .map(c => `${c.dimension.label}（${c.positionLabel === 'bottom' ? '落后' : '低于'}行业${100 - c.position}%位）`);
  }
  
  /**
   * 生成改进建议
   */
  private generateRecommendations(weaknesses: string[], comparisons: any[]): string[] {
    const recommendations: string[] = [];
    
    for (const comparison of comparisons) {
      if (comparison.position < 40) {
        const recommendation = this.getRecommendationForDimension(comparison);
        if (recommendation) {
          recommendations.push(recommendation);
        }
      }
    }
    
    return recommendations.slice(0, 5); // 最多返回5条建议
  }
  
  /**
   * 获取特定维度的改进建议
   */
  private getRecommendationForDimension(comparison: any): string | null {
    const key = comparison.dimension.key;
    
    const recommendations: Record<string, string> = {
      employeeCount: '建议制定人才招聘计划，优化招聘渠道，加快人才引进速度。',
      employeeGrowthRate: '建议加强雇主品牌建设，提升岗位吸引力，加快业务扩张。',
      turnoverRate: '建议分析离职原因，优化薪酬福利，改善工作环境，加强员工关怀。',
      avgAttendanceRate: '建议完善考勤管理制度，优化工作安排，提升员工工作满意度。',
      avgPerformanceScore: '建议加强绩效管理培训，建立激励机制，提升员工工作积极性。',
      avgOvertimeHours: '建议优化工作流程，合理分配工作负荷，提升工作效率。',
      avgRecruitmentCycle: '建议优化招聘流程，使用AI辅助筛选，提升招聘效率。',
      offerAcceptanceRate: '建议优化薪酬福利方案，改善候选人体验，加强雇主品牌建设。',
      costPerHire: '建议优化招聘渠道组合，提高内部推荐比例，降低招聘成本。',
      avgSalary: '建议定期进行市场薪酬调研，建立有竞争力的薪酬体系。',
      salaryGrowthRate: '建议建立薪资调整机制，根据绩效和市场水平合理调整薪资。',
      employeeSatisfaction: '建议定期开展员工满意度调查，针对性改善工作环境和福利待遇。',
      engagementScore: '建议加强内部沟通，提升员工参与感，建立清晰的发展通道。',
    };
    
    return recommendations[key] || null;
  }
  
  /**
   * 各维度分析
   */
  private analyzeEmployeeSize(company: number, benchmark: number): string {
    const diff = ((company - benchmark) / benchmark) * 100;
    if (diff > 20) return `公司员工规模比行业平均大${Math.abs(diff).toFixed(1)}%，规模优势明显。`;
    if (diff < -20) return `公司员工规模比行业平均小${Math.abs(diff).toFixed(1)}%，还有扩张空间。`;
    return `公司员工规模与行业平均水平相当。`;
  }
  
  private analyzeGrowthRate(company: number, benchmark: number): string {
    const diff = company - benchmark;
    if (diff > 5) return `员工增长率高于行业平均${diff.toFixed(1)}个百分点，发展势头良好。`;
    if (diff < -5) return `员工增长率低于行业平均${Math.abs(diff).toFixed(1)}个百分点，需要关注业务发展。`;
    return `员工增长率与行业平均水平相当。`;
  }
  
  private analyzeTurnoverRate(company: number, benchmark: number): string {
    const diff = company - benchmark;
    if (diff > 5) return `离职率高于行业平均${diff.toFixed(1)}个百分点，需要关注员工保留。`;
    if (diff < -5) return `离职率低于行业平均${Math.abs(diff).toFixed(1)}个百分点，员工稳定性良好。`;
    return `离职率与行业平均水平相当。`;
  }
  
  private analyzeAttendanceRate(company: number, benchmark: number): string {
    const diff = company - benchmark;
    if (diff > 2) return `出勤率高于行业平均${diff.toFixed(1)}个百分点，员工敬业度高。`;
    if (diff < -2) return `出勤率低于行业平均${Math.abs(diff).toFixed(1)}个百分点，需要关注员工工作积极性。`;
    return `出勤率与行业平均水平相当。`;
  }
  
  private analyzePerformanceScore(company: number, benchmark: number): string {
    const diff = company - benchmark;
    if (diff > 5) return `平均绩效分数高于行业平均${diff.toFixed(1)}分，团队表现优秀。`;
    if (diff < -5) return `平均绩效分数低于行业平均${Math.abs(diff).toFixed(1)}分，需要提升团队绩效。`;
    return `平均绩效分数与行业平均水平相当。`;
  }
  
  private analyzeOvertimeHours(company: number, benchmark: number): string {
    const diff = company - benchmark;
    if (diff > 5) return `平均加班时长高于行业平均${diff.toFixed(1)}小时，需要关注工作负荷。`;
    if (diff < -5) return `平均加班时长低于行业平均${Math.abs(diff).toFixed(1)}小时，工作安排合理。`;
    return `平均加班时长与行业平均水平相当。`;
  }
  
  private analyzeRecruitmentCycle(company: number, benchmark: number): string {
    const diff = company - benchmark;
    if (diff > 5) return `招聘周期高于行业平均${diff.toFixed(1)}天，需要优化招聘流程。`;
    if (diff < -5) return `招聘周期低于行业平均${Math.abs(diff).toFixed(1)}天，招聘效率高。`;
    return `招聘周期与行业平均水平相当。`;
  }
  
  private analyzeOfferAcceptanceRate(company: number, benchmark: number): string {
    const diff = company - benchmark;
    if (diff > 10) return `Offer接受率高于行业平均${diff.toFixed(1)}个百分点，雇主品牌强。`;
    if (diff < -10) return `Offer接受率低于行业平均${Math.abs(diff).toFixed(1)}个百分点，需要优化薪酬福利。`;
    return `Offer接受率与行业平均水平相当。`;
  }
  
  private analyzeCostPerHire(company: number, benchmark: number): string {
    const diff = ((company - benchmark) / benchmark) * 100;
    if (diff > 20) return `单次招聘成本比行业平均高${diff.toFixed(1)}%，需要优化招聘策略。`;
    if (diff < -20) return `单次招聘成本比行业平均低${Math.abs(diff).toFixed(1)}%，招聘成本控制良好。`;
    return `单次招聘成本与行业平均水平相当。`;
  }
  
  private analyzeSalary(company: number, benchmark: number): string {
    const diff = ((company - benchmark) / benchmark) * 100;
    if (diff > 20) return `平均薪资比行业平均高${diff.toFixed(1)}%，薪酬竞争力强。`;
    if (diff < -20) return `平均薪资比行业平均低${Math.abs(diff).toFixed(1)}%，可能影响人才保留。`;
    return `平均薪资与行业平均水平相当。`;
  }
  
  private analyzeSalaryGrowthRate(company: number, benchmark: number): string {
    const diff = company - benchmark;
    if (diff > 2) return `薪资增长率高于行业平均${diff.toFixed(1)}个百分点，员工激励到位。`;
    if (diff < -2) return `薪资增长率低于行业平均${Math.abs(diff).toFixed(1)}个百分点，可能影响员工积极性。`;
    return `薪资增长率与行业平均水平相当。`;
  }
  
  private analyzeSatisfaction(company: number, benchmark: number): string {
    const diff = company - benchmark;
    if (diff > 10) return `员工满意度高于行业平均${diff.toFixed(1)}分，工作环境良好。`;
    if (diff < -10) return `员工满意度低于行业平均${Math.abs(diff).toFixed(1)}分，需要改善工作环境。`;
    return `员工满意度与行业平均水平相当。`;
  }
  
  private analyzeEngagement(company: number, benchmark: number): string {
    const diff = company - benchmark;
    if (diff > 10) return `敬业度高于行业平均${diff.toFixed(1)}分，员工参与感强。`;
    if (diff < -10) return `敬业度低于行业平均${Math.abs(diff).toFixed(1)}分，需要加强内部沟通。`;
    return `敬业度与行业平均水平相当。`;
  }
  
  /**
   * 生成可视化图表数据
   */
  generateChartData(result: ComparisonResult): ChartData[] {
    const charts: ChartData[] = [];
    
    // 1. 对比柱状图（公司 vs 行业）
    charts.push({
      type: 'bar',
      title: '核心指标对比',
      data: {
        labels: result.comparisons
          .filter(c => c.dimension.category !== 'satisfaction')
          .map(c => c.dimension.label),
        datasets: [
          {
            label: '本公司',
            data: result.comparisons
              .filter(c => c.dimension.category !== 'satisfaction')
              .map(c => c.companyValue),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
          },
          {
            label: '行业平均',
            data: result.comparisons
              .filter(c => c.dimension.category !== 'satisfaction')
              .map(c => c.benchmarkValue),
            backgroundColor: 'rgba(156, 163, 175, 0.8)',
            borderColor: 'rgba(156, 163, 175, 1)',
            borderWidth: 1,
          },
        ],
      },
    });
    
    // 2. 相对位置雷达图
    charts.push({
      type: 'radar',
      title: '综合能力雷达图',
      data: {
        labels: result.comparisons.map(c => c.dimension.label),
        datasets: [
          {
            label: '相对位置（百分位）',
            data: result.comparisons.map(c => c.position),
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          },
        ],
      },
    });
    
    // 3. 差异分析柱状图
    charts.push({
      type: 'bar',
      title: '与行业平均差异',
      data: {
        labels: result.comparisons.map(c => c.dimension.label),
        datasets: [
          {
            label: '差异百分比（%）',
            data: result.comparisons.map(c => c.differencePercent),
            backgroundColor: result.comparisons.map(c => 
              c.differencePercent > 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'
            ),
            borderColor: result.comparisons.map(c => 
              c.differencePercent > 0 ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)'
            ),
            borderWidth: 1,
          },
        ],
      },
    });
    
    // 4. 总体评分仪表盘数据
    charts.push({
      type: 'bar',
      title: '总体评分',
      data: {
        labels: ['总体评分'],
        datasets: [
          {
            label: '分数',
            data: [result.overallScore],
            backgroundColor: this.getScoreColor(result.overallScore),
            borderColor: this.getScoreBorderColor(result.overallScore),
            borderWidth: 2,
          },
        ],
      },
      options: {
        scales: {
          y: {
            min: 0,
            max: 100,
          },
        },
      },
    });
    
    // 5. 绩效分布对比饼图
    charts.push({
      type: 'pie',
      title: '绩效分布对比',
      data: {
        labels: ['优秀', '良好', '一般', '较差'],
        datasets: [
          {
            label: '本公司',
            data: [
              result.companyData.performanceDistribution.excellent,
              result.companyData.performanceDistribution.good,
              result.companyData.performanceDistribution.average,
              result.companyData.performanceDistribution.poor,
            ],
            backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(251, 191, 36, 0.8)', 'rgba(239, 68, 68, 0.8)'],
          },
          {
            label: '行业平均',
            data: [
              result.benchmark.performanceDistribution.excellent,
              result.benchmark.performanceDistribution.good,
              result.benchmark.performanceDistribution.average,
              result.benchmark.performanceDistribution.poor,
            ],
            backgroundColor: ['rgba(34, 197, 94, 0.5)', 'rgba(59, 130, 246, 0.5)', 'rgba(251, 191, 36, 0.5)', 'rgba(239, 68, 68, 0.5)'],
          },
        ],
      },
    });
    
    return charts;
  }
  
  /**
   * 获取评分颜色
   */
  private getScoreColor(score: number): string {
    if (score >= 80) return 'rgba(34, 197, 94, 0.8)';
    if (score >= 60) return 'rgba(59, 130, 246, 0.8)';
    if (score >= 40) return 'rgba(251, 191, 36, 0.8)';
    return 'rgba(239, 68, 68, 0.8)';
  }
  
  /**
   * 获取评分边框颜色
   */
  private getScoreBorderColor(score: number): string {
    if (score >= 80) return 'rgba(34, 197, 94, 1)';
    if (score >= 60) return 'rgba(59, 130, 246, 1)';
    if (score >= 40) return 'rgba(251, 191, 36, 1)';
    return 'rgba(239, 68, 68, 1)';
  }
  
  /**
   * 生成对比报告
   */
  generateReport(result: ComparisonResult): string {
    const report = `
# 企业HR指标对比分析报告

## 基本信息
- 公司名称：${result.companyName}
- 行业：${this.getIndustryLabel(result.benchmark.industry)}
- 企业规模：${this.getSizeLabel(result.benchmark.companySize)}
- 地区：${this.getRegionLabel(result.benchmark.region)}
- 数据时间：${result.benchmark.year}年${result.benchmark.quarter ? result.benchmark.quarter + '季度' : ''}

## 总体评估
- **总体评分**：${result.overallScore}分
- **行业位置**：${result.overallPosition}%位（${this.getPositionLabelCN(result.overallLabel)}）

## 核心优势
${result.strengths.map(s => `- ✅ ${s}`).join('\n')}

## 需要改进
${result.weaknesses.map(w => `- ⚠️ ${w}`).join('\n')}

## 改进建议
${result.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## 详细对比分析
${result.comparisons.map(c => `
### ${c.dimension.label}
- **本公司**：${c.companyValue} ${c.dimension.unit}
- **行业平均**：${c.benchmarkValue} ${c.dimension.unit}
- **差异**：${c.difference > 0 ? '+' : ''}${c.difference.toFixed(1)} ${c.dimension.unit}（${c.differencePercent > 0 ? '+' : ''}${c.differencePercent.toFixed(1)}%）
- **行业位置**：${c.position}%位（${this.getPositionLabelCN(c.positionLabel)}）
- **分析**：${c.analysis}
`).join('\n')}

---

报告生成时间：${new Date().toLocaleString('zh-CN')}
    `;
    
    return report;
  }
  
  /**
   * 获取中文位置标签
   */
  private getPositionLabelCN(label: string): string {
    const labels: Record<string, string> = {
      top: '领先',
      'above-average': '高于平均',
      average: '平均',
      'below-average': '低于平均',
      bottom: '落后',
    };
    return labels[label] || label;
  }
  
  private getIndustryLabel(industry: string): string {
    const industries = industryBenchmarkService.getIndustries();
    const found = industries.find(i => i.value === industry);
    return found?.label || industry;
  }
  
  private getSizeLabel(size: string): string {
    const sizes = industryBenchmarkService.getCompanySizes();
    const found = sizes.find(s => s.value === size);
    return found?.label || size;
  }
  
  private getRegionLabel(region: string): string {
    const regions = industryBenchmarkService.getRegions();
    const found = regions.find(r => r.value === region);
    return found?.label || region;
  }
}

// 导出单例
export const comparisonAnalyzerService = new ComparisonAnalyzerService();
