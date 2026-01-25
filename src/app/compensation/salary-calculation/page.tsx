'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import SalaryCalculationContent from './salary-calculation-content';

export default function SalaryCalculationPage() {
  return (
    <DashboardLayout>
      <SalaryCalculationContent />
    </DashboardLayout>
  );
}
