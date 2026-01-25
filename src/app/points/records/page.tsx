'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Download,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  Gift,
  Award,
  Target,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface PointRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  type: 'earn' | 'redeem' | 'deduct';
  points: number;
  balance: number;
  source: string;
  description: string;
  createdAt: string;
  operator?: string;
}

export default function PointsRecordsPage() {
  const [filters, setFilters] = useState({
    employeeName: '',
    type: 'all',
    department: 'all',
    source: 'all',
    dateRange: '30'
  });

  const [records] = useState<PointRecord[]>([
    {
      id: '1',
      employeeId: 'emp001',
      employeeName: '张三',
      department: '销售部',
      position: '销售经理',
      type: 'earn',
      points: 100,
      balance: 5800,
      source: '全勤奖励',
      description: '2月份全勤打卡',
      createdAt: '2024-02-20 10:30:00',
      operator: '系统'
    },
    {
      id: '2',
      employeeId: 'emp002',
      employeeName: '李四',
      department: '技术部',
      position: '高级工程师',
      type: 'earn',
      points: 500,
      balance: 5200,
      source: '绩效奖励',
      description: 'Q1绩效考核优秀',
      createdAt: '2024-02-19 15:45:00',
      operator: 'HR经理'
    },
    {
      id: '3',
      employeeId: 'emp003',
      employeeName: '王五',
      department: '市场部',
      position: '市场专员',
      type: 'redeem',
      points: -500,
      balance: 4300,
      source: '兑换商城',
      description: '兑换京东卡500元',
      createdAt: '2024-02-19 14:20:00',
      operator: '员工自助'
    },
    {
      id: '4',
      employeeId: 'emp004',
      employeeName: '赵六',
      department: '销售部',
      position: '销售代表',
      type: 'earn',
      points: 50,
      balance: 4500,
      source: '培训完成',
      description: '完成《客户沟通技巧》培训',
      createdAt: '2024-02-18 16:30:00',
      operator: '系统'
    },
    {
      id: '5',
      employeeId: 'emp005',
      employeeName: '陈七',
      department: '技术部',
      position: '前端工程师',
      type: 'earn',
      points: 30,
      balance: 4200,
      source: '全勤奖励',
      description: '2月份全勤打卡',
      createdAt: '2024-02-18 09:15:00',
      operator: '系统'
    },
    {
      id: '6',
      employeeId: 'emp001',
      employeeName: '张三',
      department: '销售部',
      position: '销售经理',
      type: 'redeem',
      points: -300,
      balance: 5700,
      source: '兑换商城',
      description: '兑换电影票2张',
      createdAt: '2024-02-17 20:00:00',
      operator: '员工自助'
    },
    {
      id: '7',
      employeeId: 'emp002',
      employeeName: '李四',
      department: '技术部',
      position: '高级工程师',
      type: 'earn',
      points: 50,
      balance: 4700,
      source: '培训完成',
      description: '完成《代码规范》培训',
      createdAt: '2024-02-17 14:00:00',
      operator: '系统'
    },
    {
      id: '8',
      employeeId: 'emp006',
      employeeName: '周八',
      department: '财务部',
      position: '会计',
      type: 'earn',
      points: 200,
      balance: 3800,
      source: '创新提案',
      description: '提出流程优化建议',
      createdAt: '2024-02-16 11:30:00',
      operator: '部门经理'
    }
  ]);

  const filteredRecords = records.filter(record => {
    const matchName = !filters.employeeName || record.employeeName.includes(filters.employeeName);
    const matchType = filters.type === 'all' || record.type === filters.type;
    const matchDept = filters.department === 'all' || record.department === filters.department;
    const matchSource = filters.source === 'all' || record.source === filters.source;
    return matchName && matchType && matchDept && matchSource;
  });

  const stats = {
    totalRecords: records.length,
    totalEarned: records.filter(r => r.type === 'earn').reduce((sum, r) => sum + r.points, 0),
    totalRedeemed: Math.abs(records.filter(r => r.type === 'redeem').reduce((sum, r) => sum + r.points, 0)),
    totalDeducted: Math.abs(records.filter(r => r.type === 'deduct').reduce((sum, r) => sum + r.points, 0))
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'earn': return { label: '获取', color: 'bg-green-100 text-green-800', icon: <TrendingUp className="h-4 w-4" /> };
      case 'redeem': return { label: '兑换', color: 'bg-orange-100 text-orange-800', icon: <Gift className="h-4 w-4" /> };
      case 'deduct': return { label: '扣除', color: 'bg-red-100 text-red-800', icon: <TrendingDown className="h-4 w-4" /> };
      default: return { label: '其他', color: 'bg-gray-100 text-gray-800', icon: <Award className="h-4 w-4" /> };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">积分明细</h1>
              <p className="text-sm text-gray-600 mt-1">查看所有积分获取与兑换记录</p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出数据
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">总记录数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRecords}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">累计获取</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+{stats.totalEarned.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">累计兑换</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">-{stats.totalRedeemed.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">累计扣除</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">-{stats.totalDeducted.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选区域 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              筛选条件
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>员工姓名</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索员工"
                    value={filters.employeeName}
                    onChange={(e) => setFilters({ ...filters, employeeName: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>类型</Label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => setFilters({ ...filters, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    <SelectItem value="earn">获取</SelectItem>
                    <SelectItem value="redeem">兑换</SelectItem>
                    <SelectItem value="deduct">扣除</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>部门</Label>
                <Select
                  value={filters.department}
                  onValueChange={(value) => setFilters({ ...filters, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部部门</SelectItem>
                    <SelectItem value="销售部">销售部</SelectItem>
                    <SelectItem value="技术部">技术部</SelectItem>
                    <SelectItem value="市场部">市场部</SelectItem>
                    <SelectItem value="财务部">财务部</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>来源</Label>
                <Select
                  value={filters.source}
                  onValueChange={(value) => setFilters({ ...filters, source: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部来源</SelectItem>
                    <SelectItem value="全勤奖励">全勤奖励</SelectItem>
                    <SelectItem value="绩效奖励">绩效奖励</SelectItem>
                    <SelectItem value="培训完成">培训完成</SelectItem>
                    <SelectItem value="兑换商城">兑换商城</SelectItem>
                    <SelectItem value="创新提案">创新提案</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>时间范围</Label>
                <Select
                  value={filters.dateRange}
                  onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">最近7天</SelectItem>
                    <SelectItem value="30">最近30天</SelectItem>
                    <SelectItem value="90">最近90天</SelectItem>
                    <SelectItem value="180">最近180天</SelectItem>
                    <SelectItem value="365">最近1年</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 明细表格 */}
        <Card>
          <CardHeader>
            <CardTitle>积分明细列表</CardTitle>
            <CardDescription>
              显示 {filteredRecords.length} 条记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>员工信息</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>来源</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>积分变化</TableHead>
                  <TableHead>余额</TableHead>
                  <TableHead>操作人</TableHead>
                  <TableHead>时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.employeeName}</div>
                        <div className="text-sm text-gray-600">
                          {record.department} · {record.position}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeBadge(record.type).color}>
                        <div className="flex items-center gap-1">
                          {getTypeBadge(record.type).icon}
                          {getTypeBadge(record.type).label}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>{record.source}</TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={record.description}>
                        {record.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-bold ${record.type === 'earn' ? 'text-green-600' : record.type === 'redeem' ? 'text-orange-600' : 'text-red-600'}`}>
                        {record.type === 'earn' ? '+' : ''}{record.points}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{record.balance.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>{record.operator}</TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {record.createdAt.split(' ')[0]}
                        <br />
                        {record.createdAt.split(' ')[1]}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* 分页 */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                显示 1-{filteredRecords.length} 条，共 {filteredRecords.length} 条记录
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="h-4 w-4" />
                  上一页
                </Button>
                <Button variant="outline" size="sm" disabled>
                  下一页
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
