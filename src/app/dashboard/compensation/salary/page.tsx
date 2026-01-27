'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  DollarSign,
  Calculator,
  Download,
  Plus,
  Eye,
  Calendar,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Search,
  Filter,
  MoreVertical,
  FileText,
  Printer,
  RefreshCw,
} from 'lucide-react';

interface SalaryRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  employeeDepartment: string;
  employeePosition: string;
  period: string;
  baseSalary: number;
  performanceBonus: number;
  overtimePay: number;
  allowance: number;
  socialInsurance: number;
  housingFund: number;
  tax: number;
  totalDeduction: number;
  netSalary: number;
  status: 'draft' | 'calculated' | 'paid';
  payDate?: string;
  workDays: number;
  overtimeHours: number;
  leaveDays: number;
  createdAt: string;
  updatedAt: string;
}

export default function SalaryCalculation() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<SalaryRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SalaryRecord['status']>('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('2024-04');

  // 对话框状态
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SalaryRecord | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      setRecords([
        {
          id: '1',
          employeeId: 'EMP001',
          employeeName: '张三',
          employeeDepartment: '技术部',
          employeePosition: '高级前端工程师',
          period: '2024-04',
          baseSalary: 30000,
          performanceBonus: 5000,
          overtimePay: 1200,
          allowance: 2000,
          socialInsurance: 4500,
          housingFund: 3000,
          tax: 3500,
          totalDeduction: 11000,
          netSalary: 27200,
          status: 'paid',
          payDate: '2024-05-10',
          workDays: 22,
          overtimeHours: 8,
          leaveDays: 0,
          createdAt: '2024-04-30',
          updatedAt: '2024-05-10',
        },
        {
          id: '2',
          employeeId: 'EMP002',
          employeeName: '李四',
          employeeDepartment: '产品部',
          employeePosition: '高级产品经理',
          period: '2024-04',
          baseSalary: 40000,
          performanceBonus: 8000,
          overtimePay: 0,
          allowance: 3000,
          socialInsurance: 6000,
          housingFund: 4000,
          tax: 5200,
          totalDeduction: 15200,
          netSalary: 35800,
          status: 'paid',
          payDate: '2024-05-10',
          workDays: 22,
          overtimeHours: 0,
          leaveDays: 0,
          createdAt: '2024-04-30',
          updatedAt: '2024-05-10',
        },
        {
          id: '3',
          employeeId: 'EMP003',
          employeeName: '王五',
          employeeDepartment: '技术部',
          employeePosition: '后端工程师',
          period: '2024-04',
          baseSalary: 25000,
          performanceBonus: 3000,
          overtimePay: 1800,
          allowance: 1500,
          socialInsurance: 3750,
          housingFund: 2500,
          tax: 2800,
          totalDeduction: 9050,
          netSalary: 21250,
          status: 'calculated',
          workDays: 22,
          overtimeHours: 12,
          leaveDays: 0,
          createdAt: '2024-04-30',
          updatedAt: '2024-05-01',
        },
        {
          id: '4',
          employeeId: 'EMP004',
          employeeName: '赵六',
          employeeDepartment: '市场部',
          employeePosition: '市场专员',
          period: '2024-04',
          baseSalary: 20000,
          performanceBonus: 4000,
          overtimePay: 600,
          allowance: 1200,
          socialInsurance: 3000,
          housingFund: 2000,
          tax: 2100,
          totalDeduction: 7100,
          netSalary: 18700,
          status: 'calculated',
          workDays: 21,
          overtimeHours: 4,
          leaveDays: 1,
          createdAt: '2024-04-30',
          updatedAt: '2024-05-01',
        },
      ]);
      setLoading(false);
    };
    fetchRecords();
  }, [periodFilter]);

  const departments = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.employeeDepartment)));
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeePosition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || record.employeeDepartment === departmentFilter;
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [records, searchTerm, statusFilter, departmentFilter]);

  const totals = useMemo(() => {
    return filteredRecords.reduce(
      (acc, record) => ({
        baseSalary: acc.baseSalary + record.baseSalary,
        performanceBonus: acc.performanceBonus + record.performanceBonus,
        overtimePay: acc.overtimePay + record.overtimePay,
        allowance: acc.allowance + record.allowance,
        socialInsurance: acc.socialInsurance + record.socialInsurance,
        housingFund: acc.housingFund + record.housingFund,
        tax: acc.tax + record.tax,
        netSalary: acc.netSalary + record.netSalary,
        workDays: acc.workDays + record.workDays,
        overtimeHours: acc.overtimeHours + record.overtimeHours,
      }),
      {
        baseSalary: 0,
        performanceBonus: 0,
        overtimePay: 0,
        allowance: 0,
        socialInsurance: 0,
        housingFund: 0,
        tax: 0,
        netSalary: 0,
        workDays: 0,
        overtimeHours: 0,
      }
    );
  }, [filteredRecords]);

  const stats = useMemo(() => {
    const total = filteredRecords.length;
    const paid = filteredRecords.filter((r) => r.status === 'paid').length;
    const calculated = filteredRecords.filter((r) => r.status === 'calculated').length;
    const draft = filteredRecords.filter((r) => r.status === 'draft').length;

    return {
      total,
      paid,
      calculated,
      draft,
      avgSalary: total > 0 ? totals.netSalary / total : 0,
    };
  }, [filteredRecords, totals]);

  const getStatusBadge = (status: SalaryRecord['status']) => {
    const variants: Record<string, any> = {
      draft: 'secondary',
      calculated: 'default',
      paid: 'default' as const,
    };
    const labels: Record<string, string> = {
      draft: '草稿',
      calculated: '已计算',
      paid: '已发放',
    };
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      calculated: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
    };
    return <Badge className={colors[status]}>{labels[status]}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 animate-pulse bg-muted rounded" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse bg-muted rounded-lg" />
          ))}
        </div>
        <div className="h-96 animate-pulse bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">薪资管理</h1>
          <p className="text-muted-foreground mt-1">计算和管理员工薪资</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            高级筛选
          </Button>
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            打印
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
          <Button>
            <Calculator className="h-4 w-4 mr-2" />
            计算薪资
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">员工总数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">本月员工</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已发放</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
            <p className="text-xs text-muted-foreground mt-1">
              占比 {((stats.paid / stats.total) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均薪资</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.avgSalary)}</div>
            <p className="text-xs text-muted-foreground mt-1">人均实发</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总支出</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totals.netSalary)}</div>
            <p className="text-xs text-muted-foreground mt-1">本月总额</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>薪资明细 ({filteredRecords.length})</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索姓名、工号、职位..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={departmentFilter} onValueChange={(v) => setDepartmentFilter(v as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="部门" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部部门</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="calculated">已计算</SelectItem>
                  <SelectItem value="paid">已发放</SelectItem>
                </SelectContent>
              </Select>
              <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="月份" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-04">2024-04</SelectItem>
                  <SelectItem value="2024-03">2024-03</SelectItem>
                  <SelectItem value="2024-02">2024-02</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              没有找到匹配的薪资记录
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>员工</TableHead>
                    <TableHead>工号</TableHead>
                    <TableHead>部门</TableHead>
                    <TableHead>职位</TableHead>
                    <TableHead className="text-right">基本工资</TableHead>
                    <TableHead className="text-right">绩效</TableHead>
                    <TableHead className="text-right">加班</TableHead>
                    <TableHead className="text-right">津贴</TableHead>
                    <TableHead className="text-right">社保</TableHead>
                    <TableHead className="text-right">公积金</TableHead>
                    <TableHead className="text-right">个税</TableHead>
                    <TableHead className="text-right">实发工资</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{record.employeeName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{record.employeeName}</p>
                            <p className="text-xs text-muted-foreground">
                              工作{record.workDays}天 · 加班{record.overtimeHours}小时
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{record.employeeId}</TableCell>
                      <TableCell>{record.employeeDepartment}</TableCell>
                      <TableCell>{record.employeePosition}</TableCell>
                      <TableCell className="text-right">{formatCurrency(record.baseSalary)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(record.performanceBonus)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(record.overtimePay)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(record.allowance)}</TableCell>
                      <TableCell className="text-right text-red-600">-{formatCurrency(record.socialInsurance)}</TableCell>
                      <TableCell className="text-right text-red-600">-{formatCurrency(record.housingFund)}</TableCell>
                      <TableCell className="text-right text-red-600">-{formatCurrency(record.tax)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(record.netSalary)}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedRecord(record); setViewDialogOpen(true); }}>
                              <Eye className="h-4 w-4 mr-2" />
                              查看详情
                            </DropdownMenuItem>
                            {record.status === 'calculated' && (
                              <DropdownMenuItem>
                                <DollarSign className="h-4 w-4 mr-2" />
                                发放工资
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              导出工资条
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell colSpan={4}>合计</TableCell>
                    <TableCell className="text-right">{formatCurrency(totals.baseSalary)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totals.performanceBonus)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totals.overtimePay)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totals.allowance)}</TableCell>
                    <TableCell className="text-right text-red-600">-{formatCurrency(totals.socialInsurance)}</TableCell>
                    <TableCell className="text-right text-red-600">-{formatCurrency(totals.housingFund)}</TableCell>
                    <TableCell className="text-right text-red-600">-{formatCurrency(totals.tax)}</TableCell>
                    <TableCell className="text-right text-lg">{formatCurrency(totals.netSalary)}</TableCell>
                    <TableCell />
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>薪资详情</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-xl">{selectedRecord.employeeName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedRecord.employeeName}</h3>
                  <p className="text-muted-foreground">
                    {selectedRecord.employeePosition} · {selectedRecord.employeeDepartment}
                  </p>
                </div>
                <div className="ml-auto">{getStatusBadge(selectedRecord.status)}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">收入项</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">基本工资</span>
                      <span className="font-medium">{formatCurrency(selectedRecord.baseSalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">绩效奖金</span>
                      <span className="font-medium text-green-600">+{formatCurrency(selectedRecord.performanceBonus)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">加班费</span>
                      <span className="font-medium text-green-600">+{formatCurrency(selectedRecord.overtimePay)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">津贴补助</span>
                      <span className="font-medium text-green-600">+{formatCurrency(selectedRecord.allowance)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>应发工资</span>
                      <span>{formatCurrency(selectedRecord.baseSalary + selectedRecord.performanceBonus + selectedRecord.overtimePay + selectedRecord.allowance)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">扣除项</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">社会保险</span>
                      <span className="font-medium text-red-600">-{formatCurrency(selectedRecord.socialInsurance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">住房公积金</span>
                      <span className="font-medium text-red-600">-{formatCurrency(selectedRecord.housingFund)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">个人所得税</span>
                      <span className="font-medium text-red-600">-{formatCurrency(selectedRecord.tax)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>扣除合计</span>
                      <span className="text-red-600">-{formatCurrency(selectedRecord.totalDeduction)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">实发工资</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-lg">实发金额</span>
                    <span className="text-3xl font-bold text-green-600">
                      {formatCurrency(selectedRecord.netSalary)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div>
                  <p>薪资期间</p>
                  <p className="font-medium">{selectedRecord.period}</p>
                </div>
                <div>
                  <p>发放日期</p>
                  <p className="font-medium">{selectedRecord.payDate || '待发放'}</p>
                </div>
                <div>
                  <p>更新时间</p>
                  <p className="font-medium">{selectedRecord.updatedAt}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              关闭
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              导出工资条
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
