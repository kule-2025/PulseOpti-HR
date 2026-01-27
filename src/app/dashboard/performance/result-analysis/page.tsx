'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart3,
  TrendingUp,
  Users,
  Award,
  Download,
  Search,
  Filter,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Target,
  Star,
  PieChart,
  LineChart,
  Calendar,
  Sparkles,
  Eye,
  MoreVertical,
} from 'lucide-react';

interface PerformanceData {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  department: string;
  position: string;
  period: string;
  cycle: string;
  score: number;
  grade: string;
  rank: number;
  change: number;
  dimensions: {
    performance: number;
    capability: number;
    attitude: number;
    innovation: number;
  };
  trend: number[];
}

interface DepartmentStats {
  department: string;
  avgScore: number;
  employeeCount: number;
  gradeDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
  trend: number;
}

export default function ResultAnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PerformanceData[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('2025');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600));

      setData([
        {
          id: '1',
          employeeId: 'EMP001',
          employeeName: '张三',
          department: '技术部',
          position: '高级前端工程师',
          period: '2025',
          cycle: 'Q1',
          score: 95,
          grade: 'A',
          rank: 1,
          change: 3,
          dimensions: { performance: 98, capability: 94, attitude: 93, innovation: 92 },
          trend: [88, 90, 92, 93, 94, 95],
        },
        {
          id: '2',
          employeeId: 'EMP002',
          employeeName: '李四',
          department: '产品部',
          position: '高级产品经理',
          period: '2025',
          cycle: 'Q1',
          score: 92,
          grade: 'A',
          rank: 2,
          change: 1,
          dimensions: { performance: 93, capability: 92, attitude: 91, innovation: 90 },
          trend: [85, 87, 89, 90, 91, 92],
        },
        {
          id: '3',
          employeeId: 'EMP003',
          employeeName: '王五',
          department: '技术部',
          position: '后端工程师',
          period: '2025',
          cycle: 'Q1',
          score: 90,
          grade: 'A-',
          rank: 3,
          change: 0,
          dimensions: { performance: 91, capability: 90, attitude: 89, innovation: 88 },
          trend: [86, 87, 88, 89, 90, 90],
        },
        {
          id: '4',
          employeeId: 'EMP004',
          employeeName: '赵六',
          department: '市场部',
          position: '市场专员',
          period: '2025',
          cycle: 'Q1',
          score: 88,
          grade: 'B+',
          rank: 4,
          change: -2,
          dimensions: { performance: 89, capability: 88, attitude: 87, innovation: 86 },
          trend: [90, 89, 88, 87, 88, 88],
        },
        {
          id: '5',
          employeeId: 'EMP005',
          employeeName: '孙七',
          department: '销售部',
          position: '销售经理',
          period: '2025',
          cycle: 'Q1',
          score: 87,
          grade: 'B+',
          rank: 5,
          change: 1,
          dimensions: { performance: 88, capability: 87, attitude: 86, innovation: 85 },
          trend: [84, 85, 86, 86, 87, 87],
        },
      ]);

      setDepartmentStats([
        {
          department: '技术部',
          avgScore: 92.5,
          employeeCount: 25,
          gradeDistribution: { A: 8, B: 12, C: 4, D: 1 },
          trend: 5.2,
        },
        {
          department: '产品部',
          avgScore: 90.0,
          employeeCount: 15,
          gradeDistribution: { A: 4, B: 8, C: 2, D: 1 },
          trend: 3.8,
        },
        {
          department: '市场部',
          avgScore: 88.0,
          employeeCount: 20,
          gradeDistribution: { A: 3, B: 10, C: 6, D: 1 },
          trend: 2.5,
        },
        {
          department: '销售部',
          avgScore: 87.5,
          employeeCount: 18,
          gradeDistribution: { A: 2, B: 10, C: 5, D: 1 },
          trend: 4.1,
        },
      ]);

      setLoading(false);
    };

    fetchData();
  }, [periodFilter]);

  const departments = useMemo(() => {
    return Array.from(new Set(data.map((d) => d.department)));
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = departmentFilter === 'all' || item.department === departmentFilter;
      const matchesGrade = gradeFilter === 'all' || item.grade.startsWith(gradeFilter);
      return matchesSearch && matchesDepartment && matchesGrade;
    });
  }, [data, searchTerm, departmentFilter, gradeFilter]);

  const overallStats = useMemo(() => {
    const avgScore = data.length > 0 ? data.reduce((sum, d) => sum + d.score, 0) / data.length : 0;
    const excellentCount = data.filter((d) => d.grade.startsWith('A')).length;
    const improvementCount = data.filter((d) => d.grade.startsWith('C') || d.grade.startsWith('D')).length;
    const avgTrend = data.length > 0 ? data.reduce((sum, d) => sum + d.change, 0) / data.length : 0;

    return {
      avgScore,
      excellentCount,
      improvementCount,
      avgTrend,
    };
  }, [data]);

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600';
    if (grade.startsWith('B')) return 'text-blue-600';
    if (grade.startsWith('C')) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeBadge = (grade: string) => {
    const colors: Record<string, string> = {
      A: 'bg-green-100 text-green-800',
      B: 'bg-blue-100 text-blue-800',
      C: 'bg-yellow-100 text-yellow-800',
      D: 'bg-red-100 text-red-800',
    };
    const color = colors[grade.charAt(0)] || 'bg-gray-100 text-gray-800';
    return <Badge className={color}>{grade}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => <Skeleton key={i} className="h-96" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">结果分析</h1>
          <p className="text-muted-foreground mt-1">分析绩效数据和趋势，提供洞察和建议</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button variant="outline">
            <Sparkles className="h-4 w-4 mr-2" />
            AI分析
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            导出报告
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均绩效</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.avgScore.toFixed(1)}</div>
            <div className="flex items-center text-sm mt-2">
              {overallStats.avgTrend >= 0 ? (
                <span className="text-green-600 flex items-center">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  +{overallStats.avgTrend.toFixed(1)}
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <ArrowDown className="h-4 w-4 mr-1" />
                  {overallStats.avgTrend.toFixed(1)}
                </span>
              )}
              <span className="text-muted-foreground ml-1">较上期</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">优秀员工</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overallStats.excellentCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              占比 {((overallStats.excellentCount / data.length) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待改进</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{overallStats.improvementCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              占比 {((overallStats.improvementCount / data.length) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">评估人数</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              覆盖率 100%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              部门绩效对比
            </CardTitle>
            <CardDescription>各部门平均得分分布情况</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentStats.map((stats, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stats.department}</span>
                      <Badge variant="outline">{stats.employeeCount}人</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      {stats.trend >= 0 ? (
                        <span className="text-green-600 text-sm flex items-center">
                          <ArrowUp className="h-3 w-3 mr-1" />
                          +{stats.trend}%
                        </span>
                      ) : (
                        <span className="text-red-600 text-sm flex items-center">
                          <ArrowDown className="h-3 w-3 mr-1" />
                          {stats.trend}%
                        </span>
                      )}
                      <span className="font-bold text-lg">{stats.avgScore}</span>
                    </div>
                  </div>
                  <Progress value={stats.avgScore} className="h-2" />
                  <div className="flex gap-2 text-xs">
                    <span className="text-green-600">A: {stats.gradeDistribution.A}</span>
                    <span className="text-blue-600">B: {stats.gradeDistribution.B}</span>
                    <span className="text-yellow-600">C: {stats.gradeDistribution.C}</span>
                    <span className="text-red-600">D: {stats.gradeDistribution.D}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              等级分布统计
            </CardTitle>
            <CardDescription>整体绩效等级分布情况</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {data.filter((d) => d.grade.startsWith('A')).length}
                </div>
                <div className="text-sm text-muted-foreground">A等级（优秀）</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {((data.filter((d) => d.grade.startsWith('A')).length / data.length) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {data.filter((d) => d.grade.startsWith('B')).length}
                </div>
                <div className="text-sm text-muted-foreground">B等级（良好）</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {((data.filter((d) => d.grade.startsWith('B')).length / data.length) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-4xl font-bold text-yellow-600 mb-2">
                  {data.filter((d) => d.grade.startsWith('C')).length}
                </div>
                <div className="text-sm text-muted-foreground">C等级（合格）</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {((data.filter((d) => d.grade.startsWith('C')).length / data.length) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-4xl font-bold text-red-600 mb-2">
                  {data.filter((d) => d.grade.startsWith('D')).length}
                </div>
                <div className="text-sm text-muted-foreground">D等级（需改进）</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {((data.filter((d) => d.grade.startsWith('D')).length / data.length) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>绩效排行榜 ({filteredData.length})</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索员工、职位..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={departmentFilter} onValueChange={(v) => setDepartmentFilter(v as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="部门" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部部门</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={gradeFilter} onValueChange={(v) => setGradeFilter(v as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="等级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部等级</SelectItem>
                  <SelectItem value="A">A等级</SelectItem>
                  <SelectItem value="B">B等级</SelectItem>
                  <SelectItem value="C">C等级</SelectItem>
                  <SelectItem value="D">D等级</SelectItem>
                </SelectContent>
              </Select>
              <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="周期" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025年</SelectItem>
                  <SelectItem value="2024">2024年</SelectItem>
                  <SelectItem value="2023">2023年</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              没有找到匹配的数据
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">排名</TableHead>
                    <TableHead>员工</TableHead>
                    <TableHead>部门</TableHead>
                    <TableHead>职位</TableHead>
                    <TableHead className="text-right">工作业绩</TableHead>
                    <TableHead className="text-right">能力素质</TableHead>
                    <TableHead className="text-right">态度行为</TableHead>
                    <TableHead className="text-right">创新改进</TableHead>
                    <TableHead className="text-right">综合得分</TableHead>
                    <TableHead>等级</TableHead>
                    <TableHead className="text-center">变化</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          {item.rank <= 3 ? (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                              item.rank === 1 ? 'bg-amber-500' : item.rank === 2 ? 'bg-gray-400' : 'bg-amber-700'
                            }`}>
                              {item.rank}
                            </div>
                          ) : (
                            <span className="text-muted-foreground font-medium">{item.rank}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {item.employeeName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{item.employeeName}</p>
                            <p className="text-xs text-muted-foreground">{item.employeeId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.department}</TableCell>
                      <TableCell>{item.position}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium">{item.dimensions.performance}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium">{item.dimensions.capability}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium">{item.dimensions.attitude}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium">{item.dimensions.innovation}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold text-lg ${getGradeColor(item.grade)}`}>
                          {item.score}
                        </span>
                      </TableCell>
                      <TableCell>{getGradeBadge(item.grade)}</TableCell>
                      <TableCell className="text-center">
                        {item.change > 0 ? (
                          <span className="text-green-600 flex items-center justify-center">
                            <ArrowUp className="h-4 w-4 mr-1" />
                            {item.change}
                          </span>
                        ) : item.change < 0 ? (
                          <span className="text-red-600 flex items-center justify-center">
                            <ArrowDown className="h-4 w-4 mr-1" />
                            {Math.abs(item.change)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            改进建议
          </CardTitle>
          <CardDescription>基于绩效分析的改进建议和行动计划</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">部门提升建议</h4>
                  <p className="text-sm text-blue-800">
                    技术部平均得分最高（92.5分），建议在其他部门推广技术部的优秀实践，如代码评审机制、技术分享会等。
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-1">优秀员工激励</h4>
                  <p className="text-sm text-yellow-800">
                    建议对A等级员工给予晋升机会和加薪，并设立"优秀员工"奖项，增强团队竞争意识。
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Award className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-orange-900 mb-1">待改进员工帮扶</h4>
                  <p className="text-sm text-orange-800">
                    对C、D等级员工制定个人改进计划，安排导师指导，定期跟踪改进效果。
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-900 mb-1">趋势分析</h4>
                  <p className="text-sm text-green-800">
                    整体绩效呈上升趋势（+{overallStats.avgTrend.toFixed(1)}），建议继续保持并优化绩效管理体系。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
