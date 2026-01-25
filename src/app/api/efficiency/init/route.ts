import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { EfficiencyManager } from '@/storage/database/efficiencyManager';

/**
 * 初始化人效监测系统
 * POST /api/efficiency/init
 */
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();

    // 创建人效指标配置表（如果不存在）
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS efficiency_metrics (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT,
        formula TEXT,
        unit VARCHAR(20),
        data_type VARCHAR(20) DEFAULT 'number',
        is_key BOOLEAN DEFAULT false,
        benchmark JSONB,
        weight INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE
      )
    `);

    // 创建人效数据快照表
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS efficiency_snapshots (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id VARCHAR(36) NOT NULL,
        period_type VARCHAR(20) NOT NULL,
        period VARCHAR(20) NOT NULL,
        data JSONB NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(company_id, period_type, period)
      )
    `);

    // 创建人效预警规则表
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS efficiency_alert_rules (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id VARCHAR(36) NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        metric_code VARCHAR(50) NOT NULL,
        condition VARCHAR(20) NOT NULL,
        threshold INTEGER NOT NULL,
        severity VARCHAR(20) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_by VARCHAR(36),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE
      )
    `);

    // 创建人效预警记录表
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS efficiency_alerts (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id VARCHAR(36) NOT NULL,
        rule_id VARCHAR(36) NOT NULL,
        metric_code VARCHAR(50) NOT NULL,
        period VARCHAR(20) NOT NULL,
        current_value INTEGER NOT NULL,
        threshold INTEGER NOT NULL,
        severity VARCHAR(20) NOT NULL,
        message TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        acknowledged_by VARCHAR(36),
        acknowledged_at TIMESTAMP WITH TIME ZONE,
        resolved_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // 创建归因分析记录表
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS attribution_analysis (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id VARCHAR(36) NOT NULL,
        metric_code VARCHAR(50) NOT NULL,
        period VARCHAR(20) NOT NULL,
        current_value INTEGER NOT NULL,
        previous_value INTEGER NOT NULL,
        change_rate VARCHAR(20),
        analysis JSONB NOT NULL,
        confidence INTEGER,
        requested_by VARCHAR(36),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // 创建预测分析记录表
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS prediction_analysis (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id VARCHAR(36) NOT NULL,
        metric_code VARCHAR(50) NOT NULL,
        prediction_period VARCHAR(20) NOT NULL,
        prediction_type VARCHAR(50) NOT NULL,
        current_value INTEGER NOT NULL,
        predicted_value INTEGER NOT NULL,
        confidence INTEGER NOT NULL,
        analysis JSONB NOT NULL,
        insights JSONB,
        requested_by VARCHAR(36),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // 创建决策建议记录表
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS decision_recommendations (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id VARCHAR(36) NOT NULL,
        type VARCHAR(50) NOT NULL,
        priority VARCHAR(20) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        recommendation TEXT NOT NULL,
        expected_impact JSONB,
        action_steps JSONB NOT NULL,
        resource_needs JSONB,
        related_metric_code VARCHAR(50),
        status VARCHAR(20) DEFAULT 'pending',
        assigned_to VARCHAR(36),
        completed_at TIMESTAMP WITH TIME ZONE,
        feedback TEXT,
        effectiveness INTEGER,
        ai_generated BOOLEAN DEFAULT true,
        requested_by VARCHAR(36),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE
      )
    `);

    // 创建行动计划表
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS action_plans (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id VARCHAR(36) NOT NULL,
        recommendation_id VARCHAR(36),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        target_metric_code VARCHAR(50),
        target_value INTEGER,
        start_at TIMESTAMP WITH TIME ZONE NOT NULL,
        end_at TIMESTAMP WITH TIME ZONE NOT NULL,
        tasks JSONB NOT NULL,
        budget INTEGER,
        responsible_user_id VARCHAR(36) NOT NULL,
        status VARCHAR(20) DEFAULT 'planning',
        progress INTEGER DEFAULT 0,
        notes TEXT,
        created_by VARCHAR(36),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE
      )
    `);

    // 初始化默认指标配置
    await EfficiencyManager.initMetrics();

    // 创建索引
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_efficiency_snapshots_company ON efficiency_snapshots(company_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_efficiency_snapshots_period ON efficiency_snapshots(period)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_efficiency_alert_rules_company ON efficiency_alert_rules(company_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_efficiency_alert_rules_metric ON efficiency_alert_rules(metric_code)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_efficiency_alerts_company ON efficiency_alerts(company_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_efficiency_alerts_status ON efficiency_alerts(status)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_attribution_analysis_company ON attribution_analysis(company_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_attribution_analysis_metric ON attribution_analysis(metric_code)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_prediction_analysis_company ON prediction_analysis(company_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_prediction_analysis_metric ON prediction_analysis(metric_code)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_decision_recommendations_company ON decision_recommendations(company_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_decision_recommendations_status ON decision_recommendations(status)`);

    return NextResponse.json({
      success: true,
      message: '人效监测系统初始化成功',
      data: {
        tables: [
          'efficiency_metrics',
          'efficiency_snapshots',
          'efficiency_alert_rules',
          'efficiency_alerts',
          'attribution_analysis',
          'prediction_analysis',
          'decision_recommendations',
          'action_plans',
        ],
      },
    });

  } catch (error) {
    console.error('初始化人效监测系统错误:', error);
    return NextResponse.json(
      { error: '初始化失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
