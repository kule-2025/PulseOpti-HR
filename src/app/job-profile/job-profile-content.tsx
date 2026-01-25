'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Sparkles,
  BrainCircuit,
  Target,
  Search,
  Plus,
  Edit,
  Save,
  RefreshCw,
  Download,
  FileText,
  TrendingUp,
  Users,
  Award,
  CheckCircle2,
  AlertCircle,
  Zap,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';

interface JobProfile {
  id: string;
  positionName: string;
  department: string;
  level: string;
  description: string;
  responsibilities: string[];
  requirements: {
    education: string[];
    experience: string;
    skills: string[];
    certifications: string[];
  };
  competencies: Array<{
    name: string;
    level: number;
    category: string;
  }>;
  performanceIndicators: string[];
  careerPath: string[];
  salaryRange: {
    min: number;
    max: number;
  };
  marketBenchmark: {
    salaryMin: number;
    salaryMax: number;
    medianSalary: number;
    demandLevel: 'high' | 'medium' | 'low';
    growthRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface MatchingCandidate {
  id: string;
  name: string;
  currentPosition: string;
  matchScore: number;
  matchDetails: {
    skills: number;
    experience: number;
    education: number;
    overall: number;
  };
  gaps: string[];
  strengths: string[];
}

export default function JobProfileContent() {
  const [activeTab, setActiveTab] = useState('list');
  const [selectedProfile, setSelectedProfile] = useState<JobProfile | null>(null);
  const [profiles, setProfiles] = useState<JobProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchJobProfiles();
  }, []);

  const fetchJobProfiles = async () => {
    try {
      // 模拟数据
      const mockProfiles: JobProfile[] = [
        {
          id: '1',
          positionName: '高级产品经理',
          department: '产品部',
          level: 'P7',
          description: '负责公司核心产品的规划与迭代，带领产品团队完成产品目标',
          responsibilities: [
            '制定产品战略和路线图',
            '进行市场调研和用户需求分析',
            '撰写产品需求文档（PRD）',
            '协调设计、研发、测试团队',
            '监控产品数据，持续优化产品体验',
          ],
          requirements: {
            education: ['本科及以上，计算机、市场营销、工商管理等专业'],
            experience: '5年以上产品经理经验，至少3年团队管理经验',
            skills: ['产品规划', '用户研究', '数据分析', '项目管理', '团队协作'],
            certifications: ['PMP', 'NPDP优先'],
          },
          competencies: [
            { name: '战略思维', level: 90, category: '核心能力' },
            { name: '用户洞察', level: 85, category: '核心能力' },
            { name: '数据分析', level: 80, category: '核心能力' },
            { name: '沟通协调', level: 85, category: '领导力' },
            { name: '创新思维', level: 75, category: '创新力' },
          ],
          performanceIndicators: [
            '产品用户增长率',
            '用户满意度（NPS）',
            '产品迭代速度',
            '团队绩效考核',
          ],
          careerPath: ['产品总监', '事业部负责人'],
          salaryRange: { min: 25000, max: 40000 },
          marketBenchmark: {
            salaryMin: 28000,
            salaryMax: 35000,
            medianSalary: 32000,
            demandLevel: 'high',
            growthRate: 15,
          },
          createdAt: '2024-01-15',
          updatedAt: '2024-01-20',
        },
        {
          id: '2',
          positionName: '技术主管',
          department: '技术部',
          level: 'P7',
          description: '负责技术团队的管理和技术架构的设计，确保系统稳定性和可扩展性',
          responsibilities: [
            '制定技术架构和开发规范',
            '负责核心系统的设计与实现',
            '带领团队完成开发任务',
            '进行代码审查和技术指导',
            '解决技术难题，优化系统性能',
          ],
          requirements: {
            education: ['本科及以上，计算机相关专业'],
            experience: '5年以上开发经验，至少2年团队管理经验',
            skills: ['系统架构', '编程语言', '数据库', '代码审查', '团队管理'],
            certifications: ['架构师认证优先'],
          },
          competencies: [
            { name: '技术领导力', level: 90, category: '领导力' },
            { name: '架构设计', level: 88, category: '核心技术' },
            { name: '问题解决', level: 85, category: '核心能力' },
            { name: '团队建设', level: 80, category: '领导力' },
          ],
          performanceIndicators: [
            '系统稳定性',
            '开发效率',
            '代码质量',
            '团队成长',
          ],
          careerPath: ['技术总监', 'CTO'],
          salaryRange: { min: 28000, max: 45000 },
          marketBenchmark: {
            salaryMin: 30000,
            salaryMax: 40000,
            medianSalary: 35000,
            demandLevel: 'high',
            growthRate: 12,
          },
          createdAt: '2024-01-10',
          updatedAt: '2024-01-18',
        },
        {
          id: '3',
          positionName: '销售经理',
          department: '销售部',
          level: 'M2',
          description: '负责销售团队的管理和业绩达成，拓展客户资源和市场',
          responsibilities: [
            '制定销售策略和目标',
            '带领团队完成销售任务',
            '开发新客户，维护老客户',
            '分析市场动态，调整销售策略',
            '培训销售人员，提升团队能力',
          ],
          requirements: {
            education: ['本科及以上，市场营销、工商管理等专业优先'],
            experience: '3年以上销售经验，至少1年团队管理经验',
            skills: ['销售技巧', '客户关系', '市场分析', '团队管理', '谈判能力'],
            certifications: ['无特殊要求'],
          },
          competencies: [
            { name: '客户关系', level: 88, category: '核心能力' },
            { name: '销售技巧', level: 85, category: '核心能力' },
            { name: '团队管理', level: 82, category: '领导力' },
            { name: '市场洞察', level: 78, category: '核心能力' },
          ],
          performanceIndicators: [
            '销售额达成率',
            '客户增长率',
            '客户满意度',
            '团队业绩',
          ],
          careerPath: ['销售总监', '营销副总'],
          salaryRange: { min: 20000, max: 35000 },
          marketBenchmark: {
            salaryMin: 25000,
            salaryMax: 32000,
            medianSalary: 28000,
            demandLevel: 'medium',
            growthRate: 8,
          },
          createdAt: '2024-01-08',
          updatedAt: '2024-01-22',
        },
      ];
      setProfiles(mockProfiles);
    } catch (error) {
      console.error('获取岗位画像失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateProfile = async (position: string) => {
    setGenerating(true);
    try {
      // 调用AI生成岗位画像
      const response = await fetch('/api/ai/job-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('岗位画像生成成功');
        // 这里应该添加新画像到列表
      }
    } catch (error) {
      toast.error('生成失败');
    } finally {
      setGenerating(false);
    }
  };

  const getDemandBadge = (level: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      'high': { label: '高需求', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
      'medium': { label: '中需求', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
      'low': { label: '低需求', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
    };
    const badge = badges[level] || { label: level, color: 'bg-gray-100' };
    return <Badge className={badge.color}>{badge.label}</Badge>;
  };

  const matchingCandidates: MatchingCandidate[] = [
    {
      id: '1',
      name: '张三',
      currentPosition: '产品经理',
      matchScore: 88,
      matchDetails: {
        skills: 90,
        experience: 85,
        education: 88,
        overall: 88,
      },
      gaps: ['团队管理经验略少'],
      strengths: ['产品规划能力突出', '数据分析能力强'],
    },
    {
      id: '2',
      name: '李四',
      currentPosition: '高级产品经理',
      matchScore: 75,
      matchDetails: {
        skills: 80,
        experience: 75,
        education: 70,
        overall: 75,
      },
      gaps: ['缺少团队管理经验', '项目管理工具使用不熟练'],
      strengths: ['用户研究能力强', '沟通协调能力好'],
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI岗位画像
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            智能生成岗位能力模型，精准匹配合适人才
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Sparkles className="h-4 w-4 mr-2" />
                AI生成画像
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>AI生成岗位画像</DialogTitle>
                <DialogDescription>
                  输入岗位名称，AI将自动生成完整的岗位画像
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="position">岗位名称</Label>
                  <Input
                    id="position"
                    placeholder="例如：高级产品经理、技术主管..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="department">所属部门</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="选择部门" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">产品部</SelectItem>
                      <SelectItem value="tech">技术部</SelectItem>
                      <SelectItem value="sales">销售部</SelectItem>
                      <SelectItem value="hr">人力资源部</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full"
                  onClick={() => generateProfile('高级产品经理')}
                  disabled={generating}
                >
                  {generating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      开始生成
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            批量导出
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">岗位总数</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{Math.round(
                profiles.reduce((sum, p) => sum + p.marketBenchmark.salaryMin + p.marketBenchmark.salaryMax, 0) /
                (profiles.length * 2) / 1000
              )}K
            </div>
            <p className="text-xs text-gray-500">月平均薪资</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完成度</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-gray-500">信息完整度</p>
          </CardContent>
        </Card>
      </div>

      {/* 主内容区域 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profiles">岗位画像</TabsTrigger>
          <TabsTrigger value="matching">人才匹配</TabsTrigger>
          <TabsTrigger value="analysis">市场分析</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="space-y-4">
          {profiles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">暂无岗位画像</p>
                <Button onClick={() => generateProfile('产品经理')}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  生成第一个岗位画像
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {profiles.map(profile => (
                <Card key={profile.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{profile.positionName}</CardTitle>
                        <CardDescription className="mt-1">
                          {profile.department} · {profile.level}
                        </CardDescription>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {profile.competencies.length}项能力
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">技能要求</div>
                        <div className="flex flex-wrap gap-1">
                          {profile.requirements.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {profile.requirements.skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{profile.requirements.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">市场需求</div>
                        {getDemandBadge(profile.marketBenchmark.demandLevel)}
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">薪资范围</div>
                        <div className="font-semibold text-sm">
                          ¥{profile.marketBenchmark.salaryMin} - ¥{profile.marketBenchmark.salaryMax}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="matching" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>人才匹配</CardTitle>
              <CardDescription>基于岗位画像的智能匹配推荐</CardDescription>
            </CardHeader>
            <CardContent>
              {matchingCandidates.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  暂无匹配数据
                </div>
              ) : (
                <div className="space-y-4">
                  {matchingCandidates.map(candidate => (
                    <div
                      key={candidate.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-lg">{candidate.name}</div>
                          <div className="text-sm text-gray-500">{candidate.currentPosition}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {candidate.matchScore}%
                          </div>
                          <div className="text-xs text-gray-500">匹配度</div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">技能匹配</div>
                          <div className="font-medium">{candidate.matchDetails.skills}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">经验匹配</div>
                          <div className="font-medium">{candidate.matchDetails.experience}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">学历匹配</div>
                          <div className="font-medium">{candidate.matchDetails.education}%</div>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-4">
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-1">优势</div>
                          <div className="flex flex-wrap gap-1">
                            {candidate.strengths.map((strength, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {strength}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-1">待提升</div>
                          <div className="flex flex-wrap gap-1">
                            {candidate.gaps.map((gap, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {gap}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>市场分析</CardTitle>
              <CardDescription>岗位市场趋势分析</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">需求趋势</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="text-sm text-gray-500 mb-1">本月需求</div>
                      <div className="text-2xl font-bold">1,234</div>
                      <div className="text-xs text-green-600 mt-1">
                        <TrendingUp className="h-3 w-3 inline mr-1" />
                        +12% 环比
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="text-sm text-gray-500 mb-1">平均薪资</div>
                      <div className="text-2xl font-bold">¥22.5K</div>
                      <div className="text-xs text-green-600 mt-1">
                        <TrendingUp className="h-3 w-3 inline mr-1" />
                        +8.5% 环比
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="text-sm text-gray-500 mb-1">竞争指数</div>
                      <div className="text-2xl font-bold">3.2</div>
                      <div className="text-xs text-red-600 mt-1">
                        <TrendingUp className="h-3 w-3 inline mr-1" />
                        +5.2% 环比
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">热门技能</h3>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'Vue', 'TypeScript', 'Node.js', 'Python', '产品规划', '数据分析', '项目管理', '用户体验', '敏捷开发'].map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
