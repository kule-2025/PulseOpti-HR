'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/loading';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  X,
  Download,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce, useLocalStorage } from '@/hooks/use-performance';

export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
}

export interface FilterOption<T = any> {
  key: string;
  label: string;
  type: 'select' | 'text' | 'date' | 'number';
  value?: T;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

export interface SortOption {
  key: string;
  label: string;
  direction: 'asc' | 'desc';
}

export interface ListOptions<T = any> {
  filters?: FilterOption<T>[];
  sort?: SortOption;
  sortOptions?: { key: string; label: string }[];
  pagination?: PaginationOptions;
  paginationOptions?: number[];
}

export interface DataListProps<T = any> {
  data: T[];
  loading?: boolean;
  error?: string;
  options?: ListOptions<T>;
  onOptionsChange?: (options: ListOptions<T>) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  storageKey?: string;
}

export function DataList<T = any>({
  data,
  loading = false,
  error,
  options,
  onOptionsChange,
  onRefresh,
  onExport,
  renderItem,
  emptyMessage = '暂无数据',
  emptyIcon,
  className,
  children,
  storageKey,
}: DataListProps<T>) {
  // 使用 localStorage 持久化选项
  const [localOptions, setLocalOptions] = useLocalStorage<ListOptions<T>>(
    storageKey || 'list-options',
    options || {
      pagination: { page: 1, limit: 10, total: 0 },
      filters: [],
      sort: { key: '', label: '', direction: 'desc' },
    }
  );

  const currentOptions = options || localOptions;

  // 搜索关键词
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  // 更新选项
  const updateOptions = useCallback(
    (newOptions: Partial<ListOptions<T>>) => {
      const updated = { ...currentOptions, ...newOptions };
      setLocalOptions(updated);
      onOptionsChange?.(updated);
    },
    [currentOptions, setLocalOptions, onOptionsChange]
  );

  // 处理搜索
  useEffect(() => {
    if (debouncedQuery !== searchQuery) {
      updateOptions({ pagination: { ...currentOptions.pagination, page: 1 } });
    }
  }, [debouncedQuery, updateOptions]);

  // 计算总页数
  const totalPages = Math.ceil((currentOptions.pagination?.total || 0) / (currentOptions.pagination?.limit || 10));

  // 过滤后的数据（客户端过滤，用于演示）
  const filteredData = useMemo(() => {
    if (!debouncedQuery) return data;

    const query = debouncedQuery.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some(
        (value) =>
          value !== null &&
          value !== undefined &&
          String(value).toLowerCase().includes(query)
      )
    );
  }, [data, debouncedQuery]);

  // 当前页的数据
  const paginatedData = useMemo(() => {
    const { page, limit } = currentOptions.pagination || { page: 1, limit: 10 };
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredData.slice(start, end);
  }, [filteredData, currentOptions.pagination]);

  // 处理页码变化
  const handlePageChange = useCallback(
    (page: number) => {
      updateOptions({
        pagination: {
          ...currentOptions.pagination!,
          page,
        },
      });
    },
    [updateOptions, currentOptions.pagination]
  );

  // 处理每页条数变化
  const handleLimitChange = useCallback(
    (limit: number) => {
      updateOptions({
        pagination: {
          ...currentOptions.pagination!,
          limit,
          page: 1,
        },
      });
    },
    [updateOptions, currentOptions.pagination]
  );

  // 处理排序
  const handleSort = useCallback(
    (key: string) => {
      const currentDirection =
        currentOptions.sort?.key === key ? currentOptions.sort.direction : 'desc';
      updateOptions({
        sort: {
          key,
          label: currentOptions.sortOptions?.find((opt) => opt.key === key)?.label || '',
          direction: currentDirection === 'asc' ? 'desc' : 'asc',
        },
      });
    },
    [updateOptions, currentOptions.sort, currentOptions.sortOptions]
  );

  // 处理过滤
  const handleFilterChange = useCallback(
    (key: string, value: any) => {
      const updatedFilters = currentOptions.filters?.map((filter) =>
        filter.key === key ? { ...filter, value } : filter
      );
      updateOptions({
        filters: updatedFilters,
        pagination: { ...currentOptions.pagination!, page: 1 },
      });
    },
    [updateOptions, currentOptions.filters, currentOptions.pagination]
  );

  // 清除搜索
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // 重置所有过滤
  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    const resetFilters = currentOptions.filters?.map((filter) => ({
      ...filter,
      value: undefined,
    }));
    updateOptions({
      filters: resetFilters,
      pagination: { ...currentOptions.pagination!, page: 1 },
    });
  }, [updateOptions, currentOptions.filters, currentOptions.pagination]);

  const hasActiveFilters =
    (currentOptions.filters?.some((f) => f.value !== undefined && f.value !== '') ?? false) ||
    debouncedQuery !== '';

  return (
    <div className={cn('space-y-4', className)}>
      {/* 工具栏 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* 搜索和筛选 */}
        <div className="flex flex-1 items-center gap-2">
          {/* 搜索 */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="搜索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full w-8 rounded-l-none"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* 筛选器 */}
          {currentOptions.filters &&
            currentOptions.filters.map((filter) => (
              <div key={filter.key} className="min-w-[150px]">
                {filter.type === 'select' && filter.options && (
                  <Select
                    value={filter.value?.toString()}
                    onValueChange={(value) => handleFilterChange(filter.key, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={filter.placeholder || filter.label} />
                    </SelectTrigger>
                    <SelectContent>
                      {filter.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}

          {/* 排序 */}
          {currentOptions.sortOptions && currentOptions.sortOptions.length > 0 && (
            <Select
              value={currentOptions.sort?.key}
              onValueChange={handleSort}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="排序" />
              </SelectTrigger>
              <SelectContent>
                {currentOptions.sortOptions.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.label}
                    {currentOptions.sort?.key === option.key && (
                      <span className="ml-2">
                        {currentOptions.sort.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* 重置筛选 */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleResetFilters}>
              <X className="h-4 w-4 mr-2" />
              重置
            </Button>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
          )}
          {onExport && (
            <Button variant="outline" size="icon" onClick={onExport}>
              <Download className="h-4 w-4" />
            </Button>
          )}
          {children}
        </div>
      </div>

      {/* 错误状态 */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* 列表内容 */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : paginatedData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          {emptyIcon || (
            <div className="mb-4 text-gray-400">
              <Filter className="h-12 w-12 mx-auto" />
            </div>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400">{emptyMessage}</p>
        </div>
      ) : (
        <>
          {/* 数据列表 */}
          <div className="space-y-2">
            {paginatedData.map((item, index) => renderItem(item, index))}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4 border-t">
              {/* 分页信息 */}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>
                  共 {currentOptions.pagination?.total || filteredData.length} 条记录
                </span>
                <span>·</span>
                <span>
                  第 {currentOptions.pagination?.page || 1} / {totalPages} 页
                </span>
              </div>

              {/* 分页控件 */}
              <div className="flex items-center gap-2">
                {/* 首页 */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(1)}
                  disabled={currentOptions.pagination?.page === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>

                {/* 上一页 */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange((currentOptions.pagination?.page || 1) - 1)}
                  disabled={currentOptions.pagination?.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* 页码 */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if ((currentOptions.pagination?.page || 1) <= 3) {
                      pageNum = i + 1;
                    } else if ((currentOptions.pagination?.page || 1) >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = (currentOptions.pagination?.page || 1) - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentOptions.pagination?.page ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                {/* 下一页 */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange((currentOptions.pagination?.page || 1) + 1)}
                  disabled={currentOptions.pagination?.page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* 末页 */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentOptions.pagination?.page === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>

                {/* 每页条数 */}
                {currentOptions.paginationOptions && (
                  <Select
                    value={currentOptions.pagination?.limit?.toString()}
                    onValueChange={(value) => handleLimitChange(Number(value))}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentOptions.paginationOptions.map((option) => (
                        <SelectItem key={option} value={option.toString()}>
                          {option} 条/页
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
