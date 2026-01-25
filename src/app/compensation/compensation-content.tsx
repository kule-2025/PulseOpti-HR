'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DollarSign,
  Calculator,
  TrendingUp,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  FileText,
  Shield,
  Building2,
  Calendar,
  PieChart,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/theme';

interface PayrollRecord {
  id: string;
  employeeName?: string;
  employeeDepartmentId?: string;
  baseSalary: number;
  overtimePay: number;
  bonus: number;
  allowance: number;
  deduction: number;
  socialInsurance: number;
  tax: number;
  grossPay: number;
  netPay: number;
  period: string;
  status: string;
  calculatedAt?: string;
  paidAt?: string;
  workflowInstanceId?: string;
  workflowStatus?: string;
  currentStep?: {
    id: string;
    name: string;
    status: string;
  };
}

interface PayrollStats {
  totalAmount: number;
  avgSalary: number;
  socialInsuranceTotal: number;
  pendingCount: number;
}

export default function CompensationContent() {
  const [activeTab, setActiveTab] = useState('salary');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 薪资数据
  const [salaries, setSalaries] = useState<PayrollRecord[]>([]);
  const [stats, setStats] = useState<PayrollStats | null>(null);

  // 计算弹窗
  const [calculateDialogOpen, setCalculateDialogOpen] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');

  // 模拟薪酬结构数据（可后续从API获取）
  const salaryStructure = [
    {
      type: '基本工资',
      description: '固定薪资部分',
      percentage: 50,
      color: 'from-blue-500 to-blue-600',
    },
    {
      type: '绩效奖金',
      description: '根据绩效考核结果发放',
      percentage: 25,
      color: 'from-purple-500 to-purple-600',
    },
    {
      type: '岗位津贴',
      description: '岗位特定补贴',
      percentage: 10,
      color: 'from-green-500 to-green-600',
    },
    {
      type: '其他补贴',
      description: '交通、餐饮、通讯等补贴',
      percentage: 15,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  // 模拟社保公积金数据（可后续从API获取）
  const socialInsuranceData = [
    {
      type: '养老保险',
      companyRate: 16,
      personalRate: 8,
      baseAmount: 15000,
      companyAmount: 2400,
      personalAmount: 1200,
    },
    {
      type: '医疗保险',
      companyRate: 6,
      personalRate: 2,
      baseAmount: 15000,
      companyAmount: 900,
      personalAmount: 300,
    },
    {
      type: '失业保险',
      companyRate: 0.5,
      personalRate: 0.5,
      baseAmount: 15000,
      companyAmount: 75,
      personalAmount: 75,
    },
    {
      type: '工伤保险',
      companyRate: 0.2,
      personalRate: 0,
      baseAmount: 15000,
      companyAmount: 30,
      personalAmount: 0,
    },
    {
      type: '生育保险',
      companyRate: 0.8,
      personalRate: 0,
      baseAmount: 15000,
      companyAmount: 120,
      personalAmount: 0,
    },
    {
      type: '住房公积金',
      companyRate: 12,
      personalRate: 12,
      baseAmount: 15000,
      companyAmount: 1800,
      personalAmount: 1800,
    },
  ];

  // 模拟薪资发放记录（可后续从API获取）
  const payrollHistory = [
    {
      id: 1,
      month: '2024-02',
      totalCount: 45,
      totalAmount: 985000,
      status: '已发放',
      payDate: '2024-02-15',
    },
    {
      id: 2,
      month: '2024-01',
      totalCount: 44,
      totalAmount: 962000,
      status: '已发放',
      payDate: '2024-01-15',
    },
    {
      id: 3,
      month: '2023-12',
      totalCount: 44,
      totalAmount: 962000,
      status: '已发放',
      payDate: '2023-12-15',
    },
  ];

  useEffect(() => {
    fetchPayrollData();
  }, []);

  // 获取薪资数据
  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 获取当前用户信息
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      if (!user?.companyId) {
        setError('未找到企业信息');
        return;
      }

      // 获取薪资记录
      const response = await fetch(`/api/compensation/payroll?companyId=${user.companyId}&limit=100`);
      const data = await response.json();

      if (data.success) {
        setSalaries(data.data || []);

        // 计算统计数据
        const records = data.data || [];
        const totalAmount = records.reduce((sum: number, r: PayrollRecord) => sum + r.netPay, 0);
        const avgSalary = records.length > 0 ? Math.floor(totalAmount / records.length) : 0;
        const socialInsuranceTotal = records.reduce((sum: number, r: PayrollRecord) => sum + r.socialInsurance, 0);
        const pendingCount = records.filter((item: any) => (r: PayrollRecord) => r.status === 'calculated' || r.status === 'pending').length;

        setStats({
          totalAmount,
          avgSalary,
          socialInsuranceTotal,
          pendingCount,
        });
      } else {
        setError(data.error || '获取薪资数据失败');
      }
    } catch (err) {
      console.error('获取薪资数据失败:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 计算工资
  const handleCalculatePayroll = async () => {
    if (!selectedMonth) return;

    try {
      setCalculating(true);

      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      if (!user?.companyId) {
        setError('未找到企业信息');
        return;
      }

      // 调用薪资计算API
      const response = await fetch('/api/compensation/payroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: user.companyId,
          period: selectedMonth,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 关闭弹窗
        setCalculateDialogOpen(false);
        // 重新加载数据
        await fetchPayrollData();
      } else {
        setError(data.error || '计算工资失败');
      }
    } catch (err) {
      console.error('计算工资失败:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setCalculating(false);
    }
  };

  // 统计数据
  const statCards = stats ? [
    {
      label: '本月发放总额',
      value: `¥${(stats.totalAmount / 100).toLocaleString()}`,
      change: '+2.3%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: '平均薪资',
      value: `¥${(stats.avgSalary / 100).toLocaleString()}`,
      change: '+1.8%',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: '社保公积金总额',
      value: `¥${(stats.socialInsuranceTotal / 100).toLocaleString()}`,
      change: '+0.5%',
      trend: 'up' as const,
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: '待发放薪资',
      value: stats.pendingCount.toString(),
      change: stats.pendingCount > 0 ? '0%' : '-100%',
      trend: stats.pendingCount > 0 ? 'down' : 'down' as const,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ] : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      case 'calculated':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return '已发放';
      case 'pending':
        return '待发放';
      case 'calculated':
        return '已计算';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return `¥${(amount / 100).toLocaleString()}`;
  };

  const formatPeriod = (period: string) => {
    const [year, month] = period.split('-');
    return `${year}年${month}月`;
  };

  return (
    <div className="space-y-6">
      {/* Loading状态 */}
      {loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">数据加载中...</p>
          </div>
        </div>
      )}

      {/* Error状态 */}
      {error && !loading && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchPayrollData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              重新加载
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* 正常内容 */}
      {!loading && !error && (
        <>
          {/* 页面头部 */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                薪酬管理
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                工资核算、社保公积金、个税管理
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setCalculateDialogOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Calculator className="mr-2 h-4 w-4" />
                计算工资
              </Button>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="border-2 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stat.value}
                        </p>
                      </div>
                      <div className={cn('rounded-full p-3', stat.bgColor)}>
                        <Icon className={cn('h-6 w-6', stat.color)} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="mr-1 h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingUp className="mr-1 h-4 w-4 text-red-600 rotate-180" />
                      )}
                      <span
                        className={cn(
                          'font-medium',
                          stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        {stat.change}
                      </span>
                      <span className="ml-1 text-gray-500 dark:text-gray-400">
                        较上月
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

      {/* 主内容区 - Tab切换 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white dark:bg-gray-800">
          <TabsTrigger value="salary" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
            <DollarSign className="mr-2 h-4 w-4" />
            薪资管理
          </TabsTrigger>
          <TabsTrigger value="structure" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
            <PieChart className="mr-2 h-4 w-4" />
            薪酬结构
          </TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
            <Shield className="mr-2 h-4 w-4" />
            社保公积金
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
            <Calendar className="mr-2 h-4 w-4" />
            发放记录
          </TabsTrigger>
        </TabsList>

        {/* 薪资管理 Tab */}
        <TabsContent value="salary" className="space-y-4">
          <Card className="border-2 bg-white dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle>本月薪资明细</CardTitle>
              <CardDescription>
                {salaries.length > 0 ? `${formatPeriod(salaries[0]?.period || '')}员工薪资详情` : '薪资明细'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {salaries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-2">暂无薪资数据</p>
                  <p className="text-sm text-gray-400">点击右上角"计算工资"开始计算</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>员工姓名</TableHead>
                        <TableHead>应发工资</TableHead>
                        <TableHead>社保公积金</TableHead>
                        <TableHead>个税</TableHead>
                        <TableHead>实发工资</TableHead>
                        <TableHead>计算日期</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>工作流状态</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salaries.map((salary) => (
                        <TableRow key={salary.id}>
                          <TableCell className="font-medium">
                            {salary.employeeName || '未知员工'}
                          </TableCell>
                          <TableCell className="text-green-600 font-medium">
                            {formatCurrency(salary.grossPay)}
                          </TableCell>
                          <TableCell className="text-orange-600">
                            {formatCurrency(salary.socialInsurance + salary.tax)}
                          </TableCell>
                          <TableCell className="text-red-600">
                            {formatCurrency(salary.tax)}
                          </TableCell>
                          <TableCell className="text-blue-600 font-bold">
                            {formatCurrency(salary.netPay)}
                          </TableCell>
                          <TableCell>
                            {salary.calculatedAt
                              ? new Date(salary.calculatedAt).toLocaleDateString('zh-CN')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(salary.status)}>
                              {getStatusText(salary.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {salary.workflowStatus && (
                              <Badge
                                className={
                                  salary.workflowStatus === 'completed'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-blue-100 text-blue-700'
                                }
                              >
                                {salary.workflowStatus === 'completed' ? '已完成' : '进行中'}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 薪酬结构 Tab */}
        <TabsContent value="structure" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 薪酬结构饼图 */}
            <Card className="border-2 bg-white dark:border-gray-700 dark:bg-gray-800">
              <CardHeader>
                <CardTitle>薪酬结构分布</CardTitle>
                <CardDescription>各项薪酬构成比例</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salaryStructure.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item.type}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">{item.percentage}%</span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div
                          className={cn('h-full rounded-full bg-gradient-to-r', item.color)}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 薪酬结构说明 */}
            <Card className="border-2 bg-white dark:border-gray-700 dark:bg-gray-800">
              <CardHeader>
                <CardTitle>薪酬结构说明</CardTitle>
                <CardDescription>各组成部分详细说明</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-blue-600 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">基本工资</h4>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          员工固定薪资部分，根据职位级别和员工能力确定，每月固定发放。
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-950/20">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-purple-600 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">绩效奖金</h4>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          根据绩效考核结果发放，与个人业绩和公司业绩挂钩，体现多劳多得。
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/20">
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-green-600 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">岗位津贴</h4>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          特定岗位的补贴，如技术岗、管理岗等，根据岗位性质确定。
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-950/20">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-orange-600 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">其他补贴</h4>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          交通、餐饮、通讯等补贴，根据公司政策确定。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 社保公积金 Tab */}
        <TabsContent value="social" className="space-y-4">
          <Card className="border-2 bg-white dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle>社保公积金明细</CardTitle>
              <CardDescription>五险一金缴费详情</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>保险类型</TableHead>
                      <TableHead>企业费率</TableHead>
                      <TableHead>个人费率</TableHead>
                      <TableHead>缴费基数</TableHead>
                      <TableHead>企业缴费</TableHead>
                      <TableHead>个人缴费</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {socialInsuranceData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.type}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-blue-600 text-blue-600">
                            {item.companyRate}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-purple-600 text-purple-600">
                            {item.personalRate}%
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(item.baseAmount)}</TableCell>
                        <TableCell className="text-blue-600 font-medium">
                          {formatCurrency(item.companyAmount)}
                        </TableCell>
                        <TableCell className="text-purple-600 font-medium">
                          {formatCurrency(item.personalAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex items-start gap-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
                <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-semibold mb-1">温馨提示</p>
                  <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                    <li>• 社保公积金缴费基数按照当地政策规定执行</li>
                    <li>• 企业缴费部分完全由公司承担，不计入个人收入</li>
                    <li>• 个人缴费部分从工资中代扣代缴</li>
                    <li>• 具体费率可能因地区政策不同而有所差异</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 发放记录 Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card className="border-2 bg-white dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle>薪资发放记录</CardTitle>
              <CardDescription>历史薪资发放明细</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>月份</TableHead>
                      <TableHead>发放人数</TableHead>
                      <TableHead>发放总额</TableHead>
                      <TableHead>发放日期</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.month}</TableCell>
                        <TableCell>{record.totalCount} 人</TableCell>
                        <TableCell className="font-bold text-green-600">
                          {formatCurrency(record.totalAmount)}
                        </TableCell>
                        <TableCell>{record.payDate}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 计算工资弹窗 */}
      <Dialog open={calculateDialogOpen} onOpenChange={setCalculateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>工资计算</DialogTitle>
            <DialogDescription>
              计算员工工资，支持批量计算
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="month">计算月份</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger id="month">
                  <SelectValue placeholder="选择月份" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-02">2024年2月</SelectItem>
                  <SelectItem value="2024-03">2024年3月</SelectItem>
                  <SelectItem value="2024-04">2024年4月</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
              <div className="flex items-start gap-3">
                <Calculator className="h-5 w-5 text-blue-600 shrink-0" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-semibold mb-1">计算说明</p>
                  <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                    <li>• 应发工资 = 基本工资 + 绩效奖金 + 岗位津贴 + 其他补贴</li>
                    <li>• 社保公积金 = 养老保险 + 医疗保险 + 失业保险 + 工伤保险 + 生育保险 + 住房公积金</li>
                    <li>• 个人所得税 = (应发工资 - 社保公积金 - 起征点) × 税率 - 速算扣除数</li>
                    <li>• 实发工资 = 应发工资 - 社保公积金 - 个人所得税</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCalculateDialogOpen(false)}>
              取消
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600"
              disabled={!selectedMonth || calculating}
              onClick={handleCalculatePayroll}
            >
              {calculating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  计算中...
                </>
              ) : (
                '开始计算'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
    )}
    </div>
  );
}
