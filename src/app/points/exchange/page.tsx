import { Metadata } from 'next';
import ExchangePageContent from './exchange-content';

export const metadata: Metadata = {
  title: '积分兑换商城 - PulseOpti HR 脉策聚效',
  description: '使用积分兑换丰富奖品',
};

export default function ExchangePage() {
  return <ExchangePageContent />;
}
