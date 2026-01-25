'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import EmployeesPageContent from './employees-content';

export default function EmployeesPage() {
  return (
    <DashboardLayout>
      <EmployeesPageContent />
    </DashboardLayout>
  );
}
