'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CheckCircle2,
  Copy,
  RefreshCw,
  ArrowLeft,
  Clock,
  QrCode,
  AlertCircle,
  ArrowRight,
  Loader2,
  Upload,
  FileImage,
} from 'lucide-react';
import { cn } from '@/lib/theme';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay'>('wechat');
  const [countdown, setCountdown] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedProof, setUploadedProof] = useState<any>(null);

  // 套餐名称映射
  const tierNames: Record<string, string> = {
    free: '免费版',
    basic: '基础版',
    professional: '专业版',
    enterprise: '企业版',
  };

  // 加载订单信息
  useEffect(() => {
    loadOrder();
  }, [orderId]);

  // 加载订单
  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/list?orderId=${orderId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '加载订单失败');
      }

      const orders = data.data || [];
      const orderData = orders.find((o: any) => o.id === orderId);

      if (!orderData) {
        throw new Error('订单不存在');
      }

      setOrder(orderData);

      // 检查订单是否已支付
      if (orderData.status === 'paid') {
        router.push(`/payment/success?orderId=${orderId}`);
        return;
      }

      // 检查订单是否已过期
      if (orderData.expiresAt && new Date(orderData.expiresAt) < new Date()) {
        setError('订单已过期，请重新下单');
        return;
      }

      // 开始倒计时
      const expiresAt = new Date(orderData.expiresAt);
      const now = new Date();
      const diff = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);
      if (diff > 0) {
        setCountdown(diff);
      }
    } catch (err: any) {
      setError(err.message || '加载订单失败');
    } finally {
      setLoading(false);
    }
  };

  // 倒计时
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setError('订单已过期，请重新下单');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // 定期检查支付状态（每5秒）
  useEffect(() => {
    if (!order || order.status === 'paid') return;

    const timer = setInterval(async () => {
      try {
        const response = await fetch(`/api/orders/list?orderId=${orderId}`);
        const data = await response.json();
        const orders = data.data || [];
        const orderData = orders.find((o: any) => o.id === orderId);

        if (orderData && orderData.status === 'paid') {
          router.push(`/payment/success?orderId=${orderId}`);
        }
      } catch (err) {
        console.error('检查支付状态失败:', err);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [orderId, order]);

  // 复制订单号
  const copyOrderNo = () => {
    navigator.clipboard.writeText(order.orderNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 上传支付凭证
  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('只支持上传图片文件（JPG、PNG、GIF、WebP）');
      return;
    }

    // 验证文件大小（最大5MB）
    if (file.size > 5 * 1024 * 1024) {
      setError('文件大小不能超过5MB');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('file', file);

      // 获取用户ID
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        formData.append('userId', user.id);
      }

      const response = await fetch('/api/orders/upload-proof', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '上传失败');
      }

      // 上传成功，加载凭证信息
      loadPaymentProofs();
      alert('支付凭证上传成功！我们将在24小时内完成审核，审核通过后您的会员将自动激活。如有疑问请联系客服：PulseOptiHR@163.com');
    } catch (err: any) {
      setError(err.message || '上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  // 加载支付凭证
  const loadPaymentProofs = async () => {
    try {
      const response = await fetch(`/api/orders/upload-proof?orderId=${orderId}`);
      const data = await response.json();

      if (response.ok && data.data && data.data.length > 0) {
        setUploadedProof(data.data[0]);
      }
    } catch (err) {
      console.error('加载支付凭证失败:', err);
    }
  };

  // 在加载订单时同时加载支付凭证
  useEffect(() => {
    if (orderId) {
      loadPaymentProofs();
    }
  }, [orderId]);

  // 验证支付（手动）
  const handleVerifyPayment = async () => {
    try {
      setVerifying(true);
      const response = await fetch('/api/orders/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '验证失败');
      }

      // 跳转到成功页面
      router.push(`/payment/success?orderId=${orderId}`);
    } catch (err: any) {
      setError(err.message || '验证失败，请确认支付后重试');
    } finally {
      setVerifying(false);
    }
  };

  // 格式化倒计时
  const formatCountdown = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}时${m}分${s}秒`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">加载订单信息...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-red-200">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">加载失败</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button
              onClick={() => router.push('/pricing')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回定价页面
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* 顶部导航 */}
        <div className="mb-8">
          <Link
            href="/pricing"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回定价页面
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 左侧：订单信息 */}
          <div className="space-y-6">
            {/* 订单详情 */}
            <Card className="border-2 border-blue-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">订单详情</CardTitle>
                <CardDescription>请确认订单信息并完成支付</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 订单号 */}
                <div>
                  <div className="text-sm text-gray-600 mb-1">订单号</div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 px-3 py-2 rounded-lg text-sm font-mono">
                      {order.orderNo}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyOrderNo}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  {copied && (
                    <div className="text-xs text-green-600 mt-1 flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      已复制
                    </div>
                  )}
                </div>

                {/* 套餐 */}
                <div>
                  <div className="text-sm text-gray-600 mb-1">套餐类型</div>
                  <Badge className="text-base bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1">
                    {tierNames[order.tier]} - {order.period === 'yearly' ? '年付' : '月付'}
                  </Badge>
                </div>

                {/* 金额 */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-gray-600">支付金额</span>
                    <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ¥{(order.amount / 100).toLocaleString()}
                    </span>
                  </div>
                  {order.period === 'yearly' && (
                    <div className="text-xs text-blue-600 mt-2">
                      折合 ¥{(order.amount / 100 / 12).toFixed(2)}/月
                    </div>
                  )}
                </div>

                {/* 倒计时 */}
                {countdown > 0 && (
                  <Alert className="bg-amber-50 border-amber-200">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <AlertDescription className="text-amber-700">
                      请在 <span className="font-bold">{formatCountdown(countdown)}</span> 内完成支付，超时订单将自动取消
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* 温馨提示 */}
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">温馨提示</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>支付成功后，会员将自动激活</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>如有疑问，请联系客服：PulseOptiHR@163.com</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>支付完成后，请点击"确认支付"按钮</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：支付方式 */}
          <div>
            <Card className="border-2 border-green-200 shadow-lg sticky top-8">
              <CardHeader>
                <CardTitle className="text-2xl">选择支付方式</CardTitle>
                <CardDescription>请选择您的支付方式并扫码支付</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="wechat" value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'wechat' | 'alipay')}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="wechat" className="text-base">
                      微信支付
                    </TabsTrigger>
                    <TabsTrigger value="alipay" className="text-base">
                      支付宝
                    </TabsTrigger>
                  </TabsList>

                  {/* 微信支付 */}
                  <TabsContent value="wechat" className="space-y-4">
                    <div className="bg-white border-2 border-green-200 rounded-2xl p-6">
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white mr-3">
                          <QrCode className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">微信扫码支付</h3>
                      </div>
                      <div className="bg-gray-100 rounded-xl p-4 mb-4">
                        <Image
                          src="/assets/wechat-payment.png"
                          alt="微信支付二维码"
                          width={300}
                          height={300}
                          className="w-full h-auto rounded-lg"
                        />
                      </div>
                      <div className="text-center text-sm text-gray-600">
                        请使用微信扫一扫
                      </div>
                    </div>
                  </TabsContent>

                  {/* 支付宝 */}
                  <TabsContent value="alipay" className="space-y-4">
                    <div className="bg-white border-2 border-blue-200 rounded-2xl p-6">
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white mr-3">
                          <QrCode className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">支付宝扫码支付</h3>
                      </div>
                      <div className="bg-gray-100 rounded-xl p-4 mb-4">
                        <Image
                          src="/assets/alipay-payment.jpg"
                          alt="支付宝支付二维码"
                          width={300}
                          height={300}
                          className="w-full h-auto rounded-lg"
                        />
                      </div>
                      <div className="text-center text-sm text-gray-600">
                        请使用支付宝扫一扫
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* 上传支付凭证区域 */}
                <div className="mt-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Upload className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">上传支付凭证</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        请上传您的支付截图，支持 JPG、PNG、GIF、WebP 格式，文件大小不超过 5MB
                      </p>

                      {/* 已上传凭证展示 */}
                      {uploadedProof ? (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FileImage className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-900">已上传凭证</span>
                            {uploadedProof.status === 'pending' && (
                              <Badge className="bg-amber-100 text-amber-700 text-xs">审核中</Badge>
                            )}
                            {uploadedProof.status === 'approved' && (
                              <Badge className="bg-green-100 text-green-700 text-xs">已通过</Badge>
                            )}
                            {uploadedProof.status === 'rejected' && (
                              <Badge className="bg-red-100 text-red-700 text-xs">已拒绝</Badge>
                            )}
                          </div>
                          <div className="inline-block">
                            <img
                              src={uploadedProof.fileUrl}
                              alt="支付凭证"
                              className="max-w-[200px] max-h-[200px] rounded-lg border"
                            />
                          </div>
                          {uploadedProof.status === 'pending' && (
                            <p className="text-xs text-gray-600 mt-2">
                              审核时间：通常 24 小时内完成
                            </p>
                          )}
                        </div>
                      ) : (
                        <Label htmlFor="proof-upload">
                          <div className="inline-flex items-center justify-center px-6 py-3 border-2 border-blue-600 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer">
                            <Upload className="w-4 h-4 mr-2" />
                            {uploading ? '上传中...' : '选择文件'}
                          </div>
                          <Input
                            id="proof-upload"
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                            className="hidden"
                            onChange={handleUploadProof}
                            disabled={uploading}
                          />
                        </Label>
                      )}
                    </div>
                  </div>
                </div>

                {/* 确认支付按钮 */}
                <div className="mt-6 space-y-3">
                  <Button
                    size="lg"
                    onClick={handleVerifyPayment}
                    disabled={verifying || !uploadedProof}
                    className="w-full h-14 text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        验证中...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        我已完成支付并上传凭证
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-center text-gray-500">
                    支付成功后，会员将自动激活
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
