'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/loading';
import {
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Download,
  Search,
  Filter,
  Eye,
  Edit3,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  User,
  Briefcase,
  MapPin,
  Printer,
  MessageSquare,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/theme';

// 性能优化工具
import { useLocalStorage, useDebounce, useAsync } from '@/hooks/use-performance';
import { fetchWithCache } from '@/lib/cache/memory-cache';
import { get, post, put, del } from '@/lib/request/request';
import monitor from '@/lib/performance/monitor';

interface Offer {
  id: number;
  candidateId: number;
  candidateName: string;
  candidateAvatar: string;
  gender: string;
  age: number;
  phone: string;
  email: string;
  position: string;
  department: string;
  level: string;
  location: string;
  baseSalary: number;
  performanceBonus: number;
  annualSalary: number;
  startDate: string;
  probationPeriod: number;
  probationSalary: number;
  status: 'pending' | 'sent' | 'accepted' | 'rejected' | 'expired';
  sendDate: string;
  responseDeadline: string;
  sendBy: string;
  notes: string;
  benefits: string[];
  interviewerComments: string;
  hrComments: string;
}

export default function OfferManagementContent() {
  const [selectedStatus, setSelectedStatus] = useLocalStorage('offer-status', 'all');
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedKeyword] = useDebounce(searchKeyword, 300);

  // 获取Offer列表
  const {
    data: offers = [],
    loading,
    error,
    execute: fetchOffers,
  } = useAsync<Offer[]>();

  const loadOffers = useCallback(async (): Promise<Offer[]> => {
    try {
      const cacheKey = `offers-${selectedStatus}-${debouncedKeyword}`;
      return await fetchWithCache<Offer[]>(cacheKey, async () => {
        const params = new URLSearchParams({
          ...(selectedStatus !== 'all' && { status: selectedStatus }),
          ...(debouncedKeyword && { keyword: debouncedKeyword }),
        });

        const response = await get<{ success: boolean; data?: Offer[] }>(
          `/api/recruitment/offers?${params.toString()}`
        );

        return (response.data as any) || [];
      }, 3 * 60 * 1000); // 3分钟缓存
    } catch (err) {
      console.error('获取Offer列表失败:', err);
      monitor.trackError('loadOffers', err as Error);
      throw err;
    }
  }, [selectedStatus, debouncedKeyword]);

  useEffect(() => {
    fetchOffers(loadOffers);
  }, [selectedStatus, fetchOffers, loadOffers]);

  // 状态选项
  const statusOptions = useMemo(() => [
    { id: 'all', name: '全部状态' },
    { id: 'pending', name: '待发送' },
    { id: 'sent', name: '待回复' },
    { id: 'accepted', name: '已接受' },
    { id: 'rejected', name: '已拒绝' },
    { id: 'expired', name: '已过期' },
  ], []);

  // 统计数据
  const stats = useMemo(() => ({
    total: offers.length,
    pending: offers.filter((item: any) => o => o.status === 'pending').length,
    sent: offers.filter((item: any) => o => o.status === 'sent').length,
    accepted: offers.filter((item: any) => o => o.status === 'accepted').length,
    rejected: offers.filter((item: any) => o => o.status === 'rejected').length,
  }), [offers]);

  const getStatusColor = useCallback((status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
      sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      accepted: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      expired: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  }, []);

  const handleSendOffer = useCallback(async (id: number) => {
    try {
      await post<{ success: boolean }>('/api/recruitment/offers/send', { offerId: id });
      await fetchOffers(loadOffers);
    } catch (err) {
      console.error('发送Offer失败:', err);
      monitor.trackError('sendOffer', err as Error);
      alert('操作失败');
    }
  }, [fetchOffers, loadOffers]);

  const handleResend = useCallback(async (id: number) => {
    if (!confirm('确定要重新发送此Offer吗？')) {
      return;
    }
    try {
      await post<{ success: boolean }>('/api/recruitment/offers/resend', { offerId: id });
      await fetchOffers(loadOffers);
    } catch (err) {
      console.error('重发Offer失败:', err);
      monitor.trackError('resendOffer', err as Error);
      alert('操作失败');
    }
  }, [fetchOffers, loadOffers]);

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="h-5 w-5" />
              <span>加载失败: {error.message}</span>
            </div>
            <Button onClick={() => fetchOffers(loadOffers)} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Offer管理</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理录用通知，跟踪候选人回复
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Send className="mr-2 h-4 w-4" />
          发送新Offer
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-5">
        {loading ? (
          [1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总Offer数</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">待发送</p>
                    <p className="text-2xl font-bold text-gray-600">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-gray-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">待回复</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
                  </div>
                  <Send className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">已接受</p>
                    <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">已拒绝</p>
                    <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索候选人或职位"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(opt => (
                    <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              高级筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Offer列表 */}
      <Card>
        <CardHeader>
          <CardTitle>Offer列表</CardTitle>
          <CardDescription>
            共 {offers.length} 条记录
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无Offer记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {offers.map((offer) => (
                <Card key={offer.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="text-lg">{offer.candidateAvatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{offer.candidateName}</h3>
                            <Badge className={getStatusColor(offer.status)}>
                              {offer.status === 'pending' ? '待发送' :
                               offer.status === 'sent' ? '待回复' :
                               offer.status === 'accepted' ? '已接受' :
                               offer.status === 'rejected' ? '已拒绝' : '已过期'}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {offer.position}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {offer.level}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {offer.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              年薪 ¥{(offer.annualSalary / 10000).toFixed(1)}万
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              入职: {offer.startDate}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                            <span>• 基本工资: ¥{offer.baseSalary.toLocaleString()}</span>
                            <span>• 绩效奖金: ¥{offer.performanceBonus.toLocaleString()}</span>
                            <span>• 试用期: ¥{offer.probationSalary.toLocaleString()}</span>
                            <span>• 试用期限: {offer.probationPeriod}个月</span>
                          </div>
                          {offer.notes && (
                            <p className="text-sm text-gray-600 line-clamp-1">
                              备注: {offer.notes}
                            </p>
                          )}
                          {offer.sendDate !== '-' && (
                            <div className="text-xs text-gray-500 mt-2">
                              发送时间: {offer.sendDate} · 回复截止: {offer.responseDeadline} · 发送人: {offer.sendBy}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          详情
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                        {offer.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleSendOffer(offer.id)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600"
                          >
                            <Send className="h-4 w-4 mr-1" />
                            发送
                          </Button>
                        )}
                        {offer.status === 'sent' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResend(offer.id)}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            催办
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Edit3 className="h-4 w-4 mr-1" />
                          编辑
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
