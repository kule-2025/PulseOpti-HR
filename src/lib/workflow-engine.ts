import { getDb } from './db';
import { randomUUID } from 'crypto';

export interface WorkflowNode {
  id: string;
  name: string;
  type: 'approval' | 'notification' | 'condition' | 'end';
  approvers: string[]; // 审批人ID列表
  order: number; // 节点顺序
  condition?: any; // 条件节点使用
  nextNodes?: string[]; // 下一个节点ID列表
}

export interface WorkflowDefinition {
  id: string;
  companyId: string;
  name: string;
  description: string;
  category: string; // approval, recruitment, performance, etc.
  nodes: WorkflowNode[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowInstance {
  id: string;
  workflowDefinitionId: string;
  companyId: string;
  businessType: string; // offer_leave, performance_review, etc.
  businessId: string; // 关联业务ID
  status: 'running' | 'completed' | 'rejected' | 'cancelled';
  currentNodeId: string;
  initiatorId: string; // 发起人ID
  variables: Record<string, any>; // 流程变量
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface ApprovalRecord {
  id: string;
  workflowInstanceId: string;
  nodeId: string;
  approverId: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  comment: string;
  actionAt: Date;
  createdAt: Date;
}

/**
 * 工作流引擎
 * 负责执行工作流实例、管理审批流程
 */
export class WorkflowEngine {
  /**
   * 创建工作流实例
   */
  async createInstance(params: {
    workflowDefinitionId: string;
    companyId: string;
    businessType: string;
    businessId: string;
    initiatorId: string;
    variables?: Record<string, any>;
  }): Promise<string> {
    const db = await getDb();
    const instanceId = randomUUID();

    // 获取工作流定义
    const workflowDefinition = await this.getDefinition(params.workflowDefinitionId);
    if (!workflowDefinition) {
      throw new Error('工作流定义不存在');
    }

    // 找到开始节点
    const startNode = workflowDefinition.nodes.find(node => node.order === 0);
    if (!startNode) {
      throw new Error('工作流定义无效：缺少开始节点');
    }

    // 创建工作流实例
    // 注意：这里需要插入到 workflow_instances 表，但当前 schema 中可能没有这个表
    // 为了演示，我们使用内存存储
    const instance: WorkflowInstance = {
      id: instanceId,
      workflowDefinitionId: params.workflowDefinitionId,
      companyId: params.companyId,
      businessType: params.businessType,
      businessId: params.businessId,
      status: 'running',
      currentNodeId: startNode.id,
      initiatorId: params.initiatorId,
      variables: params.variables || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log(`创建工作流实例: ${instanceId}`);

    // 触发工作流执行
    await this.executeInstance(instanceId, workflowDefinition);

    return instanceId;
  }

  /**
   * 执行工作流实例
   */
  private async executeInstance(instanceId: string, workflowDefinition: WorkflowDefinition): Promise<void> {
    console.log(`执行工作流实例: ${instanceId}`);

    // 获取实例（实际应从数据库查询）
    // 这里简化处理，直接获取当前节点
    const currentNode = workflowDefinition.nodes[0];

    // 根据节点类型执行不同的操作
    switch (currentNode.type) {
      case 'approval':
        await this.handleApprovalNode(instanceId, currentNode);
        break;
      case 'notification':
        await this.handleNotificationNode(instanceId, currentNode);
        break;
      case 'condition':
        await this.handleConditionNode(instanceId, currentNode);
        break;
      case 'end':
        await this.handleEndNode(instanceId);
        break;
      default:
        throw new Error(`未知的节点类型: ${currentNode.type}`);
    }
  }

  /**
   * 处理审批节点
   */
  private async handleApprovalNode(instanceId: string, node: WorkflowNode): Promise<void> {
    console.log(`处理审批节点: ${node.name}`);

    // 为每个审批人创建审批记录
    const approvalRecords: ApprovalRecord[] = node.approvers.map(approverId => ({
      id: randomUUID(),
      workflowInstanceId: instanceId,
      nodeId: node.id,
      approverId,
      status: 'pending',
      comment: '',
      actionAt: new Date(),
      createdAt: new Date(),
    }));

    console.log(`创建 ${approvalRecords.length} 条审批记录`);

    // 实际应该插入数据库，这里只是演示
    // await db.insert(approvalRecords).values(approvalRecords);

    // 发送通知给审批人
    await this.sendApprovalNotification(instanceId, node.approvers);
  }

  /**
   * 处理通知节点
   */
  private async handleNotificationNode(instanceId: string, node: WorkflowNode): Promise<void> {
    console.log(`处理通知节点: ${node.name}`);
    // 发送通知
    await this.sendNotification(instanceId, node.approvers, 'workflow_notification');
  }

  /**
   * 处理条件节点
   */
  private async handleConditionNode(instanceId: string, node: WorkflowNode): Promise<void> {
    console.log(`处理条件节点: ${node.name}`);
    // 评估条件，决定下一个节点
    // 这里简化处理，直接跳转到第一个下一个节点
    if (node.nextNodes && node.nextNodes.length > 0) {
      await this.transitionToNextNode(instanceId, node.nextNodes[0]);
    }
  }

  /**
   * 处理结束节点
   */
  private async handleEndNode(instanceId: string): Promise<void> {
    console.log(`工作流实例完成: ${instanceId}`);
    // 更新实例状态为完成
  }

  /**
   * 审批操作
   */
  async approve(params: {
    instanceId: string;
    nodeId: string;
    approverId: string;
    action: 'approve' | 'reject';
    comment: string;
  }): Promise<void> {
    console.log(`审批操作: ${params.instanceId} - ${params.action} by ${params.approverId}`);

    // 更新审批记录状态
    // await db.update(approvalRecords).set({ ... }).where(...)

    // 检查是否所有审批人都已审批
    // 如果是，则移动到下一个节点
    await this.checkAndTransition(params.instanceId, params.nodeId);
  }

  /**
   * 检查并转移到下一个节点
   */
  private async checkAndTransition(instanceId: string, nodeId: string): Promise<void> {
    console.log(`检查并转移: ${instanceId} - ${nodeId}`);
    // 获取当前节点的所有审批记录
    // 检查是否都已审批
    // 如果全部通过，则转移到下一个节点
  }

  /**
   * 转移到下一个节点
   */
  private async transitionToNextNode(instanceId: string, nextNodeId: string): Promise<void> {
    console.log(`转移到下一个节点: ${instanceId} -> ${nextNodeId}`);
    // 获取工作流定义
    // 执行下一个节点
  }

  /**
   * 发送审批通知
   */
  private async sendApprovalNotification(instanceId: string, approverIds: string[]): Promise<void> {
    console.log(`发送审批通知: ${instanceId} to ${approverIds.join(', ')}`);
    // 实际应该发送邮件或站内消息
  }

  /**
   * 发送通知
   */
  private async sendNotification(instanceId: string, userIds: string[], type: string): Promise<void> {
    console.log(`发送通知: ${instanceId} to ${userIds.join(', ')}`);
    // 实际应该发送邮件或站内消息
  }

  /**
   * 获取工作流定义
   */
  private async getDefinition(definitionId: string): Promise<WorkflowDefinition | null> {
    // 实际应该从数据库查询
    return null;
  }

  /**
   * 获取工作流实例
   */
  async getInstance(instanceId: string): Promise<WorkflowInstance | null> {
    // 实际应该从数据库查询
    return null;
  }

  /**
   * 获取实例的审批记录
   */
  async getApprovalRecords(instanceId: string): Promise<ApprovalRecord[]> {
    // 实际应该从数据库查询
    return [];
  }

  /**
   * 取消工作流实例
   */
  async cancelInstance(instanceId: string, reason: string): Promise<void> {
    console.log(`取消工作流实例: ${instanceId} - ${reason}`);
    // 更新实例状态为取消
  }

  /**
   * 获取待审批列表
   */
  async getPendingApprovals(approverId: string): Promise<WorkflowInstance[]> {
    // 查询所有当前节点需要该用户审批的实例
    return [];
  }
}

// 导出单例
export const workflowEngine = new WorkflowEngine();
