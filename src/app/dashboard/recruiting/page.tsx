'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { VirtualScroll } from '@/components/performance/virtual-scroll';
import { LazyImage } from '@/components/performance/optimized-image';
import { useDebounce, useFetch } from '@/hooks/use-performance';
import { Building2, Briefcase, Calendar, Filter, Plus, Download, Search } from 'lucide-react';
import { cn } from '@/lib/theme';

// 类型定义
interface Position {
  id: string;
  title: string;
  department: string;
  location: string;
  salary: string;
  status: string;
  createdAt: string;
  applicants: number;
  requirements: string[];
  responsibilities: string[];
}

interface Candidate {
  id: string;
  name: string;
  position: string;
  status: string;
  experience: string;
  phone: string;
  email: string;
  appliedDate: string;
  avatar: string | null;
  education: string;
  university: string;
}

// 模拟数据
const MOCK_POSITIONS: Position[] = [
  {
    id: '1',
    title: '高级前端工程师',
    department: '技术部',
    location: '北京',
    salary: '25-40K',
    status: '招聘中',
    createdAt: '2024-01-15',
    applicants: 45,
    requirements: ['5年以上前端开发经验', '精通React/Vue', '熟悉Node.js'],
    responsibilities: ['负责公司核心产品开发', '优化前端性能', '技术方案设计'],
  },
  {
    id: '2',
    title: '产品经理',
    department: '产品部',
    location: '上海',
    salary: '20-35K',
    status: '招聘中',
    createdAt: '2024-01-10',
    applicants: 32,
    requirements: ['3年以上产品经验', '有B端产品经验', '优秀的沟通能力'],
    responsibilities: ['需求调研与分析', '产品规划与设计', '跨团队协作'],
  },
  {
    id: '3',
    title: '数据分析师',
    department: '数据部',
    location: '深圳',
    salary: '18-30K',
    status: '暂停招聘',
    createdAt: '2024-01-05',
    applicants: 28,
    requirements: ['熟练使用SQL', '有数据挖掘经验', '熟悉Python'],
    responsibilities: ['数据报表开发', '业务数据分析', '数据模型设计'],
  },
  {
    id: '4',
    title: 'UI设计师',
    department: '设计部',
    location: '北京',
    salary: '15-25K',
    status: '招聘中',
    createdAt: '2024-01-20',
    applicants: 18,
    requirements: ['3年以上UI设计经验', '熟悉Figma/Sketch', '良好的审美'],
    responsibilities: ['产品界面设计', '设计规范维护', '设计评审'],
  },
];

const MOCK_CANDIDATES: Candidate[] = Array.from({ length: 50 }, (_, i) => ({
  id: `cand-${i + 1}`,
  name: `候选人${i + 1}`,
  position: i % 3 === 0 ? '高级前端工程师' : i % 3 === 1 ? '产品经理' : '数据分析师',
  status: i % 4 === 0 ? '待筛选' : i % 4 === 1 ? '面试中' : i % 4 === 2 ? '已通过' : '已拒绝',
  experience: `${(i % 8) + 1}年`,
  phone: '138****8888',
  email: 'candidate@example.com',
  appliedDate: `2024-01-${(i % 30) + 1}`,
  avatar: null,
  education: i % 2 === 0 ? '本科' : '硕士',
  university: ['清华大学', '北京大学', '复旦大学', '上海交大'][i % 4],
}));

export default function RecruitingPage() {
  const [activeTab, setActiveTab] = useState('positions');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // 获取职位数据
  const { data: positions, loading: positionsLoading } = useFetch<Position[]>(
    '/api/recruiting/positions',
    { fallback: MOCK_POSITIONS }
  );

  // 获取候选人数据
  const { data: candidates, loading: candidatesLoading } = useFetch<Candidate[]>(
    '/api/recruiting/candidates',
    { fallback: MOCK_CANDIDATES }
  );

  // 筛选候选人
  const filteredCandidates = useMemo(() => {
    if (!candidates) return [];

    return candidates.filter((cand: Candidate) => {
      const matchesSearch =
        cand.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        cand.position.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesStatus = statusFilter === 'all' || cand.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [candidates, debouncedSearch, statusFilter]);

  // 虚拟列表项渲染器
  const CandidateItem = useCallback((candidate: Candidate, index: number) => {
    if (!candidate) return null;

    const statusColors: Record<string, string> = {
      '待筛选': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      '面试中': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      '已通过': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      '已拒绝': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    return (
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="shrink-0">
            {candidate.avatar ? (
              <LazyImage
                src={candidate.avatar}
                alt={candidate.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                {candidate.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-white truncate">
              {candidate.name}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {candidate.position} · {candidate.experience}经验
            </p>
          </div>

          <div className="hidden md:flex items-center gap-4 shrink-0">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>{candidate.university} · {candidate.education}</p>
              <p>{candidate.appliedDate} 投递</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 ml-4">
          <Badge className={statusColors[candidate.status]}>
            {candidate.status}
          </Badge>
          <Button variant="outline" size="sm">
            查看
          </Button>
        </div>
      </div>
    );
  }, []);

  if (loading || positionsLoading || candidatesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            招聘管理
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            管理职位发布、简历筛选和面试流程
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                发布职位
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>发布新职位</DialogTitle>
                <DialogDescription>
                  填写职位信息，发布后将自动推送至招聘平台
                </DialogDescription>
              </DialogHeader>
              <CreatePositionForm onClose={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="招聘中职位"
          value={positions?.filter((p: Position) => p.status === '招聘中').length || 0}
          icon={<Briefcase className="w-4 h-4" />}
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          title="待处理简历"
          value={candidates?.filter((c: Candidate) => c.status === '待筛选').length || 0}
          icon={<Filter className="w-4 h-4" />}
          color="from-yellow-500 to-orange-500"
        />
        <StatCard
          title="面试中"
          value={candidates?.filter((c: Candidate) => c.status === '面试中').length || 0}
          icon={<Calendar className="w-4 h-4" />}
          color="from-purple-500 to-purple-600"
        />
        <StatCard
          title="本月入职"
          value="12"
          icon={<Building2 className="w-4 h-4" />}
          color="from-green-500 to-green-600"
        />
      </div>

      {/* 主内容 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="positions">职位管理</TabsTrigger>
          <TabsTrigger value="candidates">候选人管理</TabsTrigger>
          <TabsTrigger value="interview">面试安排</TabsTrigger>
        </TabsList>

        <TabsContent value="positions">
          <PositionsTable positions={positions || []} />
        </TabsContent>

        <TabsContent value="candidates">
          <CandidatesList
            candidates={filteredCandidates}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            CandidateItem={CandidateItem}
          />
        </TabsContent>

        <TabsContent value="interview">
          <InterviewSchedule />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// 统计卡片
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        <div className={cn('p-2 rounded-lg bg-gradient-to-br', color, 'text-white')}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

// 职位表格
function PositionsTable({ positions }: { positions: Position[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>职位列表</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {positions.map((position) => (
            <div
              key={position.id}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {position.title}
                    </h3>
                    <Badge
                      variant={position.status === '招聘中' ? 'default' : 'secondary'}
                    >
                      {position.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {position.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {position.salary}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {position.applicants} 位候选人
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {position.requirements.slice(0, 3).map((req, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm">
                    编辑
                  </Button>
                  <Button size="sm">
                    管理候选人
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// 候选人列表
function CandidatesList({
  candidates,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  CandidateItem,
}: {
  candidates: Candidate[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  CandidateItem: (candidate: Candidate, index: number) => React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>候选人列表 ({candidates.length})</CardTitle>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索候选人..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>

            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="待筛选">待筛选</SelectItem>
                <SelectItem value="面试中">面试中</SelectItem>
                <SelectItem value="已通过">已通过</SelectItem>
                <SelectItem value="已拒绝">已拒绝</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="h-[600px]">
          <VirtualScroll
            items={candidates}
            renderItem={CandidateItem}
            itemHeight={80}
            height={600}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// 面试安排
function InterviewSchedule() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>面试安排</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>暂无面试安排</p>
          <Button variant="link" className="mt-2">
            创建面试安排
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// 创建职位表单
function CreatePositionForm({ onClose }: { onClose: () => void }) {
  return (
    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">职位名称 *</Label>
          <Input id="title" placeholder="例如：高级前端工程师" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="department">所属部门 *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="选择部门" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tech">技术部</SelectItem>
                <SelectItem value="product">产品部</SelectItem>
                <SelectItem value="design">设计部</SelectItem>
                <SelectItem value="marketing">市场部</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">工作地点 *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="选择城市" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beijing">北京</SelectItem>
                <SelectItem value="shanghai">上海</SelectItem>
                <SelectItem value="shenzhen">深圳</SelectItem>
                <SelectItem value="hangzhou">杭州</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="salary">薪资范围 *</Label>
          <Input id="salary" placeholder="例如：25-40K" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="requirements">职位要求 *</Label>
          <Textarea
            id="requirements"
            placeholder="请输入职位要求，每条要求用换行分隔"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="responsibilities">岗位职责 *</Label>
          <Textarea
            id="responsibilities"
            placeholder="请输入岗位职责，每条职责用换行分隔"
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={onClose}>
          取消
        </Button>
        <Button type="submit">
          立即发布
        </Button>
      </div>
    </form>
  );
}
