'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  RefreshCw,
  Eye,
  Trash2,
  FileCode,
  User,
  Building2,
  GraduationCap,
  Award,
  Briefcase,
  Target,
  Tag,
  Loader2,
  X,
  ChevronRight,
  ChevronLeft,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

interface ParsedResume {
  name: string;
  gender: string;
  birthDate: string;
  nativePlace: string;
  currentCity: string;
  maritalStatus: string;
  politicalStatus: string;
  phone: string;
  email: string;
  wechat: string;
  linkedIn: string;
  blog: string;
  education: any[];
  workExperience: any[];
  totalWorkYears: number;
  projects: any[];
  skills: string[];
  languageSkills: any[];
  certificates: string[];
  achievements: string[];
  expectedSalary: string;
  availableDate: string;
  hobbies: string[];
  selfIntroduction: string;
  tags: string[];
  confidence: number;
}

interface ParseQuality {
  confidence: number;
  fieldCount: number;
  qualityAssessment: {
    overallScore: number;
    completenessScore: number;
    accuracyScore: number;
    consistencyScore: number;
    confidenceLevel: string;
    missingFields: string[];
    issues: any[];
  };
  extractedFields: any;
  suggestions: string[];
}

interface Candidate {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  skills: string[];
  education: any[];
  workExperience: any[];
  achievements: string[];
  expectedSalary?: string;
  selfIntroduction?: string;
  tags: string[];
  status: string;
  source: string;
  aiParsed: boolean;
  parseScore: number;
  createdAt: string;
}

interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'parsing' | 'completed' | 'error';
  progress: number;
  result?: any;
  error?: string;
}

export default function AIResumeParserPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [companyId, setCompanyId] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadFile | null>(null);
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null);
  const [parseQuality, setParseQuality] = useState<ParseQuality | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [editMode, setEditMode] = useState(false);
  const [editableData, setEditableData] = useState<ParsedResume | null>(null);

  // 从localStorage获取companyId
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setCompanyId(userData.companyId || '');
    }
  }, []);

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      const newFile: UploadFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'pending',
        progress: 0,
      };
      setUploadedFiles(prev => [...prev, newFile]);
    });

    // 自动选择第一个文件
    if (files.length > 0) {
      const firstFile = uploadedFiles[0] || {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: files[0].name,
        size: files[0].size,
        type: files[0].type,
        status: 'pending' as const,
        progress: 0,
      };
      setSelectedFile(firstFile);
    }
  };

  // 触发文件选择
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // 解析单个简历
  const parseResume = async (file: UploadFile) => {
    if (!companyId) {
      toast.error('企业ID未找到，请重新登录');
      return;
    }

    setIsProcessing(true);
    setUploadedFiles(prev => prev.map(f => 
      f.id === file.id ? { ...f, status: 'parsing', progress: 10 } : f
    ));

    try {
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setUploadedFiles(prev => prev.map(f => {
          if (f.id === file.id && f.progress < 90) {
            return { ...f, progress: f.progress + 10 };
          }
          return f;
        }));
      }, 500);

      // 获取实际的文件
      const fileInput = fileInputRef.current;
      const fileObj = fileInput?.files?.[0] || await getFileFromName(file.name);
      
      if (!fileObj) {
        throw new Error('文件未找到');
      }

      const formData = new FormData();
      formData.append('file', fileObj);
      formData.append('companyId', companyId);

      const response = await fetch('/api/ai/resume-parse', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '解析失败');
      }

      const result = await response.json();

      setUploadedFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'completed', progress: 100, result: result.data } : f
      ));

      setParsedData(result.data.parsed);
      setParseQuality(result.data.parseQuality);
      setCandidate(result.data.candidate);
      setEditableData(result.data.parsed);
      setSelectedFile({ ...file, status: 'completed', progress: 100, result: result.data });

      setActiveTab('result');
      toast.success('简历解析成功！');

    } catch (error: any) {
      console.error('解析失败:', error);
      setUploadedFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'error', error: error.message } : f
      ));
      toast.error(error.message || '简历解析失败');
    } finally {
      setIsProcessing(false);
    }
  };

  // 从文件名获取文件（辅助函数）
  const getFileFromName = async (fileName: string): Promise<File | null> => {
    // 这个函数需要根据实际实现调整
    return null;
  };

  // 批量解析
  const parseBatch = async () => {
    const pendingFiles = uploadedFiles.filter(f => f.status === 'pending');
    
    for (const file of pendingFiles) {
      await parseResume(file);
    }
  };

  // 删除文件
  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
      setParsedData(null);
      setParseQuality(null);
      setCandidate(null);
    }
  };

  // 查看解析结果
  const viewResult = (file: UploadFile) => {
    setSelectedFile(file);
    if (file.result) {
      setParsedData(file.result.parsed);
      setParseQuality(file.result.parseQuality);
      setCandidate(file.result.candidate);
      setEditableData(file.result.parsed);
      setActiveTab('result');
    }
  };

  // 保存编辑
  const saveEdits = () => {
    if (!editableData) return;
    
    setParsedData(editableData);
    setEditMode(false);
    toast.success('数据已更新');
  };

  // 导出候选人
  const exportCandidate = async (candidateId: string) => {
    try {
      const response = await fetch(`/api/candidates/${candidateId}/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('导出失败');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `candidate_${candidateId}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('导出成功');
    } catch (error) {
      toast.error('导出失败');
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // 获取置信度颜色
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                AI简历智能解析
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                自动提取20+字段，智能生成标签，检测重复简历
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
              <FileCode className="h-3 w-3 mr-1" />
              支持 PDF/Word/图片
            </Badge>
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
              <Target className="h-3 w-3 mr-1" />
              20+ 字段提取
            </Badge>
            <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              智能质量评估
            </Badge>
          </div>
        </div>

        {/* 主要内容区域 */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="upload">上传简历</TabsTrigger>
            <TabsTrigger value="result" disabled={!parsedData}>
              解析结果
            </TabsTrigger>
          </TabsList>

          {/* 上传页面 */}
          <TabsContent value="upload" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  上传简历文件
                </CardTitle>
                <CardDescription>
                  支持上传单份或多份简历，系统将自动解析并提取关键信息
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 上传区域 */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer"
                     onClick={triggerFileSelect}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.html,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    点击上传或拖拽文件到此处
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    支持格式：PDF、Word、图片（JPG/PNG）、文本、HTML
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    文件大小限制：10MB
                  </p>
                </div>

                {/* 文件列表 */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">已上传文件</h3>
                      {uploadedFiles.some(f => f.status === 'pending') && (
                        <Button
                          onClick={parseBatch}
                          disabled={isProcessing}
                          size="sm"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              解析中...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              批量解析
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {uploadedFiles.map(file => (
                        <div
                          key={file.id}
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                          {file.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => parseResume(file)}
                              disabled={isProcessing}
                            >
                              解析
                            </Button>
                          )}
                          {file.status === 'parsing' && (
                            <div className="flex items-center gap-2">
                              <Progress value={file.progress} className="w-24" />
                              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                            </div>
                          )}
                          {file.status === 'completed' && (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => viewResult(file)}
                              >
                                查看
                              </Button>
                            </div>
                          )}
                          {file.status === 'error' && (
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-5 w-5 text-red-600" />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeFile(file.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 解析结果页面 */}
          <TabsContent value="result" className="mt-6">
            {parsedData && parseQuality && (
              <div className="space-y-6">
                {/* 质量评估卡片 */}
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      解析质量评估
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                          {parseQuality.qualityAssessment.overallScore.toFixed(0)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">总体评分</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {parseQuality.qualityAssessment.completenessScore.toFixed(0)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">完整性</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                          {parseQuality.qualityAssessment.accuracyScore.toFixed(0)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">准确性</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                          {parseQuality.qualityAssessment.consistencyScore.toFixed(0)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">一致性</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">置信度</span>
                        <span className={`text-sm font-bold ${getConfidenceColor(parseQuality.confidence)}`}>
                          {(parseQuality.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={parseQuality.confidence * 100} className="h-2" />
                    </div>

                    {parseQuality.qualityAssessment.missingFields.length > 0 && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>缺失字段</AlertTitle>
                        <AlertDescription>
                          {parseQuality.qualityAssessment.missingFields.join(', ')}
                        </AlertDescription>
                      </Alert>
                    )}

                    {parseQuality.qualityAssessment.issues.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium">发现的问题：</p>
                        {parseQuality.qualityAssessment.issues.map((issue, idx) => (
                          <Alert key={idx} variant={issue.severity === 'critical' ? 'destructive' : 'default'}>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{issue.message}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    )}

                    {parseQuality.suggestions.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium">智能建议：</p>
                        {parseQuality.suggestions.map((suggestion, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
                            <span>{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 基本信息 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      基本信息
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm text-gray-500">姓名</Label>
                        <p className="font-medium">{parsedData.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">性别</Label>
                        <p className="font-medium">{parsedData.gender || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">出生日期</Label>
                        <p className="font-medium">{parsedData.birthDate || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">手机号</Label>
                        <p className="font-medium">{parsedData.phone || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">邮箱</Label>
                        <p className="font-medium">{parsedData.email || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">工作年限</Label>
                        <p className="font-medium">{parsedData.totalWorkYears || 0} 年</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">现居地</Label>
                        <p className="font-medium">{parsedData.currentCity || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">婚姻状况</Label>
                        <p className="font-medium">{parsedData.maritalStatus || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">期望薪资</Label>
                        <p className="font-medium">{parsedData.expectedSalary || '-'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 教育经历 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      教育经历
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {parsedData.education && parsedData.education.length > 0 ? (
                      <div className="space-y-4">
                        {parsedData.education.map((edu, idx) => (
                          <div key={idx} className="border-l-2 border-purple-200 dark:border-purple-800 pl-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold">{edu.school}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {edu.major} · {edu.degree}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {edu.startDate} - {edu.endDate}
                                </p>
                              </div>
                              {edu.gpa && (
                                <Badge variant="outline">
                                  GPA: {edu.gpa}
                                </Badge>
                              )}
                            </div>
                            {edu.honors && edu.honors.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {edu.honors.map((honor: string, hIdx: number) => (
                                  <Badge key={hIdx} variant="secondary" className="text-xs">
                                    <Award className="h-3 w-3 mr-1" />
                                    {honor}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">暂无教育经历</p>
                    )}
                  </CardContent>
                </Card>

                {/* 工作经历 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      工作经历
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {parsedData.workExperience && parsedData.workExperience.length > 0 ? (
                      <div className="space-y-4">
                        {parsedData.workExperience.map((work, idx) => (
                          <div key={idx} className="border-l-2 border-blue-200 dark:border-blue-800 pl-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold">{work.company}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {work.position} · {work.department || '-'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {work.startDate} - {work.endDate}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
                              {work.description}
                            </p>
                            {work.achievements && work.achievements.length > 0 && (
                              <div className="mt-2 space-y-1">
                                <p className="text-xs font-medium text-gray-500">主要业绩：</p>
                                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                                  {work.achievements.map((achievement: string, aIdx: number) => (
                                    <li key={aIdx}>{achievement}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">暂无工作经历</p>
                    )}
                  </CardContent>
                </Card>

                {/* 技能标签 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      技能与标签
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">技术技能</Label>
                        <div className="flex flex-wrap gap-2">
                          {parsedData.skills && parsedData.skills.length > 0 ? (
                            parsedData.skills.map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
                                {skill}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">暂无技能信息</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-2 block">智能标签</Label>
                        <div className="flex flex-wrap gap-2">
                          {parsedData.tags && parsedData.tags.length > 0 ? (
                            parsedData.tags.map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="bg-purple-50 dark:bg-purple-900/20">
                                <Sparkles className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">暂无标签</p>
                          )}
                        </div>
                      </div>

                      {parsedData.certificates && parsedData.certificates.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium mb-2 block">证书资质</Label>
                          <div className="flex flex-wrap gap-2">
                            {parsedData.certificates.map((cert, idx) => (
                              <Badge key={idx} variant="outline" className="bg-green-50 dark:bg-green-900/20">
                                <Award className="h-3 w-3 mr-1" />
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* 操作按钮 */}
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('upload')}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    上传新简历
                  </Button>
                  {candidate && (
                    <Button
                      onClick={() => exportCandidate(candidate.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      导出候选人
                    </Button>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
