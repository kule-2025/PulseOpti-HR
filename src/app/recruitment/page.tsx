'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Briefcase, Users, Search, Sparkles, Filter, Plus, Download, Calendar } from 'lucide-react';

export default function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState('jobs');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                智能招聘
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                精准画像，智能筛选，快速入职
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              发布职位
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                招聘中职位
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">18</div>
                  <div className="text-xs text-gray-500 mt-1">6个新职位</div>
                </div>
                <Briefcase className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                待处理简历
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">156</div>
                  <div className="text-xs text-gray-500 mt-1">+32 今日新增</div>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                面试安排
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">24</div>
                  <div className="text-xs text-gray-500 mt-1">本周8场</div>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                已录用
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">12</div>
                  <div className="text-xs text-gray-500 mt-1">本月</div>
                </div>
                <Sparkles className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区域 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[700px]">
            <TabsTrigger value="jobs">职位管理</TabsTrigger>
            <TabsTrigger value="candidates">候选人</TabsTrigger>
            <TabsTrigger value="ai-screening">
              <Sparkles className="mr-2 h-4 w-4" />
              AI筛选
            </TabsTrigger>
            <TabsTrigger value="interviews">面试管理</TabsTrigger>
          </TabsList>

          {/* 职位管理标签页 */}
          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>职位列表</CardTitle>
                    <CardDescription>管理所有招聘职位</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      筛选
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      导出
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: '高级前端工程师',
                      department: '技术部',
                      location: '北京',
                      salary: '25-40K',
                      applicants: 45,
                      status: 'active',
                      createdAt: '3天前',
                    },
                    {
                      title: '产品经理',
                      department: '产品部',
                      location: '上海',
                      salary: '30-50K',
                      applicants: 32,
                      status: 'urgent',
                      createdAt: '1天前',
                    },
                    {
                      title: '数据分析师',
                      department: '数据部',
                      location: '深圳',
                      salary: '20-35K',
                      applicants: 28,
                      status: 'active',
                      createdAt: '5天前',
                    },
                  ].map((job, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                          <Badge
                            variant={job.status === 'urgent' ? 'destructive' : 'default'}
                            className="text-xs"
                          >
                            {job.status === 'urgent' ? '急聘' : '招聘中'}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">{job.createdAt}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>{job.department}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                        <span>•</span>
                        <span className="text-blue-600 dark:text-blue-400 font-medium">{job.salary}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Users className="h-4 w-4" />
                          <span>{job.applicants} 位候选人</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          查看详情 →
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 候选人标签页 */}
          <TabsContent value="candidates" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>候选人管理</CardTitle>
                  <div className="flex gap-2">
                    <Input placeholder="搜索候选人..." className="w-64" />
                    <Button variant="outline">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>查看和管理所有候选人信息</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>候选人列表功能开发中...</p>
                  <Button variant="outline" className="mt-4">
                    查看示例
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI筛选标签页 */}
          <TabsContent value="ai-screening" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      AI智能筛选
                    </CardTitle>
                    <CardDescription>利用AI自动筛选最匹配的候选人</CardDescription>
                  </div>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Sparkles className="mr-2 h-4 w-4" />
                    开始筛选
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 筛选设置 */}
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h3 className="font-semibold mb-3">筛选条件</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                          最低学历要求
                        </label>
                        <select className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800">
                          <option>本科</option>
                          <option>硕士</option>
                          <option>博士</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                          工作经验
                        </label>
                        <select className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800">
                          <option>1-3年</option>
                          <option>3-5年</option>
                          <option>5年以上</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                          匹配度阈值
                        </label>
                        <select className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800">
                          <option>80%以上</option>
                          <option>70%以上</option>
                          <option>60%以上</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* AI推荐结果 */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      AI 推荐候选人
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          name: '张三',
                          position: '高级前端工程师',
                          matchScore: 92,
                          highlights: ['5年React经验', '大型项目经验', '技术博客作者'],
                        },
                        {
                          name: '李四',
                          position: '高级前端工程师',
                          matchScore: 88,
                          highlights: ['4年Vue经验', '性能优化专家', '开源贡献者'],
                        },
                      ].map((candidate, index) => (
                        <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                {candidate.name[0]}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {candidate.name}
                                </h4>
                                <p className="text-sm text-gray-500">{candidate.position}</p>
                              </div>
                            </div>
                            <Badge className="bg-purple-600">{candidate.matchScore}%匹配</Badge>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {candidate.highlights.map((highlight, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {highlight}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="default">
                              安排面试
                            </Button>
                            <Button size="sm" variant="outline">
                              查看简历
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 面试管理标签页 */}
          <TabsContent value="interviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>面试管理</CardTitle>
                <CardDescription>管理面试流程和安排</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>面试管理功能开发中...</p>
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
