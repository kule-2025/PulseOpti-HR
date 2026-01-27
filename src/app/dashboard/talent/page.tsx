'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Target,
  Search,
  TrendingUp,
  TrendingDown,
  Star,
  Award,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/theme';

interface Talent {
  id: string;
  name: string;
  department: string;
  position: string;
  level: string;
  performance: number;
  potential: string;
  risk: string;
  keyTalent: boolean;
}

export default function TalentPage() {
  const [loading, setLoading] = useState(true);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');

  const fetchTalents = useCallback(async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setTalents([
        {
          id: '1',
          name: '张三',
          department: '技术部',
          position: '高级工程师',
          level: 'P7',
          performance: 95,
          potential: '高',
          risk: '低',
          keyTalent: true,
        },
        {
          id: '2',
          name: '李四',
          department: '技术部',
          position: '资深工程师',
          level: 'P10',
          performance: 92,
          potential: '中',
          risk: '低',
          keyTalent: true,
        },
        {
          id: '3',
          name: '王五',
          department: '人力资源部',
          position: '招聘经理',
          level: 'M1',
          performance: 88,
          potential: '高',
          risk: '低',
          keyTalent: true,
        },
        {
          id: '4',
          name: '赵六',
          department: '销售部',
          position: '销售经理',
          level: 'M2',
          performance: 85,
          potential: '中',
          risk: '中',
          keyTalent: false,
        },
        {
          id: '5',
          name: '钱七',
          department: '技术部',
          position: '工程师',
          level: 'P5',
          performance: 78,
          potential: '高',
          risk: '中',
          keyTalent: false,
        },
        {
          id: '6',
          name: '孙八',
          department: '市场部',
          position: '品牌专员',
          level: 'P4',
          performance: 82,
          potential: '高',
          risk: '低',
          keyTalent: false,
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch talents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTalents();
  }, [fetchTalents]);

  const filteredTalents = useMemo(() => {
    return talents.filter(talent => {
      const matchesSearch = talent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          talent.position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = filterDepartment === 'all' || talent.department === filterDepartment;
      const matchesRisk = filterRisk === 'all' || talent.risk === filterRisk;
      return matchesSearch && matchesDepartment && matchesRisk;
    });
  }, [talents, searchTerm, filterDepartment, filterRisk]);

  const stats = useMemo(() => {
    return {
      total: talents.length,
      keyTalent: talents.filter(t => t.keyTalent).length,
      highRisk: talents.filter(t => t.risk === '高').length,
      avgPerformance: talents.reduce((sum, t) => sum + t.performance, 0) / talents.length,
    };
  }, [talents]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full mb-3 last:mb-0" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">人才盘点</h1>
          <p className="text-muted-foreground mt-1">
            全面了解公司人才状况和发展潜力
          </p>
        </div>
        <Button>
          <Target className="mr-2 h-4 w-4" />
          开始盘点
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              盘点人数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.total}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              人
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              关键人才
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              {stats.keyTalent}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {((stats.keyTalent / stats.total) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              高风险
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {stats.highRisk}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              离职风险
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              平均绩效
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {stats.avgPerformance.toFixed(1)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              分
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索人才..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterDepartment} onValueChange={(v) => setFilterDepartment(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="部门" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部部门</SelectItem>
                <SelectItem value="技术部">技术部</SelectItem>
                <SelectItem value="人力资源部">人力资源部</SelectItem>
                <SelectItem value="销售部">销售部</SelectItem>
                <SelectItem value="市场部">市场部</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRisk} onValueChange={(v) => setFilterRisk(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="风险" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部风险</SelectItem>
                <SelectItem value="低">低风险</SelectItem>
                <SelectItem value="中">中风险</SelectItem>
                <SelectItem value="高">高风险</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTalents.map((talent) => (
          <Card key={talent.id} className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {talent.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{talent.name}</CardTitle>
                      {talent.keyTalent && (
                        <Badge className="bg-amber-100 text-amber-700">
                          <Star className="mr-1 h-3 w-3" />
                          关键人才
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {talent.position} · {talent.department}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline">{talent.level}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">绩效</span>
                    <span className="font-semibold">{talent.performance}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all",
                        talent.performance >= 90 ? "bg-green-500" :
                        talent.performance >= 80 ? "bg-blue-500" :
                        talent.performance >= 70 ? "bg-yellow-500" :
                        "bg-red-500"
                      )}
                      style={{ width: `${talent.performance}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">潜力</p>
                  <Badge variant={talent.potential === '高' ? 'default' : 'secondary'}>
                    {talent.potential}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">离职风险</p>
                  <div className="flex items-center gap-2">
                    {talent.risk === '高' ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : talent.risk === '中' ? (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    <span className="font-semibold">{talent.risk}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTalents.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">暂无人才数据</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterDepartment !== 'all' || filterRisk !== 'all'
                ? '尝试调整筛选条件'
                : '开始第一次人才盘点'}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
