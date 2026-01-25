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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, RefreshCw, XCircle } from "lucide-react";
import { toast } from "sonner";

interface PaymentOrder {
  id: string;
  orderNo: string;
  paymentNo: string;
  provider: string;
  amount: number;
  subject: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
}

export function PaymentOrderList() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formData, setFormData] = useState({
    orderNo: "",
    amount: "",
    subject: "",
    description: "",
    returnUrl: "",
    notifyUrl: "",
  });

  // 获取支付订单列表
  const fetchOrders = async () => {
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

      const response = await fetch(`/api/payment/orders?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("获取支付订单失败");
      }

      const result = await response.json();
      setOrders(result.data);
      setTotal(result.pagination.total);
    } catch (error) {
      console.error("获取支付订单失败:", error);
      toast.error("获取支付订单失败");
    } finally {
      setLoading(false);
    }
  };

  // 创建支付订单
  const handleCreate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/payment/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyId: localStorage.getItem("companyId"),
          orderNo: formData.orderNo,
          amount: parseInt(formData.amount) * 100, // 转换为分
          subject: formData.subject,
          description: formData.description,
          returnUrl: formData.returnUrl,
          notifyUrl: formData.notifyUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("创建支付订单失败");
      }

      toast.success("创建支付订单成功");
      setIsCreateDialogOpen(false);
      fetchOrders();
      resetForm();
    } catch (error) {
      console.error("创建支付订单失败:", error);
      toast.error(error instanceof Error ? error.message : "创建支付订单失败");
    }
  };

  // 取消支付订单
  const handleCancel = async (id: string) => {
    if (!confirm("确定要取消这个订单吗？")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/payment/orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "cancel" }),
      });

      if (!response.ok) {
        throw new Error("取消订单失败");
      }

      toast.success("取消订单成功");
      fetchOrders();
    } catch (error) {
      console.error("取消订单失败:", error);
      toast.error("取消订单失败");
    }
  };

  // 刷新订单列表
  const handleRefresh = () => {
    fetchOrders();
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      orderNo: "",
      amount: "",
      subject: "",
      description: "",
      returnUrl: "",
      notifyUrl: "",
    });
  };

  // 获取状态对应的Badge样式
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">已支付</Badge>;
      case "pending":
        return <Badge variant="secondary">待支付</Badge>;
      case "failed":
        return <Badge variant="destructive">支付失败</Badge>;
      case "cancelled":
        return <Badge variant="outline">已取消</Badge>;
      case "refunding":
        return <Badge variant="outline">退款中</Badge>;
      case "refunded":
        return <Badge variant="outline">已退款</Badge>;
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
      case "bank_transfer":
        return "银行转账";
      case "credit_card":
        return "信用卡";
      default:
        return provider;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>支付订单</CardTitle>
              <CardDescription>
                查看和管理所有支付订单
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetForm()}>
                    <Plus className="mr-2 h-4 w-4" />
                    创建订单
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>创建支付订单</DialogTitle>
                    <DialogDescription>
                      创建新的支付订单
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="orderNo">订单号 *</Label>
                      <Input
                        id="orderNo"
                        value={formData.orderNo}
                        onChange={(e) =>
                          setFormData({ ...formData, orderNo: e.target.value })
                        }
                        placeholder="请输入业务订单号"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">金额（元）*</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value })
                        }
                        placeholder="请输入金额"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">支付标题 *</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        placeholder="请输入支付标题"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">支付描述</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        placeholder="请输入支付描述"
                      />
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
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="订单状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状态</SelectItem>
                <SelectItem value="pending">待支付</SelectItem>
                <SelectItem value="paid">已支付</SelectItem>
                <SelectItem value="failed">支付失败</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
                <SelectItem value="refunding">退款中</SelectItem>
                <SelectItem value="refunded">已退款</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>订单号</TableHead>
                <TableHead>支付流水号</TableHead>
                <TableHead>支付方式</TableHead>
                <TableHead>金额</TableHead>
                <TableHead>标题</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>支付时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    暂无支付订单
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNo}</TableCell>
                    <TableCell className="font-mono text-xs">{order.paymentNo}</TableCell>
                    <TableCell>{getProviderName(order.provider)}</TableCell>
                    <TableCell>¥{(order.amount / 100).toFixed(2)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{order.subject}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      {order.paidAt ? new Date(order.paidAt).toLocaleString() : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {order.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCancel(order.id)}
                        >
                          <XCircle className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
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
