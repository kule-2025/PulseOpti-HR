'use client';

import React, { useRef, useEffect, useState } from 'react';

// 重新定义WorkflowNode接口，避免循环依赖
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

interface WorkflowVisualizationProps {
  nodes: WorkflowNode[];
  edges: Array<{ from: string; to: string; condition?: string }>;
  onNodeClick?: (node: WorkflowNode) => void;
  onNodeMove?: (nodeId: string, position: { x: number; y: number }) => void;
  selectedNodeId?: string;
  readonly?: boolean;
}

const NODE_WIDTH = 160;
const NODE_HEIGHT = 60;
const NODE_PADDING = 40;

export function WorkflowVisualization({
  nodes,
  edges,
  onNodeClick,
  onNodeMove,
  selectedNodeId,
  readonly = false,
}: WorkflowVisualizationProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingNode, setDraggingNode] = useState<WorkflowNode | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // 自动布局节点
  const autoLayoutNodes = () => {
    const levels = new Map<string, number>();
    const levelNodes = new Map<number, WorkflowNode[]>();

    // 构建邻接表
    const adjacency = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    nodes.forEach(node => {
      adjacency.set(node.id, []);
      inDegree.set(node.id, 0);
    });

    edges.forEach(edge => {
      adjacency.get(edge.from)?.push(edge.to);
      inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
    });

    // 拓扑排序确定层级
    const queue: string[] = [];
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0 && !queue.includes(nodeId)) {
        queue.push(nodeId);
      }
    });

    let currentLevel = 0;
    while (queue.length > 0) {
      const levelSize = queue.length;
      const levelNodesList: WorkflowNode[] = [];

      for (let i = 0; i < levelSize; i++) {
        const nodeId = queue.shift();
        if (!nodeId) continue;

        const node = nodes.find(n => n.id === nodeId);
        if (node) {
          levelNodesList.push(node);
          levels.set(nodeId, currentLevel);

          adjacency.get(nodeId)?.forEach(neighborId => {
            const newDegree = (inDegree.get(neighborId) || 0) - 1;
            inDegree.set(neighborId, newDegree);
            if (newDegree === 0 && !queue.includes(neighborId)) {
              queue.push(neighborId);
            }
          });
        }
      }

      levelNodes.set(currentLevel, levelNodesList);
      currentLevel++;
    }

    // 计算节点位置
    const newNodes = [...nodes];
    levelNodes.forEach((levelNodesList, level) => {
      const totalWidth = levelNodesList.length * NODE_WIDTH + (levelNodesList.length - 1) * NODE_PADDING;
      const startX = (800 - totalWidth) / 2; // 假设画布宽度为800
      const startY = level * (NODE_HEIGHT + NODE_PADDING + 40) + 40;

      levelNodesList.forEach((node, index) => {
        const nodeIndex = newNodes.findIndex(n => n.id === node.id);
        if (nodeIndex !== -1) {
          newNodes[nodeIndex] = {
            ...node,
            position: {
              x: startX + index * (NODE_WIDTH + NODE_PADDING),
              y: startY,
            },
          };
        }
      });
    });

    return newNodes;
  };

  const [layoutedNodes, setLayoutedNodes] = useState<WorkflowNode[]>(nodes);

  useEffect(() => {
    setLayoutedNodes(autoLayoutNodes());
  }, [nodes, edges]);

  // 处理节点拖拽
  const handleMouseDown = (e: React.MouseEvent, node: WorkflowNode) => {
    if (readonly) return;
    
    e.preventDefault();
    setDraggingNode(node);
    setDragOffset({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNode || !onNodeMove) return;

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const newX = e.clientX - dragOffset.x - canvasRect.left;
    const newY = e.clientY - dragOffset.y - canvasRect.top;

    onNodeMove(draggingNode.id, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
  };

  // 获取节点样式
  const getNodeStyle = (node: WorkflowNode) => {
    const baseStyle = {
      position: 'absolute' as const,
      left: `${node.position.x}px`,
      top: `${node.position.y}px`,
      width: `${NODE_WIDTH}px`,
      height: `${NODE_HEIGHT}px`,
      borderRadius: '8px',
      border: '2px solid',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: readonly ? 'default' : 'move',
      transition: 'all 0.2s',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    };

    const typeStyles: Record<WorkflowNode['type'], {
      backgroundColor: string;
      borderColor: string;
      color: string;
    }> = {
      approval: {
        backgroundColor: '#dbeafe',
        borderColor: '#3b82f6',
        color: '#1e40af',
      },
      notification: {
        backgroundColor: '#d1fae5',
        borderColor: '#10b981',
        color: '#065f46',
      },
      condition: {
        backgroundColor: '#fef3c7',
        borderColor: '#f59e0b',
        color: '#92400e',
      },
      end: {
        backgroundColor: '#fee2e2',
        borderColor: '#ef4444',
        color: '#991b1b',
      },
    };

    const selectedStyle = selectedNodeId === node.id
      ? {
          borderColor: '#6366f1',
          borderWidth: '3px',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
        }
      : {};

    return {
      ...baseStyle,
      ...typeStyles[node.type],
      ...selectedStyle,
    };
  };

  // 获取节点图标
  const getNodeIcon = (node: WorkflowNode) => {
    const icons: Record<WorkflowNode['type'], string> = {
      approval: '✓',
      notification: '✉',
      condition: '◆',
      end: '×',
    };
    return icons[node.type];
  };

  // 渲染连线
  const renderEdges = () => {
    const svgLines = edges.map((edge, index) => {
      const fromNode = layoutedNodes.find(n => n.id === edge.from);
      const toNode = layoutedNodes.find(n => n.id === edge.to);

      if (!fromNode || !toNode) return null;

      const fromX = fromNode.position.x + NODE_WIDTH / 2;
      const fromY = fromNode.position.y + NODE_HEIGHT;
      const toX = toNode.position.x + NODE_WIDTH / 2;
      const toY = toNode.position.y;

      const midY = (fromY + toY) / 2;

      return (
        <g key={index}>
          <path
            d={`M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
          {edge.condition && (
            <text
              x={(fromX + toX) / 2}
              y={midY - 10}
              fontSize="12"
              fill="#64748b"
              textAnchor="middle"
              className="text-xs"
            >
              {edge.condition}
            </text>
          )}
        </g>
      );
    });

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#94a3b8"
            />
          </marker>
        </defs>
        {svgLines}
      </svg>
    );
  };

  return (
    <div
      ref={canvasRef}
      className="relative bg-white rounded-lg border border-gray-200 overflow-hidden"
      style={{
        width: '100%',
        height: '600px',
        minHeight: '600px',
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* 网格背景 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, #f1f5f9 1px, transparent 1px),
            linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* 连线 */}
      {renderEdges()}

      {/* 节点 */}
      {layoutedNodes.map((node) => (
        <div
          key={node.id}
          style={getNodeStyle(node)}
          onMouseDown={(e) => handleMouseDown(e, node)}
          onClick={() => onNodeClick?.(node)}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{getNodeIcon(node)}</span>
            <span className="text-sm font-medium truncate">{node.name}</span>
          </div>
        </div>
      ))}

      {/* 工具提示 */}
      <div className="absolute bottom-4 left-4 bg-gray-900 text-white text-xs px-3 py-2 rounded-md">
        {readonly ? '只读模式' : '拖拽节点调整位置'}
      </div>
    </div>
  );
}
