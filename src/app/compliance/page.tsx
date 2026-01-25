'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import CompliancePageContent from './compliance-content';

export default function CompliancePage() {
  return (
    <DashboardLayout>
      <CompliancePageContent />
    </DashboardLayout>
  );
}
