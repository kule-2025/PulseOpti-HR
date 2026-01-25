CREATE TABLE "account_connections" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36),
	"from_user_id" varchar(36) NOT NULL,
	"to_user_id" varchar(36) NOT NULL,
	"connection_type" varchar(20) NOT NULL,
	"relationship_type" varchar(20) NOT NULL,
	"permissions" jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"last_message_at" timestamp with time zone,
	"last_task_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "action_plans" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"recommendation_id" varchar(36),
	"name" varchar(255) NOT NULL,
	"description" text,
	"target_metric_code" varchar(50),
	"target_value" integer,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"tasks" jsonb NOT NULL,
	"budget" integer,
	"responsible_user_id" varchar(36) NOT NULL,
	"status" varchar(20) DEFAULT 'planning' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_by" varchar(36),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "assessment_dimensions" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" varchar(36) NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"weight" integer DEFAULT 100 NOT NULL,
	"max_score" integer DEFAULT 100 NOT NULL,
	"evaluation_criteria" jsonb,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "assessment_reports" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"template_id" varchar(36),
	"target_id" varchar(36) NOT NULL,
	"target_type" varchar(50) NOT NULL,
	"overall_score" integer NOT NULL,
	"pass_score" integer DEFAULT 60 NOT NULL,
	"passed" boolean NOT NULL,
	"dimension_scores" jsonb NOT NULL,
	"issues" jsonb,
	"recommendations" jsonb,
	"confidence_level" varchar(20),
	"metadata" jsonb,
	"evaluated_by" varchar(36),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_templates" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(50) DEFAULT 'resume' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"pass_threshold" integer DEFAULT 60 NOT NULL,
	"total_weight" integer DEFAULT 100 NOT NULL,
	"created_by" varchar(36) NOT NULL,
	"updated_by" varchar(36),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "attendance_records" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"employee_id" varchar(36) NOT NULL,
	"record_date" timestamp with time zone NOT NULL,
	"clock_in_time" timestamp with time zone,
	"clock_out_time" timestamp with time zone,
	"work_hours" integer DEFAULT 0,
	"status" varchar(20) DEFAULT 'normal' NOT NULL,
	"location" varchar(255),
	"device_info" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "attribution_analysis" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"metric_code" varchar(50) NOT NULL,
	"period" varchar(20) NOT NULL,
	"current_value" integer NOT NULL,
	"previous_value" integer NOT NULL,
	"change_rate" varchar(20),
	"analysis" jsonb NOT NULL,
	"confidence" integer,
	"requested_by" varchar(36),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"user_name" varchar(128),
	"action" varchar(100) NOT NULL,
	"resource_type" varchar(50) NOT NULL,
	"resource_id" varchar(36),
	"resource_name" varchar(255),
	"ip_address" varchar(50),
	"user_agent" text,
	"changes" jsonb,
	"status" varchar(20) DEFAULT 'success' NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidates" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"job_id" varchar(36),
	"name" varchar(128) NOT NULL,
	"phone" varchar(20),
	"email" varchar(255),
	"gender" varchar(10),
	"birth_date" timestamp with time zone,
	"education" jsonb,
	"work_experience" jsonb,
	"current_salary" integer,
	"expected_salary" text,
	"resume_url" text,
	"resume_file_key" text,
	"source" varchar(50),
	"status" varchar(20) DEFAULT 'new' NOT NULL,
	"remark" text,
	"skills" jsonb,
	"achievements" jsonb,
	"self_introduction" text,
	"tags" jsonb,
	"ai_parsed" boolean DEFAULT false,
	"parse_score" numeric,
	"metadata" jsonb,
	"extended_info" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50),
	"industry" varchar(100),
	"size" varchar(50),
	"address" text,
	"contact_phone" varchar(20),
	"subscription_tier" varchar(20) DEFAULT 'free' NOT NULL,
	"max_employees" integer DEFAULT 30 NOT NULL,
	"max_admin_accounts" integer DEFAULT 1 NOT NULL,
	"subscription_expires_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "companies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "decision_recommendations" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"type" varchar(50) NOT NULL,
	"priority" varchar(20) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"recommendation" text NOT NULL,
	"expected_impact" jsonb,
	"action_steps" jsonb NOT NULL,
	"resource_needs" jsonb,
	"related_metric_code" varchar(50),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"assigned_to" varchar(36),
	"completed_at" timestamp with time zone,
	"feedback" text,
	"effectiveness" integer,
	"ai_generated" boolean DEFAULT true NOT NULL,
	"requested_by" varchar(36),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"name" varchar(128) NOT NULL,
	"code" varchar(50),
	"parent_id" varchar(36),
	"manager_id" varchar(36),
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "efficiency_alert_rules" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"metric_code" varchar(50) NOT NULL,
	"condition" varchar(20) NOT NULL,
	"threshold" integer NOT NULL,
	"severity" varchar(20) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" varchar(36),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "efficiency_alerts" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"rule_id" varchar(36) NOT NULL,
	"metric_code" varchar(50) NOT NULL,
	"period" varchar(20) NOT NULL,
	"current_value" integer NOT NULL,
	"threshold" integer NOT NULL,
	"severity" varchar(20) NOT NULL,
	"message" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"acknowledged_by" varchar(36),
	"acknowledged_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "efficiency_metrics" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" varchar(50) NOT NULL,
	"description" text,
	"formula" text,
	"unit" varchar(20),
	"data_type" varchar(20) DEFAULT 'number' NOT NULL,
	"is_key" boolean DEFAULT false NOT NULL,
	"benchmark" jsonb,
	"weight" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "efficiency_metrics_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "efficiency_snapshots" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"period_type" varchar(20) NOT NULL,
	"period" varchar(20) NOT NULL,
	"data" jsonb NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_logs" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"template_id" varchar(36),
	"config_id" varchar(36),
	"to_email" varchar(255) NOT NULL,
	"to_name" varchar(128),
	"subject" varchar(500) NOT NULL,
	"content" text,
	"variables" jsonb,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"error" text,
	"message_id" varchar(500),
	"sent_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"opened_at" timestamp with time zone,
	"clicked_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36),
	"name" varchar(255) NOT NULL,
	"code" varchar(100) NOT NULL,
	"category" varchar(50) NOT NULL,
	"subject" varchar(500) NOT NULL,
	"text_content" text,
	"html_content" text NOT NULL,
	"variables" jsonb,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"last_used_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "employee_points" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"employee_id" varchar(36) NOT NULL,
	"total_points" integer DEFAULT 0 NOT NULL,
	"available_points" integer DEFAULT 0 NOT NULL,
	"used_points" integer DEFAULT 0 NOT NULL,
	"rank" integer,
	"level" varchar(50),
	"period_points" jsonb,
	"last_updated" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"user_id" varchar(36),
	"employee_number" varchar(50),
	"name" varchar(128) NOT NULL,
	"gender" varchar(10),
	"birth_date" timestamp with time zone,
	"id_card_number" varchar(50),
	"phone" varchar(20),
	"email" varchar(255),
	"address" text,
	"department_id" varchar(36),
	"position_id" varchar(36),
	"manager_id" varchar(36),
	"hire_date" timestamp with time zone NOT NULL,
	"probation_end_date" timestamp with time zone,
	"employment_type" varchar(20),
	"employment_status" varchar(20) DEFAULT 'active' NOT NULL,
	"salary" integer,
	"avatar_url" text,
	"education" jsonb,
	"work_experience" jsonb,
	"emergency_contact" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "employees_employee_number_unique" UNIQUE("employee_number")
);
--> statement-breakpoint
CREATE TABLE "employment_contracts" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"employee_id" varchar(36) NOT NULL,
	"contract_number" varchar(100),
	"contract_type" varchar(20) NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"probation_start_date" timestamp with time zone,
	"probation_end_date" timestamp with time zone,
	"work_location" varchar(255),
	"work_hours" varchar(50),
	"position" varchar(128),
	"department" varchar(128),
	"salary" integer,
	"salary_structure" text,
	"benefits" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"is_probation_passed" boolean,
	"probation_passed_date" timestamp with time zone,
	"termination_date" timestamp with time zone,
	"termination_reason" text,
	"contract_url" text,
	"signed_at" timestamp with time zone,
	"signed_by_employee" varchar(36),
	"signed_by_company" varchar(36),
	"remarks" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "employment_contracts_contract_number_unique" UNIQUE("contract_number")
);
--> statement-breakpoint
CREATE TABLE "exchange_items" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36),
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"image_url" text,
	"category" varchar(50),
	"points_required" integer NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"unlimited_stock" boolean DEFAULT false NOT NULL,
	"value" integer,
	"tags" jsonb,
	"is_public" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"valid_from" timestamp with time zone,
	"valid_to" timestamp with time zone,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "exchange_records" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"employee_id" varchar(36) NOT NULL,
	"item_id" varchar(36) NOT NULL,
	"item_name" varchar(255) NOT NULL,
	"points_used" integer NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"delivery_method" varchar(20),
	"delivery_info" jsonb,
	"approved_by" varchar(36),
	"approved_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"remark" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "exit_interviews" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"employee_id" varchar(36) NOT NULL,
	"resignation_id" varchar(36),
	"interviewer_id" varchar(36) NOT NULL,
	"interview_date" timestamp with time zone NOT NULL,
	"interview_method" varchar(20) NOT NULL,
	"overall_satisfaction" integer,
	"working_environment" integer,
	"salary" integer,
	"management" integer,
	"career_development" integer,
	"work_life_balance" integer,
	"reason_for_leaving" text,
	"suggestions" text,
	"would_recommend" boolean,
	"highlights" text,
	"improvements" text,
	"feedback" text,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "handover_checklists" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"resignation_id" varchar(36) NOT NULL,
	"employee_id" varchar(36) NOT NULL,
	"receiver_id" varchar(36),
	"category" varchar(50) NOT NULL,
	"items" jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"completed_at" timestamp with time zone,
	"remarks" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "hr_report_templates" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36),
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(50) NOT NULL,
	"type" varchar(20) NOT NULL,
	"data_source" jsonb NOT NULL,
	"metrics" jsonb NOT NULL,
	"dimensions" jsonb NOT NULL,
	"filters" jsonb,
	"chart_type" varchar(20),
	"chart_config" jsonb,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_by" varchar(36),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "individual_development_plans" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"employee_id" varchar(36) NOT NULL,
	"period" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"career_goal" text,
	"skill_gap_analysis" jsonb,
	"goals" jsonb NOT NULL,
	"learning_activities" jsonb,
	"milestones" jsonb,
	"resources" jsonb,
	"mentor_id" varchar(36),
	"manager_id" varchar(36),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"employee_comments" text,
	"manager_comments" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "instant_messages" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36),
	"from_user_id" varchar(36) NOT NULL,
	"to_user_id" varchar(36) NOT NULL,
	"message" text NOT NULL,
	"message_type" varchar(20) DEFAULT 'text' NOT NULL,
	"related_task_id" varchar(36),
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interviews" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"candidate_id" varchar(36) NOT NULL,
	"job_id" varchar(36) NOT NULL,
	"round" integer DEFAULT 1 NOT NULL,
	"interviewer_id" varchar(36) NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"location" varchar(255),
	"type" varchar(20),
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"score" integer,
	"feedback" text,
	"next_round_scheduled" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "job_families" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text,
	"parent_id" varchar(36),
	"sort" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "job_grades" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text,
	"sequence" integer NOT NULL,
	"salary_min" integer,
	"salary_max" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "job_rank_mappings" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"job_family_id" varchar(36) NOT NULL,
	"job_rank_id" varchar(36) NOT NULL,
	"job_grade_id" varchar(36) NOT NULL,
	"position_title" varchar(128) NOT NULL,
	"responsibilities" text,
	"requirements" text,
	"competency_model" jsonb,
	"kpi_examples" jsonb,
	"career_path" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "job_ranks" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text,
	"sequence" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"title" varchar(255) NOT NULL,
	"department_id" varchar(36),
	"position_id" varchar(36),
	"hire_count" integer DEFAULT 1 NOT NULL,
	"salary_min" integer,
	"salary_max" integer,
	"location" varchar(255),
	"description" text,
	"requirements" text,
	"benefits" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"created_by" varchar(36),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "leave_requests" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"employee_id" varchar(36) NOT NULL,
	"department_id" varchar(36),
	"leave_type" varchar(20) NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"days" integer NOT NULL,
	"reason" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"approver_id" varchar(36),
	"approver_name" varchar(128),
	"approver_comment" text,
	"approved_at" timestamp with time zone,
	"attachments" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb,
	"priority" varchar(20) DEFAULT 'medium' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"candidate_id" varchar(36) NOT NULL,
	"job_id" varchar(36) NOT NULL,
	"offer_number" varchar(50),
	"salary" integer NOT NULL,
	"salary_type" varchar(20) NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"probation_period" integer DEFAULT 3,
	"benefits" text,
	"conditions" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"sent_at" timestamp with time zone,
	"responded_at" timestamp with time zone,
	"expiry_date" timestamp with time zone,
	"created_by" varchar(36) NOT NULL,
	"approved_by" varchar(36),
	"approved_at" timestamp with time zone,
	"notes" text,
	"attachments" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "offers_offer_number_unique" UNIQUE("offer_number")
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"order_no" varchar(50) NOT NULL,
	"tier" varchar(20) NOT NULL,
	"period" varchar(20) NOT NULL,
	"amount" integer NOT NULL,
	"original_amount" integer NOT NULL,
	"discount_amount" integer DEFAULT 0 NOT NULL,
	"coupon_code" varchar(50),
	"currency" varchar(10) DEFAULT 'CNY' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"payment_method" varchar(50),
	"payment_time" timestamp with time zone,
	"transaction_id" varchar(255),
	"expires_at" timestamp with time zone,
	"remark" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "orders_order_no_unique" UNIQUE("order_no")
);
--> statement-breakpoint
CREATE TABLE "overtime_requests" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"employee_id" varchar(36) NOT NULL,
	"department_id" varchar(36),
	"overtime_date" timestamp with time zone NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"duration" integer NOT NULL,
	"reason" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"approver_id" varchar(36),
	"approver_name" varchar(128),
	"approver_comment" text,
	"approved_at" timestamp with time zone,
	"overtime_type" varchar(20) DEFAULT 'workday' NOT NULL,
	"pay_rate" integer DEFAULT 150,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "payroll_records" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"employee_id" varchar(36) NOT NULL,
	"period" varchar(20) NOT NULL,
	"salary_structure_id" varchar(36),
	"base_salary" integer NOT NULL,
	"bonus" integer DEFAULT 0,
	"allowance" integer DEFAULT 0,
	"overtime_pay" integer DEFAULT 0,
	"deduction" integer DEFAULT 0,
	"social_insurance" integer DEFAULT 0,
	"tax" integer DEFAULT 0,
	"gross_pay" integer NOT NULL,
	"net_pay" integer NOT NULL,
	"work_days" integer DEFAULT 0,
	"actual_work_days" integer DEFAULT 0,
	"paid_leave_days" integer DEFAULT 0,
	"unpaid_leave_days" integer DEFAULT 0,
	"overtime_hours" integer DEFAULT 0,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"calculated_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"payment_method" varchar(50),
	"payment_account" varchar(100),
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "performance_cycles" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(20) NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "performance_records" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"cycle_id" varchar(36) NOT NULL,
	"employee_id" varchar(36) NOT NULL,
	"reviewer_id" varchar(36),
	"self_score" integer,
	"reviewer_score" integer,
	"final_score" integer,
	"goals" jsonb,
	"achievements" text,
	"improvements" text,
	"feedback" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp with time zone,
	"reviewed_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"module" varchar(50) NOT NULL,
	"action" varchar(50) NOT NULL,
	"resource" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "permissions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "point_dimensions" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(128) NOT NULL,
	"icon" varchar(50),
	"color" varchar(20),
	"description" text,
	"weight" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "point_leaderboard" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"period" varchar(20) NOT NULL,
	"period_value" varchar(20),
	"employee_id" varchar(36) NOT NULL,
	"employee_name" varchar(128) NOT NULL,
	"department_id" varchar(36),
	"department_name" varchar(128),
	"position" varchar(128),
	"avatar_url" text,
	"total_points" integer NOT NULL,
	"earned_points" integer NOT NULL,
	"rank" integer NOT NULL,
	"trend" varchar(20),
	"rank_change" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "point_levels" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36),
	"code" varchar(50) NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text,
	"min_points" integer NOT NULL,
	"max_points" integer,
	"privileges" jsonb,
	"badge_url" text,
	"sort" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "point_rules" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"dimension_id" varchar(36),
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(20) NOT NULL,
	"trigger_type" varchar(50),
	"points" integer NOT NULL,
	"description" text,
	"conditions" jsonb,
	"limits" jsonb,
	"priority" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "point_statistics" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"employee_id" varchar(36),
	"department_id" varchar(36),
	"dimension_id" varchar(36),
	"period" varchar(20) NOT NULL,
	"period_value" varchar(20) NOT NULL,
	"earned_points" integer DEFAULT 0 NOT NULL,
	"redeemed_points" integer DEFAULT 0 NOT NULL,
	"net_points" integer DEFAULT 0 NOT NULL,
	"transaction_count" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "point_transactions" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"employee_id" varchar(36) NOT NULL,
	"rule_id" varchar(36),
	"dimension_id" varchar(36),
	"transaction_type" varchar(20) NOT NULL,
	"points" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"source" varchar(50) NOT NULL,
	"source_id" varchar(36),
	"description" text,
	"remarks" text,
	"operated_by" varchar(36),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "positions" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"name" varchar(128) NOT NULL,
	"code" varchar(50),
	"level" varchar(50),
	"department_id" varchar(36),
	"description" text,
	"responsibilities" text,
	"requirements" text,
	"salary_min" integer,
	"salary_max" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "prediction_analysis" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"metric_code" varchar(50) NOT NULL,
	"prediction_period" varchar(20) NOT NULL,
	"prediction_type" varchar(50) NOT NULL,
	"current_value" integer NOT NULL,
	"predicted_value" integer NOT NULL,
	"confidence" integer NOT NULL,
	"analysis" jsonb NOT NULL,
	"insights" jsonb,
	"requested_by" varchar(36),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resignations" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"employee_id" varchar(36) NOT NULL,
	"applicant_id" varchar(36) NOT NULL,
	"resignation_type" varchar(20) NOT NULL,
	"reason" text,
	"reason_category" varchar(50),
	"expected_last_date" timestamp with time zone NOT NULL,
	"actual_last_date" timestamp with time zone,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"approved_by" varchar(36),
	"approved_at" timestamp with time zone,
	"remarks" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" varchar(50) NOT NULL,
	"permission_id" varchar(36) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salary_structures" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"name" varchar(128) NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"components" jsonb NOT NULL,
	"calculation_rule" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"employee_id" varchar(36) NOT NULL,
	"schedule_date" timestamp with time zone NOT NULL,
	"shift_type" varchar(20) NOT NULL,
	"shift_name" varchar(50) NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"break_time" integer DEFAULT 0,
	"is_working_day" boolean DEFAULT true NOT NULL,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sms_configs" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"name" varchar(255) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"access_key_id" varchar(255) NOT NULL,
	"access_key_secret" text NOT NULL,
	"endpoint" varchar(500),
	"sign_name" varchar(100) NOT NULL,
	"region" varchar(50),
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"daily_limit" integer,
	"hourly_limit" integer,
	"last_used_at" timestamp with time zone,
	"test_status" varchar(20),
	"test_result" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sms_logs" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"template_id" varchar(36),
	"config_id" varchar(36),
	"phone_number" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"variables" jsonb,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"error" text,
	"message_id" varchar(500),
	"biz_id" varchar(500),
	"sent_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"cost" integer,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sms_statistics" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"config_id" varchar(36),
	"template_id" varchar(36),
	"period" varchar(20) NOT NULL,
	"period_value" varchar(20) NOT NULL,
	"total_count" integer DEFAULT 0 NOT NULL,
	"success_count" integer DEFAULT 0 NOT NULL,
	"failed_count" integer DEFAULT 0 NOT NULL,
	"total_cost" integer DEFAULT 0 NOT NULL,
	"success_rate" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sms_templates" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36),
	"name" varchar(255) NOT NULL,
	"code" varchar(100) NOT NULL,
	"category" varchar(50) NOT NULL,
	"template_id" varchar(100),
	"content" text NOT NULL,
	"variables" jsonb,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"last_used_at" timestamp with time zone,
	"audit_status" varchar(20),
	"audit_reason" text,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "smtp_configs" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"name" varchar(255) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"host" varchar(255) NOT NULL,
	"port" integer DEFAULT 587 NOT NULL,
	"secure" boolean DEFAULT false NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"from_name" varchar(255),
	"from_email" varchar(255),
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_used_at" timestamp with time zone,
	"test_status" varchar(20),
	"test_result" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "social_insurance_records" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"employee_id" varchar(36) NOT NULL,
	"period" varchar(20) NOT NULL,
	"insurance_type" varchar(20) NOT NULL,
	"company_base" integer NOT NULL,
	"employee_base" integer NOT NULL,
	"company_rate" integer NOT NULL,
	"employee_rate" integer NOT NULL,
	"company_amount" integer NOT NULL,
	"employee_amount" integer NOT NULL,
	"total_amount" integer NOT NULL,
	"paid_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tier" varchar(20) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"monthly_price" integer NOT NULL,
	"yearly_price" integer NOT NULL,
	"max_employees" integer NOT NULL,
	"features" jsonb NOT NULL,
	"ai_quota" integer DEFAULT 0 NOT NULL,
	"storage_quota" integer DEFAULT 1024 NOT NULL,
	"priority_support" boolean DEFAULT false NOT NULL,
	"custom_branding" boolean DEFAULT false NOT NULL,
	"api_access" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "subscription_plans_tier_unique" UNIQUE("tier")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"tier" varchar(20) NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(10) DEFAULT 'CNY' NOT NULL,
	"period" varchar(20) NOT NULL,
	"max_employees" integer NOT NULL,
	"max_sub_accounts" integer DEFAULT 0 NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"payment_method" varchar(50),
	"transaction_id" varchar(255),
	"remark" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_name" varchar(255) DEFAULT 'PulseOpti HR 脉策聚效' NOT NULL,
	"site_url" varchar(500),
	"logo_url" text,
	"favicon_url" text,
	"enable_registration" boolean DEFAULT true NOT NULL,
	"enable_email_verification" boolean DEFAULT true NOT NULL,
	"enable_sms_verification" boolean DEFAULT true NOT NULL,
	"enable_audit_logs" boolean DEFAULT true NOT NULL,
	"enable_notifications" boolean DEFAULT true NOT NULL,
	"maintenance_mode" boolean DEFAULT false NOT NULL,
	"maintenance_message" text,
	"contact_email" varchar(255),
	"contact_phone" varchar(20),
	"contact_address" text,
	"custom_css" text,
	"custom_js" text,
	"privacy_policy_url" text,
	"terms_of_service_url" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "talent_pool" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"name" varchar(128) NOT NULL,
	"type" varchar(20) NOT NULL,
	"description" text,
	"tags" jsonb,
	"criteria" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "talent_pool_members" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"pool_id" varchar(36) NOT NULL,
	"type" varchar(20) NOT NULL,
	"related_id" varchar(36) NOT NULL,
	"added_by" varchar(36) NOT NULL,
	"added_reason" text,
	"ai_match_score" integer,
	"tags" jsonb,
	"notes" text,
	"last_reviewed_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "task_assignments" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"from_user_id" varchar(36) NOT NULL,
	"to_user_id" varchar(36) NOT NULL,
	"task_type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"priority" varchar(20) DEFAULT 'medium' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"due_date" timestamp with time zone,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"related_resource_id" varchar(36),
	"related_resource_type" varchar(50),
	"requirements" jsonb,
	"attachments" jsonb,
	"feedback" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "training_courses" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36),
	"title" varchar(255) NOT NULL,
	"description" text,
	"type" varchar(20) NOT NULL,
	"category" varchar(50),
	"tags" jsonb,
	"skills" jsonb,
	"duration" integer NOT NULL,
	"difficulty" varchar(20),
	"provider" varchar(128),
	"rating" integer DEFAULT 0,
	"review_count" integer DEFAULT 0,
	"price" integer,
	"currency" varchar(10) DEFAULT 'CNY',
	"prerequisites" jsonb,
	"learning_objectives" jsonb,
	"target_audience" jsonb,
	"materials" jsonb,
	"max_participants" integer,
	"location" varchar(255),
	"schedule" jsonb,
	"instructor_id" varchar(36),
	"is_active" boolean DEFAULT true NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_by" varchar(36),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "training_records" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"course_id" varchar(36) NOT NULL,
	"employee_id" varchar(36) NOT NULL,
	"employee_name" varchar(128),
	"course_title" varchar(255) NOT NULL,
	"enrollment_date" timestamp with time zone DEFAULT now() NOT NULL,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"progress" integer DEFAULT 0,
	"completion_date" timestamp with time zone,
	"status" varchar(20) DEFAULT 'enrolled' NOT NULL,
	"score" integer,
	"max_score" integer,
	"grade" varchar(20),
	"certificate_url" text,
	"feedback" text,
	"rating" integer,
	"instructor_id" varchar(36),
	"attendance" jsonb,
	"learning_hours" integer DEFAULT 0,
	"cost" integer,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36),
	"username" varchar(100),
	"email" varchar(255),
	"phone" varchar(20),
	"password" text,
	"name" varchar(128) NOT NULL,
	"avatar_url" text,
	"role" varchar(20) DEFAULT 'employee' NOT NULL,
	"is_super_admin" boolean DEFAULT false NOT NULL,
	"is_main_account" boolean DEFAULT false NOT NULL,
	"user_type" varchar(20) DEFAULT 'employee' NOT NULL,
	"parent_user_id" varchar(36),
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "verification_codes" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" varchar(255) NOT NULL,
	"code" varchar(10) NOT NULL,
	"purpose" varchar(20) NOT NULL,
	"type" varchar(20) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"ip_address" varchar(50),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_history" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"instance_id" varchar(36) NOT NULL,
	"instance_name" varchar(255) NOT NULL,
	"template_id" varchar(36) NOT NULL,
	"type" varchar(50) NOT NULL,
	"action" varchar(50) NOT NULL,
	"actor_id" varchar(36) NOT NULL,
	"actor_name" varchar(128) NOT NULL,
	"actor_role" varchar(50),
	"step_id" varchar(36),
	"step_name" varchar(255),
	"description" text NOT NULL,
	"metadata" jsonb,
	"changes" jsonb,
	"ip_address" varchar(50),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_instances" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"template_id" varchar(36) NOT NULL,
	"template_name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"steps" jsonb NOT NULL,
	"current_step_index" integer DEFAULT 0 NOT NULL,
	"initiator_id" varchar(36) NOT NULL,
	"initiator_name" varchar(128) NOT NULL,
	"related_entity_type" varchar(50),
	"related_entity_id" varchar(36),
	"related_entity_name" varchar(255),
	"form_data" jsonb,
	"variables" jsonb,
	"priority" varchar(20) DEFAULT 'medium' NOT NULL,
	"due_date" timestamp with time zone,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"error" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "workflow_templates" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"description" text,
	"steps" jsonb NOT NULL,
	"default_assignees" jsonb,
	"conditions" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"metadata" jsonb,
	"created_by" varchar(36) NOT NULL,
	"updated_by" varchar(36),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "assessment_dimensions" ADD CONSTRAINT "assessment_dimensions_template_id_assessment_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."assessment_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_reports" ADD CONSTRAINT "assessment_reports_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_reports" ADD CONSTRAINT "assessment_reports_template_id_assessment_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."assessment_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_reports" ADD CONSTRAINT "assessment_reports_evaluated_by_users_id_fk" FOREIGN KEY ("evaluated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_templates" ADD CONSTRAINT "assessment_templates_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_templates" ADD CONSTRAINT "assessment_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_templates" ADD CONSTRAINT "assessment_templates_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_connections_company_id_idx" ON "account_connections" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "account_connections_from_user_id_idx" ON "account_connections" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "account_connections_to_user_id_idx" ON "account_connections" USING btree ("to_user_id");--> statement-breakpoint
CREATE INDEX "account_connections_status_idx" ON "account_connections" USING btree ("status");--> statement-breakpoint
CREATE INDEX "account_connections_unique_idx" ON "account_connections" USING btree ("from_user_id","to_user_id");--> statement-breakpoint
CREATE INDEX "action_plans_company_id_idx" ON "action_plans" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "action_plans_recommendation_id_idx" ON "action_plans" USING btree ("recommendation_id");--> statement-breakpoint
CREATE INDEX "action_plans_responsible_user_id_idx" ON "action_plans" USING btree ("responsible_user_id");--> statement-breakpoint
CREATE INDEX "action_plans_status_idx" ON "action_plans" USING btree ("status");--> statement-breakpoint
CREATE INDEX "assessment_dimensions_template_id_idx" ON "assessment_dimensions" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "assessment_dimensions_code_idx" ON "assessment_dimensions" USING btree ("code");--> statement-breakpoint
CREATE INDEX "assessment_reports_company_id_idx" ON "assessment_reports" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "assessment_reports_template_id_idx" ON "assessment_reports" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "assessment_reports_target_id_idx" ON "assessment_reports" USING btree ("target_id");--> statement-breakpoint
CREATE INDEX "assessment_reports_target_type_idx" ON "assessment_reports" USING btree ("target_type");--> statement-breakpoint
CREATE INDEX "assessment_reports_created_at_idx" ON "assessment_reports" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "assessment_templates_company_id_idx" ON "assessment_templates" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "assessment_templates_category_idx" ON "assessment_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "attendance_records_company_id_idx" ON "attendance_records" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "attendance_records_employee_id_idx" ON "attendance_records" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "attendance_records_record_date_idx" ON "attendance_records" USING btree ("record_date");--> statement-breakpoint
CREATE INDEX "attendance_records_composite_idx" ON "attendance_records" USING btree ("company_id","employee_id","record_date");--> statement-breakpoint
CREATE INDEX "attribution_analysis_company_id_idx" ON "attribution_analysis" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "attribution_analysis_metric_code_idx" ON "attribution_analysis" USING btree ("metric_code");--> statement-breakpoint
CREATE INDEX "attribution_analysis_period_idx" ON "attribution_analysis" USING btree ("period");--> statement-breakpoint
CREATE INDEX "audit_logs_company_id_idx" ON "audit_logs" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_resource_type_idx" ON "audit_logs" USING btree ("resource_type");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "candidates_company_id_idx" ON "candidates" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "candidates_job_id_idx" ON "candidates" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "candidates_status_idx" ON "candidates" USING btree ("status");--> statement-breakpoint
CREATE INDEX "companies_code_idx" ON "companies" USING btree ("code");--> statement-breakpoint
CREATE INDEX "decision_recommendations_company_id_idx" ON "decision_recommendations" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "decision_recommendations_type_idx" ON "decision_recommendations" USING btree ("type");--> statement-breakpoint
CREATE INDEX "decision_recommendations_status_idx" ON "decision_recommendations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "decision_recommendations_priority_idx" ON "decision_recommendations" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "departments_company_id_idx" ON "departments" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "departments_parent_id_idx" ON "departments" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "efficiency_alert_rules_company_id_idx" ON "efficiency_alert_rules" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "efficiency_alert_rules_metric_code_idx" ON "efficiency_alert_rules" USING btree ("metric_code");--> statement-breakpoint
CREATE INDEX "efficiency_alerts_company_id_idx" ON "efficiency_alerts" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "efficiency_alerts_rule_id_idx" ON "efficiency_alerts" USING btree ("rule_id");--> statement-breakpoint
CREATE INDEX "efficiency_alerts_metric_code_idx" ON "efficiency_alerts" USING btree ("metric_code");--> statement-breakpoint
CREATE INDEX "efficiency_alerts_status_idx" ON "efficiency_alerts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "efficiency_alerts_created_at_idx" ON "efficiency_alerts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "efficiency_metrics_code_idx" ON "efficiency_metrics" USING btree ("code");--> statement-breakpoint
CREATE INDEX "efficiency_metrics_category_idx" ON "efficiency_metrics" USING btree ("category");--> statement-breakpoint
CREATE INDEX "efficiency_snapshots_company_id_idx" ON "efficiency_snapshots" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "efficiency_snapshots_period_idx" ON "efficiency_snapshots" USING btree ("period");--> statement-breakpoint
CREATE INDEX "efficiency_snapshots_unique_idx" ON "efficiency_snapshots" USING btree ("company_id","period_type","period");--> statement-breakpoint
CREATE INDEX "email_logs_company_id_idx" ON "email_logs" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "email_logs_template_id_idx" ON "email_logs" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "email_logs_config_id_idx" ON "email_logs" USING btree ("config_id");--> statement-breakpoint
CREATE INDEX "email_logs_to_email_idx" ON "email_logs" USING btree ("to_email");--> statement-breakpoint
CREATE INDEX "email_logs_status_idx" ON "email_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "email_logs_created_at_idx" ON "email_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "email_templates_company_id_idx" ON "email_templates" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "email_templates_code_idx" ON "email_templates" USING btree ("code");--> statement-breakpoint
CREATE INDEX "email_templates_category_idx" ON "email_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "email_templates_is_active_idx" ON "email_templates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "employee_points_company_id_idx" ON "employee_points" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "employee_points_employee_id_idx" ON "employee_points" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "employee_points_employee_company_unique_idx" ON "employee_points" USING btree ("company_id","employee_id");--> statement-breakpoint
CREATE INDEX "employees_company_id_idx" ON "employees" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "employees_user_id_idx" ON "employees" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "employees_department_id_idx" ON "employees" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "employees_position_id_idx" ON "employees" USING btree ("position_id");--> statement-breakpoint
CREATE INDEX "employees_employee_number_idx" ON "employees" USING btree ("employee_number");--> statement-breakpoint
CREATE INDEX "employment_contracts_company_id_idx" ON "employment_contracts" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "employment_contracts_employee_id_idx" ON "employment_contracts" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "employment_contracts_contract_number_idx" ON "employment_contracts" USING btree ("contract_number");--> statement-breakpoint
CREATE INDEX "employment_contracts_status_idx" ON "employment_contracts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "exchange_items_company_id_idx" ON "exchange_items" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "exchange_items_code_idx" ON "exchange_items" USING btree ("code");--> statement-breakpoint
CREATE INDEX "exchange_items_category_idx" ON "exchange_items" USING btree ("category");--> statement-breakpoint
CREATE INDEX "exchange_items_is_active_idx" ON "exchange_items" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "exchange_records_company_id_idx" ON "exchange_records" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "exchange_records_employee_id_idx" ON "exchange_records" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "exchange_records_item_id_idx" ON "exchange_records" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "exchange_records_status_idx" ON "exchange_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "exchange_records_created_at_idx" ON "exchange_records" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "exit_interviews_company_id_idx" ON "exit_interviews" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "exit_interviews_employee_id_idx" ON "exit_interviews" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "exit_interviews_resignation_id_idx" ON "exit_interviews" USING btree ("resignation_id");--> statement-breakpoint
CREATE INDEX "exit_interviews_interviewer_id_idx" ON "exit_interviews" USING btree ("interviewer_id");--> statement-breakpoint
CREATE INDEX "handover_checklists_company_id_idx" ON "handover_checklists" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "handover_checklists_resignation_id_idx" ON "handover_checklists" USING btree ("resignation_id");--> statement-breakpoint
CREATE INDEX "handover_checklists_employee_id_idx" ON "handover_checklists" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "handover_checklists_receiver_id_idx" ON "handover_checklists" USING btree ("receiver_id");--> statement-breakpoint
CREATE INDEX "handover_checklists_status_idx" ON "handover_checklists" USING btree ("status");--> statement-breakpoint
CREATE INDEX "hr_report_templates_company_id_idx" ON "hr_report_templates" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "hr_report_templates_code_idx" ON "hr_report_templates" USING btree ("code");--> statement-breakpoint
CREATE INDEX "hr_report_templates_category_idx" ON "hr_report_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "individual_development_plans_company_id_idx" ON "individual_development_plans" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "individual_development_plans_employee_id_idx" ON "individual_development_plans" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "individual_development_plans_mentor_id_idx" ON "individual_development_plans" USING btree ("mentor_id");--> statement-breakpoint
CREATE INDEX "individual_development_plans_manager_id_idx" ON "individual_development_plans" USING btree ("manager_id");--> statement-breakpoint
CREATE INDEX "individual_development_plans_status_idx" ON "individual_development_plans" USING btree ("status");--> statement-breakpoint
CREATE INDEX "instant_messages_company_id_idx" ON "instant_messages" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "instant_messages_from_user_id_idx" ON "instant_messages" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "instant_messages_to_user_id_idx" ON "instant_messages" USING btree ("to_user_id");--> statement-breakpoint
CREATE INDEX "instant_messages_is_read_idx" ON "instant_messages" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "instant_messages_created_at_idx" ON "instant_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "interviews_company_id_idx" ON "interviews" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "interviews_candidate_id_idx" ON "interviews" USING btree ("candidate_id");--> statement-breakpoint
CREATE INDEX "interviews_job_id_idx" ON "interviews" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "interviews_interviewer_id_idx" ON "interviews" USING btree ("interviewer_id");--> statement-breakpoint
CREATE INDEX "job_families_company_id_idx" ON "job_families" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "job_families_code_idx" ON "job_families" USING btree ("code");--> statement-breakpoint
CREATE INDEX "job_families_parent_id_idx" ON "job_families" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "job_grades_company_id_idx" ON "job_grades" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "job_grades_code_idx" ON "job_grades" USING btree ("code");--> statement-breakpoint
CREATE INDEX "job_rank_mappings_company_id_idx" ON "job_rank_mappings" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "job_rank_mappings_job_family_id_idx" ON "job_rank_mappings" USING btree ("job_family_id");--> statement-breakpoint
CREATE INDEX "job_rank_mappings_job_rank_id_idx" ON "job_rank_mappings" USING btree ("job_rank_id");--> statement-breakpoint
CREATE INDEX "job_rank_mappings_job_grade_id_idx" ON "job_rank_mappings" USING btree ("job_grade_id");--> statement-breakpoint
CREATE INDEX "job_ranks_company_id_idx" ON "job_ranks" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "job_ranks_code_idx" ON "job_ranks" USING btree ("code");--> statement-breakpoint
CREATE INDEX "jobs_company_id_idx" ON "jobs" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "jobs_department_id_idx" ON "jobs" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "jobs_status_idx" ON "jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "leave_requests_company_id_idx" ON "leave_requests" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "leave_requests_employee_id_idx" ON "leave_requests" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "leave_requests_status_idx" ON "leave_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "leave_requests_date_range_idx" ON "leave_requests" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "notifications_company_id_idx" ON "notifications" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_type_idx" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notifications_is_read_idx" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "offers_company_id_idx" ON "offers" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "offers_candidate_id_idx" ON "offers" USING btree ("candidate_id");--> statement-breakpoint
CREATE INDEX "offers_job_id_idx" ON "offers" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "offers_status_idx" ON "offers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "offers_offer_number_idx" ON "offers" USING btree ("offer_number");--> statement-breakpoint
CREATE INDEX "orders_company_id_idx" ON "orders" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "orders_user_id_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_order_no_idx" ON "orders" USING btree ("order_no");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "overtime_requests_company_id_idx" ON "overtime_requests" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "overtime_requests_employee_id_idx" ON "overtime_requests" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "overtime_requests_status_idx" ON "overtime_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "overtime_requests_overtime_date_idx" ON "overtime_requests" USING btree ("overtime_date");--> statement-breakpoint
CREATE INDEX "payroll_records_company_id_idx" ON "payroll_records" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "payroll_records_employee_id_idx" ON "payroll_records" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "payroll_records_period_idx" ON "payroll_records" USING btree ("period");--> statement-breakpoint
CREATE INDEX "payroll_records_status_idx" ON "payroll_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payroll_records_unique_idx" ON "payroll_records" USING btree ("company_id","employee_id","period");--> statement-breakpoint
CREATE INDEX "performance_cycles_company_id_idx" ON "performance_cycles" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "performance_cycles_status_idx" ON "performance_cycles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "performance_records_company_id_idx" ON "performance_records" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "performance_records_cycle_id_idx" ON "performance_records" USING btree ("cycle_id");--> statement-breakpoint
CREATE INDEX "performance_records_employee_id_idx" ON "performance_records" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "performance_records_status_idx" ON "performance_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "permissions_code_idx" ON "permissions" USING btree ("code");--> statement-breakpoint
CREATE INDEX "permissions_module_idx" ON "permissions" USING btree ("module");--> statement-breakpoint
CREATE INDEX "point_dimensions_company_id_idx" ON "point_dimensions" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "point_dimensions_code_idx" ON "point_dimensions" USING btree ("code");--> statement-breakpoint
CREATE INDEX "point_leaderboard_company_id_idx" ON "point_leaderboard" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "point_leaderboard_period_idx" ON "point_leaderboard" USING btree ("period");--> statement-breakpoint
CREATE INDEX "point_leaderboard_employee_id_idx" ON "point_leaderboard" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "point_leaderboard_rank_idx" ON "point_leaderboard" USING btree ("rank");--> statement-breakpoint
CREATE INDEX "point_leaderboard_unique_idx" ON "point_leaderboard" USING btree ("company_id","period","period_value","employee_id");--> statement-breakpoint
CREATE INDEX "point_levels_company_id_idx" ON "point_levels" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "point_levels_code_idx" ON "point_levels" USING btree ("code");--> statement-breakpoint
CREATE INDEX "point_levels_min_points_idx" ON "point_levels" USING btree ("min_points");--> statement-breakpoint
CREATE INDEX "point_rules_company_id_idx" ON "point_rules" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "point_rules_dimension_id_idx" ON "point_rules" USING btree ("dimension_id");--> statement-breakpoint
CREATE INDEX "point_rules_code_idx" ON "point_rules" USING btree ("code");--> statement-breakpoint
CREATE INDEX "point_rules_type_idx" ON "point_rules" USING btree ("type");--> statement-breakpoint
CREATE INDEX "point_rules_trigger_type_idx" ON "point_rules" USING btree ("trigger_type");--> statement-breakpoint
CREATE INDEX "point_statistics_company_id_idx" ON "point_statistics" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "point_statistics_employee_id_idx" ON "point_statistics" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "point_statistics_department_id_idx" ON "point_statistics" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "point_statistics_dimension_id_idx" ON "point_statistics" USING btree ("dimension_id");--> statement-breakpoint
CREATE INDEX "point_statistics_period_idx" ON "point_statistics" USING btree ("period");--> statement-breakpoint
CREATE INDEX "point_statistics_unique_idx" ON "point_statistics" USING btree ("company_id","employee_id","department_id","dimension_id","period","period_value");--> statement-breakpoint
CREATE INDEX "point_transactions_company_id_idx" ON "point_transactions" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "point_transactions_employee_id_idx" ON "point_transactions" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "point_transactions_rule_id_idx" ON "point_transactions" USING btree ("rule_id");--> statement-breakpoint
CREATE INDEX "point_transactions_transaction_type_idx" ON "point_transactions" USING btree ("transaction_type");--> statement-breakpoint
CREATE INDEX "point_transactions_source_idx" ON "point_transactions" USING btree ("source");--> statement-breakpoint
CREATE INDEX "point_transactions_created_at_idx" ON "point_transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "positions_company_id_idx" ON "positions" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "positions_department_id_idx" ON "positions" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "prediction_analysis_company_id_idx" ON "prediction_analysis" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "prediction_analysis_metric_code_idx" ON "prediction_analysis" USING btree ("metric_code");--> statement-breakpoint
CREATE INDEX "prediction_analysis_prediction_period_idx" ON "prediction_analysis" USING btree ("prediction_period");--> statement-breakpoint
CREATE INDEX "resignations_company_id_idx" ON "resignations" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "resignations_employee_id_idx" ON "resignations" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "resignations_applicant_id_idx" ON "resignations" USING btree ("applicant_id");--> statement-breakpoint
CREATE INDEX "resignations_status_idx" ON "resignations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "role_permissions_role_idx" ON "role_permissions" USING btree ("role");--> statement-breakpoint
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE INDEX "role_permissions_unique_idx" ON "role_permissions" USING btree ("role","permission_id");--> statement-breakpoint
CREATE INDEX "salary_structures_company_id_idx" ON "salary_structures" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "salary_structures_code_idx" ON "salary_structures" USING btree ("code");--> statement-breakpoint
CREATE INDEX "schedules_company_id_idx" ON "schedules" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "schedules_employee_id_idx" ON "schedules" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "schedules_schedule_date_idx" ON "schedules" USING btree ("schedule_date");--> statement-breakpoint
CREATE INDEX "schedules_composite_idx" ON "schedules" USING btree ("company_id","employee_id","schedule_date");--> statement-breakpoint
CREATE INDEX "sms_configs_company_id_idx" ON "sms_configs" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "sms_configs_is_active_idx" ON "sms_configs" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "sms_logs_company_id_idx" ON "sms_logs" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "sms_logs_template_id_idx" ON "sms_logs" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "sms_logs_config_id_idx" ON "sms_logs" USING btree ("config_id");--> statement-breakpoint
CREATE INDEX "sms_logs_phone_number_idx" ON "sms_logs" USING btree ("phone_number");--> statement-breakpoint
CREATE INDEX "sms_logs_status_idx" ON "sms_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sms_logs_created_at_idx" ON "sms_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "sms_statistics_company_id_idx" ON "sms_statistics" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "sms_statistics_config_id_idx" ON "sms_statistics" USING btree ("config_id");--> statement-breakpoint
CREATE INDEX "sms_statistics_template_id_idx" ON "sms_statistics" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "sms_statistics_period_idx" ON "sms_statistics" USING btree ("period");--> statement-breakpoint
CREATE INDEX "sms_statistics_unique_idx" ON "sms_statistics" USING btree ("company_id","config_id","template_id","period","period_value");--> statement-breakpoint
CREATE INDEX "sms_templates_company_id_idx" ON "sms_templates" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "sms_templates_code_idx" ON "sms_templates" USING btree ("code");--> statement-breakpoint
CREATE INDEX "sms_templates_category_idx" ON "sms_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "sms_templates_is_active_idx" ON "sms_templates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "smtp_configs_company_id_idx" ON "smtp_configs" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "smtp_configs_is_active_idx" ON "smtp_configs" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "social_insurance_records_company_id_idx" ON "social_insurance_records" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "social_insurance_records_employee_id_idx" ON "social_insurance_records" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "social_insurance_records_period_idx" ON "social_insurance_records" USING btree ("period");--> statement-breakpoint
CREATE INDEX "social_insurance_records_insurance_type_idx" ON "social_insurance_records" USING btree ("insurance_type");--> statement-breakpoint
CREATE INDEX "subscription_plans_tier_idx" ON "subscription_plans" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "subscriptions_company_id_idx" ON "subscriptions" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "subscriptions_status_idx" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "talent_pool_company_id_idx" ON "talent_pool" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "talent_pool_members_company_id_idx" ON "talent_pool_members" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "talent_pool_members_pool_id_idx" ON "talent_pool_members" USING btree ("pool_id");--> statement-breakpoint
CREATE INDEX "talent_pool_members_related_id_idx" ON "talent_pool_members" USING btree ("related_id");--> statement-breakpoint
CREATE INDEX "task_assignments_company_id_idx" ON "task_assignments" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "task_assignments_from_user_id_idx" ON "task_assignments" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "task_assignments_to_user_id_idx" ON "task_assignments" USING btree ("to_user_id");--> statement-breakpoint
CREATE INDEX "task_assignments_status_idx" ON "task_assignments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "task_assignments_task_type_idx" ON "task_assignments" USING btree ("task_type");--> statement-breakpoint
CREATE INDEX "task_assignments_due_date_idx" ON "task_assignments" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "training_courses_company_id_idx" ON "training_courses" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "training_courses_type_idx" ON "training_courses" USING btree ("type");--> statement-breakpoint
CREATE INDEX "training_courses_category_idx" ON "training_courses" USING btree ("category");--> statement-breakpoint
CREATE INDEX "training_courses_instructor_id_idx" ON "training_courses" USING btree ("instructor_id");--> statement-breakpoint
CREATE INDEX "training_courses_is_active_idx" ON "training_courses" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "training_records_company_id_idx" ON "training_records" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "training_records_course_id_idx" ON "training_records" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "training_records_employee_id_idx" ON "training_records" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "training_records_status_idx" ON "training_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "training_records_enrollment_date_idx" ON "training_records" USING btree ("enrollment_date");--> statement-breakpoint
CREATE INDEX "users_company_id_idx" ON "users" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_phone_idx" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "users_parent_user_id_idx" ON "users" USING btree ("parent_user_id");--> statement-breakpoint
CREATE INDEX "users_user_type_idx" ON "users" USING btree ("user_type");--> statement-breakpoint
CREATE INDEX "users_company_id_user_type_idx" ON "users" USING btree ("company_id","user_type");--> statement-breakpoint
CREATE INDEX "verification_codes_identifier_purpose_idx" ON "verification_codes" USING btree ("identifier","purpose");--> statement-breakpoint
CREATE INDEX "verification_codes_expires_at_idx" ON "verification_codes" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "workflow_history_company_id_idx" ON "workflow_history" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "workflow_history_instance_id_idx" ON "workflow_history" USING btree ("instance_id");--> statement-breakpoint
CREATE INDEX "workflow_history_actor_id_idx" ON "workflow_history" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "workflow_history_created_at_idx" ON "workflow_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "workflow_instances_company_id_idx" ON "workflow_instances" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "workflow_instances_template_id_idx" ON "workflow_instances" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "workflow_instances_type_idx" ON "workflow_instances" USING btree ("type");--> statement-breakpoint
CREATE INDEX "workflow_instances_status_idx" ON "workflow_instances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "workflow_instances_initiator_id_idx" ON "workflow_instances" USING btree ("initiator_id");--> statement-breakpoint
CREATE INDEX "workflow_instances_related_entity_id_idx" ON "workflow_instances" USING btree ("related_entity_id");--> statement-breakpoint
CREATE INDEX "workflow_templates_company_id_idx" ON "workflow_templates" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "workflow_templates_type_idx" ON "workflow_templates" USING btree ("type");--> statement-breakpoint
CREATE INDEX "workflow_templates_is_public_idx" ON "workflow_templates" USING btree ("is_public");