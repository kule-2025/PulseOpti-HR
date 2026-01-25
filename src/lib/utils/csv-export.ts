/**
 * CSV导出工具函数
 */

/**
 * 将数据转换为CSV格式
 * @param data - 要导出的数据数组
 * @param columns - 列定义 { key: '字段名', label: '显示名称' }
 * @returns CSV字符串
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  columns: { key: keyof T; label: string }[]
): string {
  if (!data || data.length === 0) {
    return '';
  }

  // 添加BOM以支持中文在Excel中正确显示
  const BOM = '\uFEFF';

  // 创建标题行
  const headers = columns.map((col) => col.label).join(',');

  // 创建数据行
  const rows = data.map((item) => {
    return columns
      .map((col) => {
        let value = item[col.key];
        if (value === null || value === undefined) {
          return '';
        }
        // 转换为字符串并处理引号
        const stringValue = String(value);
        // 如果值包含逗号、引号或换行符，需要用引号包裹并转义内部引号
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(',');
  });

  return BOM + [headers, ...rows].join('\n');
}

/**
 * 下载CSV文件
 * @param csvContent - CSV内容
 * @param filename - 文件名（不带.csv后缀）
 */
export function downloadCSV(csvContent: string, filename: string) {
  if (!csvContent) {
    console.error('CSV内容为空');
    return;
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // 释放URL对象
  URL.revokeObjectURL(url);
}

/**
 * 导出数据为CSV文件
 * @param data - 要导出的数据数组
 * @param columns - 列定义
 * @param filename - 文件名
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  columns: { key: keyof T; label: string }[],
  filename: string
) {
  const csvContent = convertToCSV(data, columns);
  downloadCSV(csvContent, filename);
}
