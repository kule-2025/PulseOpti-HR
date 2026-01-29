'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Building, UserPlus, Search, Filter, Download, Calendar, Phone, Mail, MapPin } from 'lucide-react';

export default function EmployeesPage() {
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                组织人事
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                员工档案，组织架构，人员异动
              </p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <UserPlus className="mr-2 h-4 w-4" />
              新增员工
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                在职员工
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">1,248</div>
                  <div className="text-xs text-gray-500 mt-1">+5 本月</div>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                部门数量
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">24</div>
                  <div className="text-xs text-gray-500 mt-1">覆盖全部业务</div>
                </div>
                <Building className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                本月入职
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">18</div>
                  <div className="text-xs text-gray-500 mt-1">待入职 5人</div>
                </div>
                <UserPlus className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                本月离职
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">3</div>
                  <div className="text-xs text-gray-500 mt-1">离职率 0.24%</div>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区域 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="list">员工列表</TabsTrigger>
            <TabsTrigger value="org">组织架构</TabsTrigger>
            <TabsTrigger value="movement">人员异动</TabsTrigger>
            <TabsTrigger value="onboarding">入职办理</TabsTrigger>
          </TabsList>

          {/* 员工列表标签页 */}
          <TabsContent value="list" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>员工列表</CardTitle>
                    <CardDescription>管理所有员工档案信息</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="搜索员工..." className="w-64" />
                    <Button variant="outline">
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button variant="outline">
                      <Filter className="h-4 w-4" />
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: '王小明',
                      employeeId: 'EMP001',
                      department: '技术部',
                      position: '高级前端工程师',
                      email: 'wangxiaoming@example.com',
                      phone: '138****8888',
                      status: 'active',
                      joinDate: '2023-03-15',
                    },
                    {
                      name: '李小红',
                      employeeId: 'EMP002',
                      department: '产品部',
                      position: '产品经理',
                      email: 'lixiaohong@example.com',
                      phone: '139****6666',
                      status: 'active',
                      joinDate: '2022-08-20',
                    },
                    {
                      name: '张伟',
                      employeeId: 'EMP003',
                      department: '设计部',
                      position: 'UI设计师',
                      email: 'zhangwei@example.com',
                      phone: '137****5555',
                      status: 'probation',
                      joinDate: '2024-11-01',
                    },
                  ].map((employee, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold text-lg">
                            {employee.name[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {employee.name}
                              </h3>
                              <Badge
                                variant={employee.status === 'active' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {employee.status === 'active' ? '在职' : '试用期'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                              <span className="text-xs text-gray-400">ID: {employee.employeeId}</span>
                              <span>•</span>
                              <span>{employee.department}</span>
                              <span>•</span>
                              <span>{employee.position}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
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
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs text-gray-500">
                            入职: {employee.joinDate}
                          </span>
                          <Button variant="ghost" size="sm">
                            查看详情 →
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 组织架构标签页 */}
          <TabsContent value="org" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>组织架构图</CardTitle>
                <CardDescription>查看完整的组织结构</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>组织架构图功能开发中...</p>
                  <Button variant="outline" className="mt-4">
                    查看示例
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 人员异动标签页 */}
          <TabsContent value="movement" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>人员异动记录</CardTitle>
                <CardDescription>记录员工的晋升、转岗、调薪等变动</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>人员异动功能开发中...</p>
                  <Button variant="outline" className="mt-4">
                    查看示例
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 入职办理标签页 */}
          <TabsContent value="onboarding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>入职办理</CardTitle>
                <CardDescription>管理新员工入职流程</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>入职办理功能开发中...</p>
                  <Button variant="outline" className="mt-4">
                    查看示例
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
