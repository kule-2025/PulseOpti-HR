"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Filter,
  Download,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Eye,
  ArrowRight,
  Plus,
  Edit,
} from 'lucide-react';
import { cn } from '@/lib/theme';

interface TalentNode {
  id: string;
  name: string;
  avatar?: string;
  department: string;
  position: string;
  level: string;
  category: string;
  successors?: string[];
  readiness?: 'ready' | '1-2years' | '2-3years' | 'none';
  riskLevel?: 'critical' | 'high' | 'medium' | 'low';
}

interface KeyPosition {
  position: string;
  department: string;
  current: TalentNode | null;
  successors: TalentNode[];
  readiness: 'ready' | '1-2years' | '2-3years' | 'none';
  risk: 'critical' | 'high' | 'medium' | 'low';
  gap: string;
}

interface TalentPool {
  category: string;
  employees: TalentNode[];
  size: number;
  growth: number;
}

interface SuccessionRisk {
  position: string;
  department: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  factors: string[];
}

interface TalentMapProps {
  keyPositions: KeyPosition[];
  highPotentialEmployees: TalentNode[];
  keyTalentPools: TalentPool[];
  successionRisks: SuccessionRisk[];
  onEmployeeClick?: (employee: TalentNode) => void;
  onExport?: () => void;
}

export default function TalentMap({
  keyPositions,
  highPotentialEmployees,
  keyTalentPools,
  successionRisks,
  onEmployeeClick,
  onExport,
}: TalentMapProps) {
  const [activeTab, setActiveTab] = useState('positions');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedPosition, setSelectedPosition] = useState<KeyPosition | null>(null);

  // 过滤数据
  const filteredPositions = keyPositions.filter(pos =>
    (departmentFilter === 'all' || pos.department === departmentFilter) &&
    pos.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEmployees = highPotentialEmployees.filter(emp =>
    (departmentFilter === 'all' || emp.department === departmentFilter) &&
    (emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     emp.position.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredRisks = successionRisks.filter(risk =>
    (departmentFilter === 'all' || risk.department === departmentFilter) &&
    risk.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">人才地图</h3>
          <p className="text-muted-foreground mt-1">
            可视化关键职位、继任者和人才池
          </p>
        </div>
        <div className="flex gap-2">
          {onExport && (
            <Button variant="outline" size="icon" onClick={onExport}>
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* 过滤器 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">搜索</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="搜索职位或员工..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="department">部门</Label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="全部部门" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部部门</SelectItem>
                  {Array.from(new Set(keyPositions.map(p => p.department))).map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>关键职位</CardDescription>
            <CardTitle className="text-2xl">{keyPositions.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>高潜人才</CardDescription>
            <CardTitle className="text-2xl">{highPotentialEmployees.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>人才池</CardDescription>
            <CardTitle className="text-2xl">{keyTalentPools.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>继任风险</CardDescription>
            <CardTitle className="text-2xl text-red-600">
              {successionRisks.filter(r => r.riskLevel === 'critical' || r.riskLevel === 'high').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 主内容 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="positions">关键职位</TabsTrigger>
          <TabsTrigger value="talents">高潜人才</TabsTrigger>
          <TabsTrigger value="pools">人才池</TabsTrigger>
          <TabsTrigger value="risks">继任风险</TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPositions.map((position, idx) => (
              <Card
                key={idx}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-lg",
                  position.risk === 'critical' && "border-red-500",
                  position.risk === 'high' && "border-orange-500"
                )}
                onClick={() => setSelectedPosition(position)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{position.position}</CardTitle>
                      <CardDescription className="text-xs">{position.department}</CardDescription>
                    </div>
                    <Badge
                      variant={position.risk === 'critical' ? 'destructive' : position.risk === 'high' ? 'default' : 'secondary'}
                    >
                      {position.risk}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* 现任者 */}
                    {position.current ? (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={position.current.avatar} />
                          <AvatarFallback>
                            {position.current.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{position.current.name}</p>
                          <p className="text-xs text-muted-foreground">{position.current.level}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {position.readiness}
                        </Badge>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-muted-foreground">空缺</p>
                          <p className="text-xs text-muted-foreground">{position.gap}</p>
                        </div>
                      </div>
                    )}

                    {/* 继任者 */}
                    {position.successors.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">继任者 ({position.successors.length})</p>
                        <div className="space-y-2">
                          {position.successors.slice(0, 3).map((successor, sidx) => (
                            <div key={sidx} className="flex items-center gap-2 text-sm">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={successor.avatar} />
                                <AvatarFallback className="text-xs">
                                  {successor.name.slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="flex-1 truncate">{successor.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {successor.readiness}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                        <p className="text-sm text-orange-800 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          无继任者
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="talents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredEmployees.map((employee, idx) => (
              <Card
                key={idx}
                className="cursor-pointer transition-all hover:shadow-lg"
                onClick={() => onEmployeeClick?.(employee)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={employee.avatar} />
                      <AvatarFallback>
                        {employee.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{employee.name}</CardTitle>
                      <CardDescription className="text-xs truncate">{employee.position}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">部门</span>
                      <span>{employee.department}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">职级</span>
                      <span>{employee.level}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">类别</span>
                      <Badge variant="outline">{employee.category}</Badge>
                    </div>
                    {employee.riskLevel && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">风险</span>
                        <Badge variant={employee.riskLevel === 'critical' ? 'destructive' : employee.riskLevel === 'high' ? 'default' : 'secondary'}>
                          {employee.riskLevel}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {keyTalentPools.map((pool, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{pool.category}</CardTitle>
                    <Badge variant="secondary">{pool.size}人</Badge>
                  </div>
                  <CardDescription>增长率: +{pool.growth}%</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {pool.employees.slice(0, 5).map((employee, eidx) => (
                      <div
                        key={eidx}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => onEmployeeClick?.(employee)}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={employee.avatar} />
                          <AvatarFallback className="text-xs">
                            {employee.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{employee.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{employee.position}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                    {pool.employees.length > 5 && (
                      <div className="text-center text-sm text-muted-foreground">
                        还有 {pool.employees.length - 5} 人
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <div className="space-y-3">
            {filteredRisks.map((risk, idx) => (
              <Card
                key={idx}
                className={cn(
                  "border-l-4",
                  risk.riskLevel === 'critical' && "border-l-red-500",
                  risk.riskLevel === 'high' && "border-l-orange-500",
                  risk.riskLevel === 'medium' && "border-l-yellow-500",
                  risk.riskLevel === 'low' && "border-l-green-500"
                )}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{risk.position}</h4>
                        <Badge
                          variant={risk.riskLevel === 'critical' ? 'destructive' : risk.riskLevel === 'high' ? 'default' : 'secondary'}
                        >
                          {risk.riskLevel}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{risk.department}</p>
                      <ul className="mt-3 space-y-1">
                        {risk.factors.map((factor, fidx) => (
                          <li key={fidx} className="text-sm flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button variant="outline" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* 职位详情对话框 */}
      <Dialog open={!!selectedPosition} onOpenChange={() => setSelectedPosition(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>职位详情</DialogTitle>
            <DialogDescription>
              {selectedPosition?.position} - {selectedPosition?.department}
            </DialogDescription>
          </DialogHeader>
          {selectedPosition && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>风险等级</Label>
                  <Badge
                    variant={selectedPosition.risk === 'critical' ? 'destructive' : selectedPosition.risk === 'high' ? 'default' : 'secondary'}
                  >
                    {selectedPosition.risk}
                  </Badge>
                </div>
                <div>
                  <Label>继任准备度</Label>
                  <Badge variant="outline">{selectedPosition.readiness}</Badge>
                </div>
              </div>

              {selectedPosition.current && (
                <div>
                  <Label>现任者</Label>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mt-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedPosition.current.avatar} />
                      <AvatarFallback>
                        {selectedPosition.current.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedPosition.current.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedPosition.current.level}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label>继任者列表</Label>
                <div className="space-y-2 mt-2">
                  {selectedPosition.successors.length > 0 ? (
                    selectedPosition.successors.map((successor, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={successor.avatar} />
                          <AvatarFallback className="text-xs">
                            {successor.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{successor.name}</p>
                          <p className="text-xs text-muted-foreground">{successor.position}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {successor.readiness}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                      <p className="text-sm text-orange-800 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        无继任者 - {selectedPosition.gap}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Button className="w-full">查看完整信息</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
