'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Users, Download, Calendar } from 'lucide-react';

interface ChartData {
  label: string;
  value: number;
}

interface MetricCard {
  title: string;
  value: string | number;
  change: string;
  icon: any;
  color: string;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');

  const metrics: MetricCard[] = [
    { title: '总员工数', value: 156, change: '+12%', icon: Users, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900' },
    { title: '入职率', value: '8.2%', change: '+1.5%', icon: TrendingUp, color: 'text-green-600 bg-green-100 dark:bg-green-900' },
    { title: '离职率', value: '3.5%', change: '-0.8%', icon: TrendingUp, color: 'text-red-600 bg-red-100 dark:bg-red-900' },
    { title: '平均工龄', value: '2.8年', change: '+0.3年', icon: Users, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900' },
  ];

  const recruitmentData: ChartData[] = [
    { label: '1月', value: 12 },
    { label: '2月', value: 18 },
    { label: '3月', value: 24 },
    { label: '4月', value: 20 },
    { label: '5月', value: 28 },
    { label: '6月', value: 32 },
  ];

  const attendanceData: ChartData[] = [
    { label: '周一', value: 95 },
    { label: '周二', value: 97 },
    { label: '周三', value: 96 },
    { label: '周四', value: 98 },
    { label: '周五', value: 94 },
  ];

  const performanceData: ChartData[] = [
    { label: 'Q1', value: 82 },
    { label: 'Q2', value: 85 },
    { label: 'Q3', value: 88 },
    { label: 'Q4', value: 90 },
  ];

  const departmentStats = [
    { name: '技术部', count: 45, avgSalary: 28000 },
    { name: '产品部', count: 18, avgSalary: 32000 },
    { name: '市场部', count: 32, avgSalary: 18000 },
    { name: '人事部', count: 12, avgSalary: 22000 },
    { name: '运营部', count: 49, avgSalary: 21000 },
  ];

  const SimpleBarChart = ({ data, color = 'bg-blue-500' }: { data: ChartData[]; color?: string }) => {
    const maxValue = Math.max(...data.map((d) => d.value));

    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
              <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`${color} h-2 rounded-full transition-all`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">统计分析</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">数据洞察、趋势分析</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="h-9 px-3 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm">
            <option value="week">本周</option>
            <option value="month">本月</option>
            <option value="quarter">本季度</option>
            <option value="year">本年</option>
          </select>
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            导出报告
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.title}</CardTitle>
              <div className={`p-2 rounded-lg ${metric.color}`}>
                <metric.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {metric.change.startsWith('+') && <TrendingUp size={12} className="inline mr-1 text-green-500" />}
                {metric.change.startsWith('-') && <TrendingUp size={12} className="inline mr-1 text-red-500 rotate-180" />}
                {metric.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">总览</TabsTrigger>
              <TabsTrigger value="recruitment">招聘分析</TabsTrigger>
              <TabsTrigger value="attendance">考勤分析</TabsTrigger>
              <TabsTrigger value="performance">绩效分析</TabsTrigger>
              <TabsTrigger value="department">部门分析</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab}>
            <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">招聘趋势</h3>
                <SimpleBarChart data={recruitmentData} color="bg-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">考勤率</h3>
                <SimpleBarChart data={attendanceData} color="bg-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">绩效评分</h3>
                <SimpleBarChart data={performanceData} color="bg-purple-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">部门分布</h3>
                <div className="space-y-3">
                  {departmentStats.map((dept, index) => {
                    const maxCount = Math.max(...departmentStats.map((d) => d.count));
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{dept.name}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{dept.count}人</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full transition-all"
                            style={{ width: `${(dept.count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recruitment">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">招聘趋势分析</h3>
              <SimpleBarChart data={recruitmentData} color="bg-blue-500" />
            </div>
          </TabsContent>

          <TabsContent value="attendance">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">考勤率分析</h3>
              <SimpleBarChart data={attendanceData} color="bg-green-500" />
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">绩效评分趋势</h3>
              <SimpleBarChart data={performanceData} color="bg-purple-500" />
            </div>
          </TabsContent>

          <TabsContent value="department">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">部门人数分布</h3>
                <div className="space-y-3">
                  {departmentStats.map((dept, index) => {
                    const maxCount = Math.max(...departmentStats.map((d) => d.count));
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{dept.name}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{dept.count}人</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${(dept.count / maxCount) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">部门平均薪资</h3>
                <div className="space-y-3">
                  {departmentStats.map((dept, index) => {
                    const maxSalary = Math.max(...departmentStats.map((d) => d.avgSalary));
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{dept.name}</span>
                          <span className="font-medium text-gray-900 dark:text-white">¥{dept.avgSalary.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-cyan-500 h-2 rounded-full transition-all" style={{ width: `${(dept.avgSalary / maxSalary) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
