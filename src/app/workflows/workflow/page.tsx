'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import WorkflowPageContent from './workflow-content';

export default function WorkflowPage() {
  return (
    <DashboardLayout>
      <WorkflowPageContent />
    </DashboardLayout>
  );
}
