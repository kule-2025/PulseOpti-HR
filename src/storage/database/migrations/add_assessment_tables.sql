-- ========================================
-- 简历评估模板相关表
-- ========================================

-- 简历评估模板表
CREATE TABLE IF NOT EXISTS assessment_templates (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'resume',
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  pass_threshold INTEGER NOT NULL DEFAULT 60,
  total_weight INTEGER NOT NULL DEFAULT 100,
  created_by VARCHAR(36) NOT NULL REFERENCES users(id),
  updated_by VARCHAR(36) REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 简历评估维度表
CREATE TABLE IF NOT EXISTS assessment_dimensions (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id VARCHAR(36) NOT NULL REFERENCES assessment_templates(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  description TEXT,
  weight INTEGER NOT NULL DEFAULT 100,
  max_score INTEGER NOT NULL DEFAULT 100,
  evaluation_criteria JSONB,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 简历评估报告表
CREATE TABLE IF NOT EXISTS assessment_reports (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  template_id VARCHAR(36) REFERENCES assessment_templates(id) ON DELETE SET NULL,
  target_id VARCHAR(36) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  overall_score INTEGER NOT NULL,
  pass_score INTEGER NOT NULL DEFAULT 60,
  passed BOOLEAN NOT NULL,
  dimension_scores JSONB NOT NULL,
  issues JSONB,
  recommendations JSONB,
  confidence_level VARCHAR(20),
  metadata JSONB,
  evaluated_by VARCHAR(36) REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS assessment_templates_company_id_idx ON assessment_templates(company_id);
CREATE INDEX IF NOT EXISTS assessment_templates_category_idx ON assessment_templates(category);

CREATE INDEX IF NOT EXISTS assessment_dimensions_template_id_idx ON assessment_dimensions(template_id);
CREATE INDEX IF NOT EXISTS assessment_dimensions_code_idx ON assessment_dimensions(code);

CREATE INDEX IF NOT EXISTS assessment_reports_company_id_idx ON assessment_reports(company_id);
CREATE INDEX IF NOT EXISTS assessment_reports_template_id_idx ON assessment_reports(template_id);
CREATE INDEX IF NOT EXISTS assessment_reports_target_id_idx ON assessment_reports(target_id);
CREATE INDEX IF NOT EXISTS assessment_reports_target_type_idx ON assessment_reports(target_type);
CREATE INDEX IF NOT EXISTS assessment_reports_created_at_idx ON assessment_reports(created_at);

-- 插入默认评估模板
INSERT INTO assessment_templates (id, company_id, name, description, category, is_default, pass_threshold, total_weight, created_by)
VALUES
(
  'default-resume-template',
  'system',
  '默认简历评估模板',
  '系统预置的简历质量评估模板，包含完整性、准确性、一致性三个维度',
  'resume',
  true,
  60,
  100,
  'system'
) ON CONFLICT (id) DO NOTHING;

-- 插入默认评估维度
INSERT INTO assessment_dimensions (template_id, name, code, description, weight, max_score, sort_order, is_required)
VALUES
  ('default-resume-template', '完整性', 'completeness', '评估简历信息的完整程度', 40, 100, 1, true),
  ('default-resume-template', '准确性', 'accuracy', '评估简历信息的准确性', 40, 100, 2, true),
  ('default-resume-template', '一致性', 'consistency', '评估简历信息的逻辑一致性', 20, 100, 3, true)
ON CONFLICT DO NOTHING;
