/**
 * 短信服务核心模块
 * 支持阿里云短信和腾讯云短信
 */

export interface SmsMessage {
  phoneNumber: string;
  templateCode: string;
  templateParam?: Record<string, string>;
  signName: string;
}

export interface SmsConfig {
  provider: 'aliyun' | 'tencent';
  accessKeyId: string;
  accessKeySecret: string;
  endpoint?: string;
  signName: string;
  region?: string;
}

export interface SmsResult {
  success: boolean;
  messageId?: string;
  bizId?: string;
  error?: string;
  code?: string;
}

/**
 * 发送短信主函数
 */
export async function sendSms(
  message: SmsMessage,
  config: SmsConfig
): Promise<SmsResult> {
  try {
    if (config.provider === 'aliyun') {
      return await sendAliyunSms(message, config);
    } else if (config.provider === 'tencent') {
      return await sendTencentSms(message, config);
    } else {
      return {
        success: false,
        error: `不支持的短信服务商: ${config.provider}`,
      };
    }
  } catch (error) {
    console.error('[SMS] 发送短信失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 发送阿里云短信
 */
async function sendAliyunSms(
  message: SmsMessage,
  config: SmsConfig
): Promise<SmsResult> {
  try {
    // 阿里云短信API文档: https://help.aliyun.com/document_detail/101414.html
    const endpoint = config.endpoint || 'dysmsapi.aliyuncs.com';
    const region = config.region || 'cn-hangzhou';

    // 构造请求参数
    const params = {
      PhoneNumbers: message.phoneNumber,
      SignName: message.signName,
      TemplateCode: message.templateCode,
      TemplateParam: JSON.stringify(message.templateParam || {}),
      Action: 'SendSms',
      Version: '2017-05-25',
      Format: 'JSON',
      AccessKeyId: config.accessKeyId,
      SignatureMethod: 'HMAC-SHA1',
      SignatureNonce: Math.random().toString(),
      SignatureVersion: '1.0',
      Timestamp: new Date().toISOString(),
    };

    // 计算签名
    const signature = generateAliyunSignature(params, config.accessKeySecret);
    (params as any)['Signature'] = signature;

    // 发送请求
    const response = await fetch(
      `https://${endpoint}/?${new URLSearchParams(params as any)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const result = await response.json();

    if (result.Code === 'OK') {
      return {
        success: true,
        messageId: result.RequestId,
        bizId: result.BizId,
      };
    } else {
      return {
        success: false,
        error: result.Message || '发送失败',
        code: result.Code,
      };
    }
  } catch (error) {
    console.error('[SMS_ALIYUN] 发送短信失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 发送腾讯云短信
 */
async function sendTencentSms(
  message: SmsMessage,
  config: SmsConfig
): Promise<SmsResult> {
  try {
    // 腾讯云短信API文档: https://cloud.tencent.com/document/product/382/55981
    const endpoint = config.endpoint || 'sms.tencentcloudapi.com';
    const region = config.region || 'ap-guangzhou';

    // 构造请求参数
    const params = {
      PhoneNumberSet: [`+86${message.phoneNumber}`],
      TemplateParamSet: message.templateParam
        ? Object.values(message.templateParam)
        : [],
      TemplateID: message.templateCode,
      SmsSdkAppId: config.accessKeyId,
    };

    // 构造腾讯云API请求
    const response = await fetch(`https://${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': generateTencentAuthorization(
          config.accessKeyId,
          config.accessKeySecret,
          region,
          params
        ),
        'X-TC-Action': 'SendSms',
        'X-TC-Timestamp': Math.floor(Date.now() / 1000).toString(),
        'X-TC-Version': '2021-01-11',
        'X-TC-Region': region,
      },
      body: JSON.stringify(params),
    });

    const result = await response.json();

    if (result.Response?.Error) {
      return {
        success: false,
        error: result.Response.Error.Message || '发送失败',
        code: result.Response.Error.Code,
      };
    }

    return {
      success: true,
      messageId: result.Response?.RequestId,
      bizId: result.Response?.SendStatusSet?.[0]?.SerialNo,
    };
  } catch (error) {
    console.error('[SMS_TENCENT] 发送短信失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 生成阿里云签名
 */
function generateAliyunSignature(
  params: Record<string, string>,
  accessKeySecret: string
): string {
  // 对参数进行排序
  const sortedKeys = Object.keys(params).sort();
  const queryString = sortedKeys
    .map((key) => `${key}${encodeURIComponent(params[key])}`)
    .join('&');

  // 构造签名字符串
  const stringToSign = `GET&%2F&${encodeURIComponent(queryString)}`;

  // 生成签名
  const signature = hmacSha1(
    `${accessKeySecret}&`,
    stringToSign
  );

  return signature;
}

/**
 * 生成腾讯云Authorization
 */
function generateTencentAuthorization(
  secretId: string,
  secretKey: string,
  region: string,
  params: any
): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const date = new Date(timestamp * 1000).toISOString().substr(0, 10);

  // 构造请求头
  const headers = {
    'content-type': 'application/json',
    'host': 'sms.tencentcloudapi.com',
    'x-tc-action': 'SendSms',
    'x-tc-timestamp': timestamp.toString(),
    'x-tc-version': '2021-01-11',
    'x-tc-region': region,
  };

  // 构造签名字符串
  const headerString = Object.keys(headers)
    .map((key) => `${key.toLowerCase()}:${headers[key as keyof typeof headers]}`)
    .join(';');

  const requestPayload = JSON.stringify(params);
  const hashedPayload = sha256Hex(requestPayload);
  const canonicalRequest = `POST\n/\n\n${headerString}\n\n${headerString.toLowerCase().split(';').join(';')}\n${hashedPayload}`;

  const credentialScope = `${date}/tc3_request`;
  const hashedCanonicalRequest = sha256Hex(canonicalRequest);
  const stringToSign = `TC3-HMAC-SHA256\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`;

  // 计算签名
  const secretDate = hmacSha256(date, `TC3${secretKey}`);
  const secretService = hmacSha256('tc3_request', secretDate);
  const secretSigning = hmacSha256('tc3_request', secretService);
  const signature = hmacSha256(stringToSign, secretSigning);

  // 构造Authorization
  const authorization = `TC3-HMAC-SHA256 Credential=${secretId}/${credentialScope}, SignedHeaders=${headerString.toLowerCase().split(';').join(';')}, Signature=${signature}`;

  return authorization;
}

/**
 * HMAC-SHA1算法
 */
function hmacSha1(key: string, message: string): string {
  const crypto = require('crypto');
  return crypto
    .createHmac('sha1', key)
    .update(message)
    .digest('base64');
}

/**
 * HMAC-SHA256算法
 */
function hmacSha256(key: string, message: string): string {
  const crypto = require('crypto');
  return crypto
    .createHmac('sha256', key)
    .update(message)
    .digest('hex');
}

/**
 * SHA256算法
 */
function sha256Hex(message: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(message).digest('hex');
}

/**
 * 验证手机号格式
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  // 中国大陆手机号格式: 1开头，11位数字
  const regex = /^1[3-9]\d{9}$/;
  return regex.test(phoneNumber);
}

/**
 * 生成验证码
 */
export function generateVerificationCode(length: number = 6): string {
  const code = Math.random().toString().substring(2, 2 + length);
  return code.padEnd(length, '0');
}

/**
 * 验证验证码
 */
export function verifyVerificationCode(
  code: string,
  expectedCode: string,
  maxAge: number = 300000 // 5分钟
): boolean {
  return code === expectedCode && maxAge > 0;
}

/**
 * 手机号脱敏
 */
export function maskPhoneNumber(phoneNumber: string): string {
  if (phoneNumber.length !== 11) {
    return phoneNumber;
  }
  return phoneNumber.substring(0, 3) + '****' + phoneNumber.substring(7);
}
