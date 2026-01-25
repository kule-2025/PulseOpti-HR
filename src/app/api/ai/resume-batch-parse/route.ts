import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { S3Storage } from 'coze-coding-dev-sdk';
import { getDb } from '@/lib/db';
import { candidates, insertCandidateSchema } from '@/storage/database/shared/schema';
import { eq, inArray } from 'drizzle-orm';

/**
 * AI简历批量解析API
 * 支持批量上传和解析多份简历
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
25. tags - 智能标签（数组），包括：技能标签、岗位标签、潜力标签、软技能标签、行业标签

**字段置信度：**
26. confidence - 字段提取置信度（0-1的浮点数，表示整体解析质量）

重要注意事项：
- 日期格式统一为YYYY-MM-DD，如果只有年份则用YYYY-01-01
- 工作年限需要根据工作经历计算（精确到小数点后1位）
- 如果某个字段无法提取，返回null或空数组
- achievements务必提取可量化的成果
- 确保返回有效的JSON格式，不要有任何注释或多余文字`;

/**
 * POST /api/ai/resume-batch-parse - 批量解析简历
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
    const companyId = formData.get('companyId') as string;
    const files = formData.getAll('files') as File[];

    if (!companyId) {
      return NextResponse.json({ error: '缺少企业ID' }, { status: 400 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: '请至少上传一份简历文件' }, { status: 400 });
    }

    // 限制批量数量（最多20个文件）
    if (files.length > 20) {
      return NextResponse.json(
        { error: '批量上传数量不能超过20个文件' },
        { status: 400 }
      );
    }

    // 验证文件类型和大小
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

    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        console.warn(`跳过不支持的文件: ${file.name} (${file.type})`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        console.warn(`跳过过大的文件: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      return NextResponse.json(
        { error: '没有有效的文件可供解析' },
        { status: 400 }
      );
    }

    // 并行处理文件上传和解析
    const results = await Promise.allSettled(
      validFiles.map(async (file, index) => {
        try {
          // 读取文件内容
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          // 上传文件到对象存储
          const fileKey = await storage.uploadFile({
            fileContent: buffer,
            fileName: `resumes/batch/${Date.now()}_${index}_${file.name}`,
            contentType: file.type,
          });

          // 提取简历内容
          let resumeContent = '';

          if (file.type.startsWith('image/')) {
            // 图片使用OCR
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

          const parseResponse = await llmClient.invoke(parseMessages, {
            model: 'doubao-seed-1-8-251228',
            temperature: 0.3,
          });

          // 解析JSON响应
          let parsedData;
          try {
            const jsonMatch = parseResponse.content.match(/\{[\s\S]*\}/);
            const jsonString = jsonMatch ? jsonMatch[0] : parseResponse.content;
            parsedData = JSON.parse(jsonString);
          } catch (error) {
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
            expireTime: 86400 * 7,
          });

          // 创建候选人记录
          const db = await getDb();
          const candidateData = {
            companyId,
            name: parsedData.name || file.name.split('.')[0],
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
            source: 'ai-batch-parse',
            aiParsed: true,
            parseScore: 0.9,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const validatedData = insertCandidateSchema.parse(candidateData);
          const [newCandidate] = await db.insert(candidates).values(validatedData).returning();

          return {
            success: true,
            fileName: file.name,
            candidate: newCandidate,
            parsed: parsedData,
            resumeUrl,
          };
        } catch (error) {
          return {
            success: false,
            fileName: file.name,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      })
    );

    // 统计结果
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));

    return NextResponse.json({
      success: true,
      message: `批量解析完成：成功${successful.length}份，失败${failed.length}份`,
      data: {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
        results: results.map(r => (r.status === 'fulfilled' ? r.value : { success: false, error: 'Unknown error' })),
      },
    });

  } catch (error) {
    console.error('批量简历解析失败:', error);
    return NextResponse.json(
      {
        error: '批量简历解析失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/resume-batch-parse?status=processing - 获取批量解析任务状态（预留）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // 预留批量任务状态查询接口
    return NextResponse.json({
      success: true,
      message: '批量任务状态查询功能开发中',
      data: {
        status,
        tasks: [],
      },
    });
  } catch (error) {
    console.error('获取批量任务状态失败:', error);
    return NextResponse.json(
      { error: '获取批量任务状态失败' },
      { status: 500 }
    );
  }
}
