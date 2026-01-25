'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/loading';
import {
  Plus,
  Search,
  Download,
  Eye,
  BrainCircuit,
  Users,
  Sparkles,
  Target,
  Clock,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

// 性能优化工具
import { useLocalStorage, useDebounce, useAsync } from '@/hooks/use-performance';
import { fetchWithCache } from '@/lib/cache/memory-cache';
import { get, post } from '@/lib/request/request';
import monitor from '@/lib/performance/monitor';

interface TalentPool {
  id: string;
  name: string;
  type: 'candidate' | 'employee' | 'alumni' | 'external';
  description: string;
  tags: string[];
  memberCount: number;
  createdAt: string;
}

interface TalentPoolMember {
  id: string;
  name: string;
  type: 'candidate' | 'employee';
  department: string;
  position: string;
  aiMatchScore: number;
  tags: string[];
  addedAt: string;
}

export default function TalentPoolContent() {
  const [activeTab, setActiveTab] = useLocalStorage('talent-pool-tab', 'pools');
  const [selectedPool, setSelectedPool] = useLocalStorage('talent-pool-selected', '');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  const {
    data: pools = [],
    loading: poolsLoading,
    error: poolsError,
    execute: fetchPools,
  } = useAsync<TalentPool[]>();

  const {
    data: members = [],
    loading: membersLoading,
    error: membersError,
    execute: fetchMembers,
  } = useAsync<TalentPoolMember[]>();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPoolName, setNewPoolName] = useState('');

  const loadPools = useCallback(async (): Promise<TalentPool[]> => {
    try {
      const cacheKey = 'talent-pools';
      return await fetchWithCache<TalentPool[]>(cacheKey, async () => {
        const response = await get<{ success: boolean; data?: TalentPool[] }>(
          '/api/talent/pools'
        );

        return (response.data as any) || [];
      }, 5 * 60 * 1000);
    } catch (err) {
      console.error('加载人才池失败:', err);
      monitor.trackError('loadTalentPools', err as Error);
      throw err;
    }
  }, []);

  const loadMembers = useCallback(async (): Promise<TalentPoolMember[]> => {
    if (!selectedPool) return [];

    try {
      const cacheKey = `talent-pool-members-${selectedPool}`;
      return await fetchWithCache<TalentPoolMember[]>(cacheKey, async () => {
        const response = await get<{ success: boolean; data?: TalentPoolMember[] }>(
          `/api/talent/pools/${selectedPool}/members`
        );

        return (response.data as any) || [];
      }, 3 * 60 * 1000);
    } catch (err) {
      console.error('加载人才池成员失败:', err);
      monitor.trackError('loadTalentPoolMembers', err as Error);
      throw err;
    }
  }, [selectedPool]);

  useEffect(() => {
    fetchPools(loadPools);
  }, [fetchPools, loadPools]);

  useEffect(() => {
    if (selectedPool) {
      fetchMembers(loadMembers);
    }
  }, [selectedPool, fetchMembers, loadMembers]);

  const filteredMembers = useMemo(() => {
    return members.filter((item: any) => member => {
      const matchesSearch = !debouncedQuery ||
        member.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        member.position.toLowerCase().includes(debouncedQuery.toLowerCase());
      return matchesSearch;
    });
  }, [members, debouncedQuery]);

  const handleCreatePool = useCallback(async () => {
    if (!newPoolName.trim()) return;

    try {
      await post('/api/talent/pools', { name: newPoolName });
      setCreateDialogOpen(false);
      setNewPoolName('');
      fetchPools(loadPools);
    } catch (err) {
      console.error('创建人才池失败:', err);
    }
  }, [newPoolName, fetchPools, loadPools]);

  const getMatchScoreColor = useCallback((score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  }, []);

  if (poolsError) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="h-5 w-5" />
              <span>加载失败: {poolsError.message}</span>
            </div>
            <Button onClick={() => fetchPools(loadPools)} variant="outline">
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">人才池</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            管理和分类各类人才资源
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            创建人才池
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pools">人才池</TabsTrigger>
          <TabsTrigger value="members">人才库</TabsTrigger>
        </TabsList>

        <TabsContent value="pools" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {poolsLoading ? (
              [1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-32" />
                  </CardContent>
                </Card>
              ))
            ) : pools.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-gray-500">暂无人才池</div>
            ) : (
              pools.map((pool) => (
                <Card
                  key={pool.id}
                  className={`cursor-pointer transition-all ${
                    selectedPool === pool.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedPool(pool.id)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {pool.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">成员数量</span>
                        <span className="font-medium">{pool.memberCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">类型</span>
                        <Badge>{pool.type}</Badge>
                      </div>
                      {pool.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {pool.tags.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>人才库成员</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索人才"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {membersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">暂无成员</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>姓名</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>部门</TableHead>
                      <TableHead>职位</TableHead>
                      <TableHead>AI匹配度</TableHead>
                      <TableHead>标签</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{member.type}</Badge>
                        </TableCell>
                        <TableCell>{member.department}</TableCell>
                        <TableCell>{member.position}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <BrainCircuit className="h-4 w-4 text-purple-600" />
                            <span className={`font-medium px-2 py-1 rounded ${getMatchScoreColor(member.aiMatchScore)}`}>
                              {member.aiMatchScore}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {member.tags.map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建人才池</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">人才池名称 *</label>
              <Input
                value={newPoolName}
                onChange={(e) => setNewPoolName(e.target.value)}
                placeholder="请输入人才池名称"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>取消</Button>
              <Button onClick={handleCreatePool}>创建</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
