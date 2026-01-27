'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building2,
  Users,
  Plus,
  Edit,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  TreePine,
  ChevronRight,
  ChevronDown,
  UserPlus,
} from 'lucide-react';
import { cn } from '@/lib/theme';

interface Department {
  id: string;
  name: string;
  head: string;
  employeeCount: number;
  children?: Department[];
  expanded?: boolean;
}

export default function OrganizationPage() {
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoom, setZoom] = useState(100);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  const fetchOrganization = useCallback(async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setDepartments([
        {
          id: '1',
          name: '总经理办公室',
          head: '张总',
          employeeCount: 5,
          expanded: true,
          children: [
            {
              id: '1-1',
              name: '总经办',
              head: '李经理',
              employeeCount: 3,
            },
          ],
        },
        {
          id: '2',
          name: '人力资源部',
          head: '王总监',
          employeeCount: 12,
          expanded: false,
          children: [
            {
              id: '2-1',
              name: '招聘组',
              head: '赵经理',
              employeeCount: 4,
            },
            {
              id: '2-2',
              name: '培训组',
              head: '钱经理',
              employeeCount: 3,
            },
            {
              id: '2-3',
              name: '绩效组',
              head: '孙经理',
              employeeCount: 5,
            },
          ],
        },
        {
          id: '3',
          name: '技术部',
          head: '李CTO',
          employeeCount: 45,
          expanded: false,
          children: [
            {
              id: '3-1',
              name: '前端组',
              head: '周经理',
              employeeCount: 15,
            },
            {
              id: '3-2',
              name: '后端组',
              head: '吴经理',
              employeeCount: 20,
            },
            {
              id: '3-3',
              name: '运维组',
              head: '郑经理',
              employeeCount: 10,
            },
          ],
        },
        {
          id: '4',
          name: '市场部',
          head: '冯总监',
          employeeCount: 20,
          expanded: false,
          children: [
            {
              id: '4-1',
              name: '品牌组',
              head: '陈经理',
              employeeCount: 8,
            },
            {
              id: '4-2',
              name: '活动组',
              head: '楚经理',
              employeeCount: 12,
            },
          ],
        },
        {
          id: '5',
          name: '销售部',
          head: '卫总监',
          employeeCount: 35,
          expanded: false,
          children: [
            {
              id: '5-1',
              name: '华北区',
              head: '蒋经理',
              employeeCount: 10,
            },
            {
              id: '5-2',
              name: '华东区',
              head: '沈经理',
              employeeCount: 15,
            },
            {
              id: '5-3',
              name: '华南区',
              head: '韩经理',
              employeeCount: 10,
            },
          ],
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch organization:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);

  const toggleDepartment = useCallback((deptId: string) => {
    const toggle = (depts: Department[]): Department[] => {
      return depts.map(dept => {
        if (dept.id === deptId) {
          return { ...dept, expanded: !dept.expanded };
        }
        if (dept.children) {
          return { ...dept, children: toggle(dept.children) };
        }
        return dept;
      });
    };
    setDepartments(toggle(departments));
  }, [departments]);

  const totalEmployees = useMemo(() => {
    const count = (depts: Department[]): number => {
      return depts.reduce((sum, dept) => {
        return sum + dept.employeeCount + (dept.children ? count(dept.children) : 0);
      }, 0);
    };
    return count(departments);
  }, [departments]);

  const renderDepartment = (dept: Department, level: number = 0) => {
    const hasChildren = dept.children && dept.children.length > 0;
    
    return (
      <div key={dept.id} className="relative">
        <Card
          className={cn(
            "mb-3 transition-all duration-200 hover:shadow-md cursor-pointer",
            selectedDept?.id === dept.id && "ring-2 ring-primary"
          )}
          onClick={() => setSelectedDept(dept)}
          style={{ marginLeft: `${level * 24}px` }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {hasChildren && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDepartment(dept.id);
                    }}
                  >
                    {dept.expanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <div className={cn(
                  "p-2 rounded-lg",
                  level === 0 ? "bg-primary/10" : "bg-muted"
                )}>
                  <Building2 className={cn(
                    "h-5 w-5",
                    level === 0 ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <div>
                  <h3 className="font-semibold">{dept.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    部门负责人: {dept.head}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">
                  <Users className="mr-1 h-3 w-3" />
                  {dept.employeeCount}人
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {dept.expanded && hasChildren && (
          <div className="space-y-2">
            {dept.children!.map(child => renderDepartment(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">组织架构</h1>
          <p className="text-muted-foreground mt-1">
            查看和管理公司的组织结构
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <UserPlus className="mr-2 h-4 w-4" />
            添加部门
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新建组织
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              部门总数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {departments.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              员工总数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalEmployees}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              组织层级
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              3
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              层级深度
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索部门..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 border rounded-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            disabled={zoom <= 50}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[60px] text-center">
            {zoom}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.min(150, zoom + 10))}
            disabled={zoom >= 150}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(100)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        className="space-y-2"
        style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
      >
        {departments.map(dept => renderDepartment(dept))}
      </div>

      {selectedDept && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>部门详情</CardTitle>
                <CardDescription>{selectedDept.name}</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDept(null)}
              >
                关闭
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">部门名称</p>
                <p className="font-semibold">{selectedDept.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">部门负责人</p>
                <p className="font-semibold">{selectedDept.head}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">员工人数</p>
                <p className="font-semibold">{selectedDept.employeeCount}人</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">子部门</p>
                <p className="font-semibold">{selectedDept.children?.length || 0}个</p>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button size="sm">
                <Edit className="mr-2 h-4 w-4" />
                编辑部门
              </Button>
              <Button size="sm" variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                添加子部门
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
