import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/branding/Logo';
import {
  ArrowLeft,
  Users,
  FileText,
} from 'lucide-react';

export default function TermsPage() {
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
          <FileText className="mr-2 h-3.5 w-3.5" />
          服务条款
        </Badge>
        <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
          服务条款
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          使用 PulseOpti HR 脉策聚效服务时，请仔细阅读以下条款
        </p>
      </section>

      {/* 内容 */}
      <section className="container mx-auto px-6 pb-24">
        <Card className="border-2">
          <CardContent className="p-8">
            <div className="prose prose-blue max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. 服务说明</h2>
              <p className="text-gray-700 mb-6">
                PulseOpti HR 脉策聚效是一款人力资源管理SaaS平台，为中小企业提供招聘、绩效、薪酬、考勤、培训等全方位的人力资源管理服务。
                用户在使用本服务时，必须遵守本条款的所有规定。
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. 用户注册</h2>
              <p className="text-gray-700 mb-6">
                用户注册时，必须提供真实、准确、完整的个人信息。如果用户提供的信息有任何变化，用户应及时更新。
                用户注册成功后，将获得一个账号和密码。用户应妥善保管账号和密码，并对使用该账号和密码进行的所有活动承担责任。
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. 服务使用</h2>
              <p className="text-gray-700 mb-6">
                用户承诺遵守国家法律法规，不得利用本服务从事任何违法活动。
                用户不得利用本服务发布、传播以下信息：
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>反对宪法所确定的基本原则的</li>
                <li>危害国家安全，泄露国家秘密，颠覆国家政权，破坏国家统一的</li>
                <li>损害国家荣誉和利益的</li>
                <li>煽动民族仇恨、民族歧视，破坏民族团结的</li>
                <li>破坏国家宗教政策，宣扬邪教和封建迷信的</li>
                <li>散布谣言，扰乱社会秩序，破坏社会稳定的</li>
                <li>散布淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪的</li>
                <li>侮辱或者诽谤他人，侵害他人合法权益的</li>
                <li>含有法律、行政法规禁止的其他内容的</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. 知识产权</h2>
              <p className="text-gray-700 mb-6">
                PulseOpti HR 脉策聚效平台上的所有内容，包括但不限于文字、图片、音频、视频、软件、程序、版面设计等，
                均受知识产权法保护。未经许可，用户不得复制、传播、修改、展示、制造衍生作品或以其他方式使用这些内容。
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. 隐私保护</h2>
              <p className="text-gray-700 mb-6">
                PulseOpti HR 脉策聚效非常重视用户的隐私保护。我们将按照《隐私政策》的规定收集、使用、存储和披露用户的信息。
                用户在使用本服务时，即表示同意我们按照《隐私政策》的规定处理您的信息。
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. 服务费用</h2>
              <p className="text-gray-700 mb-6">
                PulseOpti HR 脉策聚效提供免费试用和付费服务。免费试用的功能和使用范围以平台公布为准。
                付费服务的费用标准和支付方式以平台公布为准。用户应按时足额支付服务费用。
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. 服务变更、中断或终止</h2>
              <p className="text-gray-700 mb-6">
                PulseOpti HR 脉策聚效保留随时修改、中断或终止部分或全部服务的权利，无需对用户或第三方承担责任。
                如果用户违反本条款，PulseOpti HR 脉策聚效有权立即终止为该用户提供服务，并删除其账号中的所有信息。
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. 免责声明</h2>
              <p className="text-gray-700 mb-6">
                HR Navigator 不对以下情况承担责任：
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>因用户使用或无法使用本服务而造成的任何损失</li>
                <li>因第三方服务或软件故障而造成的服务中断或延迟</li>
                <li>因不可抗力而造成的服务中断或延迟</li>
                <li>用户因使用本服务而遭受的任何间接、偶然、特殊或后果性的损害</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. 争议解决</h2>
              <p className="text-gray-700 mb-6">
                因本条款或使用本服务而产生的任何争议，双方应友好协商解决。
                协商不成的，任何一方均有权向 HR Navigator 所在地人民法院提起诉讼。
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. 条款修改</h2>
              <p className="text-gray-700 mb-6">
                PulseOpti HR 脉策聚效有权随时修改本条款。修改后的条款将在平台上公布，并自公布之日起生效。
                用户继续使用本服务，即表示同意接受修改后的条款。
              </p>

              <p className="text-sm text-gray-500 mt-8">
                本条款最后更新日期：2025年
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
