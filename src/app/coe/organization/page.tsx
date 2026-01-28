'use client';

import { useState, useMemo } from 'react';
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
import {
  Building2,
  Plus,
  Search,
  Users,
  UserPlus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  avatar: string;
  position: string;
  level: string;
  email: string;
  phone: string;
  joinDate: string;
  status: 'active' | 'on_leave' | 'resigned';
}

interface Department {
  id: string;
  name: string;
  code: string;
  manager: string;
  location: string;
  employeeCount: number;
  subDepartments: Department[];
  employees: Employee[];
}

// 模拟组织架构数据
const ORGANIZATION_DATA: Department = {
  id: 'root',
  name: '脉冲科技',
  code: 'ROOT',
  manager: '张总',
  location: '北京总部',
  employeeCount: 485,
  subDepartments: [
    {
      id: 'dept-tech',
      name: '技术部',
      code: 'TECH',
      manager: '技术总监',
      location: '北京',
      employeeCount: 120,
      subDepartments: [
        {
          id: 'team-frontend',
          name: '前端团队',
          code: 'TECH-FE',
          manager: '前端技术专家',
          location: '北京',
          employeeCount: 45,
          subDepartments: [],
          employees: [
            {
              id: 'emp-1',
              name: '张三',
              avatar: '张',
              position: '高级前端工程师',
              level: 'P7',
              email: 'zhangsan@pulsetech.com',
              phone: '138-0000-0002',
              joinDate: '2023-03-15',
              status: 'active',
            },
            {
              id: 'emp-2',
              name: '赵六',
              avatar: '赵',
              position: '后端工程师',
              level: 'P6',
              email: 'zhaoliu@pulsetech.com',
              phone: '138-0000-0005',
              joinDate: '2023-06-15',
              status: 'active',
            },
          ],
        },
        {
          id: 'team-backend',
          name: '后端团队',
          code: 'TECH-BE',
          manager: '后端技术专家',
          location: '北京',
          employeeCount: 75,
          subDepartments: [],
          employees: [
            {
              id: 'emp-3',
              name: '李四',
              avatar: '李',
              position: '架构师',
              level: 'P8',
              email: 'lisi@pulsetech.com',
              phone: '138-0000-0003',
              joinDate: '2022-01-01',
              status: 'active',
            },
          ],
        },
      ],
      employees: [
        {
          id: 'emp-4',
          name: '王五',
          avatar: '王',
          position: '产品经理',
          level: 'P6',
          email: 'wangwu@pulsetech.com',
          phone: '138-0000-0004',
          joinDate: '2023-08-01',
          status: 'active',
        },
      ],
    },
    {
      id: 'dept-sales',
      name: '销售部',
      code: 'SALES',
      manager: '销售总监',
      location: '上海',
      employeeCount: 85,
      subDepartments: [
        {
          id: 'team-enterprise',
          name: '大客户团队',
          code: 'SALES-ENT',
          manager: '大客户经理',
          location: '上海',
          employeeCount: 35,
          subDepartments: [],
          employees: [],
        },
        {
          id: 'team-smb',
          name: '中小客户团队',
          code: 'SALES-SMB',
          manager: '中小客户经理',
          location: '上海',
          employeeCount: 50,
          subDepartments: [],
          employees: [],
        },
      ],
      employees: [],
    },
    {
      id: 'dept-marketing',
      name: '市场部',
      code: 'MKT',
      manager: '市场总监',
      location: '深圳',
      employeeCount: 65,
      subDepartments: [],
      employees: [],
    },
    {
      id: 'dept-hr',
      name: '人力资源部',
      code: 'HR',
      manager: 'HR总监',
      location: '北京',
      employeeCount: 35,
      subDepartments: [],
      employees: [
        {
          id: 'emp-5',
          name: '孙七',
          avatar: '孙',
          position: 'HRBP',
          level: 'P6',
          email: 'sunqi@pulsetech.com',
          phone: '138-0000-0006',
          joinDate: '2023-04-01',
          status: 'active',
        },
      ],
    },
    {
      id: 'dept-finance',
      name: '财务部',
      code: 'FIN',
      manager: '财务总监',
      location: '北京',
      employeeCount: 30,
      subDepartments: [],
      employees: [],
    },
    {
      id: 'dept-admin',
      name: '行政部',
      code: 'ADMIN',
      manager: '行政总监',
      location: '北京',
      employeeCount: 25,
      subDepartments: [],
      employees: [],
    },
  ],
  employees: [],
};

const STATUS_CONFIG = {
  active: { label: '在职', color: 'bg-green-100 text-green-600' },
  on_leave: { label: '休假中', color: 'bg-yellow-100 text-yellow-600' },
  resigned: { label: '已离职', color: 'bg-gray-100 text-gray-600' },
};

function DepartmentNode({
  department,
  level = 0,
  searchQuery,
  selectedDepartment,
  setSelectedDepartment,
}: {
  department: Department;
  level?: number;
  searchQuery: string;
  selectedDepartment: string | null;
  setSelectedDepartment: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(level < 2);

  // 搜索过滤
  const isMatch = searchQuery
    ? department.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      department.code.toLowerCase().includes(searchQuery.toLowerCase())
    : true;

  const hasSubDepartments = department.subDepartments && department.subDepartments.length > 0;
  const hasEmployees = department.employees && department.employees.length > 0;

  if (!isMatch && !searchQuery) return null;

  return (
    <div className={`${level > 0 ? 'ml-6' : ''}`}>
      {/* 部门卡片 */}
      <Card
        className={`mb-3 transition-all ${
          selectedDepartment === department.id
            ? 'border-2 border-purple-600 shadow-lg'
            : 'hover:shadow-md'
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {/* 展开/收起按钮 */}
              {hasSubDepartments && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setExpanded(!expanded)}
                  className="shrink-0 mt-1"
                >
                  {expanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}

              {/* 部门信息 */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {department.name}
                  </h3>
                  <Badge variant="outline">{department.code}</Badge>
                  {level === 0 && (
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      总部
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Users className="h-3.5 w-3.5" />
                    <span>负责人：{department.manager}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>地点：{department.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>人数：{department.employeeCount}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    {hasSubDepartments && (
                      <>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span>子部门：{department.subDepartments.length}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4" />
              </Button>
              {level > 0 && (
                <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 子部门 */}
      {expanded && hasSubDepartments && (
        <div className="space-y-3">
          {department.subDepartments.map((subDept) => (
            <DepartmentNode
              key={subDept.id}
              department={subDept}
              level={level + 1}
              searchQuery={searchQuery}
              selectedDepartment={selectedDepartment}
              setSelectedDepartment={setSelectedDepartment}
            />
          ))}
        </div>
      )}

      {/* 员工列表 */}
      {expanded && hasEmployees && (
        <div className="mt-4 space-y-2">
          {department.employees.map((employee) => {
            const statusConfig = STATUS_CONFIG[employee.status];

            return (
              <Card key={employee.id} className="border-l-4 border-l-purple-600">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {employee.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {employee.name}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {employee.level}
                        </Badge>
                        <Badge variant="outline" className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {employee.position}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {employee.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {employee.phone}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3" />
                      <span>{employee.joinDate}</span>
                    </div>
                    <Button size="sm" variant="ghost">
                      查看
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function OrganizationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  const stats = {
    totalDepartments: 6,
    totalEmployees: 485,
    totalLocations: 3,
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            组织架构
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            管理企业组织结构和部门关系
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <UserPlus className="h-4 w-4 mr-2" />
            添加员工
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Building2 className="h-4 w-4 mr-2" />
            新增部门
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>部门总数</CardDescription>
            <CardTitle className="text-3xl">{stats.totalDepartments}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>员工总数</CardDescription>
            <CardTitle className="text-3xl">{stats.totalEmployees}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>办公地点</CardDescription>
            <CardTitle className="text-3xl">{stats.totalLocations}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 搜索和过滤 */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="搜索部门或部门编号..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* 组织架构树 */}
      <DepartmentNode
        department={ORGANIZATION_DATA}
        searchQuery={searchQuery}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
      />
    </div>
  );
}
