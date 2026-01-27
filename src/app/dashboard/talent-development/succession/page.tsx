'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Users,
  Plus,
  Search,
  UserCheck,
  UserX,
  Crown,
  ArrowRight,
  Calendar,
  Building,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

type Readiness = 'ready' | '1-2years' | '3-5years' | 'potential';

interface SuccessionCandidate {
  id: string;
  employeeId: string;
  employeeName: string;
  currentPosition: string;
  department: string;
  readiness: Readiness;
  readinessScore: number;
  lastAssessmentDate: string;
  developmentPlan: string;
}

interface SuccessionPlan {
  id: string;
  positionId: string;
  positionName: string;
  department: string;
  level: string;
  currentHolder?: {
    employeeId: string;
    employeeName: string;
    tenure: number;
    expectedDeparture?: string;
  };
  candidates: SuccessionCandidate[];
  minCandidates: number;
  isCritical: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'active' | 'on-hold' | 'completed';
  lastUpdated: string;
  notes?: string;
}

export default function SuccessionPlanPage() {
  const [plans, setPlans] = useState<SuccessionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SuccessionPlan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [newPlan, setNewPlan] = useState({
    positionName: '',
    department: '',
    level: '',
    currentHolderName: '',
    expectedDeparture: '',
    minCandidates: '1',
    isCritical: false,
    notes: '',
  });

  useEffect(() => {
    // 模拟获取继任计划数据
    setTimeout(() => {
      setPlans([
        {
          id: '1',
          positionId: 'P001',
          positionName: '技术总监',
          department: '技术部',
          level: '总监级',
          currentHolder: {
            employeeId: 'E100',
            employeeName: '李技术总监',
            tenure: 5,
            expectedDeparture: '2025-12-31',
          },
          candidates: [
            {
              id: 'C1',
              employeeId: 'E001',
              employeeName: '张三',
              currentPosition: '高级前端工程师',
              department: '技术部',
              readiness: '1-2years',
              readinessScore: 85,
              lastAssessmentDate: '2024-01-15',
              developmentPlan: '技术专家培养计划',
            },
            {
              id: 'C2',
              employeeId: 'E002',
              employeeName: '李四',
              currentPosition: '架构师',
              department: '技术部',
              readiness: 'ready',
              readinessScore: 92,
              lastAssessmentDate: '2024-01-20',
              developmentPlan: '技术领导力提升计划',
            },
          ],
          minCandidates: 2,
          isCritical: true,
          riskLevel: 'medium',
          status: 'active',
          lastUpdated: '2024-01-25T10:30:00',
          notes: '重点培养李四，重点关注张三的领导力提升',
        },
        {
          id: '2',
          positionId: 'P002',
          positionName: '产品总监',
          department: '产品部',
          level: '总监级',
          currentHolder: {
            employeeId: 'E200',
            employeeName: '王产品总监',
            tenure: 3,
          },
          candidates: [
            {
              id: 'C3',
              employeeId: 'E010',
              employeeName: '刘五',
              currentPosition: '产品经理',
              department: '产品部',
              readiness: '3-5years',
              readinessScore: 72,
              lastAssessmentDate: '2024-01-18',
              developmentPlan: '产品负责人发展计划',
            },
          ],
          minCandidates: 2,
          isCritical: true,
          riskLevel: 'high',
          status: 'active',
          lastUpdated: '2024-01-20T14:00:00',
          notes: '候选人不足，需要从外部招聘或内部培养更多候选人',
        },
        {
          id: '3',
          positionId: 'P003',
          positionName: '销售经理',
          department: '销售部',
          level: '经理级',
          currentHolder: {
            employeeId: 'E300',
            employeeName: '赵销售经理',
            tenure: 2,
            expectedDeparture: '2024-06-30',
          },
          candidates: [
            {
              id: 'C4',
              employeeId: 'E020',
              employeeName: '陈六',
              currentPosition: '高级销售代表',
              department: '销售部',
              readiness: 'ready',
              readinessScore: 90,
              lastAssessmentDate: '2024-01-22',
              developmentPlan: '销售管理能力提升',
            },
            {
              id: 'C5',
              employeeId: 'E021',
              employeeName: '杨七',
              currentPosition: '销售代表',
              department: '销售部',
              readiness: '1-2years',
              readinessScore: 78,
              lastAssessmentDate: '2024-01-25',
              developmentPlan: '销售精英成长计划',
            },
          ],
          minCandidates: 2,
          isCritical: true,
          riskLevel: 'low',
          status: 'active',
          lastUpdated: '2024-01-25T16:30:00',
        },
        {
          id: '4',
          positionId: 'P004',
          positionName: '运营主管',
          department: '运营部',
          level: '主管级',
          candidates: [],
          minCandidates: 2,
          isCritical: false,
          riskLevel: 'high',
          status: 'on-hold',
          lastUpdated: '2024-01-15T09:00:00',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreatePlan = () => {
    const plan: SuccessionPlan = {
      id: Date.now().toString(),
      positionId: 'P' + Date.now().toString().slice(-4),
      positionName: newPlan.positionName,
      department: newPlan.department,
      level: newPlan.level,
      currentHolder: newPlan.currentHolderName
        ? {
            employeeId: 'E' + Date.now().toString().slice(-4),
            employeeName: newPlan.currentHolderName,
            tenure: 0,
            expectedDeparture: newPlan.expectedDeparture,
          }
        : undefined,
      candidates: [],
      minCandidates: parseInt(newPlan.minCandidates) || 1,
      isCritical: newPlan.isCritical,
      riskLevel: newPlan.isCritical && !newPlan.currentHolderName ? 'high' : 'medium',
      status: 'active',
      lastUpdated: new Date().toISOString(),
      notes: newPlan.notes,
    };
    setPlans([plan, ...plans]);
    setShowCreatePlan(false);
    toast.success('继任计划已创建');
    setNewPlan({
      positionName: '',
      department: '',
      level: '',
      currentHolderName: '',
      expectedDeparture: '',
      minCandidates: '1',
      isCritical: false,
      notes: '',
    });
  };

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.positionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.currentHolder?.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || plan.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const departments = Array.from(new Set(plans.map((plan) => plan.department)));

  const readinessConfig: Record<Readiness, { label: string; color: string; score: number }> = {
    ready: { label: '立即继任', color: 'bg-green-500', score: 90 },
    '1-2years': { label: '1-2年', color: 'bg-blue-500', score: 80 },
    '3-5years': { label: '3-5年', color: 'bg-yellow-500', score: 70 },
    potential: { label: '潜力人才', color: 'bg-purple-500', score: 60 },
  };

  const riskLevelConfig: Record<string, { label: string; color: string; icon: any }> = {
    low: { label: '低风险', color: 'bg-green-500', icon: CheckCircle },
    medium: { label: '中等风险', color: 'bg-yellow-500', icon: AlertTriangle },
    high: { label: '高风险', color: 'bg-red-500', icon: AlertTriangle },
  };

  const statistics = {
    total: plans.length,
    critical: plans.filter((p) => p.isCritical).length,
    active: plans.filter((p) => p.status === 'active').length,
    highRisk: plans.filter((p) => p.riskLevel === 'high').length,
    totalCandidates: plans.reduce((sum, p) => sum + p.candidates.length, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              继任计划
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              建立关键岗位人才梯队，确保组织持续发展
            </p>
          </div>
          <Button onClick={() => setShowCreatePlan(true)}>
            <Plus className="h-4 w-4 mr-2" />
            创建继任计划
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">总计划数</p>
                  <p className="text-2xl font-bold">{statistics.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">关键岗位</p>
                  <p className="text-2xl font-bold text-purple-600">{statistics.critical}</p>
                </div>
                <Crown className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">进行中</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.active}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">高风险</p>
                  <p className="text-2xl font-bold text-red-600">{statistics.highRisk}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">候选人总数</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.totalCandidates}</p>
                </div>
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选栏 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索岗位名称或在职人员..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="部门" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部部门</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">进行中</SelectItem>
                  <SelectItem value="on-hold">暂停</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 继任计划列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 flex items-center justify-center h-64">
              <div className="text-gray-600 dark:text-gray-400">加载中...</div>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">暂无继任计划</p>
              <Button className="mt-4" onClick={() => setShowCreatePlan(true)}>
                <Plus className="h-4 w-4 mr-2" />
                创建计划
              </Button>
            </div>
          ) : (
            filteredPlans.map((plan) => {
              const RiskIcon = riskLevelConfig[plan.riskLevel].icon;
              const candidatesStatus = plan.candidates.length >= plan.minCandidates;

              return (
                <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {plan.positionName}
                          {plan.isCritical && (
                            <Badge className="bg-purple-500 text-white border-0">
                              <Crown className="h-3 w-3 mr-1" />
                              关键岗位
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-3 mt-2">
                          <span>{plan.level}</span>
                          <span>·</span>
                          <span>{plan.department}</span>
                        </CardDescription>
                      </div>
                      <Badge className={`${riskLevelConfig[plan.riskLevel].color} text-white border-0`}>
                        {riskLevelConfig[plan.riskLevel].label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* 在职人员 */}
                      {plan.currentHolder ? (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserCheck className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{plan.currentHolder.employeeName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              在职 {plan.currentHolder.tenure} 年
                            </p>
                          </div>
                          {plan.currentHolder.expectedDeparture && (
                            <div className="text-right">
                              <p className="text-sm text-gray-600 dark:text-gray-400">预计离职</p>
                              <p className="font-medium text-red-600">
                                {plan.currentHolder.expectedDeparture}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <UserX className="h-5 w-5 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-red-600">岗位空缺</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">需尽快填补</p>
                          </div>
                        </div>
                      )}

                      {/* 候选人列表 */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">继任候选人 ({plan.candidates.length}/{plan.minCandidates})</p>
                          {!candidatesStatus && (
                            <Badge variant="destructive" className="text-xs">
                              候选人不足
                            </Badge>
                          )}
                          {candidatesStatus && (
                            <Badge className="bg-green-500 text-white border-0 text-xs">
                              候选人充足
                            </Badge>
                          )}
                        </div>

                        {plan.candidates.length > 0 ? (
                          <div className="space-y-2">
                            {plan.candidates.map((candidate) => (
                              <div
                                key={candidate.id}
                                className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors cursor-pointer"
                              >
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <User className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{candidate.employeeName}</p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {candidate.currentPosition}
                                  </p>
                                </div>
                                <Badge
                                  className={`${readinessConfig[candidate.readiness].color} text-white border-0 text-xs`}
                                >
                                  {readinessConfig[candidate.readiness].label}
                                </Badge>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-blue-600">
                                    {candidate.readinessScore}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">准备度</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-400 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg">
                            暂无候选人
                          </div>
                        )}
                      </div>

                      {/* 备注 */}
                      {plan.notes && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">备注：</span>
                          {plan.notes}
                        </div>
                      )}

                      {/* 操作按钮 */}
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Users className="h-4 w-4 mr-1" />
                          管理候选人
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          查看详情
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* 创建继任计划弹窗 */}
      <Dialog open={showCreatePlan} onOpenChange={setShowCreatePlan}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>创建继任计划</DialogTitle>
            <DialogDescription>
              为关键岗位建立人才梯队
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>岗位名称 *</Label>
                <Input
                  placeholder="输入岗位名称"
                  value={newPlan.positionName}
                  onChange={(e) => setNewPlan({ ...newPlan, positionName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>部门 *</Label>
                <Input
                  placeholder="输入部门"
                  value={newPlan.department}
                  onChange={(e) => setNewPlan({ ...newPlan, department: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>岗位级别 *</Label>
                <Input
                  placeholder="例如：总监级、经理级"
                  value={newPlan.level}
                  onChange={(e) => setNewPlan({ ...newPlan, level: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>最小候选人数量 *</Label>
                <Input
                  type="number"
                  min="1"
                  value={newPlan.minCandidates}
                  onChange={(e) => setNewPlan({ ...newPlan, minCandidates: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>现任人员</Label>
                <Input
                  placeholder="输入现任人员姓名（可选）"
                  value={newPlan.currentHolderName}
                  onChange={(e) => setNewPlan({ ...newPlan, currentHolderName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>预计离职时间</Label>
                <Input
                  type="date"
                  value={newPlan.expectedDeparture}
                  onChange={(e) => setNewPlan({ ...newPlan, expectedDeparture: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isCritical"
                checked={newPlan.isCritical}
                onChange={(e) => setNewPlan({ ...newPlan, isCritical: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="isCritical" className="cursor-pointer">
                标记为关键岗位
              </Label>
            </div>

            <div className="space-y-2">
              <Label>备注</Label>
              <textarea
                className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                placeholder="输入备注信息..."
                value={newPlan.notes}
                onChange={(e) => setNewPlan({ ...newPlan, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreatePlan(false)}>
              取消
            </Button>
            <Button onClick={handleCreatePlan}>
              <Plus className="h-4 w-4 mr-2" />
              创建计划
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
