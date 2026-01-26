'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/loading';
import {
  Calculator,
  Download,
  Upload,
  Search,
  Filter,
  FileText,
  CheckCircle2,
  Clock,
  Eye,
  Edit3,
  Save,
  RefreshCw,
  Users,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/theme';

// 性能优化工具
import { useDebounce, useLocalStorage, useAsync } from '@/hooks/use-performance';
import { fetchWithCache } from '@/lib/cache/memory-cache';
import { get, post } from '@/lib/request/request';
import monitor from '@/lib/performance/monitor';

interface SalaryData {
  id: number;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  baseSalary: number;
  performanceBonus: number;
  positionAllowance: number;
  transportationAllowance: number;
  mealAllowance: number;
  communicationAllowance: number;
  totalGross: number;
  socialInsurance: number;
  housingFund: number;
  taxableIncome: number;
  incomeTax: number;
  netSalary: number;
  status: string;
  calculatedAt: string;
}

export default function SalaryCalculationContent() {
  const [selectedMonth, setSelectedMonth] = useLocalStorage('salary-month', '2024-02');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedKeyword] = useDebounce(searchKeyword, 300);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState('detail');

  // 使用 useAsync 管理数据获取
  const loadData = useCallback(async (): Promise<SalaryData[]> => {
    try {
      const cacheKey = `salary-calculation-${selectedMonth}-${selectedDepartment}-${selectedStatus}`;
      return await fetchWithCache<SalaryData[]>(cacheKey, async () => {
        const params = new URLSearchParams({
          month: selectedMonth,
          ...(selectedDepartment !== 'all' && { department: selectedDepartment }),
          ...(selectedStatus !== 'all' && { status: selectedStatus }),
        });

        const response = await get<{ success: boolean; data?: SalaryData[] }>(
          `/api/compensation/salary-calculation?${params.toString()}`
        );

        return response.data ? (response.data as unknown as SalaryData[]) : [];
      }, 5 * 60 * 1000); // 5分钟缓存
    } catch (error) {
      console.error('获取薪资数据失败:', error);
      monitor.trackError('fetchSalaryData', error as Error);
      throw error;
    }
  }, [selectedMonth, selectedDepartment, selectedStatus]);

  // 获取薪资数据
  const {
    data: salaryData = [],
    loading,
    error,
    execute: fetchSalaryData,
  } = useAsync<SalaryData[]>();

  // 当筛选条件变化时重新加载数据
  useEffect(() => {
    fetchSalaryData(loadData);
  }, [selectedMonth, selectedDepartment, selectedStatus, fetchSalaryData, loadData]);

  // 部门数据
  const departments = useMemo(() => [
    { id: 'all', name: '全部部门' },
    { id: 'sales', name: '销售部' },
    { id: 'tech', name: '技术部' },
    { id: 'product', name: '产品部' },
    { id: 'marketing', name: '市场部' },
  ], []);

  // 过滤数据
  const filteredData = useMemo(() => {
    if (!debouncedKeyword) return salaryData || [];

    return (salaryData || []).filter((item: any) =>
      item.employeeName.toLowerCase().includes(debouncedKeyword.toLowerCase()) ||
      item.employeeId.toLowerCase().includes(debouncedKeyword.toLowerCase())
    );
  }, [salaryData, debouncedKeyword]);

  // 统计数据
  const stats = useMemo(() => {
    const safeData = salaryData || [];
    const calculatedCount = safeData.filter((item: any) => item => item.status === '已核算').length;
    const pendingCount = safeData.filter((item: any) => item => item.status === '待核算').length;
    const totalGross = safeData.reduce((sum, item) => sum + item.totalGross, 0);
    const totalNet = safeData.reduce((sum, item) => sum + item.netSalary, 0);

    return [
      {
        label: '本月应发总额',
        value: `¥${totalGross.toLocaleString()}`,
        icon: DollarSign,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      },
      {
        label: '实发总额',
        value: `¥${totalNet.toLocaleString()}`,
        icon: CheckCircle2,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      },
      {
        label: '已核算人数',
        value: calculatedCount,
        total: (salaryData || []).length,
        icon: Users,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
      },
      {
        label: '待核算人数',
        value: pendingCount,
        icon: Clock,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
      },
    ];
  }, [salaryData]);

  const handleCalculate = useCallback(async () => {
    try {
      setIsCalculating(true);

      const response = await post<{ success: boolean; message?: string }>(
        '/api/compensation/salary-calculation/calculate',
        {
          month: selectedMonth,
          employeeIds: selectedEmployees.length > 0 ? selectedEmployees : undefined,
        }
      );

      if (response.success) {
        await fetchSalaryData(loadData);
      }
    } catch (error) {
      console.error('核算失败:', error);
      monitor.trackError('calculateSalary', error as Error);
    } finally {
      setIsCalculating(false);
    }
  }, [selectedMonth, selectedEmployees, fetchSalaryData]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case '已核算':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case '待核算':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="h-5 w-5" />
              <span>加载失败: {error.message}</span>
            </div>
            <Button onClick={() => fetchSalaryData(loadData)} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">工资核算</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            批量核算员工工资，支持自定义计算规则
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            导入考勤数据
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            导出Excel
          </Button>
          <Button
            size="sm"
            onClick={handleCalculate}
            disabled={isCalculating}
          >
            <Calculator className="mr-2 h-4 w-4" />
            {isCalculating ? '核算中...' : '批量核算'}
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <div className={cn('rounded-lg p-2', stat.bgColor)}>
                  <stat.icon className={cn('h-4 w-4', stat.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.value}
                  {stat.total !== undefined && (
                    <span className="text-sm font-normal text-gray-500"> / {stat.total}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 筛选区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            筛选条件
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>核算月份</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-02">2024年2月</SelectItem>
                  <SelectItem value="2024-01">2024年1月</SelectItem>
                  <SelectItem value="2023-12">2023年12月</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>部门</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>核算状态</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="calculated">已核算</SelectItem>
                  <SelectItem value="pending">待核算</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>搜索</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索员工姓名或工号"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 薪资明细表格 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>薪资明细</CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                id="selectAll"
                checked={selectedEmployees.length === (filteredData?.length || 0) && (filteredData?.length || 0) > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedEmployees(filteredData?.map(item => item.id) || []);
                  } else {
                    setSelectedEmployees([]);
                  }
                }}
              />
              <Label htmlFor="selectAll" className="text-sm">全选</Label>
            </div>
          </div>
          <CardDescription>
            共 {filteredData?.length || 0} 条记录
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="detail">详细明细</TabsTrigger>
              <TabsTrigger value="summary">汇总视图</TabsTrigger>
            </TabsList>
            <TabsContent value="detail">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : !filteredData || filteredData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">暂无数据</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox />
                        </TableHead>
                        <TableHead>员工信息</TableHead>
                        <TableHead>基本工资</TableHead>
                        <TableHead>绩效奖金</TableHead>
                        <TableHead>岗位津贴</TableHead>
                        <TableHead>其他补贴</TableHead>
                        <TableHead>应发工资</TableHead>
                        <TableHead>社保公积金</TableHead>
                        <TableHead>个人所得税</TableHead>
                        <TableHead>实发工资</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedEmployees.includes(item.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedEmployees([...selectedEmployees, item.id]);
                                } else {
                                  setSelectedEmployees(selectedEmployees.filter((item: any) => id => id !== item.id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.employeeName}</div>
                              <div className="text-xs text-gray-500">{item.employeeId} · {item.department}</div>
                            </div>
                          </TableCell>
                          <TableCell>¥{item.baseSalary.toLocaleString()}</TableCell>
                          <TableCell>¥{item.performanceBonus.toLocaleString()}</TableCell>
                          <TableCell>¥{item.positionAllowance.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="text-xs space-y-0.5">
                              <div>交通: ¥{item.transportationAllowance}</div>
                              <div>餐费: ¥{item.mealAllowance}</div>
                              <div>通讯: ¥{item.communicationAllowance}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">¥{item.totalGross.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="text-xs space-y-0.5">
                              <div>社保: ¥{item.socialInsurance}</div>
                              <div>公积金: ¥{item.housingFund}</div>
                            </div>
                          </TableCell>
                          <TableCell>¥{item.incomeTax.toLocaleString()}</TableCell>
                          <TableCell className="font-medium text-green-600">¥{item.netSalary.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            <TabsContent value="summary">
              {/* 汇总视图 */}
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">部门汇总</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <Skeleton className="h-40" />
                      ) : (
                        <div className="space-y-2">
                          {departments.filter((item: any) => d => d.id !== 'all').map(dept => {
                            const deptData = salaryData.filter((item: any) => item => item.department === dept.name);
                            return (
                              <div key={dept.id} className="flex justify-between items-center py-2 border-b">
                                <span className="text-sm">{dept.name}</span>
                                <span className="text-sm font-medium">{deptData.length}人</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">工资区间分布</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <Skeleton className="h-40" />
                      ) : (
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="text-gray-600">10K以下:</span>
                            <span className="ml-2 font-medium">{salaryData.filter((item: any) => s => s.netSalary < 10000).length}人</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">10K-20K:</span>
                            <span className="ml-2 font-medium">{salaryData.filter((item: any) => s => s.netSalary >= 10000 && s.netSalary < 20000).length}人</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">20K-30K:</span>
                            <span className="ml-2 font-medium">{salaryData.filter((item: any) => s => s.netSalary >= 20000 && s.netSalary < 30000).length}人</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">30K以上:</span>
                            <span className="ml-2 font-medium">{salaryData.filter((item: any) => s => s.netSalary >= 30000).length}人</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">快速操作</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start" size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          保存草稿
                        </Button>
                        <Button variant="outline" className="w-full justify-start" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          生成工资条
                        </Button>
                        <Button variant="outline" className="w-full justify-start" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          导出详细报表
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
