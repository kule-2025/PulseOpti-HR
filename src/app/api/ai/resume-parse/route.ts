import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { S3Storage } from 'coze-coding-dev-sdk';
import { getDb } from '@/lib/db';
import { candidates, insertCandidateSchema } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { assessResumeQuality, type QualityAssessmentResult } from '@/lib/services/resumeQualityAssessment';
import { assessResumeWithTemplate } from '@/lib/services/customTemplateAssessment';

/**
 * AI简历智能解析API
 * 支持多种格式：PDF、Word、HTML、图片（OCR）
 */

// 初始化LLM客户端（使用正确的配置）
const llmConfig = new Config({
  apiKey: process.env.COZE_WORKLOAD_IDENTITY_API_KEY,
});
const llmClient = new LLMClient(llmConfig);

// 初始化对象存储
const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: '',
  secretKey: '',
  bucketName: process.env.COZE_BUCKET_NAME,
  region: 'cn-beijing',
});

// System prompt for resume parsing (增强版 - 提取20+字段)
const RESUME_PARSE_SYSTEM_PROMPT = `你是一名专业的HR简历解析专家。请从提供的简历内容中全面提取所有关键信息，并以JSON格式返回。

请提取以下字段（共20+字段）：

**基本信息：**
1. name - 姓名
2. gender - 性别（male/female/other）
3. birthDate - 出生日期（YYYY-MM-DD格式）
4. nativePlace - 籍贯
5. currentCity - 现居地
6. maritalStatus - 婚姻状况（married/single/divorced）
7. politicalStatus - 政治面貌（中共党员/群众/共青团员等）

**联系方式：**
8. phone - 手机号
9. email - 邮箱
10. wechat - 微信号
11. linkedIn - LinkedIn主页
12. blog - 个人博客或GitHub链接

**教育经历：**
13. education - 教育经历（数组，每个对象包含：school学校名称, major专业, degree学位, startDate开始日期, endDate结束日期, gpa成绩绩点, honors荣誉奖项）
   - degree可选值：专科/本科/硕士/博士/其他

**工作经历：**
14. workExperience - 工作经历（数组，每个对象包含：company公司名称, position职位名称, department部门, startDate开始日期, endDate结束日期, description工作内容描述, achievements主要业绩成果数组和量化数据, resignationReason离职原因）
15. totalWorkYears - 总工作年限（年）

**项目经历：**
16. projects - 项目经历（数组，每个对象包含：name项目名称, role担任角色, startDate开始日期, endDate结束日期, description项目描述, achievements项目成果和量化数据）

**技能与证书：**
17. skills - 技能标签（数组，分类返回：技术栈、工具、框架等）
18. languageSkills - 语言能力（数组，每个对象包含：language语言, level等级如：精通/熟练/良好）
19. certificates - 证书和资质（数组）

**其他信息：**
20. achievements - 主要成就和业绩亮点（数组，尽量量化）
21. expectedSalary - 期望薪资
22. availableDate - 可到岗日期
23. hobbies - 兴趣爱好（数组）
24. selfIntroduction - 自我介绍或个人总结

**智能标签：**
25. tags - 智能标签（数组），包括：
   - 技能标签：基于skills生成
   - 岗位标签：基于经历推断的适合岗位
   - 潜力标签：根据成就和能力推断的潜力标签
   - 软技能标签：沟通能力、领导力、学习能力等
   - 行业标签：工作过的行业领域

**字段置信度：**
26. confidence - 字段提取置信度（0-1的浮点数，表示整体解析质量）

**重要注意事项：**
- 日期格式统一为YYYY-MM-DD，如果只有年份则用YYYY-01-01
- 工作年限需要根据工作经历计算（精确到小数点后1位）
- 如果某个字段无法提取，返回null或空数组
- achievements务必提取可量化的成果（如："提升系统性能30%"、"管理10人团队"、"完成500万销售目标"）
- 确保返回有效的JSON格式，不要有任何注释或多余文字
- 对于模糊信息（如不确定的离职原因），标注在reasons数组中

返回JSON示例：
{
  "name": "张三",
  "gender": "male",
  "birthDate": "1990-01-01",
  "nativePlace": "北京市",
  "currentCity": "上海市",
  "maritalStatus": "married",
  "politicalStatus": "中共党员",
  "phone": "13800138000",
  "email": "zhangsan@example.com",
  "wechat": "zhangsan_wx",
  "linkedIn": "https://linkedin.com/in/zhangsan",
  "blog": "https://github.com/zhangsan",
  "education": [{
    "school": "清华大学",
    "major": "计算机科学与技术",
    "degree": "本科",
    "startDate": "2008-09-01",
    "endDate": "2012-06-30",
    "gpa": "3.8/4.0",
    "honors": ["国家奖学金","优秀毕业生"]
  }],
  "workExperience": [{
    "company": "阿里巴巴",
    "position": "高级前端工程师",
    "department": "电商平台事业部",
    "startDate": "2017-07-01",
    "endDate": "2023-12-31",
    "description": "负责核心交易系统开发与架构优化",
    "achievements": ["优化前端性能，页面加载速度提升40%", "主导重构旧版系统，减少维护成本50%", "带领5人团队完成双十一大促任务"],
    "resignationReason": "寻求职业发展"
  }],
  "totalWorkYears": 6.5,
  "projects": [{
    "name": "大型电商平台重构",
    "role": "技术负责人",
    "startDate": "2022-01-01",
    "endDate": "2022-12-31",
    "description": "负责电商平台前端架构重构",
    "achievements": ["系统性能提升40%", "代码可维护性提升60%"]
  }],
  "skills": ["JavaScript","React","Vue","Node.js","TypeScript","Webpack"],
  "languageSkills": [{"language": "英语","level":"熟练"},{"language": "日语","level":"良好"}],
  "certificates": ["PMP项目管理","AWS解决方案架构师"],
  "achievements": ["主导开发3个大型项目","团队管理经验丰富","技术博客文章阅读量超10万"],
  "expectedSalary": "35-45K",
  "availableDate": "随时到岗",
  "hobbies": ["阅读","跑步","开源项目"],
  "selfIntroduction": "热爱技术，追求卓越，拥有6年前端开发经验",
  "tags": ["前端开发","全栈工程师","技术专家","潜力人才","团队管理","电商平台","React专家","性能优化"],
  "confidence": 0.92
}`;

/**
 * POST /api/ai/resume-parse - 解析单份简历
 */
export async function POST(request: NextRequest) {
  try {
    // 获取认证信息
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 解析表单数据
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const companyId = formData.get('companyId') as string;
    const templateId = formData.get('templateId') as string | null; // 新增：支持自定义评估模板

    if (!file) {
      return NextResponse.json({ error: '请上传简历文件' }, { status: 400 });
    }

    if (!companyId) {
      return NextResponse.json({ error: '缺少企业ID' }, { status: 400 });
    }

    // 验证文件类型
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/html',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件格式，请上传PDF、Word、图片或文本文件' },
        { status: 400 }
      );
    }

    // 文件大小限制（10MB）
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: '文件大小不能超过10MB' }, { status: 400 });
    }

    // 读取文件内容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 上传文件到对象存储
    const fileKey = await storage.uploadFile({
      fileContent: buffer,
      fileName: `resumes/${Date.now()}_${file.name}`,
      contentType: file.type,
    });

    // 生成简历内容（简化版，实际应该使用PDF解析库和OCR）
    let resumeContent = '';

    // 如果是图片，使用vision模型进行OCR
    if (file.type.startsWith('image/')) {
      const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

      const messages = [
        {
          role: 'user' as const,
          content: [
            {
              type: 'text' as const,
              text: '请识别这份简历图片中的所有文字内容，包括姓名、联系方式、教育经历、工作经历、技能等信息。请完整提取所有可见文字。',
            },
            {
              type: 'image_url' as const,
              image_url: {
                url: base64Image,
                detail: 'high',
              },
            },
          ],
        },
      ];

      const visionResponse = await llmClient.invoke(messages as any, {
        model: 'doubao-seed-1-6-vision-250815',
        temperature: 0.3,
      });

      resumeContent = visionResponse.content;
    } else {
      // 文本文件直接读取
      resumeContent = buffer.toString('utf-8');
    }

    // 调用LLM解析简历
    const parseMessages = [
      {
        role: 'system' as const,
        content: RESUME_PARSE_SYSTEM_PROMPT,
      },
      {
        role: 'user' as const,
        content: `请解析以下简历内容：\n\n${resumeContent}`,
      },
    ];

    const parseResponse = await llmClient.invoke(parseMessages as any, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.3,
      thinking: 'disabled',
    });

    // 解析JSON响应
    let parsedData;
    try {
      // 尝试提取JSON部分
      const jsonMatch = parseResponse.content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : parseResponse.content;
      parsedData = JSON.parse(jsonString);
    } catch (error) {
      console.error('JSON解析失败:', error);
      // 如果JSON解析失败，使用简化结构
      parsedData = {
        name: file.name.split('.')[0],
        phone: null,
        email: null,
        gender: null,
        birthDate: null,
        education: [],
        workExperience: [],
        skills: [],
        achievements: [],
        expectedSalary: null,
        selfIntroduction: resumeContent.substring(0, 500),
        tags: [],
      };
    }

    // 生成访问URL
    const resumeUrl = await storage.generatePresignedUrl({
      key: fileKey,
      expireTime: 86400 * 7, // 7天有效期
    });

    // 创建候选人记录（增强版 - 支持更多字段）
    const db = await getDb();
    const candidateData = {
      companyId,
      name: parsedData.name || '未知候选人',
      phone: parsedData.phone || null,
      email: parsedData.email || null,
      resumeUrl,
      resumeFileKey: fileKey,
      skills: parsedData.skills || [],
      education: parsedData.education || [],
      workExperience: parsedData.workExperience || [],
      achievements: parsedData.achievements || [],
      expectedSalary: parsedData.expectedSalary || null,
      selfIntroduction: parsedData.selfIntroduction || null,
      tags: parsedData.tags || [],
      status: 'new',
      source: 'ai-parse',
      aiParsed: true,
      parseScore: parsedData.confidence || 0.9, // 使用AI返回的置信度
      // 扩展字段（存储在JSON字段中）
      extendedInfo: {
        gender: parsedData.gender,
        birthDate: parsedData.birthDate,
        nativePlace: parsedData.nativePlace,
        currentCity: parsedData.currentCity,
        maritalStatus: parsedData.maritalStatus,
        politicalStatus: parsedData.politicalStatus,
        wechat: parsedData.wechat,
        linkedIn: parsedData.linkedIn,
        blog: parsedData.blog,
        totalWorkYears: parsedData.totalWorkYears,
        languageSkills: parsedData.languageSkills || [],
        certificates: parsedData.certificates || [],
        availableDate: parsedData.availableDate,
        hobbies: parsedData.hobbies || [],
        // 扩展教育和工作经历的额外字段
        extendedEducation: parsedData.education?.map((edu: any) => ({
          school: edu.school,
          major: edu.major,
          degree: edu.degree,
          startDate: edu.startDate,
          endDate: edu.endDate,
          gpa: edu.gpa,
          honors: edu.honors || []
        })) || [],
        extendedWorkExperience: parsedData.workExperience?.map((work: any) => ({
          company: work.company,
          position: work.position,
          department: work.department,
          startDate: work.startDate,
          endDate: work.endDate,
          description: work.description,
          achievements: work.achievements || [],
          resignationReason: work.resignationReason
        })) || [],
        // 扩展项目经历
        extendedProjects: parsedData.projects?.map((proj: any) => ({
          name: proj.name,
          role: proj.role,
          startDate: proj.startDate,
          endDate: proj.endDate,
          description: proj.description,
          achievements: proj.achievements || []
        })) || []
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const validatedData = insertCandidateSchema.parse(candidateData);
    const [newCandidate] = await db.insert(candidates).values(validatedData).returning();

    // 添加解析建议
    const suggestions: string[] = [];
    if (!parsedData.phone && !parsedData.email) {
      suggestions.push("建议补充联系方式信息");
    }
    if (!parsedData.totalWorkYears && parsedData.workExperience && parsedData.workExperience.length > 0) {
      suggestions.push("工作年限可能需要人工确认");
    }
    if (parsedData.workExperience && parsedData.workExperience.some((work: any) => !work.achievements || work.achievements.length === 0)) {
      suggestions.push("部分工作经历缺少业绩量化数据，建议补充");
    }
    if (parsedData.confidence && parsedData.confidence < 0.8) {
      suggestions.push("简历解析置信度较低，建议人工复核");
    }

    // 集成质量评估系统（支持自定义评估模板）
    let qualityAssessment: QualityAssessmentResult;

    if (templateId) {
      // 使用自定义评估模板
      qualityAssessment = await assessResumeWithTemplate(parsedData, templateId, companyId);
    } else {
      // 使用默认评估逻辑
      qualityAssessment = assessResumeQuality(parsedData);
    }

    // 将质量评估结果添加到建议中
    if (qualityAssessment.recommendations.length > 0) {
      suggestions.push(...qualityAssessment.recommendations);
    }

    // 根据质量评估结果生成额外建议
    if (qualityAssessment.confidenceLevel === 'low') {
      suggestions.push("⚠️ 简历解析质量较低，强烈建议人工复核所有字段");
    } else if (qualityAssessment.confidenceLevel === 'medium') {
      suggestions.push("ℹ️ 简历解析质量一般，建议重点检查标为警告的字段");
    }

    // 添加质量问题到解析建议
    if (qualityAssessment.issues.length > 0) {
      const criticalIssues = qualityAssessment.issues.filter(i => i.severity === 'critical');
      if (criticalIssues.length > 0) {
        suggestions.push(`🔴 发现 ${criticalIssues.length} 个严重问题，需要立即处理`);
      }
    }

    // 增强的返回数据
    const enhancedResponse = {
      candidate: newCandidate,
      parsed: parsedData,
      resumeUrl,
      // 解析质量指标（增强版 - 集成质量评估系统）
      parseQuality: {
        confidence: parsedData.confidence || 0.9,
        fieldCount: Object.keys(parsedData).filter(key => parsedData[key] !== null && parsedData[key] !== undefined && parsedData[key] !== '').length,
        // 质量评估结果
        qualityAssessment: {
          overallScore: qualityAssessment.metrics.overallScore,
          completenessScore: qualityAssessment.metrics.completenessScore,
          accuracyScore: qualityAssessment.metrics.accuracyScore,
          consistencyScore: qualityAssessment.metrics.consistencyScore,
          confidenceLevel: qualityAssessment.confidenceLevel,
          missingFields: qualityAssessment.missingFields,
          issues: qualityAssessment.issues,
        },
        extractedFields: {
          basicInfo: {
            name: !!parsedData.name,
            phone: !!parsedData.phone,
            email: !!parsedData.email,
            totalWorkYears: !!parsedData.totalWorkYears
          },
          education: {
            hasEducation: parsedData.education && parsedData.education.length > 0,
            count: parsedData.education?.length || 0,
            hasGPA: parsedData.education?.some((edu: any) => edu.gpa) || false,
            hasHonors: parsedData.education?.some((edu: any) => edu.honors && edu.honors.length > 0) || false
          },
          workExperience: {
            hasWorkExperience: parsedData.workExperience && parsedData.workExperience.length > 0,
            count: parsedData.workExperience?.length || 0,
            hasAchievements: parsedData.workExperience?.some((work: any) => work.achievements && work.achievements.length > 0) || false
          },
          skills: {
            hasSkills: parsedData.skills && parsedData.skills.length > 0,
            count: parsedData.skills?.length || 0
          },
          projects: {
            hasProjects: parsedData.projects && parsedData.projects.length > 0,
            count: parsedData.projects?.length || 0
          }
        },
        suggestions: suggestions
      }
    };

    return NextResponse.json({
      success: true,
      message: '简历解析成功（增强版）',
      data: enhancedResponse,
    });

  } catch (error) {
    console.error('简历解析失败:', error);
    return NextResponse.json(
      {
        error: '简历解析失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
