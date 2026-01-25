import { Metadata } from 'next';
import PointsPageContent from './points-content';

export const metadata: Metadata = {
  title: '积分管理 - PulseOpti HR 脉策聚效',
  description: '积分系统、规则配置、兑换商城',
};

export default function PointsPage() {
  return <PointsPageContent />;
}
