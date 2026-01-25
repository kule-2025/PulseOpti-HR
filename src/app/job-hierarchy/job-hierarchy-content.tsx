'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Award,
  Target,
  ChevronRight,
  Search,
  Filter,
  Download,
  Eye,
  MoreVertical,
  Grid3x3,
  List,
  Copy,
} from 'lucide-react';

interface JobFamily {
  id: string;
  code: string;
  name: string;
  description: string;
  parentId: string | null;
  sort: number;
  isActive: boolean;
  children?: JobFamily[];
}

interface JobRank {
  id: string;
  code: string;
  name: string;
  description: string;
  sequence: number;
  isActive: boolean;
}

interface JobGrade {
  id: string;
  code: string;
  name: string;
  description: string;
  sequence: number;
  salaryMin: number;
  salaryMax: number;
  isActive: boolean;
}

interface JobRankMapping {
  id: string;
  jobFamilyId: string;
  jobFamilyName: string;
  jobRankId: string;
  jobRankCode: string;
  jobRankName: string;
  jobGradeId: string;
  jobGradeName: string;
  positionTitle: string;
  responsibilities: string;
  requirements: string;
  competencyModel: any;
  isActive: boolean;
}

export default function JobHierarchyContent() {
  const [activeTab, setActiveTab] = useState('families');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'create' | 'edit'>('create');

  // 模拟数据
  const [jobFamilies, setJobFamilies] = useState<JobFamily[]>([]);
  const [jobRanks, setJobRanks] = useState<JobRank[]>([]);
  const [jobGrades, setJobGrades] = useState<JobGrade[]>([]);
  const [jobRankMappings, setJobRankMappings] = useState<JobRankMapping[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 模拟职位族数据
      const mockFamilies: JobFamily[] = [
        {
          id: '1',
          code: 'TECH',
          name: '技术族',
          description: '所有技术相关职位',
          parentId: null,
          sort: 1,
          isActive: true,
          children: [
            {
              id: '1-1',
              code: 'FE',
              name: '前端技术',
              description: '前端开发相关职位',
              parentId: '1',
              sort: 1,
              isActive: true,
            },
            {
              id: '1-2',
              code: 'BE',
              name: '后端技术',
              description: '后端开发相关职位',
              parentId: '1',
              sort: 2,
              isActive: true,
            },
            {
              id: '1-3',
              code: 'QA',
              name: '测试技术',
              description: '测试相关职位',
              parentId: '1',
              sort: 3,
              isActive: true,
            },
          ],
        },
        {
          id: '2',
          code: 'PROD',
          name: '产品族',
          description: '所有产品相关职位',
          parentId: null,
          sort: 2,
          isActive: true,
          children: [
            {
              id: '2-1',
              code: 'PM',
              name: '产品管理',
              description: '产品经理相关职位',
              parentId: '2',
              sort: 1,
              isActive: true,
            },
            {
              id: '2-2',
              code: 'DESIGN',
              name: '设计',
              description: 'UI/UX设计相关职位',
              parentId: '2',
              sort: 2,
              isActive: true,
            },
          ],
        },
        {
          id: '3',
          code: 'MGT',
          name: '管理族',
          description: '所有管理相关职位',
          parentId: null,
          sort: 3,
          isActive: true,
        },
        {
          id: '4',
          code: 'SALES',
          name: '销售族',
          description: '所有销售相关职位',
          parentId: null,
          sort: 4,
          isActive: true,
        },
      ];

      // 模拟职级数据
      const mockRanks: JobRank[] = [
        { id: '1', code: 'P1', name: '初级工程师', description: '初级技术职级', sequence: 1, isActive: true },
        { id: '2', code: 'P2', name: '工程师', description: '中级技术职级', sequence: 2, isActive: true },
        { id: '3', code: 'P3', name: '高级工程师', description: '高级技术职级', sequence: 3, isActive: true },
        { id: '4', code: 'P4', name: '资深工程师', description: '资深技术职级', sequence: 4, isActive: true },
        { id: '5', code: 'P5', name: '技术专家', description: '专家技术职级', sequence: 5, isActive: true },
        { id: '6', code: 'M1', name: '一线经理', description: '一线管理职级', sequence: 6, isActive: true },
        { id: '7', code: 'M2', name: '部门经理', description: '部门管理职级', sequence: 7, isActive: true },
        { id: '8', code: 'M3', name: '总监', description: '总监管理职级', sequence: 8, isActive: true },
      ];

      // 模拟职等数据
      const mockGrades: JobGrade[] = [
        {
          id: '1',
          code: 'G1',
          name: '初级',
          description: '初级岗位',
          sequence: 1,
          salaryMin: 500000,
          salaryMax: 800000,
          isActive: true,
        },
        {
          id: '2',
          code: 'G2',
          name: '中级',
          description: '中级岗位',
          sequence: 2,
          salaryMin: 800000,
          salaryMax: 1500000,
          isActive: true,
        },
        {
          id: '3',
          code: 'G3',
          name: '高级',
          description: '高级岗位',
          sequence: 3,
          salaryMin: 1500000,
          salaryMax: 2500000,
          isActive: true,
        },
        {
          id: '4',
          code: 'G4',
          name: '资深',
          description: '资深岗位',
          sequence: 4,
          salaryMin: 2500000,
          salaryMax: 4000000,
          isActive: true,
        },
        {
          id: '5',
          code: 'G5',
          name: '专家',
          description: '专家岗位',
          sequence: 5,
          salaryMin: 4000000,
          salaryMax: 6000000,
          isActive: true,
        },
      ];

      // 模拟职位映射数据
      const mockMappings: JobRankMapping[] = [
        {
          id: '1',
          jobFamilyId: '1-1',
          jobFamilyName: '前端技术',
          jobRankId: '1',
          jobRankCode: 'P1',
          jobRankName: '初级工程师',
          jobGradeId: '1',
          jobGradeName: '初级',
          positionTitle: '初级前端工程师',
          responsibilities: '1. 参与前端页面开发\n2. 实现用户界面交互\n3. 配合UI/UX设计师完成设计实现',
          requirements: '1. 本科及以上学历\n2. 1-2年前端开发经验\n3. 熟悉React/Vue等前端框架\n4. 良好的团队协作能力',
          competencyModel: null,
          isActive: true,
        },
        {
          id: '2',
          jobFamilyId: '1-1',
          jobFamilyName: '前端技术',
          jobRankId: '2',
          jobRankCode: 'P2',
          jobRankName: '工程师',
          jobGradeId: '2',
          jobGradeName: '中级',
          positionTitle: '前端工程师',
          responsibilities: '1. 负责核心模块的前端开发\n2. 编写高质量的前端代码\n3. 参与技术方案设计',
          requirements: '1. 本科及以上学历\n2. 3-5年前端开发经验\n3. 精通React/Vue等前端框架\n4. 有大型项目经验',
          competencyModel: null,
          isActive: true,
        },
        {
          id: '3',
          jobFamilyId: '1-1',
          jobFamilyName: '前端技术',
          jobRankId: '3',
          jobRankCode: 'P3',
          jobRankName: '高级工程师',
          jobGradeId: '3',
          jobGradeName: '高级',
          positionTitle: '高级前端工程师',
          responsibilities: '1. 负责前端架构设计\n2. 解决复杂技术问题\n3. 指导团队成员',
          requirements: '1. 本科及以上学历\n2. 5-8年前端开发经验\n3. 深入理解前端技术体系\n4. 有架构设计经验',
          competencyModel: null,
          isActive: true,
        },
      ];

      setJobFamilies(mockFamilies);
      setJobRanks(mockRanks);
      setJobGrades(mockGrades);
      setJobRankMappings(mockMappings);
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  };

  const renderJobFamilies = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索职位族..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        <Button onClick={() => { setDialogType('create'); setSelectedItem(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          新增职位族
        </Button>
      </div>

      <div className="grid gap-4">
        {jobFamilies
          .filter((item: any) => family =>
            searchQuery === '' ||
            family.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            family.code.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map(family => (
            <Card key={family.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {family.name}
                        <Badge variant="outline">{family.code}</Badge>
                        {!family.isActive && <Badge variant="secondary">已停用</Badge>}
                      </CardTitle>
                      <CardDescription>{family.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {family.children && family.children.length > 0 && (
                <CardContent>
                  <div className="grid gap-3 ml-8">
                    {family.children.map(child => (
                      <div
                        key={child.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{child.name}</span>
                              <Badge variant="outline" className="text-xs">{child.code}</Badge>
                              {!child.isActive && <Badge variant="secondary" className="text-xs">已停用</Badge>}
                            </div>
                            <p className="text-sm text-gray-500">{child.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
      </div>
    </div>
  );

  const renderJobRanks = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索职级..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        <Button onClick={() => { setDialogType('create'); setSelectedItem(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          新增职级
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">序号</TableHead>
                <TableHead>职级代码</TableHead>
                <TableHead>职级名称</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobRanks
                .sort((a, b) => a.sequence - b.sequence)
                .filter((item: any) => rank =>
                  searchQuery === '' ||
                  rank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  rank.code.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((rank, index) => (
                  <TableRow key={rank.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{rank.code}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{rank.name}</TableCell>
                    <TableCell className="text-gray-500">{rank.description}</TableCell>
                    <TableCell>
                      <Badge variant={rank.isActive ? 'default' : 'secondary'}>
                        {rank.isActive ? '启用' : '停用'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderJobGrades = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索职等..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        <Button onClick={() => { setDialogType('create'); setSelectedItem(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          新增职等
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobGrades
          .sort((a, b) => a.sequence - b.sequence)
          .filter((item: any) => grade =>
            searchQuery === '' ||
            grade.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            grade.code.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map(grade => (
            <Card key={grade.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-orange-500" />
                    <CardTitle className="text-lg">{grade.name}</CardTitle>
                    <Badge variant="outline">{grade.code}</Badge>
                  </div>
                  {!grade.isActive && <Badge variant="secondary">已停用</Badge>}
                </div>
                <CardDescription>{grade.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">薪资范围</span>
                    <span className="font-medium">
                      ¥{(grade.salaryMin / 10000).toFixed(1)}万 - ¥{(grade.salaryMax / 10000).toFixed(1)}万
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">排序</span>
                    <span className="font-medium">{grade.sequence}</span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 mt-4">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );

  const renderJobRankMappings = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索职位映射..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        <Button onClick={() => { setDialogType('create'); setSelectedItem(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          新建职位映射
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>职位族</TableHead>
                <TableHead>职级</TableHead>
                <TableHead>职等</TableHead>
                <TableHead>职位名称</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobRankMappings
                .filter((item: any) => mapping =>
                  searchQuery === '' ||
                  mapping.positionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  mapping.jobFamilyName.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(mapping => (
                  <TableRow key={mapping.id}>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50">{mapping.jobFamilyName}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50">{mapping.jobRankCode}</Badge>
                      <span className="ml-1 text-sm">{mapping.jobRankName}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-orange-50">{mapping.jobGradeName}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{mapping.positionTitle}</TableCell>
                    <TableCell>
                      <Badge variant={mapping.isActive ? 'default' : 'secondary'}>
                        {mapping.isActive ? '启用' : '停用'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">职位体系管理</h1>
        <p className="text-muted-foreground mt-2">
          管理公司的职位族、职级、职等及职位映射关系，构建完善的职位体系
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="families">
            <Layers className="mr-2 h-4 w-4" />
            职位族
          </TabsTrigger>
          <TabsTrigger value="ranks">
            <Target className="mr-2 h-4 w-4" />
            职级
          </TabsTrigger>
          <TabsTrigger value="grades">
            <Award className="mr-2 h-4 w-4" />
            职等
          </TabsTrigger>
          <TabsTrigger value="mappings">
            <Grid3x3 className="mr-2 h-4 w-4" />
            职位映射
          </TabsTrigger>
        </TabsList>

        <TabsContent value="families" className="space-y-4">
          {renderJobFamilies()}
        </TabsContent>

        <TabsContent value="ranks" className="space-y-4">
          {renderJobRanks()}
        </TabsContent>

        <TabsContent value="grades" className="space-y-4">
          {renderJobGrades()}
        </TabsContent>

        <TabsContent value="mappings" className="space-y-4">
          {renderJobRankMappings()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
