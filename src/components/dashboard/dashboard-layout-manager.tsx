'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GripVertical, 
  Plus, 
  Save, 
  RefreshCw, 
  LayoutGrid,
  LayoutList,
  Settings
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'custom';
  size: 'small' | 'medium' | 'large';
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  data?: any;
  config?: any;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  isDefault?: boolean;
}

interface DashboardLayoutManagerProps {
  layouts: DashboardLayout[];
  currentLayoutId: string;
  onLayoutChange: (layoutId: string) => void;
  onLayoutSave: (layout: DashboardLayout) => void;
  onLayoutCreate: (name: string) => void;
  onLayoutDelete: (layoutId: string) => void;
  children: (layout: DashboardLayout) => React.ReactNode;
  availableWidgets?: Array<{
    id: string;
    title: string;
    type: DashboardWidget['type'];
    size: DashboardWidget['size'];
  }>;
}

export function DashboardLayoutManager({
  layouts,
  currentLayoutId,
  onLayoutChange,
  onLayoutSave,
  onLayoutCreate,
  onLayoutDelete,
  children,
  availableWidgets,
}: DashboardLayoutManagerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<DashboardWidget | null>(null);
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);

  const currentLayout = layouts.find(l => l.id === currentLayoutId);

  const handleDragStart = useCallback((widget: DashboardWidget) => {
    setIsDragging(true);
    setDraggedWidget(widget);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetWidget?: DashboardWidget) => {
    e.preventDefault();
    setIsDragging(false);

    if (!draggedWidget || !currentLayout) return;

    // 这里应该实现真正的拖拽逻辑
    // 更新widgets的position
    const updatedLayout = {
      ...currentLayout,
      widgets: currentLayout.widgets.map(w => {
        if (w.id === draggedWidget.id && targetWidget) {
          return {
            ...w,
            position: targetWidget.position,
          };
        }
        return w;
      }),
    };

    onLayoutSave(updatedLayout);
    setDraggedWidget(null);
  }, [draggedWidget, currentLayout, onLayoutSave]);

  const handleSaveLayout = () => {
    if (currentLayout) {
      onLayoutSave(currentLayout);
    }
  };

  const handleAddWidget = (widgetId: string) => {
    if (!currentLayout || !availableWidgets) return;

    const widgetTemplate = availableWidgets.find(w => w.id === widgetId);
    if (!widgetTemplate) return;

    // 计算新位置
    const lastWidget = currentLayout.widgets[currentLayout.widgets.length - 1];
    const newY = lastWidget ? lastWidget.position.y + lastWidget.position.h : 0;

    const newWidget: DashboardWidget = {
      ...widgetTemplate,
      id: `${widgetId}-${Date.now()}`,
      position: {
        x: 0,
        y: newY,
        w: widgetTemplate.size === 'small' ? 1 : widgetTemplate.size === 'medium' ? 2 : 3,
        h: 1,
      },
    };

    const updatedLayout = {
      ...currentLayout,
      widgets: [...currentLayout.widgets, newWidget],
    };

    onLayoutSave(updatedLayout);
    setIsAddWidgetOpen(false);
  };

  const handleDeleteWidget = (widgetId: string) => {
    if (!currentLayout) return;

    const updatedLayout = {
      ...currentLayout,
      widgets: currentLayout.widgets.filter(w => w.id !== widgetId),
    };

    onLayoutSave(updatedLayout);
  };

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            仪表盘布局
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* 布局选择器 */}
          <select
            value={currentLayoutId}
            onChange={(e) => onLayoutChange(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            {layouts.map((layout) => (
              <option key={layout.id} value={layout.id}>
                {layout.name} {layout.isDefault && '(默认)'}
              </option>
            ))}
          </select>

          {/* 新建布局 */}
          <Dialog open={isAddWidgetOpen} onOpenChange={setIsAddWidgetOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                添加组件
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>选择要添加的组件</DialogTitle>
                <DialogDescription>
                  从可用组件中选择一个添加到当前仪表盘
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {availableWidgets?.map((widget) => (
                  <Card
                    key={widget.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleAddWidget(widget.id)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{widget.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{widget.type}</Badge>
                        <Badge variant="outline">{widget.size}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* 保存布局 */}
          <Button variant="outline" size="sm" onClick={handleSaveLayout}>
            <Save className="h-4 w-4 mr-1" />
            保存布局
          </Button>

          {/* 重置布局 */}
          <Button variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            重置
          </Button>

          {/* 布局设置 */}
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 仪表盘内容区域 */}
      {currentLayout && (
        <div
          className={`grid gap-4 transition-all ${
            isDragging ? 'opacity-75' : ''
          }`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e)}
        >
          {children(currentLayout)}
        </div>
      )}
    </div>
  );
}

// 可拖拽的卡片组件
export interface DraggableCardProps {
  widget: DashboardWidget;
  children: React.ReactNode;
  onDelete: (widgetId: string) => void;
  onDragStart: (widget: DashboardWidget) => void;
}

export function DraggableCard({
  widget,
  children,
  onDelete,
  onDragStart,
}: DraggableCardProps) {
  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-2',
    large: 'col-span-3',
  };

  return (
    <div
      className={`${sizeClasses[widget.size]} group relative`}
      draggable
      onDragStart={() => onDragStart(widget)}
    >
      {/* 拖拽手柄 */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center gap-1">
        <div className="p-1 bg-white dark:bg-slate-800 rounded shadow border border-slate-200 dark:border-slate-700">
          <GripVertical className="h-4 w-4 text-slate-500 cursor-grab" />
        </div>
        <button
          onClick={() => onDelete(widget.id)}
          className="p-1 bg-red-500 hover:bg-red-600 rounded shadow text-white"
        >
          ×
        </button>
      </div>

      {/* 卡片内容 */}
      <Card className="h-full border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
        {children}
      </Card>
    </div>
  );
}
