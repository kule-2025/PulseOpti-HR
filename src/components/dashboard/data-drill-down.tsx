'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronRight, 
  ChevronLeft, 
  Filter,
  Download,
  Share2
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface DrillDimension {
  id: string;
  name: string;
  values: Array<{
    id: string;
    name: string;
    value: number | string;
    metadata?: Record<string, any>;
  }>;
}

export interface DrillPathItem {
  dimension: string;
  value: string;
  dimensionId: string;
  valueId: string;
}

interface DataDrillDownProps {
  title: string;
  dimensions: DrillDimension[];
  data: any[];
  onDrillDown: (dimensionId: string, valueId: string) => void;
  onDrillUp: () => void;
  onExport?: () => void;
  onShare?: () => void;
  currentPath?: DrillPathItem[];
  renderContent: (data: any[], filters: Record<string, string>) => React.ReactNode;
}

export function DataDrillDown({
  title,
  dimensions,
  data,
  onDrillDown,
  onDrillUp,
  onExport,
  onShare,
  currentPath = [],
  renderContent,
}: DataDrillDownProps) {
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});

  const currentDimensionIndex = currentPath.length;
  const canDrillDown = currentDimensionIndex < dimensions.length;
  const canDrillUp = currentPath.length > 0;

  const currentDimension = canDrillDown ? dimensions[currentDimensionIndex] : null;

  const handleFilterChange = (dimensionId: string, valueId: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [dimensionId]: valueId,
    }));
  };

  const handleDrillDown = (dimensionId: string, valueId: string) => {
    onDrillDown(dimensionId, valueId);
  };

  const getFilteredData = () => {
    let filtered = [...data];

    // 应用路径中的过滤条件
    currentPath.forEach(path => {
      filtered = filtered.filter(item => {
        // 这里需要根据实际数据结构调整过滤逻辑
        return item[path.dimensionId] === path.valueId;
      });
    });

    // 应用额外的过滤条件
    Object.entries(selectedFilters).forEach(([dimensionId, valueId]) => {
      if (!currentPath.some(p => p.dimensionId === dimensionId)) {
        filtered = filtered.filter(item => {
          return item[dimensionId] === valueId;
        });
      }
    });

    return filtered;
  };

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={onDrillUp}
                disabled={!canDrillUp}
                className="h-7 px-3"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                返回
              </Button>

              {/* 面包屑导航 */}
              <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                {currentPath.map((item, index) => (
                  <div key={`${item.dimensionId}-${item.valueId}`} className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {item.value}
                    </Badge>
                    {index < currentPath.length - 1 && <ChevronRight className="h-3 w-3" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onShare && (
              <Button variant="ghost" size="sm" onClick={onShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            )}
            {onExport && (
              <Button variant="ghost" size="sm" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 维度选择器 */}
        {canDrillDown && currentDimension && (
          <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <Filter className="h-4 w-4 text-slate-500" />
            <Select
              onValueChange={(valueId) => handleDrillDown(currentDimension.id, valueId)}
            >
              <SelectTrigger className="flex-1 h-9">
                <SelectValue placeholder={`按${currentDimension.name}钻取...`} />
              </SelectTrigger>
              <SelectContent>
                {currentDimension.values.map((value) => (
                  <SelectItem key={value.id} value={value.id}>
                    <div className="flex items-center justify-between w-full gap-4">
                      <span>{value.name}</span>
                      <span className="text-sm text-slate-500">
                        {typeof value.value === 'number' ? value.value.toLocaleString() : value.value}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDrillDown(currentDimension.id, 'all')}
              className="h-9"
            >
              查看全部
            </Button>
          </div>
        )}

        {/* 数据内容区域 */}
        <div className="min-h-[300px]">
          {renderContent(getFilteredData(), selectedFilters)}
        </div>

        {/* 底部统计信息 */}
        {currentPath.length > 0 && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>当前展示层级：{currentPath.length} / {dimensions.length}</span>
              <span>数据记录数：{getFilteredData().length}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
