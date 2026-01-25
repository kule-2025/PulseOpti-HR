'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  UserPlus,
  FileText,
  Send,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building2,
  MapPin,
  DollarSign,
  Briefcase,
  Users,
  MessageSquare,
  Video,
  Phone,
  Mail,
  Star,
  Eye,
} from 'lucide-react';

interface Position {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: 'fulltime' | 'parttime' | 'contract' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
  salaryMin: number;
  salaryMax: number;
  status: 'open' | 'closed' | 'paused';
  requirement: string;
  description: string;
  applicants: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  recruiter: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  positionId: string;
  position: string;
  source: 'portal' | 'referral' | 'headhunter' | 'social';
  status: 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  stage: string;
  appliedDate: string;
  resume: string;
  notes: string;
  rating: number;
  skills: string[];
}

export default function RecruitmentPageContent() {
  const [activeTab, setActiveTab] = useState('positions');
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Position | Candidate | null>(null);
  const [viewingItem, setViewingItem] = useState<Position | Candidate | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    employmentType: 'fulltime' as const,
    experienceLevel: 'mid' as const,
    salaryMin: 0,
    salaryMax: 0,
    requirement: '',
    description: '',
  });

  const [filters, setFilters] = useState({
    keyword: '',
    department: '',
    status: '',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  useEffect(() => {
    if (activeTab === 'positions') {
      fetchPositions();
    } else {
      fetchCandidates();
    }
  }, [activeTab, filters, pagination.page]);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      // 模拟API调用
      const mockPositions: Position[] = [
        {
          id: '1',
          title: '高级前端工程师',
          department: '研发部',
          location: '北京',
          employmentType: 'fulltime',
          experienceLevel: 'senior',
          salaryMin: 25000,
          salaryMax: 40000,
          status: 'open',
          requirement: '5年以上前端开发经验，精通React、Vue等框架',
          description: '负责公司核心产品的前端开发和架构设计',
          applicants: 32,
          views: 256,
          createdAt: '2024-03-01',
          updatedAt: '2024-03-20',
          recruiter: '张三',
        },
        {
          id: '2',
          title: '产品经理',
          department: '产品部',
          location: '上海',
          employmentType: 'fulltime',
          experienceLevel: 'mid',
          salaryMin: 20000,
          salaryMax: 35000,
          status: 'open',
          requirement: '3年以上产品经验，有B端产品经验优先',
          description: '负责公司SaaS平台的产品规划和设计',
          applicants: 28,
          views: 198,
          createdAt: '2024-02-20',
          updatedAt: '2024-03-15',
          recruiter: '李四',
        },
        {
          id: '3',
          title: '销售代表',
          department: '销售部',
          location: '深圳',
          employmentType: 'fulltime',
          experienceLevel: 'entry',
          salaryMin: 12000,
          salaryMax: 20000,
          status: 'open',
          requirement: '热爱销售，良好的沟通能力',
          description: '负责公司产品的销售和客户拓展',
          applicants: 45,
          views: 320,
          createdAt: '2024-03-05',
          updatedAt: '2024-03-25',
          recruiter: '王五',
        },
        {
          id: '4',
          title: 'UI设计师',
          department: '产品部',
          location: '北京',
          employmentType: 'fulltime',
          experienceLevel: 'mid',
          salaryMin: 15000,
          salaryMax: 25000,
          status: 'paused',
          requirement: '3年以上UI设计经验，精通Figma',
          description: '负责产品界面设计和视觉设计',
          applicants: 18,
          views: 125,
          createdAt: '2024-01-15',
          updatedAt: '2024-02-28',
          recruiter: '赵六',
        },
      ];

      setPositions(mockPositions);
      setPagination((prev) => ({
        ...prev,
        total: mockPositions.length,
      }));
    } catch (error) {
      console.error('获取职位列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      // 模拟API调用
      const mockCandidates: Candidate[] = [
        {
          id: '1',
          name: '陈明',
          email: 'chenming@example.com',
          phone: '13800138001',
          positionId: '1',
          position: '高级前端工程师',
          source: 'portal',
          status: 'interview',
          stage: '二面',
          appliedDate: '2024-03-10',
          resume: '陈明_简历.pdf',
          notes: '技术扎实，沟通能力强',
          rating: 4,
          skills: ['React', 'Vue', 'TypeScript', 'Node.js'],
        },
        {
          id: '2',
          name: '林静',
          email: 'linjing@example.com',
          phone: '13800138002',
          positionId: '2',
          position: '产品经理',
          source: 'referral',
          status: 'screening',
          stage: '初筛',
          appliedDate: '2024-03-12',
          resume: '林静_简历.pdf',
          notes: '内部推荐，经验丰富',
          rating: 5,
          skills: ['产品规划', '需求分析', 'Axure', 'Figma'],
        },
        {
          id: '3',
          name: '张伟',
          email: 'zhangwei@example.com',
          phone: '13800138003',
          positionId: '1',
          position: '高级前端工程师',
          source: 'headhunter',
          status: 'offer',
          stage: 'offer阶段',
          appliedDate: '2024-02-28',
          resume: '张伟_简历.pdf',
          notes: '背景优秀，薪资谈判中',
          rating: 5,
          skills: ['React', 'Angular', 'Micro-frontends'],
        },
        {
          id: '4',
          name: '刘芳',
          email: 'liufang@example.com',
          phone: '13800138004',
          positionId: '3',
          position: '销售代表',
          source: 'portal',
          status: 'new',
          stage: '待处理',
          appliedDate: '2024-03-20',
          resume: '刘芳_简历.pdf',
          notes: '',
          rating: 0,
          skills: [],
        },
      ];

      setCandidates(mockCandidates);
      setPagination((prev) => ({
        ...prev,
        total: mockCandidates.length,
      }));
    } catch (error) {
      console.error('获取候选人列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    const items = activeTab === 'positions' ? positions : candidates;
    if (checked) {
      setSelectedIds(items.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((item: any) => (selectedId) => selectedId !== id));
    }
  };

  const handleAddPosition = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      department: '',
      location: '',
      employmentType: 'fulltime',
      experienceLevel: 'mid',
      salaryMin: 0,
      salaryMax: 0,
      requirement: '',
      description: '',
    });
    setDialogOpen(true);
  };

  const handleEditItem = (item: Position | Candidate) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleViewItem = (item: Position | Candidate) => {
    setViewingItem(item);
  };

  const handleSaveItem = async () => {
    try {
      alert('保存功能开发中...');
      setDialogOpen(false);
    } catch (error) {
      console.error('保存失败:', error);
      alert('操作失败');
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string; icon: any }> = {
      open: { label: '招聘中', color: 'bg-green-100 text-green-700', icon: UserPlus },
      closed: { label: '已关闭', color: 'bg-gray-100 text-gray-700', icon: XCircle },
      paused: { label: '已暂停', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      new: { label: '新简历', color: 'bg-blue-100 text-blue-700', icon: FileText },
      screening: { label: '筛选中', color: 'bg-purple-100 text-purple-700', icon: Filter },
      interview: { label: '面试中', color: 'bg-orange-100 text-orange-700', icon: MessageSquare },
      offer: { label: 'offer', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      hired: { label: '已录用', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      rejected: { label: '已拒绝', color: 'bg-red-100 text-red-700', icon: XCircle },
    };
    const { label, color, icon: Icon } = config[status] || {
      label: status,
      color: 'bg-gray-100 text-gray-700',
      icon: FileText,
    };
    return (
      <Badge className={color}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const getEmploymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      fulltime: '全职',
      parttime: '兼职',
      contract: '合同',
      internship: '实习',
    };
    return labels[type] || type;
  };

  const getExperienceLabel = (level: string) => {
    const labels: Record<string, string> = {
      entry: '初级',
      mid: '中级',
      senior: '高级',
      lead: '资深',
    };
    return labels[level] || level;
  };

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      portal: '官网',
      referral: '内推',
      headhunter: '猎头',
      social: '社交',
    };
    return labels[source] || source;
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-pink-500" />
            招聘管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            职位发布、候选人管理
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            批量导入
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出数据
          </Button>
          {activeTab === 'positions' && (
            <Button
              onClick={handleAddPosition}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              发布职位
            </Button>
          )}
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">招聘职位</p>
                <p className="text-2xl font-bold">{positions.length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-pink-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">招聘中</p>
                <p className="text-2xl font-bold text-green-600">
                  {positions.filter((item: any) => (p) => p.status === 'open').length}
                </p>
              </div>
              <UserPlus className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">候选人</p>
                <p className="text-2xl font-bold text-blue-600">{candidates.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">待处理</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {candidates.filter((item: any) => (c) => c.status === 'new').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">已录用</p>
                <p className="text-2xl font-bold text-purple-600">
                  {candidates.filter((item: any) => (c) => c.status === 'hired').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label>关键词搜索</Label>
              <Input
                placeholder={activeTab === 'positions' ? '搜索职位名称' : '搜索候选人姓名'}
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              />
            </div>
            <div className="w-48">
              <Label>部门</Label>
              <Select
                value={filters.department}
                onValueChange={(value) => setFilters({ ...filters, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择部门" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部部门</SelectItem>
                  <SelectItem value="研发部">研发部</SelectItem>
                  <SelectItem value="产品部">产品部</SelectItem>
                  <SelectItem value="销售部">销售部</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Label>状态</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部状态</SelectItem>
                  {activeTab === 'positions' ? (
                    <>
                      <SelectItem value="open">招聘中</SelectItem>
                      <SelectItem value="paused">已暂停</SelectItem>
                      <SelectItem value="closed">已关闭</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="new">新简历</SelectItem>
                      <SelectItem value="screening">筛选中</SelectItem>
                      <SelectItem value="interview">面试中</SelectItem>
                      <SelectItem value="offer">offer</SelectItem>
                      <SelectItem value="hired">已录用</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => setFilters({ keyword: '', department: '', status: '' })}>
                <Filter className="h-4 w-4 mr-2" />
                重置筛选
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 批量操作栏 */}
      {selectedIds.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                已选择 <span className="font-bold">{selectedIds.length}</span> 项
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  批量导出
                </Button>
                {activeTab === 'candidates' && (
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    批量邀请面试
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 列表 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="positions">
            <Briefcase className="h-4 w-4 mr-2" />
            职位管理 ({positions.length})
          </TabsTrigger>
          <TabsTrigger value="candidates">
            <Users className="h-4 w-4 mr-2" />
            候选人管理 ({candidates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.length === positions.length && positions.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>职位名称</TableHead>
                    <TableHead>部门</TableHead>
                    <TableHead>地点</TableHead>
                    <TableHead>工作类型</TableHead>
                    <TableHead>经验要求</TableHead>
                    <TableHead>薪资范围</TableHead>
                    <TableHead>应聘数</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>发布人</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8">
                        加载中...
                      </TableCell>
                    </TableRow>
                  ) : positions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    positions.map((position) => (
                      <TableRow key={position.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(position.id)}
                            onCheckedChange={(checked) => handleSelectOne(position.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{position.title}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {position.applicants} 应聘 / {position.views} 浏览
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            {position.department}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {position.location}
                          </div>
                        </TableCell>
                        <TableCell>{getEmploymentTypeLabel(position.employmentType)}</TableCell>
                        <TableCell>{getExperienceLabel(position.experienceLevel)}</TableCell>
                        <TableCell>
                          <span className="font-medium">
                            ¥{position.salaryMin.toLocaleString()} - ¥{position.salaryMax.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">{position.applicants}</TableCell>
                        <TableCell>{getStatusBadge(position.status)}</TableCell>
                        <TableCell>{position.recruiter}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewItem(position)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditItem(position)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="candidates" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.length === candidates.length && candidates.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>候选人信息</TableHead>
                    <TableHead>应聘职位</TableHead>
                    <TableHead>来源</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>当前阶段</TableHead>
                    <TableHead>评分</TableHead>
                    <TableHead>申请日期</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        加载中...
                      </TableCell>
                    </TableRow>
                  ) : candidates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    candidates.map((candidate) => (
                      <TableRow key={candidate.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(candidate.id)}
                            onCheckedChange={(checked) => handleSelectOne(candidate.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{candidate.name}</div>
                          <div className="text-sm text-gray-500">
                            <Mail className="h-3 w-3 inline mr-1" />
                            {candidate.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            <Phone className="h-3 w-3 inline mr-1" />
                            {candidate.phone}
                          </div>
                        </TableCell>
                        <TableCell>{candidate.position}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getSourceLabel(candidate.source)}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                        <TableCell>{candidate.stage}</TableCell>
                        <TableCell>{renderRating(candidate.rating)}</TableCell>
                        <TableCell className="text-sm">{candidate.appliedDate}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewItem(candidate)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditItem(candidate)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                            >
                              <MessageSquare className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                            >
                              <Video className="h-4 w-4 text-green-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 分页 */}
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            共 {pagination.total} 条记录，每页 {pagination.limit} 条
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page * pagination.limit >= pagination.total}
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            >
              下一页
            </Button>
          </div>
        </div>
      )}

      {/* 新增/编辑职位对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? '编辑职位' : '发布职位'}</DialogTitle>
            <DialogDescription>
              {editingItem ? '修改职位信息' : '创建新的招聘职位'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">职位名称 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="例如：高级前端工程师"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">部门 *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择部门" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="研发部">研发部</SelectItem>
                    <SelectItem value="产品部">产品部</SelectItem>
                    <SelectItem value="销售部">销售部</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">工作地点 *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="例如：北京"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employmentType">工作类型</Label>
                <Select
                  value={formData.employmentType}
                  onValueChange={(value: any) => setFormData({ ...formData, employmentType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fulltime">全职</SelectItem>
                    <SelectItem value="parttime">兼职</SelectItem>
                    <SelectItem value="contract">合同</SelectItem>
                    <SelectItem value="internship">实习</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="experienceLevel">经验要求</Label>
                <Select
                  value={formData.experienceLevel}
                  onValueChange={(value: any) => setFormData({ ...formData, experienceLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">初级</SelectItem>
                    <SelectItem value="mid">中级</SelectItem>
                    <SelectItem value="senior">高级</SelectItem>
                    <SelectItem value="lead">资深</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="salaryMin">最低薪资 *</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  value={formData.salaryMin}
                  onChange={(e) => setFormData({ ...formData, salaryMin: Number(e.target.value) })}
                  placeholder="输入最低薪资"
                />
              </div>
              <div>
                <Label htmlFor="salaryMax">最高薪资 *</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  value={formData.salaryMax}
                  onChange={(e) => setFormData({ ...formData, salaryMax: Number(e.target.value) })}
                  placeholder="输入最高薪资"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="requirement">职位要求</Label>
              <Textarea
                id="requirement"
                value={formData.requirement}
                onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                placeholder="职位要求和任职资格"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="description">职位描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="详细描述岗位职责和工作内容"
                rows={4}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button className="flex-1" onClick={handleSaveItem}>
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
