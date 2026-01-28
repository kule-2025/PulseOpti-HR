'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Grid3x3,
  Search,
  User,
  Building,
  TrendingUp,
  Star,
  AlertCircle,
  Plus,
  RefreshCw,
  Download,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

type GridBox =
  | 'star' // 高潜高绩效 - 明星员工
  | 'expert' // 高绩效低潜 - 业务专家
  | 'potential' // 高潜中绩效 - 潜力人才
  | 'contributor' // 中绩效中潜 - 核心贡献者
  | 'solid' // 中绩效低潜 - 稳定骨干
  | 'inconsistent' // 低绩效高潜 - 不稳定表现
  | 'future' // 中潜低绩效 - 未来可期
  | 'problem'; // 低绩效低潜 - 需要改进

interface TalentGridData {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  performanceScore: number; // 绩效得分 (0-100)
  potentialScore: number; // 潜力得分 (0-100)
  gridBox: GridBox;
  tenure: number; // 在职年限
  lastAssessmentDate: string;
  keyStrengths: string[];
  developmentNeeds: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export default function NineBoxGridPage() {
  const [gridData, setGridData] = useState<TalentGridData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [showRefreshDialog, setShowRefreshDialog] = useState(false);

  const boxConfig = [
    {
      id: 'star',
      label: '明星员工',
      description: '高绩效高潜力',
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      borderColor: 'border-blue-200 dark:border-blue-800',
      icon: Star,
      xRange: [66, 100],
      yRange: [66, 100],
      action: '重点培养',
    },
    {
      id: 'potential',
      label: '潜力人才',
      description: '中绩效高潜力',
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      borderColor: 'border-purple-200 dark:border-purple-800',
      icon: TrendingUp,
      xRange: [33, 65],
      yRange: [66, 100],
      action: '强化绩效',
    },
    {
      id: 'expert',
      label: '核心骨干',
      description: '高绩效中潜力',
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      borderColor: 'border-green-200 dark:border-green-800',
      icon: TrendingUp,
      xRange: [66, 100],
      yRange: [33, 65],
      action: '深度培养',
    },
    {
      id: 'solid',
      label: '稳定员工',
      description: '中绩效中潜力',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      icon: User,
      xRange: [33, 65],
      yRange: [33, 65],
      action: '稳步发展',
    },
    {
      id: 'inconsistent',
      label: '待提升',
      description: '低绩效高潜力',
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      borderColor: 'border-orange-200 dark:border-orange-800',
      icon: AlertCircle,
      xRange: [0, 32],
      yRange: [66, 100],
      action: '绩效辅导',
    },
    {
      id: 'contributor',
      label: '贡献者',
      description: '高绩效低潜力',
      color: 'bg-teal-500',
      textColor: 'text-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-950',
      borderColor: 'border-teal-200 dark:border-teal-800',
      icon: User,
      xRange: [66, 100],
      yRange: [0, 32],
      action: '专业深耕',
    },
    {
      id: 'future',
      label: '新人',
      description: '中绩效低潜力',
      color: 'bg-gray-500',
      textColor: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-950',
      borderColor: 'border-gray-200 dark:border-gray-800',
      icon: User,
      xRange: [33, 65],
      yRange: [0, 32],
      action: '观察培养',
    },
    {
      id: 'problem',
      label: '问题员工',
      description: '低绩效低潜力',
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950',
      borderColor: 'border-red-200 dark:border-red-800',
      icon: AlertCircle,
      xRange: [0, 32],
      yRange: [0, 32],
      action: '制定计划',
    },
  ];

  useEffect(() => {
    // 模拟获取九宫格数据
    setTimeout(() => {
      setGridData([
        {
          id: '1',
          employeeId: 'E001',
          employeeName: '张三',
          department: '技术部',
          position: '高级前端工程师',
          performanceScore: 88,
          potentialScore: 92,
          gridBox: 'star',
          tenure: 3,
          lastAssessmentDate: '2024-01-15',
          keyStrengths: ['技术能力强', '学习能力强', '团队协作好'],
          developmentNeeds: ['项目管理能力'],
          riskLevel: 'low',
        },
        {
          id: '2',
          employeeId: 'E002',
          employeeName: '李四',
          department: '产品部',
          position: '产品经理',
          performanceScore: 85,
          potentialScore: 90,
          gridBox: 'star',
          tenure: 2,
          lastAssessmentDate: '2024-01-20',
          keyStrengths: ['产品思维清晰', '沟通能力强'],
          developmentNeeds: ['数据分析能力'],
          riskLevel: 'low',
        },
        {
          id: '3',
          employeeId: 'E003',
          employeeName: '王五',
          department: '销售部',
          position: '销售代表',
          performanceScore: 78,
          potentialScore: 88,
          gridBox: 'potential',
          tenure: 1.5,
          lastAssessmentDate: '2024-01-25',
          keyStrengths: ['客户关系维护', '学习能力强'],
          developmentNeeds: ['销售技巧', '行业知识'],
          riskLevel: 'medium',
        },
        {
          id: '4',
          employeeId: 'E004',
          employeeName: '赵六',
          department: '技术部',
          position: '后端工程师',
          performanceScore: 92,
          potentialScore: 58,
          gridBox: 'expert',
          tenure: 4,
          lastAssessmentDate: '2024-01-18',
          keyStrengths: ['技术专业性强', '问题解决能力'],
          developmentNeeds: ['技术广度'],
          riskLevel: 'low',
        },
        {
          id: '5',
          employeeId: 'E005',
          employeeName: '孙七',
          department: '运营部',
          position: '运营专员',
          performanceScore: 72,
          potentialScore: 75,
          gridBox: 'solid',
          tenure: 2,
          lastAssessmentDate: '2024-01-22',
          keyStrengths: ['执行力强', '工作稳定'],
          developmentNeeds: ['创新思维', '专业深度'],
          riskLevel: 'medium',
        },
        {
          id: '6',
          employeeId: 'E006',
          employeeName: '周八',
          department: '市场部',
          position: '市场专员',
          performanceScore: 55,
          potentialScore: 85,
          gridBox: 'inconsistent',
          tenure: 0.5,
          lastAssessmentDate: '2024-01-28',
          keyStrengths: ['创意能力强', '学习能力强'],
          developmentNeeds: ['执行能力', '沟通技巧'],
          riskLevel: 'high',
        },
        {
          id: '7',
          employeeId: 'E007',
          employeeName: '吴九',
          department: '技术部',
          position: '测试工程师',
          performanceScore: 90,
          potentialScore: 35,
          gridBox: 'contributor',
          tenure: 5,
          lastAssessmentDate: '2024-01-12',
          keyStrengths: ['测试经验丰富', '质量意识强'],
          developmentNeeds: [],
          riskLevel: 'medium',
        },
        {
          id: '8',
          employeeId: 'E008',
          employeeName: '郑十',
          department: '行政部',
          position: '行政专员',
          performanceScore: 68,
          potentialScore: 30,
          gridBox: 'future',
          tenure: 0.8,
          lastAssessmentDate: '2024-01-30',
          keyStrengths: ['工作认真'],
          developmentNeeds: ['业务理解', '服务意识'],
          riskLevel: 'low',
        },
        {
          id: '9',
          employeeId: 'E009',
          employeeName: '钱十一',
          department: '销售部',
          position: '销售代表',
          performanceScore: 35,
          potentialScore: 25,
          gridBox: 'problem',
          tenure: 1,
          lastAssessmentDate: '2024-01-25',
          keyStrengths: [],
          developmentNeeds: ['销售技能', '工作态度'],
          riskLevel: 'high',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredData = gridData.filter((item) => {
    const matchesSearch =
      item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || item.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const departments = Array.from(new Set(gridData.map((item) => item.department)));

  const getBoxConfig = (gridBox: string) => {
    return boxConfig.find((box) => box.id === gridBox) || boxConfig[0];
  };

  const handleRefresh = () => {
    toast.success('九宫格数据已刷新');
    setShowRefreshDialog(false);
  };

  const statistics = {
    total: gridData.length,
    highRisk: gridData.filter((item) => item.riskLevel === 'high').length,
    mediumRisk: gridData.filter((item) => item.riskLevel === 'medium').length,
    avgPerformance: gridData.length > 0
      ? gridData.reduce((sum, item) => sum + item.performanceScore, 0) / gridData.length
      : 0,
    avgPotential: gridData.length > 0
      ? gridData.reduce((sum, item) => sum + item.potentialScore, 0) / gridData.length
      : 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Grid3x3 className="h-8 w-8 text-blue-600" />
              九宫格分析
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              基于绩效和潜力的人才矩阵分析
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.info('导出中...')}>
              <Download className="h-4 w-4 mr-2" />
              导出报告
            </Button>
            <Button onClick={() => setShowRefreshDialog(true)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新数据
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">总人数</p>
                  <p className="text-2xl font-bold">{statistics.total}</p>
                </div>
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">明星员工</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {gridData.filter((item) => item.gridBox === 'star').length}
                  </p>
                </div>
                <Star className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">高潜人才</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {gridData.filter((item) => item.gridBox === 'potential').length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">问题员工</p>
                  <p className="text-2xl font-bold text-red-600">
                    {gridData.filter((item) => item.gridBox === 'problem').length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">高风险</p>
                  <p className="text-2xl font-bold text-orange-600">{statistics.highRisk}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选栏 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索员工姓名、职位或部门..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="部门" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部部门</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 九宫格矩阵 */}
        <Card>
          <CardHeader>
            <CardTitle>人才九宫格矩阵</CardTitle>
            <CardDescription>
              横轴：绩效得分 | 纵轴：潜力得分
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {boxConfig.map((box) => {
                const BoxIcon = box.icon;
                const boxData = filteredData.filter((item) => item.gridBox === box.id);

                return (
                  <div
                    key={box.id}
                    className={`${box.bgColor} ${box.borderColor} border-2 rounded-lg p-4 transition-all hover:shadow-lg`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <BoxIcon className={`h-5 w-5 ${box.textColor}`} />
                        <h3 className={`font-bold ${box.textColor}`}>{box.label}</h3>
                      </div>
                      <Badge className={`${box.color} text-white border-0`}>
                        {boxData.length} 人
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{box.description}</p>
                    <p className={`text-sm font-medium ${box.textColor} mb-3`}>
                      行动：{box.action}
                    </p>

                    {boxData.length > 0 ? (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {boxData.map((item) => (
                          <div
                            key={item.id}
                            className="bg-white dark:bg-gray-800 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium">{item.employeeName}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {item.position} · {item.department}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-blue-600">
                                  P:{item.performanceScore}
                                </p>
                                <p className="text-sm font-bold text-purple-600">
                                  T:{item.potentialScore}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-400 text-sm">
                        暂无员工
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 详细列表 */}
        <Card>
          <CardHeader>
            <CardTitle>员工详细数据</CardTitle>
            <CardDescription>
              所有员工的绩效和潜力详细分析
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-600 dark:text-gray-400">加载中...</div>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-12">
                <Grid3x3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">暂无数据</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">员工</th>
                      <th className="text-left p-3">部门/职位</th>
                      <th className="text-center p-3">绩效</th>
                      <th className="text-center p-3">潜力</th>
                      <th className="text-left p-3">位置</th>
                      <th className="text-left p-3">优势</th>
                      <th className="text-center p-3">风险</th>
                      <th className="text-center p-3">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item) => {
                      const config = getBoxConfig(item.gridBox);
                      return (
                        <tr key={item.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium">{item.employeeName}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {item.employeeId}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <p>{item.position}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {item.department}
                            </p>
                          </td>
                          <td className="p-3 text-center">
                            <Badge
                              variant="outline"
                              className={
                                item.performanceScore >= 80
                                  ? 'bg-green-50 text-green-600 border-green-200'
                                  : item.performanceScore >= 60
                                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                                  : 'bg-red-50 text-red-600 border-red-200'
                              }
                            >
                              {item.performanceScore}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">
                            <Badge
                              variant="outline"
                              className={
                                item.potentialScore >= 80
                                  ? 'bg-purple-50 text-purple-600 border-purple-200'
                                  : item.potentialScore >= 60
                                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                                  : 'bg-gray-50 text-gray-600 border-gray-200'
                              }
                            >
                              {item.potentialScore}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge className={`${config.color} text-white border-0`}>
                              {config.label}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">
                              {item.keyStrengths.slice(0, 2).map((strength, index) => (
                                <span key={index} className="inline-block mr-1">
                                  {strength}
                                  {index < Math.min(2, item.keyStrengths.length) - 1 && ','}
                                </span>
                              ))}
                              {item.keyStrengths.length > 2 && '...'}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <Badge
                              variant="outline"
                              className={
                                item.riskLevel === 'high'
                                  ? 'bg-red-50 text-red-600 border-red-200'
                                  : item.riskLevel === 'medium'
                                  ? 'bg-yellow-50 text-yellow-600 border-yellow-200'
                                  : 'bg-green-50 text-green-600 border-green-200'
                              }
                            >
                              {item.riskLevel === 'high' ? '高' : item.riskLevel === 'medium' ? '中' : '低'}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">
                            <Button variant="outline" size="sm">
                              查看详情
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 刷新确认弹窗 */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
          !showRefreshDialog && 'hidden'
        }`}
        onClick={() => setShowRefreshDialog(false)}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-bold mb-2">确认刷新数据</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            刷新将重新计算所有员工的绩效和潜力得分，并重新分配九宫格位置。此操作将覆盖当前数据。
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowRefreshDialog(false)}>
              取消
            </Button>
            <Button onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              确认刷新
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
