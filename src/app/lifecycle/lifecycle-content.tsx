'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  User,
  Calendar,
  Award,
  TrendingUp,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  Target,
  Search,
  Plus,
  Download,
  Eye,
  Edit,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Building2,
  Star,
  AlertCircle,
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  phone: string;
  location: string;
  department: string;
  position: string;
  level: string;
  managerName: string;
  hireDate: string;
  status: 'active' | 'probation' | 'on-leave' | 'resigned';
  probationEndDate?: string;
  employmentType: string;
}

interface LifecycleEvent {
  id: string;
  type: 'hire' | 'probation' | 'regularization' | 'promotion' | 'transfer' | 'training' | 'performance' | 'award' | 'leave' | 'resignation';
  date: string;
  title: string;
  description: string;
  details: Record<string, any>;
  attachments?: Array<{
    name: string;
    url: string;
  }>;
}

interface PerformanceRecord {
  id: string;
  cycleName: string;
  cycleDate: string;
  score: number;
  rating: 'excellent' | 'good' | 'satisfactory' | 'needs-improvement';
  achievements: string[];
  improvements: string[];
}

interface TrainingRecord {
  id: string;
  courseName: string;
  courseDate: string;
  duration: string;
  status: 'completed' | 'in-progress' | 'planned';
  score?: number;
  certificate?: string;
}

export default function LifecycleContent() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      // 模拟数据
      const mockEmployees: Employee[] = [
        {
          id: '1',
          name: '张三',
          avatar: 'ZS',
          email: 'zhangsan@example.com',
          phone: '13800138001',
          location: '北京',
          department: '技术部',
          position: '高级工程师',
          level: 'P7',
          managerName: '李明',
          hireDate: '2022-03-15',
          status: 'active',
          employmentType: 'fulltime',
        },
        {
          id: '2',
          name: '李四',
          avatar: 'LS',
          email: 'lisi@example.com',
          phone: '13800138002',
          location: '北京',
          department: '产品部',
          position: '产品经理',
          level: 'P6',
          managerName: '王芳',
          hireDate: '2024-11-01',
          status: 'probation',
          probationEndDate: '2025-02-01',
          employmentType: 'fulltime',
        },
        {
          id: '3',
          name: '王五',
          avatar: 'WW',
          email: 'wangwu@example.com',
          phone: '13800138003',
          location: '上海',
          department: '销售部',
          position: '销售经理',
          level: 'M2',
          managerName: '赵总',
          hireDate: '2021-06-20',
          status: 'active',
          employmentType: 'fulltime',
        },
        {
          id: '4',
          name: '赵六',
          avatar: 'ZL',
          email: 'zhaoliu@example.com',
          phone: '13800138004',
          location: '北京',
          department: '人力资源',
          position: 'HRBP',
          level: 'P6',
          managerName: '孙七',
          hireDate: '2023-01-10',
          status: 'active',
          employmentType: 'fulltime',
        },
        {
          id: '5',
          name: '陈小华',
          avatar: 'CH',
          email: 'chenxiaohua@example.com',
          phone: '13800138005',
          location: '深圳',
          department: '技术部',
          position: '前端工程师',
          level: 'P5',
          managerName: '张三',
          hireDate: '2024-12-01',
          status: 'probation',
          probationEndDate: '2025-03-01',
          employmentType: 'fulltime',
        },
      ];
      setEmployees(mockEmployees);
    } catch (error) {
      console.error('获取员工数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const lifecycleEvents: LifecycleEvent[] = [
    {
      id: '1',
      type: 'hire',
      date: '2022-03-15',
      title: '入职办理',
      description: '完成入职手续，签订劳动合同',
      details: {
        position: '高级工程师',
        department: '技术部',
        salary: 25000,
      },
    },
    {
      id: '2',
      type: 'probation',
      date: '2022-06-15',
      title: '试用期评估',
      description: '完成试用期考核评估',
      details: {
        score: 92,
        rating: '优秀',
        feedback: '技术能力强，团队协作良好',
      },
    },
    {
      id: '3',
      type: 'regularization',
      date: '2022-06-16',
      title: '转正',
      description: '正式转正，成为正式员工',
      details: {
        probationPeriod: '3个月',
        salaryAdjustment: '+10%',
      },
    },
    {
      id: '4',
      type: 'performance',
      date: '2022-12-20',
      title: '年度绩效评估',
      description: '2022年度绩效评估结果',
      details: {
        cycle: '2022年度',
        score: 88,
        rating: '良好',
        rank: '前20%',
      },
    },
    {
      id: '5',
      type: 'training',
      date: '2023-03-10',
      title: '技术培训',
      description: '参加架构设计高级培训',
      details: {
        course: '高级系统架构设计',
        duration: '40小时',
        score: 95,
      },
    },
    {
      id: '6',
      type: 'award',
      date: '2023-06-15',
      title: '优秀员工',
      description: '获得年度优秀员工称号',
      details: {
        awardName: '年度优秀员工',
        reason: '业绩突出，贡献卓越',
        bonus: 5000,
      },
    },
    {
      id: '7',
      type: 'performance',
      date: '2023-12-25',
      title: '年度绩效评估',
      description: '2023年度绩效评估结果',
      details: {
        cycle: '2023年度',
        score: 92,
        rating: '优秀',
        rank: '前10%',
      },
    },
    {
      id: '8',
      type: 'promotion',
      date: '2024-01-01',
      title: '晋升',
      description: '晋升为高级工程师（P7）',
      details: {
        fromLevel: 'P6',
        toLevel: 'P7',
        salaryAdjustment: '+15%',
        effectiveDate: '2024-01-01',
      },
    },
  ];

  const performanceRecords: PerformanceRecord[] = [
    {
      id: '1',
      cycleName: '2024年Q1',
      cycleDate: '2024-03-31',
      score: 92,
      rating: 'excellent',
      achievements: ['完成核心系统优化', '带领团队完成重点项目'],
      improvements: ['加强团队管理', '提升跨部门沟通'],
    },
    {
      id: '2',
      cycleName: '2023年度',
      cycleDate: '2023-12-31',
      score: 92,
      rating: 'excellent',
      achievements: ['技术突破', '团队贡献突出'],
      improvements: ['战略思维', '商业意识'],
    },
    {
      id: '3',
      cycleName: '2023年Q3',
      cycleDate: '2023-09-30',
      score: 88,
      rating: 'good',
      achievements: ['项目交付及时', '质量保证'],
      improvements: ['创新能力', '客户导向'],
    },
  ];

  const trainingRecords: TrainingRecord[] = [
    {
      id: '1',
      courseName: '高级系统架构设计',
      courseDate: '2023-03-10',
      duration: '40小时',
      status: 'completed',
      score: 95,
      certificate: 'certificate-001.pdf',
    },
    {
      id: '2',
      courseName: '领导力提升培训',
      courseDate: '2023-08-15',
      duration: '24小时',
      status: 'completed',
      score: 90,
    },
    {
      id: '3',
      courseName: '项目管理PMP认证',
      courseDate: '2024-01-20',
      duration: '35小时',
      status: 'in-progress',
    },
  ];

  const getEventIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      hire: <User className="h-4 w-4" />,
      probation: <Clock className="h-4 w-4" />,
      regularization: <CheckCircle2 className="h-4 w-4" />,
      promotion: <TrendingUp className="h-4 w-4" />,
      transfer: <Building2 className="h-4 w-4" />,
      training: <BookOpen className="h-4 w-4" />,
      performance: <Target className="h-4 w-4" />,
      award: <Award className="h-4 w-4" />,
      leave: <AlertCircle className="h-4 w-4" />,
      resignation: <AlertCircle className="h-4 w-4" />,
    };
    return icons[type] || <FileText className="h-4 w-4" />;
  };

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      hire: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      probation: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      regularization: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      promotion: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      transfer: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
      training: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
      performance: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      award: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
      leave: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
      resignation: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    };
    return colors[type] || 'bg-gray-100';
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      'active': { label: '在职', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
      'probation': { label: '试用期', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
      'on-leave': { label: '请假中', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
      'resigned': { label: '已离职', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300' },
    };
    const badge = badges[status] || { label: status, color: 'bg-gray-100' };
    return <Badge className={badge.color}>{badge.label}</Badge>;
  };

  const getRatingBadge = (rating: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      'excellent': { label: '优秀', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
      'good': { label: '良好', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
      'satisfactory': { label: '合格', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
      'needs-improvement': { label: '待改进', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
    };
    const badge = badges[rating] || { label: rating, color: 'bg-gray-100' };
    return <Badge className={badge.color}>{badge.label}</Badge>;
  };

  const getTrainingStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      'completed': { label: '已完成', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
      'in-progress': { label: '进行中', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
      'planned': { label: '计划中', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300' },
    };
    const badge = badges[status] || { label: status, color: 'bg-gray-100' };
    return <Badge className={badge.color}>{badge.label}</Badge>;
  };

  const getEmployeeAvatar = (employee: Employee) => {
    return (
      <Avatar className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl font-bold">
        <AvatarFallback>{employee.avatar}</AvatarFallback>
      </Avatar>
    );
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
            员工全生命周期
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            全景展示员工从入职到离职的完整历程
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出报告
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            添加记录
          </Button>
        </div>
      </div>

      {/* 员工列表 */}
      <Card>
        <CardHeader>
          <CardTitle>员工列表</CardTitle>
          <CardDescription>
            选择员工查看详细生命周期记录
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {employees.map(employee => (
              <div
                key={employee.id}
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${selectedEmployee?.id === employee.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedEmployee(employee)}
              >
                <div className="flex items-start gap-3">
                  {getEmployeeAvatar(employee)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold">{employee.name}</div>
                      {getStatusBadge(employee.status)}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">{employee.position}</div>
                    <div className="text-xs text-gray-500">{employee.department}</div>
                    {employee.status === 'probation' && employee.probationEndDate && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                        <Clock className="h-3 w-3" />
                        试用期至 {employee.probationEndDate}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 员工详情 */}
      {selectedEmployee && (
        <>
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {getEmployeeAvatar(selectedEmployee)}
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-2xl">{selectedEmployee.name}</CardTitle>
                      {getStatusBadge(selectedEmployee.status)}
                    </div>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span>{selectedEmployee.position}</span>
                      <span>•</span>
                      <span>{selectedEmployee.department}</span>
                      <span>•</span>
                      <span>{selectedEmployee.level}</span>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    查看档案
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    编辑信息
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-gray-500">工号</div>
                  <div className="font-medium">EMP-001</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">直属上级</div>
                  <div className="font-medium">{selectedEmployee.managerName}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">入职时间</div>
                  <div className="font-medium">{selectedEmployee.hireDate}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">工作地点</div>
                  <div className="font-medium">{selectedEmployee.location}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">邮箱</div>
                  <div className="font-medium text-sm">{selectedEmployee.email}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">电话</div>
                  <div className="font-medium text-sm">{selectedEmployee.phone}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">在职时长</div>
                  <div className="font-medium">2年11个月</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">合同类型</div>
                  <div className="font-medium">{selectedEmployee.employmentType === 'fulltime' ? '全职' : '兼职'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 生命周期时间线 */}
          <Card>
            <CardHeader>
              <CardTitle>生命周期时间线</CardTitle>
              <CardDescription>
                员工从入职到现在的完整历程记录
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* 时间轴线 */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

                {/* 时间线事件 */}
                <div className="space-y-6">
                  {lifecycleEvents.map((event, index) => (
                    <div key={event.id} className="relative flex gap-4 pl-8">
                      {/* 事件图标 */}
                      <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${getEventColor(event.type)}`}>
                        {getEventIcon(event.type)}
                      </div>

                      {/* 事件内容 */}
                      <div className="flex-1 border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getEventColor(event.type)}>
                              {event.type === 'hire' && '入职'}
                              {event.type === 'probation' && '试用期'}
                              {event.type === 'regularization' && '转正'}
                              {event.type === 'promotion' && '晋升'}
                              {event.type === 'transfer' && '调岗'}
                              {event.type === 'training' && '培训'}
                              {event.type === 'performance' && '绩效'}
                              {event.type === 'award' && '获奖'}
                              {event.type === 'leave' && '请假'}
                              {event.type === 'resignation' && '离职'}
                            </Badge>
                            <div className="text-xs text-gray-500">{event.date}</div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                        <h4 className="font-semibold mb-1">{event.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(event.details).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-gray-500">{key}: </span>
                              <span className="font-medium">{value as string}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 标签页内容 */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="performance">绩效记录</TabsTrigger>
              <TabsTrigger value="training">培训记录</TabsTrigger>
              <TabsTrigger value="summary">成长总结</TabsTrigger>
            </TabsList>

            {/* 绩效记录 */}
            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>绩效评估记录</CardTitle>
                  <CardDescription>
                    员工历史绩效评估结果与反馈
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceRecords.map(record => (
                      <div key={record.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-semibold">{record.cycleName}</div>
                            <div className="text-sm text-gray-500">{record.cycleDate}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-2xl font-bold text-blue-600">{record.score}</div>
                            {getRatingBadge(record.rating)}
                          </div>
                        </div>
                        <div className="mb-3">
                          <Progress value={record.score} className="h-2" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium mb-1 text-green-700">主要成就</div>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {record.achievements.map((achievement, idx) => (
                                <li key={idx} className="flex items-start gap-1">
                                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                                  <span>{achievement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-1 text-orange-700">待改进项</div>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {record.improvements.map((improvement, idx) => (
                                <li key={idx} className="flex items-start gap-1">
                                  <ArrowRight className="h-4 w-4 mt-0.5 text-orange-600 flex-shrink-0" />
                                  <span>{improvement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 培训记录 */}
            <TabsContent value="training" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>培训发展记录</CardTitle>
                  <CardDescription>
                    员工参与的培训课程与学习成长
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trainingRecords.map(record => (
                      <div key={record.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{record.courseName}</h4>
                              {getTrainingStatusBadge(record.status)}
                            </div>
                            <div className="text-sm text-gray-500 mb-1">
                              <span className="mr-4">
                                <Calendar className="h-3 w-3 inline mr-1" />
                                {record.courseDate}
                              </span>
                              <span>
                                <Clock className="h-3 w-3 inline mr-1" />
                                {record.duration}
                              </span>
                            </div>
                          </div>
                          {record.score && (
                            <div className="text-right">
                              <div className="text-2xl font-bold text-purple-600">{record.score}</div>
                              <div className="text-xs text-gray-500">评分</div>
                            </div>
                          )}
                        </div>
                        {record.certificate && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                            <FileText className="h-4 w-4" />
                            <span>培训证书：{record.certificate}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 成长总结 */}
            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>成长总结</CardTitle>
                  <CardDescription>
                    员工关键指标与发展趋势
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">平均绩效得分</div>
                      <div className="text-3xl font-bold text-blue-600">90.7</div>
                      <div className="text-xs text-gray-500 mt-1">连续3次优秀</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">晋升次数</div>
                      <div className="text-3xl font-bold text-green-600">2</div>
                      <div className="text-xs text-gray-500 mt-1">2年时间内</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">培训课程</div>
                      <div className="text-3xl font-bold text-purple-600">6</div>
                      <div className="text-xs text-gray-500 mt-1">累计99学时</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">成长亮点</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Star className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">技术能力持续提升，从P6晋升到P7</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Star className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">连续两年获得优秀绩效，排名前10%</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Star className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">积极参与培训，获得架构设计和领导力认证</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">发展建议</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">建议加强战略思维和商业意识培养</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">可以承担更多团队管理职责</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">考虑向技术总监方向发展</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
