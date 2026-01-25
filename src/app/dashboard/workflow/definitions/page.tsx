'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkflowVisualization } from '@/components/workflow-visualization';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Play,
  Layers,
  CheckCircle2,
  User,
  Mail,
  GitBranch,
  X,
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: 'approval' | 'notification' | 'condition' | 'end';
  name: string;
  config: {
    approvers?: string[];
    notificationChannels?: string[];
    recipients?: string[];
    condition?: string;
    nextNode?: string;
    elseNode?: string;
  };
  position: { x: number; y: number };
}

interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  businessType: 'onboarding' | 'resignation' | 'promotion' | 'transfer' | 'salary-adjustment' | 'leave' | 'custom';
  companyId: string;
  version: number;
  status: 'draft' | 'active' | 'archived';
  nodes: WorkflowNode[];
  edges: Array<{ from: string; to: string; condition?: string }>;
  createdAt: string;
  updatedAt: string;
}

export default function WorkflowDefinitions() {
  const [definitions, setDefinitions] = useState<WorkflowDefinition[]>([]);
  const [loading, setLoading] = useState(false);

  // 对话框状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDefinition, setEditingDefinition] = useState<WorkflowDefinition | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    businessType: 'custom' as WorkflowDefinition['businessType'],
  });

  // 流程编辑器状态
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);

  // 获取流程定义列表
  const fetchDefinitions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/workflow/definitions?companyId=demo-company');
      const data = await response.json();
      if (data.success) {
        setDefinitions(data.data || []);
      }
    } catch (error) {
      console.error('获取流程定义失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 创建流程定义
  const createDefinition = async () => {
    try {
      const response = await fetch('/api/workflow/definitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          companyId: 'demo-company',
          nodes: [],
          edges: [],
        }),
      });

      const data = await response.json();
      if (data.success) {
        setDialogOpen(false);
        resetForm();
        fetchDefinitions();
      }
    } catch (error) {
      console.error('创建流程定义失败:', error);
    }
  };

  // 更新流程定义
  const updateDefinition = async () => {
    if (!editingDefinition) return;

    try {
      const response = await fetch(`/api/workflow/definitions/${editingDefinition.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          nodes: editingDefinition.nodes,
          edges: editingDefinition.edges,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setDialogOpen(false);
        resetForm();
        fetchDefinitions();
      }
    } catch (error) {
      console.error('更新流程定义失败:', error);
    }
  };

  // 删除流程定义
  const deleteDefinition = async (id: string) => {
    if (!confirm('确定要删除这个流程定义吗？')) return;

    try {
      const response = await fetch(`/api/workflow/definitions/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        fetchDefinitions();
      }
    } catch (error) {
      console.error('删除流程定义失败:', error);
    }
  };

  // 复制流程定义
  const duplicateDefinition = async (definition: WorkflowDefinition) => {
    try {
      const response = await fetch('/api/workflow/definitions/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ definitionId: definition.id }),
      });

      const data = await response.json();
      if (data.success) {
        fetchDefinitions();
      }
    } catch (error) {
      console.error('复制流程定义失败:', error);
    }
  };

  // 激活流程定义
  const activateDefinition = async (id: string) => {
    try {
      const response = await fetch(`/api/workflow/definitions/${id}/activate`, {
        method: 'PUT',
      });

      const data = await response.json();
      if (data.success) {
        fetchDefinitions();
      }
    } catch (error) {
      console.error('激活流程定义失败:', error);
    }
  };

  // 添加节点
  const addNode = (type: WorkflowNode['type']) => {
    if (!editingDefinition) return;

    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type,
      name: getDefaultNodeName(type),
      config: getDefaultNodeConfig(type),
      position: { x: 100 + editingDefinition.nodes.length * 150, y: 100 },
    };

    setEditingDefinition({
      ...editingDefinition,
      nodes: [...editingDefinition.nodes, newNode],
    });
  };

  // 更新节点
  const updateNode = (nodeId: string, updates: Partial<WorkflowNode>) => {
    if (!editingDefinition) return;

    setEditingDefinition({
      ...editingDefinition,
      nodes: editingDefinition.nodes.map(node =>
        node.id === nodeId ? { ...node, ...updates } : node
      ),
    });

    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({ ...selectedNode, ...updates });
    }
  };

  // 删除节点
  const deleteNode = (nodeId: string) => {
    if (!editingDefinition) return;

    setEditingDefinition({
      ...editingDefinition,
      nodes: editingDefinition.nodes.filter(node => node.id !== nodeId),
      edges: editingDefinition.edges.filter(edge => edge.from !== nodeId && edge.to !== nodeId),
    });

    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  // 添加连线
  const addEdge = (fromId: string, toId: string) => {
    if (!editingDefinition) return;

    setEditingDefinition({
      ...editingDefinition,
      edges: [...editingDefinition.edges, { from: fromId, to: toId }],
    });
  };

  // 获取默认节点名称
  const getDefaultNodeName = (type: WorkflowNode['type']): string => {
    const names: Record<string, string> = {
      approval: '审批节点',
      notification: '通知节点',
      condition: '条件节点',
      end: '结束节点',
    };
    return names[type] || '节点';
  };

  // 获取默认节点配置
  const getDefaultNodeConfig = (type: WorkflowNode['type']): WorkflowNode['config'] => {
    switch (type) {
      case 'approval':
        return { approvers: [] };
      case 'notification':
        return { notificationChannels: ['email'], recipients: [] };
      case 'condition':
        return { condition: '', nextNode: '', elseNode: '' };
      case 'end':
        return {};
      default:
        return {};
    }
  };

  // 获取业务类型标签
  const getBusinessTypeLabel = (type: WorkflowDefinition['businessType']): string => {
    const labels: Record<string, string> = {
      onboarding: '入职',
      resignation: '离职',
      promotion: '晋升',
      transfer: '转岗',
      'salary-adjustment': '调薪',
      leave: '请假',
      custom: '自定义',
    };
    return labels[type] || type;
  };

  // 获取状态徽章
  const getStatusBadge = (status: WorkflowDefinition['status']) => {
    const variants: Record<string, any> = {
      draft: 'secondary',
      active: 'default',
      archived: 'outline',
    };
    const labels: Record<string, string> = {
      draft: '草稿',
      active: '启用',
      archived: '已归档',
    };
    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      businessType: 'custom',
    });
    setEditingDefinition(null);
    setSelectedNode(null);
  };

  // 打开编辑对话框
  const openEditDialog = (definition: WorkflowDefinition) => {
    setEditingDefinition(definition);
    setFormData({
      name: definition.name,
      description: definition.description,
      businessType: definition.businessType,
    });
    setDialogOpen(true);
  };

  useEffect(() => {
    fetchDefinitions();
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">工作流定义</h1>
          <p className="text-muted-foreground mt-1">
            创建和管理工作流程定义
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              创建流程
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingDefinition ? '编辑流程' : '创建流程'}</DialogTitle>
              <DialogDescription>
                {editingDefinition ? '编辑工作流程定义' : '创建新的工作流程定义'}
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="basic">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">基本信息</TabsTrigger>
                <TabsTrigger value="nodes">流程节点</TabsTrigger>
                <TabsTrigger value="config">节点配置</TabsTrigger>
                <TabsTrigger value="diagram">流程图</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4">
                <div>
                  <Label htmlFor="name">流程名称 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例如：员工入职审批流程"
                  />
                </div>
                <div>
                  <Label htmlFor="businessType">业务类型 *</Label>
                  <Select
                    value={formData.businessType}
                    onValueChange={(value: WorkflowDefinition['businessType']) =>
                      setFormData({ ...formData, businessType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onboarding">入职</SelectItem>
                      <SelectItem value="resignation">离职</SelectItem>
                      <SelectItem value="promotion">晋升</SelectItem>
                      <SelectItem value="transfer">转岗</SelectItem>
                      <SelectItem value="salary-adjustment">调薪</SelectItem>
                      <SelectItem value="leave">请假</SelectItem>
                      <SelectItem value="custom">自定义</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">描述</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="描述流程的用途和适用场景"
                    rows={4}
                  />
                </div>
              </TabsContent>
              <TabsContent value="nodes" className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">添加节点</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => addNode('approval')}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      审批节点
                    </Button>
                    <Button variant="outline" onClick={() => addNode('notification')}>
                      <Mail className="h-4 w-4 mr-2" />
                      通知节点
                    </Button>
                    <Button variant="outline" onClick={() => addNode('condition')}>
                      <GitBranch className="h-4 w-4 mr-2" />
                      条件节点
                    </Button>
                    <Button variant="outline" onClick={() => addNode('end')}>
                      <X className="h-4 w-4 mr-2" />
                      结束节点
                    </Button>
                  </div>
                </div>

                {editingDefinition && editingDefinition.nodes.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">节点列表</h3>
                    <div className="space-y-2">
                      {editingDefinition.nodes.map((node) => (
                        <div
                          key={node.id}
                          className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                            selectedNode?.id === node.id ? 'border-blue-500 bg-blue-50' : ''
                          }`}
                          onClick={() => setSelectedNode(node)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {node.type === 'approval' && <CheckCircle2 className="h-4 w-4 mr-2 text-blue-500" />}
                              {node.type === 'notification' && <Mail className="h-4 w-4 mr-2 text-green-500" />}
                              {node.type === 'condition' && <GitBranch className="h-4 w-4 mr-2 text-yellow-500" />}
                              {node.type === 'end' && <X className="h-4 w-4 mr-2 text-red-500" />}
                              <span className="font-medium">{node.name}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNode(node.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="config" className="space-y-4">
                {selectedNode ? (
                  <div className="space-y-4">
                    <div>
                      <Label>节点名称</Label>
                      <Input
                        value={selectedNode.name}
                        onChange={(e) => updateNode(selectedNode.id, { name: e.target.value })}
                      />
                    </div>

                    {selectedNode.type === 'approval' && (
                      <div>
                        <Label>审批人（每行一个）</Label>
                        <Textarea
                          value={selectedNode.config.approvers?.join('\n') || ''}
                          onChange={(e) =>
                            updateNode(selectedNode.id, {
                              config: {
                                ...selectedNode.config,
                                approvers: e.target.value.split('\n').filter(u => u.trim()),
                              },
                            })
                          }
                          rows={4}
                          placeholder="输入审批人姓名或工号"
                        />
                      </div>
                    )}

                    {selectedNode.type === 'notification' && (
                      <>
                        <div>
                          <Label>通知渠道</Label>
                          <Select
                            value={selectedNode.config.notificationChannels?.[0] || 'email'}
                            onValueChange={(value: string) =>
                              updateNode(selectedNode.id, {
                                config: {
                                  ...selectedNode.config,
                                  notificationChannels: [value],
                                },
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email">邮件</SelectItem>
                              <SelectItem value="sms">短信</SelectItem>
                              <SelectItem value="system">系统消息</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>接收人（每行一个）</Label>
                          <Textarea
                            value={selectedNode.config.recipients?.join('\n') || ''}
                            onChange={(e) =>
                              updateNode(selectedNode.id, {
                                config: {
                                  ...selectedNode.config,
                                  recipients: e.target.value.split('\n').filter(u => u.trim()),
                                },
                              })
                            }
                            rows={4}
                            placeholder="输入接收人姓名或工号"
                          />
                        </div>
                      </>
                    )}

                    {selectedNode.type === 'condition' && (
                      <div>
                        <Label>条件表达式</Label>
                        <Textarea
                          value={selectedNode.config.condition || ''}
                          onChange={(e) =>
                            updateNode(selectedNode.id, {
                              config: { ...selectedNode.config, condition: e.target.value },
                            })
                          }
                          rows={4}
                          placeholder="例如：days > 3"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    请先选择一个节点
                  </div>
                )}
              </TabsContent>
              <TabsContent value="diagram" className="space-y-4">
                {editingDefinition && editingDefinition.nodes.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">流程可视化</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // 自动布局功能由组件内部处理
                        }}
                      >
                        <Layers className="h-4 w-4 mr-2" />
                        自动布局
                      </Button>
                    </div>
                    <WorkflowVisualization
                      nodes={editingDefinition.nodes}
                      edges={editingDefinition.edges}
                      onNodeClick={setSelectedNode}
                      onNodeMove={(nodeId, position) => {
                        updateNode(nodeId, { position });
                      }}
                      selectedNodeId={selectedNode?.id}
                    />
                    <div className="text-sm text-gray-600">
                      <p>提示：</p>
                      <ul className="list-disc list-inside mt-1">
                        <li>点击节点可选中并配置</li>
                        <li>拖拽节点可调整位置</li>
                        <li>蓝色矩形表示审批节点</li>
                        <li>绿色矩形表示通知节点</li>
                        <li>黄色矩形表示条件节点</li>
                        <li>红色矩形表示结束节点</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    请先在"流程节点"标签页中添加节点
                  </div>
                )}
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={editingDefinition ? updateDefinition : createDefinition}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {editingDefinition ? '更新' : '创建'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 流程定义列表 */}
      <Card>
        <CardHeader>
          <CardTitle>流程定义列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>流程名称</TableHead>
                <TableHead>业务类型</TableHead>
                <TableHead>节点数</TableHead>
                <TableHead>版本</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : definitions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    暂无流程定义
                  </TableCell>
                </TableRow>
              ) : (
                definitions.map((definition) => (
                  <TableRow key={definition.id}>
                    <TableCell className="font-medium">{definition.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getBusinessTypeLabel(definition.businessType)}</Badge>
                    </TableCell>
                    <TableCell>{definition.nodes.length}</TableCell>
                    <TableCell>v{definition.version}</TableCell>
                    <TableCell>{getStatusBadge(definition.status)}</TableCell>
                    <TableCell>
                      {new Date(definition.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {definition.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => activateDefinition(definition.id)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            启用
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(definition)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => duplicateDefinition(definition)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteDefinition(definition.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
