'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles,
  Target,
  BookOpen,
  User,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Save,
  RefreshCw,
  Brain,
  ArrowRight
} from 'lucide-react';

export interface IDPDevelopment {
  id: string;
  goal: string;
  priority: 'high' | 'medium' | 'low';
  targetDate: string;
  currentStatus: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  milestones: Array<{
    id: string;
    title: string;
    completed: boolean;
    dueDate: string;
  }>;
}

export interface IDPTraining {
  id: string;
  title: string;
  type: 'online' | 'offline' | 'workshop' | 'mentorship';
  duration: string;
  provider?: string;
  relevanceScore: number;
  status: 'recommended' | 'enrolled' | 'completed';
}

export interface GeneratedIDP {
  employeeId: string;
  employeeName: string;
  currentPosition: string;
  targetPosition?: string;
  timeframe: string;
  overallGoal: string;
  developments: IDPDevelopment[];
  trainings: IDPTraining[];
  mentor?: {
    name: string;
    position: string;
    department: string;
    reason: string;
  };
  skillsGap: Array<{
    skill: string;
    currentLevel: number;
    targetLevel: number;
    priority: 'high' | 'medium' | 'low';
  }>;
  generatedAt: string;
  confidence: number;
}

interface IDPAIGeneratorProps {
  employee: {
    id: string;
    name: string;
    department: string;
    position: string;
    performance: number;
    potential: number;
    skills?: Record<string, number>;
  };
  onGenerate?: (idp: GeneratedIDP) => void;
  onSave?: (idp: GeneratedIDP) => void;
}

export function IDPAIGenerator({
  employee,
  onGenerate,
  onSave,
}: IDPAIGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [generatedIDP, setGeneratedIDP] = useState<GeneratedIDP | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const generateIDP = async () => {
    setGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/idp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: employee.id,
          employeeName: employee.name,
          department: employee.department,
          position: employee.position,
          performance: employee.performance,
          potential: employee.potential,
          skills: employee.skills,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      setGeneratedIDP(data.idp);
      onGenerate?.(data.idp);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to generate IDP'));
    } finally {
      setGenerating(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-slate-400" />;
    }
  };

  const getTrainingTypeBadge = (type: string) => {
    const config = {
      online: { label: '在线课程', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
      offline: { label: '线下培训', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
      workshop: { label: '工作坊', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
      mentorship: { label: '导师制', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
    };
    return config[type as keyof typeof config] || { label: type, color: '' };
  };

  return (
    <div className="space-y-6">
      {/* 生成按钮 */}
      {!generatedIDP && !generating && (
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="text-center">
              <Brain className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                AI 生成个人发展计划
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                基于员工绩效、潜力和技能差距，智能生成个性化的发展路径、培训推荐和指导建议
              </p>
              <Button
                onClick={generateIDP}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                生成 IDP
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 生成中 */}
      {generating && (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <CardContent className="p-12">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 text-purple-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                AI 正在分析...
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                正在基于员工数据生成个性化发展计划
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 错误提示 */}
      {error && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                  生成失败
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error.message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 生成的 IDP */}
      {generatedIDP && (
        <div className="space-y-6">
          {/* 顶部信息 */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    个人发展计划 (IDP)
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    员工: {generatedIDP.employeeName} · {generatedIDP.currentPosition}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    置信度: {generatedIDP.confidence}%
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    导出
                  </Button>
                  <Button size="sm" onClick={() => onSave?.(generatedIDP)}>
                    <Save className="h-4 w-4 mr-2" />
                    保存
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    总体目标
                  </p>
                  <p className="text-slate-900 dark:text-slate-100">
                    {generatedIDP.overallGoal}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      时间范围
                    </p>
                    <p className="text-slate-900 dark:text-slate-100">
                      {generatedIDP.timeframe}
                    </p>
                  </div>
                  {generatedIDP.targetPosition && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        目标职位
                      </p>
                      <p className="text-slate-900 dark:text-slate-100">
                        {generatedIDP.targetPosition}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 技能差距分析 */}
          {generatedIDP.skillsGap && generatedIDP.skillsGap.length > 0 && (
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  技能差距分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {generatedIDP.skillsGap.map((gap, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {gap.skill}
                          </span>
                          <Badge className={getPriorityColor(gap.priority)}>
                            {gap.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-slate-600 dark:text-slate-400">
                            当前: {gap.currentLevel}%
                          </span>
                          <ArrowRight className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-900 dark:text-slate-100 font-medium">
                            目标: {gap.targetLevel}%
                          </span>
                        </div>
                      </div>
                      <div className="relative">
                        <Progress value={gap.currentLevel} className="h-2" />
                        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600" style={{ width: `${gap.targetLevel}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 发展目标 */}
          {generatedIDP.developments && generatedIDP.developments.length > 0 && (
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-5 w-5 text-purple-600" />
                  发展目标 ({generatedIDP.developments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {generatedIDP.developments.map((dev) => (
                    <div key={dev.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(dev.currentStatus)}
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                              {dev.goal}
                            </h4>
                            <Badge className={getPriorityColor(dev.priority)}>
                              {dev.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            目标日期: {dev.targetDate}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {dev.progress}%
                          </p>
                        </div>
                      </div>

                      <Progress value={dev.progress} className="mb-3" />

                      {dev.milestones && dev.milestones.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-slate-600 dark:text-slate-400">里程碑:</p>
                          {dev.milestones.map((milestone) => (
                            <div key={milestone.id} className="flex items-center gap-2 text-sm">
                              {milestone.completed ? (
                                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 flex-shrink-0" />
                              )}
                              <span className={milestone.completed ? 'text-slate-900 dark:text-slate-100 line-through' : 'text-slate-600 dark:text-slate-400'}>
                                {milestone.title}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-500 ml-auto">
                                {milestone.dueDate}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 推荐培训 */}
          {generatedIDP.trainings && generatedIDP.trainings.length > 0 && (
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  推荐培训 ({generatedIDP.trainings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {generatedIDP.trainings.map((training) => {
                    const typeBadge = getTrainingTypeBadge(training.type);
                    return (
                      <div key={training.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                                {training.title}
                              </h4>
                              <Badge className={typeBadge.color}>
                                {typeBadge.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                              <span>时长: {training.duration}</span>
                              {training.provider && <span>提供方: {training.provider}</span>}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline">
                              相关度: {training.relevanceScore}%
                            </Badge>
                            <Button size="sm" variant="outline">
                              查看详情
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 指导人建议 */}
          {generatedIDP.mentor && (
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-5 w-5 text-orange-600" />
                  指导人建议
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {generatedIDP.mentor.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                        {generatedIDP.mentor.name}
                      </h4>
                      <Badge variant="outline">{generatedIDP.mentor.position}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {generatedIDP.mentor.department}
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <span className="font-medium">推荐理由:</span> {generatedIDP.mentor.reason}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    发送邀请
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
