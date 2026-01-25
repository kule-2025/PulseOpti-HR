'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import OrganizationPageContent from './organization-content';

export default function OrganizationPage() {
  return (
    <DashboardLayout>
      <OrganizationPageContent />
    </DashboardLayout>
  );
}
