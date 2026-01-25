"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  AlertTriangle, 
  Activity,
  FileText,
  TrendingUp,
  ChevronRight
} from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            安全审计
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            实时监控系统安全，及时发现和响应安全威胁
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">安全评分</CardTitle>
              <Shield className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">92</div>
              <p className="text-xs text-slate-500 mt-1">↑ 5 较上周提升</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">活跃事件</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">24</div>
              <p className="text-xs text-slate-500 mt-1">3个高危</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">异常行为</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">7</div>
              <p className="text-xs text-slate-500 mt-1">需立即处理</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">本月报告</CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12</div>
              <p className="text-xs text-slate-500 mt-1">已完成8份</p>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Security Events */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">安全事件</CardTitle>
                  <CardDescription>
                    监控和记录系统中的所有安全事件
                  </CardDescription>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">登录失败</span>
                  <Badge variant="destructive">8次</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">可疑活动</span>
                  <Badge variant="outline">5次</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">数据访问异常</span>
                  <Badge variant="outline">3次</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">权限提升</span>
                  <Badge variant="outline">0次</Badge>
                </div>
                <Link href="/security/events">
                  <Button className="w-full mt-4" variant="outline">
                    查看事件列表
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* User Behavior Anomalies */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">异常行为检测</CardTitle>
                  <CardDescription>
                    AI驱动的用户行为分析，识别潜在威胁
                  </CardDescription>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">登录时间异常</span>
                  <Badge variant="secondary">2个</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">访问地点异常</span>
                  <Badge variant="secondary">1个</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">操作频率异常</span>
                  <Badge variant="secondary">3个</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">数据量异常</span>
                  <Badge variant="secondary">1个</Badge>
                </div>
                <Link href="/security/anomalies">
                  <Button className="w-full mt-4" variant="outline">
                    查看异常详情
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Security Scores */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">安全评分</CardTitle>
                  <CardDescription>
                    多维度评估系统和用户的安全状况
                  </CardDescription>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">企业安全评分</span>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">92分</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">事件评分</span>
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">85分</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">异常评分</span>
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">78分</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">趋势评分</span>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">88分</Badge>
                </div>
                <Link href="/security/scores">
                  <Button className="w-full mt-4" variant="outline">
                    查看评分详情
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Security Reports */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">安全报告</CardTitle>
                  <CardDescription>
                    定期生成安全分析报告，支持导出
                  </CardDescription>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">每日报告</span>
                  <Badge variant="secondary">3份</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">每周报告</span>
                  <Badge variant="secondary">4份</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">每月报告</span>
                  <Badge variant="secondary">3份</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">自定义报告</span>
                  <Badge variant="secondary">2份</Badge>
                </div>
                <Link href="/security/reports">
                  <Button className="w-full mt-4" variant="outline">
                    查看报告列表
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Trends */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>安全趋势</CardTitle>
                <CardDescription>最近30天的安全指标变化</CardDescription>
              </div>
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">↓ 15%</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">安全事件</div>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">↑ 8%</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">安全评分</div>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 mb-2">↓ 20%</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">异常行为</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
