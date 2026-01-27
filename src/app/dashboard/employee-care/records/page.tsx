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
  FileText,
  Plus,
  Search,
  Heart,
  Gift,
  Calendar,
  Award,
  MessageSquare,
  CheckCircle,
  Clock,
  User,
  Building,
  Eye,
  Edit,
  Filter,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

type RecordType = 'birthday' | 'anniversary' | 'reward' | 'grievance' | 'welfare';
type RecordStatus = 'pending' | 'processing' | 'resolved' | 'closed';

interface CareRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  type: RecordType;
  status: RecordStatus;
  title: string;
  description: string;
  actionDate: string;
  handler: string;
  priority: 'high' | 'medium' | 'low';
  followUp: string;
  createdAt: string;
}

export default function EmployeeCareRecordsPage() {
  const [records, setRecords] = useState<CareRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateRecord, setShowCreateRecord] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CareRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [newRecord, setNewRecord] = useState({
    employeeName: '',
    department: '',
    position: '',
    type: 'birthday' as RecordType,
    title: '',
    description: '',
    actionDate: '',
    handler: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    followUp: '',
  });

  useEffect(() => {
    // 模拟获取员工关怀记录数据
    setTimeout(() => {
      setRecords([
        {
          id: '1',
          employeeId: 'E001',
          employeeName: '张三',
          department: '技术部',
          position: '高级前端工程师',
          type: 'birthday',
          status: 'resolved',
          title: '生日祝福',
          description: '员工生日当天发送生日祝福和生日蛋糕',
          actionDate: '2024-01-15',
          handler: 'HR BP',
          priority: 'medium',
          followUp: '员工反馈非常满意',
          createdAt: '2024-01-15T10:00:00',
        },
        {
          id: '2',
          employeeId: 'E002',
          employeeName: '李四',
          department: '产品部',
          position: '产品经理',
          type: 'anniversary',
          status: 'resolved',
          title: '入职3周年纪念',
          description: '入职满3周年，准备纪念礼物和感谢信',
          actionDate: '2024-01-20',
          handler: 'HR Director',
          priority: 'high',
          followUp: '员工表示认可和感动',
          createdAt: '2024-01-20T14:30:00',
        },
        {
          id: '3',
          employeeId: 'E003',
          employeeName: '王五',
          department: '销售部',
          position: '销售代表',
          type: 'grievance',
          status: 'processing',
          title: '加班补贴申诉',
          description: '员工反映最近加班较多，但未收到加班补贴',
          actionDate: '2024-01-25',
          handler: 'HR BP',
          priority: 'high',
          followUp: '正在与部门负责人核实情况',
          createdAt: '2024-01-25T09:00:00',
        },
        {
          id: '4',
          employeeId: 'E004',
          employeeName: '赵六',
          department: '运营部',
          position: '运营专员',
          type: 'reward',
          status: 'pending',
          title: '优秀员工奖励',
          description: '本月优秀员工评选结果，需要准备奖励',
          actionDate: '2024-02-01',
          handler: 'HR BP',
          priority: 'medium',
          followUp: '待确认奖励方案',
          createdAt: '2024-01-28T16:00:00',
        },
        {
          id: '5',
          employeeId: 'E005',
          employeeName: '孙七',
          department: '行政部',
          position: '行政专员',
          type: 'welfare',
          status: 'resolved',
          title: '节日福利发放',
          description: '春节福利发放，包含礼品和红包',
          actionDate: '2024-01-30',
          handler: 'HR Administrator',
          priority: 'medium',
          followUp: '已成功发放',
          createdAt: '2024-01-30T10:30:00',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateRecord = () => {
    const record: CareRecord = {
      id: Date.now().toString(),
      employeeId: 'E' + Date.now().toString().slice(-4),
      employeeName: newRecord.employeeName,
      department: newRecord.department,
      position: newRecord.position,
      type: newRecord.type,
      status: 'pending',
      title: newRecord.title,
      description: newRecord.description,
      actionDate: newRecord.actionDate,
      handler: newRecord.handler,
      priority: newRecord.priority,
      followUp: newRecord.followUp,
      createdAt: new Date().toISOString(),
    };
    setRecords([record, ...records]);
    setShowCreateRecord(false);
    toast.success('员工关怀记录已创建');
    setNewRecord({
      employeeName: '',
      department: '',
      position: '',
      type: 'birthday',
      title: '',
      description: '',
      actionDate: '',
      handler: '',
      priority: 'medium',
      followUp: '',
    });
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesType = typeFilter === 'all' || record.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const typeConfig: Record<RecordType, { label: string; color: string; icon: any }> = {
    birthday: { label: '生日关怀', color: 'bg-pink-500', icon: Gift },
    anniversary: { label: '周年纪念', color: 'bg-purple-500', icon: Calendar },
    reward: { label: '奖励表彰', color: 'bg-yellow-500', icon: Award },
    grievance: { label: '申诉投诉', color: 'bg-red-500', icon: MessageSquare },
    welfare: { label: '福利发放', color: 'bg-green-500', icon: Heart },
  };

  const statusConfig: Record<RecordStatus, { label: string; color: string; icon: any }> = {
    pending: { label: '待处理', color: 'bg-gray-500', icon: Clock },
    processing: { label: '处理中', color: 'bg-blue-500', icon: Clock },
    resolved: { label: '已解决', color: 'bg-green-500', icon: CheckCircle },
    closed: { label: '已关闭', color: 'bg-gray-400', icon: CheckCircle },
  };

  const priorityConfig: Record<string, { label: string; color: string }> = {
    high: { label: '高', color: 'bg-red-500' },
    medium: { label: '中', color: 'bg-yellow-500' },
    low: { label: '低', color: 'bg-blue-500' },
  };

  const statistics = {
    total: records.length,
    pending: records.filter((r) => r.status === 'pending').length,
    processing: records.filter((r) => r.status === 'processing').length,
    resolved: records.filter((r) => r.status === 'resolved').length,
    birthday: records.filter((r) => r.type === 'birthday').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-600" />
              员工关怀记录
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              记录和管理员工关怀活动
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.info('导出中...')}>
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
            <Button onClick={() => setShowCreateRecord(true)}>
              <Plus className="h-4 w-4 mr-2" />
              创建记录
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">总记录数</p>
                  <p className="text-2xl font-bold">{statistics.total}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">处理中</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.processing}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">已解决</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.resolved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">生日关怀</p>
                  <p className="text-2xl font-bold text-pink-600">{statistics.birthday}</p>
                </div>
                <Gift className="h-8 w-8 text-pink-600" />
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
                  placeholder="搜索员工姓名或记录标题..."
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

        {/* 记录列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 flex items-center justify-center h-64">
              <div className="text-gray-600 dark:text-gray-400">加载中...</div>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">暂无关怀记录</p>
              <Button className="mt-4" onClick={() => setShowCreateRecord(true)}>
                <Plus className="h-4 w-4 mr-2" />
                创建记录
              </Button>
            </div>
          ) : (
            filteredRecords.map((record) => {
              const typeIcon = typeConfig[record.type].icon;
              const TypeIcon = typeIcon;
              const statusIcon = statusConfig[record.status].icon;
              const StatusIcon = statusIcon;
              return (
                <Card key={record.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{record.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Badge className={`${typeConfig[record.type].color} text-white border-0 flex items-center gap-1`}>
                            <TypeIcon className="h-3 w-3" />
                            {typeConfig[record.type].label}
                          </Badge>
                          <Badge className={statusConfig[record.status].color + ' text-white border-0 flex items-center gap-1'}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig[record.status].label}
                          </Badge>
                        </CardDescription>
                      </div>
                      <Badge className={`${priorityConfig[record.priority].color} text-white border-0`}>
                        {priorityConfig[record.priority].label}优先级
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{record.employeeName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {record.position} · {record.department}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {record.description}
                      </p>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">处理日期</span>
                          <p className="font-medium">{record.actionDate}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">处理人</span>
                          <p className="font-medium">{record.handler}</p>
                        </div>
                      </div>

                      {record.followUp && (
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">跟进情况</span>
                          <p className="text-sm mt-1">{record.followUp}</p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          查看详情
                        </Button>
                        {record.status === 'pending' && (
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-4 w-4 mr-1" />
                            开始处理
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

      {/* 创建记录弹窗 */}
      <Dialog open={showCreateRecord} onOpenChange={setShowCreateRecord}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>创建员工关怀记录</DialogTitle>
            <DialogDescription>
              记录员工关怀活动或申诉
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>员工姓名 *</Label>
                <Input
                  placeholder="输入员工姓名"
                  value={newRecord.employeeName}
                  onChange={(e) => setNewRecord({ ...newRecord, employeeName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>部门 *</Label>
                <Input
                  placeholder="输入部门"
                  value={newRecord.department}
                  onChange={(e) => setNewRecord({ ...newRecord, department: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>职位 *</Label>
                <Input
                  placeholder="输入职位"
                  value={newRecord.position}
                  onChange={(e) => setNewRecord({ ...newRecord, position: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>关怀类型 *</Label>
                <Select
                  value={newRecord.type}
                  onValueChange={(v) => setNewRecord({ ...newRecord, type: v as RecordType })}
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
            </div>

            <div className="space-y-2">
              <Label>标题 *</Label>
              <Input
                placeholder="输入关怀记录标题"
                value={newRecord.title}
                onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>描述 *</Label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                placeholder="详细描述关怀内容或申诉详情..."
                value={newRecord.description}
                onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>处理日期 *</Label>
                <Input
                  type="date"
                  value={newRecord.actionDate}
                  onChange={(e) => setNewRecord({ ...newRecord, actionDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>优先级</Label>
                <Select
                  value={newRecord.priority}
                  onValueChange={(v) => setNewRecord({ ...newRecord, priority: v as 'high' | 'medium' | 'low' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="low">低</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>处理人</Label>
              <Input
                placeholder="输入处理人姓名"
                value={newRecord.handler}
                onChange={(e) => setNewRecord({ ...newRecord, handler: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>跟进情况</Label>
              <textarea
                className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                placeholder="输入跟进情况..."
                value={newRecord.followUp}
                onChange={(e) => setNewRecord({ ...newRecord, followUp: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateRecord(false)}>
              取消
            </Button>
            <Button onClick={handleCreateRecord}>
              <Plus className="h-4 w-4 mr-2" />
              创建记录
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
