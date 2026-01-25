'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/loading';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Send,
  Pause,
  Play,
  User,
  Briefcase,
  History,
  Star,
  RefreshCw,
} from 'lucide-react';

// 性能优化工具
import { useLocalStorage, useAsync } from '@/hooks/use-performance';
import { fetchWithCache } from '@/lib/cache/memory-cache';
import { get, post } from '@/lib/request/request';
import monitor from '@/lib/performance/monitor';

interface InterviewQuestion {
  id: number;
  question: string;
  type: string;
  timeLimit: number;
}

interface InterviewSession {
  id: string;
  candidateName: string;
  position: string;
  status: 'pending' | 'in_progress' | 'completed';
  currentQuestionIndex: number;
  questions: InterviewQuestion[];
  duration: number;
}

export default function SmartInterviewContent() {
  const [activeTab, setActiveTab] = useLocalStorage('smart-interview-tab', 'setup');
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const {
    data: currentSession,
    loading: sessionLoading,
    error: sessionError,
    execute: fetchSession,
  } = useAsync<InterviewSession>();

  const [candidateName, setCandidateName] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [interviewHistory, setInterviewHistory] = useState<any[]>([]);

  const loadSession = useCallback(async (): Promise<InterviewSession | null> => {
    try {
      const cacheKey = 'interview-session';
      const session = await fetchWithCache<InterviewSession | null>(cacheKey, async () => {
        const response = await get<{ success: boolean; data?: InterviewSession }>(
          '/api/interview/session'
        );

        return response.data || null;
      }, 5 * 60 * 1000);

      return session;
    } catch (err) {
      console.error('加载面试会话失败:', err);
      monitor.trackError('loadInterviewSession', err as Error);
      throw err;
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const response = await get<{ success: boolean; data?: any[] }>(
        '/api/interview/history'
      );

      if (response.success && response.data) {
        setInterviewHistory(response.data);
      }
    } catch (err) {
      console.error('加载面试历史失败:', err);
      monitor.trackError('loadInterviewHistory', err as Error);
    }
  }, []);

  useEffect(() => {
    fetchSession(loadSession);
    loadHistory();
  }, [fetchSession, loadSession, loadHistory]);

  const handleStartInterview = useCallback(async () => {
    try {
      const response = await post('/api/interview/start', {
        candidateName,
        position: selectedPosition,
      });

      if (response.success) {
        fetchSession(loadSession);
      }
    } catch (err) {
      console.error('启动面试失败:', err);
    }
  }, [candidateName, selectedPosition, fetchSession, loadSession]);

  const toggleVideo = useCallback(async () => {
    try {
      if (isVideoEnabled) {
        const stream = videoRef.current?.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }
      setIsVideoEnabled(!isVideoEnabled);
    } catch (err) {
      console.error('切换摄像头失败:', err);
    }
  }, [isVideoEnabled]);

  const toggleMic = useCallback(async () => {
    try {
      if (isMicEnabled) {
        // 停止麦克风
      } else {
        // 启动麦克风
      }
      setIsMicEnabled(!isMicEnabled);
    } catch (err) {
      console.error('切换麦克风失败:', err);
    }
  }, [isMicEnabled]);

  const getScoreColor = useCallback((score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }, []);

  const error = sessionError;

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="h-5 w-5" />
              <span>加载失败: {error.message}</span>
            </div>
            <Button onClick={() => fetchSession(loadSession)} variant="outline">
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">智能面试</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            AI驱动的智能面试系统
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <span className="text-sm text-gray-600 dark:text-gray-400">AI增强</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="setup">面试设置</TabsTrigger>
          <TabsTrigger value="interview">进行中</TabsTrigger>
          <TabsTrigger value="history">面试历史</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                创建新面试
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>候选人姓名 *</Label>
                <Input
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="请输入候选人姓名"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>应聘职位 *</Label>
                <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="请选择应聘职位" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frontend">前端开发工程师</SelectItem>
                    <SelectItem value="backend">后端开发工程师</SelectItem>
                    <SelectItem value="product">产品经理</SelectItem>
                    <SelectItem value="designer">UI/UX设计师</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleStartInterview} className="w-full">
                <Sparkles className="h-4 w-4 mr-2" />
                开始面试
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>设备测试</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="mb-2 block">摄像头</Label>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                    {isVideoEnabled ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <VideoOff className="h-12 w-12 mx-auto mb-2" />
                        <p>摄像头未开启</p>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={toggleVideo}
                    variant="outline"
                    className="w-full mt-2"
                  >
                    {isVideoEnabled ? (
                      <>
                        <VideoOff className="h-4 w-4 mr-2" />
                        关闭摄像头
                      </>
                    ) : (
                      <>
                        <Video className="h-4 w-4 mr-2" />
                        开启摄像头
                      </>
                    )}
                  </Button>
                </div>
                <div>
                  <Label className="mb-2 block">麦克风</Label>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 aspect-video flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MicOff className="h-12 w-12 mx-auto mb-2" />
                      <p>麦克风{isMicEnabled ? '已开启' : '未开启'}</p>
                    </div>
                  </div>
                  <Button
                    onClick={toggleMic}
                    variant="outline"
                    className="w-full mt-2"
                  >
                    {isMicEnabled ? (
                      <>
                        <MicOff className="h-4 w-4 mr-2" />
                        关闭麦克风
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        开启麦克风
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interview" className="space-y-6">
          {sessionLoading ? (
            <Card>
              <CardContent className="pt-6">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ) : !currentSession ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-gray-500">
                  <Briefcase className="h-12 w-12 mx-auto mb-4" />
                  <p>暂无进行中的面试</p>
                  <Button onClick={() => setActiveTab('setup')} variant="outline" className="mt-4">
                    创建新面试
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {currentSession.candidateName}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge>{currentSession.position}</Badge>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                        {currentSession.status === 'in_progress' ? '进行中' : '等待中'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentSession.questions.map((question, index) => (
                        <Card key={question.id} className={
                          index === currentSession.currentQuestionIndex
                            ? 'border-blue-500'
                            : 'border-gray-200'
                        }>
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                index < currentSession.currentQuestionIndex
                                  ? 'bg-green-100 text-green-700'
                                  : index === currentSession.currentQuestionIndex
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                {index < currentSession.currentQuestionIndex ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  <span>{index + 1}</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{question.question}</p>
                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                  <Clock className="h-4 w-4" />
                                  <span>{question.timeLimit}分钟</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>控制面板</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">摄像头</span>
                      <Button
                        onClick={toggleVideo}
                        variant="outline"
                        size="sm"
                      >
                        {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">麦克风</span>
                      <Button
                        onClick={toggleMic}
                        variant="outline"
                        size="sm"
                      >
                        {isMicEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">用时</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {Math.floor(currentSession.duration / 60)}:{(currentSession.duration % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                面试历史
              </CardTitle>
            </CardHeader>
            <CardContent>
              {interviewHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-500">暂无面试记录</div>
              ) : (
                <div className="space-y-4">
                  {interviewHistory.map((interview) => (
                    <Card key={interview.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold">{interview.candidateName}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {interview.position}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {interview.interviewDate}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">综合评分</div>
                            <div className={`text-2xl font-bold ${getScoreColor(interview.overallScore)}`}>
                              {interview.overallScore}
                            </div>
                            <Badge className="mt-2">
                              {interview.recommendation === 'recommended' ? '推荐' :
                               interview.recommendation === 'consider' ? '考虑' : '不推荐'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
