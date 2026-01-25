"use client";

import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Play,
  Save,
  Download,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  Plus,
  Trash2,
  Copy,
  Settings,
  ArrowRight,
  GitBranch,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Link,
} from 'lucide-react';
import { cn } from '@/lib/theme';

// 节点类型定义
export type NodeType = 'start' | 'approval' | 'task' | 'condition' | 'end' | 'notification' | 'assignment';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  title: string;
  description?: string;
  position: { x: number; y: number };
  config: {
    assignee?: string;
    role?: string;
    deadline?: string;
    condition?: string;
    notification?: string;
    approvalRequired?: boolean;
    dataSources?: string[]; // 跨表数据源
    autoAdvance?: boolean;
    parallelBranches?: string[]; // 并行分支
  };
  status?: 'pending' | 'in_progress' | 'completed' | 'rejected';
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  type: 'onboarding' | 'offboarding' | 'promotion' | 'transfer' | 'salary_adjustment' | 'resignation' | 'custom';
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowVisualEditorProps {
  template?: WorkflowTemplate;
  onSave?: (template: WorkflowTemplate) => void;
  onExport?: () => void;
  readOnly?: boolean;
}

// 节点配置
const NODE_TYPES = [
  { type: 'start' as NodeType, label: '开始', icon: Play, color: 'bg-green-500', allowedSources: [] },
  { type: 'approval' as NodeType, label: '审批', icon: CheckCircle, color: 'bg-blue-500' },
  { type: 'task' as NodeType, label: '任务', icon: Settings, color: 'bg-purple-500' },
  { type: 'condition' as NodeType, label: '条件', icon: GitBranch, color: 'bg-orange-500' },
  { type: 'notification' as NodeType, label: '通知', icon: AlertTriangle, color: 'bg-cyan-500' },
  { type: 'assignment' as NodeType, label: '指派', icon: Edit, color: 'bg-indigo-500' },
  { type: 'end' as NodeType, label: '结束', icon: XCircle, color: 'bg-gray-500', allowedTargets: [] },
];

// 数据源配置
const DATA_SOURCES = [
  { id: 'employees', label: '员工信息' },
  { id: 'departments', label: '部门信息' },
  { id: 'positions', label: '职位信息' },
  { id: 'salaries', label: '薪酬信息' },
  { id: 'performance', label: '绩效记录' },
  { id: 'training', label: '培训记录' },
  { id: 'attendance', label: '考勤记录' },
];

export default function WorkflowVisualEditor({
  template,
  onSave,
  onExport,
  readOnly = false,
}: WorkflowVisualEditorProps) {
  const [nodes, setNodes] = useState<WorkflowNode[]>(template?.nodes || []);
  const [edges, setEdges] = useState<WorkflowEdge[]>(template?.edges || []);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isEditingNode, setIsEditingNode] = useState(false);
  const [history, setHistory] = useState<{ nodes: WorkflowNode[]; edges: WorkflowEdge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const canvasRef = useRef<HTMLDivElement>(null);

  // 获取选中的节点
  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const selectedEdge = edges.find(e => e.id === selectedEdgeId);

  // 保存历史记录
  const saveHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...nodes], edges: [...edges] });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [nodes, edges, history, historyIndex]);

  // 添加节点
  const addNode = useCallback((type: NodeType, x: number, y: number) => {
    if (readOnly) return;

    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type,
      title: NODE_TYPES.find(t => t.type === type)?.label || '节点',
      position: { x, y },
      config: {
        approvalRequired: type === 'approval',
        dataSources: [],
      },
    };

    setNodes(prev => [...prev, newNode]);
    saveHistory();
  }, [readOnly, saveHistory]);

  // 删除节点
  const deleteNode = useCallback((nodeId: string) => {
    if (readOnly) return;

    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
    saveHistory();
  }, [readOnly, selectedNodeId, saveHistory]);

  // 添加边
  const addEdge = useCallback((sourceId: string, targetId: string, label?: string) => {
    if (readOnly) return;

    const newEdge: WorkflowEdge = {
      id: `edge_${Date.now()}`,
      source: sourceId,
      target: targetId,
      label,
    };

    setEdges(prev => [...prev, newEdge]);
    saveHistory();
  }, [readOnly, saveHistory]);

  // 删除边
  const deleteEdge = useCallback((edgeId: string) => {
    if (readOnly) return;

    setEdges(prev => prev.filter(e => e.id !== edgeId));
    if (selectedEdgeId === edgeId) {
      setSelectedEdgeId(null);
    }
    saveHistory();
  }, [readOnly, selectedEdgeId, saveHistory]);

  // 更新节点位置
  const updateNodePosition = useCallback((nodeId: string, x: number, y: number) => {
    if (readOnly) return;

    setNodes(prev =>
      prev.map(n =>
        n.id === nodeId
          ? { ...n, position: { x, y } }
          : n
      )
    );
  }, [readOnly]);

  // 更新节点配置
  const updateNodeConfig = useCallback((nodeId: string, config: Partial<WorkflowNode['config']>) => {
    if (readOnly) return;

    setNodes(prev =>
      prev.map(n =>
        n.id === nodeId
          ? { ...n, config: { ...n.config, ...config } }
          : n
      )
    );
    saveHistory();
  }, [readOnly, saveHistory]);

  // 撤销
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const state = history[historyIndex - 1];
      setNodes(state.nodes);
      setEdges(state.edges);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  // 重做
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const state = history[historyIndex + 1];
      setNodes(state.nodes);
      setEdges(state.edges);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  // 处理画布点击
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
    }
  }, []);

  // 处理节点拖拽开始
  const handleNodeDragStart = useCallback((e: React.MouseEvent, nodeId: string) => {
    if (readOnly) return;

    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setIsDragging(true);

    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setDragOffset({
        x: e.clientX - node.position.x,
        y: e.clientY - node.position.y,
      });
    }
  }, [readOnly, nodes]);

  // 处理节点拖拽
  const handleNodeDrag = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedNodeId) return;

    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;
    updateNodePosition(selectedNodeId, x, y);
  }, [isDragging, selectedNodeId, dragOffset, updateNodePosition]);

  // 处理节点拖拽结束
  const handleNodeDragEnd = useCallback(() => {
    setIsDragging(false);
    saveHistory();
  }, [saveHistory]);

  // 保存工作流
  const handleSave = useCallback(() => {
    const templateData: WorkflowTemplate = {
      id: template?.id || `template_${Date.now()}`,
      name: template?.name || '未命名工作流',
      type: template?.type || 'custom',
      nodes,
      edges,
      version: (template?.version || 0) + 1,
      isActive: true,
      createdAt: template?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave?.(templateData);
  }, [template, nodes, edges, onSave]);

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* 工具栏 */}
      <Card className="m-4 mb-0">
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle>工作流编辑器</CardTitle>
              <Badge variant="outline">v{template?.version || 1}</Badge>
              {!readOnly && (
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={undo} disabled={historyIndex <= 0}>
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={redo} disabled={historyIndex >= history.length - 1}>
                    <Redo className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
                <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setZoom(1)}>
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
              {!readOnly && (
                <>
                  {onExport && (
                    <Button variant="outline" size="icon" onClick={onExport}>
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Save className="h-4 w-4 mr-2" />
                    保存
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 主体内容 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 节点工具栏 */}
        {!readOnly && (
          <Card className="w-64 m-4 mr-0 overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-base">节点库</CardTitle>
              <CardDescription>拖拽节点到画布</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {NODE_TYPES.map((nodeType) => {
                const Icon = nodeType.icon;
                return (
                  <div
                    key={nodeType.type}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('nodeType', nodeType.type);
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed cursor-move hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                  >
                    <div className={cn("p-2 rounded-lg", nodeType.color, "text-white")}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{nodeType.label}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* 画布 */}
        <Card className="flex-1 m-4 overflow-hidden">
          <CardContent className="h-full p-0">
            <div
              ref={canvasRef}
              className="h-full relative overflow-auto bg-white dark:bg-slate-800"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                  linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
              }}
              onClick={handleCanvasClick}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const nodeType = e.dataTransfer.getData('nodeType') as NodeType;
                if (nodeType) {
                  const rect = canvasRef.current?.getBoundingClientRect();
                  if (rect) {
                    const x = (e.clientX - rect.left) / zoom;
                    const y = (e.clientY - rect.top) / zoom;
                    addNode(nodeType, x, y);
                  }
                }
              }}
              onMouseMove={handleNodeDrag}
              onMouseUp={handleNodeDragEnd}
            >
              <div
                className="absolute inset-0"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                }}
              >
                {/* 绘制连线 */}
                <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
                  {edges.map((edge) => {
                    const sourceNode = nodes.find(n => n.id === edge.source);
                    const targetNode = nodes.find(n => n.id === edge.target);

                    if (!sourceNode || !targetNode) return null;

                    const isSelected = selectedEdgeId === edge.id;

                    return (
                      <g key={edge.id}>
                        <path
                          d={`M ${sourceNode.position.x + 100} ${sourceNode.position.y + 50} L ${targetNode.position.x} ${targetNode.position.y + 50}`}
                          stroke={isSelected ? '#2563EB' : '#94a3b8'}
                          strokeWidth={isSelected ? 3 : 2}
                          fill="none"
                          className="cursor-pointer pointer-events-auto hover:stroke-blue-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEdgeId(edge.id);
                            setSelectedNodeId(null);
                          }}
                        />
                        <polygon
                          points={`${targetNode.position.x},${targetNode.position.y + 50} ${targetNode.position.x - 10},${targetNode.position.y + 45} ${targetNode.position.x - 10},${targetNode.position.y + 55}`}
                          fill={isSelected ? '#2563EB' : '#94a3b8'}
                        />
                        {edge.label && (
                          <text
                            x={(sourceNode.position.x + targetNode.position.x) / 2}
                            y={(sourceNode.position.y + targetNode.position.y) / 2 + 40}
                            textAnchor="middle"
                            className="text-xs fill-slate-600 dark:fill-slate-400"
                          >
                            {edge.label}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* 绘制节点 */}
                {nodes.map((node) => {
                  const nodeType = NODE_TYPES.find(t => t.type === node.type);
                  const Icon = nodeType?.icon || Settings;
                  const isSelected = selectedNodeId === node.id;

                  return (
                    <div
                      key={node.id}
                      className={cn(
                        "absolute flex items-center gap-2 p-3 rounded-lg cursor-move transition-all",
                        "bg-white dark:bg-slate-800 border-2 shadow-lg",
                        isSelected ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900" : "border-slate-200 dark:border-slate-700",
                        "hover:border-blue-300 dark:hover:border-blue-700"
                      )}
                      style={{
                        left: node.position.x,
                        top: node.position.y,
                        width: 200,
                      }}
                      onMouseDown={(e) => handleNodeDragStart(e, node.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNodeId(node.id);
                        setSelectedEdgeId(null);
                      }}
                    >
                      <div className={cn("p-2 rounded-lg", nodeType?.color, "text-white flex-shrink-0")}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{node.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{node.description}</p>
                      </div>
                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNode(node.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 节点属性面板 */}
        {(selectedNode || selectedEdge) && (
          <Card className="w-80 m-4 ml-0 overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                {selectedNode ? '节点属性' : '连线属性'}
                {!readOnly && selectedEdge && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteEdge(selectedEdgeId!)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedNode && (
                <Tabs defaultValue="basic" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">基本</TabsTrigger>
                    <TabsTrigger value="config">配置</TabsTrigger>
                    <TabsTrigger value="data">数据</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div>
                      <Label>节点名称</Label>
                      <Input
                        value={selectedNode.title}
                        onChange={(e) => {
                          setNodes(prev =>
                            prev.map(n =>
                              n.id === selectedNodeId
                                ? { ...n, title: e.target.value }
                                : n
                            )
                          );
                        }}
                        disabled={readOnly}
                      />
                    </div>
                    <div>
                      <Label>描述</Label>
                      <Textarea
                        value={selectedNode.description || ''}
                        onChange={(e) => {
                          setNodes(prev =>
                            prev.map(n =>
                              n.id === selectedNodeId
                                ? { ...n, description: e.target.value }
                                : n
                            )
                          );
                        }}
                        disabled={readOnly}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>节点类型</Label>
                      <Badge variant="outline">{NODE_TYPES.find(t => t.type === selectedNode.type)?.label}</Badge>
                    </div>
                  </TabsContent>

                  <TabsContent value="config" className="space-y-4">
                    {(selectedNode.type === 'approval' || selectedNode.type === 'task' || selectedNode.type === 'assignment') && (
                      <>
                        <div>
                          <Label>指派给</Label>
                          <Select
                            value={selectedNode.config.assignee || 'none'}
                            onValueChange={(value) => updateNodeConfig(selectedNodeId!, { assignee: value })}
                            disabled={readOnly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="选择人员" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">未指派</SelectItem>
                              <SelectItem value="hr">HR部门</SelectItem>
                              <SelectItem value="manager">部门经理</SelectItem>
                              <SelectItem value="director">总监</SelectItem>
                              <SelectItem value="ceo">CEO</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>截止日期 (天)</Label>
                          <Input
                            type="number"
                            value={selectedNode.config.deadline || ''}
                            onChange={(e) => updateNodeConfig(selectedNodeId!, { deadline: e.target.value })}
                            disabled={readOnly}
                            placeholder="例如: 3"
                          />
                        </div>
                      </>
                    )}

                    {selectedNode.type === 'condition' && (
                      <div>
                        <Label>条件表达式</Label>
                        <Textarea
                          value={selectedNode.config.condition || ''}
                          onChange={(e) => updateNodeConfig(selectedNodeId!, { condition: e.target.value })}
                          disabled={readOnly}
                          placeholder="例如: salary > 50000"
                          rows={3}
                        />
                      </div>
                    )}

                    {selectedNode.type === 'notification' && (
                      <div>
                        <Label>通知内容</Label>
                        <Textarea
                          value={selectedNode.config.notification || ''}
                          onChange={(e) => updateNodeConfig(selectedNodeId!, { notification: e.target.value })}
                          disabled={readOnly}
                          placeholder="通知消息内容"
                          rows={3}
                        />
                      </div>
                    )}

                    {selectedNode.type === 'approval' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="approvalRequired"
                          checked={selectedNode.config.approvalRequired || false}
                          onChange={(e) => updateNodeConfig(selectedNodeId!, { approvalRequired: e.target.checked })}
                          disabled={readOnly}
                        />
                        <Label htmlFor="approvalRequired">需要审批</Label>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="autoAdvance"
                        checked={selectedNode.config.autoAdvance || false}
                        onChange={(e) => updateNodeConfig(selectedNodeId!, { autoAdvance: e.target.checked })}
                        disabled={readOnly}
                      />
                      <Label htmlFor="autoAdvance">自动流转</Label>
                    </div>
                  </TabsContent>

                  <TabsContent value="data" className="space-y-4">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Link className="h-4 w-4" />
                        数据源 (跨表联动)
                      </Label>
                      <div className="space-y-2 mt-2">
                        {DATA_SOURCES.map((source) => (
                          <div key={source.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`source-${source.id}`}
                              checked={selectedNode.config.dataSources?.includes(source.id) || false}
                              onChange={(e) => {
                                const currentSources = selectedNode.config.dataSources || [];
                                const newSources = e.target.checked
                                  ? [...currentSources, source.id]
                                  : currentSources.filter(s => s !== source.id);
                                updateNodeConfig(selectedNodeId!, { dataSources: newSources });
                              }}
                              disabled={readOnly}
                            />
                            <Label htmlFor={`source-${source.id}`} className="text-sm">
                              {source.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}

              {selectedEdge && (
                <div className="space-y-4">
                  <div>
                    <Label>连线标签</Label>
                    <Input
                      value={selectedEdge.label || ''}
                      onChange={(e) => {
                        setEdges(prev =>
                          prev.map(edge =>
                            edge.id === selectedEdgeId ? { ...edge, label: e.target.value } : edge
                          )
                        );
                      }}
                      disabled={readOnly}
                      placeholder="例如: 同意"
                    />
                  </div>
                  <div>
                    <Label>条件</Label>
                    <Textarea
                      value={selectedEdge.condition || ''}
                      onChange={(e) => {
                        setEdges(prev =>
                          prev.map(edge =>
                            edge.id === selectedEdgeId ? { ...edge, condition: e.target.value } : edge
                          )
                        );
                      }}
                      disabled={readOnly}
                      placeholder="条件表达式"
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
