'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Award,
  Users,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Save,
  X,
  Upload as UploadIcon,
} from 'lucide-react';
import { FILE_TYPE_LIMITS, FILE_SIZE_LIMITS } from '@/lib/file-constants';

interface EmployeeForm {
  id?: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  birthDate: string;
  idNumber: string;
  departmentId: string;
  positionId: string;
  level: string;
  employmentType: string;
  hireDate: string;
  probationEndDate: string;
  contractType: string;
  workLocation: string;
  managerId: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  education: string;
  workExperience: string;
  skills: string;
  notes: string;
  avatar?: string;
}

export default function AdvancedEmployeeManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);

  const [formData, setFormData] = useState<EmployeeForm>({
    name: '',
    email: '',
    phone: '',
    gender: '',
    birthDate: '',
    idNumber: '',
    departmentId: '',
    positionId: '',
    level: '',
    employmentType: '',
    hireDate: '',
    probationEndDate: '',
    contractType: '',
    workLocation: '',
    managerId: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    education: '',
    workExperience: '',
    skills: '',
    notes: '',
  });

  const getCurrentUser = () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  };

  useEffect(() => {
    loadDepartments();
    loadPositions();
    loadManagers();
  }, []);

  const loadDepartments = async () => {
    const user = getCurrentUser();
    if (!user?.companyId) return;

    try {
      const response = await fetch(`/api/departments?companyId=${user.companyId}`);
      const data = await response.json();
      if (data.success) {
        setDepartments(data.data || []);
      }
    } catch (error) {
      console.error('加载部门失败:', error);
    }
  };

  const loadPositions = async () => {
    const user = getCurrentUser();
    if (!user?.companyId) return;

    try {
      const response = await fetch(`/api/positions?companyId=${user.companyId}`);
      const data = await response.json();
      if (data.success) {
        setPositions(data.data || []);
      }
    } catch (error) {
      console.error('加载职位失败:', error);
    }
  };

  const loadManagers = async () => {
    const user = getCurrentUser();
    if (!user?.companyId) return;

    try {
      const response = await fetch(`/api/employees?companyId=${user.companyId}&role=manager`);
      const data = await response.json();
      if (data.success) {
        setManagers(data.data || []);
      }
    } catch (error) {
      console.error('加载管理者失败:', error);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!validateFileType(file, FILE_TYPE_LIMITS.images)) {
      alert('只支持上传图片文件（JPG、PNG、GIF、WebP）');
      return;
    }

    // 验证文件大小
    if (!validateFileSize(file, FILE_SIZE_LIMITS.small)) {
      alert('文件大小不能超过1MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'avatars');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const result = await response.json();
      if (result.success) {
        setFormData({ ...formData, avatar: result.data.url });
        alert('头像上传成功！');
      } else {
        alert(result.error || '上传失败，请重试');
      }
    } catch (error) {
      console.error('上传头像失败:', error);
      alert('上传失败，请重试');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = getCurrentUser();
      if (!user?.companyId) {
        alert('未登录或企业信息不存在');
        return;
      }

      const payload = {
        ...formData,
        companyId: user.companyId,
        createdBy: user.id,
      };

      const url = formData.id
        ? `/api/employees/${formData.id}`
        : '/api/employees/create';

      const response = await fetch(url, {
        method: formData.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '操作失败');
      }

      alert('员工信息保存成功！');
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      alert(error.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      gender: '',
      birthDate: '',
      idNumber: '',
      departmentId: '',
      positionId: '',
      level: '',
      employmentType: '',
      hireDate: '',
      probationEndDate: '',
      contractType: '',
      workLocation: '',
      managerId: '',
      address: '',
      emergencyContact: '',
      emergencyPhone: '',
      education: '',
      workExperience: '',
      skills: '',
      notes: '',
    });
  };

  const validateFileType = (file: File, allowedTypes: readonly string[]): boolean => {
    return allowedTypes.includes(file.type);
  };

  const validateFileSize = (file: File, maxSize: number): boolean => {
    return file.size <= maxSize;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">员工管理</h1>
          <p className="text-gray-600 mt-1">完整的员工档案管理与入职流程</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            批量导入
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出数据
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新增员工
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>新增员工</DialogTitle>
                <DialogDescription>
                  填写员工基本信息，带 * 为必填项
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit}>
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">基本信息</TabsTrigger>
                    <TabsTrigger value="job">工作信息</TabsTrigger>
                    <TabsTrigger value="personal">个人资料</TabsTrigger>
                    <TabsTrigger value="other">其他信息</TabsTrigger>
                  </TabsList>

                  {/* 基本信息 */}
                  <TabsContent value="basic" className="space-y-4">
                    <div className="flex items-center gap-4 mb-6">
                      <Avatar className="w-20 h-20">
                        <AvatarFallback>
                          {formData.name ? formData.name.substring(0, 2) : '未'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Label htmlFor="avatar">头像</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            disabled={uploadingAvatar}
                            className="flex-1"
                          />
                          {uploadingAvatar && <UploadIcon className="animate-spin" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">支持 JPG、PNG、GIF、WebP，最大1MB</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          姓名 *
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender">性别</Label>
                        <Select
                          value={formData.gender}
                          onValueChange={(value) => setFormData({ ...formData, gender: value })}
                        >
                          <SelectTrigger id="gender">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">男</SelectItem>
                            <SelectItem value="female">女</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">
                          邮箱 *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          手机号 *
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="birthDate">出生日期</Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="idNumber">身份证号</Label>
                        <Input
                          id="idNumber"
                          value={formData.idNumber}
                          onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* 工作信息 */}
                  <TabsContent value="job" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="departmentId">
                          所属部门 *
                        </Label>
                        <Select
                          value={formData.departmentId}
                          onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                        >
                          <SelectTrigger id="departmentId">
                            <SelectValue placeholder="选择部门" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="positionId">
                          职位 *
                        </Label>
                        <Select
                          value={formData.positionId}
                          onValueChange={(value) => setFormData({ ...formData, positionId: value })}
                        >
                          <SelectTrigger id="positionId">
                            <SelectValue placeholder="选择职位" />
                          </SelectTrigger>
                          <SelectContent>
                            {positions.map((pos) => (
                              <SelectItem key={pos.id} value={pos.id}>
                                {pos.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="level">职级</Label>
                        <Input
                          id="level"
                          value={formData.level}
                          onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                          placeholder="例如：P6、M1"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="employmentType">
                          用工性质 *
                        </Label>
                        <Select
                          value={formData.employmentType}
                          onValueChange={(value) => setFormData({ ...formData, employmentType: value })}
                        >
                          <SelectTrigger id="employmentType">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full-time">全职</SelectItem>
                            <SelectItem value="part-time">兼职</SelectItem>
                            <SelectItem value="intern">实习生</SelectItem>
                            <SelectItem value="contract">合同工</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hireDate">
                          入职日期 *
                        </Label>
                        <Input
                          id="hireDate"
                          type="date"
                          value={formData.hireDate}
                          onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="probationEndDate">试用期结束日期</Label>
                        <Input
                          id="probationEndDate"
                          type="date"
                          value={formData.probationEndDate}
                          onChange={(e) => setFormData({ ...formData, probationEndDate: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contractType">合同类型</Label>
                        <Select
                          value={formData.contractType}
                          onValueChange={(value) => setFormData({ ...formData, contractType: value })}
                        >
                          <SelectTrigger id="contractType">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed-term">固定期限合同</SelectItem>
                            <SelectItem value="open-ended">无固定期限合同</SelectItem>
                            <SelectItem value="project">项目合同</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="workLocation">工作地点</Label>
                        <Input
                          id="workLocation"
                          value={formData.workLocation}
                          onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                          placeholder="例如：广州市天河区"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="managerId">直属上级</Label>
                        <Select
                          value={formData.managerId}
                          onValueChange={(value) => setFormData({ ...formData, managerId: value })}
                        >
                          <SelectTrigger id="managerId">
                            <SelectValue placeholder="选择上级" />
                          </SelectTrigger>
                          <SelectContent>
                            {managers.map((manager) => (
                              <SelectItem key={manager.id} value={manager.id}>
                                {manager.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  {/* 个人资料 */}
                  <TabsContent value="personal" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="address">家庭住址</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="emergencyContact">紧急联系人</Label>
                          <Input
                            id="emergencyContact"
                            value={formData.emergencyContact}
                            onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="emergencyPhone">紧急联系电话</Label>
                          <Input
                            id="emergencyPhone"
                            type="tel"
                            value={formData.emergencyPhone}
                            onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="education">学历</Label>
                        <Select
                          value={formData.education}
                          onValueChange={(value) => setFormData({ ...formData, education: value })}
                        >
                          <SelectTrigger id="education">
                            <SelectValue placeholder="选择学历" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high-school">高中</SelectItem>
                            <SelectItem value="college">大专</SelectItem>
                            <SelectItem value="bachelor">本科</SelectItem>
                            <SelectItem value="master">硕士</SelectItem>
                            <SelectItem value="phd">博士</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="workExperience">工作经历</Label>
                        <Textarea
                          id="workExperience"
                          value={formData.workExperience}
                          onChange={(e) => setFormData({ ...formData, workExperience: e.target.value })}
                          rows={4}
                          placeholder="简要描述工作经历..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="skills">技能专长</Label>
                        <Textarea
                          id="skills"
                          value={formData.skills}
                          onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                          rows={3}
                          placeholder="列出专业技能，用逗号分隔..."
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* 其他信息 */}
                  <TabsContent value="other" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="notes">备注信息</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={6}
                        placeholder="其他需要记录的信息..."
                      />
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        所有必填项完成后，点击"保存"按钮即可创建员工档案。
                        系统将自动发送入职通知邮件给员工。
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                </Tabs>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    取消
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? '保存中...' : '保存'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">员工总数</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">128</div>
            <p className="text-xs text-gray-500 mt-1">较上月 +5%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">试用期员工</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs text-gray-500 mt-1">3人即将转正</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本月入职</CardTitle>
            <Plus className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
            <p className="text-xs text-gray-500 mt-1">本月计划招聘15人</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待审批</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5</div>
            <p className="text-xs text-gray-500 mt-1">3个转正、2个晋升</p>
          </CardContent>
        </Card>
      </div>

      {/* 功能提示 */}
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          高级员工管理功能已启用，支持完整的员工档案、多维度搜索、批量导入导出、工作流审批等功能。
        </AlertDescription>
      </Alert>
    </div>
  );
}
