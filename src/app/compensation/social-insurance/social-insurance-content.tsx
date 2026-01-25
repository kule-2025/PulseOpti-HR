'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/loading';
import {
  Shield,
  Building2,
  Calendar,
  Calculator,
  Download,
  Upload,
  Plus,
  Eye,
  Edit3,
  AlertCircle,
  CheckCircle2,
  Search,
  FileText,
  TrendingUp,
  PieChart,
  RefreshCw,
  User,
  Wallet,
} from 'lucide-react';

// 性能优化工具
import { useLocalStorage, useDebounce, useAsync } from '@/hooks/use-performance';
import { fetchWithCache } from '@/lib/cache/memory-cache';
import { get, post, put } from '@/lib/request/request';
import monitor from '@/lib/performance/monitor';

interface InsuranceType {
  id: string;
  name: string;
  companyRate: number;
  personalRate: number;
  baseAmount: number;
  companyAmount: number;
  personalAmount: number;
  totalAmount: number;
  description: string;
  status: string;
}

interface InsuranceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  month: string;
  pension: number;
  medical: number;
  unemployment: number;
  injury: number;
  maternity: number;
  housing: number;
  totalCompany: number;
  totalPersonal: number;
  totalAmount: number;
  status: 'pending' | 'calculated' | 'paid';
}

export default function SocialInsuranceContent() {
  const [activeTab, setActiveTab] = useLocalStorage('insurance-tab', 'overview');
  const [selectedMonth, setSelectedMonth] = useLocalStorage('insurance-month', '2024-02');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  // 加载社保类型
  const {
    data: insuranceTypes = [],
    loading: typesLoading,
    error: typesError,
    execute: fetchInsuranceTypes,
  } = useAsync<InsuranceType[]>();

  // 加载社保记录
  const {
    data: insuranceRecords = [],
    loading: recordsLoading,
    error: recordsError,
    execute: fetchInsuranceRecords,
  } = useAsync<InsuranceRecord[]>();

  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalCompany: 0,
    totalPersonal: 0,
    totalAmount: 0,
  });

  const loadInsuranceTypes = useCallback(async (): Promise<InsuranceType[]> => {
    try {
      const cacheKey = 'insurance-types';
      return await fetchWithCache<InsuranceType[]>(cacheKey, async () => {
        const response = await get<{ success: boolean; data?: InsuranceType[] }>(
          '/api/compensation/insurance/types'
        );

        return (response.data as any) || [];
      }, 10 * 60 * 1000);
    } catch (err) {
      console.error('加载社保类型失败:', err);
      monitor.trackError('loadInsuranceTypes', err as Error);
      throw err;
    }
  }, []);

  const loadInsuranceRecords = useCallback(async (): Promise<InsuranceRecord[]> => {
    try {
      const cacheKey = `insurance-records-${selectedMonth}`;
      return await fetchWithCache<InsuranceRecord[]>(cacheKey, async () => {
        const response = await get<{ success: boolean; data?: InsuranceRecord[] }>(
          `/api/compensation/insurance/records?month=${selectedMonth}`
        );

        return (response.data as any) || [];
      }, 5 * 60 * 1000);
    } catch (err) {
      console.error('加载社保记录失败:', err);
      monitor.trackError('loadInsuranceRecords', err as Error);
      throw err;
    }
  }, [selectedMonth]);

  const loadStats = useCallback((records: InsuranceRecord[]) => {
    setStats({
      totalEmployees: records.length,
      totalCompany: records.reduce((sum, r) => sum + r.totalCompany, 0),
      totalPersonal: records.reduce((sum, r) => sum + r.totalPersonal, 0),
      totalAmount: records.reduce((sum, r) => sum + r.totalAmount, 0),
    });
  }, []);

  useEffect(() => {
    fetchInsuranceTypes(loadInsuranceTypes);
    fetchInsuranceRecords(loadInsuranceRecords).then((result) => {
      const records = (result as any) || [];
      loadStats(records);
    });
  }, [selectedMonth, fetchInsuranceTypes, fetchInsuranceRecords, loadInsuranceTypes, loadInsuranceRecords, loadStats]);

  const filteredRecords = useMemo(() => {
    return insuranceRecords.filter((item: any) => record => {
      const matchesSearch = !debouncedQuery ||
        record.employeeName.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(debouncedQuery.toLowerCase());
      return matchesSearch;
    });
  }, [insuranceRecords, debouncedQuery]);

  const handleCalculate = useCallback(async () => {
    try {
      await post('/api/compensation/insurance/calculate', { month: selectedMonth });
      fetchInsuranceRecords(loadInsuranceRecords);
    } catch (err) {
      console.error('计算失败:', err);
    }
  }, [selectedMonth, fetchInsuranceRecords, loadInsuranceRecords]);

  if (typesError || recordsError) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle className="h-5 w-5" />
              <span>加载失败: {(typesError || recordsError)?.message}</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => fetchInsuranceTypes(loadInsuranceTypes)} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                重试
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">社保管理</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            管理员工的社保和公积金缴纳
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            导入
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="types">社保类型</TabsTrigger>
          <TabsTrigger value="records">缴纳记录</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {typesLoading || recordsLoading ? (
              [1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-20" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">参保人数</p>
                        <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                      </div>
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">单位缴纳</p>
                        <p className="text-2xl font-bold text-purple-600">¥{stats.totalCompany.toLocaleString()}</p>
                      </div>
                      <Building2 className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">个人缴纳</p>
                        <p className="text-2xl font-bold text-green-600">¥{stats.totalPersonal.toLocaleString()}</p>
                      </div>
                      <Wallet className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">合计金额</p>
                        <p className="text-2xl font-bold text-blue-600">¥{stats.totalAmount.toLocaleString()}</p>
                      </div>
                      <Calculator className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="types" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>社保类型配置</CardTitle>
            </CardHeader>
            <CardContent>
              {typesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {insuranceTypes.map((type) => (
                    <Card key={type.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="rounded-lg p-3 bg-blue-100 dark:bg-blue-900">
                              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">{type.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{type.description}</p>
                              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                <div>
                                  <span className="text-xs text-gray-500">单位比例</span>
                                  <p className="font-medium">{type.companyRate}%</p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500">个人比例</span>
                                  <p className="font-medium">{type.personalRate}%</p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500">缴费基数</span>
                                  <p className="font-medium">¥{type.baseAmount.toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">月缴纳总额</div>
                            <div className="text-xl font-bold">¥{type.totalAmount.toLocaleString()}</div>
                            <Badge className="mt-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                              {type.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索员工姓名或工号"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">月份</label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-02">2024-02</SelectItem>
                      <SelectItem value="2024-01">2024-01</SelectItem>
                      <SelectItem value="2023-12">2023-12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCalculate}>
                  <Calculator className="h-4 w-4 mr-2" />
                  计算缴纳
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>缴纳记录</CardTitle>
            </CardHeader>
            <CardContent>
              {recordsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-500">暂无缴纳记录</div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>员工信息</TableHead>
                      <TableHead>养老保险</TableHead>
                      <TableHead>医疗保险</TableHead>
                      <TableHead>失业保险</TableHead>
                      <TableHead>工伤保险</TableHead>
                      <TableHead>生育保险</TableHead>
                      <TableHead>公积金</TableHead>
                      <TableHead>单位合计</TableHead>
                      <TableHead>个人合计</TableHead>
                      <TableHead>总计</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{record.employeeName}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{record.employeeId}</div>
                          </div>
                        </TableCell>
                        <TableCell>¥{record.pension.toLocaleString()}</TableCell>
                        <TableCell>¥{record.medical.toLocaleString()}</TableCell>
                        <TableCell>¥{record.unemployment.toLocaleString()}</TableCell>
                        <TableCell>¥{record.injury.toLocaleString()}</TableCell>
                        <TableCell>¥{record.maternity.toLocaleString()}</TableCell>
                        <TableCell>¥{record.housing.toLocaleString()}</TableCell>
                        <TableCell className="font-medium">¥{record.totalCompany.toLocaleString()}</TableCell>
                        <TableCell className="font-medium">¥{record.totalPersonal.toLocaleString()}</TableCell>
                        <TableCell className="font-bold">¥{record.totalAmount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
