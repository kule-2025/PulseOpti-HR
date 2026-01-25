'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import SalaryPageContent from './salary-content';

export default function SalaryPage() {
  return (
    <DashboardLayout>
      <SalaryPageContent />
    </DashboardLayout>
  );
}
