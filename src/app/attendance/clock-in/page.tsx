'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import ClockInPageContent from './clock-in-content';

export default function ClockInPage() {
  return (
    <DashboardLayout>
      <ClockInPageContent />
    </DashboardLayout>
  );
}
