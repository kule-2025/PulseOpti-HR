"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/theme';
import {
  Star,
  TrendingUp,
  Shield,
  AlertTriangle,
  User,
  Eye,
  Download,
  Filter,
  Info,
  Zap,
  Target,
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  avatar?: string;
  department: string;
  position: string;
  performance: number;
  potential: number;
  riskLevel: 'low' | 'medium' | 'high';
  developmentNeeds?: string[];
}

interface GridData {
  [key: string]: Employee[];
}

interface TalentNineGridProps {
  employees: Employee[];
  onEmployeeClick?: (employee: Employee) => void;
  onExport?: () => void;
  showLegend?: boolean;
  showStats?: boolean;
  interactive?: boolean;
}

// 九宫格区域定义
const QUADRANTS = [
  { id: 'star', name: '超级明星', description: '绩效优秀，潜力突出', color: 'bg-emerald-500', icon: Star },
  { id: 'rising-star', name: '潜力新星', description: '绩效良好，潜力突出', color: 'bg-cyan-500', icon: TrendingUp },
  { id: 'reliable', name: '可靠骨干', description: '绩效优秀，潜力一般', color: 'bg-blue-500', icon: Shield },
  { id: 'future-leader', name: '未来领袖', description: '绩效一般，潜力突出', color: 'bg-purple-500', icon: Target },
  { id: 'steady', name: '中坚力量', description: '绩效良好，潜力一般', color: 'bg-indigo-500', icon: User },
  { id: 'solid', name: '忠诚员工', description: '绩效优秀，潜力较低', color: 'bg-slate-500', icon: Shield },
  { id: 'growth', name: '成长空间', description: '绩效一般，潜力突出', color: 'bg-yellow-500', icon: Zap },
  { id: 'at-risk', name: '风险员工', description: '绩效一般，潜力不足', color: 'bg-orange-500', icon: AlertTriangle },
  { id: 'low-performer', name: '待提升', description: '绩效不足，潜力较低', color: 'bg-red-500', icon: AlertTriangle },
];

// 根据绩效和潜力确定象限
function getQuadrant(performance: number, potential: number): string {
  if (performance >= 80 && potential >= 80) return 'star';
  if (performance >= 60 && potential >= 80) return 'rising-star';
  if (performance >= 80 && potential >= 40 && potential < 80) return 'reliable';
  if (performance >= 60 && performance < 80 && potential >= 80) return 'future-leader';
  if (performance >= 60 && performance < 80 && potential >= 40 && potential < 80) return 'steady';
  if (performance >= 80 && potential < 40) return 'solid';
  if (performance < 60 && potential >= 80) return 'growth';
  if (performance < 60 && potential >= 40 && potential < 80) return 'at-risk';
  return 'low-performer';
}

export default function TalentNineGrid({
  employees,
  onEmployeeClick,
  onExport,
  showLegend = true,
  showStats = true,
  interactive = true,
}: TalentNineGridProps) {
  const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null);
  const [hoveredEmployee, setHoveredEmployee] = useState<Employee | null>(null);

  // 将员工分配到九宫格
  const gridData: GridData = employees.reduce((acc, employee) => {
    const quadrant = getQuadrant(employee.performance, employee.potential);
    if (!acc[quadrant]) {
      acc[quadrant] = [];
    }
    acc[quadrant].push(employee);
    return acc;
  }, {} as GridData);

  // 计算统计数据
  const stats = {
    total: employees.length,
    byQuadrant: Object.entries(gridData).reduce((acc, [quadrant, emps]) => {
      acc[quadrant] = emps.length;
      return acc;
    }, {} as Record<string, number>),
    avgPerformance: employees.length > 0
      ? employees.reduce((sum, e) => sum + e.performance, 0) / employees.length
      : 0,
    avgPotential: employees.length > 0
      ? employees.reduce((sum, e) => sum + e.potential, 0) / employees.length
      : 0,
  };

  // 获取风险员工数量
  const riskCount = employees.filter(e => e.riskLevel === 'high').length;

  return (
    <div className="space-y-4">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">人才九宫格分析</h3>
          {showStats && (
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <span>总人数: <strong>{stats.total}</strong></span>
              <span>平均绩效: <strong>{stats.avgPerformance.toFixed(1)}</strong></span>
              <span>平均潜力: <strong>{stats.avgPotential.toFixed(1)}</strong></span>
              {riskCount > 0 && (
                <span className="text-orange-600">
                  高风险员工: <strong>{riskCount}</strong>
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {showLegend && <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>}
          {onExport && <Button variant="outline" size="icon" onClick={onExport}><Download className="h-4 w-4" /></Button>}
        </div>
      </div>

      {/* 九宫格 */}
      <div className="grid grid-cols-3 gap-2">
        {QUADRANTS.map((quadrant) => {
          const Icon = quadrant.icon;
          const quadrantEmployees = gridData[quadrant.id] || [];
          const isSelected = selectedQuadrant === quadrant.id;
          const isHovered = selectedQuadrant === null || isSelected;

          return (
            <Card
              key={quadrant.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg",
                isSelected && "ring-2 ring-primary"
              )}
              onClick={() => {
                if (interactive) {
                  setSelectedQuadrant(isSelected ? null : quadrant.id);
                }
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-lg", quadrant.color, "text-white")}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">{quadrant.name}</CardTitle>
                      <CardDescription className="text-xs">{quadrant.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">{quadrantEmployees.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {quadrantEmployees.slice(0, 8).map((employee) => (
                    <TooltipProvider key={employee.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Avatar
                                className={cn(
                                  "h-8 w-8 cursor-pointer transition-transform hover:scale-110",
                                  employee.riskLevel === 'high' && "ring-2 ring-orange-500"
                                )}
                                onMouseEnter={() => setHoveredEmployee(employee)}
                                onMouseLeave={() => setHoveredEmployee(null)}
                              >
                                <AvatarImage src={employee.avatar} />
                                <AvatarFallback className="text-xs">
                                  {employee.name.slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{employee.name}</DialogTitle>
                                <DialogDescription>
                                  {employee.position} - {employee.department}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">绩效</label>
                                    <p className="text-2xl font-bold">{employee.performance}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">潜力</label>
                                    <p className="text-2xl font-bold">{employee.potential}</p>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">风险等级</label>
                                  <Badge variant={employee.riskLevel === 'high' ? 'destructive' : employee.riskLevel === 'medium' ? 'default' : 'secondary'}>
                                    {employee.riskLevel === 'high' ? '高风险' : employee.riskLevel === 'medium' ? '中风险' : '低风险'}
                                  </Badge>
                                </div>
                                {employee.developmentNeeds && employee.developmentNeeds.length > 0 && (
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">发展需求</label>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {employee.developmentNeeds.map((need, idx) => (
                                        <Badge key={idx} variant="outline">{need}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <Button className="w-full" onClick={() => onEmployeeClick?.(employee)}>
                                  查看详情
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div>
                            <p className="font-semibold">{employee.name}</p>
                            <p className="text-xs text-muted-foreground">
                              绩效: {employee.performance} | 潜力: {employee.potential}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                  {quadrantEmployees.length > 8 && (
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-medium">
                      +{quadrantEmployees.length - 8}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 象限说明 */}
      {showLegend && selectedQuadrant && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">
              {QUADRANTS.find(q => q.id === selectedQuadrant)?.name}
            </CardTitle>
            <CardDescription>
              {QUADRANTS.find(q => q.id === selectedQuadrant)?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>人数:</strong> {gridData[selectedQuadrant]?.length || 0}人</p>
              <p><strong>占比:</strong> {stats.total > 0 ? ((gridData[selectedQuadrant]?.length || 0) / stats.total * 100).toFixed(1) : 0}%</p>
              <p><strong>建议:</strong> {getQuadrantRecommendation(selectedQuadrant)}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getQuadrantRecommendation(quadrant: string): string {
  const recommendations: Record<string, string> = {
    'star': '重点培养和保留，提供挑战性机会和快速晋升通道',
    'rising-star': '加速培养，提供发展资源和导师指导',
    'reliable': '给予更多责任，稳定保留，持续激励',
    'future-leader': '提升绩效能力，为未来领导角色做准备',
    'steady': '维持现状，提供必要的支持和培训',
    'solid': '专业发展路径，技术专家角色',
    'growth': '查明绩效问题，制定改进计划',
    'at-risk': '密切监控，制定绩效改进计划',
    'low-performer': '绩效改进计划或考虑其他选择',
  };
  return recommendations[quadrant] || '持续关注和发展';
}
