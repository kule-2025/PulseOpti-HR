'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, User, TrendingUp, Target, Award, Star } from 'lucide-react';

interface EmployeeEfficiency {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  position: string;
  performanceScore: number;
  productivityIndex: number;
  totalRevenue: number;
  totalProfit: number;
  taskCompletion: number;
  qualityScore: number;
  trainingHours: number;
  satisfactionScore: number;
  rank: number;
}

export default function EmployeeEfficiencyPage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('performance');
  const [employees, setEmployees] = useState<EmployeeEfficiency[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setEmployees([
        {
          id: '1',
          name: '张伟',
          employeeId: 'EMP001',
          department: '销售部',
          position: '销售经理',
          performanceScore: 95,
          productivityIndex: 92,
          totalRevenue: 1200000,
          totalProfit: 240000,
          taskCompletion: 98,
          qualityScore: 96,
          trainingHours: 32,
          satisfactionScore: 4.8,
          rank: 1,
        },
        {
          id: '2',
          name: '李娜',
          employeeId: 'EMP002',
          department: '技术部',
          position: '高级工程师',
          performanceScore: 92,
          productivityIndex: 90,
          totalRevenue: 800000,
          totalProfit: 120000,
          taskCompletion: 96,
          qualityScore: 94,
          trainingHours: 28,
          satisfactionScore: 4.6,
          rank: 2,
        },
        {
          id: '3',
          name: '王强',
          employeeId: 'EMP003',
          department: '市场部',
          position: '市场总监',
          performanceScore: 90,
          productivityIndex: 88,
          totalRevenue: 1000000,
          totalProfit: 150000,
          taskCompletion: 95,
          qualityScore: 92,
          trainingHours: 24,
          satisfactionScore: 4.5,
          rank: 3,
        },
        {
          id: '4',
          name: '刘芳',
          employeeId: 'EMP004',
          department: '销售部',
          position: '销售专员',
          performanceScore: 88,
          productivityIndex: 85,
          totalRevenue: 750000,
          totalProfit: 150000,
          taskCompletion: 94,
          qualityScore: 90,
          trainingHours: 20,
          satisfactionScore: 4.4,
          rank: 4,
        },
        {
          id: '5',
          name: '陈明',
          employeeId: 'EMP005',
          department: '技术部',
          position: '前端工程师',
          performanceScore: 86,
          productivityIndex: 83,
          totalRevenue: 500000,
          totalProfit: 75000,
          taskCompletion: 92,
          qualityScore: 88,
          trainingHours: 18,
          satisfactionScore: 4.3,
          rank: 5,
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const filteredAndSortedEmployees = useMemo(() => {
    let result = employees.filter(emp => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter;
      return matchesSearch && matchesDepartment;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'performance':
          return b.performanceScore - a.performanceScore;
        case 'productivity':
          return b.productivityIndex - a.productivityIndex;
        case 'revenue':
          return b.totalRevenue - a.totalRevenue;
        case 'profit':
          return b.totalProfit - a.totalProfit;
        case 'satisfaction':
          return b.satisfactionScore - a.satisfactionScore;
        default:
          return 0;
      }
    });

    return result;
  }, [employees, searchTerm, departmentFilter, sortBy]);

  const formatCurrency = (value: number) => {
    if (value >= 10000) {
      return `¥${(value / 10000).toFixed(2)}万`;
    }
    return `¥${value.toLocaleString()}`;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500">TOP 1</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400">TOP 2</Badge>;
    if (rank === 3) return <Badge className="bg-amber-600">TOP 3</Badge>;
    return null;
  };

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">员工人效</h1>
          <p className="text-muted-foreground mt-1">员工个人绩效和效率分析</p>
        </div>
        <Button variant="outline">导出报告</Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              员工总数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground mt-1">所有员工</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              平均绩效分
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(employees.reduce((sum, e) => sum + e.performanceScore, 0) / employees.length).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">满分100分</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              平均人效指数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(employees.reduce((sum, e) => sum + e.productivityIndex, 0) / employees.length).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">满分100分</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Star className="h-4 w-4" />
              平均满意度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(employees.reduce((sum, e) => sum + e.satisfactionScore, 0) / employees.length).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">满分5.0分</p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索员工姓名或工号..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={departmentFilter} onValueChange={(v) => setDepartmentFilter(v as any)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="部门" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部部门</SelectItem>
            <SelectItem value="销售部">销售部</SelectItem>
            <SelectItem value="技术部">技术部</SelectItem>
            <SelectItem value="市场部">市场部</SelectItem>
            <SelectItem value="运营部">运营部</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="排序方式" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="performance">按绩效分</SelectItem>
            <SelectItem value="productivity">按人效指数</SelectItem>
            <SelectItem value="revenue">按营收</SelectItem>
            <SelectItem value="profit">按利润</SelectItem>
            <SelectItem value="satisfaction">按满意度</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 员工列表 */}
      <Card>
        <CardHeader>
          <CardTitle>员工人效排行榜</CardTitle>
          <CardDescription>查看员工绩效和效率排名</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAndSortedEmployees.map((employee) => (
              <div
                key={employee.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{employee.name}</h3>
                      {getRankBadge(employee.rank)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {employee.employeeId} · {employee.department} · {employee.position}
                    </p>

                    <div className="grid grid-cols-5 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">绩效分</p>
                        <p className="text-lg font-bold">{employee.performanceScore}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">人效指数</p>
                        <p className="text-lg font-bold">{employee.productivityIndex}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">任务完成率</p>
                        <p className="text-lg font-bold">{employee.taskCompletion}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">质量分</p>
                        <p className="text-lg font-bold">{employee.qualityScore}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">满意度</p>
                        <p className="text-lg font-bold">{employee.satisfactionScore.toFixed(1)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">总营收</p>
                        <p className="font-semibold">{formatCurrency(employee.totalRevenue)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">总利润</p>
                        <p className="font-semibold">{formatCurrency(employee.totalProfit)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <Award className="h-8 w-8 text-yellow-500" />
                    <p className="text-sm text-muted-foreground mt-1">排名第 {employee.rank}</p>
                  </div>
                </div>
              </div>
            ))}
            {filteredAndSortedEmployees.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                没有找到匹配的员工
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
