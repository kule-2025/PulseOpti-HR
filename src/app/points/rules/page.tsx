'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  XCircle,
  Target,
  Award,
  Calendar,
  TrendingUp,
  Zap
} from 'lucide-react';

interface PointRule {
  id: string;
  name: string;
  category: 'performance' | 'behavior' | 'training' | 'special';
  points: number;
  type: 'fixed' | 'percentage';
  condition: string;
  maxPoints: number;
  limitType: 'daily' | 'weekly' | 'monthly' | 'unlimited';
  status: 'active' | 'inactive';
  description: string;
  effectiveDate: string;
  expiryDate: string | null;
  applicableRoles: string[];
  departments: string[];
}

export default function PointsRulesPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'inactive' | 'templates'>('active');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedRule, setSelectedRule] = useState<PointRule | null>(null);

  const [rules, setRules] = useState<PointRule[]>([
    {
      id: '1',
      name: '全勤奖励',
      category: 'behavior',
      points: 100,
      type: 'fixed',
      condition: '月度全勤',
      maxPoints: 100,
      limitType: 'monthly',
      status: 'active',
      description: '每月全勤打卡可获得100积分',
      effectiveDate: '2024-01-01',
      expiryDate: null,
      applicableRoles: ['all'],
      departments: ['all']
    },
    {
      id: '2',
      name: '绩效优秀奖励',
      category: 'performance',
      points: 500,
      type: 'fixed',
      condition: '绩效考核评分≥90分',
      maxPoints: 500,
      limitType: 'monthly',
      status: 'active',
      description: '绩效考核优秀可获得500积分',
      effectiveDate: '2024-01-01',
      expiryDate: null,
      applicableRoles: ['all'],
      departments: ['all']
    },
    {
      id: '3',
      name: '培训完成奖励',
      category: 'training',
      points: 50,
      type: 'fixed',
      condition: '完成一门培训课程',
      maxPoints: 300,
      limitType: 'monthly',
      status: 'active',
      description: '每完成一门培训课程可获得50积分，每月最多获得300积分',
      effectiveDate: '2024-01-01',
      expiryDate: null,
      applicableRoles: ['all'],
      departments: ['all']
    },
    {
      id: '4',
      name: '季度销售冠军',
      category: 'special',
      points: 2000,
      type: 'fixed',
      condition: '季度销售第一名',
      maxPoints: 2000,
      limitType: 'monthly',
      status: 'active',
      description: '季度销售冠军可获得2000积分',
      effectiveDate: '2024-01-01',
      expiryDate: null,
      applicableRoles: ['销售'],
      departments: ['销售部']
    },
    {
      id: '5',
      name: '创新提案奖励',
      category: 'special',
      points: 300,
      type: 'fixed',
      condition: '提交创新提案并被采纳',
      maxPoints: 1500,
      limitType: 'monthly',
      status: 'inactive',
      description: '每提交一个创新提案并被采纳可获得300积分，每月最多获得1500积分',
      effectiveDate: '2024-01-01',
      expiryDate: null,
      applicableRoles: ['all'],
      departments: ['all']
    }
  ]);

  const activeRules = rules.filter(r => r.status === 'active');
  const inactiveRules = rules.filter(r => r.status === 'inactive');

  const handleCreateRule = (newRule: Partial<PointRule>) => {
    const rule: PointRule = {
      id: Date.now().toString(),
      name: newRule.name || '',
      category: newRule.category || 'performance',
      points: newRule.points || 0,
      type: newRule.type || 'fixed',
      condition: newRule.condition || '',
      maxPoints: newRule.maxPoints || 0,
      limitType: newRule.limitType || 'unlimited',
      status: 'active',
      description: newRule.description || '',
      effectiveDate: new Date().toISOString().split('T')[0],
      expiryDate: null,
      applicableRoles: newRule.applicableRoles || ['all'],
      departments: newRule.departments || ['all']
    };
    setRules([...rules, rule]);
    setShowCreateDialog(false);
  };

  const handleEditRule = (updatedRule: Partial<PointRule>) => {
    if (updatedRule.id) {
      setRules(rules.map(r => r.id === updatedRule.id ? { ...r, ...updatedRule } as PointRule : r));
    }
    setShowEditDialog(false);
    setSelectedRule(null);
  };

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('确定要删除这条规则吗？')) {
      setRules(rules.filter(r => r.id !== ruleId));
    }
  };

  const handleToggleStatus = (ruleId: string) => {
    setRules(rules.map(r => 
      r.id === ruleId ? { ...r, status: r.status === 'active' ? 'inactive' : 'active' } : r
    ));
  };

  const getCategoryBadge = (category: string) => {
    const config = {
      performance: { label: '绩效', color: 'bg-blue-100 text-blue-800' },
      behavior: { label: '行为', color: 'bg-green-100 text-green-800' },
      training: { label: '培训', color: 'bg-purple-100 text-purple-800' },
      special: { label: '专项', color: 'bg-orange-100 text-orange-800' }
    };
    return config[category as keyof typeof config] || { label: '其他', color: 'bg-gray-100 text-gray-800' };
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      performance: <TrendingUp className="h-4 w-4" />,
      behavior: <Target className="h-4 w-4" />,
      training: <Award className="h-4 w-4" />,
      special: <Zap className="h-4 w-4" />
    };
    return icons[category as keyof typeof icons] || <Award className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">积分规则</h1>
              <p className="text-sm text-gray-600 mt-1">配置积分获取与消耗规则</p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  新建规则
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>新建积分规则</DialogTitle>
                  <DialogDescription>
                    配置新的积分获取或消耗规则
                  </DialogDescription>
                </DialogHeader>
                <RuleForm onSubmit={handleCreateRule} onCancel={() => setShowCreateDialog(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              启用规则 ({activeRules.length})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              <XCircle className="h-4 w-4 mr-2" />
              停用规则 ({inactiveRules.length})
            </TabsTrigger>
            <TabsTrigger value="templates">
              <Copy className="h-4 w-4 mr-2" />
              规则模板
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeRules.map((rule) => (
                <Card key={rule.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${getCategoryBadge(rule.category).color}`}>
                          {getCategoryIcon(rule.category)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{rule.name}</CardTitle>
                          <CardDescription>{rule.description}</CardDescription>
                        </div>
                      </div>
                      <Badge className={getCategoryBadge(rule.category).color}>
                        {getCategoryBadge(rule.category).label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">积分</span>
                        <span className="font-bold text-blue-600">+{rule.points}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">获取条件</span>
                        <span className="font-medium">{rule.condition}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">限额</span>
                        <span>{rule.maxPoints} / {rule.limitType === 'monthly' ? '月' : rule.limitType === 'weekly' ? '周' : rule.limitType === 'daily' ? '日' : '无限'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">生效日期</span>
                        <span>{rule.effectiveDate}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedRule(rule);
                          setShowEditDialog(true);
                        }}
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        编辑
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleStatus(rule.id)}
                      >
                        停用
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="inactive">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inactiveRules.map((rule) => (
                <Card key={rule.id} className="opacity-60">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${getCategoryBadge(rule.category).color}`}>
                          {getCategoryIcon(rule.category)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{rule.name}</CardTitle>
                          <CardDescription>{rule.description}</CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-gray-100 text-gray-800">
                        已停用
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">积分</span>
                        <span className="font-bold">+{rule.points}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">获取条件</span>
                        <span className="font-medium">{rule.condition}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedRule(rule);
                          setShowEditDialog(true);
                        }}
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        编辑
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleStatus(rule.id)}
                      >
                        启用
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  name: '月度全勤奖',
                  description: '每月全勤打卡奖励',
                  points: 100,
                  category: 'behavior' as const,
                  condition: '月度全勤'
                },
                {
                  name: '绩效考核奖',
                  description: '绩效考核优秀奖励',
                  points: 500,
                  category: 'performance' as const,
                  condition: '评分≥90分'
                },
                {
                  name: '培训完成奖',
                  description: '完成培训课程奖励',
                  points: 50,
                  category: 'training' as const,
                  condition: '完成课程'
                }
              ].map((template, index) => (
                <Card key={index} className="border-dashed border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">积分</span>
                        <span className="font-bold text-blue-600">+{template.points}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">类别</span>
                        <span>{template.category}</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      使用模板
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* 编辑规则对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑积分规则</DialogTitle>
            <DialogDescription>
              修改积分规则的配置
            </DialogDescription>
          </DialogHeader>
          {selectedRule && (
            <RuleForm 
              rule={selectedRule} 
              onSubmit={handleEditRule} 
              onCancel={() => {
                setShowEditDialog(false);
                setSelectedRule(null);
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 规则表单组件
interface RuleFormProps {
  rule?: PointRule;
  onSubmit: (rule: Partial<PointRule>) => void;
  onCancel: () => void;
}

function RuleForm({ rule, onSubmit, onCancel }: RuleFormProps) {
  const [formData, setFormData] = useState<Partial<PointRule>>(
    rule || {
      name: '',
      category: 'performance',
      points: 0,
      type: 'fixed',
      condition: '',
      maxPoints: 0,
      limitType: 'unlimited',
      description: '',
      applicableRoles: ['all'],
      departments: ['all']
    }
  );

  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>规则名称</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="输入规则名称"
          />
        </div>
        <div className="space-y-2">
          <Label>规则类别</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="performance">绩效</SelectItem>
              <SelectItem value="behavior">行为</SelectItem>
              <SelectItem value="training">培训</SelectItem>
              <SelectItem value="special">专项</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>规则描述</Label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="输入规则描述"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>积分数</Label>
          <Input
            type="number"
            value={formData.points}
            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label>类型</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">固定积分</SelectItem>
              <SelectItem value="percentage">百分比</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>获取条件</Label>
          <Input
            value={formData.condition}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
            placeholder="输入获取条件"
          />
        </div>
        <div className="space-y-2">
          <Label>限额</Label>
          <Input
            type="number"
            value={formData.maxPoints}
            onChange={(e) => setFormData({ ...formData, maxPoints: parseInt(e.target.value) })}
            placeholder="0表示不限制"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>限制类型</Label>
        <Select
          value={formData.limitType}
          onValueChange={(value) => setFormData({ ...formData, limitType: value as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">每日限制</SelectItem>
            <SelectItem value="weekly">每周限制</SelectItem>
            <SelectItem value="monthly">每月限制</SelectItem>
            <SelectItem value="unlimited">不限制</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button onClick={() => onSubmit(formData)}>
          {rule ? '保存修改' : '创建规则'}
        </Button>
      </DialogFooter>
    </div>
  );
}
