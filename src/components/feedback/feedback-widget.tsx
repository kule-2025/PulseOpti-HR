'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Loader2 } from 'lucide-react';

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({
    type: 'suggestion',
    category: 'general',
    content: '',
    rating: null as number | null,
  });

  // 获取当前用户信息
  const getCurrentUser = () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedback.content.trim()) {
      alert('请输入反馈内容');
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      alert('请先登录');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...feedback,
          userId: user.id,
          companyId: user.companyId,
          contactEmail: user.email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('感谢您的反馈！我们会认真处理您的建议。');
        setOpen(false);
        setFeedback({
          type: 'suggestion',
          category: 'general',
          content: '',
          rating: null,
        });
      } else {
        alert(data.error || '提交失败');
      }
    } catch (error) {
      console.error('提交反馈失败:', error);
      alert('提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              意见反馈
            </DialogTitle>
            <DialogDescription>
              您的建议对我们非常重要，请告诉我们您的想法
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">反馈类型</Label>
                <Select
                  value={feedback.type}
                  onValueChange={(value) => setFeedback({ ...feedback, type: value })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suggestion">功能建议</SelectItem>
                    <SelectItem value="bug">问题反馈</SelectItem>
                    <SelectItem value="complaint">投诉</SelectItem>
                    <SelectItem value="praise">好评</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">反馈分类</Label>
                <Select
                  value={feedback.category}
                  onValueChange={(value) => setFeedback({ ...feedback, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">通用</SelectItem>
                    <SelectItem value="ui">界面设计</SelectItem>
                    <SelectItem value="function">功能体验</SelectItem>
                    <SelectItem value="performance">性能问题</SelectItem>
                    <SelectItem value="data">数据问题</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">反馈内容 *</Label>
              <Textarea
                id="content"
                placeholder="请详细描述您的建议或遇到的问题..."
                rows={4}
                value={feedback.content}
                onChange={(e) => setFeedback({ ...feedback, content: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>总体评价</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedback({ ...feedback, rating: star })}
                    className={`text-2xl transition-colors ${
                      feedback.rating && feedback.rating >= star
                        ? 'text-amber-400'
                        : 'text-gray-300 hover:text-amber-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
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
                    <Send className="mr-2 h-4 w-4" />
                    提交反馈
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
