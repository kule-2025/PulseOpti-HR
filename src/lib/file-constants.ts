/**
 * 文件相关常量定义
 * 用于客户端组件引用，避免引入服务器端依赖
 */

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
