// 工作流类型定义 - 支持15种工作流类型
export enum WorkflowType {
  // 核心业务流程
  RECRUITMENT = 'recruitment',
  ONBOARDING = 'onboarding',
  RESIGNATION = 'resignation',
  PERFORMANCE = 'performance',
  PROMOTION = 'promotion',
  TRANSFER = 'transfer',
  SALARY_ADJUST = 'salary_adjust',
  // 扩展业务流程
  TRAINING = 'training',
  SALARY_CALCULATION = 'salary_calculation',
  ATTENDANCE = 'attendance',
  POINTS = 'points',
  CONTRACT_RENEWAL = 'contract_renewal',
  PROBATION_ASSESSMENT = 'probation_assessment',
  INTERVIEW = 'interview',
  EXIT_INTERVIEW = 'exit_interview',
}

export enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// 工作流步骤定义
export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  assigneeId?: string;
  assigneeRole?: string; // 招聘经理、部门负责人、HR等
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  metadata?: Record<string, any>;
}

// 工作流实例定义
export interface WorkflowInstance {
  id: string;
  companyId: string;
  templateId: string;
  templateName: string;
  type: WorkflowType;
  name: string;
  description?: string;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  currentStepIndex: number;
  initiatorId: string;
  initiatorName: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  relatedEntityName?: string;
  formData?: Record<string, any>;
  variables?: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 工作流模板定义
export interface WorkflowTemplate {
  id: string;
  companyId: string;
  name: string;
  type: WorkflowType;
  description?: string;
  steps: Omit<WorkflowStep, 'status' | 'startTime' | 'endTime'>[];
  defaultAssignees?: Record<string, string[]>;
  conditions?: Record<string, any>;
  isActive: boolean;
  isPublic: boolean;
  version: number;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 步骤状态
export enum StepStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  ERROR = 'error',
}
