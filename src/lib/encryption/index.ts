/**
 * 数据加密工具
 * 支持字段级加密、密钥管理
 */

import crypto from 'crypto';

// 加密算法
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 32 bytes for AES-256
const IV_LENGTH = 16; // 16 bytes for AES-GCM
const AUTH_TAG_LENGTH = 16; // 16 bytes for AES-GCM auth tag

// 密钥管理接口
export interface EncryptionKey {
  id: string;
  name: string;
  key: Buffer; // 密钥（加密存储）
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 加密策略接口
export interface EncryptionPolicy {
  id: string;
  name: string;
  tableName: string;
  columnName: string;
  keyId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 加密结果接口
export interface EncryptionResult {
  iv: string; // 初始化向量（Base64）
  encryptedData: string; // 加密后的数据（Base64）
  authTag: string; // 认证标签（Base64）
  keyId: string; // 使用的密钥ID
  version: number; // 密钥版本
}

/**
 * 生成随机密钥
 */
export function generateKey(): Buffer {
  return crypto.randomBytes(KEY_LENGTH);
}

/**
 * 生成随机IV
 */
export function generateIV(): Buffer {
  return crypto.randomBytes(IV_LENGTH);
}

/**
 * 生成随机盐值
 */
export function generateSalt(): Buffer {
  return crypto.randomBytes(16);
}

/**
 * 从密码派生密钥
 */
export function deriveKeyFromPassword(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha256');
}

/**
 * 加密数据
 */
export function encrypt(plaintext: string, key: Buffer): EncryptionResult {
  const iv = generateIV();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('base64'),
    encryptedData: encrypted,
    authTag: authTag.toString('base64'),
    keyId: '', // 由调用方设置
    version: 1,
  };
}

/**
 * 解密数据
 */
export function decrypt(encryptedResult: EncryptionResult, key: Buffer): string {
  const iv = Buffer.from(encryptedResult.iv, 'base64');
  const encryptedData = Buffer.from(encryptedResult.encryptedData, 'base64');
  const authTag = Buffer.from(encryptedResult.authTag, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf8');
}

/**
 * 哈希密码
 */
export function hashPassword(password: string, salt: Buffer): string {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
  return hash.toString('base64');
}

/**
 * 验证密码
 */
export function verifyPassword(password: string, salt: Buffer, hash: string): boolean {
  const computedHash = hashPassword(password, salt);
  return computedHash === hash;
}

/**
 * 生成加密数据存储格式
 * 格式：{iv}:{encryptedData}:{authTag}:{keyId}:{version}
 */
export function formatEncryptedData(encryptedResult: EncryptionResult): string {
  return [
    encryptedResult.iv,
    encryptedResult.encryptedData,
    encryptedResult.authTag,
    encryptedResult.keyId,
    encryptedResult.version.toString(),
  ].join(':');
}

/**
 * 解析加密数据
 */
export function parseEncryptedData(formattedData: string): EncryptionResult {
  const parts = formattedData.split(':');

  if (parts.length !== 5) {
    throw new Error('Invalid encrypted data format');
  }

  return {
    iv: parts[0],
    encryptedData: parts[1],
    authTag: parts[2],
    keyId: parts[3],
    version: parseInt(parts[4], 10),
  };
}

/**
 * 使用主密钥加密数据密钥（密钥包装）
 */
export function wrapKey(dataKey: Buffer, wrappingKey: Buffer): string {
  const iv = generateIV();
  const cipher = crypto.createCipheriv(ALGORITHM, wrappingKey, iv);

  let encrypted = cipher.update(dataKey);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const authTag = cipher.getAuthTag();

  return `${iv.toString('base64')}:${encrypted.toString('base64')}:${authTag.toString('base64')}`;
}

/**
 * 使用主密钥解密数据密钥（密钥解包）
 */
export function unwrapKey(wrappedKey: string, wrappingKey: Buffer): Buffer {
  const parts = wrappedKey.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid wrapped key format');
  }

  const iv = Buffer.from(parts[0], 'base64');
  const encryptedKey = Buffer.from(parts[1], 'base64');
  const authTag = Buffer.from(parts[2], 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, wrappingKey, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedKey);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted;
}

/**
 * 加密字段值
 */
export function encryptFieldValue(value: any, key: Buffer): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const plaintext = JSON.stringify(value);
  const encrypted = encrypt(plaintext, key);

  return formatEncryptedData(encrypted);
}

/**
 * 解密字段值
 */
export function decryptFieldValue(encryptedValue: string | null, key: Buffer): any {
  if (encryptedValue === null || encryptedValue === undefined) {
    return null;
  }

  try {
    const encryptedResult = parseEncryptedData(encryptedValue);
    const plaintext = decrypt(encryptedResult, key);
    return JSON.parse(plaintext);
  } catch (error) {
    console.error('Failed to decrypt field value:', error);
    return null;
  }
}

/**
 * 生成密钥指纹（用于密钥识别）
 */
export function generateKeyFingerprint(key: Buffer): string {
  const hash = crypto.createHash('sha256').update(key).digest();
  return hash.toString('hex').substring(0, 16);
}

/**
 * 比较两个密钥是否相同
 */
export function compareKeys(key1: Buffer, key2: Buffer): boolean {
  return crypto.timingSafeEqual(key1, key2);
}

/**
 * 生成随机ID
 */
export function generateId(): string {
  return crypto.randomBytes(16).toString('hex');
}
