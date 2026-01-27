'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Users,
  Search,
  Filter,
  Star,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Tag,
  Plus,
  Download,
  Upload,
} from 'lucide-react';

interface Talent {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  currentPosition: string;
  company?: string;
  experience: string;
  education: string;
  skills: string[];
  industries: string[];
  expectedSalary?: {
    min: number;
    max: number;
  };
  tags: string[];
  status: 'active' | 'inactive' | 'hired';
  lastContact: string;
  notes: string;
  createdAt: string;
  isFavorite: boolean;
}

export default function TalentPool() {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'hired'>('all');

  // 获取人才列表
  const fetchTalents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/talents?companyId=demo-company');
      const data = await response.json();
      if (data.success) {
        setTalents(data.data || []);
      }
    } catch (error) {
      console.error('获取人才库失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 切换收藏状态
  const toggleFavorite = async (id: string) => {
    try {
      const response = await fetch(`/api/talents/${id}/favorite`, {
        method: 'PUT',
      });
      if (response.ok) {
        setTalents(talents.map(t =>
          t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
        ));
      }
    } catch (error) {
      console.error('切换收藏失败:', error);
    }
  };

  // 导出人才库
  const exportTalents = async () => {
    try {
      const response = await fetch('/api/talents/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: 'demo-company' }),
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'talent-pool.xlsx';
        a.click();
      }
    } catch (error) {
      console.error('导出失败:', error);
    }
  };

  // 获取所有技能
  const getAllSkills = () => {
    const skills = new Set<string>();
    talents.forEach(t => t.skills.forEach(s => skills.add(s)));
    return Array.from(skills).sort();
  };

  // 获取所有行业
  const getAllIndustries = () => {
    const industries = new Set<string>();
    talents.forEach(t => t.industries.forEach(i => industries.add(i)));
    return Array.from(industries).sort();
  };

  // 过滤人才
  const filteredTalents = talents.filter(talent => {
    const matchesSearch =
      talent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      talent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      talent.currentPosition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      talent.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesIndustry = industryFilter === 'all' || talent.industries.includes(industryFilter);
    const matchesSkill = skillFilter === 'all' || talent.skills.includes(skillFilter);
    const matchesStatus = statusFilter === 'all' || talent.status === statusFilter;

    return matchesSearch && matchesIndustry && matchesSkill && matchesStatus;
  });

  useEffect(() => {
    fetchTalents();
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">人才库</h1>
          <p className="text-muted-foreground mt-1">
            管理和挖掘优质人才资源
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportTalents}>
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            添加人才
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总人才数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{talents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃人才</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {talents.filter(t => t.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已收藏</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {talents.filter(t => t.isFavorite).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已录用</CardTitle>
            <Briefcase className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {talents.filter(t => t.status === 'hired').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>搜索</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索姓名、职位、技能..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label>行业</Label>
              <Select value={industryFilter} onValueChange={(v) => setIndustryFilter(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部行业</SelectItem>
                  {getAllIndustries().map(industry => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>技能</Label>
              <Select value={skillFilter} onValueChange={(v) => setSkillFilter(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部技能</SelectItem>
                  {getAllSkills().map(skill => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>状态</Label>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">活跃</SelectItem>
                  <SelectItem value="inactive">非活跃</SelectItem>
                  <SelectItem value="hired">已录用</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 人才列表 */}
      <Card>
        <CardHeader>
          <CardTitle>人才列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>姓名</TableHead>
                <TableHead>当前职位</TableHead>
                <TableHead>公司</TableHead>
                <TableHead>地点</TableHead>
                <TableHead>经验</TableHead>
                <TableHead>技能</TableHead>
                <TableHead>期望薪资</TableHead>
                <TableHead>最后联系</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : filteredTalents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center">
                    暂无人才数据
                  </TableCell>
                </TableRow>
              ) : (
                filteredTalents.map((talent) => (
                  <TableRow key={talent.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavorite(talent.id)}
                      >
                        <Star
                          className={`h-4 w-4 ${talent.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarFallback>{talent.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{talent.name}</div>
                          <div className="text-xs text-gray-500">{talent.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{talent.currentPosition}</div>
                      <div className="text-xs text-gray-500">{talent.experience}</div>
                    </TableCell>
                    <TableCell>{talent.company || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                        {talent.location}
                      </div>
                    </TableCell>
                    <TableCell>{talent.experience}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {talent.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {talent.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{talent.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {talent.expectedSalary ? (
                        <span className="text-sm">
                          {talent.expectedSalary.min.toLocaleString()} - {talent.expectedSalary.max.toLocaleString()}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {talent.lastContact ? new Date(talent.lastContact).toLocaleDateString() : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          talent.status === 'active'
                            ? 'default'
                            : talent.status === 'hired'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {talent.status === 'active' ? '活跃' : talent.status === 'hired' ? '已录用' : '非活跃'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 标签云 */}
      <Card>
        <CardHeader>
          <CardTitle>热门技能标签</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {getAllSkills().slice(0, 20).map((skill) => (
              <Badge
                key={skill}
                variant={skillFilter === skill ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSkillFilter(skillFilter === skill ? 'all' : skill)}
              >
                <Tag className="h-3 w-3 mr-1" />
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
