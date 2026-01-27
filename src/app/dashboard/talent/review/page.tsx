'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  BarChart3,
  TrendingUp,
  Users,
  Star,
  Award,
  Target,
  Activity,
  Filter,
  Search,
  Download,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Grid,
  List,
  ArrowUp,
  ArrowDown,
  Brain,
  Briefcase,
  GraduationCap,
  Heart,
  Zap,
  Shield,
  Sparkles,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  avatar?: string;
  department: string;
  position: string;
  tenure: number;
  level: 'junior' | 'mid' | 'senior' | 'manager' | 'executive';
  status: 'active' | 'probation' | 'notice' | 'departed';
  metrics: {
    performance: number;
    potential: number;
    engagement: number;
    attendance: number;
    productivity: number;
  };
  skills: string[];
  certifications: string[];
  achievements: string[];
  risk: 'low' | 'medium' | 'high';
  promotionReady: boolean;
  keyTalent: boolean;
  successionRisk: boolean;
}

interface DimensionScore {
  name: string;
  score: number;
  change: number;
  icon: any;
}

interface DashboardStats {
  totalEmployees: number;
  keyTalent: number;
  highRisk: number;
  promotionReady: number;
  avgPerformance: number;
  avgPotential: number;
  topPerformers: number;
  criticalRoles: number;
}

export default function TalentReviewPage() {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'performance' | 'potential' | 'name'>('performance');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600));

      const employees: Employee[] = [
        {
          id: '1',
          name: '张明',
          department: '技术部',
          position: '高级工程师',
          tenure: 5,
          level: 'senior',
          status: 'active',
          metrics: { performance: 92, potential: 88, engagement: 85, attendance: 98, productivity: 90 },
          skills: ['React', 'TypeScript', 'Node.js', '云计算'],
          certifications: ['AWS Solution Architect', 'Google Cloud'],
          achievements: ['年度最佳员工', '技术突破奖', '专利获得'],
          risk: 'low',
          promotionReady: true,
          keyTalent: true,
          successionRisk: false,
        },
        {
          id: '2',
          name: '李芳',
          department: '销售部',
          position: '销售经理',
          tenure: 3,
          level: 'manager',
          status: 'active',
          metrics: { performance: 88, potential: 85, engagement: 78, attendance: 95, productivity: 87 },
          skills: ['客户关系', '团队管理', '市场分析', '商务谈判'],
          certifications: ['销售管理认证', '客户服务认证'],
          achievements: ['季度销售冠军', '最佳团队领导者'],
          risk: 'medium',
          promotionReady: true,
          keyTalent: true,
          successionRisk: false,
        },
        {
          id: '3',
          name: '王强',
          department: '财务部',
          position: '财务分析师',
          tenure: 2,
          level: 'mid',
          status: 'active',
          metrics: { performance: 82, potential: 80, engagement: 75, attendance: 92, productivity: 83 },
          skills: ['财务分析', 'Excel', 'SAP', '风险管理'],
          certifications: ['CPA', 'CMA'],
          achievements: ['优秀新人奖'],
          risk: 'low',
          promotionReady: false,
          keyTalent: false,
          successionRisk: false,
        },
        {
          id: '4',
          name: '赵静',
          department: '人力资源部',
          position: '人事专员',
          tenure: 1,
          level: 'junior',
          status: 'probation',
          metrics: { performance: 75, potential: 90, engagement: 85, attendance: 90, productivity: 78 },
          skills: ['招聘', '员工关系', '培训', '劳动法'],
          certifications: ['人力资源师', '员工关系认证'],
          achievements: ['快速融入奖'],
          risk: 'medium',
          promotionReady: false,
          keyTalent: false,
          successionRisk: false,
        },
        {
          id: '5',
          name: '陈伟',
          department: '技术部',
          position: '技术总监',
          tenure: 8,
          level: 'executive',
          status: 'active',
          metrics: { performance: 95, potential: 75, engagement: 70, attendance: 99, productivity: 92 },
          skills: ['架构设计', '团队管理', '战略规划', '技术领导'],
          certifications: ['PMP', 'TOGAF'],
          achievements: ['技术创新奖', '数字化转型奖'],
          risk: 'high',
          promotionReady: false,
          keyTalent: true,
          successionRisk: true,
        },
      ];

      setEmployees(employees);
      setStats({
        totalEmployees: employees.length,
        keyTalent: employees.filter(e => e.keyTalent).length,
        highRisk: employees.filter(e => e.risk === 'high').length,
        promotionReady: employees.filter(e => e.promotionReady).length,
        avgPerformance: employees.reduce((sum, e) => sum + e.metrics.performance, 0) / employees.length,
        avgPotential: employees.reduce((sum, e) => sum + e.metrics.potential, 0) / employees.length,
        topPerformers: employees.filter(e => e.metrics.performance >= 90).length,
        criticalRoles: employees.filter(e => e.successionRisk).length,
      });

      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees
      .filter((e) => {
        const matchesSearch =
          e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.position.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment = selectedDepartment === 'all' || e.department === selectedDepartment;
        const matchesLevel = selectedLevel === 'all' || e.level === selectedLevel;
        const matchesRisk = selectedRisk === 'all' || e.risk === selectedRisk;
        return matchesSearch && matchesDepartment && matchesLevel && matchesRisk;
      })
      .sort((a, b) => {
        if (sortBy === 'performance') return b.metrics.performance - a.metrics.performance;
        if (sortBy === 'potential') return b.metrics.potential - a.metrics.potential;
        return a.name.localeCompare(b.name);
      });
  }, [employees, searchTerm, selectedDepartment, selectedLevel, selectedRisk, sortBy]);

  const departments = Array.from(new Set(employees.map((e) => e.department)));
  const levels = Array.from(new Set(employees.map((e) => e.level)));
  const risks = ['low', 'medium', 'high'] as const;

  const getRiskBadge = (risk: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      low: '低风险',
      medium: '中风险',
      high: '高风险',
    };
    return <Badge className={colors[risk]}>{labels[risk]}</Badge>;
  };

  const getLevelBadge = (level: string) => {
    const labels: Record<string, string> = {
      junior: '初级',
      mid: '中级',
      senior: '高级',
      manager: '管理',
      executive: '高管',
    };
    return <Badge variant="outline">{labels[level]}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      probation: 'bg-blue-100 text-blue-800',
      notice: 'bg-yellow-100 text-yellow-800',
      departed: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<string, string> = {
      active: '在职',
      probation: '试用期',
      notice: '离职中',
      departed: '已离职',
    };
    return <Badge className={colors[status]}>{labels[status]}</Badge>;
  };

  const getNineBoxPosition = (performance: number, potential: number) => {
    if (performance >= 80 && potential >= 80) return { label: '明星员工', color: 'bg-green-500' };
    if (performance >= 80 && potential >= 60) return { label: '核心骨干', color: 'bg-blue-500' };
    if (performance >= 80 && potential < 60) return { label: '稳定贡献者', color: 'bg-gray-500' };
    if (performance >= 60 && potential >= 80) return { label: '高潜新人', color: 'bg-purple-500' };
    if (performance >= 60 && potential >= 60) return { label: '中坚力量', color: 'bg-blue-400' };
    if (performance >= 60 && potential < 60) return { label: '持续发展者', color: 'bg-gray-400' };
    if (performance < 60 && potential >= 80) return { label: '潜力新人', color: 'bg-orange-500' };
    if (performance < 60 && potential >= 60) return { label: '待提升者', color: 'bg-orange-400' };
    return { label: '需改进', color: 'bg-red-500' };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">人才盘点</h1>
          <p className="text-muted-foreground mt-1">全面评估和管理公司人才资产</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出报告
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新建盘点
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总人数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEmployees}</div>
            <p className="text-xs text-muted-foreground mt-1">关键人才 {stats?.keyTalent}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">高潜员工</CardTitle>
            <Sparkles className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats?.promotionReady}</div>
            <p className="text-xs text-muted-foreground mt-1">
              晋升就绪
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">高风险</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.highRisk}</div>
            <p className="text-xs text-muted-foreground mt-1">
              需要关注
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">绩优人员</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.topPerformers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              绩效评分≥90
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>人才评估矩阵 ({filteredEmployees.length})</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                  <Button
                    size="sm"
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="排序" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance">按绩效</SelectItem>
                    <SelectItem value="potential">按潜力</SelectItem>
                    <SelectItem value="name">按姓名</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索姓名或职位..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={selectedDepartment} onValueChange={(v) => setSelectedDepartment(v as any)}>
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
              <Select value={selectedLevel} onValueChange={(v) => setSelectedLevel(v as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="级别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部级别</SelectItem>
                  {levels.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedRisk} onValueChange={(v) => setSelectedRisk(v as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="风险" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部风险</SelectItem>
                  {risks.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filteredEmployees.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                没有找到匹配的员工
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEmployees.map((employee) => {
                  const position = getNineBoxPosition(employee.metrics.performance, employee.metrics.potential);
                  return (
                    <Card key={employee.id} className="hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className={position.color}>{employee.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-semibold">{employee.name}</h3>
                              {employee.keyTalent && <Sparkles className="h-4 w-4 text-purple-500" />}
                              {employee.promotionReady && <Zap className="h-4 w-4 text-yellow-500" />}
                              {employee.successionRisk && <AlertTriangle className="h-4 w-4 text-red-500" />}
                            </div>
                            <p className="text-sm text-muted-foreground">{employee.position}</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Badge variant="outline">{employee.department}</Badge>
                              {getLevelBadge(employee.level)}
                              {getStatusBadge(employee.status)}
                              {getRiskBadge(employee.risk)}
                              <Badge className={position.color}>{position.label}</Badge>
                            </div>
                          </div>
                        </div>
                        <Separator className="my-3" />
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-muted-foreground">绩效</span>
                              <span className="font-medium">{employee.metrics.performance}</span>
                            </div>
                            <Progress value={employee.metrics.performance} />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-muted-foreground">潜力</span>
                              <span className="font-medium">{employee.metrics.potential}</span>
                            </div>
                            <Progress value={employee.metrics.potential} />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                          <span>司龄 {employee.tenure}年</span>
                          <span>·</span>
                          <span>出勤率 {employee.metrics.attendance}%</span>
                          <span>·</span>
                          <span>敬业度 {employee.metrics.engagement}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEmployees.map((employee) => {
                  const position = getNineBoxPosition(employee.metrics.performance, employee.metrics.potential);
                  return (
                    <Card key={employee.id} className="hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className={position.color}>{employee.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="font-semibold">{employee.name}</h3>
                                {employee.keyTalent && <Sparkles className="h-4 w-4 text-purple-500" />}
                                {employee.promotionReady && <Zap className="h-4 w-4 text-yellow-500" />}
                                {employee.successionRisk && <AlertTriangle className="h-4 w-4 text-red-500" />}
                              </div>
                              <p className="text-sm text-muted-foreground">{employee.position} · {employee.department}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right mr-4">
                              <div className="text-sm font-medium">绩效 {employee.metrics.performance}</div>
                              <div className="text-sm font-medium">潜力 {employee.metrics.potential}</div>
                            </div>
                            {getLevelBadge(employee.level)}
                            {getStatusBadge(employee.status)}
                            {getRiskBadge(employee.risk)}
                            <Badge className={position.color}>{position.label}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>九宫格矩阵</CardTitle>
            <CardDescription>绩效 × 潜力人才分布</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 aspect-square">
              {[
                { perf: 'high', pot: 'high', label: '明星员工', color: 'bg-green-100 border-green-500', count: filteredEmployees.filter(e => e.metrics.performance >= 80 && e.metrics.potential >= 80).length },
                { perf: 'high', pot: 'mid', label: '核心骨干', color: 'bg-blue-100 border-blue-500', count: filteredEmployees.filter(e => e.metrics.performance >= 80 && e.metrics.potential >= 60 && e.metrics.potential < 80).length },
                { perf: 'high', pot: 'low', label: '稳定贡献', color: 'bg-gray-100 border-gray-500', count: filteredEmployees.filter(e => e.metrics.performance >= 80 && e.metrics.potential < 60).length },
                { perf: 'mid', pot: 'high', label: '高潜新人', color: 'bg-purple-100 border-purple-500', count: filteredEmployees.filter(e => e.metrics.performance >= 60 && e.metrics.potential >= 80).length },
                { perf: 'mid', pot: 'mid', label: '中坚力量', color: 'bg-blue-50 border-blue-400', count: filteredEmployees.filter(e => e.metrics.performance >= 60 && e.metrics.potential >= 60 && e.metrics.potential < 80).length },
                { perf: 'mid', pot: 'low', label: '持续发展', color: 'bg-gray-50 border-gray-400', count: filteredEmployees.filter(e => e.metrics.performance >= 60 && e.metrics.potential < 60).length },
                { perf: 'low', pot: 'high', label: '潜力新人', color: 'bg-orange-100 border-orange-500', count: filteredEmployees.filter(e => e.metrics.performance < 60 && e.metrics.potential >= 80).length },
                { perf: 'low', pot: 'mid', label: '待提升', color: 'bg-orange-50 border-orange-400', count: filteredEmployees.filter(e => e.metrics.performance < 60 && e.metrics.potential >= 60 && e.metrics.potential < 80).length },
                { perf: 'low', pot: 'low', label: '需改进', color: 'bg-red-100 border-red-500', count: filteredEmployees.filter(e => e.metrics.performance < 60 && e.metrics.potential < 60).length },
              ].map((cell) => (
                <div key={cell.label} className={`border-2 rounded-lg p-3 flex flex-col items-center justify-center ${cell.color}`}>
                  <div className="text-2xl font-bold">{cell.count}</div>
                  <div className="text-xs text-center mt-1">{cell.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
