'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Calendar, BarChart3, Filter, Code } from 'lucide-react';

export interface AlertCondition {
  type: 'numeric' | 'date' | 'list' | 'expression';
  field: string;
  operator: string;
  value: string | number | string[];
  label?: string;
}

interface ConditionBuilderProps {
  conditions: AlertCondition[];
  onChange: (conditions: AlertCondition[]) => void;
  fields?: { value: string; label: string; type: 'numeric' | 'date' | 'list' }[];
}

const DEFAULT_FIELDS = [
  { value: 'employee_count', label: '员工数量', type: 'numeric' as const },
  { value: 'new_hires', label: '新入职人数', type: 'numeric' as const },
  { value: 'resignations', label: '离职人数', type: 'numeric' as const },
  { value: 'turnover_rate', label: '离职率(%)', type: 'numeric' as const },
  { value: 'avg_salary', label: '平均薪酬', type: 'numeric' as const },
  { value: 'attendance_rate', label: '出勤率(%)', type: 'numeric' as const },
  { value: 'job_openings', label: '职位空缺数', type: 'numeric' as const },
  { value: 'time_to_hire', label: '招聘周期(天)', type: 'numeric' as const },
];

const NUMERIC_OPERATORS = [
  { value: '>', label: '大于' },
  { value: '<', label: '小于' },
  { value: '>=', label: '大于等于' },
  { value: '<=', label: '小于等于' },
  { value: '==', label: '等于' },
  { value: '!=', label: '不等于' },
];

const DATE_OPERATORS = [
  { value: '>', label: '晚于' },
  { value: '<', label: '早于' },
  { value: '>=', label: '不早于' },
  { value: '<=', label: '不晚于' },
  { value: '==', label: '等于' },
];

const LIST_OPERATORS = [
  { value: 'in', label: '包含' },
  { value: 'not_in', label: '不包含' },
];

export function ConditionBuilder({ conditions, onChange, fields = DEFAULT_FIELDS }: ConditionBuilderProps) {
  const [selectedConditionIndex, setSelectedConditionIndex] = useState<number | null>(null);

  const addCondition = (type: AlertCondition['type']) => {
    const newCondition: AlertCondition = {
      type,
      field: fields[0].value,
      operator: type === 'numeric' ? '>' : type === 'date' ? '>' : 'in',
      value: '',
      label: '',
    };
    onChange([...conditions, newCondition]);
    setSelectedConditionIndex(conditions.length);
  };

  const updateCondition = (index: number, updates: Partial<AlertCondition>) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    onChange(newConditions);
  };

  const deleteCondition = (index: number) => {
    onChange(conditions.filter((_, i) => i !== index));
    if (selectedConditionIndex === index) {
      setSelectedConditionIndex(null);
    }
  };

  const getOperatorOptions = (type: AlertCondition['type']) => {
    switch (type) {
      case 'numeric':
        return NUMERIC_OPERATORS;
      case 'date':
        return DATE_OPERATORS;
      case 'list':
        return LIST_OPERATORS;
      case 'expression':
        return [];
      default:
        return [];
    }
  };

  const renderConditionEditor = (condition: AlertCondition, index: number) => {
    if (condition.type === 'expression') {
      return (
        <div className="space-y-3">
          <div>
            <Label>表达式</Label>
            <Input
              value={condition.value as string}
              onChange={(e) => updateCondition(index, { value: e.target.value })}
              placeholder="例如：employee_count > 50 AND turnover_rate > 5"
            />
          </div>
          <div className="text-sm text-gray-500">
            支持使用 AND、OR 组合多个条件，例如：<br />
            employee_count &gt; 50 AND turnover_rate &gt; 5
          </div>
        </div>
      );
    }

    const availableFields = fields.filter(f => 
      condition.type === 'list' ? f.type === 'list' : f.type !== 'list'
    );

    return (
      <div className="grid grid-cols-4 gap-3">
        <div>
          <Label>字段</Label>
          <Select
            value={condition.field}
            onValueChange={(value) => updateCondition(index, { field: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableFields.map((field) => (
                <SelectItem key={field.value} value={field.value}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>操作符</Label>
          <Select
            value={condition.operator}
            onValueChange={(value) => updateCondition(index, { operator: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getOperatorOptions(condition.type).map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>值</Label>
          {condition.type === 'date' ? (
            <Input
              type="date"
              value={condition.value as string}
              onChange={(e) => updateCondition(index, { value: e.target.value })}
            />
          ) : condition.type === 'list' ? (
            <Input
              value={(condition.value as string[]).join(',')}
              onChange={(e) =>
                updateCondition(index, { value: e.target.value.split(',').map(v => v.trim()) })
              }
              placeholder="值1, 值2, 值3"
            />
          ) : (
            <Input
              type="number"
              value={condition.value as string}
              onChange={(e) => updateCondition(index, { value: parseFloat(e.target.value) || 0 })}
              placeholder="输入数值"
            />
          )}
        </div>

        <div className="flex items-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteCondition(index)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderConditionPreview = (condition: AlertCondition) => {
    const field = fields.find(f => f.value === condition.field);
    const fieldName = field?.label || condition.field;
    
    if (condition.type === 'expression') {
      return (
        <span className="font-mono text-sm">{condition.value}</span>
      );
    }

    const operatorLabels: Record<string, string> = {
      '>': '大于',
      '<': '小于',
      '>=': '大于等于',
      '<=': '小于等于',
      '==': '等于',
      '!=': '不等于',
      'in': '包含',
      'not_in': '不包含',
    };

    return (
      <span className="text-sm">
        <span className="font-medium">{fieldName}</span>
        <span className="mx-2 text-gray-500">{operatorLabels[condition.operator] || condition.operator}</span>
        <span className="text-blue-600 font-medium">
          {Array.isArray(condition.value) ? condition.value.join(', ') : condition.value}
        </span>
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {conditions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-gray-500">
            <Filter className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="mb-4">暂无条件，请添加触发条件</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {conditions.map((condition, index) => (
            <Card
              key={index}
              className={selectedConditionIndex === index ? 'border-blue-500 ring-2 ring-blue-100' : ''}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {condition.type === 'numeric' && <BarChart3 className="h-4 w-4 text-blue-500" />}
                    {condition.type === 'date' && <Calendar className="h-4 w-4 text-green-500" />}
                    {condition.type === 'list' && <Filter className="h-4 w-4 text-purple-500" />}
                    {condition.type === 'expression' && <Code className="h-4 w-4 text-orange-500" />}
                    <CardTitle className="text-sm">条件 {index + 1}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {condition.type === 'numeric' && '数值'}
                      {condition.type === 'date' && '日期'}
                      {condition.type === 'list' && '列表'}
                      {condition.type === 'expression' && '表达式'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {renderConditionEditor(condition, index)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="border-t pt-4">
        <Label className="mb-2 block">添加条件</Label>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => addCondition('numeric')}>
            <BarChart3 className="h-4 w-4 mr-2" />
            数值条件
          </Button>
          <Button variant="outline" size="sm" onClick={() => addCondition('date')}>
            <Calendar className="h-4 w-4 mr-2" />
            日期条件
          </Button>
          <Button variant="outline" size="sm" onClick={() => addCondition('list')}>
            <Filter className="h-4 w-4 mr-2" />
            列表条件
          </Button>
          <Button variant="outline" size="sm" onClick={() => addCondition('expression')}>
            <Code className="h-4 w-4 mr-2" />
            自定义表达式
          </Button>
        </div>
      </div>

      {conditions.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">条件预览</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {conditions.map((condition, index) => (
              <div key={index} className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5 text-xs">{index + 1}</Badge>
                {renderConditionPreview(condition)}
                {index < conditions.length - 1 && (
                  <span className="text-gray-400 mt-0.5">AND</span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
