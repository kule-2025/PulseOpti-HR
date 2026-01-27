'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Building2, TrendingUp, TrendingDown, DollarSign, Users, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DepartmentEfficiency {
  id: string;
  name: string;
  employeeCount: number;
  totalRevenue: number;
  totalProfit: number;
  totalCost: number;
  revenuePerEmployee: number;
  profitPerEmployee: number;
  costPerEmployee: number;
  revenueGrowth: number;
  profitGrowth: number;
  productivityIndex: number;
  satisfactionScore: number;
}

export default function DepartmentEfficiencyPage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('revenue');
  const [departments, setDepartments] = useState<DepartmentEfficiency[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setDepartments([
        {
          id: '1',
          name: '销售部',
          employeeCount: 8,
          totalRevenue: 8000000,
          totalProfit: 1600000,
          totalCost: 6400000,
          revenuePerEmployee: 1000000,
          profitPerEmployee: 200000,
          costPerEmployee: 800000,
          revenueGrowth: 15.3,
          profitGrowth: 12.5,
          productivityIndex: 20,
          satisfactionScore: 4.3,
        },
        {
          id: '2',
          name: '技术部',
          employeeCount: 12,
          totalRevenue: 6000000,
          totalProfit: 900000,
          totalCost: 5100000,
          revenuePerEmployee: 500000,
          profitPerEmployee: 75000,
          costPerEmployee: 425000,
          revenueGrowth: 10.2,
          profitGrowth: 8.1,
          productivityIndex: 15,
          satisfactionScore: 4.1,
        },
        {
          id: '3',
          name: '市场部',
          employeeCount: 5,
          totalRevenue: 4500000,
          totalProfit: 675000,
          totalCost: 3825000,
          revenuePerEmployee: 900000,
          profitPerEmployee: 135000,
          costPerEmployee: 765000,
          revenueGrowth: 12.8,
          profitGrowth: 10.5,
          productivityIndex: 15,
          satisfactionScore: 4.4,
        },
        {
          id: '4',
          name: '运营部',
          employeeCount: 4,
          totalRevenue: 3000000,
          totalProfit: 450000,
          totalCost: 2550000,
          revenuePerEmployee: 750000,
          profitPerEmployee: 112500,
          costPerEmployee: 637500,
          revenueGrowth: 8.5,
          profitGrowth: 6.2,
          productivityIndex: 15,
          satisfactionScore: 4.0,
        },
        {
          id: '5',
          name: '人力资源部',
          employeeCount: 1,
          totalRevenue: 100000,
          totalProfit: 20500,
          totalCost: 79500,
          revenuePerEmployee: 100000,
          profitPerEmployee: 20500,
          costPerEmployee: 79500,
          revenueGrowth: 5.0,
          profitGrowth: 4.5,
          productivityIndex: 20.5,
          satisfactionScore: 4.5,
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const filteredAndSortedDepartments = useMemo(() => {
    let result = departments.filter(dept =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    result.sort((a, b) => {
      switch (sortBy) {
        case 'revenue':
          return b.revenuePerEmployee - a.revenuePerEmployee;
        case 'profit':
          return b.profitPerEmployee - a.profitPerEmployee;
        case 'cost':
          return a.costPerEmployee - b.costPerEmployee;
        case 'growth':
          return b.revenueGrowth - a.revenueGrowth;
        case 'satisfaction':
          return b.satisfactionScore - a.satisfactionScore;
        default:
          return 0;
      }
    });

    return result;
  }, [departments, searchTerm, sortBy]);

  const formatCurrency = (value: number) => {
    if (value >= 10000) {
      return `¥${(value / 10000).toFixed(2)}万`;
    }
    return `¥${value.toLocaleString()}`;
  };

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">部门人效</h1>
          <p className="text-muted-foreground mt-1">各部门人力资源效率对比分析</p>
        </div>
        <Button variant="outline">导出报告</Button>
      </div>

      {/* 总体统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              部门数量
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">所有部门</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              员工总数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {departments.reduce((sum, d) => sum + d.employeeCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">全公司人数</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              平均人均营收
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(
                departments.reduce((sum, d) => sum + d.revenuePerEmployee * d.employeeCount, 0) /
                departments.reduce((sum, d) => sum + d.employeeCount, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">整体平均值</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              平均利润率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(
                (departments.reduce((sum, d) => sum + d.totalProfit, 0) /
                  departments.reduce((sum, d) => sum + d.totalRevenue, 0)) *
                100
              ).toFixed(1)}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">整体利润率</p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和排序 */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索部门名称..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="排序方式" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="revenue">按人均营收</SelectItem>
            <SelectItem value="profit">按人均利润</SelectItem>
            <SelectItem value="cost">按人均成本</SelectItem>
            <SelectItem value="growth">按增长率</SelectItem>
            <SelectItem value="satisfaction">按满意度</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 部门列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAndSortedDepartments.map((dept) => (
          <Card key={dept.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{dept.name}</CardTitle>
                <div className="flex items-center gap-2">
                  {dept.revenueGrowth > 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${dept.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {dept.revenueGrowth > 0 ? '+' : ''}{dept.revenueGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
              <CardDescription>{dept.employeeCount} 名员工</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">人均营收</p>
                    <p className="font-semibold">{formatCurrency(dept.revenuePerEmployee)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">人均利润</p>
                    <p className="font-semibold">{formatCurrency(dept.profitPerEmployee)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">人均成本</p>
                    <p className="font-semibold">{formatCurrency(dept.costPerEmployee)}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>人效指数 (利润率)</span>
                    <span className="font-medium">{dept.productivityIndex.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${Math.min(dept.productivityIndex, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>员工满意度</span>
                    <span className="font-medium">{dept.satisfactionScore.toFixed(1)} / 5.0</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${(dept.satisfactionScore / 5) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">营收增长</p>
                    <p className={`text-sm font-medium ${dept.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {dept.revenueGrowth > 0 ? '+' : ''}{dept.revenueGrowth.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">利润增长</p>
                    <p className={`text-sm font-medium ${dept.profitGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {dept.profitGrowth > 0 ? '+' : ''}{dept.profitGrowth.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
