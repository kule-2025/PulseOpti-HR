// 数据导出工具库
import { utils, writeFile } from 'xlsx';

export interface ExportColumn {
  key: string;
  label: string;
  formatter?: (value: any) => string | number;
}

export interface ExportColumnWithFormatter extends ExportColumn {
  formatter: (value: any) => string | number;
}

export interface ExportOptions {
  filename?: string;
  format?: 'xlsx' | 'csv' | 'json';
  columns?: ExportColumn[];
}

/**
 * 导出数据到Excel/CSV
 */
export function exportData<T extends Record<string, any>>(
  data: T[],
  options: ExportOptions = {}
) {
  const {
    filename = `export-${new Date().toISOString().split('T')[0]}`,
    format = 'xlsx',
    columns,
  } = options;

  // 如果没有指定列，使用所有键
  const exportColumns: ExportColumnWithFormatter[] = columns ? columns.map(col => ({
    ...col,
    formatter: col.formatter || ((val: any) => val),
  })) : Object.keys(data[0] || {}).map(key => ({
    key,
    label: key,
    formatter: (val: any) => val,
  }));

  // 转换数据
  const exportData = data.map(item => {
    const row: Record<string, any> = {};
    exportColumns.forEach(col => {
      const value = col.key.split('.').reduce((obj: any, key: string) => obj?.[key], item);
      row[col.label] = ('formatter' in col && col.formatter) ? col.formatter(value) : value;
    });
    return row;
  });

  if (format === 'json') {
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    downloadBlob(blob, `${filename}.json`);
    return;
  }

  if (format === 'csv') {
    const csvStr = convertToCSV(exportData);
    const blob = new Blob(['\ufeff' + csvStr], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${filename}.csv`);
    return;
  }

  // Excel格式
  const worksheet = utils.json_to_sheet(exportData);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  writeFile(workbook, `${filename}.xlsx`);
}

/**
 * 转换数据为CSV格式
 */
function convertToCSV(data: Record<string, any>[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const rows = data.map(item =>
    headers.map(header => {
      const value = item[header];
      // 处理包含逗号、引号的值
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    })
  );

  return [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');
}

/**
 * 下载Blob文件
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 生成HR报表数据
 */
export function generateHRReport(data: any[], type: 'employees' | 'attendance' | 'performance' | 'payroll') {
  switch (type) {
    case 'employees':
      return {
        filename: `员工报表-${new Date().toISOString().split('T')[0]}`,
        columns: [
          { key: 'name', label: '姓名' },
          { key: 'department', label: '部门' },
          { key: 'position', label: '职位' },
          { key: 'email', label: '邮箱' },
          { key: 'phone', label: '电话' },
          { key: 'hireDate', label: '入职日期', formatter: (val: string) => val?.split('T')[0] || '-' },
          { key: 'status', label: '状态' },
        ],
      };

    case 'attendance':
      return {
        filename: `考勤报表-${new Date().toISOString().split('T')[0]}`,
        columns: [
          { key: 'name', label: '姓名' },
          { key: 'date', label: '日期', formatter: (val: string) => val?.split('T')[0] || '-' },
          { key: 'checkInTime', label: '签到时间' },
          { key: 'checkOutTime', label: '签退时间' },
          { key: 'workHours', label: '工作时长' },
          { key: 'status', label: '状态' },
        ],
      };

    case 'performance':
      return {
        filename: `绩效报表-${new Date().toISOString().split('T')[0]}`,
        columns: [
          { key: 'name', label: '姓名' },
          { key: 'cycle', label: '考核周期' },
          { key: 'score', label: '绩效分数' },
          { key: 'level', label: '等级' },
          { key: 'kpi', label: 'KPI完成度', formatter: (val: number) => `${val}%` },
          { key: 'review', label: '评语' },
        ],
      };

    case 'payroll':
      return {
        filename: `薪酬报表-${new Date().toISOString().split('T')[0]}`,
        columns: [
          { key: 'name', label: '姓名' },
          { key: 'department', label: '部门' },
          { key: 'basicSalary', label: '基本工资', formatter: (val: number) => `¥${val?.toLocaleString() || 0}` },
          { key: 'bonus', label: '奖金', formatter: (val: number) => `¥${val?.toLocaleString() || 0}` },
          { key: 'deduction', label: '扣款', formatter: (val: number) => `¥${val?.toLocaleString() || 0}` },
          { key: 'netSalary', label: '实发工资', formatter: (val: number) => `¥${val?.toLocaleString() || 0}` },
        ],
      };

    default:
      return { filename: 'export', columns: [] };
  }
}
