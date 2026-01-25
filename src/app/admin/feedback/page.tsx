'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  RefreshCw,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  MessageSquare,
  Star,
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
  Eye,
  User,
  Building2,
  MoreVertical,
} from 'lucide-react';
import { toast } from 'sonner';

interface Feedback {
  id: string;
  type: 'suggestion' | 'bug' | 'complaint' | 'other';
  category: string;
  content: string;
  rating: number | null;
  userId: string;
  userName?: string;
  userEmail?: string;
  companyId: string;
  companyName?: string;
  status: 'pending' | 'reviewed' | 'processed';
  createdAt: string;
  updatedAt?: string;
}

export default function AdminFeedbackPage() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [selectedFeedbacks, setSelectedFeedbacks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'processed'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'suggestion' | 'bug' | 'complaint' | 'other'>('all');

  useEffect(() => {
    checkAuth();
    fetchFeedbacks();
  }, []);

  const checkAuth = () => {
    const isSuperAdmin = localStorage.getItem('isSuperAdmin');
    if (isSuperAdmin !== 'true') {
      router.push('/admin/login');
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/feedback', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取反馈列表失败');
      }

      const data = await response.json();
      setFeedbacks(data.feedbacks || []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast.error('获取反馈列表失败');
      // 使用模拟数据
      setFeedbacks([
        {
          id: 'feedback-1',
          type: 'suggestion',
          category: 'feature',
          content: '建议增加移动端APP，方便外出办公',
          rating: 5,
          userId: 'user-1',
          userName: '张三',
          userEmail: 'zhangsan@example.com',
          companyId: 'company-1',
          companyName: '示例企业',
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch =
      feedback.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (feedback.userName && feedback.userName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || feedback.status === statusFilter;
    const matchesType = typeFilter === 'all' || feedback.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFeedbacks(new Set(filteredFeedbacks.map(f => f.id)));
    } else {
      setSelectedFeedbacks(new Set());
    }
  };

  const handleSelectFeedback = (feedbackId: string, checked: boolean) => {
    const newSelected = new Set(selectedFeedbacks);
    if (checked) {
      newSelected.add(feedbackId);
    } else {
      newSelected.delete(feedbackId);
    }
    setSelectedFeedbacks(newSelected);
  };

  const handleBatchStatusUpdate = async (newStatus: string) => {
    if (selectedFeedbacks.size === 0) {
      toast.error('请先选择反馈');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await Promise.all(
        Array.from(selectedFeedbacks).map(feedbackId =>
          fetch(`/api/admin/feedback/${feedbackId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ status: newStatus }),
          })
        )
      );

      toast.success(`已更新 ${selectedFeedbacks.size} 个反馈状态`);
      setSelectedFeedbacks(new Set());
      fetchFeedbacks();
    } catch (error) {
      console.error('批量更新失败:', error);
      toast.error('批量更新失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedFeedbacks.size === 0) {
      toast.error('请先选择反馈');
      return;
    }

    if (!confirm(`确定要删除 ${selectedFeedbacks.size} 个反馈吗？`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await Promise.all(
        Array.from(selectedFeedbacks).map(feedbackId =>
          fetch(`/api/admin/feedback/${feedbackId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })
        )
      );

      toast.success(`已删除 ${selectedFeedbacks.size} 个反馈`);
      setSelectedFeedbacks(new Set());
      fetchFeedbacks();
    } catch (error) {
      console.error('批量删除失败:', error);
      toast.error('批量删除失败');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: '待处理', color: 'bg-blue-100 text-blue-700' },
      reviewed: { label: '已审核', color: 'bg-yellow-100 text-yellow-700' },
      processed: { label: '已处理', color: 'bg-green-100 text-green-700' },
    };
    const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeMap = {
      suggestion: { label: '建议', color: 'bg-purple-100 text-purple-700', icon: Lightbulb },
      bug: { label: '问题', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
      complaint: { label: '投诉', color: 'bg-orange-100 text-orange-700', icon: ThumbsUp },
      other: { label: '其他', color: 'bg-gray-100 text-gray-700', icon: MessageSquare },
    };
    const config = typeMap[type as keyof typeof typeMap] || typeMap.other;
    return (
      <Badge className={config.color}>
        <config.icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const renderRating = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50">
      {/* Header */}
      <div className="border-b bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">用户反馈</h1>
                <p className="text-sm text-gray-600 mt-1">查看和处理用户提交的反馈</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={fetchFeedbacks}
                disabled={loading}
                variant="outline"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
              {selectedFeedbacks.size > 0 && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        批量操作 ({selectedFeedbacks.size})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleBatchStatusUpdate('reviewed')}>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        标记为已审核
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBatchStatusUpdate('processed')}>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        标记为已处理
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleBatchDelete} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        批量删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">总反馈数</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{feedbacks.length}</p>
                </div>
                <MessageSquare className="w-12 h-12 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">待处理</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {feedbacks.filter(f => f.status === 'pending').length}
                  </p>
                </div>
                <AlertTriangle className="w-12 h-12 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">平均评分</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {feedbacks.filter(f => f.rating).length > 0
                      ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.filter(f => f.rating).length).toFixed(1)
                      : '-'}
                  </p>
                </div>
                <Star className="w-12 h-12 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">建议数</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">
                    {feedbacks.filter(f => f.type === 'suggestion').length}
                  </p>
                </div>
                <Lightbulb className="w-12 h-12 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="搜索反馈内容、用户..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="处理状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待处理</SelectItem>
                  <SelectItem value="reviewed">已审核</SelectItem>
                  <SelectItem value="processed">已处理</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="反馈类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="suggestion">建议</SelectItem>
                  <SelectItem value="bug">问题</SelectItem>
                  <SelectItem value="complaint">投诉</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={filteredFeedbacks.length > 0 && selectedFeedbacks.size === filteredFeedbacks.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>反馈内容</TableHead>
                    <TableHead>提交用户</TableHead>
                    <TableHead>所属企业</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>评分</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredFeedbacks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="text-center">
                          <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                          <p className="text-gray-500">暂无反馈数据</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFeedbacks.map((feedback) => (
                      <TableRow key={feedback.id} className="hover:bg-gray-50">
                        <TableCell>
                          <Checkbox
                            checked={selectedFeedbacks.has(feedback.id)}
                            onCheckedChange={(checked) => handleSelectFeedback(feedback.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm text-gray-900 line-clamp-2">
                              {feedback.content}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              分类：{feedback.category}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {feedback.userName || '未知用户'}
                              </div>
                              <div className="text-xs text-gray-500">{feedback.userEmail}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{feedback.companyName || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getTypeBadge(feedback.type)}
                        </TableCell>
                        <TableCell>
                          {renderRating(feedback.rating)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(feedback.status)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(feedback.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleBatchStatusUpdate('reviewed')}>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                标记为已审核
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleBatchStatusUpdate('processed')}>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                标记为已处理
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={handleBatchDelete} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
