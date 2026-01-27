'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { ArrowLeft, Users, Map, Search, Filter, TrendingUp, Award, Star, Target } from 'lucide-react';

export default function TalentMapPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [viewMode, setViewMode] = useState('nineBox');

  useEffect(() => {
    fetchTalentMap();
  }, [filterDepartment, filterLevel]);

  const fetchTalentMap = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/talent-map');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setData(mockData);
      }
    } catch (error) {
      console.error('Error fetching talent map:', error);
      setData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const mockData = {
    nineBox: [
      {
        category: 'star',
        name: '明星员工',
        description: '高绩效高潜力的核心人才',
        count: 8,
        employees: [
          { id: 1, name: '张三', position: '高级工程师', department: '技术部', performance: 95, potential: 92, avatar: 'ZS' },
          { id: 2, name: '李四', position: '产品经理', department: '产品部', performance: 93, potential: 88, avatar: 'LS' },
        ],
        color: 'bg-emerald-500',
        textColor: 'text-emerald-600',
      },
      {
        category: 'highPotential',
        name: '高潜人才',
        description: '高潜力需进一步培养',
        count: 12,
        employees: [
          { id: 3, name: '王五', position: '工程师', department: '技术部', performance: 85, potential: 90, avatar: 'WW' },
          { id: 4, name: '赵六', position: '设计师', department: '设计部', performance: 82, potential: 87, avatar: 'ZL' },
        ],
        color: 'bg-blue-500',
        textColor: 'text-blue-600',
      },
      {
        category: 'solidContributor',
        name: '稳定贡献者',
        description: '绩效稳定潜力中等',
        count: 25,
        employees: [
          { id: 5, name: '钱七', position: '工程师', department: '技术部', performance: 88, potential: 75, avatar: 'QQ' },
          { id: 6, name: '孙八', position: '运营专员', department: '运营部', performance: 86, potential: 72, avatar: 'SB' },
        ],
        color: 'bg-purple-500',
        textColor: 'text-purple-600',
      },
      {
        category: 'risingStar',
        name: '新星人才',
        description: '绩效突出需关注潜力',
        count: 10,
        employees: [
          { id: 7, name: '周九', position: '工程师', department: '技术部', performance: 90, potential: 68, avatar: 'ZJ' },
          { id: 8, name: '吴十', position: '销售代表', department: '销售部', performance: 88, potential: 65, avatar: 'WS' },
        ],
        color: 'bg-yellow-500',
        textColor: 'text-yellow-600',
      },
      {
        category: 'underPerformer',
        name: '待提升',
        description: '绩效偏低需改进',
        count: 8,
        employees: [
          { id: 9, name: '郑十一', position: '实习生', department: '技术部', performance: 72, potential: 75, avatar: 'ZSY' },
        ],
        color: 'bg-orange-500',
        textColor: 'text-orange-600',
      },
      {
        category: 'risk',
        name: '风险员工',
        description: '绩效潜力双低',
        count: 2,
        employees: [
          { id: 10, name: '王十二', position: '助理', department: '行政部', performance: 65, potential: 60, avatar: 'WSE' },
        ],
        color: 'bg-red-500',
        textColor: 'text-red-600',
      },
    ],
    skillsMatrix: [
      { skill: '技术能力', coverage: 85, gap: 15, critical: true },
      { skill: '管理能力', coverage: 65, gap: 35, critical: true },
      { skill: '沟通能力', coverage: 78, gap: 22, critical: false },
      { skill: '创新能力', coverage: 72, gap: 28, critical: true },
      { skill: '执行力', coverage: 88, gap: 12, critical: true },
      { skill: '学习能力', coverage: 82, gap: 18, critical: false },
      { skill: '团队协作', coverage: 85, gap: 15, critical: false },
      { skill: '问题解决', coverage: 80, gap: 20, critical: true },
    ],
    successionPlan: [
      { position: 'CTO', incumbent: '张三', successors: ['李四', '王五'], readiness: 0.75 },
      { position: '产品总监', incumbent: '钱七', successors: ['赵六'], readiness: 0.65 },
      { position: '技术总监', incumbent: '孙八', successors: ['周九', '吴十'], readiness: 0.70 },
      { position: '销售总监', incumbent: '郑十一', successors: [], readiness: 0.30 },
    ],
    talentPipeline: {
      levels: [
        { name: '高层领导', target: 5, current: 3, gap: 2 },
        { name: '中层管理', target: 15, current: 12, gap: 3 },
        { name: '核心骨干', target: 30, current: 25, gap: 5 },
        { name: '潜力人才', target: 20, current: 15, gap: 5 },
      ],
      total: { target: 70, current: 55, gap: 15 },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">加载人才地图数据...</p>
        </div>
      </div>
    );
  }

  const currentData = data || mockData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard/analytics">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回
                </Button>
              </Link>
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-indigo-600 rounded-lg">
                <Map className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">人才地图</h1>
                <p className="text-sm text-slate-500">全方位人才盘点与发展规划</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                高级筛选
              </Button>
              <Button variant="outline" size="sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                生成报告
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <Card className="shadow-lg mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="搜索员工..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterDepartment} onValueChange={(v) => setFilterDepartment(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择部门" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部部门</SelectItem>
                  <SelectItem value="tech">技术部</SelectItem>
                  <SelectItem value="product">产品部</SelectItem>
                  <SelectItem value="sales">销售部</SelectItem>
                  <SelectItem value="operations">运营部</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterLevel} onValueChange={(v) => setFilterLevel(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择职级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部职级</SelectItem>
                  <SelectItem value="senior">高级</SelectItem>
                  <SelectItem value="middle">中级</SelectItem>
                  <SelectItem value="junior">初级</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Nine Box Grid */}
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle>九宫格人才分布</CardTitle>
            <CardDescription>基于绩效与潜力的人才分类</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {currentData.nineBox.map((box: any, index: number) => (
                <div
                  key={index}
                  className="p-4 border-2 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  style={{ borderColor: box.color.replace('bg-', '') }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <div className={`w-3 h-3 rounded-full ${box.color}`} />
                        <h3 className="font-semibold text-slate-900">{box.name}</h3>
                      </div>
                      <p className="text-sm text-slate-500">{box.description}</p>
                    </div>
                    <Badge variant="outline">{box.count}人</Badge>
                  </div>
                  {box.employees.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {box.employees.slice(0, 3).map((emp: any) => (
                        <div key={emp.id} className="flex items-center space-x-3 p-2 bg-slate-50 rounded">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {emp.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-900 truncate">{emp.name}</div>
                            <div className="text-xs text-slate-500 truncate">{emp.position}</div>
                          </div>
                        </div>
                      ))}
                      {box.employees.length > 3 && (
                        <div className="text-xs text-slate-500 text-center">
                          +{box.employees.length - 3} 更多
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skills Matrix */}
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle>技能矩阵</CardTitle>
            <CardDescription>关键技能覆盖度与缺口分析</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentData.skillsMatrix.map((skill: any, index: number) => (
                <div key={index} className="p-4 bg-white border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-slate-900">{skill.skill}</h3>
                      {skill.critical && (
                        <Badge variant="destructive" className="text-xs">关键技能</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-slate-500">覆盖率: {skill.coverage}%</span>
                      <span className="text-red-500">缺口: {skill.gap}%</span>
                    </div>
                  </div>
                  <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${skill.coverage >= 80 ? 'bg-emerald-500' : skill.coverage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${skill.coverage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Succession Plan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>继任计划</CardTitle>
              <CardDescription>关键岗位继任者准备度</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentData.successionPlan.map((plan: any, index: number) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{plan.position}</h3>
                        <div className="text-sm text-slate-500">现任: {plan.incumbent}</div>
                      </div>
                      <Badge variant={plan.readiness >= 0.7 ? 'default' : 'secondary'}>
                        准备度 {Math.round(plan.readiness * 100)}%
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs text-slate-500">继任者:</div>
                      <div className="flex flex-wrap gap-2">
                        {plan.successors.length > 0 ? (
                          plan.successors.map((successor: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              <Target className="w-3 h-3 mr-1" />
                              {successor}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline" className="text-xs text-slate-400">
                            暂无继任者
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${plan.readiness >= 0.7 ? 'bg-emerald-500' : plan.readiness >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${plan.readiness * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>人才梯队</CardTitle>
              <CardDescription>各层级人才储备情况</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentData.talentPipeline.levels.map((level: any, index: number) => (
                  <div key={index} className="p-4 bg-white border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">{level.name}</h3>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-slate-500">{level.current}/{level.target}</span>
                        {level.gap > 0 && (
                          <Badge variant="destructive" className="text-xs">缺口 {level.gap}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${level.current >= level.target ? 'bg-emerald-500' : 'bg-yellow-500'}`}
                        style={{ width: `${(level.current / level.target) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">总计</div>
                      <div className="text-sm text-slate-500">人才储备总览</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">
                        {currentData.talentPipeline.total.current}/{currentData.talentPipeline.total.target}
                      </div>
                      <Badge variant={currentData.talentPipeline.total.gap > 0 ? 'destructive' : 'default'}>
                        {currentData.talentPipeline.total.gap > 0 ? `缺口 ${currentData.talentPipeline.total.gap}` : '达标'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
