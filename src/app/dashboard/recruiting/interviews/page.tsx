'use client';

import { useState, useEffect } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Calendar,
  Clock,
  Plus,
  Video,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Sparkles,
} from 'lucide-react';

interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobId: string;
  jobTitle: string;
  interviewType: 'phone' | 'video' | 'onsite';
  interviewerId: string;
  interviewerName: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  location?: string;
  meetingLink?: string;
  notes?: string;
  feedback?: string;
  score?: number;
}

export default function InterviewManagement() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | Interview['status']>('all');

  // 对话框状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    candidateId: '',
    jobId: '',
    interviewType: 'video' as Interview['interviewType'],
    interviewerId: '',
    date: '',
    time: '',
    duration: 60,
    location: '',
    meetingLink: '',
    notes: '',
  });

  // 反馈表单状态
  const [feedbackData, setFeedbackData] = useState({
    feedback: '',
    score: '',
  });

  // 获取面试列表
  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/interviews?companyId=demo-company');
      const data = await response.json();
      if (data.success) {
        setInterviews(data.data || []);
      }
    } catch (error) {
      console.error('获取面试列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 创建面试安排
  const createInterview = async () => {
    try {
      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          companyId: 'demo-company',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setDialogOpen(false);
        resetForm();
        fetchInterviews();
      }
    } catch (error) {
      console.error('创建面试失败:', error);
    }
  };

  // 提交面试反馈
  const submitFeedback = async () => {
    if (!selectedInterview) return;

    try {
      const response = await fetch(`/api/interviews/${selectedInterview.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: feedbackData.feedback,
          score: Number(feedbackData.score),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setFeedbackDialogOpen(false);
        fetchInterviews();
      }
    } catch (error) {
      console.error('提交反馈失败:', error);
    }
  };

  // 取消面试
  const cancelInterview = async (id: string) => {
    if (!confirm('确定要取消这个面试吗？')) return;

    try {
      const response = await fetch(`/api/interviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      const data = await response.json();
      if (data.success) {
        fetchInterviews();
      }
    } catch (error) {
      console.error('取消面试失败:', error);
    }
  };

  // 标记为已完成
  const markCompleted = async (id: string) => {
    try {
      const response = await fetch(`/api/interviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      const data = await response.json();
      if (data.success) {
        fetchInterviews();
      }
    } catch (error) {
      console.error('更新面试状态失败:', error);
    }
  };

  // 打开反馈对话框
  const openFeedbackDialog = (interview: Interview) => {
    setSelectedInterview(interview);
    setFeedbackData({
      feedback: interview.feedback || '',
      score: interview.score?.toString() || '',
    });
    setFeedbackDialogOpen(true);
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      candidateId: '',
      jobId: '',
      interviewType: 'video',
      interviewerId: '',
      date: '',
      time: '',
      duration: 60,
      location: '',
      meetingLink: '',
      notes: '',
    });
  };

  // 获取状态徽章
  const getStatusBadge = (status: Interview['status']) => {
    const variants: Record<string, any> = {
      scheduled: 'default',
      completed: 'default',
      cancelled: 'secondary',
      'no-show': 'destructive',
    };
    const labels: Record<string, string> = {
      scheduled: '已安排',
      completed: '已完成',
      cancelled: '已取消',
      'no-show': '未到',
    };
    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  // 获取面试类型图标
  const getInterviewTypeIcon = (type: Interview['interviewType']) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'phone':
        return <Video className="h-4 w-4" />;
      case 'onsite':
        return <MapPin className="h-4 w-4" />;
    }
  };

  // 过滤面试
  const filteredInterviews = interviews.filter(interview => {
    return statusFilter === 'all' || interview.status === statusFilter;
  });

  useEffect(() => {
    fetchInterviews();
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">面试安排</h1>
          <p className="text-muted-foreground mt-1">
            安排和管理面试日程
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              安排面试
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>安排面试</DialogTitle>
              <DialogDescription>
                为候选人安排面试时间和方式
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="candidate">候选人 *</Label>
                  <Select
                    value={formData.candidateId}
                    onValueChange={(value) => setFormData({ ...formData, candidateId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择候选人" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* 这里应该从API获取候选人列表 */}
                      <SelectItem value="candidate-1">张三</SelectItem>
                      <SelectItem value="candidate-2">李四</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="job">应聘职位 *</Label>
                  <Select
                    value={formData.jobId}
                    onValueChange={(value) => setFormData({ ...formData, jobId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择职位" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="job-1">高级前端工程师</SelectItem>
                      <SelectItem value="job-2">产品经理</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="interviewType">面试方式 *</Label>
                  <Select
                    value={formData.interviewType}
                    onValueChange={(value: Interview['interviewType']) => setFormData({ ...formData, interviewType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">视频面试</SelectItem>
                      <SelectItem value="phone">电话面试</SelectItem>
                      <SelectItem value="onsite">现场面试</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="interviewer">面试官 *</Label>
                  <Select
                    value={formData.interviewerId}
                    onValueChange={(value) => setFormData({ ...formData, interviewerId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择面试官" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interviewer-1">王经理</SelectItem>
                      <SelectItem value="interviewer-2">李主管</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date">日期 *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="time">时间 *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">时长（分钟） *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  />
                </div>
              </div>

              {formData.interviewType === 'onsite' && (
                <div>
                  <Label htmlFor="location">地点 *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="例如：广州市天河区xxx大厦3楼会议室A"
                  />
                </div>
              )}

              {formData.interviewType === 'video' && (
                <div>
                  <Label htmlFor="meetingLink">会议链接</Label>
                  <Input
                    id="meetingLink"
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                    placeholder="例如：https://zoom.us/j/123456789"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="notes">备注</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={createInterview}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                安排
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总面试数</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviews.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已安排</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {interviews.filter(i => i.status === 'scheduled').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已完成</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {interviews.filter(i => i.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">未到/取消</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {interviews.filter(i => i.status === 'cancelled' || i.status === 'no-show').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 面试列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>面试列表</CardTitle>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="scheduled">已安排</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
                <SelectItem value="no-show">未到</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>候选人</TableHead>
                <TableHead>应聘职位</TableHead>
                <TableHead>面试官</TableHead>
                <TableHead>时间</TableHead>
                <TableHead>方式</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>评分</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : filteredInterviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    暂无面试安排
                  </TableCell>
                </TableRow>
              ) : (
                filteredInterviews.map((interview) => (
                  <TableRow key={interview.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarFallback>{interview.candidateName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{interview.candidateName}</div>
                          <div className="text-xs text-gray-500">{interview.candidateEmail}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{interview.jobTitle}</TableCell>
                    <TableCell>{interview.interviewerName}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(interview.date).toLocaleDateString()}</div>
                        <div className="text-gray-500">{interview.time} ({interview.duration}分钟)</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getInterviewTypeIcon(interview.interviewType)}
                        <span className="ml-1 text-sm capitalize">
                          {interview.interviewType === 'video' ? '视频' : interview.interviewType === 'phone' ? '电话' : '现场'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(interview.status)}</TableCell>
                    <TableCell>
                      {interview.score !== undefined ? (
                        <Badge variant={interview.score >= 80 ? 'default' : interview.score >= 60 ? 'secondary' : 'outline'}>
                          {interview.score}分
                        </Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {interview.status === 'scheduled' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markCompleted(interview.id)}
                            >
                              完成
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => cancelInterview(interview.id)}
                            >
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                        {interview.status === 'completed' && !interview.feedback && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openFeedbackDialog(interview)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            填写反馈
                          </Button>
                        )}
                        {interview.feedback && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openFeedbackDialog(interview)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 反馈对话框 */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>面试反馈</DialogTitle>
            <DialogDescription>
              填写面试评价和评分
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="feedback">评价 *</Label>
              <Textarea
                id="feedback"
                value={feedbackData.feedback}
                onChange={(e) => setFeedbackData({ ...feedbackData, feedback: e.target.value })}
                placeholder="请详细描述面试表现、优缺点、建议等"
                rows={5}
              />
            </div>
            <div>
              <Label htmlFor="score">评分 (0-100) *</Label>
              <Input
                id="score"
                type="number"
                min={0}
                max={100}
                value={feedbackData.score}
                onChange={(e) => setFeedbackData({ ...feedbackData, score: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={submitFeedback}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              提交反馈
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
