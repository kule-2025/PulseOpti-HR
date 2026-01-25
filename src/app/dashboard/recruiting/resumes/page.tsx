'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  User,
  Plus,
  Search,
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
} from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position?: string;
  education?: string;
  experience?: string;
  skills?: string[];
  status: 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  score?: number;
  notes?: string;
  createdAt: string;
  resumeUrl?: string;
}

export default function ResumeManagement() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Candidate['status']>('all');

  // 对话框状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    education: '',
    experience: '',
    skills: '',
    notes: '',
  });

  // 文件上传状态
  const [uploading, setUploading] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);

  // 获取候选人列表
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/candidates?companyId=demo-company');
      const data = await response.json();
      if (data.success) {
        setCandidates(data.data || []);
      }
    } catch (error) {
      console.error('获取候选人列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 手动添加候选人
  const createCandidate = async () => {
    try {
      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          companyId: 'demo-company',
          skills: formData.skills.split(',').map(s => s.trim()),
          status: 'new' as Candidate['status'],
        }),
      });

      const data = await response.json();
      if (data.success) {
        setDialogOpen(false);
        resetForm();
        fetchCandidates();
      }
    } catch (error) {
      console.error('添加候选人失败:', error);
    }
  };

  // 上传并解析简历
  const uploadResume = async (file: File) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/ai/resume-parse', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success && data.data) {
        setParsedData(data.data);
        setFormData({
          name: data.data.name || '',
          email: data.data.email || '',
          phone: data.data.phone || '',
          position: data.data.position || '',
          education: data.data.education || '',
          experience: data.data.experience || '',
          skills: data.data.skills?.join(', ') || '',
          notes: '',
        });
      }
    } catch (error) {
      console.error('上传简历失败:', error);
    } finally {
      setUploading(false);
    }
  };

  // 批量上传简历
  const batchUploadResumes = async (files: File[]) => {
    try {
      setUploading(true);

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        await fetch('/api/ai/resume-batch-parse', {
          method: 'POST',
          body: formData,
        });
      }

      fetchCandidates();
    } catch (error) {
      console.error('批量上传失败:', error);
    } finally {
      setUploading(false);
    }
  };

  // 更新候选人状态
  const updateStatus = async (id: string, status: Candidate['status']) => {
    try {
      const response = await fetch(`/api/candidates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (data.success) {
        fetchCandidates();
      }
    } catch (error) {
      console.error('更新状态失败:', error);
    }
  };

  // 查看详情
  const viewDetail = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setDetailDialogOpen(true);
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      education: '',
      experience: '',
      skills: '',
      notes: '',
    });
    setParsedData(null);
  };

  // 获取状态徽章
  const getStatusBadge = (status: Candidate['status']) => {
    const variants: Record<string, any> = {
      new: 'default',
      screening: 'secondary',
      interview: 'default',
      offer: 'default',
      hired: 'default',
      rejected: 'destructive',
    };
    const labels: Record<string, string> = {
      new: '新简历',
      screening: '筛选中',
      interview: '面试中',
      offer: '已发Offer',
      hired: '已录用',
      rejected: '已拒绝',
    };
    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  // 过滤候选人
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    fetchCandidates();
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">简历管理</h1>
          <p className="text-muted-foreground mt-1">
            管理候选人简历，支持AI解析
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              添加候选人
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>添加候选人</DialogTitle>
              <DialogDescription>
                上传简历或手动填写信息
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">上传简历</TabsTrigger>
                <TabsTrigger value="manual">手动填写</TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    拖拽文件到此处或点击上传
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    支持 PDF、Word 格式，AI 自动解析
                  </p>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadResume(file);
                    }}
                    className="max-w-xs mx-auto"
                  />
                  {uploading && (
                    <p className="text-sm text-blue-600 mt-2">
                      AI正在解析简历...
                    </p>
                  )}
                </div>
                {parsedData && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm font-medium">AI解析结果</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      简历已成功解析，请核对信息后提交
                    </p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="manual" className="space-y-4">
                <div>
                  <Label htmlFor="name">姓名 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">邮箱 *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">手机 *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="position">应聘职位</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="education">学历</Label>
                  <Input
                    id="education"
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="experience">工作经验</Label>
                  <Textarea
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="skills">技能（逗号分隔）</Label>
                  <Input
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="例如：JavaScript, React, Node.js"
                  />
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={createCandidate}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                添加
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总简历</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">新简历</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.filter(c => c.status === 'new').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">筛选中</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.filter(c => c.status === 'screening').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">面试中</CardTitle>
            <Send className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.filter(c => c.status === 'interview').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已录用</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.filter(c => c.status === 'hired').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已拒绝</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.filter(c => c.status === 'rejected').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>候选人列表</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="搜索姓名、邮箱、手机..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="new">新简历</SelectItem>
                  <SelectItem value="screening">筛选中</SelectItem>
                  <SelectItem value="interview">面试中</SelectItem>
                  <SelectItem value="offer">已发Offer</SelectItem>
                  <SelectItem value="hired">已录用</SelectItem>
                  <SelectItem value="rejected">已拒绝</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>姓名</TableHead>
                <TableHead>应聘职位</TableHead>
                <TableHead>手机</TableHead>
                <TableHead>学历</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>评分</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    暂无候选人
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{candidate.name}</div>
                          <div className="text-xs text-gray-500">{candidate.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{candidate.position || '-'}</TableCell>
                    <TableCell>{candidate.phone}</TableCell>
                    <TableCell>{candidate.education || '-'}</TableCell>
                    <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                    <TableCell>
                      {candidate.score !== undefined ? (
                        <Badge variant={candidate.score >= 80 ? 'default' : candidate.score >= 60 ? 'secondary' : 'outline'}>
                          {candidate.score}分
                        </Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {new Date(candidate.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewDetail(candidate)}
                        >
                          查看
                        </Button>
                        <Select onValueChange={(value: Candidate['status']) => updateStatus(candidate.id, value)}>
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue placeholder="状态" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">新简历</SelectItem>
                            <SelectItem value="screening">筛选中</SelectItem>
                            <SelectItem value="interview">面试中</SelectItem>
                            <SelectItem value="offer">已发Offer</SelectItem>
                            <SelectItem value="hired">已录用</SelectItem>
                            <SelectItem value="rejected">已拒绝</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 候选人详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>候选人详情</DialogTitle>
          </DialogHeader>
          {selectedCandidate && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">基本信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>姓名</Label>
                    <p className="text-sm">{selectedCandidate.name}</p>
                  </div>
                  <div>
                    <Label>邮箱</Label>
                    <p className="text-sm">{selectedCandidate.email}</p>
                  </div>
                  <div>
                    <Label>手机</Label>
                    <p className="text-sm">{selectedCandidate.phone}</p>
                  </div>
                  <div>
                    <Label>应聘职位</Label>
                    <p className="text-sm">{selectedCandidate.position || '-'}</p>
                  </div>
                </div>
              </div>

              {/* 技能信息 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">技能信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>学历</Label>
                    <p className="text-sm">{selectedCandidate.education || '-'}</p>
                  </div>
                  <div>
                    <Label>工作经验</Label>
                    <p className="text-sm">{selectedCandidate.experience || '-'}</p>
                  </div>
                </div>
                {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                  <div className="mt-3">
                    <Label>技能标签</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedCandidate.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 备注 */}
              {selectedCandidate.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">备注</h3>
                  <p className="text-sm text-gray-600">{selectedCandidate.notes}</p>
                </div>
              )}

              {/* 简历文件 */}
              {selectedCandidate.resumeUrl && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">简历文件</h3>
                  <Button variant="outline" asChild>
                    <a href={selectedCandidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4 mr-2" />
                      下载简历
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
