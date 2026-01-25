import { NextRequest, NextResponse } from 'next/server';
import { alertManager, AlertRule } from '@/lib/alert-manager';

/**
 * 获取告警规则列表
 */
export async function GET() {
  try {
    const rules = alertManager.getRules();

    return NextResponse.json({
      success: true,
      data: rules,
    });

  } catch (error) {
    console.error('获取告警规则失败:', error);
    return NextResponse.json(
      { error: '获取告警规则失败' },
      { status: 500 }
    );
  }
}

/**
 * 添加告警规则
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const rule: AlertRule = {
      id: body.id || `rule-${Date.now()}`,
      type: body.type,
      condition: body.condition,
      enabled: body.enabled ?? true,
      notificationChannels: body.notificationChannels || ['dashboard'],
      recipients: body.recipients || [],
    };

    alertManager.addRule(rule);

    return NextResponse.json({
      success: true,
      message: '告警规则添加成功',
      data: rule,
    });

  } catch (error) {
    console.error('添加告警规则失败:', error);
    return NextResponse.json(
      { error: '添加告警规则失败' },
      { status: 500 }
    );
  }
}

/**
 * 更新告警规则
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { ruleId } = body;

    if (!ruleId) {
      return NextResponse.json(
        { error: '缺少规则ID' },
        { status: 400 }
      );
    }

    const updates: Partial<AlertRule> = {
      enabled: body.enabled,
      notificationChannels: body.notificationChannels,
      recipients: body.recipients,
      condition: body.condition,
    };

    // 移除 undefined 值
    Object.keys(updates).forEach(key => {
      if (updates[key as keyof Partial<AlertRule>] === undefined) {
        delete updates[key as keyof Partial<AlertRule>];
      }
    });

    alertManager.updateRule(ruleId, updates);

    return NextResponse.json({
      success: true,
      message: '告警规则更新成功',
    });

  } catch (error) {
    console.error('更新告警规则失败:', error);
    return NextResponse.json(
      { error: '更新告警规则失败' },
      { status: 500 }
    );
  }
}

/**
 * 删除告警规则
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get('ruleId');

    if (!ruleId) {
      return NextResponse.json(
        { error: '缺少规则ID' },
        { status: 400 }
      );
    }

    alertManager.removeRule(ruleId);

    return NextResponse.json({
      success: true,
      message: '告警规则删除成功',
    });

  } catch (error) {
    console.error('删除告警规则失败:', error);
    return NextResponse.json(
      { error: '删除告警规则失败' },
      { status: 500 }
    );
  }
}
