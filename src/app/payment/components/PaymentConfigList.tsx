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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

interface PaymentConfig {
  id: string;
  provider: string;
  providerName: string;
  environment: string;
  isActive: boolean;
  isDefault: boolean;
  supportCurrencies: string[];
  minAmount: number;
  maxAmount: number;
  feeRate: number;
  description: string;
  createdAt: string;
}

export function PaymentConfigList() {
  const [configs, setConfigs] = useState<PaymentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<PaymentConfig | null>(null);
  const [formData, setFormData] = useState({
    provider: "",
    providerName: "",
    environment: "sandbox",
    isActive: false,
    isDefault: false,
    supportCurrencies: ["CNY"],
    minAmount: 100,
    maxAmount: 1000000,
    feeRate: 0.006,
    description: "",
    config: {
      appId: "",
      appSecret: "",
      merchantId: "",
      mchId: "",
      publicKey: "",
      privateKey: "",
    },
  });

  // 获取支付配置列表
  const fetchConfigs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/payment/configs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("获取支付配置失败");
      }

      const result = await response.json();
      setConfigs(result.data);
    } catch (error) {
      console.error("获取支付配置失败:", error);
      toast.error("获取支付配置失败");
    } finally {
      setLoading(false);
    }
  };

  // 创建支付配置
  const handleCreate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/payment/configs", {
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
        throw new Error("创建支付配置失败");
      }

      toast.success("创建支付配置成功");
      setIsCreateDialogOpen(false);
      fetchConfigs();
      resetForm();
    } catch (error) {
      console.error("创建支付配置失败:", error);
      toast.error("创建支付配置失败");
    }
  };

  // 更新支付配置
  const handleUpdate = async () => {
    if (!selectedConfig) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/payment/configs/${selectedConfig.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("更新支付配置失败");
      }

      toast.success("更新支付配置成功");
      setIsEditDialogOpen(false);
      fetchConfigs();
      setSelectedConfig(null);
      resetForm();
    } catch (error) {
      console.error("更新支付配置失败:", error);
      toast.error("更新支付配置失败");
    }
  };

  // 删除支付配置
  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个支付配置吗？")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/payment/configs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("删除支付配置失败");
      }

      toast.success("删除支付配置成功");
      fetchConfigs();
    } catch (error) {
      console.error("删除支付配置失败:", error);
      toast.error("删除支付配置失败");
    }
  };

  // 编辑支付配置
  const handleEdit = (config: PaymentConfig) => {
    setSelectedConfig(config);
    setFormData({
      provider: config.provider,
      providerName: config.providerName,
      environment: config.environment,
      isActive: config.isActive,
      isDefault: config.isDefault,
      supportCurrencies: config.supportCurrencies,
      minAmount: config.minAmount,
      maxAmount: config.maxAmount,
      feeRate: config.feeRate,
      description: config.description,
      config: {
        appId: "",
        appSecret: "",
        merchantId: "",
        mchId: "",
        publicKey: "",
        privateKey: "",
      },
    });
    setIsEditDialogOpen(true);
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      provider: "",
      providerName: "",
      environment: "sandbox",
      isActive: false,
      isDefault: false,
      supportCurrencies: ["CNY"],
      minAmount: 100,
      maxAmount: 1000000,
      feeRate: 0.006,
      description: "",
      config: {
        appId: "",
        appSecret: "",
        merchantId: "",
        mchId: "",
        publicKey: "",
        privateKey: "",
      },
    });
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">加载中...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>支付配置</CardTitle>
              <CardDescription>
                管理支付宝、微信等支付方式的配置
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="mr-2 h-4 w-4" />
                  新增配置
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>新增支付配置</DialogTitle>
                  <DialogDescription>
                    添加新的支付方式配置
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
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
                          <SelectItem value="bank_transfer">银行转账</SelectItem>
                          <SelectItem value="credit_card">信用卡</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="providerName">配置名称 *</Label>
                      <Input
                        id="providerName"
                        value={formData.providerName}
                        onChange={(e) =>
                          setFormData({ ...formData, providerName: e.target.value })
                        }
                        placeholder="如：支付宝沙箱环境"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="environment">环境</Label>
                      <Select
                        value={formData.environment}
                        onValueChange={(value) =>
                          setFormData({ ...formData, environment: value })
                        }
                      >
                        <SelectTrigger id="environment">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sandbox">沙箱环境</SelectItem>
                          <SelectItem value="production">生产环境</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feeRate">手续费率</Label>
                      <Input
                        id="feeRate"
                        type="number"
                        step="0.001"
                        value={formData.feeRate}
                        onChange={(e) =>
                          setFormData({ ...formData, feeRate: parseFloat(e.target.value) })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minAmount">最小金额（分）</Label>
                      <Input
                        id="minAmount"
                        type="number"
                        value={formData.minAmount}
                        onChange={(e) =>
                          setFormData({ ...formData, minAmount: parseInt(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxAmount">最大金额（分）</Label>
                      <Input
                        id="maxAmount"
                        type="number"
                        value={formData.maxAmount}
                        onChange={(e) =>
                          setFormData({ ...formData, maxAmount: parseInt(e.target.value) })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">描述</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="支付配置描述"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, isActive: checked })
                        }
                      />
                      <Label htmlFor="isActive">启用</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isDefault"
                        checked={formData.isDefault}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, isDefault: checked })
                        }
                      />
                      <Label htmlFor="isDefault">设为默认</Label>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="text-sm font-medium mb-2">支付参数配置</div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="appId">应用ID</Label>
                          <Input
                            id="appId"
                            value={formData.config.appId}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                config: { ...formData.config, appId: e.target.value },
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="appSecret">应用密钥</Label>
                          <Input
                            id="appSecret"
                            type="password"
                            value={formData.config.appSecret}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                config: { ...formData.config, appSecret: e.target.value },
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="merchantId">商户ID</Label>
                          <Input
                            id="merchantId"
                            value={formData.config.merchantId}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                config: { ...formData.config, merchantId: e.target.value },
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mchId">微信商户号</Label>
                          <Input
                            id="mchId"
                            value={formData.config.mchId}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                config: { ...formData.config, mchId: e.target.value },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
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
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>配置名称</TableHead>
                <TableHead>支付方式</TableHead>
                <TableHead>环境</TableHead>
                <TableHead>手续费率</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>默认</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    暂无支付配置
                  </TableCell>
                </TableRow>
              ) : (
                configs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell className="font-medium">{config.providerName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{config.provider}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.environment === "production" ? "default" : "secondary"}>
                        {config.environment === "production" ? "生产环境" : "沙箱环境"}
                      </Badge>
                    </TableCell>
                    <TableCell>{(config.feeRate * 100).toFixed(3)}%</TableCell>
                    <TableCell>
                      <Badge variant={config.isActive ? "default" : "secondary"}>
                        {config.isActive ? "启用" : "禁用"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {config.isDefault && <Badge>默认</Badge>}
                    </TableCell>
                    <TableCell>
                      {new Date(config.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>操作</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(config)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(config.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
