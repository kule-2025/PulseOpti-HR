'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  Copy,
  Eye,
  AlertCircle,
  Download,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface ParsedResume {
  name: string;
  phone: string | null;
  email: string | null;
  gender: string | null;
  birthDate: string | null;
  nativePlace: string | null;
  currentCity: string | null;
  maritalStatus: string | null;
  politicalStatus: string | null;
  wechat: string | null;
  linkedIn: string | null;
  blog: string | null;
  education: Array<{
    school: string;
    major: string;
    degree: string;
    startDate: string;
    endDate: string;
    gpa: string | null;
    honors: string[];
  }>;
  workExperience: Array<{
    company: string;
    position: string;
    department: string | null;
    startDate: string;
    endDate: string;
    description: string;
    achievements: string[];
    resignationReason: string | null;
  }>;
  totalWorkYears: number;
  projects: Array<{
    name: string;
    role: string | null;
    startDate: string;
    endDate: string;
    description: string;
    achievements: string[];
  }>;
  skills: string[];
  languageSkills: Array<{
    language: string;
    level: string;
  }>;
  certificates: string[];
  achievements: string[];
  expectedSalary: string | null;
  availableDate: string | null;
  hobbies: string[];
  selfIntroduction: string | null;
  tags: string[];
  confidence: number;
}

interface ParseQuality {
  confidence: number;
  fieldCount: number;
  extractedFields: {
    basicInfo: {
      name: boolean;
      phone: boolean;
      email: boolean;
      totalWorkYears: boolean;
    };
    education: {
      hasEducation: boolean;
      count: number;
      hasGPA: boolean;
      hasHonors: boolean;
    };
    workExperience: {
      hasWorkExperience: boolean;
      count: number;
      hasAchievements: boolean;
    };
    skills: {
      hasSkills: boolean;
      count: number;
    };
    projects: {
      hasProjects: boolean;
      count: number;
    };
  };
  suggestions: string[];
}

interface ParseResult {
  success: boolean;
  fileName?: string;
  candidate?: any;
  parsed?: ParsedResume;
  resumeUrl?: string;
  parseQuality?: ParseQuality;
  error?: string;
}

interface DuplicateResult {
  candidate: any;
  similarity: number;
  matchType: string;
}

export default function AIResumeParserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parseResults, setParseResults] = useState<ParseResult[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [companyId, setCompanyId] = useState<string>('');
  const [duplicates, setDuplicates] = useState<DuplicateResult[]>([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);

  useEffect(() => {
    // 从localStorage获取companyId
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setCompanyId(userData.companyId || '');
    }
  }, []);

  // 单文件上传
  const handleSingleUpload = async () => {
    if (!selectedFile) {
      toast.error('请先选择文件');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('companyId', companyId);

      const response = await fetch('/api/ai/resume-parse', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '解析失败');
      }

      setParseResults([data.data]);
      toast.success('简历解析成功！');

      // 检测重复
      await checkDuplicates(data.data.parsed);

    } catch (error: any) {
      console.error('解析失败:', error);
      toast.error(error.message || '简历解析失败，请重试');
    } finally {
      setLoading(false);
      setUploadProgress(100);
    }
  };

  // 批量上传
  const handleBatchUpload = async () => {
    if (batchFiles.length === 0) {
      toast.error('请先选择文件');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('companyId', companyId);
      batchFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/ai/resume-batch-parse', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '批量解析失败');
      }

      setParseResults(data.data.results);
      toast.success(`批量解析完成：成功${data.data.successful}份，失败${data.data.failed}份`);

    } catch (error: any) {
      console.error('批量解析失败:', error);
      toast.error(error.message || '批量解析失败，请重试');
    } finally {
      setLoading(false);
      setUploadProgress(100);
    }
  };

  // 检测重复
  const checkDuplicates = async (parsed: ParsedResume) => {
    setCheckingDuplicates(true);
    try {
      const response = await fetch('/api/ai/resume-duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          companyId,
          name: parsed.name,
          phone: parsed.phone,
          email: parsed.email,
        }),
      });

      const data = await response.json();

      if (data.success && data.data.duplicates) {
        setDuplicates(data.data.duplicates);
        if (data.data.duplicates.length > 0) {
          toast.warning(`检测到${data.data.duplicates.length}份疑似重复简历`);
        }
      }
    } catch (error) {
      console.error('检测重复失败:', error);
    } finally {
      setCheckingDuplicates(false);
    }
  };

  // 拖拽上传
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, mode: 'single' | 'batch') => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    if (mode === 'single') {
      if (files.length > 0) {
        setSelectedFile(files[0]);
      }
    } else {
      setBatchFiles(prev => [...prev, ...files]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <div className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI简历智能解析</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  智能提取简历信息，自动识别重复简历
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              返回
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="single" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="single">单份解析</TabsTrigger>
            <TabsTrigger value="batch">批量解析</TabsTrigger>
          </TabsList>

          {/* 单份解析 */}
          <TabsContent value="single" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  上传简历
                </CardTitle>
                <CardDescription>
                  支持 PDF、Word、图片等格式，最大10MB
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 上传区域 */}
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    loading
                      ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/20'
                      : 'border-slate-300 hover:border-blue-400 dark:border-slate-700 dark:hover:border-blue-600'
                  }`}
                  onDrop={(e) => handleDrop(e, 'single')}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {loading ? (
                    <div className="space-y-4">
                      <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">正在解析简历...</p>
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                    </div>
                  ) : selectedFile ? (
                    <div className="space-y-4">
                      <FileText className="mx-auto h-12 w-12 text-blue-600" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{selectedFile.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <div className="flex gap-2 justify-center">
                        <Button onClick={handleSingleUpload}>
                          开始解析
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedFile(null)}
                        >
                          重新选择
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="mx-auto h-12 w-12 text-slate-400" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          拖拽文件到此处，或点击上传
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          支持 PDF、Word、TXT、HTML、JPG、PNG
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        id="single-file-input"
                        accept=".pdf,.doc,.docx,.txt,.html,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setSelectedFile(file);
                        }}
                      />
                      <label htmlFor="single-file-input">
                        <Button asChild>
                          <span>选择文件</span>
                        </Button>
                      </label>
                    </div>
                  )}
                </div>

                {/* 解析结果 */}
                {parseResults.length > 0 && parseResults[0].success && (
                  <div className="space-y-4">
                    {/* 重复警告 */}
                    {duplicates.length > 0 && (
                      <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-900 dark:text-amber-100">
                          检测到 {duplicates.length} 份疑似重复简历，相似度 {duplicates[0].similarity.toFixed(1)}%
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* 解析结果卡片 */}
                    <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                          <CheckCircle2 className="h-5 w-5" />
                          解析结果
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {parseResults[0].parsed && (
                          <>
                            {/* 解析质量指标 */}
                            {parseResults[0].parseQuality && (
                              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-sm flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    解析质量报告
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">解析置信度</span>
                                    <div className="flex items-center gap-2">
                                      <Progress
                                        value={parseResults[0].parseQuality.confidence * 100}
                                        className="w-32 h-2"
                                      />
                                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                                        {(parseResults[0].parseQuality.confidence * 100).toFixed(0)}%
                                      </span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-5 gap-2 text-center">
                                    <div className="rounded-lg bg-white dark:bg-slate-800 p-2">
                                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                        {parseResults[0].parseQuality.fieldCount}
                                      </p>
                                      <p className="text-xs text-slate-600 dark:text-slate-400">提取字段</p>
                                    </div>
                                    <div className="rounded-lg bg-white dark:bg-slate-800 p-2">
                                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                        {parseResults[0].parseQuality.extractedFields.education.count}
                                      </p>
                                      <p className="text-xs text-slate-600 dark:text-slate-400">教育经历</p>
                                    </div>
                                    <div className="rounded-lg bg-white dark:bg-slate-800 p-2">
                                      <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                        {parseResults[0].parseQuality.extractedFields.workExperience.count}
                                      </p>
                                      <p className="text-xs text-slate-600 dark:text-slate-400">工作经历</p>
                                    </div>
                                    <div className="rounded-lg bg-white dark:bg-slate-800 p-2">
                                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                        {parseResults[0].parseQuality.extractedFields.skills.count}
                                      </p>
                                      <p className="text-xs text-slate-600 dark:text-slate-400">技能数</p>
                                    </div>
                                    <div className="rounded-lg bg-white dark:bg-slate-800 p-2">
                                      <p className="text-lg font-bold text-pink-600 dark:text-pink-400">
                                        {parseResults[0].parseQuality.extractedFields.projects.count}
                                      </p>
                                      <p className="text-xs text-slate-600 dark:text-slate-400">项目数</p>
                                    </div>
                                  </div>

                                  {parseResults[0].parseQuality.suggestions.length > 0 && (
                                    <Alert>
                                      <AlertCircle className="h-4 w-4" />
                                      <AlertDescription className="text-sm">
                                        <p className="font-medium mb-1">优化建议：</p>
                                        <ul className="list-disc list-inside space-y-1">
                                          {parseResults[0].parseQuality.suggestions.map((suggestion, idx) => (
                                            <li key={idx}>{suggestion}</li>
                                          ))}
                                        </ul>
                                      </AlertDescription>
                                    </Alert>
                                  )}
                                </CardContent>
                              </Card>
                            )}

                            {/* 基本信息网格（增强版） */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">姓名</p>
                                <p className="font-medium text-slate-900 dark:text-white">
                                  {parseResults[0].parsed.name}
                                </p>
                              </div>
                              {parseResults[0].parsed.phone && (
                                <div>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">手机号</p>
                                  <p className="font-medium text-slate-900 dark:text-white">
                                    {parseResults[0].parsed.phone}
                                  </p>
                                </div>
                              )}
                              {parseResults[0].parsed.email && (
                                <div>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">邮箱</p>
                                  <p className="font-medium text-slate-900 dark:text-white">
                                    {parseResults[0].parsed.email}
                                  </p>
                                </div>
                              )}
                              {parseResults[0].parsed.gender && (
                                <div>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">性别</p>
                                  <p className="font-medium text-slate-900 dark:text-white">
                                    {parseResults[0].parsed.gender === 'male' ? '男' :
                                     parseResults[0].parsed.gender === 'female' ? '女' : '其他'}
                                  </p>
                                </div>
                              )}
                              {parseResults[0].parsed.birthDate && (
                                <div>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">出生日期</p>
                                  <p className="font-medium text-slate-900 dark:text-white">
                                    {parseResults[0].parsed.birthDate}
                                  </p>
                                </div>
                              )}
                              {parseResults[0].parsed.nativePlace && (
                                <div>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">籍贯</p>
                                  <p className="font-medium text-slate-900 dark:text-white">
                                    {parseResults[0].parsed.nativePlace}
                                  </p>
                                </div>
                              )}
                              {parseResults[0].parsed.currentCity && (
                                <div>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">现居地</p>
                                  <p className="font-medium text-slate-900 dark:text-white">
                                    {parseResults[0].parsed.currentCity}
                                  </p>
                                </div>
                              )}
                              {parseResults[0].parsed.totalWorkYears > 0 && (
                                <div>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">工作年限</p>
                                  <p className="font-medium text-slate-900 dark:text-white">
                                    {parseResults[0].parsed.totalWorkYears}年
                                  </p>
                                </div>
                              )}
                              {parseResults[0].parsed.expectedSalary && (
                                <div>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">期望薪资</p>
                                  <p className="font-medium text-slate-900 dark:text-white">
                                    {parseResults[0].parsed.expectedSalary}
                                  </p>
                                </div>
                              )}
                              {parseResults[0].parsed.availableDate && (
                                <div>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">可到岗日期</p>
                                  <p className="font-medium text-slate-900 dark:text-white">
                                    {parseResults[0].parsed.availableDate}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* 联系方式扩展 */}
                            {(parseResults[0].parsed.wechat || parseResults[0].parsed.linkedIn || parseResults[0].parsed.blog) && (
                              <Card className="bg-slate-50 dark:bg-slate-900/50">
                                <CardContent className="pt-4">
                                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">其他联系方式</p>
                                  <div className="flex flex-wrap gap-2">
                                    {parseResults[0].parsed.wechat && (
                                      <Badge variant="outline">
                                        微信号: {parseResults[0].parsed.wechat}
                                      </Badge>
                                    )}
                                    {parseResults[0].parsed.linkedIn && (
                                      <Badge variant="outline">
                                        LinkedIn
                                      </Badge>
                                    )}
                                    {parseResults[0].parsed.blog && (
                                      <Badge variant="outline">
                                        个人主页/GitHub
                                      </Badge>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* 技能标签 */}
                            {parseResults[0].parsed.skills && parseResults[0].parsed.skills.length > 0 && (
                              <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">技能标签</p>
                                <div className="flex flex-wrap gap-2">
                                  {parseResults[0].parsed.skills.map((skill, index) => (
                                    <Badge key={index} variant="secondary">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 智能标签 */}
                            {parseResults[0].parsed.tags && parseResults[0].parsed.tags.length > 0 && (
                              <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">智能标签</p>
                                <div className="flex flex-wrap gap-2">
                                  {parseResults[0].parsed.tags.map((tag, index) => (
                                    <Badge key={index} className="bg-gradient-to-r from-blue-500 to-indigo-600">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 教育经历（增强版） */}
                            {parseResults[0].parsed.education && parseResults[0].parsed.education.length > 0 && (
                              <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">教育经历</p>
                                <div className="space-y-2">
                                  {parseResults[0].parsed.education.map((edu, index) => (
                                    <Card key={index} className="p-3">
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <p className="font-medium text-slate-900 dark:text-white">
                                            {edu.school}
                                          </p>
                                          <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {edu.major} · {edu.degree}
                                          </p>
                                          {edu.gpa && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                              GPA: {edu.gpa}
                                            </p>
                                          )}
                                          {edu.honors && edu.honors.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                              {edu.honors.map((honor, honorIdx) => (
                                                <Badge key={honorIdx} variant="outline" className="text-xs">
                                                  {honor}
                                                </Badge>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 text-right">
                                          {edu.startDate}
                                          <br />~
                                          <br />{edu.endDate}
                                        </p>
                                      </div>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 工作经历（增强版） */}
                            {parseResults[0].parsed.workExperience && parseResults[0].parsed.workExperience.length > 0 && (
                              <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">工作经历</p>
                                <div className="space-y-3">
                                  {parseResults[0].parsed.workExperience.map((work, index) => (
                                    <Card key={index} className="p-4">
                                      <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                          <p className="font-semibold text-slate-900 dark:text-white text-base">
                                            {work.position}
                                          </p>
                                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            {work.company}
                                            {work.department && ` · ${work.department}`}
                                          </p>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 text-right">
                                          {work.startDate}
                                          <br />~
                                          <br />{work.endDate}
                                        </p>
                                      </div>
                                      {work.description && (
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                          {work.description}
                                        </p>
                                      )}
                                      {work.achievements && work.achievements.length > 0 && (
                                        <div className="mt-3">
                                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">主要业绩：</p>
                                          <div className="space-y-1">
                                            {work.achievements.map((achievement, achIdx) => (
                                              <div key={achIdx} className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                                                <p className="text-xs text-slate-700 dark:text-slate-300">
                                                  {achievement}
                                                </p>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      {work.resignationReason && (
                                        <div className="mt-2">
                                          <p className="text-xs text-slate-500 dark:text-slate-400">
                                            离职原因: {work.resignationReason}
                                          </p>
                                        </div>
                                      )}
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 项目经历（新增） */}
                            {parseResults[0].parsed.projects && parseResults[0].parsed.projects.length > 0 && (
                              <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">项目经历</p>
                                <div className="space-y-2">
                                  {parseResults[0].parsed.projects.map((proj, index) => (
                                    <Card key={index} className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                                      <div className="flex justify-between items-start mb-1">
                                        <div className="flex-1">
                                          <p className="font-medium text-slate-900 dark:text-white">
                                            {proj.name}
                                          </p>
                                          {proj.role && (
                                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                              担任角色: {proj.role}
                                            </p>
                                          )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                          {proj.startDate} ~ {proj.endDate}
                                        </p>
                                      </div>
                                      {proj.description && (
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                          {proj.description}
                                        </p>
                                      )}
                                      {proj.achievements && proj.achievements.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {proj.achievements.map((ach, achIdx) => (
                                            <Badge key={achIdx} variant="secondary" className="text-xs">
                                              {ach}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 语言能力（新增） */}
                            {parseResults[0].parsed.languageSkills && parseResults[0].parsed.languageSkills.length > 0 && (
                              <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">语言能力</p>
                                <div className="flex flex-wrap gap-2">
                                  {parseResults[0].parsed.languageSkills.map((lang, index) => (
                                    <Badge key={index} variant="outline">
                                      {lang.language}: {lang.level}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 证书资质（新增） */}
                            {parseResults[0].parsed.certificates && parseResults[0].parsed.certificates.length > 0 && (
                              <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">证书资质</p>
                                <div className="flex flex-wrap gap-2">
                                  {parseResults[0].parsed.certificates.map((cert, index) => (
                                    <Badge key={index} className="bg-gradient-to-r from-amber-500 to-orange-500">
                                      {cert}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 兴趣爱好（新增） */}
                            {parseResults[0].parsed.hobbies && parseResults[0].parsed.hobbies.length > 0 && (
                              <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">兴趣爱好</p>
                                <div className="flex flex-wrap gap-2">
                                  {parseResults[0].parsed.hobbies.map((hobby, index) => (
                                    <Badge key={index} variant="outline">
                                      {hobby}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 自我介绍 */}
                            {parseResults[0].parsed.selfIntroduction && (
                              <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">自我介绍</p>
                                <p className="text-sm text-slate-900 dark:text-white">
                                  {parseResults[0].parsed.selfIntroduction}
                                </p>
                              </div>
                            )}

                            {/* 操作按钮 */}
                            <div className="flex gap-2 pt-4">
                              <Button
                                onClick={() => router.push(`/recruitment/resume-management`)}
                              >
                                查看候选人
                              </Button>
                              {parseResults[0].resumeUrl && (
                                <Button variant="outline" asChild>
                                  <a href={parseResults[0].resumeUrl} target="_blank" rel="noopener noreferrer">
                                    <Eye className="mr-2 h-4 w-4" />
                                    查看简历
                                  </a>
                                </Button>
                              )}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 批量解析 */}
          <TabsContent value="batch" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  批量上传简历
                </CardTitle>
                <CardDescription>
                  最多支持20个文件，每个文件最大10MB
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 文件列表 */}
                {batchFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      已选择 {batchFiles.length} 个文件
                    </p>
                    <div className="space-y-2">
                      {batchFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {file.name}
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                {(file.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setBatchFiles(prev => prev.filter((_, i) => i !== index));
                            }}
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 上传按钮 */}
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="batch-file-input"
                  accept=".pdf,.doc,.docx,.txt,.html,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (batchFiles.length + files.length <= 20) {
                      setBatchFiles(prev => [...prev, ...files]);
                    } else {
                      toast.error('最多只能上传20个文件');
                    }
                  }}
                />

                <div className="flex gap-2">
                  {batchFiles.length < 20 && (
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('batch-file-input')?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      添加文件
                    </Button>
                  )}
                  {batchFiles.length > 0 && (
                    <>
                      <Button
                        onClick={handleBatchUpload}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            解析中...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            开始批量解析
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setBatchFiles([])}
                      >
                        清空
                      </Button>
                    </>
                  )}
                </div>

                {/* 解析进度 */}
                {loading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      正在解析 {batchFiles.length} 个文件...
                    </p>
                  </div>
                )}

                {/* 批量结果 */}
                {parseResults.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      解析结果 ({parseResults.filter(r => r.success).length}/{parseResults.length})
                    </p>
                    <div className="space-y-2">
                      {parseResults.map((result, index) => (
                        <Card
                          key={index}
                          className={`p-3 ${
                            result.success
                              ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20'
                              : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {result.success ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                              <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                  {result.fileName}
                                </p>
                                {result.success && result.parsed && (
                                  <p className="text-xs text-slate-600 dark:text-slate-400">
                                    {result.parsed.name} · {result.parsed.skills?.join(', ')}
                                  </p>
                                )}
                                {!result.success && (
                                  <p className="text-xs text-red-600 dark:text-red-400">
                                    {result.error}
                                  </p>
                                )}
                              </div>
                            </div>
                            {result.success && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setParseResults([result]);
                                  setSelectedFile(null);
                                  window.location.hash = 'single';
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
