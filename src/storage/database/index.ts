// 导出所有类型和schema
export * from "./shared/schema";

// 导出Manager实例
export { userManager } from "./userManager";
export { employeeManager } from "./employeeManager";
export { departmentManager } from "./departmentManager";
export { jobManager } from "./jobManager";
export { candidateManager } from "./candidateManager";
export { performanceManager } from "./performanceManager";
export { subscriptionManager } from "./subscriptionManager";
export { subscriptionPlanManager } from "./subscriptionPlanManager";
export { orderManager } from "./orderManager";
export { permissionManager } from "./permissionManager";
export { auditLogManager } from "./auditLogManager";

// 导出人效监测相关Manager
export { EfficiencyManager } from "./efficiencyManager";
export { AttributionAnalysisManager } from "./attributionAnalysisManager";
export { PredictionAnalysisManager } from "./predictionAnalysisManager";
export { DecisionRecommendationManager } from "./decisionRecommendationManager";

// 导出考勤管理Manager
export * from "./attendanceManager";

// 导出工作流相关Manager
export { workflowManager } from "./workflowManager";
export { workflowHistoryManager } from "./workflowHistoryManager";
export { recruitmentWorkflowManager } from "./recruitmentWorkflowManager";
export { performanceWorkflowManager } from "./performanceWorkflowManager";
export { resignationWorkflowManager } from "./resignationWorkflowManager";
export { employeeWorkflowManager } from "./employeeWorkflowManager";

// 导出人才管理相关Manager
export { talentPoolManager } from "./talentPoolManager";

// 导出职位体系管理Manager
export { jobFamilyManager } from "./jobFamilyManager";

// 导出劳动合同管理Manager
export { contractManager } from "./contractManager";

// 导出HR报表管理Manager
export { hrReportManager } from "./hrReportManager";

// 导出培训管理Manager
export * from "./trainingManager";

// 导出薪酬管理Manager
export * from "./payrollManager";

// 导出离职管理Manager
export * from "./resignationManager";

// 导出个人发展计划Manager
export * from "./idpManager";

// 导出子账号管理Manager
export { subAccountManager } from "./subAccountManager";

// 导出简历评估管理Manager
export * from "./assessmentManager";
