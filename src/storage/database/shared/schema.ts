import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  jsonb,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { createSchemaFactory } from "drizzle-zod";
import { z } from "zod";

// ============ 系统设置表 ============
export const systemSettings = pgTable(
  "system_settings",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    siteName: varchar("site_name", { length: 255 }).notNull().default("PulseOpti HR 脉策聚效"),
    siteUrl: varchar("site_url", { length: 500 }),
    logoUrl: text("logo_url"),
    faviconUrl: text("favicon_url"),
    enableRegistration: boolean("enable_registration").notNull().default(true),
    enableEmailVerification: boolean("enable_email_verification").notNull().default(true),
    enableSmsVerification: boolean("enable_sms_verification").notNull().default(true),
    enableAuditLogs: boolean("enable_audit_logs").notNull().default(true),
    enableNotifications: boolean("enable_notifications").notNull().default(true),
    maintenanceMode: boolean("maintenance_mode").notNull().default(false),
    maintenanceMessage: text("maintenance_message"),
    contactEmail: varchar("contact_email", { length: 255 }),
    contactPhone: varchar("contact_phone", { length: 20 }),
    contactAddress: text("contact_address"),
    customCss: text("custom_css"),
    customJs: text("custom_js"),
    privacyPolicyUrl: text("privacy_policy_url"),
    termsOfServiceUrl: text("terms_of_service_url"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  }
);

// ============ 验证码表 ============
export const verificationCodes = pgTable(
  "verification_codes",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    identifier: varchar("identifier", { length: 255 }).notNull(), // 邮箱或手机号
    code: varchar("code", { length: 10 }).notNull(), // 验证码
    purpose: varchar("purpose", { length: 20 }).notNull(), // 用途：login, register, reset
    type: varchar("type", { length: 20 }).notNull(), // 类型：email, sms
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(), // 过期时间
    usedAt: timestamp("used_at", { withTimezone: true }), // 使用时间
    ipAddress: varchar("ip_address", { length: 50 }), // IP地址
    metadata: jsonb("metadata"), // 其他元数据
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    identifierPurposeIdx: index("verification_codes_identifier_purpose_idx").on(table.identifier, table.purpose),
    expiresAtIdx: index("verification_codes_expires_at_idx").on(table.expiresAt),
  })
);

// ============ 企业表 ============
export const companies = pgTable(
  "companies",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 50 }).unique(),
    industry: varchar("industry", { length: 100 }),
    size: varchar("size", { length: 50 }), // 企业规模：1-50, 51-200, 201-500, 500+
    address: text("address"),
    contactPhone: varchar("contact_phone", { length: 20 }),
    subscriptionTier: varchar("subscription_tier", { length: 20 })
      .notNull()
      .default("free"), // free, basic, professional, enterprise
    maxEmployees: integer("max_employees").notNull().default(30),
    maxAdminAccounts: integer("max_admin_accounts").notNull().default(1), // 最大管理员账号数
    subscriptionExpiresAt: timestamp("subscription_expires_at", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    codeIdx: index("companies_code_idx").on(table.code),
  })
);

// ============ 用户表 ============
export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }), // 企业ID（开发者账号为null）
    username: varchar("username", { length: 100 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    password: text("password"),
    name: varchar("name", { length: 128 }).notNull(),
    avatarUrl: text("avatar_url"),
    role: varchar("role", { length: 20 })
      .notNull()
      .default("employee"), // super_admin, admin, manager, employee
    isSuperAdmin: boolean("is_super_admin").notNull().default(false),
    isMainAccount: boolean("is_main_account").notNull().default(false), // 是否为主账号（已废弃，使用userType替代）
    userType: varchar("user_type", { length: 20 })
      .notNull()
      .default("employee"), // 账号类型：main_account, sub_account, employee, developer
    parentUserId: varchar("parent_user_id", { length: 36 }), // 关联的父账号ID（子账号或员工号时使用）
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("users_company_id_idx").on(table.companyId),
    emailIdx: index("users_email_idx").on(table.email),
    phoneIdx: index("users_phone_idx").on(table.phone),
    parentUserIdIdx: index("users_parent_user_id_idx").on(table.parentUserId),
    userTypeIdx: index("users_user_type_idx").on(table.userType),
    companyUserTypeIdx: index("users_company_id_user_type_idx").on(table.companyId, table.userType),
  })
);

// ============ 部门表 ============
export const departments = pgTable(
  "departments",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 128 }).notNull(),
    code: varchar("code", { length: 50 }),
    parentId: varchar("parent_id", { length: 36 }),
    managerId: varchar("manager_id", { length: 36 }),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    sort: integer("sort").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("departments_company_id_idx").on(table.companyId),
    parentIdIdx: index("departments_parent_id_idx").on(table.parentId),
  })
);

// ============ 职位表 ============
export const positions = pgTable(
  "positions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 128 }).notNull(),
    code: varchar("code", { length: 50 }),
    level: varchar("level", { length: 50 }), // 职级
    departmentId: varchar("department_id", { length: 36 }),
    description: text("description"),
    responsibilities: text("responsibilities"),
    requirements: text("requirements"),
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("positions_company_id_idx").on(table.companyId),
    departmentIdIdx: index("positions_department_id_idx").on(table.departmentId),
  })
);

// ============ 员工档案表 ============
export const employees = pgTable(
  "employees",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    userId: varchar("user_id", { length: 36 }),
    employeeNumber: varchar("employee_number", { length: 50 }).unique(),
    name: varchar("name", { length: 128 }).notNull(),
    gender: varchar("gender", { length: 10 }), // male, female, other
    birthDate: timestamp("birth_date", { withTimezone: true }),
    idCardNumber: varchar("id_card_number", { length: 50 }),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 255 }),
    address: text("address"),
    departmentId: varchar("department_id", { length: 36 }),
    positionId: varchar("position_id", { length: 36 }),
    managerId: varchar("manager_id", { length: 36 }),
    hireDate: timestamp("hire_date", { withTimezone: true }).notNull(),
    probationEndDate: timestamp("probation_end_date", { withTimezone: true }),
    employmentType: varchar("employment_type", { length: 20 }), // fulltime, parttime, contract, intern
    employmentStatus: varchar("employment_status", { length: 20 })
      .notNull()
      .default("active"), // active, probation, resigned, terminated
    salary: integer("salary"),
    avatarUrl: text("avatar_url"),
    education: jsonb("education"), // 教育经历
    workExperience: jsonb("work_experience"), // 工作经历
    emergencyContact: jsonb("emergency_contact"), // 紧急联系人
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("employees_company_id_idx").on(table.companyId),
    userIdIdx: index("employees_user_id_idx").on(table.userId),
    departmentIdIdx: index("employees_department_id_idx").on(table.departmentId),
    positionIdIdx: index("employees_position_id_idx").on(table.positionId),
    employeeNumberIdx: index("employees_employee_number_idx").on(table.employeeNumber),
  })
);

// ============ 招聘职位表 ============
export const jobs = pgTable(
  "jobs",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    departmentId: varchar("department_id", { length: 36 }),
    positionId: varchar("position_id", { length: 36 }),
    hireCount: integer("hire_count").notNull().default(1),
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    location: varchar("location", { length: 255 }),
    description: text("description"),
    requirements: text("requirements"),
    benefits: text("benefits"),
    status: varchar("status", { length: 20 })
      .notNull()
      .default("draft"), // draft, open, closed
    publishedAt: timestamp("published_at", { withTimezone: true }),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("jobs_company_id_idx").on(table.companyId),
    departmentIdIdx: index("jobs_department_id_idx").on(table.departmentId),
    statusIdx: index("jobs_status_idx").on(table.status),
  })
);

// ============ 候选人表 ============
export const candidates = pgTable(
  "candidates",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    jobId: varchar("job_id", { length: 36 }),
    name: varchar("name", { length: 128 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 255 }),
    gender: varchar("gender", { length: 10 }),
    birthDate: timestamp("birth_date", { withTimezone: true }),
    education: jsonb("education"), // 教育经历（JSON数组）
    workExperience: jsonb("work_experience"), // 工作经历（JSON数组）
    currentSalary: integer("current_salary"),
    expectedSalary: text("expected_salary"), // 期望薪资（文本格式，如"30-40K"）
    resumeUrl: text("resume_url"),
    resumeFileKey: text("resume_file_key"), // 简历文件在对象存储中的key
    source: varchar("source", { length: 50 }), // 来源
    status: varchar("status", { length: 20 })
      .notNull()
      .default("new"), // new, screening, interview, offer, hired, rejected
    remark: text("remark"),
    skills: jsonb("skills"), // 技能标签（JSON数组）
    achievements: jsonb("achievements"), // 主要成就（JSON数组）
    selfIntroduction: text("self_introduction"), // 自我介绍
    tags: jsonb("tags"), // 智能标签（JSON数组）
    aiParsed: boolean("ai_parsed").default(false), // 是否AI解析
    parseScore: numeric("parse_score"), // AI解析置信度（0-1）
    metadata: jsonb("metadata"), // 元数据
    extendedInfo: jsonb("extended_info"), // 扩展信息（性别、籍贯、项目经历等）
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("candidates_company_id_idx").on(table.companyId),
    jobIdIdx: index("candidates_job_id_idx").on(table.jobId),
    statusIdx: index("candidates_status_idx").on(table.status),
  })
);

// ============ 面试记录表 ============
export const interviews = pgTable(
  "interviews",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    candidateId: varchar("candidate_id", { length: 36 }).notNull(),
    jobId: varchar("job_id", { length: 36 }).notNull(),
    round: integer("round").notNull().default(1), // 面试轮次
    interviewerId: varchar("interviewer_id", { length: 36 }).notNull(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    location: varchar("location", { length: 255 }), // 面试地点
    type: varchar("type", { length: 20 }), // online, offline, phone
    status: varchar("status", { length: 20 })
      .notNull()
      .default("scheduled"), // scheduled, completed, cancelled, no_show
    score: integer("score"), // 面试评分
    feedback: text("feedback"),
    nextRoundScheduled: boolean("next_round_scheduled").notNull().default(false),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("interviews_company_id_idx").on(table.companyId),
    candidateIdIdx: index("interviews_candidate_id_idx").on(table.candidateId),
    jobIdIdx: index("interviews_job_id_idx").on(table.jobId),
    interviewerIdIdx: index("interviews_interviewer_id_idx").on(table.interviewerId),
  })
);

// ============ 录用通知表 ============
export const offers = pgTable(
  "offers",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    candidateId: varchar("candidate_id", { length: 36 }).notNull(),
    jobId: varchar("job_id", { length: 36 }).notNull(),
    offerNumber: varchar("offer_number", { length: 50 }).unique(), // Offer编号
    salary: integer("salary").notNull(), // 薪资（分）
    salaryType: varchar("salary_type", { length: 20 }).notNull(), // monthly, yearly, hourly
    startDate: timestamp("start_date", { withTimezone: true }).notNull(), // 入职日期
    probationPeriod: integer("probation_period").default(3), // 试用期（月）
    benefits: text("benefits"), // 福利待遇
    conditions: text("conditions"), // 任职条件
    status: varchar("status", { length: 20 })
      .notNull()
      .default("draft"), // draft, sent, accepted, rejected, expired
    sentAt: timestamp("sent_at", { withTimezone: true }), // 发送时间
    respondedAt: timestamp("responded_at", { withTimezone: true }), // 响应时间
    expiryDate: timestamp("expiry_date", { withTimezone: true }), // 过期日期
    createdBy: varchar("created_by", { length: 36 }).notNull(), // 创建人
    approvedBy: varchar("approved_by", { length: 36 }), // 审批人
    approvedAt: timestamp("approved_at", { withTimezone: true }), // 审批时间
    notes: text("notes"), // 备注
    attachments: jsonb("attachments"), // 附件列表
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("offers_company_id_idx").on(table.companyId),
    candidateIdIdx: index("offers_candidate_id_idx").on(table.candidateId),
    jobIdIdx: index("offers_job_id_idx").on(table.jobId),
    statusIdx: index("offers_status_idx").on(table.status),
    offerNumberIdx: index("offers_offer_number_idx").on(table.offerNumber),
  })
);

// ============ 绩效周期表 ============
export const performanceCycles = pgTable(
  "performance_cycles",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    type: varchar("type", { length: 20 }).notNull(), // quarterly, annual, custom
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    status: varchar("status", { length: 20 })
      .notNull()
      .default("draft"), // draft, active, completed
    description: text("description"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("performance_cycles_company_id_idx").on(table.companyId),
    statusIdx: index("performance_cycles_status_idx").on(table.status),
  })
);

// ============ 绩效记录表 ============
export const performanceRecords = pgTable(
  "performance_records",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    cycleId: varchar("cycle_id", { length: 36 }).notNull(),
    employeeId: varchar("employee_id", { length: 36 }).notNull(),
    reviewerId: varchar("reviewer_id", { length: 36 }), // 评估人
    selfScore: integer("self_score"), // 自评分数
    reviewerScore: integer("reviewer_score"), // 评估分数
    finalScore: integer("final_score"), // 最终分数
    goals: jsonb("goals"), // 目标
    achievements: text("achievements"), // 成就
    improvements: text("improvements"), // 待改进
    feedback: text("feedback"), // 反馈
    status: varchar("status", { length: 20 })
      .notNull()
      .default("pending"), // pending, submitted, reviewed, completed
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("performance_records_company_id_idx").on(table.companyId),
    cycleIdIdx: index("performance_records_cycle_id_idx").on(table.cycleId),
    employeeIdIdx: index("performance_records_employee_id_idx").on(table.employeeId),
    statusIdx: index("performance_records_status_idx").on(table.status),
  })
);

// ============ 订阅记录表 ============
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    tier: varchar("tier", { length: 20 }).notNull(), // free, basic, professional, enterprise
    amount: integer("amount").notNull(), // 金额（分）
    currency: varchar("currency", { length: 10 }).notNull().default("CNY"),
    period: varchar("period", { length: 20 }).notNull(), // monthly, yearly
    maxEmployees: integer("max_employees").notNull(),
    maxSubAccounts: integer("max_sub_accounts").notNull().default(0),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    status: varchar("status", { length: 20 })
      .notNull()
      .default("active"), // active, expired, cancelled
    paymentMethod: varchar("payment_method", { length: 50 }), // wechat, alipay, bank
    transactionId: varchar("transaction_id", { length: 255 }),
    remark: text("remark"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("subscriptions_company_id_idx").on(table.companyId),
    statusIdx: index("subscriptions_status_idx").on(table.status),
  })
);

// ============ 订阅套餐配置表 ============
export const subscriptionPlans = pgTable(
  "subscription_plans",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    tier: varchar("tier", { length: 20 }).notNull().unique(), // free, basic, professional, enterprise
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    monthlyPrice: integer("monthly_price").notNull(), // 月度价格（分）
    yearlyPrice: integer("yearly_price").notNull(), // 年度价格（分）
    maxEmployees: integer("max_employees").notNull(),
    features: jsonb("features").notNull(), // 功能列表
    aiQuota: integer("ai_quota").notNull().default(0), // AI调用次数配额
    storageQuota: integer("storage_quota").notNull().default(1024), // 存储空间（MB）
    prioritySupport: boolean("priority_support").notNull().default(false),
    customBranding: boolean("custom_branding").notNull().default(false),
    apiAccess: boolean("api_access").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    tierIdx: index("subscription_plans_tier_idx").on(table.tier),
  })
);

// ============ 订单表 ============
export const orders = pgTable(
  "orders",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    orderNo: varchar("order_no", { length: 50 }).notNull().unique(),
    tier: varchar("tier", { length: 20 }).notNull(), // free, basic, professional, enterprise
    period: varchar("period", { length: 20 }).notNull(), // monthly, yearly
    amount: integer("amount").notNull(), // 订单金额（分）
    originalAmount: integer("original_amount").notNull(), // 原价（分）
    discountAmount: integer("discount_amount").notNull().default(0), // 优惠金额（分）
    couponCode: varchar("coupon_code", { length: 50 }),
    currency: varchar("currency", { length: 10 }).notNull().default("CNY"),
    status: varchar("status", { length: 20 })
      .notNull()
      .default("pending"), // pending, paid, cancelled, failed, refunded
    paymentMethod: varchar("payment_method", { length: 50 }),
    paymentTime: timestamp("payment_time", { withTimezone: true }),
    transactionId: varchar("transaction_id", { length: 255 }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    remark: text("remark"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("orders_company_id_idx").on(table.companyId),
    userIdIdx: index("orders_user_id_idx").on(table.userId),
    orderNoIdx: index("orders_order_no_idx").on(table.orderNo),
    statusIdx: index("orders_status_idx").on(table.status),
  })
);

// ============ 支付凭证表 ============
export const paymentProofs = pgTable(
  "payment_proofs",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    orderId: varchar("order_id", { length: 36 }).notNull(),
    userId: varchar("user_id", { length: 36 }),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileUrl: text("file_url").notNull(),
    fileKey: text("file_key"), // 对象存储的key（用于持久化）
    fileSize: integer("file_size").notNull(), // 文件大小（字节）
    fileType: varchar("file_type", { length: 50 }).notNull(), // 文件类型：image/jpeg, image/png等
    status: varchar("status", { length: 20 })
      .notNull()
      .default("pending"), // pending（待审核）, approved（已审核通过）, rejected（已拒绝）
    reviewComment: text("review_comment"), // 审核备注
    reviewedBy: varchar("reviewed_by", { length: 36 }), // 审核人ID
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    orderIdIdx: index("payment_proofs_order_id_idx").on(table.orderId),
    userIdIdx: index("payment_proofs_user_id_idx").on(table.userId),
    statusIdx: index("payment_proofs_status_idx").on(table.status),
  })
);

// ============ 数据同步任务表 ============
export const syncTasks = pgTable(
  "sync_tasks",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    type: varchar("type", { length: 20 }).notNull(), // full, incremental, realtime
    source: varchar("source", { length: 20 }).notNull(), // user, department, position, employee, all
    status: varchar("status", { length: 20 })
      .notNull()
      .default("pending"), // pending, running, completed, failed
    priority: integer("priority").notNull().default(5), // 1-10，数字越大优先级越高
    retryCount: integer("retry_count").notNull().default(0),
    maxRetries: integer("max_retries").notNull().default(3),
    progress: integer("progress").notNull().default(0), // 0-100
    error: text("error"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    statusIdx: index("sync_tasks_status_idx").on(table.status),
    typeIdx: index("sync_tasks_type_idx").on(table.type),
    priorityIdx: index("sync_tasks_priority_idx").on(table.priority),
    scheduledForIdx: index("sync_tasks_scheduled_for_idx").on(table.scheduledFor),
  })
);

// ============ 数据同步日志表 ============
export const syncLogs = pgTable(
  "sync_logs",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    taskId: varchar("task_id", { length: 36 }).notNull(),
    level: varchar("level", { length: 10 }).notNull(), // info, warn, error
    message: text("message").notNull(),
    data: jsonb("data"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    taskIdIdx: index("sync_logs_task_id_idx").on(table.taskId),
    levelIdx: index("sync_logs_level_idx").on(table.level),
    createdAtIdx: index("sync_logs_created_at_idx").on(table.createdAt),
  })
);

// ============ 账号连接关系表 ============
export const accountConnections = pgTable(
  "account_connections",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }), // 企业ID（开发者账号之间连接时为null）
    fromUserId: varchar("from_user_id", { length: 36 }).notNull(), // 发起连接的账号ID
    toUserId: varchar("to_user_id", { length: 36 }).notNull(), // 接收连接的账号ID
    connectionType: varchar("connection_type", { length: 20 }).notNull(), // 连接类型：direct（直接上下级）, indirect（间接关系）
    relationshipType: varchar("relationship_type", { length: 20 }).notNull(), // 关系类型：hierarchy（层级）, peer（同级）, cross_department（跨部门）
    permissions: jsonb("permissions").notNull(), // 连接权限：["message", "task_assign", "status_sync"]
    status: varchar("status", { length: 20 })
      .notNull()
      .default("active"), // 状态：active, blocked, disabled
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }), // 最后消息时间
    lastTaskAt: timestamp("last_task_at", { withTimezone: true }), // 最后任务指派时间
    metadata: jsonb("metadata"), // 扩展信息
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("account_connections_company_id_idx").on(table.companyId),
    fromUserIdIdx: index("account_connections_from_user_id_idx").on(table.fromUserId),
    toUserIdIdx: index("account_connections_to_user_id_idx").on(table.toUserId),
    statusIdx: index("account_connections_status_idx").on(table.status),
    uniqueConnection: index("account_connections_unique_idx").on(table.fromUserId, table.toUserId),
  })
);

// ============ 即时消息表 ============
export const instantMessages = pgTable(
  "instant_messages",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }), // 企业ID（开发者账号之间消息时为null）
    fromUserId: varchar("from_user_id", { length: 36 }).notNull(), // 发送者ID
    toUserId: varchar("to_user_id", { length: 36 }).notNull(), // 接收者ID
    message: text("message").notNull(), // 消息内容
    messageType: varchar("message_type", { length: 20 })
      .notNull()
      .default("text"), // 消息类型：text, task, system
    relatedTaskId: varchar("related_task_id", { length: 36 }), // 关联的任务ID
    isRead: boolean("is_read").notNull().default(false), // 是否已读
    readAt: timestamp("read_at", { withTimezone: true }), // 已读时间
    metadata: jsonb("metadata"), // 扩展信息
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    companyIdIdx: index("instant_messages_company_id_idx").on(table.companyId),
    fromUserIdIdx: index("instant_messages_from_user_id_idx").on(table.fromUserId),
    toUserIdIdx: index("instant_messages_to_user_id_idx").on(table.toUserId),
    isReadIdx: index("instant_messages_is_read_idx").on(table.isRead),
    createdAtIdx: index("instant_messages_created_at_idx").on(table.createdAt),
  })
);

// ============ 任务指派表 ============
export const taskAssignments = pgTable(
  "task_assignments",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(), // 企业ID
    fromUserId: varchar("from_user_id", { length: 36 }).notNull(), // 指派人ID
    toUserId: varchar("to_user_id", { length: 36 }).notNull(), // 被指派人ID
    taskType: varchar("task_type", { length: 50 }).notNull(), // 任务类型：recruitment, performance, training, administrative
    title: varchar("title", { length: 255 }).notNull(), // 任务标题
    description: text("description"), // 任务描述
    priority: varchar("priority", { length: 20 })
      .notNull()
      .default("medium"), // 优先级：low, medium, high, urgent
    status: varchar("status", { length: 20 })
      .notNull()
      .default("pending"), // 状态：pending, in_progress, completed, cancelled, rejected
    dueDate: timestamp("due_date", { withTimezone: true }), // 截止日期
    startedAt: timestamp("started_at", { withTimezone: true }), // 开始时间
    completedAt: timestamp("completed_at", { withTimezone: true }), // 完成时间
    relatedResourceId: varchar("related_resource_id", { length: 36 }), // 关联资源ID（如候选人ID、员工ID）
    relatedResourceType: varchar("related_resource_type", { length: 50 }), // 关联资源类型
    requirements: jsonb("requirements"), // 任务要求
    attachments: jsonb("attachments"), // 附件列表
    feedback: text("feedback"), // 反馈
    metadata: jsonb("metadata"), // 扩展信息
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("task_assignments_company_id_idx").on(table.companyId),
    fromUserIdIdx: index("task_assignments_from_user_id_idx").on(table.fromUserId),
    toUserIdIdx: index("task_assignments_to_user_id_idx").on(table.toUserId),
    statusIdx: index("task_assignments_status_idx").on(table.status),
    taskTypeIdx: index("task_assignments_task_type_idx").on(table.taskType),
    dueDateIdx: index("task_assignments_due_date_idx").on(table.dueDate),
  })
);

// ============ 权限表 ============
export const permissions = pgTable(
  "permissions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    code: varchar("code", { length: 100 }).notNull().unique(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    module: varchar("module", { length: 50 }).notNull(), // user, employee, recruitment, performance, etc.
    action: varchar("action", { length: 50 }).notNull(), // view, create, edit, delete, approve
    resource: varchar("resource", { length: 50 }), // specific resource type
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    codeIdx: index("permissions_code_idx").on(table.code),
    moduleIdx: index("permissions_module_idx").on(table.module),
  })
);

// ============ 操作日志表 ============
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    userName: varchar("user_name", { length: 128 }),
    action: varchar("action", { length: 100 }).notNull(), // create, update, delete, login, logout, etc.
    resourceType: varchar("resource_type", { length: 50 }).notNull(), // user, employee, department, etc.
    resourceId: varchar("resource_id", { length: 36 }),
    resourceName: varchar("resource_name", { length: 255 }),
    ipAddress: varchar("ip_address", { length: 50 }),
    userAgent: text("user_agent"),
    changes: jsonb("changes"), // 变更详情
    status: varchar("status", { length: 20 }).notNull().default("success"), // success, failed
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    companyIdIdx: index("audit_logs_company_id_idx").on(table.companyId),
    userIdIdx: index("audit_logs_user_id_idx").on(table.userId),
    actionIdx: index("audit_logs_action_idx").on(table.action),
    resourceTypeIdx: index("audit_logs_resource_type_idx").on(table.resourceType),
    createdAtIdx: index("audit_logs_created_at_idx").on(table.createdAt),
  })
);

// ============ 人效指标配置表 ============
export const efficiencyMetrics = pgTable(
  "efficiency_metrics",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    code: varchar("code", { length: 50 }).notNull().unique(), // 指标代码，如：revenue_per_employee, turnover_rate
    name: varchar("name", { length: 100 }).notNull(), // 指标名称
    category: varchar("category", { length: 50 }).notNull(), // 类别：productivity, cost, retention, growth
    description: text("description"), // 指标说明
    formula: text("formula"), // 计算公式
    unit: varchar("unit", { length: 20 }), // 单位
    dataType: varchar("data_type", { length: 20 }).notNull().default("number"), // 数据类型：number, percentage, currency
    isKey: boolean("is_key").notNull().default(false), // 是否核心指标
    benchmark: jsonb("benchmark"), // 行业基准值
    weight: integer("weight").notNull().default(1), // 权重
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    codeIdx: index("efficiency_metrics_code_idx").on(table.code),
    categoryIdx: index("efficiency_metrics_category_idx").on(table.category),
  })
);

// ============ 人效数据快照表 ============
export const efficiencySnapshots = pgTable(
  "efficiency_snapshots",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    periodType: varchar("period_type", { length: 20 }).notNull(), // daily, weekly, monthly, quarterly, yearly
    period: varchar("period", { length: 20 }).notNull(), // 具体周期，如：2024-01
    data: jsonb("data").notNull(), // 指标数据：{ "revenue_per_employee": 423000, "turnover_rate": 8.5 }
    metadata: jsonb("metadata"), // 额外元数据
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    companyIdIdx: index("efficiency_snapshots_company_id_idx").on(table.companyId),
    periodIdx: index("efficiency_snapshots_period_idx").on(table.period),
    uniqueSnapshot: index("efficiency_snapshots_unique_idx").on(table.companyId, table.periodType, table.period),
  })
);

// ============ 人效预警规则表 ============
export const efficiencyAlertRules = pgTable(
  "efficiency_alert_rules",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    metricCode: varchar("metric_code", { length: 50 }).notNull(), // 监控的指标代码
    condition: varchar("condition", { length: 20 }).notNull(), // 条件：greater_than, less_than, equals
    threshold: integer("threshold").notNull(), // 阈值
    severity: varchar("severity", { length: 20 }).notNull(), // 严重程度：info, warning, critical
    isActive: boolean("is_active").notNull().default(true),
    createdBy: varchar("created_by", { length: 36 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("efficiency_alert_rules_company_id_idx").on(table.companyId),
    metricCodeIdx: index("efficiency_alert_rules_metric_code_idx").on(table.metricCode),
  })
);

// ============ 人效预警记录表 ============
export const efficiencyAlerts = pgTable(
  "efficiency_alerts",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    ruleId: varchar("rule_id", { length: 36 }).notNull(),
    metricCode: varchar("metric_code", { length: 50 }).notNull(),
    period: varchar("period", { length: 20 }).notNull(),
    currentValue: integer("current_value").notNull(), // 当前值
    threshold: integer("threshold").notNull(), // 阈值
    severity: varchar("severity", { length: 20 }).notNull(),
    message: text("message"), // 预警消息
    status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, acknowledged, resolved
    acknowledgedBy: varchar("acknowledged_by", { length: 36 }),
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    companyIdIdx: index("efficiency_alerts_company_id_idx").on(table.companyId),
    ruleIdIdx: index("efficiency_alerts_rule_id_idx").on(table.ruleId),
    metricCodeIdx: index("efficiency_alerts_metric_code_idx").on(table.metricCode),
    statusIdx: index("efficiency_alerts_status_idx").on(table.status),
    createdAtIdx: index("efficiency_alerts_created_at_idx").on(table.createdAt),
  })
);

// ============ 归因分析记录表 ============
export const attributionAnalysis = pgTable(
  "attribution_analysis",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    metricCode: varchar("metric_code", { length: 50 }).notNull(), // 分析的指标
    period: varchar("period", { length: 20 }).notNull(), // 分析周期
    currentValue: integer("current_value").notNull(), // 当前值
    previousValue: integer("previous_value").notNull(), // 对比值
    changeRate: varchar("change_rate", { length: 20 }), // 变化率
    analysis: jsonb("analysis").notNull(), // AI分析结果：{ "keyFactors": [...], "recommendations": [...] }
    confidence: integer("confidence"), // 置信度 0-100
    requestedBy: varchar("requested_by", { length: 36 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    companyIdIdx: index("attribution_analysis_company_id_idx").on(table.companyId),
    metricCodeIdx: index("attribution_analysis_metric_code_idx").on(table.metricCode),
    periodIdx: index("attribution_analysis_period_idx").on(table.period),
  })
);

// ============ 预测分析记录表 ============
export const predictionAnalysis = pgTable(
  "prediction_analysis",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    metricCode: varchar("metric_code", { length: 50 }).notNull(), // 预测的指标
    predictionPeriod: varchar("prediction_period", { length: 20 }).notNull(), // 预测周期
    predictionType: varchar("prediction_type", { length: 50 }).notNull(), // 预测类型：trend, peak, risk, opportunity
    currentValue: integer("current_value").notNull(), // 当前值
    predictedValue: integer("predicted_value").notNull(), // 预测值
    confidence: integer("confidence").notNull(), // 置信度 0-100
    analysis: jsonb("analysis").notNull(), // AI预测分析结果
    insights: jsonb("insights"), // 额外洞察
    requestedBy: varchar("requested_by", { length: 36 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    companyIdIdx: index("prediction_analysis_company_id_idx").on(table.companyId),
    metricCodeIdx: index("prediction_analysis_metric_code_idx").on(table.metricCode),
    predictionPeriodIdx: index("prediction_analysis_prediction_period_idx").on(table.predictionPeriod),
  })
);

// ============ 决策建议记录表 ============
export const decisionRecommendations = pgTable(
  "decision_recommendations",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(), // 建议类型：retention, recruitment, training, compensation, organizational
    priority: varchar("priority", { length: 20 }).notNull(), // 优先级：low, medium, high, critical
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"), // 问题描述
    recommendation: text("recommendation").notNull(), // 建议内容
    expectedImpact: jsonb("expected_impact"), // 预期影响：{ "metric": "turnover_rate", "improvement": "15%" }
    actionSteps: jsonb("action_steps").notNull(), // 行动步骤：[{ "step": 1, "title": "...", "description": "..." }]
    resourceNeeds: jsonb("resource_needs"), // 资源需求：{ "budget": 10000, "time": "2 weeks", "people": 2 }
    relatedMetricCode: varchar("related_metric_code", { length: 50 }),
    status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, in_progress, completed, rejected
    assignedTo: varchar("assigned_to", { length: 36 }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    feedback: text("feedback"), // 执行反馈
    effectiveness: integer("effectiveness"), // 有效性评分 1-5
    aiGenerated: boolean("ai_generated").notNull().default(true),
    requestedBy: varchar("requested_by", { length: 36 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("decision_recommendations_company_id_idx").on(table.companyId),
    typeIdx: index("decision_recommendations_type_idx").on(table.type),
    statusIdx: index("decision_recommendations_status_idx").on(table.status),
    priorityIdx: index("decision_recommendations_priority_idx").on(table.priority),
  })
);

// ============ 行动计划表 ============
export const actionPlans = pgTable(
  "action_plans",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    recommendationId: varchar("recommendation_id", { length: 36 }), // 关联的决策建议
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    targetMetricCode: varchar("target_metric_code", { length: 50 }), // 目标指标
    targetValue: integer("target_value"), // 目标值
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    tasks: jsonb("tasks").notNull(), // 任务列表：[{ "title": "...", "assignedTo": "...", "dueDate": "...", "status": "..." }]
    budget: integer("budget"), // 预算（分）
    responsibleUserId: varchar("responsible_user_id", { length: 36 }).notNull(),
    status: varchar("status", { length: 20 })
      .notNull()
      .default("planning"), // planning, in_progress, completed, paused, cancelled
    progress: integer("progress").notNull().default(0), // 进度 0-100
    notes: text("notes"),
    createdBy: varchar("created_by", { length: 36 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("action_plans_company_id_idx").on(table.companyId),
    recommendationIdIdx: index("action_plans_recommendation_id_idx").on(table.recommendationId),
    responsibleUserIdIdx: index("action_plans_responsible_user_id_idx").on(table.responsibleUserId),
    statusIdx: index("action_plans_status_idx").on(table.status),
  })
);

// ============ 职位族表 ============
export const jobFamilies = pgTable(
  "job_families",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    code: varchar("code", { length: 50 }).notNull(),
    name: varchar("name", { length: 128 }).notNull(),
    description: text("description"),
    parentId: varchar("parent_id", { length: 36 }), // 父职位族（支持多级职位族）
    sort: integer("sort").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("job_families_company_id_idx").on(table.companyId),
    codeIdx: index("job_families_code_idx").on(table.code),
    parentIdIdx: index("job_families_parent_id_idx").on(table.parentId),
  })
);

// ============ 职级表 ============
export const jobRanks = pgTable(
  "job_ranks",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    code: varchar("code", { length: 50 }).notNull(),
    name: varchar("name", { length: 128 }).notNull(), // 如：P1, P2, P3, M1, M2
    description: text("description"),
    sequence: integer("sequence").notNull(), // 排序序号，用于职级排序
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("job_ranks_company_id_idx").on(table.companyId),
    codeIdx: index("job_ranks_code_idx").on(table.code),
  })
);

// ============ 职等表 ============
export const jobGrades = pgTable(
  "job_grades",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    code: varchar("code", { length: 50 }).notNull(),
    name: varchar("name", { length: 128 }).notNull(), // 如：初级、中级、高级、资深、专家
    description: text("description"),
    sequence: integer("sequence").notNull(), // 排序序号
    salaryMin: integer("salary_min"), // 薪资范围下限（分）
    salaryMax: integer("salary_max"), // 薪资范围上限（分）
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("job_grades_company_id_idx").on(table.companyId),
    codeIdx: index("job_grades_code_idx").on(table.code),
  })
);

// ============ 职级职等映射表 ============
export const jobRankMappings = pgTable(
  "job_rank_mappings",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    jobFamilyId: varchar("job_family_id", { length: 36 }).notNull(),
    jobRankId: varchar("job_rank_id", { length: 36 }).notNull(),
    jobGradeId: varchar("job_grade_id", { length: 36 }).notNull(),
    positionTitle: varchar("position_title", { length: 128 }).notNull(), // 职位名称
    responsibilities: text("responsibilities"), // 岗位职责
    requirements: text("requirements"), // 任职要求
    competencyModel: jsonb("competency_model"), // 能力模型：{ "core": [...], "professional": [...], "leadership": [...] }
    kpiExamples: jsonb("kpi_examples"), // KPI示例
    careerPath: jsonb("career_path"), // 职业发展路径：{ "nextRankId": "...", "previousRankId": "..." }
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("job_rank_mappings_company_id_idx").on(table.companyId),
    jobFamilyIdIdx: index("job_rank_mappings_job_family_id_idx").on(table.jobFamilyId),
    jobRankIdIdx: index("job_rank_mappings_job_rank_id_idx").on(table.jobRankId),
    jobGradeIdIdx: index("job_rank_mappings_job_grade_id_idx").on(table.jobGradeId),
  })
);

// ============ 离职申请表 ============
export const resignations = pgTable(
  "resignations",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    employeeId: varchar("employee_id", { length: 36 }).notNull(),
    applicantId: varchar("applicant_id", { length: 36 }).notNull(), // 申请人ID（可能是员工本人或HR）
    resignationType: varchar("resignation_type", { length: 20 }).notNull(), // voluntary, involuntary, retirement
    reason: text("reason"), // 离职原因
    reasonCategory: varchar("reason_category", { length: 50 }), // 原因分类：salary, career, family, health, company, other
    expectedLastDate: timestamp("expected_last_date", { withTimezone: true }).notNull(),
    actualLastDate: timestamp("actual_last_date", { withTimezone: true }),
    status: varchar("status", { length: 20 })
      .notNull()
      .default("pending"), // pending, approved, rejected, processing, completed, cancelled
    approvedBy: varchar("approved_by", { length: 36 }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    remarks: text("remarks"), // 备注
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("resignations_company_id_idx").on(table.companyId),
    employeeIdIdx: index("resignations_employee_id_idx").on(table.employeeId),
    applicantIdIdx: index("resignations_applicant_id_idx").on(table.applicantId),
    statusIdx: index("resignations_status_idx").on(table.status),
  })
);

// ============ 离职交接清单表 ============
export const handoverChecklists = pgTable(
  "handover_checklists",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    resignationId: varchar("resignation_id", { length: 36 }).notNull(),
    employeeId: varchar("employee_id", { length: 36 }).notNull(),
    receiverId: varchar("receiver_id", { length: 36 }), // 交接人ID
    category: varchar("category", { length: 50 }).notNull(), // 交接分类：equipment, documents, accounts, projects, knowledge
    items: jsonb("items").notNull(), // 交接项目：[{ "name": "...", "description": "...", "status": "...", "handoverDate": "...", "receiver": "..." }]
    status: varchar("status", { length: 20 })
      .notNull()
      .default("pending"), // pending, in_progress, completed, skipped
    completedAt: timestamp("completed_at", { withTimezone: true }),
    remarks: text("remarks"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("handover_checklists_company_id_idx").on(table.companyId),
    resignationIdIdx: index("handover_checklists_resignation_id_idx").on(table.resignationId),
    employeeIdIdx: index("handover_checklists_employee_id_idx").on(table.employeeId),
    receiverIdIdx: index("handover_checklists_receiver_id_idx").on(table.receiverId),
    statusIdx: index("handover_checklists_status_idx").on(table.status),
  })
);

// ============ 离职访谈记录表 ============
export const exitInterviews = pgTable(
  "exit_interviews",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    employeeId: varchar("employee_id", { length: 36 }).notNull(),
    resignationId: varchar("resignation_id", { length: 36 }),
    interviewerId: varchar("interviewer_id", { length: 36 }).notNull(), // 访谈人
    interviewDate: timestamp("interview_date", { withTimezone: true }).notNull(),
    interviewMethod: varchar("interview_method", { length: 20 }).notNull(), // face_to_face, phone, online
    overallSatisfaction: integer("overall_satisfaction"), // 整体满意度 1-5
    workingEnvironment: integer("working_environment"), // 工作环境满意度 1-5
    salary: integer("salary"), // 薪资满意度 1-5
    management: integer("management"), // 管理满意度 1-5
    careerDevelopment: integer("career_development"), // 职业发展满意度 1-5
    workLifeBalance: integer("work_life_balance"), // 工作生活平衡满意度 1-5
    reasonForLeaving: text("reason_for_leaving"), // 离职原因详细描述
    suggestions: text("suggestions"), // 改进建议
    wouldRecommend: boolean("would_recommend"), // 是否推荐他人入职
    highlights: text("highlights"), // 最值得留恋的地方
    improvements: text("improvements"), // 最需要改进的地方
    feedback: text("feedback"), // 其他反馈
    isAnonymous: boolean("is_anonymous").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("exit_interviews_company_id_idx").on(table.companyId),
    employeeIdIdx: index("exit_interviews_employee_id_idx").on(table.employeeId),
    resignationIdIdx: index("exit_interviews_resignation_id_idx").on(table.resignationId),
    interviewerIdIdx: index("exit_interviews_interviewer_id_idx").on(table.interviewerId),
  })
);

// ============ 劳动合同表 ============
export const employmentContracts = pgTable(
  "employment_contracts",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    employeeId: varchar("employee_id", { length: 36 }).notNull(),
    contractNumber: varchar("contract_number", { length: 100 }).unique(), // 合同编号
    contractType: varchar("contract_type", { length: 20 }).notNull(), // fulltime, parttime, contract, intern
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }), // 无固定期限合同则为null
    probationStartDate: timestamp("probation_start_date", { withTimezone: true }),
    probationEndDate: timestamp("probation_end_date", { withTimezone: true }),
    workLocation: varchar("work_location", { length: 255 }), // 工作地点
    workHours: varchar("work_hours", { length: 50 }), // 工作时间：如"9:00-18:00"
    position: varchar("position", { length: 128 }), // 职位
    department: varchar("department", { length: 128 }), // 部门
    salary: integer("salary"), // 基本工资（分）
    salaryStructure: text("salary_structure"), // 薪资结构说明
    benefits: text("benefits"), // 福利待遇
    status: varchar("status", { length: 20 })
      .notNull()
      .default("draft"), // draft, active, terminated, renewed, expired
    isProbationPassed: boolean("is_probation_passed"), // 试用期是否通过
    probationPassedDate: timestamp("probation_passed_date", { withTimezone: true }),
    terminationDate: timestamp("termination_date", { withTimezone: true }),
    terminationReason: text("termination_reason"),
    contractUrl: text("contract_url"), // 合同文件URL
    signedAt: timestamp("signed_at", { withTimezone: true }), // 签署日期
    signedByEmployee: varchar("signed_by_employee", { length: 36 }), // 员工签署人
    signedByCompany: varchar("signed_by_company", { length: 36 }), // 公司签署人
    remarks: text("remarks"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("employment_contracts_company_id_idx").on(table.companyId),
    employeeIdIdx: index("employment_contracts_employee_id_idx").on(table.employeeId),
    contractNumberIdx: index("employment_contracts_contract_number_idx").on(table.contractNumber),
    statusIdx: index("employment_contracts_status_idx").on(table.status),
  })
);

// ============ 人才库表 ============
export const talentPool = pgTable(
  "talent_pool",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 128 }).notNull(),
    type: varchar("type", { length: 20 }).notNull(), // candidate, employee, alumni, external
    description: text("description"),
    tags: jsonb("tags"), // 标签：["技术", "管理", "高潜"]
    criteria: jsonb("criteria"), // 入库条件：{ "performanceScore": ">80", "potentialScore": ">85" }
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("talent_pool_company_id_idx").on(table.companyId),
  })
);

// ============ 人才库成员表 ============
export const talentPoolMembers = pgTable(
  "talent_pool_members",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    poolId: varchar("pool_id", { length: 36 }).notNull(),
    type: varchar("type", { length: 20 }).notNull(), // candidate, employee
    relatedId: varchar("related_id", { length: 36 }).notNull(), // 关联的候选人ID或员工ID
    addedBy: varchar("added_by", { length: 36 }).notNull(),
    addedReason: text("added_reason"), // 入库原因
    aiMatchScore: integer("ai_match_score"), // AI匹配分数
    tags: jsonb("tags"), // 个人标签
    notes: text("notes"), // 备注
    lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("talent_pool_members_company_id_idx").on(table.companyId),
    poolIdIdx: index("talent_pool_members_pool_id_idx").on(table.poolId),
    relatedIdIdx: index("talent_pool_members_related_id_idx").on(table.relatedId),
  })
);

// ============ 个人发展计划(IDP)表 ============
export const individualDevelopmentPlans = pgTable(
  "individual_development_plans",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    employeeId: varchar("employee_id", { length: 36 }).notNull(),
    period: varchar("period", { length: 50 }).notNull(), // 计划周期：2024-Q1, 2024-H1, 2024
    title: varchar("title", { length: 255 }).notNull(), // IDP标题
    careerGoal: text("career_goal"), // 职业发展目标
    skillGapAnalysis: jsonb("skill_gap_analysis"), // 能力差距分析
    goals: jsonb("goals").notNull(), // 发展目标：[{ "category": "...", "name": "...", "currentLevel": "...", "targetLevel": "...", "actionItems": [...] }]
    learningActivities: jsonb("learning_activities"), // 学习活动：[{ "type": "course|project|mentoring|reading", "name": "...", "provider": "...", "duration": "...", "status": "...", "completedDate": "..." }]
    milestones: jsonb("milestones"), // 里程碑：[{ "date": "...", "description": "...", "status": "..." }]
    resources: jsonb("resources"), // 所需资源：{ "budget": ..., "time": ..., "support": ... }
    mentorId: varchar("mentor_id", { length: 36 }), // 导师
    managerId: varchar("manager_id", { length: 36 }), // 直接上级
    status: varchar("status", { length: 20 })
      .notNull()
      .default("draft"), // draft, active, completed, cancelled
    progress: integer("progress").notNull().default(0), // 进度 0-100
    employeeComments: text("employee_comments"), // 员工自评
    managerComments: text("manager_comments"), // 管理者评估
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("individual_development_plans_company_id_idx").on(table.companyId),
    employeeIdIdx: index("individual_development_plans_employee_id_idx").on(table.employeeId),
    mentorIdIdx: index("individual_development_plans_mentor_id_idx").on(table.mentorId),
    managerIdIdx: index("individual_development_plans_manager_id_idx").on(table.managerId),
    statusIdx: index("individual_development_plans_status_idx").on(table.status),
  })
);

// ============ HR报表模板表 ============
export const hrReportTemplates = pgTable(
  "hr_report_templates",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }),
    code: varchar("code", { length: 50 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 50 }).notNull(), // workforce, efficiency, turnover, compensation, training
    type: varchar("type", { length: 20 }).notNull(), // system, custom
    dataSource: jsonb("data_source").notNull(), // 数据源配置
    metrics: jsonb("metrics").notNull(), // 指标配置
    dimensions: jsonb("dimensions").notNull(), // 维度配置
    filters: jsonb("filters"), // 过滤器配置
    chartType: varchar("chart_type", { length: 20 }), // chart, table, card
    chartConfig: jsonb("chart_config"), // 图表配置
    isPublic: boolean("is_public").notNull().default(true), // 是否公开
    createdBy: varchar("created_by", { length: 36 }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("hr_report_templates_company_id_idx").on(table.companyId),
    codeIdx: index("hr_report_templates_code_idx").on(table.code),
    categoryIdx: index("hr_report_templates_category_idx").on(table.category),
  })
);

// ============ 工作流系统 ============

// 工作流模板表
export const workflowTemplates = pgTable(
  "workflow_templates",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    type: varchar("type", { length: 50 })
      .notNull(), // recruitment, performance, onboarding, resignation, promotion, transfer, salary_adjustment
    description: text("description"),
    steps: jsonb("steps").notNull(), // 工作流步骤定义
    defaultAssignees: jsonb("default_assignees"), // 默认审批人
    conditions: jsonb("conditions"), // 流程条件
    isActive: boolean("is_active").notNull().default(true),
    isPublic: boolean("is_public").notNull().default(true), // 是否公开模板
    version: integer("version").notNull().default(1),
    metadata: jsonb("metadata"),
    createdBy: varchar("created_by", { length: 36 }).notNull(),
    updatedBy: varchar("updated_by", { length: 36 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("workflow_templates_company_id_idx").on(table.companyId),
    typeIdx: index("workflow_templates_type_idx").on(table.type),
    isPublicIdx: index("workflow_templates_is_public_idx").on(table.isPublic),
  })
);

// 工作流实例表
export const workflowInstances = pgTable(
  "workflow_instances",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    templateId: varchar("template_id", { length: 36 }).notNull(),
    templateName: varchar("template_name", { length: 255 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 20 })
      .notNull()
      .default("draft"), // draft, active, paused, completed, cancelled, error
    steps: jsonb("steps").notNull(), // 工作流步骤执行状态
    currentStepIndex: integer("current_step_index").notNull().default(0),
    initiatorId: varchar("initiator_id", { length: 36 }).notNull(),
    initiatorName: varchar("initiator_name", { length: 128 }).notNull(),
    relatedEntityType: varchar("related_entity_type", { length: 50 }), // employee, position, performance, etc.
    relatedEntityId: varchar("related_entity_id", { length: 36 }),
    relatedEntityName: varchar("related_entity_name", { length: 255 }),
    formData: jsonb("form_data"), // 表单数据
    variables: jsonb("variables"), // 流程变量
    priority: varchar("priority", { length: 20 })
      .notNull()
      .default("medium"), // low, medium, high, urgent
    dueDate: timestamp("due_date", { withTimezone: true }),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    error: text("error"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("workflow_instances_company_id_idx").on(table.companyId),
    templateIdIdx: index("workflow_instances_template_id_idx").on(table.templateId),
    typeIdx: index("workflow_instances_type_idx").on(table.type),
    statusIdx: index("workflow_instances_status_idx").on(table.status),
    initiatorIdIdx: index("workflow_instances_initiator_id_idx").on(table.initiatorId),
    relatedEntityIdIdx: index("workflow_instances_related_entity_id_idx").on(table.relatedEntityId),
  })
);

// 工作流历史表
export const workflowHistory = pgTable(
  "workflow_history",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    instanceId: varchar("instance_id", { length: 36 }).notNull(),
    instanceName: varchar("instance_name", { length: 255 }).notNull(),
    templateId: varchar("template_id", { length: 36 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    action: varchar("action", { length: 50 })
      .notNull(), // created, updated, step_started, step_completed, approved, rejected, paused, resumed, cancelled, completed
    actorId: varchar("actor_id", { length: 36 }).notNull(),
    actorName: varchar("actor_name", { length: 128 }).notNull(),
    actorRole: varchar("actor_role", { length: 50 }),
    stepId: varchar("step_id", { length: 36 }),
    stepName: varchar("step_name", { length: 255 }),
    description: text("description").notNull(),
    metadata: jsonb("metadata"),
    changes: jsonb("changes"), // 变更记录
    ipAddress: varchar("ip_address", { length: 50 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    companyIdIdx: index("workflow_history_company_id_idx").on(table.companyId),
    instanceIdIdx: index("workflow_history_instance_id_idx").on(table.instanceId),
    actorIdIdx: index("workflow_history_actor_id_idx").on(table.actorId),
    createdAtIdx: index("workflow_history_created_at_idx").on(table.createdAt),
  })
);

// 通知表
export const notifications = pgTable(
  "notifications",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(), // workflow_approve, workflow_reject, workflow_complete, workflow_cancel, workflow_assign
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    metadata: jsonb("metadata"),
    priority: varchar("priority", { length: 20 })
      .notNull()
      .default("medium"), // low, medium, high, urgent
    isRead: boolean("is_read").notNull().default(false),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    companyIdIdx: index("notifications_company_id_idx").on(table.companyId),
    userIdIdx: index("notifications_user_id_idx").on(table.userId),
    typeIdx: index("notifications_type_idx").on(table.type),
    isReadIdx: index("notifications_is_read_idx").on(table.isRead),
    createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
  })
);

// ============ 积分系统 ============

// 积分维度表
export const pointDimensions = pgTable(
  "point_dimensions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    code: varchar("code", { length: 50 }).notNull(), // 维度代码：performance, attendance, training, culture
    name: varchar("name", { length: 128 }).notNull(), // 维度名称
    icon: varchar("icon", { length: 50 }), // 图标
    color: varchar("color", { length: 20 }), // 颜色
    description: text("description"),
    weight: integer("weight").notNull().default(1), // 权重
    isActive: boolean("is_active").notNull().default(true),
    sort: integer("sort").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("point_dimensions_company_id_idx").on(table.companyId),
    codeIdx: index("point_dimensions_code_idx").on(table.code),
  })
);

// 积分规则表
export const pointRules = pgTable(
  "point_rules",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    dimensionId: varchar("dimension_id", { length: 36 }), // 关联的积分维度
    code: varchar("code", { length: 50 }).notNull(), // 规则代码
    name: varchar("name", { length: 255 }).notNull(), // 规则名称
    type: varchar("type", { length: 20 }).notNull(), // auto, manual - 自动或手动
    triggerType: varchar("trigger_type", { length: 50 }), // performance, attendance, training, culture, custom
    points: integer("points").notNull(), // 积分值（正数为奖励，负数为扣分）
    description: text("description"),
    conditions: jsonb("conditions"), // 触发条件
    limits: jsonb("limits"), // 限制条件（如每日上限、每月上限）
    priority: integer("priority").notNull().default(0), // 优先级
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("point_rules_company_id_idx").on(table.companyId),
    dimensionIdIdx: index("point_rules_dimension_id_idx").on(table.dimensionId),
    codeIdx: index("point_rules_code_idx").on(table.code),
    typeIdx: index("point_rules_type_idx").on(table.type),
    triggerTypeIdx: index("point_rules_trigger_type_idx").on(table.triggerType),
  })
);

// 员工积分余额表
export const employeePoints = pgTable(
  "employee_points",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    employeeId: varchar("employee_id", { length: 36 }).notNull(),
    totalPoints: integer("total_points").notNull().default(0), // 总积分
    availablePoints: integer("available_points").notNull().default(0), // 可用积分
    usedPoints: integer("used_points").notNull().default(0), // 已使用积分
    rank: integer("rank"), // 积分排名
    level: varchar("level", { length: 50 }), // 积分级别
    periodPoints: jsonb("period_points"), // 各周期积分（如本月、本季度、本年）
    lastUpdated: timestamp("last_updated", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("employee_points_company_id_idx").on(table.companyId),
    employeeIdIdx: index("employee_points_employee_id_idx").on(table.employeeId),
    uniqueEmployeeCompanyIdx: index("employee_points_employee_company_unique_idx").on(table.companyId, table.employeeId),
  })
);

// 积分变动记录表
export const pointTransactions = pgTable(
  "point_transactions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    employeeId: varchar("employee_id", { length: 36 }).notNull(),
    ruleId: varchar("rule_id", { length: 36 }), // 触发的规则ID
    dimensionId: varchar("dimension_id", { length: 36 }), // 积分维度ID
    transactionType: varchar("transaction_type", { length: 20 }).notNull(), // earn, redeem, adjust
    points: integer("points").notNull(), // 积分变动（正数为获得，负数为消费）
    balanceAfter: integer("balance_after").notNull(), // 变动后余额
    source: varchar("source", { length: 50 }).notNull(), // 来源：performance, attendance, training, culture, manual, exchange
    sourceId: varchar("source_id", { length: 36 }), // 来源记录ID
    description: text("description"), // 描述
    remarks: text("remarks"), // 备注
    operatedBy: varchar("operated_by", { length: 36 }), // 操作人ID
    metadata: jsonb("metadata"), // 元数据
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    companyIdIdx: index("point_transactions_company_id_idx").on(table.companyId),
    employeeIdIdx: index("point_transactions_employee_id_idx").on(table.employeeId),
    ruleIdIdx: index("point_transactions_rule_id_idx").on(table.ruleId),
    transactionTypeIdx: index("point_transactions_transaction_type_idx").on(table.transactionType),
    sourceIdx: index("point_transactions_source_idx").on(table.source),
    createdAtIdx: index("point_transactions_created_at_idx").on(table.createdAt),
  })
);

// 兑换商品表
export const exchangeItems = pgTable(
  "exchange_items",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }),
    code: varchar("code", { length: 50 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    category: varchar("category", { length: 50 }), // 商品分类
    pointsRequired: integer("points_required").notNull(), // 所需积分
    stock: integer("stock").notNull().default(0), // 库存
    unlimitedStock: boolean("unlimited_stock").notNull().default(false), // 是否无限库存
    value: integer("value"), // 商品价值（元）
    tags: jsonb("tags"), // 标签
    isPublic: boolean("is_public").notNull().default(true), // 是否公开
    isActive: boolean("is_active").notNull().default(true),
    validFrom: timestamp("valid_from", { withTimezone: true }),
    validTo: timestamp("valid_to", { withTimezone: true }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("exchange_items_company_id_idx").on(table.companyId),
    codeIdx: index("exchange_items_code_idx").on(table.code),
    categoryIdx: index("exchange_items_category_idx").on(table.category),
    isActiveIdx: index("exchange_items_is_active_idx").on(table.isActive),
  })
);

// 兑换记录表
export const exchangeRecords = pgTable(
  "exchange_records",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    employeeId: varchar("employee_id", { length: 36 }).notNull(),
    itemId: varchar("item_id", { length: 36 }).notNull(),
    itemName: varchar("item_name", { length: 255 }).notNull(), // 商品快照
    pointsUsed: integer("points_used").notNull(), // 使用积分
    status: varchar("status", { length: 20 })
      .notNull()
      .default("pending"), // pending, approved, rejected, completed, cancelled
    deliveryMethod: varchar("delivery_method", { length: 20 }), // delivery, pickup, virtual
    deliveryInfo: jsonb("delivery_info"), // 配送信息
    approvedBy: varchar("approved_by", { length: 36 }), // 审批人
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    remark: text("remark"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("exchange_records_company_id_idx").on(table.companyId),
    employeeIdIdx: index("exchange_records_employee_id_idx").on(table.employeeId),
    itemIdIdx: index("exchange_records_item_id_idx").on(table.itemId),
    statusIdx: index("exchange_records_status_idx").on(table.status),
    createdAtIdx: index("exchange_records_created_at_idx").on(table.createdAt),
  })
);

// 积分级别表
export const pointLevels = pgTable(
  "point_levels",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }),
    code: varchar("code", { length: 50 }).notNull(),
    name: varchar("name", { length: 128 }).notNull(),
    description: text("description"),
    minPoints: integer("min_points").notNull(), // 最低积分
    maxPoints: integer("max_points"), // 最高积分
    privileges: jsonb("privileges"), // 特权配置
    badgeUrl: text("badge_url"), // 徽章图片
    sort: integer("sort").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("point_levels_company_id_idx").on(table.companyId),
    codeIdx: index("point_levels_code_idx").on(table.code),
    minPointsIdx: index("point_levels_min_points_idx").on(table.minPoints),
  })
);

// 积分统计表
export const pointStatistics = pgTable(
  "point_statistics",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    employeeId: varchar("employee_id", { length: 36 }), // 为空表示公司级统计
    departmentId: varchar("department_id", { length: 36 }), // 部门统计
    dimensionId: varchar("dimension_id", { length: 36 }), // 维度统计
    period: varchar("period", { length: 20 }).notNull(), // daily, weekly, monthly, quarterly, yearly
    periodValue: varchar("period_value", { length: 20 }).notNull(), // 2024-01, 2024-Q1
    earnedPoints: integer("earned_points").notNull().default(0), // 获得积分
    redeemedPoints: integer("redeemed_points").notNull().default(0), // 消费积分
    netPoints: integer("net_points").notNull().default(0), // 净积分
    transactionCount: integer("transaction_count").notNull().default(0), // 交易次数
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("point_statistics_company_id_idx").on(table.companyId),
    employeeIdIdx: index("point_statistics_employee_id_idx").on(table.employeeId),
    departmentIdIdx: index("point_statistics_department_id_idx").on(table.departmentId),
    dimensionIdIdx: index("point_statistics_dimension_id_idx").on(table.dimensionId),
    periodIdx: index("point_statistics_period_idx").on(table.period),
    uniqueIdx: index("point_statistics_unique_idx").on(
      table.companyId,
      table.employeeId,
      table.departmentId,
      table.dimensionId,
      table.period,
      table.periodValue
    ),
  })
);

// 积分排行榜缓存表
export const pointLeaderboard = pgTable(
  "point_leaderboard",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    period: varchar("period", { length: 20 }).notNull(), // daily, weekly, monthly, yearly, all
    periodValue: varchar("period_value", { length: 20 }),
    employeeId: varchar("employee_id", { length: 36 }).notNull(),
    employeeName: varchar("employee_name", { length: 128 }).notNull(),
    departmentId: varchar("department_id", { length: 36 }),
    departmentName: varchar("department_name", { length: 128 }),
    position: varchar("position", { length: 128 }),
    avatarUrl: text("avatar_url"),
    totalPoints: integer("total_points").notNull(), // 总积分
    earnedPoints: integer("earned_points").notNull(), // 本期获得积分
    rank: integer("rank").notNull(), // 排名
    trend: varchar("trend", { length: 20 }), // up, down, stable
    rankChange: integer("rank_change"), // 排名变化
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    companyIdIdx: index("point_leaderboard_company_id_idx").on(table.companyId),
    periodIdx: index("point_leaderboard_period_idx").on(table.period),
    employeeIdIdx: index("point_leaderboard_employee_id_idx").on(table.employeeId),
    rankIdx: index("point_leaderboard_rank_idx").on(table.rank),
    uniqueIdx: index("point_leaderboard_unique_idx").on(
      table.companyId,
      table.period,
      table.periodValue,
      table.employeeId
    ),
  })
);

// ============ 支付系统 ============

// 支付配置表
export const paymentConfigs = pgTable(
  "payment_configs",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    provider: varchar("provider", { length: 20 }).notNull(), // alipay, wechat_pay, bank_transfer, credit_card
    providerName: varchar("provider_name", { length: 100 }).notNull(), // 支付方式名称
    config: jsonb("config").notNull(), // 支付配置（ appId, appSecret, merchantId, publicKey, privateKey等）
    environment: varchar("environment", { length: 20 }).notNull().default("sandbox"), // sandbox, production
    isActive: boolean("is_active").notNull().default(false),
    isDefault: boolean("is_default").notNull().default(false),
    supportCurrencies: jsonb("support_currencies").notNull(), // 支持的币种：["CNY", "USD"]
    minAmount: integer("min_amount").notNull().default(100), // 最小支付金额（分）
    maxAmount: integer("max_amount").notNull().default(1000000), // 最大支付金额（分）
    feeRate: numeric("fee_rate").notNull().default("0.006"), // 手续费率
    description: text("description"),
    metadata: jsonb("metadata"),
    createdBy: varchar("created_by", { length: 36 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("payment_configs_company_id_idx").on(table.companyId),
    providerIdx: index("payment_configs_provider_idx").on(table.provider),
    isActiveIdx: index("payment_configs_is_active_idx").on(table.isActive),
  })
);

// 支付订单表
export const paymentOrders = pgTable(
  "payment_orders",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    orderId: varchar("order_id", { length: 36 }), // 关联的订单ID
    orderNo: varchar("order_no", { length: 50 }).notNull(), // 业务订单号
    paymentNo: varchar("payment_no", { length: 50 }).unique().notNull(), // 支付流水号
    provider: varchar("provider", { length: 20 }).notNull(), // alipay, wechat_pay, bank_transfer
    providerOrderId: varchar("provider_order_id", { length: 100 }), // 第三方支付平台订单号
    amount: integer("amount").notNull(), // 支付金额（分）
    currency: varchar("currency", { length: 10 }).notNull().default("CNY"),
    subject: varchar("subject", { length: 255 }).notNull(), // 支付标题
    description: text("description"), // 支付描述
    status: varchar("status", { length: 20 })
      .notNull()
      .default("pending"), // pending, processing, paid, failed, cancelled, refunding, refunded
    payType: varchar("pay_type", { length: 50 }), // 支付方式：alipay_pc_direct, alipay_wap, wechat_native, wechat_h5
    clientIp: varchar("client_ip", { length: 50 }), // 客户端IP
    returnUrl: text("return_url"), // 同步返回地址
    notifyUrl: text("notify_url"), // 异步通知地址
    paidAt: timestamp("paid_at", { withTimezone: true }), // 支付时间
    expiredAt: timestamp("expired_at", { withTimezone: true }), // 订单过期时间
    transactionId: varchar("transaction_id", { length: 100 }), // 第三方交易流水号
    totalFee: integer("total_fee"), // 支付手续费（分）
    buyerInfo: jsonb("buyer_info"), // 买家信息
    extra: jsonb("extra"), // 扩展信息
    failureReason: text("failure_reason"), // 失败原因
    remark: text("remark"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("payment_orders_company_id_idx").on(table.companyId),
    userIdIdx: index("payment_orders_user_id_idx").on(table.userId),
    orderIdIdx: index("payment_orders_order_id_idx").on(table.orderId),
    orderNoIdx: index("payment_orders_order_no_idx").on(table.orderNo),
    paymentNoIdx: index("payment_orders_payment_no_idx").on(table.paymentNo),
    providerOrderIdIdx: index("payment_orders_provider_order_id_idx").on(table.providerOrderId),
    statusIdx: index("payment_orders_status_idx").on(table.status),
    createdAtIdx: index("payment_orders_created_at_idx").on(table.createdAt),
  })
);

// 退款记录表
export const refundRecords = pgTable(
  "refund_records",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    paymentOrderId: varchar("payment_order_id", { length: 36 }).notNull(),
    refundNo: varchar("refund_no", { length: 50 }).unique().notNull(), // 退款流水号
    paymentNo: varchar("payment_no", { length: 50 }).notNull(), // 原支付流水号
    providerRefundId: varchar("provider_refund_id", { length: 100 }), // 第三方退款ID
    amount: integer("amount").notNull(), // 退款金额（分）
    refundAmount: integer("refund_amount").notNull(), // 实际退款金额（分）
    currency: varchar("currency", { length: 10 }).notNull().default("CNY"),
    reason: text("reason"), // 退款原因
    status: varchar("status", { length: 20 })
      .notNull()
      .default("pending"), // pending, processing, success, failed, cancelled
    refundType: varchar("refund_type", { length: 20 }).notNull(), // full, partial
    requestedBy: varchar("requested_by", { length: 36 }).notNull(), // 申请人ID
    approvedBy: varchar("approved_by", { length: 36 }), // 审批人ID
    approvedAt: timestamp("approved_at", { withTimezone: true }), // 审批时间
    refundedAt: timestamp("refunded_at", { withTimezone: true }), // 退款完成时间
    failureReason: text("failure_reason"), // 失败原因
    remark: text("remark"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("refund_records_company_id_idx").on(table.companyId),
    userIdIdx: index("refund_records_user_id_idx").on(table.userId),
    paymentOrderIdIdx: index("refund_records_payment_order_id_idx").on(table.paymentOrderId),
    refundNoIdx: index("refund_records_refund_no_idx").on(table.refundNo),
    paymentNoIdx: index("refund_records_payment_no_idx").on(table.paymentNo),
    providerRefundIdIdx: index("refund_records_provider_refund_id_idx").on(table.providerRefundId),
    statusIdx: index("refund_records_status_idx").on(table.status),
    createdAtIdx: index("refund_records_created_at_idx").on(table.createdAt),
  })
);

// 对账记录表
export const reconciliationRecords = pgTable(
  "reconciliation_records",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    provider: varchar("provider", { length: 20 }).notNull(), // alipay, wechat_pay
    reconcileDate: timestamp("reconcile_date", { withTimezone: true }).notNull(), // 对账日期
    reconcileType: varchar("reconcile_type", { length: 20 }).notNull(), // daily, monthly
    totalOrders: integer("total_orders").notNull().default(0), // 总订单数
    successOrders: integer("success_orders").notNull().default(0), // 成功订单数
    failedOrders: integer("failed_orders").notNull().default(0), // 失败订单数
    totalAmount: integer("total_amount").notNull().default(0), // 总金额（分）
    successAmount: integer("success_amount").notNull().default(0), // 成功金额（分）
    failedAmount: integer("failed_amount").notNull().default(0), // 失败金额（分）
    totalFee: integer("total_fee").notNull().default(0), // 总手续费（分）
    status: varchar("status", { length: 20 })
      .notNull()
      .default("pending"), // pending, processing, success, failed
    discrepancies: jsonb("discrepancies"), // 差异记录
    fileUrl: text("file_url"), // 对账文件URL
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    error: text("error"),
    operatedBy: varchar("operated_by", { length: 36 }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("reconciliation_records_company_id_idx").on(table.companyId),
    providerIdx: index("reconciliation_records_provider_idx").on(table.provider),
    reconcileDateIdx: index("reconciliation_records_reconcile_date_idx").on(table.reconcileDate),
    statusIdx: index("reconciliation_records_status_idx").on(table.status),
  })
);

// ============ 使用 createSchemaFactory 配置 date coercion ============
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
  coerce: { date: true },
});

// ============ Zod schemas for validation ============
export const insertCompanySchema = createCoercedInsertSchema(companies).pick({
  name: true,
  code: true,
  industry: true,
  size: true,
  address: true,
  contactPhone: true,
  subscriptionTier: true,
  maxEmployees: true,
  subscriptionExpiresAt: true,
});

export const insertUserSchema = createCoercedInsertSchema(users).pick({
  companyId: true,
  username: true,
  email: true,
  phone: true,
  password: true,
  name: true,
  avatarUrl: true,
  role: true,
  isSuperAdmin: true,
  isMainAccount: true,
  userType: true,
  parentUserId: true,
  isActive: true,
});

export const insertDepartmentSchema = createCoercedInsertSchema(departments).pick({
  companyId: true,
  name: true,
  code: true,
  parentId: true,
  managerId: true,
  description: true,
  sort: true,
});

export const insertPositionSchema = createCoercedInsertSchema(positions).pick({
  companyId: true,
  name: true,
  code: true,
  level: true,
  departmentId: true,
  description: true,
  responsibilities: true,
  requirements: true,
  salaryMin: true,
  salaryMax: true,
});

export const insertEmployeeSchema = createCoercedInsertSchema(employees).pick({
  companyId: true,
  userId: true,
  employeeNumber: true,
  name: true,
  gender: true,
  birthDate: true,
  idCardNumber: true,
  phone: true,
  email: true,
  address: true,
  departmentId: true,
  positionId: true,
  managerId: true,
  hireDate: true,
  probationEndDate: true,
  employmentType: true,
  employmentStatus: true,
  salary: true,
  avatarUrl: true,
  education: true,
  workExperience: true,
  emergencyContact: true,
});

export const insertJobSchema = createCoercedInsertSchema(jobs).pick({
  companyId: true,
  title: true,
  departmentId: true,
  positionId: true,
  hireCount: true,
  salaryMin: true,
  salaryMax: true,
  location: true,
  description: true,
  requirements: true,
  benefits: true,
  status: true,
  publishedAt: true,
  closedAt: true,
  createdBy: true,
});

export const insertCandidateSchema = createCoercedInsertSchema(candidates).pick({
  companyId: true,
  jobId: true,
  name: true,
  phone: true,
  email: true,
  gender: true,
  birthDate: true,
  education: true,
  workExperience: true,
  currentSalary: true,
  expectedSalary: true,
  resumeUrl: true,
  resumeFileKey: true,
  source: true,
  status: true,
  remark: true,
  skills: true,
  achievements: true,
  selfIntroduction: true,
  tags: true,
  aiParsed: true,
  parseScore: true,
  metadata: true,
  extendedInfo: true,
});

export const insertInterviewSchema = createCoercedInsertSchema(interviews).pick({
  companyId: true,
  candidateId: true,
  jobId: true,
  round: true,
  interviewerId: true,
  scheduledAt: true,
  location: true,
  type: true,
  status: true,
  score: true,
  feedback: true,
  nextRoundScheduled: true,
});

export const insertPerformanceCycleSchema = createCoercedInsertSchema(performanceCycles).pick({
  companyId: true,
  name: true,
  type: true,
  startDate: true,
  endDate: true,
  status: true,
  description: true,
});

export const insertPerformanceRecordSchema = createCoercedInsertSchema(performanceRecords).pick({
  companyId: true,
  cycleId: true,
  employeeId: true,
  reviewerId: true,
  selfScore: true,
  reviewerScore: true,
  finalScore: true,
  goals: true,
  achievements: true,
  improvements: true,
  feedback: true,
  status: true,
  submittedAt: true,
  reviewedAt: true,
});

export const insertSubscriptionSchema = createCoercedInsertSchema(subscriptions).pick({
  companyId: true,
  tier: true,
  amount: true,
  currency: true,
  period: true,
  maxEmployees: true,
  maxSubAccounts: true,
  startDate: true,
  endDate: true,
  status: true,
  paymentMethod: true,
  transactionId: true,
  remark: true,
});

export const insertSubscriptionPlanSchema = createCoercedInsertSchema(subscriptionPlans).pick({
  tier: true,
  name: true,
  description: true,
  monthlyPrice: true,
  yearlyPrice: true,
  maxEmployees: true,
  features: true,
  aiQuota: true,
  storageQuota: true,
  prioritySupport: true,
  customBranding: true,
  apiAccess: true,
  isActive: true,
  sortOrder: true,
});

export const insertOrderSchema = createCoercedInsertSchema(orders).pick({
  companyId: true,
  userId: true,
  orderNo: true,
  tier: true,
  period: true,
  amount: true,
  originalAmount: true,
  discountAmount: true,
  couponCode: true,
  currency: true,
  status: true,
  paymentMethod: true,
  paymentTime: true,
  transactionId: true,
  expiresAt: true,
  remark: true,
});

export const insertPermissionSchema = createCoercedInsertSchema(permissions).pick({
  code: true,
  name: true,
  description: true,
  module: true,
  action: true,
  resource: true,
  isActive: true,
});

export const insertRolePermissionSchema = z.object({
  roleId: z.string(),
  permissionId: z.string(),
  grantedBy: z.string(),
});

export const insertAccountConnectionSchema = createCoercedInsertSchema(accountConnections).pick({
  companyId: true,
  fromUserId: true,
  toUserId: true,
  connectionType: true,
  relationshipType: true,
  permissions: true,
  status: true,
  metadata: true,
});

export const insertInstantMessageSchema = createCoercedInsertSchema(instantMessages).pick({
  companyId: true,
  fromUserId: true,
  toUserId: true,
  message: true,
  messageType: true,
  relatedTaskId: true,
  metadata: true,
});

export const insertTaskAssignmentSchema = createCoercedInsertSchema(taskAssignments).pick({
  companyId: true,
  fromUserId: true,
  toUserId: true,
  taskType: true,
  title: true,
  description: true,
  priority: true,
  dueDate: true,
  relatedResourceId: true,
  relatedResourceType: true,
  requirements: true,
  attachments: true,
  metadata: true,
});

export const insertAuditLogSchema = createCoercedInsertSchema(auditLogs).pick({
  companyId: true,
  userId: true,
  userName: true,
  action: true,
  resourceType: true,
  resourceId: true,
  resourceName: true,
  ipAddress: true,
  userAgent: true,
  changes: true,
  status: true,
  errorMessage: true,
});

export const insertJobFamilySchema = createCoercedInsertSchema(jobFamilies).pick({
  companyId: true,
  code: true,
  name: true,
  description: true,
  parentId: true,
  sort: true,
  isActive: true,
});

export const insertJobRankSchema = createCoercedInsertSchema(jobRanks).pick({
  companyId: true,
  code: true,
  name: true,
  description: true,
  sequence: true,
  isActive: true,
});

export const insertJobGradeSchema = createCoercedInsertSchema(jobGrades).pick({
  companyId: true,
  code: true,
  name: true,
  description: true,
  sequence: true,
  salaryMin: true,
  salaryMax: true,
  isActive: true,
});

export const insertJobRankMappingSchema = createCoercedInsertSchema(jobRankMappings).pick({
  companyId: true,
  jobFamilyId: true,
  jobRankId: true,
  jobGradeId: true,
  positionTitle: true,
  responsibilities: true,
  requirements: true,
  competencyModel: true,
  kpiExamples: true,
  careerPath: true,
  isActive: true,
});

export const insertResignationSchema = createCoercedInsertSchema(resignations).pick({
  companyId: true,
  employeeId: true,
  applicantId: true,
  resignationType: true,
  reason: true,
  reasonCategory: true,
  expectedLastDate: true,
  actualLastDate: true,
  remarks: true,
  metadata: true,
});

export const insertHandoverChecklistSchema = createCoercedInsertSchema(handoverChecklists).pick({
  companyId: true,
  resignationId: true,
  employeeId: true,
  receiverId: true,
  category: true,
  items: true,
  remarks: true,
});

export const insertExitInterviewSchema = createCoercedInsertSchema(exitInterviews).pick({
  companyId: true,
  employeeId: true,
  resignationId: true,
  interviewerId: true,
  interviewDate: true,
  interviewMethod: true,
  overallSatisfaction: true,
  workingEnvironment: true,
  salary: true,
  management: true,
  careerDevelopment: true,
  workLifeBalance: true,
  reasonForLeaving: true,
  suggestions: true,
  wouldRecommend: true,
  highlights: true,
  improvements: true,
  feedback: true,
  isAnonymous: true,
});

export const insertEmploymentContractSchema = createCoercedInsertSchema(employmentContracts).pick({
  companyId: true,
  employeeId: true,
  contractNumber: true,
  contractType: true,
  startDate: true,
  endDate: true,
  probationStartDate: true,
  probationEndDate: true,
  workLocation: true,
  workHours: true,
  position: true,
  department: true,
  salary: true,
  salaryStructure: true,
  benefits: true,
  isProbationPassed: true,
  probationPassedDate: true,
  terminationDate: true,
  terminationReason: true,
  remarks: true,
});

export const insertTalentPoolSchema = createCoercedInsertSchema(talentPool).pick({
  companyId: true,
  name: true,
  type: true,
  description: true,
  tags: true,
  criteria: true,
  isActive: true,
});

export const insertTalentPoolMemberSchema = createCoercedInsertSchema(talentPoolMembers).pick({
  companyId: true,
  poolId: true,
  type: true,
  relatedId: true,
  addedBy: true,
  addedReason: true,
  tags: true,
  notes: true,
  isActive: true,
});

export const insertIndividualDevelopmentPlanSchema = createCoercedInsertSchema(individualDevelopmentPlans).pick({
  companyId: true,
  employeeId: true,
  period: true,
  title: true,
  careerGoal: true,
  skillGapAnalysis: true,
  goals: true,
  learningActivities: true,
  milestones: true,
  resources: true,
  mentorId: true,
  managerId: true,
  employeeComments: true,
  managerComments: true,
});

// 工作流系统schemas
export const insertWorkflowTemplateSchema = createCoercedInsertSchema(workflowTemplates).pick({
  companyId: true,
  name: true,
  type: true,
  description: true,
  steps: true,
  defaultAssignees: true,
  conditions: true,
  isActive: true,
  isPublic: true,
  version: true,
  metadata: true,
  createdBy: true,
  updatedBy: true,
});

export const insertWorkflowInstanceSchema = createCoercedInsertSchema(workflowInstances).pick({
  companyId: true,
  templateId: true,
  templateName: true,
  type: true,
  name: true,
  description: true,
  status: true,
  steps: true,
  currentStepIndex: true,
  initiatorId: true,
  initiatorName: true,
  relatedEntityType: true,
  relatedEntityId: true,
  relatedEntityName: true,
  formData: true,
  variables: true,
  priority: true,
  dueDate: true,
  startDate: true,
  endDate: true,
  error: true,
  metadata: true,
});

export const insertWorkflowHistorySchema = createCoercedInsertSchema(workflowHistory).pick({
  companyId: true,
  instanceId: true,
  instanceName: true,
  templateId: true,
  type: true,
  action: true,
  actorId: true,
  actorName: true,
  actorRole: true,
  stepId: true,
  stepName: true,
  description: true,
  metadata: true,
  changes: true,
  ipAddress: true,
  userAgent: true,
});

export const insertHrReportTemplateSchema = createCoercedInsertSchema(hrReportTemplates).pick({
  companyId: true,
  code: true,
  name: true,
  description: true,
  category: true,
  type: true,
  dataSource: true,
  metrics: true,
  dimensions: true,
  filters: true,
  chartType: true,
  chartConfig: true,
  isPublic: true,
  isActive: true,
});

// 积分系统Insert Schema
export const insertPointDimensionSchema = createCoercedInsertSchema(pointDimensions).pick({
  companyId: true,
  code: true,
  name: true,
  icon: true,
  color: true,
  description: true,
  weight: true,
  isActive: true,
  sort: true,
});

export const insertPointRuleSchema = createCoercedInsertSchema(pointRules).pick({
  companyId: true,
  dimensionId: true,
  code: true,
  name: true,
  type: true,
  triggerType: true,
  points: true,
  description: true,
  conditions: true,
  limits: true,
  priority: true,
  isActive: true,
});

export const insertEmployeePointSchema = createCoercedInsertSchema(employeePoints).pick({
  companyId: true,
  employeeId: true,
  totalPoints: true,
  availablePoints: true,
  usedPoints: true,
  rank: true,
  level: true,
  periodPoints: true,
});

export const insertPointTransactionSchema = createCoercedInsertSchema(pointTransactions).pick({
  companyId: true,
  employeeId: true,
  ruleId: true,
  dimensionId: true,
  transactionType: true,
  points: true,
  balanceAfter: true,
  source: true,
  sourceId: true,
  description: true,
  remarks: true,
  operatedBy: true,
  metadata: true,
});

export const insertExchangeItemSchema = createCoercedInsertSchema(exchangeItems).pick({
  companyId: true,
  code: true,
  name: true,
  description: true,
  imageUrl: true,
  category: true,
  pointsRequired: true,
  stock: true,
  unlimitedStock: true,
  value: true,
  tags: true,
  isPublic: true,
  isActive: true,
  validFrom: true,
  validTo: true,
  sortOrder: true,
});

export const insertExchangeRecordSchema = createCoercedInsertSchema(exchangeRecords).pick({
  companyId: true,
  employeeId: true,
  itemId: true,
  itemName: true,
  pointsUsed: true,
  status: true,
  deliveryMethod: true,
  deliveryInfo: true,
  approvedBy: true,
  approvedAt: true,
  completedAt: true,
  remark: true,
  metadata: true,
});

export const insertPointLevelSchema = createCoercedInsertSchema(pointLevels).pick({
  companyId: true,
  code: true,
  name: true,
  description: true,
  minPoints: true,
  maxPoints: true,
  privileges: true,
  badgeUrl: true,
  sort: true,
  isActive: true,
});

export const insertPointStatisticSchema = createCoercedInsertSchema(pointStatistics).pick({
  companyId: true,
  employeeId: true,
  departmentId: true,
  dimensionId: true,
  period: true,
  periodValue: true,
  earnedPoints: true,
  redeemedPoints: true,
  netPoints: true,
  transactionCount: true,
  metadata: true,
});

export const insertPointLeaderboardSchema = createCoercedInsertSchema(pointLeaderboard).pick({
  companyId: true,
  period: true,
  periodValue: true,
  employeeId: true,
  employeeName: true,
  departmentId: true,
  departmentName: true,
  position: true,
  avatarUrl: true,
  totalPoints: true,
  earnedPoints: true,
  rank: true,
  trend: true,
  rankChange: true,
});

// 支付系统 Insert Schema
export const insertPaymentConfigSchema = createCoercedInsertSchema(paymentConfigs).pick({
  companyId: true,
  provider: true,
  providerName: true,
  config: true,
  environment: true,
  isActive: true,
  isDefault: true,
  supportCurrencies: true,
  minAmount: true,
  maxAmount: true,
  feeRate: true,
  description: true,
  metadata: true,
  createdBy: true,
});

export const insertPaymentOrderSchema = createCoercedInsertSchema(paymentOrders).pick({
  companyId: true,
  userId: true,
  orderId: true,
  orderNo: true,
  paymentNo: true,
  provider: true,
  providerOrderId: true,
  amount: true,
  currency: true,
  subject: true,
  description: true,
  status: true,
  payType: true,
  clientIp: true,
  returnUrl: true,
  notifyUrl: true,
  paidAt: true,
  expiredAt: true,
  transactionId: true,
  totalFee: true,
  buyerInfo: true,
  extra: true,
  failureReason: true,
  remark: true,
});

export const insertRefundRecordSchema = createCoercedInsertSchema(refundRecords).pick({
  companyId: true,
  userId: true,
  paymentOrderId: true,
  refundNo: true,
  paymentNo: true,
  providerRefundId: true,
  amount: true,
  refundAmount: true,
  currency: true,
  reason: true,
  status: true,
  refundType: true,
  requestedBy: true,
  approvedBy: true,
  approvedAt: true,
  refundedAt: true,
  failureReason: true,
  remark: true,
  metadata: true,
});

export const insertReconciliationRecordSchema = createCoercedInsertSchema(reconciliationRecords).pick({
  companyId: true,
  provider: true,
  reconcileDate: true,
  reconcileType: true,
  totalOrders: true,
  successOrders: true,
  failedOrders: true,
  totalAmount: true,
  successAmount: true,
  failedAmount: true,
  totalFee: true,
  status: true,
  discrepancies: true,
  fileUrl: true,
  startedAt: true,
  completedAt: true,
  error: true,
  operatedBy: true,
  metadata: true,
});

// ============ TypeScript types ============
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

// 支付系统 TypeScript Types
export type PaymentConfig = typeof paymentConfigs.$inferSelect;
export type InsertPaymentConfig = z.infer<typeof insertPaymentConfigSchema>;

export type PaymentOrder = typeof paymentOrders.$inferSelect;
export type InsertPaymentOrder = z.infer<typeof insertPaymentOrderSchema>;

export type RefundRecord = typeof refundRecords.$inferSelect;
export type InsertRefundRecord = z.infer<typeof insertRefundRecordSchema>;

export type ReconciliationRecord = typeof reconciliationRecords.$inferSelect;
export type InsertReconciliationRecord = z.infer<typeof insertReconciliationRecordSchema>;

export type Position = typeof positions.$inferSelect;
export type InsertPosition = z.infer<typeof insertPositionSchema>;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;

export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;

export type PerformanceCycle = typeof performanceCycles.$inferSelect;
export type InsertPerformanceCycle = z.infer<typeof insertPerformanceCycleSchema>;

export type PerformanceRecord = typeof performanceRecords.$inferSelect;
export type InsertPerformanceRecord = z.infer<typeof insertPerformanceRecordSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;

export type AccountConnection = typeof accountConnections.$inferSelect;
export type InsertAccountConnection = z.infer<typeof insertAccountConnectionSchema>;

export type InstantMessage = typeof instantMessages.$inferSelect;
export type InsertInstantMessage = z.infer<typeof insertInstantMessageSchema>;

export type TaskAssignment = typeof taskAssignments.$inferSelect;
export type InsertTaskAssignment = z.infer<typeof insertTaskAssignmentSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

export type JobFamily = typeof jobFamilies.$inferSelect;
export type InsertJobFamily = z.infer<typeof insertJobFamilySchema>;

export type JobRank = typeof jobRanks.$inferSelect;
export type InsertJobRank = z.infer<typeof insertJobRankSchema>;

export type JobGrade = typeof jobGrades.$inferSelect;
export type InsertJobGrade = z.infer<typeof insertJobGradeSchema>;

export type JobRankMapping = typeof jobRankMappings.$inferSelect;
export type InsertJobRankMapping = z.infer<typeof insertJobRankMappingSchema>;

export type Resignation = typeof resignations.$inferSelect;
export type InsertResignation = z.infer<typeof insertResignationSchema>;

export type HandoverChecklist = typeof handoverChecklists.$inferSelect;
export type InsertHandoverChecklist = z.infer<typeof insertHandoverChecklistSchema>;

export type ExitInterview = typeof exitInterviews.$inferSelect;
export type InsertExitInterview = z.infer<typeof insertExitInterviewSchema>;

export type EmploymentContract = typeof employmentContracts.$inferSelect;
export type InsertEmploymentContract = z.infer<typeof insertEmploymentContractSchema>;

export type TalentPool = typeof talentPool.$inferSelect;
export type InsertTalentPool = z.infer<typeof insertTalentPoolSchema>;

export type TalentPoolMember = typeof talentPoolMembers.$inferSelect;
export type InsertTalentPoolMember = z.infer<typeof insertTalentPoolMemberSchema>;

export type IndividualDevelopmentPlan = typeof individualDevelopmentPlans.$inferSelect;
export type InsertIndividualDevelopmentPlan = z.infer<typeof insertIndividualDevelopmentPlanSchema>;

export type HrReportTemplate = typeof hrReportTemplates.$inferSelect;
export type InsertHrReportTemplate = z.infer<typeof insertHrReportTemplateSchema>;

// 工作流系统类型
export type WorkflowTemplate = typeof workflowTemplates.$inferSelect;
export type InsertWorkflowTemplate = z.infer<typeof insertWorkflowTemplateSchema>;

export type WorkflowInstance = typeof workflowInstances.$inferSelect;
export type InsertWorkflowInstance = z.infer<typeof insertWorkflowInstanceSchema>;

export type WorkflowHistory = typeof workflowHistory.$inferSelect;
export type InsertWorkflowHistory = z.infer<typeof insertWorkflowHistorySchema>;

// 积分系统类型
export type PointDimension = typeof pointDimensions.$inferSelect;
export type InsertPointDimension = z.infer<typeof insertPointDimensionSchema>;

export type PointRule = typeof pointRules.$inferSelect;
export type InsertPointRule = z.infer<typeof insertPointRuleSchema>;

export type EmployeePoint = typeof employeePoints.$inferSelect;
export type InsertEmployeePoint = z.infer<typeof insertEmployeePointSchema>;

export type PointTransaction = typeof pointTransactions.$inferSelect;
export type InsertPointTransaction = z.infer<typeof insertPointTransactionSchema>;

export type ExchangeItem = typeof exchangeItems.$inferSelect;
export type InsertExchangeItem = z.infer<typeof insertExchangeItemSchema>;

export type ExchangeRecord = typeof exchangeRecords.$inferSelect;
export type InsertExchangeRecord = z.infer<typeof insertExchangeRecordSchema>;

export type PointLevel = typeof pointLevels.$inferSelect;
export type InsertPointLevel = z.infer<typeof insertPointLevelSchema>;

export type PointStatistic = typeof pointStatistics.$inferSelect;
export type InsertPointStatistic = z.infer<typeof insertPointStatisticSchema>;

export type PointLeaderboard = typeof pointLeaderboard.$inferSelect;
export type InsertPointLeaderboard = z.infer<typeof insertPointLeaderboardSchema>;

// ============ 考勤管理表 ============

// 打卡记录表
export const attendanceRecords = pgTable(
  "attendance_records",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    employeeId: varchar("employee_id", { length: 36 }).notNull(),
    recordDate: timestamp("record_date", { withTimezone: true }).notNull(), // 考勤日期
    clockInTime: timestamp("clock_in_time", { withTimezone: true }), // 上班打卡时间
    clockOutTime: timestamp("clock_out_time", { withTimezone: true }), // 下班打卡时间
    workHours: integer("work_hours").default(0), // 工作时长（分钟）
    status: varchar("status", { length: 20 }).notNull().default("normal"), // normal, late, early_leave, absent, overtime
    location: varchar("location", { length: 255 }), // 打卡地点
    deviceInfo: text("device_info"), // 设备信息
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("attendance_records_company_id_idx").on(table.companyId),
    employeeIdIdx: index("attendance_records_employee_id_idx").on(table.employeeId),
    recordDateIdx: index("attendance_records_record_date_idx").on(table.recordDate),
    compositeIdx: index("attendance_records_composite_idx").on(table.companyId, table.employeeId, table.recordDate),
  })
);

export const insertAttendanceRecordSchema = createCoercedInsertSchema(attendanceRecords).pick({
  companyId: true,
  employeeId: true,
  recordDate: true,
  clockInTime: true,
  clockOutTime: true,
  workHours: true,
  status: true,
  location: true,
  deviceInfo: true,
  metadata: true,
});

// 请假申请表
export const leaveRequests = pgTable(
  "leave_requests",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    employeeId: varchar("employee_id", { length: 36 }).notNull(),
    departmentId: varchar("department_id", { length: 36 }),
    leaveType: varchar("leave_type", { length: 20 }).notNull(), // annual, sick, personal, marriage, bereavement, maternity, paternity
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    days: integer("days").notNull(), // 请假天数
    reason: text("reason").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, approved, rejected, cancelled
    approverId: varchar("approver_id", { length: 36 }),
    approverName: varchar("approver_name", { length: 128 }),
    approverComment: text("approver_comment"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    attachments: jsonb("attachments"), // 附件列表
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("leave_requests_company_id_idx").on(table.companyId),
    employeeIdIdx: index("leave_requests_employee_id_idx").on(table.employeeId),
    statusIdx: index("leave_requests_status_idx").on(table.status),
    dateRangeIdx: index("leave_requests_date_range_idx").on(table.startDate, table.endDate),
  })
);

export const insertLeaveRequestSchema = createCoercedInsertSchema(leaveRequests).pick({
  companyId: true,
  employeeId: true,
  departmentId: true,
  leaveType: true,
  startDate: true,
  endDate: true,
  days: true,
  reason: true,
  status: true,
  approverId: true,
  approverName: true,
  approverComment: true,
  approvedAt: true,
  attachments: true,
  metadata: true,
});

// 加班申请表
export const overtimeRequests = pgTable(
  "overtime_requests",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    employeeId: varchar("employee_id", { length: 36 }).notNull(),
    departmentId: varchar("department_id", { length: 36 }),
    overtimeDate: timestamp("overtime_date", { withTimezone: true }).notNull(),
    startTime: timestamp("start_time", { withTimezone: true }).notNull(), // 加班开始时间
    endTime: timestamp("end_time", { withTimezone: true }).notNull(), // 加班结束时间
    duration: integer("duration").notNull(), // 加班时长（分钟）
    reason: text("reason").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, approved, rejected, cancelled
    approverId: varchar("approver_id", { length: 36 }),
    approverName: varchar("approver_name", { length: 128 }),
    approverComment: text("approver_comment"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    overtimeType: varchar("overtime_type", { length: 20 }).notNull().default("workday"), // workday, weekend, holiday
    payRate: integer("pay_rate").default(150), // 加班费率（百分比）
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("overtime_requests_company_id_idx").on(table.companyId),
    employeeIdIdx: index("overtime_requests_employee_id_idx").on(table.employeeId),
    statusIdx: index("overtime_requests_status_idx").on(table.status),
    overtimeDateIdx: index("overtime_requests_overtime_date_idx").on(table.overtimeDate),
  })
);

export const insertOvertimeRequestSchema = createCoercedInsertSchema(overtimeRequests).pick({
  companyId: true,
  employeeId: true,
  departmentId: true,
  overtimeDate: true,
  startTime: true,
  endTime: true,
  duration: true,
  reason: true,
  status: true,
  approverId: true,
  approverName: true,
  approverComment: true,
  approvedAt: true,
  overtimeType: true,
  payRate: true,
  metadata: true,
});

// 排班表
export const schedules = pgTable(
  "schedules",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    employeeId: varchar("employee_id", { length: 36 }).notNull(),
    scheduleDate: timestamp("schedule_date", { withTimezone: true }).notNull(), // 排班日期
    shiftType: varchar("shift_type", { length: 20 }).notNull(), // 早班、中班、晚班、夜班等
    shiftName: varchar("shift_name", { length: 50 }).notNull(), // 班次名称
    startTime: timestamp("start_time", { withTimezone: true }).notNull(), // 上班时间
    endTime: timestamp("end_time", { withTimezone: true }).notNull(), // 下班时间
    breakTime: integer("break_time").default(0), // 休息时长（分钟）
    isWorkingDay: boolean("is_working_day").notNull().default(true),
    notes: text("notes"),
    isActive: boolean("is_active").notNull().default(true),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("schedules_company_id_idx").on(table.companyId),
    employeeIdIdx: index("schedules_employee_id_idx").on(table.employeeId),
    scheduleDateIdx: index("schedules_schedule_date_idx").on(table.scheduleDate),
    compositeIdx: index("schedules_composite_idx").on(table.companyId, table.employeeId, table.scheduleDate),
  })
);

export const insertScheduleSchema = createCoercedInsertSchema(schedules).pick({
  companyId: true,
  employeeId: true,
  scheduleDate: true,
  shiftType: true,
  shiftName: true,
  startTime: true,
  endTime: true,
  breakTime: true,
  isWorkingDay: true,
  notes: true,
  isActive: true,
  metadata: true,
});

export const insertOfferSchema = createCoercedInsertSchema(offers).pick({
  companyId: true,
  candidateId: true,
  jobId: true,
  offerNumber: true,
  salary: true,
  salaryType: true,
  startDate: true,
  probationPeriod: true,
  benefits: true,
  conditions: true,
  status: true,
  sentAt: true,
  respondedAt: true,
  expiryDate: true,
  createdBy: true,
  approvedBy: true,
  approvedAt: true,
  notes: true,
  attachments: true,
  metadata: true,
});

// 考勤管理类型导出
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type InsertAttendanceRecord = z.infer<typeof insertAttendanceRecordSchema>;

export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;

export type OvertimeRequest = typeof overtimeRequests.$inferSelect;
export type InsertOvertimeRequest = z.infer<typeof insertOvertimeRequestSchema>;

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;

// 招聘管理类型导出
export type Offer = typeof offers.$inferSelect;

// ============ 薪酬管理表 ============

// 薪酬结构表
export const salaryStructures = pgTable(
  "salary_structures",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 128 }).notNull(),
    code: varchar("code", { length: 50 }).notNull(),
    description: text("description"),
    components: jsonb("components").notNull(), // 薪酬组成：[{ "name": "基本工资", "type": "base", "value": 10000, "isTaxable": true }]
    calculationRule: text("calculation_rule"), // 计算规则
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("salary_structures_company_id_idx").on(table.companyId),
    codeIdx: index("salary_structures_code_idx").on(table.code),
  })
);

// 薪资单表
export const payrollRecords = pgTable(
  "payroll_records",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    employeeId: varchar("employee_id", { length: 36 }).notNull(),
    period: varchar("period", { length: 20 }).notNull(), // 2024-01, 2024-Q1
    salaryStructureId: varchar("salary_structure_id", { length: 36 }),
    baseSalary: integer("base_salary").notNull(), // 基本工资（分）
    bonus: integer("bonus").default(0), // 奖金（分）
    allowance: integer("allowance").default(0), // 津贴（分）
    overtimePay: integer("overtime_pay").default(0), // 加班费（分）
    deduction: integer("deduction").default(0), // 扣款（分）
    socialInsurance: integer("social_insurance").default(0), // 社保（分）
    tax: integer("tax").default(0), // 个税（分）
    grossPay: integer("gross_pay").notNull(), // 税前薪资（分）
    netPay: integer("net_pay").notNull(), // 实发薪资（分）
    workDays: integer("work_days").default(0), // 工作天数
    actualWorkDays: integer("actual_work_days").default(0), // 实际工作天数
    paidLeaveDays: integer("paid_leave_days").default(0), // 带薪假期天数
    unpaidLeaveDays: integer("unpaid_leave_days").default(0), // 无薪假期天数
    overtimeHours: integer("overtime_hours").default(0), // 加班时长（小时）
    status: varchar("status", { length: 20 })
      .notNull()
      .default("draft"), // draft, calculated, paid, cancelled
    calculatedAt: timestamp("calculated_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    paymentMethod: varchar("payment_method", { length: 50 }), // bank, cash
    paymentAccount: varchar("payment_account", { length: 100 }),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("payroll_records_company_id_idx").on(table.companyId),
    employeeIdIdx: index("payroll_records_employee_id_idx").on(table.employeeId),
    periodIdx: index("payroll_records_period_idx").on(table.period),
    statusIdx: index("payroll_records_status_idx").on(table.status),
    uniqueIdx: index("payroll_records_unique_idx").on(table.companyId, table.employeeId, table.period),
  })
);

// 社保缴纳记录表
export const socialInsuranceRecords = pgTable(
  "social_insurance_records",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    employeeId: varchar("employee_id", { length: 36 }).notNull(),
    period: varchar("period", { length: 20 }).notNull(),
    insuranceType: varchar("insurance_type", { length: 20 }).notNull(), // pension, medical, unemployment, work_injury, maternity, housing
    companyBase: integer("company_base").notNull(), // 公司缴费基数
    employeeBase: integer("employee_base").notNull(), // 个人缴费基数
    companyRate: integer("company_rate").notNull(), // 公司缴费比例（千分比）
    employeeRate: integer("employee_rate").notNull(), // 个人缴费比例（千分比）
    companyAmount: integer("company_amount").notNull(), // 公司缴费金额（分）
    employeeAmount: integer("employee_amount").notNull(), // 个人缴费金额（分）
    totalAmount: integer("total_amount").notNull(), // 总金额（分）
    paidAt: timestamp("paid_at", { withTimezone: true }),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("social_insurance_records_company_id_idx").on(table.companyId),
    employeeIdIdx: index("social_insurance_records_employee_id_idx").on(table.employeeId),
    periodIdx: index("social_insurance_records_period_idx").on(table.period),
    insuranceTypeIdx: index("social_insurance_records_insurance_type_idx").on(table.insuranceType),
  })
)

// ============ 薪酬管理类型导出 ============
export type SalaryStructure = typeof salaryStructures.$inferSelect;
export type PayrollRecord = typeof payrollRecords.$inferSelect;
export type SocialInsuranceRecord = typeof socialInsuranceRecords.$inferSelect;

export const insertSalaryStructureSchema = createCoercedInsertSchema(salaryStructures).pick({
  companyId: true,
  name: true,
  code: true,
  description: true,
  components: true,
  calculationRule: true,
  isActive: true,
});

export const insertPayrollRecordSchema = createCoercedInsertSchema(payrollRecords).pick({
  companyId: true,
  employeeId: true,
  period: true,
  salaryStructureId: true,
  baseSalary: true,
  bonus: true,
  allowance: true,
  overtimePay: true,
  deduction: true,
  socialInsurance: true,
  tax: true,
  grossPay: true,
  netPay: true,
  workDays: true,
  actualWorkDays: true,
  paidLeaveDays: true,
  unpaidLeaveDays: true,
  overtimeHours: true,
  status: true,
  calculatedAt: true,
  paidAt: true,
  paymentMethod: true,
  paymentAccount: true,
  notes: true,
  metadata: true,
});

export const insertSocialInsuranceRecordSchema = createCoercedInsertSchema(socialInsuranceRecords).pick({
  companyId: true,
  employeeId: true,
  period: true,
  insuranceType: true,
  companyBase: true,
  employeeBase: true,
  companyRate: true,
  employeeRate: true,
  companyAmount: true,
  employeeAmount: true,
  totalAmount: true,
  paidAt: true,
  notes: true,
  metadata: true,
});

export type InsertSalaryStructure = z.infer<typeof insertSalaryStructureSchema>;
export type InsertPayrollRecord = z.infer<typeof insertPayrollRecordSchema>;
export type InsertSocialInsuranceRecord = z.infer<typeof insertSocialInsuranceRecordSchema>;

// ============ 培训管理表 ============

// 培训课程表
export const trainingCourses = pgTable(
  "training_courses",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    type: varchar("type", { length: 20 }).notNull(), // online, offline, workshop, mentorship, webinar, e_learning, self_paced, blended
    category: varchar("category", { length: 50 }), // 培训分类：领导力、技术、管理等
    tags: jsonb("tags"), // 标签数组
    skills: jsonb("skills"), // 培训技能数组
    duration: integer("duration").notNull(), // 培训时长（小时）
    difficulty: varchar("difficulty", { length: 20 }), // beginner, intermediate, advanced
    provider: varchar("provider", { length: 128 }), // 培训提供方
    rating: integer("rating").default(0), // 评分 0-5
    reviewCount: integer("review_count").default(0), // 评价人数
    price: integer("price"), // 价格（分）
    currency: varchar("currency", { length: 10 }).default("CNY"),
    prerequisites: jsonb("prerequisites"), // 前置条件
    learningObjectives: jsonb("learning_objectives"), // 学习目标
    targetAudience: jsonb("target_audience"), // 目标受众
    materials: jsonb("materials"), // 培训材料：[{ "type": "video", "url": "...", "title": "..." }, ...]
    maxParticipants: integer("max_participants"), // 最大参与人数
    location: varchar("location", { length: 255 }), // 培训地点（线下）
    schedule: jsonb("schedule"), // 培训时间安排
    instructorId: varchar("instructor_id", { length: 36 }), // 讲师ID
    isActive: boolean("is_active").notNull().default(true),
    isPublic: boolean("is_public").notNull().default(false), // 是否公开
    metadata: jsonb("metadata"),
    createdBy: varchar("created_by", { length: 36 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("training_courses_company_id_idx").on(table.companyId),
    typeIdx: index("training_courses_type_idx").on(table.type),
    categoryIdx: index("training_courses_category_idx").on(table.category),
    instructorIdIdx: index("training_courses_instructor_id_idx").on(table.instructorId),
    isActiveIdx: index("training_courses_is_active_idx").on(table.isActive),
  })
);

// 培训记录表
export const trainingRecords = pgTable(
  "training_records",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    courseId: varchar("course_id", { length: 36 }).notNull(),
    employeeId: varchar("employee_id", { length: 36 }).notNull(),
    employeeName: varchar("employee_name", { length: 128 }),
    courseTitle: varchar("course_title", { length: 255 }).notNull(), // 快照
    enrollmentDate: timestamp("enrollment_date", { withTimezone: true })
      .defaultNow()
      .notNull(), // 报名时间
    startDate: timestamp("start_date", { withTimezone: true }), // 开始时间
    endDate: timestamp("end_date", { withTimezone: true }), // 结束时间
    progress: integer("progress").default(0), // 进度 0-100
    completionDate: timestamp("completion_date", { withTimezone: true }), // 完成时间
    status: varchar("status", { length: 20 })
      .notNull()
      .default("enrolled"), // enrolled, in_progress, completed, dropped, cancelled
    score: integer("score"), // 成绩
    maxScore: integer("max_score"),
    grade: varchar("grade", { length: 20 }), // 等级：A, B, C, D, F
    certificateUrl: text("certificate_url"), // 证书URL
    feedback: text("feedback"), // 学员反馈
    rating: integer("rating"), // 评分 0-5
    instructorId: varchar("instructor_id", { length: 36 }),
    attendance: jsonb("attendance"), // 考勤记录
    learningHours: integer("learning_hours").default(0), // 实际学习时长（小时）
    cost: integer("cost"), // 培训成本（分）
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("training_records_company_id_idx").on(table.companyId),
    courseIdIdx: index("training_records_course_id_idx").on(table.courseId),
    employeeIdIdx: index("training_records_employee_id_idx").on(table.employeeId),
    statusIdx: index("training_records_status_idx").on(table.status),
    enrollmentDateIdx: index("training_records_enrollment_date_idx").on(table.enrollmentDate),
  })
);

// ============ 培训管理类型导出 ============
export type TrainingCourse = typeof trainingCourses.$inferSelect;
export type TrainingRecord = typeof trainingRecords.$inferSelect;

export const insertTrainingCourseSchema = createCoercedInsertSchema(trainingCourses).pick({
  companyId: true,
  title: true,
  description: true,
  type: true,
  category: true,
  tags: true,
  skills: true,
  duration: true,
  difficulty: true,
  provider: true,
  price: true,
  currency: true,
  prerequisites: true,
  learningObjectives: true,
  targetAudience: true,
  materials: true,
  maxParticipants: true,
  location: true,
  schedule: true,
  instructorId: true,
  isActive: true,
  isPublic: true,
  metadata: true,
  createdBy: true,
});

export const insertTrainingRecordSchema = createCoercedInsertSchema(trainingRecords).pick({
  companyId: true,
  courseId: true,
  employeeId: true,
  employeeName: true,
  courseTitle: true,
  enrollmentDate: true,
  startDate: true,
  endDate: true,
  progress: true,
  completionDate: true,
  status: true,
  score: true,
  maxScore: true,
  grade: true,
  certificateUrl: true,
  feedback: true,
  rating: true,
  instructorId: true,
  attendance: true,
  learningHours: true,
  cost: true,
  metadata: true,
});

export type InsertTrainingCourse = z.infer<typeof insertTrainingCourseSchema>;
export type InsertTrainingRecord = z.infer<typeof insertTrainingRecordSchema>;

// ============ 简历评估模板表 ============
export const assessmentTemplates = pgTable(
  "assessment_templates",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 })
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 50 }).notNull().default("resume"), // resume, interview, performance
    isDefault: boolean("is_default").notNull().default(false), // 是否为默认模板
    isActive: boolean("is_active").notNull().default(true),
    passThreshold: integer("pass_threshold").notNull().default(60), // 及格阈值
    totalWeight: integer("total_weight").notNull().default(100), // 总权重
    createdBy: varchar("created_by", { length: 36 })
      .notNull()
      .references(() => users.id),
    updatedBy: varchar("updated_by", { length: 36 }).references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("assessment_templates_company_id_idx").on(table.companyId),
    categoryIdx: index("assessment_templates_category_idx").on(table.category),
  })
);

// ============ 简历评估维度表 ============
export const assessmentDimensions = pgTable(
  "assessment_dimensions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    templateId: varchar("template_id", { length: 36 })
      .notNull()
      .references(() => assessmentTemplates.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 50 }).notNull(), // 维度代码，如 completeness, accuracy
    description: text("description"),
    weight: integer("weight").notNull().default(100), // 权重
    maxScore: integer("max_score").notNull().default(100), // 满分
    evaluationCriteria: jsonb("evaluation_criteria"), // 评估标准（JSON格式）
    sortOrder: integer("sort_order").notNull().default(0), // 排序
    isRequired: boolean("is_required").notNull().default(true), // 是否必需
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    templateIdIdx: index("assessment_dimensions_template_id_idx").on(table.templateId),
    codeIdx: index("assessment_dimensions_code_idx").on(table.code),
  })
);

// ============ 简历评估报告表 ============
export const assessmentReports = pgTable(
  "assessment_reports",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 })
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    templateId: varchar("template_id", { length: 36 })
      .references(() => assessmentTemplates.id, { onDelete: "set null" }),
    targetId: varchar("target_id", { length: 36 }).notNull(), // 评估目标ID（候选人ID、员工ID等）
    targetType: varchar("target_type", { length: 50 }).notNull(), // candidate, employee
    overallScore: integer("overall_score").notNull(), // 总分
    passScore: integer("pass_score").notNull().default(60), // 及格分数
    passed: boolean("passed").notNull(), // 是否及格
    dimensionScores: jsonb("dimension_scores").notNull(), // 各维度得分（JSON格式）
    issues: jsonb("issues"), // 问题列表
    recommendations: jsonb("recommendations"), // 建议列表
    confidenceLevel: varchar("confidence_level", { length: 20 }), // high, medium, low
    metadata: jsonb("metadata"), // 其他元数据
    evaluatedBy: varchar("evaluated_by", { length: 36 })
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    companyIdIdx: index("assessment_reports_company_id_idx").on(table.companyId),
    templateIdIdx: index("assessment_reports_template_id_idx").on(table.templateId),
    targetIdIdx: index("assessment_reports_target_id_idx").on(table.targetId),
    targetTypeIdx: index("assessment_reports_target_type_idx").on(table.targetType),
    createdAtIdx: index("assessment_reports_created_at_idx").on(table.createdAt),
  })
);

// ============ 简历评估模板相关 Schema ============
export const insertAssessmentTemplateSchema = createCoercedInsertSchema(assessmentTemplates).pick({
  companyId: true,
  name: true,
  description: true,
  category: true,
  isDefault: true,
  isActive: true,
  passThreshold: true,
  totalWeight: true,
  createdBy: true,
  updatedBy: true,
});

export const insertAssessmentDimensionSchema = createCoercedInsertSchema(assessmentDimensions).pick({
  templateId: true,
  name: true,
  code: true,
  description: true,
  weight: true,
  maxScore: true,
  evaluationCriteria: true,
  sortOrder: true,
  isRequired: true,
});

export const insertAssessmentReportSchema = createCoercedInsertSchema(assessmentReports).pick({
  companyId: true,
  templateId: true,
  targetId: true,
  targetType: true,
  overallScore: true,
  passScore: true,
  passed: true,
  dimensionScores: true,
  issues: true,
  recommendations: true,
  confidenceLevel: true,
  metadata: true,
  evaluatedBy: true,
});

export type InsertAssessmentTemplate = z.infer<typeof insertAssessmentTemplateSchema>;
export type InsertAssessmentDimension = z.infer<typeof insertAssessmentDimensionSchema>;
export type InsertAssessmentReport = z.infer<typeof insertAssessmentReportSchema>;

// ============ 验证码相关类型导出 ============
export type VerificationCode = typeof verificationCodes.$inferSelect;

export const insertVerificationCodeSchema = createCoercedInsertSchema(verificationCodes).pick({
  identifier: true,
  code: true,
  purpose: true,
  type: true,
  expiresAt: true,
  ipAddress: true,
  metadata: true,
});

export type InsertVerificationCode = z.infer<typeof insertVerificationCodeSchema>;

// ============ 短信配置表 ============
export const smsConfigs = pgTable(
  "sms_configs",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(), // 配置名称
    provider: varchar("provider", { length: 50 }).notNull(), // 服务商：aliyun, tencent, qcloud, custom
    accessKeyId: varchar("access_key_id", { length: 255 }).notNull(), // AccessKey ID
    accessKeySecret: text("access_key_secret").notNull(), // AccessKey Secret（加密存储）
    endpoint: varchar("endpoint", { length: 500 }), // API端点
    signName: varchar("sign_name", { length: 100 }).notNull(), // 短信签名
    region: varchar("region", { length: 50 }), // 区域
    isDefault: boolean("is_default").notNull().default(false), // 是否默认配置
    isActive: boolean("is_active").notNull().default(true), // 是否启用
    dailyLimit: integer("daily_limit"), // 每日发送限制
    hourlyLimit: integer("hourly_limit"), // 每小时发送限制
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }), // 最后使用时间
    testStatus: varchar("test_status", { length: 20 }), // 测试状态：success, failed, pending
    testResult: text("test_result"), // 测试结果详情
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("sms_configs_company_id_idx").on(table.companyId),
    isActiveIdx: index("sms_configs_is_active_idx").on(table.isActive),
  })
);

// ============ 短信模板表 ============
export const smsTemplates = pgTable(
  "sms_templates",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }), // 企业ID（系统模板为null）
    name: varchar("name", { length: 255 }).notNull(), // 模板名称
    code: varchar("code", { length: 100 }).notNull(), // 模板代码（唯一标识）
    category: varchar("category", { length: 50 }).notNull(), // 分类：verification, notification, marketing, system
    templateId: varchar("template_id", { length: 100 }), // 服务商模板ID
    content: text("content").notNull(), // 模板内容（支持变量）
    variables: jsonb("variables"), // 支持的变量列表：["{{code}}", "{{name}}"]
    description: text("description"), // 模板描述
    isSystem: boolean("is_system").notNull().default(false), // 是否系统模板
    isActive: boolean("is_active").notNull().default(true), // 是否启用
    usageCount: integer("usage_count").notNull().default(0), // 使用次数
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }), // 最后使用时间
    auditStatus: varchar("audit_status", { length: 20 }), // 审核状态：pending, approved, rejected
    auditReason: text("audit_reason"), // 审核原因
    createdBy: varchar("created_by", { length: 36 }), // 创建人
    updatedBy: varchar("updated_by", { length: 36 }), // 更新人
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("sms_templates_company_id_idx").on(table.companyId),
    codeIdx: index("sms_templates_code_idx").on(table.code),
    categoryIdx: index("sms_templates_category_idx").on(table.category),
    isActiveIdx: index("sms_templates_is_active_idx").on(table.isActive),
  })
);

// ============ 短信发送记录表 ============
export const smsLogs = pgTable(
  "sms_logs",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    templateId: varchar("template_id", { length: 36 }), // 短信模板ID
    configId: varchar("config_id", { length: 36 }), // 使用的短信配置ID
    phoneNumber: varchar("phone_number", { length: 20 }).notNull(), // 手机号
    content: text("content").notNull(), // 短信内容
    variables: jsonb("variables"), // 使用的变量
    status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, sending, success, failed
    error: text("error"), // 错误信息
    messageId: varchar("message_id", { length: 500 }), // 短信服务商返回的消息ID
    bizId: varchar("biz_id", { length: 500 }), // 业务ID
    sentAt: timestamp("sent_at", { withTimezone: true }), // 发送时间
    deliveredAt: timestamp("delivered_at", { withTimezone: true }), // 投递时间
    cost: integer("cost"), // 费用（分）
    metadata: jsonb("metadata"), // 其他元数据
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("sms_logs_company_id_idx").on(table.companyId),
    templateIdIdx: index("sms_logs_template_id_idx").on(table.templateId),
    configIdIdx: index("sms_logs_config_id_idx").on(table.configId),
    phoneNumberIdx: index("sms_logs_phone_number_idx").on(table.phoneNumber),
    statusIdx: index("sms_logs_status_idx").on(table.status),
    createdAtIdx: index("sms_logs_created_at_idx").on(table.createdAt),
  })
);

// ============ 短信统计表 ============
export const smsStatistics = pgTable(
  "sms_statistics",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    configId: varchar("config_id", { length: 36 }), // 短信配置ID
    templateId: varchar("template_id", { length: 36 }), // 短信模板ID
    period: varchar("period", { length: 20 }).notNull(), // daily, weekly, monthly, yearly
    periodValue: varchar("period_value", { length: 20 }).notNull(), // 2024-01, 2024-Q1
    totalCount: integer("total_count").notNull().default(0), // 总发送数
    successCount: integer("success_count").notNull().default(0), // 成功数
    failedCount: integer("failed_count").notNull().default(0), // 失败数
    totalCost: integer("total_cost").notNull().default(0), // 总费用（分）
    successRate: integer("success_rate"), // 成功率（0-100）
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("sms_statistics_company_id_idx").on(table.companyId),
    configIdIdx: index("sms_statistics_config_id_idx").on(table.configId),
    templateIdIdx: index("sms_statistics_template_id_idx").on(table.templateId),
    periodIdx: index("sms_statistics_period_idx").on(table.period),
    uniqueIdx: index("sms_statistics_unique_idx").on(
      table.companyId,
      table.configId,
      table.templateId,
      table.period,
      table.periodValue
    ),
  })
);

// ============ 邮件服务 ============

// SMTP配置表
export const smtpConfigs = pgTable(
  "smtp_configs",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(), // 配置名称
    provider: varchar("provider", { length: 20 }).notNull(), // smtp, sendgrid, aliyun, tencent
    host: varchar("host", { length: 255 }).notNull(), // SMTP服务器地址
    port: integer("port").notNull().default(587), // 端口号
    secure: boolean("secure").notNull().default(false), // 是否使用SSL
    username: varchar("username", { length: 255 }).notNull(), // SMTP用户名
    password: varchar("password", { length: 500 }).notNull(), // SMTP密码（加密存储）
    fromName: varchar("from_name", { length: 100 }), // 发件人名称
    fromAddress: varchar("from_address", { length: 255 }).notNull(), // 发件人地址
    isDefault: boolean("is_default").notNull().default(false), // 是否默认配置
    isActive: boolean("is_active").notNull().default(true), // 是否启用
    dailyLimit: integer("daily_limit").notNull().default(1000), // 每日发送限制
    hourlyLimit: integer("hourly_limit").notNull().default(100), // 每小时发送限制
    metadata: jsonb("metadata"),
    createdBy: varchar("created_by", { length: 36 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("smtp_configs_company_id_idx").on(table.companyId),
    providerIdx: index("smtp_configs_provider_idx").on(table.provider),
    isDefaultIdx: index("smtp_configs_is_default_idx").on(table.isDefault),
  })
);

// 邮件模板表
export const emailTemplates = pgTable(
  "email_templates",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }), // null表示系统模板
    name: varchar("name", { length: 255 }).notNull(), // 模板名称
    code: varchar("code", { length: 50 }).notNull(), // 模板代码
    category: varchar("category", { length: 50 }).notNull(), // 模板分类：verification, notification, marketing, system
    subject: varchar("subject", { length: 500 }).notNull(), // 邮件主题
    htmlContent: text("html_content").notNull(), // HTML内容
    textContent: text("text_content"), // 纯文本内容
    variables: jsonb("variables").notNull(), // 变量列表：["{{code}}", "{{name}}"]
    description: text("description"), // 模板描述
    isSystem: boolean("is_system").notNull().default(false), // 是否系统模板
    isActive: boolean("is_active").notNull().default(true), // 是否启用
    usageCount: integer("usage_count").notNull().default(0), // 使用次数
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("email_templates_company_id_idx").on(table.companyId),
    codeIdx: index("email_templates_code_idx").on(table.code),
    categoryIdx: index("email_templates_category_idx").on(table.category),
  })
);

// 邮件发送记录表
export const emailLogs = pgTable(
  "email_logs",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    templateId: varchar("template_id", { length: 36 }), // 邮件模板ID
    configId: varchar("config_id", { length: 36 }), // SMTP配置ID
    toAddress: varchar("to_address", { length: 255 }).notNull(), // 收件人地址
    toName: varchar("to_name", { length: 100 }), // 收件人姓名
    ccAddresses: jsonb("cc_addresses"), // 抄送地址：["email1@example.com", "email2@example.com"]
    bccAddresses: jsonb("bcc_addresses"), // 密送地址
    subject: varchar("subject", { length: 500 }).notNull(), // 邮件主题
    htmlContent: text("html_content"), // HTML内容
    textContent: text("text_content"), // 纯文本内容
    variables: jsonb("variables"), // 变量值：{"code": "123456", "name": "张三"}
    status: varchar("status", { length: 20 })
      .notNull()
      .default("pending"), // pending, sending, success, failed, bounced
    messageId: varchar("message_id", { length: 255 }), // 邮件服务返回的消息ID
    error: text("error"), // 错误信息
    sentAt: timestamp("sent_at", { withTimezone: true }), // 发送时间
    deliveredAt: timestamp("delivered_at", { withTimezone: true }), // 投递时间
    openedAt: timestamp("opened_at", { withTimezone: true }), // 打开时间
    clickedAt: timestamp("clicked_at", { withTimezone: true }), // 点击时间
    bouncedAt: timestamp("bounced_at", { withTimezone: true }), // 退回时间
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    companyIdIdx: index("email_logs_company_id_idx").on(table.companyId),
    templateIdIdx: index("email_logs_template_id_idx").on(table.templateId),
    configIdIdx: index("email_logs_config_id_idx").on(table.configId),
    toAddressIdx: index("email_logs_to_address_idx").on(table.toAddress),
    statusIdx: index("email_logs_status_idx").on(table.status),
    createdAtIdx: index("email_logs_created_at_idx").on(table.createdAt),
  })
);

// 邮件统计表
export const emailStatistics = pgTable(
  "email_statistics",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    configId: varchar("config_id", { length: 36 }), // SMTP配置ID
    templateId: varchar("template_id", { length: 36 }), // 邮件模板ID
    period: varchar("period", { length: 20 }).notNull(), // daily, weekly, monthly, yearly
    periodValue: varchar("period_value", { length: 20 }).notNull(), // 2024-01, 2024-Q1
    totalCount: integer("total_count").notNull().default(0), // 总发送数
    successCount: integer("success_count").notNull().default(0), // 成功数
    failedCount: integer("failed_count").notNull().default(0), // 失败数
    openedCount: integer("opened_count").notNull().default(0), // 打开数
    clickedCount: integer("clicked_count").notNull().default(0), // 点击数
    bouncedCount: integer("bounced_count").notNull().default(0), // 退回数
    openRate: integer("open_rate"), // 打开率（0-100）
    clickRate: integer("click_rate"), // 点击率（0-100）
    bounceRate: integer("bounce_rate"), // 退回率（0-100）
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("email_statistics_company_id_idx").on(table.companyId),
    configIdIdx: index("email_statistics_config_id_idx").on(table.configId),
    templateIdIdx: index("email_statistics_template_id_idx").on(table.templateId),
    periodIdx: index("email_statistics_period_idx").on(table.period),
    uniqueIdx: index("email_statistics_unique_idx").on(
      table.companyId,
      table.configId,
      table.templateId,
      table.period,
      table.periodValue
    ),
  })
);

// ============ 短信相关Schema导出 ============
export const insertSmsConfigSchema = createCoercedInsertSchema(smsConfigs).pick({
  companyId: true,
  name: true,
  provider: true,
  accessKeyId: true,
  accessKeySecret: true,
  endpoint: true,
  signName: true,
  region: true,
  isDefault: true,
  isActive: true,
  dailyLimit: true,
  hourlyLimit: true,
  metadata: true,
});

export const insertSmsTemplateSchema = createCoercedInsertSchema(smsTemplates).pick({
  companyId: true,
  name: true,
  code: true,
  category: true,
  templateId: true,
  content: true,
  variables: true,
  description: true,
  isSystem: true,
  isActive: true,
  createdBy: true,
});

export const insertSmsLogSchema = createCoercedInsertSchema(smsLogs).pick({
  companyId: true,
  templateId: true,
  configId: true,
  phoneNumber: true,
  content: true,
  variables: true,
  status: true,
  error: true,
  messageId: true,
  bizId: true,
  metadata: true,
});

export const insertSmsStatisticsSchema = createCoercedInsertSchema(smsStatistics).pick({
  companyId: true,
  configId: true,
  templateId: true,
  period: true,
  periodValue: true,
  totalCount: true,
  successCount: true,
  failedCount: true,
  totalCost: true,
  successRate: true,
});

export type InsertSmsConfig = z.infer<typeof insertSmsConfigSchema>;
export type InsertSmsTemplate = z.infer<typeof insertSmsTemplateSchema>;
export type InsertSmsLog = z.infer<typeof insertSmsLogSchema>;
export type InsertSmsStatistics = z.infer<typeof insertSmsStatisticsSchema>;

// ============ 邮件相关Schema导出 ============
export const insertSmtpConfigSchema = createCoercedInsertSchema(smtpConfigs).pick({
  companyId: true,
  name: true,
  provider: true,
  host: true,
  port: true,
  secure: true,
  username: true,
  password: true,
  fromName: true,
  fromAddress: true,
  isDefault: true,
  isActive: true,
  dailyLimit: true,
  hourlyLimit: true,
  metadata: true,
});

export const insertEmailTemplateSchema = createCoercedInsertSchema(emailTemplates).pick({
  companyId: true,
  name: true,
  code: true,
  category: true,
  subject: true,
  htmlContent: true,
  textContent: true,
  variables: true,
  description: true,
  isSystem: true,
  isActive: true,
  createdBy: true,
});

export const insertEmailLogSchema = createCoercedInsertSchema(emailLogs).pick({
  companyId: true,
  templateId: true,
  configId: true,
  toAddress: true,
  toName: true,
  ccAddresses: true,
  bccAddresses: true,
  subject: true,
  htmlContent: true,
  textContent: true,
  variables: true,
  status: true,
  messageId: true,
  error: true,
  metadata: true,
});

export const insertEmailStatisticsSchema = createCoercedInsertSchema(emailStatistics).pick({
  companyId: true,
  configId: true,
  templateId: true,
  period: true,
  periodValue: true,
  totalCount: true,
  successCount: true,
  failedCount: true,
  openedCount: true,
  clickedCount: true,
  bouncedCount: true,
  openRate: true,
  clickRate: true,
  bounceRate: true,
});

export type InsertSmtpConfig = z.infer<typeof insertSmtpConfigSchema>;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type InsertEmailLog = z.infer<typeof insertEmailLogSchema>;
export type InsertEmailStatistics = z.infer<typeof insertEmailStatisticsSchema>;

// ============ 数据加密 ============

// 加密密钥表
export const encryptionKeys = pgTable(
  "encryption_keys",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(), // 密钥名称
    keyData: text("key_data").notNull(), // 加密后的密钥数据（使用主密钥包装）
    keyFingerprint: varchar("key_fingerprint", { length: 16 }).notNull(), // 密钥指纹
    version: integer("version").notNull().default(1), // 密钥版本
    isActive: boolean("is_active").notNull().default(false), // 是否激活
    isMaster: boolean("is_master").notNull().default(false), // 是否为主密钥
    description: text("description"), // 密钥描述
    expiresAt: timestamp("expires_at", { withTimezone: true }), // 过期时间
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }), // 最后使用时间
    metadata: jsonb("metadata"),
    createdBy: varchar("created_by", { length: 36 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("encryption_keys_company_id_idx").on(table.companyId),
    keyFingerprintIdx: index("encryption_keys_key_fingerprint_idx").on(table.keyFingerprint),
    isActiveIdx: index("encryption_keys_is_active_idx").on(table.isActive),
  })
);

// 加密策略表
export const encryptionPolicies = pgTable(
  "encryption_policies",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(), // 策略名称
    tableName: varchar("table_name", { length: 100 }).notNull(), // 表名
    columnName: varchar("column_name", { length: 100 }).notNull(), // 列名
    keyId: varchar("key_id", { length: 36 }).notNull(), // 使用的密钥ID
    encryptionType: varchar("encryption_type", { length: 20 }).notNull(), // 加密类型：field, row, column
    isActive: boolean("is_active").notNull().default(true), // 是否启用
    description: text("description"), // 策略描述
    metadata: jsonb("metadata"),
    createdBy: varchar("created_by", { length: 36 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("encryption_policies_company_id_idx").on(table.companyId),
    tableColumnIdx: index("encryption_policies_table_column_idx").on(table.tableName, table.columnName),
    keyIdIdx: index("encryption_policies_key_id_idx").on(table.keyId),
    isActiveIdx: index("encryption_policies_is_active_idx").on(table.isActive),
  })
);

// 加密审计日志表
export const encryptionAuditLogs = pgTable(
  "encryption_audit_logs",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    operation: varchar("operation", { length: 20 }).notNull(), // encrypt, decrypt, key_create, key_rotate, key_delete
    tableName: varchar("table_name", { length: 100 }), // 操作的表名
    columnName: varchar("column_name", { length: 100 }), // 操作的列名
    recordId: varchar("record_id", { length: 36 }), // 操作的记录ID
    keyId: varchar("key_id", { length: 36 }), // 使用的密钥ID
    keyVersion: integer("key_version"), // 密钥版本
    ipAddress: varchar("ip_address", { length: 50 }), // IP地址
    userAgent: text("user_agent"), // 用户代理
    status: varchar("status", { length: 20 }).notNull(), // success, failed
    errorMessage: text("error_message"), // 错误信息
    metadata: jsonb("metadata"),
    performedBy: varchar("performed_by", { length: 36 }).notNull(), // 操作人ID
    performedByName: varchar("performed_by_name", { length: 128 }), // 操作人姓名
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    companyIdIdx: index("encryption_audit_logs_company_id_idx").on(table.companyId),
    operationIdx: index("encryption_audit_logs_operation_idx").on(table.operation),
    keyIdIdx: index("encryption_audit_logs_key_id_idx").on(table.keyId),
    recordIdIdx: index("encryption_audit_logs_record_id_idx").on(table.recordId),
    createdAtIdx: index("encryption_audit_logs_created_at_idx").on(table.createdAt),
  })
);

// ============ 加密相关Schema导出 ============
export const insertEncryptionKeySchema = createCoercedInsertSchema(encryptionKeys).pick({
  companyId: true,
  name: true,
  keyData: true,
  keyFingerprint: true,
  version: true,
  isActive: true,
  isMaster: true,
  description: true,
  expiresAt: true,
  metadata: true,
  createdBy: true,
});

export const insertEncryptionPolicySchema = createCoercedInsertSchema(encryptionPolicies).pick({
  companyId: true,
  name: true,
  tableName: true,
  columnName: true,
  keyId: true,
  encryptionType: true,
  isActive: true,
  description: true,
  metadata: true,
  createdBy: true,
});

export const insertEncryptionAuditLogSchema = createCoercedInsertSchema(encryptionAuditLogs).pick({
  companyId: true,
  operation: true,
  tableName: true,
  columnName: true,
  recordId: true,
  keyId: true,
  keyVersion: true,
  ipAddress: true,
  userAgent: true,
  status: true,
  errorMessage: true,
  metadata: true,
  performedBy: true,
  performedByName: true,
});

export type InsertEncryptionKey = z.infer<typeof insertEncryptionKeySchema>;
export type InsertEncryptionPolicy = z.infer<typeof insertEncryptionPolicySchema>;
export type InsertEncryptionAuditLog = z.infer<typeof insertEncryptionAuditLogSchema>;

// ============ 权限精细化控制表 ============

// 自定义角色表
export const customRoles = pgTable(
  "custom_roles",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(), // 所属企业
    name: varchar("name", { length: 100 }).notNull(), // 角色名称
    code: varchar("code", { length: 50 }).notNull(), // 角色代码，唯一标识
    description: text("description"), // 角色描述
    level: integer("level").notNull().default(0), // 角色级别，数值越大权限越高
    isSystem: boolean("is_system").notNull().default(false), // 是否系统预置角色
    isActive: boolean("is_active").notNull().default(true), // 是否启用
    metadata: jsonb("metadata"), // 其他元数据
    createdBy: varchar("created_by", { length: 36 }).notNull(), // 创建人
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("custom_roles_company_id_idx").on(table.companyId),
    companyIdCodeIdx: index("custom_roles_company_code_idx").on(table.companyId, table.code),
    isActiveIdx: index("custom_roles_is_active_idx").on(table.isActive),
  })
);

// 自定义权限表
export const customPermissions = pgTable(
  "custom_permissions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }), // 所属企业，null表示全局权限
    module: varchar("module", { length: 50 }).notNull(), // 模块名称（如：user, employee, recruitment）
    resource: varchar("resource", { length: 50 }).notNull(), // 资源名称（如：user, employee, job）
    action: varchar("action", { length: 50 }).notNull(), // 操作名称（如：view, create, edit, delete）
    code: varchar("code", { length: 100 }).notNull().unique(), // 权限代码，格式：module.resource.action
    name: varchar("name", { length: 200 }).notNull(), // 权限名称
    description: text("description"), // 权限描述
    isSystem: boolean("is_system").notNull().default(false), // 是否系统预置权限
    isActive: boolean("is_active").notNull().default(true), // 是否启用
    metadata: jsonb("metadata"), // 其他元数据
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("custom_permissions_company_id_idx").on(table.companyId),
    moduleIdx: index("custom_permissions_module_idx").on(table.module),
    codeIdx: index("custom_permissions_code_idx").on(table.code),
    isActiveIdx: index("custom_permissions_is_active_idx").on(table.isActive),
  })
);

// 角色权限关联表
export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    roleId: varchar("role_id", { length: 36 }).notNull(), // 角色ID
    permissionId: varchar("permission_id", { length: 36 }).notNull(), // 权限ID
    grantedBy: varchar("granted_by", { length: 36 }).notNull(), // 授权人
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    roleIdIdx: index("role_permissions_role_id_idx").on(table.roleId),
    permissionIdIdx: index("role_permissions_permission_id_idx").on(table.permissionId),
    roleIdPermissionIdIdx: index("role_permissions_role_permission_idx").on(table.roleId, table.permissionId),
  })
);

// 字段级权限表
export const fieldPermissions = pgTable(
  "field_permissions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(), // 所属企业
    roleId: varchar("role_id", { length: 36 }), // 角色ID（可选，为null表示全局字段权限）
    module: varchar("module", { length: 50 }).notNull(), // 模块名称
    tableName: varchar("table_name", { length: 100 }).notNull(), // 表名
    fieldName: varchar("field_name", { length: 100 }).notNull(), // 字段名
    permission: varchar("permission", { length: 20 }).notNull(), // 权限类型：view, edit, hide
    condition: text("condition"), // 权限条件（JSON格式的条件表达式）
    metadata: jsonb("metadata"), // 其他元数据
    createdBy: varchar("created_by", { length: 36 }).notNull(), // 创建人
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("field_permissions_company_id_idx").on(table.companyId),
    roleIdIdx: index("field_permissions_role_id_idx").on(table.roleId),
    tableFieldIdx: index("field_permissions_table_field_idx").on(table.tableName, table.fieldName),
  })
);

// 操作级权限表
export const operationPermissions = pgTable(
  "operation_permissions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(), // 所属企业
    roleId: varchar("role_id", { length: 36 }).notNull(), // 角色ID
    module: varchar("module", { length: 50 }).notNull(), // 模块名称
    operation: varchar("operation", { length: 100 }).notNull(), // 操作代码
    allowed: boolean("allowed").notNull().default(true), // 是否允许
    condition: text("condition"), // 权限条件
    metadata: jsonb("metadata"), // 其他元数据
    createdBy: varchar("created_by", { length: 36 }).notNull(), // 创建人
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("operation_permissions_company_id_idx").on(table.companyId),
    roleIdIdx: index("operation_permissions_role_id_idx").on(table.roleId),
    moduleOperationIdx: index("operation_permissions_module_operation_idx").on(table.module, table.operation),
  })
);

// 数据范围权限表
export const dataScopePermissions = pgTable(
  "data_scope_permissions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(), // 所属企业
    roleId: varchar("role_id", { length: 36 }).notNull(), // 角色ID
    module: varchar("module", { length: 50 }).notNull(), // 模块名称
    scopeType: varchar("scope_type", { length: 20 }).notNull(), // 数据范围类型：all, department, self, custom
    scopeValue: jsonb("scope_value"), // 范围值（部门ID列表、自定义条件等）
    metadata: jsonb("metadata"), // 其他元数据
    createdBy: varchar("created_by", { length: 36 }).notNull(), // 创建人
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("data_scope_permissions_company_id_idx").on(table.companyId),
    roleIdIdx: index("data_scope_permissions_role_id_idx").on(table.roleId),
    moduleIdx: index("data_scope_permissions_module_idx").on(table.module),
  })
);

// 用户角色关联表（用户可以有多个角色）
export const userRoles = pgTable(
  "user_roles",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 }).notNull(), // 用户ID
    roleId: varchar("role_id", { length: 36 }).notNull(), // 角色ID
    companyId: varchar("company_id", { length: 36 }).notNull(), // 企业ID
    isPrimary: boolean("is_primary").notNull().default(false), // 是否主角色
    assignedBy: varchar("assigned_by", { length: 36 }).notNull(), // 分配人
    assignedAt: timestamp("assigned_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }), // 过期时间
  },
  (table) => ({
    userIdIdx: index("user_roles_user_id_idx").on(table.userId),
    roleIdIdx: index("user_roles_role_id_idx").on(table.roleId),
    companyIdIdx: index("user_roles_company_id_idx").on(table.companyId),
    userIdRoleIdIdx: index("user_roles_user_role_idx").on(table.userId, table.roleId),
  })
);

// ============ 权限精细化控制Schema导出 ============
export const insertCustomRoleSchema = createCoercedInsertSchema(customRoles).pick({
  companyId: true,
  name: true,
  code: true,
  description: true,
  level: true,
  isSystem: true,
  isActive: true,
  metadata: true,
  createdBy: true,
});

export const insertCustomPermissionSchema = createCoercedInsertSchema(customPermissions).pick({
  companyId: true,
  module: true,
  resource: true,
  action: true,
  code: true,
  name: true,
  description: true,
  isSystem: true,
  isActive: true,
  metadata: true,
});

export const insertFieldPermissionSchema = createCoercedInsertSchema(fieldPermissions).pick({
  companyId: true,
  roleId: true,
  module: true,
  tableName: true,
  fieldName: true,
  permission: true,
  condition: true,
  metadata: true,
  createdBy: true,
});

export const insertOperationPermissionSchema = createCoercedInsertSchema(operationPermissions).pick({
  companyId: true,
  roleId: true,
  module: true,
  operation: true,
  allowed: true,
  condition: true,
  metadata: true,
  createdBy: true,
});

export const insertDataScopePermissionSchema = createCoercedInsertSchema(dataScopePermissions).pick({
  companyId: true,
  roleId: true,
  module: true,
  scopeType: true,
  scopeValue: true,
  metadata: true,
  createdBy: true,
});

export const insertUserRoleSchema = createCoercedInsertSchema(userRoles).pick({
  userId: true,
  roleId: true,
  companyId: true,
  isPrimary: true,
  assignedBy: true,
  assignedAt: true,
  expiresAt: true,
});

export type InsertCustomRole = z.infer<typeof insertCustomRoleSchema>;
export type InsertCustomPermission = z.infer<typeof insertCustomPermissionSchema>;
export type InsertFieldPermission = z.infer<typeof insertFieldPermissionSchema>;
export type InsertOperationPermission = z.infer<typeof insertOperationPermissionSchema>;
export type InsertDataScopePermission = z.infer<typeof insertDataScopePermissionSchema>;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;

// ============ 安全审计增强表 ============

// 安全事件表
export const securityEvents = pgTable(
  "security_events",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(), // 所属企业
    userId: varchar("user_id", { length: 36 }), // 关联用户ID
    eventType: varchar("event_type", { length: 50 }).notNull(), // 事件类型：login_failed, suspicious_activity, data_access, privilege_escalation
    severity: varchar("severity", { length: 20 }).notNull(), // 严重程度：low, medium, high, critical
    title: varchar("title", { length: 255 }).notNull(), // 事件标题
    description: text("description"), // 事件描述
    sourceIp: varchar("source_ip", { length: 50 }), // 来源IP
    userAgent: text("user_agent"), // 用户代理
    location: jsonb("location"), // 地理位置（国家、城市、经纬度）
    metadata: jsonb("metadata"), // 其他元数据
    isResolved: boolean("is_resolved").notNull().default(false), // 是否已解决
    resolvedBy: varchar("resolved_by", { length: 36 }), // 解决人
    resolvedAt: timestamp("resolved_at", { withTimezone: true }), // 解决时间
    resolution: text("resolution"), // 解决方案
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    companyIdIdx: index("security_events_company_id_idx").on(table.companyId),
    userIdIdx: index("security_events_user_id_idx").on(table.userId),
    eventTypeIdx: index("security_events_event_type_idx").on(table.eventType),
    severityIdx: index("security_events_severity_idx").on(table.severity),
    isResolvedIdx: index("security_events_is_resolved_idx").on(table.isResolved),
    createdAtIdx: index("security_events_created_at_idx").on(table.createdAt),
  })
);

// 安全评分表
export const securityScores = pgTable(
  "security_scores",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(), // 所属企业
    userId: varchar("user_id", { length: 36 }), // 用户ID（null表示企业级别评分）
    entityType: varchar("entity_type", { length: 20 }).notNull(), // 实体类型：company, user
    totalScore: integer("total_score").notNull(), // 总分（0-100）
    lastUpdated: timestamp("last_updated", { withTimezone: true })
      .defaultNow()
      .notNull(),
    scoreDetails: jsonb("score_details"), // 评分详情（各维度分数）
    riskFactors: jsonb("risk_factors"), // 风险因素列表
    recommendations: jsonb("recommendations"), // 改进建议列表
    metadata: jsonb("metadata"), // 其他元数据
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("security_scores_company_id_idx").on(table.companyId),
    userIdIdx: index("security_scores_user_id_idx").on(table.userId),
    entityTypeIdx: index("security_scores_entity_type_idx").on(table.entityType),
    companyIdEntityTypeIdx: index("security_scores_company_entity_idx").on(table.companyId, table.entityType),
  })
);

// 用户行为异常检测表
export const userBehaviorAnomalies = pgTable(
  "user_behavior_anomalies",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(), // 所属企业
    userId: varchar("user_id", { length: 36 }).notNull(), // 用户ID
    anomalyType: varchar("anomaly_type", { length: 50 }).notNull(), // 异常类型：frequent_login, unusual_ip, unusual_time, unusual_location
    severity: varchar("severity", { length: 20 }).notNull(), // 严重程度：low, medium, high
    description: text("description"), // 异常描述
    detectedAt: timestamp("detected_at", { withTimezone: true })
      .defaultNow()
      .notNull(), // 检测时间
    baselineValue: numeric("baseline_value"), // 基准值
    actualValue: numeric("actual_value"), // 实际值
    deviationPercentage: numeric("deviation_percentage"), // 偏差百分比
    metadata: jsonb("metadata"), // 其他元数据
    isReviewed: boolean("is_reviewed").notNull().default(false), // 是否已审核
    reviewedBy: varchar("reviewed_by", { length: 36 }), // 审核人
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }), // 审核时间
    reviewResult: varchar("review_result", { length: 20 }), // 审核结果：false_positive, confirmed, ignored
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    companyIdIdx: index("user_behavior_anomalies_company_id_idx").on(table.companyId),
    userIdIdx: index("user_behavior_anomalies_user_id_idx").on(table.userId),
    anomalyTypeIdx: index("user_behavior_anomalies_anomaly_type_idx").on(table.anomalyType),
    severityIdx: index("user_behavior_anomalies_severity_idx").on(table.severity),
    isReviewedIdx: index("user_behavior_anomalies_is_reviewed_idx").on(table.isReviewed),
    createdAtIdx: index("user_behavior_anomalies_created_at_idx").on(table.createdAt),
  })
);

// 安全风险分析表
export const securityRiskAnalysis = pgTable(
  "security_risk_analysis",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(), // 所属企业
    analysisType: varchar("analysis_type", { length: 50 }).notNull(), // 分析类型：password_strength, access_control, data_exposure, privilege_escalation
    riskLevel: varchar("risk_level", { length: 20 }).notNull(), // 风险等级：low, medium, high, critical
    riskScore: integer("risk_score").notNull(), // 风险评分（0-100）
    findings: jsonb("findings"), // 发现的问题列表
    remediation: jsonb("remediation"), // 修复建议列表
    priority: integer("priority").notNull().default(0), // 优先级（0-10）
    isCompleted: boolean("is_completed").notNull().default(false), // 是否已完成修复
    completedAt: timestamp("completed_at", { withTimezone: true }), // 完成时间
    metadata: jsonb("metadata"), // 其他元数据
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("security_risk_analysis_company_id_idx").on(table.companyId),
    analysisTypeIdx: index("security_risk_analysis_analysis_type_idx").on(table.analysisType),
    riskLevelIdx: index("security_risk_analysis_risk_level_idx").on(table.riskLevel),
    priorityIdx: index("security_risk_analysis_priority_idx").on(table.priority),
    isCompletedIdx: index("security_risk_analysis_is_completed_idx").on(table.isCompleted),
  })
);

// 安全报告表
export const securityReports = pgTable(
  "security_reports",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(), // 所属企业
    reportType: varchar("report_type", { length: 50 }).notNull(), // 报告类型：daily, weekly, monthly, quarterly, custom
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(), // 报告周期开始
    periodEnd: timestamp("period_end", { withTimezone: true }).notNull(), // 报告周期结束
    summary: jsonb("summary"), // 报告摘要（统计数据、趋势等）
    securityEvents: jsonb("security_events"), // 安全事件统计
    riskAnalysis: jsonb("risk_analysis"), // 风险分析结果
    recommendations: jsonb("recommendations"), // 建议措施
    overallScore: integer("overall_score"), // 整体安全评分
    scoreTrend: jsonb("score_trend"), // 评分趋势
    metadata: jsonb("metadata"), // 其他元数据
    generatedBy: varchar("generated_by", { length: 36 }).notNull(), // 生成人
    generatedAt: timestamp("generated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    companyIdIdx: index("security_reports_company_id_idx").on(table.companyId),
    reportTypeIdx: index("security_reports_report_type_idx").on(table.reportType),
    periodIdx: index("security_reports_period_idx").on(table.periodStart, table.periodEnd),
    generatedAtIdx: index("security_reports_generated_at_idx").on(table.generatedAt),
  })
);

// ============ 安全审计增强Schema导出 ============
export const insertSecurityEventSchema = createCoercedInsertSchema(securityEvents).pick({
  companyId: true,
  userId: true,
  eventType: true,
  severity: true,
  title: true,
  description: true,
  sourceIp: true,
  userAgent: true,
  location: true,
  metadata: true,
});

export const insertSecurityScoreSchema = createCoercedInsertSchema(securityScores).pick({
  companyId: true,
  userId: true,
  entityType: true,
  totalScore: true,
  scoreDetails: true,
  riskFactors: true,
  recommendations: true,
  metadata: true,
});

export const insertUserBehaviorAnomalySchema = createCoercedInsertSchema(userBehaviorAnomalies).pick({
  companyId: true,
  userId: true,
  anomalyType: true,
  severity: true,
  description: true,
  baselineValue: true,
  actualValue: true,
  deviationPercentage: true,
  metadata: true,
});

export const insertSecurityRiskAnalysisSchema = createCoercedInsertSchema(securityRiskAnalysis).pick({
  companyId: true,
  analysisType: true,
  riskLevel: true,
  riskScore: true,
  findings: true,
  remediation: true,
  priority: true,
  metadata: true,
});

export const insertSecurityReportSchema = createCoercedInsertSchema(securityReports).pick({
  companyId: true,
  reportType: true,
  periodStart: true,
  periodEnd: true,
  summary: true,
  securityEvents: true,
  riskAnalysis: true,
  recommendations: true,
  overallScore: true,
  scoreTrend: true,
  metadata: true,
  generatedBy: true,
});

export type InsertSecurityEvent = z.infer<typeof insertSecurityEventSchema>;
export type InsertSecurityScore = z.infer<typeof insertSecurityScoreSchema>;
export type InsertUserBehaviorAnomaly = z.infer<typeof insertUserBehaviorAnomalySchema>;
export type InsertSecurityRiskAnalysis = z.infer<typeof insertSecurityRiskAnalysisSchema>;
export type InsertSecurityReport = z.infer<typeof insertSecurityReportSchema>;

// ============ 工单表 ============
export const tickets = pgTable(
  "tickets",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(), // 提交人ID
    userName: varchar("user_name", { length: 128 }).notNull(), // 提交人姓名
    userEmail: varchar("user_email", { length: 255 }), // 提交人邮箱
    title: varchar("title", { length: 255 }).notNull(), // 工单标题
    description: text("description").notNull(), // 工单描述
    category: varchar("category", { length: 50 }), // 工单分类：technical, billing, feature, bug, other
    priority: varchar("priority", { length: 20 })
      .notNull()
      .default("medium"), // 优先级：low, medium, high, urgent
    status: varchar("status", { length: 20 })
      .notNull()
      .default("open"), // 状态：open, in_progress, resolved, closed
    assignedTo: varchar("assigned_to", { length: 36 }), // 分配给谁
    assignedAt: timestamp("assigned_at", { withTimezone: true }), // 分配时间
    resolvedAt: timestamp("resolved_at", { withTimezone: true }), // 解决时间
    closedAt: timestamp("closed_at", { withTimezone: true }), // 关闭时间
    resolution: text("resolution"), // 解决方案
    attachments: jsonb("attachments"), // 附件列表
    rating: integer("rating"), // 满意度评分 1-5
    ratingComment: text("rating_comment"), // 评分评论
    ipAddress: varchar("ip_address", { length: 50 }),
    userAgent: text("user_agent"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("tickets_company_id_idx").on(table.companyId),
    userIdIdx: index("tickets_user_id_idx").on(table.userId),
    statusIdx: index("tickets_status_idx").on(table.status),
    priorityIdx: index("tickets_priority_idx").on(table.priority),
    categoryIdx: index("tickets_category_idx").on(table.category),
    createdAtIdx: index("tickets_created_at_idx").on(table.createdAt),
  })
);

// ============ 用户反馈表 ============
export const feedback = pgTable(
  "feedback",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }), // 企业ID（可为空，表示个人用户）
    userId: varchar("user_id", { length: 36 }), // 用户ID（可为空，表示匿名用户）
    userName: varchar("user_name", { length: 128 }), // 用户姓名
    userEmail: varchar("user_email", { length: 255 }), // 用户邮箱
    type: varchar("type", { length: 50 })
      .notNull()
      .default("suggestion"), // 反馈类型：bug, feature, suggestion, complaint, other
    category: varchar("category", { length: 50 }), // 分类
    title: varchar("title", { length: 255 }).notNull(), // 反馈标题
    content: text("content").notNull(), // 反馈内容
    rating: integer("rating"), // 评分 1-5
    status: varchar("status", { length: 20 })
      .notNull()
      .default("pending"), // 状态：pending, reviewed, resolved, rejected
    assignedTo: varchar("assigned_to", { length: 36 }), // 分配给谁
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }), // 审核时间
    reviewedBy: varchar("reviewed_by", { length: 36 }), // 审核人
    response: text("response"), // 官方回复
    respondedAt: timestamp("responded_at", { withTimezone: true }), // 回复时间
    tags: jsonb("tags"), // 标签列表
    isAnonymous: boolean("is_anonymous").notNull().default(false), // 是否匿名
    ipAddress: varchar("ip_address", { length: 50 }),
    userAgent: text("user_agent"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    companyIdIdx: index("feedback_company_id_idx").on(table.companyId),
    userIdIdx: index("feedback_user_id_idx").on(table.userId),
    statusIdx: index("feedback_status_idx").on(table.status),
    typeIdx: index("feedback_type_idx").on(table.type),
    categoryIdx: index("feedback_category_idx").on(table.category),
    createdAtIdx: index("feedback_created_at_idx").on(table.createdAt),
  })
);

