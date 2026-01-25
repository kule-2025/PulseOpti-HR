"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { PaymentConfigList } from "./components/PaymentConfigList";
import { PaymentOrderList } from "./components/PaymentOrderList";
import { RefundRecordList } from "./components/RefundRecordList";
import { ReconciliationReport } from "./components/ReconciliationReport";

export default function PaymentManagementPage() {
  const [activeTab, setActiveTab] = useState("configs");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">支付管理</h1>
          <p className="text-muted-foreground mt-2">
            管理支付配置、支付订单、退款记录和对账报表
          </p>
        </div>

        {/* 标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="configs">支付配置</TabsTrigger>
            <TabsTrigger value="orders">支付订单</TabsTrigger>
            <TabsTrigger value="refunds">退款管理</TabsTrigger>
            <TabsTrigger value="reconciliation">对账报表</TabsTrigger>
          </TabsList>

          <TabsContent value="configs" className="space-y-4">
            <PaymentConfigList />
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <PaymentOrderList />
          </TabsContent>

          <TabsContent value="refunds" className="space-y-4">
            <RefundRecordList />
          </TabsContent>

          <TabsContent value="reconciliation" className="space-y-4">
            <ReconciliationReport />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
