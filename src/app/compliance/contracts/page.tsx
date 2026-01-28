'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

interface Contract {
  id: string;
  contractNo: string;
  employeeName: string;
  employeeId: string;
  department: string;
  position: string;
  contractType: 'regular' | 'temporary' | 'intern' | 'consultant';
  status: 'active' | 'expiring' | 'expired' | 'terminated';
  startDate: string;
  endDate: string;
  remainingDays: number;
  salary: number;
  probationEndDate: string;
  probationStatus: 'passed' | 'in-progress' | 'failed';
}

// 模拟劳动合同数据
const CONTRACTS_DATA: Contract[] = [
  {
    id: '1',
    contractNo: 'HT202401001',
    employeeName: '张三',
    employeeId: 'EMP001',
    department: '技术部',
    position: '高级前端工程师',
    contractType: 'regular',
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2026-01-15',
    remainingDays: 365,
    salary: 25000,
    probationEndDate: '2024-04-15',
    probationStatus: 'passed',
  },
  {
    id: '2',
    contractNo: 'HT202402001',
    employeeName: '李四',
    employeeId: 'EMP002',
    department: '销售部',
    position: '销售经理',
    contractType: 'regular',
    status: 'expiring',
    startDate: '2023-02-01',
    endDate: '2025-02-01',
    remainingDays: 15,
    salary: 22000,
    probationEndDate: '2023-05-01',
    probationStatus: 'passed',
  },
  {
    id: '3',
    contractNo: 'HT202403001',
    employeeName: '王五',
    employeeId: 'EMP003',
    department: '市场部',
    position: '市场专员',
    contractType: 'temporary',
    status: 'expiring',
    startDate: '2024-03-01',
    endDate: '2025-02-01',
    remainingDays: 15,
    salary: 12000,
    probationEndDate: '2024-04-01',
    probationStatus: 'passed',
  },
  {
    id: '4',
    contractNo: 'HT202404001',
    employeeName: '赵六',
    employeeId: 'EMP004',
    department: '技术部',
    position: '后端工程师',
    contractType: 'regular',
    status: 'active',
    startDate: '2024-04-01',
    endDate: '2026-04-01',
    remainingDays: 410,
    salary: 20000,
    probationEndDate: '2024-07-01',
    probationStatus: 'in-progress',
  },
  {
    id: '5',
    contractNo: 'HT202405001',
    employeeName: '孙七',
    employeeId: 'EMP005',
    department: '人力资源部',
    position: 'HR助理',
    contractType: 'intern',
    status: 'expiring',
    startDate: '2024-06-01',
    endDate: '2025-02-01',
    remainingDays: 15,
    salary: 5000,
    probationEndDate: '2024-07-01',
    probationStatus: 'passed',
  },
  {
    id: '6',
    contractNo: 'HT202406001',
    employeeName: '周八',
    employeeId: 'EMP006',
    department: '技术部',
    position: '系统架构师',
    contractType: 'regular',
    status: 'active',
    startDate: '2024-06-15',
    endDate: '2026-06-15',
    remainingDays: 455,
    salary: 35000,
    probationEndDate: '2024-09-15',
    probationStatus: 'in-progress',
  },
];

const CONTRACT_TYPE_CONFIG = {
  regular: {
    label: '正式劳动合同',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  },
  temporary: {
    label: '临时合同',
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
  },
  intern: {
    label: '实习协议',
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
  },
  consultant: {
    label: '顾问协议',
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
  },
};

const STATUS_CONFIG = {
  active: {
    label: '生效中',
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
    icon: CheckCircle,
  },
  expiring: {
    label: '即将到期',
    color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
    icon: AlertTriangle,
  },
  expired: {
    label: '已到期',
    color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
    icon: Clock,
  },
  terminated: {
    label: '已终止',
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    icon: FileText,
  },
};

const PROBATION_STATUS_CONFIG = {
  passed: {
    label: '已通过',
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
  },
  'in-progress': {
    label: '进行中',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  },
  failed: {
    label: '未通过',
    color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
  },
};

export default function ContractsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // 过滤合同
  const filteredContracts = useMemo(() => {
    let contracts = CONTRACTS_DATA;

    // 按类型过滤
    if (typeFilter !== 'all') {
      contracts = contracts.filter(c => c.contractType === typeFilter);
    }

    // 按状态过滤
    if (statusFilter !== 'all') {
      contracts = contracts.filter(c => c.status === statusFilter);
    }

    // 按搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      contracts = contracts.filter(c =>
        c.employeeName.toLowerCase().includes(query) ||
        c.employeeId.toLowerCase().includes(query) ||
        c.contractNo.toLowerCase().includes(query) ||
        c.department.toLowerCase().includes(query)
      );
    }

    return contracts;
  }, [searchQuery, typeFilter, statusFilter]);

  // 统计数据
  const stats = useMemo(() => {
    return {
      total: CONTRACTS_DATA.length,
      active: CONTRACTS_DATA.filter(c => c.status === 'active').length,
      expiring: CONTRACTS_DATA.filter(c => c.status === 'expiring').length,
      expired: CONTRACTS_DATA.filter(c => c.status === 'expired').length,
      totalSalary: CONTRACTS_DATA.filter(c => c.status === 'active').reduce((sum, c) => sum + c.salary, 0),
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            劳动合同管理
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            管理员工劳动合同、续签和到期提醒
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出数据
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新建合同
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>合同总数</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              生效中
            </CardDescription>
            <CardTitle className="text-3xl">{stats.active}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              即将到期
            </CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.expiring}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>生效合同月薪总额</CardDescription>
            <CardTitle className="text-3xl">
              ¥{(stats.totalSalary / 10000).toFixed(1)}万
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 即将到期提醒 */}
      {stats.expiring > 0 && (
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  有{stats.expiring}份劳动合同即将到期
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  请及时处理续签或终止手续,避免法律风险
                </p>
              </div>
              <Button size="sm" variant="outline">
                立即处理
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 合同列表 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <CardTitle>劳动合同列表</CardTitle>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索员工、合同号..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="合同类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {Object.entries(CONTRACT_TYPE_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {filteredContracts.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  暂无合同
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  当前筛选条件下没有劳动合同
                </p>
              </div>
            ) : (
              filteredContracts.map((contract) => {
                const typeConfig = CONTRACT_TYPE_CONFIG[contract.contractType];
                const statusConfig = STATUS_CONFIG[contract.status];
                const probationConfig = PROBATION_STATUS_CONFIG[contract.probationStatus];
                const StatusIcon = statusConfig.icon;

                // 计算合同进度
                const startDate = new Date(contract.startDate);
                const endDate = new Date(contract.endDate);
                const now = new Date();
                const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                const elapsedDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                const progress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);

                return (
                  <Card key={contract.id} className={`hover:shadow-md transition-shadow ${
                    contract.status === 'expiring' ? 'border-l-4 border-l-yellow-500' : ''
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* 员工信息 */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                            {contract.employeeName.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {contract.employeeName}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {contract.employeeId}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {contract.department} · {contract.position}
                            </p>
                          </div>
                        </div>

                        {/* 合同信息 */}
                        <div className="flex-1 min-w-0 px-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={typeConfig.color}>
                              {typeConfig.label}
                            </Badge>
                            <Badge variant="outline" className={statusConfig.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {contract.contractNo}
                          </p>
                        </div>

                        {/* 期限信息 */}
                        <div className="w-64 shrink-0 px-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            合同期限
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white mb-2">
                            {contract.startDate} ~ {contract.endDate}
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600 dark:text-gray-400">进度</span>
                              <span className="font-medium">{progress.toFixed(1)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        </div>

                        {/* 薪资和试用期 */}
                        <div className="w-40 shrink-0 px-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            月薪
                          </div>
                          <div className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            ¥{contract.salary.toLocaleString()}
                          </div>
                          <Badge variant="outline" className={probationConfig.color}>
                            试用期: {probationConfig.label}
                          </Badge>
                        </div>

                        {/* 剩余天数 */}
                        <div className="w-32 shrink-0 px-4 text-center">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            剩余天数
                          </div>
                          <div className={`text-3xl font-bold ${
                            contract.remainingDays <= 30
                              ? 'text-red-600'
                              : contract.remainingDays <= 90
                              ? 'text-yellow-600'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {contract.remainingDays}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">天</div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            查看
                          </Button>
                          {contract.status === 'expiring' && (
                            <Button size="sm" variant="outline" className="text-yellow-600 border-yellow-600 hover:bg-yellow-50">
                              <RefreshCw className="h-4 w-4 mr-1" />
                              续签
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            编辑
                          </Button>
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
