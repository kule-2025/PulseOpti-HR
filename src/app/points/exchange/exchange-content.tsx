'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/loading';
import { Gift, ArrowLeft, RefreshCw, Search, Filter, Star, ShoppingCart, TrendingUp, Award, GiftIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/theme';

// 性能优化工具
import { useLocalStorage, useDebounce, useAsync } from '@/hooks/use-performance';
import { fetchWithCache } from '@/lib/cache/memory-cache';
import { get, post } from '@/lib/request/request';
import monitor from '@/lib/performance/monitor';

interface RewardItem {
  id: number;
  name: string;
  description: string;
  points: number;
  image: string;
  category: string;
  stock: number;
  status: 'available' | 'out_of_stock' | 'coming_soon';
  sales: number;
  rating: number;
  isNew: boolean;
  isHot: boolean;
}

interface ExchangeHistory {
  id: number;
  itemName: string;
  points: number;
  exchangeTime: string;
  status: string;
}

export default function ExchangePageContent() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedKeyword] = useDebounce(searchKeyword, 300);
  const [selectedCategory, setSelectedCategory] = useLocalStorage('exchange-category', 'all');
  const [sortBy, setSortBy] = useLocalStorage('exchange-sort', 'popular');
  const [userPoints] = useLocalStorage('user-points', 5000);
  const [selectedItem, setSelectedItem] = useState<RewardItem | null>(null);
  const [isExchanging, setIsExchanging] = useState(false);
  const [exchangeHistory, setExchangeHistory] = useState<ExchangeHistory[]>([]);

  // 获取商品列表
  const {
    data: rewardItems = [],
    loading: itemsLoading,
    error: itemsError,
  } = useAsync<RewardItem[]>();

  // 加载商品数据
  useEffect(() => {
    loadRewardItems();
  }, [selectedCategory, sortBy]);

  // 加载兑换历史
  useEffect(() => {
    loadExchangeHistory();
  }, []);

  const loadRewardItems = useCallback(async () => {
    try {
      const cacheKey = `reward-items-${selectedCategory}-${sortBy}`;
      return await fetchWithCache<RewardItem[]>(cacheKey, async () => {
        const params = new URLSearchParams({
          category: selectedCategory,
          sortBy,
          ...(debouncedKeyword && { keyword: debouncedKeyword }),
        });

        const response = await get<{ success: boolean; data?: RewardItem[] }>(
          `/api/points/reward-items?${params.toString()}`
        );

        return (response.data as any) || [];
      }, 5 * 60 * 1000); // 5分钟缓存
    } catch (error) {
      console.error('获取商品列表失败:', error);
      monitor.trackError('loadRewardItems', error as Error);
      throw error;
    }
  }, [selectedCategory, sortBy, debouncedKeyword]);

  const loadExchangeHistory = useCallback(async () => {
    try {
      const cacheKey = 'exchange-history';
      return await fetchWithCache<ExchangeHistory[]>(cacheKey, async () => {
        const response = await get<{ success: boolean; data?: ExchangeHistory[] }>(
          '/api/points/exchange-history'
        );

        return (response.data as any) || [];
      }, 2 * 60 * 1000); // 2分钟缓存
    } catch (error) {
      console.error('获取兑换历史失败:', error);
      monitor.trackError('loadExchangeHistory', error as Error);
      throw error;
    }
  }, []);

  // 分类列表
  const categories = useMemo(() => [
    { id: 'all', name: '全部商品' },
    { id: 'digital', name: '数字产品' },
    { id: 'physical', name: '实物商品' },
    { id: 'gift-card', name: '礼品卡' },
    { id: 'experience', name: '体验服务' },
  ], []);

  // 排序选项
  const sortOptions = useMemo(() => [
    { id: 'popular', name: '最热兑换' },
    { id: 'newest', name: '最新上架' },
    { id: 'price-asc', name: '积分从低到高' },
    { id: 'price-desc', name: '积分从高到低' },
  ], []);

  // 过滤和排序商品
  const filteredItems = useMemo(() => {
    let items = [...rewardItems];

    // 按分类过滤
    if (selectedCategory !== 'all') {
      items = items.filter((item: any) => item => item.category === selectedCategory);
    }

    // 按搜索关键词过滤
    if (debouncedKeyword) {
      items = items.filter((item: any) => item =>
        item.name.toLowerCase().includes(debouncedKeyword.toLowerCase()) ||
        item.description.toLowerCase().includes(debouncedKeyword.toLowerCase())
      );
    }

    // 排序
    switch (sortBy) {
      case 'popular':
        items.sort((a, b) => b.sales - a.sales);
        break;
      case 'newest':
        items.sort((a, b) => b.id - a.id);
        break;
      case 'price-asc':
        items.sort((a, b) => a.points - b.points);
        break;
      case 'price-desc':
        items.sort((a, b) => b.points - a.points);
        break;
    }

    return items;
  }, [rewardItems, selectedCategory, debouncedKeyword, sortBy]);

  const handleExchange = useCallback(async (item: RewardItem) => {
    if (userPoints < item.points) {
      alert('积分不足');
      return;
    }

    if (item.stock <= 0) {
      alert('库存不足');
      return;
    }

    try {
      setIsExchanging(true);

      const response = await post<{ success: boolean; message?: string }>(
        '/api/points/exchange',
        {
          itemId: item.id,
          points: item.points,
        }
      );

      if (response.success) {
        await loadExchangeHistory();
        await loadRewardItems();
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('兑换失败:', error);
      monitor.trackError('handleExchange', error as Error);
      alert('兑换失败，请重试');
    } finally {
      setIsExchanging(false);
    }
  }, [userPoints, loadExchangeHistory, loadRewardItems]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'out_of_stock':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'coming_soon':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (itemsError) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <RefreshCw className="h-5 w-5" />
              <span>加载失败: {itemsError.message}</span>
            </div>
            <Button onClick={loadRewardItems} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/points" className="flex items-center text-gray-600 hover:text-gray-900 mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回积分管理
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Gift className="h-6 w-6 text-orange-500" />
            积分兑换商城
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            使用积分兑换丰富奖品
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-lg">
            <span className="text-sm">可用积分</span>
            <div className="text-2xl font-bold">{userPoints}</div>
          </div>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索商品名称或描述"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 商品列表 */}
      <div>
        {itemsLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardContent className="pt-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Gift className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">暂无符合条件的商品</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                    {item.isNew && (
                      <Badge className="bg-green-600">新品</Badge>
                    )}
                    {item.isHot && (
                      <Badge className="bg-red-600">热门</Badge>
                    )}
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge className={getStatusColor(item.status)}>
                      {item.status === 'available' ? '有货' :
                       item.status === 'out_of_stock' ? '缺货' : '即将上架'}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{item.rating}</span>
                    </div>
                    <span className="text-xs text-gray-500">已兑换 {item.sales}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold text-orange-600">
                      {item.points} 积分
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          disabled={item.status !== 'available'}
                          onClick={() => setSelectedItem(item)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          兑换
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>确认兑换</DialogTitle>
                          <DialogDescription>
                            确认要兑换 {item.name} 吗？
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">所需积分</span>
                            <span className="text-xl font-bold text-orange-600">
                              {item.points}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">可用积分</span>
                            <span className="text-xl font-bold">
                              {userPoints}
                            </span>
                          </div>
                          {userPoints < item.points && (
                            <div className="text-red-600 text-sm">
                              积分不足，还差 {item.points - userPoints} 积分
                            </div>
                          )}
                          <Button
                            className="w-full"
                            onClick={() => handleExchange(item)}
                            disabled={isExchanging || userPoints < item.points || item.stock <= 0}
                          >
                            {isExchanging ? '兑换中...' : '确认兑换'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 兑换历史 */}
      {exchangeHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              最近兑换记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exchangeHistory.slice(0, 5).map((record) => (
                <div key={record.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <div className="font-medium">{record.itemName}</div>
                    <div className="text-sm text-gray-500">{record.exchangeTime}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-orange-600 font-medium">-{record.points} 积分</span>
                    <Badge className={cn(
                      record.status === 'success' ? 'bg-green-100 text-green-700' :
                      record.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    )}>
                      {record.status === 'success' ? '成功' :
                       record.status === 'pending' ? '处理中' : '失败'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
