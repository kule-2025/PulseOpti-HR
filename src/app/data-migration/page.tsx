'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  Download,
  Database,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export default function DataMigrationPage() {
  const [importType, setImportType] = useState('excel');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<any>(null);

  const handleImport = () => {
    setImporting(true);
    setImportProgress(0);

    // 模拟导入过程
    const interval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setImporting(false);
          setImportResult({
            success: true,
            totalRecords: 156,
            successRecords: 152,
            failedRecords: 4,
            warnings: 2,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleExport = () => {
    // 模拟导出
    alert('数据导出功能已触发，Excel文件将自动下载');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">数据迁移工具</h1>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 数据导入 */}
          <Card className="border-2 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-6 flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                数据导入
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>导入方式</Label>
                <Select value={importType} onValueChange={setImportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excel">Excel文件导入</SelectItem>
                    <SelectItem value="csv">CSV文件导入</SelectItem>
                    <SelectItem value="system">第三方系统导入</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {importType === 'system' && (
                <div className="grid gap-2">
                  <Label>选择系统</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择第三方系统" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xinrenxinshi">薪人薪事</SelectItem>
                      <SelectItem value="2haorenshi">2号人事部</SelectItem>
                      <SelectItem value="dingtalk">钉钉</SelectItem>
                      <SelectItem value="feishu">飞书</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label>选择文件</Label>
                <div className="flex items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 dark:bg-gray-900 dark:border-gray-700">
                  <FileSpreadsheet className="h-10 w-10 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      点击或拖拽文件到此处
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      支持 .xlsx, .xls, .csv 格式，最大50MB
                    </p>
                  </div>
                  <Button variant="outline">选择文件</Button>
                </div>
              </div>

              {importing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">导入进度</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {importProgress}%
                    </span>
                  </div>
                  <Progress value={importProgress} className="h-2" />
                  <p className="flex items-center gap-2 text-sm text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    正在导入数据，请稍候...
                  </p>
                </div>
              )}

              {importResult && (
                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/20">
                  <div className="mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-green-900 dark:text-green-100">
                      导入完成
                    </h3>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">总记录数：</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {importResult.totalRecords}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">成功导入：</span>
                      <span className="font-medium text-green-600">
                        {importResult.successRecords}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">失败记录：</span>
                      <span className="font-medium text-red-600">
                        {importResult.failedRecords}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>导入须知：</strong> 请确保文件格式正确，数据完整。建议先导入少量数据进行测试。
                  </p>
                </div>
              </div>

              <Button
                onClick={handleImport}
                disabled={importing}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {importing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    导入中...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    开始导入
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* 数据导出 */}
          <Card className="border-2 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-6 flex items-center gap-2">
              <Download className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                数据导出
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>导出内容</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="选择要导出的数据" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部数据</SelectItem>
                    <SelectItem value="employees">员工信息</SelectItem>
                    <SelectItem value="performance">绩效数据</SelectItem>
                    <SelectItem value="attendance">考勤记录</SelectItem>
                    <SelectItem value="salary">薪资数据</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>导出格式</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="选择导出格式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                    <SelectItem value="xls">Excel 97-2003 (.xls)</SelectItem>
                    <SelectItem value="csv">CSV (.csv)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>时间范围</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="选择时间范围" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部历史</SelectItem>
                    <SelectItem value="current_year">本年度</SelectItem>
                    <SelectItem value="current_quarter">本季度</SelectItem>
                    <SelectItem value="current_month">本月</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950/20">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-green-900 dark:text-green-100">
                    <strong>导出提示：</strong> 导出的数据将包含所有字段，文件将自动下载到您的设备。
                  </p>
                </div>
              </div>

              <Button
                onClick={handleExport}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Download className="mr-2 h-4 w-4" />
                导出数据
              </Button>

              <Button variant="outline" className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                查看导出历史
              </Button>
            </div>
          </Card>
        </div>

        {/* 数据迁移指南 */}
        <Card className="border-2 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            数据迁移指南
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border p-4 dark:border-gray-700">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                从Excel/CSV导入
              </h3>
              <ol className="list-inside list-decimal space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>下载我们的Excel模板</li>
                <li>按照模板格式填写数据</li>
                <li>选择文件并点击导入</li>
                <li>等待导入完成，查看结果</li>
              </ol>
            </div>

            <div className="rounded-lg border p-4 dark:border-gray-700">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                从第三方系统导入
              </h3>
              <ol className="list-inside list-decimal space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>选择第三方系统类型</li>
                <li>提供系统账号和授权</li>
                <li>点击开始导入</li>
                <li>系统自动同步数据</li>
              </ol>
            </div>

            <Button variant="outline" className="w-full">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              下载Excel模板
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
