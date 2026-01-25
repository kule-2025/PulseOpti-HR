'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import EmployeePortalContent from './employee-portal-content';

export default function EmployeePortalPage() {
  return (
    <DashboardLayout>
      <EmployeePortalContent />
    </DashboardLayout>
  );
}
