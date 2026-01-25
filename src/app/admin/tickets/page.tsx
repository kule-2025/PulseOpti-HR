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
  Plus,
  MoreVertical,
  RefreshCw,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  MessageSquare,
  Reply,
  Eye,
  User,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  type: 'bug' | 'feature' | 'support' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  userId: string;
  userName?: string;
  userEmail?: string;
  companyId: string;
  companyName?: string;
  createdAt: string;
  updatedAt: string;
  replies: Array<{
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: string;
  }>;
}

export default function AdminTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');

  useEffect(() => {
    checkAuth();
    fetchTickets();
  }, []);

  const checkAuth = () => {
    const isSuperAdmin = localStorage.getItem('isSuperAdmin');
    if (isSuperAdmin !== 'true') {
      router.push('/admin/login');
    }
  };

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/tickets', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取工单列表失败');
      }

      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('获取工单列表失败');
      // 使用模拟数据
      setTickets([
        {
          id: '1',
          subject: '无法登录系统',
          description: '输入账号密码后点击登录无响应',
          type: 'bug',
          priority: 'high',
          status: 'open',
          userId: 'user-1',
          userName: '张三',
          userEmail: 'zhangsan@example.com',
          companyId: 'company-1',
          companyName: '示例企业',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          replies: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.userName && ticket.userName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTickets(new Set(filteredTickets.map(t => t.id)));
    } else {
      setSelectedTickets(new Set());
    }
  };

  const handleSelectTicket = (ticketId: string, checked: boolean) => {
    const newSelected = new Set(selectedTickets);
    if (checked) {
      newSelected.add(ticketId);
    } else {
      newSelected.delete(ticketId);
    }
    setSelectedTickets(newSelected);
  };

  const handleBatchStatusUpdate = async (newStatus: string) => {
    if (selectedTickets.size === 0) {
      toast.error('请先选择工单');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await Promise.all(
        Array.from(selectedTickets).map(ticketId =>
          fetch(`/api/admin/tickets/${ticketId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ status: newStatus }),
          })
        )
      );

      toast.success(`已更新 ${selectedTickets.size} 个工单状态`);
      setSelectedTickets(new Set());
      fetchTickets();
    } catch (error) {
      console.error('批量更新失败:', error);
      toast.error('批量更新失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedTickets.size === 0) {
      toast.error('请先选择工单');
      return;
    }

    if (!confirm(`确定要删除 ${selectedTickets.size} 个工单吗？`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await Promise.all(
        Array.from(selectedTickets).map(ticketId =>
          fetch(`/api/admin/tickets/${ticketId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })
        )
      );

      toast.success(`已删除 ${selectedTickets.size} 个工单`);
      setSelectedTickets(new Set());
      fetchTickets();
    } catch (error) {
      console.error('批量删除失败:', error);
      toast.error('批量删除失败');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      open: { label: '待处理', color: 'bg-blue-100 text-blue-700' },
      in_progress: { label: '处理中', color: 'bg-yellow-100 text-yellow-700' },
      resolved: { label: '已解决', color: 'bg-green-100 text-green-700' },
      closed: { label: '已关闭', color: 'bg-gray-100 text-gray-700' },
    };
    const config = statusMap[status as keyof typeof statusMap] || statusMap.open;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      low: { label: '低', color: 'bg-gray-100 text-gray-700' },
      medium: { label: '中', color: 'bg-blue-100 text-blue-700' },
      high: { label: '高', color: 'bg-orange-100 text-orange-700' },
      urgent: { label: '紧急', color: 'bg-red-100 text-red-700' },
    };
    const config = priorityMap[priority as keyof typeof priorityMap] || priorityMap.medium;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      bug: AlertTriangle,
      feature: Plus,
      support: MessageSquare,
      other: FileText,
    };
    return icons[type as keyof typeof icons] || FileText;
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
                <h1 className="text-2xl font-bold text-gray-900">工单管理</h1>
                <p className="text-sm text-gray-600 mt-1">查看和处理用户提交的工单</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={fetchTickets}
                disabled={loading}
                variant="outline"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
              {selectedTickets.size > 0 && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        批量操作 ({selectedTickets.size})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleBatchStatusUpdate('in_progress')}>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        标记为处理中
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBatchStatusUpdate('resolved')}>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        标记为已解决
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBatchStatusUpdate('closed')}>
                        <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                        批量关闭
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
                  <p className="text-sm text-gray-600">总工单数</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{tickets.length}</p>
                </div>
                <FileText className="w-12 h-12 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">待处理</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {tickets.filter(t => t.status === 'open').length}
                  </p>
                </div>
                <Clock className="w-12 h-12 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">处理中</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">
                    {tickets.filter(t => t.status === 'in_progress').length}
                  </p>
                </div>
                <RefreshCw className="w-12 h-12 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">已解决</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length}
                  </p>
                </div>
                <CheckCircle2 className="w-12 h-12 text-green-600" />
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
                    placeholder="搜索工单标题、描述、用户..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="工单状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="open">待处理</SelectItem>
                  <SelectItem value="in_progress">处理中</SelectItem>
                  <SelectItem value="resolved">已解决</SelectItem>
                  <SelectItem value="closed">已关闭</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="优先级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部优先级</SelectItem>
                  <SelectItem value="low">低</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="high">高</SelectItem>
                  <SelectItem value="urgent">紧急</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tickets Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={filteredTickets.length > 0 && selectedTickets.size === filteredTickets.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>工单信息</TableHead>
                    <TableHead>提交用户</TableHead>
                    <TableHead>所属企业</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>优先级</TableHead>
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
                  ) : filteredTickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="text-center">
                          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                          <p className="text-gray-500">暂无工单数据</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTickets.map((ticket) => {
                      const TypeIcon = getTypeIcon(ticket.type);
                      return (
                        <TableRow key={ticket.id} className="hover:bg-gray-50">
                          <TableCell>
                            <Checkbox
                              checked={selectedTickets.has(ticket.id)}
                              onCheckedChange={(checked) => handleSelectTicket(ticket.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900 flex items-center gap-2">
                                <TypeIcon className="w-4 h-4 text-gray-500" />
                                {ticket.subject}
                              </div>
                              <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                                {ticket.description}
                              </div>
                              {ticket.replies.length > 0 && (
                                <Badge variant="secondary" className="mt-1">
                                  <MessageSquare className="w-3 h-3 mr-1" />
                                  {ticket.replies.length} 条回复
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {ticket.userName || '未知用户'}
                                </div>
                                <div className="text-xs text-gray-500">{ticket.userEmail}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{ticket.companyName || '-'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{ticket.type}</Badge>
                          </TableCell>
                          <TableCell>
                            {getPriorityBadge(ticket.priority)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(ticket.status)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDate(ticket.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/tickets/${ticket.id}`}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    查看详情
                                  </Link>
                                </DropdownMenuItem>
                                {ticket.status !== 'in_progress' && (
                                  <DropdownMenuItem onClick={() => handleBatchStatusUpdate('in_progress')}>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    开始处理
                                  </DropdownMenuItem>
                                )}
                                {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                                  <DropdownMenuItem onClick={() => handleBatchStatusUpdate('resolved')}>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    标记为已解决
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleBatchDelete()} className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  删除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
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
