-- ============================================
-- PulseOpti HR 数据库迁移脚本
-- 版本: 1.0.0
-- 说明: 初始化数据库表结构和基础数据
-- ============================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 系统设置表
-- ============================================
CREATE TABLE IF NOT EXISTS system_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    site_name VARCHAR(255) NOT NULL DEFAULT 'PulseOpti HR 脉策聚效',
    site_url VARCHAR(500),
    logo_url TEXT,
    favicon_url TEXT,
    enable_registration BOOLEAN NOT NULL DEFAULT true,
    enable_email_verification BOOLEAN NOT NULL DEFAULT true,
    enable_sms_verification BOOLEAN NOT NULL DEFAULT true,
    enable_audit_logs BOOLEAN NOT NULL DEFAULT true,
    enable_notifications BOOLEAN NOT NULL DEFAULT true,
    maintenance_mode BOOLEAN NOT NULL DEFAULT false,
    maintenance_message TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_address TEXT,
    custom_css TEXT,
    custom_js TEXT,
    privacy_policy_url TEXT,
    terms_of_service_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_system_settings_created_at ON system_settings(created_at);

-- ============================================
-- 验证码表
-- ============================================
CREATE TABLE IF NOT EXISTS verification_codes (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    purpose VARCHAR(20) NOT NULL,
    type VARCHAR(20) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    ip_address VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_verification_codes_identifier_purpose ON verification_codes(identifier, purpose);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at);

-- ============================================
-- 企业表
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    industry VARCHAR(100),
    size VARCHAR(50),
    address TEXT,
    contact_phone VARCHAR(20),
    subscription_tier VARCHAR(20) NOT NULL DEFAULT 'free',
    max_employees INTEGER NOT NULL DEFAULT 30,
    max_admin_accounts INTEGER NOT NULL DEFAULT 1,
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_companies_code ON companies(code);
CREATE INDEX IF NOT EXISTS idx_companies_is_active ON companies(is_active);

-- ============================================
-- 用户表
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id VARCHAR(36),
    username VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    password TEXT,
    name VARCHAR(128) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'employee',
    is_super_admin BOOLEAN NOT NULL DEFAULT false,
    is_main_account BOOLEAN NOT NULL DEFAULT false,
    user_type VARCHAR(20) NOT NULL DEFAULT 'employee',
    parent_user_id VARCHAR(36),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_users_parent FOREIGN KEY (parent_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_parent_user_id ON users(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_company_user_type ON users(company_id, user_type);

-- ============================================
-- 部门表
-- ============================================
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id VARCHAR(36) NOT NULL,
    name VARCHAR(128) NOT NULL,
    code VARCHAR(50),
    parent_id VARCHAR(36),
    manager_id VARCHAR(36),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_departments_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_departments_parent FOREIGN KEY (parent_id) REFERENCES departments(id) ON DELETE SET NULL,
    CONSTRAINT fk_departments_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_departments_company_id ON departments(company_id);
CREATE INDEX IF NOT EXISTS idx_departments_parent_id ON departments(parent_id);

-- ============================================
-- 职位表
-- ============================================
CREATE TABLE IF NOT EXISTS positions (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id VARCHAR(36) NOT NULL,
    name VARCHAR(128) NOT NULL,
    code VARCHAR(50),
    level VARCHAR(50),
    department_id VARCHAR(36),
    description TEXT,
    responsibilities TEXT,
    requirements TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_positions_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_positions_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_positions_company_id ON positions(company_id);
CREATE INDEX IF NOT EXISTS idx_positions_department_id ON positions(department_id);

-- ============================================
-- 员工表
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL,
    company_id VARCHAR(36) NOT NULL,
    employee_number VARCHAR(50),
    department_id VARCHAR(36),
    position_id VARCHAR(36),
    manager_id VARCHAR(36),
    employment_type VARCHAR(20) NOT NULL,
    hire_date DATE NOT NULL,
    birth_date DATE,
    gender VARCHAR(10),
    marital_status VARCHAR(20),
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    bank_name VARCHAR(100),
    bank_account VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_employees_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_employees_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_employees_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    CONSTRAINT fk_employees_position FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL,
    CONSTRAINT fk_employees_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_position_id ON employees(position_id);
CREATE INDEX IF NOT EXISTS idx_employees_employee_number ON employees(employee_number);

-- ============================================
-- 审计日志表
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36),
    company_id VARCHAR(36),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(36),
    ip_address VARCHAR(50),
    user_agent TEXT,
    request_data JSONB,
    response_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- 工作流定义表
-- ============================================
CREATE TABLE IF NOT EXISTS workflow_definitions (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    business_type VARCHAR(50) NOT NULL,
    company_id VARCHAR(36),
    version INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    nodes JSONB NOT NULL DEFAULT '[]',
    edges JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_workflow_definitions_company_id ON workflow_definitions(company_id);
CREATE INDEX IF NOT EXISTS idx_workflow_definitions_business_type ON workflow_definitions(business_type);
CREATE INDEX IF NOT EXISTS idx_workflow_definitions_status ON workflow_definitions(status);

-- ============================================
-- 工作流实例表
-- ============================================
CREATE TABLE IF NOT EXISTS workflow_instances (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    definition_id VARCHAR(36) NOT NULL,
    company_id VARCHAR(36),
    requester_id VARCHAR(36) NOT NULL,
    current_node_id VARCHAR(36),
    current_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    business_data JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_workflow_instances_definition_id ON workflow_instances(definition_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_company_id ON workflow_instances(company_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_requester_id ON workflow_instances(requester_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_status ON workflow_instances(current_status);

-- ============================================
-- 工作流审批记录表
-- ============================================
CREATE TABLE IF NOT EXISTS workflow_approvals (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id VARCHAR(36) NOT NULL,
    node_id VARCHAR(36) NOT NULL,
    node_name VARCHAR(255),
    approver_id VARCHAR(36),
    approver_name VARCHAR(255),
    action VARCHAR(20) NOT NULL,
    comment TEXT,
    acted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_workflow_approvals_instance FOREIGN KEY (instance_id) REFERENCES workflow_instances(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_instance_id ON workflow_approvals(instance_id);
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_approver_id ON workflow_approvals(approver_id);

-- ============================================
-- 告警规则表
-- ============================================
CREATE TABLE IF NOT EXISTS alert_rules (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    company_id VARCHAR(36),
    category VARCHAR(50) NOT NULL,
    condition TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'medium',
    enabled BOOLEAN NOT NULL DEFAULT true,
    notification_channels JSONB NOT NULL DEFAULT '["email"]',
    recipients TEXT[],
    cooldown_minutes INTEGER NOT NULL DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_alert_rules_company_id ON alert_rules(company_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_category ON alert_rules(category);
CREATE INDEX IF NOT EXISTS idx_alert_rules_enabled ON alert_rules(enabled);

-- ============================================
-- 告警记录表
-- ============================================
CREATE TABLE IF NOT EXISTS alert_records (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id VARCHAR(36) NOT NULL,
    company_id VARCHAR(36),
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    acknowledged_by VARCHAR(36),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_alert_records_rule FOREIGN KEY (rule_id) REFERENCES alert_rules(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_alert_records_rule_id ON alert_records(rule_id);
CREATE INDEX IF NOT EXISTS idx_alert_records_company_id ON alert_records(company_id);
CREATE INDEX IF NOT EXISTS idx_alert_records_status ON alert_records(status);
CREATE INDEX IF NOT EXISTS idx_alert_records_created_at ON alert_records(created_at);

-- ============================================
-- AI 会话表
-- ============================================
CREATE TABLE IF NOT EXISTS ai_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36),
    company_id VARCHAR(36),
    session_type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    model VARCHAR(100) NOT NULL,
    context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_ai_sessions_user_id ON ai_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_company_id ON ai_sessions(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_type ON ai_sessions(session_type);

-- ============================================
-- AI 消息表
-- ============================================
CREATE TABLE IF NOT EXISTS ai_messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(36) NOT NULL,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    tokens INTEGER,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_ai_messages_session FOREIGN KEY (session_id) REFERENCES ai_sessions(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_ai_messages_session_id ON ai_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON ai_messages(created_at);

-- ============================================
-- AI 知识库表
-- ============================================
CREATE TABLE IF NOT EXISTS ai_knowledge (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id VARCHAR(36),
    category VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_company_id ON ai_knowledge(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_category ON ai_knowledge(category);

-- ============================================
-- 插入初始系统设置
-- ============================================
INSERT INTO system_settings (site_name, site_url, enable_registration, enable_email_verification, enable_sms_verification, enable_audit_logs, enable_notifications, contact_email, contact_address)
VALUES (
    'PulseOpti HR 脉策聚效',
    'https://pulseopti-hr.vercel.app',
    true,
    true,
    false,
    true,
    true,
    'PulseOptiHR@163.com',
    '广州市天河区'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 完成迁移
-- ============================================
SELECT 'Database migration completed successfully!' AS status;
