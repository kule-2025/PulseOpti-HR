'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  Sparkles,
  Mic,
  MicOff,
  Play,
  Pause,
  Send,
  MessageSquare,
  FileText,
  BarChart3,
  CheckCircle2,
  Clock,
  User,
  Building2,
  AlertCircle,
  Download,
  RefreshCw,
  Eye,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';

interface Interview {
  id: string;
  candidateId: string;
  candidateName?: string;
  jobId: string;
  jobTitle?: string;
  round: number;
  interviewerId: string;
  interviewerName?: string;
  scheduledAt: string;
  status: string;
  score?: number;
  feedback?: string;
  metadata?: any;
}

interface Candidate {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  education?: string;
  workExperience?: number;
  resumeUrl?: string;
}

interface Job {
  id: string;
  title: string;
  description?: string;
  requirements?: string;
  salaryMin?: number;
  salaryMax?: number;
}

interface Question {
  id: string;
  question: string;
  type: string;
  category: string;
  difficulty: string;
  dimension: string;
  timeLimit: number;
  evaluationCriteria: string;
  followUpQuestions: string[];
  rationale: string;
}

interface Evaluation {
  question: string;
  answer: string;
  questionType: string;
  evaluation: {
    overallScore: number;
    dimensionScores: Record<string, number>;
    strengths: string[];
    improvements: string[];
    keyObservations: string[];
    overallFeedback: string;
    recommendation: string;
    nextSteps: string[];
    tags: string[];
  };
  evaluatedAt: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'interviewer';
  content: string;
  timestamp: string;
}

export default function AIInterviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [companyId, setCompanyId] = useState<string>('');
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [report, setReport] = useState<any>(null);
  const [currentPhase, setCurrentPhase] = useState('introduction');
  const [isRecording, setIsRecording] = useState(false);
  const [interviewDuration, setInterviewDuration] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const phases = [
    { value: 'introduction', label: '开场介绍' },
    { value: 'self_introduction', label: '自我介绍' },
    { value: 'behavioral', label: '行为面试' },
    { value: 'technical', label: '技术面试' },
    { value: 'situational', label: '情景面试' },
    { value: 'cultural', label: '文化契合' },
    { value: 'closing', label: '结束阶段' },
  ];

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setCompanyId(userData.companyId || '');
    }
    loadInitialData();
  }, [companyId]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, aiResponse]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (selectedInterview?.status === 'in_progress') {
      interval = setInterval(() => {
        setInterviewDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [selectedInterview?.status]);

  const loadInitialData = async () => {
    if (!companyId) return;

    try {
      // 并行加载候选人、职位和面试记录
      const [candidatesRes, jobsRes, interviewsRes] = await Promise.all([
        fetch(`/api/recruitment/candidates?companyId=${companyId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch(`/api/jobs?companyId=${companyId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch(`/api/recruitment/interviews?companyId=${companyId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);

      if (candidatesRes.ok) {
        const data = await candidatesRes.json();
        setCandidates(data.data || []);
      }

      if (jobsRes.ok) {
        const data = await jobsRes.json();
        setJobs(data.data || []);
      }

      if (interviewsRes.ok) {
        const data = await interviewsRes.json();
        setInterviews(data.data || []);
      }
    } catch (error) {
      console.error('加载初始数据失败:', error);
      toast.error('加载数据失败');
    }
  };

  // 生成面试问题
  const handleGenerateQuestions = async () => {
    if (!selectedCandidate || !selectedJob) {
      toast.error('请选择候选人和职位');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/interview/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          candidateId: selectedCandidate,
          jobId: selectedJob,
          questionTypes: ['behavioral', 'technical', 'situational', 'cultural'],
          difficulty: 'middle',
          questionCount: 10,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '生成问题失败');
      }

      setQuestions(data.data?.questions || []);
      toast.success(`成功生成${data.data?.questions?.length || 0}个面试问题`);

      // 自动创建面试记录
      await handleCreateInterview(data.data);

    } catch (error: any) {
      console.error('生成问题失败:', error);
      toast.error(error.message || '生成问题失败');
    } finally {
      setLoading(false);
    }
  };

  // 创建面试记录
  const handleCreateInterview = async (questionsData: any) => {
    try {
      const response = await fetch('/api/recruitment/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          companyId,
          candidateId: selectedCandidate,
          jobId: selectedJob,
          round: 1,
          interviewerId: JSON.parse(localStorage.getItem('user') || '{}').userId,
          scheduledAt: new Date().toISOString(),
          type: 'online',
          duration: 60,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 更新面试记录的metadata
        await fetch('/api/ai/interview/generate-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            interviewId: data.data.id,
            candidateId: selectedCandidate,
            jobId: selectedJob,
            ...questionsData,
          }),
        });

        toast.success('面试记录创建成功');
        loadInitialData();
      }
    } catch (error) {
      console.error('创建面试记录失败:', error);
    }
  };

  // 开始AI对话
  const handleStartChat = async (interview: Interview) => {
    setSelectedInterview(interview);
    setCurrentPhase('introduction');
    setChatHistory([]);
    setAiResponse('');
    setInterviewDuration(0);

    // 加载已生成的问题
    if (interview.metadata?.aiQuestions?.questions) {
      setQuestions(interview.metadata.aiQuestions.questions);
    }

    // 加载对话历史
    if (interview.metadata?.chatHistory) {
      setChatHistory(interview.metadata.chatHistory);
    }

    // 开始AI介绍
    await sendAIMessage(
      '你好！我是AI面试官，很高兴能和你进行面试。我们将通过几个问题来了解你的能力和经验。请放松心情，自然地回答即可。我们开始吧！',
      interview
    );
  };

  // 发送AI消息
  const sendAIMessage = async (message: string, interview: Interview) => {
    setIsStreaming(true);
    setAiResponse('');

    try {
      const response = await fetch('/api/ai/interview/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          interviewId: interview.id,
          candidateId: interview.candidateId,
          jobId: interview.jobId,
          question: message,
          conversationHistory: chatHistory,
          currentPhase,
          mode: 'interview',
        }),
      });

      if (!response.ok) {
        throw new Error('AI对话失败');
      }

      // 处理SSE流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));
              if (data.done) {
                setChatHistory((prev) => [
                  ...prev,
                  { role: 'assistant', content: data.fullResponse, timestamp: new Date().toISOString() },
                ]);
                setIsStreaming(false);
              } else if (data.chunk) {
                setAiResponse((prev) => prev + data.chunk);
              } else if (data.error) {
                toast.error(data.error);
                setIsStreaming(false);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('AI对话错误:', error);
      toast.error('AI对话失败');
      setIsStreaming(false);
    }
  };

  // 发送用户消息
  const handleSendMessage = async () => {
    if (!userInput.trim() || !selectedInterview || isStreaming) return;

    const newMessage = { role: 'user' as const, content: userInput, timestamp: new Date().toISOString() };
    setChatHistory((prev) => [...prev, newMessage]);
    setUserInput('');

    // 评估回答
    if (questions[currentQuestionIndex]) {
      await evaluateAnswer(userInput, selectedInterview, questions[currentQuestionIndex]);
    }

    // 获取下一个问题
    await getNextQuestion(selectedInterview);
  };

  // 评估回答
  const evaluateAnswer = async (answer: string, interview: Interview, question: Question) => {
    try {
      const response = await fetch('/api/ai/interview/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          interviewId: interview.id,
          question: question.question,
          answer,
          questionType: question.type,
          evaluationDimensions: ['逻辑思维', '表达能力', '问题解决', '专业知识', '经验匹配'],
        }),
      });

      const data = await response.json();

      if (response.ok && data.data) {
        setEvaluations((prev) => [
          ...prev,
          {
            question: question.question,
            answer,
            questionType: question.type,
            evaluation: data.data,
            evaluatedAt: new Date().toISOString(),
          },
        ]);
        toast.success(`回答评分：${data.data.overallScore}分`);
      }
    } catch (error) {
      console.error('评估失败:', error);
    }
  };

  // 获取下一个问题
  const getNextQuestion = async (interview: Interview) => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      const nextQuestion = questions[currentQuestionIndex + 1];
      await sendAIMessage(nextQuestion.question, interview);

      // 更新阶段
      const questionType = nextQuestion.type;
      if (questionType === 'behavioral') setCurrentPhase('behavioral');
      else if (questionType === 'technical') setCurrentPhase('technical');
      else if (questionType === 'situational') setCurrentPhase('situational');
      else if (questionType === 'cultural') setCurrentPhase('cultural');
    } else {
      // 面试结束，生成报告
      setCurrentPhase('closing');
      await sendAIMessage('面试结束，感谢你的参与。我将为你生成一份面试报告。', interview);
      await generateReport(interview);
    }
  };

  // 生成报告
  const generateReport = async (interview: Interview) => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/interview/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          interviewId: interview.id,
          reportType: 'detailed',
          includeRecommendations: true,
          includeComparison: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setReport(data.data);
        toast.success('面试报告生成成功');
      }
    } catch (error) {
      console.error('生成报告失败:', error);
      toast.error('生成报告失败');
    } finally {
      setLoading(false);
    }
  };

  // 格式化时间
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-purple-600" />
            AI智能面试
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            基于AI的智能面试系统，自动生成问题、实时对话、智能评估
          </p>
        </div>

        {!selectedInterview ? (
          // 面试管理界面
          <div className="space-y-6">
            {/* 创建新面试 */}
            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  创建新的AI面试
                </CardTitle>
                <CardDescription>
                  选择候选人和职位，AI将自动生成个性化的面试问题
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>候选人</Label>
                    <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择候选人" />
                      </SelectTrigger>
                      <SelectContent>
                        {candidates.map((candidate) => (
                          <SelectItem key={candidate.id} value={candidate.id}>
                            {candidate.name} - {candidate.phone || '无联系方式'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>职位</Label>
                    <Select value={selectedJob} onValueChange={setSelectedJob}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择职位" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobs.map((job) => (
                          <SelectItem key={job.id} value={job.id}>
                            {job.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateQuestions}
                  disabled={loading || !selectedCandidate || !selectedJob}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      生成问题中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      生成面试问题
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* 面试记录列表 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  面试记录
                </CardTitle>
              </CardHeader>
              <CardContent>
                {interviews.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      暂无面试记录，请创建新的面试
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {interviews.map((interview) => (
                      <div
                        key={interview.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">
                              {interview.candidateName || '未知候选人'}
                            </h3>
                            <Badge variant="outline">第{interview.round}轮</Badge>
                            <Badge
                              variant={
                                interview.status === 'completed'
                                  ? 'default'
                                  : interview.status === 'scheduled'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {interview.status === 'completed'
                                ? '已完成'
                                : interview.status === 'scheduled'
                                ? '已安排'
                                : '进行中'}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {interview.jobTitle || '未知职位'} ·{' '}
                            {new Date(interview.scheduledAt).toLocaleDateString('zh-CN')}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {interview.metadata?.report ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedInterview(interview);
                                setReport(interview.metadata.report);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              查看报告
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStartChat(interview)}
                              >
                                <Play className="w-4 h-4 mr-1" />
                                开始面试
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          // AI面试对话界面
          <div className="space-y-4">
            {/* 顶部信息栏 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedInterview(null)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  返回
                </Button>
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedInterview.candidateName || '候选人'} -{' '}
                    {selectedInterview.jobTitle || '职位'}
                  </h2>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDuration(interviewDuration)}
                    </span>
                    <Badge variant="outline">
                      {phases.find((p) => p.value === currentPhase)?.label}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isRecording ? (
                  <Button variant="outline" size="icon" className="text-red-600">
                    <MicOff className="w-5 h-5" />
                  </Button>
                ) : (
                  <Button variant="outline" size="icon">
                    <Mic className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 对话区域 */}
              <div className="lg:col-span-2 space-y-4">
                {/* 进度指示 */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        问题进度：{currentQuestionIndex + 1}/{questions.length}
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={((currentQuestionIndex + 1) / questions.length) * 100}
                      className="h-2"
                    />
                  </CardContent>
                </Card>

                {/* 聊天区域 */}
                <Card className="h-[600px] flex flex-col">
                  <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
                    {chatHistory.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(msg.timestamp).toLocaleTimeString('zh-CN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* AI响应流式显示 */}
                    {isStreaming && aiResponse && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] p-3 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                          <p className="whitespace-pre-wrap">{aiResponse}</p>
                          <Loader2 className="w-4 h-4 mt-2 animate-spin" />
                        </div>
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </CardContent>

                  {/* 输入区域 */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="请输入你的回答..."
                        className="flex-1 min-h-[80px] resize-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!userInput.trim() || isStreaming}
                        className="self-end"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        发送
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* 右侧信息面板 */}
              <div className="space-y-4">
                {/* 当前问题 */}
                {questions[currentQuestionIndex] && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-purple-600" />
                        当前问题
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="font-medium">{questions[currentQuestionIndex].question}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{questions[currentQuestionIndex].category}</Badge>
                          <Badge variant="outline">{questions[currentQuestionIndex].type}</Badge>
                          <Badge variant="outline">
                            {questions[currentQuestionIndex].timeLimit}分钟
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                          {questions[currentQuestionIndex].rationale}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 实时评估 */}
                {evaluations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-green-600" />
                        实时评估
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {evaluations.slice(-3).map((evalItem, index) => (
                          <div key={index} className="border-b pb-3 last:border-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-sm">
                                {evalItem.evaluation.overallScore}分
                              </span>
                              <Badge
                                variant={
                                  evalItem.evaluation.overallScore >= 80
                                    ? 'default'
                                    : evalItem.evaluation.overallScore >= 60
                                    ? 'secondary'
                                    : 'destructive'
                                }
                              >
                                {evalItem.evaluation.overallScore >= 80
                                  ? '优秀'
                                  : evalItem.evaluation.overallScore >= 60
                                  ? '合格'
                                  : '待改进'}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                              {evalItem.evaluation.overallFeedback}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 面试报告 */}
                {report && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        面试报告
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg">
                          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                            {report.executiveSummary?.overallScore || 0}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {report.executiveSummary?.overallRating || '评估中'}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">核心优势：</p>
                          <div className="flex flex-wrap gap-1">
                            {report.executiveSummary?.coreStrengths?.map(
                              (strength: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {strength}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => router.push(`/dashboard/ai-interview/report?interviewId=${selectedInterview.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          查看完整报告
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
