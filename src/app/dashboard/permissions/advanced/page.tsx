'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Award, Shield, Users, Lock, Plus, Search, Filter, Save, Trash2 } from 'lucide-react';

export default function AdvancedPermissionsPage() {
  const [activeTab, setActiveTab] = useState('roles');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  高级权限管理
                </h1>
                <Badge className="bg-red-600">PRO</Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                精细化权限控制，数据安全隔离
              </p>
            </div>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" />
              新建角色
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                自定义角色
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">12</div>
                  <div className="text-xs text-gray-500 mt-1">活跃角色</div>
                </div>
                <Shield className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                权限规则
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">48</div>
                  <div className="text-xs text-gray-500 mt-1">已配置规则</div>
                </div>
                <Lock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                数据隔离
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">100%</div>
                  <div className="text-xs text-gray-500 mt-1">已启用</div>
                </div>
                <Award className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                用户分配
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">256</div>
                  <div className="text-xs text-gray-500 mt-1">已分配用户</div>
                </div>
                <Users className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区域 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[700px]">
            <TabsTrigger value="roles">角色管理</TabsTrigger>
            <TabsTrigger value="permissions">权限配置</TabsTrigger>
            <TabsTrigger value="isolation">数据隔离</TabsTrigger>
            <TabsTrigger value="audit">审计日志</TabsTrigger>
          </TabsList>

          {/* 角色管理标签页 */}
          <TabsContent value="roles" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>角色列表</CardTitle>
                    <CardDescription>管理自定义角色和权限分配</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="搜索角色..." className="w-64" />
                    <Button variant="outline">
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button variant="outline">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: 'HR总监',
                      description: '拥有所有人力资源管理权限',
                      users: 5,
                      permissions: 45,
                      createdAt: '2024-01-15',
                    },
                    {
                      name: '招聘经理',
                      description: '负责招聘流程和候选人管理',
                      users: 8,
                      permissions: 28,
                      createdAt: '2024-02-20',
                    },
                    {
                      name: '薪酬专员',
                      description: '负责薪酬计算和发放',
                      users: 3,
                      permissions: 18,
                      createdAt: '2024-03-10',
                    },
                  ].map((role, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{role.name}</h3>
                            <p className="text-sm text-gray-500">{role.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            编辑
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-500 mt-2">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {role.users} 位用户
                        </span>
                        <span className="flex items-center gap-1">
                          <Lock className="h-4 w-4" />
                          {role.permissions} 项权限
                        </span>
                        <span>创建于 {role.createdAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 权限配置标签页 */}
          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>权限配置</CardTitle>
                <CardDescription>配置系统权限和访问规则</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 权限分组 */}
                  {[
                    {
                      group: '绩效管理',
                      icon: '📊',
                      permissions: [
                        { name: '查看绩效数据', enabled: true },
                        { name: '编辑绩效数据', enabled: false },
                        { name: '审批绩效结果', enabled: false },
                        { name: '导出绩效报表', enabled: false },
                      ],
                    },
                    {
                      group: '招聘管理',
                      icon: '💼',
                      permissions: [
                        { name: '发布职位', enabled: true },
                        { name: '查看简历', enabled: true },
                        { name: '安排面试', enabled: false },
                        { name: '录用员工', enabled: false },
                      ],
                    },
                    {
                      group: '薪酬管理',
                      icon: '💰',
                      permissions: [
                        { name: '查看薪酬数据', enabled: false },
                        { name: '计算薪酬', enabled: false },
                        { name: '发放薪酬', enabled: false },
                        { name: '管理薪酬结构', enabled: false },
                      ],
                    },
                  ].map((group, groupIndex) => (
                    <div key={groupIndex} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">{group.icon}</span>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{group.group}</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {group.permissions.map((permission, permIndex) => (
                          <div
                            key={permIndex}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                          >
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {permission.name}
                            </span>
                            <Switch checked={permission.enabled} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-6">
                  <Button className="bg-red-600 hover:bg-red-700">
                    <Save className="mr-2 h-4 w-4" />
                    保存配置
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 数据隔离标签页 */}
          <TabsContent value="isolation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>数据隔离配置</CardTitle>
                <CardDescription>确保企业间和部门间的数据安全隔离</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 企业级隔离 */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-purple-600" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">企业级隔离</h3>
                      </div>
                      <Switch checked={true} />
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      不同企业的数据完全隔离，确保数据安全和隐私
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="font-medium text-green-700 dark:text-green-400 mb-1">
                          员工数据
                        </div>
                        <div className="text-green-600 dark:text-green-500">已隔离</div>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="font-medium text-green-700 dark:text-green-400 mb-1">
                          绩效数据
                        </div>
                        <div className="text-green-600 dark:text-green-500">已隔离</div>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="font-medium text-green-700 dark:text-green-400 mb-1">
                          薪酬数据
                        </div>
                        <div className="text-green-600 dark:text-green-500">已隔离</div>
                      </div>
                    </div>
                  </div>

                  {/* 部门级隔离 */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">部门级隔离</h3>
                      </div>
                      <Switch checked={true} />
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      同一企业内，不同部门的数据按需隔离
                    </p>
                    <div className="space-y-2">
                      {['技术部', '产品部', '市场部', '财务部'].map((dept, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                        >
                          <span className="text-sm text-gray-700 dark:text-gray-300">{dept}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">独立数据访问</span>
                            <Switch checked={true} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button className="bg-red-600 hover:bg-red-700">
                    <Save className="mr-2 h-4 w-4" />
                    保存配置
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 审计日志标签页 */}
          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>审计日志</CardTitle>
                <CardDescription>查看所有权限变更和访问记录</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>审计日志功能开发中...</p>
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
