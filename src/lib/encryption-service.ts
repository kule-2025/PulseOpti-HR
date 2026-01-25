/**
 * 数据加密服务
 * 提供敏感字段加密、传输加密、密钥管理
 */

import crypto from 'crypto';

export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
}

export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32;
  private ivLength = 16;
  private authTagLength = 16;

  constructor() {
    // 从环境变量获取加密密钥
    this.validateKey();
  }

  /**
   * 获取加密密钥
   */
  private getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      // 如果没有配置，使用默认密钥（生产环境必须配置）
      console.warn('未配置 ENCRYPTION_KEY，使用默认密钥（不推荐）');
      return crypto.scryptSync('default-key-change-in-production', 'salt', this.keyLength);
    }
    return Buffer.from(key, 'base64');
  }

  /**
   * 验证密钥
   */
  private validateKey() {
    const key = process.env.ENCRYPTION_KEY;
    if (key && key.length !== 44) {
      throw new Error('ENCRYPTION_KEY 必须是 44 字符的 base64 字符串');
    }
  }

  /**
   * 加密文本
   */
  encrypt(text: string): string {
    const key = this.getEncryptionKey();
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv, { authTagLength: this.authTagLength });

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = (cipher as any).getAuthTag();

    // 组合 IV、AuthTag 和加密数据
    const combined = Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, 'hex'),
    ]);

    return combined.toString('base64');
  }

  /**
   * 解密文本
   */
  decrypt(encryptedText: string): string {
    const key = this.getEncryptionKey();
    const combined = Buffer.from(encryptedText, 'base64');

    // 提取 IV、AuthTag 和加密数据
    const iv = combined.slice(0, this.ivLength);
    const authTag = combined.slice(this.ivLength, this.ivLength + this.authTagLength);
    const encrypted = combined.slice(this.ivLength + this.authTagLength);

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv, { authTagLength: this.authTagLength });
    (decipher as any).setAuthTag(authTag);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  }

  /**
   * 加密对象
   */
  encryptObject<T>(obj: T): T {
    const encrypted = JSON.parse(JSON.stringify(obj));
    
    // 加密敏感字段
    const sensitiveFields = ['password', 'phone', 'idCard', 'bankAccount', 'email'];
    
    this.encryptFields(encrypted, sensitiveFields);
    
    return encrypted as T;
  }

  /**
   * 解密对象
   */
  decryptObject<T>(obj: T): T {
    const decrypted = JSON.parse(JSON.stringify(obj));
    
    // 解密敏感字段
    const sensitiveFields = ['password', 'phone', 'idCard', 'bankAccount', 'email'];
    
    this.decryptFields(decrypted, sensitiveFields);
    
    return decrypted as T;
  }

  /**
   * 加密指定字段
   */
  private encryptFields(obj: any, fields: string[]) {
    for (const key in obj) {
      if (fields.includes(key) && typeof obj[key] === 'string') {
        try {
          // 检查是否已经加密（以 base64 格式开头）
          if (!obj[key].startsWith('encrypted:')) {
            obj[key] = 'encrypted:' + this.encrypt(obj[key]);
          }
        } catch (error) {
          console.error(`加密字段 ${key} 失败:`, error);
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.encryptFields(obj[key], fields);
      }
    }
  }

  /**
   * 解密指定字段
   */
  private decryptFields(obj: any, fields: string[]) {
    for (const key in obj) {
      if (fields.includes(key) && typeof obj[key] === 'string') {
        try {
          // 检查是否已加密
          if (obj[key].startsWith('encrypted:')) {
            obj[key] = this.decrypt(obj[key].replace('encrypted:', ''));
          }
        } catch (error) {
          console.error(`解密字段 ${key} 失败:`, error);
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.decryptFields(obj[key], fields);
      }
    }
  }

  /**
   * 生成随机密钥
   */
  generateKey(): string {
    const key = crypto.randomBytes(this.keyLength);
    return key.toString('base64');
  }

  /**
   * 哈希密码
   */
  hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  /**
   * 验证密码
   */
  verifyPassword(password: string, hash: string): boolean {
    const [salt, originalHash] = hash.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return originalHash === verifyHash;
  }

  /**
   * 生成随机 Token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * 计算 HMAC
   */
  calculateHMAC(data: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('hex');
  }

  /**
   * 验证 HMAC
   */
  verifyHMAC(data: string, secret: string, signature: string): boolean {
    const calculatedSignature = this.calculateHMAC(data, secret);
    return crypto.timingSafeEqual(
      Buffer.from(calculatedSignature),
      Buffer.from(signature)
    );
  }
}

// 导出单例
export const encryptionService = new EncryptionService();
