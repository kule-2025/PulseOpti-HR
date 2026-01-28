'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/layout/page-header';
import {
  MessageSquare,
  Heart,
  Gift,
  Calendar,
  TrendingUp,
  Star,
  Smile,
  Phone,
  Mail,
  Coffee,
  Cake,
  Baby,
  Home,
  Award,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  BarChart3,
} from 'lucide-react';

// 关怀记录数据
const careRecordsData = [
  {
    id: 1,
    employee: '张三',
    department: '研发部',
    type: '生日关怀',
    content: '员工生日，送上生日蛋糕和祝福',
    date: '2024-03-15',
    status: '已完成',
    careBy: 'HR-李',
  },
  {
    id: 2,
    employee: '李四',
    department: '市场部',
    type: '生病慰问',
    content: '员工感冒发烧，上门慰问并送上药品',
    date: '2024-03-10',
    status: '已完成',
    careBy: 'HR-王',
  },
  {
    id: 3,
    employee: '王五',
    department: '产品部',
    type: '新员工欢迎',
    content: '新员工入职，组织欢迎会和入职礼包',
    date: '2024-03-08',
    status: '已完成',
    careBy: 'HR-李',
  },
];

// 员工反馈数据
const feedbackData = [
  {
    id: 1,
    employee: '赵六',
    department: '销售部',
    type: '建议',
    content: '建议增加团建活动频率，提升团队凝聚力',
    date: '2024-03-14',
    status: '待处理',
    priority: 'medium',
  },
  {
    id: 2,
    employee: '钱七',
    department: '运营部',
    type: '投诉',
    content: '食堂饭菜质量有待提升，希望增加菜品种类',
    date: '2024-03-12',
    status: '处理中',
    priority: 'high',
  },
  {
    id: 3,
    employee: '孙八',
    department: '研发部',
    type: '表扬',
    content: '感谢HR部门的快速响应，帮助解决了入职手续问题',
    date: '2024-03-10',
    status: '已处理',
    priority: 'low',
  },
];

// 满意度调查数据
const surveyData = [
  {
    id: 1,
    title: '2024年第一季度员工满意度调查',
    startDate: '2024-03-01',
    endDate: '2024-03-15',
    totalParticipants: 485,
    completedParticipants: 412,
    status: '进行中',
    averageScore: 4.2,
    questions: 20,
  },
  {
    id: 2,
    title: '员工福利满意度专项调查',
    startDate: '2024-02-01',
    endDate: '2024-02-15',
    totalParticipants: 485,
    completedParticipants: 456,
    status: '已完成',
    averageScore: 3.9,
    questions: 15,
  },
];

// 满意度概览
const satisfactionStats = {
  overall: 4.2,
  trend: 'up',
  dimensions: [
    { name: '工作环境', score: 4.3, change: '+0.2' },
    { name: '薪酬福利', score: 3.8, change: '-0.1' },
    { name: '职业发展', score: 4.1, change: '+0.1' },
    { name: '团队氛围', score: 4.5, change: '+0.3' },
    { name: '领导管理', score: 4.0, change: '0.0' },
  ],
};

// 关怀日历事件
const careCalendarEvents = [
  { date: '2024-03-20', type: '生日', employee: '张三', department: '研发部' },
  { date: '2024-03-22', type: '生日', employee: '李四', department: '市场部' },
  { date: '2024-03-25', type: '入职周年', employee: '王五', department: '产品部', years: 3 },
  { date: '2024-03-28', type: '生日', employee: '赵六', department: '销售部' },
];

export default function EmployeeCarePage() {
  const [activeTab, setActiveTab] = useState('records');
  const [showAddCareDialog, setShowAddCareDialog] = useState(false);
  const [showAddFeedbackDialog, setShowAddFeedbackDialog] = useState(false);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <PageHeader
        icon={Heart}
        title="员工关怀"
        description="关怀记录、员工反馈、满意度调查"
        breadcrumbs={[
          { name: 'HRBP中心', href: '/hrbp' },
          { name: '员工关怀', href: '/employee-care' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出报告
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="h-4 w-4 mr-2" />
              发起关怀
            </Button>
          </div>
        }
      />

      {/* 满意度概览卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Smile className="h-5 w-5 text-purple-600" />
                  员工满意度概览
                </CardTitle>
                <CardDescription className="mt-1">
                  基于最新满意度调查结果
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                {satisfactionStats.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingUp className="h-3 w-3 mr-1 text-red-600 rotate-180" />
                )}
                较上期 +5%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-1">
                  {satisfactionStats.overall}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  综合评分
                </div>
              </div>
              {satisfactionStats.dimensions.map((dimension, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {dimension.score}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {dimension.name}
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      dimension.change.startsWith('+')
                        ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                        : dimension.change.startsWith('-')
                        ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                        : ''
                    }
                  >
                    {dimension.change}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              关怀日历
            </CardTitle>
            <CardDescription>
              近期关怀事件提醒
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {careCalendarEvents.map((event, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className={`p-2 rounded-lg ${
                    event.type === '生日'
                      ? 'bg-pink-100 dark:bg-pink-950'
                      : 'bg-purple-100 dark:bg-purple-950'
                  }`}>
                    {event.type === '生日' ? (
                      <Cake className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                    ) : (
                      <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {event.type}: {event.employee}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {event.department} · {event.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-3">
              查看完整日历
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="records">关怀记录</TabsTrigger>
          <TabsTrigger value="feedback">员工反馈</TabsTrigger>
          <TabsTrigger value="survey">满意度调查</TabsTrigger>
        </TabsList>

        {/* 关怀记录 */}
        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>关怀记录</CardTitle>
                  <CardDescription>
                    记录和跟踪员工关怀活动
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="搜索员工..." className="pl-10 w-64" />
                  </div>
                  <Dialog open={showAddCareDialog} onOpenChange={setShowAddCareDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        <Plus className="h-4 w-4 mr-2" />
                        添加关怀
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>添加关怀记录</DialogTitle>
                        <DialogDescription>
                          记录对员工的关怀活动
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>员工</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="选择员工" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">张三 - 研发部</SelectItem>
                              <SelectItem value="2">李四 - 市场部</SelectItem>
                              <SelectItem value="3">王五 - 产品部</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>关怀类型</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="选择类型" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="birthday">生日关怀</SelectItem>
                              <SelectItem value="sick">生病慰问</SelectItem>
                              <SelectItem value="welcome">新员工欢迎</SelectItem>
                              <SelectItem value="anniversary">入职周年</SelectItem>
                              <SelectItem value="family">家庭关怀</SelectItem>
                              <SelectItem value="other">其他</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>关怀内容</Label>
                          <Textarea placeholder="描述关怀活动的具体内容..." />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAddCareDialog(false)}>
                          取消
                        </Button>
                        <Button
                          onClick={() => setShowAddCareDialog(false)}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          保存
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {careRecordsData.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                        {record.employee.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {record.employee}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {record.department} · {record.type}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {record.content}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {record.date}
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {record.status}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 员工反馈 */}
        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>员工反馈</CardTitle>
                  <CardDescription>
                    收集和处理员工的意见建议
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="搜索反馈..." className="pl-10 w-64" />
                  </div>
                  <Dialog open={showAddFeedbackDialog} onOpenChange={setShowAddFeedbackDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        <Plus className="h-4 w-4 mr-2" />
                        添加反馈
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>添加员工反馈</DialogTitle>
                        <DialogDescription>
                          记录员工的意见建议
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>员工</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="选择员工" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">张三 - 研发部</SelectItem>
                              <SelectItem value="2">李四 - 市场部</SelectItem>
                              <SelectItem value="3">王五 - 产品部</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>反馈类型</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="选择类型" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="suggestion">建议</SelectItem>
                              <SelectItem value="complaint">投诉</SelectItem>
                              <SelectItem value="praise">表扬</SelectItem>
                              <SelectItem value="question">疑问</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>优先级</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="选择优先级" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">低</SelectItem>
                              <SelectItem value="medium">中</SelectItem>
                              <SelectItem value="high">高</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>反馈内容</Label>
                          <Textarea placeholder="描述员工反馈的详细内容..." />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAddFeedbackDialog(false)}>
                          取消
                        </Button>
                        <Button
                          onClick={() => setShowAddFeedbackDialog(false)}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          保存
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {feedbackData.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold ${
                        feedback.type === '建议'
                          ? 'bg-blue-600'
                          : feedback.type === '投诉'
                          ? 'bg-red-600'
                          : 'bg-green-600'
                      }`}>
                        {feedback.employee.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {feedback.employee}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {feedback.department} · {feedback.type}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {feedback.content}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {feedback.date}
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            feedback.priority === 'high'
                              ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                              : feedback.priority === 'medium'
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400'
                              : 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                          }
                        >
                          {feedback.priority === 'high' && <AlertCircle className="h-3 w-3 mr-1" />}
                          {feedback.priority === 'medium' && <Clock className="h-3 w-3 mr-1" />}
                          {feedback.priority} · {feedback.status}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 满意度调查 */}
        <TabsContent value="survey" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {surveyData.map((survey) => (
              <Card key={survey.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      className={
                        survey.status === '进行中'
                          ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }
                    >
                      {survey.status}
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-2">{survey.title}</CardTitle>
                  <CardDescription>
                    {survey.startDate} 至 {survey.endDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          参与人数
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {survey.completedParticipants} / {survey.totalParticipants}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          平均得分
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {survey.averageScore}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">完成率</span>
                        <span className="font-medium">
                          {((survey.completedParticipants / survey.totalParticipants) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${(survey.completedParticipants / survey.totalParticipants) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      查看详细报告
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>创建满意度调查</CardTitle>
              <CardDescription>
                发起新的员工满意度调查
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-300">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-3">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-base">综合满意度</CardTitle>
                    <CardDescription className="text-sm">
                      包含工作环境、薪酬福利、职业发展等多个维度
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-300">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mb-3">
                      <Coffee className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-base">专项调研</CardTitle>
                    <CardDescription className="text-sm">
                      针对特定主题（如福利、团建）的专项调查
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-300">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center mb-3">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-base">快速问卷</CardTitle>
                    <CardDescription className="text-sm">
                      简单快速的问卷，收集员工即时反馈
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
