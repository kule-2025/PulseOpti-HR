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
import {
  MessageSquare,
  Plus,
  Search,
  ThumbsUp,
  ThumbsDown,
  Star,
  Clock,
  CheckCircle,
  User,
  Building,
  Eye,
  Reply,
  Send,
  Edit,
} from 'lucide-react';
import { toast } from 'sonner';

type FeedbackType = 'suggestion' | 'complaint' | 'praise' | 'question' | 'other';
type FeedbackStatus = 'pending' | 'reviewed' | 'replied' | 'closed';

interface Feedback {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  type: FeedbackType;
  status: FeedbackStatus;
  title: string;
  content: string;
  rating?: number;
  attachments?: string[];
  reply?: string;
  replyTime?: string;
  replyBy?: string;
  createdAt: string;
  isAnonymous: boolean;
}

export default function EmployeeFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    // 模拟获取员工反馈数据
    setTimeout(() => {
      setFeedbacks([
        {
          id: '1',
          employeeId: 'E001',
          employeeName: '张三',
          department: '技术部',
          position: '高级前端工程师',
          type: 'suggestion',
          status: 'replied',
          title: '建议增加技术培训机会',
          content: '希望公司能提供更多技术培训机会，特别是新技术方向的培训，帮助员工提升技术能力。',
          rating: 4,
          reply: '感谢您的建议！我们会在下季度增加新技术培训预算，重点关注AI、云计算等方向。',
          replyTime: '2024-01-18T10:00:00',
          replyBy: 'HR Director',
          createdAt: '2024-01-15T14:30:00',
          isAnonymous: false,
        },
        {
          id: '2',
          employeeId: 'E002',
          employeeName: '李四',
          department: '产品部',
          position: '产品经理',
          type: 'complaint',
          status: 'pending',
          title: '办公设备问题',
          content: '公司配发的办公电脑性能不足，严重影响工作效率，希望能更换配置更高的设备。',
          rating: 2,
          createdAt: '2024-01-20T09:15:00',
          isAnonymous: false,
        },
        {
          id: '3',
          employeeId: 'E003',
          employeeName: '王五',
          department: '销售部',
          position: '销售代表',
          type: 'praise',
          status: 'reviewed',
          title: '感谢HR团队的帮助',
          content: '非常感谢HR团队在我入职期间的帮助，让我快速融入了团队，感受到了公司的温暖。',
          rating: 5,
          createdAt: '2024-01-22T16:45:00',
          isAnonymous: false,
        },
        {
          id: '4',
          employeeId: 'E004',
          employeeName: '赵六',
          department: '运营部',
          position: '运营专员',
          type: 'question',
          status: 'closed',
          title: '关于年假政策的疑问',
          content: '想了解一下年假的具体计算方式，以及是否可以跨年累计使用。',
          reply: '年假按照员工工龄计算，每满一年增加1天，上限15天。年假可以跨年累计使用，最长保留至次年3月底。',
          replyTime: '2024-01-25T11:30:00',
          replyBy: 'HR Administrator',
          createdAt: '2024-01-24T10:20:00',
          isAnonymous: false,
        },
        {
          id: '5',
          employeeId: 'E005',
          employeeName: '匿名',
          department: '',
          position: '',
          type: 'suggestion',
          status: 'pending',
          title: '建议优化考勤系统',
          content: '现在的考勤系统使用不便，建议简化打卡流程，增加移动端支持。',
          createdAt: '2024-01-26T15:00:00',
          isAnonymous: true,
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleReply = () => {
    if (!selectedFeedback || !replyText.trim()) return;

    const updatedFeedbacks = feedbacks.map((f) =>
      f.id === selectedFeedback.id
        ? {
            ...f,
            status: 'replied' as FeedbackStatus,
            reply: replyText,
            replyTime: new Date().toISOString(),
            replyBy: '当前用户',
          }
        : f
    );

    setFeedbacks(updatedFeedbacks);
    setShowReplyDialog(false);
    setReplyText('');
    setSelectedFeedback(null);
    toast.success('回复已发送');
  };

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch =
      feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || feedback.status === statusFilter;
    const matchesType = typeFilter === 'all' || feedback.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const typeConfig: Record<FeedbackType, { label: string; color: string; icon: any }> = {
    suggestion: { label: '建议', color: 'bg-blue-500', icon: MessageSquare },
    complaint: { label: '投诉', color: 'bg-red-500', icon: ThumbsDown },
    praise: { label: '表扬', color: 'bg-green-500', icon: ThumbsUp },
    question: { label: '咨询', color: 'bg-yellow-500', icon: MessageSquare },
    other: { label: '其他', color: 'bg-gray-500', icon: MessageSquare },
  };

  const statusConfig: Record<FeedbackStatus, { label: string; color: string; icon: any }> = {
    pending: { label: '待处理', color: 'bg-gray-500', icon: Clock },
    reviewed: { label: '已审阅', color: 'bg-blue-500', icon: Eye },
    replied: { label: '已回复', color: 'bg-green-500', icon: CheckCircle },
    closed: { label: '已关闭', color: 'bg-gray-400', icon: CheckCircle },
  };

  const statistics = {
    total: feedbacks.length,
    pending: feedbacks.filter((f) => f.status === 'pending').length,
    replied: feedbacks.filter((f) => f.status === 'replied').length,
    averageRating: feedbacks
      .filter((f) => f.rating !== undefined)
      .reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.filter((f) => f.rating !== undefined).length || 0,
  };

  const openReplyDialog = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setReplyText(feedback.reply || '');
    setShowReplyDialog(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              员工反馈
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              收集和处理员工反馈与建议
            </p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">总反馈数</p>
                  <p className="text-2xl font-bold">{statistics.total}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">待处理</p>
                  <p className="text-2xl font-bold text-gray-600">{statistics.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">已回复</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.replied}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">平均评分</p>
                  <p className="text-2xl font-bold text-yellow-500">
                    {statistics.averageRating > 0 ? statistics.averageRating.toFixed(1) : '-'}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
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
                  placeholder="搜索反馈标题或内容..."
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

        {/* 反馈列表 */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-600 dark:text-gray-400">加载中...</div>
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">暂无反馈</p>
            </div>
          ) : (
            filteredFeedbacks.map((feedback) => {
              const typeIcon = typeConfig[feedback.type].icon;
              const TypeIcon = typeIcon;
              const statusIcon = statusConfig[feedback.status].icon;
              const StatusIcon = statusIcon;
              return (
                <Card key={feedback.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {feedback.title}
                          {feedback.isAnonymous && (
                            <Badge variant="outline" className="text-xs">
                              匿名
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Badge className={`${typeConfig[feedback.type].color} text-white border-0 flex items-center gap-1`}>
                            <TypeIcon className="h-3 w-3" />
                            {typeConfig[feedback.type].label}
                          </Badge>
                          <Badge className={statusConfig[feedback.status].color + ' text-white border-0 flex items-center gap-1'}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig[feedback.status].label}
                          </Badge>
                        </CardDescription>
                      </div>
                      {feedback.rating && (
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < (feedback.rating || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {!feedback.isAnonymous && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{feedback.employeeName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {feedback.position} · {feedback.department}
                            </p>
                          </div>
                        </div>
                      )}

                      <p className="text-gray-700 dark:text-gray-300">{feedback.content}</p>

                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        反馈时间：{new Date(feedback.createdAt).toLocaleString('zh-CN')}
                      </div>

                      {feedback.reply && (
                        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-blue-600">回复</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {feedback.replyBy} ·{' '}
                              {feedback.replyTime ? new Date(feedback.replyTime).toLocaleString('zh-CN') : ''}
                            </p>
                          </div>
                          <p className="text-sm">{feedback.reply}</p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        {feedback.status === 'pending' || feedback.status === 'reviewed' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openReplyDialog(feedback)}
                          >
                            <Reply className="h-4 w-4 mr-1" />
                            回复
                          </Button>
                        ) : feedback.status === 'replied' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openReplyDialog(feedback)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            编辑回复
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            已关闭
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toast.info('详情功能开发中');
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          查看详情
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* 回复弹窗 */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>回复反馈</DialogTitle>
            <DialogDescription>
              {selectedFeedback?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>反馈内容</Label>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                {selectedFeedback?.content}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reply">回复内容 *</Label>
              <textarea
                id="reply"
                className="w-full min-h-[150px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                placeholder="输入回复内容..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReplyDialog(false)}>
              取消
            </Button>
            <Button onClick={handleReply}>
              <Send className="h-4 w-4 mr-2" />
              发送回复
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
