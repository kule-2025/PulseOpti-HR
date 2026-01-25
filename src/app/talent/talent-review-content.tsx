'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Users,
  Target,
  TrendingUp,
  Award,
  Star,
  Grid,
  List,
  Eye,
  Download,
  Filter,
  Search,
  MoreHorizontal,
  Zap,
  BrainCircuit,
  UserPlus,
  ChevronRight,
  CheckCircle,
  Plus,
  Edit,
} from 'lucide-react';

interface Talent {
  id: string;
  name: string;
  department: string;
  position: string;
  level: string;
  performanceScore: number;
  potentialScore: number;
  quadrant: 'star' | 'high-potential' | 'solid' | 'improve' | 'question-mark';
  riskLevel: 'low' | 'medium' | 'high';
  keyCompetencies: string[];
  developmentNeeds: string[];
  careerPath: string[];
  successionReady: boolean;
  managerName: string;
  lastAssessment: string;
}

interface SuccessionPlan {
  id: string;
  positionId: string;
  positionName: string;
  department: string;
  incumbent: {
    id: string;
    name: string;
    retirementDate: string;
  };
  successors: Array<{
    id: string;
    name: string;
    readiness: 'ready-now' | 'ready-1y' | 'ready-2y';
    score: number;
  }>;
  riskLevel: 'critical' | 'moderate' | 'low';
}

export default function TalentReviewContent() {
  const [activeTab, setActiveTab] = useState('nine-grid');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [idpDialogOpen, setIdpDialogOpen] = useState(false);

  useEffect(() => {
    fetchTalentData();
  }, []);

  const fetchTalentData = async () => {
    try {
      // 模拟数据
      const mockTalents: Talent[] = [
        {
          id: '1',
          name: '张三',
          department: '技术部',
          position: '高级工程师',
          level: 'P7',
          performanceScore: 92,
          potentialScore: 85,
          quadrant: 'star',
          riskLevel: 'low',
          keyCompetencies: ['技术领导力', '项目管理', '团队协作'],
          developmentNeeds: ['战略思维', '商业意识'],
          careerPath: ['技术主管', '技术总监'],
          successionReady: true,
          managerName: '李明',
          lastAssessment: '2024-01-15',
        },
        {
          id: '2',
          name: '李四',
          department: '产品部',
          position: '产品经理',
          level: 'P6',
          performanceScore: 78,
          potentialScore: 88,
          quadrant: 'high-potential',
          riskLevel: 'medium',
          keyCompetencies: ['产品规划', '用户洞察', '数据分析'],
          developmentNeeds: ['技术理解', '团队管理'],
          careerPath: ['高级产品经理', '产品总监'],
          successionReady: false,
          managerName: '王芳',
          lastAssessment: '2024-01-10',
        },
        {
          id: '3',
          name: '王五',
          department: '销售部',
          position: '销售经理',
          level: 'M2',
          performanceScore: 85,
          potentialScore: 72,
          quadrant: 'solid',
          riskLevel: 'low',
          keyCompetencies: ['客户关系', '销售技巧', '团队管理'],
          developmentNeeds: ['数字营销', '渠道拓展'],
          careerPath: ['销售总监'],
          successionReady: true,
          managerName: '赵六',
          lastAssessment: '2024-01-20',
        },
        {
          id: '4',
          name: '赵六',
          department: '人力资源',
          position: 'HRBP',
          level: 'P6',
          performanceScore: 75,
          potentialScore: 68,
          quadrant: 'improve',
          riskLevel: 'medium',
          keyCompetencies: ['员工关系', '组织发展'],
          developmentNeeds: ['数据分析', '业务理解'],
          careerPath: ['高级HRBP'],
          successionReady: false,
          managerName: '孙七',
          lastAssessment: '2024-01-18',
        },
        {
          id: '5',
          name: '陈小华',
          department: '技术部',
          position: '前端工程师',
          level: 'P5',
          performanceScore: 82,
          potentialScore: 65,
          quadrant: 'solid',
          riskLevel: 'low',
          keyCompetencies: ['前端开发', 'UI/UX'],
          developmentNeeds: ['架构设计', '性能优化'],
          careerPath: ['高级工程师', '技术主管'],
          successionReady: false,
          managerName: '张三',
          lastAssessment: '2024-01-22',
        },
        {
          id: '6',
          name: '林小花',
          department: '技术部',
          position: '初级工程师',
          level: 'P4',
          performanceScore: 70,
          potentialScore: 80,
          quadrant: 'high-potential',
          riskLevel: 'medium',
          keyCompetencies: ['学习能力', '技术基础'],
          developmentNeeds: ['项目经验', '团队协作'],
          careerPath: ['工程师', '高级工程师'],
          successionReady: false,
          managerName: '张三',
          lastAssessment: '2024-01-25',
        },
      ];
      setTalents(mockTalents);
    } catch (error) {
      console.error('获取人才数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const successionPlans: SuccessionPlan[] = [
    {
      id: '1',
      positionId: 'pos-1',
      positionName: '技术总监',
      department: '技术部',
      incumbent: {
        id: 'inc-1',
        name: '李明',
        retirementDate: '2025-06-30',
      },
      successors: [
        { id: '1', name: '张三', readiness: 'ready-now', score: 92 },
        { id: '2', name: '陈小华', readiness: 'ready-1y', score: 82 },
      ],
      riskLevel: 'moderate',
    },
    {
      id: '2',
      positionId: 'pos-2',
      positionName: '销售总监',
      department: '销售部',
      incumbent: {
        id: 'inc-2',
        name: '赵总',
        retirementDate: '2025-12-31',
      },
      successors: [
        { id: '3', name: '王五', readiness: 'ready-now', score: 85 },
      ],
      riskLevel: 'low',
    },
    {
      id: '3',
      positionId: 'pos-3',
      positionName: '产品总监',
      department: '产品部',
      incumbent: {
        id: 'inc-3',
        name: '王总',
        retirementDate: '2026-03-31',
      },
      successors: [],
      riskLevel: 'critical',
    },
  ];

  const getQuadrantLabel = (quadrant: string) => {
    const labels: Record<string, string> = {
      'star': '明星员工',
      'high-potential': '高潜人才',
      'solid': '中坚力量',
      'improve': '待提升',
      'question-mark': '观察期',
    };
    return labels[quadrant] || quadrant;
  };

  const getQuadrantColor = (quadrant: string) => {
    const colors: Record<string, string> = {
      'star': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      'high-potential': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      'solid': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      'improve': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      'question-mark': 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
    };
    return colors[quadrant] || 'bg-gray-100';
  };

  const getReadinessBadge = (readiness: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      'ready-now': { label: '立即就绪', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
      'ready-1y': { label: '1年就绪', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
      'ready-2y': { label: '2年就绪', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
    };
    const badge = badges[readiness] || { label: readiness, color: 'bg-gray-100' };
    return <Badge className={badge.color}>{badge.label}</Badge>;
  };

  const getRiskBadge = (riskLevel: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      'critical': { label: '高风险', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
      'moderate': { label: '中风险', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
      'low': { label: '低风险', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
    };
    const badge = badges[riskLevel] || { label: riskLevel, color: 'bg-gray-100' };
    return <Badge className={badge.color}>{badge.label}</Badge>;
  };

  // 九宫格数据分组
  const nineGridData = {
    highPotential: [
      { quadrant: 'star', label: '明星员工', talents: talents.filter((item: any) => t => t.quadrant === 'star') },
      { quadrant: 'high-potential', label: '高潜人才', talents: talents.filter((item: any) => t => t.quadrant === 'high-potential') },
      { quadrant: 'solid', label: '中坚力量', talents: talents.filter((item: any) => t => t.quadrant === 'solid') },
    ],
    mediumPotential: [
      { quadrant: 'improve', label: '待提升', talents: talents.filter((item: any) => t => t.quadrant === 'improve') },
    ],
    lowPotential: [
      { quadrant: 'question-mark', label: '观察期', talents: talents.filter((item: any) => t => t.quadrant === 'question-mark') },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            人才盘点
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            基于绩效和潜力的全面人才分析与规划
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出报告
          </Button>
          <Button>
            <Star className="h-4 w-4 mr-2" />
            发起评估
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总人数</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{talents.length}</div>
            <p className="text-xs text-gray-500">覆盖所有部门</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">明星员工</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {talents.filter((item: any) => t => t.quadrant === 'star').length}
            </div>
            <p className="text-xs text-gray-500">
              占比 {((talents.filter((item: any) => t => t.quadrant === 'star').length / talents.length) * 100).toFixed(0)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">高潜人才</CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {talents.filter((item: any) => t => t.quadrant === 'high-potential').length}
            </div>
            <p className="text-xs text-gray-500">
              占比 {((talents.filter((item: any) => t => t.quadrant === 'high-potential').length / talents.length) * 100).toFixed(0)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">继任就绪</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {talents.filter((item: any) => t => t.successionReady).length}
            </div>
            <p className="text-xs text-gray-500">可立即继任关键岗位</p>
          </CardContent>
        </Card>
      </div>

      {/* 主内容区域 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="nine-grid">人才九宫格</TabsTrigger>
          <TabsTrigger value="high-potential">高潜人才</TabsTrigger>
          <TabsTrigger value="succession">继任计划</TabsTrigger>
          <TabsTrigger value="talent-map">人才地图</TabsTrigger>
          <TabsTrigger value="idp">发展计划(IDP)</TabsTrigger>
        </TabsList>

        {/* 人才九宫格 */}
        <TabsContent value="nine-grid" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>人才九宫格分析</CardTitle>
                  <CardDescription>
                    基于绩效与潜力的二维矩阵分析
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setViewMode('grid')}>
                    <Grid className="h-4 w-4 mr-1" />
                    矩阵视图
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setViewMode('list')}>
                    <List className="h-4 w-4 mr-1" />
                    列表视图
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-3 gap-4">
                  {/* 高潜力行 */}
                  <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4 border-2 border-purple-200 dark:border-purple-800">
                    <div className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">高潜力/高绩效</div>
                    <div className="text-xs text-purple-700 dark:text-purple-300 mb-3">明星员工</div>
                    {talents.filter((item: any) => t => t.quadrant === 'star').map(talent => (
                      <div
                        key={talent.id}
                        className="bg-white dark:bg-gray-800 rounded p-3 mb-2 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedTalent(talent)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{talent.name}</div>
                            <div className="text-xs text-gray-500">{talent.position}</div>
                          </div>
                          <Badge className={getQuadrantColor(talent.quadrant)}>
                            {talent.performanceScore}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800">
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">高潜力/中绩效</div>
                    <div className="text-xs text-blue-700 dark:text-blue-300 mb-3">高潜人才</div>
                    {talents.filter((item: any) => t => t.quadrant === 'high-potential').map(talent => (
                      <div
                        key={talent.id}
                        className="bg-white dark:bg-gray-800 rounded p-3 mb-2 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedTalent(talent)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{talent.name}</div>
                            <div className="text-xs text-gray-500">{talent.position}</div>
                          </div>
                          <Badge className={getQuadrantColor(talent.quadrant)}>
                            {talent.performanceScore}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border-2 border-green-200 dark:border-green-800">
                    <div className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">中潜力/高绩效</div>
                    <div className="text-xs text-green-700 dark:text-green-300 mb-3">中坚力量</div>
                    {talents.filter((item: any) => t => t.quadrant === 'solid').map(talent => (
                      <div
                        key={talent.id}
                        className="bg-white dark:bg-gray-800 rounded p-3 mb-2 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedTalent(talent)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{talent.name}</div>
                            <div className="text-xs text-gray-500">{talent.position}</div>
                          </div>
                          <Badge className={getQuadrantColor(talent.quadrant)}>
                            {talent.performanceScore}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 中潜力行 */}
                  <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4 border-2 border-orange-200 dark:border-orange-800">
                    <div className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">中潜力/中绩效</div>
                    <div className="text-xs text-orange-700 dark:text-orange-300 mb-3">待提升</div>
                    {talents.filter((item: any) => t => t.quadrant === 'improve').map(talent => (
                      <div
                        key={talent.id}
                        className="bg-white dark:bg-gray-800 rounded p-3 mb-2 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedTalent(talent)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{talent.name}</div>
                            <div className="text-xs text-gray-500">{talent.position}</div>
                          </div>
                          <Badge className={getQuadrantColor(talent.quadrant)}>
                            {talent.performanceScore}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 低潜力行 */}
                  <div className="col-span-2 bg-gray-50 dark:bg-gray-950/20 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-800">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">低潜力</div>
                    <div className="text-xs text-gray-700 dark:text-gray-300 mb-3">观察期</div>
                    {talents.filter((item: any) => t => t.quadrant === 'question-mark').length === 0 ? (
                      <div className="text-center py-8 text-gray-400">暂无人员</div>
                    ) : (
                      talents.filter((item: any) => t => t.quadrant === 'question-mark').map(talent => (
                        <div
                          key={talent.id}
                          className="bg-white dark:bg-gray-800 rounded p-3 mb-2 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedTalent(talent)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{talent.name}</div>
                              <div className="text-xs text-gray-500">{talent.position}</div>
                            </div>
                            <Badge className={getQuadrantColor(talent.quadrant)}>
                              {talent.performanceScore}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>姓名</TableHead>
                      <TableHead>部门</TableHead>
                      <TableHead>职位</TableHead>
                      <TableHead>绩效</TableHead>
                      <TableHead>潜力</TableHead>
                      <TableHead>所属象限</TableHead>
                      <TableHead>风险</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {talents.map(talent => (
                      <TableRow key={talent.id}>
                        <TableCell className="font-medium">{talent.name}</TableCell>
                        <TableCell>{talent.department}</TableCell>
                        <TableCell>{talent.position}</TableCell>
                        <TableCell>{talent.performanceScore}</TableCell>
                        <TableCell>{talent.potentialScore}</TableCell>
                        <TableCell>
                          <Badge className={getQuadrantColor(talent.quadrant)}>
                            {getQuadrantLabel(talent.quadrant)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={talent.riskLevel === 'high' ? 'destructive' : 'default'}>
                            {talent.riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedTalent(talent)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 高潜人才 */}
        <TabsContent value="high-potential" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>高潜人才管理</CardTitle>
              <CardDescription>
                识别和发展公司未来核心人才
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {talents.filter((item: any) => t => t.quadrant === 'high-potential' || t.quadrant === 'star').map(talent => (
                  <div
                    key={talent.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedTalent(talent)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{talent.name}</h3>
                          <Badge className={getQuadrantColor(talent.quadrant)}>
                            {getQuadrantLabel(talent.quadrant)}
                          </Badge>
                          <Badge variant="outline">{talent.position}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <div className="text-xs text-gray-500">绩效得分</div>
                            <div className="font-semibold text-blue-600">{talent.performanceScore}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">潜力得分</div>
                            <div className="font-semibold text-purple-600">{talent.potentialScore}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">继任就绪</div>
                            <div className="font-semibold text-green-600">
                              {talent.successionReady ? '是' : '否'}
                            </div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1">核心能力</div>
                          <div className="flex flex-wrap gap-1">
                            {talent.keyCompetencies.map(competency => (
                              <Badge key={competency} variant="secondary" className="text-xs">
                                {competency}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1">发展需求</div>
                          <div className="flex flex-wrap gap-1">
                            {talent.developmentNeeds.map(need => (
                              <Badge key={need} variant="outline" className="text-xs">
                                {need}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">职业路径</div>
                          <div className="flex items-center gap-2 text-sm">
                            {talent.careerPath.map((path, index) => (
                              <div key={path} className="flex items-center">
                                <span>{path}</span>
                                {index < talent.careerPath.length - 1 && (
                                  <ChevronRight className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 继任计划 */}
        <TabsContent value="succession" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>继任计划</CardTitle>
                  <CardDescription>
                    关键岗位继任者储备与管理
                  </CardDescription>
                </div>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  添加计划
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {successionPlans.map(plan => (
                  <Card key={plan.id} className="border-l-4">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{plan.positionName}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <span>{plan.department}</span>
                            <span>•</span>
                            <span>现任：{plan.incumbent.name}</span>
                            <span>•</span>
                            <span>退休日期：{plan.incumbent.retirementDate}</span>
                          </CardDescription>
                        </div>
                        {getRiskBadge(plan.riskLevel)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <div className="text-sm font-medium mb-3">继任候选人</div>
                        {plan.successors.length === 0 ? (
                          <div className="text-center py-4 text-gray-500 border-2 border-dashed rounded-lg">
                            暂无继任候选人，请尽快制定
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            {plan.successors.map(successor => (
                              <div
                                key={successor.id}
                                className="border rounded-lg p-3 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="font-medium">{successor.name}</div>
                                  {getReadinessBadge(successor.readiness)}
                                </div>
                                <div className="text-sm text-gray-600">
                                  综合评分：{successor.score}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 人才详情对话框 */}
      <Dialog open={!!selectedTalent} onOpenChange={() => setSelectedTalent(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedTalent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="text-2xl">{selectedTalent.name}</div>
                  <Badge className={getQuadrantColor(selectedTalent.quadrant)}>
                    {getQuadrantLabel(selectedTalent.quadrant)}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  {selectedTalent.department} · {selectedTalent.position}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* 基本信息 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>职级</Label>
                    <div className="font-medium">{selectedTalent.level}</div>
                  </div>
                  <div>
                    <Label>直属上级</Label>
                    <div className="font-medium">{selectedTalent.managerName}</div>
                  </div>
                  <div>
                    <Label>绩效得分</Label>
                    <div className="font-medium text-blue-600">{selectedTalent.performanceScore}</div>
                  </div>
                  <div>
                    <Label>潜力得分</Label>
                    <div className="font-medium text-purple-600">{selectedTalent.potentialScore}</div>
                  </div>
                  <div>
                    <Label>离职风险</Label>
                    <div className="font-medium">{selectedTalent.riskLevel}</div>
                  </div>
                  <div>
                    <Label>最后评估</Label>
                    <div className="font-medium">{selectedTalent.lastAssessment}</div>
                  </div>
                </div>

                {/* 核心能力 */}
                <div>
                  <Label>核心能力</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTalent.keyCompetencies.map(competency => (
                      <Badge key={competency} variant="secondary">
                        {competency}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 发展需求 */}
                <div>
                  <Label>发展需求</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTalent.developmentNeeds.map(need => (
                      <Badge key={need} variant="outline">
                        {need}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 职业路径 */}
                <div>
                  <Label>职业路径</Label>
                  <div className="flex items-center gap-2 mt-2">
                    {selectedTalent.careerPath.map((path, index) => (
                      <div key={path} className="flex items-center">
                        <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm font-medium">
                          {path}
                        </div>
                        {index < selectedTalent.careerPath.length - 1 && (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 继任就绪 */}
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium text-green-900 dark:text-green-100">
                      {selectedTalent.successionReady ? '继任就绪' : '继任未就绪'}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      {selectedTalent.successionReady
                        ? '该员工已具备继任关键岗位的能力'
                        : '该员工需要进一步培养才能继任关键岗位'}
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" className="flex-1">
                    <BrainCircuit className="h-4 w-4 mr-2" />
                    发起能力评估
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    制定发展计划
                  </Button>
                  <Button className="flex-1">
                    <Target className="h-4 w-4 mr-2" />
                    添加到继任计划
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 人才地图 */}
      <TabsContent value="talent-map" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>人才地图</CardTitle>
                <CardDescription>
                  基于部门和层级的可视化人才分布
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  导出地图
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 部门维度 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">按部门分布</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['技术部', '产品部', '销售部', '人力资源'].map(dept => {
                    const deptTalents = talents.filter((item: any) => t => t.department === dept);
                    const starCount = deptTalents.filter((item: any) => t => t.quadrant === 'star').length;
                    const highPotentialCount = deptTalents.filter((item: any) => t => t.quadrant === 'high-potential').length;

                    return (
                      <div key={dept} className="border rounded-lg p-4">
                        <div className="font-medium mb-2">{dept}</div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">总人数</span>
                            <span className="font-medium">{deptTalents.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">明星人才</span>
                            <Badge variant="default">{starCount}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">高潜人才</span>
                            <Badge variant="secondary">{highPotentialCount}</Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 层级维度 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">按层级分布</h3>
                <div className="space-y-3">
                  {['P4-P5 (初级)', 'P6-P7 (中级)', 'P8-P9 (高级)', 'P10+ (专家/管理)'].map(level => {
                    const levelTalents = talents.filter((item: any) => t => {
                      if (level.includes('P4-P5')) return ['P4', 'P5'].includes(t.level);
                      if (level.includes('P6-P7')) return ['P6', 'P7'].includes(t.level);
                      if (level.includes('P8-P9')) return ['P8', 'P9'].includes(t.level);
                      return t.level.startsWith('P10') || t.level.startsWith('M');
                    });

                    return (
                      <div key={level} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full" />
                          <span className="font-medium">{level}</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-sm">
                            <span className="text-gray-500">总人数:</span>{' '}
                            <span className="font-medium">{levelTalents.length}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">明星:</span>{' '}
                            <Badge variant="default" className="ml-1">
                              {levelTalents.filter((item: any) => t => t.quadrant === 'star').length}
                            </Badge>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">高潜:</span>{' '}
                            <Badge variant="secondary" className="ml-1">
                              {levelTalents.filter((item: any) => t => t.quadrant === 'high-potential').length}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* 个人发展计划(IDP) */}
      <TabsContent value="idp" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>个人发展计划(IDP)</CardTitle>
                <CardDescription>
                  为员工制定个性化的发展计划和职业路径
                </CardDescription>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新建IDP
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: '1',
                  employeeName: '张三',
                  department: '技术部',
                  position: '高级工程师',
                  level: 'P7',
                  period: '2024-Q1',
                  status: 'active',
                  progress: 65,
                  goals: 3,
                  completedGoals: 2,
                  nextMilestone: '技术架构认证',
                  milestoneDate: '2024-03-15',
                },
                {
                  id: '2',
                  employeeName: '李四',
                  department: '产品部',
                  position: '产品经理',
                  level: 'P6',
                  period: '2024-Q1',
                  status: 'active',
                  progress: 45,
                  goals: 4,
                  completedGoals: 1,
                  nextMilestone: '完成产品设计课程',
                  milestoneDate: '2024-02-28',
                },
                {
                  id: '3',
                  employeeName: '林小花',
                  department: '技术部',
                  position: '初级工程师',
                  level: 'P4',
                  period: '2024-Q1',
                  status: 'draft',
                  progress: 0,
                  goals: 5,
                  completedGoals: 0,
                  nextMilestone: '制定发展计划',
                  milestoneDate: '2024-02-01',
                },
              ].map(idp => (
                <div key={idp.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
                        {idp.employeeName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold">{idp.employeeName}</div>
                        <div className="text-sm text-gray-500">
                          {idp.department} · {idp.position} · {idp.level}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={idp.status === 'active' ? 'default' : 'secondary'}
                      >
                        {idp.status === 'active' ? '进行中' : '草稿'}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">周期</div>
                      <div className="font-medium">{idp.period}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">目标进度</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${idp.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{idp.completedGoals}/{idp.goals}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">下一个里程碑</div>
                      <div className="font-medium">{idp.nextMilestone}</div>
                      <div className="text-sm text-gray-500">{idp.milestoneDate}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      查看详情
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      编辑计划
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Target className="h-4 w-4 mr-2" />
                      跟踪进度
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </div>
  );
}
