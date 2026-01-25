"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShieldCheck, 
  Users, 
  Database, 
  Lock, 
  Settings,
  ChevronRight 
} from "lucide-react";

export default function PermissionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            权限管理
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            精细化控制用户访问权限，确保数据安全
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">自定义角色</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12</div>
              <p className="text-xs text-slate-500 mt-1">+2 本月新增</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">数据范围规则</CardTitle>
              <Database className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">28</div>
              <p className="text-xs text-slate-500 mt-1">覆盖8个模块</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">字段权限</CardTitle>
              <Lock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">156</div>
              <p className="text-xs text-slate-500 mt-1">15张数据表</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">操作权限</CardTitle>
              <Settings className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">89</div>
              <p className="text-xs text-slate-500 mt-1">42个操作</p>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Custom Roles */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">自定义角色</CardTitle>
                  <CardDescription>
                    创建和管理自定义角色，灵活分配权限
                  </CardDescription>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">系统预置角色</span>
                  <Badge variant="secondary">4个</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">自定义角色</span>
                  <Badge variant="secondary">8个</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">角色层级</span>
                  <Badge variant="outline">5级</Badge>
                </div>
                <Link href="/permissions/roles">
                  <Button className="w-full mt-4" variant="outline">
                    管理角色
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Data Scopes */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Database className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">数据范围权限</CardTitle>
                  <CardDescription>
                    控制用户可访问的数据范围，实现数据隔离
                  </CardDescription>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">全部数据</span>
                  <Badge variant="outline">All</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">部门数据</span>
                  <Badge variant="outline">Department</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">个人数据</span>
                  <Badge variant="outline">Self</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">自定义范围</span>
                  <Badge variant="outline">Custom</Badge>
                </div>
                <Link href="/permissions/data-scopes">
                  <Button className="w-full mt-4" variant="outline">
                    配置数据范围
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Field Permissions */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Lock className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">字段级权限</CardTitle>
                  <CardDescription>
                    精确控制每个字段的访问权限
                  </CardDescription>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">可见字段</span>
                  <Badge variant="secondary">View</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">可编辑字段</span>
                  <Badge variant="secondary">Edit</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">隐藏字段</span>
                  <Badge variant="secondary">Hide</Badge>
                </div>
                <Link href="/permissions/field-permissions">
                  <Button className="w-full mt-4" variant="outline">
                    管理字段权限
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Operation Permissions */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Settings className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">操作级权限</CardTitle>
                  <CardDescription>
                    控制用户可执行的操作，防止越权
                  </CardDescription>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">允许操作</span>
                  <Badge variant="secondary">Allowed</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">拒绝操作</span>
                  <Badge variant="secondary">Denied</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">条件控制</span>
                  <Badge variant="outline">Conditional</Badge>
                </div>
                <Link href="/permissions/operation-permissions">
                  <Button className="w-full mt-4" variant="outline">
                    管理操作权限
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>常用的权限配置任务</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto py-6 flex-col gap-2">
                <ShieldCheck className="h-8 w-8 text-blue-600" />
                <span>批量分配权限</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col gap-2">
                <Users className="h-8 w-8 text-green-600" />
                <span>克隆角色</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col gap-2">
                <Database className="h-8 w-8 text-purple-600" />
                <span>权限审计</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
