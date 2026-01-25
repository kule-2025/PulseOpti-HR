'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Edit,
  Trash2,
  Settings,
  CheckCircle2,
  XCircle,
  Search,
  Sliders,
  Copy,
  Eye,
  Save,
  ArrowUp,
  ArrowDown,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface AssessmentDimension {
  id: string;
  name: string;
  description: string;
  weight: number;
  maxScore: number;
  criteria?: Record<string, any>;
  sortOrder: number;
  isRequired: boolean;
}

interface AssessmentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'resume' | 'interview' | 'performance';
  companyId: string;
  isDefault: boolean;
  passingThreshold: number;
  totalWeight: number;
  createdAt: string;
  updatedAt: string;
  dimensions: AssessmentDimension[];
}

export default function AssessmentTemplatesPage() {
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDimensionsDialog, setShowDimensionsDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AssessmentTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'resume' as 'resume' | 'interview' | 'performance',
    passingThreshold: 60,
  });

  // 获取当前用户信息
  const getCurrentUser = () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  };

  // 获取模板列表
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const user = getCurrentUser();
      if (!user?.companyId) return;

      const params = new URLSearchParams({
        companyId: user.companyId,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
      });

      const response = await fetch(`/api/assessment/templates?${params}`);
      const data = await response.json();

      if (data.success) {
        setTemplates(data.data || []);
      } else {
        toast.error(data.message || '获取模板列表失败');
      }
    } catch (error) {
      console.error('获取模板列表失败:', error);
      toast.error('获取模板列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 创建模板
  const handleCreateTemplate = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('请输入模板名称');
        return;
      }

      const user = getCurrentUser();
      if (!user?.companyId) return;

      const response = await fetch('/api/assessment/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          companyId: user.companyId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('模板创建成功');
        setShowCreateDialog(false);
        setFormData({
          name: '',
          description: '',
          category: 'resume',
          passingThreshold: 60,
        });
        fetchTemplates();
      } else {
        toast.error(data.message || '创建模板失败');
      }
    } catch (error) {
      console.error('创建模板失败:', error);
      toast.error('创建模板失败');
    }
  };

  // 更新模板
  const handleUpdateTemplate = async () => {
    try {
      if (!selectedTemplate || !formData.name.trim()) {
        return;
      }

      const response = await fetch(`/api/assessment/templates/${selectedTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('模板更新成功');
        setShowEditDialog(false);
        fetchTemplates();
      } else {
        toast.error(data.message || '更新模板失败');
      }
    } catch (error) {
      console.error('更新模板失败:', error);
      toast.error('更新模板失败');
    }
  };

  // 删除模板
  const handleDeleteTemplate = async (templateId: string) => {
    try {
      if (!confirm('确定要删除此模板吗？此操作不可恢复。')) {
        return;
      }

      const response = await fetch(`/api/assessment/templates/${templateId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('模板删除成功');
        fetchTemplates();
      } else {
        toast.error(data.message || '删除模板失败');
      }
    } catch (error) {
      console.error('删除模板失败:', error);
      toast.error('删除模板失败');
    }
  };

  // 复制模板
  const handleDuplicateTemplate = async (template: AssessmentTemplate) => {
    try {
      const user = getCurrentUser();
      if (!user?.companyId) return;

      const response = await fetch('/api/assessment/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${template.name} (副本)`,
          description: template.description,
          category: template.category,
          companyId: user.companyId,
          passingThreshold: template.passingThreshold,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 复制维度
        if (template.dimensions.length > 0) {
          await fetch(`/api/assessment/templates/${data.data.id}/dimensions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dimensions: template.dimensions.map((dim, index) => ({
                name: dim.name,
                description: dim.description,
                weight: dim.weight,
                maxScore: dim.maxScore,
                criteria: dim.criteria,
                sortOrder: index,
                isRequired: dim.isRequired,
              })),
            }),
          });
        }

        toast.success('模板复制成功');
        fetchTemplates();
      } else {
        toast.error(data.message || '复制模板失败');
      }
    } catch (error) {
      console.error('复制模板失败:', error);
      toast.error('复制模板失败');
    }
  };

  // 打开编辑对话框
  const openEditDialog = (template: AssessmentTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      category: template.category,
      passingThreshold: template.passingThreshold,
    });
    setShowEditDialog(true);
  };

  // 打开维度配置对话框
  const openDimensionsDialog = (template: AssessmentTemplate) => {
    setSelectedTemplate(template);
    setShowDimensionsDialog(true);
  };

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory]);

  // 过滤模板
  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">评估模板配置</h1>
          <p className="text-muted-foreground mt-1">管理企业自定义评估模板和评估维度</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          创建模板
        </Button>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索模板名称或描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有分类</SelectItem>
                <SelectItem value="resume">简历评估</SelectItem>
                <SelectItem value="interview">面试评估</SelectItem>
                <SelectItem value="performance">绩效评估</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 模板列表 */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">加载中...</div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">暂无评估模板</p>
            <p className="text-muted-foreground mt-1">点击"创建模板"开始配置您的评估体系</p>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{template.name}</CardTitle>
                      {template.isDefault && <Badge variant="secondary">默认</Badge>}
                      <Badge variant="outline">
                        {template.category === 'resume' && '简历评估'}
                        {template.category === 'interview' && '面试评估'}
                        {template.category === 'performance' && '绩效评估'}
                      </Badge>
                    </div>
                    <CardDescription className="mt-2">
                      {template.description || '暂无描述'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(template)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      编辑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDimensionsDialog(template)}
                    >
                      <Sliders className="h-4 w-4 mr-1" />
                      维度
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicateTemplate(template)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {!template.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      {template.dimensions.length} 个评估维度
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      及格线: {template.passingThreshold}分
                    </span>
                    <span className="flex items-center gap-1">
                      总权重: {template.totalWeight}
                    </span>
                  </div>
                  <span>
                    更新于 {new Date(template.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 创建模板对话框 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建评估模板</DialogTitle>
            <DialogDescription>创建一个新的评估模板</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">模板名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：技术岗位简历评估模板"
              />
            </div>
            <div>
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="描述此评估模板的用途..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="category">分类 *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: any) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resume">简历评估</SelectItem>
                  <SelectItem value="interview">面试评估</SelectItem>
                  <SelectItem value="performance">绩效评估</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="threshold">及格分数 (0-100)</Label>
              <Input
                id="threshold"
                type="number"
                min="0"
                max="100"
                value={formData.passingThreshold}
                onChange={(e) =>
                  setFormData({ ...formData, passingThreshold: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              取消
            </Button>
            <Button onClick={handleCreateTemplate}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑模板对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑评估模板</DialogTitle>
            <DialogDescription>修改评估模板的基本信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">模板名称 *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="模板名称"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">描述</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="描述此评估模板的用途..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-category">分类 *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: any) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="edit-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resume">简历评估</SelectItem>
                  <SelectItem value="interview">面试评估</SelectItem>
                  <SelectItem value="performance">绩效评估</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-threshold">及格分数 (0-100)</Label>
              <Input
                id="edit-threshold"
                type="number"
                min="0"
                max="100"
                value={formData.passingThreshold}
                onChange={(e) =>
                  setFormData({ ...formData, passingThreshold: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              取消
            </Button>
            <Button onClick={handleUpdateTemplate}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 维度配置对话框 */}
      <Dialog open={showDimensionsDialog} onOpenChange={setShowDimensionsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>配置评估维度</DialogTitle>
            <DialogDescription>
              为模板 "{selectedTemplate?.name}" 配置评估维度和权重
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {selectedTemplate && (
              <DimensionsConfig
                template={selectedTemplate}
                onUpdate={fetchTemplates}
                onClose={() => setShowDimensionsDialog(false)}
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 维度配置组件
function DimensionsConfig({
  template,
  onUpdate,
  onClose,
}: {
  template: AssessmentTemplate;
  onUpdate: () => void;
  onClose: () => void;
}) {
  const [dimensions, setDimensions] = useState<AssessmentDimension[]>(template.dimensions || []);
  const [saving, setSaving] = useState(false);

  // 添加维度
  const addDimension = () => {
    const newDimension: AssessmentDimension = {
      id: `temp-${Date.now()}`,
      name: '',
      description: '',
      weight: 10,
      maxScore: 100,
      sortOrder: dimensions.length,
      isRequired: true,
    };
    setDimensions([...dimensions, newDimension]);
  };

  // 删除维度
  const removeDimension = (index: number) => {
    const newDimensions = dimensions.filter((_, i) => i !== index);
    // 重新排序
    setDimensions(
      newDimensions.map((dim, i) => ({ ...dim, sortOrder: i }))
    );
  };

  // 更新维度
  const updateDimension = (index: number, field: keyof AssessmentDimension, value: any) => {
    const newDimensions = [...dimensions];
    newDimensions[index] = { ...newDimensions[index], [field]: value };
    setDimensions(newDimensions);
  };

  // 上移维度
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newDimensions = [...dimensions];
    [newDimensions[index - 1], newDimensions[index]] = [newDimensions[index], newDimensions[index - 1]];
    setDimensions(
      newDimensions.map((dim, i) => ({ ...dim, sortOrder: i }))
    );
  };

  // 下移维度
  const moveDown = (index: number) => {
    if (index === dimensions.length - 1) return;
    const newDimensions = [...dimensions];
    [newDimensions[index], newDimensions[index + 1]] = [newDimensions[index + 1], newDimensions[index]];
    setDimensions(
      newDimensions.map((dim, i) => ({ ...dim, sortOrder: i }))
    );
  };

  // 保存维度
  const handleSaveDimensions = async () => {
    try {
      setSaving(true);

      // 验证
      const validDimensions = dimensions.filter((dim) => dim.name.trim());
      if (validDimensions.length === 0) {
        toast.error('至少需要一个有效的维度');
        return;
      }

      // 计算总权重
      const totalWeight = validDimensions.reduce((sum, dim) => sum + dim.weight, 0);
      if (totalWeight === 0) {
        toast.error('总权重不能为0');
        return;
      }

      // 先保存维度
      await fetch(`/api/assessment/templates/${template.id}/dimensions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dimensions: validDimensions.map((dim, index) => ({
            name: dim.name,
            description: dim.description,
            weight: dim.weight,
            maxScore: dim.maxScore,
            criteria: dim.criteria,
            sortOrder: index,
            isRequired: dim.isRequired,
          })),
        }),
      });

      // 更新模板的总权重
      await fetch(`/api/assessment/templates/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalWeight }),
      });

      toast.success('维度配置保存成功');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('保存维度失败:', error);
      toast.error('保存维度失败');
    } finally {
      setSaving(false);
    }
  };

  const totalWeight = dimensions.reduce((sum, dim) => sum + dim.weight, 0);

  return (
    <div className="space-y-4">
      {/* 维度列表 */}
      <div className="space-y-3">
        {dimensions.map((dimension, index) => (
          <Card key={dimension.id} className="p-4">
            <div className="grid grid-cols-12 gap-3 items-start">
              <div className="col-span-4 space-y-2">
                <Input
                  placeholder="维度名称"
                  value={dimension.name}
                  onChange={(e) => updateDimension(index, 'name', e.target.value)}
                />
                <Input
                  placeholder="描述"
                  value={dimension.description}
                  onChange={(e) => updateDimension(index, 'description', e.target.value)}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <div>
                  <Label className="text-xs">权重</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={dimension.weight}
                    onChange={(e) => updateDimension(index, 'weight', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label className="text-xs">满分</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={dimension.maxScore}
                    onChange={(e) => updateDimension(index, 'maxScore', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="col-span-5">
                <Label className="text-xs">评估标准 (JSON)</Label>
                <Textarea
                  placeholder='{"excellent": "...", "good": "..."}'
                  value={typeof dimension.criteria === 'string' ? dimension.criteria : JSON.stringify(dimension.criteria || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const criteria = e.target.value ? JSON.parse(e.target.value) : {};
                      updateDimension(index, 'criteria', criteria);
                    } catch {
                      updateDimension(index, 'criteria', e.target.value);
                    }
                  }}
                  rows={3}
                />
              </div>
              <div className="col-span-1 flex flex-col gap-1">
                <Button variant="ghost" size="sm" onClick={() => moveUp(index)} disabled={index === 0}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => moveDown(index)} disabled={index === dimensions.length - 1}>
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => removeDimension(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 添加维度按钮 */}
      <Button variant="outline" onClick={addDimension} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        添加评估维度
      </Button>

      <Separator />

      {/* 总计信息 */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          当前共 {dimensions.length} 个维度，总权重: {totalWeight}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSaveDimensions} disabled={saving}>
            {saving ? '保存中...' : '保存配置'}
          </Button>
        </div>
      </div>
    </div>
  );
}
