import { S3Storage } from 'coze-coding-dev-sdk';

// 初始化对象存储
export const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: '',
  secretKey: '',
  bucketName: process.env.COZE_BUCKET_NAME,
  region: 'cn-beijing',
});

/**
 * 上传文件到对象存储
 * @param file File对象
 * @param folder 存储文件夹路径
 * @param fileName 文件名（可选，默认使用原文件名）
 * @returns { key: string, url: string }
 */
export async function uploadFile(
  file: File,
  folder: string,
  fileName?: string
): Promise<{ key: string; url: string }> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 构造文件路径
  const safeFileName = (fileName || file.name).replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${folder}/${Date.now()}-${safeFileName}`;

  // 上传文件
  const fileKey = await storage.uploadFile({
    fileContent: buffer,
    fileName: filePath,
    contentType: file.type,
  });

  // 生成签名URL（有效期7天）
  const signedUrl = await storage.generatePresignedUrl({
    key: fileKey,
    expireTime: 7 * 24 * 3600,
  });

  return { key: fileKey, url: signedUrl };
}

/**
 * 上传Buffer到对象存储
 * @param buffer Buffer对象
 * @param folder 存储文件夹路径
 * @param fileName 文件名
 * @param contentType 文件类型
 * @returns { key: string, url: string }
 */
export async function uploadBuffer(
  buffer: Buffer,
  folder: string,
  fileName: string,
  contentType: string
): Promise<{ key: string; url: string }> {
  // 构造文件路径
  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${folder}/${Date.now()}-${safeFileName}`;

  // 上传文件
  const fileKey = await storage.uploadFile({
    fileContent: buffer,
    fileName: filePath,
    contentType,
  });

  // 生成签名URL（有效期7天）
  const signedUrl = await storage.generatePresignedUrl({
    key: fileKey,
    expireTime: 7 * 24 * 3600,
  });

  return { key: fileKey, url: signedUrl };
}

/**
 * 从URL下载并上传到对象存储
 * @param url 源URL
 * @param folder 存储文件夹路径
 * @returns { key: string, url: string }
 */
export async function uploadFromUrl(
  url: string,
  folder: string
): Promise<{ key: string; url: string }> {
  const fileKey = await storage.uploadFromUrl({
    url,
    timeout: 30000,
  });

  // 生成签名URL（有效期7天）
  const signedUrl = await storage.generatePresignedUrl({
    key: fileKey,
    expireTime: 7 * 24 * 3600,
  });

  return { key: fileKey, url: signedUrl };
}

/**
 * 获取文件的签名URL
 * @param fileKey 对象存储的key
 * @param expireTime 有效期（秒），默认7天
 * @returns 签名URL
 */
export async function getFileUrl(
  fileKey: string,
  expireTime: number = 7 * 24 * 3600
): Promise<string> {
  return storage.generatePresignedUrl({
    key: fileKey,
    expireTime,
  });
}

/**
 * 删除文件
 * @param fileKey 对象存储的key
 * @returns 是否删除成功
 */
export async function deleteFile(fileKey: string): Promise<boolean> {
  return storage.deleteFile({ fileKey });
}

/**
 * 检查文件是否存在
 * @param fileKey 对象存储的key
 * @returns 是否存在
 */
export async function fileExists(fileKey: string): Promise<boolean> {
  return storage.fileExists({ fileKey });
}

/**
 * 列出文件夹中的文件
 * @param prefix 文件夹路径前缀
 * @param maxKeys 最大返回数量
 * @returns 文件列表
 */
export async function listFiles(
  prefix: string,
  maxKeys: number = 100
): Promise<{ keys: string[]; isTruncated: boolean }> {
  const result = await storage.listFiles({ prefix, maxKeys });
  return {
    keys: result.keys,
    isTruncated: result.isTruncated,
  };
}

/**
 * 验证文件类型
 * @param file File对象
 * @param allowedTypes 允许的文件类型数组
 * @returns 是否验证通过
 */
export function validateFileType(
  file: File,
  allowedTypes: readonly string[]
): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * 验证文件大小
 * @param file File对象
 * @param maxSize 最大大小（字节）
 * @returns 是否验证通过
 */
export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

// 常用文件类型限制
export const FILE_TYPE_LIMITS = {
  images: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  videos: ['video/mp4', 'video/mpeg', 'video/quicktime'],
  audios: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
} as const;

// 常用文件大小限制
export const FILE_SIZE_LIMITS = {
  small: 1 * 1024 * 1024, // 1MB
  medium: 5 * 1024 * 1024, // 5MB
  large: 10 * 1024 * 1024, // 10MB
  xlarge: 50 * 1024 * 1024, // 50MB
  xxlarge: 100 * 1024 * 1024, // 100MB
} as const;
