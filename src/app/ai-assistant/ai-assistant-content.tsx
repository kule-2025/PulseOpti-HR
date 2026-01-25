'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/loading';
import {
  Sparkles,
  Target,
  Users,
  TrendingDown,
  FileText,
  Brain,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

// 性能优化工具
import { useLocalStorage, useAsync } from '@/hooks/use-performance';
import { fetchWithCache } from '@/lib/cache/memory-cache';
import { get, post } from '@/lib/request/request';
import monitor from '@/lib/performance/monitor';
import { cachedGet } from '@/lib/api-helper';

interface PositionProfile {
  position: string;
  department: string;
  responsibilities: string[];
  requirements: string[];
  skills: Array<{ name: string; level: number }>;
  salaryRange: string;
  careerPath: string[];
}

interface TalentGridEmployee {
  name: string;
  department: string;
  position: string;
  performance: number;
  potential: number;
}

interface AIResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export default function AIAssistantContent() {
  const [activeTab, setActiveTab] = useLocalStorage('ai-assistant-tab', 'position-profile');
  const [isGenerating, setIsGenerating] = useState(false);

  // 加载岗位画像
  const {
    data: positionProfile,
    loading: profileLoading,
    error: profileError,
    execute: fetchProfile,
  } = useAsync<PositionProfile>();

  // 加载人才盘点
  const {
    data: talentGrid = [],
    loading: gridLoading,
    error: gridError,
    execute: fetchTalentGrid,
  } = useAsync<TalentGridEmployee[]>();

  const [inputQuery, setInputQuery] = useState('');

  const loadPositionProfile = useCallback(async (): Promise<PositionProfile> => {
    try {
      const data = await cachedGet<PositionProfile>(
        '/api/ai/position-profile',
        'position-profile',
        10 * 60 * 1000
      );

      return data || {
        position: '暂无数据',
        department: '-',
        responsibilities: [],
        requirements: [],
        skills: [],
        salaryRange: '-',
        careerPath: [],
      };
    } catch (err) {
      console.error('加载岗位画像失败:', err);
      monitor.trackError('loadPositionProfile', err as Error);
      throw err;
    }
  }, []);

  const loadTalentGrid = useCallback(async (): Promise<TalentGridEmployee[]> => {
    try {
      const data = await cachedGet<TalentGridEmployee[]>(
        '/api/ai/talent-grid',
        'talent-grid',
        5 * 60 * 1000
      );

      return data || [];
    } catch (err) {
      console.error('加载人才盘点失败:', err);
      monitor.trackError('loadTalentGrid', err as Error);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchProfile(loadPositionProfile);
    fetchTalentGrid(loadTalentGrid);
  }, [fetchProfile, fetchTalentGrid, loadPositionProfile, loadTalentGrid]);

  const handleGenerate = useCallback(async () => {
    if (!inputQuery.trim()) return;

    setIsGenerating(true);
    try {
      const response = await post<AIResponse>('/api/ai/generate', {
        query: inputQuery,
        type: activeTab,
      });

      if (response.success && response.data) {
        // 处理生成结果
        console.log('生成结果:', response.data);
      }
    } catch (err) {
      console.error('生成失败:', err);
      monitor.trackError('aiGenerate', err as Error);
    } finally {
      setIsGenerating(false);
    }
  }, [inputQuery, activeTab]);

  if (profileError || gridError) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="h-5 w-5" />
              <span>加载失败: {(profileError || gridError)?.message}</span>
            </div>
            <Button onClick={() => {
              fetchProfile(loadPositionProfile);
              fetchTalentGrid(loadTalentGrid);
            }} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI助手</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            智能HR助手，提供岗位画像、人才盘点等AI分析
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <span className="text-sm text-gray-600 dark:text-gray-400">AI驱动</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="position-profile">岗位画像</TabsTrigger>
          <TabsTrigger value="talent-grid">人才盘点</TabsTrigger>
          <TabsTrigger value="ai-chat">AI问答</TabsTrigger>
        </TabsList>

        <TabsContent value="position-profile" className="space-y-6">
          {profileLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : positionProfile ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {positionProfile.position}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge>{positionProfile.department}</Badge>
                    <Badge variant="outline">{positionProfile.salaryRange}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      岗位职责
                    </h3>
                    <ul className="space-y-2">
                      {positionProfile.responsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      任职要求
                    </h3>
                    <ul className="space-y-2">
                      {positionProfile.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      技能要求
                    </h3>
                    <div className="space-y-3">
                      {positionProfile.skills.map((skill) => (
                        <div key={skill.name}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{skill.name}</span>
                            <span className="text-sm text-gray-600">{skill.level}%</span>
                          </div>
                          <Progress value={skill.level} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingDown className="h-4 w-4" />
                      职业发展路径
                    </h3>
                    <div className="flex items-center gap-2">
                      {positionProfile.careerPath.map((path, i) => (
                        <div key={i} className="flex items-center">
                          <Badge>{path}</Badge>
                          {i < positionProfile.careerPath.length - 1 && (
                            <Zap className="h-4 w-4 text-gray-400 mx-2" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">暂无岗位画像数据</div>
          )}
        </TabsContent>

        <TabsContent value="talent-grid" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                人才盘点九宫格
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gridLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : !talentGrid || talentGrid.length === 0 ? (
                <div className="text-center py-12 text-gray-500">暂无人才盘点数据</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  {talentGrid.map((employee, index) => (
                    <Card
                      key={index}
                      className={`border-2 ${
                        employee.performance >= 80 && employee.potential >= 80
                          ? 'border-purple-300 bg-purple-50 dark:bg-purple-900/20'
                          : employee.performance >= 60 && employee.potential >= 60
                          ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20'
                          : employee.performance < 60 && employee.potential < 60
                          ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-300'
                      }`}
                    >
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-lg font-semibold">{employee.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {employee.department} · {employee.position}
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>绩效</span>
                            <span className="font-medium">{employee.performance}</span>
                          </div>
                          <Progress value={employee.performance} className="h-2" />
                          <div className="flex items-center justify-between text-sm">
                            <span>潜力</span>
                            <span className="font-medium">{employee.potential}</span>
                          </div>
                          <Progress value={employee.potential} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-chat" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI问答
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Textarea
                  placeholder="请输入您的问题，例如：生成产品经理岗位画像、分析销售团队人才分布等..."
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  rows={4}
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !inputQuery.trim()}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    开始生成
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>常用功能</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <Button
                  variant="outline"
                  onClick={() => setInputQuery('生成高级产品经理岗位画像')}
                >
                  <Target className="h-4 w-4 mr-2" />
                  生成岗位画像
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInputQuery('分析公司人才盘点九宫格')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  分析人才盘点
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInputQuery('推荐继任计划候选人')}
                >
                  <TrendingDown className="h-4 w-4 mr-2" />
                  继任计划推荐
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInputQuery('分析员工离职风险')}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  离职风险分析
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
