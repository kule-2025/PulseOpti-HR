'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Star,
  TrendingUp,
  AlertTriangle,
  Info,
  Users,
  User,
  Sparkles,
  Target,
  ArrowRight,
  Download,
  RefreshCw
} from 'lucide-react';

export interface Employee {
  id: string;
  name: string;
  avatar?: string;
  department: string;
  position: string;
  performance: number; // 0-100
  potential: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  idp?: {
    status: 'pending' | 'in_progress' | 'completed';
    goals: string[];
    trainings: string[];
    mentor?: string;
  };
}

export interface NineGridCell {
  id: string;
  label: string;
  color: string;
  description: string;
  strategy: string;
  employees: Employee[];
}

interface TalentNineGridProps {
  employees: Employee[];
  onEmployeeClick?: (employee: Employee) => void;
  onIDPGenerate?: (employee: Employee) => void;
  onExport?: () => void;
  onRefresh?: () => void;
}

export function TalentNineGrid({
  employees,
  onEmployeeClick,
  onIDPGenerate,
  onExport,
  onRefresh,
}: TalentNineGridProps) {
  const [selectedCell, setSelectedCell] = useState<NineGridCell | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isGeneratingIDP, setIsGeneratingIDP] = useState(false);

  // 将员工分配到九宫格
  const gridCells = useMemo(() => [
    {
      id: 'superstars',
      label: '超级明星',
      color: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-900/20 border-red-300 dark:border-red-700',
      description: '高绩效 + 高潜力',
      strategy: '重点培养，快速晋升通道',
      priority: 'critical',
      employees: employees.filter(e => e.performance >= 80 && e.potential >= 80),
    },
    {
      id: 'rising-stars',
      label: '潜力新星',
      color: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-900/20 border-orange-300 dark:border-orange-700',
      description: '中高绩效 + 高潜力',
      strategy: '培养发展，关注成长',
      priority: 'high',
      employees: employees.filter(e => e.performance >= 60 && e.potential >= 80 && e.potential < 80),
    },
    {
      id: 'reliable-performers',
      label: '可靠骨干',
      color: 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-900/20 border-yellow-300 dark:border-yellow-700',
      description: '高绩效 + 中等潜力',
      strategy: '保持激励，稳定发挥',
      priority: 'medium',
      employees: employees.filter(e => e.performance >= 80 && e.potential >= 40 && e.potential < 80),
    },
    {
      id: 'future-leaders',
      label: '未来领导者',
      color: 'bg-gradient-to-br from-lime-50 to-lime-100 dark:from-lime-900/30 dark:to-lime-900/20 border-lime-300 dark:border-lime-700',
      description: '中绩效 + 高潜力',
      strategy: '重点辅导，加速成长',
      priority: 'high',
      employees: employees.filter(e => e.performance >= 60 && e.performance < 80 && e.potential >= 80),
    },
    {
      id: 'steady-contributors',
      label: '稳定贡献者',
      color: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/20 border-green-300 dark:border-green-700',
      description: '中绩效 + 中等潜力',
      strategy: '稳步发展，适度激励',
      priority: 'low',
      employees: employees.filter(e => e.performance >= 60 && e.performance < 80 && e.potential >= 40 && e.potential < 80),
    },
    {
      id: 'solid-citizens',
      label: '坚实基础',
      color: 'bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-900/20 border-teal-300 dark:border-teal-700',
      description: '高绩效 + 低潜力',
      strategy: '激励稳定，长期留任',
      priority: 'medium',
      employees: employees.filter(e => e.performance >= 80 && e.potential < 40),
    },
    {
      id: 'growth-potential',
      label: '成长潜力',
      color: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20 border-blue-300 dark:border-blue-700',
      description: '低绩效 + 高潜力',
      strategy: '查明原因，制定改进计划',
      priority: 'high',
      employees: employees.filter(e => e.performance < 60 && e.potential >= 80),
    },
    {
      id: 'at-risk',
      label: '风险员工',
      color: 'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-900/20 border-indigo-300 dark:border-indigo-700',
      description: '低绩效 + 中等潜力',
      strategy: '关注辅导，必要时调整',
      priority: 'medium',
      employees: employees.filter(e => e.performance < 60 && e.potential >= 40 && e.potential < 80),
    },
    {
      id: 'low-performers',
      label: '低绩效员工',
      color: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/30 dark:to-slate-900/20 border-slate-300 dark:border-slate-700',
      description: '低绩效 + 低潜力',
      strategy: '制定改进计划，必要时淘汰',
      priority: 'low',
      employees: employees.filter(e => e.performance < 60 && e.potential < 40),
    },
  ], [employees]);

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    onEmployeeClick?.(employee);
  };

  const handleGenerateIDP = async (employee: Employee) => {
    setIsGeneratingIDP(true);
    try {
      await onIDPGenerate?.(employee);
    } finally {
      setIsGeneratingIDP(false);
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return <AlertTriangle className="h-3 w-3 text-red-600" />;
      case 'medium':
        return <Info className="h-3 w-3 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getIDPStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getIDPStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'in_progress':
        return '进行中';
      default:
        return '未开始';
    }
  };

  return (
    <div className="space-y-6">
      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            人才九宫格
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            基于绩效和潜力进行人才盘点与分类
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">总人数</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
              <Users className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-teal-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">高绩效</p>
                <p className="text-2xl font-bold">
                  {employees.filter(e => e.performance >= 80).length}
                </p>
              </div>
              <Star className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">高潜力</p>
                <p className="text-2xl font-bold">
                  {employees.filter(e => e.potential >= 80).length}
                </p>
              </div>
              <Sparkles className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">高风险</p>
                <p className="text-2xl font-bold">
                  {employees.filter(e => e.riskLevel === 'high').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 九宫格 */}
      <div className="grid grid-cols-3 gap-3">
        {gridCells.map((cell: typeof gridCells[number]) => (
          <Card
            key={cell.id}
            className={`cursor-pointer hover:shadow-lg transition-all ${cell.color} border-2`}
            onClick={() => setSelectedCell(cell)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  {cell.label}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {cell.employees.length}人
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                {cell.description}
              </p>
              
              {cell.employees.length > 0 ? (
                <div className="space-y-2">
                  {cell.employees.slice(0, 3).map((employee: typeof employees[number]) => (
                    <TooltipProvider key={employee.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="flex items-center gap-2 p-2 rounded bg-white/50 dark:bg-slate-900/50 cursor-pointer hover:bg-white dark:hover:bg-slate-900 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEmployeeClick(employee);
                            }}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-medium truncate">
                                  {employee.name}
                                </span>
                                {getRiskIcon(employee.riskLevel)}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
                                {employee.department}
                              </div>
                            </div>
                            {employee.idp && (
                              <Badge className={getIDPStatusColor(employee.idp.status)}>
                                {getIDPStatusText(employee.idp.status)}
                              </Badge>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p><strong>职位:</strong> {employee.position}</p>
                            <p><strong>绩效:</strong> {employee.performance}</p>
                            <p><strong>潜力:</strong> {employee.potential}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                  
                  {cell.employees.length > 3 && (
                    <div className="text-center text-xs text-slate-600 dark:text-slate-400 pt-1">
                      还有 {cell.employees.length - 3} 人...
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">暂无员工</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 选中单元格详情 */}
      <Dialog open={!!selectedCell} onOpenChange={() => setSelectedCell(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              {selectedCell?.label} - 详细信息
            </DialogTitle>
          </DialogHeader>
          
          {selectedCell && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  管理策略
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {selectedCell.strategy}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  员工列表 ({selectedCell.employees.length})
                </h4>
                
                {selectedCell.employees.map((employee) => (
                  <Card key={employee.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {employee.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-semibold text-slate-900 dark:text-slate-100">
                              {employee.name}
                            </h5>
                            {getRiskIcon(employee.riskLevel)}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {employee.department} · {employee.position}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          绩效: {employee.performance}
                        </Badge>
                        <Badge variant="outline">
                          潜力: {employee.potential}
                        </Badge>
                      </div>
                    </div>

                    {employee.idp && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            个人发展计划 (IDP)
                          </span>
                          <Badge className={getIDPStatusColor(employee.idp.status)}>
                            {getIDPStatusText(employee.idp.status)}
                          </Badge>
                        </div>
                        
                        {employee.idp.goals.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">发展目标:</p>
                            <div className="space-y-1">
                              {employee.idp.goals.map((goal, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                  <ArrowRight className="h-3 w-3 text-purple-600" />
                                  <span>{goal}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {employee.idp.trainings.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">推荐培训:</p>
                            <div className="flex flex-wrap gap-1">
                              {employee.idp.trainings.map((training, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {training}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {employee.idp.mentor && (
                          <div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">指导人:</p>
                            <span className="text-sm font-medium">{employee.idp.mentor}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {!employee.idp && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <Button
                          size="sm"
                          onClick={() => handleGenerateIDP(employee)}
                          disabled={isGeneratingIDP}
                          className="w-full"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          {isGeneratingIDP ? 'AI生成中...' : 'AI生成IDP'}
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
