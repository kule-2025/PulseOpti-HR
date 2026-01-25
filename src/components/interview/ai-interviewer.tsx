"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  Send,
  RotateCcw,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Brain,
  TrendingUp,
  Clock,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Star,
  PlayCircle,
  PauseCircle,
  Volume2,
} from 'lucide-react';
import { cn } from '@/lib/theme';

// 面试问题类型
export interface InterviewQuestion {
  id: string;
  type: 'technical' | 'behavioral' | 'situational' | 'culture';
  question: string;
  keywords: string[];
  expectedAnswers: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // 秒
  category: string;
}

// AI评分维度
export interface ScoringCriteria {
  id: string;
  name: string;
  description: string;
  weight: number; // 权重
  score: number; // 0-100
  feedback: string;
}

// 面试记录
export interface InterviewSession {
  id: string;
  candidateName: string;
  position: string;
  questions: InterviewQuestion[];
  answers: {
    questionId: string;
    answer: string;
    transcript?: string; // 语音转文字
    audioUrl?: string;
    duration: number;
    timestamp: Date;
  }[];
  overallScore: number;
  scoringCriteria: ScoringCriteria[];
  aiRecommendation: {
    hire: boolean;
    confidence: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    nextSteps: string[];
  };
  status: 'in_progress' | 'completed' | 'reviewed';
  createdAt: Date;
  completedAt?: Date;
}

// 默认面试问题库
const DEFAULT_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'q1',
    type: 'behavioral',
    question: '请做一个简短的自我介绍，包括你的职业背景和为什么选择申请这个职位',
    keywords: ['经验', '技能', '动机', '目标', '成就'],
    expectedAnswers: ['清晰的职业路径', '相关的技能匹配', '强烈的求职动机'],
    difficulty: 'easy',
    timeLimit: 120,
    category: '基础能力',
  },
  {
    id: 'q2',
    type: 'technical',
    question: '请描述一下你最引以为豪的项目，以及你在其中扮演的角色和遇到的技术挑战',
    keywords: ['项目', '技术', '挑战', '解决方案', '成果'],
    expectedAnswers: ['技术能力突出', '解决问题能力强', '有成果意识'],
    difficulty: 'medium',
    timeLimit: 180,
    category: '技术能力',
  },
  {
    id: 'q3',
    type: 'situational',
    question: '如果你在项目中与团队成员发生意见分歧，你会如何处理?',
    keywords: ['沟通', '合作', '协商', '妥协', '领导'],
    expectedAnswers: ['沟通能力', '团队协作', '冲突解决'],
    difficulty: 'medium',
    timeLimit: 150,
    category: '团队协作',
  },
  {
    id: 'q4',
    type: 'behavioral',
    question: '请分享一个你失败的案例，以及你从中获得了什么教训',
    keywords: ['失败', '教训', '成长', '反思', '改进'],
    expectedAnswers: ['诚实面对', '深刻反思', '持续成长'],
    difficulty: 'hard',
    timeLimit: 180,
    category: '成长思维',
  },
  {
    id: 'q5',
    type: 'culture',
    question: '你理想的工作环境是什么样的?你希望从公司获得什么?',
    keywords: ['环境', '文化', '发展', '挑战', '团队'],
    expectedAnswers: ['价值观匹配', '成长诉求', '期望合理'],
    difficulty: 'medium',
    timeLimit: 120,
    category: '文化匹配',
  },
];

interface AIInterviewerProps {
  candidateName?: string;
  position?: string;
  questions?: InterviewQuestion[];
  onInterviewComplete?: (session: InterviewSession) => void;
  onSaveDraft?: (session: Partial<InterviewSession>) => void;
}

export default function AIInterviewer({
  candidateName = '候选人',
  position = '职位',
  questions = DEFAULT_QUESTIONS,
  onInterviewComplete,
  onSaveDraft,
}: AIInterviewerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(questions[0].timeLimit);
  const [transcript, setTranscript] = useState('');
  const [answers, setAnswers] = useState<InterviewSession['answers']>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 模拟AI评分结果
  const [scoringResults, setScoringResults] = useState<InterviewSession>({
    id: `session_${Date.now()}`,
    candidateName,
    position,
    questions,
    answers: [],
    overallScore: 0,
    scoringCriteria: [],
    aiRecommendation: {
      hire: false,
      confidence: 0,
      summary: '',
      strengths: [],
      weaknesses: [],
      nextSteps: [],
    },
    status: 'in_progress',
    createdAt: new Date(),
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  // 初始化语音识别
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'zh-CN';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // 计时器
  useEffect(() => {
    if (isRecording && !isPaused && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused, timeRemaining]);

  // 摄像头控制
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };

    const stopCamera = () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };

    if (isVideoEnabled) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isVideoEnabled]);

  // 开始录音
  const startRecording = useCallback(async () => {
    try {
      setIsRecording(true);
      setIsPaused(false);

      // 启动语音识别
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      // 启动媒体录制器
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      const chunks: Blob[] = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(blob);
        saveAnswer(audioUrl);
      };

      mediaRecorderRef.current.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  }, []);

  // 停止录音
  const stopRecording = useCallback(() => {
    setIsRecording(false);
    setTranscript('');

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  // 保存答案
  const saveAnswer = useCallback((audioUrl?: string) => {
    const answer: InterviewSession['answers'][0] = {
      questionId: currentQuestion.id,
      answer: transcript,
      transcript: transcript,
      audioUrl: audioUrl,
      duration: currentQuestion.timeLimit - timeRemaining,
      timestamp: new Date(),
    };

    setAnswers(prev => [...prev, answer]);
  }, [currentQuestion, transcript, timeRemaining]);

  // 下一题
  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeRemaining(questions[currentQuestionIndex + 1].timeLimit);
      setTranscript('');
    } else {
      completeInterview();
    }
  }, [currentQuestionIndex, questions]);

  // 重新回答当前问题
  const redoQuestion = useCallback(() => {
    setTranscript('');
    setTimeRemaining(currentQuestion.timeLimit);
    setIsRecording(false);
    setIsPaused(false);
  }, [currentQuestion]);

  // 完成面试
  const completeInterview = useCallback(async () => {
    setIsProcessing(true);

    // 模拟AI评分处理
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 模拟评分结果
    const scoringCriteria: ScoringCriteria[] = [
      {
        id: 'c1',
        name: '技术能力',
        description: '专业知识、技能水平',
        weight: 30,
        score: 85,
        feedback: '技术基础扎实，对相关问题理解深入',
      },
      {
        id: 'c2',
        name: '沟通表达',
        description: '逻辑清晰、表达流畅',
        weight: 25,
        score: 78,
        feedback: '表达清晰，逻辑性强，可以适当提升感染力',
      },
      {
        id: 'c3',
        name: '问题解决',
        description: '分析问题、提出方案',
        weight: 20,
        score: 82,
        feedback: '能够快速抓住问题核心，提出合理解决方案',
      },
      {
        id: 'c4',
        name: '团队协作',
        description: '合作意识、冲突处理',
        weight: 15,
        score: 88,
        feedback: '团队意识强，善于协调各方',
      },
      {
        id: 'c5',
        name: '文化匹配',
        description: '价值观契合、发展潜力',
        weight: 10,
        score: 75,
        feedback: '价值观较为匹配，有明确的职业规划',
      },
    ];

    const overallScore = scoringCriteria.reduce((sum, criterion) => {
      return sum + (criterion.score * criterion.weight / 100);
    }, 0);

    const results: InterviewSession = {
      id: `session_${Date.now()}`,
      candidateName,
      position,
      questions,
      answers,
      overallScore,
      scoringCriteria,
      aiRecommendation: {
        hire: overallScore >= 80,
        confidence: Math.min(95, overallScore + 10),
        summary: overallScore >= 80
          ? `${candidateName}展现了良好的综合素质，技术能力扎实，沟通表达清晰，适合加入团队。`
          : `${candidateName}在某些方面还有提升空间，建议进一步考察。`,
        strengths: ['技术基础扎实', '逻辑思维清晰', '团队协作能力强'],
        weaknesses: overallScore < 80 ? ['经验相对不足', '需要提升表达感染力'] : [],
        nextSteps: [
          '安排技术负责人进行深度面试',
          '进行团队协作模拟测试',
          '讨论职业发展规划',
        ],
      },
      status: 'completed',
      createdAt: new Date(),
      completedAt: new Date(),
    };

    setScoringResults(results);
    setIsProcessing(false);
    setInterviewCompleted(true);
    setShowResults(true);
    onInterviewComplete?.(results);
  }, [answers, candidateName, position, questions, onInterviewComplete]);

  // 开始面试
  const startInterview = useCallback(() => {
    setInterviewStarted(true);
  }, []);

  // 进度计算
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 面试头部 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-purple-600" />
                  AI智能面试官
                </CardTitle>
                <CardDescription className="mt-1">
                  {candidateName} - {position} 面试
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">面试进度</p>
                  <p className="text-2xl font-bold">{currentQuestionIndex + 1} / {questions.length}</p>
                </div>
                <Progress value={progress} className="w-32" />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 未开始面试 */}
        {!interviewStarted && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <PlayCircle className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">AI智能面试准备就绪</h3>
                <p className="text-muted-foreground mb-6">
                  面试包含 {questions.length} 个问题，预计用时约{Math.round(questions.reduce((sum, q) => sum + q.timeLimit, 0) / 60)}分钟
                </p>
                <div className="space-y-4 max-w-md mx-auto text-left">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">AI语音识别</p>
                      <p className="text-sm text-muted-foreground">实时转录你的回答，确保准确性</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">智能评分</p>
                      <p className="text-sm text-muted-foreground">多维度评估，生成详细分析报告</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">即时反馈</p>
                      <p className="text-sm text-muted-foreground">面试结束后立即获取评估结果</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <Button size="lg" onClick={startInterview} className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <PlayCircle className="h-5 w-5 mr-2" />
                    开始面试
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 面试进行中 */}
        {interviewStarted && !showResults && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 主面试区域 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 视频区域 */}
              <Card>
                <CardContent className="pt-6">
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                    {isVideoEnabled ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <UserCircle className="h-32 w-32 text-slate-600" />
                      </div>
                    )}

                    {/* 时间显示 */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full">
                      <Clock className="h-4 w-4 text-white" />
                      <span className={cn(
                        "font-mono font-bold text-white",
                        timeRemaining <= 30 && "text-red-500"
                      )}>
                        {formatTime(timeRemaining)}
                      </span>
                    </div>

                    {/* 录音状态 */}
                    {isRecording && (
                      <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-white text-sm font-medium">录音中</span>
                      </div>
                    )}

                    {/* 暂停状态 */}
                    {isPaused && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <PauseCircle className="h-20 w-20 text-white" />
                      </div>
                    )}
                  </div>

                  {/* 控制按钮 */}
                  <div className="flex justify-center gap-4 mt-4">
                    <Button
                      variant={isVideoEnabled ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                    >
                      {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                    </Button>
                    {!isRecording ? (
                      <Button
                        size="icon"
                        onClick={startRecording}
                        disabled={isPaused}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Mic className="h-5 w-5" />
                      </Button>
                    ) : (
                      <Button
                        size="icon"
                        onClick={stopRecording}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <MicOff className="h-5 w-5" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsPaused(!isPaused)}
                      disabled={!isRecording}
                    >
                      {isPaused ? <PlayCircle className="h-5 w-5" /> : <PauseCircle className="h-5 w-5" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 当前问题 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        问题 {currentQuestionIndex + 1}
                      </CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{currentQuestion.category}</Badge>
                        <Badge variant={currentQuestion.difficulty === 'easy' ? 'secondary' : currentQuestion.difficulty === 'medium' ? 'default' : 'destructive'}>
                          {currentQuestion.difficulty === 'easy' ? '简单' : currentQuestion.difficulty === 'medium' ? '中等' : '困难'}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant="outline">{formatTime(currentQuestion.timeLimit)}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed">{currentQuestion.question}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-sm text-muted-foreground">关键词:</span>
                    {currentQuestion.keywords.map((keyword, idx) => (
                      <Badge key={idx} variant="secondary">{keyword}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 答案输入 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">你的回答</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="AI将自动转录你的语音回答，也可以手动编辑..."
                    rows={8}
                    disabled={!isRecording && !transcript}
                  />
                  {isRecording && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Volume2 className="h-4 w-4" />
                      <span>正在识别语音...</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 操作按钮 */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={redoQuestion}
                  disabled={!transcript}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  重新回答
                </Button>
                <Button
                  onClick={nextQuestion}
                  disabled={!transcript}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {currentQuestionIndex < questions.length - 1 ? '下一题' : '完成面试'}
                  <Send className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* 侧边栏 */}
            <div className="space-y-6">
              {/* 问题列表 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">问题列表</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className={cn(
                        "p-3 rounded-lg border-2 cursor-pointer transition-all",
                        idx === currentQuestionIndex
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20"
                          : idx < currentQuestionIndex
                          ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                          : "border-slate-200 dark:border-slate-700"
                      )}
                      onClick={() => {
                        if (idx <= currentQuestionIndex) {
                          setCurrentQuestionIndex(idx);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">问题 {idx + 1}</span>
                        {idx < currentQuestionIndex ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : idx === currentQuestionIndex ? (
                          <Clock className="h-4 w-4 text-purple-600 animate-pulse" />
                        ) : (
                          <XCircle className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{q.question}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* 提示 */}
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-500">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Brain className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">AI提示</p>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        保持流畅的表达，可以适当举例说明。AI会从技术能力、沟通表达、问题解决、团队协作、文化匹配五个维度进行评分。
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* AI处理中 */}
        {isProcessing && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Brain className="h-16 w-16 text-purple-600 mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-semibold mb-2">AI正在分析面试表现</h3>
              <p className="text-muted-foreground">请稍候,这将需要几秒钟...</p>
              <Progress className="mt-6 max-w-md mx-auto" value={66} />
            </CardContent>
          </Card>
        )}

        {/* 面试结果 */}
        {showResults && (
          <div className="space-y-6">
            {/* 总体评分 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-6 w-6 text-amber-500" />
                  面试评估结果
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="relative inline-flex items-center justify-center">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-slate-200 dark:text-slate-700"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${scoringResults.overallScore * 3.52} 352`}
                          className={cn(
                            "transition-all duration-1000",
                            scoringResults.overallScore >= 80 ? "text-green-600" :
                            scoringResults.overallScore >= 60 ? "text-blue-600" : "text-orange-600"
                          )}
                        />
                      </svg>
                      <div className="absolute">
                        <span className={cn(
                          "text-4xl font-bold",
                          scoringResults.overallScore >= 80 ? "text-green-600" :
                          scoringResults.overallScore >= 60 ? "text-blue-600" : "text-orange-600"
                        )}>
                          {scoringResults.overallScore}
                        </span>
                        <span className="text-muted-foreground">分</span>
                      </div>
                    </div>
                    <p className="mt-4 font-semibold">综合评分</p>
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold">AI推荐结果</span>
                      <Badge
                        variant={scoringResults.aiRecommendation.hire ? 'default' : 'secondary'}
                        className={cn(
                          "text-base px-4 py-1",
                          scoringResults.aiRecommendation.hire
                            ? "bg-green-600"
                            : "bg-slate-600"
                        )}
                      >
                        {scoringResults.aiRecommendation.hire ? '建议录用' : '待定'}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {scoringResults.aiRecommendation.summary}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span>AI置信度: {scoringResults.aiRecommendation.confidence}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 详细评分 */}
            <Card>
              <CardHeader>
                <CardTitle>详细评分维度</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="criteria" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="criteria">评分维度</TabsTrigger>
                    <TabsTrigger value="analysis">AI分析</TabsTrigger>
                  </TabsList>

                  <TabsContent value="criteria">
                    <div className="space-y-4">
                      {scoringResults.scoringCriteria.map((criterion) => (
                        <div key={criterion.id}>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="font-medium">{criterion.name}</span>
                              <span className="text-sm text-muted-foreground ml-2">({criterion.weight}%)</span>
                            </div>
                            <span className="font-bold">{criterion.score}分</span>
                          </div>
                          <Progress value={criterion.score} className="mb-2" />
                          <p className="text-sm text-muted-foreground">{criterion.feedback}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="analysis">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <ThumbsUp className="h-4 w-4 text-green-600" />
                          优势
                        </h4>
                        <ul className="space-y-2">
                          {scoringResults.aiRecommendation.strengths.map((strength, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <ThumbsDown className="h-4 w-4 text-orange-600" />
                          待提升
                        </h4>
                        <ul className="space-y-2">
                          {scoringResults.aiRecommendation.weaknesses.map((weakness, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                              <span>{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-semibold mb-3">后续建议</h4>
                      <ul className="space-y-2">
                        {scoringResults.aiRecommendation.nextSteps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <Star className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <div className="flex justify-end gap-4">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                导出报告
              </Button>
              <Button
                onClick={() => {
                  setShowResults(false);
                  setInterviewStarted(false);
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                返回首页
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 用户图标
function UserCircle({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    </svg>
  );
}
