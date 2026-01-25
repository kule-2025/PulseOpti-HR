'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/loading';
import {
  PieChart,
  TrendingUp,
  DollarSign,
  BarChart3,
  Layers,
  Target,
  Download,
  Filter,
  Plus,
  Eye,
  Edit3,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/theme';

// 性能优化工具
import { useLocalStorage, useAsync } from '@/hooks/use-performance';
import { fetchWithCache } from '@/lib/cache/memory-cache';
import { get } from '@/lib/request/request';
import monitor from '@/lib/performance/monitor';

interface SalaryStructureItem {
  category: string;
  amount: number;
  percentage: number;
  description: string;
  color: string;
  trend: string;
}

interface DepartmentSalary {
  department: string;
  averageSalary: number;
  headcount: number;
  totalCost: number;
  growth: string;
}

interface PositionLevelSalary {
  level: string;
  name: string;
  salaryRange: string;
  average: number;
  headcount: number;
}

export default function SalaryStructureContent() {
  const [selectedPeriod, setSelectedPeriod] = useLocalStorage('salary-period', '2024-02');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [activeTab, setActiveTab] = useState('composition');

  const loadSalaryStructure = useCallback(async () => {
    try {
      const cacheKey = `salary-structure-${selectedPeriod}-${selectedDepartment}`;
      return await fetchWithCache<SalaryStructureItem[]>(cacheKey, async () => {
        const params = new URLSearchParams({
          period: selectedPeriod,
          ...(selectedDepartment !== 'all' && { department: selectedDepartment }),
        });

        const response = await get<{ success: boolean; data?: SalaryStructureItem[] }>(
          `/api/compensation/salary-structure?${params.toString()}`
        );

        return (response.data as any) || [];
      }, 10 * 60 * 1000); // 10分钟缓存
    } catch (error) {
      console.error('获取薪酬结构失败:', error);
      monitor.trackError('loadSalaryStructure', error as Error);
      throw error;
    }
  }, [selectedPeriod, selectedDepartment]);

  const loadDepartmentSalary = useCallback(async () => {
    try {
      const cacheKey = `department-salary-${selectedPeriod}-${selectedDepartment}`;
      return await fetchWithCache<DepartmentSalary[]>(cacheKey, async () => {
        const params = new URLSearchParams({
          period: selectedPeriod,
          ...(selectedDepartment !== 'all' && { department: selectedDepartment }),
        });

        const response = await get<{ success: boolean; data?: DepartmentSalary[] }>(
          `/api/compensation/department-salary?${params.toString()}`
        );

        return (response.data as any) || [];
      }, 10 * 60 * 1000); // 10分钟缓存
    } catch (error) {
      console.error('获取部门薪酬数据失败:', error);
      monitor.trackError('loadDepartmentSalary', error as Error);
      throw error;
    }
  }, [selectedPeriod, selectedDepartment]);

  const loadPositionLevelSalary = useCallback(async () => {
    try {
      const cacheKey = `position-level-salary-${selectedPeriod}`;
      return await fetchWithCache<PositionLevelSalary[]>(cacheKey, async () => {
        const params = new URLSearchParams({
          period: selectedPeriod,
        });

        const response = await get<{ success: boolean; data?: PositionLevelSalary[] }>(
          `/api/compensation/position-level-salary?${params.toString()}`
        );

        return (response.data as any) || [];
      }, 10 * 60 * 1000); // 10分钟缓存
    } catch (error) {
      console.error('获取岗位等级数据失败:', error);
      monitor.trackError('loadPositionLevelSalary', error as Error);
      throw error;
    }
  }, [selectedPeriod]);

  // 获取薪酬结构数据
  const {
    data: salaryStructure = [],
    loading: structureLoading,
    error: structureError,
    execute: fetchSalaryStructure,
  } = useAsync<SalaryStructureItem[]>();

  // 获取部门薪酬数据
  const {
    data: departmentSalary = [],
    loading: deptLoading,
    error: deptError,
    execute: fetchDepartmentSalary,
  } = useAsync<DepartmentSalary[]>();

  // 获取岗位等级数据
  const {
    data: positionLevelSalary = [],
    loading: levelLoading,
    error: levelError,
    execute: fetchPositionLevelSalary,
  } = useAsync<PositionLevelSalary[]>();

  // 加载数据
  useEffect(() => {
    fetchSalaryStructure(loadSalaryStructure);
  }, [selectedPeriod, selectedDepartment, fetchSalaryStructure, loadSalaryStructure]);

  useEffect(() => {
    fetchDepartmentSalary(loadDepartmentSalary);
  }, [selectedPeriod, selectedDepartment, fetchDepartmentSalary, loadDepartmentSalary]);

  useEffect(() => {
    fetchPositionLevelSalary(loadPositionLevelSalary);
  }, [selectedPeriod, fetchPositionLevelSalary, loadPositionLevelSalary]);

  // 统计数据
  const stats = useMemo(() => {
    const totalCost = salaryStructure.reduce((sum, item) => sum + item.amount, 0);
    const averageSalary = departmentSalary.length > 0
      ? Math.round(departmentSalary.reduce((sum, dept) => sum + dept.averageSalary * dept.headcount, 0) /
          departmentSalary.reduce((sum, dept) => sum + dept.headcount, 0))
      : 0;

    return [
      {
        label: '总薪酬成本',
        value: `¥${totalCost.toLocaleString()}`,
        change: '+6.8%',
        trend: 'up',
        icon: DollarSign,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      },
      {
        label: '平均薪资',
        value: `¥${averageSalary.toLocaleString()}`,
        change: '+4.2%',
        trend: 'up',
        icon: TrendingUp,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      },
      {
        label: '中位薪资',
        value: '¥18,500',
        change: '+3.8%',
        trend: 'up',
        icon: BarChart3,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
      },
      {
        label: '薪酬占比',
        value: '65%',
        description: '占营收比例',
        icon: Layers,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
      },
    ];
  }, [salaryStructure, departmentSalary]);

  const hasError = structureError || deptError || levelError;

  if (hasError) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle className="h-5 w-5" />
              <span>加载失败</span>
            </div>
            <Button
              onClick={() => {
                loadSalaryStructure();
                loadDepartmentSalary();
                loadPositionLevelSalary();
              }}
              variant="outline"
            >
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">薪酬结构分析</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            分析薪酬组成、部门对比和岗位等级分布
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            自定义分析
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            导出报告
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {structureLoading ? (
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
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {stat.trend && (
                    <Badge variant={stat.trend === 'up' ? 'default' : 'secondary'}>
                      {stat.change}
                    </Badge>
                  )}
                  {stat.description && (
                    <span className="text-gray-500">{stat.description}</span>
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
            分析维度
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium">统计周期</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-02">2024年2月</SelectItem>
                  <SelectItem value="2024-01">2024年1月</SelectItem>
                  <SelectItem value="2023-12">2023年12月</SelectItem>
                  <SelectItem value="2023-q4">2023年Q4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">部门</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部部门</SelectItem>
                  <SelectItem value="tech">技术部</SelectItem>
                  <SelectItem value="sales">销售部</SelectItem>
                  <SelectItem value="product">产品部</SelectItem>
                  <SelectItem value="marketing">市场部</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">薪酬要素</label>
              <Select defaultValue="all">
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部要素</SelectItem>
                  <SelectItem value="base">基本工资</SelectItem>
                  <SelectItem value="performance">绩效奖金</SelectItem>
                  <SelectItem value="allowance">各项补贴</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 薪酬结构分析 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="composition">薪酬构成</TabsTrigger>
          <TabsTrigger value="department">部门对比</TabsTrigger>
          <TabsTrigger value="level">岗位等级</TabsTrigger>
        </TabsList>

        {/* 薪酬构成 */}
        <TabsContent value="composition" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* 饼图可视化 */}
            <Card>
              <CardHeader>
                <CardTitle>薪酬构成占比</CardTitle>
                <CardDescription>
                  总薪酬成本: ¥{salaryStructure.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {structureLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : salaryStructure.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">暂无数据</div>
                ) : (
                  <div className="space-y-3">
                    {salaryStructure.map((item, index) => (
                      <div key={item.category} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.category}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">{item.percentage}%</span>
                            <Badge variant={item.trend.startsWith('+') ? 'default' : 'secondary'}>
                              {item.trend}
                            </Badge>
                          </div>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 详细数据表格 */}
            <Card>
              <CardHeader>
                <CardTitle>详细数据</CardTitle>
              </CardHeader>
              <CardContent>
                {structureLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>薪酬项目</TableHead>
                        <TableHead>金额</TableHead>
                        <TableHead>占比</TableHead>
                        <TableHead>趋势</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salaryStructure.map((item) => (
                        <TableRow key={item.category}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={cn('h-2 w-2 rounded-full', item.color)}></div>
                              {item.category}
                            </div>
                          </TableCell>
                          <TableCell>¥{item.amount.toLocaleString()}</TableCell>
                          <TableCell>{item.percentage}%</TableCell>
                          <TableCell>
                            <Badge variant={item.trend.startsWith('+') ? 'default' : 'secondary'}>
                              {item.trend}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 部门对比 */}
        <TabsContent value="department" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>部门薪酬对比分析</CardTitle>
              <CardDescription>
                各部门平均薪资、人数及成本分布
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deptLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>部门</TableHead>
                      <TableHead>人数</TableHead>
                      <TableHead>平均薪资</TableHead>
                      <TableHead>总成本</TableHead>
                      <TableHead>占比</TableHead>
                      <TableHead>同比增长</TableHead>
                      <TableHead>趋势</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departmentSalary.map((dept) => (
                      <TableRow key={dept.department}>
                        <TableCell className="font-medium">{dept.department}</TableCell>
                        <TableCell>{dept.headcount}</TableCell>
                        <TableCell>¥{dept.averageSalary.toLocaleString()}</TableCell>
                        <TableCell>¥{dept.totalCost.toLocaleString()}</TableCell>
                        <TableCell>
                          <Progress value={(dept.totalCost / 900000) * 100} className="h-2" />
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">{dept.growth}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
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

          {/* 部门分析要点 */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  优势部门
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    <div>
                      <span className="font-medium">技术部</span> - 平均薪资最高，人才密度优秀
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    <div>
                      <span className="font-medium">销售部</span> - 绩效奖金占比高，激励机制有效
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  优化建议
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                    <div>
                      <span className="font-medium">市场部</span> - 薪资水平偏低，建议提升以增强竞争力
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                    <div>
                      <span className="font-medium">绩效奖金</span> - 整体占比偏低，建议提高到30%以上
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 岗位等级 */}
        <TabsContent value="level" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>岗位等级薪酬分布</CardTitle>
              <CardDescription>
                不同职级薪资范围与人员分布
              </CardDescription>
            </CardHeader>
            <CardContent>
              {levelLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>等级</TableHead>
                      <TableHead>级别名称</TableHead>
                      <TableHead>薪资范围</TableHead>
                      <TableHead>平均薪资</TableHead>
                      <TableHead>人数</TableHead>
                      <TableHead>占比</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {positionLevelSalary.map((level) => (
                      <TableRow key={level.level}>
                        <TableCell>
                          <Badge className="bg-blue-600">{level.level}</Badge>
                        </TableCell>
                        <TableCell>{level.name}</TableCell>
                        <TableCell>¥{level.salaryRange}</TableCell>
                        <TableCell className="font-medium">¥{level.average.toLocaleString()}</TableCell>
                        <TableCell>{level.headcount}</TableCell>
                        <TableCell>
                          <Progress value={(level.headcount / 45) * 100} className="h-2 w-24" />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* 薪酬带宽分析 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                薪酬带宽分析
              </CardTitle>
              <CardDescription>
                各等级薪酬带宽与中位线分析
              </CardDescription>
            </CardHeader>
            <CardContent>
              {levelLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {positionLevelSalary.map((level) => {
                    const min = parseInt(level.salaryRange.split(' - ')[0].replace(/,/g, ''));
                    const max = parseInt(level.salaryRange.split(' - ')[1].replace(/,/g, ''));
                    const bandwidth = ((max - min) / min) * 100;
                    const midpoint = (min + max) / 2;

                    return (
                      <div key={level.level} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-600">{level.level}</Badge>
                            <span className="text-sm font-medium">{level.name}</span>
                          </div>
                          <span className="text-sm text-gray-600">带宽: {bandwidth.toFixed(1)}%</span>
                        </div>
                        <div className="relative h-8 bg-gray-100 dark:bg-gray-800 rounded">
                          <div
                            className="absolute left-0 top-0 bottom-0 bg-blue-500 rounded-l"
                            style={{ width: `${bandwidth}%`, left: '15%' }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                            ¥{min.toLocaleString()} - ¥{max.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>最小值</span>
                          <span>中位线: ¥{midpoint.toLocaleString()}</span>
                          <span>最大值</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
