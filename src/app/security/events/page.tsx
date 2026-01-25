"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowLeft,
  Search,
  Filter,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  Clock
} from "lucide-react";

interface SecurityEvent {
  id: string;
  userId: string | null;
  userType: string | null;
  eventType: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string | null;
  sourceIp: string | null;
  userAgent: string | null;
  location: any;
  metadata: any;
  isResolved: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function SecurityEventsPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [resolvedFilter, setResolvedFilter] = useState<string>("all");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (severityFilter !== "all") params.append("severity", severityFilter);
      if (resolvedFilter !== "all") params.append("isResolved", resolvedFilter);
      
      const response = await fetch(`/api/security/events?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, any> = {
      low: "secondary",
      medium: "outline",
      high: "default",
      critical: "destructive",
    };
    const labels: Record<string, string> = {
      low: "低",
      medium: "中",
      high: "高",
      critical: "严重",
    };
    return (
      <Badge variant={variants[severity] || "secondary"}>
        {labels[severity] || severity}
      </Badge>
    );
  };

  const getEventTypeLabel = (eventType: string) => {
    const labels: Record<string, string> = {
      login_failed: "登录失败",
      suspicious_activity: "可疑活动",
      data_access: "数据访问",
      privilege_escalation: "权限提升",
      other: "其他",
    };
    return labels[eventType] || eventType;
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/security">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                安全事件
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                监控和响应系统安全事件
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              批量处理
            </Button>
            <Button variant="outline">导出</Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总事件数</CardTitle>
              <Shield className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{events.length}</div>
              <p className="text-xs text-slate-500 mt-1">本月累计</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">未解决</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {events.filter((e) => !e.isResolved).length}
              </div>
              <p className="text-xs text-slate-500 mt-1">待处理</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">严重事件</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {events.filter((e) => e.severity === "critical").length}
              </div>
              <p className="text-xs text-slate-500 mt-1">需立即处理</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已解决</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {events.filter((e) => e.isResolved).length}
              </div>
              <p className="text-xs text-slate-500 mt-1">已处理完毕</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="搜索事件标题或描述..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={severityFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSeverityFilter("all")}
                >
                  全部严重级别
                </Button>
                <Button
                  variant={severityFilter === "critical" ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => setSeverityFilter("critical")}
                >
                  严重
                </Button>
                <Button
                  variant={severityFilter === "high" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSeverityFilter("high")}
                >
                  高
                </Button>
                <Button
                  variant={severityFilter === "medium" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSeverityFilter("medium")}
                >
                  中
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={resolvedFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setResolvedFilter("all")}
                >
                  全部状态
                </Button>
                <Button
                  variant={resolvedFilter === "false" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setResolvedFilter("false")}
                >
                  未解决
                </Button>
                <Button
                  variant={resolvedFilter === "true" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setResolvedFilter("true")}
                >
                  已解决
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events Table */}
        <Card>
          <CardHeader>
            <CardTitle>事件列表</CardTitle>
            <CardDescription>共 {filteredEvents.length} 个事件</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-500">加载中...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>标题</TableHead>
                    <TableHead>事件类型</TableHead>
                    <TableHead>严重级别</TableHead>
                    <TableHead>来源IP</TableHead>
                    <TableHead>发生时间</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                        暂无安全事件
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-start gap-2">
                            {event.severity === "critical" && (
                              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                            )}
                            <div>
                              <div>{event.title}</div>
                              {event.description && (
                                <div className="text-sm text-slate-500 mt-1">
                                  {event.description.length > 50
                                    ? event.description.slice(0, 50) + "..."
                                    : event.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getEventTypeLabel(event.eventType)}</Badge>
                        </TableCell>
                        <TableCell>{getSeverityBadge(event.severity)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            {event.sourceIp || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                            <Clock className="h-3 w-3" />
                            {new Date(event.createdAt).toLocaleString("zh-CN")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={event.isResolved ? "default" : "secondary"}>
                            {event.isResolved ? "已解决" : "未解决"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
