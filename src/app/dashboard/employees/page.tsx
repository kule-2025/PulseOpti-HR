'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Plus,
  Download,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Filter,
  MoreVertical,
  User,
  Building2,
  Briefcase,
  GraduationCap,
  Grid3x3,
  List,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
} from 'lucide-react';

// 类型定义
type EmployeeStatus = 'active' | 'inactive' | 'onboarding' | 'terminated';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  level: string;
  status: EmployeeStatus;
  joinDate: string;
  location: string;
  salary?: number;
  manager?: string;
  avatar?: string;
  skills?: string[];
  performance?: number;
  attendance?: number;
}

interface Stats {
  total: number;
  active: number;
  onboarding: number;
  departments: number;
}

// 默认数据
const DEFAULT_EMPLOYEES: Employee[] = [];

const DEFAULT_STATS: Stats = {
  total: 0,
  active: 0,
  onboarding: 0,
  departments: 0,
};

// 状态映射
const STATUS_CONFIG: Record<EmployeeStatus, { label: string; color: string; icon: any }> = {
  active: { label: '在职', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  inactive: { label: '离职', color: 'bg-gray-100 text-gray-800', icon: XCircle },
  onboarding: { label: '入职中', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
  terminated: { label: '已离职', color: 'bg-red-100 text-red-800', icon: XCircle },
};

// 统计卡片组件（性能优化）
const StatsCard = memo(function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  description,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
  description?: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// 员工卡片组件（性能优化）
const EmployeeCard = memo(function EmployeeCard({
  employee,
  selected,
  onSelect,
  onEdit,
  onView,
}: {
  employee: Employee;
  selected: boolean;
  onSelect: (id: string) => void;
  onEdit: (employee: Employee) => void;
  onView: (employee: Employee) => void;
}) {
  const statusConfig = STATUS_CONFIG[employee.status];
  const StatusIcon = statusConfig.icon;

  return (
    <Card
      className={`hover:shadow-md transition-all cursor-pointer ${
        selected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onView(employee)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={selected}
            onCheckedChange={() => onSelect(employee.id)}
            onClick={(e) => e.stopPropagation()}
          />
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary">
              {employee.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{employee.name}</h3>
              <Badge variant="outline" className={statusConfig.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">{employee.position}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {employee.department}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {employee.location}
              </span>
            </div>
            {employee.performance !== undefined && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>绩效</span>
                  <span>{employee.performance}%</span>
                </div>
                <Progress value={employee.performance} className="h-1" />
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(employee)}>
                <Eye className="h-4 w-4 mr-2" />
                查看详情
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(employee)}>
                <Edit className="h-4 w-4 mr-2" />
                编辑
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
});

// 骨架屏组件
const EmployeeListSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <Card key={i}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64 mt-2" />
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(DEFAULT_EMPLOYEES);
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 搜索和筛选状态
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | 'all'>('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 选中的员工
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());

  // 对话框状态
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // 获取所有部门
  const departments = useMemo(() => {
    const depts = Array.from(new Set(employees.map((e) => e.department)));
    return depts.sort();
  }, [employees]);

  // 过滤员工列表
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch =
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
      const matchesDepartment =
        departmentFilter === 'all' || employee.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [employees, searchTerm, statusFilter, departmentFilter]);

  // 获取员工数据
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/employees', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('获取员工数据失败');
      }

      const data = await response.json();

      if (data.success) {
        setEmployees(data.data.employees || DEFAULT_EMPLOYEES);
        setStats(data.data.stats || DEFAULT_STATS);
      } else {
        throw new Error(data.message || '数据格式错误');
      }
    } catch (err) {
      console.error('获取员工数据失败:', err);
      setError('加载数据失败，请稍后重试');
      setEmployees(DEFAULT_EMPLOYEES);
      setStats(DEFAULT_STATS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // 选择/取消选择员工
  const handleSelectEmployee = useCallback((employeeId: string) => {
    setSelectedEmployees((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  }, []);

  // 全选/取消全选
  const handleSelectAll = useCallback(() => {
    if (selectedEmployees.size === filteredEmployees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(filteredEmployees.map((e) => e.id)));
    }
  }, [selectedEmployees.size, filteredEmployees]);

  // 查看员工详情
  const handleViewEmployee = useCallback((employee: Employee) => {
    setSelectedEmployee(employee);
    setViewDialogOpen(true);
  }, []);

  // 编辑员工
  const handleEditEmployee = useCallback((employee: Employee) => {
    setSelectedEmployee(employee);
    setEditDialogOpen(true);
  }, []);

  // 删除员工
  const handleDeleteEmployee = useCallback(async (employeeId: string) => {
    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
        setSelectedEmployees((prev) => {
          const newSet = new Set(prev);
          newSet.delete(employeeId);
          return newSet;
        });
      }
    } catch (err) {
      console.error('删除员工失败:', err);
    }
  }, []);

  // 批量删除
  const handleBatchDelete = useCallback(async () => {
    try {
      const response = await fetch('/api/employees/batch', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedEmployees) }),
      });

      if (response.ok) {
        setEmployees((prev) =>
          prev.filter((e) => !selectedEmployees.has(e.id))
        );
        setSelectedEmployees(new Set());
      }
    } catch (err) {
      console.error('批量删除失败:', err);
    }
  }, [selectedEmployees]);

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">员工管理</h1>
          <p className="text-muted-foreground mt-1">
            管理公司员工信息、组织架构
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchEmployees}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新增员工
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="员工总数"
          value={stats.total}
          icon={Users}
          color="bg-blue-100 text-blue-600"
        />
        <StatsCard
          title="在职员工"
          value={stats.active}
          icon={CheckCircle2}
          color="bg-green-100 text-green-600"
        />
        <StatsCard
          title="入职中"
          value={stats.onboarding}
          icon={RefreshCw}
          color="bg-blue-100 text-blue-600"
        />
        <StatsCard
          title="部门数量"
          value={stats.departments}
          icon={Building2}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索姓名、邮箱、职位..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="部门" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部部门</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 批量操作栏 */}
      {selectedEmployees.size > 0 && (
        <Card className="bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={
                    selectedEmployees.size === filteredEmployees.length &&
                    filteredEmployees.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm">
                  已选择 <span className="font-semibold">{selectedEmployees.size}</span> 位员工
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  发送邮件
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  批量编辑
                </Button>
                <Button size="sm" variant="destructive" onClick={handleBatchDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  批量删除
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={fetchEmployees}
            >
              重试
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* 员工列表 */}
      {loading ? (
        <EmployeeListSkeleton />
      ) : filteredEmployees.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">暂无员工数据</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'
                ? '请调整筛选条件后重试'
                : '开始添加您的第一位员工吧'}
            </p>
            {!searchTerm && statusFilter === 'all' && departmentFilter === 'all' && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新增员工
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              selected={selectedEmployees.has(employee.id)}
              onSelect={handleSelectEmployee}
              onEdit={handleEditEmployee}
              onView={handleViewEmployee}
            />
          ))}
        </div>
      )}

      {/* 查看详情对话框 */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>员工详情</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">基本信息</TabsTrigger>
                <TabsTrigger value="work">工作信息</TabsTrigger>
                <TabsTrigger value="contact">联系方式</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {selectedEmployee.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedEmployee.name}</h3>
                    <p className="text-muted-foreground">
                      {selectedEmployee.position} · {selectedEmployee.department}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">员工ID</p>
                    <p className="font-medium">{selectedEmployee.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">状态</p>
                    <Badge className={STATUS_CONFIG[selectedEmployee.status].color}>
                      {STATUS_CONFIG[selectedEmployee.status].label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">入职日期</p>
                    <p className="font-medium">{selectedEmployee.joinDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">工作地点</p>
                    <p className="font-medium">{selectedEmployee.location}</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="work" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">部门</p>
                    <p className="font-medium">{selectedEmployee.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">职位</p>
                    <p className="font-medium">{selectedEmployee.position}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">级别</p>
                    <p className="font-medium">{selectedEmployee.level}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">直属领导</p>
                    <p className="font-medium">{selectedEmployee.manager || '-'}</p>
                  </div>
                  {selectedEmployee.salary && (
                    <div>
                      <p className="text-sm text-muted-foreground">薪资</p>
                      <p className="font-medium">¥{selectedEmployee.salary.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="contact" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">邮箱</p>
                    <p className="font-medium">{selectedEmployee.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">电话</p>
                    <p className="font-medium">{selectedEmployee.phone}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              关闭
            </Button>
            <Button
              onClick={() => {
                setViewDialogOpen(false);
                if (selectedEmployee) handleEditEmployee(selectedEmployee);
              }}
            >
              编辑
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
