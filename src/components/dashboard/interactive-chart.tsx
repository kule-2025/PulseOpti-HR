'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  Scatter,
  ScatterChart,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { useState } from 'react';

export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'scatter';

export interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface ChartSeries {
  dataKey: string;
  name: string;
  color?: string;
  strokeWidth?: number;
}

interface InteractiveChartProps {
  type: ChartType;
  data: ChartDataPoint[];
  series: ChartSeries[];
  title?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  animationDuration?: number;
  dataKey?: string;
  nameKey?: string;
  customTooltip?: (props: any) => React.ReactNode;
  onExport?: () => void;
  enableZoom?: boolean;
  stacked?: boolean;
}

const CHART_COLORS = [
  '#2563EB', // 科技蓝
  '#7C3AED', // 智慧紫
  '#F59E0B', // 活力橙
  '#10B981', // 翡翠绿
  '#EF4444', // 警告红
  '#8B5CF6', // 紫罗兰
  '#06B6D4', // 青色
  '#F97316', // 橙色
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Card className="p-3 shadow-lg border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-600 dark:text-slate-400">{entry.name}</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {typeof entry.value === 'number'
                ? entry.value.toLocaleString()
                : entry.value}
            </span>
          </div>
        ))}
      </Card>
    );
  }
  return null as any;
};

export function InteractiveChart({
  type,
  data,
  series,
  title,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  animationDuration = 300,
  dataKey = 'value',
  nameKey = 'name',
  customTooltip,
  onExport,
  enableZoom = false,
  stacked = false,
}: InteractiveChartProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [dataRange, setDataRange] = useState({ start: 0, end: data.length });

  const handleZoomIn = () => {
    if (zoomLevel < 5) {
      const newZoom = zoomLevel * 1.5;
      setZoomLevel(newZoom);
      const rangeLength = Math.floor(data.length / newZoom);
      const center = Math.floor((dataRange.start + dataRange.end) / 2);
      const newStart = Math.max(0, center - Math.floor(rangeLength / 2));
      const newEnd = Math.min(data.length, newStart + rangeLength);
      setDataRange({ start: newStart, end: newEnd });
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 1) {
      const newZoom = zoomLevel / 1.5;
      setZoomLevel(newZoom);
      const rangeLength = Math.floor(data.length / newZoom);
      const center = Math.floor((dataRange.start + dataRange.end) / 2);
      const newStart = Math.max(0, center - Math.floor(rangeLength / 2));
      const newEnd = Math.min(data.length, newStart + rangeLength);
      setDataRange({ start: newStart, end: newEnd });
    }
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setDataRange({ start: 0, end: data.length });
  };

  const zoomedData = data.slice(dataRange.start, dataRange.end);

  const renderChart = () => {
    const commonProps = {
      data: zoomedData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    const renderSeries = (ChartComponent: any) => {
      return series.map((s, index) => (
        <ChartComponent
          key={s.dataKey}
          dataKey={s.dataKey}
          name={s.name}
          stroke={s.color || CHART_COLORS[index % CHART_COLORS.length]}
          fill={s.color || CHART_COLORS[index % CHART_COLORS.length]}
          strokeWidth={s.strokeWidth || 2}
          fillOpacity={type === 'area' ? 0.6 : type === 'bar' ? 0.8 : 1}
          stackId={stacked ? 'stack' : undefined}
        />
      ));
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />}
            <XAxis
              dataKey={nameKey}
              stroke="#64748B"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748B"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            {showTooltip && (
              <Tooltip content={customTooltip || <CustomTooltip />} />
            )}
            {showLegend && <Legend />}
            {renderSeries(Line)}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />}
            <XAxis
              dataKey={nameKey}
              stroke="#64748B"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748B"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            {showTooltip && (
              <Tooltip content={customTooltip || <CustomTooltip />} />
            )}
            {showLegend && <Legend />}
            {renderSeries(Area)}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />}
            <XAxis
              dataKey={nameKey}
              stroke="#64748B"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748B"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            {showTooltip && (
              <Tooltip content={customTooltip || <CustomTooltip />} />
            )}
            {showLegend && <Legend />}
            {renderSeries(Bar)}
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={zoomedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKey}
              nameKey={nameKey}
            >
              {zoomedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            {showTooltip && (
              <Tooltip content={customTooltip || <CustomTooltip />} />
            )}
            {showLegend && <Legend />}
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />}
            <XAxis
              type="number"
              dataKey={series[0]?.dataKey || 'x'}
              name={series[0]?.name || 'X'}
              stroke="#64748B"
              fontSize={12}
            />
            <YAxis
              type="number"
              dataKey={series[1]?.dataKey || 'y'}
              name={series[1]?.name || 'Y'}
              stroke="#64748B"
              fontSize={12}
            />
            {showTooltip && (
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            )}
            {showLegend && <Legend />}
            <Scatter name={series[0]?.name || '数据点'} fill={CHART_COLORS[0]} data={zoomedData} />
          </ScatterChart>
        );

      default:
        return <div className="text-center text-slate-500">不支持的图表类型</div> as any;
    }
  };

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
      {(title || onExport || enableZoom) && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            {title && <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h3>}
            <div className="flex items-center gap-2">
              {enableZoom && (
                <>
                  <Badge variant="outline" className="text-xs">
                    缩放: {zoomLevel.toFixed(1)}x
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={handleZoomIn} disabled={zoomLevel >= 5}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleZoomOut} disabled={zoomLevel <= 1}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleResetZoom}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </>
              )}
              {onExport && (
                <Button variant="ghost" size="sm" onClick={onExport}>
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="p-4">
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
