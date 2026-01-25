'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  RefreshCw,
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  Activity,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
  totalUsers: number;
  totalCompanies: number;
  totalSubscriptions: number;
  activeWorkflows: number;
  revenueThisMonth: number;
  recentUsers: number;
}

interface UserGrowthData {
  date: string;
  users: number;
  companies: number;
}

interface RevenueData {
  month: string;
  revenue: number;
}

export default function ReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userGrowthData, setUserGrowthData] = useState<UserGrowthData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);

  useEffect(() => {
    checkAuth();
    fetchReportData();
  }, []);

  const checkAuth = () => {
    const isSuperAdmin = localStorage.getItem('isSuperAdmin');
    if (isSuperAdmin !== 'true') {
      router.push('/admin/login');
    }
  };

  const fetchReportData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/admin/reports/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取报表数据失败');
      }

      const data = await response.json();
      setStats(data.stats || null);
      setUserGrowthData(data.userGrowth || []);
      setRevenueData(data.revenue || []);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('获取报表数据失败');
      // 使用模拟数据
      setStats({
        totalUsers: 156,
        totalCompanies: 24,
        totalSubscriptions: 18,
        activeWorkflows: 342,
        revenueThisMonth: 15800,
        recentUsers: 12,
      });
      setUserGrowthData([
        { date: '2024-01', users: 100, companies: 10 },
        { date: '2024-02', users: 120, companies: 12 },
        { date: '2024-03', users: 135, companies: 15 },
        { date: '2024-04', users: 156, companies: 24 },
      ]);
      setRevenueData([
        { month: '2024-01', revenue: 5000 },
        { month: '2024-02', revenue: 8000 },
        { month: '2024-03', revenue: 12000 },
        { month: '2024-04', revenue: 15800 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50">
      {/* Header */}
      <div className="border-b bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">报表中心</h1>
                <p className="text-sm text-gray-600 mt-1">系统数据统计分析</p>
              </div>
            </div>
            <Button
              onClick={fetchReportData}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">总览</TabsTrigger>
            <TabsTrigger value="users">用户统计</TabsTrigger>
            <TabsTrigger value="companies">企业统计</TabsTrigger>
            <TabsTrigger value="revenue">收入统计</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总用户数</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-gray-600 mt-1">
                    本月新增 {stats?.recentUsers || 0} 人
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总企业数</CardTitle>
                  <Building2 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.totalCompanies || 0}</div>
                  <p className="text-xs text-gray-600 mt-1">
                    活跃企业 {stats?.totalCompanies || 0} 家
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">本月收入</CardTitle>
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">¥{stats?.revenueThisMonth?.toLocaleString() || 0}</div>
                  <p className="text-xs text-gray-600 mt-1">
                    订单 {stats?.totalSubscriptions || 0} 笔
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Activity Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  系统活动概览
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">活跃工作流</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {stats?.activeWorkflows || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">总订阅数</span>
                  <span className="text-2xl font-bold text-green-600">
                    {stats?.totalSubscriptions || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  用户增长趋势
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userGrowthData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">{item.date}</span>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">{item.users} 人</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          +{index > 0 ? item.users - userGrowthData[index - 1].users : 0}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  企业增长趋势
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userGrowthData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">{item.date}</span>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-green-600" />
                          <span className="text-sm">{item.companies} 家</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          +{index > 0 ? item.companies - userGrowthData[index - 1].companies : 0}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  收入趋势
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">{item.month}</span>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-purple-600" />
                        <span className="text-2xl font-bold">¥{item.revenue.toLocaleString()}</span>
                        {index > 0 && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className={`w-4 h-4 ${item.revenue >= revenueData[index - 1].revenue ? 'text-green-600' : 'text-red-600'}`} />
                            <span className={`text-xs ${item.revenue >= revenueData[index - 1].revenue ? 'text-green-600' : 'text-red-600'}`}>
                              {item.revenue >= revenueData[index - 1].revenue ? '+' : ''}
                              {((item.revenue - revenueData[index - 1].revenue) / revenueData[index - 1].revenue * 100).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
