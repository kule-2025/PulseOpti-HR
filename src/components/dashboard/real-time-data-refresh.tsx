'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  RefreshCw,
  Clock,
  Activity,
  Pause,
  Play,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export interface RealTimeDataConfig {
  endpoint: string;
  refreshInterval: number; // 毫秒
  enabled?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface RealTimeDataRefreshProps {
  config: RealTimeDataConfig;
  renderContent: (data: any, loading: boolean, error: Error | null) => React.ReactNode;
  showControls?: boolean;
  showStatus?: boolean;
}

export function RealTimeDataRefresh({
  config,
  renderContent,
  showControls = true,
  showStatus = true,
}: RealTimeDataRefreshProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [nextFetchTime, setNextFetchTime] = useState<Date | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [fetchCount, setFetchCount] = useState(0);
  const [isEnabled, setIsEnabled] = useState(config.enabled ?? true);

  const fetchData = useCallback(async () => {
    if (!isEnabled || isPaused) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(config.endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      const jsonData = text ? JSON.parse(text) : {};
      setData(jsonData);
      setLastFetchTime(new Date());
      setFetchCount(prev => prev + 1);
      config.onSuccess?.(jsonData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      config.onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [config, isEnabled, isPaused]);

  useEffect(() => {
    if (!isEnabled) return;

    // 立即获取一次数据
    fetchData();

    // 设置定时器
    let interval: NodeJS.Timeout;

    const startInterval = () => {
      interval = setInterval(() => {
        fetchData();
      }, config.refreshInterval);
    };

    if (!isPaused) {
      startInterval();
    }

    // 更新下次获取时间
    const updateNextFetchTime = () => {
      if (!isPaused) {
        setNextFetchTime(new Date(Date.now() + config.refreshInterval));
      }
    };

    updateNextFetchTime();
    const nextFetchTimer = setInterval(updateNextFetchTime, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(nextFetchTimer);
    };
  }, [config.refreshInterval, isPaused, isEnabled, fetchData]);

  const handleManualRefresh = () => {
    fetchData();
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleToggleEnable = () => {
    setIsEnabled(!isEnabled);
  };

  const getTimeUntilNextFetch = () => {
    if (!nextFetchTime || isPaused || !isEnabled) return null;
    const seconds = Math.max(0, Math.floor((nextFetchTime.getTime() - Date.now()) / 1000));
    return seconds;
  };

  const timeUntilNextFetch = getTimeUntilNextFetch();

  return (
    <div className="space-y-4">
      {/* 控制面板 */}
      {(showControls || showStatus) && (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">实时数据监控</CardTitle>
              <div className="flex items-center gap-2">
                {showStatus && (
                  <Badge
                    variant={loading ? 'default' : error ? 'destructive' : 'outline'}
                    className="gap-1"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        刷新中
                      </>
                    ) : error ? (
                      <>
                        <AlertCircle className="h-3 w-3" />
                        错误
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        正常
                      </>
                    )}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          {showControls && (
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* 自动刷新开关 */}
                  <div className="flex items-center gap-2">
                    <Switch
                      id="auto-refresh"
                      checked={isEnabled}
                      onCheckedChange={handleToggleEnable}
                    />
                    <label
                      htmlFor="auto-refresh"
                      className="text-sm text-slate-700 dark:text-slate-300"
                    >
                      自动刷新
                    </label>
                  </div>

                  {/* 暂停/继续 */}
                  {isEnabled && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleTogglePause}
                      className="h-7"
                    >
                      {isPaused ? (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          继续
                        </>
                      ) : (
                        <>
                          <Pause className="h-4 w-4 mr-1" />
                          暂停
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* 手动刷新 */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualRefresh}
                  disabled={!isEnabled || loading}
                  className="h-7"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  刷新
                </Button>
              </div>

              {/* 状态信息 */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span>
                    上次更新: {lastFetchTime ? lastFetchTime.toLocaleTimeString() : '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Activity className="h-4 w-4" />
                  <span>更新次数: {fetchCount}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  {timeUntilNextFetch !== null ? (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      <span>
                        下次更新: {timeUntilNextFetch}秒后
                      </span>
                    </>
                  ) : (
                    <span>等待手动刷新</span>
                  )}
                </div>
              </div>

              {/* 刷新进度条 */}
              {timeUntilNextFetch !== null && isEnabled && !isPaused && (
                <div className="space-y-1">
                  <Progress
                    value={((config.refreshInterval - timeUntilNextFetch * 1000) / config.refreshInterval) * 100}
                    className="h-1"
                  />
                </div>
              )}

              {/* 刷新间隔 */}
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Activity className="h-3 w-3" />
                <span>刷新间隔: {(config.refreshInterval / 1000).toFixed(1)}秒</span>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* 错误提示 */}
      {error && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">
                  数据获取失败
                </h4>
                <p className="text-sm text-red-600 dark:text-red-300">
                  {error.message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 数据内容 */}
      {renderContent(data, loading, error)}
    </div>
  );
}
