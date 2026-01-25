'use client';

import { useState, useEffect } from 'react';
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
  DialogHeader,
  DialogTitle,
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
  const [records, setRecords] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | SalaryRecord['status']>('all');
  const [periodFilter, setPeriodFilter] = useState('2024-01');

  // 对话框状态
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SalaryRecord | null>(null);

  // 获取工资记录
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/compensation/salary?companyId=demo-company&period=${periodFilter}`);
      const data = await response.json();
      if (data.success) {
        setRecords(data.data || []);
      }
    } catch (error) {
      console.error('获取工资记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 计算工资
  const calculateSalary = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/compensation/salary/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: 'demo-company',
          period: periodFilter,
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchRecords();
      }
    } catch (error) {
      console.error('计算工资失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 批量发放工资
  const batchPay = async () => {
    if (!confirm('确定要批量发放工资吗？')) return;

    try {
      const response = await fetch('/api/compensation/salary/batch-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: 'demo-company',
          period: periodFilter,
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchRecords();
        alert('批量发放成功');
      }
    } catch (error) {
      console.error('批量发放失败:', error);
    }
  };

  // 导出工资表
  const exportSalary = async () => {
    try {
      const response = await fetch('/api/compensation/salary/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: 'demo-company',
          period: periodFilter,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `salary-${periodFilter}.xlsx`;
        a.click();
      }
    } catch (error) {
      console.error('导出失败:', error);
    }
  };

  // 查看详情
  const viewDetail = (record: SalaryRecord) => {
    setSelectedRecord(record);
    setViewDialogOpen(true);
  };

  // 获取状态徽章
  const getStatusBadge = (status: SalaryRecord['status']) => {
    const variants: Record<string, any> = {
      draft: 'secondary',
      calculated: 'default',
      paid: 'default',
    };
    const labels: Record<string, string> = {
      draft: '草稿',
      calculated: '已计算',
      paid: '已发放',
    };
    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  // 计算总计
  const calculateTotals = () => {
    return records.reduce(
      (acc, record) => ({
        baseSalary: acc.baseSalary + record.baseSalary,
        performanceBonus: acc.performanceBonus + record.performanceBonus,
        overtimePay: acc.overtimePay + record.overtimePay,
        allowance: acc.allowance + record.allowance,
        totalDeduction: acc.totalDeduction + record.totalDeduction,
        netSalary: acc.netSalary + record.netSalary,
      }),
      {
        baseSalary: 0,
        performanceBonus: 0,
        overtimePay: 0,
        allowance: 0,
        totalDeduction: 0,
        netSalary: 0,
      }
    );
  };

  const totals = calculateTotals();

  useEffect(() => {
    fetchRecords();
  }, [periodFilter]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">工资核算</h1>
          <p className="text-muted-foreground mt-1">
            计算和管理员工工资发放
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportSalary}>
            <Download className="h-4 w-4 mr-2" />
            导出工资表
          </Button>
          <Button onClick={calculateSalary} disabled={loading}>
            <Calculator className="h-4 w-4 mr-2" />
            {loading ? '计算中...' : '计算工资'}
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">员工数</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">基本工资总额</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals.baseSalary.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">奖金总额</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals.performanceBonus.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">扣除总额</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals.totalDeduction.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">实发总额</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals.netSalary.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和操作 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div>
                <Label>周期</Label>
                <Input
                  type="month"
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>状态</Label>
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger className="w-32 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="draft">草稿</SelectItem>
                    <SelectItem value="calculated">已计算</SelectItem>
                    <SelectItem value="paid">已发放</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {records.length > 0 && records.every(r => r.status === 'calculated') && (
              <Button onClick={batchPay}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                批量发放
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>员工</TableHead>
                <TableHead>部门</TableHead>
                <TableHead>职位</TableHead>
                <TableHead>基本工资</TableHead>
                <TableHead>绩效奖金</TableHead>
                <TableHead>加班费</TableHead>
                <TableHead>补贴</TableHead>
                <TableHead>扣除</TableHead>
                <TableHead>实发工资</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center">
                    暂无工资记录，请选择周期并点击"计算工资"
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarFallback>{record.employeeName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{record.employeeName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{record.employeeDepartment}</TableCell>
                    <TableCell>{record.employeePosition}</TableCell>
                    <TableCell>{record.baseSalary.toLocaleString()}</TableCell>
                    <TableCell>{record.performanceBonus.toLocaleString()}</TableCell>
                    <TableCell>{record.overtimePay.toLocaleString()}</TableCell>
                    <TableCell>{record.allowance.toLocaleString()}</TableCell>
                    <TableCell className="text-red-600">
                      -{record.totalDeduction.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {record.netSalary.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewDetail(record)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        查看
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 详情对话框 */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>工资详情</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{selectedRecord.employeeName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{selectedRecord.employeeName}</div>
                      <div className="text-sm text-gray-500">{selectedRecord.employeeDepartment} - {selectedRecord.employeePosition}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">实发工资</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedRecord.netSalary.toLocaleString()} 元
                    </div>
                  </div>
                </div>
              </div>

              {/* 考勤信息 */}
              <div>
                <h3 className="font-semibold mb-3">考勤信息</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedRecord.workDays}</div>
                    <div className="text-sm text-gray-600">工作天数</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedRecord.overtimeHours}</div>
                    <div className="text-sm text-gray-600">加班小时</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">{selectedRecord.leaveDays}</div>
                    <div className="text-sm text-gray-600">请假天数</div>
                  </div>
                </div>
              </div>

              {/* 收入明细 */}
              <div>
                <h3 className="font-semibold mb-3">收入明细</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>基本工资</span>
                    <span className="font-medium">{selectedRecord.baseSalary.toLocaleString()} 元</span>
                  </div>
                  <div className="flex justify-between">
                    <span>绩效奖金</span>
                    <span className="font-medium text-green-600">+{selectedRecord.performanceBonus.toLocaleString()} 元</span>
                  </div>
                  <div className="flex justify-between">
                    <span>加班费</span>
                    <span className="font-medium text-green-600">+{selectedRecord.overtimePay.toLocaleString()} 元</span>
                  </div>
                  <div className="flex justify-between">
                    <span>补贴</span>
                    <span className="font-medium text-green-600">+{selectedRecord.allowance.toLocaleString()} 元</span>
                  </div>
                </div>
              </div>

              {/* 扣除明细 */}
              <div>
                <h3 className="font-semibold mb-3">扣除明细</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>社保</span>
                    <span className="font-medium text-red-600">-{selectedRecord.socialInsurance.toLocaleString()} 元</span>
                  </div>
                  <div className="flex justify-between">
                    <span>公积金</span>
                    <span className="font-medium text-red-600">-{selectedRecord.housingFund.toLocaleString()} 元</span>
                  </div>
                  <div className="flex justify-between">
                    <span>个税</span>
                    <span className="font-medium text-red-600">-{selectedRecord.tax.toLocaleString()} 元</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">总扣除</span>
                    <span className="font-semibold text-red-600">-{selectedRecord.totalDeduction.toLocaleString()} 元</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
