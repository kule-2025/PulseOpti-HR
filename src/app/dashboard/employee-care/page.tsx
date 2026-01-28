'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Heart,
  Plus,
  MessageSquare,
  Gift,
  Calendar,
  Coffee,
  Search,
  Download,
  Save,
  Eye,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  TrendingUp,
  Filter,
  Sparkles,
  Crown,
  Target,
  Zap,
  Smile,
  Flame,
  Bell,
  Brain,
  FileText,
  DollarSign,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';

// 类型定义
type CareType = 'birthday' | 'wedding' | 'sick' | 'childbirth' | 'family_bereavement' | 'onboarding' | 'resignation';
type CareStatus = 'pending' | 'in_progress' | 'completed';

interface CareRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: CareType;
  status: CareStatus;
  priority: 'high' | 'medium' | 'low';
  date: string;
  description: string;
  actionTaken: string;
  note: string;
  followUpDate?: string;
  creatorId: string;
  creatorName: string;
}

interface Feedback {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  category: 'suggestion' | 'complaint' | 'praise' | 'question';
  content: string;
  status: 'pending' | 'processing' | 'resolved';
  submittedAt: string;
  response?: string;
  respondedAt?: string;
}

export default function EmployeeCarePage() {
  const [activeTab, setActiveTab] = useState('care');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  // 员工关怀记录
  const [careRecords] = useState<CareRecord[]>([
    {
      id: '1',
      employeeId: '1',
      employeeName: '张三',
      department: '技术部',
      type: 'birthday',
      status: 'completed',
      priority: 'medium',
      date: '2025-04-15',
      description: '员工生日祝福',
      actionTaken: '发送生日贺卡和礼品',
      note: '员工表示感谢',
      creatorId: '2',
      creatorName: '李四',
    },
    {
      id: '2',
      employeeId: '3',
      employeeName: '王五',
      department: '销售部',
      type: 'sick',
      status: 'in_progress',
      priority: 'high',
      date: '2025-04-17',
      description: '员工生病住院',
      actionTaken: '已安排同事探望',
      note: '病情稳定，恢复中',
      followUpDate: '2025-04-20',
      creatorId: '4',
      creatorName: '赵六',
    },
    {
      id: '3',
      employeeId: '5',
      employeeName: '钱七',
      department: '市场部',
      type: 'onboarding',
      status: 'completed',
      priority: 'high',
      date: '2025-04-10',
      description: '新员工入职关怀',
      actionTaken: '安排入职培训和导师',
      note: '员工已熟悉基本流程',
      creatorId: '2',
      creatorName: '李四',
    },
    {
      id: '4',
      employeeId: '6',
      employeeName: '孙八',
      department: '市场部',
      type: 'wedding',
      status: 'pending',
      priority: 'medium',
      date: '2025-05-01',
      description: '员工结婚祝福',
      actionTaken: '',
      note: '',
      creatorId: '2',
      creatorName: '李四',
    },
  ]);

  // 员工反馈
  const [feedbacks] = useState<Feedback[]>([
    {
      id: '1',
      employeeId: '1',
      employeeName: '张三',
      department: '技术部',
      category: 'suggestion',
      content: '建议增加技术分享会频率',
      status: 'processing',
      submittedAt: '2025-04-16',
    },
    {
      id: '2',
      employeeId: '3',
      employeeName: '王五',
      department: '销售部',
      category: 'complaint',
      content: '销售系统经常卡顿，影响工作',
      status: 'resolved',
      submittedAt: '2025-04-14',
      response: '已安排技术部门进行优化',
      respondedAt: '2025-04-15',
    },
  ]);

  // 关怀统计
  const [careStats] = useState({
    totalRecords: 4,
    pending: 1,
    inProgress: 1,
    completed: 2,
    highPriority: 1,
  });

  // 反馈统计
  const [feedbackStats] = useState({
    totalFeedback: 2,
    pending: 0,
    processing: 1,
    resolved: 1,
  });

  const typeMap: Record<CareType, { label: string; icon: React.ReactNode; color: string }> = {
    birthday: { label: '生日关怀', icon: <Gift className="h-4 w-4" />, color: 'bg-pink-100 text-pink-800' },
    wedding: { label: '结婚祝福', icon: <Heart className="h-4 w-4" />, color: 'bg-red-100 text-red-800' },
    sick: { label: '生病探望', icon: <Coffee className="h-4 w-4" />, color: 'bg-orange-100 text-orange-800' },
    childbirth: { label: '生育慰问', icon: <Gift className="h-4 w-4" />, color: 'bg-purple-100 text-purple-800' },
    family_bereavement: { label: '家庭丧事', icon: <Heart className="h-4 w-4" />, color: 'bg-gray-100 text-gray-800' },
    onboarding: { label: '入职关怀', icon: <Users className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800' },
    resignation: { label: '离职关怀', icon: <Heart className="h-4 w-4" />, color: 'bg-yellow-100 text-yellow-800' },
  };

  const statusMap: Record<CareStatus, { label: string; color: string }> = {
    pending: { label: '待处理', color: 'bg-gray-100 text-gray-800' },
    in_progress: { label: '进行中', color: 'bg-blue-100 text-blue-800' },
    completed: { label: '已完成', color: 'bg-green-100 text-green-800' },
  };

  const categoryMap: Record<string, { label: string; color: string }> = {
    suggestion: { label: '建议', color: 'bg-blue-100 text-blue-800' },
    complaint: { label: '投诉', color: 'bg-red-100 text-red-800' },
    praise: { label: '表扬', color: 'bg-green-100 text-green-800' },
    question: { label: '咨询', color: 'bg-yellow-100 text-yellow-800' },
  };

  const filteredRecords = careRecords.filter(record => {
    const matchSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       record.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">员工关怀</h1>
          <p className="text-gray-600 mt-2">
            关怀记录、员工反馈、慰问管理
            <Badge variant="secondary" className="ml-2">HRBP</Badge>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出报告
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新增关怀
          </Button>
        </div>
      </div>

      {/* 功能介绍 */}
      <Alert>
        <Heart className="h-4 w-4" />
        <AlertDescription>
          全周期员工关怀管理，包括生日、入职、生病、离职等关键时刻
        </AlertDescription>
      </Alert>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">关怀记录</CardTitle>
            <Heart className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{careStats.totalRecords}</div>
            <p className="text-xs text-gray-500 mt-1">
              {careStats.highPriority} 个高优先级
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">待处理</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{careStats.pending}</div>
            <p className="text-xs text-gray-500 mt-1">需立即处理</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">进行中</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{careStats.inProgress}</div>
            <p className="text-xs text-gray-500 mt-1">处理中</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">员工反馈</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedbackStats.totalFeedback}</div>
            <p className="text-xs text-gray-500 mt-1">
              {feedbackStats.pending} 待回复
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="care">关怀记录</TabsTrigger>
          <TabsTrigger value="feedback">员工反馈</TabsTrigger>
          <TabsTrigger value="calendar">关怀日历</TabsTrigger>
          <TabsTrigger value="smart-reminders">
            <Sparkles className="h-4 w-4 mr-1" />
            智能提醒
            <Badge className="ml-1 bg-gradient-to-r from-purple-600 to-pink-600 scale-75">PRO</Badge>
          </TabsTrigger>
          <TabsTrigger value="satisfaction-analysis">
            <Brain className="h-4 w-4 mr-1" />
            满意度分析
            <Badge className="ml-1 bg-gradient-to-r from-purple-600 to-pink-600 scale-75">PRO</Badge>
          </TabsTrigger>
        </TabsList>

        {/* 关怀记录 */}
        <TabsContent value="care" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>关怀记录</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="搜索员工或描述"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="pending">待处理</SelectItem>
                      <SelectItem value="in_progress">进行中</SelectItem>
                      <SelectItem value="completed">已完成</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日期</TableHead>
                    <TableHead>员工</TableHead>
                    <TableHead>关怀类型</TableHead>
                    <TableHead>描述</TableHead>
                    <TableHead>处理措施</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="text-sm">{record.date}</TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div>{record.employeeName}</div>
                          <div className="text-xs text-gray-600">{record.department}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={typeMap[record.type].color}>
                          {typeMap[record.type].icon}
                          {typeMap[record.type].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {record.description}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {record.actionTaken || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusMap[record.status].color}>
                          {statusMap[record.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 员工反馈 */}
        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>员工反馈</CardTitle>
              <CardDescription>收集和处理员工意见建议</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>员工</TableHead>
                    <TableHead>类别</TableHead>
                    <TableHead>内容</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>提交时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbacks.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{feedback.employeeName}</div>
                          <div className="text-xs text-gray-600">{feedback.department}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={categoryMap[feedback.category].color}>
                          {categoryMap[feedback.category].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {feedback.content}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            feedback.status === 'resolved' ? 'default' : 'secondary'
                          }
                        >
                          {feedback.status === 'pending' && '待处理'}
                          {feedback.status === 'processing' && '处理中'}
                          {feedback.status === 'resolved' && '已解决'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{feedback.submittedAt}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 关怀日历 */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>关怀日历</CardTitle>
              <CardDescription>查看即将到来的关怀事件</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-pink-600" />
                    <span className="font-medium">即将到来的生日</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    本月有 3 位员工生日
                  </div>
                </div>
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-5 w-5 text-red-600" />
                    <span className="font-medium">即将到来的婚礼</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    钱七 - 5月1日
                  </div>
                </div>
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">即将到来的生育</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    暂无
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 智能提醒 Tab */}
        <TabsContent value="smart-reminders" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              智能关怀提醒
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">PRO</Badge>
            </CardTitle>
            <CardDescription>
              AI 智能识别关怀时机，自动提醒不遗漏
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* 提醒类型 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {[
                {
                  type: 'birthday',
                  title: '生日提醒',
                  description: '员工生日前 7 天自动提醒',
                  icon: Gift,
                  color: 'from-pink-600 to-rose-600',
                  enabled: true,
                  upcoming: 3,
                },
                {
                  type: 'anniversary',
                  title: '入职周年',
                  description: '入职纪念日提前提醒',
                  icon: Calendar,
                  color: 'from-blue-600 to-cyan-600',
                  enabled: true,
                  upcoming: 5,
                },
                {
                  type: 'holiday',
                  title: '节假日关怀',
                  description: '春节、中秋等节日自动提醒',
                  icon: Flame,
                  color: 'from-orange-600 to-red-600',
                  enabled: true,
                  upcoming: 2,
                },
                {
                  type: 'probation',
                  title: '试用期转正',
                  description: '试用期结束前 15 天提醒',
                  icon: Target,
                  color: 'from-green-600 to-emerald-600',
                  enabled: true,
                  upcoming: 8,
                },
                {
                  type: 'contract',
                  title: '合同到期',
                  description: '合同到期前 30 天提醒',
                  icon: FileText,
                  color: 'from-yellow-600 to-orange-600',
                  enabled: true,
                  upcoming: 12,
                },
                {
                  type: 'health',
                  title: '健康关怀',
                  description: '长期加班、病假后提醒',
                  icon: Heart,
                  color: 'from-red-600 to-pink-600',
                  enabled: false,
                  upcoming: 0,
                },
              ].map((reminder, index) => {
                const Icon = reminder.icon;
                return (
                  <Card
                    key={index}
                    className={`hover:shadow-lg transition-all ${
                      reminder.enabled ? 'border-2 border-green-400' : 'opacity-70'
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${reminder.color}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <Badge
                          variant={reminder.enabled ? 'default' : 'secondary'}
                          className={reminder.enabled ? 'bg-green-600' : ''}
                        >
                          {reminder.enabled ? '已启用' : '未启用'}
                        </Badge>
                      </div>
                      <CardTitle className="text-base">{reminder.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {reminder.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          即将到来 <span className="font-bold text-purple-600">{reminder.upcoming}</span> 项
                        </div>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          配置
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* 即将到来的提醒 */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-600" />
                即将到来的提醒
              </h3>
              <div className="space-y-3">
                {[
                  {
                    employee: '张三',
                    event: '生日',
                    date: '2025-02-01',
                    days: 4,
                    priority: 'medium',
                  },
                  {
                    employee: '李四',
                    event: '入职周年',
                    date: '2025-01-30',
                    days: 2,
                    priority: 'high',
                  },
                  {
                    employee: '王五',
                    event: '试用期转正',
                    date: '2025-02-10',
                    days: 13,
                    priority: 'medium',
                  },
                  {
                    employee: '赵六',
                    event: '合同到期',
                    date: '2025-02-05',
                    days: 8,
                    priority: 'high',
                  },
                ].map((reminder, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg flex items-center justify-between ${
                      reminder.priority === 'high'
                        ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-300 dark:border-orange-700'
                        : 'bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                        {reminder.employee.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {reminder.employee} · {reminder.event}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {reminder.date} · 还有 {reminder.days} 天
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Smile className="h-4 w-4 mr-2" />
                        发送祝福
                      </Button>
                      <Button
                        size="sm"
                        className={
                          reminder.priority === 'high'
                            ? 'bg-orange-600 hover:bg-orange-700'
                            : 'bg-purple-600 hover:bg-purple-700'
                        }
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        标记已处理
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

        {/* 满意度分析 Tab */}
        <TabsContent value="satisfaction-analysis" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              员工满意度深度分析
              <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600">PRO</Badge>
            </CardTitle>
            <CardDescription>
              AI 深度分析员工满意度，提供改进建议
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* 满意度概览 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[
                {
                  label: '整体满意度',
                  value: '4.2',
                  trend: '+0.3',
                  icon: Smile,
                  color: 'text-green-600',
                },
                {
                  label: '工作环境',
                  value: '4.5',
                  trend: '+0.2',
                  icon: Coffee,
                  color: 'text-blue-600',
                },
                {
                  label: '薪酬福利',
                  value: '3.8',
                  trend: '-0.1',
                  icon: DollarSign,
                  color: 'text-orange-600',
                },
                {
                  label: '发展机会',
                  value: '4.0',
                  trend: '+0.4',
                  icon: TrendingUp,
                  color: 'text-purple-600',
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardDescription className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${item.color}`} />
                        {item.label}
                      </CardDescription>
                      <CardTitle className="text-3xl">{item.value}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-sm flex items-center gap-1 ${
                        item.trend.startsWith('+')
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {item.trend.startsWith('+') ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingUp className="h-4 w-4 rotate-180" />
                        )}
                        <span>较上月 {item.trend}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* 多维度分析 */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                多维度满意度分析
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    dimension: '工作满意度',
                    score: 85,
                    change: '+5%',
                    items: [
                      { label: '工作内容', score: 90 },
                      { label: '工作负荷', score: 75 },
                      { label: '团队氛围', score: 88 },
                      { label: '管理支持', score: 82 },
                    ],
                  },
                  {
                    dimension: '薪酬满意度',
                    score: 78,
                    change: '-2%',
                    items: [
                      { label: '基本工资', score: 75 },
                      { label: '绩效奖金', score: 80 },
                      { label: '福利待遇', score: 85 },
                      { label: '晋升机会', score: 70 },
                    ],
                  },
                  {
                    dimension: '发展满意度',
                    score: 82,
                    change: '+8%',
                    items: [
                      { label: '培训机会', score: 85 },
                      { label: '职业发展', score: 78 },
                      { label: '晋升机制', score: 80 },
                      { label: '导师指导', score: 75 },
                    ],
                  },
                  {
                    dimension: '环境满意度',
                    score: 88,
                    change: '+3%',
                    items: [
                      { label: '办公环境', score: 90 },
                      { label: '办公设备', score: 85 },
                      { label: '休息区域', score: 88 },
                      { label: '交通便利', score: 82 },
                    ],
                  },
                ].map((dimension, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{dimension.dimension}</CardTitle>
                        <Badge
                          variant={dimension.change.startsWith('+') ? 'default' : 'secondary'}
                          className={dimension.change.startsWith('+') ? 'bg-green-600' : 'bg-red-600'}
                        >
                          {dimension.change}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            综合评分
                          </span>
                          <span className="text-lg font-bold text-purple-600">
                            {dimension.score}
                          </span>
                        </div>
                        <Progress value={dimension.score} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        {dimension.items.map((item, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">
                                {item.label}
                              </span>
                              <span className="font-medium">{item.score}</span>
                            </div>
                            <Progress value={item.score} className="h-1" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* AI 改进建议 */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-gray-900 dark:text-white">AI 改进建议</span>
                <Badge variant="outline" className="border-purple-600 text-purple-600">AI</Badge>
              </div>
              <div className="space-y-2">
                {[
                  {
                    priority: 'high',
                    icon: AlertTriangle,
                    color: 'text-red-600',
                    suggestion: '薪酬满意度较低，建议进行薪酬调研，调整薪酬结构',
                  },
                  {
                    priority: 'medium',
                    icon: Target,
                    color: 'text-orange-600',
                    suggestion: '晋升机会评分较低，建议优化晋升机制，增加透明度',
                  },
                  {
                    priority: 'low',
                    icon: TrendingUp,
                    color: 'text-green-600',
                    suggestion: '工作满意度持续提升，继续保持当前工作氛围',
                  },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg"
                    >
                      <Icon className={`h-5 w-5 ${item.color} mt-0.5`} />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white mb-1">
                          {item.priority === 'high' ? '高优先级' : item.priority === 'medium' ? '中优先级' : '低优先级'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {item.suggestion}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button className="mt-4 w-full bg-gradient-to-r from-purple-600 to-pink-600">
                <Sparkles className="h-4 w-4 mr-2" />
                生成详细改进方案
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      </Tabs>

      {/* 新增关怀弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>新增关怀记录</DialogTitle>
            <DialogDescription>
              记录员工关怀信息
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="employee">选择员工 *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="选择员工" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">张三 - 技术部</SelectItem>
                  <SelectItem value="2">李四 - 技术部</SelectItem>
                  <SelectItem value="3">王五 - 销售部</SelectItem>
                  <SelectItem value="4">赵六 - 销售部</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">关怀类型 *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday">生日关怀</SelectItem>
                  <SelectItem value="wedding">结婚祝福</SelectItem>
                  <SelectItem value="sick">生病探望</SelectItem>
                  <SelectItem value="childbirth">生育慰问</SelectItem>
                  <SelectItem value="family_bereavement">家庭丧事</SelectItem>
                  <SelectItem value="onboarding">入职关怀</SelectItem>
                  <SelectItem value="resignation">离职关怀</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">日期 *</Label>
                <Input id="date" type="date" />
              </div>
              <div>
                <Label htmlFor="priority">优先级 *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="选择优先级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="low">低</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">描述 *</Label>
              <Textarea
                id="description"
                placeholder="描述关怀事项"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="action">处理措施</Label>
              <Textarea
                id="action"
                placeholder="记录已采取或计划采取的措施"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={() => {
              toast.success('关怀记录已添加！');
              setDialogOpen(false);
            }}>
              <Save className="mr-2 h-4 w-4" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
