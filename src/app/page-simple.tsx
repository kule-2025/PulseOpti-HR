// 简化版首页 - 用于性能测试
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/branding/Logo';

export const dynamic = 'force-static';

export default function HomeSimple() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <Logo variant="full" size="md" href="/" />
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost">登录</Button>
              </Link>
              <Link href="/register">
                <Button>免费试用</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            PulseOpti HR 脉策聚效
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            从人事事务自动化到人才战略数据化，让每一家企业都拥有专业、可用的HRBP能力。
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg">立即开始</Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline">了解价格</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            核心功能
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">招聘管理</h3>
              <p className="text-gray-600">智能简历筛选、面试协作</p>
            </div>
            <div className="border p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">绩效管理</h3>
              <p className="text-gray-600">OKR、KPI目标管理</p>
            </div>
            <div className="border p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">薪酬管理</h3>
              <p className="text-gray-600">薪资核算、智能分析</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
