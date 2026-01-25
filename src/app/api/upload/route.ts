import { NextRequest, NextResponse } from 'next/server';
import { uploadFile, FILE_TYPE_LIMITS, FILE_SIZE_LIMITS, validateFileType, validateFileSize } from '@/lib/storage';

export const runtime = 'nodejs';

/**
 * POST /api/upload
 * 上传文件到对象存储
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'uploads';

    // 验证文件
    if (!file) {
      return NextResponse.json(
        { success: false, error: '未选择文件' },
        { status: 400 }
      );
    }

    // 根据文件夹验证文件类型和大小
    let allowedTypes: readonly string[] = [];
    let maxSize: number = FILE_SIZE_LIMITS.medium;

    switch (folder) {
      case 'avatars':
        allowedTypes = FILE_TYPE_LIMITS.images;
        maxSize = FILE_SIZE_LIMITS.small;
        break;
      case 'documents':
        allowedTypes = FILE_TYPE_LIMITS.documents;
        maxSize = FILE_SIZE_LIMITS.medium;
        break;
      case 'media':
        allowedTypes = [...FILE_TYPE_LIMITS.images, ...FILE_TYPE_LIMITS.videos];
        maxSize = FILE_SIZE_LIMITS.large;
        break;
      default:
        allowedTypes = [...FILE_TYPE_LIMITS.images, ...FILE_TYPE_LIMITS.documents];
        maxSize = FILE_SIZE_LIMITS.medium;
    }

    // 验证文件类型
    if (!validateFileType(file, allowedTypes)) {
      return NextResponse.json(
        { success: false, error: '不支持的文件类型' },
        { status: 400 }
      );
    }

    // 验证文件大小
    if (!validateFileSize(file, maxSize)) {
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(1);
      return NextResponse.json(
        { success: false, error: `文件大小不能超过${maxSizeMB}MB` },
        { status: 400 }
      );
    }

    // 上传文件
    const result = await uploadFile(file, folder);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('上传文件失败:', error);
    return NextResponse.json(
      { success: false, error: '上传失败，请重试' },
      { status: 500 }
    );
  }
}
