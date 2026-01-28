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
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Calculator,
  FileText,
  Calendar,
  Download,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface PayrollRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  position: string;
  month: string;
  basicSalary: number;
  performanceSalary: number;
  bonus: number;
  overtimePay: number;
  subsidy: number;
  socialInsurance: number;
  housingFund: number;
  tax: number;
  deduction: number;
  netSalary: number;
  status: 'pending' | 'calculated' | 'approved' | 'paid';
  workDays: number;
  overtimeHours: number;
}

// 模拟工资数据
const PAYROLL_DATA: PayrollRecord[] = [
  {
    id: '1',
    employeeName: '张三',
    employeeId: 'EMP001',
    department: '技术部',
    position: '高级前端工程师',
    month: '2025-01',
    basicSalary: 20000,
    performanceSalary: 5000,
    bonus: 3000,
    overtimePay: 2000,
    subsidy: 1000,
    socialInsurance: 3200,
    housingFund: 2400,
    tax: 1500,
    deduction: 0,
    netSalary: 20900,
    status: 'paid',
    workDays: 22,
    overtimeHours: 20,
  },
  {
    id: '2',
    employeeName: '李四',
    employeeId: 'EMP002',
    department: '销售部',
    position: '销售经理',
    month: '2025-01',
    basicSalary: 25000,
    performanceSalary: 10000,
    bonus: 15000,
    overtimePay: 1500,
    subsidy: 1000,
    socialInsurance: 4000,
    housingFund: 3000,
    tax: 3500,
    deduction: 0,
    netSalary: 37000,
    status: 'paid',
    workDays: 22,
    overtimeHours: 15,
  },
  {
    id: '3',
    employeeName: '王五',
    employeeId: 'EMP003',
    department: '市场部',
    position: '市场专员',
    month: '2025-01',
    basicSalary: 12000,
    performanceSalary: 3000,
    bonus: 2000,
    overtimePay: 0,
    subsidy: 500,
    socialInsurance: 1920,
    housingFund: 1440,
    tax: 800,
    deduction: 200,
    netSalary: 10140,
    status: 'paid',
    workDays: 21,
    overtimeHours: 0,
  },
  {
    id: '4',
    employeeName: '赵六',
    employeeId: 'EMP004',
    department: '技术部',
    position: '后端工程师',
    month: '2025-01',
    basicSalary: 18000,
    performanceSalary: 4500,
    bonus: 2000,
    overtimePay: 1000,
    subsidy: 800,
    socialInsurance: 2880,
    housingFund: 2160,
    tax: 1200,
    deduction: 0,
    netSalary: 18060,
    status: 'paid',
    workDays: 22,
    overtimeHours: 10,
  },
  {
    id: '5',
    employeeName: '孙七',
    employeeId: 'EMP005',
    department: '人力资源部',
    position: 'HR助理',
    month: '2025-01',
    basicSalary: 8000,
    performanceSalary: 2000,
    bonus: 1000,
    overtimePay: 500,
    subsidy: 500,
    socialInsurance: 1280,
    housingFund: 960,
    tax: 400,
    deduction: 0,
    netSalary: 7360,
    status: 'paid',
    workDays: 22,
    overtimeHours: 5,
  },
  {
    id: '6',
    employeeName: '周八',
    employeeId: 'EMP006',
    department: '技术部',
    position: '系统架构师',
    month: '2025-01',
    basicSalary: 35000,
    performanceSalary: 10000,
    bonus: 8000,
    overtimePay: 3000,
    subsidy: 1500,
    socialInsurance: 5600,
    housingFund: 4200,
    tax: 4500,
    deduction: 0,
    netSalary: 39200,
    status: 'paid',
    workDays: 22,
    overtimeHours: 25,
  },
];

const STATUS_CONFIG = {
  pending: {
    label: '待计算',
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    icon: Clock,
  },
  calculated: {
    label: '已计算',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
    icon: Calculator,
  },
  approved: {
    label: '已审批',
    color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
    icon: CheckCircle,
  },
  paid: {
    label: '已发放',
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
    icon: CheckCircle,
  },
};

export default function SalaryCalculationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('2025-01');

  // 过滤工资记录
  const filteredPayroll = useMemo(() => {
    let payroll = PAYROLL_DATA;

    // 按部门过滤
    if (departmentFilter !== 'all') {
      payroll = payroll.filter(p => p.department === departmentFilter);
    }

    // 按状态过滤
    if (statusFilter !== 'all') {
      payroll = payroll.filter(p => p.status === statusFilter);
    }

    // 按月份过滤
    if (monthFilter !== 'all') {
      payroll = payroll.filter(p => p.month === monthFilter);
    }

    // 按搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      payroll = payroll.filter(p =>
        p.employeeName.toLowerCase().includes(query) ||
        p.employeeId.toLowerCase().includes(query) ||
        p.position.toLowerCase().includes(query)
      );
    }

    return payroll;
  }, [searchQuery, departmentFilter, statusFilter, monthFilter]);

  // 统计数据
  const stats = useMemo(() => {
    const filtered = PAYROLL_DATA.filter(p => p.month === monthFilter);
    return {
      totalEmployees: filtered.length,
      totalGrossSalary: filtered.reduce((sum, p) => sum + p.basicSalary + p.performanceSalary + p.bonus + p.overtimePay + p.subsidy, 0),
      totalNetSalary: filtered.reduce((sum, p) => sum + p.netSalary, 0),
      totalTax: filtered.reduce((sum, p) => sum + p.tax, 0),
      avgSalary: filtered.reduce((sum, p) => sum + p.netSalary, 0) / filtered.length || 0,
    };
  }, [monthFilter]);

  // 获取所有部门
  const departments = useMemo(() => {
    return Array.from(new Set(PAYROLL_DATA.map(record => record.department)));
  }, []);

  // 获取所有月份
  const months = useMemo(() => {
    return Array.from(new Set(PAYROLL_DATA.map(record => record.month)));
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            工资核算
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            月度工资计算、审批和发放管理
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出数据
          </Button>
          <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            <Calculator className="h-4 w-4 mr-2" />
            开始计算
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>发放人数</CardDescription>
            <CardTitle className="text-3xl">{stats.totalEmployees}</CardTitle>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {monthFilter}月
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>税前总额</CardDescription>
            <CardTitle className="text-3xl">
              ¥{(stats.totalGrossSalary / 10000).toFixed(1)}万
            </CardTitle>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              含奖金、补贴
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>实发总额</CardDescription>
            <CardTitle className="text-3xl">
              ¥{(stats.totalNetSalary / 10000).toFixed(1)}万
            </CardTitle>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              扣除社保个税后
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>人均实发</CardDescription>
            <CardTitle className="text-3xl">
              ¥{(stats.avgSalary).toFixed(0)}
            </CardTitle>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              平均工资
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* 工资明细 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <CardTitle>工资明细</CardTitle>

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

              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="月份" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部月份</SelectItem>
                  {months.map(month => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="部门" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部部门</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
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
            {filteredPayroll.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <DollarSign className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  暂无工资记录
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  当前筛选条件下没有工资记录
                </p>
              </div>
            ) : (
              filteredPayroll.map((record) => {
                const statusConfig = STATUS_CONFIG[record.status];

                return (
                  <Card key={record.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* 员工信息 */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                            {record.employeeName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {record.employeeName}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {record.employeeId}
                              </Badge>
                              <Badge variant="outline" className={statusConfig.color}>
                                {statusConfig.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {record.department} · {record.position}
                            </p>
                          </div>
                        </div>

                        {/* 工资构成 */}
                        <div className="grid grid-cols-4 gap-4 px-4">
                          <div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                              基本工资
                            </div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              ¥{record.basicSalary.toLocaleString()}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                              绩效奖金
                            </div>
                            <div className="font-semibold text-green-600">
                              +¥{(record.performanceSalary + record.bonus).toLocaleString()}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                              社保个税
                            </div>
                            <div className="font-semibold text-red-600">
                              -¥{(record.socialInsurance + record.housingFund + record.tax).toLocaleString()}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                              实发工资
                            </div>
                            <div className="text-xl font-bold text-gray-900 dark:text-white">
                              ¥{record.netSalary.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* 工作数据 */}
                        <div className="w-40 shrink-0 px-4">
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            出勤数据
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900 dark:text-white">
                              工作日: {record.workDays}天
                            </div>
                            <div className="text-sm text-gray-900 dark:text-white">
                              加班: {record.overtimeHours}小时
                            </div>
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            详情
                          </Button>
                          {record.status !== 'paid' && (
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4 mr-1" />
                              编辑
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
