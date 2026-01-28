'use client';

import React, { useState, useEffect, memo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Sparkles,
  LayoutDashboard,
  Users,
  Briefcase,
  Target,
  DollarSign,
  BarChart3,
  Zap,
  Crown,
  HelpCircle,
} from 'lucide-react';

interface TourStep {
  title: string;
  description: string;
  icon?: any;
  highlight?: string;
  action?: () => void;
}

const tourSteps: TourStep[] = [
  {
    title: '欢迎使用 PulseOpti HR',
    description: '一站式人力资源管理平台，助力企业降本增效，业绩倍增',
    icon: Sparkles,
  },
  {
    title: '工作台概览',
    description: '查看关键指标、待办事项和最新动态，快速掌握企业人资状况',
    icon: LayoutDashboard,
    highlight: '/dashboard',
  },
  {
    title: '组织人事管理',
    description: '员工档案、组织架构、职位管理，全方位管理企业人力资源',
    icon: Users,
    highlight: '/dashboard/employees',
  },
  {
    title: '招聘管理',
    description: '发布岗位、简历筛选、面试安排，智能化招聘流程',
    icon: Briefcase,
    highlight: '/recruitment/jobs',
  },
  {
    title: '绩效管理',
    description: '目标设定、绩效评估、结果分析，驱动员工成长',
    icon: Target,
    highlight: '/dashboard/performance',
  },
  {
    title: '薪酬管理',
    description: '工资发放、社保公积金、个税申报，自动化薪酬处理',
    icon: DollarSign,
    highlight: '/dashboard/payroll',
  },
  {
    title: 'PRO功能',
    description: '解锁数据大屏、自定义报表、API平台等高级功能',
    icon: Crown,
    highlight: '/admin/data-dashboard',
  },
];

interface UserGuideProps {
  isOpen?: boolean;
  onClose?: () => void;
  onComplete?: () => void;
  startStep?: number;
}

const UserGuideComponent = ({
  isOpen = false,
  onClose,
  onComplete,
  startStep = 0,
}: UserGuideProps) => {
  const [currentStep, setCurrentStep] = useState(startStep);
  const [showGuide, setShowGuide] = useState(isOpen);
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    setShowGuide(isOpen);
  }, [isOpen]);

  const progress = ((currentStep + 1) / tourSteps.length) * 100;
  const step = tourSteps[currentStep];
  const StepIcon = step.icon;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setShowGuide(false);
    onComplete?.();
    // 标记已完成引导
    localStorage.setItem('pulseopti-guide-completed', 'true');
  };

  const handleSkip = () => {
    setSkipped(true);
    setShowGuide(false);
    localStorage.setItem('pulseopti-guide-skipped', 'true');
    onClose?.();
  };

  const handleJump = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  return (
    <Dialog open={showGuide} onOpenChange={setShowGuide}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                用户引导
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentStep + 1} / {tourSteps.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <DialogTitle className="text-2xl mt-4">
            {StepIcon && <StepIcon className="h-8 w-8 inline-block mr-2 text-blue-600" />}
            {step.title}
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 进度条 */}
          <div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* 步骤指示器 */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {tourSteps.map((_, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <button
                  key={index}
                  onClick={() => handleJump(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    isActive
                      ? 'bg-blue-600 w-8'
                      : isCompleted
                      ? 'bg-green-600'
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                  aria-label={`步骤 ${index + 1}`}
                />
              );
            })}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrev}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  上一步
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={handleSkip} className="text-gray-600 dark:text-gray-400">
                跳过引导
              </Button>
              {currentStep === tourSteps.length - 1 ? (
                <Button onClick={handleComplete} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  <Check className="h-4 w-4 mr-2" />
                  完成引导
                </Button>
              ) : (
                <Button onClick={handleNext} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  下一步
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const UserGuide = memo(UserGuideComponent);

// 检查是否需要显示引导
export function shouldShowGuide(): boolean {
  const completed = localStorage.getItem('pulseopti-guide-completed');
  const skipped = localStorage.getItem('pulseopti-guide-skipped');
  return !completed && !skipped;
}

// 重置引导状态
export function resetGuide(): void {
  localStorage.removeItem('pulseopti-guide-completed');
  localStorage.removeItem('pulseopti-guide-skipped');
}

// 悬浮提示按钮组件
export const GuideTrigger = memo(({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110"
      title="查看引导"
    >
      <HelpCircle className="h-6 w-6" />
      <Badge className="absolute -top-2 -right-2 bg-red-500 text-white border-0">?</Badge>
    </button>
  );
});
