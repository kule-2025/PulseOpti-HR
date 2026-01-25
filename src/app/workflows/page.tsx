'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import WorkflowsContent from './workflows-content';

export default function WorkflowsPage() {
  return (
    <DashboardLayout>
      <WorkflowsContent />
    </DashboardLayout>
  );
}
