import { NextRequest, NextResponse } from 'next/server';
import { getDb, users } from '@/lib/db';
import { verifyToken } from '@/lib/auth/jwt';
import { eq } from 'drizzle-orm';

// POST /api/ai/talent-profile - AI生成人才画像
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded) {
      return NextResponse.json({ error: '无效的token' }, { status: 401 });
    }

    const body = await request.json();
    const { employeeId } = body;

    const db = await getDb();

    // 获取员工信息
    const employee = await db
      .select()
      .from(users)
      .where(eq(users.id, employeeId))
      .limit(1);

    if (!employee || employee.length === 0) {
      return NextResponse.json({ error: '员工不存在' }, { status: 404 });
    }

    const empData = employee[0];

    // 调用AI生成人才画像
    // 这里应该集成真实的大语言模型API
    const talentProfile = {
      summary: `${empData.name}是一名经验丰富的${empData.role}，在企业中表现出色。`,
      strengths: [
        '工作责任心强，能够按时完成任务',
        '团队协作能力优秀，善于沟通',
        '学习能力强，能够快速适应新环境',
      ],
      weaknesses: [
        '需要提升项目管理能力',
        '可以增强跨部门协作经验',
      ],
      developmentSuggestions: [
        '建议参加项目管理培训课程',
        '参与跨部门项目，扩大业务视野',
        '定期进行技能评估和职业规划',
      ],
      careerPath: '可向高级管理岗位发展，建议在1-2年内积累更多团队管理经验',
      riskScore: 15, // 离职风险分数（0-100）
      prediction: '近期离职风险较低，建议继续保持良好的工作环境和激励机制',
    };

    return NextResponse.json({
      success: true,
      talentProfile,
    });
  } catch (error) {
    console.error('Error generating talent profile:', error);
    return NextResponse.json(
      { error: '生成人才画像失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
