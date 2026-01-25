'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, Bot, Ticket, Clock, CheckCircle2, Headphones, Plus, RefreshCw, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/theme';

export default function SupportPage() {
  const [messages, setMessages] = useState<any[]>([
    { role: 'bot', content: '您好！我是PulseOpti HR脉策聚效智能客服。请问有什么可以帮您？' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    description: '',
    type: 'bug',
    priority: 'medium',
  });

  // 获取当前用户信息
  const getCurrentUser = () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  };

  // 加载工单列表
  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const user = getCurrentUser();
      if (!user || !user.companyId) {
        return;
      }

      const response = await fetch(`/api/tickets?companyId=${user.companyId}&userId=${user.id}`);
      const data = await response.json();

      if (data.success) {
        setTickets(data.data || []);
      }
    } catch (error) {
      console.error('加载工单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 常见问题
  const faqs = [
    { q: '如何联系人工客服？', a: '您可以发送邮件至 PulseOptiHR@163.com，服务时间周一至周五 9:00-12:00, 14:00-18:00' },
    { q: '如何修改套餐？', a: '在订单管理页面选择升级或降级，或联系客服协助' },
    { q: '数据安全吗？', a: '我们采用企业级加密，符合ISO27001和等保三级标准' },
  ];

  const handleSend = () => {
    if (!inputValue.trim()) return;

    setMessages([...messages, { role: 'user', content: inputValue }]);

    // 模拟AI回复
    setTimeout(() => {
      let reply = '感谢您的提问！';
      if (inputValue.includes('价格') || inputValue.includes('套餐')) {
        reply += '我们的套餐价格：免费版永久免费，基础版599元/年，专业版1499元/年，企业版2999元/年。';
      } else if (inputValue.includes('功能')) {
        reply += '我们的核心功能包括组织人事、招聘管理、绩效管理、薪酬管理、考勤管理等。';
      } else {
        reply += '您的问题已收到，客服人员会在24小时内回复您。您也可以拨打400-xxx-xxxx咨询。';
      }
      setMessages((prev) => [...prev, { role: 'bot', content: reply }]);
    }, 1000);

    setInputValue('');
  };

  // 提交工单
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = getCurrentUser();
    if (!user || !user.companyId) {
      alert('请先登录');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...ticketForm,
          companyId: user.companyId,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('工单提交成功！');
        setTicketDialogOpen(false);
        setTicketForm({ subject: '', description: '', type: 'bug', priority: 'medium' });
        loadTickets();
      } else {
        alert(data.error || '提交失败');
      }
    } catch (error) {
      console.error('提交工单失败:', error);
      alert('提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const getTicketStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      open: { label: '待处理', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
      in_progress: { label: '处理中', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
      resolved: { label: '已解决', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
      closed: { label: '已关闭', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300' },
    };
    const config = statusMap[status] || statusMap.open;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回首页
            </Button>
          </Link>
        </div>
        <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">客服中心</h1>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* 智能问答 */}
          <div className="col-span-2 space-y-4">
            <Card className="border-2 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                <h2 className="font-semibold text-gray-900 dark:text-white">智能客服</h2>
              </div>

              {/* 聊天记录 */}
              <div className="mb-4 h-96 space-y-4 overflow-y-auto rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-900 dark:bg-gray-800 dark:text-white'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 输入框 */}
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="输入您的问题..."
                  className="flex-1"
                />
                <Button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            {/* 常见问题 */}
            <Card className="border-2 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">常见问题</h2>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div key={index} className="rounded-lg border bg-gray-50 p-3 dark:bg-gray-900 dark:border-gray-700">
                    <p className="mb-1 font-medium text-gray-900 dark:text-white">
                      {faq.q}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{faq.a}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-4">
            {/* 工单列表 */}
            <Card className="border-2 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 dark:text-white">我的工单</h2>
                <Button variant="ghost" size="sm" onClick={loadTickets} disabled={loading}>
                  <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                </Button>
              </div>
              <div className="space-y-2">
                {tickets.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    暂无工单
                  </p>
                ) : (
                  tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between rounded-lg border p-3 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => {
                        // TODO: 打开工单详情
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-gray-900 dark:text-white">
                          {ticket.subject}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(ticket.createdAt).toLocaleString('zh-CN')}
                        </p>
                      </div>
                      {getTicketStatusBadge(ticket.status)}
                    </div>
                  ))
                )}
                <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Plus className="mr-2 h-4 w-4" />
                      提交工单
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>提交新工单</DialogTitle>
                      <DialogDescription>
                        请详细描述您遇到的问题或需求，我们会尽快处理
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateTicket} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="subject">工单标题 *</Label>
                        <Input
                          id="subject"
                          placeholder="请输入工单标题"
                          value={ticketForm.subject}
                          onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="type">工单类型</Label>
                          <Select
                            value={ticketForm.type}
                            onValueChange={(value) => setTicketForm({ ...ticketForm, type: value })}
                          >
                            <SelectTrigger id="type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bug">问题反馈</SelectItem>
                              <SelectItem value="feature">功能建议</SelectItem>
                              <SelectItem value="consultation">咨询问题</SelectItem>
                              <SelectItem value="other">其他</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="priority">优先级</Label>
                          <Select
                            value={ticketForm.priority}
                            onValueChange={(value) => setTicketForm({ ...ticketForm, priority: value })}
                          >
                            <SelectTrigger id="priority">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">低</SelectItem>
                              <SelectItem value="medium">中</SelectItem>
                              <SelectItem value="high">高</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">详细描述 *</Label>
                        <Textarea
                          id="description"
                          placeholder="请详细描述您遇到的问题或需求..."
                          rows={5}
                          value={ticketForm.description}
                          onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                          required
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setTicketDialogOpen(false)}
                          disabled={loading}
                        >
                          取消
                        </Button>
                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              提交中...
                            </>
                          ) : (
                            <>
                              <Ticket className="mr-2 h-4 w-4" />
                              提交工单
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
