import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/branding/Logo';
import {
  ArrowLeft,
  Users,
  Shield,
} from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <Logo variant="full" size="md" href="/" />

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="h-10 text-sm font-medium text-gray-600 hover:text-gray-900">
                  登录
                </Button>
              </Link>
              <Link href="/register">
                <Button className="h-10 bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-semibold">
                  免费试用
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="container mx-auto px-6 py-24 text-center">
        <Badge className="mb-4 bg-blue-100 text-blue-700">
          <Shield className="mr-2 h-3.5 w-3.5" />
          隐私政策
        </Badge>
        <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
          隐私政策
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          我们非常重视您的隐私保护，请仔细阅读以下隐私政策
        </p>
      </section>

      {/* 内容 */}
      <section className="container mx-auto px-6 pb-24">
        <Card className="border-2">
          <CardContent className="p-8">
            <div className="prose prose-blue max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">引言</h2>
              <p className="text-gray-700 mb-6">
                PulseOpti HR 脉策聚效（"我们"）深知个人信息对您的重要性，并会尽全力保护您的个人信息安全可靠。
                我们致力于维持您对我们的信任，恪守以下原则，保护您的个人信息：权责一致原则、目的明确原则、
                选择同意原则、最少够用原则、确保安全原则、主体参与原则、公开透明原则等。
                本隐私政策将帮助您了解：
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>我们如何收集和使用您的个人信息</li>
                <li>我们如何使用Cookie和同类技术</li>
                <li>我们如何共享、转让、公开披露您的个人信息</li>
                <li>我们如何保护您的个人信息</li>
                <li>您如何行使您的个人信息权利</li>
                <li>我们如何处理未成年人的个人信息</li>
                <li>本隐私政策如何更新</li>
                <li>如何联系我们</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">一、我们如何收集和使用您的个人信息</h2>
              <p className="text-gray-700 mb-4 font-semibold">1.1 我们如何收集您的个人信息</p>
              <p className="text-gray-700 mb-6">
                我们会通过以下方式收集您的个人信息：
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>您主动提供的信息：当您注册账号、使用服务时，我们会收集您主动提供的信息</li>
                <li>我们自动收集的信息：当您使用服务时，我们会自动收集您的设备信息、日志信息</li>
                <li>我们通过合法途径从第三方获取的信息：经您授权，我们从第三方获取您的信息</li>
              </ul>

              <p className="text-gray-700 mb-4 font-semibold">1.2 我们如何使用您的个人信息</p>
              <p className="text-gray-700 mb-6">
                我们将您的个人信息用于以下目的：
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>提供、维护和改进我们的服务</li>
                <li>向您提供您请求的服务和信息</li>
                <li>与您进行沟通，包括向您发送重要通知、服务更新等</li>
                <li>进行身份验证、安全防范、欺诈检测，确保我们向您提供的产品和服务的安全性</li>
                <li>开展数据分析和研究，改进我们的产品和服务</li>
                <li>遵守法律法规要求</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">二、我们如何使用Cookie和同类技术</h2>
              <p className="text-gray-700 mb-6">
                我们使用Cookie和同类技术来改进用户体验、分析网站使用情况、提供个性化服务等。
                您可以通过浏览器设置管理Cookie。但请注意，如果您禁用Cookie，可能无法正常使用我们的某些服务。
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">三、我们如何共享、转让、公开披露您的个人信息</h2>
              <p className="text-gray-700 mb-4 font-semibold">3.1 共享</p>
              <p className="text-gray-700 mb-6">
                我们不会向其他任何公司、组织和个人分享您的个人信息，但以下情况除外：
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>在获取明确同意的情况下分享</li>
                <li>根据法律法规、法律程序、强制性的行政或司法要求所必须的情况下进行分享</li>
                <li>在涉及合并、收购或资产转让时，如涉及到个人信息转让，我们会要求新的持有您个人信息的公司继续受本隐私政策的约束</li>
              </ul>

              <p className="text-gray-700 mb-4 font-semibold">3.2 公开披露</p>
              <p className="text-gray-700 mb-6">
                我们仅会在以下情况下，公开披露您的个人信息：
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>获得您的明确同意</li>
                <li>基于法律法规或法律程序的要求</li>
                <li>在涉及合并、收购或资产转让时</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">四、我们如何保护您的个人信息</h2>
              <p className="text-gray-700 mb-6">
                我们已使用符合行业标准的安全技术和管理措施来保护您的个人信息，防止其未经授权的访问、
                公开披露、使用、修改、损坏或丢失。我们会采取一切合理可行的措施，保护您的个人信息。
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">五、您如何行使您的个人信息权利</h2>
              <p className="text-gray-700 mb-6">
                您拥有以下权利：
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>访问您的个人信息</li>
                <li>更新或更正您的个人信息</li>
                <li>删除您的个人信息</li>
                <li>改变您授权同意的范围</li>
                <li>注销您的账号</li>
                <li>获取您的个人信息副本</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">六、我们如何处理未成年人的个人信息</h2>
              <p className="text-gray-700 mb-6">
                我们非常重视对未成年人个人信息的保护。如果您是18周岁以下的未成年人，建议您请您的父母或监护人仔细阅读本隐私政策，
                并在征得您的父母或监护人同意的前提下使用我们的服务或向我们提供信息。
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">七、本隐私政策如何更新</h2>
              <p className="text-gray-700 mb-6">
                我们可能适时修订本隐私政策的条款，该等修订构成本隐私政策的一部分。
                如该等修订造成您在本隐私政策下权利的实质减少，我们将在修订生效前通过在主页上显著位置提示的方式向您公布。
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">八、如何联系我们</h2>
              <p className="text-gray-700 mb-6">
                如果您对本隐私政策有任何疑问、意见或建议，请通过以下方式与我们联系：
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>邮箱：privacy@hr-navigator.com</li>
                <li>电话：400-888-8888</li>
                <li>地址：北京市朝阳区</li>
              </ul>

              <p className="text-sm text-gray-500 mt-8">
                本隐私政策最后更新日期：2025年
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              © 2025 PulseOpti HR 脉策聚效. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
