'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Send,
  Play,
  Pause,
  RotateCcw,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Sparkles,
  Clock,
  Star
} from 'lucide-react';

export interface InterviewQuestion {
  id: string;
  question: string;
  type: 'behavioral' | 'technical' | 'situational' | 'cultural';
  category: string;
  timeLimit?: number;
  answer?: string;
  evaluation?: {
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  };
}

export interface InterviewSession {
  id: string;
  candidateId: string;
  candidateName: string;
  position: string;
  startTime: string;
  duration?: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  currentQuestionIndex: number;
  questions: InterviewQuestion[];
  overallScore?: number;
  summary?: string;
  recommendation?: 'hire' | 'consider' | 'reject';
}

interface AIInterviewerProps {
  session: InterviewSession;
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onEnd?: () => void;
  onSubmitAnswer?: (questionId: string, answer: string) => void;
  onNextQuestion?: () => void;
}

export function AIInterviewer({
  session,
  onStart,
  onPause,
  onResume,
  onEnd,
  onSubmitAnswer,
  onNextQuestion,
}: AIInterviewerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isThinking, setIsThinking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showEvaluation, setShowEvaluation] = useState(false);

  const currentQuestion = session.questions[session.currentQuestionIndex];
  const progress = ((session.currentQuestionIndex + 1) / session.questions.length) * 100;

  useEffect(() => {
    if (currentQuestion?.timeLimit && session.status === 'in_progress') {
      setTimeRemaining(currentQuestion.timeLimit);
    }
  }, [currentQuestion, session.status]);

  useEffect(() => {
    if (timeRemaining > 0 && session.status === 'in_progress') {
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, session.status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    onStart?.();
  };

  const handlePause = () => {
    onPause?.();
  };

  const handleResume = () => {
    onResume?.();
  };

  const handleEnd = () => {
    onEnd?.();
  };

  const handleSubmitAnswer = () => {
    if (currentAnswer.trim()) {
      setIsThinking(true);
      onSubmitAnswer?.(currentQuestion.id, currentAnswer);
      setTimeout(() => {
        setIsThinking(false);
        setShowEvaluation(true);
      }, 2000);
    }
  };

  const handleNextQuestion = () => {
    setShowEvaluation(false);
    setCurrentAnswer('');
    onNextQuestion?.();
  };

  const getQuestionTypeBadge = (type: string) => {
    const config = {
      behavioral: { label: '行为面试', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
      technical: { label: '技术面试', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
      situational: { label: '情境面试', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
      cultural: { label: '文化匹配', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
    };
    return config[type as keyof typeof config] || { label: type, color: '' };
  };

  const getRecommendationBadge = (recommendation?: string) => {
    if (!recommendation) return null;
    
    const config = {
      hire: { label: '强烈推荐', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', icon: CheckCircle },
      consider: { label: '考虑录用', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', icon: AlertCircle },
      reject: { label: '不推荐', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', icon: XCircle },
    };
    
    const { label, color, icon: Icon } = config[recommendation as keyof typeof config];
    return (
      <Badge className={color}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* 顶部信息栏 */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {session.candidateName}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {session.position}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Clock className="h-4 w-4" />
                <span>进度: {session.currentQuestionIndex + 1} / {session.questions.length}</span>
              </div>
              <Progress value={progress} className="w-32" />
              
              {session.status === 'not_started' && (
                <Button onClick={handleStart}>
                  <Play className="h-4 w-4 mr-2" />
                  开始面试
                </Button>
              )}
              
              {session.status === 'in_progress' && (
                <>
                  <Button variant="outline" onClick={handlePause}>
                    <Pause className="h-4 w-4 mr-2" />
                    暂停
                  </Button>
                  <Button variant="destructive" onClick={handleEnd}>
                    <PhoneOff className="h-4 w-4 mr-2" />
                    结束
                  </Button>
                </>
              )}
              
              {session.status === 'paused' && (
                <>
                  <Button onClick={handleResume}>
                    <Play className="h-4 w-4 mr-2" />
                    继续
                  </Button>
                  <Button variant="destructive" onClick={handleEnd}>
                    <PhoneOff className="h-4 w-4 mr-2" />
                    结束
                  </Button>
                </>
              )}

              {session.status === 'completed' && (
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  导出报告
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 主内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：视频和问题 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 视频区域 */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative">
                {videoEnabled ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-20 w-20 text-slate-600" />
                  </div>
                )}
                
                {/* 视频控制按钮 */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    disabled={session.status === 'completed'}
                  >
                    {audioEnabled ? (
                      <Mic className="h-5 w-5" />
                    ) : (
                      <MicOff className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setVideoEnabled(!videoEnabled)}
                    disabled={session.status === 'completed'}
                  >
                    {videoEnabled ? (
                      <Video className="h-5 w-5" />
                    ) : (
                      <VideoOff className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant={isRecording ? 'destructive' : 'secondary'}
                    onClick={() => setIsRecording(!isRecording)}
                    disabled={session.status === 'completed'}
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                </div>

                {/* 录制状态指示 */}
                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    录制中
                  </div>
                )}

                {/* AI 分析状态 */}
                {isThinking && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    AI 分析中...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 当前问题 */}
          {session.status !== 'not_started' && currentQuestion && (
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getQuestionTypeBadge(currentQuestion.type).color}>
                        {getQuestionTypeBadge(currentQuestion.type).label}
                      </Badge>
                      <Badge variant="outline">{currentQuestion.category}</Badge>
                    </div>
                    <CardTitle className="text-lg">
                      问题 {session.currentQuestionIndex + 1}
                    </CardTitle>
                  </div>
                  {currentQuestion.timeLimit && timeRemaining > 0 && !showEvaluation && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Clock className="h-4 w-4" />
                      <span className={timeRemaining < 30 ? 'text-red-600 font-medium' : ''}>
                        {formatTime(timeRemaining)}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-900 dark:text-slate-100 mb-4">
                  {currentQuestion.question}
                </p>

                {!showEvaluation && session.status === 'in_progress' && (
                  <>
                    <Textarea
                      placeholder="请输入您的回答，或点击麦克风开始语音回答..."
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      rows={4}
                      className="mb-4"
                    />
                    <div className="flex items-center justify-between">
                      <Button variant="outline">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        重录
                      </Button>
                      <Button onClick={handleSubmitAnswer}>
                        <Send className="h-4 w-4 mr-2" />
                        提交回答
                      </Button>
                    </div>
                  </>
                )}

                {/* AI 评价 */}
                {showEvaluation && currentQuestion.evaluation && (
                  <div className="space-y-4 mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                        AI 评分与分析
                      </h4>
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 text-yellow-600 fill-yellow-600" />
                        <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                          {currentQuestion.evaluation.score}/100
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      {currentQuestion.evaluation.feedback}
                    </p>

                    {currentQuestion.evaluation.strengths && currentQuestion.evaluation.strengths.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
                          优点:
                        </p>
                        <ul className="space-y-1">
                          {currentQuestion.evaluation.strengths.map((strength, index) => (
                            <li key={index} className="text-sm text-purple-700 dark:text-purple-300 flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentQuestion.evaluation.improvements && currentQuestion.evaluation.improvements.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
                          改进建议:
                        </p>
                        <ul className="space-y-1">
                          {currentQuestion.evaluation.improvements.map((improvement, index) => (
                            <li key={index} className="text-sm text-purple-700 dark:text-purple-300 flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button onClick={handleNextQuestion} className="w-full">
                      {session.currentQuestionIndex < session.questions.length - 1 ? '下一题' : '完成面试'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 面试结束总结 */}
          {session.status === 'completed' && (
            <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    面试完成
                  </h3>
                  
                  {session.overallScore !== undefined && (
                    <div className="mb-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        综合评分
                      </p>
                      <div className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                        {session.overallScore}
                        <span className="text-xl text-slate-600 dark:text-slate-400">/100</span>
                      </div>
                    </div>
                  )}

                  {session.recommendation && (
                    <div className="mb-4">
                      {getRecommendationBadge(session.recommendation)}
                    </div>
                  )}

                  {session.summary && (
                    <p className="text-slate-700 dark:text-slate-300 text-sm max-w-2xl mx-auto">
                      {session.summary}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 右侧：问题列表 */}
        <div className="lg:col-span-1">
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 sticky top-4">
            <CardHeader>
              <CardTitle className="text-base">问题列表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {session.questions.map((question, index) => {
                  const isCurrent = index === session.currentQuestionIndex;
                  const isCompleted = index < session.currentQuestionIndex;
                  
                  return (
                    <div
                      key={question.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        isCurrent
                          ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                          : isCompleted
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          Q{index + 1}
                        </span>
                        {isCompleted && question.evaluation && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-600 fill-yellow-600" />
                            <span className="text-xs font-semibold">
                              {question.evaluation.score}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {question.question}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {getQuestionTypeBadge(question.type).label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
