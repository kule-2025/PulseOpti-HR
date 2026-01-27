'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, FileText, CheckCircle, Clock, AlertCircle, User, Calendar, Link } from 'lucide-react';

interface HandoverItem {
  id: string;
  name: string;
  type: 'document' | 'knowledge' | 'task' | 'asset' | 'account';
  status: 'pending' | 'completed' | 'in_progress';
  receiver: string;
  completedAt?: string;
  notes?: string;
}

interface Handover {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  position: string;
  lastWorkDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  items: HandoverItem[];
  createdAt: string;
}

export default function HandoverPage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [handovers, setHandovers] = useState<Handover[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setHandovers([
        {
          id: '1',
          employeeName: '张三',
          employeeId: 'EMP001',
          department: '技术部',
          position: '高级工程师',
          lastWorkDate: '2024-05-10',
          status: 'in_progress',
          createdAt: '2024-04-10',
          items: [
            { id: '1', name: '项目文档交接', type: 'document', status: 'completed', receiver: '李四', completedAt: '2024-04-15' },
            { id: '2', name: '代码仓库权限', type: 'account', status: 'completed', receiver: '李四', completedAt: '2024-04-16' },
            { id: '3', name: '知识库资料', type: 'knowledge', status: 'in_progress', receiver: '王五', notes: '正在整理中' },
            { id: '4', name: '当前任务清单', type: 'task', status: 'pending', receiver: '待分配' },
            { id: '5', name: '办公设备', type: 'asset', status: 'pending', receiver: '行政部' },
          ],
        },
        {
          id: '2',
          employeeName: '李四',
          employeeId: 'EMP002',
          department: '销售部',
          position: '销售经理',
          lastWorkDate: '2024-05-05',
          status: 'in_progress',
          createdAt: '2024-04-05',
          items: [
            { id: '1', name: '客户资料', type: 'document', status: 'completed', receiver: '王经理', completedAt: '2024-04-20' },
            { id: '2', name: '销售合同', type: 'document', status: 'completed', receiver: '王经理', completedAt: '2024-04-21' },
            { id: '3', name: 'CRM系统权限', type: 'account', status: 'completed', receiver: '王经理', completedAt: '2024-04-22' },
            { id: '4', name: '销售技巧培训资料', type: 'knowledge', status: 'in_progress', receiver: '销售团队' },
            { id: '5', name: '客户关系', type: 'knowledge', status: 'pending', receiver: '王经理' },
          ],
        },
        {
          id: '3',
          employeeName: '王五',
          employeeId: 'EMP003',
          department: '技术部',
          position: '前端工程师',
          lastWorkDate: '2024-04-30',
          status: 'completed',
          createdAt: '2024-04-01',
          items: [
            { id: '1', name: '前端代码库', type: 'document', status: 'completed', receiver: '赵六', completedAt: '2024-04-15' },
            { id: '2', name: 'UI组件库', type: 'knowledge', status: 'completed', receiver: '赵六', completedAt: '2024-04-16' },
            { id: '3', name: '开发环境配置', type: 'knowledge', status: 'completed', receiver: '赵六', completedAt: '2024-04-17' },
            { id: '4', name: '当前任务', type: 'task', status: 'completed', receiver: '赵六', completedAt: '2024-04-18' },
            { id: '5', name: '开发设备', type: 'asset', status: 'completed', receiver: '行政部', completedAt: '2024-04-25' },
          ],
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const filteredHandovers = useMemo(() => {
    return handovers.filter(handover => {
      const matchesSearch =
        handover.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        handover.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        handover.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || handover.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [handovers, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = handovers.length;
    const inProgress = handovers.filter(h => h.status === 'in_progress').length;
    const completed = handovers.filter(h => h.status === 'completed').length;
    const totalItems = handovers.reduce((sum, h) => sum + h.items.length, 0);
    const completedItems = handovers.reduce((sum, h) => sum + h.items.filter(i => i.status === 'completed').length, 0);
    return { total, inProgress, completed, totalItems, completedItems };
  }, [handovers]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'knowledge':
        return <FileText className="h-4 w-4" />;
      case 'task':
        return <FileText className="h-4 w-4" />;
      case 'asset':
        return <FileText className="h-4 w-4" />;
      case 'account':
        return <Link className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'document':
        return '文档';
      case 'knowledge':
        return '知识';
      case 'task':
        return '任务';
      case 'asset':
        return '资产';
      case 'account':
        return '账号';
      default:
        return '其他';
    }
  };

  const getItemStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600">已完成</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">进行中</Badge>;
      default:
        return <Badge variant="outline">待交接</Badge>;
    }
  };

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">离职交接</h1>
          <p className="text-muted-foreground mt-1">管理工作交接和知识转移</p>
        </div>
        <Button variant="outline">导出报表</Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              交接总数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">所有交接</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              进行中
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground mt-1">正在交接</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              交接完成率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.totalItems > 0 ? ((stats.completedItems / stats.totalItems) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedItems}/{stats.totalItems} 项
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              已完成交接
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">完全完成</p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索员工姓名、工号或部门..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="pending">待开始</SelectItem>
            <SelectItem value="in_progress">进行中</SelectItem>
            <SelectItem value="completed">已完成</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 交接列表 */}
      <Card>
        <CardHeader>
          <CardTitle>离职交接列表</CardTitle>
          <CardDescription>查看和管理所有交接任务</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredHandovers.map((handover) => (
              <div key={handover.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{handover.employeeName}</h3>
                      <p className="text-sm text-muted-foreground">{handover.employeeId} · {handover.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={handover.status === 'completed' ? 'default' : handover.status === 'in_progress' ? 'secondary' : 'outline'}>
                      {handover.status === 'completed' ? '已完成' : handover.status === 'in_progress' ? '进行中' : '待开始'}
                    </Badge>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {handover.lastWorkDate}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium mb-2">交接项目 ({handover.items.length})</p>
                  {handover.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/30">
                      {getTypeIcon(item.type)}
                      <span className="flex-1 text-sm">{item.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {getTypeName(item.type)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">→ {item.receiver}</span>
                      {getItemStatusBadge(item.status)}
                      {item.notes && (
                        <span className="text-xs text-muted-foreground">({item.notes})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {filteredHandovers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                没有找到匹配的交接记录
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
