"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface RefundRecord {
  id: string;
  refundNo: string;
  paymentNo: string;
  amount: number;
  refundAmount: number;
  refundType: string;
  status: string;
  reason: string;
  createdAt: string;
  refundedAt: string | null;
}

export function RefundRecordList() {
  const [refunds, setRefunds] = useState<RefundRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");

  // 获取退款记录列表
  const fetchRefunds = async () => {
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

      const response = await fetch(`/api/payment/refunds?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("获取退款记录失败");
      }

      const result = await response.json();
      setRefunds(result.data);
      setTotal(result.pagination.total);
    } catch (error) {
      console.error("获取退款记录失败:", error);
      toast.error("获取退款记录失败");
    } finally {
      setLoading(false);
    }
  };

  // 刷新退款记录
  const handleRefresh = () => {
    fetchRefunds();
  };

  // 获取状态对应的Badge样式
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500">退款成功</Badge>;
      case "pending":
        return <Badge variant="secondary">待退款</Badge>;
      case "processing":
        return <Badge variant="outline">处理中</Badge>;
      case "failed":
        return <Badge variant="destructive">退款失败</Badge>;
      case "cancelled":
        return <Badge variant="outline">已取消</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, [page, statusFilter]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>退款管理</CardTitle>
              <CardDescription>
                查看和管理所有退款记录
              </CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="退款状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部状态</SelectItem>
              <SelectItem value="pending">待退款</SelectItem>
              <SelectItem value="processing">处理中</SelectItem>
              <SelectItem value="success">退款成功</SelectItem>
              <SelectItem value="failed">退款失败</SelectItem>
              <SelectItem value="cancelled">已取消</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>退款流水号</TableHead>
                <TableHead>支付流水号</TableHead>
                <TableHead>退款金额</TableHead>
                <TableHead>退款类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>退款原因</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>退款时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : refunds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    暂无退款记录
                  </TableCell>
                </TableRow>
              ) : (
                refunds.map((refund) => (
                  <TableRow key={refund.id}>
                    <TableCell className="font-mono text-xs">{refund.refundNo}</TableCell>
                    <TableCell className="font-mono text-xs">{refund.paymentNo}</TableCell>
                    <TableCell>¥{(refund.refundAmount / 100).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {refund.refundType === "full" ? "全额退款" : "部分退款"}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(refund.status)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{refund.reason || "-"}</TableCell>
                    <TableCell>{new Date(refund.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      {refund.refundedAt ? new Date(refund.refundedAt).toLocaleString() : "-"}
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
