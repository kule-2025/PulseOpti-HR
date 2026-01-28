'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  UserPlus,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Target,
  Calendar,
  Briefcase,
  GraduationCap,
  ArrowRight,
  Eye,
  Edit,
  Filter,
  Download,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

interface Position {
  id: string;
  name: string;
  department: string;
  level: 'C-level' | 'VP' | 'Director' | 'Manager' | 'Senior';
  incumbent: string;
  incumbentId: string;
  avatar?: string;
  successors: Successor[];
  readiness: 'ready' | '1-2years' | '3-5years' | 'none';
  riskLevel: 'high' | 'medium' | 'low';
  status: 'active' | 'planned' | 'vacant';
  note: string;
}

interface Successor {
  id: string;
  name: string;
  position: string;
  readiness: 'ready' | '1-2years' | '3-5years';
  score: number;
  strengths: string[];
  developmentNeeds: string[];
  plannedActions: string[];
}

export default function SuccessionPlanPage() {
  const [activeTab, setActiveTab] = useState('positions');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  const [positions, setPositions] = useState<Position[]>([
    {
      id: '1',
      name: 'CTO',
      department: '技术部',
      level: 'C-level',
      incumbent: '张总',
      incumbentId: 'EMP001',
      readiness: '1-2years',
      riskLevel: 'high',
      status: 'active',
      note: '关键岗位，需要重点培养接班人',
      successors: [
        {
          id: 'S1',
          name: '李四',
          position: '技术总监',
          readiness: '1-2years',
          score: 85,
          strengths: ['技术能力强', '管理经验丰富', '战略思维好'],
          developmentNeeds: ['财务知识', '跨部门协调能力'],
          plannedActions: ['参加MBA课程', '负责战略项目', '财务培训'],
        },
        {
          id: 'S2',
          name: '王五',
          position: '架构师',
          readiness: '3-5years',
          score: 78,
          strengths: ['架构设计能力', '技术创新'],
          developmentNeeds: ['团队管理', '战略规划', '沟通能力'],
          plannedActions: ['带团队', '参与战略决策', '管理培训'],
        },
      ],
    },
    {
      id: '2',
      name: '销售总监',
      department: '销售部',
      level: 'Director',
      incumbent: '赵总',
      incumbentId: 'EMP002',
      readiness: 'ready',
      riskLevel: 'low',
      status: 'active',
      note: '有2名合格接班人',
      successors: [
        {
          id: 'S3',
          name: '钱六',
          position: '销售经理',
          readiness: 'ready',
          score: 92,
          strengths: ['业绩突出', '团队管理能力强', '客户关系好'],
          developmentNeeds: ['战略规划', '财务知识'],
          plannedActions: ['参与战略规划', '财务培训', '跨部门项目'],
        },
        {
          id: 'S4',
          name: '孙七',
          position: '销售经理',
          readiness: '1-2years',
          score: 80,
          strengths: ['市场开拓能力', '团队激励'],
          developmentNeeds: ['战略思维', '财务管理'],
          plannedActions: ['市场分析培训', '财务课程', '战略项目'],
        },
      ],
    },
    {
      id: '3',
      name: '产品总监',
      department: '产品部',
      level: 'Director',
      incumbent: '周总',
      incumbentId: 'EMP003',
      readiness: '3-5years',
      riskLevel: 'medium',
      status: 'active',
      note: '需要加快培养接班人',
      successors: [
        {
          id: 'S5',
          name: '吴八',
          position: '产品经理',
          readiness: '3-5years',
          score: 75,
          strengths: ['产品规划', '用户研究', '数据分析'],
          developmentNeeds: ['团队管理', '战略思维', '商业敏感度'],
          plannedActions: ['带小团队', '战略培训', '商业课程'],
        },
      ],
    },
  ]);

  const [planFormData, setPlanFormData] = useState({
    name: '',
    department: '',
    level: '',
    incumbent: '',
    note: '',
  });

  const stats = {
    totalPositions: positions.length,
    positionsWithSuccessors: positions.filter(p => p.successors.length > 0).length,
    readySuccessors: positions.reduce((sum, p) => sum + p.successors.filter(s => s.readiness === 'ready').length, 0),
    highRiskPositions: positions.filter(p => p.riskLevel === 'high').length,
    avgSuccessorsPerPosition: (positions.reduce((sum, p) => sum + p.successors.length, 0) / positions.length).toFixed(1),
  };

  const getReadinessBadge = (readiness: string) => {
    const variants: Record<string, any> = {
      ready: { label: '已就绪', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      '1-2years': { label: '1-2年', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      '3-5years': { label: '3-5年', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      none: { label: '无', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    };
    const variant = variants[readiness];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getRiskBadge = (riskLevel: string) => {
    const variants: Record<string, any> = {
      high: { label: '高风险', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      medium: { label: '中风险', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      low: { label: '低风险', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    };
    const variant = variants[riskLevel];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getLevelBadge = (level: string) => {
    const variants: Record<string, any> = {
      'C-level': { label: 'C-level', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
      VP: { label: 'VP', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      Director: { label: '总监', className: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' },
      Manager: { label: '经理', className: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' },
      Senior: { label: '资深', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
    };
    const variant = variants[level];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const handleCreatePlan = () => {
    if (!planFormData.name || !planFormData.level) {
      toast.error('请填写完整的关键岗位信息');
      return;
    }

    const newPosition: Position = {
      id: Date.now().toString(),
      name: planFormData.name,
      department: planFormData.department,
      level: planFormData.level as any,
      incumbent: planFormData.incumbent,
      incumbentId: '',
      readiness: 'none',
      riskLevel: 'high',
      status: 'active',
      note: planFormData.note,
      successors: [],
    };

    setPositions([...positions, newPosition]);
    setShowCreateDialog(false);
    setPlanFormData({
      name: '',
      department: '',
      level: '',
      incumbent: '',
      note: '',
    });
    toast.success('继任计划创建成功');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
              继任计划管理
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              关键岗位后备人才培养，确保组织可持续发展
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出计划
            </Button>
            <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
              <UserPlus className="h-4 w-4 mr-2" />
              创建计划
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">关键岗位</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPositions}</div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                <Briefcase className="h-3 w-3 mr-1" />
                个
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">有接班人</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.positionsWithSuccessors}</div>
              <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 mt-1">
                <Users className="h-3 w-3 mr-1" />
                {((stats.positionsWithSuccessors / stats.totalPositions) * 100).toFixed(0)}% 覆盖率
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">已就绪</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.readySuccessors}</div>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                人可接班
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">高风险</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.highRiskPositions}</div>
              <div className="flex items-center text-xs text-red-600 dark:text-red-400 mt-1">
                <AlertCircle className="h-3 w-3 mr-1" />
                需重点关注
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">平均接班人</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.avgSuccessorsPerPosition}</div>
              <div className="flex items-center text-xs text-purple-600 dark:text-purple-400 mt-1">
                <Users className="h-3 w-3 mr-1" />
                人/岗位
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 功能Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="positions" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              岗位继任
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              人才梯队
            </TabsTrigger>
            <TabsTrigger value="development" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              发展计划
            </TabsTrigger>
          </TabsList>

          {/* 岗位继任 */}
          <TabsContent value="positions" className="space-y-4">
            <div className="grid gap-4">
              {positions.map((position) => (
                <Card key={position.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarFallback className="bg-gradient-to-br from-green-500 to-teal-500 text-white text-xl">
                            {position.incumbent?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{position.name}</h3>
                            {getLevelBadge(position.level)}
                            {getRiskBadge(position.riskLevel)}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{position.department}</p>
                          <p className="text-sm text-gray-900 dark:text-white font-medium mt-1">现任：{position.incumbent}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          查看详情
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          编辑
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">接班就绪度</span>
                        {getReadinessBadge(position.readiness)}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{position.note}</p>
                    </div>

                    {position.successors.length > 0 ? (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                          接班人 ({position.successors.length})
                        </h4>
                        <div className="space-y-3">
                          {position.successors.map((successor) => (
                            <div
                              key={successor.id}
                              className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-800"
                            >
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                  {successor.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900 dark:text-white">{successor.name}</span>
                                  <span className="text-xs text-gray-600 dark:text-gray-400">{successor.position}</span>
                                  {getReadinessBadge(successor.readiness)}
                                  <Badge variant="secondary" className="text-xs">
                                    得分: {successor.score}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {successor.strengths.slice(0, 3).map((strength, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300">
                                      ✓ {strength}
                                    </Badge>
                                  ))}
                                  {successor.developmentNeeds.slice(0, 2).map((need, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300">
                                      {need}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <Button variant="outline" size="sm">
                                查看发展计划
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed dark:border-gray-800 rounded-lg">
                        <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">暂无接班人</p>
                        <Button size="sm">
                          <UserPlus className="h-4 w-4 mr-2" />
                          添加接班人
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 人才梯队 */}
          <TabsContent value="pipeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>人才梯队概览</CardTitle>
                <CardDescription>按层级和部门展示人才储备情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border dark:border-gray-700">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>层级</TableHead>
                        <TableHead>岗位数</TableHead>
                        <TableHead>接班人总数</TableHead>
                        <TableHead>已就绪</TableHead>
                        <TableHead>1-2年</TableHead>
                        <TableHead>3-5年</TableHead>
                        <TableHead>覆盖率</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {['C-level', 'VP', 'Director', 'Manager'].map((level) => {
                        const levelPositions = positions.filter(p => p.level === level);
                        const totalSuccessors = levelPositions.reduce((sum, p) => sum + p.successors.length, 0);
                        const readyCount = levelPositions.reduce((sum, p) => sum + p.successors.filter(s => s.readiness === 'ready').length, 0);
                        const oneTwoYears = levelPositions.reduce((sum, p) => sum + p.successors.filter(s => s.readiness === '1-2years').length, 0);
                        const threeFiveYears = levelPositions.reduce((sum, p) => sum + p.successors.filter(s => s.readiness === '3-5years').length, 0);
                        
                        return (
                          <TableRow key={level}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getLevelBadge(level)}
                              </div>
                            </TableCell>
                            <TableCell>{levelPositions.length}</TableCell>
                            <TableCell>{totalSuccessors}</TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                {readyCount}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {oneTwoYears}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                {threeFiveYears}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{
                                      width: levelPositions.length > 0
                                        ? `${(levelPositions.filter(p => p.successors.length > 0).length / levelPositions.length) * 100}%`
                                        : '0%'
                                    }}
                                  />
                                </div>
                                <span className="text-sm">
                                  {levelPositions.length > 0
                                    ? `${(levelPositions.filter(p => p.successors.length > 0).length / levelPositions.length * 100).toFixed(0)}%`
                                    : '0%'
                                  }
                                </span>
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
          </TabsContent>

          {/* 发展计划 */}
          <TabsContent value="development" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>接班人发展计划</CardTitle>
                <CardDescription>跟踪接班人的成长路径和发展行动</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {positions.flatMap(pos =>
                    pos.successors.map(successor => ({
                      ...successor,
                      position: pos.name,
                      department: pos.department,
                    }))
                  ).map((successor, idx) => (
                    <Card key={idx}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                  {successor.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">{successor.name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  目标岗位：{successor.position} - {successor.department}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              {getReadinessBadge(successor.readiness)}
                              <Badge variant="outline">综合评分：{successor.score}</Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">核心优势</h5>
                            <div className="flex flex-wrap gap-2">
                              {successor.strengths.map((strength, sIdx) => (
                                <Badge key={sIdx} className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300">
                                  {strength}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">发展需求</h5>
                            <div className="flex flex-wrap gap-2">
                              {successor.developmentNeeds.map((need, nIdx) => (
                                <Badge key={nIdx} className="bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300">
                                  {need}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t dark:border-gray-800">
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            计划行动
                          </h5>
                          <div className="space-y-2">
                            {successor.plannedActions.map((action, aIdx) => (
                              <div key={aIdx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">
                                  {aIdx + 1}
                                </div>
                                <span className="text-sm text-gray-900 dark:text-white">{action}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 创建继任计划对话框 */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>创建继任计划</DialogTitle>
              <DialogDescription>
                添加关键岗位并规划接班人
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">岗位名称 *</Label>
                <Input
                  id="name"
                  value={planFormData.name}
                  onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
                  placeholder="例如：CTO、销售总监"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">部门</Label>
                <Input
                  id="department"
                  value={planFormData.department}
                  onChange={(e) => setPlanFormData({ ...planFormData, department: e.target.value })}
                  placeholder="例如：技术部、销售部"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">岗位层级 *</Label>
                <Select value={planFormData.level} onValueChange={(v) => setPlanFormData({ ...planFormData, level: v })}>
                  <SelectTrigger id="level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="C-level">C-level</SelectItem>
                    <SelectItem value="VP">VP</SelectItem>
                    <SelectItem value="Director">总监</SelectItem>
                    <SelectItem value="Manager">经理</SelectItem>
                    <SelectItem value="Senior">资深</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="incumbent">现任人员</Label>
                <Input
                  id="incumbent"
                  value={planFormData.incumbent}
                  onChange={(e) => setPlanFormData({ ...planFormData, incumbent: e.target.value })}
                  placeholder="例如：张总"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">备注说明</Label>
                <Textarea
                  id="note"
                  value={planFormData.note}
                  onChange={(e) => setPlanFormData({ ...planFormData, note: e.target.value })}
                  placeholder="填写关于该岗位和继任计划的重要说明..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>取消</Button>
              <Button onClick={handleCreatePlan}>创建</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
