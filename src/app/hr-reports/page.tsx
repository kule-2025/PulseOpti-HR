'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import HRReportsPageContent from './hr-reports-content';

export default function HRReportsPage() {
  return (
    <DashboardLayout>
      <HRReportsPageContent />
    </DashboardLayout>
  );
}
