'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileSpreadsheet, FileText, Database, Calendar, Filter, Plus } from 'lucide-react';

export default function DataExportPage() {
  const [activeTab, setActiveTab] = useState('employees');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const exportTemplates = [
    {
      name: '员工基本信息',
      description: '导出所有员工的基本档案信息',
      category: 'employees',
      fields: ['姓名', '工号', '部门', '职位', '入职日期', '联系方式', '状态'],
    },
    {
      name: '员工详细信息',
      description: '导出员工的完整信息，包括教育、经历等',
      category: 'employees',
      fields: [
        '姓名',
        '工号',
        '部门',
        '职位',
        '入职日期',
        '联系方式',
        '教育背景',
        '工作经历',
        '技能证书',
        '状态',
      ],
    },
    {
      name: '绩效数据',
      description: '导出指定周期的绩效评估数据',
      category: 'performance',
      fields: ['姓名', '工号', '部门', '绩效周期', '绩效评分', '评估等级', '评语'],
    },
    {
      name: '薪酬数据',
      description: '导出指定月份的薪酬发放数据',
      category: 'compensation',
      fields: ['姓名', '工号', '部门', '职位', '基本工资', '绩效奖金', '社保', '个税', '实发工资'],
    },
    {
      name: '考勤数据',
      description: '导出指定月份的考勤统计数据',
      category: 'attendance',
      fields: [
        '姓名',
        '工号',
        '部门',
        '月份',
        '出勤天数',
        '请假天数',
        '加班时长',
        '迟到次数',
      ],
    },
  ];

  const exportFormats = [
    { name: 'Excel (.xlsx)', icon: FileSpreadsheet, description: '适合数据分析和报表制作' },
    { name: 'CSV (.csv)', icon: Database, description: '适合数据导入和系统迁移' },
    { name: 'PDF (.pdf)', icon: FileText, description: '适合打印和归档保存' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">数据导出</h1>
                <Badge className="bg-blue-600">PRO</Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                全量数据导出，自定义字段报表
              </p>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                总导出次数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">1,248</div>
                  <div className="text-xs text-gray-500 mt-1">本月 128 次</div>
                </div>
                <Download className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                导出模板
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">12</div>
                  <div className="text-xs text-gray-500 mt-1">可使用模板</div>
                </div>
                <FileSpreadsheet className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                最近导出
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">2小时前</div>
                  <div className="text-xs text-gray-500 mt-1">员工名单.xlsx</div>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                导出状态
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">正常</div>
                  <div className="text-xs text-gray-500 mt-1">服务运行中</div>
                </div>
                <Database className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区域 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
            <TabsTrigger value="quick">快捷导出</TabsTrigger>
            <TabsTrigger value="custom">自定义导出</TabsTrigger>
            <TabsTrigger value="history">导出历史</TabsTrigger>
          </TabsList>

          {/* 快捷导出标签页 */}
          <TabsContent value="quick" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>快捷导出</CardTitle>
                    <CardDescription>使用预设模板快速导出数据</CardDescription>
                  </div>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    筛选
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exportTemplates.map((template, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                          <CardTitle className="text-base">{template.name}</CardTitle>
                        </div>
                        <CardDescription>{template.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-sm text-gray-500">
                            包含字段：{template.fields.length} 个
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {template.fields.slice(0, 3).map((field, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {field}
                              </Badge>
                            ))}
                            {template.fields.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{template.fields.length - 3}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" className="flex-1">
                              <Download className="mr-2 h-4 w-4" />
                              Excel
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              CSV
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 自定义导出标签页 */}
          <TabsContent value="custom" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>自定义导出</CardTitle>
                <CardDescription>选择数据类型和字段，创建自定义导出模板</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 数据类型选择 */}
                  <div>
                    <h3 className="font-semibold mb-3">选择数据类型</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { name: '员工数据', icon: '👥' },
                        { name: '绩效数据', icon: '📊' },
                        { name: '薪酬数据', icon: '💰' },
                        { name: '考勤数据', icon: '⏰' },
                      ].map((type, index) => (
                        <div
                          key={index}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            index === 0
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'hover:border-gray-300'
                          }`}
                        >
                          <div className="text-2xl mb-2">{type.icon}</div>
                          <div className="font-medium text-sm">{type.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 字段选择 */}
                  <div>
                    <h3 className="font-semibold mb-3">选择导出字段</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        '姓名',
                        '工号',
                        '部门',
                        '职位',
                        '入职日期',
                        '联系方式',
                        '教育背景',
                        '工作经历',
                        '技能证书',
                        '状态',
                      ].map((field, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 border rounded-lg">
                          <Checkbox
                            id={`field-${index}`}
                            checked={selectedFields.includes(field)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedFields([...selectedFields, field]);
                              } else {
                                setSelectedFields(selectedFields.filter((f) => f !== field));
                              }
                            }}
                          />
                          <label
                            htmlFor={`field-${index}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {field}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 导出格式选择 */}
                  <div>
                    <h3 className="font-semibold mb-3">选择导出格式</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {exportFormats.map((format, index) => (
                        <div
                          key={index}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            index === 0
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'hover:border-gray-300'
                          }`}
                        >
                          <format.icon className="h-6 w-6 text-blue-600 mb-2" />
                          <div className="font-medium mb-1">{format.name}</div>
                          <div className="text-xs text-gray-500">{format.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 保存模板 */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="font-medium">保存为模板</div>
                      <div className="text-sm text-gray-500">将当前配置保存为导出模板</div>
                    </div>
                    <Button variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      保存模板
                    </Button>
                  </div>

                  {/* 导出按钮 */}
                  <div className="flex justify-end">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Download className="mr-2 h-4 w-4" />
                      开始导出
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 导出历史标签页 */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>导出历史</CardTitle>
                <CardDescription>查看所有导出记录和下载历史文件</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      fileName: '员工名单_202412.xlsx',
                      type: 'Excel',
                      size: '2.4 MB',
                      rows: 1248,
                      exportedBy: '张三',
                      exportedAt: '2024-12-01 14:30',
                      status: 'completed',
                    },
                    {
                      fileName: '绩效数据_Q3.csv',
                      type: 'CSV',
                      size: '1.2 MB',
                      rows: 856,
                      exportedBy: '李四',
                      exportedAt: '2024-11-28 10:15',
                      status: 'completed',
                    },
                    {
                      fileName: '薪酬数据_10月.pdf',
                      type: 'PDF',
                      size: '8.5 MB',
                      rows: 1248,
                      exportedBy: '王五',
                      exportedAt: '2024-11-01 09:00',
                      status: 'completed',
                    },
                  ].map((record, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            {record.type === 'Excel' ? (
                              <FileSpreadsheet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            ) : record.type === 'CSV' ? (
                              <Database className="h-6 w-6 text-green-600 dark:text-green-400" />
                            ) : (
                              <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {record.fileName}
                              </h3>
                              <Badge variant="secondary" className="text-xs">
                                {record.type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <span>{record.size}</span>
                              <span>•</span>
                              <span>{record.rows} 行数据</span>
                              <span>•</span>
                              <span>{record.exportedBy} 导出</span>
                              <span>•</span>
                              <span>{record.exportedAt}</span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          下载
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
