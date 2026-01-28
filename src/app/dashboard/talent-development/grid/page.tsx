'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Grid,
  Users,
  TrendingUp,
  Award,
  Target,
  AlertCircle,
  CheckCircle,
  Filter,
  Download,
  Search,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  performance: number;
  potential: number;
  quadrant: string;
  status: 'star' | 'high' | 'core' | 'solid' | 'question' | 'low' | 'high-potential';
  avatar?: string;
  skills: string[];
  recommendations: string[];
}

const quadrants = [
  {
    id: 'top-right',
    name: '明星人才',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    borderColor: 'border-green-200 dark:border-green-900',
    description: '高绩效 + 高潜力',
    icon: Award,
    count: 8,
  },
  {
    id: 'top-center',
    name: '核心人才',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-900',
    description: '高绩效 + 中潜力',
    icon: Star,
    count: 15,
  },
  {
    id: 'top-left',
    name: '待观察',
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    borderColor: 'border-yellow-200 dark:border-yellow-900',
    description: '高绩效 + 低潜力',
    icon: AlertCircle,
    count: 6,
  },
  {
    id: 'middle-right',
    name: '高潜人才',
    color: 'from-purple-500 to-violet-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-900',
    description: '中绩效 + 高潜力',
    icon: TrendingUp,
    count: 12,
  },
  {
    id: 'middle-center',
    name: '中坚力量',
    color: 'from-gray-500 to-slate-500',
    bgColor: 'bg-gray-50 dark:bg-gray-900',
    borderColor: 'border-gray-200 dark:border-gray-700',
    description: '中绩效 + 中潜力',
    icon: Users,
    count: 45,
  },
  {
    id: 'middle-left',
    name: '踏实肯干',
    color: 'from-teal-500 to-cyan-500',
    bgColor: 'bg-teal-50 dark:bg-teal-950/30',
    borderColor: 'border-teal-200 dark:border-teal-900',
    description: '中绩效 + 低潜力',
    icon: CheckCircle,
    count: 18,
  },
  {
    id: 'bottom-right',
    name: '潜力新人',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50 dark:bg-pink-950/30',
    borderColor: 'border-pink-200 dark:border-pink-900',
    description: '低绩效 + 高潜力',
    icon: Sparkles,
    count: 10,
  },
  {
    id: 'bottom-center',
    name: '问题员工',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    borderColor: 'border-orange-200 dark:border-orange-900',
    description: '低绩效 + 中潜力',
    icon: AlertTriangle,
    count: 8,
  },
  {
    id: 'bottom-left',
    name: '待淘汰',
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-900',
    description: '低绩效 + 低潜力',
    icon: XCircle,
    count: 5,
  },
];

const actions = {
  star: ['加速培养', '考虑晋升', '增加挑战', '导师辅导'],
  high: ['保持激励', '发展辅导', '技能提升'],
  core: ['关键保留', '绩效提升', '经验分享'],
  solid: ['保持稳定', '技能培训'],
  question: ['深入面谈', '重新定位', '绩效改善'],
  low: ['绩效改进', 'PIP计划', '考虑淘汰'],
};

export default function TalentGridPage() {
  const [selectedQuadrant, setSelectedQuadrant] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: '张三',
      department: '技术部',
      position: '高级工程师',
      performance: 9,
      potential: 8,
      quadrant: 'top-right',
      status: 'star',
      skills: ['架构设计', '团队管理', '技术攻关'],
      recommendations: ['加速培养', '考虑晋升', '增加挑战'],
    },
    {
      id: '2',
      name: '李四',
      department: '产品部',
      position: '产品经理',
      performance: 8,
      potential: 7,
      quadrant: 'top-center',
      status: 'high',
      skills: ['产品规划', '用户研究', '数据分析'],
      recommendations: ['保持激励', '发展辅导', '技能提升'],
    },
    {
      id: '3',
      name: '王五',
      department: '技术部',
      position: '前端工程师',
      performance: 7,
      potential: 9,
      quadrant: 'middle-right',
      status: 'high-potential',
      skills: ['React', 'TypeScript', '工程化'],
      recommendations: ['加速培养', '技术深耕', '项目历练'],
    },
    {
      id: '4',
      name: '赵六',
      department: '销售部',
      position: '销售代表',
      performance: 5,
      potential: 6,
      quadrant: 'middle-center',
      status: 'solid',
      skills: ['客户开发', '谈判技巧', '市场拓展'],
      recommendations: ['保持稳定', '技能培训', '经验分享'],
    },
    {
      id: '5',
      name: '孙七',
      department: '市场部',
      position: '市场专员',
      performance: 4,
      potential: 3,
      quadrant: 'bottom-center',
      status: 'question',
      skills: ['内容策划', '新媒体运营'],
      recommendations: ['深入面谈', '重新定位', '绩效改善'],
    },
  ]);

  const filteredEmployees = employees.filter(emp => {
    const matchesQuadrant = !selectedQuadrant || emp.quadrant === selectedQuadrant;
    const matchesDepartment = selectedDepartment === 'all' || emp.department === selectedDepartment;
    return matchesQuadrant && matchesDepartment;
  });

  const stats = {
    totalEmployees: employees.length,
    starTalent: employees.filter(e => e.status === 'star').length,
    highPotential: employees.filter(e => e.quadrant === 'middle-right').length,
    questionEmployees: employees.filter(e => e.status === 'question').length,
    avgPerformance: (employees.reduce((sum, e) => sum + e.performance, 0) / employees.length).toFixed(1),
    avgPotential: (employees.reduce((sum, e) => sum + e.potential, 0) / employees.length).toFixed(1),
  };

  const getQuadrantByValues = (performance: number, potential: number) => {
    if (performance >= 7 && potential >= 7) return 'top-right';
    if (performance >= 7 && potential >= 5 && potential < 7) return 'top-center';
    if (performance >= 7 && potential < 5) return 'top-left';
    if (performance >= 5 && performance < 7 && potential >= 7) return 'middle-right';
    if (performance >= 5 && performance < 7 && potential >= 5 && potential < 7) return 'middle-center';
    if (performance >= 5 && performance < 7 && potential < 5) return 'middle-left';
    if (performance < 5 && potential >= 7) return 'bottom-right';
    if (performance < 5 && potential >= 5 && potential < 7) return 'bottom-center';
    return 'bottom-left';
  };

  const getEmployeePosition = (performance: number, potential: number) => {
    const x = (potential - 1) / 9 * 100;
    const y = (performance - 1) / 9 * 100;
    return { x, y };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <Grid className="h-7 w-7 text-white" />
              </div>
              人才九宫格分析
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              基于绩效和潜力的双维度人才分析，科学制定人才培养策略
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出报告
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Target className="h-4 w-4 mr-2" />
              优化建议
            </Button>
          </div>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">员工总数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEmployees}</div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                <Users className="h-3 w-3 mr-1" />
                人
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">明星人才</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.starTalent}</div>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
                <Award className="h-3 w-3 mr-1" />
                {((stats.starTalent / stats.totalEmployees) * 100).toFixed(0)}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">高潜人才</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.highPotential}</div>
              <div className="flex items-center text-xs text-purple-600 dark:text-purple-400 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                {((stats.highPotential / stats.totalEmployees) * 100).toFixed(0)}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">待关注</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.questionEmployees}</div>
              <div className="flex items-center text-xs text-orange-600 dark:text-orange-400 mt-1">
                <AlertCircle className="h-3 w-3 mr-1" />
                需干预
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">平均绩效</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.avgPerformance}</div>
              <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 mt-1">
                <ArrowUp className="h-3 w-3 mr-1" />
                分
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">平均潜力</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{stats.avgPotential}</div>
              <div className="flex items-center text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                <ArrowUp className="h-3 w-3 mr-1" />
                分
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 九宫格主视图 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>人才分布九宫格</CardTitle>
                <CardDescription>
                  横轴：发展潜力 | 纵轴：当前绩效
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部部门</SelectItem>
                    <SelectItem value="技术部">技术部</SelectItem>
                    <SelectItem value="产品部">产品部</SelectItem>
                    <SelectItem value="销售部">销售部</SelectItem>
                    <SelectItem value="市场部">市场部</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-1 aspect-square max-w-4xl mx-auto">
              {quadrants.map((quadrant) => {
                const Icon = quadrant.icon;
                const quadrantEmployees = filteredEmployees.filter(e => e.quadrant === quadrant.id);
                return (
                  <div
                    key={quadrant.id}
                    className={`relative ${quadrant.bgColor} border ${quadrant.borderColor} rounded-lg p-4 cursor-pointer hover:shadow-md transition-all`}
                    onClick={() => setSelectedQuadrant(quadrant.id === selectedQuadrant ? '' : quadrant.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded bg-gradient-to-br ${quadrant.color}`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-900 dark:text-white">{quadrant.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {quadrantEmployees.length}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                      {quadrant.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {quadrantEmployees.slice(0, 3).map((emp) => (
                        <div
                          key={emp.id}
                          className="px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs font-medium text-gray-900 dark:text-white"
                        >
                          {emp.name}
                        </div>
                      ))}
                      {quadrantEmployees.length > 3 && (
                        <div className="px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
                          +{quadrantEmployees.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 图例 */}
            <div className="mt-6 flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-green-500 to-emerald-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">明星人才</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-cyan-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">核心人才</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-purple-500 to-violet-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">高潜人才</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-orange-500 to-red-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">待关注</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 员工列表 */}
        <Card>
          <CardHeader>
            <CardTitle>人才明细</CardTitle>
            <CardDescription>
              {selectedQuadrant ? quadrants.find(q => q.id === selectedQuadrant)?.name : '全部'}员工列表
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border dark:border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>员工</TableHead>
                    <TableHead>部门</TableHead>
                    <TableHead>职位</TableHead>
                    <TableHead>绩效</TableHead>
                    <TableHead>潜力</TableHead>
                    <TableHead>九宫格定位</TableHead>
                    <TableHead>核心技能</TableHead>
                    <TableHead>管理建议</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => {
                    const quadrantInfo = quadrants.find(q => q.id === employee.quadrant);
                    return (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                                {employee.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{employee.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>{employee.position}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${employee.performance * 10}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{employee.performance}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${employee.potential * 10}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{employee.potential}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={quadrantInfo?.bgColor}>
                            {quadrantInfo?.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {employee.skills.slice(0, 2).map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {employee.skills.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{employee.skills.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {employee.recommendations.slice(0, 2).map((rec, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {rec}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 添加缺失的图标组件
function Star(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function Sparkles(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function AlertTriangle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function XCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}
