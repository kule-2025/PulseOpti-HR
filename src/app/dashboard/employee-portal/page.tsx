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
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Briefcase,
  GraduationCap,
  FileText,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Search,
  Filter,
  Plus,
  Upload,
  Download,
  Eye,
  Edit,
  Camera,
  Award,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

interface EmployeeProfile {
  id: string;
  name: string;
  employeeId: string;
  avatar?: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  manager: string;
  joinDate: string;
  location: string;
  education: string;
  workEmail: string;
  personalEmail: string;
  emergencyContact: string;
  emergencyPhone: string;
}

interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  applyDate: string;
  approver: string;
  comment?: string;
}

interface ExpenseClaim {
  id: string;
  type: string;
  amount: number;
  date: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  applyDate: string;
  receipts: string[];
}

interface TrainingCourse {
  id: string;
  title: string;
  category: string;
  instructor: string;
  duration: string;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed';
  dueDate: string;
}

interface PayrollRecord {
  id: string;
  period: string;
  basicSalary: number;
  performanceBonus: number;
  subsidy: number;
  deduction: number;
  tax: number;
  netSalary: number;
  payDate: string;
}

export default function EmployeePortal() {
  const [activeTab, setActiveTab] = useState('personal');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);

  const [profile, setProfile] = useState<EmployeeProfile>({
    id: '1',
    name: '张三',
    employeeId: 'EMP001',
    email: 'zhangsan@company.com',
    phone: '13800138000',
    department: '技术部',
    position: '高级前端工程师',
    manager: '李四',
    joinDate: '2022-03-15',
    location: '北京',
    education: '本科',
    workEmail: 'zhangsan@company.com',
    personalEmail: 'zhangsan@gmail.com',
    emergencyContact: '李四',
    emergencyPhone: '13900139000',
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: '1',
      type: '年假',
      startDate: '2024-12-20',
      endDate: '2024-12-25',
      days: 5,
      reason: '家庭聚会',
      status: 'pending',
      applyDate: '2024-12-10',
      approver: '李四',
    },
    {
      id: '2',
      type: '病假',
      startDate: '2024-11-15',
      endDate: '2024-11-16',
      days: 2,
      reason: '感冒发烧',
      status: 'approved',
      applyDate: '2024-11-15',
      approver: '李四',
      comment: '批准，注意休息',
    },
  ]);

  const [expenseClaims, setExpenseClaims] = useState<ExpenseClaim[]>([
    {
      id: '1',
      type: '差旅费',
      amount: 2500,
      date: '2024-11-20',
      description: '上海出差住宿和交通',
      status: 'pending',
      applyDate: '2024-11-21',
      receipts: ['/receipts/hotel.jpg', '/receipts/flight.jpg'],
    },
    {
      id: '2',
      type: '餐饮费',
      amount: 350,
      date: '2024-11-18',
      description: '客户招待',
      status: 'approved',
      applyDate: '2024-11-19',
      receipts: ['/receipts/dinner.jpg'],
    },
  ]);

  const [trainingCourses, setTrainingCourses] = useState<TrainingCourse[]>([
    {
      id: '1',
      title: 'Vue3 深入理解',
      category: '技术培训',
      instructor: '技术专家',
      duration: '8小时',
      progress: 75,
      status: 'in-progress',
      dueDate: '2024-12-31',
    },
    {
      id: '2',
      title: '团队管理基础',
      category: '管理培训',
      instructor: 'HR专家',
      duration: '4小时',
      progress: 100,
      status: 'completed',
      dueDate: '2024-11-30',
    },
    {
      id: '3',
      title: '商务礼仪',
      category: '通用培训',
      instructor: '外部讲师',
      duration: '2小时',
      progress: 0,
      status: 'not-started',
      dueDate: '2025-01-15',
    },
  ]);

  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([
    {
      id: '1',
      period: '2024年11月',
      basicSalary: 15000,
      performanceBonus: 3000,
      subsidy: 1000,
      deduction: 500,
      tax: 1200,
      netSalary: 17300,
      payDate: '2024-12-05',
    },
    {
      id: '2',
      period: '2024年10月',
      basicSalary: 15000,
      performanceBonus: 2800,
      subsidy: 1000,
      deduction: 300,
      tax: 1150,
      netSalary: 17350,
      payDate: '2024-11-05',
    },
  ]);

  const [leaveFormData, setLeaveFormData] = useState({
    type: '年假',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const [expenseFormData, setExpenseFormData] = useState({
    type: '差旅费',
    amount: '',
    date: '',
    description: '',
  });

  const leaveBalance = {
    annual: { total: 15, used: 5, remaining: 10 },
    sick: { total: 5, used: 2, remaining: 3 },
    personal: { total: 3, used: 0, remaining: 3 },
  };

  const handleSaveProfile = () => {
    toast.success('个人信息已更新');
    setShowEditProfile(false);
  };

  const handleSubmitLeave = () => {
    if (!leaveFormData.type || !leaveFormData.startDate || !leaveFormData.endDate) {
      toast.error('请填写完整的请假信息');
      return;
    }

    const startDate = new Date(leaveFormData.startDate);
    const endDate = new Date(leaveFormData.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const newLeave: LeaveRequest = {
      id: Date.now().toString(),
      type: leaveFormData.type,
      startDate: leaveFormData.startDate,
      endDate: leaveFormData.endDate,
      days,
      reason: leaveFormData.reason,
      status: 'pending',
      applyDate: new Date().toISOString().split('T')[0],
      approver: profile.manager,
    };

    setLeaveRequests([newLeave, ...leaveRequests]);
    setShowLeaveDialog(false);
    setLeaveFormData({ type: '年假', startDate: '', endDate: '', reason: '' });
    toast.success('请假申请已提交');
  };

  const handleSubmitExpense = () => {
    if (!expenseFormData.type || !expenseFormData.amount || !expenseFormData.date) {
      toast.error('请填写完整的报销信息');
      return;
    }

    const newExpense: ExpenseClaim = {
      id: Date.now().toString(),
      type: expenseFormData.type,
      amount: Number(expenseFormData.amount),
      date: expenseFormData.date,
      description: expenseFormData.description,
      status: 'pending',
      applyDate: new Date().toISOString().split('T')[0],
      receipts: [],
    };

    setExpenseClaims([newExpense, ...expenseClaims]);
    setShowExpenseDialog(false);
    setExpenseFormData({ type: '差旅费', amount: '', date: '', description: '' });
    toast.success('报销申请已提交');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { label: '待审批', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      approved: { label: '已批准', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      rejected: { label: '已拒绝', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      'not-started': { label: '未开始', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
      'in-progress': { label: '进行中', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      completed: { label: '已完成', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    };
    const variant = variants[status];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <User className="h-7 w-7 text-white" />
              </div>
              员工自助服务
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              个人信息管理、请假申请、费用报销、培训学习
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  {profile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <div className="font-semibold text-gray-900 dark:text-white">{profile.name}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{profile.employeeId}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 个人信息卡片 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>个人信息</CardTitle>
                <CardDescription>查看和更新您的基本信息</CardDescription>
              </div>
              <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    编辑资料
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>编辑个人信息</DialogTitle>
                    <DialogDescription>更新您的个人资料信息</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">姓名</Label>
                      <Input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">手机号码</Label>
                      <Input id="phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="personalEmail">个人邮箱</Label>
                      <Input id="personalEmail" value={profile.personalEmail} onChange={(e) => setProfile({ ...profile, personalEmail: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">紧急联系人</Label>
                      <Input id="emergencyContact" value={profile.emergencyContact} onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone">紧急联系电话</Label>
                      <Input id="emergencyPhone" value={profile.emergencyPhone} onChange={(e) => setProfile({ ...profile, emergencyPhone: e.target.value })} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowEditProfile(false)}>取消</Button>
                    <Button onClick={handleSaveProfile}>保存</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">姓名</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{profile.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Briefcase className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">工号</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{profile.employeeId}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Building className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">部门</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{profile.department}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Award className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">职位</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{profile.position}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                  <Mail className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">工作邮箱</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{profile.workEmail}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                  <Phone className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">手机号码</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{profile.phone}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">入职日期</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{profile.joinDate}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                  <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">工作地点</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{profile.location}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">学历</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{profile.education}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 请假余额 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(leaveBalance).map(([key, balance]) => (
            <Card key={key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {key === 'annual' && '年假'}
                  {key === 'sick' && '病假'}
                  {key === 'personal' && '事假'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">总额</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{balance.total}天</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">已用</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{balance.used}天</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">剩余</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{balance.remaining}天</span>
                  </div>
                  <div className="pt-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          (balance.used / balance.total) > 0.8
                            ? 'bg-red-500'
                            : (balance.used / balance.total) > 0.5
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${(balance.used / balance.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 功能Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              个人信息
            </TabsTrigger>
            <TabsTrigger value="leave" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              请假申请
            </TabsTrigger>
            <TabsTrigger value="expense" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              报销管理
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              我的培训
            </TabsTrigger>
            <TabsTrigger value="payroll" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              工资条
            </TabsTrigger>
          </TabsList>

          {/* 请假申请 */}
          <TabsContent value="leave" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>请假记录</CardTitle>
                    <CardDescription>查看和管理您的请假申请</CardDescription>
                  </div>
                  <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        新建请假
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>新建请假申请</DialogTitle>
                        <DialogDescription>填写请假信息并提交审批</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="leaveType">请假类型</Label>
                          <Select value={leaveFormData.type} onValueChange={(v) => setLeaveFormData({ ...leaveFormData, type: v })}>
                            <SelectTrigger id="leaveType">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="年假">年假</SelectItem>
                              <SelectItem value="病假">病假</SelectItem>
                              <SelectItem value="事假">事假</SelectItem>
                              <SelectItem value="调休">调休</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="startDate">开始日期</Label>
                            <Input
                              id="startDate"
                              type="date"
                              value={leaveFormData.startDate}
                              onChange={(e) => setLeaveFormData({ ...leaveFormData, startDate: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="endDate">结束日期</Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={leaveFormData.endDate}
                              onChange={(e) => setLeaveFormData({ ...leaveFormData, endDate: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reason">请假原因</Label>
                          <Textarea
                            id="reason"
                            value={leaveFormData.reason}
                            onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
                            placeholder="请说明请假原因..."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowLeaveDialog(false)}>取消</Button>
                        <Button onClick={handleSubmitLeave}>提交申请</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaveRequests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{request.type}</h3>
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">开始日期：</span>
                              <span className="text-gray-900 dark:text-white">{request.startDate}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">结束日期：</span>
                              <span className="text-gray-900 dark:text-white">{request.endDate}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">天数：</span>
                              <span className="text-gray-900 dark:text-white">{request.days}天</span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">申请时间：</span>
                              <span className="text-gray-900 dark:text-white">{request.applyDate}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{request.reason}</p>
                          {request.comment && (
                            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-sm text-blue-800 dark:text-blue-200">
                              审批意见：{request.comment}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 报销管理 */}
          <TabsContent value="expense" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>报销记录</CardTitle>
                    <CardDescription>查看和管理您的费用报销申请</CardDescription>
                  </div>
                  <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        新建报销
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>新建报销申请</DialogTitle>
                        <DialogDescription>填写报销信息并提交审批</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="expenseType">报销类型</Label>
                          <Select value={expenseFormData.type} onValueChange={(v) => setExpenseFormData({ ...expenseFormData, type: v })}>
                            <SelectTrigger id="expenseType">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="差旅费">差旅费</SelectItem>
                              <SelectItem value="餐饮费">餐饮费</SelectItem>
                              <SelectItem value="交通费">交通费</SelectItem>
                              <SelectItem value="办公费">办公费</SelectItem>
                              <SelectItem value="其他">其他</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="amount">金额</Label>
                            <Input
                              id="amount"
                              type="number"
                              value={expenseFormData.amount}
                              onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                              placeholder="0.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="expenseDate">日期</Label>
                            <Input
                              id="expenseDate"
                              type="date"
                              value={expenseFormData.date}
                              onChange={(e) => setExpenseFormData({ ...expenseFormData, date: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">费用说明</Label>
                          <Textarea
                            id="description"
                            value={expenseFormData.description}
                            onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
                            placeholder="请说明费用详情..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="receipts">上传凭证</Label>
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">拖拽文件到此处或点击上传</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">支持 JPG、PNG、PDF 格式</p>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowExpenseDialog(false)}>取消</Button>
                        <Button onClick={handleSubmitExpense}>提交申请</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenseClaims.map((claim) => (
                    <div key={claim.id} className="p-4 border rounded-lg dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{claim.type}</h3>
                            {getStatusBadge(claim.status)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">金额：</span>
                              <span className="font-semibold text-gray-900 dark:text-white">¥{claim.amount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">日期：</span>
                              <span className="text-gray-900 dark:text-white">{claim.date}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">申请时间：</span>
                              <span className="text-gray-900 dark:text-white">{claim.applyDate}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">凭证：</span>
                              <span className="text-gray-900 dark:text-white">{claim.receipts.length}个文件</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{claim.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 我的培训 */}
          <TabsContent value="training" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>我的培训</CardTitle>
                <CardDescription>查看您的培训课程和学习进度</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trainingCourses.map((course) => (
                    <Card key={course.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <Badge variant="outline">{course.category}</Badge>
                          {getStatusBadge(course.status)}
                        </div>
                        <CardTitle className="text-base">{course.title}</CardTitle>
                        <CardDescription>
                          讲师：{course.instructor} · {course.duration}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600 dark:text-gray-400">学习进度</span>
                              <span className="font-medium text-gray-900 dark:text-white">{course.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="h-4 w-4 mr-1" />
                            截止日期：{course.dueDate}
                          </div>
                          <Button className="w-full" variant={course.status === 'completed' ? 'outline' : 'default'}>
                            {course.status === 'completed' ? '查看证书' : course.status === 'in-progress' ? '继续学习' : '开始学习'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 工资条 */}
          <TabsContent value="payroll" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>工资条</CardTitle>
                <CardDescription>查看您的工资明细</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payrollRecords.map((record) => (
                    <div key={record.id} className="p-4 border rounded-lg dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg">
                            <DollarSign className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{record.period}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">发放日期：{record.payDate}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            ¥{record.netSalary.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">实发工资</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t dark:border-gray-700 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">基本工资</span>
                          <span className="text-gray-900 dark:text-white">¥{record.basicSalary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">绩效奖金</span>
                          <span className="text-green-600 dark:text-green-400">+¥{record.performanceBonus.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">补贴</span>
                          <span className="text-green-600 dark:text-green-400">+¥{record.subsidy.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">扣除</span>
                          <span className="text-red-600 dark:text-red-400">-¥{record.deduction.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">个税</span>
                          <span className="text-red-600 dark:text-red-400">-¥{record.tax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between md:col-span-1 lg:col-span-1">
                          <Button size="sm" variant="outline" className="w-full">
                            <Download className="h-4 w-4 mr-2" />
                            下载明细
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
