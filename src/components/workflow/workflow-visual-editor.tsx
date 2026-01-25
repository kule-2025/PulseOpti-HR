'use client';

import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Save,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Settings,
  Plus,
  Trash2,
  Copy,
  Check,
  X,
  Clock,
  User,
  FileText,
  GitBranch,
  ArrowRight,
  ArrowDown
} from 'lucide-react';

export interface WorkflowNode {
  id: string;
  type: 'start' | 'task' | 'condition' | 'approval' | 'end';
  title: string;
  description?: string;
  position: { x: number; y: number };
  config?: {
    assignee?: string;
    duration?: number;
    conditions?: Array<{ field: string; operator: string; value: string }>;
    approvers?: string[];
    dataSources?: string[];
    dataTargets?: string[];
  };
  status?: 'pending' | 'active' | 'completed' | 'error';
}

export interface WorkflowConnection {
  id: string;
  from: string;
  to: string;
  condition?: string;
  label?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
}

interface WorkflowVisualEditorProps {
  template: WorkflowTemplate;
  onSave: (template: WorkflowTemplate) => void;
  onRun?: (template: WorkflowTemplate) => void;
}

const NODE_COLORS = {
  start: { bg: 'bg-green-100 dark:bg-green-900', border: 'border-green-300 dark:border-green-700' },
  task: { bg: 'bg-blue-100 dark:bg-blue-900', border: 'border-blue-300 dark:border-blue-700' },
  condition: { bg: 'bg-yellow-100 dark:bg-yellow-900', border: 'border-yellow-300 dark:border-yellow-700' },
  approval: { bg: 'bg-purple-100 dark:bg-purple-900', border: 'border-purple-300 dark:border-purple-700' },
  end: { bg: 'bg-red-100 dark:bg-red-900', border: 'border-red-300 dark:border-red-700' },
};

const NODE_ICONS = {
  start: <Play className="h-4 w-4" />,
  task: <FileText className="h-4 w-4" />,
  condition: <GitBranch className="h-4 w-4" />,
  approval: <User className="h-4 w-4" />,
  end: <Check className="h-4 w-4" />,
};

export function WorkflowVisualEditor({
  template,
  onSave,
  onRun,
}: WorkflowVisualEditorProps) {
  const [nodes, setNodes] = useState<WorkflowNode[]>(template.nodes);
  const [connections, setConnections] = useState<WorkflowConnection[]>(template.connections);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [draggingNode, setDraggingNode] = useState<WorkflowNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [isEditingProperties, setIsEditingProperties] = useState(false);
  const [nodeProperties, setNodeProperties] = useState<Partial<WorkflowNode['config']>>({});
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleNodeDragStart = (e: React.MouseEvent, node: WorkflowNode) => {
    e.stopPropagation();
    setDraggingNode(node);
    setSelectedNode(node);
  };

  const handleNodeDrag = useCallback((e: React.MouseEvent) => {
    if (!draggingNode || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - canvasRect.left - pan.x) / zoom;
    const y = (e.clientY - canvasRect.top - pan.y) / zoom;

    setNodes(prev => prev.map(node =>
      node.id === draggingNode.id
        ? { ...node, position: { x, y } }
        : node
    ));
  }, [draggingNode, pan, zoom]);

  const handleNodeDragEnd = () => {
    setDraggingNode(null);
  };

  const handleNodeSelect = (node: WorkflowNode) => {
    setSelectedNode(node);
  };

  const handleAddNode = (type: WorkflowNode['type']) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type,
      title: `新节点 ${nodes.length + 1}`,
      position: { x: 400, y: 300 },
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newNode);
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  const handleConnectStart = (nodeId: string) => {
    setIsConnecting(true);
    setConnectingFrom(nodeId);
  };

  const handleConnectEnd = (nodeId: string) => {
    if (connectingFrom && connectingFrom !== nodeId) {
      const newConnection: WorkflowConnection = {
        id: `conn-${Date.now()}`,
        from: connectingFrom,
        to: nodeId,
      };
      setConnections(prev => [...prev, newConnection]);
    }
    setIsConnecting(false);
    setConnectingFrom(null);
  };

  const handleDeleteConnection = (connId: string) => {
    setConnections(prev => prev.filter(c => c.id !== connId));
  };

  const handleSave = () => {
    onSave({
      ...template,
      nodes,
      connections,
    });
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* 工具栏 */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <Badge variant="outline">{template.category}</Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* 视图控制 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2 mr-2">
              <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleResetView}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {/* 节点工具箱 */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddNode('task')}
              >
                <FileText className="h-4 w-4 mr-1" />
                任务
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddNode('condition')}
              >
                <GitBranch className="h-4 w-4 mr-1" />
                条件
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddNode('approval')}
              >
                <User className="h-4 w-4 mr-1" />
                审批
              </Button>
            </div>

            <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 mx-2" />

            {/* 操作按钮 */}
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              保存
            </Button>
            {onRun && (
              <Button variant="default" size="sm" onClick={() => onRun({ ...template, nodes, connections })}>
                <Play className="h-4 w-4 mr-1" />
                运行
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 画布区域 */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden"
          onMouseMove={handleNodeDrag}
          onMouseUp={handleNodeDragEnd}
          style={{
            cursor: draggingNode ? 'grabbing' : 'default',
          }}
        >
          {/* 网格背景 */}
          <svg
            className="absolute inset-0 w-full h-full"
            width="100%"
            height="100%"
          >
            <defs>
              <pattern
                id="grid"
                width={20 * zoom}
                height={20 * zoom}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${20 * zoom} 0 L 0 0 0 ${20 * zoom}`}
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* 连接线 */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map(conn => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;

              return (
                <g key={conn.id}>
                  <path
                    d={`M ${fromNode.position.x + 120} ${fromNode.position.y + 30} 
                        L ${toNode.position.x} ${toNode.position.y + 30}`}
                    stroke="#64748B"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                  />
                  {conn.label && (
                    <text
                      x={(fromNode.position.x + toNode.position.x) / 2}
                      y={(fromNode.position.y + toNode.position.y) / 2 - 10}
                      className="fill-slate-600 text-xs"
                      textAnchor="middle"
                    >
                      {conn.label}
                    </text>
                  )}
                </g>
              );
            })}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#64748B" />
              </marker>
            </defs>
          </svg>

          {/* 节点 */}
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            {nodes.map(node => (
              <div
                key={node.id}
                className="absolute"
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  zIndex: selectedNode?.id === node.id ? 10 : 1,
                }}
              >
                <Card
                  className={`w-48 cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow ${NODE_COLORS[node.type].bg} ${NODE_COLORS[node.type].border} ${node.status === 'active' ? 'ring-2 ring-blue-500' : ''}`}
                  onMouseDown={(e) => handleNodeDragStart(e, node)}
                  onClick={() => handleNodeSelect(node)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="text-slate-700 dark:text-slate-300">
                          {NODE_ICONS[node.type]}
                        </div>
                        <CardTitle className="text-sm font-medium">
                          {node.title}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        {/* 连接点 */}
                        <button
                          className="w-4 h-4 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConnectStart(node.id);
                          }}
                        />
                        {/* 删除按钮 */}
                        <button
                          className="w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNode(node.id);
                          }}
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  {node.description && (
                    <CardContent className="pt-0">
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {node.description}
                      </p>
                    </CardContent>
                  )}
                </Card>

                {/* 接收连接点 */}
                <div
                  className={`absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-slate-400 dark:border-slate-600 ${isConnecting ? 'bg-blue-400' : 'bg-white dark:bg-slate-800'}`}
                  onMouseUp={() => handleConnectEnd(node.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 属性面板 */}
        {selectedNode && (
          <div className="w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">节点属性</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  节点名称
                </label>
                <input
                  type="text"
                  value={selectedNode.title}
                  onChange={(e) => setNodes(prev =>
                    prev.map(n => n.id === selectedNode.id ? { ...n, title: e.target.value } : n)
                  )}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  节点描述
                </label>
                <textarea
                  value={selectedNode.description || ''}
                  onChange={(e) => setNodes(prev =>
                    prev.map(n => n.id === selectedNode.id ? { ...n, description: e.target.value } : n)
                  )}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                  rows={3}
                />
              </div>

              {selectedNode.type === 'task' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      执行人
                    </label>
                    <input
                      type="text"
                      value={selectedNode.config?.assignee || ''}
                      onChange={(e) => setNodes(prev =>
                        prev.map(n => n.id === selectedNode.id ? {
                          ...n,
                          config: { ...n.config, assignee: e.target.value }
                        } : n)
                      )}
                      className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                      placeholder="选择执行人"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      预计时长 (小时)
                    </label>
                    <input
                      type="number"
                      value={selectedNode.config?.duration || ''}
                      onChange={(e) => setNodes(prev =>
                        prev.map(n => n.id === selectedNode.id ? {
                          ...n,
                          config: { ...n.config, duration: Number(e.target.value) }
                        } : n)
                      )}
                      className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                      placeholder="输入预计时长"
                    />
                  </div>
                </>
              )}

              {selectedNode.type === 'approval' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      审批人
                    </label>
                    <textarea
                      value={selectedNode.config?.approvers?.join('\n') || ''}
                      onChange={(e) => setNodes(prev =>
                        prev.map(n => n.id === selectedNode.id ? {
                          ...n,
                          config: { ...n.config, approvers: e.target.value.split('\n').filter(Boolean) }
                        } : n)
                      )}
                      className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                      rows={3}
                      placeholder="每行一个审批人"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  数据源 (跨表联动)
                </label>
                <textarea
                  value={selectedNode.config?.dataSources?.join('\n') || ''}
                  onChange={(e) => setNodes(prev =>
                    prev.map(n => n.id === selectedNode.id ? {
                      ...n,
                      config: { ...n.config, dataSources: e.target.value.split('\n').filter(Boolean) }
                    } : n)
                  )}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                  rows={3}
                  placeholder="每行一个数据源表/字段"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
