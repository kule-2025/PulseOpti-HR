/**
 * 飞书 SDK 客户端
 * 提供完整的飞书API集成能力
 */

interface FeishuConfig {
  appId: string;
  appSecret: string;
  encryptKey?: string;
  verificationToken?: string;
  serverUrl?: string;
}

interface FeishuUser {
  userId: string;
  openId: string;
  unionId: string;
  name: string;
  enName?: string;
  avatar?: string;
  mobile?: string;
  email?: string;
  departmentIds?: string[];
  position?: string;
  employeeType?: number;
  status?: number;
}

interface FeishuDepartment {
  departmentId: string;
  name: string;
  enName?: string;
  parentDepartmentId?: string;
  leaderUserId?: string;
  status?: number;
}

interface FeishuMessage {
  msgType: 'text' | 'post' | 'interactive' | 'image' | 'card';
  content: any;
  receiveId: string;
  receiveIdType: 'open_id' | 'user_id' | 'union_id' | 'email' | 'chat_id';
}

interface FeishuApproval {
  approvalCode: string;
  instanceCode?: string;
  form?: Record<string, any>;
}

export class FeishuClient {
  private config: FeishuConfig;
  private accessToken: string | null = null;
  private tokenExpireTime: number = 0;
  private baseUrl: string;

  constructor(config: FeishuConfig) {
    this.config = config;
    this.baseUrl = config.serverUrl || 'https://open.feishu.cn';
  }

  /**
   * 获取访问令牌
   */
  async getAccessToken(): Promise<string> {
    // 检查token是否有效
    if (this.accessToken && Date.now() < this.tokenExpireTime) {
      return this.accessToken;
    }

    // 获取新的token
    const response = await fetch(`${this.baseUrl}/open-apis/auth/v3/tenant_access_token/internal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: this.config.appId,
        app_secret: this.config.appSecret,
      }),
    });

    const data = await response.json();

    if (data.code !== 0) {
      throw new Error(`获取飞书访问令牌失败: ${data.msg}`);
    }

    this.accessToken = data.tenant_access_token;
    this.tokenExpireTime = Date.now() + (data.expire - 60) * 1000; // 提前60秒过期

    return this.accessToken;
  }

  /**
   * 发送飞书API请求
   */
  private async request(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<any> {
    const token = await this.getAccessToken();

    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
    const data = await response.json();

    if (data.code !== 0) {
      throw new Error(`飞书API请求失败 [${data.code}]: ${data.msg}`);
    }

    return data;
  }

  /**
   * 获取OAuth授权URL
   */
  getAuthUrl(redirectUri: string, state?: string): string {
    const params = new URLSearchParams({
      app_id: this.config.appId,
      redirect_uri: redirectUri,
      scope: 'contact:user.base:readonly contact:user.email:readonly',
    });

    if (state) {
      params.append('state', state);
    }

    return `https://open.feishu.cn/open-apis/authen/v1/authorize?${params.toString()}`;
  }

  /**
   * 通过授权码获取用户信息
   */
  async getUserInfoByCode(code: string): Promise<FeishuUser> {
    const response = await fetch(`${this.baseUrl}/open-apis/authen/v1/oidc/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: this.config.appId,
        app_secret: this.config.appSecret,
        grant_type: 'authorization_code',
        code,
      }),
    });

    const data = await response.json();

    if (data.code !== 0) {
      throw new Error(`获取飞书用户令牌失败: ${data.msg}`);
    }

    const tokenData = data.data;
    const accessToken = tokenData.access_token;

    // 获取用户信息
    const userResponse = await fetch(`${this.baseUrl}/open-apis/authen/v1/user_info`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const userData = await userResponse.json();

    if (userData.code !== 0) {
      throw new Error(`获取飞书用户信息失败: ${userData.msg}`);
    }

    return this.mapUserInfo(userData.data);
  }

  /**
   * 获取用户详细信息
   */
  async getUserInfo(userId: string, userIdType: 'open_id' | 'union_id' = 'open_id'): Promise<FeishuUser> {
    const data = await this.request(`/open-apis/contact/v3/users/${userId}?user_id_type=${userIdType}`, 'GET');
    return this.mapUserInfo(data.user);
  }

  /**
   * 获取部门用户列表
   */
  async getDepartmentUsers(departmentId: string, pageSize: number = 50, pageToken?: string): Promise<{
    users: FeishuUser[];
    pageToken?: string;
    hasMore: boolean;
  }> {
    const endpoint = `/open-apis/contact/v3/users?department_id=${departmentId}&page_size=${pageSize}`;
    const fullEndpoint = pageToken ? `${endpoint}&page_token=${pageToken}` : endpoint;

    const data = await this.request(fullEndpoint, 'GET');

    return {
      users: data.data?.items?.map(this.mapUserInfo) || [],
      pageToken: data.data?.page_token,
      hasMore: data.data?.has_more || false,
    };
  }

  /**
   * 获取用户列表（支持搜索）
   */
  async searchUsers(query: string, pageSize: number = 50): Promise<FeishuUser[]> {
    const data = await this.request(
      `/open-apis/contact/v3/users/search?query=${encodeURIComponent(query)}&page_size=${pageSize}`,
      'GET'
    );

    return data.data?.items?.map(this.mapUserInfo) || [];
  }

  /**
   * 发送文本消息
   */
  async sendTextMessage(receiveId: string, content: string, receiveIdType: FeishuMessage['receiveIdType'] = 'open_id'): Promise<void> {
    const message: FeishuMessage = {
      msgType: 'text',
      content: { text: content },
      receiveId,
      receiveIdType,
    };

    await this.sendMessage(message);
  }

  /**
   * 发送卡片消息
   */
  async sendCardMessage(receiveId: string, card: any, receiveIdType: FeishuMessage['receiveIdType'] = 'open_id'): Promise<void> {
    const message: FeishuMessage = {
      msgType: 'interactive',
      content: card,
      receiveId,
      receiveIdType,
    };

    await this.sendMessage(message);
  }

  /**
   * 发送富文本消息
   */
  async sendPostMessage(receiveId: string, post: any, receiveIdType: FeishuMessage['receiveIdType'] = 'open_id'): Promise<void> {
    const message: FeishuMessage = {
      msgType: 'post',
      content: { post },
      receiveId,
      receiveIdType,
    };

    await this.sendMessage(message);
  }

  /**
   * 发送消息（通用方法）
   */
  async sendMessage(message: FeishuMessage): Promise<void> {
    await this.request('/open-apis/im/v1/messages?receive_id_type=' + message.receiveIdType, 'POST', {
      msg_type: message.msgType,
      content: JSON.stringify(message.content),
      receive_id: message.receiveId,
    });
  }

  /**
   * 创建审批实例
   */
  async createApprovalInstance(approval: FeishuApproval): Promise<{
    instanceCode: string;
    url: string;
  }> {
    const data = await this.request('/open-apis/workflow/v1/approval_instances', 'POST', {
      approval_code: approval.approvalCode,
      user_id: approval.form?.user_id,
      form: approval.form,
    });

    return {
      instanceCode: data.data?.instance_code,
      url: data.data?.url,
    };
  }

  /**
   * 获取审批实例状态
   */
  async getApprovalInstanceStatus(instanceCode: string): Promise<{
    status: string;
    currentNode: string;
    approvers: Array<{
      userId: string;
      name: string;
      status: string;
      time: number;
    }>;
  }> {
    const data = await this.request(`/open-apis/workflow/v1/approval_instances/${instanceCode}`, 'GET');

    return {
      status: data.data?.status,
      currentNode: data.data?.current_node,
      approvers: data.data?.approvers || [],
    };
  }

  /**
   * 验证事件请求
   */
  verifyEventRequest(signature: string, timestamp: string, nonce: string, body: string): boolean {
    if (!this.config.encryptKey) {
      return false;
    }

    const crypto = require('crypto');
    const sortedStr = `${timestamp}${nonce}${this.config.encryptKey}`;
    const sign = crypto.createHash('sha1').update(sortedStr).digest('hex');

    return signature === sign;
  }

  /**
   * 解密事件数据
   */
  decryptEvent(encrypt: string): any {
    if (!this.config.encryptKey) {
      throw new Error('未配置加密密钥');
    }

    const crypto = require('crypto');
    const key = Buffer.from(this.config.encryptKey, 'base64');
    const iv = Buffer.alloc(16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(encrypt, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    // 去除前16位随机字符串
    const content = decrypted.substring(16);
    const len = parseInt(content.substring(0, 16), 10);
    const json = content.substring(16, 16 + len);

    return JSON.parse(json);
  }

  /**
   * 映射用户信息
   */
  private mapUserInfo(data: any): FeishuUser {
    return {
      userId: data.user_id || data.union_id || data.open_id,
      openId: data.open_id,
      unionId: data.union_id,
      name: data.name || data.name_zh_hans || '',
      enName: data.name_en,
      avatar: data.avatar?.avatar_72 || data.avatar?.avatar_240,
      mobile: data.mobile,
      email: data.email,
      departmentIds: data.department_ids,
      position: data.position,
      employeeType: data.employee_type,
      status: data.status,
    };
  }
}

// 导出单例
export const feishuClient = new FeishuClient({
  appId: process.env.FEISHU_APP_ID || '',
  appSecret: process.env.FEISHU_APP_SECRET || '',
  encryptKey: process.env.FEISHU_ENCRYPT_KEY,
  verificationToken: process.env.FEISHU_VERIFICATION_TOKEN,
});
