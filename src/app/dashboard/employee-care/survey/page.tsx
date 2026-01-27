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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ClipboardList,
  Plus,
  Search,
  Calendar,
  Users,
  BarChart3,
  Clock,
  CheckCircle,
  FileText,
  Eye,
  Edit,
  Trash2,
  Send,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

type SurveyStatus = 'draft' | 'published' | 'closed' | 'archived';
type SurveyType = 'satisfaction' | 'engagement' | 'pulse' | 'custom';

interface SurveyQuestion {
  id: string;
  type: 'text' | 'multiple' | 'single' | 'rating';
  question: string;
  options?: string[];
  required: boolean;
}

interface Survey {
  id: string;
  title: string;
  description: string;
  type: SurveyType;
  status: SurveyStatus;
  startDate: string;
  endDate: string;
  targetAudience: string[];
  questions: SurveyQuestion[];
  responseCount: number;
  targetCount: number;
  anonymous: boolean;
  createdBy: string;
  createdAt: string;
}

export default function EmployeeSurveyPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateSurvey, setShowCreateSurvey] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [newSurvey, setNewSurvey] = useState({
    title: '',
    description: '',
    type: 'satisfaction' as SurveyType,
    startDate: '',
    endDate: '',
    targetAudience: '',
    anonymous: false,
    questions: [
      {
        id: '1',
        type: 'rating',
        question: '您对当前工作的满意度如何？',
        required: true,
      },
    ],
  });

  useEffect(() => {
    // 模拟获取员工调查数据
    setTimeout(() => {
      setSurveys([
        {
          id: '1',
          title: '2024年度员工满意度调查',
          description: '了解员工对工作环境、薪酬福利、职业发展等方面的满意度',
          type: 'satisfaction',
          status: 'published',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          targetAudience: ['全体员工'],
          questions: [
            {
              id: '1',
              type: 'rating',
              question: '您对当前工作的满意度如何？',
              required: true,
            },
            {
              id: '2',
              type: 'multiple',
              question: '您认为公司最需要改进的方面是什么？',
              options: ['薪酬福利', '职业发展', '工作环境', '管理方式', '企业文化'],
              required: false,
            },
          ],
          responseCount: 85,
          targetCount: 100,
          anonymous: true,
          createdBy: 'HR Director',
          createdAt: '2024-01-01T09:00:00',
        },
        {
          id: '2',
          title: '员工敬业度评估',
          description: '评估员工对工作的投入程度和归属感',
          type: 'engagement',
          status: 'closed',
          startDate: '2023-12-01',
          endDate: '2023-12-31',
          targetAudience: ['全体员工'],
          questions: [
            {
              id: '1',
              type: 'rating',
              question: '您是否推荐朋友来公司工作？',
              required: true,
            },
          ],
          responseCount: 92,
          targetCount: 100,
          anonymous: true,
          createdBy: 'HR Director',
          createdAt: '2023-12-01T10:00:00',
        },
        {
          id: '3',
          title: '技术团队培训需求调研',
          description: '了解技术团队的培训需求，制定下一季度培训计划',
          type: 'custom',
          status: 'draft',
          startDate: '2024-02-01',
          endDate: '2024-02-15',
          targetAudience: ['技术部', '产品部'],
          questions: [
            {
              id: '1',
              type: 'multiple',
              question: '您希望参加哪些技术培训？',
              options: ['AI/机器学习', '云计算', '微服务架构', 'DevOps', '前端框架'],
              required: true,
            },
          ],
          responseCount: 0,
          targetCount: 20,
          anonymous: false,
          createdBy: 'HR BP',
          createdAt: '2024-01-25T14:30:00',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateSurvey = () => {
    const survey: Survey = {
      id: Date.now().toString(),
      title: newSurvey.title,
      description: newSurvey.description,
      type: newSurvey.type,
      status: 'draft',
      startDate: newSurvey.startDate,
      endDate: newSurvey.endDate,
      targetAudience: newSurvey.targetAudience.split(',').map((s) => s.trim()),
      questions: newSurvey.questions,
      responseCount: 0,
      targetCount: 0,
      anonymous: newSurvey.anonymous,
      createdBy: '当前用户',
      createdAt: new Date().toISOString(),
    };
    setSurveys([survey, ...surveys]);
    setShowCreateSurvey(false);
    toast.success('调查已创建');
    setNewSurvey({
      title: '',
      description: '',
      type: 'satisfaction',
      startDate: '',
      endDate: '',
      targetAudience: '',
      anonymous: false,
      questions: [
        {
          id: '1',
          type: 'rating',
          question: '您对当前工作的满意度如何？',
          required: true,
        },
      ],
    });
  };

  const filteredSurveys = surveys.filter((survey) => {
    const matchesSearch =
      survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || survey.status === statusFilter;
    const matchesType = typeFilter === 'all' || survey.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const typeConfig: Record<SurveyType, { label: string; color: string; icon: any }> = {
    satisfaction: { label: '满意度', color: 'bg-green-500', icon: BarChart3 },
    engagement: { label: '敬业度', color: 'bg-blue-500', icon: Users },
    pulse: { label: '脉搏调查', color: 'bg-purple-500', icon: Clock },
    custom: { label: '自定义', color: 'bg-gray-500', icon: FileText },
  };

  const statusConfig: Record<SurveyStatus, { label: string; color: string; icon: any }> = {
    draft: { label: '草稿', color: 'bg-gray-500', icon: FileText },
    published: { label: '进行中', color: 'bg-blue-500', icon: Send },
    closed: { label: '已结束', color: 'bg-green-500', icon: CheckCircle },
    archived: { label: '已归档', color: 'bg-gray-400', icon: FileText },
  };

  const statistics = {
    total: surveys.length,
    published: surveys.filter((s) => s.status === 'published').length,
    closed: surveys.filter((s) => s.status === 'closed').length,
    totalResponses: surveys.reduce((sum, s) => sum + s.responseCount, 0),
  };

  const addQuestion = () => {
    setNewSurvey({
      ...newSurvey,
      questions: [
        ...newSurvey.questions,
        {
          id: Date.now().toString(),
          type: 'text',
          question: '',
          required: false,
        },
      ],
    });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...newSurvey.questions];
    updated[index] = { ...updated[index], [field]: value };
    setNewSurvey({ ...newSurvey, questions: updated });
  };

  const removeQuestion = (index: number) => {
    const updated = newSurvey.questions.filter((_, i) => i !== index);
    setNewSurvey({ ...newSurvey, questions: updated });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ClipboardList className="h-8 w-8 text-blue-600" />
              员工调查
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              创建和管理员工满意度、敬业度等调查
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.info('导出中...')}>
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
            <Button onClick={() => setShowCreateSurvey(true)}>
              <Plus className="h-4 w-4 mr-2" />
              创建调查
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">总调查数</p>
                  <p className="text-2xl font-bold">{statistics.total}</p>
                </div>
                <ClipboardList className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">进行中</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.published}</p>
                </div>
                <Send className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">已结束</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.closed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">总回收数</p>
                  <p className="text-2xl font-bold">{statistics.totalResponses}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
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
                  placeholder="搜索调查标题或描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {Object.entries(typeConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  {Object.entries(statusConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 调查列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 flex items-center justify-center h-64">
              <div className="text-gray-600 dark:text-gray-400">加载中...</div>
            </div>
          ) : filteredSurveys.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">暂无调查</p>
              <Button className="mt-4" onClick={() => setShowCreateSurvey(true)}>
                <Plus className="h-4 w-4 mr-2" />
                创建调查
              </Button>
            </div>
          ) : (
            filteredSurveys.map((survey) => {
              const typeIcon = typeConfig[survey.type].icon;
              const TypeIcon = typeIcon;
              const statusIcon = statusConfig[survey.status].icon;
              const StatusIcon = statusIcon;
              const responseRate =
                survey.targetCount > 0 ? (survey.responseCount / survey.targetCount) * 100 : 0;
              return (
                <Card key={survey.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{survey.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Badge className={`${typeConfig[survey.type].color} text-white border-0 flex items-center gap-1`}>
                            <TypeIcon className="h-3 w-3" />
                            {typeConfig[survey.type].label}
                          </Badge>
                          <Badge className={statusConfig[survey.status].color + ' text-white border-0 flex items-center gap-1'}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig[survey.status].label}
                          </Badge>
                          {survey.anonymous && (
                            <Badge variant="outline" className="text-xs">
                              匿名
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {survey.description}
                      </p>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">开始时间</p>
                            <p className="font-medium">{survey.startDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">结束时间</p>
                            <p className="font-medium">{survey.endDate}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">回收情况</span>
                          <span>
                            {survey.responseCount}/{survey.targetCount}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-blue-500 transition-all"
                            style={{ width: `${responseRate}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          回收率：{responseRate.toFixed(1)}%
                        </p>
                      </div>

                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">目标人群：</span>
                        {survey.targetAudience.join(', ')}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          查看详情
                        </Button>
                        {survey.status === 'draft' && (
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-4 w-4 mr-1" />
                            编辑
                          </Button>
                        )}
                        {survey.status === 'published' && (
                          <Button variant="outline" size="sm" className="flex-1">
                            <BarChart3 className="h-4 w-4 mr-1" />
                            查看结果
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* 创建调查弹窗 */}
      <Dialog open={showCreateSurvey} onOpenChange={setShowCreateSurvey}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>创建员工调查</DialogTitle>
            <DialogDescription>
              创建新的员工满意度或敬业度调查
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">基本信息</TabsTrigger>
              <TabsTrigger value="questions">调查问题</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>调查标题 *</Label>
                <Input
                  placeholder="输入调查标题"
                  value={newSurvey.title}
                  onChange={(e) => setNewSurvey({ ...newSurvey, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>调查描述</Label>
                <textarea
                  className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                  placeholder="输入调查描述..."
                  value={newSurvey.description}
                  onChange={(e) => setNewSurvey({ ...newSurvey, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>调查类型 *</Label>
                  <Select
                    value={newSurvey.type}
                    onValueChange={(v) => setNewSurvey({ ...newSurvey, type: v as SurveyType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeConfig).map(([value, config]) => (
                        <SelectItem key={value} value={value}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>目标人群</Label>
                  <Input
                    placeholder="用逗号分隔，如：技术部,产品部"
                    value={newSurvey.targetAudience}
                    onChange={(e) => setNewSurvey({ ...newSurvey, targetAudience: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>开始日期 *</Label>
                  <Input
                    type="date"
                    value={newSurvey.startDate}
                    onChange={(e) => setNewSurvey({ ...newSurvey, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>结束日期 *</Label>
                  <Input
                    type="date"
                    value={newSurvey.endDate}
                    onChange={(e) => setNewSurvey({ ...newSurvey, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={newSurvey.anonymous}
                  onChange={(e) => setNewSurvey({ ...newSurvey, anonymous: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="anonymous" className="cursor-pointer">
                  匿名调查
                </Label>
              </div>
            </TabsContent>

            <TabsContent value="questions" className="space-y-4 mt-4">
              <div className="space-y-3">
                {newSurvey.questions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">问题 {index + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>问题内容 *</Label>
                      <textarea
                        className="w-full min-h-[60px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                        placeholder="输入问题内容"
                        value={question.question}
                        onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>问题类型</Label>
                        <Select
                          value={question.type}
                          onValueChange={(v) => updateQuestion(index, 'type', v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">文本</SelectItem>
                            <SelectItem value="multiple">多选</SelectItem>
                            <SelectItem value="single">单选</SelectItem>
                            <SelectItem value="rating">评分</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <input
                          type="checkbox"
                          id={`required-${index}`}
                          checked={question.required}
                          onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <Label htmlFor={`required-${index}`} className="cursor-pointer">
                          必填
                        </Label>
                      </div>
                    </div>

                    {(question.type === 'multiple' || question.type === 'single') && (
                      <div className="space-y-2">
                        <Label>选项（每行一个）</Label>
                        <textarea
                          className="w-full min-h-[60px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                          placeholder="输入选项..."
                          value={question.options?.join('\n') || ''}
                          onChange={(e) =>
                            updateQuestion(index, 'options', e.target.value.split('\n'))
                          }
                        />
                      </div>
                    )}
                  </div>
                ))}

                <Button variant="outline" onClick={addQuestion} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  添加问题
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateSurvey(false)}>
              取消
            </Button>
            <Button onClick={handleCreateSurvey}>
              <Plus className="h-4 w-4 mr-2" />
              创建调查
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
