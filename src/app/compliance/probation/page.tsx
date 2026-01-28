'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  User,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  Eye,
  Edit,
  FileText,
  TrendingUp,
} from 'lucide-react';

interface ProbationRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  position: string;
  hireDate: string;
  probationStartDate: string;
  probationEndDate: string;
  probationDuration: number;
  remainingDays: number;
  status: 'pending' | 'pass' | 'fail' | 'extension';
  extensionDays?: number;
  manager: string;
  assessmentScore?: number;
  notes?: string;
}

// 模拟试用期管理数据
const PROBATION_DATA: ProbationRecord[] = [
  {
    id: '1',
    employeeName: '张三',
    employeeId: 'EMP001',
    department: '技术部',
    position: '高级前端工程师',
    hireDate: '2024-12-15',
    probationStartDate: '2024-12-15',
    probationEndDate: '2025-03-15',
    probationDuration: 90,
    remainingDays: 60,
    status: 'pending',
    manager: '李经理',
  },
  {
    id: '2',
    employeeName: '李四',
    employeeId: 'EMP002',
    department: '销售部',
    position: '销售经理',
    hireDate: '2024-10-01',
    probationStartDate: '2024-10-01',
    probationEndDate: '2025-01-01',
    probationDuration: 90,
    remainingDays: 15,
    status: 'pending',
    manager: '王总监',
  },
  {
    id: '3',
    employeeName: '王五',
    employeeId: 'EMP003',
    department: '市场部',
    position: '市场专员',
    hireDate: '2024-08-15',
    probationStartDate: '2024-08-15',
    probationEndDate: '2024-11-15',
    probationDuration: 90,
    remainingDays: -60,
    status: 'pass',
    manager: '赵经理',
    assessmentScore: 92,
    notes: '表现优秀,准予转正',
  },
  {
    id: '4',
    employeeName: '赵六',
    employeeId: 'EMP004',
    department: '技术部',
    position: '后端工程师',
    hireDate: '2024-11-01',
    probationStartDate: '2024-11-01',
    probationEndDate: '2025-02-01',
    probationDuration: 90,
    remainingDays: 15,
    status: 'extension',
    extensionDays: 30,
    manager: '李经理',
    assessmentScore: 75,
    notes: '表现良好,建议延长试用期30天进一步观察',
  },
  {
    id: '5',
    employeeName: '孙七',
    employeeId: 'EMP005',
    department: '人力资源部',
    position: 'HR助理',
    hireDate: '2024-11-15',
    probationStartDate: '2024-11-15',
    probationEndDate: '2025-02-15',
    probationDuration: 90,
    remainingDays: 30,
    status: 'pending',
    manager: '周经理',
  },
];

const STATUS_CONFIG = {
  pending: {
    label: '试用中',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
    icon: Clock,
  },
  pass: {
    label: '已转正',
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
    icon: CheckCircle,
  },
  fail: {
    label: '未通过',
    color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
    icon: XCircle,
  },
  extension: {
    label: '延长试用',
    color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
    icon: AlertTriangle,
  },
};

export default function ProbationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // 过滤试用期记录
  const filteredRecords = useMemo(() => {
    let records = PROBATION_DATA;

    // 按状态过滤
    if (statusFilter !== 'all') {
      records = records.filter(r => r.status === statusFilter);
    }

    // 按搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      records = records.filter(r =>
        r.employeeName.toLowerCase().includes(query) ||
        r.employeeId.toLowerCase().includes(query) ||
        r.department.toLowerCase().includes(query) ||
        r.manager.toLowerCase().includes(query)
      );
    }

    return records;
  }, [searchQuery, statusFilter]);

  // 统计数据
  const stats = useMemo(() => {
    return {
      total: PROBATION_DATA.length,
      pending: PROBATION_DATA.filter(r => r.status === 'pending').length,
      pass: PROBATION_DATA.filter(r => r.status === 'pass').length,
      extension: PROBATION_DATA.filter(r => r.status === 'extension').length,
      avgScore: PROBATION_DATA.filter(r => r.assessmentScore !== undefined)
        .reduce((sum, r) => sum + (r.assessmentScore || 0), 0) / PROBATION_DATA.filter(r => r.assessmentScore !== undefined).length || 0,
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            试用期管理
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            跟踪员工试用期进度和转正评估
          </p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          批量评估
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>试用期总数</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              试用中
            </CardDescription>
            <CardTitle className="text-3xl">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              已转正
            </CardDescription>
            <CardTitle className="text-3xl">{stats.pass}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>平均评估分数</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-1">
              <TrendingUp className="h-5 w-5 text-green-600" />
              {stats.avgScore > 0 ? stats.avgScore.toFixed(1) : '-'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 即将到期提醒 */}
      {filteredRecords.some(r => r.status === 'pending' && r.remainingDays <= 15) && (
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  有{filteredRecords.filter(r => r.status === 'pending' && r.remainingDays <= 15).length}名员工试用期即将到期
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  请及时进行转正评估,避免试用期超期
                </p>
              </div>
              <Button size="sm" variant="outline">
                立即评估
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 试用期列表 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <CardTitle>试用期员工列表</CardTitle>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索员工..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="all">全部状态</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  暂无记录
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  当前筛选条件下没有试用期记录
                </p>
              </div>
            ) : (
              filteredRecords.map((record) => {
                const statusConfig = STATUS_CONFIG[record.status];
                const StatusIcon = statusConfig.icon;

                // 计算试用期进度
                const startDate = new Date(record.probationStartDate);
                const endDate = new Date(record.probationEndDate);
                const now = new Date();
                const totalDays = record.probationDuration;
                const elapsedDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                const progress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);

                return (
                  <Card key={record.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* 员工信息 */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                            {record.employeeName.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {record.employeeName}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {record.employeeId}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {record.department} · {record.position}
                            </p>
                          </div>
                        </div>

                        {/* 试用期信息 */}
                        <div className="w-64 shrink-0 px-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={statusConfig.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            入职日期: {record.hireDate}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            直属主管: {record.manager}
                          </div>
                        </div>

                        {/* 期限和进度 */}
                        <div className="w-64 shrink-0 px-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            试用期限
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white mb-2">
                            {record.probationStartDate} ~ {record.probationEndDate}
                          </div>
                          {record.status === 'pending' && (
                            <>
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-600 dark:text-gray-400">进度</span>
                                  <span className="font-medium">{progress.toFixed(1)}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                              </div>
                            </>
                          )}
                        </div>

                        {/* 剩余天数 */}
                        <div className="w-32 shrink-0 px-4 text-center">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            剩余天数
                          </div>
                          <div className={`text-3xl font-bold ${
                            record.remainingDays <= 15 && record.status === 'pending'
                              ? 'text-red-600'
                              : record.remainingDays <= 30 && record.status === 'pending'
                              ? 'text-yellow-600'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {record.remainingDays}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">天</div>
                          {record.extensionDays && (
                            <div className="text-xs text-yellow-600 mt-1">
                              +延长{record.extensionDays}天
                            </div>
                          )}
                        </div>

                        {/* 评估分数 */}
                        <div className="w-32 shrink-0 px-4 text-center">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            评估分数
                          </div>
                          <div className={`text-3xl font-bold ${
                            record.assessmentScore && record.assessmentScore >= 80
                              ? 'text-green-600'
                              : record.assessmentScore && record.assessmentScore >= 60
                              ? 'text-yellow-600'
                              : record.assessmentScore
                              ? 'text-red-600'
                              : 'text-gray-400'
                          }`}>
                            {record.assessmentScore || '-'}
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            查看
                          </Button>
                          {record.status === 'pending' && (
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4 mr-1" />
                              评估
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
        </CardContent>
      </Card>
    </div>
  );
}
