"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, RefreshCw, FileText } from "lucide-react";
import { toast } from "sonner";

interface ReconciliationRecord {
  id: string;
  provider: string;
  reconcileDate: string;
  reconcileType: string;
  totalOrders: number;
  successOrders: number;
  failedOrders: number;
  totalAmount: number;
  successAmount: number;
  failedAmount: number;
  totalFee: number;
  status: string;
  createdAt: string;
}

export function ReconciliationReport() {
  const [records, setRecords] = useState<ReconciliationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [formData, setFormData] = useState({
    provider: "",
    reconcileDate: new Date().toISOString().split("T")[0],
    reconcileType: "daily",
  });

  // 获取对账记录列表
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (statusFilter) {
        params.append("status", statusFilter);
      }

      const response = await fetch(`/api/payment/reconciliation?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("获取对账记录失败");
      }

      const result = await response.json();
      setRecords(result.data);
      setTotal(result.pagination.total);
    } catch (error) {
      console.error("获取对账记录失败:", error);
      toast.error("获取对账记录失败");
    } finally {
      setLoading(false);
    }
  };

  // 创建对账任务
  const handleCreate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/payment/reconciliation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyId: localStorage.getItem("companyId"),
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error("创建对账任务失败");
      }

      toast.success("创建对账任务成功");
      setIsCreateDialogOpen(false);
      fetchRecords();
    } catch (error) {
      console.error("创建对账任务失败:", error);
      toast.error("创建对账任务失败");
    }
  };

  // 刷新对账记录
  const handleRefresh = () => {
    fetchRecords();
  };

  // 获取状态对应的Badge样式
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500">对账成功</Badge>;
      case "pending":
        return <Badge variant="secondary">对账中</Badge>;
      case "failed":
        return <Badge variant="destructive">对账失败</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // 获取支付方式名称
  const getProviderName = (provider: string) => {
    switch (provider) {
      case "alipay":
        return "支付宝";
      case "wechat_pay":
        return "微信支付";
      default:
        return provider;
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page, statusFilter]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>对账报表</CardTitle>
              <CardDescription>
                查看和管理支付对账记录
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    创建对账
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>创建对账任务</DialogTitle>
                    <DialogDescription>
                      创建新的对账任务
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="provider">支付方式 *</Label>
                      <Select
                        value={formData.provider}
                        onValueChange={(value) =>
                          setFormData({ ...formData, provider: value })
                        }
                      >
                        <SelectTrigger id="provider">
                          <SelectValue placeholder="选择支付方式" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alipay">支付宝</SelectItem>
                          <SelectItem value="wechat_pay">微信支付</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reconcileDate">对账日期 *</Label>
                      <Input
                        id="reconcileDate"
                        type="date"
                        value={formData.reconcileDate}
                        onChange={(e) =>
                          setFormData({ ...formData, reconcileDate: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reconcileType">对账类型</Label>
                      <Select
                        value={formData.reconcileType}
                        onValueChange={(value) =>
                          setFormData({ ...formData, reconcileType: value })
                        }
                      >
                        <SelectTrigger id="reconcileType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">日对账</SelectItem>
                          <SelectItem value="monthly">月对账</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      取消
                    </Button>
                    <Button onClick={handleCreate}>创建</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="对账状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部状态</SelectItem>
              <SelectItem value="pending">对账中</SelectItem>
              <SelectItem value="success">对账成功</SelectItem>
              <SelectItem value="failed">对账失败</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>支付方式</TableHead>
                <TableHead>对账日期</TableHead>
                <TableHead>对账类型</TableHead>
                <TableHead>订单数</TableHead>
                <TableHead>成功/失败</TableHead>
                <TableHead>总金额</TableHead>
                <TableHead>手续费</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    暂无对账记录
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{getProviderName(record.provider)}</TableCell>
                    <TableCell>
                      {new Date(record.reconcileDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {record.reconcileType === "daily" ? "日对账" : "月对账"}
                      </Badge>
                    </TableCell>
                    <TableCell>{record.totalOrders}</TableCell>
                    <TableCell>
                      <span className="text-green-600">{record.successOrders}</span>
                      /
                      <span className="text-red-600">{record.failedOrders}</span>
                    </TableCell>
                    <TableCell>
                      ¥{(record.successAmount / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>¥{(record.totalFee / 100).toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      {new Date(record.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                上一页
              </Button>
              <span className="text-sm text-muted-foreground">
                第 {page} / {totalPages} 页
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                下一页
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
