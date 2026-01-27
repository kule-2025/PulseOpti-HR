'use client';

import { useState, useCallback, useMemo } from 'react';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { VirtualScroll } from '@/components/performance/virtual-scroll';
import { ResponsiveImage } from '@/components/performance/optimized-image';
import { useForm } from '@/hooks/use-form';
import { useDebounce } from '@/hooks/use-debounce';
import { usePageData } from '@/hooks/use-page';
import {
  Building2,
  Briefcase,
  Calendar,
  Plus,
  Download,
  Search,
  Edit,
  Trash2,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Eye,
  MoreVertical,
  Filter,
  FileText,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/theme';

// 类型定义
interface Position {
  id: string;
  title: string;
  department: string;
  location: string;
  salary: string;
  status: 'active' | 'paused' | 'closed';
  createdAt: string;
  applicants: number;
  requirements: string[];
  responsibilities: string[];
  description: string;
}

interface Candidate {
  id: string;
  name: string;
  position: string;
  status: 'pending' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  experience: string;
  phone: string;
  email: string;
  appliedDate: string;
  avatar: string | null;
  education: string;
  skills: string[];
  score: number;
  interviewCount: number;
  lastInterviewDate: string | null;
  notes: string;
}

const statusMap = {
  pending: { label: '待筛选', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', icon: Clock },
  screening: { label: '筛选中', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Search },
  interview: { label: '面试中', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: FileText },
  offer: { label: '已发Offer', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: CheckCircle },
  hired: { label: '已录用', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle },
  rejected: { label: '已拒绝', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: XCircle },
};

const jobStatusMap = {
  active: { label: '招聘中', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  paused: { label: '已暂停', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  closed: { label: '已结束', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
};

// Mock数据生成
const generateMockPositions = (): Position[] =>
  Array.from({ length: 25 }, (_, i) => ({
    id: `position-${i + 1}`,
    title: [
      '高级前端工程师', '后端开发工程师', '产品经理', 'UI设计师',
      '数据分析师', '测试工程师', '运维工程师', '算法工程师',
      'DevOps工程师', '技术经理', '全栈工程师', '移动端工程师',
      '前端架构师', '后端架构师', '数据库管理员', '安全工程师',
      '机器学习工程师', '大数据工程师', '云原生工程师', '区块链工程师',
    ][i % 20],
    department: ['技术部', '产品部', '设计部', '运维部'][i % 4],
    location: ['北京', '上海', '深圳', '杭州', '成都'][i % 5],
    salary: ['15k-25k', '20k-35k', '25k-45k', '30k-50k', '40k-70k'][i % 5],
    status: i % 5 === 0 ? 'closed' : i % 3 === 0 ? 'paused' : 'active',
    createdAt: `2024-0${String((i % 3) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    applicants: Math.floor(Math.random() * 50) + 5,
    requirements: [
      '3年以上相关工作经验',
      '精通相关技术栈',
      '良好的沟通能力',
      '有大型项目经验者优先',
    ].slice(0, 3),
    responsibilities: [
      '负责相关模块的开发和维护',
      '参与技术方案设计和评审',
      '持续优化代码质量和性能',
      '指导初级工程师成长',
    ].slice(0, 3),
    description: '这是一个充满挑战和机遇的岗位，期待优秀的你加入我们！',
  }));

const generateMockCandidates = (): Candidate[] =>
  Array.from({ length: 150 }, (_, i) => ({
    id: `candidate-${i + 1}`,
    name: `候选人${String.fromCharCode(65 + (i % 26))}${i + 1}`,
    position: generateMockPositions()[i % 25].title,
    status: i % 6 === 0 ? 'rejected' : i % 5 === 0 ? 'hired' : ['pending', 'screening', 'interview', 'offer'][i % 4] as any,
    experience: ['1-3年', '3-5年', '5-10年', '10年以上'][i % 4],
    phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
    email: `candidate${i + 1}@example.com`,
    appliedDate: `2024-0${String((i % 3) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    avatar: null,
    education: ['本科', '硕士', '博士'][i % 3],
    skills: ['JavaScript', 'Python', 'Java', 'React', 'Vue', 'Node.js', 'MySQL', 'Redis'].slice(0, Math.floor(Math.random() * 5) + 2),
    score: Math.floor(Math.random() * 40) + 60,
    interviewCount: Math.floor(Math.random() * 4),
    lastInterviewDate: i % 4 === 0 ? `2024-0${String((i % 3) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}` : null,
    notes: i % 3 === 0 ? '候选人表现优秀，建议安排下一轮面试' : '',
  }));

export default function RecruitingPage() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // 模拟数据加载
  const { data: positions, loading: positionsLoading, refetch: refetchPositions } = usePageData(
    async () => generateMockPositions(),
    { enabled: activeTab === 'jobs' }
  );

  const { data: candidates, loading: candidatesLoading, refetch: refetchCandidates } = usePageData(
    async () => generateMockCandidates(),
    { enabled: activeTab === 'candidates' }
  );

  const departments = useMemo(() => {
    if (!positions) return [];
    return Array.from(new Set(positions.map((p) => p.department)));
  }, [positions]);

  const stats = useMemo(() => {
    if (!positions || !candidates) return null;
    return {
      totalJobs: positions.length,
      activeJobs: positions.filter((p) => p.status === 'active').length,
      totalCandidates: candidates.length,
      newCandidates: candidates.filter((c) => c.status === 'pending').length,
      hiredThisMonth: candidates.filter((c) => c.status === 'hired').length,
    };
  }, [positions, candidates]);

  const filteredPositions = useMemo(() => {
    if (!positions) return [];
    let filtered = [...positions];
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(query) ||
        p.department.toLowerCase().includes(query)
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }
    if (departmentFilter !== 'all') {
      filtered = filtered.filter((p) => p.department === departmentFilter);
    }
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [positions, debouncedSearch, statusFilter, departmentFilter]);

  const filteredCandidates = useMemo(() => {
    if (!candidates) return [];
    let filtered = [...candidates];
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(query) ||
        c.position.toLowerCase().includes(query) ||
        c.phone.includes(query) ||
        c.email.toLowerCase().includes(query)
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }
    return filtered.sort((a, b) => b.score - a.score);
  }, [candidates, debouncedSearch, statusFilter]);

  const toggleJobExpansion = useCallback((jobId: string) => {
    setExpandedJobs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  }, []);

  const PositionItem = useCallback((position: Position) => {
    const isExpanded = expandedJobs.has(position.id);
    const statusInfo = jobStatusMap[position.status];

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {position.title}
                </h3>
                <Badge className={statusInfo.color} variant="secondary">
                  {statusInfo.label}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Building2 size={14} />
                  {position.department}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {position.location}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign size={14} />
                  {position.salary}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleJobExpansion(position.id)}
                className="flex-shrink-0"
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-4 border-t dark:border-gray-700">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">职位描述</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{position.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">任职要求</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {position.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle size={14} className="mt-0.5 text-green-600 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">岗位职责</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {position.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Star size={14} className="mt-0.5 text-yellow-600 flex-shrink-0" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-gray-900 dark:text-white">{position.applicants}</span>
                  {' '}名候选人 · 发布于 {position.createdAt}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit size={14} className="mr-1" />
                    编辑
                  </Button>
                  <Button size="sm">
                    <UserPlus size={14} className="mr-1" />
                    查看候选人
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    );
  }, [expandedJobs, toggleJobExpansion]);

  const CandidateItem = useCallback((candidate: Candidate) => {
    const statusInfo = statusMap[candidate.status];
    const StatusIcon = statusInfo.icon;

    return (
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="shrink-0">
            {candidate.avatar ? (
              <ResponsiveImage src={candidate.avatar} alt={candidate.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                {candidate.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-white truncate">{candidate.name}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{candidate.position}</p>
          </div>
          <div className="hidden md:flex items-center gap-4 shrink-0 text-sm text-gray-600 dark:text-gray-400">
            <span>{candidate.experience}</span>
            <span>{candidate.education}</span>
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-500" />
              <span className="font-medium">{candidate.score}分</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <Badge className={statusInfo.color} variant="secondary">
            <StatusIcon size={12} className="mr-1" />
            {statusInfo.label}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedCandidate(candidate)}
          >
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical size={16} />
          </Button>
        </div>
      </div>
    );
  }, []);

  if (positionsLoading || candidatesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">招聘管理</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">职位发布、候选人管理、面试安排</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download size={16} className="mr-2" />
              导出报告
            </Button>
            <Button size="sm" onClick={() => setIsCreateJobOpen(true)}>
              <Plus size={16} className="mr-2" />
              发布职位
            </Button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">职位总数</CardTitle>
                <Briefcase className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalJobs}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">招聘中</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeJobs}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">候选人总数</CardTitle>
                <UserPlus className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCandidates}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">待筛选</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.newCandidates}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">本月录用</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.hiredThisMonth}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索职位、候选人..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 px-3 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="all">全部状态</option>
                  {Object.entries(statusMap).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="h-9 px-3 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="all">全部部门</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="jobs">职位管理</TabsTrigger>
                <TabsTrigger value="candidates">候选人池</TabsTrigger>
              </TabsList>

              <TabsContent value="jobs">
                <div className="space-y-4">
                  {filteredPositions.map(PositionItem)}
                </div>
              </TabsContent>

              <TabsContent value="candidates">
                <VirtualScroll
                  items={filteredCandidates}
                  itemHeight={100}
                  renderItem={CandidateItem}
                  height={600}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* 候选人详情对话框 */}
        {selectedCandidate && (
          <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedCandidate.name} - 候选人详情</DialogTitle>
                <DialogDescription>
                  {selectedCandidate.position} · {selectedCandidate.experience}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>联系方式</Label>
                    <div className="space-y-1 mt-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={14} />
                        {selectedCandidate.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={14} />
                        {selectedCandidate.email}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>基本信息</Label>
                    <div className="space-y-1 mt-1">
                      <div className="text-sm">{selectedCandidate.education}</div>
                      <div className="text-sm">投递日期: {selectedCandidate.appliedDate}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>技能标签</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCandidate.skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>评分</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Star size={20} className="text-yellow-500" />
                    <span className="text-2xl font-bold">{selectedCandidate.score}</span>
                    <span className="text-gray-500">/ 100</span>
                  </div>
                </div>

                {selectedCandidate.notes && (
                  <div>
                    <Label>备注</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedCandidate.notes}
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedCandidate(null)}>
                  关闭
                </Button>
                <Button>
                  安排面试
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* 创建职位对话框 */}
        <Dialog open={isCreateJobOpen} onOpenChange={setIsCreateJobOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>发布新职位</DialogTitle>
              <DialogDescription>
                填写职位信息，发布后即可接收候选人申请
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>职位名称</Label>
                  <Input placeholder="例如：高级前端工程师" />
                </div>
                <div className="space-y-2">
                  <Label>部门</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择部门" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>工作地点</Label>
                  <Input placeholder="例如：北京" />
                </div>
                <div className="space-y-2">
                  <Label>薪资范围</Label>
                  <Input placeholder="例如：15k-25k" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>职位描述</Label>
                <Textarea
                  placeholder="请详细描述职位职责、任职要求等..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>任职要求</Label>
                  <Textarea
                    placeholder="每行填写一项要求..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>岗位职责</Label>
                  <Textarea
                    placeholder="每行填写一项职责..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateJobOpen(false)}>
                取消
              </Button>
              <Button>发布职位</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
