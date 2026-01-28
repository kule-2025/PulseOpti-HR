'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/layout/page-header';
import {
  UserPlus,
  UserMinus,
  FileText,
  Download,
  CheckCircle,
  Clock,
  Upload,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Building2,
  Briefcase,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SSCSelfServicePage() {
  const [activeTab, setActiveTab] = useState('onboarding');
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // 入职表单
  const [onboardingForm, setOnboardingForm] = useState({
    name: '',
    phone: '',
    email: '',
    department: '',
    position: '',
    startDate: '',
    idCard: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
  });

  // 离职表单
  const [offboardingForm, setOffboardingForm] = useState({
    reason: '',
    lastWorkDate: '',
    handoverPerson: '',
    remarks: '',
  });

  // 证明类型
  const [certificateType, setCertificateType] = useState('');

  const handleOnboardingNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // 提交入职申请
      setShowSuccessDialog(true);
      toast.success('入职申请提交成功');
    }
  };

  const handleOffboardingSubmit = () => {
    setShowSuccessDialog(true);
    toast.success('离职申请提交成功');
  };

  const handleCertificateGenerate = () => {
    toast.success('证明文件已生成，正在下载...');
    setShowSuccessDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <PageHeader
        icon={UserPlus}
        title="员工自助服务"
        description="3步完成入职/离职，一键生成证明文件"
        badge={{ text: 'NEW', color: 'from-blue-600 to-cyan-600' }}
      />

      {/* Tab导航 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="onboarding">在线入职</TabsTrigger>
          <TabsTrigger value="offboarding">在线离职</TabsTrigger>
          <TabsTrigger value="certificates">证明生成</TabsTrigger>
        </TabsList>

        {/* 在线入职 */}
        <TabsContent value="onboarding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>在线入职办理</CardTitle>
              <CardDescription>3步完成入职手续，无需到现场</CardDescription>
            </CardHeader>
            <CardContent>
              {/* 步骤指示器 */}
              <div className="flex items-center justify-center mb-8">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        currentStep >= step
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      {currentStep > step ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-medium">{step}</span>
                      )}
                    </div>
                    {step < 3 && (
                      <div
                        className={`w-24 h-1 mx-2 ${
                          currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* 步骤内容 */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <h3 className="font-medium mb-2">步骤 1/3：基本信息</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      请填写您的基本信息
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>姓名 *</Label>
                      <Input
                        value={onboardingForm.name}
                        onChange={(e) =>
                          setOnboardingForm({ ...onboardingForm, name: e.target.value })
                        }
                        placeholder="请输入姓名"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>手机号 *</Label>
                      <Input
                        value={onboardingForm.phone}
                        onChange={(e) =>
                          setOnboardingForm({ ...onboardingForm, phone: e.target.value })
                        }
                        placeholder="请输入手机号"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>邮箱 *</Label>
                      <Input
                        value={onboardingForm.email}
                        onChange={(e) =>
                          setOnboardingForm({ ...onboardingForm, email: e.target.value })
                        }
                        placeholder="请输入邮箱"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>身份证号 *</Label>
                      <Input
                        value={onboardingForm.idCard}
                        onChange={(e) =>
                          setOnboardingForm({ ...onboardingForm, idCard: e.target.value })
                        }
                        placeholder="请输入身份证号"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>通讯地址</Label>
                    <Input
                      value={onboardingForm.address}
                      onChange={(e) =>
                        setOnboardingForm({ ...onboardingForm, address: e.target.value })
                      }
                      placeholder="请输入通讯地址"
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <h3 className="font-medium mb-2">步骤 2/3：入职信息</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      请填写您的入职信息
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>入职部门 *</Label>
                      <Select
                        value={onboardingForm.department}
                        onValueChange={(value) =>
                          setOnboardingForm({ ...onboardingForm, department: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择部门" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="研发部">研发部</SelectItem>
                          <SelectItem value="销售部">销售部</SelectItem>
                          <SelectItem value="市场部">市场部</SelectItem>
                          <SelectItem value="运营部">运营部</SelectItem>
                          <SelectItem value="职能部">职能部</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>职位 *</Label>
                      <Select
                        value={onboardingForm.position}
                        onValueChange={(value) =>
                          setOnboardingForm({ ...onboardingForm, position: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择职位" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="工程师">工程师</SelectItem>
                          <SelectItem value="经理">经理</SelectItem>
                          <SelectItem value="主管">主管</SelectItem>
                          <SelectItem value="专员">专员</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>入职日期 *</Label>
                      <Input
                        type="date"
                        value={onboardingForm.startDate}
                        onChange={(e) =>
                          setOnboardingForm({ ...onboardingForm, startDate: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>紧急联系人</Label>
                      <Input
                        value={onboardingForm.emergencyContact}
                        onChange={(e) =>
                          setOnboardingForm({
                            ...onboardingForm,
                            emergencyContact: e.target.value,
                          })
                        }
                        placeholder="请输入紧急联系人姓名"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>紧急联系人电话</Label>
                      <Input
                        value={onboardingForm.emergencyPhone}
                        onChange={(e) =>
                          setOnboardingForm({ ...onboardingForm, emergencyPhone: e.target.value })
                        }
                        placeholder="请输入紧急联系人电话"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <h3 className="font-medium mb-2">步骤 3/3：资料上传</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      请上传您的证件照片
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>身份证正面照片</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          点击上传或拖拽文件到此处
                        </p>
                        <p className="text-xs text-gray-500">支持 JPG、PNG 格式，最大 5MB</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>身份证反面照片</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          点击上传或拖拽文件到此处
                        </p>
                        <p className="text-xs text-gray-500">支持 JPG、PNG 格式，最大 5MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium mb-1">提交须知</p>
                        <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                          <li>• 请确保上传的照片清晰可见</li>
                          <li>• 提交后HR将在1-2个工作日内审核</li>
                          <li>• 审核通过后系统将自动发送入职通知</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex justify-end gap-3 pt-4">
                {currentStep > 1 && (
                  <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                    上一步
                  </Button>
                )}
                <Button onClick={handleOnboardingNext}>
                  {currentStep < 3 ? '下一步' : '提交入职申请'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 在线离职 */}
        <TabsContent value="offboarding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>在线离职办理</CardTitle>
              <CardDescription>3步完成离职手续，快速便捷</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>离职原因 *</Label>
                  <Select
                    value={offboardingForm.reason}
                    onValueChange={(value) =>
                      setOffboardingForm({ ...offboardingForm, reason: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择离职原因" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">个人发展</SelectItem>
                      <SelectItem value="family">家庭原因</SelectItem>
                      <SelectItem value="salary">薪酬福利</SelectItem>
                      <SelectItem value="job">工作内容</SelectItem>
                      <SelectItem value="management">管理原因</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>最后工作日 *</Label>
                  <Input
                    type="date"
                    value={offboardingForm.lastWorkDate}
                    onChange={(e) =>
                      setOffboardingForm({ ...offboardingForm, lastWorkDate: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>工作交接人</Label>
                  <Input
                    value={offboardingForm.handoverPerson}
                    onChange={(e) =>
                      setOffboardingForm({ ...offboardingForm, handoverPerson: e.target.value })
                    }
                    placeholder="请输入工作交接人姓名"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>离职说明</Label>
                <Textarea
                  value={offboardingForm.remarks}
                  onChange={(e) =>
                    setOffboardingForm({ ...offboardingForm, remarks: e.target.value })
                  }
                  placeholder="请输入离职说明（选填）"
                  rows={4}
                />
              </div>

              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">离职办理流程</p>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      <li>1. 提交离职申请后，HR将在1个工作日内确认</li>
                      <li>2. 完成工作交接和资产归还</li>
                      <li>3. 签署离职手续</li>
                      <li>4. 系统自动处理社保公积金等后续事宜</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleOffboardingSubmit}>提交离职申请</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 证明生成 */}
        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>证明文件生成</CardTitle>
              <CardDescription>一键生成在职证明、收入证明等文件</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => setCertificateType('employment')}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <CardTitle className="text-lg">在职证明</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      用于办理签证、贷款等业务
                    </p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => setCertificateType('income')}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <CardTitle className="text-lg">收入证明</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      用于贷款、信用卡申请等
                    </p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => setCertificateType('work')}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <CardTitle className="text-lg">工作证明</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      用于新工作入职等
                    </p>
                  </CardContent>
                </Card>
              </div>

              {certificateType && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {certificateType === 'employment' && '在职证明'}
                      {certificateType === 'income' && '收入证明'}
                      {certificateType === 'work' && '工作证明'}
                    </CardTitle>
                    <CardDescription>确认证明信息后生成文件</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">姓名</div>
                        <div className="font-medium">张三</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">部门</div>
                        <div className="font-medium">研发部</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">职位</div>
                        <div className="font-medium">高级工程师</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">入职日期</div>
                        <div className="font-medium">2023-01-15</div>
                      </div>
                      {certificateType === 'income' && (
                        <>
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">月均收入</div>
                            <div className="font-medium">¥28,000</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">年收入</div>
                            <div className="font-medium">¥336,000</div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setCertificateType('')}>
                        取消
                      </Button>
                      <Button onClick={handleCertificateGenerate}>
                        <Zap className="h-4 w-4 mr-2" />
                        一键生成并下载
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 成功对话框 */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              提交成功
            </DialogTitle>
            <DialogDescription>
              您的申请已成功提交，我们将在1-2个工作日内完成审核。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                审核完成后，系统将通过短信和邮件通知您。
              </p>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setShowSuccessDialog(false)}>我知道了</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
