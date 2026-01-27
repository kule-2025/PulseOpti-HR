'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Award, 
  TrendingUp,
  Target,
  Clock,
  CheckCircle,
  Play,
  Pause,
  RefreshCw,
  Download,
  Share2,
  Star,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

// 员工信息
interface EmployeeProfile {
  id: string;
  name: string;
  department: string;
  position: string;
  level: string;
  skills: string[];
  skillGaps: string[];
  careerGoal: string;
  learningStyle: string;
}

// 培训课程
interface TrainingCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'video' | 'text' | 'interactive' | 'workshop';
  duration: number; // 分钟
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  targetSkills: string[];
  rating: number;
  completed: boolean;
  progress: number;
}

// 学习路径
interface LearningPath {
  id: string;
  name: string;
  description: string;
  courses: string[];
  estimatedDuration: number;
  targetGoal: string;
}

// AI推荐分析
interface AIRecommendation {
  course: TrainingCourse;
  matchScore: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

const AITrainingRecommendation: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'recommendations' | 'learning-path' | 'my-courses'>('recommendations');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 模拟员工数据
  const [employeeProfile] = useState<EmployeeProfile>({
    id: 'emp-001',
    name: '张三',
    department: '技术部',
    position: '前端开发工程师',
    level: 'P5',
    skills: ['React', 'TypeScript', 'CSS', 'Git'],
    skillGaps: ['Node.js', 'AI应用开发', '性能优化', '团队管理'],
    careerGoal: '3年内晋升为技术专家',
    learningStyle: 'visual'
  });

  // 培训课程库
  const [courses] = useState<TrainingCourse[]>([
    {
      id: 'c1',
      title: 'React 19深度实战',
      description: '深入理解React 19新特性，掌握Server Components和Action API',
      category: '技术',
      type: 'video',
      duration: 120,
      difficulty: 'intermediate',
      tags: ['React', 'Frontend', 'Web'],
      targetSkills: ['React', 'TypeScript'],
      rating: 4.8,
      completed: false,
      progress: 0
    },
    {
      id: 'c2',
      title: 'TypeScript高级类型系统',
      description: '掌握TypeScript高级类型、泛型、工具类型等核心概念',
      category: '技术',
      type: 'interactive',
      duration: 90,
      difficulty: 'advanced',
      tags: ['TypeScript', 'Types', 'Generics'],
      targetSkills: ['TypeScript'],
      rating: 4.9,
      completed: false,
      progress: 0
    },
    {
      id: 'c3',
      title: 'Node.js服务端开发',
      description: '从零开始学习Node.js，掌握Express框架和RESTful API设计',
      category: '技术',
      type: 'video',
      duration: 180,
      difficulty: 'beginner',
      tags: ['Node.js', 'Backend', 'API'],
      targetSkills: ['Node.js'],
      rating: 4.7,
      completed: false,
      progress: 35
    },
    {
      id: 'c4',
      title: 'AI应用开发入门',
      description: '学习如何集成豆包大模型等AI能力到应用中',
      category: 'AI',
      type: 'interactive',
      duration: 150,
      difficulty: 'beginner',
      tags: ['AI', 'LLM', 'Integration'],
      targetSkills: ['AI应用开发'],
      rating: 4.6,
      completed: false,
      progress: 0
    },
    {
      id: 'c5',
      title: '前端性能优化实战',
      description: '掌握前端性能优化的核心方法和最佳实践',
      category: '技术',
      type: 'workshop',
      duration: 120,
      difficulty: 'advanced',
      tags: ['Performance', 'Optimization', 'Web'],
      targetSkills: ['性能优化'],
      rating: 4.8,
      completed: false,
      progress: 60
    },
    {
      id: 'c6',
      title: '团队管理与领导力',
      description: '从技术专家转型为技术管理者必备的软技能',
      category: '管理',
      type: 'video',
      duration: 100,
      difficulty: 'intermediate',
      tags: ['Management', 'Leadership', 'Soft Skills'],
      targetSkills: ['团队管理'],
      rating: 4.5,
      completed: false,
      progress: 0
    },
    {
      id: 'c7',
      title: 'AI产品设计思维',
      description: '学习如何设计以AI为核心的产品和用户体验',
      category: 'AI',
      type: 'video',
      duration: 90,
      difficulty: 'intermediate',
      tags: ['AI', 'Design', 'Product'],
      targetSkills: ['AI应用开发'],
      rating: 4.7,
      completed: false,
      progress: 0
    },
    {
      id: 'c8',
      title: 'Git高级工作流',
      description: '掌握Git Flow、GitLab CI/CD等高级工作流',
      category: '技术',
      type: 'interactive',
      duration: 80,
      difficulty: 'intermediate',
      tags: ['Git', 'DevOps', 'Workflow'],
      targetSkills: ['Git'],
      rating: 4.6,
      completed: true,
      progress: 100
    }
  ]);

  // AI推荐结果
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);

  // 学习路径
  const [learningPaths] = useState<LearningPath[]>([
    {
      id: 'lp1',
      name: '全栈工程师进阶路径',
      description: '从前端到全栈的完整学习路径',
      courses: ['c1', 'c3', 'c2', 'c5'],
      estimatedDuration: 570,
      targetGoal: '成为全栈开发工程师'
    },
    {
      id: 'lp2',
      name: 'AI应用开发路径',
      description: '掌握AI应用开发的核心技能',
      courses: ['c4', 'c7', 'c1'],
      estimatedDuration: 360,
      targetGoal: '成为AI应用开发专家'
    },
    {
      id: 'lp3',
      name: '技术专家晋升路径',
      description: '从工程师到技术专家的软硬技能提升',
      courses: ['c2', 'c5', 'c6'],
      estimatedDuration: 310,
      targetGoal: '晋升为技术专家'
    }
  ]);

  // 生成AI推荐
  const generateRecommendations = async () => {
    setIsGenerating(true);
    
    // 模拟AI分析过程
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 基于技能缺口生成推荐
    const recs: AIRecommendation[] = [];
    
    employeeProfile.skillGaps.forEach((skillGap) => {
      const matchingCourses = courses.filter(course => 
        course.targetSkills.includes(skillGap) && !course.completed
      );
      
      matchingCourses.forEach((course) => {
        // 计算匹配分数
        const skillMatch = employeeProfile.skillGaps.some(gap => 
          course.targetSkills.includes(gap)
        ) ? 30 : 0;
        
        const difficultyMatch = 
          (course.difficulty === 'beginner' && employeeProfile.level === 'P5') ? 20 :
          (course.difficulty === 'intermediate' && employeeProfile.level === 'P5') ? 25 : 15;
        
        const styleMatch = course.type === 'video' && employeeProfile.learningStyle === 'visual' ? 15 : 10;
        
        const ratingBonus = (course.rating - 4.0) * 10;
        
        const totalScore = skillMatch + difficultyMatch + styleMatch + ratingBonus + 25;
        
        recs.push({
          course,
          matchScore: Math.min(100, totalScore),
          reason: `弥补${skillGap}技能缺口，适合${employeeProfile.level}级别，学习风格匹配度${employeeProfile.learningStyle === 'visual' && course.type === 'video' ? '高' : '中'}`,
          priority: totalScore > 70 ? 'high' : totalScore > 50 ? 'medium' : 'low'
        });
      });
    });
    
    // 去重并排序
    const uniqueRecs = recs.filter((v, i, a) => a.findIndex(t => t.course.id === v.course.id) === i);
    uniqueRecs.sort((a, b) => b.matchScore - a.matchScore);
    
    setRecommendations(uniqueRecs.slice(0, 6));
    setIsGenerating(false);
  };

  // 初始化时生成推荐
  useEffect(() => {
    generateRecommendations();
  }, []);

  // 过滤课程
  const filteredCourses = courses.filter(course => {
    const categoryMatch = selectedCategory === 'all' || course.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'all' || course.difficulty === selectedDifficulty;
    const searchMatch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && difficultyMatch && searchMatch;
  });

  const getCourseTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      case 'interactive': return <BookOpen className="h-4 w-4" />;
      case 'workshop': return <Award className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-purple-600" />
                AI培训推荐系统
              </h1>
              <p className="text-sm text-gray-600 mt-1">基于AI的个性化培训推荐与学习路径规划</p>
            </div>
            <Button onClick={generateRecommendations} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  AI分析中...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重新生成推荐
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* 员工概况卡片 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>学习概况</CardTitle>
            <CardDescription>基于您的技能缺口和职业目标的AI分析</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">当前职位</div>
                <div className="font-medium">{employeeProfile.position}</div>
                <Badge variant="outline">{employeeProfile.level}</Badge>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">职业目标</div>
                <div className="font-medium">{employeeProfile.careerGoal}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">现有技能</div>
                <div className="flex flex-wrap gap-1">
                  {employeeProfile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">技能缺口</div>
                <div className="flex flex-wrap gap-1">
                  {employeeProfile.skillGaps.map((gap, index) => (
                    <Badge key={index} variant="destructive" className="text-xs">
                      {gap}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 主内容区 */}
        <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)}>
          <TabsList className="mb-6">
            <TabsTrigger value="recommendations">AI推荐课程</TabsTrigger>
            <TabsTrigger value="learning-path">学习路径</TabsTrigger>
            <TabsTrigger value="my-courses">我的课程</TabsTrigger>
          </TabsList>

          {/* AI推荐 */}
          <TabsContent value="recommendations">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec, index) => (
                <Card key={rec.course.id} className="relative">
                  <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${getPriorityColor(rec.priority)}`} />
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getCourseTypeIcon(rec.course.type)}
                        <Badge variant="outline">{rec.course.category}</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm">{rec.course.rating}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-3">{rec.course.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{rec.course.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">匹配度</span>
                        <span className="font-bold text-blue-600">{rec.matchScore}%</span>
                      </div>
                      <Progress value={rec.matchScore} />
                      <p className="text-xs text-gray-500">{rec.reason}</p>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={getDifficultyColor(rec.course.difficulty)}>
                        {rec.course.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {rec.course.duration}分钟
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1" size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        开始学习
                      </Button>
                      <Button variant="outline" size="sm">
                        <Target className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 学习路径 */}
          <TabsContent value="learning-path">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learningPaths.map((path) => (
                <Card key={path.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      {path.name}
                    </CardTitle>
                    <CardDescription>{path.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>预计时长: {Math.round(path.estimatedDuration / 60)}小时</span>
                      </div>
                      
                      <div className="border rounded-lg p-3 space-y-2">
                        <div className="text-sm font-medium">包含课程 ({path.courses.length})</div>
                        {path.courses.map((courseId, index) => {
                          const course = courses.find(c => c.id === courseId);
                          return course ? (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <span className="text-gray-400">{index + 1}.</span>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{course.title}</span>
                                  {course.completed && (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  {course.progress > 0 && (
                                    <Progress value={course.progress} className="h-1 flex-1" />
                                  )}
                                  {course.progress > 0 && (
                                    <span className="text-xs text-gray-500">{course.progress}%</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1" size="sm">
                          继续学习
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 我的课程 */}
          <TabsContent value="my-courses">
            {/* 过滤器 */}
            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white rounded-lg">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="搜索课程..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有分类</SelectItem>
                  <SelectItem value="技术">技术</SelectItem>
                  <SelectItem value="AI">AI</SelectItem>
                  <SelectItem value="管理">管理</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedDifficulty} onValueChange={(v) => setSelectedDifficulty(v as any)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有难度</SelectItem>
                  <SelectItem value="beginner">初级</SelectItem>
                  <SelectItem value="intermediate">中级</SelectItem>
                  <SelectItem value="advanced">高级</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getCourseTypeIcon(course.type)}
                        <Badge variant="outline">{course.category}</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm">{course.rating}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-3">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{course.description}</p>

                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={getDifficultyColor(course.difficulty)}>
                        {course.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {course.duration}分钟
                      </Badge>
                    </div>

                    {course.progress > 0 && (
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">学习进度</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button className="flex-1" size="sm">
                        {course.progress > 0 ? '继续学习' : '开始学习'}
                      </Button>
                      {course.completed && (
                        <CheckCircle className="h-8 w-8 text-green-600 mt-0.5" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AITrainingRecommendation;
