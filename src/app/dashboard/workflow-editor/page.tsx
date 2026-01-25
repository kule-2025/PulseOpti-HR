'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Plus, 
  Save, 
  Trash2, 
  Settings, 
  Play, 
  Pause,
  ArrowRight,
  ArrowLeft,
  Copy,
  Download,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';

// 节点类型定义
type NodeType = 
  | 'start'
  | 'approval'
  | 'notification'
  | 'data-update'
  | 'condition'
  | 'parallel'
  | 'ai-analysis'
  | 'end';

// 节点接口
interface WorkflowNode {
  id: string;
  type: NodeType;
  name: string;
  position: { x: number; y: number };
  config: NodeConfig;
}

// 节点配置接口
interface NodeConfig {
  [key: string]: any;
  approver?: string;
  notificationType?: string;
  updateFields?: string[];
  conditionExpression?: string;
  parallelBranches?: number;
  aiModel?: string;
  aiPrompt?: string;
  timeout?: number;
}

// 连接线接口
interface Connection {
  id: string;
  from: string;
  to: string;
  fromPort: string;
  toPort: string;
}

// 工作流接口
interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused';
  version: number;
  nodes: WorkflowNode[];
  connections: Connection[];
}

const WorkflowEditor: React.FC = () => {
  const [workflow, setWorkflow] = useState<Workflow>({
    id: 'wf-' + Date.now(),
    name: '新建工作流',
    description: '描述工作流的目的和适用场景',
    status: 'draft',
    version: 1,
    nodes: [],
    connections: []
  });
  
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // 节点类型配置
  const nodeTypeConfig: Record<NodeType, { label: string; icon: string; color: string }> = {
    start: { label: '开始节点', icon: '▶️', color: 'bg-green-500' },
    end: { label: '结束节点', icon: '⏹️', color: 'bg-red-500' },
    approval: { label: '审批节点', icon: '✅', color: 'bg-blue-500' },
    notification: { label: '通知节点', icon: '📢', color: 'bg-yellow-500' },
    'data-update': { label: '数据更新', icon: '📝', color: 'bg-purple-500' },
    condition: { label: '条件判断', icon: '❓', color: 'bg-orange-500' },
    parallel: { label: '并行处理', icon: '🔄', color: 'bg-cyan-500' },
    'ai-analysis': { label: 'AI分析', icon: '🤖', color: 'bg-pink-500' }
  };

  // 添加节点
  const addNode = useCallback((type: NodeType, x: number, y: number) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type,
      name: nodeTypeConfig[type].label,
      position: { x, y },
      config: getDefaultConfig(type)
    };
    
    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
  }, []);

  // 获取节点默认配置
  const getDefaultConfig = (type: NodeType): NodeConfig => {
    switch (type) {
      case 'approval':
        return { approver: '', timeout: 72 };
      case 'notification':
        return { notificationType: 'email', timeout: 0 };
      case 'data-update':
        return { updateFields: [], timeout: 0 };
      case 'condition':
        return { conditionExpression: '', timeout: 0 };
      case 'parallel':
        return { parallelBranches: 2, timeout: 0 };
      case 'ai-analysis':
        return { aiModel: 'doubao', aiPrompt: '', timeout: 60 };
      default:
        return { timeout: 0 };
    }
  };

  // 删除节点
  const deleteNode = useCallback((nodeId: string) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      connections: prev.connections.filter(c => c.from !== nodeId && c.to !== nodeId)
    }));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  }, [selectedNode]);

  // 复制节点
  const duplicateNode = useCallback((node: WorkflowNode) => {
    const newNode: WorkflowNode = {
      ...node,
      id: `node-${Date.now()}`,
      name: `${node.name} (副本)`,
      position: {
        x: node.position.x + 100,
        y: node.position.y + 100
      }
    };
    
    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
  }, []);

  // 更新节点位置
  const updateNodePosition = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === nodeId ? { ...node, position } : node
      )
    }));
  }, []);

  // 处理节点拖拽开始
  const handleNodeDragStart = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = workflow.nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    setIsDragging(true);
    setDraggedNode(nodeId);
    setSelectedNode(node);
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, [workflow.nodes]);

  // 处理节点拖拽
  const handleNodeDrag = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !draggedNode || !canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left - dragOffset.x;
    const y = e.clientY - canvasRect.top - dragOffset.y;
    
    updateNodePosition(draggedNode, { x: Math.max(0, x), y: Math.max(0, y) });
  }, [isDragging, draggedNode, dragOffset, updateNodePosition]);

  // 处理节点拖拽结束
  const handleNodeDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedNode(null);
  }, []);

  // 处理画布点击
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.workflow-node')) return;
    setSelectedNode(null);
  }, []);

  // 保存工作流
  const saveWorkflow = useCallback(async () => {
    try {
      // 这里应该调用API保存工作流
      console.log('保存工作流:', workflow);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (error) {
      console.error('保存失败:', error);
    }
  }, [workflow]);

  // 更新节点配置
  const updateNodeConfig = useCallback((nodeId: string, config: Partial<NodeConfig>) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === nodeId ? { ...node, config: { ...node.config, ...config } } : node
      )
    }));
  }, []);

  // 绘制连接线
  const renderConnection = (connection: Connection) => {
    const fromNode = workflow.nodes.find(n => n.id === connection.from);
    const toNode = workflow.nodes.find(n => n.id === connection.to);
    
    if (!fromNode || !toNode) return null;
    
    const fromX = fromNode.position.x + 200;
    const fromY = fromNode.position.y + 40;
    const toX = toNode.position.x;
    const toY = toNode.position.y + 40;
    
    const midX = (fromX + toX) / 2;
    
    return (
      <svg
        key={connection.id}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0
        }}
      >
        <defs>
          <marker
            id={`arrowhead-${connection.id}`}
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
          </marker>
        </defs>
        <path
          d={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
          stroke="#94a3b8"
          strokeWidth="2"
          fill="none"
          markerEnd={`url(#arrowhead-${connection.id})`}
        />
      </svg>
    );
  };

  // 渲染节点
  const renderNode = (node: WorkflowNode) => {
    const isSelected = selectedNode?.id === node.id;
    const config = nodeTypeConfig[node.type];
    
    return (
      <div
        key={node.id}
        className={`workflow-node absolute cursor-move transition-shadow ${
          isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow-md'
        }`}
        style={{
          left: node.position.x,
          top: node.position.y,
          width: '200px',
          zIndex: 1
        }}
        onMouseDown={(e) => handleNodeDragStart(e, node.id)}
      >
        <Card className="h-full">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <span className={config.color + ' text-white w-6 h-6 rounded-full flex items-center justify-center text-xs'}>
                  {config.icon}
                </span>
                {node.name}
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={(e) => { e.stopPropagation(); duplicateNode(node); }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-red-500 hover:text-red-700"
                  onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <Badge variant="outline" className="text-xs">
              {config.label}
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  };

  // 节点配置表单
  const renderNodeConfig = () => {
    if (!selectedNode) return null;
    
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="node-name">节点名称</Label>
          <Input
            id="node-name"
            value={selectedNode.name}
            onChange={(e) => {
              const name = e.target.value;
              setWorkflow(prev => ({
                ...prev,
                nodes: prev.nodes.map(node =>
                  node.id === selectedNode.id ? { ...node, name } : node
                )
              }));
              setSelectedNode({ ...selectedNode, name });
            }}
          />
        </div>

        {selectedNode.type === 'approval' && (
          <>
            <div>
              <Label htmlFor="approver">审批人</Label>
              <Select
                value={selectedNode.config.approver}
                onValueChange={(value) => updateNodeConfig(selectedNode.id, { approver: value })}
              >
                <SelectTrigger id="approver">
                  <SelectValue placeholder="选择审批人" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">直属经理</SelectItem>
                  <SelectItem value="hrbp">HRBP</SelectItem>
                  <SelectItem value="director">部门总监</SelectItem>
                  <SelectItem value="ceo">CEO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timeout">超时时间（小时）</Label>
              <Input
                id="timeout"
                type="number"
                value={selectedNode.config.timeout}
                onChange={(e) => updateNodeConfig(selectedNode.id, { timeout: parseInt(e.target.value) })}
              />
            </div>
          </>
        )}

        {selectedNode.type === 'notification' && (
          <>
            <div>
              <Label htmlFor="notification-type">通知方式</Label>
              <Select
                value={selectedNode.config.notificationType}
                onValueChange={(value) => updateNodeConfig(selectedNode.id, { notificationType: value })}
              >
                <SelectTrigger id="notification-type">
                  <SelectValue placeholder="选择通知方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">邮件</SelectItem>
                  <SelectItem value="sms">短信</SelectItem>
                  <SelectItem value="in-app">应用内通知</SelectItem>
                  <SelectItem value="all">全部方式</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {selectedNode.type === 'data-update' && (
          <div>
            <Label htmlFor="update-fields">更新字段</Label>
            <Textarea
              id="update-fields"
              placeholder="例如：status=approved, updated_by=manager"
              value={selectedNode.config.updateFields?.join('\n')}
              onChange={(e) => updateNodeConfig(selectedNode.id, { updateFields: e.target.value.split('\n') })}
            />
          </div>
        )}

        {selectedNode.type === 'condition' && (
          <div>
            <Label htmlFor="condition-expression">条件表达式</Label>
            <Textarea
              id="condition-expression"
              placeholder="例如：salary > 10000 AND years_of_service >= 3"
              value={selectedNode.config.conditionExpression}
              onChange={(e) => updateNodeConfig(selectedNode.id, { conditionExpression: e.target.value })}
            />
          </div>
        )}

        {selectedNode.type === 'parallel' && (
          <div>
            <Label htmlFor="parallel-branches">并行分支数</Label>
            <Input
              id="parallel-branches"
              type="number"
              min="2"
              max="10"
              value={selectedNode.config.parallelBranches}
              onChange={(e) => updateNodeConfig(selectedNode.id, { parallelBranches: parseInt(e.target.value) })}
            />
          </div>
        )}

        {selectedNode.type === 'ai-analysis' && (
          <>
            <div>
              <Label htmlFor="ai-model">AI模型</Label>
              <Select
                value={selectedNode.config.aiModel}
                onValueChange={(value) => updateNodeConfig(selectedNode.id, { aiModel: value })}
              >
                <SelectTrigger id="ai-model">
                  <SelectValue placeholder="选择AI模型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doubao">豆包大模型</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="claude-3">Claude 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ai-prompt">AI提示词</Label>
              <Textarea
                id="ai-prompt"
                placeholder="输入AI分析提示词"
                value={selectedNode.config.aiPrompt}
                onChange={(e) => updateNodeConfig(selectedNode.id, { aiPrompt: e.target.value })}
              />
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">工作流可视化编辑器</h1>
              <p className="text-sm text-gray-600 mt-1">拖拽节点创建复杂业务流程</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                导入
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
              <Button onClick={saveWorkflow} size="sm">
                <Save className="h-4 w-4 mr-2" />
                保存工作流
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧工具栏 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>节点类型</CardTitle>
                <CardDescription>点击添加节点到画布</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(nodeTypeConfig).map(([type, config]) => (
                  <Button
                    key={type}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => addNode(type as NodeType, 400 + Math.random() * 200, 100 + Math.random() * 200)}
                  >
                    <span className={config.color + ' text-white w-8 h-8 rounded-full flex items-center justify-center mr-2'}>
                      {config.icon}
                    </span>
                    {config.label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>工作流信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="workflow-name">工作流名称</Label>
                  <Input
                    id="workflow-name"
                    value={workflow.name}
                    onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="workflow-description">描述</Label>
                  <Textarea
                    id="workflow-description"
                    value={workflow.description}
                    onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>状态</Label>
                  <Select
                    value={workflow.status}
                    onValueChange={(value) => setWorkflow({ ...workflow, status: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">草稿</SelectItem>
                      <SelectItem value="active">启用</SelectItem>
                      <SelectItem value="paused">暂停</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label>版本</Label>
                  <Badge>v{workflow.version}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 中间画布 */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>画布</CardTitle>
                    <CardDescription>拖拽节点，点击连接</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      测试运行
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div
                  ref={canvasRef}
                  className="relative bg-white border-t min-h-[600px] overflow-hidden"
                  onMouseMove={handleNodeDrag}
                  onMouseUp={handleNodeDragEnd}
                  onMouseLeave={handleNodeDragEnd}
                  onClick={handleCanvasClick}
                >
                  {/* 网格背景 */}
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `
                      linear-gradient(to right, #000 1px, transparent 1px),
                      linear-gradient(to bottom, #000 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                  }} />
                  
                  {/* 连接线 */}
                  {workflow.connections.map(renderConnection)}
                  
                  {/* 节点 */}
                  {workflow.nodes.map(renderNode)}
                  
                  {workflow.nodes.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <Settings className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>从左侧工具栏选择节点类型开始创建工作流</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧属性面板 */}
          <div className="lg:col-span-1">
            {selectedNode ? (
              <Card>
                <CardHeader>
                  <CardTitle>节点属性</CardTitle>
                  <CardDescription>配置节点参数</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderNodeConfig()}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>节点属性</CardTitle>
                  <CardDescription>选择节点以编辑属性</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-400 py-8">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>点击画布中的节点<br/>编辑其属性</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 统计信息 */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>统计信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">节点数量</span>
                  <Badge>{workflow.nodes.length}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">连接数量</span>
                  <Badge>{workflow.connections.length}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">状态</span>
                  <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                    {workflow.status === 'active' ? '启用' : workflow.status === 'paused' ? '暂停' : '草稿'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 保存成功提示 */}
      {showSaveSuccess && (
        <Alert className="fixed bottom-4 right-4 w-auto">
          <AlertTitle>保存成功</AlertTitle>
          <AlertDescription>工作流已成功保存</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default WorkflowEditor;
