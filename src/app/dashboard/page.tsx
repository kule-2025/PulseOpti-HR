'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import DashboardOverviewPage from './overview/page';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardOverviewPage />
    </DashboardLayout>
  );
}
